import type { Hono } from 'hono';
import { setupAuthRoutes } from './auth.routes.js';
import { setupTodoRoutes } from './todo.routes.js';

export function setupRoutes(app: Hono) {
  setupAuthRoutes(app);
  setupTodoRoutes(app);
  
  return app;
}
