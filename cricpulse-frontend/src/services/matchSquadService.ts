
import api from "./api";

export interface MatchSquad {
  id?: number;
  playing: boolean;
  captain: boolean;
  wicketKeeper: boolean;

  match: {
    id: number;
    team1: string;
    team2: string;
  };

  player: {
    id: number;
    playerName: string;
    playerRole: string;
    jerseyNumber: number;
    nationality: string;
    team: {
      id: number;
      teamName: string;
      shortName: string;
    };
  };
}

const matchSquadService = {
  getAll: async (matchId: number) => {
    const response = await api.get<MatchSquad[]>(
      `/match-squads/${matchId}`
    );
    return response.data;
  },

  getPlayingXI: async (matchId: number) => {
    const response = await api.get<MatchSquad[]>(
      `/match-squads/${matchId}/playing-xi`
    );
    return response.data;
  },

  getBench: async (matchId: number) => {
    const response = await api.get<MatchSquad[]>(
      `/match-squads/${matchId}/bench`
    );
    return response.data;
  },

  addPlayer: async (
    matchId: number,
    playerId: number,
    playing: boolean
  ) => {
    const response = await api.post(
      `/match-squads/${matchId}/player/${playerId}`,
      { playing }
    );
    return response.data;
  },

  updateRoles: async (
    squadId: number,
    captain: boolean,
    wicketKeeper: boolean
  ) => {
    const response = await api.put(
      `/match-squads/${squadId}/roles`,
      { captain, wicketKeeper }
    );
    return response.data;
  }
};

export default matchSquadService;
