import { useEffect, useMemo, useState } from 'react'
import { MdAssessment, MdTrendingUp, MdPayment, MdList, MdCheckCircle, MdCancel, MdAccessTime, MdError } from 'react-icons/md'
import type { PaymentEntity } from '../../types'
import { useAuth } from '../../Auth/AuthContext'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [pays, setPays] = useState<PaymentEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const BASIC_USER = 'admin'
  const BASIC_PASS = 'admin'
  
  // URL des paiements marchands
  const PAY_URL = 'http://localhost:8083/merchant/api/payments/list'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const headers = { 'Authorization': 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`) }
        
        const res = await fetch(PAY_URL, { headers, credentials: 'include' })
        if (!res.ok) throw new Error('Erreur de chargement')
        
        const data: PaymentEntity[] = await res.json()
        
        // Filtrer pour n'afficher que les paiements de l'utilisateur connecté
        const userPayments = user?.userId 
          ? (data || []).filter(p => p.userId == user.userId)
          : [];

        setPays(userPayments)
        
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les données. Vérifiez que le service de paiement est démarré.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Stats
  const totalVolume = useMemo(() => pays.reduce((acc, p) => acc + (p.montant || 0), 0), [pays])
  
  const todayVolume = useMemo(() => {
    const today = new Date().toDateString()
    return pays.reduce((acc, p) => {
      if (new Date(p.createdAt).toDateString() === today) return acc + (p.montant || 0)
      return acc
    }, 0)
  }, [pays])

  const successRate = useMemo(() => {
    if (pays.length === 0) return 0
    const success = pays.filter(p => p.status === 'SUCCESS').length
    return Math.round((success / pays.length) * 100)
  }, [pays])

  const failedCount = useMemo(() => pays.filter(p => p.status === 'FAILED').length, [pays])

  // Recent Items
  const recentPays = useMemo(() => 
    [...pays].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  , [pays])

  // Chart Data (Simple Sparkline based on Payment count)
  const chartPoints = useMemo(() => {
    const data = groupByDay(pays.map(p => p.createdAt))
    if (data.length === 0) return ''
    const maxVal = Math.max(1, ...data.map(([, v]) => v))
    const width = 300
    const height = 100
    return data.map(([, v], i) => {
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - (v / maxVal) * height
      return `${x},${y}`
    }).join(' ')
  }, [pays])

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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Espace Marchand</div>
            <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">Vos encaissements et statistiques en temps réel</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-xs text-slate-500">Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <MdError size={20} />
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
            subtext={`${pays.length} paiements`}
          />
          <StatCard 
            label="Volume du Jour" 
            value={formatCurrency(todayVolume)} 
            icon={MdPayment} 
            color="text-emerald-600"
          />
          <StatCard 
            label="Paiements Échoués" 
            value={String(failedCount)} 
            icon={MdCancel} 
            color="text-rose-600"
          />
          <StatCard 
            label="Taux d'Acceptation" 
            value={`${successRate}%`} 
            icon={MdAssessment} 
            color="text-amber-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Payments Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MdList className="text-indigo-500" /> Paiements Récents
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
                  {recentPays.length > 0 ? recentPays.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">#{p.id}</td>
                      <td className="px-6 py-3 text-slate-600">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{formatCurrency(p.montant)}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">
                        {p.cardBrand ? `${p.cardBrand} •••• ${p.cardLast4}` : `•••• ${p.cardLast4}`}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">Aucun paiement trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-full">
              <div className="relative z-10 h-full flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Activité des Ventes</h3>
                  <p className="text-indigo-200 text-sm mb-6">Nombre de paiements par jour</p>
                </div>
                
                <div className="flex-1 flex items-end">
                   {chartPoints ? (
                    <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="overflow-visible h-32 w-full">
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
                     <div className="w-full flex items-center justify-center text-indigo-200 text-sm italic">
                       Pas assez de données pour le graphique
                     </div>
                   )}
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/10 blur-2xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
