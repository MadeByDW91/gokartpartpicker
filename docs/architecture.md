# Architecture Overview

## System Components

### Frontend (Next.js)
- **Location**: `frontend/`
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Purpose**: User-facing web application for browsing parts and managing builds
- **Key Features**:
  - Server-side rendering with React
  - Client-side routing
  - API integration via fetch calls to backend

### Backend (Express)
- **Location**: `backend/`
- **Framework**: Node.js + Express with TypeScript
- **Purpose**: RESTful API server providing data access and business logic
- **Key Features**:
  - REST API endpoints
  - Input validation with Zod
  - Admin authentication middleware
  - Error handling and logging

### Database (PostgreSQL)
- **ORM**: Prisma
- **Location**: `backend/prisma/`
- **Purpose**: Persistent data storage
- **Schema**: Defined in `schema.prisma`
- **Migrations**: Managed via Prisma Migrate

### Shared Types
- **Location**: `shared/`
- **Purpose**: TypeScript types shared between frontend and backend
- **Usage**: Ensures type safety across the API boundary

## Communication Flow

```
User Browser
    ↓
Next.js Frontend (React)
    ↓ (HTTP/REST API)
Express Backend
    ↓ (Prisma ORM)
PostgreSQL Database
```

### API Communication
- Frontend makes HTTP requests to backend API
- Backend validates requests using Zod schemas
- Backend queries database via Prisma
- Responses are JSON with shared TypeScript types
- CORS enabled for frontend-backend communication

## Data Flow Example

1. **User browses parts**:
   - Frontend: User navigates to `/parts`
   - Frontend: Calls `GET /parts?category=engine`
   - Backend: Validates query params, queries database
   - Database: Returns matching parts
   - Backend: Formats response with pagination
   - Frontend: Renders parts list

2. **User creates build**:
   - Frontend: User clicks "Start New Build"
   - Frontend: Calls `POST /builds` with `{ userName }`
   - Backend: Creates build record in database
   - Backend: Returns build ID
   - Frontend: Redirects to `/build/:id`

3. **Admin adds part**:
   - Admin: Sends `POST /parts` with `x-admin-token` header
   - Backend: Validates admin token
   - Backend: Creates part and compatibility profiles
   - Backend: Returns created part

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Allowed frontend origin
- `ADMIN_TOKEN`: Token for admin endpoints
- `NODE_ENV`: Environment (development/production)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Project Structure

```
gokartpartpicker/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/  # API route handlers
│   │   ├── lib/     # Utilities (Prisma client)
│   │   ├── middleware/  # Auth middleware
│   │   └── scripts/ # Seed/import scripts
│   └── prisma/      # Database schema
├── frontend/        # Next.js application
│   └── src/
│       ├── app/     # Next.js pages
│       └── lib/     # API client
├── shared/          # Shared TypeScript types
└── docs/            # Documentation

