
import { useEffect, useMemo, useState, type FormEvent } from "react";
import playerService, { type Player } from "../services/playerService";
import teamService, { type Team } from "../services/teamService";
import { getRoleFromToken } from "../services/jwtService";
import "./Player.css";
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://cricpulse-api-gsr2.onrender.com/api"
).replace(/\/api\/?$/, "");

// API records created before the personal-information update may contain null fields.
const formatEnum = (value?: string | null) =>
  (value || "N/A").replaceAll("_", " ");

const displayText = (value?: string | null, fallback = "Not provided") =>
  value?.trim() || fallback;

type PlayerForm = {
  playerName: string;
  playerRole: string;
  battingStyle: string;
  bowlingStyle: string;
  jerseyNumber: string;
  nationality: string;
  teamId: string;
  dateOfBirth: string;
  contactNumber: string;
  motherName: string;
  address: string;
  email: string;
  collegeName: string;
};

const emptyForm: PlayerForm = {
  playerName: "",
  playerRole: "BATSMAN",
  battingStyle: "RIGHT_HAND",
  bowlingStyle: "NONE",
  jerseyNumber: "",
  nationality: "India",
  teamId: "",
  dateOfBirth: "",
  contactNumber: "",
  motherName: "",
  address: "",
  email: "",
  collegeName: ""
};


function PlayerPage() {
  const token = localStorage.getItem("token");
  const role = token ? getRoleFromToken(token) : null;
  const canManage = role === "ADMIN" || role === "SCORER";

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState<PlayerForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [playerData, teamData] = await Promise.all([
        playerService.getAll(),
        teamService.getAll()
      ]);

      setPlayers(Array.isArray(playerData) ? playerData.filter(Boolean) : []);
      setTeams(Array.isArray(teamData) ? teamData.filter(Boolean) : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load players.");
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
    setSelectedImage(null);
    setShowForm(true);
    setSelectedPlayer(null);
    setError("");
    setMessage("");
  };

  const openEditForm = (player: Player) => {
    if (player.id == null) {
      setError("Cannot edit this player because the player ID is missing.");
      return;
    }

    setForm({
      playerName: player.playerName || "",
      playerRole: player.playerRole || "BATSMAN",
      battingStyle: player.battingStyle || "RIGHT_HAND",
      bowlingStyle: player.bowlingStyle || "NONE",
      jerseyNumber: String(player.jerseyNumber ?? ""),
      nationality: player.nationality || "India",
      teamId: player.team?.id ? String(player.team.id) : "",
      dateOfBirth: player.dateOfBirth || "",
      contactNumber: player.contactNumber || "",
      motherName: player.motherName || "",
      address: player.address || "",
      email: player.email || "",
      collegeName: player.collegeName || ""
    });

    setEditingId(player.id!);
    setSelectedImage(null);
    setShowForm(true);
    setSelectedPlayer(null);
    setError("");
    setMessage("");
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!canManage) {
      setError("You do not have permission to manage players.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.contactNumber)) {
      setError("Enter a valid 10-digit contact number.");
      return;
    }

    setSaving(true);

    try {
      const playerData: Player = {
        playerName: form.playerName.trim(),
        playerRole: form.playerRole,
        battingStyle: form.battingStyle,
        bowlingStyle: form.bowlingStyle,
        jerseyNumber: Number(form.jerseyNumber),
        nationality: form.nationality.trim(),
        dateOfBirth: form.dateOfBirth || null,
        contactNumber: form.contactNumber,
        motherName: form.motherName.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        collegeName: form.collegeName.trim()
      };

      let savedPlayer: Player;

      if (editingId !== null) {
        savedPlayer = await playerService.update(editingId, playerData);
      } else {
        if (!form.teamId) {
          setError("Please select a team.");
          return;
        }

        savedPlayer = await playerService.add(
          Number(form.teamId),
          playerData
        );
      }

      if (selectedImage && savedPlayer.id) {
        await playerService.uploadImage(savedPlayer.id, selectedImage);
      }

      setMessage(
        editingId !== null
          ? "Player updated successfully!"
          : "Player added successfully!"
      );

      setShowForm(false);
      setForm(emptyForm);
      setSelectedImage(null);
      setEditingId(null);

      await loadData();
    } catch (err) {
      console.error("Save Player Error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to save player."
        );
      } else {
        setError("Something went wrong while saving player.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManage || !Number.isFinite(id)) return;

    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await playerService.delete(id);
      setMessage("Player deleted successfully!");
      await loadData();
    } catch (err) {
      console.error("Delete Player Error:", err);

      if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        setError(
          typeof data === "string"
            ? data
            : data?.detail ||
              data?.message ||
              data?.error ||
              "Unable to delete player. Player may be assigned to a match squad."
        );
      } else {
        setError("Something went wrong while deleting player.");
      }
    }
  };

  const calculateAge = (dob?: string | null) => {
    if (!dob) return "Not provided";

    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return "Not provided";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? `${age} years` : "Not provided";
  };

  const filteredPlayers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return players.filter((player) => {
      const matchesTeam =
        selectedTeam === "ALL" ||
        String(player.team?.id ?? "") === selectedTeam;

      const matchesSearch =
        !search ||
        (player.playerName || "").toLowerCase().includes(search) ||
        (player.contactNumber || "").toLowerCase().includes(search) ||
        (player.email || "").toLowerCase().includes(search) ||
        (player.collegeName || "").toLowerCase().includes(search);

      return matchesTeam && matchesSearch;
    });
  }, [players, selectedTeam, searchText]);

  return (
    <div className="player-page">
      <section className="welcome-banner">
        <div>
          <span className="section-eyebrow">CRICKET OPERATIONS</span>
          <h1>Player Management</h1>
          <p>Manage player profiles and personal information.</p>
        </div>

        {canManage && (
          <button className="primary-button" onClick={openAddForm}>
            + Add New Player
          </button>
        )}
      </section>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      {showForm && canManage && (
        <section className="content-panel">
          <div className="panel-heading">
            <h2>{editingId !== null ? "Edit Player" : "Add New Player"}</h2>
            <p>Enter cricket and personal information below.</p>
          </div>

          <form className="player-form" onSubmit={handleSave}>
            <h3 className="player-form-section-title">Cricket Information</h3>

            <label>
              Player Name
              <input
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                placeholder="Enter player name"
                required
              />
            </label>

            <label>
              Player Role
              <select
                value={form.playerRole}
                onChange={(e) => setForm({ ...form, playerRole: e.target.value })}
              >
                <option value="BATSMAN">Batsman</option>
                <option value="BOWLER">Bowler</option>
                <option value="ALL_ROUNDER">All Rounder</option>
                <option value="WICKET_KEEPER">Wicket Keeper</option>
              </select>
            </label>

            <label>
              Batting Style
              <select
                value={form.battingStyle}
                onChange={(e) => setForm({ ...form, battingStyle: e.target.value })}
              >
                <option value="RIGHT_HAND">Right Hand</option>
                <option value="LEFT_HAND">Left Hand</option>
              </select>
            </label>

            <label>
              Bowling Style
              <select
                value={form.bowlingStyle}
                onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value })}
              >
                <option value="NONE">None</option>
                <option value="RIGHT_ARM_FAST">Right Arm Fast</option>
                <option value="LEFT_ARM_FAST">Left Arm Fast</option>
                <option value="RIGHT_ARM_OFF_BREAK">Right Arm Off Break</option>
                <option value="RIGHT_ARM_LEG_BREAK">Right Arm Leg Break</option>
                <option value="LEFT_ARM_ORTHODOX">Left Arm Orthodox</option>
              </select>
            </label>

            <label>
              Jersey Number
              <input
                type="number"
                min="1"
                max="999"
                value={form.jerseyNumber}
                onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
                required
              />
            </label>

            <label>
              Nationality
              <input
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                required
              />
            </label>

            {editingId === null && (
              <label>
                Select Team
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <h3 className="player-form-section-title">Personal Information</h3>

            <label>
              Date of Birth
              <input
                type="date"
                value={form.dateOfBirth}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </label>

            <label>
              Contact Number
              <input
                type="tel"
                maxLength={10}
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10)
                  })
                }
                placeholder="10-digit mobile number"
                required
              />
            </label>

            <label>
              Mother Name
              <input
                value={form.motherName}
                onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                placeholder="Enter mother name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="player@example.com"
              />
            </label>

            <label>
              College Name
              <input
                value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                placeholder="Enter college name"
              />
            </label>

            <label className="player-address-field">
              Address
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter complete address"
              />
            </label>

            <h3 className="player-form-section-title">Profile Photo</h3>

            <label className="player-image-upload">
              Player Profile Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (file && file.size > 5 * 1024 * 1024) {
                    setError("Image must be smaller than 5 MB.");
                    e.target.value = "";
                    setSelectedImage(null);
                    return;
                  }

                  setError("");
                  setSelectedImage(file);
                }}
              />
              <small>JPG, PNG or WEBP. Maximum 5 MB.</small>
              {selectedImage && <small>Selected: {selectedImage.name}</small>}
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Player"
                    : "Save Player"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedImage(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-panel">
        <div className="player-list-heading">
          <div className="panel-heading">
            <h2>All Players</h2>
            <p>{filteredPlayers.length} players registered</p>
          </div>

          <select
            className="team-filter"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="ALL">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        <div className="player-search">
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by player name, contact, email or college..."
          />
        </div>

        {loading ? (
          <p>Loading players...</p>
        ) : filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <span>🏏</span>
            <h3>No players found</h3>
            <p>Try another search or team filter.</p>
          </div>
        ) : (
          <div className="player-grid">
            {filteredPlayers.map((player) => (
              <div className="player-card" key={player.id ?? `${player.playerName ?? "player"}-${player.jerseyNumber ?? "unknown"}`}>
                <div className="player-profile-image">
                  {player.imageUrl ? (
                    <img
                      src={`${API_BASE_URL}${player.imageUrl}`}
                      alt={displayText(player.playerName, "Player profile")}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="player-image-placeholder">
                      {(player.playerName || "P").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="player-card-top">
                  <div className="player-number">{`#${player.jerseyNumber ?? "—"}`}</div>
                  <span className="player-role">
                    {formatEnum(player.playerRole)}
                  </span>
                </div>

                <h3>{displayText(player.playerName, "Unknown Player")}</h3>

                <p><strong>Team:</strong> {displayText(player.team?.teamName, "Not assigned")}</p>
                <p><strong>Role:</strong> {formatEnum(player.playerRole)}</p>
                <p><strong>Bowling Style:</strong> {formatEnum(player.bowlingStyle)}</p>
                <p><strong>Age:</strong> {calculateAge(player.dateOfBirth)}</p>
                <p><strong>Contact:</strong> {displayText(player.contactNumber)}</p>

                <div className="card-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    View Details
                  </button>

                  {canManage && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => openEditForm(player)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => player.id != null && handleDelete(player.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedPlayer && (
        <div className="player-details-overlay">
          <section className="player-details-modal">
            <div className="player-details-heading">
              <div>
                <h2>Player Profile</h2>
                <p>Complete player information</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setSelectedPlayer(null)}
              >
                Close
              </button>
            </div>

            <div className="player-details-content">
              <div className="player-details-photo">
                {selectedPlayer.imageUrl ? (
                  <img
                    src={`${API_BASE_URL}${selectedPlayer.imageUrl}`}
                    alt={displayText(selectedPlayer.playerName, "Player profile")}
                  />
                ) : (
                  <span>
                    {displayText(selectedPlayer.playerName, "P").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h2>{displayText(selectedPlayer.playerName, "Unknown Player")}</h2>
              <p>#{selectedPlayer.jerseyNumber ?? "—"} · {formatEnum(selectedPlayer.playerRole)}</p>

              <div className="player-details-grid">
                <p><strong>Team:</strong> {displayText(selectedPlayer.team?.teamName, "Not assigned")}</p>
                <p><strong>Age:</strong> {calculateAge(selectedPlayer.dateOfBirth)}</p>
                <p><strong>Date of Birth:</strong> {displayText(selectedPlayer.dateOfBirth)}</p>
                <p><strong>Contact:</strong> {displayText(selectedPlayer.contactNumber)}</p>
                <p><strong>Mother Name:</strong> {displayText(selectedPlayer.motherName)}</p>
                <p><strong>Email:</strong> {displayText(selectedPlayer.email)}</p>
                <p><strong>College:</strong> {displayText(selectedPlayer.collegeName)}</p>
                <p><strong>Nationality:</strong> {displayText(selectedPlayer.nationality)}</p>
                <p><strong>Batting Style:</strong> {displayText(selectedPlayer.battingStyle)}</p>
                <p><strong>Bowling Style:</strong> {displayText(selectedPlayer.bowlingStyle)}</p>
                <p className="player-details-address">
                  <strong>Address:</strong> {displayText(selectedPlayer.address)}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PlayerPage;
