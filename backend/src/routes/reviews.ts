import { Hono } from 'hono';
import { db } from '../db/index.js';
import { reviews } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

// Get reviews by product
app.get('/product/:productId', async (c) => {
    const productId = c.req.param('productId');
    const productReviews = await db.query.reviews.findMany({
        where: eq(reviews.productId, productId),
        orderBy: [desc(reviews.createdAt)],
    });
    return c.json(productReviews);
});

export default app;
