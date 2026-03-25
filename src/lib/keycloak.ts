import { readEnv } from "./readEnv";
import { logError, logInfo, truncate } from "./serverLog";

const ISSUER_TOKEN_PATH = "/protocol/openid-connect/token";

let cache: { token: string; expiresAt: number } | null = null;

function resolveTokenUrl(): string {
  const direct = readEnv("TOKEN_URL");
  if (direct) {
    return direct;
  }
  const issuer = readEnv("KEYCLOAK_ISSUER");
  if (issuer) {
    return `${issuer.replace(/\/$/, "")}${ISSUER_TOKEN_PATH}`;
  }
  throw new Error(
    "Missing token endpoint: set TOKEN_URL (full URL) or KEYCLOAK_ISSUER (realm base URL)"
  );
}

/**
 * Client-credentials token for server-to-service calls (Keycloak-compatible).
 * Prefer TOKEN_URL (full OpenID token endpoint). Otherwise KEYCLOAK_ISSUER + /protocol/openid-connect/token.
 */
export async function getKeycloakAccessToken(): Promise<string> {
  const clientId = readEnv("KEYCLOAK_CLIENT_ID");
  const clientSecret = readEnv("KEYCLOAK_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Keycloak env: KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET"
    );
  }

  const now = Date.now();
  if (cache && cache.expiresAt > now + 5000) {
    return cache.token;
  }

  const tokenUrl = resolveTokenUrl();
  let tokenHost: string;
  try {
    tokenHost = new URL(tokenUrl).hostname;
  } catch {
    tokenHost = "(invalid TOKEN_URL / issuer)";
  }
  logInfo("keycloak", "requesting access token (client_credentials)", {
    tokenEndpointHost: tokenHost,
  });

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  const scope = readEnv("KEYCLOAK_SCOPE");
  if (scope) {
    body.set("scope", scope);
  }

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    logError("keycloak", "token request failed", {
      status: res.status,
      body: truncate(text),
    });
    throw new Error(`Keycloak token request failed (${res.status}): ${truncate(text)}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in?: number;
  };
  if (!json.access_token) {
    logError("keycloak", "response JSON missing access_token");
    throw new Error("Keycloak response missing access_token");
  }

  logInfo("keycloak", "access token received", {
    httpStatus: res.status,
    expiresInSec: json.expires_in ?? null,
  });

  const ttlSec = json.expires_in ?? 60;
  cache = {
    token: json.access_token,
    expiresAt: now + Math.max(10, ttlSec - 30) * 1000,
  };

  return json.access_token;
}
