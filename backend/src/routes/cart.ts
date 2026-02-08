
import { Hono } from 'hono';
import { db } from '../db';
import { carts, cartItems, products } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const cart = new Hono();

// All cart routes require authentication
cart.use('*', authMiddleware);

// Get current user's cart
cart.get('/', async (c) => {
    const user = c.get('user');

    // Find or create cart for user
    let userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId),
        with: {
            items: {
                with: {
                    product: true
                }
            }
        }
    });

    if (!userCart) {
        const [newCart] = await db.insert(carts).values({
            userId: user.userId
        }).returning();

        userCart = { ...newCart, items: [] };
    }

    return c.json(userCart);
});

// Add item to cart
cart.post('/', async (c) => {
    const user = c.get('user');
    const { productId, quantity = 1 } = await c.req.json();

    let userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId)
    });

    if (!userCart) {
        const [newCart] = await db.insert(carts).values({
            userId: user.userId
        }).returning();
        userCart = newCart;
    }

    // Check if item already exists in cart
    const existingItem = await db.query.cartItems.findFirst({
        where: and(
            eq(cartItems.cartId, userCart.id),
            eq(cartItems.productId, productId)
        )
    });

    if (existingItem) {
        // Update quantity
        await db.update(cartItems)
            .set({ quantity: existingItem.quantity + quantity })
            .where(eq(cartItems.id, existingItem.id));
    } else {
        // Add new item
        await db.insert(cartItems).values({
            cartId: userCart.id,
            productId,
            quantity
        });
    }

    // Return updated cart
    const updatedCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId),
        with: {
            items: {
                with: {
                    product: true
                }
            }
        }
    });

    return c.json(updatedCart);
});

// Update item quantity
cart.put('/:itemId', async (c) => {
    const user = c.get('user');
    const itemId = c.req.param('itemId'); // Note: This should ideally be productId based on frontend logic, but simpler to use cartItemID or productId. Let's assume productId for consistency with 'removeFromCart' usually, but 'itemId' implies cartItem.id.
    // However, usually we want to update by productId in the cart context.
    // Let's stick to update by productId for easier frontend integration, OR update by cart item ID.
    // Actually, the path says :itemId. Let's see what the plan said. "PUT /:itemId: Update item quantity".
    // Let's assume the frontend passes the productId? No, usually generic REST uses ID of resource.
    // But for a cart, it's often convenient to use productId.
    // Let's look at the body. { quantity: number }.

    // To match common practices, let's assume :itemId is likely the productId for "update item in cart", OR we can be strict and say it's cartItems.id.
    // Given the frontend sends `updateQuantity(productId, quantity)`, passing productId is easier.
    // BUT RESTfully, `/cart/items/:id` would be specific item.
    // Let's implement `PUT /:productId` effectively for simplicity in this user-centric cart.

    const productId = itemId; // treating the param as productId for convenience
    const { quantity } = await c.req.json();

    const userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId)
    });

    if (!userCart) return c.json({ error: 'Cart not found' }, 404);

    if (quantity <= 0) {
        await db.delete(cartItems)
            .where(and(
                eq(cartItems.cartId, userCart.id),
                eq(cartItems.productId, productId)
            ));
    } else {
        await db.update(cartItems)
            .set({ quantity })
            .where(and(
                eq(cartItems.cartId, userCart.id),
                eq(cartItems.productId, productId)
            ));
    }

    return c.json({ success: true });
});

// Remove item from cart
cart.delete('/:itemId', async (c) => {
    const user = c.get('user');
    const productId = c.req.param('itemId'); // treating as productId

    const userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId)
    });

    if (!userCart) return c.json({ error: 'Cart not found' }, 404);

    await db.delete(cartItems)
        .where(and(
            eq(cartItems.cartId, userCart.id),
            eq(cartItems.productId, productId)
        ));

    return c.json({ success: true });
});

// Clear cart
cart.delete('/', async (c) => {
    const user = c.get('user');

    const userCart = await db.query.carts.findFirst({
        where: eq(carts.userId, user.userId)
    });

    if (userCart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    }

    return c.json({ success: true });
});

export default cart;
