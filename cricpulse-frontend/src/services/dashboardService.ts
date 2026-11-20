import api from "./api";

export const getDashboard = async (role: string) => {
  const rolePath: Record<string, string> = {
    ADMIN: "admin",
    SCORER: "scorer",
    TEAM_MANAGER: "team-manager",
    VIEWER: "viewer",
  };

  const path = rolePath[role];

  if (!path) {
    throw new Error("Invalid user role");
  }

  const response = await api.get(`/dashboard/${path}`);
  return response.data;
};

export const getMatches = async () => {
  const response = await api.get("/matches");
  return response.data;
};

export const addMatch = async (match: any) => {
  const response = await api.post("/matches", match);
  return response.data;
};

export const updateMatch = async (id: number, match: any) => {
  const response = await api.put(`/matches/${id}`, match);
  return response.data;
};

export const deleteMatch = async (id: number) => {
  const response = await api.delete(`/matches/${id}`);
  return response.data;
};