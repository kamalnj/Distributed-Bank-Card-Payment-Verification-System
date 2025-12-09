import './App.css'
import SidebarNav from './components/SidebarNav'
import CreatePaymentRequest from './pages/Merchant/CreatePaymentRequest'
import TransactionsHistory from './pages/Merchant/TransactionsHistory'
import TransactionDetails from './pages/Merchant/TransactionDetails'
import Dashboard from './pages/Merchant/Dashboard'
import { useState } from 'react'

export default function App() {
  const [view, setView] = useState<'dashboard' | 'create' | 'history' | 'details'>('dashboard')
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav onNavigate={(v) => setView(v)} />
      <div className="flex-1 overflow-auto">
        {view === 'dashboard' && <Dashboard />}
        {view === 'create' && <CreatePaymentRequest />}
        {view === 'history' && (
          <TransactionsHistory
            onViewDetails={() => {
              setView('details')
            }}
          />
        )}
        {view === 'details' && <TransactionDetails />}
      </div>
    </div>
  )
}
