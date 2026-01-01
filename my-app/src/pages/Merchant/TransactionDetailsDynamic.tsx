import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MdCreditCard, MdCheckCircle, MdError, MdInfo, MdShield, MdArrowBack } from 'react-icons/md'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'
import type { TransactionEntity } from '../../types'

function maskCard(n?: string) {
  if (!n) return '**** **** **** ****'
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

function StatusBadge({ status }: { status: 'Validée' | 'Refusée' | 'En attente' }) {
  const m = {
    Validée: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', Icon: MdCheckCircle },
    Refusée: { cls: 'bg-rose-50 text-rose-700 border border-rose-200', Icon: MdError },
    'En attente': { cls: 'bg-amber-50 text-amber-700 border border-amber-200', Icon: MdInfo },
  }[status]
  const I = m.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${m.cls}`}>
      <I size={14} /> {status}
    </span>
  )
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

export default function TransactionDetailsDynamic() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entity, setEntity] = useState<TransactionEntity | null>(null)

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`http://localhost:8082/api/transactions/${id}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`)
        const data: TransactionEntity = await res.json()
        setEntity(data)
      } catch (e) {
        console.error(e)
        setError('Impossible de charger les détails de la transaction.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchOne()
  }, [id])

  const ui = useMemo(() => {
    if (!entity) return null
    const status: 'Validée' | 'Refusée' | 'En attente' =
      entity.status === 'SUCCESS' ? 'Validée' : entity.status === 'FAILED' ? 'Refusée' : 'En attente'
    return {
      id: String(entity.id),
      amount: entity.montant,
      date: entity.createdAt,
      status,
      bankCode: entity.bankCode,
      bankMessage: entity.bankMessage,
      cardNumber: entity.cardNumber,
      expiration: entity.expiration,
    }
  }, [entity])

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Transactions</div>
            <h1 className="text-2xl font-semibold text-slate-900">Détails de la Transaction</h1>
            <p className="text-slate-500 text-sm">Informations détaillées de l’opération bancaire</p>
          </div>
          <button
            onClick={() => navigate('/merchant/history')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <MdArrowBack size={18} />
            <span className="text-sm">Retour à l’historique</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm font-medium">Chargement des détails...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700">
            {error}
          </div>
        ) : ui ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-slate-800">Informations carte</div>
                  <BrandIcon brand={undefined} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-500 text-sm">Numéro</div>
                    <div className="font-mono">{maskCard(ui.cardNumber)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-500 text-sm">Expiration</div>
                    <div>{ui.expiration || '—'}</div>
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
                    <StatusBadge status={ui.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-500 text-sm">Code</div>
                    <div className="font-mono text-sm">{ui.bankCode || '—'}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-500 text-sm">Message</div>
                    <div>{ui.bankMessage || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <div className="font-semibold text-slate-800 mb-3">Résumé de l’opération</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Transaction ID</div>
                  <div className="mt-1 font-mono text-sm">#{ui.id}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Date</div>
                  <div className="mt-1">{formatDate(ui.date)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Montant</div>
                  <div className="mt-1 font-medium">{formatCurrency(ui.amount)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Statut</div>
                  <div className="mt-1"><StatusBadge status={ui.status} /></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-slate-500">Aucune donnée pour cette transaction.</div>
        )}
      </div>
    </div>
  )
}
