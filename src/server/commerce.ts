import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  PrismaCatalogRepository,
  PrismaCartRepository,
  PrismaOrderRepository,
  PrismaInventoryRepository,
  PrismaPaymentRepository,
  PrismaDesignRepository,
  PrismaShopItemRepository
} from '../db/repositories/prisma';
import { requireAuth, optionalAuth } from './auth';
import { v4 as uuidv4 } from 'uuid';
import { createCheckoutSession, retrieveCheckoutSession, verifyWebhookSignature } from './paymongo';

const commerceRouter = Router();

const catalogRepo = new PrismaCatalogRepository();
const cartRepo = new PrismaCartRepository();
const orderRepo = new PrismaOrderRepository();
const inventoryRepo = new PrismaInventoryRepository();
const paymentRepo = new PrismaPaymentRepository();
const designRepo = new PrismaDesignRepository();

const checkoutBodySchema = z.object({
  // The price the customer was shown, computed client-side by
  // calculateOrderTotal (src/pricing.ts) from the actual design. This
  // replaces a hardcoded flat rate that ignored the design entirely.
  //
  // This is a validated number, not a server-recomputed one: markup, labor
  // cost and packing cost live only in client-side Zustand state
  // (useCatalogStore), never persisted server-side, so there is nothing
  // authoritative to check this against yet. A customer could in principle
  // tamper with this value in the request. Closing that gap requires
  // persisting the admin pricing settings server-side - a separate,
  // materially larger piece of work, tracked but not done here.
  totalAmount: z.number().finite().positive(),
});

function resolveBaseUrl(req: Request): string {
  // Prefer APP_URL in environments where it's meaningfully set (e.g. a
  // deployed Cloud Run URL); fall back to the request's own host so local
  // dev (localhost:3000) gets redirect URLs that are actually reachable,
  // rather than whatever placeholder APP_URL might hold locally.
  const envUrl = process.env.APP_URL;
  if (envUrl && !envUrl.includes('MY_APP_URL')) return envUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

/** Releases any reserved stock for an order's items. Used both by the normal
 *  payment-success commit path and by checkout-time failure cleanup. */
async function releaseOrderInventory(items: { configuration?: string | null; quantity: number }[], orderId: string) {
  for (const oi of items) {
    if (!oi.configuration) continue;
    try {
      const config = JSON.parse(oi.configuration);
      for (const bead of config) {
        if (bead.variantId) {
          await inventoryRepo.releaseStock(bead.variantId, oi.quantity, `Releasing reservation for order ${orderId}`);
        }
      }
    } catch (e) {}
  }
}

// Extract or generate session ID
const getSessionId = (req: Request, res: Response): string => {
  let sessionId = req.cookies['guest_session_id'];
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('guest_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  }
  return sessionId;
};

// ==========================================
// Catalog API
// ==========================================
commerceRouter.get('/catalog', async (req, res) => {
  try {
    const variants = await catalogRepo.getActiveVariants();
    res.json({ variants });
  } catch (error) {
    console.error('Catalog get error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// ==========================================
// Cart API
// ==========================================
commerceRouter.get('/cart', optionalAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || null;
    const sessionId = getSessionId(req, res);
    const cart = await cartRepo.getCart(userId, sessionId);
    res.json({ cart });
  } catch (error) {
    console.error('Cart get error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

const addItemSchema = z.object({
  type: z.string(),
  quantity: z.number().int().positive(),
  configuration: z.string().optional(),
});

commerceRouter.post('/cart/items', optionalAuth, async (req, res) => {
  try {
    const validated = addItemSchema.parse(req.body);
    const userId = (req as any).user?.id || null;
    const sessionId = getSessionId(req, res);
    
    let cart = await cartRepo.getCart(userId, sessionId);
    cart = await cartRepo.addItem(cart.id, validated);
    res.json({ cart });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
    console.error('Cart add error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

const updateItemSchema = z.object({
  quantity: z.number().int().nonnegative(),
});

commerceRouter.patch('/cart/items/:id', optionalAuth, async (req, res) => {
  try {
    const validated = updateItemSchema.parse(req.body);
    const itemId = req.params.id;
    
    if (validated.quantity === 0) {
      const cart = await cartRepo.removeItem(itemId);
      return res.json({ cart });
    } else {
      const cart = await cartRepo.updateItemQuantity(itemId, validated.quantity);
      return res.json({ cart });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
    console.error('Cart update error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

commerceRouter.delete('/cart/items/:id', optionalAuth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const cart = await cartRepo.removeItem(itemId);
    res.json({ cart });
  } catch (error) {
    console.error('Cart remove error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

commerceRouter.get('/designs', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const designs = await designRepo.findRecentByUser(userId);
    res.json({ designs });
  } catch (error) {
    console.error('Designs get error:', error);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

const saveDesignSchema = z.object({
  name: z.string(),
  items: z.string(),
  materialIds: z.string(),
});

commerceRouter.post('/designs', requireAuth, async (req, res) => {
  try {
    const validated = saveDesignSchema.parse(req.body);
    const userId = (req as any).user.id;
    
    const design = await designRepo.save({
      userId,
      ...validated,
    });
    
    res.status(201).json({ design });
  } catch (error) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: (error as any).errors || (error as any).issues });
    }
    console.error('Designs save error:', error);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// ==========================================
// Checkout API
// ==========================================
commerceRouter.post('/checkout', requireAuth, async (req, res) => {
  const parsed = checkoutBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid checkout request', details: parsed.error.issues });
  }
  const { totalAmount } = parsed.data;

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    // Deliberately hard-fails rather than falling back to a mock capture -
    // that fallback is exactly the bug this replaces. An operator missing
    // this env var should see a loud 500, not a silently-fake successful order.
    console.error('PAYMONGO_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Payments are not configured on this server yet' });
  }

  let order: Awaited<ReturnType<typeof orderRepo.create>> | undefined;
  let orderItems: { type: string; quantity: number; price: number; configuration: string | null }[] = [];

  try {
    const userId = (req as any).user.id;
    const sessionId = getSessionId(req, res);
    const cart = await cartRepo.getCart(userId, sessionId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    orderItems = cart.items.map(ci => ({
      type: ci.type,
      quantity: ci.quantity,
      // Per-line price isn't independently known server-side (see
      // checkoutBodySchema comment) - the order total is what's trusted;
      // this stores an even split for record-keeping only.
      price: totalAmount / cart.items.length,
      configuration: ci.configuration
    }));

    // 1. Create Order (stays PENDING until the webhook confirms payment)
    order = await orderRepo.create({
      userId,
      status: 'PENDING',
      totalAmount,
      items: orderItems,
    });

    // 2. Pre-flight inventory check & reserve inventory, parsing configuration
    // for variant ids. Unchanged from the previous implementation.
    for (const oi of orderItems) {
      if (oi.configuration) {
        try {
          const config = JSON.parse(oi.configuration);
          for (const bead of config) {
            if (bead.variantId) {
              const stock = await inventoryRepo.getStockLevel(bead.variantId);
              if (stock < oi.quantity) {
                await orderRepo.updateStatus(order.id, 'CANCELLED');
                return res.status(400).json({ error: `Insufficient stock for item` });
              }
            }
          }
        } catch (e) {
          console.warn('Failed to parse configuration for inventory reservation', e);
        }
      }
    }

    for (const oi of orderItems) {
      if (oi.configuration) {
        try {
          const config = JSON.parse(oi.configuration);
          for (const bead of config) {
            if (bead.variantId) {
              await inventoryRepo.reserveStock(bead.variantId, oi.quantity, `Reserved for order ${order.id}`);
            }
          }
        } catch (e) {}
      }
    }

    // 3. Create a real PayMongo Checkout Session. PayMongo hosts the actual
    // GCash/Maya/card payment UI; we only get a URL to send the browser to.
    const baseUrl = resolveBaseUrl(req);
    const session = await createCheckoutSession(secretKey, {
      amountCentavos: Math.round(totalAmount * 100),
      description: `Artisan Beadfit order ${order.id}`,
      referenceNumber: order.id,
      successUrl: `${baseUrl}/studio?checkout=success&order=${order.id}`,
      cancelUrl: `${baseUrl}/studio?checkout=cancelled&order=${order.id}`,
      customerEmail: (req as any).user.email,
    });

    // Payment starts AUTHORIZED (session created, not yet paid). Only the
    // webhook below is trusted to move this to CAPTURED - the browser
    // redirect back to success_url is not proof of payment, it can be
    // closed, spoofed, or interrupted before completion.
    await paymentRepo.create({
      orderId: order.id,
      provider: 'PAYMONGO',
      status: 'AUTHORIZED',
      amount: totalAmount,
      referenceId: session.id,
    });

    res.status(201).json({ checkoutUrl: session.checkoutUrl, orderId: order.id });
  } catch (error) {
    console.error('Checkout error:', error);
    // Best-effort cleanup so a failed PayMongo call doesn't leave inventory
    // reserved against an order that will never be paid.
    if (order) {
      await releaseOrderInventory(orderItems, order.id);
      await orderRepo.updateStatus(order.id, 'CANCELLED').catch(() => {});
    }
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// ==========================================
// PayMongo webhook
// ==========================================
//
// The only place an order is allowed to become PAID. Signature format and
// the exact event payload shape are PayMongo's documented convention but
// were not independently re-verified here (see src/server/paymongo.ts
// module comment) - confirm against the dashboard when the webhook secret
// is first generated, before relying on this for real payments.
//
// Defensive by design: rather than trusting the webhook body's nested event
// resource deeply, it's used only to learn which checkout session to look
// at, then that session is re-fetched from PayMongo directly and *that*
// response is what drives the state change.
commerceRouter.post('/webhooks/paymongo', async (req: Request, res: Response) => {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (webhookSecret) {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    const signatureHeader = req.header('Paymongo-Signature');
    const mode = secretKey?.startsWith('sk_live_') ? 'live' : 'test';
    if (!rawBody || !verifyWebhookSignature(rawBody, signatureHeader, webhookSecret, mode)) {
      console.warn('PayMongo webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    console.warn(
      'PAYMONGO_WEBHOOK_SECRET is not set - accepting this webhook unverified. ' +
      'Fine for early local testing, not safe once this handles real payments.'
    );
  }

  if (!secretKey) {
    console.error('PAYMONGO_SECRET_KEY is not configured; cannot verify webhook payment status');
    return res.status(200).json({ received: true }); // ack so PayMongo doesn't retry forever
  }

  // Try the shapes PayMongo's event payloads commonly use for a resource
  // event: the affected resource nested under data.attributes.data, or the
  // event resource being the checkout session itself.
  const body = req.body as any;
  const checkoutSessionId: string | undefined =
    body?.data?.attributes?.data?.id ?? body?.data?.id;

  if (!checkoutSessionId) {
    console.warn('PayMongo webhook: could not find a checkout session id in payload', JSON.stringify(body).slice(0, 500));
    return res.status(200).json({ received: true });
  }

  try {
    const session = await retrieveCheckoutSession(secretKey, checkoutSessionId);
    if (session.paymentIntentStatus !== 'succeeded') {
      // Not a paid state yet (still active, or failed/expired) - nothing to do.
      return res.status(200).json({ received: true });
    }

    const orderId = session.referenceNumber;
    if (!orderId) {
      console.warn('PayMongo webhook: session has no reference_number, cannot map to an order', checkoutSessionId);
      return res.status(200).json({ received: true });
    }

    const order = await orderRepo.findById(orderId);
    const payment = await paymentRepo.findByOrderId(orderId);
    if (!order || !payment) {
      console.warn('PayMongo webhook: no matching order/payment for', orderId);
      return res.status(200).json({ received: true });
    }

    // Idempotency: PayMongo may deliver the same event more than once, and
    // the return-trip page may also poll GET /orders/:id, which could race
    // this handler. Only act the first time.
    if (payment.status === 'CAPTURED' || order.status === 'PAID') {
      return res.status(200).json({ received: true });
    }

    await paymentRepo.updateStatus(payment.id, 'CAPTURED', checkoutSessionId);
    await orderRepo.updateStatus(orderId, 'PAID');

    const receipt = await orderRepo.getHistoricalReceipt(orderId);
    if (receipt) {
      for (const oi of receipt.items) {
        if (!oi.configuration) continue;
        try {
          const config = JSON.parse(oi.configuration);
          for (const bead of config) {
            if (bead.variantId) {
              await inventoryRepo.releaseStock(bead.variantId, oi.quantity, `Releasing reservation for order ${orderId}`);
              await inventoryRepo.commitStock(bead.variantId, oi.quantity, `Committed for paid order ${orderId}`);
            }
          }
        } catch (e) {}
      }
    }

    if (order.userId) {
      const cart = await cartRepo.getCart(order.userId, null);
      await cartRepo.clearCart(cart.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayMongo webhook processing error:', error);
    // Still 200: PayMongo will retry a 4xx/5xx, which would just repeat a
    // permanent failure. Logging is the operator's signal here.
    res.status(200).json({ received: true });
  }
});

commerceRouter.get('/orders/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const receipt = await orderRepo.getHistoricalReceipt(req.params.id);
    if (!receipt || receipt.userId !== (req as any).user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: receipt });
  } catch (error) {
    console.error('Order lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export { commerceRouter };
