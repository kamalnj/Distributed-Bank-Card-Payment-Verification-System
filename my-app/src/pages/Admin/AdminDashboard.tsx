import { useEffect, useMemo, useState } from 'react'
import { MdAssessment, MdTrendingUp, MdCreditCard, MdPayment, MdList } from 'react-icons/md'

type Tx = { id?: string; date?: string; amount?: number; status?: string; createdAt?: string }
type Pay = { id?: string; date?: string; amount?: number; status?: string; createdAt?: string }
type Card = { cardNumber?: string; expiration?: string; cvv?: string; balance?: number; active?: boolean; createdAt?: string }

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        <Icon size={22} className={color} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function titleOfStatus(s?: string) {
  if (!s) return 'Inconnu'
  const v = s.toLowerCase()
  if (v.includes('valid')) return 'Validée'
  if (v.includes('refus') || v.includes('fail')) return 'Refusée'
  return s
}

function groupByDay(dates: string[]) {
  const counts: Record<string, number> = {}
  for (const ds of dates) {
    const day = (() => {
      const t = ds ?? ''
      const iso = t.length >= 10 ? t.slice(0, 10) : t
      return iso
    })()
    counts[day] = (counts[day] ?? 0) + 1
  }
  const entries = Object.entries(counts).filter(([k]) => !!k).sort((a, b) => (a[0] > b[0] ? 1 : -1))
  return entries
}

export default function AdminDashboard() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [pays, setPays] = useState<Pay[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const BASIC_USER = 'admin'
  const BASIC_PASS = 'admin'
  const authOk = !!(BASIC_USER && BASIC_PASS)

  const TX_URL = 'http://192.168.11.102:8082/api/transactions/list'
  const PAY_URL = 'http://192.168.11.102:8081/api/payments/list'
  const CARD_URL = 'http://192.168.11.102:8080/admin/cards/list'

  useEffect(() => {
    const headers: Record<string, string> = {}
    if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
    Promise.all([
      fetch(TX_URL, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(PAY_URL, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(CARD_URL, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([t, p, c]) => {
        setTxs(Array.isArray(t) ? t : [])
        setPays(Array.isArray(p) ? p : [])
        setCards(Array.isArray(c) ? c : [])
      })
      .catch(() => setMessage('Erreur'))
      .finally(() => setLoading(false))
  }, [authOk])

  const recentTxs = useMemo(() => {
    const arr = [...txs]
    arr.sort((a, b) => {
      const da = (a.createdAt ?? a.date ?? '')
      const db = (b.createdAt ?? b.date ?? '')
      return da < db ? 1 : -1
    })
    return arr.slice(0, 4)
  }, [txs])

  const recentPays = useMemo(() => {
    const arr = [...pays]
    arr.sort((a, b) => {
      const da = (a.createdAt ?? a.date ?? '')
      const db = (b.createdAt ?? b.date ?? '')
      return da < db ? 1 : -1
    })
    return arr.slice(0, 4)
  }, [pays])

  const recentCards = useMemo(() => {
    const arr = [...cards]
    arr.sort((a, b) => {
      const da = (a.createdAt ?? a.expiration ?? '')
      const db = (b.createdAt ?? b.expiration ?? '')
      return da < db ? 1 : -1
    })
    return arr.slice(0, 4)
  }, [cards])

  const chartData = useMemo(() => {
    const dates = txs.map((t) => t.createdAt ?? t.date ?? '')
    return groupByDay(dates)
  }, [txs])

  const maxY = Math.max(1, ...chartData.map(([, v]) => v))
  const points = chartData.map(([, v], i) => {
    const x = (i / Math.max(1, chartData.length - 1)) * 300
    const y = 100 - (v / maxY) * 100
    return `${x},${y}`
  })

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Admin</div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="h-1.5 w-28 bg-linear-to-r from-indigo-600 to-purple-700 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Transactions" value={String(txs.length)} icon={MdTrendingUp} color="text-indigo-600" />
          <StatCard label="Paiements" value={String(pays.length)} icon={MdPayment} color="text-emerald-600" />
          <StatCard label="Cartes" value={String(cards.length)} icon={MdCreditCard} color="text-rose-600" />
          <StatCard label="Taux" value={chartData.length ? `${Math.round((maxY / Math.max(1, txs.length)) * 100)}%` : '—'} icon={MdAssessment} color="text-amber-600" />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Évolution des transactions</div>
              <div className="h-1 w-12 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full" />
            </div>
            <div className="p-6">
              <svg width="100%" height="140" viewBox="0 0 320 120">
                <polyline fill="none" stroke="#4f46e5" strokeWidth="2" points={points.join(' ')} />
              </svg>
              <div className="px-2 text-xs text-slate-500 flex gap-3 flex-wrap">
                {chartData.map(([d, v]) => (
                  <div key={d}>{d}: {v}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MdList /> Récentes</div>
              <div className="h-1 w-12 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full" />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Transactions</div>
                <ul className="space-y-1">
                  {recentTxs.map((t, i) => (
                    <li key={i} className="text-sm text-slate-700">{t.id ?? '—'} · {t.amount ?? '—'} · {titleOfStatus(t.status)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Paiements</div>
                <ul className="space-y-1">
                  {recentPays.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700">{p.id ?? '—'} · {p.amount ?? '—'} · {titleOfStatus(p.status)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Cartes</div>
                <ul className="space-y-1">
                  {recentCards.map((c, i) => (
                    <li key={i} className="text-sm text-slate-700">{c.cardNumber ?? '—'} · {c.expiration ?? '—'} · {c.active ? 'Active' : 'Inactive'}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {message && <div className={`mt-4 text-sm ${message === 'Erreur' ? 'text-rose-700' : 'text-emerald-700'}`}>{message}</div>}
        {loading && <div className="mt-2 text-sm text-slate-500">Chargement…</div>}
      </div>
    </div>
  )
}
