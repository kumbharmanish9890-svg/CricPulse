
import { useEffect, useState } from "react";
import matchHistoryService, {
  type MatchHistory as MatchHistoryType
} from "../services/matchHistoryService";

import "./MatchHistory.css";

export default function MatchHistory() {
  const [matches, setMatches] = useState<MatchHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await matchHistoryService.getCompletedMatches();
        setMatches(data);
      } catch {
        setError("Unable to load match history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="match-history-page">
      <div className="match-history-header">
        <div>
          <h1>Match History</h1>
          <p>View all completed cricket matches and results.</p>
        </div>

        <span className="history-count">
          {matches.length} Completed Matches
        </span>
      </div>

      {loading && <p>Loading match history...</p>}

      {error && <p className="history-error">{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <div className="history-empty">
          <h2>No Match History</h2>
          <p>Completed matches will appear here.</p>
        </div>
      )}

      <div className="history-list">
        {matches.map(match => (
          <div className="history-card" key={match.id}>
            <div className="history-card-top">
              <span>{match.matchFormat}</span>
              <span className="history-completed">
                {match.matchStatus}
              </span>
            </div>

            <h2>
              {match.team1} <span>vs</span> {match.team2}
            </h2>

            <p className="history-venue">
              {match.venue}
            </p>

            <div className="history-result">
              <span>🏆 Winner</span>
              <strong>{match.winner || "No winner"}</strong>
            </div>

            <div className="history-summary">
              {match.resultSummary || "Result unavailable"}
            </div>

            <div className="history-date">
              {new Date(match.matchDate).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
