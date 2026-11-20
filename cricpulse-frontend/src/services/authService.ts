
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    loginData
  );

  // Save JWT token in browser
  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
