import type { Handler } from 'hono';
import { TodoService } from '../services/todo.service.js';
import { insertTodoSchema } from '../db/schema.js';
import { z } from 'zod';

// Schema para atualização parcial de todo
const updateTodoSchema = insertTodoSchema.partial();

export class TodoController {
  static create: Handler = async (c) => {
    try {
      const userId = (c.get('user') as any).userId;
      const body = await c.req.json();

      const result = insertTodoSchema.safeParse({ ...body, userId });
      if (!result.success) {
        return c.json({ error: 'Invalid input', details: result.error.errors }, 400);
      }

      const todo = await TodoService.createTodo(userId, result.data);
      return c.json(todo, 201);
    } catch (error) {
      console.error('Create todo error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return c.json({ error: message }, 500);
    }
  }

  static getAll: Handler = async (c) => {
    try {
      const userId = (c.get('user') as any).userId;
      const todos = await TodoService.getTodosByUserId(userId);
      return c.json(todos);
    } catch (error) {
      console.error('Get todos error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static getOne: Handler = async (c) => {
    try {
      const userId = (c.get('user') as any).userId;
      const todoId = parseInt(c.req.param('id'));

      if (isNaN(todoId)) {
        return c.json({ error: 'Invalid todo ID' }, 400);
      }

      const todo = await TodoService.getTodoById(todoId, userId);
      return c.json(todo);
    } catch (error) {
      console.error('Get todo error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const status = message === 'Todo not found' ? 404 : 500;
      return c.json({ error: message }, status);
    }
  }

  static update: Handler = async (c) => {
    try {
      const userId = (c.get('user') as any).userId;
      const todoId = parseInt(c.req.param('id'));
      const body = await c.req.json();

      if (isNaN(todoId)) {
        return c.json({ error: 'Invalid todo ID' }, 400);
      }

      const result = updateTodoSchema.safeParse(body);
      if (!result.success) {
        return c.json({ error: 'Invalid input', details: result.error.errors }, 400);
      }

      const todo = await TodoService.updateTodo(todoId, userId, result.data);
      return c.json(todo);
    } catch (error) {
      console.error('Update todo error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const status = message === 'Todo not found' ? 404 : 500;
      return c.json({ error: message }, status);
    }
  }

  static delete: Handler = async (c) => {
    try {
      const userId = (c.get('user') as any).userId;
      const todoId = parseInt(c.req.param('id'));

      if (isNaN(todoId)) {
        return c.json({ error: 'Invalid todo ID' }, 400);
      }

      await TodoService.deleteTodo(todoId, userId);
      return c.json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Delete todo error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      const status = message === 'Todo not found' ? 404 : 500;
      return c.json({ error: message }, status);
    }
  }
}
