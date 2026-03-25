export type Offer = {
  id: string;
  /** Display name (maps from API `offer_name`) */
  title: string;
  subtitle?: string;
  /** API `offer_headline` when present */
  headline?: string;
  imageUrl?: string;
  ctaLabel?: string;
};
