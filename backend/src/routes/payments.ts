import { Hono } from 'hono';
import { z } from 'zod';
import Stripe from 'stripe';
import { db } from '../db/index.js';
import { orders, products, carts, cartItems } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.js';

const paymentsRouter = new Hono();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});


// Validation schemas
const createPaymentIntentSchema = z.object({
    orderId: z.string().uuid(),
});

// Create payment intent for an order
paymentsRouter.post('/create-payment-intent', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        const validated = createPaymentIntentSchema.parse(body);

        // Get order
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, validated.orderId),
            with: {
                items: {
                    with: { product: true },
                },
            },
        });

        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        if (order.userId !== userId) {
            return c.json({ error: 'Access denied' }, 403);
        }

        if (order.stripePaymentIntentId) {
            // Return existing payment intent
            const existingIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
            return c.json({ clientSecret: existingIntent.client_secret });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(order.total) * 100), // Convert to cents
            currency: 'usd',
            description: `Export transaction for Order #${order.id}`,
            shipping: {
                name: 'Jenny Rosen',
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                },
            },
            metadata: {
                orderId: order.id,
                userId: userId,
            },
        });

        // Save payment intent ID to order
        await db.update(orders)
            .set({
                stripePaymentIntentId: paymentIntent.id,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));

        return c.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Create payment intent error:', error);
        return c.json({ error: 'Failed to create payment intent' }, 500);
    }
});

// Stripe webhook handler
paymentsRouter.post('/webhook', async (c) => {
    const sig = c.req.header('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return c.json({ error: 'Missing signature or webhook secret' }, 400);
    }

    try {
        const body = await c.req.text();
        const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;
                const userId = paymentIntent.metadata.userId;

                if (orderId) {
                    await db.update(orders)
                        .set({
                            status: 'PROCESSING',
                            updatedAt: new Date(),
                        })
                        .where(eq(orders.id, orderId));

                    console.log(`Order ${orderId} payment successful`);
                }

                if (userId) {
                    // Clear the user's cart in the database
                    const userCart = await db.query.carts.findFirst({
                        where: eq(carts.userId, userId)
                    });

                    if (userCart) {
                        await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
                        console.log(`Database cart cleared for user ${userId}`);
                    }
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;

                if (orderId) {
                    console.log(`Order ${orderId} payment failed`);
                    // Optionally update order status or notify user
                }
                break;
            }
        }

        return c.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return c.json({ error: 'Webhook processing failed' }, 400);
    }
});

// Get payment status
paymentsRouter.get('/status/:orderId', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');
        const orderId = c.req.param('orderId');

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        if (order.userId !== userId) {
            return c.json({ error: 'Access denied' }, 403);
        }

        if (!order.stripePaymentIntentId) {
            return c.json({ status: 'not_started' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

        return c.json({
            status: paymentIntent.status,
            orderId: order.id,
            orderStatus: order.status,
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        return c.json({ error: 'Failed to get payment status' }, 500);
    }
});

export default paymentsRouter;
