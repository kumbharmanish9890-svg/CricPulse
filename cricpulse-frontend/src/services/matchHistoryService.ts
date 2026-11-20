
import api from "./api";

export interface MatchHistory {
  id: number;
  team1: string;
  team2: string;
  venue: string;
  matchStatus: string;
  matchFormat: string;
  matchDate: string;
  winner: string | null;
  resultSummary: string | null;
}

const matchHistoryService = {
  getCompletedMatches: async (): Promise<MatchHistory[]> => {
    const response = await api.get<MatchHistory[]>("/matches/history");
    return response.data;
  }
};

export default matchHistoryService;
