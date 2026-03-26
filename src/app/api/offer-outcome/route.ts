import { NextResponse } from "next/server";
import { resolveCustomer } from "@/data/customers";
import { buildOfferOutcomePayload } from "@/lib/buildOfferOutcomePayload";
import { fetchWithUpstreamService } from "@/lib/serviceClient";
import { readEnv } from "@/lib/readEnv";
import { logError, logInfo } from "@/lib/serverLog";
import type { Offer } from "@/types/offer";
import type { OfferOutcome } from "@/types/offerOutcome";

function isFullHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

const OUTCOMES: OfferOutcome[] = ["Presented", "Accepted", "Rejected"];

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof json !== "object" || json === null) {
    return NextResponse.json({ ok: false, error: "Expected JSON object" }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const outcome = body.outcome;
  const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
  const offer = body.offer as Offer | undefined;

  if (!customerId) {
    return NextResponse.json({ ok: false, error: "customerId is required" }, { status: 400 });
  }
  if (!offer || typeof offer !== "object") {
    return NextResponse.json({ ok: false, error: "offer is required" }, { status: 400 });
  }
  const o = offer as Offer;
  if (typeof o.id !== "string" || !o.id.trim()) {
    return NextResponse.json({ ok: false, error: "offer.id is required" }, { status: 400 });
  }
  if (typeof outcome !== "string" || !OUTCOMES.includes(outcome as OfferOutcome)) {
    return NextResponse.json(
      { ok: false, error: `outcome must be one of: ${OUTCOMES.join(", ")}` },
      { status: 400 }
    );
  }

  const url = readEnv("EXTERNAL_API_OFFER_OUTCOME_PATH")?.trim();
  if (!url) {
    const msg =
      "EXTERNAL_API_OFFER_OUTCOME_PATH is not set. Set it to the full https:// URL for offer outcomes.";
    logError("api/offer-outcome", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 503 });
  }
  if (!isFullHttpUrl(url)) {
    return NextResponse.json(
      { ok: false, error: "EXTERNAL_API_OFFER_OUTCOME_PATH must be a full http(s) URL" },
      { status: 500 }
    );
  }

  const customer = resolveCustomer(customerId);
  const payload = buildOfferOutcomePayload(o, outcome as OfferOutcome, customer);
  const requestBodyJson = JSON.stringify(payload);

  logInfo("api/offer-outcome", "POST to upstream", {
    outcome,
    requestedCustomerId: customerId,
    resolvedCustomerId: customer.id,
    url,
    requestBody: payload,
  });

  try {
    const res = await fetchWithUpstreamService(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBodyJson,
    });

    const rawText = await res.text();
    let parsed: unknown = rawText;
    const ct = res.headers.get("content-type") ?? "";
    if (rawText.trim() && ct.includes("application/json")) {
      try {
        parsed = JSON.parse(rawText) as unknown;
      } catch {
        parsed = rawText;
      }
    }

    if (!res.ok) {
      logError("api/offer-outcome", "upstream non-OK", {
        status: res.status,
        body: rawText.slice(0, 500),
      });
    }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      outcome,
      customerId: customer.id,
      upstreamBody: parsed,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logError("api/offer-outcome", "handler failed", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
