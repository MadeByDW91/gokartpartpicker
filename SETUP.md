# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (backend, frontend, shared).

### 2. Database Setup

1. Create a PostgreSQL database:

```bash
createdb gokartpartpicker
```

Or using psql:

```sql
CREATE DATABASE gokartpartpicker;
```

2. Configure the database connection in `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set your environment variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/gokartpartpicker?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ADMIN_TOKEN=your-secret-admin-token-here
```

**Important**: Set a strong, random value for `ADMIN_TOKEN`. This token is required for admin endpoints like `POST /parts`.

3. Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

4. Seed the database (optional):

```bash
npm run db:seed
```

### 3. Frontend Setup

1. Configure the API URL in `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Build Shared Package

The shared types package needs to be built before the backend/frontend can use it:

```bash
cd shared
npm run build
```

### 5. Start Development Servers

From the root directory, start both servers:

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Troubleshooting

### Shared Package Not Found

If you get errors about `@gokartpartpicker/shared` not being found:

1. Make sure you've built the shared package:
   ```bash
   cd shared && npm run build
   ```

2. Reinstall dependencies from root:
   ```bash
   npm install
   ```

### Database Connection Issues

- Verify PostgreSQL is running
- Check your `DATABASE_URL` in `backend/.env`
- Ensure the database exists
- Try running `npx prisma db push` to sync the schema

### Port Already in Use

If port 3000 or 3001 is already in use:

- Backend: Change `PORT` in `backend/.env`
- Frontend: Change the port in `frontend/package.json` scripts or use `PORT=3002 npm run dev`

## Next Steps

- Visit http://localhost:3000 to see the application
- Check the API at http://localhost:3001/health
- Use Prisma Studio to view the database: `cd backend && npm run db:studio`

