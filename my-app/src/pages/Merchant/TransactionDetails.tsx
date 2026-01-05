import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MdCreditCard, MdCheckCircle, MdError, MdInfo, MdShield, MdArrowBack } from 'react-icons/md'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'
import type { TransactionEntity } from '../../types'

function maskCard(n: string) {
  // If already masked or short
  if (!n) return '**** **** **** ****'
  // If backend returns full number (unlikely based on comments), mask it. 
  // If backend returns masked like "**** **** **** 1234", just return it.
  if (n.includes('*')) return n
  
  const d = n.replace(/\D+/g, '')
  if (d.length < 8) return '**** **** **** ****'
  const head = d.slice(0, 4)
  const tail = d.slice(-4)
  return `${head} **** **** ${tail}`
}

function BrandIcon({ brand }: { brand?: string }) {
  const b = (brand || '').toLowerCase()
  if (b.includes('visa')) return <FaCcVisa size={36} />
  if (b.includes('master') || b.includes('mc')) return <FaCcMastercard size={36} />
  if (b.includes('amex')) return <FaCcAmex size={36} />
  return <MdCreditCard size={28} />
}

function StatusBadge({ status }: { status: string }) {
  let cls = 'bg-amber-100 text-amber-700'
  let Icon = MdInfo
  let label = status

  if (status === 'SUCCESS' || status === 'Validée') {
    cls = 'bg-green-100 text-green-700'
    Icon = MdCheckCircle
    label = 'Validée'
  } else if (status === 'FAILED' || status === 'Refusée') {
    cls = 'bg-red-100 text-red-700'
    Icon = MdError
    label = 'Refusée'
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cls}`}>
      <Icon size={14} /> {label}
    </span>
  )
}

export default function TransactionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [transaction, setTransaction] = useState<TransactionEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    setLoading(true)
    fetch(`http://localhost:8082/api/transactions/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Transaction introuvable')
        return res.json()
      })
      .then((data: TransactionEntity) => {
        setTransaction(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Impossible de charger la transaction.')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
        <MdError size={48} className="text-red-400 mb-2" />
        <p>{error || 'Transaction introuvable'}</p>
        <button onClick={() => navigate('/merchant/history')} className="mt-4 text-indigo-600 hover:underline">
          Retour à l'historique
        </button>
      </div>
    )
  }

  const t = transaction

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
              <span>{new Date(t.createdAt).toLocaleString()}</span>
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
            <div className="mt-1 text-slate-800">{new Date(t.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Montant</div>
            <div className="mt-1 font-semibold text-slate-800">{t.montant.toFixed(2)} MAD</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-sm font-medium text-slate-500">Statut</div>
            <div className="mt-1"><StatusBadge status={t.status} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-slate-800">Informations carte</div>
              <BrandIcon />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Numéro</div>
                <div className="font-mono text-slate-800">{maskCard(t.cardNumber)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Expiration</div>
                <div className="text-slate-800">{t.expiration}</div>
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
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Code</div>
                <div className="font-mono text-sm text-slate-800">{t.bankCode || '—'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-sm">Message</div>
                <div className="text-slate-800">{t.bankMessage || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-400">Les informations affichées ci‑dessus sont issues de l’opération bancaire.</div>
      </div>
    </div>
  )
}

