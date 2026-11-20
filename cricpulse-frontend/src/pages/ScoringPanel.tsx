
import { useEffect, useState } from "react";
import api from "../services/api";
import scoringService, {
  type BallDelivery,
  type BallInput,
  type Innings
} from "../services/scoringService";
import playerService, { type Player } from "../services/playerService";
import "./ScoringPanel.css";

type ScoringInnings = Innings & {
  currentStriker?: string;
  currentNonStriker?: string;
  currentBowler?: string;
};

interface Props {
  innings: ScoringInnings;
  balls: BallDelivery[];
  onScoreUpdate: () => void;
}

export default function ScoringPanel({
  innings,
  balls,
  onScoreUpdate
}: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [bowler, setBowler] = useState("");

  const [runs, setRuns] = useState(0);
  const [extraType, setExtraType] = useState("NONE");
  const [extraRuns, setExtraRuns] = useState(0);
  const [wicket, setWicket] = useState(false);
  const [wicketType, setWicketType] = useState("BOWLED");
  const [dismissedPlayer, setDismissedPlayer] = useState("");

  const [saving, setSaving] = useState(false);
  const [savingPlayers, setSavingPlayers] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const canScore = role === "ADMIN" || role === "SCORER";

  // Load players
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await playerService.getAll();
        setPlayers(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load players.");
      }
    };

    loadPlayers();
  }, []);

  // Restore saved players from database
  useEffect(() => {
    setStriker(innings.currentStriker || "");
    setNonStriker(innings.currentNonStriker || "");
    setBowler(innings.currentBowler || "");
  }, [
    innings.id,
    innings.currentStriker,
    innings.currentNonStriker,
    innings.currentBowler
  ]);

  const battingPlayers = players.filter(
    player => player.team?.teamName === innings.battingTeam
  );

  const bowlingPlayers = players.filter(
    player => player.team?.teamName === innings.bowlingTeam
  );

  // Save Striker, Non-Striker and Bowler
  const handleSavePlayers = async () => {
    setError("");
    setMessage("");

    if (!striker || !nonStriker || !bowler) {
      setError("Please select all three players.");
      return;
    }

    if (striker === nonStriker) {
      setError("Striker and Non-Striker must be different.");
      return;
    }

    setSavingPlayers(true);

    try {
      await api.put(`/innings/${innings.id}/players`, {
        currentStriker: striker,
        currentNonStriker: nonStriker,
        currentBowler: bowler
      });

      setMessage("Players saved successfully!");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Unable to save players."
      );
    } finally {
      setSavingPlayers(false);
    }
  };

  // Batting statistics
  const batsmanStats = balls
    .filter(ball => ball.batsman === striker)
    .reduce(
      (stats, ball) => ({
        runs: stats.runs + (ball.runs || 0),
        balls: stats.balls + (ball.extraType === "WIDE" ? 0 : 1),
        fours: stats.fours + (ball.runs === 4 ? 1 : 0),
        sixes: stats.sixes + (ball.runs === 6 ? 1 : 0)
      }),
      { runs: 0, balls: 0, fours: 0, sixes: 0 }
    );

  // Bowling statistics
  const bowlerStats = balls
    .filter(ball => ball.bowler === bowler)
    .reduce(
      (stats, ball) => ({
        runs:
          stats.runs +
          (ball.extraType === "BYE" || ball.extraType === "LEG_BYE"
            ? 0
            : ball.totalRuns || 0),
        balls: stats.balls + (ball.legalDelivery ? 1 : 0),
        wickets:
          stats.wickets +
          (ball.wicket && ball.wicketType !== "RUN_OUT" ? 1 : 0)
      }),
      { runs: 0, balls: 0, wickets: 0 }
    );

  const strikeRate =
    batsmanStats.balls > 0
      ? ((batsmanStats.runs / batsmanStats.balls) * 100).toFixed(2)
      : "0.00";

  const economy =
    bowlerStats.balls > 0
      ? (bowlerStats.runs / (bowlerStats.balls / 6)).toFixed(2)
      : "0.00";

  // Record delivery
  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!striker || !nonStriker || !bowler) {
      setError("Please select and save all players first.");
      return;
    }

    if (wicket && !dismissedPlayer) {
      setError("Please select dismissed player.");
      return;
    }

    const ball: BallInput = {
      batsman: striker,
      bowler,
      runs,
      extraRuns: extraType === "NONE" ? 0 : extraRuns,
      extraType,
      wicket,
      ...(wicket ? { wicketType, dismissedPlayer } : {})
    };

    setSaving(true);

    try {
      await scoringService.addBall(innings.id, ball);

      setMessage("Ball recorded successfully!");

      setRuns(0);
      setExtraType("NONE");
      setExtraRuns(0);
      setWicket(false);
      setDismissedPlayer("");

      onScoreUpdate();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Unable to record ball. Please check your inputs."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canScore) {
    return null;
  }

  return (
    <section className="scoring-panel">
      <div className="scoring-panel-heading">
        <div>
          <h2>Ball-by-Ball Scoring</h2>
          <p>Record the next delivery</p>
        </div>
        <span className="scorer-badge">SCORER PANEL</span>
      </div>

      {message && <p className="scoring-success">{message}</p>}
      {error && <p className="scoring-error">{error}</p>}

      <h3>Select Match Players</h3>

      <div className="scoring-form-grid">
        <label>
          Striker
          <select
            value={striker}
            onChange={e => setStriker(e.target.value)}
          >
            <option value="">Select Striker</option>
            {battingPlayers.map(player => (
              <option key={player.id} value={player.playerName}>
                {player.playerName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Non-Striker
          <select
            value={nonStriker}
            onChange={e => setNonStriker(e.target.value)}
          >
            <option value="">Select Non-Striker</option>
            {battingPlayers.map(player => (
              <option key={player.id} value={player.playerName}>
                {player.playerName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Bowler
          <select
            value={bowler}
            onChange={e => setBowler(e.target.value)}
          >
            <option value="">Select Bowler</option>
            {bowlingPlayers.map(player => (
              <option key={player.id} value={player.playerName}>
                {player.playerName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className="record-ball-button"
        onClick={handleSavePlayers}
        disabled={savingPlayers || innings.inningsStatus !== "IN_PROGRESS"}
      >
        {savingPlayers ? "Saving Players..." : "Save Players"}
      </button>

      {striker && (
        <div className="player-live-stats">
          <h3>🏏 {striker} - Striker</h3>
          <p>
            Runs: <strong>{batsmanStats.runs}</strong> |
            Balls: <strong>{batsmanStats.balls}</strong> |
            4s: <strong>{batsmanStats.fours}</strong> |
            6s: <strong>{batsmanStats.sixes}</strong> |
            SR: <strong>{strikeRate}</strong>
          </p>
        </div>
      )}

      {nonStriker && (
        <div className="player-live-stats">
          <h3>🏏 {nonStriker} - Non-Striker</h3>
        </div>
      )}

      {bowler && (
        <div className="player-live-stats">
          <h3>🎯 {bowler} - Bowling</h3>
          <p>
            Overs: <strong>
              {Math.floor(bowlerStats.balls / 6)}.{bowlerStats.balls % 6}
            </strong> |
            Runs: <strong>{bowlerStats.runs}</strong> |
            Wickets: <strong>{bowlerStats.wickets}</strong> |
            Economy: <strong>{economy}</strong>
          </p>
        </div>
      )}

      <div className="scoring-control">
        <h3>Runs scored</h3>
        <div className="run-buttons">
          {[0, 1, 2, 3, 4, 5, 6].map(value => (
            <button
              type="button"
              key={value}
              className={runs === value ? "selected" : ""}
              onClick={() => setRuns(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="scoring-form-grid">
        <label>
          Extra Type
          <select
            value={extraType}
            onChange={e => {
              setExtraType(e.target.value);
              setExtraRuns(e.target.value === "NONE" ? 0 : 1);
            }}
          >
            <option value="NONE">No Extra</option>
            <option value="WIDE">Wide</option>
            <option value="NO_BALL">No Ball</option>
            <option value="BYE">Bye</option>
            <option value="LEG_BYE">Leg Bye</option>
          </select>
        </label>

        <label>
          Extra Runs
          <input
            type="number"
            min="0"
            value={extraRuns}
            disabled={extraType === "NONE"}
            onChange={e => setExtraRuns(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="scoring-wicket">
        <label className="wicket-checkbox">
          <input
            type="checkbox"
            checked={wicket}
            onChange={e => setWicket(e.target.checked)}
          />
          Wicket
        </label>

        {wicket && (
          <div className="scoring-form-grid">
            <label>
              Wicket Type
              <select
                value={wicketType}
                onChange={e => setWicketType(e.target.value)}
              >
                <option value="BOWLED">Bowled</option>
                <option value="CAUGHT">Caught</option>
                <option value="LBW">LBW</option>
                <option value="RUN_OUT">Run Out</option>
                <option value="STUMPED">Stumped</option>
                <option value="HIT_WICKET">Hit Wicket</option>
              </select>
            </label>

            <label>
              Dismissed Player
              <select
                value={dismissedPlayer}
                onChange={e => setDismissedPlayer(e.target.value)}
              >
                <option value="">Select Player</option>
                {[striker, nonStriker]
                  .filter(Boolean)
                  .map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <button
        type="button"
        className="record-ball-button"
        onClick={handleSubmit}
        disabled={
          saving ||
          innings.inningsStatus !== "IN_PROGRESS" ||
          !striker ||
          !nonStriker ||
          !bowler
        }
      >
        {saving ? "Recording..." : "Record Ball"}
      </button>
    </section>
  );
}
