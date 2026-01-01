import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';

import Dashboard from './pages/Merchant/Dashboard';
import CreatePaymentRequest from './pages/Merchant/CreatePaymentRequest';
import TransactionsHistory from './pages/Merchant/TransactionsHistory';
import TransactionDetails from './pages/Merchant/TransactionDetails';
import MobileToken from './pages/Merchant/MobileToken';

import AdminDashboard from './pages/Admin/AdminDashboard';
import CardCrud from './pages/Admin/CardCrud';

import SidebarNav from './components/SidebarNav';
import PrivateRoute from './Auth/PrivateRoute';
import { AuthProvider, useAuth } from './Auth/AuthContext';
import type { JSX } from 'react';

/* ===== LAYOUT AVEC SIDEBAR (POUR LES 2) ===== */
function AppLayout({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && <SidebarNav />}
      <div className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : ''}`}>
        <main className="mx-auto max-w-7xl p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />

          {/* MERCHANT */}
          <Route
            path="/merchant/*"
            element={
              <PrivateRoute role="MERCHANT">
                <AppLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="create" element={<CreatePaymentRequest />} />
                    <Route path="history" element={<TransactionsHistory />} />
                    <Route path="details/:id" element={<TransactionDetails />} />
                    <Route path="mobile-token" element={<MobileToken />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="BANK_ADMIN">
                <AppLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="cards" element={<CardCrud />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
