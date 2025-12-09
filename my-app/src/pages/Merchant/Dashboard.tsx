import { MdTrendingUp, MdCheckCircle, MdError, MdAssessment } from 'react-icons/md'

type StatCardProps = { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
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

const transactions = [
  { id: 'TX-2011', date: '2025-12-04 12:41', amount: 149.95, status: 'Validée' },
  { id: 'TX-2012', date: '2025-12-04 13:08', amount: 89.0, status: 'En attente' },
  { id: 'TX-2013', date: '2025-12-04 15:22', amount: 320.5, status: 'Refusée' },
  { id: 'TX-2014', date: '2025-12-05 09:11', amount: 59.99, status: 'Validée' },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Aperçu</div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="h-1.5 w-28 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Volume du jour" value="1 259 MAD" icon={MdTrendingUp} color="text-indigo-600" />
          <StatCard label="Validées" value="128" icon={MdCheckCircle} color="text-emerald-600" />
          <StatCard label="Refusées" value="12" icon={MdError} color="text-rose-600" />
          <StatCard label="Taux d’acceptation" value="91%" icon={MdAssessment} color="text-amber-600" />
        </div>

        <div className="mt-6 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Transactions récentes</div>
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200/80">
                <tr className="text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors duration-150 ease-in-out">
                    <td className="px-6 py-4 font-mono text-sm text-slate-800">{t.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{t.amount.toFixed(2)} MAD</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        t.status === 'Validée'
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                          : t.status === 'Refusée'
                          ? 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

