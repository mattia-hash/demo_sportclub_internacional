import type { Offer } from "@/types/offer";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pickOffer(raw: Record<string, unknown>, index: number): Offer | null {
  const id =
    typeof raw.offer_id === "string"
      ? raw.offer_id
      : typeof raw.id === "string"
        ? raw.id
        : typeof raw.slug === "string"
          ? raw.slug
          : `offer-${index}`;

  const title =
    typeof raw.offer_name === "string"
      ? raw.offer_name
      : typeof raw.title === "string"
        ? raw.title
        : typeof raw.name === "string"
          ? raw.name
          : typeof raw.treatment_name === "string"
            ? raw.treatment_name
            : typeof raw.headline === "string"
              ? raw.headline
              : null;
  const resolvedTitle =
    title ??
    (typeof raw.offer_id === "string"
      ? raw.offer_id
      : typeof raw.id === "string"
        ? raw.id
        : `Oferta ${index + 1}`);
  if (!resolvedTitle.trim()) return null;

  const headline =
    typeof raw.offer_headline === "string" ? raw.offer_headline : undefined;

  const subtitle =
    typeof raw.subtitle === "string"
      ? raw.subtitle
      : typeof raw.description === "string" && raw.description.trim()
        ? raw.description
        : typeof raw.body === "string" && raw.body.trim()
          ? raw.body
          : undefined;

  const imageUrl =
    typeof raw.image_url === "string"
      ? raw.image_url
      : typeof raw.imageUrl === "string"
        ? raw.imageUrl
        : typeof raw.image === "string"
          ? raw.image
          : typeof raw.thumbnail === "string"
            ? raw.thumbnail
            : undefined;

  const ctaLabel =
    typeof raw.treatment_label === "string"
      ? raw.treatment_label
      : typeof raw.ctaLabel === "string"
        ? raw.ctaLabel
        : typeof raw.cta === "string"
          ? raw.cta
          : undefined;

  const offerCode =
    typeof raw.offer_code === "string" ? raw.offer_code : undefined;
  const treatmentId =
    typeof raw.treatment_id === "string" ? raw.treatment_id : undefined;
  const conversationId =
    typeof raw.conversation_id === "string" ? raw.conversation_id : undefined;

  return {
    id,
    title: resolvedTitle,
    subtitle,
    headline,
    imageUrl,
    ctaLabel,
    offerCode,
    treatmentId,
    conversationId,
  };
}

/**
 * Accepts common API shapes: raw array, { offers }, { data }, { items }, etc.
 */
export function normalizeOffers(payload: unknown): Offer[] {
  let candidate: unknown = payload;

  if (isRecord(candidate) && "body" in candidate) {
    candidate = candidate.body;
  }

  if (isRecord(candidate) && "data" in candidate) {
    candidate = candidate.data;
  }

  if (isRecord(candidate)) {
    if (Array.isArray(candidate.offers)) candidate = candidate.offers;
    else if (Array.isArray(candidate.items)) candidate = candidate.items;
    else if (Array.isArray(candidate.results)) candidate = candidate.results;
    else if (Array.isArray(candidate.data)) candidate = candidate.data;
  }

  if (!Array.isArray(candidate)) {
    return [];
  }

  const out: Offer[] = [];
  candidate.forEach((item, i) => {
    if (!isRecord(item)) return;
    const o = pickOffer(item, i);
    if (o) out.push(o);
  });
  return out;
}
