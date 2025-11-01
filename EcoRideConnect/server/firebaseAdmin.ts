import { config } from "dotenv";
config();
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

/**
 * Ensure a single initialized firebase-admin app with correct projectId.
 * Reads one of the following credential inputs (in priority order):
 * - FIREBASE_SERVICE_ACCOUNT_KEY_PATH: path to JSON file
 * - FIREBASE_SERVICE_ACCOUNT_JSON: inline JSON string
 * - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 * Fallback: Application Default Credentials (ADC)
 */
export function ensureFirebaseAdmin(): admin.app.App {
  if (admin.apps.length) {
    return admin.app();
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  try {
    // Propagate project id to common env vars used by Google SDKs
    if (projectId) {
      process.env.GOOGLE_CLOUD_PROJECT = projectId;
      process.env.GCLOUD_PROJECT = projectId;
    }

    if (keyPath) {
      const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
      const json = JSON.parse(fs.readFileSync(resolved, "utf8"));
      const pid = (json as any).project_id || projectId;
      const app = admin.initializeApp({
        credential: admin.credential.cert(json as any),
        projectId: pid,
      } as any);
      if (pid) {
        process.env.GOOGLE_CLOUD_PROJECT = pid;
        process.env.GCLOUD_PROJECT = pid;
      }
      return app;
    }

    if (saJson) {
      const json = JSON.parse(saJson);
      const pid = (json as any).project_id || projectId;
      const app = admin.initializeApp({
        credential: admin.credential.cert(json as any),
        projectId: pid,
      } as any);
      if (pid) {
        process.env.GOOGLE_CLOUD_PROJECT = pid;
        process.env.GCLOUD_PROJECT = pid;
      }
      return app;
    }

    if (projectId && clientEmail && privateKey) {
      const app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey } as any),
        projectId,
      } as any);
      return app;
    }

    // ADC fallback (GCP/AWS with workload identity etc.)
    const app = admin.initializeApp();
    return app;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[firebase-admin] initialization failed:", e);
    throw e;
  }
}

export default ensureFirebaseAdmin;
