export type Offer = {
  id: string;
  /** Display name (maps from API `offer_name`) */
  title: string;
  subtitle?: string;
  /** API `offer_headline` when present */
  headline?: string;
  imageUrl?: string;
  ctaLabel?: string;
  /** API `offer_code` */
  offerCode?: string;
  /** API `treatment_id` */
  treatmentId?: string;
  /** API `conversation_id` */
  conversationId?: string;
  /** API `subject_id` on the offer (if present) */
  subjectId?: string;
};
