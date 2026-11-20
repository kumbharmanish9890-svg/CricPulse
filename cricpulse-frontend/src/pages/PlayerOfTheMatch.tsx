
import type { BallDelivery } from "../services/scoringService";

interface Props {
  balls: BallDelivery[];
}

function PlayerOfTheMatch({ balls }: Props) {
  const players = new Map<
    string,
    { runs: number; fours: number; sixes: number; wickets: number }
  >();

  const getPlayer = (name: string) => {
    if (!players.has(name)) {
      players.set(name, { runs: 0, fours: 0, sixes: 0, wickets: 0 });
    }
    return players.get(name)!;
  };

  balls.forEach((ball) => {
    const batter = getPlayer(ball.batsman);

    batter.runs += ball.runs;
    if (ball.runs === 4) batter.fours++;
    if (ball.runs === 6) batter.sixes++;

    if (ball.wicket) {
      getPlayer(ball.bowler).wickets++;
    }
  });

  const rankings = [...players.entries()]
    .map(([name, stats]) => ({
      name,
      ...stats,
      score:
        stats.runs +
        stats.fours * 1 +
        stats.sixes * 2 +
        stats.wickets * 25,
    }))
    .sort((a, b) => b.score - a.score);

  const winner = rankings[0];

  return (
    <div className="potm-container">
      <h2>🏆 Player of the Match Prediction</h2>

      {winner ? (
        <>
          <div className="potm-winner">
            <div className="potm-trophy">🏆</div>
            <h3>Predicted Player of the Match</h3>
            <h1>{winner.name}</h1>
            <p>Performance Score: {winner.score}</p>
            <div className="potm-stats">
              <span>Runs: {winner.runs}</span>
              <span>Fours: {winner.fours}</span>
              <span>Sixes: {winner.sixes}</span>
              <span>Wickets: {winner.wickets}</span>
            </div>
          </div>

          <h3>Top Performers</h3>
          {rankings.slice(0, 5).map((player, index) => (
            <div className="potm-row" key={player.name}>
              <span>#{index + 1} {player.name}</span>
              <strong>{player.score} points</strong>
            </div>
          ))}
        </>
      ) : (
        <p>Waiting for match performance data...</p>
      )}

      <small>
        Prediction is based on runs, boundaries and wickets. It is not an
        official match award.
      </small>
    </div>
  );
}

export default PlayerOfTheMatch;
