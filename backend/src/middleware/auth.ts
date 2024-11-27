import type { MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
