import { app, auth } from "@shared/lib/firebase";
import { GoogleAuthProvider } from "firebase/auth";

// Use shared Firebase instance across all apps; create a provider for client sign-in flows
export { app, auth };
export const googleProvider = new GoogleAuthProvider();

// Force account selection every time (shows which email you're choosing)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
