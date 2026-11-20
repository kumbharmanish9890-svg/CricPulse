
import api from "./api";

export interface PointsTableEntry {
  id: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  points: number;
  runsScored: number;
  ballsFaced: number;
  runsConceded: number;
  ballsBowled: number;
  netRunRate: number;
  team: {
    id: number;
    teamName: string;
    shortName: string;
  };
}

export const getPointsTable = async (
  tournamentId: number
): Promise<PointsTableEntry[]> => {
  const response = await api.get(
    `/points-table/tournament/${tournamentId}`
  );

  return response.data;
};
