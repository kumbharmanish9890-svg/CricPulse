
import api from "./api";

export interface Player {
  id?: number;
  playerName: string;
  playerRole: string;
  battingStyle: string;
  bowlingStyle: string;
  jerseyNumber: number;
  nationality: string;

  // Personal Information
  dateOfBirth?: string | null;
  contactNumber?: string;
  motherName?: string;
  address?: string;
  email?: string;
  collegeName?: string;

  // Existing Information
  imageUrl?: string;
  team?: {
    id: number;
    teamName: string;
    shortName: string;
  };
}

// PLAYER STATISTICS INTERFACE
export interface PlayerStatistics {
  playerName: string;

  // Batting
  matchesPlayed: number;
  inningsPlayed: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  highestScore: number;
  notOuts: number;
  battingAverage: number;
  strikeRate: number;

  // Bowling
  wickets: number;
  runsConceded: number;
  ballsBowled: number;
  maidens: number;
  economy: number;
  bowlingAverage: number;
}

const playerService = {
  getAll: async () => {
    const response = await api.get<Player[]>("/players");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Player>(`/players/${id}`);
    return response.data;
  },

  getByTeam: async (teamId: number) => {
    const response = await api.get<Player[]>(`/players/team/${teamId}`);
    return response.data;
  },

  // SEARCH PLAYERS
  searchByName: async (name: string) => {
    const response = await api.get<Player[]>("/players/search", {
      params: { name }
    });
    return response.data;
  },

  searchByContact: async (contact: string) => {
    const response = await api.get<Player[]>("/players/search/contact", {
      params: { contact }
    });
    return response.data;
  },

  searchByEmail: async (email: string) => {
    const response = await api.get<Player[]>("/players/search/email", {
      params: { email }
    });
    return response.data;
  },

  add: async (teamId: number, player: Player) => {
    const response = await api.post(`/players/team/${teamId}`, player);
    return response.data;
  },

  update: async (id: number, player: Player) => {
    const response = await api.put(`/players/${id}`, player);
    return response.data;
  },

  // UPLOAD PLAYER IMAGE
  uploadImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<Player>(
      `/players/${id}/image`,
      formData
    );

    return response.data;
  },

  // GET PLAYER CAREER STATISTICS
  getStatistics: async (playerName: string) => {
    const response = await api.get<PlayerStatistics>(
      `/player-statistics/${encodeURIComponent(playerName)}`
    );

    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/players/${id}`);
    return response.data;
  }
};

export default playerService;
