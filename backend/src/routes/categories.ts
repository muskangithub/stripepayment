import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const categoriesRouter = new Hono();

// Validation schemas
const categorySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
});

// Get all categories (public)
categoriesRouter.get('/', async (c) => {
    try {
        const categoryList = await db.query.categories.findMany({
            with: { products: true },
        });

        // Add product count
        const withCounts = categoryList.map(cat => ({
            ...cat,
            productCount: cat.products.length,
            products: undefined, // Remove products from response
        }));

        return c.json(withCounts);
    } catch (error) {
        console.error('Get categories error:', error);
        return c.json({ error: 'Failed to fetch categories' }, 500);
    }
});

// Get single category with products (public)
categoriesRouter.get('/:slug', async (c) => {
    try {
        const slug = c.req.param('slug');

        const category = await db.query.categories.findFirst({
            where: eq(categories.slug, slug),
            with: { products: true },
        });

        if (!category) {
            return c.json({ error: 'Category not found' }, 404);
        }

        return c.json(category);
    } catch (error) {
        console.error('Get category error:', error);
        return c.json({ error: 'Failed to fetch category' }, 500);
    }
});

// Admin routes
// Create category
categoriesRouter.post('/', authMiddleware, adminMiddleware, async (c) => {
    try {
        const body = await c.req.json();
        const validated = categorySchema.parse(body);

        // Check if slug exists
        const existingCategory = await db.query.categories.findFirst({
            where: eq(categories.slug, validated.slug),
        });

        if (existingCategory) {
            return c.json({ error: 'Category with this slug already exists' }, 400);
        }

        const [newCategory] = await db.insert(categories).values(validated).returning();

        return c.json(newCategory, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Create category error:', error);
        return c.json({ error: 'Failed to create category' }, 500);
    }
});

// Update category
categoriesRouter.patch('/:id', authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const validated = categorySchema.partial().parse(body);

        const [updatedCategory] = await db.update(categories)
            .set(validated)
            .where(eq(categories.id, id))
            .returning();

        if (!updatedCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }

        return c.json(updatedCategory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Update category error:', error);
        return c.json({ error: 'Failed to update category' }, 500);
    }
});

// Delete category
categoriesRouter.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = c.req.param('id');

        const [deletedCategory] = await db.delete(categories)
            .where(eq(categories.id, id))
            .returning();

        if (!deletedCategory) {
            return c.json({ error: 'Category not found' }, 404);
        }

        return c.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        return c.json({ error: 'Failed to delete category' }, 500);
    }
});

export default categoriesRouter;
