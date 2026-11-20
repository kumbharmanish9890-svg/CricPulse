
import api from "./api";

export interface TeamMatchHistory {
  id: number;
  team1: string;
  team2: string;
  matchStatus: string;
  winner: string | null;
  resultSummary: string | null;
}

const teamComparisonService = {
  getCompletedMatches: async (): Promise<TeamMatchHistory[]> => {
    const response = await api.get<TeamMatchHistory[]>("/matches/history");
    return response.data;
  },
};

export default teamComparisonService;
