"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Offer } from "@/types/offer";
import type { OfferOutcome } from "@/types/offerOutcome";
import styles from "./OffersSection.module.css";

type Props = {
  offer: Offer;
  customerId: string;
};

async function postOutcome(
  offer: Offer,
  outcome: OfferOutcome,
  customerId: string
): Promise<void> {
  const res = await fetch("/api/offer-outcome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer, outcome, customerId }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? `HTTP ${res.status}`);
  }
}

export function OfferCard({ offer, customerId }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const presentedSent = useRef(false);
  const choiceInFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || presentedSent.current) return;
        presentedSent.current = true;
        void postOutcome(offer, "Presented", customerId).catch((e) => {
          console.error("[offer-outcome] Presented", e);
          presentedSent.current = false;
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [offer, customerId]);

  const onChoice = useCallback(
    async (outcome: "Accepted" | "Rejected") => {
      if (choiceInFlight.current) return;
      choiceInFlight.current = true;
      setBusy(true);
      setActionError(null);
      try {
        await postOutcome(offer, outcome, customerId);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        choiceInFlight.current = false;
        setBusy(false);
      }
    },
    [offer, customerId]
  );

  return (
    <div ref={rootRef} className={styles.card}>
      <div className={styles.media}>
        {offer.imageUrl ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className={styles.img}
          />
        ) : (
          <div className={styles.mediaPlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{offer.title}</h3>
        {offer.headline && offer.headline !== offer.title ? (
          <p className={styles.cardHeadline}>{offer.headline}</p>
        ) : null}
        {offer.subtitle ? (
          <p className={styles.cardSub}>{offer.subtitle}</p>
        ) : null}
        {actionError ? (
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.acceptBtn}
            disabled={busy}
            onClick={() => void onChoice("Accepted")}
          >
            Aceitar
          </button>
          <button
            type="button"
            className={styles.rejectBtn}
            disabled={busy}
            onClick={() => void onChoice("Rejected")}
          >
            Não tenho interesse
          </button>
        </div>
      </div>
    </div>
  );
}
