import { matches } from "@/data/matches";
import { MatchCard } from "./MatchCard";
import styles from "./MatchSection.module.css";

export function MatchSection() {
  return (
    <section className={styles.section} aria-labelledby="matches-heading">
      <h2 id="matches-heading" className={styles.visuallyHidden}>
        Próximos jogos
      </h2>
      <ul className={styles.grid}>
        {matches.map((m) => (
          <li key={m.id} className={styles.item}>
            <MatchCard match={m} />
          </li>
        ))}
      </ul>
    </section>
  );
}
