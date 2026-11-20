
import { useEffect, useState, type FormEvent } from "react";

import { loginUser, logoutUser } from "./services/authService";
import { getRoleFromToken } from "./services/jwtService";

import TournamentPage from "./pages/Tournament";
import MatchSquadPage from "./pages/MatchSquad";
import TossPage from "./pages/Toss";
import PlayerPage from "./pages/Player";
import TeamPage from "./pages/Team";
import LiveScore from "./pages/LiveScore";
import MatchHistory from "./pages/MatchHistory";
import PointsTable from "./pages/PointsTable";
//import Tournaments from "./pages/Tournaments";
import PlayerStatistics from "./pages/PlayerStatistics";
import PlayerProfile from "./pages/PlayerProfile";
import PlayerComparison from "./pages/PlayerComparison";
import TeamComparison from "./pages/TeamComparison";
import TournamentPerformance from "./pages/TournamentPerformance";

import LiveMatchDashboard from "./pages/LiveMatchDashboard";
import Register from "./pages/Register";

import {
  getDashboard,
  getMatches,
  addMatch,
  updateMatch,
  deleteMatch,
} from "./services/dashboardService";

import "./App.css";

interface Match {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchStatus: string;
  matchFormat: string;
  matchDate: string;
}

const emptyForm = {
  team1: "",
  team2: "",
  venue: "",
  matchStatus: "UPCOMING",
  matchFormat: "T20",
  matchDate: "",
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role")
  );

  const [dashboard, setDashboard] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return localStorage.getItem("cricpulse-theme") === "light"
      ? "light"
      : "dark";
  });

  useEffect(() => {
    localStorage.setItem("cricpulse-theme", theme);
  }, [theme]);

  const canManage = role === "ADMIN" || role === "SCORER";
  const isAdmin = role === "ADMIN";

  const loadData = async () => {
    if (!role) return;

    setLoading(true);
    setError("");

    try {
      const [dashboardData, matchData] = await Promise.all([
        getDashboard(role),
        getMatches(),
      ]);

      setDashboard(dashboardData);
      setMatches(matchData);
    } catch (err) {
      console.error(err);
      setError("Unable to load data. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      const userRole = getRoleFromToken(data.token);

      if (!userRole) {
        logoutUser();
        setError("Unable to identify user role.");
        return;
      }

      localStorage.setItem("role", userRole);
      setRole(userRole);
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your email and password.");
    }
  };

  const handleLogout = () => {
    logoutUser();

    setRole(null);
    setDashboard(null);
    setMatches([]);
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
    setActivePage("dashboard");
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (match: Match) => {
    setForm({
      team1: match.team1,
      team2: match.team2,
      venue: match.venue,
      matchStatus: match.matchStatus,
      matchFormat: match.matchFormat,
      matchDate: match.matchDate
        ? match.matchDate.slice(0, 16)
        : "",
    });

    setEditingId(match.id);
    setShowForm(true);
    setMessage("");
  };

  const handleSaveMatch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const matchData = {
      ...form,
      matchDate: form.matchDate
        ? form.matchDate.length === 16
          ? `${form.matchDate}:00`
          : form.matchDate
        : null,
    };

    try {
      if (editingId !== null) {
        await updateMatch(editingId, matchData);
        setMessage("Match updated successfully!");
      } else {
        await addMatch(matchData);
        setMessage("Match added successfully!");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to save match. Check your permissions and input.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this match?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteMatch(id);
      setMessage("Match deleted successfully!");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete match. Only Admin can delete matches.");
    }
  };

  if (!role) {
    if (showRegister) {
      return <Register onBackToLogin={() => setShowRegister(false)} />;
    }

    return (
      <div className="login-screen">
        <div className="login-left">
          <div className="login-brand">
            <span>🏏</span> CricPulse
          </div>

          <div className="login-message">
            <span className="live-indicator">
              ● LIVE CRICKET INTELLIGENCE
            </span>
            <h1>
              Every Ball.<br />
              Every Moment.<br />
              <span>Every Victory.</span>
            </h1>
            <p>
              Your complete cricket management and analytics platform.
            </p>
          </div>

          <p className="login-footer">CRICPULSE © 2026</p>
        </div>

        <div className="login-right">
          <form className="premium-login" onSubmit={handleLogin}>
            <div className="login-icon">🏏</div>
            <h2>Welcome Back</h2>
            <p>Sign in to your CricPulse account</p>

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit" className="login-submit">
              Sign In →
            </button>

            <div className="register-link">
              Don't have an account?{" "}
              <button type="button" onClick={() => setShowRegister(true)}>
                Create Account
              </button>
            </div>

            <span className="secure-text">
              🔒 Secure Role-Based Access
            </span>
          </form>
        </div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(
    (match) => match.matchStatus === "UPCOMING"
  );

  const liveMatches = matches.filter(
    (match) => match.matchStatus === "LIVE"
  );

  const completedMatches = matches.filter(
    (match) => match.matchStatus === "COMPLETED"
  );

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    matches: "Match Centre",
    tournaments: "Tournament Centre",
    "player-profile": "Player Profile",
    "player-comparison": "Player Comparison",
    "team-comparison": "Team Comparison",
    "tournament-performance": "Tournament Performance",
    liveMatchDashboard: "Live Match Dashboard",
    teams: "Team Management",
    matchsquad: "Match Squad",
    toss: "Toss Centre",
    players: "Player Management",
    "player-statistics": "Player Statistics",
    "live-score": "Live Score Center",
    "match-history": "Match History",
    "points-table": "Points Table",
  };

  return (
    <div className={`app-layout ${theme}-theme`}>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <span>🏏</span>
          <h2>
            Cric<span>Pulse</span>
          </h2>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">

          <button
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            <span>▦</span> Dashboard
          </button>

          <button
            className={activePage === "matches" ? "active" : ""}
            onClick={() => {
              setActivePage("matches");
              setShowForm(false);
            }}
          >
            <span>🏏</span> Matches
          </button>

          <button
            className={activePage === "matchsquad" ? "active" : ""}
            onClick={() => {
              setActivePage("matchsquad");
              setShowForm(false);
            }}
          >
            <span>🧢</span> Match Squad
          </button>

          <button
            className={activePage === "toss" ? "active" : ""}
            onClick={() => {
              setActivePage("toss");
              setShowForm(false);
            }}
          >
            <span>🪙</span> Toss
          </button>

          <button
            className={activePage === "tournaments" ? "active" : ""}
            onClick={() => {
              setActivePage("tournaments");
              setShowForm(false);
            }}
          >
            <span>🏆</span> Tournaments
          </button>

                <button
        className={activePage === "tournament-performance" ? "active" : ""}
        onClick={() => {
          setActivePage("tournament-performance");
          setShowForm(false);
        }}
      >
        <span>📈</span> Tournament Performance
      </button>

      <button onClick={() => setActivePage("liveMatchDashboard")}>
        <span>🏏</span> Live Match Dashboard
      </button>

          <button
            className={activePage === "teams" ? "active" : ""}
            onClick={() => {
              setActivePage("teams");
              setShowForm(false);
            }}
          >
            <span>👥</span> Teams
          </button>

          <button
            className={activePage === "players" ? "active" : ""}
            onClick={() => {
              setActivePage("players");
              setShowForm(false);
            }}
          >
            <span>🏃</span> Players
          </button>

          <button
            className={activePage === "player-statistics" ? "active" : ""}
            onClick={() => {
              setActivePage("player-statistics");
              setShowForm(false);
            }}
          >
            <span>📊</span> Player Statistics
          </button>

          <button
            className={activePage === "live-score" ? "active" : ""}
            onClick={() => {
              setActivePage("live-score");
              setShowForm(false);
            }}
          >
            <span>🏏</span> Live Score
          </button>

          <button
            className={activePage === "match-history" ? "active" : ""}
            onClick={() => {
              setActivePage("match-history");
              setShowForm(false);
            }}
          >
            <span>📜</span> Match History
          </button>

          <button
            className={activePage === "points-table" ? "active" : ""}
            onClick={() => {
              setActivePage("points-table");
              setShowForm(false);
            }}
          >
            <span>🏆</span> Points Table
          </button>


          <button
          className={activePage === "player-profile" ? "active" : ""}
          onClick={() => setActivePage("player-profile")}
        >
          <span>Player Profile</span>
        </button>

        <button
        className={activePage === "player-comparison" ? "active" : ""}
        onClick={() => setActivePage("player-comparison")}
      >
        <span>Player Comparison</span>
      </button>

    <button
        className={activePage === "team-comparison" ? "active" : ""}
        onClick={() => setActivePage("team-comparison")}
      >
        <span>Team Comparison</span>
      </button>

        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="profile-avatar">
              {role.charAt(0)}
            </div>

            <div>
              <strong>{role.replace("_", " ")}</strong>
              <small>Active Account</small>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            ⇥ Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <h2>{pageTitles[activePage] || "Dashboard"}</h2>
            <p>Live Cricket Intelligence & Management</p>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark"
                )
              }
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
              title={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <span className="online-status">
              ● System Online
            </span>

            <div className="topbar-avatar">
              {role.charAt(0)}
            </div>
          </div>
        </header>

        {/* GLOBAL MESSAGES */}
        <main className="page-content">
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <section className="welcome-banner">
                <div>
                  <span className="section-eyebrow">OVERVIEW</span>
                  <h1>
                    {dashboard?.dashboard || `${role} Dashboard`}
                  </h1>
                  <p>
                    {dashboard?.message || "Welcome to CricPulse!"}
                  </p>
                </div>

                {canManage && (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setActivePage("matches");
                      openAddForm();
                    }}
                  >
                    + Create Match
                  </button>
                )}
              </section>

              {loading && <p>Loading dashboard...</p>}

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">🏏</div>
                  <p>Total Matches</p>
                  <h2>{matches.length}</h2>
                  <small>All registered matches</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">●</div>
                  <p>Live Matches</p>
                  <h2>{liveMatches.length}</h2>
                  <small>Currently in progress</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">📅</div>
                  <p>Upcoming Matches</p>
                  <h2>{upcomingMatches.length}</h2>
                  <small>Scheduled matches</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">🏆</div>
                  <p>Completed Matches</p>
                  <h2>{completedMatches.length}</h2>
                  <small>Finished matches</small>
                </div>
              </section>

              <section className="content-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent Matches</h2>
                    <p>Your latest cricket matches</p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("matches")}
                  >
                    View All →
                  </button>
                </div>

                {matches.length === 0 ? (
                  <div className="empty-state">
                    <span>🏏</span>
                    <h3>No matches yet</h3>
                    <p>Cricket matches will appear here.</p>
                  </div>
                ) : (
                  <div className="matches-grid">
                    {matches.slice(0, 4).map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* MATCH MANAGEMENT */}
          {activePage === "matches" && (
            <>
              <section className="welcome-banner">
                <div>
                  <span className="section-eyebrow">
                    CRICKET OPERATIONS
                  </span>
                  <h1>Match Management</h1>
                  <p>Create, view and manage cricket matches.</p>
                </div>

                {canManage && (
                  <button
                    className="primary-button"
                    onClick={openAddForm}
                  >
                    + Add New Match
                  </button>
                )}
              </section>

              {loading && <p>Loading matches...</p>}

              {showForm && canManage && (
                <section className="content-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        {editingId !== null
                          ? "Edit Match"
                          : "Create New Match"}
                      </h2>
                      <p>Enter the match details below</p>
                    </div>
                  </div>

                  <form className="match-form" onSubmit={handleSaveMatch}>
                    <label>
                      Team 1
                      <input
                        value={form.team1}
                        onChange={(e) =>
                          setForm({ ...form, team1: e.target.value })
                        }
                        placeholder="Enter first team"
                        required
                      />
                    </label>

                    <label>
                      Team 2
                      <input
                        value={form.team2}
                        onChange={(e) =>
                          setForm({ ...form, team2: e.target.value })
                        }
                        placeholder="Enter second team"
                        required
                      />
                    </label>

                    <label>
                      Venue
                      <input
                        value={form.venue}
                        onChange={(e) =>
                          setForm({ ...form, venue: e.target.value })
                        }
                        placeholder="Enter stadium / venue"
                        required
                      />
                    </label>

                    <label>
                      Match Format
                      <select
                        value={form.matchFormat}
                        onChange={(e) =>
                          setForm({ ...form, matchFormat: e.target.value })
                        }
                      >
                        <option value="T20">T20</option>
                        <option value="ODI">ODI</option>
                        <option value="TEST">TEST</option>
                      </select>
                    </label>

                    <label>
                      Match Status
                      <select
                        value={form.matchStatus}
                        onChange={(e) =>
                          setForm({ ...form, matchStatus: e.target.value })
                        }
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="LIVE">LIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </label>

                    <label>
                      Match Date & Time
                      <input
                        type="datetime-local"
                        value={form.matchDate}
                        onChange={(e) =>
                          setForm({ ...form, matchDate: e.target.value })
                        }
                        required
                      />
                    </label>

                    <div className="form-actions">
                      <button type="submit" className="primary-button">
                        {editingId !== null
                          ? "Update Match"
                          : "Save Match"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="content-panel">
                <div className="panel-heading">
                  <div>
                    <h2>All Cricket Matches</h2>
                    <p>{matches.length} matches registered</p>
                  </div>
                </div>

                {matches.length === 0 ? (
                  <div className="empty-state">
                    <span>🏏</span>
                    <h3>No matches available</h3>
                  </div>
                ) : (
                  <div className="matches-grid">
                    {matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        canManage={canManage}
                        isAdmin={isAdmin}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* TOURNAMENT MANAGEMENT */}
          {activePage === "tournaments" && <TournamentPage />}

          {/* TEAM MANAGEMENT */}
          {activePage === "teams" && <TeamPage />}

          {/* MATCH SQUAD MANAGEMENT */}
          {activePage === "matchsquad" && <MatchSquadPage />}

          {/* PLAYER MANAGEMENT */}
          {activePage === "players" && <PlayerPage />}

          {/* PLAYER STATISTICS */}
          {activePage === "player-statistics" && <PlayerStatistics />}

          {/* TOSS MANAGEMENT */}
          {activePage === "toss" && <TossPage />}

          {/* LIVE SCORE */}
          {activePage === "live-score" && <LiveScore />}

          {/* MATCH HISTORY */}
          {activePage === "match-history" && <MatchHistory />}

          {/* POINTS TABLE */}
          {activePage === "points-table" && <PointsTable />}

          {activePage === "player-profile" && <PlayerProfile />}

          {activePage === "player-comparison" && <PlayerComparison />}

          {activePage === "team-comparison" && <TeamComparison />}

          {activePage === "tournament-performance" && (
           <TournamentPerformance />)}

           {activePage === "liveMatchDashboard" && <LiveMatchDashboard />}

        </main>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  canManage?: boolean;
  isAdmin?: boolean;
  onEdit?: (match: Match) => void;
  onDelete?: (id: number) => void;
}

function MatchCard({
  match,
  canManage = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: MatchCardProps) {
  return (
    <div className="match-card">
      <div className="match-card-top">
        <span className="format-badge">
          {match.matchFormat}
        </span>

        <span className={`status-badge ${match.matchStatus.toLowerCase()}`}>
          {match.matchStatus === "LIVE" && "● "}
          {match.matchStatus}
        </span>
      </div>

      <div className="match-teams">
        <h3>{match.team1}</h3>
        <span>VS</span>
        <h3>{match.team2}</h3>
      </div>

      <div className="match-details">
        <p>📍 {match.venue}</p>
        <p>
          📅{" "}
          {match.matchDate
            ? new Date(match.matchDate).toLocaleString("en-IN")
            : "Date not available"}
        </p>
      </div>

      {canManage && (
        <div className="card-actions">
          <button
            className="edit-button"
            onClick={() => onEdit?.(match)}
          >
            Edit
          </button>

          {isAdmin && (
            <button
              className="delete-button"
              onClick={() => onDelete?.(match.id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
