# Firebase Authorized Domains Checklist

When deploying WARGO apps or running them locally, ensure these domains are authorized in Firebase Console:

## Steps
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trusty-diorama-475905-c3`
3. Navigate to **Authentication → Settings → Authorized Domains**
4. Add the following domains:

### Development
- `localhost`
- `127.0.0.1`
- Your Codespaces or dev container domain (e.g., `*.github.dev`, `*.githubpreview.dev`)

### Production (Firebase Hosting)
- `wargo-admin.firebaseapp.com`
- `wargo-admin.web.app`
- `trusty-diorama-475905-c3.firebaseapp.com` (default)
- Custom domains:
  - `rideapp.wargo.com` (Rider)
  - `partner.wargo.com` (Driver)
  - `wargo.com` (Admin)

### API Backend
- Your API domain (e.g., `api.wargo.com`) if using Firebase Auth tokens

## Common Errors
| Error Code | Cause | Fix |
|------------|-------|-----|
| `auth/unauthorized-domain` | Domain not in authorized list | Add domain in Firebase Console |
| `auth/network-request-failed` | Firebase APIs disabled | Enable Authentication API, Identity Toolkit in GCP |
| `auth/invalid-api-key` | Wrong API key in .env | Verify `VITE_FIREBASE_API_KEY` matches console |

## Enable Required APIs (Google Cloud Console)
```bash
gcloud services enable firebase.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable firebaseauth.googleapis.com
```

## Testing
After adding domains, test with:
```bash
# Start apps
npm run dev:all
# Open rider app and attempt Google sign-in
```
Check browser console for any `auth/*` errors.
