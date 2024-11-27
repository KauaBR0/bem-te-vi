import { db } from "../db/index.js";
import { todos } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { InsertTodoSchema, SelectTodoSchema } from "../db/schema.js";

export class TodoService {
  static async createTodo(
    userId: number,
    data: InsertTodoSchema
  ): Promise<SelectTodoSchema> {
    if (!data.title?.trim()) {
      throw new Error("Title is required");
    }

    const [todo] = await db
      .insert(todos)
      .values({
        ...data,
        title: data.title.trim(),
        description: data.description?.trim(),
        userId,
      })
      .returning();

    return todo;
  }

  static async getTodosByUserId(userId: number): Promise<SelectTodoSchema[]> {
    return await db.query.todos.findMany({
      where: eq(todos.userId, userId),
      orderBy: (todos, { desc }) => [desc(todos.createdAt)],
    });
  }

  static async getTodoById(
    todoId: number,
    userId: number
  ): Promise<SelectTodoSchema> {
    const todo = await db.query.todos.findFirst({
      where: and(eq(todos.id, todoId), eq(todos.userId, userId)),
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }

  static async updateTodo(
    todoId: number,
    userId: number,
    data: Partial<InsertTodoSchema>
  ): Promise<SelectTodoSchema> {
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error("Title cannot be empty");
    }

    const existingTodo = await this.getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    const [updatedTodo] = await db
      .update(todos)
      .set({
        ...data,
        title: data.title?.trim(),
        description: data.description?.trim(),
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
      .returning();

    return updatedTodo;
  }

  static async deleteTodo(todoId: number, userId: number): Promise<void> {
    const existingTodo = await this.getTodoById(todoId, userId);
    if (!existingTodo) {
      throw new Error("Todo not found");
    }

    await db
      .delete(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
  }
}
