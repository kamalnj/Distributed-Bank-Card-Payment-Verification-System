import './App.css'
import SidebarNav from './components/SidebarNav'
import CreatePaymentRequest from './pages/Merchant/CreatePaymentRequest'
import TransactionsHistory from './pages/Merchant/TransactionsHistory'
import { useState } from 'react'

export default function App() {
  const [view, setView] = useState<'create' | 'history'>('create')
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded-lg shadow-sm transition ${view === 'create' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:from-emerald-600 hover:to-teal-700 hover:bg-gradient-to-r hover:text-white'}`}
          >
            Create Payment
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg shadow-sm transition ${view === 'history' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:from-emerald-600 hover:to-teal-700 hover:bg-gradient-to-r hover:text-white'}`}
          >
            Transactions History
          </button>
        </div>
        {view === 'create' ? <CreatePaymentRequest /> : <TransactionsHistory />}
      </div>
    </div>
  )
}
