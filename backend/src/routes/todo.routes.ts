import type { Hono } from 'hono';
import { TodoController } from '../controllers/todo.js';
import { authMiddleware } from '../middleware/auth.js';

export function setupTodoRoutes(app: Hono) {
  
  app.use('/api/todos/*', authMiddleware);
  
  app.post('/api/todos', TodoController.create);
  app.get('/api/todos', TodoController.getAll);
  app.get('/api/todos/:id', TodoController.getOne);
  app.put('/api/todos/:id', TodoController.update);
  app.delete('/api/todos/:id', TodoController.delete);
  
  return app;
}
