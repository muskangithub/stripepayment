import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

declare module 'hono' {
    interface ContextVariableMap {
        user: JWTPayload;
        userId: string;
    }
}

/**
 * Middleware to verify JWT token and attach user to context
 */
export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

        // Verify user still exists
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId),
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 401);
        }

        c.set('user', decoded);
        c.set('userId', decoded.userId);

        await next();
    } catch (error) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
}

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
export async function adminMiddleware(c: Context, next: Next) {
    const user = c.get('user');

    if (!user) {
        return c.json({ error: 'Authentication required' }, 401);
    }

    if (user.role !== 'ADMIN') {
        return c.json({ error: 'Admin access required' }, 403);
    }

    await next();
}

/**
 * Generate JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
    });
}

