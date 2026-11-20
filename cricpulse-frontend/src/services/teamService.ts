
import api from "./api";

export interface Team {
  id?: number;
  teamName: string;
  shortName: string;
  country: string;
  coachName: string;
  tournament?: {
    id: number;
    tournamentName: string;
  };
}

const teamService = {
  getAll: async () => {
    const response = await api.get<Team[]>("/teams");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  getByTournament: async (tournamentId: number) => {
    const response = await api.get<Team[]>(
      `/teams/tournament/${tournamentId}`
    );
    return response.data;
  },

  add: async (tournamentId: number, team: Team) => {
    const response = await api.post(
      `/teams/tournament/${tournamentId}`,
      team
    );
    return response.data;
  },

  update: async (id: number, team: Team) => {
    const response = await api.put(`/teams/${id}`, team);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  }
};

export default teamService;
