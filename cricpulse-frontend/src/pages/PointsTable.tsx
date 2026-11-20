
import { useEffect, useState } from "react";
import {
  getPointsTable,
  type PointsTableEntry,
} from "../services/pointsTableService";
import "./PointsTable.css";

function PointsTable() {
  const [tournamentId, setTournamentId] = useState(1);
  const [points, setPoints] = useState<PointsTableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPointsTable(tournamentId);
        setPoints(data);
      } catch (err) {
        console.error("Points Table Error:", err);
        setError("Unable to load Points Table.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [tournamentId]);

  const sortedPoints = [...points].sort(
    (a, b) =>
      b.points - a.points ||
      b.netRunRate - a.netRunRate
  );

  const totalTeams = points.length;

  const totalMatches = points.reduce(
    (sum, item) => sum + item.matchesPlayed,
    0
  ) / 2;

  const totalPoints = points.reduce(
    (sum, item) => sum + item.points,
    0
  );

  const topTeam = sortedPoints[0];

  const bestNRR = points.length
    ? Math.max(...points.map((item) => item.netRunRate))
    : 0;

  return (
    <div className="points-page">

      <div className="points-header">
        <div>
          <h1>🏆 Points Table Analytics</h1>
          <p>Tournament standings and team performance</p>
        </div>

        <select
          value={tournamentId}
          onChange={(e) => setTournamentId(Number(e.target.value))}
        >
          <option value={1}>CricPulse Premier League</option>
        </select>
      </div>

      {loading && <p>Loading Points Table...</p>}

      {error && <p className="points-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="points-analytics-grid">

            <div className="points-analytics-card">
              <h3>Total Teams</h3>
              <h2>{totalTeams}</h2>
            </div>

            <div className="points-analytics-card">
              <h3>Matches Played</h3>
              <h2>{totalMatches}</h2>
            </div>

            <div className="points-analytics-card">
              <h3>Total Points</h3>
              <h2>{totalPoints}</h2>
            </div>

            <div className="points-analytics-card">
              <h3>Top Ranked Team</h3>
              <h2 className="points-top-team">
                {topTeam?.team?.shortName ?? "-"}
              </h2>
            </div>

            <div className="points-analytics-card">
              <h3>Best NRR</h3>
              <h2>{bestNRR.toFixed(3)}</h2>
            </div>

          </div>

          <div className="points-table-container">

            <table className="points-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>L</th>
                  <th>T</th>
                  <th>NR</th>
                  <th>NRR</th>
                  <th>Pts</th>
                </tr>
              </thead>

              <tbody>
                {sortedPoints.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      No Points Table data available.
                    </td>
                  </tr>
                ) : (
                  sortedPoints.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        {index === 0 ? "🥇" : index + 1}
                      </td>

                      <td className="points-team">
                        {item.team?.teamName ?? "Unknown Team"}
                      </td>

                      <td>{item.matchesPlayed}</td>
                      <td>{item.wins}</td>
                      <td>{item.losses}</td>
                      <td>{item.ties}</td>
                      <td>{item.noResults}</td>

                      <td>
                        {Number(item.netRunRate ?? 0).toFixed(3)}
                      </td>

                      <td className="points-total">
                        {item.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        </>
      )}

    </div>
  );
}

export default PointsTable;
