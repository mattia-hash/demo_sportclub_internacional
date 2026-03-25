import { getKeycloakAccessToken } from "./keycloak";
import { readEnv } from "./readEnv";
import { logError, logInfo } from "./serverLog";

function isAbsoluteHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Resolves a path segment against EXTERNAL_API_BASE_URL, or uses a full URL as-is.
 */
export function resolveUpstreamUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (isAbsoluteHttpUrl(trimmed)) {
    return trimmed;
  }
  const base = readEnv("EXTERNAL_API_BASE_URL");
  if (!base) {
    throw new Error(
      `Missing EXTERNAL_API_BASE_URL. You passed a relative path "${trimmed}". ` +
        `Set EXTERNAL_API_BASE_URL to your API origin (e.g. https://api.example.com), ` +
        `or pass a full URL (https://...) as the path.`
    );
  }
  const baseUrl = base.replace(/\/$/, "");
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${normalized}`;
}

/**
 * Request to upstream API with Bearer token from Keycloak.
 * `path` may be a path (joined with EXTERNAL_API_BASE_URL) or a full http(s) URL.
 */
export async function fetchWithUpstreamService(
  path: string,
  init?: RequestInit
): Promise<Response> {
  let url: string;
  try {
    url = resolveUpstreamUrl(path);
  } catch (e) {
    logError("upstream", "resolveUpstreamUrl failed", e);
    throw e;
  }

  const method = init?.method ?? "GET";
  const body = init?.body;

  const token = await getKeycloakAccessToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const requestLog: Record<string, unknown> = { method, url };
  if (typeof body === "string" && body.length > 0) {
    requestLog.requestBodyJson = body;
    try {
      requestLog.requestBody = JSON.parse(body) as unknown;
    } catch {
      requestLog.requestBody = "(non-JSON string body)";
    }
  } else if (body != null && body !== "") {
    requestLog.requestBody = body;
  }
  logInfo("upstream", "request", requestLog);

  // Do not use `{ ...init, headers }` — spreading `init` can drop or mishandle `body` with some fetch stacks.
  const res = await fetch(url, {
    method,
    headers,
    body: body ?? undefined,
    signal: init?.signal,
    cache: init?.cache,
    credentials: init?.credentials,
    integrity: init?.integrity,
    keepalive: init?.keepalive,
    mode: init?.mode,
    redirect: init?.redirect,
    referrer: init?.referrer,
    referrerPolicy: init?.referrerPolicy,
  });
  logInfo("upstream", "response", {
    method,
    url,
    status: res.status,
    ok: res.ok,
  });

  return res;
}
