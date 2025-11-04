# Socket.IO Domain Configuration for WARGO

This guide is tailored to the current code in this repo (three Vite apps + Express API). It shows how to configure Socket.IO for local development and production with custom domains.

## Overview
- API/Socket.IO server: `EcoRideConnect/server/routes.ts` (Socket.IO created on the same HTTP server)
- Shared Socket.IO client: `EcoRideConnect/shared/realtime/socketIoClient.ts`
- Per-app environment files: `EcoRideConnect/apps/*/.env`
- Express CORS and Socket.IO CORS use the same origin lists (via env) for consistency

## Production domains
Recommended separation:
- API: `https://api.wargo.com`
- Rider: `https://rideapp.wargo.com`
- Driver: `https://partner.wargo.com`
- Admin: `https://wargo.com`

These match Firebase Hosting targets and the screenshot where custom domains are being prepared.

## Server configuration
Socket.IO is initialized in `server/routes.ts` and now reads allowed origins from env:
- `FRONTEND_ORIGIN` (CSV)
- `RIDER_ORIGIN`
- `DRIVER_ORIGIN`
- `ADMIN_ORIGIN`

Example `.env` additions (production):
```
FRONTEND_ORIGIN="https://rideapp.wargo.com,https://partner.wargo.com,https://wargo.com,https://api.wargo.com"
RIDER_ORIGIN="https://rideapp.wargo.com"
DRIVER_ORIGIN="https://partner.wargo.com"
ADMIN_ORIGIN="https://wargo.com"
```

These are used by:
- Express CORS in `server/index.ts`
- Socket.IO CORS in `server/routes.ts`

Local dev defaults are automatically allowed: `http://localhost:5173/4/5`.

## Client configuration
The shared client `shared/realtime/socketIoClient.ts` determines the connection URL as:
1) `VITE_SOCKET_URL`, or
2) `VITE_API_URL`, or
3) `window.location.origin`, or
4) `http://localhost:5000`

So you can:
- Use a central API domain in production by setting `VITE_SOCKET_URL=https://api.wargo.com`
- Or simply host the apps on the same domain as the API and omit `VITE_SOCKET_URL` (the client falls back to `window.location.origin`)

### Per-app .env examples
`apps/rider/.env`:
```
VITE_APP_NAME="WARGO"
VITE_API_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```
`apps/driver/.env`:
```
VITE_APP_NAME="WARGO PARTNER"
VITE_API_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```
`apps/admin/.env`:
```
VITE_APP_NAME="WARGO"
VITE_API_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```
In production, set these to your central API domain (e.g., `https://api.wargo.com`).

## Server event examples
Already wired:
- `location_update` (from clients) → server broadcasts `driver_location` to all
- Placeholders ready for `ride_status_update` and `ride_request`

Example server handlers (already present in `server/routes.ts`):
```ts
io.on('connection', (socket) => {
  socket.on('location_update', (data) => {
    const payload = { rideId: data?.rideId, lat: +data?.lat, lng: +data?.lng, who: data?.who || 'unknown', at: Date.now() };
    io.emit('driver_location', payload);
  });

  socket.on('ride_status_update', (data) => {
    io.emit('ride_status_update', { ...data, at: Date.now() });
  });

  socket.on('ride_request', (data) => {
    io.emit('ride_request', { ...data, at: Date.now() });
  });
});
```

## Client usage examples
Shared client (works in all apps):
```ts
import socketService from '@shared/realtime/socketIoClient';

socketService.connect('rider');

const off = socketService.on('driver_location', (evt) => {
  console.log('Driver location', evt);
});

// Later
off();
```

## Firebase Hosting
Your `firebase.json` already points to `EcoRideConnect/dist/*` for rider/driver/admin. The API is a separate Express server; host it behind `https://api.wargo.com` (Cloud Run, VM, or any Node host). Point `VITE_API_URL`/`VITE_SOCKET_URL` to that domain in each app.

## CORS checklist
- Set origin lists in `.env` as shown
- Ensure the DNS and SSL certificates are provisioned for all domains in Firebase (static) and for the API domain

## Deploy steps (summary)
- API: deploy Express server (with Socket.IO) to your backend (e.g., Cloud Run or VM) and use `https://api.wargo.com`
- Apps: build and deploy to Firebase Hosting targets already configured
- Update apps’ `.env` to point to the API domain

This configuration matches the current code and ensures all three apps can communicate in real-time via a central Socket.IO server.
