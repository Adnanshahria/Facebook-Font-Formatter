import { createClient } from '@libsql/client/web';

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  VITE_ADMIN_PASSWORD?: string;
  APP_URL?: string;
  HF_API_TOKEN?: string;
  GROQ_API_KEY?: string;
}

export function getDb(env: Env) {
  return createClient({
    url: env.TURSO_DATABASE_URL || 'libsql://dummy.turso.io',
    authToken: env.TURSO_AUTH_TOKEN || '',
  });
}
