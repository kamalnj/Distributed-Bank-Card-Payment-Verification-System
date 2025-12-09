import { useState } from 'react'

type Transaction = {
  id: string
  date: string
  amount: number
  status: 'Validée' | 'Refusée' | 'En attente'
  details: string
}

const data: Transaction[] = [
  { id: 'TX-1001', date: '2025-12-01 10:22', amount: 250.0, status: 'Validée', details: 'Paiement facture #F-001' },
  { id: 'TX-1002', date: '2025-12-01 11:03', amount: 120.5, status: 'Refusée', details: 'Carte expirée' },
  { id: 'TX-1003', date: '2025-12-02 09:15', amount: 89.99, status: 'En attente', details: 'Vérification 3-D Secure' },
  { id: 'TX-1004', date: '2025-12-02 14:41', amount: 560.0, status: 'Validée', details: 'Achat en ligne' },
  { id: 'TX-1005', date: '2025-12-03 08:05', amount: 39.0, status: 'Validée', details: 'Abonnement mensuel' },
  { id: 'TX-1006', date: '2025-12-03 16:27', amount: 310.75, status: 'Refusée', details: 'Solde insuffisant' },
]

function badgeClasses(s: Transaction['status']) {
  if (s === 'Validée') return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
  if (s === 'Refusée') return 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
  return 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
}

export default function TransactionsHistory({ onViewDetails }: { onViewDetails?: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Transactions</div>
            <h1 className="text-3xl font-bold text-slate-900">Historique des transactions</h1>
            <p className="text-slate-600 mt-1">Aperçu de toutes vos opérations</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-300" />
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200/80">
                <tr className="text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((t) => (
                  <>
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-slate-800">{t.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{t.date}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{t.amount.toFixed(2)} MAD</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClasses(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline underline-offset-2"
                          onClick={() => {
                            if (onViewDetails) {
                              onViewDetails(t.id)
                            } else {
                              setExpanded((e) => (e === t.id ? null : t.id))
                            }
                          }}
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                    {expanded === t.id && (
                      <tr>
                        <td className="px-6 py-4 bg-slate-50/50 text-sm text-slate-700" colSpan={5}>
                          {t.details}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
