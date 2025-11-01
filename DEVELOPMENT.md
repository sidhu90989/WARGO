# Development Guide

## Quick Start

1. **Clone and Install**
```bash
git clone https://github.com/sidhu90989/Echo-Ride.git
cd Echo-Ride/EcoRideConnect
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Start Development**

Server (API-only):
```bash
npm run dev
```

Frontend apps (run each independently in a separate terminal):
```bash
# Rider app
npm run rider:dev

# Driver app
npm run driver:dev

# Admin app
npm run admin:dev
```

## Available Scripts

- `npm run dev` - Start the API-only server (Express)
- `npm run start` - Start production API server (after build)
- `npm run build` - Bundle API server (esbuild)
- `npm run check` - Run TypeScript type checking across server, client shared, and apps
- `npm run db:push` - Push database schema changes (Drizzle)
- `npm run rider:dev` - Start Rider app (Vite)
- `npm run driver:dev` - Start Driver app (Vite)
- `npm run admin:dev` - Start Admin app (Vite)
- `npm run rider:build` - Build Rider app (Vite)
- `npm run driver:build` - Build Driver app (Vite)
- `npm run admin:build` - Build Admin app (Vite)

## Project Architecture

### Frontend (React + TypeScript)
- Three independent apps under `/EcoRideConnect/apps`:
	- `apps/rider` – Rider-facing app
	- `apps/driver` – Driver-facing app
	- `apps/admin` – Admin dashboard
- Shared UI/components live in `/EcoRideConnect/client/src/components`, contexts/hooks in `/EcoRideConnect/client/src/{contexts,hooks}`
- Shared pages still referenced by apps: `/client/src/pages/LoginPage.tsx`, `/client/src/pages/NotFoundPage.tsx`

### Backend (Express + TypeScript)
- API-only server in `/server` (does not serve static SPA assets)
- CORS configured for per-app origins via `FRONTEND_ORIGIN`
- Database: Drizzle ORM with PostgreSQL (Neon) when `SIMPLE_AUTH=false`
- Routes: `/server/routes.ts` (auth, rider/driver/admin, Stripe, WS)

### Shared
- **Schema**: Database schema in `/shared/schema.ts`
- **Types**: Shared TypeScript types

## Key Features to Understand

1. **Authentication**: Firebase Auth integration
2. **Real-time**: WebSocket for live updates
3. **Payments**: Stripe integration
4. **Maps**: Google Maps integration
5. **Database**: PostgreSQL with Drizzle ORM

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Deployment

The app automatically deploys to GitHub Pages when you push to main branch.

Note: The previous unified single-page app has been removed. Use the per-app scripts above for local development and deployment.

### PR Preview Databases (Neon)

Pull Requests automatically create a temporary Neon database branch and run Drizzle migrations via the `neon-preview` workflow.

Setup required (one-time in GitHub repo settings):
- Actions Secret: `NEON_API_KEY` (Neon Console → Settings → API Keys)
- Actions Variable: `NEON_PROJECT_ID` (Project settings → Project ID)

The workflow file is at `.github/workflows/neon-preview.yml` and runs on PR open/sync, then deletes the Neon branch when the PR is closed.