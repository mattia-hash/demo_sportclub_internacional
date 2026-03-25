import Image from "next/image";
import { Oswald } from "next/font/google";
import styles from "./Hero.module.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hero",
});

export function Hero() {
  return (
    <section className={`${styles.hero} ${oswald.variable}`}>
      <div className={styles.heroInner} aria-hidden="true" />
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Sport Club</p>
          <h1 className={styles.title}>INTERNACIONAL</h1>
          <p className={styles.tagline}>TODO COLORADO LEMBRA</p>
        </div>
        <div className={styles.crestWrap}>
          <Image
            src="/crest.svg"
            alt="Brasão do Sport Club Internacional"
            width={160}
            height={160}
            className={styles.crest}
            priority
          />
        </div>
      </div>
    </section>
  );
}
