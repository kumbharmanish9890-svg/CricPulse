
import { useEffect, useState } from "react";
import api from "../services/api";
import scoringService, {
  type BallDelivery,
} from "../services/scoringService";
import "./LiveMatchDashboard.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchStatus: string;
  matchFormat: string;
  matchDate: string;
}

interface Innings {
  id: number;
  inningsNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  target: number | null;
  inningsStatus: string;
  currentStriker: string;
  currentNonStriker: string;
  currentBowler: string;
}

function LiveMatchDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | "">("");
  const [innings, setInnings] = useState<Innings[]>([]);
  const [recentBalls, setRecentBalls] = useState<BallDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      const response = await api.get("/matches");
      const data: Match[] = response.data;

      setMatches(data);

      if (data.length > 0 && selectedMatchId === "") {
        const liveMatch = data.find(
          (match) => match.matchStatus === "LIVE"
        );

        setSelectedMatchId(liveMatch?.id ?? data[0].id);
      }
    } catch {
      setError("Unable to load matches.");
    }
  };

  const fetchInnings = async (matchId: number) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/innings/match/${matchId}`
      );

      const inningsData: Innings[] = response.data;
      setInnings(inningsData);

      if (inningsData.length > 0) {
        const current = inningsData[inningsData.length - 1];

        try {
          const balls = await scoringService.getBallHistory(current.id);

          setRecentBalls(balls.slice(-6));
        } catch {
          setRecentBalls([]);
          setError("Unable to load recent balls.");
        }
      } else {
        setRecentBalls([]);
      }
    } catch {
      setError("Unable to load innings details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatchId === "") return;

    setRecentBalls([]);
    fetchInnings(selectedMatchId);

    const interval = setInterval(() => {
      fetchInnings(selectedMatchId);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedMatchId]);

  const currentInnings =
    innings.length > 0
      ? innings[innings.length - 1]
      : null;

  const overs = currentInnings
    ? `${Math.floor(currentInnings.legalBalls / 6)}.${currentInnings.legalBalls % 6}`
    : "0.0";

  const runRate =
    currentInnings && currentInnings.legalBalls > 0
      ? (
          (currentInnings.totalRuns * 6) /
          currentInnings.legalBalls
        ).toFixed(2)
      : "0.00";

  const getBallLabel = (ball: BallDelivery) => {
    if (ball.wicket) return "W";

    if (ball.extraType === "WIDE") return `WD ${ball.totalRuns}`;
    if (ball.extraType === "NO_BALL") return `NB ${ball.totalRuns}`;

    if (ball.totalRuns === 0) return "0";

    return String(ball.totalRuns);
  };

  const getBallClass = (ball: BallDelivery) => {
    if (ball.wicket) return "recent-ball-wicket";
    if (ball.totalRuns === 4) return "recent-ball-four";
    if (ball.totalRuns === 6) return "recent-ball-six";
    if (ball.totalRuns === 0) return "recent-ball-dot";

    return "recent-ball-normal";
  };

  return (
    <div className="live-dashboard">

      <div className="live-dashboard-header">
        <div>
          <h2>Live Match Dashboard</h2>
          <p>Real-time cricket match updates</p>
        </div>

        <span className="live-indicator">
          ● LIVE UPDATES
        </span>
      </div>

      <div className="live-match-selector">
        <label>Select Match</label>

        <select
          value={selectedMatchId}
          onChange={(e) =>
            setSelectedMatchId(
              e.target.value ? Number(e.target.value) : ""
            )
          }
        >
          <option value="">Select Match</option>

          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="live-error">{error}</p>}

      {loading && <p>Loading match details...</p>}

      {!loading && !currentInnings && selectedMatchId !== "" && (
        <p>No innings data available for this match.</p>
      )}

      {currentInnings && (
        <>
          <div className="live-score-card">
            <div className="live-score-info">
              <span>{currentInnings.battingTeam}</span>

              <h1>
                {currentInnings.totalRuns}/
                {currentInnings.wickets}
              </h1>

              <p>
                Overs: {overs} / Run Rate: {runRate}
              </p>
            </div>

            <div className="live-innings-info">
              <p>Innings {currentInnings.inningsNumber}</p>
              <p>Status: {currentInnings.inningsStatus}</p>

              {currentInnings.target !== null && (
                <p>Target: {currentInnings.target}</p>
              )}
            </div>
          </div>

          <div className="live-info-grid">

            <div className="live-info-card">
              <h3>Batting Team</h3>
              <h2>{currentInnings.battingTeam}</h2>
            </div>

            <div className="live-info-card">
              <h3>Bowling Team</h3>
              <h2>{currentInnings.bowlingTeam}</h2>
            </div>

            <div className="live-info-card">
              <h3>Striker</h3>
              <h2>{currentInnings.currentStriker || "-"}</h2>
            </div>

            <div className="live-info-card">
              <h3>Non-Striker</h3>
              <h2>{currentInnings.currentNonStriker || "-"}</h2>
            </div>

            <div className="live-info-card">
              <h3>Current Bowler</h3>
              <h2>{currentInnings.currentBowler || "-"}</h2>
            </div>

            <div className="live-info-card">
              <h3>Run Rate</h3>
              <h2>{runRate}</h2>
            </div>

          </div>

          {/* RECENT BALLS */}

          <div className="recent-balls-section">
            <h3>Recent Balls</h3>
            <p>Last 6 deliveries</p>

            {recentBalls.length === 0 ? (
              <p>No ball history available.</p>
            ) : (
              <div className="recent-balls-list">
                {recentBalls.map((ball) => (
                  <div
                    key={ball.id}
                    className={`recent-ball ${getBallClass(ball)}`}
                  >
                    <strong>{getBallLabel(ball)}</strong>
                    <span>
                      {ball.overNumber}.{ball.ballNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}

export default LiveMatchDashboard;
