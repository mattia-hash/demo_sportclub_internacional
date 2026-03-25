"use client";

import { useEffect, useState } from "react";
import { normalizeOffers } from "@/lib/normalizeOffers";
import type { Offer } from "@/types/offer";
import styles from "./OffersSection.module.css";

export function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/offers");
        const json = (await res.json()) as {
          ok?: boolean;
          body?: unknown;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error ?? `Erro ${res.status}`);
        }
        const normalized = normalizeOffers(json);
        if (!cancelled) {
          setOffers(normalized);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setOffers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="offers-heading">
      <div className={styles.inner}>
        <h2 id="offers-heading" className={styles.heading}>
          Ofertas
        </h2>
        <p className={styles.sub}>
          Benefícios e promoções carregados do serviço.
        </p>

        {loading ? (
          <p className={styles.loading}>Carregando ofertas…</p>
        ) : error ? (
          <div className={styles.errorBox} role="alert">
            <p className={styles.errorTitle}>Não foi possível carregar as ofertas.</p>
            <p className={styles.errorDetail}>{error}</p>
          </div>
        ) : offers.length === 0 ? (
          <p className={styles.empty}>Nenhuma oferta disponível no momento.</p>
        ) : (
          <ul className={styles.grid}>
            {offers.map((offer) => (
              <li key={offer.id}>
                <article className={styles.card}>
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
                    <a className={styles.cta} href="#">
                      {offer.ctaLabel ?? "Aproveitar"}
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
