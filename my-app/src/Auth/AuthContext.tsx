import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

/** Typage du token */
interface JwtPayload {
  sub: string;
  role: "BANK_ADMIN" | "MERCHANT";
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/** Typage du contexte */
interface AuthContextType {
  user: JwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  /** Initialisation au chargement */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        setUser(jwtDecode<JwtPayload>(token));
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode<JwtPayload>(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
