import api from "./api";

export interface Toss {
  id?: number;
  tossWinner: string;
  tossDecision: "BAT" | "BOWL";
  match?: {
    id: number;
    team1: string;
    team2: string;
  };
}

const tossService = {
  getToss: async (matchId: number) => {
    const response = await api.get<Toss>(`/toss/${matchId}`);
    return response.data;
  },

  saveToss: async (
    matchId: number,
    tossWinner: string,
    tossDecision: "BAT" | "BOWL"
  ) => {
    const response = await api.post(`/toss/${matchId}`, {
      tossWinner,
      tossDecision
    });
    return response.data;
  }
};

export default tossService;