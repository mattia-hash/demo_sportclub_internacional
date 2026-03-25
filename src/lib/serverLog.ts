/**
 * Server-only logs (Vercel: Runtime Logs for the route / Node).
 * Never pass tokens, secrets, or Authorization headers here.
 */

export function truncate(s: string, max = 800): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

export function logInfo(scope: string, message: string, meta?: Record<string, unknown>): void {
  if (meta && Object.keys(meta).length > 0) {
    console.info(`[${scope}]`, message, meta);
  } else {
    console.info(`[${scope}]`, message);
  }
}

export function logError(scope: string, message: string, err?: unknown): void {
  if (err !== undefined) {
    console.error(`[${scope}]`, message, err);
  } else {
    console.error(`[${scope}]`, message);
  }
}
