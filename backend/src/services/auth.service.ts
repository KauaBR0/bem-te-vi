import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { InsertUserSchema, SelectUserSchema } from '../db/schema.js';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
  private static readonly JWT_EXPIRES_IN = '24h';

  static async registerUser(data: InsertUserSchema): Promise<{ user: SelectUserSchema; token: string }> {
    if (!data.username?.trim() || !data.email?.trim() || !data.password) {
      throw new Error('All fields are required');
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email.trim())
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const [newUser] = await db.insert(users)
      .values({
        username: data.username.trim(),
        email: data.email.trim(),
        password: hashedPassword
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt
      });

    const token = this.generateToken(newUser.id);

    return { user: newUser, token };
  }

  static async loginUser(email: string, password: string): Promise<{ user: SelectUserSchema; token: string }> {
    if (!email?.trim() || !password) {
      throw new Error('All fields are required');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.trim())
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  private static generateToken(userId: number): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: number };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
