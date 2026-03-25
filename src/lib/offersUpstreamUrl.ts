import fs from "fs";
import path from "path";

import { readEnv } from "./readEnv";
import { logInfo } from "./serverLog";

function isFullHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Lowest → highest priority (later file wins for the same key), aligned with Next.js.
 */
function dotenvFilenames(): string[] {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return [
    ".env",
    `.env.${nodeEnv}`,
    ".env.local",
    `.env.${nodeEnv}.local`,
  ];
}

function readKeyFromFile(filePath: string, key: string): string | undefined {
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf8");
  let last: string | undefined;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (!trimmed.startsWith(`${key}=`)) continue;
    let v = trimmed.slice(key.length + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    last = v;
  }
  return last;
}

/**
 * Read EXTERNAL_API_OFFERS_PATH from dotenv files on disk (Next precedence; last file wins).
 */
function readOffersKeyFromDotenvFiles(cwd: string, key: string): string | undefined {
  let last: string | undefined;
  for (const name of dotenvFilenames()) {
    const p = path.join(cwd, name);
    const v = readKeyFromFile(p, key);
    if (v !== undefined) last = v;
  }
  return last;
}

/**
 * Single source for offers: full `https://` (or `http://`) URL in EXTERNAL_API_OFFERS_PATH.
 * Locally, **dotenv files on disk win** when they contain a full URL, so your `.env` matches the editor even if `process.env` still has a stale value (e.g. `/offers`).
 */
export function getOffersUpstreamUrl(): string | undefined {
  const cwd = process.cwd();
  const fromFile = readOffersKeyFromDotenvFiles(
    cwd,
    "EXTERNAL_API_OFFERS_PATH"
  );
  const fromProcess = readEnv("EXTERNAL_API_OFFERS_PATH");

  if (fromFile && isFullHttpUrl(fromFile)) {
    if (fromProcess?.trim() !== fromFile.trim()) {
      logInfo(
        "api/offers",
        "using EXTERNAL_API_OFFERS_PATH from dotenv file on disk (overrides process.env for local dev)",
        {
          cwd,
          processEnvValue: fromProcess ?? "(unset)",
        }
      );
    }
    return fromFile.trim();
  }

  if (fromProcess && isFullHttpUrl(fromProcess)) {
    return fromProcess.trim();
  }

  return fromProcess?.trim() ?? fromFile?.trim();
}
