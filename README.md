# WARGO 🌱🚗

WARGO is a sustainable ride-sharing platform connecting eco-conscious drivers and riders, promoting environmental responsibility through shared transportation.

## Features

- **Eco-Friendly Focus**: Prioritizes electric vehicles and hybrid cars
- **Real-time Matching**: Connect drivers and riders instantly
- **Environmental Impact Tracking**: Monitor your carbon footprint reduction
- **Secure Payments**: Integrated payment processing with Stripe
- **Admin Dashboard**: Comprehensive management tools
- **Real-time Chat**: In-app messaging between drivers and riders

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Wouter** for routing
- **Firebase** for authentication

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **WebSocket** for real-time features
- **Passport.js** for authentication
- **Stripe** for payments

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Firebase project
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd EcoRideConnect
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- Database connection string
- Firebase configuration
- Stripe keys
- Session secret

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The API server will be available at `http://localhost:5000`. The Rider/Driver/Admin apps run on their own Vite dev servers (see Development Guide).

### Realtime and Firebase Integration

- Centralized Firebase config at `EcoRideConnect/shared/lib/firebase.ts`
- Shared WebSocket client at `EcoRideConnect/shared/realtime/socketClient.ts`
- Per-app environment overrides in `EcoRideConnect/apps/*/.env`

#### WebSocket usage (in any app)
```ts
import socketService from '@shared/realtime/socketClient';

// Connect once on app mount
socketService.connect('rider');

// Listen for events
const off = socketService.on('driver_location', (evt) => {
	console.log('Driver location', evt);
});

// Later: stop listening
off();
```

By default, the client connects to `VITE_SOCKET_URL` or derives `ws://` from `VITE_API_URL` (e.g. `http://localhost:5000` -> `ws://localhost:5000/ws`).

## Deployment

You can deploy the API and web apps to your preferred platform (e.g., a Node.js host or container platform). This repo no longer contains provider-specific deployment files; wire it up in your infra of choice.

### Domains and CORS

- Your selected layout:
	- Rider app (Hosting): `https://wargo-ride.com`
	- Driver app (Hosting): `https://wargo-partner.com`
	- Admin app (Hosting): `https://wargo.com`
	- API (server you host): `https://api.wargo.com` (assumed; if different, adjust accordingly)

Set CORS allowlist in the API server env:

```
FRONTEND_ORIGIN=https://wargo-ride.com,https://wargo-partner.com,https://wargo.com
# or set individually
RIDER_ORIGIN=https://ride.wargo.com
DRIVER_ORIGIN=https://partner.wargo.com
ADMIN_ORIGIN=https://admin.wargo.com
```

In Firebase Auth > Settings > Authorized domains, add all the above domains plus the API domain (e.g., `api.wargo.com`).

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory

### Environment Variables for Production

Make sure to set up the following environment variables in your production environment:

```
DATABASE_URL=your_postgres_connection_string
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SESSION_SECRET=your_session_secret
SIMPLE_AUTH=false
# expose simple session login endpoints while you test DB mode (optional for staging only)
ALLOW_SIMPLE_AUTH_ROUTES=true
COOKIE_SECURE=true
FRONTEND_ORIGIN=https://ride.wargo.com,https://partner.wargo.com,https://admin.wargo.com

# Firebase Admin (one of the following)
# Option A: Explicit service account JSON
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json
# Option B: Rely on Application Default Credentials on the host
```

## Project Structure

```
EcoRideConnect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database configuration
│   └── seed.ts            # Database seeding
├── shared/                 # Shared types and schemas
├── migrations/             # Database migrations
└── dist/                   # Built application
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact [your-email@example.com] or open an issue on GitHub.

---

Made with 💚 for a sustainable future

## DB mode quick start (local or staging)

1) Ensure Postgres is available and set `DATABASE_URL`.
2) Switch to DB mode and expose simple login endpoints for testing:

```
SIMPLE_AUTH=false
ALLOW_SIMPLE_AUTH_ROUTES=true
SESSION_SECRET=some-long-random
```

3) Run migrations:

```
cd EcoRideConnect
npm run db:migrate
```

4) Start API (from `EcoRideConnect/`):

```
npm run dev
```

5) Run the DB-mode smoke test in another terminal:

```
npm run smoke:db
```

This script will exercise rider/driver/admin flows using session cookies (no Firebase token required) while the server persists data to Postgres.