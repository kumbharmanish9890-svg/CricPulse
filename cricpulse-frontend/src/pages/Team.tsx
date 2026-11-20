
import { useEffect, useState, type FormEvent } from "react";
import teamService, { type Team } from "../services/teamService";
import tournamentService, { type Tournament } from "../services/tournamentService";
import "./Team.css";

const emptyForm = {
  teamName: "",
  shortName: "",
  country: "",
  coachName: "",
  tournamentId: ""
};

function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [teamData, tournamentData] = await Promise.all([
        teamService.getAll(),
        tournamentService.getAll()
      ]);

      setTeams(teamData);
      setTournaments(tournamentData);
    } catch (err) {
      console.error(err);
      setError("Unable to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const openEditForm = (team: Team) => {
    setForm({
      teamName: team.teamName,
      shortName: team.shortName,
      country: team.country,
      coachName: team.coachName,
      tournamentId: team.tournament?.id?.toString() || ""
    });

    setEditingId(team.id!);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const teamData: Team = {
        teamName: form.teamName,
        shortName: form.shortName,
        country: form.country,
        coachName: form.coachName
      };

      if (editingId !== null) {
        await teamService.update(editingId, teamData);
        setMessage("Team updated successfully!");
      } else {
        if (!form.tournamentId) {
          setError("Please select a tournament.");
          return;
        }

        await teamService.add(Number(form.tournamentId), teamData);
        setMessage("Team added successfully!");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to save team. Check your permissions and input.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await teamService.delete(id);
      setMessage("Team deleted successfully!");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete team. Check whether players are linked to it.");
    }
  };

  return (
    <div className="team-page">
      <section className="welcome-banner">
        <div>
          <span className="section-eyebrow">CRICKET OPERATIONS</span>
          <h1>Team Management</h1>
          <p>Create, view and manage tournament teams.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          + Add New Team
        </button>
      </section>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      {showForm && (
        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? "Edit Team" : "Add New Team"}</h2>
              <p>Enter team details below.</p>
            </div>
          </div>

          <form className="team-form" onSubmit={handleSave}>
            <label>
              Team Name
              <input
                value={form.teamName}
                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                placeholder="e.g. Mumbai Indians"
                required
              />
            </label>

            <label>
              Short Name
              <input
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                placeholder="e.g. MI"
                required
              />
            </label>

            <label>
              Country
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. India"
                required
              />
            </label>

            <label>
              Coach Name
              <input
                value={form.coachName}
                onChange={(e) => setForm({ ...form, coachName: e.target.value })}
                placeholder="Enter coach name"
                required
              />
            </label>

            {editingId === null && (
              <label>
                Tournament
                <select
                  value={form.tournamentId}
                  onChange={(e) =>
                    setForm({ ...form, tournamentId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Tournament</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.tournamentName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId !== null ? "Update Team" : "Save Team"}
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
            <h2>All Teams</h2>
            <p>{teams.length} teams registered</p>
          </div>
        </div>

        {loading ? (
          <p>Loading teams...</p>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <span>🏏</span>
            <h3>No teams available</h3>
            <p>Add a team to get started.</p>
          </div>
        ) : (
          <div className="team-grid">
            {teams.map((team) => (
              <div className="team-card" key={team.id}>
                <div className="team-card-top">
                  <div className="team-logo">{team.shortName}</div>
                  <span className="team-country">{team.country}</span>
                </div>

                <h3>{team.teamName}</h3>
                <p>Coach: {team.coachName}</p>
                <p>
                  Tournament: {team.tournament?.tournamentName || "Not assigned"}
                </p>

                <div className="card-actions">
                  <button
                    className="edit-button"
                    onClick={() => openEditForm(team)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(team.id!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TeamPage;
