
import api from "./api";

export interface Tournament {
  id?: number;
  tournamentName: string;
  tournamentFormat: string;
  tournamentStatus: string;
  location: string;
  startDate: string;
  endDate: string;
}

const tournamentService = {

  getAll: async () => {
    const response = await api.get<Tournament[]>("/tournaments");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Tournament>(`/tournaments/${id}`);
    return response.data;
  },

  add: async (tournament: Tournament) => {
    const response = await api.post("/tournaments", tournament);
    return response.data;
  },

  update: async (id: number, tournament: Tournament) => {
    const response = await api.put(`/tournaments/${id}`, tournament);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  }

};

export default tournamentService;
