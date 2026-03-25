import styles from "./MatchCard.module.css";
import type { MatchFixture } from "@/data/matches";

function TeamLogo({ label }: { label: string }) {
  return (
    <div className={styles.teamLogo} aria-hidden="true">
      <span className={styles.teamLogoText}>{label.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}

type Props = {
  match: MatchFixture;
};

export function MatchCard({ match }: Props) {
  const ctaPending = match.cta === "pending";

  return (
    <article className={styles.card}>
      <span className={styles.pill}>{match.category}</span>
      <p className={styles.league}>{match.league}</p>
      <p className={styles.round}>{match.round}</p>

      <div className={styles.vsRow}>
        <TeamLogo label={match.homeTeam.shortName} />
        <span className={styles.vs}>vs</span>
        <TeamLogo label={match.awayTeam.shortName} />
      </div>

      <p className={styles.matchup}>
        {match.homeTeam.name} vs {match.awayTeam.name}
      </p>

      <div className={styles.meta}>
        <p className={styles.venue}>{match.venue}</p>
        <p className={styles.when}>{match.whenLabel}</p>
      </div>

      <p className={styles.ctaWrap}>
        {ctaPending ? (
          <span className={styles.ctaOrange}>Em definição</span>
        ) : (
          <a className={styles.ctaRed} href="#">
            SAIBA MAIS
          </a>
        )}
      </p>
    </article>
  );
}
