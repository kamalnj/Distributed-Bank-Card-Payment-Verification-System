import { useEffect, useMemo, useState } from 'react'
import { MdAssessment, MdTrendingUp, MdCreditCard, MdPayment, MdList, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md'
import type { TransactionEntity, PaymentEntity, BankCard } from '../../types'

// Helper pour formater la devise
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

// Helper pour formater la date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function StatCard({ label, value, icon: Icon, color, subtext }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; subtext?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-slate-50">
          <Icon size={24} className={color} />
        </div>
        {subtext && <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
        <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
      </div>
      <div className={`absolute -right-6 -bottom-6 opacity-5 pointer-events-none ${color}`}>
        <Icon size={120} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">—</span>
  const s = status.toLowerCase()
  
  if (s.includes('success') || s.includes('valid')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        <MdCheckCircle size={12} /> Validée
      </span>
    )
  }
  if (s.includes('fail') || s.includes('refus')) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
        <MdCancel size={12} /> Refusée
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      <MdAccessTime size={12} /> {status}
    </span>
  )
}

function groupByDay(dates: string[]) {
  const counts: Record<string, number> = {}
  for (const ds of dates) {
    if (!ds) continue
    const day = ds.substring(0, 10) // YYYY-MM-DD
    counts[day] = (counts[day] ?? 0) + 1
  }
  // Sort by date
  return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]))
}

export default function AdminDashboard() {
  const [txs, setTxs] = useState<TransactionEntity[]>([])
  const [pays, setPays] = useState<PaymentEntity[]>([])
  const [cards, setCards] = useState<BankCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const BASIC_USER = 'admin'
  const BASIC_PASS = 'admin'
  
  const TX_URL = 'http://localhost:8082/api/transactions/list'
  const PAY_URL = 'http://localhost:8083/merchant/api/payments/list'
  const CARD_URL = 'http://localhost:8081/admin/cards/list'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const headers = { 'Authorization': 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`) }
        
        const [rTx, rPay, rCard] = await Promise.all([
          fetch(TX_URL, { headers, credentials: 'include' }),
          fetch(PAY_URL, { headers, credentials: 'include' }),
          fetch(CARD_URL, { headers, credentials: 'include' })
        ])

        const txData = rTx.ok ? await rTx.json() : []
        const payData = rPay.ok ? await rPay.json() : []
        const cardData = rCard.ok ? await rCard.json() : []

        setTxs(Array.isArray(txData) ? txData : [])
        setPays(Array.isArray(payData) ? payData : [])
        setCards(Array.isArray(cardData) ? cardData : [])
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les données. Vérifiez que les services sont démarrés.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Stats
  const totalVolume = useMemo(() => txs.reduce((acc, t) => acc + (t.montant || 0), 0), [txs])
  const successRate = useMemo(() => {
    if (txs.length === 0) return 0
    const success = txs.filter(t => t.status === 'SUCCESS').length
    return Math.round((success / txs.length) * 100)
  }, [txs])

  // Recent Items
  const recentTxs = useMemo(() => 
    [...txs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  , [txs])

  const recentPays = useMemo(() => 
    [...pays].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  , [pays])

  const activeCardsCount = useMemo(() => cards.filter(c => c.active).length, [cards])

  // Chart Data (Simple Sparkline)
  const chartPoints = useMemo(() => {
    const data = groupByDay(txs.map(t => t.createdAt))
    if (data.length === 0) return ''
    const maxVal = Math.max(1, ...data.map(([, v]) => v))
    // Normalize to 0-100 height, width spread evenly
    const width = 300
    const height = 100
    return data.map(([, v], i) => {
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - (v / maxVal) * height
      return `${x},${y}`
    }).join(' ')
  }, [txs])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Espace Administrateur</div>
            <h1 className="text-3xl font-bold text-slate-900">Vue d'ensemble</h1>
            <p className="text-slate-500 mt-1">Suivi de l'activité du système en temps réel</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-xs text-slate-500">Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <MdCancel size={20} />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Volume Total" 
            value={formatCurrency(totalVolume)} 
            icon={MdTrendingUp} 
            color="text-indigo-600"
            subtext={`${txs.length} transactions`}
          />
          <StatCard 
            label="Paiements Initiés" 
            value={String(pays.length)} 
            icon={MdPayment} 
            color="text-emerald-600"
          />
          <StatCard 
            label="Cartes Gérées" 
            value={String(cards.length)} 
            icon={MdCreditCard} 
            color="text-violet-600"
            subtext={`${activeCardsCount} actives`}
          />
          <StatCard 
            label="Taux de Succès" 
            value={`${successRate}%`} 
            icon={MdAssessment} 
            color="text-amber-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MdList className="text-indigo-500" /> Dernières Transactions
              </h3>
              <span className="text-xs font-medium text-slate-400">Top 5</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Montant</th>
                    <th className="px-6 py-3 font-medium">Carte</th>
                    <th className="px-6 py-3 font-medium text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTxs.length > 0 ? recentTxs.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">#{t.id}</td>
                      <td className="px-6 py-3 text-slate-600">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{formatCurrency(t.montant)}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{t.cardNumber}</td>
                      <td className="px-6 py-3 text-right">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">Aucune transaction trouvée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Chart & Extra Info */}
          <div className="space-y-6">
            {/* Chart Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-1">Activité Transactionnelle</h3>
                <p className="text-indigo-200 text-sm mb-6">Volume quotidien</p>
                
                <div className="h-32 w-full flex items-end">
                   {chartPoints ? (
                    <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="overflow-visible">
                      <path 
                        d={`M0,100 ${chartPoints.split(' ').map(p => `L${p}`).join(' ')} L300,100 Z`} 
                        fill="rgba(255,255,255,0.1)" 
                      />
                      <polyline 
                        points={chartPoints} 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-indigo-200 text-sm italic">
                       Pas assez de données
                     </div>
                   )}
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/10 blur-2xl" />
            </div>

            {/* Recent Payments (Merchant side) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <h3 className="font-semibold text-slate-800 text-sm">Derniers Paiements (Marchand)</h3>
              </div>
              <ul className="divide-y divide-slate-50">
                {recentPays.length > 0 ? recentPays.map((p, i) => (
                  <li key={i} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{formatCurrency(p.montant)}</div>
                      <div className="text-xs text-slate-400">{formatDate(p.createdAt)}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                )) : (
                  <li className="px-6 py-4 text-center text-xs text-slate-400">Aucun paiement récent</li>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
