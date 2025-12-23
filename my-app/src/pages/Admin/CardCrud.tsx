import { useEffect, useMemo, useState } from 'react'
import { MdCreditCard, MdCalendarToday, MdLock, MdAttachMoney, MdToggleOn } from 'react-icons/md'

function onlyDigits(v: string) {
  return v.replace(/\D+/g, '')
}

export default function CardCrud() {
  const [mode, setMode] = useState<'create' | 'update'>('create')
  const [cardNumber, setCardNumber] = useState('')
  const [expiration, setExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [balance, setBalance] = useState('')
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const digits = useMemo(() => onlyDigits(cardNumber), [cardNumber])
  const cvvValid = /^[0-9]{3,4}$/.test(cvv)
  const amountValid = balance === '' ? false : !Number.isNaN(parseFloat(balance))
  const canCreate = digits.length >= 13 && expiration !== '' && cvvValid && amountValid
  const canUpdate = digits.length >= 13 && expiration !== '' && cvvValid && amountValid
  const BASIC_USER = 'admin'
  const BASIC_PASS = 'admin'
  const CREATE_URL = 'http://192.168.11.102:8080/admin/cards/create'
  const LIST_URL = 'http://192.168.11.102:8080/admin/cards/list'
  const UPDATE_URL = 'http://192.168.11.102:8080/admin/cards'
  const DELETE_URL = 'http://192.168.11.102:8080/admin/cards'
  type Card = { cardNumber: string; expiration: string; cvv: string; balance: number; active: boolean }
  const [cards, setCards] = useState<Card[]>([])
  const authOk = !!(BASIC_USER && BASIC_PASS)
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((mode === 'create' && !canCreate) || (mode === 'update' && !canUpdate)) return
    setLoading(true)
    setMessage('')
    const payloadCreate = {
      cardNumber: digits,
      expiration,
      cvv,
      balance: parseFloat(balance),
      active,
    }
    const payloadUpdate = {
      expiration,
      cvv,
      balance: parseFloat(balance),
      active,
    }
    const url = mode === 'create' ? CREATE_URL : `${UPDATE_URL}/${digits}/update`
    const method = mode === 'create' ? 'POST' : 'PUT'
    const body = JSON.stringify(mode === 'create' ? payloadCreate : payloadUpdate)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authOk) {
      headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
    }
    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
      })
      if (!res.ok) throw new Error('')
      setMessage('Succès')
      if (mode === 'create') {
        setCardNumber('')
        setExpiration('')
        setCvv('')
        setBalance('')
        setActive(false)
      }
    } catch {
      setMessage('Erreur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const headers: Record<string, string> = {}
    if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
    fetch(LIST_URL, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Card[]) => setCards(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Erreur'))
  }, [authOk])

  async function deleteCard(number: string) {
    const headers: Record<string, string> = {}
    if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
    try {
      const res = await fetch(`${DELETE_URL}/${number}/delete`, { method: 'DELETE', headers })
      if (!res.ok) return
      const listRes = await fetch(LIST_URL, { headers })
      if (listRes.ok) {
        const data = (await listRes.json()) as Card[]
        setCards(Array.isArray(data) ? data : [])
      }
      setMessage('Succès')
    } catch {
      setMessage('Erreur')
    }
  }

  function startUpdate(c: Card) {
    setMode('update')
    setCardNumber(c.cardNumber)
    setExpiration(c.expiration)
    setCvv(c.cvv)
    setBalance(String(c.balance))
    setActive(c.active)
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-500">Admin</div>
            <h1 className="text-3xl font-bold text-slate-900">Cartes</h1>
          </div>
          <div className="h-1.5 w-28 bg-linear-to-r from-indigo-600 to-purple-700 rounded-full" />
        </div>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setMode('create')}
            className={`px-4 py-2 rounded-lg shadow-sm transition ${mode === 'create' ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
          >
            Créer
          </button>
          <button
            onClick={() => setMode('update')}
            className={`px-4 py-2 rounded-lg shadow-sm transition ${mode === 'update' ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
          >
            Mettre à jour
          </button>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl bg-white p-8 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de carte</label>
              <div className="relative">
                <MdCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${digits.length >= 13 || digits.length === 0 ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date d’expiration</label>
              <div className="relative">
                <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="month"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  required
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${expiration ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                  required
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${cvvValid || cvv.length === 0 ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                  placeholder="123"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Solde</label>
              <div className="relative">
                <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                  className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${amountValid || balance === '' ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Active</label>
              <button
                type="button"
                onClick={() => setActive((a) => !a)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${active ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-300 text-gray-700'}`}
              >
                <MdToggleOn size={20} /> {active ? 'Oui' : 'Non'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !authOk || (mode === 'create' ? !canCreate : !canUpdate)}
            className={`mt-8 w-full rounded-xl px-6 py-3 text-white font-semibold ${loading ? 'bg-gray-300 cursor-not-allowed' : mode === 'create' ? 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : 'bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} transition-all duration-200 shadow`}
          >
            {mode === 'create' ? 'Créer' : 'Mettre à jour'}
          </button>

          {message && (
            <div className={`mt-4 text-sm ${message === 'Succès' ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</div>
          )}
        </form>

        <div className="mt-8 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Liste des cartes</div>
            <div className="h-1 w-12 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200/80">
                <tr className="text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="px-6 py-4">Numéro</th>
                  <th className="px-6 py-4">Expiration</th>
                  <th className="px-6 py-4">CVV</th>
                  <th className="px-6 py-4">Solde</th>
                  <th className="px-6 py-4">Active</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.map((c) => (
                  <tr key={c.cardNumber} className="hover:bg-slate-50/50 transition-colors duration-150 ease-in-out">
                    <td className="px-6 py-4 font-mono text-sm text-slate-800">{c.cardNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.expiration}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.cvv}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{c.balance.toFixed(2)} MAD</td>
                    <td className="px-6 py-4 text-sm">{c.active ? 'Oui' : 'Non'}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        className="px-3 py-1 rounded-lg text-white text-xs bg-rose-600 hover:bg-rose-700 shadow"
                        onClick={() => deleteCard(c.cardNumber)}
                      >
                        Supprimer
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg text-white text-xs bg-indigo-600 hover:bg-indigo-700 shadow"
                        onClick={() => startUpdate(c)}
                      >
                        Mise à jour
                      </button>
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
