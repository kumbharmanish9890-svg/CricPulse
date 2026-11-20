
import type { BallDelivery } from "../services/scoringService";

interface Props {
  balls: BallDelivery[];
}

function MatchRecords({ balls }: Props) {
  const records = new Map<
    string,
    { runs: number; fours: number; sixes: number }
  >();

  const wickets = new Map<string, number>();

  balls.forEach((ball) => {
    const batter = records.get(ball.batsman) || {
      runs: 0,
      fours: 0,
      sixes: 0,
    };

    batter.runs += ball.runs;
    if (ball.runs === 4) batter.fours++;
    if (ball.runs === 6) batter.sixes++;

    records.set(ball.batsman, batter);

    if (ball.wicket) {
      wickets.set(ball.bowler, (wickets.get(ball.bowler) || 0) + 1);
    }
  });

  const topBatter = [...records.entries()].sort(
    (a, b) => b[1].runs - a[1].runs
  )[0];

  const topFours = [...records.entries()].sort(
    (a, b) => b[1].fours - a[1].fours
  )[0];

  const topSixes = [...records.entries()].sort(
    (a, b) => b[1].sixes - a[1].sixes
  )[0];

  const topBowler = [...wickets.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const cards = [
    { title: "Highest Runs", name: topBatter?.[0], value: topBatter?.[1].runs ?? 0, icon: "🏏" },
    { title: "Most Fours", name: topFours?.[0], value: topFours?.[1].fours ?? 0, icon: "🔥" },
    { title: "Most Sixes", name: topSixes?.[0], value: topSixes?.[1].sixes ?? 0, icon: "💥" },
    { title: "Most Wickets", name: topBowler?.[0], value: topBowler?.[1] ?? 0, icon: "🎯" },
  ];

  return (
    <div className="match-records">
      <h2>🏆 Match Records & Milestones</h2>

      <div className="records-grid">
        {cards.map((card) => (
          <div className="record-card" key={card.title}>
            <span>{card.icon}</span>
            <h3>{card.title}</h3>
            <h2>{card.value}</h2>
            <p>{card.name || "Not available"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchRecords;
