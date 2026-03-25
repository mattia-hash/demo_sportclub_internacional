/**
 * Read env at runtime using a dynamic key. Next.js can inline `process.env.NAME`
 * at build time; if the variable was missing then, it stays empty. Bracket access
 * avoids that stale value when `.env` is correct at runtime (e.g. after restart).
 */
export function readEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === "") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}
