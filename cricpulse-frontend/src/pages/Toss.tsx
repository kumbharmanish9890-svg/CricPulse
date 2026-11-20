
import { useEffect, useState } from "react";
import api from "../services/api";
import tossService, { type Toss } from "../services/tossService";
import "./Toss.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchFormat: string;
}

function TossPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState<number>(0);
  const [tossWinner, setTossWinner] = useState("");
  const [tossDecision, setTossDecision] = useState<"BAT" | "BOWL">("BAT");
  const [currentToss, setCurrentToss] = useState<Toss | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (matchId) {
      loadToss(matchId);
    }
  }, [matchId]);

  const loadMatches = async () => {
    try {
      const response = await api.get<Match[]>("/matches");
      setMatches(response.data);

      if (response.data.length > 0) {
        setMatchId(response.data[0].id);
      }
    } catch {
      setError("Unable to load matches.");
    }
  };

  const loadToss = async (id: number) => {
    setCurrentToss(null);
    setMessage("");
    setError("");

    try {
      const data = await tossService.getToss(id);
      setCurrentToss(data);
    } catch {
      // No toss has been recorded for this match yet.
      setCurrentToss(null);
    }
  };

  const handleSaveToss = async () => {
    if (!matchId || !tossWinner) {
      setError("Please select a match and toss winner.");
      return;
    }

    try {
      await tossService.saveToss(matchId, tossWinner, tossDecision);
      setMessage("Toss saved successfully!");
      setError("");
      await loadToss(matchId);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Unable to save toss. Please check your permissions."
      );
      setMessage("");
    }
  };

  const selectedMatch = matches.find((m) => m.id === matchId);

  return (
    <div className="toss-page">
      <div className="toss-header">
        <h2>Toss Management</h2>
        <p>Manage match toss winner and decision</p>
      </div>

      <div className="toss-panel">
        <h3>Select Match</h3>

        <select
          value={matchId}
          onChange={(e) => {
            setMatchId(Number(e.target.value));
            setTossWinner("");
          }}
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2}
            </option>
          ))}
        </select>

        {selectedMatch && (
          <div className="toss-match-info">
            <p><strong>Match:</strong> {selectedMatch.team1} vs {selectedMatch.team2}</p>
            <p><strong>Venue:</strong> {selectedMatch.venue}</p>
            <p><strong>Format:</strong> {selectedMatch.matchFormat}</p>
          </div>
        )}

        <div className="toss-form">
          <label>Toss Winner</label>
          <select
            value={tossWinner}
            onChange={(e) => setTossWinner(e.target.value)}
          >
            <option value="">Select Toss Winner</option>
            {selectedMatch && (
              <>
                <option value={selectedMatch.team1}>{selectedMatch.team1}</option>
                <option value={selectedMatch.team2}>{selectedMatch.team2}</option>
              </>
            )}
          </select>

          <label>Decision</label>
          <select
            value={tossDecision}
            onChange={(e) =>
              setTossDecision(e.target.value as "BAT" | "BOWL")
            }
          >
            <option value="BAT">Bat First</option>
            <option value="BOWL">Bowl First</option>
          </select>

          <button
            type="button"
            onClick={handleSaveToss}
            disabled={!selectedMatch || !tossWinner || !!currentToss}
          >
            Save Toss
          </button>
        </div>

        {message && <p className="toss-success">{message}</p>}
        {error && <p className="toss-error">{error}</p>}
      </div>

      {currentToss && (
        <div className="toss-result">
          <h3>Recorded Toss Result</h3>
          <p><strong>Winner:</strong> {currentToss.tossWinner}</p>
          <p>
            <strong>Decision:</strong>{" "}
            {currentToss.tossDecision === "BAT" ? "Bat First" : "Bowl First"}
          </p>
        </div>
      )}
    </div>
  );
}

export default TossPage;
