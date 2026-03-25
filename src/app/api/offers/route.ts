import { NextResponse } from "next/server";
import { OFFERS_REQUEST_PAYLOAD } from "@/config/offers";
import { getOffersUpstreamUrl } from "@/lib/offersUpstreamUrl";
import { fetchWithUpstreamService } from "@/lib/serviceClient";
import { logError, logInfo } from "@/lib/serverLog";

function isFullHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

export async function GET() {
  const offerUrl = getOffersUpstreamUrl();

  if (!offerUrl) {
    const msg =
      "EXTERNAL_API_OFFERS_PATH is not set. Set it to the full upstream URL (https://...).";
    logError("api/offers", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  if (!isFullHttpUrl(offerUrl)) {
    const msg =
      "EXTERNAL_API_OFFERS_PATH must be a full URL starting with https:// or http://";
    logError("api/offers", msg, { value: offerUrl });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const requestBodyJson = JSON.stringify(OFFERS_REQUEST_PAYLOAD);
  logInfo("api/offers", "POST to upstream", {
    url: offerUrl,
    requestBody: OFFERS_REQUEST_PAYLOAD,
    requestBodyJson,
  });

  try {
    const res = await fetchWithUpstreamService(offerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBodyJson,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const rawText = await res.text();

    logInfo("api/offers", "upstream response (raw)", {
      status: res.status,
      ok: res.ok,
      contentType,
      contentLength: res.headers.get("content-length"),
      rawTextLength: rawText.length,
      rawText,
    });

    let body: unknown;
    const trimmed = rawText.trim();
    if (trimmed === "") {
      body = null;
    } else if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(trimmed) as unknown;
      } catch {
        body = rawText;
      }
    } else {
      body = rawText;
    }

    logInfo("api/offers", "upstream response (parsed)", {
      status: res.status,
      body,
      responseBodyJson:
        body === null
          ? null
          : typeof body === "object"
            ? JSON.stringify(body)
            : typeof body === "string"
              ? body
              : String(body),
    });

    if (!res.ok) {
      logError("api/offers", "upstream returned non-OK status", {
        status: res.status,
        url: offerUrl,
      });
    }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      url: offerUrl,
      body,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("api/offers", "handler failed", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
