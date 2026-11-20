
import { useEffect, useState } from "react";
import api from "../services/api";
import matchSquadService, {
  type MatchSquad
} from "../services/matchSquadService";
import playerService, {
  type Player
} from "../services/playerService";
import "./MatchSquad.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchFormat: string;
}

function MatchSquadPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [squad, setSquad] = useState<MatchSquad[]>([]);

  const [matchId, setMatchId] = useState<number>(0);
  const [playerId, setPlayerId] = useState<number>(0);
  const [playing, setPlaying] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [matchData, playerData] = await Promise.all([
        api.get<Match[]>("/matches"),
        playerService.getAll()
      ]);

      setMatches(matchData.data);
      setPlayers(playerData);

      if (matchData.data.length > 0) {
        setMatchId(matchData.data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load matches or players.");
    }
  };

  const loadSquad = async (id: number) => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await matchSquadService.getAll(id);
      setSquad(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load match squad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      setError("");
      setMessage("");
      loadSquad(matchId);
    }
  }, [matchId]);

  const handleAddPlayer = async () => {
    if (!matchId || !playerId) {
      setError("Please select a match and player.");
      return;
    }

    try {
      setError("");
      setMessage("");

      await matchSquadService.addPlayer(
        matchId,
        playerId,
        playing
      );

      setMessage("Player added to match squad successfully!");
      setPlayerId(0);

      await loadSquad(matchId);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to add player. Check the selected player and match."
      );
    }
  };

  const handleSetCaptain = async (item: MatchSquad) => {
    try {
      setError("");
      setMessage("");

      await matchSquadService.updateRoles(
        item.id!,
        true,
        item.wicketKeeper
      );

      setMessage(`${item.player.playerName} set as Captain.`);
      await loadSquad(matchId);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to set Captain. Player must be in Playing XI."
      );
    }
  };

  const handleSetWicketKeeper = async (item: MatchSquad) => {
    try {
      setError("");
      setMessage("");

      await matchSquadService.updateRoles(
        item.id!,
        item.captain,
        true
      );

      setMessage(`${item.player.playerName} set as Wicket Keeper.`);
      await loadSquad(matchId);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Unable to set Wicket Keeper. Player must be in Playing XI."
      );
    }
  };

  const selectedMatch = matches.find(
    (match) => match.id === matchId
  );

  return (
    <div className="match-squad-page">

      <div className="squad-header">
        <div>
          <h2>Match Squad Management</h2>
          <p>Select Playing XI, Bench, Captain and Wicket Keeper.</p>
        </div>
      </div>

      {message && <div className="squad-success">{message}</div>}
      {error && <div className="squad-error">{error}</div>}

      <div className="squad-panel">
        <h3>Select Match</h3>

        <select
          value={matchId}
          onChange={(e) => setMatchId(Number(e.target.value))}
        >
          <option value={0}>Select Match</option>

          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.team1} vs {match.team2}
            </option>
          ))}
        </select>

        {selectedMatch && (
          <p className="selected-match-info">
            {selectedMatch.team1} vs {selectedMatch.team2}
            {" | "}
            {selectedMatch.venue}
            {" | "}
            {selectedMatch.matchFormat}
          </p>
        )}
      </div>

      <div className="squad-panel">
        <h3>Add Player to Squad</h3>

        <div className="squad-add-form">
          <select
            value={playerId}
            onChange={(e) => setPlayerId(Number(e.target.value))}
          >
            <option value={0}>Select Player</option>

            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.playerName} - {player.team?.teamName}
              </option>
            ))}
          </select>

          <label className="playing-checkbox">
            <input
              type="checkbox"
              checked={playing}
              onChange={(e) => setPlaying(e.target.checked)}
            />
            Add to Playing XI
          </label>

          <button
            type="button"
            onClick={handleAddPlayer}
            disabled={!matchId || !playerId}
          >
            Add Player
          </button>
        </div>
      </div>

      <div className="squad-panel">
        <h3>Match Squad ({squad.length})</h3>

        {loading ? (
          <p>Loading squad...</p>
        ) : squad.length === 0 ? (
          <p>No players added to this match yet.</p>
        ) : (
          <div className="squad-grid">
            {squad.map((item) => (
              <div className="squad-player-card" key={item.id}>
                <div className="squad-player-top">
                  <span className="squad-jersey">
                    #{item.player.jerseyNumber}
                  </span>

                  <span className={item.playing ? "playing-tag" : "bench-tag"}>
                    {item.playing ? "PLAYING XI" : "BENCH"}
                  </span>
                </div>

                <h3>{item.player.playerName}</h3>

                <p>{item.player.team?.teamName}</p>
                <p>{item.player.playerRole}</p>

                {item.captain && (
                  <span className="role-tag">Captain</span>
                )}

                {item.wicketKeeper && (
                  <span className="role-tag">Wicket Keeper</span>
                )}

                {item.playing && (
                  <div className="squad-role-actions">
                    <button
                      type="button"
                      onClick={() => handleSetCaptain(item)}
                    >
                      Set Captain
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetWicketKeeper(item)}
                    >
                      Set WK
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default MatchSquadPage;
