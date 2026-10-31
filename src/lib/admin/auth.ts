import 'server-only';
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { isOwner } from './domain';
let client: Auth0Client | undefined;
export function authConfigured() { return !!(process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_SECRET); }
export function authClient() {
  if (!authConfigured()) throw new Error('Admin authentication is not configured');
  return client ??= new Auth0Client({
    appBaseUrl: process.env.APP_BASE_URL,
    authorizationParameters: { scope: 'openid profile', connection: 'github' },
    session: { rolling: false, absoluteDuration: 60 * 60 * 8, inactivityDuration: 60 * 30 },
    enableAccessTokenEndpoint: false,
  });
}
export async function ownerStatus() {
  if (!authConfigured()) return 'unconfigured' as const;
  try { const session = await authClient().getSession(); return !session ? 'anonymous' as const : isOwner(session.user) ? 'owner' as const : 'forbidden' as const; }
  catch { return 'anonymous' as const; }
}
