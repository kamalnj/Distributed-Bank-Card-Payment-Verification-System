import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import {
  MdDashboard,
  MdPayment,
  MdHistory,
  MdCreditCard,
  MdLogout,
  MdAccountBalanceWallet
} from "react-icons/md";

export default function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const active = isActive(path);
    return (
      <li
        onClick={() => navigate(path)}
        className={`group relative flex cursor-pointer items-center space-x-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon 
          size={22} 
          className={`transition-colors ${
            active ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
          }`} 
        />
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </li>
    );
  };

  // Extract initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  const userName = user.sub || user.role || "Utilisateur";
  const userInitials = getInitials(userName);
  const userRoleDisplay = user.role === "BANK_ADMIN" ? "Administrateur" : "Commerçant";

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col bg-white border-r border-slate-200 z-50 shadow-sm font-sans">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 px-8 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <MdAccountBalanceWallet size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">BankSystem</h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Enterprise</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        {/* MERCHANT Section */}
        {user.role === "MERCHANT" && (
          <div className="space-y-2">
             <div className="px-4 pb-2">
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Espace Marchand</p>
             </div>
            <ul className="space-y-1">
              <NavItem path="/merchant/dashboard" icon={MdDashboard} label="Tableau de bord" />
              <NavItem path="/merchant/create" icon={MdPayment} label="Nouveau Paiement" />
              <NavItem path="/merchant/history" icon={MdHistory} label="Historique" />
              <NavItem path="/merchant/mobile-token" icon={MdPayment} label="Jeton Mobile" />
            </ul>
          </div>
        )}

        {/* ADMIN Section */}
        {user.role === "BANK_ADMIN" && (
          <div className="space-y-2">
            <div className="px-4 pb-2">
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Administration</p>
             </div>
            <ul className="space-y-1">
              <NavItem path="/admin/dashboard" icon={MdDashboard} label="Tableau de bord" />
              <NavItem path="/admin/cards" icon={MdCreditCard} label="Gestion des cartes" />
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-100 p-4 m-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-indigo-100 text-indigo-600 font-bold text-sm shadow-sm">
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate" title={userName}>{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userRoleDisplay}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="group flex w-full items-center justify-center space-x-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-red-600 transition-all hover:bg-red-50 hover:border-red-200 hover:shadow-sm active:scale-95"
        >
          <MdLogout size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
