
import { useEffect, useState } from "react";
import teamService from "../services/teamService";
import api from "../services/api";
import "./TeamComparison.css";

import { Bar, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register all required Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TeamMatchHistory {
  id?: number;
  team1?: string;
  team2?: string;
  winner?: string | null;
  venue?: string;
  matchDate?: string;
  matchFormat?: string;
  resultSummary?: string | null;
}

interface Team {
  id?: number;
  teamName: string;
  shortName?: string;
  logoUrl?: string;
}

interface TeamStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winPercentage: number;
}

function TeamComparison() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<TeamMatchHistory[]>([]);
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teamData, matchResponse] = await Promise.all([
        teamService.getAll(),
        api.get<TeamMatchHistory[]>("/matches/history"),
      ]);

      setTeams(teamData);
      setMatches(matchResponse.data);
    } catch (err) {
      console.error("Error loading comparison data:", err);
      setError("Unable to load team comparison data.");
    } finally {
      setLoading(false);
    }
  };

  const isDraw = (winner?: string | null) => {
    if (!winner) return true;

    return [
      "draw",
      "tie",
      "no result",
      "no-result",
    ].includes(winner.trim().toLowerCase());
  };

  const calculateStats = (teamName: string): TeamStats => {
    const teamMatches = matches.filter(
      (match) =>
        match.team1?.toLowerCase() === teamName.toLowerCase() ||
        match.team2?.toLowerCase() === teamName.toLowerCase()
    );

    const wins = teamMatches.filter(
      (match) =>
        match.winner?.toLowerCase() === teamName.toLowerCase()
    ).length;

    const draws = teamMatches.filter(
      (match) => isDraw(match.winner)
    ).length;

    const losses = teamMatches.length - wins - draws;

    return {
      played: teamMatches.length,
      wins,
      losses,
      draws,
      winPercentage:
        teamMatches.length > 0
          ? Number(((wins / teamMatches.length) * 100).toFixed(2))
          : 0,
    };
  };

  const selectedTeam1 = teams.find(
    (team) => String(team.id) === team1Id
  );

  const selectedTeam2 = teams.find(
    (team) => String(team.id) === team2Id
  );

  const stats1 = selectedTeam1
    ? calculateStats(selectedTeam1.teamName)
    : null;

  const stats2 = selectedTeam2
    ? calculateStats(selectedTeam2.teamName)
    : null;

  const headToHead =
    selectedTeam1 && selectedTeam2
      ? matches.filter(
          (match) =>
            (
              match.team1?.toLowerCase() ===
                selectedTeam1.teamName.toLowerCase() &&
              match.team2?.toLowerCase() ===
                selectedTeam2.teamName.toLowerCase()
            ) ||
            (
              match.team1?.toLowerCase() ===
                selectedTeam2.teamName.toLowerCase() &&
              match.team2?.toLowerCase() ===
                selectedTeam1.teamName.toLowerCase()
            )
        )
      : [];

  const team1H2HWins = headToHead.filter(
    (match) =>
      match.winner?.toLowerCase() ===
      selectedTeam1?.teamName.toLowerCase()
  ).length;

  const team2H2HWins = headToHead.filter(
    (match) =>
      match.winner?.toLowerCase() ===
      selectedTeam2?.teamName.toLowerCase()
  ).length;

  const headToHeadDraws =
    headToHead.length - team1H2HWins - team2H2HWins;

  // Bar Chart Data
  const chartData = {
    labels: [
      "Matches Played",
      "Wins",
      "Losses",
      "Draws",
      "Win Percentage",
    ],
    datasets: [
      {
        label: selectedTeam1?.teamName || "Team 1",
        data: [
          stats1?.played ?? 0,
          stats1?.wins ?? 0,
          stats1?.losses ?? 0,
          stats1?.draws ?? 0,
          stats1?.winPercentage ?? 0,
        ],
        backgroundColor: "rgba(56, 189, 248, 0.8)",
        borderRadius: 6,
      },
      {
        label: selectedTeam2?.teamName || "Team 2",
        data: [
          stats2?.played ?? 0,
          stats2?.wins ?? 0,
          stats2?.losses ?? 0,
          stats2?.draws ?? 0,
          stats2?.winPercentage ?? 0,
        ],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  // Doughnut Chart Data
  const doughnutData1 = {
    labels: ["Wins", "Other Matches"],
    datasets: [
      {
        data: [
          stats1?.winPercentage ?? 0,
          100 - (stats1?.winPercentage ?? 0),
        ],
        backgroundColor: ["#22c55e", "#334155"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutData2 = {
    labels: ["Wins", "Other Matches"],
    datasets: [
      {
        data: [
          stats2?.winPercentage ?? 0,
          100 - (stats2?.winPercentage ?? 0),
        ],
        backgroundColor: ["#38bdf8", "#334155"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#ffffff",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="team-comparison-page">
        Loading team comparison data...
      </div>
    );
  }

  return (
    <div className="team-comparison-page">
      <h2>Team Comparison</h2>
      <p>Compare team performance and match records</p>

      {error && (
        <p className="comparison-error">{error}</p>
      )}

      <div className="team-selectors">
        <div>
          <label>First Team</label>

          <select
            value={team1Id}
            onChange={(e) => setTeam1Id(e.target.value)}
          >
            <option value="">Select First Team</option>

            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        <h3>VS</h3>

        <div>
          <label>Second Team</label>

          <select
            value={team2Id}
            onChange={(e) => setTeam2Id(e.target.value)}
          >
            <option value="">Select Second Team</option>

            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {team1Id && team2Id && team1Id === team2Id && (
        <p className="comparison-error">
          Please select two different teams.
        </p>
      )}

      {stats1 && stats2 && team1Id !== team2Id && (
        <>
          {/* Team Statistics Cards */}
          <div className="team-comparison-cards">
            <div className="team-stat-card">
              <h3>{selectedTeam1?.teamName}</h3>
              <p className="team-wins">{stats1.wins} Wins</p>

              <div className="team-stat-grid">
                <span>Matches Played</span>
                <strong>{stats1.played}</strong>

                <span>Losses</span>
                <strong>{stats1.losses}</strong>

                <span>Draws / No Result</span>
                <strong>{stats1.draws}</strong>

                <span>Win Percentage</span>
                <strong>{stats1.winPercentage}%</strong>
              </div>
            </div>

            <div className="team-stat-card">
              <h3>{selectedTeam2?.teamName}</h3>
              <p className="team-wins">{stats2.wins} Wins</p>

              <div className="team-stat-grid">
                <span>Matches Played</span>
                <strong>{stats2.played}</strong>

                <span>Losses</span>
                <strong>{stats2.losses}</strong>

                <span>Draws / No Result</span>
                <strong>{stats2.draws}</strong>

                <span>Win Percentage</span>
                <strong>{stats2.winPercentage}%</strong>
              </div>
            </div>
          </div>

          {/* Doughnut Charts */}
          <div className="win-percentage-section">
            <h3>Team Win Percentage</h3>

            <div className="win-percentage-charts">
              <div className="win-chart-card">
                <h4>{selectedTeam1?.teamName}</h4>

                <div className="doughnut-container">
                  <Doughnut
                    key="team-one-doughnut"
                    redraw
                    data={doughnutData1}
                    options={doughnutOptions}
                  />
                </div>

                <h2>{stats1.winPercentage}%</h2>
              </div>

              <div className="win-chart-card">
                <h4>{selectedTeam2?.teamName}</h4>

                <div className="doughnut-container">
                  <Doughnut
                    key="team-two-doughnut"
                    redraw
                    data={doughnutData2}
                    options={doughnutOptions}
                  />
                </div>

                <h2>{stats2.winPercentage}%</h2>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="team-chart-card">
            <h3>Team Performance Comparison</h3>

            <div className="team-chart-container">
              <Bar
                key="team-performance-bar"
                redraw
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "#ffffff",
                      },
                    },
                    title: {
                      display: true,
                      text: "Team Statistics",
                      color: "#38bdf8",
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "#cbd5e1",
                      },
                      grid: {
                        color: "#334155",
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: "#cbd5e1",
                        precision: 0,
                      },
                      grid: {
                        color: "#334155",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Head-to-Head */}
          <div className="head-to-head-card">
            <h3>Head-to-Head Record</h3>

            <div className="head-to-head-stats">
              <div>
                <h2>{team1H2HWins}</h2>
                <p>{selectedTeam1?.teamName} Wins</p>
              </div>

              <div>
                <h2>{headToHead.length}</h2>
                <p>Total Matches</p>
              </div>

              <div>
                <h2>{team2H2HWins}</h2>
                <p>{selectedTeam2?.teamName} Wins</p>
              </div>
            </div>

            <p>Draws / No Result: {headToHeadDraws}</p>
          </div>

          {/* Recent Matches */}
          <div className="recent-matches-card">
            <h3>Recent Head-to-Head Matches</h3>

            {headToHead.length === 0 ? (
              <p>No previous matches found between these teams.</p>
            ) : (
              <div className="recent-matches-list">
                {headToHead.map((match) => (
                  <div className="recent-match-item" key={match.id}>
                    <div>
                      <h4>
                        {match.team1} vs {match.team2}
                      </h4>

                      <p>
                        {match.venue || "Venue not available"}
                      </p>

                      <p>
                        {match.matchFormat || "Format N/A"} |{" "}
                        {match.matchDate
                          ? new Date(match.matchDate).toLocaleDateString()
                          : "Date N/A"}
                      </p>
                    </div>

                    <div className="recent-match-result">
                      <strong>
                        {match.winner || "No Result"}
                      </strong>

                      <p>
                        {match.resultSummary || "Result not available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TeamComparison;
