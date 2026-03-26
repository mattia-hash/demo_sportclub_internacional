"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Bumps on effect cleanup so we never skip setLoading(false) for the active fetch (e.g. React Strict Mode aborts the first in-flight request). */
  const loadGenerationRef = useRef(0);

  useEffect(() => {
    const myGeneration = ++loadGenerationRef.current;
    const ac = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ customer_id: customerId });
        const res = await fetch(`/api/offers?${qs.toString()}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const json = (await res.json()) as {
          ok?: boolean;
          status?: number;
          body?: unknown;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error ?? `Erro ${res.status}`);
        }
        if (json.ok === false) {
          const detail =
            typeof json.error === "string"
              ? json.error
              : json.status != null
                ? `Serviço retornou status ${json.status}`
                : "Serviço indisponível";
          throw new Error(detail);
        }
        const normalized = normalizeOffers(json);
        if (myGeneration === loadGenerationRef.current) {
          setOffers(normalized);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        if (myGeneration === loadGenerationRef.current) {
          setError(e instanceof Error ? e.message : String(e));
          setOffers([]);
        }
      } finally {
        if (myGeneration === loadGenerationRef.current) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ac.abort();
      loadGenerationRef.current += 1;
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
