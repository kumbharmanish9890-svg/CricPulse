
import type { BallDelivery } from "../services/scoringService";

interface Props {
  balls: BallDelivery[];
}

function FallOfWicketsPartnerships({ balls }: Props) {
  let totalRuns = 0;
  let partnershipRuns = 0;
  let partnershipBalls = 0;
  let wicketCount = 0;

  const fallOfWickets: {
    wicket: number;
    score: number;
    player: string;
    over: string;
    partnershipRuns: number;
    partnershipBalls: number;
  }[] = [];

  balls.forEach((ball) => {
    totalRuns += ball.totalRuns;
    partnershipRuns += ball.totalRuns;

    if (ball.legalDelivery) {
      partnershipBalls++;
    }

    if (ball.wicket) {
      wicketCount++;

      fallOfWickets.push({
        wicket: wicketCount,
        score: totalRuns,
        player: ball.dismissedPlayer || ball.batsman,
        over: `${ball.overNumber}.${ball.ballNumber}`,
        partnershipRuns,
        partnershipBalls,
      });

      partnershipRuns = 0;
      partnershipBalls = 0;
    }
  });

  return (
    <div className="fow-container">
      <h2>🏏 Fall of Wickets</h2>

      {fallOfWickets.length === 0 ? (
        <p>No wickets fallen yet.</p>
      ) : (
        fallOfWickets.map((item) => (
          <div className="fow-card" key={item.wicket}>
            <strong>Wicket {item.wicket}</strong>
            <h3>{item.score}/{item.wicket}</h3>
            <p>Dismissed: {item.player}</p>
            <p>Over: {item.over}</p>
            <p>
              Partnership: {item.partnershipRuns} Runs /
              {item.partnershipBalls} Balls
            </p>
          </div>
        ))
      )}

      <h2>🤝 Current Partnership</h2>

      <div className="partnership-card">
        <h3>{partnershipRuns} Runs</h3>
        <p>{partnershipBalls} Legal Balls</p>
        <p>Total Score: {totalRuns}/{wicketCount}</p>
      </div>
    </div>
  );
}

export default FallOfWicketsPartnerships;
