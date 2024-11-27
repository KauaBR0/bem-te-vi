# My-Test API

A Node.js backend API built with Hono.js, PostgreSQL, and Drizzle ORM, featuring authentication and todo management.

## 🚀 Technologies

- Node.js
- TypeScript
- Hono.js (Web Framework)
- PostgreSQL (Database)
- Drizzle ORM (Database ORM)
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Zod (Schema Validation)
- Swagger UI (API Documentation)

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/postgres
JWT_SECRET=your_jwt_secret
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=postgres
DB_SSL=false
```

4. Set up the database:
```bash
# Generate database migrations
npm run db:generate

# Push changes to database
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## 🛣️ API Routes

### Authentication Routes
- `POST api/auth/register` - Register a new user
  - Body: `{ email: string, username:string, password: string }`
- `POST api/auth/login` - Login user
  - Body: `{ email: string, username:string, password: string }`

### Todo Routes
- `GET api/todos` - Get all todos (requires authentication)
- `POST api/todos` - Create a new todo (requires authentication)
  - Body: `{ title: string, completed: boolean }`
- `PUT api/todos/:id` - Update a todo (requires authentication)
  - Body: `{ title?: string, completed?: boolean }`
- `DELETE api/todos/:id` - Delete a todo (requires authentication)

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📚 API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:3000/swagger
```

## 🛠️ Development

- `npm run dev` - Start development server with hot reload
