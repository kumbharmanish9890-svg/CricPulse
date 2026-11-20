
import { useEffect, useState } from "react";
import tournamentService, {
  type Tournament
} from "../services/tournamentService";
import teamService from "../services/teamService";
import api from "../services/api";

import "./Tournament.css";

interface Match {
  id?: number;
  matchStatus: string;
  tournament?: {
    id: number;
  };
}

interface TournamentAnalytics {
  teamCount: number;
  matchCount: number;
}

function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [analytics, setAnalytics] = useState<
    Record<number, TournamentAnalytics>
  >({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Tournament>({
    tournamentName: "",
    tournamentFormat: "T20",
    tournamentStatus: "UPCOMING",
    location: "",
    startDate: "",
    endDate: ""
  });

  const [editId, setEditId] = useState<number | null>(null);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await tournamentService.getAll();
      setTournaments(data);

      const matchResponse = await api.get<Match[]>("/matches");
      const matches = matchResponse.data;

      const analyticsEntries = await Promise.all(
        data.map(async (tournament) => {
          if (!tournament.id) {
            return null;
          }

          const teams = await teamService.getByTournament(tournament.id);

          const tournamentMatches = matches.filter(
            (match) => match.tournament?.id === tournament.id
          );

          return [
            tournament.id,
            {
              teamCount: teams.length,
              matchCount: tournamentMatches.length
            }
          ] as const;
        })
      );

      const analyticsData: Record<number, TournamentAnalytics> = {};

      analyticsEntries.forEach((entry) => {
        if (entry) {
          analyticsData[entry[0]] = entry[1];
        }
      });

      setAnalytics(analyticsData);

    } catch (err) {
      console.error(err);
      setError("Unable to load tournament analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editId !== null) {
        await tournamentService.update(editId, form);
        alert("Tournament updated successfully!");
      } else {
        await tournamentService.add(form);
        alert("Tournament added successfully!");
      }

      resetForm();
      loadTournaments();

    } catch (err) {
      console.error(err);
      alert("Tournament operation failed!");
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditId(tournament.id!);

    setForm({
      tournamentName: tournament.tournamentName,
      tournamentFormat: tournament.tournamentFormat,
      tournamentStatus: tournament.tournamentStatus,
      location: tournament.location,
      startDate: tournament.startDate,
      endDate: tournament.endDate
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      await tournamentService.delete(id);
      alert("Tournament deleted successfully!");
      loadTournaments();

    } catch (err) {
      console.error(err);
      alert("Unable to delete tournament!");
    }
  };

  const resetForm = () => {
    setEditId(null);

    setForm({
      tournamentName: "",
      tournamentFormat: "T20",
      tournamentStatus: "UPCOMING",
      location: "",
      startDate: "",
      endDate: ""
    });
  };

  const totalTeams = Object.values(analytics).reduce(
    (total, item) => total + item.teamCount,
    0
  );

  const totalMatches = Object.values(analytics).reduce(
    (total, item) => total + item.matchCount,
    0
  );

  const liveTournaments = tournaments.filter(
    (t) => t.tournamentStatus === "LIVE"
  ).length;

  const completedTournaments = tournaments.filter(
    (t) => t.tournamentStatus === "COMPLETED"
  ).length;

  const upcomingTournaments = tournaments.filter(
    (t) => t.tournamentStatus === "UPCOMING"
  ).length;

  return (
    <div className="tournament-page">

      <h1>Tournament Analytics Dashboard</h1>
      <p>Manage tournaments and monitor CricPulse performance</p>

      {/* Analytics Summary */}

      <div className="tournament-analytics-grid">

        <div className="tournament-analytics-card">
          <h3>Total Tournaments</h3>
          <h2>{tournaments.length}</h2>
        </div>

        <div className="tournament-analytics-card">
          <h3>Live Tournaments</h3>
          <h2>{liveTournaments}</h2>
        </div>

        <div className="tournament-analytics-card">
          <h3>Upcoming Tournaments</h3>
          <h2>{upcomingTournaments}</h2>
        </div>

        <div className="tournament-analytics-card">
          <h3>Completed Tournaments</h3>
          <h2>{completedTournaments}</h2>
        </div>

        <div className="tournament-analytics-card">
          <h3>Total Teams</h3>
          <h2>{totalTeams}</h2>
        </div>

        <div className="tournament-analytics-card">
          <h3>Total Matches</h3>
          <h2>{totalMatches}</h2>
        </div>

      </div>

      {/* Tournament Form */}

      <div className="tournament-form-card">

        <h2>{editId !== null ? "Edit Tournament" : "Add New Tournament"}</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="tournamentName"
            placeholder="Tournament Name"
            value={form.tournamentName}
            onChange={handleChange}
            required
          />

          <select
            name="tournamentFormat"
            value={form.tournamentFormat}
            onChange={handleChange}
          >
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="TEST">TEST</option>
          </select>

          <select
            name="tournamentStatus"
            value={form.tournamentStatus}
            onChange={handleChange}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="LIVE">LIVE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editId !== null ? "Update Tournament" : "Add Tournament"}
          </button>

          {editId !== null && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}

        </form>
      </div>

      {/* Tournament List */}

      <div className="tournament-list-card">

        <h2>Tournament Overview</h2>

        {loading && <p>Loading tournament analytics...</p>}
        {error && <p>{error}</p>}

        {!loading && tournaments.length === 0 && (
          <p>No tournaments found.</p>
        )}

        <div className="tournament-grid">

          {tournaments.map((tournament) => {
            const stats = analytics[tournament.id!] || {
              teamCount: 0,
              matchCount: 0
            };

            return (
              <div className="tournament-card" key={tournament.id}>

                <h3>{tournament.tournamentName}</h3>

                <p>Format: {tournament.tournamentFormat}</p>
                <p>Location: {tournament.location}</p>

                <p>
                  Status:
                  <span className="tournament-status">
                    {tournament.tournamentStatus}
                  </span>
                </p>

                <p>Start: {tournament.startDate}</p>
                <p>End: {tournament.endDate}</p>

                <div className="tournament-card-stats">
                  <div>
                    <strong>{stats.teamCount}</strong>
                    <span>Teams</span>
                  </div>

                  <div>
                    <strong>{stats.matchCount}</strong>
                    <span>Matches</span>
                  </div>
                </div>

                <button onClick={() => handleEdit(tournament)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(tournament.id!)}>
                  Delete
                </button>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}

export default TournamentPage;
