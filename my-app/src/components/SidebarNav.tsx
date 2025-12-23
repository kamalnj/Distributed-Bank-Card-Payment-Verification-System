import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

export default function SidebarNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-white shadow-md">
      <ul className="p-4 space-y-4">

        {/* ===== MERCHANT ===== */}
        {user.role === "MERCHANT" && (
          <>
            <li onClick={() => navigate("/merchant/dashboard")} className="cursor-pointer">
              Dashboard
            </li>
            <li onClick={() => navigate("/merchant/create")} className="cursor-pointer">
              Create Payment
            </li>
            <li onClick={() => navigate("/merchant/history")} className="cursor-pointer">
              History
            </li>
          </>
        )}

        {/* ===== ADMIN ===== */}
        {user.role === "BANK_ADMIN" && (
          <>
            <li onClick={() => navigate("/admin/dashboard")} className="cursor-pointer">
              Admin Dashboard
            </li>
          </>
        )}

        <li
          onClick={logout}
          className="cursor-pointer text-red-500 mt-6"
        >
          Logout
        </li>

      </ul>
    </aside>
  );
}
