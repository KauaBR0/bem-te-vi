import type { Hono } from 'hono';
import { AuthController } from '../controllers/auth.js';

export function setupAuthRoutes(app: Hono) {
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);
  
  return app;
}
