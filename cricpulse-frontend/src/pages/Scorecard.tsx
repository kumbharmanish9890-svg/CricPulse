
import { type BallDelivery } from "../services/scoringService";
import "./Scorecard.css";

interface Props {
  balls: BallDelivery[];
}

interface BattingStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
}

interface BowlingStats {
  name: string;
  balls: number;
  runs: number;
  wickets: number;
}

export default function Scorecard({ balls }: Props) {
  const battingMap = new Map<string, BattingStats>();
  const bowlingMap = new Map<string, BowlingStats>();

  balls.forEach(ball => {
    // Batting statistics
    const batter = battingMap.get(ball.batsman) || {
      name: ball.batsman,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false
    };

    batter.runs += ball.runs || 0;

    if (ball.extraType !== "WIDE") {
      batter.balls++;
    }

    if (ball.runs === 4) batter.fours++;
    if (ball.runs === 6) batter.sixes++;

    if (ball.wicket && ball.dismissedPlayer === ball.batsman) {
      batter.out = true;
    }

    battingMap.set(ball.batsman, batter);

    // Bowling statistics
    const bowler = bowlingMap.get(ball.bowler) || {
      name: ball.bowler,
      balls: 0,
      runs: 0,
      wickets: 0
    };

    if (ball.legalDelivery) {
      bowler.balls++;
    }

    if (ball.extraType !== "BYE" && ball.extraType !== "LEG_BYE") {
      bowler.runs += ball.totalRuns || 0;
    }

    if (ball.wicket && ball.wicketType !== "RUN_OUT") {
      bowler.wickets++;
    }

    bowlingMap.set(ball.bowler, bowler);
  });

  const battingStats = Array.from(battingMap.values());
  const bowlingStats = Array.from(bowlingMap.values());

  const getOvers = (legalBalls: number) =>
    `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

  const getStrikeRate = (runs: number, ballsFaced: number) =>
    ballsFaced > 0 ? ((runs / ballsFaced) * 100).toFixed(2) : "0.00";

  const getEconomy = (runs: number, legalBalls: number) =>
    legalBalls > 0
      ? (runs / (legalBalls / 6)).toFixed(2)
      : "0.00";

  return (
    <section className="scorecard">
      <h2>Batting Scorecard</h2>

      {battingStats.length === 0 ? (
        <p>No batting data available.</p>
      ) : (
        <div className="scorecard-table-wrapper">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>R</th>
                <th>B</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {battingStats.map(player => (
                <tr key={player.name}>
                  <td>{player.name}</td>
                  <td>{player.runs}</td>
                  <td>{player.balls}</td>
                  <td>{player.fours}</td>
                  <td>{player.sixes}</td>
                  <td>{getStrikeRate(player.runs, player.balls)}</td>
                  <td>{player.out ? "Out" : "Not Out*"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="bowling-heading">Bowling Figures</h2>

      {bowlingStats.length === 0 ? (
        <p>No bowling data available.</p>
      ) : (
        <div className="scorecard-table-wrapper">
          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>O</th>
                <th>R</th>
                <th>W</th>
                <th>Eco</th>
              </tr>
            </thead>
            <tbody>
              {bowlingStats.map(player => (
                <tr key={player.name}>
                  <td>{player.name}</td>
                  <td>{getOvers(player.balls)}</td>
                  <td>{player.runs}</td>
                  <td>{player.wickets}</td>
                  <td>{getEconomy(player.runs, player.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
