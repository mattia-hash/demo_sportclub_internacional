export type MatchCta = "active" | "pending";

export type MatchFixture = {
  id: string;
  category: string;
  league: string;
  round: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  venue: string;
  whenLabel: string;
  cta: MatchCta;
};

export const matches: MatchFixture[] = [
  {
    id: "1",
    category: "Masculino",
    league: "Brasileirão 2026",
    round: "9ª rodada",
    homeTeam: { name: "Internacional", shortName: "INT" },
    awayTeam: { name: "São Paulo", shortName: "SAO" },
    venue: "Beira-Rio",
    whenLabel: "Quarta-Feira, 01/04/2026, 19:30",
    cta: "active",
  },
  {
    id: "2",
    category: "Masculino",
    league: "Brasileirão 2026",
    round: "10ª rodada",
    homeTeam: { name: "Flamengo", shortName: "FLA" },
    awayTeam: { name: "Internacional", shortName: "INT" },
    venue: "Maracanã",
    whenLabel: "Domingo, 06/04/2026, 16:00",
    cta: "active",
  },
  {
    id: "3",
    category: "Masculino",
    league: "Copa do Brasil 2026",
    round: "Oitavas",
    homeTeam: { name: "Internacional", shortName: "INT" },
    awayTeam: { name: "Grêmio", shortName: "GRE" },
    venue: "Beira-Rio",
    whenLabel: "A definir",
    cta: "pending",
  },
  {
    id: "4",
    category: "Masculino",
    league: "Brasileirão 2026",
    round: "11ª rodada",
    homeTeam: { name: "Internacional", shortName: "INT" },
    awayTeam: { name: "Palmeiras", shortName: "PAL" },
    venue: "Beira-Rio",
    whenLabel: "Sábado, 12/04/2026, 21:00",
    cta: "active",
  },
];
