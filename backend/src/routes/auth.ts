import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateToken, authMiddleware, type JWTPayload } from '../middleware/auth.js';

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
});

// Register new user
auth.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const validated = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, validated.email),
        });

        if (existingUser) {
            return c.json({ error: 'Email already registered' }, 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validated.password, 12);

        // Create user
        const [newUser] = await db.insert(users).values({
            email: validated.email,
            passwordHash,
            firstName: validated.firstName,
            lastName: validated.lastName,
        }).returning();

        // Generate token
        const tokenPayload: JWTPayload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        };
        const token = generateToken(tokenPayload);

        return c.json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
            },
            token,
        }, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Registration error:', error);
        return c.json({ error: 'Registration failed' }, 500);
    }
});

// Login
auth.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const validated = loginSchema.parse(body);

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, validated.email),
        });

        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Verify password
        const validPassword = await bcrypt.compare(validated.password, user.passwordHash);

        if (!validPassword) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Generate token
        const tokenPayload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = generateToken(tokenPayload);

        return c.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
            token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

// Get current user
auth.get('/me', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        return c.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Get user error:', error);
        return c.json({ error: 'Failed to get user' }, 500);
    }
});

// Change password
auth.post('/change-password', authMiddleware, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        const validated = changePasswordSchema.parse(body);

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Verify current password
        const validPassword = await bcrypt.compare(validated.currentPassword, user.passwordHash);

        if (!validPassword) {
            return c.json({ error: 'Current password is incorrect' }, 400);
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(validated.newPassword, 12);

        // Update password
        await db.update(users)
            .set({
                passwordHash: newPasswordHash,
                mustChangePassword: false,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return c.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: 'Validation failed', details: error.errors }, 400);
        }
        console.error('Change password error:', error);
        return c.json({ error: 'Failed to change password' }, 500);
    }
});

export default auth;
