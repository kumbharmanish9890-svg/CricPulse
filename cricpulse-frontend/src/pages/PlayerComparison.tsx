
import { useEffect, useState } from "react";
import playerService, {
  type Player,
  type PlayerStatistics,
} from "../services/playerService";
import "./PlayerComparison.css";

type MetricKey = keyof PlayerStatistics;

interface ComparisonMetric {
  label: string;
  key: MetricKey;
  lowerIsBetter?: boolean;
}

const battingMetrics: ComparisonMetric[] = [
  { label: "Matches Played", key: "matchesPlayed" },
  { label: "Innings Played", key: "inningsPlayed" },
  { label: "Total Runs", key: "runs" },
  { label: "Highest Score", key: "highestScore" },
  { label: "Batting Average", key: "battingAverage" },
  { label: "Strike Rate", key: "strikeRate" },
  { label: "Fours", key: "fours" },
  { label: "Sixes", key: "sixes" },
  { label: "Balls Faced", key: "ballsFaced" },
  { label: "Not Outs", key: "notOuts" },
];

const bowlingMetrics: ComparisonMetric[] = [
  { label: "Wickets", key: "wickets" },
  { label: "Runs Conceded", key: "runsConceded", lowerIsBetter: true },
  { label: "Balls Bowled", key: "ballsBowled" },
  { label: "Maidens", key: "maidens" },
  { label: "Economy", key: "economy", lowerIsBetter: true },
  { label: "Bowling Average", key: "bowlingAverage", lowerIsBetter: true },
];

function formatValue(value: number) {
  return Number.isInteger(value) ? value : value.toFixed(2);
}

function getLeader(
  value1: number,
  value2: number,
  lowerIsBetter = false,
  name1: string,
  name2: string
) {
  if (value1 === value2) return "Tie";

  if (lowerIsBetter) {
    return value1 < value2 ? name1 : name2;
  }

  return value1 > value2 ? name1 : name2;
}

function getBarWidths(
  value1: number,
  value2: number,
  lowerIsBetter = false
) {
  if (value1 === value2) return [50, 50];

  if (lowerIsBetter) {
    const best = Math.min(value1, value2);
    const worst = Math.max(value1, value2);

    if (best === 0 && worst === 0) return [50, 50];

    return value1 < value2
      ? [100, 35]
      : [35, 100];
  }

  const max = Math.max(value1, value2);

  if (max === 0) return [50, 50];

  return [
    (value1 / max) * 100,
    (value2 / max) * 100,
  ];
}

function PlayerComparison() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [stats1, setStats1] = useState<PlayerStatistics | null>(null);
  const [stats2, setStats2] = useState<PlayerStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setError("");

        const data = await playerService.getAll();

        const validPlayers = data.filter(
          (player) => player.id !== undefined && player.id !== null
        );

        setPlayers(validPlayers);

        if (validPlayers.length >= 2) {
          setPlayer1Id(String(validPlayers[0].id));
          setPlayer2Id(String(validPlayers[1].id));
        }
      } catch {
        setError("Unable to load players. Please try again.");
      }
    };

    loadPlayers();
  }, []);

  useEffect(() => {
    if (
      !player1Id ||
      !player2Id ||
      player1Id === player2Id
    ) {
      setStats1(null);
      setStats2(null);
      setLoading(false);
      return;
    }

    const player1 = players.find(
      (player) => String(player.id) === player1Id
    );

    const player2 = players.find(
      (player) => String(player.id) === player2Id
    );

    if (!player1 || !player2) return;

    let active = true;

    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError("");
        setStats1(null);
        setStats2(null);

        const [data1, data2] = await Promise.all([
          playerService.getStatistics(player1.playerName),
          playerService.getStatistics(player2.playerName),
        ]);

        if (active) {
          setStats1(data1);
          setStats2(data2);
        }
      } catch {
        if (active) {
          setStats1(null);
          setStats2(null);
          setError("Unable to load comparison statistics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      active = false;
    };
  }, [player1Id, player2Id, players]);

  const player1 = players.find(
    (player) => String(player.id) === player1Id
  );

  const player2 = players.find(
    (player) => String(player.id) === player2Id
  );

  const renderMetrics = (
    metrics: ComparisonMetric[],
    data1: PlayerStatistics,
    data2: PlayerStatistics,
    name1: string,
    name2: string
  ) => {
    return (
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Statistics</th>
              <th>{name1}</th>
              <th>{name2}</th>
              <th>Leader</th>
            </tr>
          </thead>

          <tbody>
            {metrics.map((metric) => {
              const value1 = data1[metric.key] as number;
              const value2 = data2[metric.key] as number;

              const leader = getLeader(
                value1,
                value2,
                metric.lowerIsBetter,
                name1,
                name2
              );

              const [width1, width2] = getBarWidths(
                value1,
                value2,
                metric.lowerIsBetter
              );

              return (
                <tr key={metric.key}>
                  <td className="comparison-metric-label">
                    {metric.label}
                    {metric.lowerIsBetter && (
                      <small> Lower is better</small>
                    )}
                  </td>

                  <td>
                    <div className="comparison-value">
                      {formatValue(value1)}
                    </div>
                    <div className="comparison-bar">
                      <div
                        className={`comparison-bar-fill ${
                          leader === name1 ? "player-one-bar" : ""
                        }`}
                        style={{ width: `${width1}%` }}
                      />
                    </div>
                  </td>

                  <td>
                    <div className="comparison-value">
                      {formatValue(value2)}
                    </div>
                    <div className="comparison-bar">
                      <div
                        className={`comparison-bar-fill ${
                          leader === name2 ? "player-two-bar" : ""
                        }`}
                        style={{ width: `${width2}%` }}
                      />
                    </div>
                  </td>

                  <td>
                    <span
                      className={`comparison-leader ${
                        leader === "Tie" ? "comparison-tie" : ""
                      }`}
                    >
                      {leader}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="player-comparison-page">
      <div className="comparison-page-heading">
        <div>
          <h2>Player Comparison Dashboard</h2>
          <p className="comparison-subtitle">
            Compare two players' completed-match career performance
          </p>
        </div>

        <div className="comparison-player-count">
          {players.length} Players Available
        </div>
      </div>

      <div className="comparison-selectors">
        <div>
          <label>Player 1</label>
          <select
            value={player1Id}
            onChange={(event) => setPlayer1Id(event.target.value)}
          >
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player.id} value={String(player.id)}>
                {player.playerName}
              </option>
            ))}
          </select>
        </div>

        <div className="vs-text">VS</div>

        <div>
          <label>Player 2</label>
          <select
            value={player2Id}
            onChange={(event) => setPlayer2Id(event.target.value)}
          >
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player.id} value={String(player.id)}>
                {player.playerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {players.length === 0 && !error && (
        <div className="comparison-message">
          No players available.
        </div>
      )}

      {players.length === 1 && (
        <div className="comparison-message">
          At least two players are required for comparison.
        </div>
      )}

      {player1Id === player2Id && player1Id && (
        <p className="comparison-error">
          Please select two different players.
        </p>
      )}

      {error && (
        <p className="comparison-error">{error}</p>
      )}

      {loading && (
        <div className="comparison-message">
          <div className="comparison-loader" />
          Loading player statistics...
        </div>
      )}

      {stats1 && stats2 && player1 && player2 && (
        <>
          <div className="comparison-player-cards">
            <div className="comparison-player-card player-one-card">
              <div className="comparison-avatar">
                {player1.playerName.charAt(0).toUpperCase()}
              </div>

              <h3>{player1.playerName}</h3>
              <p>{player1.team?.teamName || "No Team"}</p>

              <span>
                {player1.playerRole.replace(/_/g, " ")}
              </span>
            </div>

            <div className="comparison-player-card player-two-card">
              <div className="comparison-avatar">
                {player2.playerName.charAt(0).toUpperCase()}
              </div>

              <h3>{player2.playerName}</h3>
              <p>{player2.team?.teamName || "No Team"}</p>

              <span>
                {player2.playerRole.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="comparison-section">
            <h3 className="comparison-heading">
              <span>🏏</span> Batting Statistics
            </h3>

            {renderMetrics(
              battingMetrics,
              stats1,
              stats2,
              player1.playerName,
              player2.playerName
            )}
          </div>

          <div className="comparison-section">
            <h3 className="comparison-heading">
              <span>🎯</span> Bowling Statistics
            </h3>

            {renderMetrics(
              bowlingMetrics,
              stats1,
              stats2,
              player1.playerName,
              player2.playerName
            )}
          </div>

          <p className="comparison-note">
            * Statistics are calculated from completed matches only.
            For Economy and Bowling Average, a lower value is better.
          </p>
        </>
      )}
    </div>
  );
}

export default PlayerComparison;
