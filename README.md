# WARGO 🌱🚗

An eco‑focused, multi‑tenant ride sharing platform connecting Riders, Drivers, and Admins with real‑time location, dynamic pricing, gamified eco impact, and modular deployment (Firebase Hosting + Cloud Run / any Node host).

---
## Table of Contents
1. Vision & Core Value
2. Feature Matrix
3. Architecture Overview
4. Monorepo Structure
5. Runtime Modes (SIMPLE_AUTH vs DB Mode)
6. Backend Details (Auth, Sessions, Rides, Pricing, Badges)
7. Pricing & Eco Impact Algorithm
8. Badges & Gamification
9. Environment Variable Validation
10. Realtime (Socket.IO)
11. Frontend Apps & UI Stack
12. Development Workflow
13. Scripts Cheat Sheet
14. Testing (Vitest)
15. Deployment (Firebase Hosting + Cloud Run)
16. Configuration / Environment Variables
17. Security & Hardening Notes
18. Roadmap / Planned Improvements
19. Contributing
20. License & Support

---
## 1. Vision & Core Value
Promote sustainable urban mobility by prioritizing electric & low‑emission vehicles, incentivizing eco behaviors via points & badges, and surfacing carbon savings transparently.

---
## 2. Feature Matrix
| Domain  | Key Features |
|---------|--------------|
| Rider   | Request rides, real‑time tracking, eco points, wallet (planned), CO₂ savings, rewards & badges |
| Driver  | Ride queue & acceptance, availability toggle, earnings & stats, KYC profile |
| Admin   | Platform metrics, active rides view, analytics (expanding), user/driver oversight |
| Shared  | Dynamic pricing, Socket.IO realtime, Firebase/Session auth hybrid, Stripe payments (intent mock in SIMPLE_AUTH) |
| Eco     | CO₂ saved calculation, points accumulation, automatic badge awarding on ride completion |

---
## 3. Architecture Overview
```
React (Rider)   ┐              ┌──── Drizzle ORM + Postgres (DB Mode)
React (Driver)  ├─ HTTP/REST ──┤
React (Admin)   ┘              │
				│ Socket.IO (events)   │
				▼                      │
		Express API + Session/Firebase + Stripe + Env Validation
```
Core pieces:
- Single Node/Express API (`server/`) exposes REST + Socket.IO.
- Three separate Vite React apps (`apps/rider`, `apps/driver`, `apps/admin`) share UI, contexts, and services from `client/src` + `shared/`.
- Storage layer is pluggable: in‑memory (SIMPLE_AUTH) or Postgres (DB Mode) via Drizzle.
- Pricing & eco impact computed centrally (`shared/services/ridePricingService.ts`).
- Badge awarding triggered after ride completion.
- Environment validation runs at startup (`server/env.ts`).

---
## 4. Monorepo Structure
```
EcoRideConnect/
	server/              # Express API, routes, db, storage, env validation
	apps/                # Per-role Vite apps (rider/driver/admin)
	client/              # Shared UI components, contexts, hooks
	shared/              # Cross-cutting libs (schema, services, realtime, firebase)
	migrations/          # Drizzle migrations + meta journal
	scripts/             # Smoke & utility scripts
	dist/                # Build output (apps + optionally bundled API)
```
Key Files:
- `shared/schema.ts` – Drizzle schema & TypeScript types.
- `server/routes.ts` – All REST endpoints & Socket.IO wiring.
- `server/storage.ts` – Memory vs Database storage selector.
- `shared/services/ridePricingService.ts` – Distance, fare, CO₂, eco points estimation.
- `server/env.ts` – Environment variable validation & startup summary.
- `server/seed.ts` – Initial badge & demo users seeding (DB mode).
- `shared/realtime/socketIoClient.ts` – Socket.IO client for all apps.

---
## 5. Runtime Modes
| Concern              | SIMPLE_AUTH=true (Dev/Demo)                | SIMPLE_AUTH=false (DB Mode)                  |
|----------------------|--------------------------------------------|----------------------------------------------|
| Storage              | In-memory `MemoryStorage`                  | Postgres via Drizzle ORM                     |
| Auth (client)        | Session endpoints + optional headers       | Firebase ID Token + session fallback         |
| Stripe               | Mock clientSecret                          | Real Stripe Payment Intent                   |
| Persistence          | Lost on restart                            | Durable in database                          |
| Badges               | In-memory seeded list                      | Seed via `server/seed.ts`                    |
| Setup Speed          | Immediate                                  | Requires DATABASE_URL + migrations           |
| Use Case             | Local prototyping, quick demos             | Staging / Production                         |

---
## 6. Backend Details
### Auth Flow
1. Client login (Firebase or simple session) → session stored via `express-session` (memorystore).
2. Protected endpoints use `verifyFirebaseToken` which accepts:
	 - Session user (simple or hybrid).
	 - Firebase Bearer token.
	 - Dev override headers (`x-simple-email`, `x-simple-role`) if `ALLOW_SIMPLE_AUTH_ROUTES=true`.

### Session Configuration
Secure cookies auto‑enabled on proxies (`trust proxy=1`); `secure + sameSite=none` when HTTPS/forced.

### Ride Lifecycle
Pending → Accepted → In Progress → Completed / Cancelled; endpoints:
- POST `/api/rides` (rider)
- POST `/api/rides/:id/accept` (driver)
- POST `/api/rides/:id/start` (driver)
- POST `/api/rides/:id/complete` (driver) → updates eco points & auto awards badges

### Stripe
`/api/create-payment-intent` returns real intent or mock secret in SIMPLE_AUTH.

### Stats Endpoints
`/api/rider/stats`, `/api/driver/stats`, `/api/admin/stats` aggregate rides, earnings, badges, CO₂.

### Storage Abstraction
Interface `IStorage` unifies both implementations. Switched at runtime by env flag.

---
## 7. Pricing & Eco Impact Algorithm
Implemented in `ridePricingService.ts`:
- Distance: Haversine (minimum 0.5 km).
- Fare: `baseFare(vehicleType) + perKm(vehicleType) * distance` with +5% premium if female preference requested.
- CO₂ Saved: `distance * emissionFactor(vehicleType)` (rough comparative savings vs petrol baseline).
- Eco Points: `round(co2SavedKg * 10 + distanceKm * 2)`.
Configuration constants easily tunable; consider moving to environment or DB in future.

---
## 8. Badges & Gamification
Seeded badges (`server/seed.ts`):
| Name              | Required Points | Icon |
|-------------------|-----------------|------|
| Eco Starter       | 10              | leaf |
| Green Commuter    | 50              | tree |
| Climate Champion  | 250             | award|
| Eco Warrior       | 1000            | shield|
| Planet Protector  | 500             | globe|

Awarding Logic:
On ride completion → rider eco points updated → fetch all badges & earned badges → award any badge with `requiredPoints <= ecoPoints` not yet earned.

---
## 9. Environment Variable Validation
`server/env.ts` runs at startup:
- Checks required variables based on mode (e.g. `DATABASE_URL`, `STRIPE_SECRET_KEY` only if DB mode).
- Redacts sensitive values in logs.
- Warns if `ALLOW_SIMPLE_AUTH_ROUTES=true` in production.
- Fails fast when mandatory variables missing.

---
## 10. Realtime (Socket.IO)
- Server: initialized in `server/routes.ts`; path `/socket.io` with origin allowlist built from `FRONTEND_ORIGIN` / per‑app origin envs.
- Client: `shared/realtime/socketIoClient.ts` auto picks `VITE_SOCKET_URL` or `VITE_API_URL`.
- Events:
	- `driver_location` (broadcast from `location_update` payload)
	- `ride_status_update`
	- `ride_request`
- Planned: move to per‑ride rooms (privacy & efficiency).

Example:
```ts
import socketService from '@shared/realtime/socketIoClient';
socketService.connect('rider');
socketService.on('driver_location', evt => console.log(evt));
```

---
## 11. Frontend Apps & UI Stack
| App    | Port (Dev) | Manifest Name        | Base Build Output |
|--------|------------|----------------------|------------------|
| Rider  | 5173       | WARGO RIDE           | `dist/rider`     |
| Driver | 5174       | WARGO PARTNER        | `dist/driver`    |
| Admin  | 5175       | WARGO Admin          | `dist/admin`     |

Shared Technologies:
- React 18 + TypeScript
- Tailwind CSS + Radix UI
- React Query for data/fetch caching
- Wouter for routing
- Vite PWA plugin for offline capabilities
- Firebase client (conditional by mode)

---
## 12. Development Workflow
```bash
# Install dependencies
cd EcoRideConnect
npm install

# SIMPLE_AUTH quick start (no DB):
echo "SIMPLE_AUTH=true" >> .env
npm run dev            # starts API on :5000
npm run dev:all        # starts rider/driver/admin dev servers concurrently

# DB mode setup:
cp .env.example .env   # edit DB credentials
SIMPLE_AUTH=false
npm run db:migrate
npm run dev
```
Visit: Rider `http://localhost:5173`, Driver `5174`, Admin `5175`.

Run tests:
```bash
npm run test
```

---
## 13. Scripts Cheat Sheet
| Script                | Purpose |
|-----------------------|---------|
| `npm run dev`         | Start API (development) |
| `npm run dev:all`     | Start all three frontend apps |
| `npm run rider:dev`   | Rider app dev only |
| `npm run driver:dev`  | Driver app dev only |
| `npm run admin:dev`   | Admin app dev only |
| `npm run build:apps`  | Build all apps |
| `npm run build`       | Bundle API (esbuild) |
| `npm run db:migrate`  | Run migrations via Drizzle script |
| `npm run db:push`     | Push schema (Drizzle) |
| `npm run smoke:db`    | DB mode smoke test flows |
| `npm run smoke:simple`| SIMPLE_AUTH mode smoke test |
| `npm run test`        | Vitest test run |
| `npm run deploy:hosting` | Firebase Hosting multi‑site deploy |

---
## 14. Testing (Vitest)
Located under `shared/__tests__/`. Current coverage focuses on storage lifecycle. Extend with:
- Badge awarding scenarios
- Pricing edge cases (short vs long distance)
- Auth path fallbacks.

Run:
```bash
npm run test
```

---
## 15. Deployment
### Firebase Hosting (Apps)
Build & deploy static assets for each app to dedicated Hosting sites. See `FIREBASE_DEPLOYMENT.md` for domain mapping & headers.

### Cloud Run (API)
Containerize & deploy Express API (or use any Node host). See `DEPLOY_CLOUD_RUN.md` for sample commands, migrations job, custom domain mapping.

### Required Environment in Production (DB Mode)
```
SIMPLE_AUTH=false
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_live_...
SESSION_SECRET=long-random
FRONTEND_ORIGIN=https://rideapp.wargo.com,https://partner.wargo.com,https://wargo.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json
```

---
## 16. Configuration / Environment Variables
Reference `.env.example` for categorized tiers:
- Critical: `DATABASE_URL`, `STRIPE_SECRET_KEY`, Firebase keys, Maps key
- Important: Twilio, Email provider
- Optional: Weather, Carbon API, Analytics, Sentry
Validation: missing mandatory variables cause startup error (see `server/env.ts`).

---
## 17. Security & Hardening Notes
| Area              | Current | Recommendation |
|-------------------|---------|----------------|
| Sessions          | memorystore in-memory | Redis/Memcached for production |
| Rate Limiting     | None    | Add `express-rate-limit` on auth & ride create |
| Rooms Isolation   | Broadcast all | Use per-ride Socket.IO rooms |
| Simple Auth       | Dev convenience | Enforce disabled in prod (already warned) |
| Payment Webhooks  | Not implemented | Add Stripe webhook signature verification |
| KYC Flows         | Static fields | Implement document upload & review endpoints |
| Logging           | Basic truncated | Introduce structured logging (pino) |

---
## 18. Roadmap / Planned Improvements
- Per-ride Socket.IO rooms & private channels.
- Stripe payment completion + webhook reconciliation.
- Referral endpoints & eco bonus distribution.
- Enhanced CO₂ calculation using external carbon API.
- Driver heartbeat & availability auto-expiry.
- Expanded test suite & coverage metrics.
- Configurable pricing via admin panel.
- Internationalization & accessibility audit.

---
## 19. Contributing
1. Fork the repository
2. Create a branch: `git checkout -b feature/<name>`
3. Implement & add tests
4. Run `npm run test && npm run check`
5. Submit PR with clear description

Coding Guidelines:
- Maintain strict TypeScript types.
- Keep business logic in services; keep routes thin.
- Avoid duplicating shared utilities (prefer `shared/`).

---
## 20. License & Support
Licensed under MIT. For issues or feature requests open a GitHub Issue.

Made with 💚 for a sustainable future.

---
### Quick Start TL;DR
```bash
git clone <repo>
cd EcoRideConnect
npm install
cp .env.example .env   # edit
npm run db:migrate     # if SIMPLE_AUTH=false
npm run dev & npm run dev:all
```