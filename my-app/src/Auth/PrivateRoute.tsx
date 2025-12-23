import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";
import { CgSpinner } from "react-icons/cg";

interface Props {
  children: JSX.Element;
  role?: "BANK_ADMIN" | "MERCHANT";
}

export default function PrivateRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

if (loading) return <CgSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
