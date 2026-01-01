import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

/** Typage du token */
interface SessionUser {
  userId?: number;
  role?: "BANK_ADMIN" | "MERCHANT";
  sub?: string;
}

/** Typage du contexte */
interface AuthContextType {
  user: SessionUser | null;
  login: (token: string, role?: "BANK_ADMIN" | "MERCHANT", userId?: number) => void;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  /** Initialisation au chargement */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as "BANK_ADMIN" | "MERCHANT" | null;
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? parseInt(userIdStr, 10) : undefined;

    if (token) {
      setUser({ role: role ?? undefined, userId });
    }

    setLoading(false);
  }, []);

  const login = (token: string, role?: "BANK_ADMIN" | "MERCHANT", userId?: number) => {
    localStorage.setItem("token", token);
    if (role) localStorage.setItem("role", role);
    if (userId !== undefined) localStorage.setItem("userId", String(userId));
    setUser({ role, userId });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
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
