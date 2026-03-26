import { CustomerBar } from "@/components/landing/CustomerBar";
import { Hero } from "@/components/landing/Hero";
import { MatchSection } from "@/components/landing/MatchSection";
import { OffersSection } from "@/components/landing/OffersSection";
import { resolveCustomer } from "@/data/customers";
import styles from "./page.module.css";

type PageProps = {
  searchParams: Promise<{ customer_id?: string | string[] }>;
};

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = sp.customer_id;
  const requestedCustomerId =
    typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() ?? "1" : "1";
  const customer = resolveCustomer(requestedCustomerId);

  return (
    <div className={styles.shell}>
      <CustomerBar customerId={customer.id} />
      <Hero />
      <MatchSection />
      <OffersSection customerId={customer.id} />
    </div>
  );
}
