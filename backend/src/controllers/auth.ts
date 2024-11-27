import type { Handler } from 'hono';
import { AuthService } from '../services/auth.service.js';
import { insertUserSchema } from '../db/schema.js';

export class AuthController {
  static register: Handler = async (c) => {
    try {
      const body = await c.req.json();
      
      const result = insertUserSchema.safeParse(body);
      if (!result.success) {
        return c.json({ error: 'Invalid input', details: result.error.errors }, 400);
      }

      const data = await AuthService.registerUser(result.data);
      return c.json(data, 201);
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const status = message === 'Email already registered' ? 409 : 500;
      return c.json({ error: message }, status);
    }
  }

  static login: Handler = async (c) => {
    try {
      const { email, password } = await c.req.json();

      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const result = await AuthService.loginUser(email, password);
      return c.json(result);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const status = message === 'Invalid credentials' ? 401 : 500;
      return c.json({ error: message }, status);
    }
  }
}
