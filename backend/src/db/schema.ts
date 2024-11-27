import { pgTable, serial, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (users) => ({
  emailIndex: index('idx_users_email').on(users.email)
}));

// Todos table
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (todos) => ({
  userIdIndex: index('idx_todos_user_id').on(todos.userId),
  statusIndex: index('idx_todos_status').on(todos.status)
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos)
}));

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id]
  })
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(255),
  email: z.string().email().max(255),
  password: z.string().min(6).max(255)
});

export const selectUserSchema = createSelectSchema(users).omit({
  password: true
});

export const insertTodoSchema = createInsertSchema(todos, {
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'completed']).default('pending')
});

export const selectTodoSchema = createSelectSchema(todos);

// Export types
export type InsertUserSchema = z.infer<typeof insertUserSchema>;
export type SelectUserSchema = z.infer<typeof selectUserSchema>;
export type InsertTodoSchema = z.infer<typeof insertTodoSchema>;
export type SelectTodoSchema = z.infer<typeof selectTodoSchema>;
export type UpdateTodoSchema = Partial<InsertTodoSchema>;
