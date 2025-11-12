/* Environment variable validation and summary */
interface EnvRequirement {
  key: string;
  requiredWhen: (env: NodeJS.ProcessEnv) => boolean;
  description: string;
  redact?: boolean;
}

const requirements: EnvRequirement[] = [
  { key: 'SESSION_SECRET', requiredWhen: () => true, description: 'Session cookie signing secret', redact: true },
  { key: 'SIMPLE_AUTH', requiredWhen: () => true, description: 'Simple auth mode toggle' },
  { key: 'DATABASE_URL', requiredWhen: (e) => e.SIMPLE_AUTH !== 'true', description: 'Postgres connection string', redact: true },
  { key: 'STRIPE_SECRET_KEY', requiredWhen: (e) => e.SIMPLE_AUTH !== 'true', description: 'Stripe API secret', redact: true },
  { key: 'FIREBASE_SERVICE_ACCOUNT_KEY_PATH', requiredWhen: (e) => e.SIMPLE_AUTH !== 'true' && e.ALLOW_SIMPLE_AUTH_ROUTES !== 'true' && !e.FIREBASE_SERVICE_ACCOUNT_JSON, description: 'Path to Firebase service account (or provide FIREBASE_SERVICE_ACCOUNT_JSON)', redact: false },
];

export interface EnvReport {
  missing: string[];
  warnings: string[];
  summary: Record<string, string>;
}

export function validateEnv(env: NodeJS.ProcessEnv = process.env): EnvReport {
  const missing: string[] = [];
  const warnings: string[] = [];
  const summary: Record<string, string> = {};
  for (const req of requirements) {
    if (!req.requiredWhen(env)) continue;
    const val = env[req.key];
    if (!val) {
      missing.push(`${req.key} (${req.description})`);
    } else {
      summary[req.key] = req.redact ? 'SET' : val;
    }
  }
  if (env.ALLOW_SIMPLE_AUTH_ROUTES === 'true' && env.NODE_ENV === 'production') {
    warnings.push('ALLOW_SIMPLE_AUTH_ROUTES=true in production – disable unless intentionally exposing dev endpoints.');
  }
  return { missing, warnings, summary };
}

export function logEnvReport(report: EnvReport) {
  // eslint-disable-next-line no-console
  console.log('[env] summary:', report.summary);
  if (report.missing.length) {
    // eslint-disable-next-line no-console
    console.error('[env] missing required variables:', report.missing);
  }
  if (report.warnings.length) {
    // eslint-disable-next-line no-console
    console.warn('[env] warnings:', report.warnings);
  }
  if (report.missing.length) {
    throw new Error(`Missing required environment variables: ${report.missing.join(', ')}`);
  }
}

// Auto-run when imported at server startup
if (process.env.NODE_ENV !== 'test') {
  try {
    const report = validateEnv();
    logEnvReport(report);
  } catch (e) {
    // rethrow to crash fast
    throw e;
  }
}

export default validateEnv;