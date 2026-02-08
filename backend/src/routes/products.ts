import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { products, categories } from '../db/schema.js';
import { eq, like, desc, asc, and, sql } from 'drizzle-orm';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const productsRouter = new Hono();

// Validation schemas
const createProductSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    discountPercent: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    stock: z.number().int().min(0),
    categoryId: z.string().uuid().optional(),
    imageUrl: z.string().url().optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

// Get all products (public)
productsRouter.get('/', async (c) => {
    try {
        const { category, search, featured, sort, limit, offset } = c.req.query();

        const conditions = [eq(products.active, true)];

        if (category) {
            const cat = await db.query.categories.findFirst({
                where: eq(categories.slug, category),
            });
            if (cat) {
                conditions.push(eq(products.categoryId, cat.id));
            }
        }

        if (search) {
            conditions.push(like(products.name, `%${search}%`));
        }

        if (featured === 'true') {
            conditions.push(eq(products.featured, true));
        }

        const orderBy = sort === 'price_asc'
            ? asc(products.price)
            : sort === 'price_desc'
                ? desc(products.price)
                : desc(products.createdAt);

        const productList = await db.query.products.findMany({
            where: and(...conditions),
            with: { category: true },
            orderBy,
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0,
        });

        // Get total count
        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(products)
            .where(and(...conditions));

        return c.json({
            products: productList,
            total: Number(countResult[0].count),
        });
    } catch (error) {
        console.error('Get products error:', error);
        return c.json({ error: 'Failed to fetch products' }, 500);
    }
});

// Get single product by slug (public)
productsRouter.get('/:slug', async (c) => {
    try {
        const slug = c.req.param('slug');

        const product = await db.query.products.findFirst({
            where: eq(products.slug, slug),
            with: { category: true },
        });

        if (!product) {
            return c.json({ error: 'Product not found' }, 404);
        }

        return c.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        return c.json({ error: 'Failed to fetch product' }, 500);
    }
});

// Admin routes
// Create product
productsRouter.post('/', authMiddleware, adminMiddleware, async (c) => {
    try {
        const body = await c.req.json();
        const validated = createProductSchema.parse(body);

        // Check if slug exists
        const existingProduct = await db.query.products.findFirst({
            where: eq(products.slug, validated.slug),
        });

        if (existingProduct) {
            return c.json({ error: 'Product with this slug already exists' }, 400);
        }

        const [newProduct] = await db.insert(products).values(validated).returning();

        return c.json(newProduct, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Create product error:', error);
        return c.json({ error: 'Failed to create product' }, 500);
    }
});

// Update product
productsRouter.patch('/:id', authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const validated = updateProductSchema.parse(body);

        const [updatedProduct] = await db.update(products)
            .set({ ...validated, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();

        if (!updatedProduct) {
            return c.json({ error: 'Product not found' }, 404);
        }

        return c.json(updatedProduct);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Update product error:', error);
        return c.json({ error: 'Failed to update product' }, 500);
    }
});

// Delete product
productsRouter.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = c.req.param('id');

        const [deletedProduct] = await db.delete(products)
            .where(eq(products.id, id))
            .returning();

        if (!deletedProduct) {
            return c.json({ error: 'Product not found' }, 404);
        }

        return c.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        return c.json({ error: 'Failed to delete product' }, 500);
    }
});

export default productsRouter;
