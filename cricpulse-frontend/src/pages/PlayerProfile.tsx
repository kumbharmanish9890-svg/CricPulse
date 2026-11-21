
import { useEffect, useState } from "react";
import playerService, {
  type Player,
  type PlayerStatistics,
} from "../services/playerService";
import "./PlayerProfile.css";

    const API_BASE_URL = (
      import.meta.env.VITE_API_BASE_URL ||
      "https://cricpulse-api-gsr2.onrender.com/api"
    ).replace(/\/api\/?$/, "");
function formatValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "string") {
    return value.replaceAll("_", " ");
  }

  return value;
}

function PlayerProfile() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [statistics, setStatistics] = useState<PlayerStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setError("");
        const data = await playerService.getAll();
        setPlayers(data);

        if (data.length > 0) {
          setSelectedPlayer(String(data[0].id));
        }
      } catch {
        setError("Unable to load players.");
      }
    };

    loadPlayers();
  }, []);

  const player = players.find(
    (p) => String(p.id) === selectedPlayer
  );

  useEffect(() => {
    setImageFailed(false);

    if (!player) {
      setStatistics(null);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await playerService.getStatistics(player.playerName);
        setStatistics(data);
      } catch {
        setStatistics(null);
        setError("Unable to load player statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [player]);

  const imageUrl = player?.imageUrl
    ? player.imageUrl.startsWith("http")
      ? player.imageUrl
      : `${API_BASE_URL}${player.imageUrl.startsWith("/") ? "" : "/"}${player.imageUrl}`
    : "";

  return (
    <div className="player-profile-page">
      <h2>Player Profile Dashboard</h2>

      <p className="profile-subtitle">
        Complete player information and career performance
      </p>

      <div className="profile-selector">
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
        >
          {players.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.playerName}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading player profile...</p>}
      {error && <p className="profile-error">{error}</p>}

      {player && (
        <div className="profile-card">
          <div className="profile-header">
            {imageUrl && !imageFailed ? (
              <img
                src={imageUrl}
                alt={player.playerName}
                className="profile-photo"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="profile-photo-placeholder">
                {player.playerName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="profile-info">
              <h2>{player.playerName}</h2>
              <p>{player.team?.teamName || "Team not assigned"}</p>
              <span>{formatValue(player.playerRole)}</span>
            </div>
          </div>

          <div className="profile-details">
            <div>
              <label>Jersey Number</label>
              <strong>{formatValue(player.jerseyNumber)}</strong>
            </div>

            <div>
              <label>Nationality</label>
              <strong>{formatValue(player.nationality)}</strong>
            </div>

            <div>
              <label>Batting Style</label>
              <strong>{formatValue(player.battingStyle)}</strong>
            </div>

            <div>
              <label>Bowling Style</label>
              <strong>{formatValue(player.bowlingStyle)}</strong>
            </div>

            <div>
              <label>Team</label>
              <strong>{formatValue(player.team?.shortName)}</strong>
            </div>
          </div>
        </div>
      )}

      {statistics && (
        <>
          <h3>Career Performance</h3>

          <div className="profile-stats-grid">
            <div className="profile-stat">
              <label>Matches</label>
              <strong>{statistics.matchesPlayed}</strong>
            </div>

            <div className="profile-stat">
              <label>Total Runs</label>
              <strong>{statistics.runs}</strong>
            </div>

            <div className="profile-stat">
              <label>Highest Score</label>
              <strong>{statistics.highestScore}</strong>
            </div>

            <div className="profile-stat">
              <label>Batting Average</label>
              <strong>{statistics.battingAverage.toFixed(2)}</strong>
            </div>

            <div className="profile-stat">
              <label>Strike Rate</label>
              <strong>{statistics.strikeRate.toFixed(2)}</strong>
            </div>

            <div className="profile-stat">
              <label>Wickets</label>
              <strong>{statistics.wickets}</strong>
            </div>

            <div className="profile-stat">
              <label>Economy</label>
              <strong>{statistics.economy.toFixed(2)}</strong>
            </div>

            <div className="profile-stat">
              <label>Fours / Sixes</label>
              <strong>{statistics.fours} / {statistics.sixes}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PlayerProfile;
