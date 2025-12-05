import { useMemo, useState } from 'react'
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'
import { MdAttachMoney, MdCreditCard, MdCalendarToday, MdLock, MdPerson } from 'react-icons/md'

function onlyDigits(v: string) {
  return v.replace(/\D+/g, '')
}

function formatCard(v: string) {
  const d = onlyDigits(v).slice(0, 19)
  return d.replace(/(.{4})/g, '$1 ').trim()
}

function luhnValid(v: string) {
  const d = onlyDigits(v)
  if (d.length < 13) return false
  let sum = 0
  let dbl = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i])
    if (dbl) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    dbl = !dbl
  }
  return sum % 10 === 0
}

function brandName(v: string) {
  const d = onlyDigits(v)
  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]|720))/.test(d)) return 'mastercard'
  if (/^(34|37)/.test(d)) return 'amex'
  return ''
}

export default function CreatePaymentRequest() {
  const [montant, setMontant] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [expiration, setExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomClient, setNomClient] = useState('')
  const digits = useMemo(() => onlyDigits(numeroCarte), [numeroCarte])
  const brand = useMemo(() => brandName(numeroCarte), [numeroCarte])

  const nowIso = new Date().toISOString().slice(0, 7)
  const expValid = expiration && expiration >= nowIso
  const cvvValid = /^[0-9]{3,4}$/.test(cvv)
  const amountValid = parseFloat(montant) > 0
  const cardValid = luhnValid(numeroCarte)
  const canSubmit = amountValid && cardValid && expValid && cvvValid && nomClient.trim().length > 1

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const payload = { montant, numeroCarte: digits, expiration, cvv, nomClient }
    alert(JSON.stringify(payload))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide">PAIEMENT SÉCURISÉ</div>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">Créer une demande</h1>
          <p className="mt-2 text-gray-600">Remplissez les informations ci-dessous pour générer la demande de paiement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="relative h-64 rounded-3xl bg-linear-to-br from-emerald-400 to-teal-600 text-white p-6 shadow-2xl">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="flex justify-between items-start">
                  <div className="text-xs uppercase tracking-widest opacity-80">Carte Bancaire</div>
                  <div className="mt-1">
                    {brand === 'visa' && <FaCcVisa size={32} />}
                    {brand === 'mastercard' && <FaCcMastercard size={32} />}
                    {brand === 'amex' && <FaCcAmex size={32} />}
                    {!brand && <div className="w-8 h-8 rounded-full bg-white/20" />}
                  </div>
                </div>
                <div className="absolute top-16 left-6 h-8 w-12 bg-white/25 rounded" />
                <div className="mt-12 text-2xl font-mono tracking-[0.2em]">
                  {formatCard(numeroCarte) || '•••• •••• •••• ••••'}
                </div>
                <div className="absolute bottom-5 left-6 right-6 flex justify-between text-sm">
                  <div className="font-medium">{nomClient || 'Nom du titulaire'}</div>
                  <div className="font-mono">{expiration || 'MM/AA'}</div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-6 rounded-2xl bg-white p-5 shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-700">Résumé</div>
                  <div className="h-1 w-12 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant</span>
                    <span className="font-semibold text-gray-800">{montant || '—'} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Carte</span>
                    <span className="font-mono text-gray-800">{formatCard(numeroCarte) || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expiration</span>
                    <span className="text-gray-800">{expiration || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Titulaire</span>
                    <span className="text-gray-800">{nomClient || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="rounded-3xl bg-white p-8 shadow-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Montant */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant</label>
                  <div className="relative">
                    <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      required
                      className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${amountValid || montant === '' ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {!amountValid && montant !== '' && (
                    <div className="text-red-600 text-xs mt-1">Le montant doit être supérieur à 0</div>
                  )}
                </div>

                {/* Numéro de carte */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de carte</label>
                  <div className="relative">
                    <MdCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formatCard(numeroCarte)}
                      onChange={(e) => setNumeroCarte(e.target.value)}
                      required
                      className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${cardValid || digits.length === 0 ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                    />
                  </div>
                  {!cardValid && digits.length >= 13 && (
                    <div className="text-red-600 text-xs mt-1">Numéro de carte invalide</div>
                  )}
                </div>

                {/* Date expiration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date d’expiration</label>
                  <div className="relative">
                    <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="month"
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                      required
                      className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 ${expValid || !expiration ? 'focus:ring-emerald-400' : 'focus:ring-red-500'} transition`}
                      min={nowIso}
                    />
                  </div>
                  {!expValid && expiration && (
                    <div className="text-red-600 text-xs mt-1">Date d'expiration dépassée</div>
                  )}
                </div>

                {/* CVV */}
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
                  {!cvvValid && cvv.length > 0 && (
                    <div className="text-red-600 text-xs mt-1">CVV 3 ou 4 chiffres</div>
                  )}
                </div>

                {/* Nom du client */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du titulaire</label>
                  <div className="relative">
                    <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={nomClient}
                      onChange={(e) => setNomClient(e.target.value)}
                      required
                      className="w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-8 w-full rounded-xl px-6 py-3 text-white font-semibold ${canSubmit ? 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : 'bg-gray-300 cursor-not-allowed'} transition-all duration-200 shadow hover:shadow-lg`}
              >
                Créer la demande
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
