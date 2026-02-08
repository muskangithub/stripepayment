import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import auth from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import cartRouter from './routes/cart.js';
import testimonialsRouter from './routes/testimonials.js';
import reviewsRouter from './routes/reviews.js';
import qaRouter from './routes/qa.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Health check
app.get('/', (c) => {
    return c.json({
        message: 'E-commerce API',
        version: '1.0.0',
        status: 'healthy',
    });
});

// Routes
app.route('/api/auth', auth);
app.route('/api/products', productsRouter);
app.route('/api/categories', categoriesRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/cart', cartRouter);
app.route('/api/testimonials', testimonialsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/qa', qaRouter);


// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error('Server error:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server starting on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

console.log(`✅ Server running at http://localhost:${port}`);
