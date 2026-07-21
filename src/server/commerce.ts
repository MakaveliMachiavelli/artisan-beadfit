import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  PrismaCatalogRepository, 
  PrismaCartRepository,
  PrismaOrderRepository,
  PrismaInventoryRepository,
  PrismaPaymentRepository,
  PrismaDesignRepository
} from '../db/repositories/prisma';
import { requireAuth, optionalAuth } from './auth';
import { v4 as uuidv4 } from 'uuid';

const commerceRouter = Router();

const catalogRepo = new PrismaCatalogRepository();
const cartRepo = new PrismaCartRepository();
const orderRepo = new PrismaOrderRepository();
const inventoryRepo = new PrismaInventoryRepository();
const paymentRepo = new PrismaPaymentRepository();
const designRepo = new PrismaDesignRepository();

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
  try {
    const userId = (req as any).user.id;
    const sessionId = getSessionId(req, res);
    const cart = await cartRepo.getCart(userId, sessionId);
    
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // In a real app, calculate total securely by mapping items to real prices
    // For this prototype, we'll assign a flat rate or decode the configuration
    let totalAmount = 0;
    const orderItems = cart.items.map(ci => {
      // Very naive pricing: $45 for custom bracelet, $5 for items
      const price = ci.type === 'CUSTOM_BRACELET' ? 45.0 : 5.0;
      totalAmount += price * ci.quantity;
      return {
        type: ci.type,
        quantity: ci.quantity,
        price,
        configuration: ci.configuration
      };
    });

    // 1. Create Order
    const order = await orderRepo.create({
      userId,
      status: 'PENDING',
      totalAmount,
      items: orderItems,
    });

    // 2. Pre-flight inventory check & Reserve inventory (mock logic parsing configuration for variants)
    // For every custom bracelet, parse configuration and reserve items
    // This requires that configuration is a valid JSON array of variant items
    
    // First, verify all stock
    for (const oi of orderItems) {
      if (oi.configuration) {
        try {
          const config = JSON.parse(oi.configuration);
          for (const bead of config) {
            if (bead.variantId) {
               const stock = await inventoryRepo.getStockLevel(bead.variantId);
               if (stock < oi.quantity) {
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

    // 3. Mock Payment Processing
    const payment = await paymentRepo.create({
      orderId: order.id,
      provider: 'MOCK_PAYMENT',
      status: 'CAPTURED',
      amount: totalAmount,
      referenceId: `mock_tx_${Date.now()}`
    });

    // 4. Update order to paid
    await orderRepo.updateStatus(order.id, 'PAID');

    // 5. Commit inventory
    for (const oi of orderItems) {
      if (oi.configuration) {
        try {
          const config = JSON.parse(oi.configuration);
          for (const bead of config) {
            if (bead.variantId) {
               await inventoryRepo.releaseStock(bead.variantId, oi.quantity, `Releasing reservation for order ${order.id}`);
               await inventoryRepo.commitStock(bead.variantId, oi.quantity, `Committed for paid order ${order.id}`);
            }
          }
        } catch (e) {}
      }
    }

    // 6. Clear cart
    await cartRepo.clearCart(cart.id);

    // Return final receipt
    const receipt = await orderRepo.getHistoricalReceipt(order.id);
    res.status(201).json({ order: receipt });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

export { commerceRouter };
