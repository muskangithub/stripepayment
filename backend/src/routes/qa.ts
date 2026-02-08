import { Hono } from 'hono';
import { db } from '../db/index.js';
import { productQAs } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Get Q&A by product
app.get('/product/:productId', async (c) => {
    const productId = c.req.param('productId');
    const qas = await db.query.productQAs.findMany({
        where: eq(productQAs.productId, productId),
        orderBy: (q, { desc }) => [desc(q.createdAt)],
    });
    return c.json(qas);
});

export default app;
