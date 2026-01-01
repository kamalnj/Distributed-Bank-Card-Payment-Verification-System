import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MdHistory, MdSearch, MdFilterList, MdCheckCircle, MdCancel, 
  MdAccessTime, MdKeyboardArrowDown, MdKeyboardArrowUp, MdRefresh,
  MdAttachMoney, MdAssessment, MdReceipt
} from 'react-icons/md'
import type { Transaction, TransactionEntity } from '../../types'

// Helper pour formater la devise
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

// Helper pour formater la date
const formatDate = (dateStr: string) => 
  new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

import { useAuth } from '../../Auth/AuthContext'

export default function TransactionsHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Validée' | 'Refusée'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('http://localhost:8082/api/transactions/list', { credentials: 'include' })
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`)
      }
      
      const data: TransactionEntity[] = await res.json()
      
      // Filtrer pour n'afficher que les transactions de l'utilisateur connecté
      const userTransactions = user?.userId 
        ? data.filter(t => t.userId == user.userId)
        : [];

      // Trier par date décroissante
      const mapped: Transaction[] = userTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(t => ({
          id: String(t.id), // Keep raw ID for logic, format for display
          date: t.createdAt,
          amount: t.montant,
          status: t.status === 'SUCCESS' ? 'Validée' : t.status === 'FAILED' ? 'Refusée' : 'En attente',
          details: t.bankMessage || 'Aucun détail disponible'
        }))
      
      setTransactions(mapped)
    } catch (err) {
      console.error(err)
      setError('Impossible de charger l\'historique des transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.id.includes(searchTerm) || t.amount.toString().includes(searchTerm)
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [transactions, searchTerm, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const total = transactions.length
    const volume = transactions.reduce((acc, t) => acc + t.amount, 0)
    const successCount = transactions.filter(t => t.status === 'Validée').length
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0
    return { total, volume, successRate }
  }, [transactions])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Espace Marchand</div>
            <h1 className="text-3xl font-bold text-slate-900">Historique des Transactions</h1>
            <p className="text-slate-500 mt-1">Consultez et filtrez l'ensemble de vos transactions passées</p>
          </div>
          <button 
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <MdRefresh size={20} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <MdReceipt size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Total Transactions</div>
              <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MdAttachMoney size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Volume Total</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.volume)}</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <MdAssessment size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Taux de Succès</div>
              <div className="text-2xl font-bold text-slate-800">{stats.successRate}%</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Filters */}
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full md:w-96 group">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par ID ou montant..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <MdFilterList className="text-slate-400" />
                <select 
                  className="bg-transparent border-none outline-none text-sm text-slate-600 font-medium cursor-pointer min-w-[100px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Tous les états</option>
                  <option value="Validée">Validée</option>
                  <option value="Refusée">Refusée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-sm font-medium">Chargement des transactions...</span>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-500 flex flex-col items-center gap-2">
                <MdCancel size={32} />
                <span className="font-medium">{error}</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">
                Aucune transaction ne correspond à vos critères.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">ID Transaction</th>
                    <th className="px-6 py-4">Date & Heure</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map((t) => (
                    <>
                      <tr 
                        key={t.id} 
                        onClick={() => toggleExpand(t.id)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${expandedId === t.id ? 'bg-slate-50/80' : ''}`}
                      >
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-medium">
                          <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">#{t.id}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(t.date)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            t.status === 'Validée' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : t.status === 'Refusée'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {t.status === 'Validée' && <MdCheckCircle size={14} />}
                            {t.status === 'Refusée' && <MdCancel size={14} />}
                            {t.status === 'En attente' && <MdAccessTime size={14} />}
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/merchant/details/${t.id}`) }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 text-xs"
                          >
                            <MdReceipt size={16} />
                            Voir détails
                          </button>
                        </td>
                      </tr>
                      {expandedId === t.id && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <MdHistory /> Détails de la banque
                              </h4>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {t.details}
                              </p>
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                                <span>ID: {t.id}</span>
                                <span>•</span>
                                <span>Traité le: {formatDate(t.date)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
