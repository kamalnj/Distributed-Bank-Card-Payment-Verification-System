import api from "../api/axios";

/** Typage de la réponse API login */
export interface LoginResponse {
  token: string;
  role: "BANK_ADMIN" | "MERCHANT";
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("token");
};
