
import { useEffect, useState } from "react";

import playerService, {
  type Player,
  type PlayerStatistics as PlayerStatisticsType,
} from "../services/playerService";

import "./PlayerStatistics.css";

interface ChartItem {
  label: string;
  value: number;
}

function PerformanceChart({
  title,
  items,
}: {
  title: string;
  items: ChartItem[];
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <section className="performance-chart">
      <h3>{title}</h3>
      <p className="chart-description">
        Career performance overview
      </p>

      <div className="chart-bars">
        {items.map((item) => {
          const height =
            item.value === 0
              ? 0
              : Math.max(8, (item.value / maxValue) * 100);

          return (
            <div className="chart-column" key={item.label}>
              <strong className="chart-value">{item.value}</strong>

              <div className="chart-bar-area">
                <div
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>

              <span className="chart-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlayerStatistics() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [statistics, setStatistics] =
    useState<PlayerStatisticsType | null>(null);

  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoadingPlayers(true);
        setError("");

        const data = await playerService.getAll();
        setPlayers(data);

        if (data.length > 0) {
          const rohit = data.find(
            (player) =>
              player.playerName.toLowerCase() === "rohit sharma"
          );

          setSelectedPlayer(rohit?.playerName || data[0].playerName);
        } else {
          setError("No players found. Please add players first.");
        }
      } catch (err) {
        console.error("Players loading error:", err);
        setError("Unable to load players from database.");
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, []);

  const searchStatistics = async () => {
    if (!selectedPlayer) {
      setError("Please select a player.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatistics(null);

      const data = await playerService.getStatistics(selectedPlayer);
      setStatistics(data);
    } catch (err) {
      console.error("Player statistics error:", err);
      setError("Unable to load player statistics.");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
  }: {
    title: string;
    value: string | number;
  }) => (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );

  return (
    <div className="player-statistics-page">
      <div className="statistics-header">
        <div>
          <h1>Player Statistics</h1>
          <p>Batting and bowling performance overview</p>
        </div>
      </div>

      <div className="statistics-search">
        <select
          value={selectedPlayer}
          onChange={(e) => {
            setSelectedPlayer(e.target.value);
            setStatistics(null);
            setError("");
          }}
          disabled={loadingPlayers || players.length === 0}
        >
          {loadingPlayers && (
            <option value="">Loading players...</option>
          )}

          {!loadingPlayers && players.length === 0 && (
            <option value="">No players available</option>
          )}

          {players.map((player) => (
            <option
              key={player.id ?? player.playerName}
              value={player.playerName}
            >
              {player.playerName}
              {player.team?.shortName
                ? ` (${player.team.shortName})`
                : ""}
            </option>
          ))}
        </select>

        <button
          onClick={searchStatistics}
          disabled={loading || loadingPlayers || !selectedPlayer}
        >
          {loading ? "Searching..." : "Search Player"}
        </button>
      </div>

      {error && <p className="statistics-error">{error}</p>}

      {loading && (
        <p className="statistics-message">
          Loading statistics...
        </p>
      )}

      {statistics && !loading && (
        <>
          <div className="player-statistics-profile">
            <h2>{statistics.playerName}</h2>
            <p>Career Performance</p>
          </div>

          <h3>Batting Statistics</h3>

          <div className="statistics-grid">
            <StatCard title="Matches Played" value={statistics.matchesPlayed} />
            <StatCard title="Innings Played" value={statistics.inningsPlayed} />
            <StatCard title="Total Runs" value={statistics.runs} />
            <StatCard title="Highest Score" value={statistics.highestScore} />
            <StatCard title="Batting Average" value={statistics.battingAverage.toFixed(2)} />
            <StatCard title="Strike Rate" value={statistics.strikeRate.toFixed(2)} />
            <StatCard title="Balls Faced" value={statistics.ballsFaced} />
            <StatCard title="Fours" value={statistics.fours} />
            <StatCard title="Sixes" value={statistics.sixes} />
            <StatCard title="Not Outs" value={statistics.notOuts} />
          </div>

          <PerformanceChart
            title="Batting Performance Chart"
            items={[
              { label: "Runs", value: statistics.runs },
              { label: "Highest", value: statistics.highestScore },
              { label: "Fours", value: statistics.fours },
              { label: "Sixes", value: statistics.sixes },
              { label: "Balls", value: statistics.ballsFaced },
            ]}
          />

          <h3>Bowling Statistics</h3>

          <div className="statistics-grid">
            <StatCard title="Wickets" value={statistics.wickets} />
            <StatCard title="Runs Conceded" value={statistics.runsConceded} />
            <StatCard title="Balls Bowled" value={statistics.ballsBowled} />
            <StatCard title="Maidens" value={statistics.maidens} />
            <StatCard title="Economy" value={statistics.economy.toFixed(2)} />
            <StatCard title="Bowling Average" value={statistics.bowlingAverage.toFixed(2)} />
          </div>

          <PerformanceChart
            title="Bowling Performance Chart"
            items={[
              { label: "Wickets", value: statistics.wickets },
              { label: "Runs", value: statistics.runsConceded },
              { label: "Balls", value: statistics.ballsBowled },
              { label: "Maidens", value: statistics.maidens },
              { label: "Economy", value: statistics.economy },
            ]}
          />
        </>
      )}
    </div>
  );
}

export default PlayerStatistics;
