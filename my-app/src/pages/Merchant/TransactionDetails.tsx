import { MdCreditCard, MdCheckCircle, MdError, MdInfo, MdShield } from 'react-icons/md'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'

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
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-sm text-blue-600 font-medium">Transactions</div>
            <h1 className="text-2xl font-semibold">Transaction Details</h1>
            <p className="text-gray-500 text-sm">Page individuelle montrant les informations clés</p>
          </div>
          <div className="h-1.5 w-28 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Informations carte</div>
              <BrandIcon brand={t.card.brand} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Titulaire</div>
                <div className="font-medium">{t.card.holder}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Numéro</div>
                <div className="font-mono">{maskCard(t.card.number)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Expiration</div>
                <div>{t.card.expiration}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Marque</div>
                <div>{t.card.brand}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-lg border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Réponse du Bank Server</div>
              <MdShield className="text-blue-600" size={24} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Statut</div>
                <StatusBadge status={t.bankResponse.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Code</div>
                <div className="font-mono text-sm">{t.bankResponse.code}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Message</div>
                <div>{t.bankResponse.message}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Auth Code</div>
                <div className="font-mono text-sm">{t.bankResponse.authCode || '—'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Risk</div>
                <div>{t.bankResponse.risk}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-500 text-sm">Référence</div>
                <div className="font-mono text-sm">{t.bankResponse.reference}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white shadow-lg border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Résumé de l’opération</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Transaction ID</div>
              <div className="mt-1 font-mono text-sm">{t.id}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Date</div>
              <div className="mt-1">{t.timestamp}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Montant</div>
              <div className="mt-1 font-medium">{t.amount.toFixed(2)} {t.currency}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Statut</div>
              <div className="mt-1"><StatusBadge status={t.bankResponse.status} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

