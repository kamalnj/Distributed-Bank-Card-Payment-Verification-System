import api from "../api/axios";

/** Typage de la réponse API login */
export interface LoginResponse {
  token: string;
  role: "BANK_ADMIN" | "MERCHANT";
  userId: number;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  // Si l'API renvoie un message au lieu d'un objet LoginResponse complet
  if (!response.data.token) {
     // Fallback si le token est dans les cookies mais pas dans le corps
     // Mais ici on attend un token dans le body
     console.warn("No token in login response:", response.data);
  }

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem("token");
};
