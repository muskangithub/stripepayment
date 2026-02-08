import { Hono } from 'hono';
import { db } from '../db/index.js';
import { testimonials } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Get all testimonials
app.get('/', async (c) => {
    const allTestimonials = await db.query.testimonials.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return c.json(allTestimonials);
});

// Get featured testimonials
app.get('/featured', async (c) => {
    const featuredTestimonials = await db.query.testimonials.findMany({
        where: eq(testimonials.featured, true),
        limit: 5,
    });
    return c.json(featuredTestimonials);
});

export default app;
