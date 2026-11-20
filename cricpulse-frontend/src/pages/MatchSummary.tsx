
import type { Innings } from "../services/scoringService";

interface Props {
  team1: string;
  team2: string;
  matchStatus: string;
  innings: Innings[];
}

function MatchSummary({ team1, team2, matchStatus, innings }: Props) {
  const completed = innings
    .filter((item) => item.inningsStatus === "COMPLETED")
    .sort((a, b) => b.totalRuns - a.totalRuns);

  const first = innings[0];
  const second = innings[1];

  const winner =
    completed.length > 0
      ? completed[0].battingTeam
      : null;

  const margin =
    first && second
      ? Math.abs(first.totalRuns - second.totalRuns)
      : 0;

  const result =
    matchStatus === "COMPLETED" && winner
      ? `${winner} won the match`
      : "Match in progress";

  return (
    <div className="match-summary">
      <h2>🏆 Match Summary & Result</h2>

      <div className="summary-result">
        <h3>{result}</h3>
        <p>{team1} vs {team2}</p>
        {matchStatus === "COMPLETED" && (
          <p>
            {second && first
              ? first.totalRuns === second.totalRuns
                ? "Match tied"
                : `${margin} runs difference`
              : "Result available"}
          </p>
        )}
      </div>

      <div className="summary-innings">
        {innings.map((item) => (
          <div className="summary-card" key={item.id}>
            <h3>{item.battingTeam}</h3>
            <h2>
              {item.totalRuns}/{item.wickets}
            </h2>
            <p>Overs: {Math.floor(item.legalBalls / 6)}.{item.legalBalls % 6}</p>
            <p>Status: {item.inningsStatus}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchSummary;
