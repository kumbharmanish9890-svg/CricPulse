
import { useEffect, useState } from "react";
import tournamentService, {
  type Tournament,
} from "../services/tournamentService";
import "./Tournaments.css";

function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const emptyForm: Tournament = {
    tournamentName: "",
    tournamentFormat: "T20",
    tournamentStatus: "UPCOMING",
    location: "",
    startDate: "",
    endDate: "",
  };

  const [form, setForm] = useState<Tournament>(emptyForm);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await tournamentService.getAll();
      setTournaments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load tournaments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (tournament: Tournament) => {
    setEditId(tournament.id ?? null);
    setForm({ ...tournament });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editId !== null) {
        await tournamentService.update(editId, form);
        alert("Tournament updated successfully!");
      } else {
        await tournamentService.add(form);
        alert("Tournament created successfully!");
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      await fetchTournaments();
    } catch (err) {
      console.error(err);
      alert("Unable to save tournament. Check your Admin login.");
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      await tournamentService.delete(id);
      alert("Tournament deleted successfully!");
      await fetchTournaments();
    } catch (err) {
      console.error(err);
      alert("Unable to delete tournament.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div className="tournaments-page">
      <div className="tournaments-header">
        <div>
          <h1>🏆 Tournament Management</h1>
          <p>Create and manage cricket tournaments</p>
        </div>

        <button
          className="add-tournament-btn"
          onClick={() => {
            setEditId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          + Add Tournament
        </button>
      </div>

      {showForm && (
        <form className="tournament-form" onSubmit={handleSubmit}>
          <h2>{editId !== null ? "Edit Tournament" : "Add Tournament"}</h2>

          <label>Tournament Name</label>
          <input
            name="tournamentName"
            value={form.tournamentName}
            onChange={handleChange}
            required
          />

          <label>Format</label>
          <select
            name="tournamentFormat"
            value={form.tournamentFormat}
            onChange={handleChange}
          >
            <option value="T10">T10</option>
            <option value="T20">T20</option>
            <option value="ODI">ODI</option>
            <option value="TEST">TEST</option>
          </select>

          <label>Status</label>
          <select
            name="tournamentStatus"
            value={form.tournamentStatus}
            onChange={handleChange}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <label>Location</label>
          <input
            name="location"
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
            min={form.startDate}
            required
          />

          <div className="tournament-form-actions">
            <button type="submit">
              {editId !== null ? "Update Tournament" : "Save Tournament"}
            </button>

            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading tournaments...</p>}
      {error && <p className="tournament-error">{error}</p>}

      {!loading && !error && (
        <div className="tournament-grid">
          {tournaments.length === 0 ? (
            <p>No tournaments available.</p>
          ) : (
            tournaments.map((item) => (
              <div className="tournament-card" key={item.id}>
                <h2>{item.tournamentName}</h2>

                <p><strong>Format:</strong> {item.tournamentFormat}</p>
                <p><strong>Status:</strong> {item.tournamentStatus}</p>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Start:</strong> {item.startDate}</p>
                <p><strong>End:</strong> {item.endDate}</p>

                <div className="tournament-card-actions">
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Tournaments;
