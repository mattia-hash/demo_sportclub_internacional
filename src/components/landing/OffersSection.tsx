"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "@/components/landing/OfferCard";
import { normalizeOffers } from "@/lib/normalizeOffers";
import type { Offer } from "@/types/offer";
import styles from "./OffersSection.module.css";

type Props = {
  customerId: string;
};

export function OffersSection({ customerId }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ customer_id: customerId });
        const res = await fetch(`/api/offers?${qs.toString()}`);
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
  }, [customerId]);

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
              <li key={offer.id} className={styles.gridItem}>
                <OfferCard offer={offer} customerId={customerId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
