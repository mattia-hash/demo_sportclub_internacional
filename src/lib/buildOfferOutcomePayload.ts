import type { CustomerProfile } from "@/data/customers";
import type { Offer } from "@/types/offer";
import type { OfferOutcome } from "@/types/offerOutcome";

/** `2025-11-03T06:00:00` (no ms, no timezone suffix) — uses UTC on the server. */
export function formatOutcomeTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/**
 * Maps UI offer + outcome to the upstream body. Edit field names here to match your service.
 * Typical fields: channel, outcome, subject_id, offer identifiers, conversation_id, timestamp.
 */
/** Uses resolved `customer` so `subject_id` / `customer_id` always match offers (`buildOffersRequestBody`). */
export function buildOfferOutcomePayload(
  offer: Offer,
  outcome: OfferOutcome,
  customer: CustomerProfile
) {
  const now = new Date();
  return {
    channel: "Web",
    outcome,
    subject_id: customer.id,
    offer_id: offer.id,
    offer_code: offer.offerCode ?? "",
    offer_name: offer.title,
    treatment_id: offer.treatmentId ?? "",
    conversation_id: offer.conversationId ?? "",
    customer_id: customer.id,
    outcome_timestamp: formatOutcomeTimestamp(now),
  };
}
