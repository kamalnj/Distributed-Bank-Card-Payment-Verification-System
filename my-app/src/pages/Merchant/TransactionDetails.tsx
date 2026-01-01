import { MdCreditCard, MdCheckCircle, MdError, MdInfo, MdShield, MdArrowBack } from 'react-icons/md'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

type BankResponse = {
  status: 'Validée' | 'Refusée' | 'En attente'
  code: string
  message: string
  authCode?: string
  risk: 'Low' | 'Medium' | 'High'
  reference: string
}

type SampleTransaction = {
  id: string
  amount: number
  currency: string
  timestamp: string
  card: { brand: string; number: string; holder: string; expiration: string }
  bankResponse: BankResponse
}

const sample: SampleTransaction = {
  id: 'TX-1010',
  amount: 149.95,
  currency: 'MAD',
  timestamp: '2025-12-04 12:41',
  card: { brand: 'Visa', number: '4111111111111111', holder: 'Jean Dupont', expiration: '2026-03' },
  bankResponse: { status: 'Validée', code: '00', message: 'Transaction approuvée', authCode: 'A12345', risk: 'Low', reference: 'BR-98432' },
}

function maskCard(n: string) {
  const d = n.replace(/\D+/g, '')
  if (d.length < 8) return '**** **** **** ****'
  const head = d.slice(0, 4)
  const tail = d.slice(-4)
  return `${head} **** **** ${tail}`
}

function BrandIcon({ brand }: { brand: string }) {
  const b = brand.toLowerCase()
  if (b.includes('visa')) return <FaCcVisa size={36} />
  if (b.includes('master') || b.includes('mc')) return <FaCcMastercard size={36} />
  if (b.includes('amex')) return <FaCcAmex size={36} />
  return <MdCreditCard size={28} />
}

function StatusBadge({ status }: { status: BankResponse['status'] }) {
  const m = {
    Validée: { cls: 'bg-green-100 text-green-700', Icon: MdCheckCircle },
    Refusée: { cls: 'bg-red-100 text-red-700', Icon: MdError },
    'En attente': { cls: 'bg-amber-100 text-amber-700', Icon: MdInfo },
  }[status]
  const I = m.Icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${m.cls}`}>
      <I size={14} /> {status}
    </span>
  )
}

export default function TransactionDetails() {
  const t = sample
  const navigate = useNavigate()
  return (
    <div className="p-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Espace Marchand</div>
            <h1 className="text-3xl font-bold text-slate-900">Détails de la Transaction</h1>
            <p className="text-slate-500 mt-1">Vue détaillée et synthèse de l’opération</p>
            <div className="mt-2 text-sm text-slate-400">
              <span className="bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">#{t.id}</span>
              <span className="mx-2">•</span>
              <span>{t.timestamp}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/merchant/history')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <MdArrowBack size={18} />
            <span className="text-sm">Retour à l’historique</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Transaction ID</div>
            <div className="mt-1 font-mono text-sm text-slate-700">#{t.id}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Date</div>
            <div className="mt-1 text-slate-800">{t.timestamp}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Montant</div>
            <div className="mt-1 font-semibold text-slate-800">{t.amount.toFixed(2)} {t.currency}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Statut</div>
            <div className="mt-1"><StatusBadge status={t.bankResponse.status} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-slate-800">Informations carte</div>
              <BrandIcon brand={t.card.brand} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Titulaire</div>
                <div className="font-medium text-slate-800">{t.card.holder}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Numéro</div>
                <div className="font-mono text-slate-800">{maskCard(t.card.number)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Expiration</div>
                <div className="text-slate-800">{t.card.expiration}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Marque</div>
                <div className="text-slate-800">{t.card.brand}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-slate-800">Réponse du serveur bancaire</div>
              <MdShield className="text-indigo-600" size={24} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Statut</div>
                <StatusBadge status={t.bankResponse.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Code</div>
                <div className="font-mono text-sm text-slate-800">{t.bankResponse.code}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Message</div>
                <div className="text-slate-800">{t.bankResponse.message}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Auth Code</div>
                <div className="font-mono text-sm text-slate-800">{t.bankResponse.authCode || '—'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Risk</div>
                <div className="text-slate-800">{t.bankResponse.risk}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Référence</div>
                <div className="font-mono text-sm text-slate-800">{t.bankResponse.reference}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400">Les informations affichées ci‑dessus sont issues de l’opération bancaire.</div>
      </div>
    </div>
  )
}

