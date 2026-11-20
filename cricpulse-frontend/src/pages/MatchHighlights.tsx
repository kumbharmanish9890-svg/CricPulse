
interface BallDelivery {
  id: number;
  overNumber: number;
  ballNumber: number;
  batsman: string;
  bowler: string;
  runs: number;
  totalRuns: number;
  wicket: boolean;
  wicketType?: string;
  dismissedPlayer?: string;
}

interface Props {
  balls: BallDelivery[];
}

function MatchHighlights({ balls }: Props) {
  const highlights = balls.filter(
    (ball) => ball.wicket || ball.runs === 4 || ball.runs === 6
  ).reverse();

  return (
    <div className="match-highlights">
      <h2>🏆 Match Highlights</h2>

      {highlights.length === 0 ? (
        <p>No highlights available yet.</p>
      ) : (
        highlights.map((ball) => (
          <div className="highlight-item" key={ball.id}>
            <strong>
              {ball.wicket
                ? "🔴 WICKET"
                : ball.runs === 6
                ? "💥 SIX"
                : "🔥 FOUR"}
            </strong>

            <p>
              Over {ball.overNumber}.{ball.ballNumber}
            </p>

            <p>
              {ball.wicket
                ? `${ball.dismissedPlayer || ball.batsman} dismissed (${ball.wicketType || "Wicket"})`
                : `${ball.batsman} scored ${ball.runs} runs`}
            </p>

            <small>Bowler: {ball.bowler}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default MatchHighlights;
