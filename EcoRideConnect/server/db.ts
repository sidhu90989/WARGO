// Deprecated module: SQL/Neon backend removed.
// This file remains as a stub to avoid breaking old imports.
// The application now uses Firestore via firebase-admin in storage.ts.
import { config } from "dotenv";
config();

// eslint-disable-next-line no-console
console.warn('[db] Deprecated: SQL/Neon backend has been removed. Using Firestore instead.');

export const pool = undefined as unknown as never;
export const db = undefined as unknown as never;
