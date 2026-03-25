import { Hero } from "@/components/landing/Hero";
import { MatchSection } from "@/components/landing/MatchSection";
import { OffersSection } from "@/components/landing/OffersSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.shell}>
      <Hero />
      <MatchSection />
      <OffersSection />
    </div>
  );
}
