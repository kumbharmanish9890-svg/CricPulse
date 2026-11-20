
import type { BallDelivery } from "../services/scoringService";

interface Props {
  balls: BallDelivery[];
}

function MatchTimeline({ balls }: Props) {
  const overs = new Map<number, BallDelivery[]>();

  balls.forEach((ball) => {
    const over = overs.get(ball.overNumber) || [];
    over.push(ball);
    overs.set(ball.overNumber, over);
  });

  return (
    <div className="match-timeline">
      <h2>📊 Match Timeline</h2>

      {[...overs.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([overNumber, deliveries]) => {
          const runs = deliveries.reduce(
            (sum, ball) => sum + ball.totalRuns,
            0
          );

          const wickets = deliveries.filter((ball) => ball.wicket).length;

          return (
            <div className="timeline-over" key={overNumber}>
              <div className="timeline-over-header">
                <strong>Over {overNumber}</strong>
                <span>{runs} Runs</span>
                <span>{wickets} Wickets</span>
              </div>

              <div className="timeline-balls">
                {deliveries.map((ball) => (
                  <span
                    className={
                      ball.wicket
                        ? "timeline-ball wicket"
                        : ball.runs === 6
                        ? "timeline-ball six"
                        : ball.runs === 4
                        ? "timeline-ball four"
                        : "timeline-ball"
                    }
                    key={ball.id}
                    title={`${ball.batsman} vs ${ball.bowler}`}
                  >
                    {ball.wicket
                      ? "W"
                      : ball.runs === 6
                      ? "6"
                      : ball.runs === 4
                      ? "4"
                      : ball.totalRuns}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

      {balls.length === 0 && <p>No match timeline available yet.</p>}
    </div>
  );
}

export default MatchTimeline;
