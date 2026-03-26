import { NextResponse } from "next/server";
import { resolveCustomer } from "@/data/customers";
import { getOffersUpstreamUrl } from "@/lib/offersUpstreamUrl";
import { buildOffersRequestBody } from "@/lib/offersRequestBody";
import { fetchWithUpstreamService } from "@/lib/serviceClient";
import { logError, logInfo } from "@/lib/serverLog";

/** Avoid stale cached responses; allow slow upstream on platforms that honor this (e.g. Vercel). */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isFullHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedCustomerId = searchParams.get("customer_id")?.trim() || "1";
  const customer = resolveCustomer(requestedCustomerId);
  const customerId = customer.id;

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

  const payload = buildOffersRequestBody(customer.id);
  const requestBodyJson = JSON.stringify(payload);
  logInfo("api/offers", "POST to upstream", {
    customerId,
    url: offerUrl,
    requestBody: payload,
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
      customerId,
      body,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("api/offers", "handler failed", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
