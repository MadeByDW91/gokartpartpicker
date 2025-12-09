# GoKart Part Picker

A parts-compatibility and build-planning software for go-kart builders.

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind UI
- **Backend**: Node.js + Express, REST API, Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Shared Types**: Type-safe API contracts between frontend/backend

## Project Structure

```
├── backend/          # Express API server
├── frontend/         # Next.js application
├── shared/           # Shared TypeScript types
├── docs/             # Documentation
└── package.json      # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gokartpartpicker?schema=public"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ADMIN_TOKEN=your-secret-admin-token-here
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (required)
- `ADMIN_TOKEN`: Secret token for admin endpoints (required for POST /parts and future admin routes)
- `PORT`: Backend server port (default: 3001)
- `CORS_ORIGIN`: Allowed frontend origin (default: http://localhost:3000)
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend (default: http://localhost:3001)

3. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. Build shared types package:
```bash
cd shared
npm run build
```

5. Start development servers:

**Option 1: Run both together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## Running the Application

### Backend

The backend server runs on port 3001 by default. You can change this by setting the `PORT` environment variable.

```bash
cd backend
npm run dev
```

The backend provides:
- REST API endpoints (see `docs/api.md`)
- Admin-protected endpoints (require `x-admin-token` header)
- Database access via Prisma ORM

### Frontend

The frontend runs on port 3000 by default.

```bash
cd frontend
npm run dev
```

The frontend provides:
- User interface for browsing parts
- Build management interface
- Filtering and search capabilities

## Database Migrations

To create a new migration:
```bash
cd backend
npx prisma migrate dev --name migration-name
```

To apply migrations in production:
```bash
cd backend
npx prisma migrate deploy
```

To view database in Prisma Studio:
```bash
cd backend
npm run db:studio
```

## Import Scripts

The seed script creates sample data:
```bash
cd backend
npm run db:seed
```

**Note**: The seed script (`backend/src/scripts/seed.ts`) writes directly to the database using Prisma, bypassing the API. This is a local developer-only tool and should not be used in production.

For CSV import scripts that call the API (if created in the future), set the `ADMIN_TOKEN` environment variable:
```bash
ADMIN_TOKEN=your-token node import-script.js
```

The import script can then include the `x-admin-token` header when making requests to admin-protected endpoints like `POST /parts`.

## Development

- `npm run dev` - Start both frontend and backend
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build all packages

## Admin Authentication

Admin endpoints (e.g., `POST /parts`) require the `x-admin-token` header:

```bash
curl -X POST http://localhost:3001/parts \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token-here" \
  -d '{ ... }'
```

Set the `ADMIN_TOKEN` environment variable in `backend/.env` to enable admin endpoints.

## Documentation

- [Architecture Overview](docs/architecture.md) - System architecture and component descriptions
- [API Documentation](docs/api.md) - Complete API endpoint reference

## Database Schema

- **Part**: Represents a go-kart part
- **CompatibilityProfile**: Compatibility attributes for parts (many-to-many)
- **Build**: User's saved build plan
- **BuildItem**: Individual parts in a build with slot categories

