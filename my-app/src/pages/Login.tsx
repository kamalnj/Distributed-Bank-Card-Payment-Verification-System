import { useState, type FormEvent, type JSX } from "react";
import { useAuth } from "../Auth/AuthContext";
import { login as loginApi } from "../Auth/authService";


import { useNavigate } from "react-router-dom";

/** Typage de la réponse API */
interface LoginResponse {
  token: string;
  role: "BANK_ADMIN" | "MERCHANT";
}

export default function Login(): JSX.Element {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data: LoginResponse = await loginApi(username, password);
      login(data.token);

  if (data.role === "BANK_ADMIN") {
  navigate("/admin/dashboard");
} else {
  navigate("/merchant/dashboard");
}
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>
    </form>
  );
}
