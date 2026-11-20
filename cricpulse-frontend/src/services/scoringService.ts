
import api from "./api";

export interface Innings {
  id: number;
  inningsNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  target?: number;
  inningsStatus: string;
}

export interface BallDelivery {
  id: number;
  overNumber: number;
  ballNumber: number;
  batsman: string;
  bowler: string;
  runs: number;
  extraRuns: number;
  totalRuns: number;
  extraType: string;
  wicket: boolean;
  wicketType?: string;
  dismissedPlayer?: string;
  legalDelivery: boolean;
}

export interface BallInput {
  batsman: string;
  bowler: string;
  runs: number;
  extraRuns: number;
  extraType: string;
  wicket: boolean;
  wicketType?: string;
  dismissedPlayer?: string;
}

const scoringService = {
  getInnings: async (matchId: number) => {
    const response = await api.get<Innings[]>(
      `/innings/match/${matchId}`
    );
    return response.data;
  },

  getBallHistory: async (inningsId: number) => {
    const response = await api.get<BallDelivery[]>(
      `/ball-deliveries/innings/${inningsId}`
    );
    return response.data;
  },

  addBall: async (inningsId: number, ball: BallInput) => {
    const response = await api.post<BallDelivery>(
      `/ball-deliveries/innings/${inningsId}`,
      ball
    );
    return response.data;
  }
};

export default scoringService;
