import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { orders, orderItems, products } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const ordersRouter = new Hono();

// Validation schemas
const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
    })).min(1),
    shippingAddress: z.string(),
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// Tax rate (could be made configurable)
const TAX_RATE = 0.08; // 8%

// Get user orders
ordersRouter.get('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');

        const userOrders = await db.query.orders.findMany({
            where: eq(orders.userId, userId),
            with: {
                items: {
                    with: { product: true },
                },
            },
            orderBy: desc(orders.createdAt),
        });

        return c.json(userOrders);
    } catch (error) {
        console.error('Get orders error:', error);
        return c.json({ error: 'Failed to fetch orders' }, 500);
    }
});

// Get single order
ordersRouter.get('/:id', authMiddleware, async (c) => {
    try {
        const orderId = c.req.param('id');
        const userId = c.get('userId');
        const user = c.get('user');

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                items: {
                    with: { product: true },
                },
                user: true,
            },
        });

        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        // Only allow owner or admin to view
        if (order.userId !== userId && user.role !== 'ADMIN') {
            return c.json({ error: 'Access denied' }, 403);
        }

        return c.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        return c.json({ error: 'Failed to fetch order' }, 500);
    }
});

// Create order
ordersRouter.post('/', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        const validated = createOrderSchema.parse(body);

        // Get product details and calculate totals
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of validated.items) {
            const product = await db.query.products.findFirst({
                where: eq(products.id, item.productId),
            });

            if (!product) {
                return c.json({ error: `Product not found: ${item.productId}` }, 400);
            }

            if (product.stock < item.quantity) {
                return c.json({ error: `Insufficient stock for ${product.name}` }, 400);
            }

            // Calculate price with discount
            const basePrice = parseFloat(product.price);
            const discount = parseFloat(product.discountPercent || '0') / 100;
            const finalPrice = basePrice * (1 - discount);

            subtotal += finalPrice * item.quantity;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: finalPrice.toFixed(2),
            });
        }

        const taxAmount = subtotal * TAX_RATE;
        const total = subtotal + taxAmount;

        // Create order
        const [newOrder] = await db.insert(orders).values({
            userId,
            subtotal: subtotal.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            discountAmount: '0',
            total: total.toFixed(2),
            shippingAddress: validated.shippingAddress,
            status: 'PENDING',
        }).returning();

        // Create order items
        await db.insert(orderItems).values(
            orderItemsData.map(item => ({
                ...item,
                orderId: newOrder.id,
            }))
        );

        // Update stock
        for (const item of validated.items) {
            await db.update(products)
                .set({
                    stock: products.stock,
                })
                .where(eq(products.id, item.productId));

            // Decrement stock
            const product = await db.query.products.findFirst({
                where: eq(products.id, item.productId),
            });
            if (product) {
                await db.update(products)
                    .set({ stock: product.stock - item.quantity })
                    .where(eq(products.id, item.productId));
            }
        }

        // Fetch complete order with items
        const completeOrder = await db.query.orders.findFirst({
            where: eq(orders.id, newOrder.id),
            with: {
                items: {
                    with: { product: true },
                },
            },
        });

        return c.json(completeOrder, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Create order error:', error);
        return c.json({ error: 'Failed to create order' }, 500);
    }
});

// Admin: Get all orders
ordersRouter.get('/admin/all', authMiddleware, adminMiddleware, async (c) => {
    try {
        const { status, limit, offset } = c.req.query();

        const allOrders = await db.query.orders.findMany({
            where: status ? eq(orders.status, status as any) : undefined,
            with: {
                items: {
                    with: { product: true },
                },
                user: true,
            },
            orderBy: desc(orders.createdAt),
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });

        return c.json(allOrders);
    } catch (error) {
        console.error('Get all orders error:', error);
        return c.json({ error: 'Failed to fetch orders' }, 500);
    }
});

// Admin: Update order status
ordersRouter.patch('/:id/status', authMiddleware, adminMiddleware, async (c) => {
    try {
        const orderId = c.req.param('id');
        const body = await c.req.json();
        const validated = updateOrderStatusSchema.parse(body);

        const [updatedOrder] = await db.update(orders)
            .set({
                status: validated.status,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning();

        if (!updatedOrder) {
            return c.json({ error: 'Order not found' }, 404);
        }

        return c.json(updatedOrder);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Update order status error:', error);
        return c.json({ error: 'Failed to update order' }, 500);
    }
});

export default ordersRouter;
