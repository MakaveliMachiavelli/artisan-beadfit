import crypto from 'crypto';

/**
 * PayMongo Checkout Sessions client.
 *
 * Uses `fetch` directly against PayMongo's REST API rather than an SDK
 * dependency: the API is small, stable, and this keeps the audit surface to
 * one file. Their entire API uses a JSON:API-style `{ data: { attributes } }`
 * envelope and HTTP Basic Auth with the secret key as username and a blank
 * password - both are long-standing, consistently documented conventions
 * across every PayMongo resource and code sample.
 *
 * What is NOT independently verified here (PayMongo's docs site returned 404
 * to automated fetching while this was written): the exact field names inside
 * `line_items`/`payment_method_types` for the checkout_sessions endpoint
 * specifically, and the exact webhook event `type` string + signature header
 * format. Confirm both against the PayMongo dashboard - which shows the live
 * webhook event list when you create a webhook - before taking real payments.
 */

const PAYMONGO_API = 'https://api.paymongo.com/v1';

function authHeader(secretKey: string): string {
  return 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
}

export interface CreateCheckoutSessionInput {
  /** Smallest currency unit - centavos for PHP, i.e. pesos * 100. */
  amountCentavos: number;
  description: string;
  /** Our own order id, so the webhook can be matched back without a lookup table. */
  referenceNumber: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
  status: string;
}

export async function createCheckoutSession(
  secretKey: string,
  input: CreateCheckoutSessionInput
): Promise<CheckoutSession> {
  const res = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [
            {
              currency: 'PHP',
              amount: input.amountCentavos,
              name: input.description,
              quantity: 1,
            },
          ],
          payment_method_types: ['gcash', 'paymaya', 'card'],
          description: input.description,
          reference_number: input.referenceNumber,
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          send_email_receipt: false,
          ...(input.customerEmail
            ? { billing: { email: input.customerEmail } }
            : {}),
        },
      },
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    const message =
      body?.errors?.[0]?.detail || `PayMongo checkout session creation failed (${res.status})`;
    throw new Error(message);
  }

  const attrs = body.data.attributes;
  return {
    id: body.data.id,
    checkoutUrl: attrs.checkout_url,
    status: attrs.status,
  };
}

export async function retrieveCheckoutSession(
  secretKey: string,
  sessionId: string
): Promise<{ id: string; status: string; paymentIntentStatus?: string; referenceNumber?: string }> {
  const res = await fetch(`${PAYMONGO_API}/checkout_sessions/${sessionId}`, {
    headers: { Authorization: authHeader(secretKey) },
  });
  const body = await res.json();
  if (!res.ok) {
    const message = body?.errors?.[0]?.detail || `PayMongo session lookup failed (${res.status})`;
    throw new Error(message);
  }
  const attrs = body.data.attributes;
  return {
    id: body.data.id,
    status: attrs.status,
    paymentIntentStatus: attrs.payment_intent?.attributes?.status,
    // This round-trips the order.id we sent as reference_number at session
    // creation, letting the webhook map back to our own order without a
    // separate "find payment by PayMongo session id" repository method.
    referenceNumber: attrs.reference_number,
  };
}

/**
 * Verifies a PayMongo webhook signature.
 *
 * Best-effort implementation of PayMongo's documented pattern: header
 * `Paymongo-Signature: t=<unix_ts>,te=<test_hmac>,li=<live_hmac>`, where each
 * hmac is HMAC-SHA256(webhook_secret, `${ts}.${rawBody}`) hex-encoded. Verify
 * this against the dashboard when the webhook secret is first generated -
 * flagged in the module doc comment as unconfirmed against live docs.
 *
 * Returns false (reject) on any malformed input. Callers decide what to do
 * when no secret is configured yet - see the route in commerce.ts.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  webhookSecret: string,
  mode: 'test' | 'live'
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k, v];
    })
  );

  const timestamp = parts['t'];
  const providedSig = mode === 'live' ? parts['li'] : parts['te'];
  if (!timestamp || !providedSig) return false;

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(providedSig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
