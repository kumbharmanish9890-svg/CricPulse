
import { useEffect, useState, useCallback } from "react";
import MatchHighlights from "./MatchHighlights";
import "./MatchHighlights.css";
import MatchRecords from "./MatchRecords";
import "./MatchRecords.css";
import PlayerOfTheMatch from "./PlayerOfTheMatch";
import "./PlayerOfTheMatch.css";
import MatchTimeline from "./MatchTimeline";
import "./MatchTimeline.css";
import FallOfWicketsPartnerships from "./FallOfWicketsPartnerships";
import "./FallOfWicketsPartnerships.css";
import MatchSummary from "./MatchSummary";
import "./MatchSummary.css";

import scoringService, {
  type Innings,
  type BallDelivery
} from "../services/scoringService";

import ScoringPanel from "./ScoringPanel";
import Scorecard from "./Scorecard";

import "./LiveScore.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchFormat: string;
  matchStatus: string;
  winner?: string | null;
  resultSummary?: string | null;
}

// Generate readable commentary for each delivery
function getCommentary(ball: BallDelivery): string {
  if (ball.wicket) {
    return `${ball.dismissedPlayer || ball.batsman} is OUT! ${
      ball.wicketType || "WICKET"
    }`;
  }

  switch (ball.extraType) {
    case "WIDE":
      return `Wide ball! ${ball.totalRuns} extra run(s).`;

    case "NO_BALL":
      return `No ball! ${ball.totalRuns} run(s) added.`;

    case "BYE":
      return `${ball.extraRuns} bye run(s).`;

    case "LEG_BYE":
      return `${ball.extraRuns} leg-bye run(s).`;

    default:
      if (ball.runs === 6) return `${ball.batsman} hits a SIX!`;
      if (ball.runs === 4) return `${ball.batsman} hits a FOUR!`;
      if (ball.runs === 0) return "Dot ball!";

      return `${ball.batsman} scores ${ball.runs} run(s).`;
  }
}

export default function LiveScore() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number>(0);
  const [innings, setInnings] = useState<Innings[]>([]);
  const [selectedInnings, setSelectedInnings] = useState<number>(0);
  const [balls, setBalls] = useState<BallDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load matches
  const loadMatches = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/matches");

      if (!response.ok) {
        throw new Error("Matches load failed");
      }

      const data: Match[] = await response.json();
      setMatches(data);

      if (data.length > 0) {
        setSelectedMatch(current =>
          data.some(match => match.id === current)
            ? current
            : data[0].id
        );
      }
    } catch {
      setError("Unable to load matches.");
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Load innings
  const loadInnings = useCallback(async () => {
    if (!selectedMatch) return;

    setLoading(true);
    setError("");

    try {
      const data = await scoringService.getInnings(selectedMatch);
      setInnings(data);

      if (data.length > 0) {
        setSelectedInnings(current =>
          data.some(item => item.id === current)
            ? current
            : data[0].id
        );
      } else {
        setSelectedInnings(0);
        setBalls([]);
      }
    } catch {
      setError("Unable to load innings.");
    } finally {
      setLoading(false);
    }
  }, [selectedMatch]);

  useEffect(() => {
    loadInnings();
  }, [loadInnings]);

  // Load ball history
  const loadBalls = useCallback(async () => {
    if (!selectedInnings) return;

    try {
      const data = await scoringService.getBallHistory(selectedInnings);
      setBalls(data);
    } catch {
      setError("Unable to load ball history.");
    }
  }, [selectedInnings]);

  useEffect(() => {
    if (!selectedInnings) return;

    loadBalls();

    const interval = window.setInterval(loadBalls, 5000);

    return () => window.clearInterval(interval);
  }, [selectedInnings, loadBalls]);

  // Refresh after recording a ball
  const handleScoreUpdate = async () => {
    await loadInnings();
    await loadBalls();
    await loadMatches();
  };

  const currentInnings = innings.find(
    item => item.id === selectedInnings
  );

  const currentMatch = matches.find(
    match => match.id === selectedMatch
  );

  // Match status
  const isMatchCompleted =
    currentMatch?.matchStatus === "COMPLETED";

  const isInningsLive = innings.some(
    item => item.inningsStatus === "IN_PROGRESS"
  );

  const displayStatus = isMatchCompleted
    ? "COMPLETED"
    : isInningsLive
    ? "LIVE"
    : currentMatch?.matchStatus || "UPCOMING";

  // Current Over Summary
  const currentOverNumber =
    balls.length > 0
      ? Math.max(...balls.map(ball => ball.overNumber))
      : 0;

  const currentOverBalls = balls
    .filter(ball => ball.overNumber === currentOverNumber)
    .sort((a, b) => a.ballNumber - b.ballNumber);

  function getBallDisplay(ball: BallDelivery): string {
    if (ball.wicket) return "W";

    switch (ball.extraType) {
      case "WIDE":
        return "WD";
      case "NO_BALL":
        return "NB";
      case "BYE":
        return "B";
      case "LEG_BYE":
        return "LB";
      default:
        return String(ball.runs);
    }
  }

  const overs = currentInnings
    ? `${Math.floor(currentInnings.legalBalls / 6)}.${currentInnings.legalBalls % 6}`
    : "0.0";

  const runRate =
    currentInnings && currentInnings.legalBalls > 0
      ? (
          currentInnings.totalRuns /
          (currentInnings.legalBalls / 6)
        ).toFixed(2)
      : "0.00";

  return (
    <div className="live-score-page">

      <div className="live-score-header">
        <div>
          <h1>Live Score Center</h1>
          <p>Real-time cricket match updates</p>
        </div>

        <span className="live-indicator">
          ● {displayStatus}
        </span>
      </div>

      <div className="live-match-selector">
        <label>Select Match</label>

        <select
          value={selectedMatch}
          onChange={e => setSelectedMatch(Number(e.target.value))}
        >
          {matches.map(match => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="live-error">{error}</p>}

      {loading && <p>Loading score...</p>}

      {!loading && currentInnings && (
        <>
          <div className="live-score-card">
            <div className="live-score-teams">
              <h2>{currentInnings.battingTeam}</h2>
              <span>vs {currentInnings.bowlingTeam}</span>
            </div>

            <div className="live-score-number">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </div>

            <div className="live-score-details">
              <div>
                <span>Overs</span>
                <strong>{overs}</strong>
              </div>

                    {currentInnings.target != null && (
              <div>
                <span>Target</span>
                <strong>{currentInnings.target}</strong>
              </div>
            )}
              <div>
                <span>Run Rate</span>
                <strong>{runRate}</strong>
              </div>

              <div>
                <span>Innings</span>
                <strong>{currentInnings.inningsNumber}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{currentInnings.inningsStatus}</strong>
              </div>
            </div>
          </div>

          {/* MATCH RESULT CARD */}
          {isMatchCompleted && (
            <div className="match-result-card">
              <h2>🏆 Match Result</h2>

              <h3>
                {currentMatch?.winner === "TIE"
                  ? "MATCH TIED"
                  : `${currentMatch?.winner || "Winner not available"} WON`}
              </h3>

              <p>
                {currentMatch?.resultSummary || "Match completed."}
              </p>

              <span className="match-completed-label">
                COMPLETED
              </span>
            </div>
          )}

          <div className="live-innings-selector">
            <label>Select Innings</label>

            <select
              value={selectedInnings}
              onChange={e => setSelectedInnings(Number(e.target.value))}
            >
              {innings.map(item => (
                <option key={item.id} value={item.id}>
                  Innings {item.inningsNumber} - {item.battingTeam}
                </option>
              ))}
            </select>
          </div>

          {/* SCORING PANEL */}
          {!isMatchCompleted && (
            <ScoringPanel
              innings={currentInnings}
              balls={balls}
              onScoreUpdate={handleScoreUpdate}
            />
          )}

          {/* CURRENT OVER SUMMARY */}
          <div className="current-over-card">
            <h2>Current Over - {currentOverNumber}</h2>

            {currentOverBalls.length === 0 ? (
              <p>No balls recorded yet.</p>
            ) : (
              <>
                <div className="current-over-balls">
                  {currentOverBalls.map(ball => (
                    <div
                      key={ball.id}
                      className={`over-ball ${
                        ball.wicket
                          ? "over-wicket"
                          : ball.runs === 4
                          ? "over-four"
                          : ball.runs === 6
                          ? "over-six"
                          : ""
                      }`}
                    >
                      {getBallDisplay(ball)}
                    </div>
                  ))}
                </div>
{currentMatch && (
  <MatchSummary

    team1={currentMatch.team1}
    team2={currentMatch.team2}
    matchStatus={currentMatch.matchStatus}
    innings={innings}
  />
)}
                <p>
                  Runs in this over:{" "}
                  <strong>
                    {currentOverBalls.reduce(
                      (total, ball) => total + ball.totalRuns,
                      0
                    )}
                  </strong>
                </p>
              </>
            )}
          </div>

          {/* BATTING SCORECARD AND BOWLING FIGURES */}
          <Scorecard balls={balls} />

          <MatchHighlights balls={balls} />

          <MatchRecords balls={balls} />
          <PlayerOfTheMatch balls={balls} />

          {/* BALL-BY-BALL COMMENTARY */}
          <div className="live-history-card">
            <h2>Ball-by-Ball Commentary</h2>
            <MatchTimeline balls={balls} />
            <FallOfWicketsPartnerships balls={balls} />

            {balls.length === 0 ? (
              <p>No deliveries recorded yet.</p>
            ) : (
              [...balls].reverse().map(ball => (
                <div className="live-ball-row" key={ball.id}>
                  <div className="live-ball-number">
                    {ball.overNumber}.{ball.ballNumber}
                  </div>

                  <div className="live-ball-info">
                    <strong>{ball.batsman}</strong>

                    <span>
                      {ball.bowler} · {getCommentary(ball)}
                    </span>
                  </div>

                  <div
                    className={`live-ball-result ${
                      ball.wicket
                        ? "wicket"
                        : ball.totalRuns === 4
                        ? "four"
                        : ball.totalRuns === 6
                        ? "six"
                        : ""
                    }`}
                  >
                    {ball.wicket ? "W" : ball.totalRuns}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {!loading && selectedMatch > 0 && innings.length === 0 && (
        <p>No innings created for this match yet.</p>
      )}

    </div>
  );
}
