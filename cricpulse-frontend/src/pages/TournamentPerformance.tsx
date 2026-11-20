
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import tournamentService, {
  type Tournament
} from "../services/tournamentService";

import {
  getPointsTable,
  type PointsTableEntry
} from "../services/pointsTableService";

import "./TournamentPerformance.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function TournamentPerformance() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentId, setTournamentId] = useState<number>(1);
  const [points, setPoints] = useState<PointsTableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const data = await tournamentService.getAll();
        setTournaments(data);

        if (data.length > 0 && data[0].id) {
          setTournamentId(data[0].id);
        }
      } catch (err) {
        console.error("Tournament loading error:", err);
        setError("Unable to load tournaments.");
      }
    };

    loadTournaments();
  }, []);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPointsTable(tournamentId);
        setPoints(data);
      } catch (err) {
        console.error("Performance loading error:", err);
        setError("Unable to load tournament performance.");
        setPoints([]);
      } finally {
        setLoading(false);
      }
    };

    loadPoints();
  }, [tournamentId]);

  const sortedPoints = [...points].sort(
    (a, b) => b.points - a.points || b.netRunRate - a.netRunRate
  );

  const labels = sortedPoints.map(
    (item) => item.team?.shortName ?? "Unknown"
  );

  const pointsData = {
    labels,
    datasets: [
      {
        label: "Points",
        data: sortedPoints.map((item) => item.points),
        backgroundColor: "#3b82f6",
        borderRadius: 6
      }
    ]
  };

  const winsLossesData = {
    labels: ["Wins", "Losses", "Ties", "No Results"],
    datasets: [
      {
        data: [
          points.reduce((sum, item) => sum + item.wins, 0),
          points.reduce((sum, item) => sum + item.losses, 0),
          points.reduce((sum, item) => sum + item.ties, 0),
          points.reduce((sum, item) => sum + item.noResults, 0)
        ],
        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#f59e0b",
          "#64748b"
        ],
        borderWidth: 0
      }
    ]
  };

  const nrrData = {
    labels,
    datasets: [
      {
        label: "Net Run Rate",
        data: sortedPoints.map((item) => item.netRunRate),
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.2)",
        tension: 0.35,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff"
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#bdcbe0" },
        grid: { color: "rgba(255,255,255,0.06)" }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#bdcbe0" },
        grid: { color: "rgba(255,255,255,0.06)" }
      }
    }
  };

  return (
    <div className="performance-page">

      <div className="performance-header">
        <div>
          <h1>📊 Tournament Performance</h1>
          <p>Visual analysis of team performance and tournament standings</p>
        </div>

        <select
          value={tournamentId}
          onChange={(e) => setTournamentId(Number(e.target.value))}
        >
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.tournamentName}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading performance charts...</p>}

      {error && <p className="performance-error">{error}</p>}

      {!loading && !error && points.length === 0 && (
        <p>No performance data available for this tournament.</p>
      )}

      {!loading && !error && points.length > 0 && (
        <div className="performance-chart-grid">

          <div className="performance-chart-card">
            <h2>Team-wise Points</h2>
            <div className="performance-chart">
              <Bar data={pointsData} options={chartOptions} />
            </div>
          </div>

          <div className="performance-chart-card">
            <h2>Wins vs Losses</h2>
            <div className="performance-chart doughnut-chart">
              <Doughnut
                data={winsLossesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { color: "#ffffff" }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="performance-chart-card performance-wide-card">
            <h2>Team-wise Net Run Rate</h2>
            <div className="performance-chart">
              <Line data={nrrData} options={chartOptions} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default TournamentPerformance;
