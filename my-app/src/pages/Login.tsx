import { useState, type FormEvent, type JSX } from "react";
import { useAuth } from "../Auth/AuthContext";
import { login as loginApi } from "../Auth/authService";
import { useNavigate } from "react-router-dom";

/** Typage de la réponse API */
interface LoginResponse {
  token: string;
  role: "BANK_ADMIN" | "MERCHANT";
  userId: number;
}

export default function Login(): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: LoginResponse = await loginApi(username, password);
      console.log("Login success. Token:", data.token); // DEBUG
      login(data.token, data.role, data.userId);

      if (data.role === "BANK_ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/merchant/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Connexion</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Votre nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              loading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Système de Vérification Distribuée
        </p>
      </div>
    </div>
  );
}
