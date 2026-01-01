import { useEffect, useMemo, useState } from 'react'
import { 
  MdCreditCard, MdCalendarToday, MdLock, MdAttachMoney, MdToggleOn, 
  MdDelete, MdEdit, MdAdd, MdSave, MdCheckCircle, MdError, MdRefresh, MdClose 
} from 'react-icons/md'
import type { BankCard } from '../../types'

function onlyDigits(v: string) {
  return v.replace(/\D+/g, '')
}

// Helper pour formater la devise
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

export default function CardCrud() {
  const [mode, setMode] = useState<'create' | 'update'>('create')
  const [cardNumber, setCardNumber] = useState('')
  const [expiration, setExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [balance, setBalance] = useState('')
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [cards, setCards] = useState<BankCard[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)

  const digits = useMemo(() => onlyDigits(cardNumber), [cardNumber])
  const cvvValid = /^[0-9]{3,4}$/.test(cvv)
  const amountValid = balance === '' ? false : !Number.isNaN(parseFloat(balance))
  
  const canCreate = digits.length >= 13 && expiration !== '' && cvvValid && amountValid
  const canUpdate = digits.length >= 13 && expiration !== '' && cvvValid && amountValid
  
  const BASIC_USER = 'admin'
  const BASIC_PASS = 'admin'
  const BASE_URL = 'http://localhost:8081/admin/cards'
  const authOk = !!(BASIC_USER && BASIC_PASS)

  // Fetch cards
  const fetchCards = async () => {
    try {
      const headers: Record<string, string> = {}
      if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
      
      const res = await fetch(`${BASE_URL}/list`, { headers })
      if (res.ok) {
        const data = await res.json()
        setCards(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Failed to fetch cards", err)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [authOk])

  // Reset form
  const resetForm = () => {
    setCardNumber('')
    setExpiration('')
    setCvv('')
    setBalance('')
    setActive(false)
    setMessage('')
    setMode('create')
  }

  // Handle form submission
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

    const url = mode === 'create' ? `${BASE_URL}/create` : `${BASE_URL}/${digits}/update`
    const method = mode === 'create' ? 'POST' : 'PUT'
    const body = JSON.stringify(mode === 'create' ? payloadCreate : payloadUpdate)
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)

    try {
      const res = await fetch(url, { method, headers, body })
      if (!res.ok) throw new Error('Opération échouée')
      
      setMessage('Succès')
      await fetchCards()
      
      if (mode === 'create') {
        resetForm()
        setIsFormVisible(false)
      } else {
        // Keep form open but show success
        setTimeout(() => {
          setIsFormVisible(false)
          resetForm()
        }, 1500)
      }
    } catch {
      setMessage('Erreur lors de l\'opération')
    } finally {
      setLoading(false)
    }
  }

  // Delete card
  async function deleteCard(number: string) {
    if (!window.confirm('Voulez-vous vraiment supprimer cette carte ?')) return

    const headers: Record<string, string> = {}
    if (authOk) headers['Authorization'] = 'Basic ' + btoa(`${BASIC_USER}:${BASIC_PASS}`)
    
    try {
      const res = await fetch(`${BASE_URL}/${number}/delete`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error('Suppression échouée')
      fetchCards()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  // Start update
  function startUpdate(c: BankCard) {
    setMode('update')
    setCardNumber(c.cardNumber)
    setExpiration(c.expiration)
    setCvv(c.cvv)
    setBalance(String(c.balance))
    setActive(c.active)
    setIsFormVisible(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle create mode
  function toggleCreate() {
    if (isFormVisible && mode === 'create') {
      setIsFormVisible(false)
    } else {
      resetForm()
      setMode('create')
      setIsFormVisible(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">Administration</div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Cartes</h1>
            <p className="text-slate-500 mt-1">Créez, modifiez et gérez les cartes bancaires du système</p>
          </div>
          
          <button
            onClick={toggleCreate}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all ${
              isFormVisible && mode === 'create' 
                ? 'bg-slate-700 hover:bg-slate-800' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
            }`}
          >
            {isFormVisible && mode === 'create' ? (
              <>
                <MdClose size={18} /> Fermer
              </>
            ) : (
              <>
                <MdAdd size={18} /> Nouvelle Carte
              </>
            )}
          </button>
        </div>

        {/* Form Section */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative">
            
            {/* Form Header */}
            <div className="mb-8 pb-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {mode === 'create' ? <MdAdd className="text-indigo-500" /> : <MdEdit className="text-indigo-500" />}
                {mode === 'create' ? 'Créer une nouvelle carte' : `Modifier la carte •••• ${digits.slice(-4)}`}
              </h2>
              <button onClick={() => setIsFormVisible(false)} className="text-slate-400 hover:text-slate-600">
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Card Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Numéro de carte</label>
                  <div className="relative group">
                    <MdCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      readOnly={mode === 'update'}
                      required
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all
                        ${mode === 'update' ? 'text-slate-500 cursor-not-allowed' : 'focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
                        font-mono text-slate-800 placeholder:text-slate-400`}
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date d'expiration</label>
                  <div className="relative group">
                    <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="month"
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Code de sécurité (CVV)</label>
                  <div className="relative group">
                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono text-slate-800 placeholder:text-slate-400"
                      placeholder="123"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Solde initial</label>
                  <div className="relative group">
                    <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      type="number"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 placeholder:text-slate-400"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">État de la carte</label>
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
                      active 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <MdToggleOn size={22} className={active ? 'text-emerald-600' : 'text-slate-400'} />
                      {active ? 'Carte Active' : 'Carte Inactive'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500 shadow-emerald-200 shadow-[0_0_8px]' : 'bg-slate-300'}`} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !authOk || (mode === 'create' ? !canCreate : !canUpdate)}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all
                    ${loading 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 shadow-indigo-200'
                    }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdSave size={18} />
                      {mode === 'create' ? 'Enregistrer' : 'Mettre à jour'}
                    </>
                  )}
                </button>
              </div>

              {/* Messages */}
              {message && (
                <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  message === 'Succès' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {message === 'Succès' ? <MdCheckCircle size={20} /> : <MdError size={20} />}
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Cards List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MdCreditCard className="text-indigo-500" /> Inventaire des Cartes
              </h3>
              <p className="text-sm text-slate-500 mt-1">{cards.length} cartes enregistrées</p>
            </div>
            <button 
              onClick={fetchCards} 
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Actualiser"
            >
              <MdRefresh size={22} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Numéro de Carte</th>
                  <th className="px-6 py-4">Expiration</th>
                  <th className="px-6 py-4">CVV</th>
                  <th className="px-6 py-4">Solde</th>
                  <th className="px-6 py-4 text-center">État</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cards.length > 0 ? cards.map((c) => (
                  <tr key={c.cardNumber} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-mono text-sm font-medium text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-5 rounded bg-slate-200 border border-slate-300 flex items-center justify-center">
                          <div className="w-4 h-2.5 bg-slate-300 rounded-[1px]" />
                        </div>
                        {c.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{c.expiration}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">•••</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(c.balance)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.active 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.active ? 'Active' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startUpdate(c)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteCard(c.cardNumber)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">
                      Aucune carte trouvée. Commencez par en créer une.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
