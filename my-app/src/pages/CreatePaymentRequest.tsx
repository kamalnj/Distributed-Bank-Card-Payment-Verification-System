import { useState } from 'react'

export default function CreatePaymentRequest() {
  const [montant, setMontant] = useState('')
  const [numeroCarte, setNumeroCarte] = useState('')
  const [expiration, setExpiration] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomClient, setNomClient] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { montant, numeroCarte, expiration, cvv, nomClient }
    alert(JSON.stringify(payload))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Create Payment Request</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Montant</label>
          <input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Numéro de carte</label>
          <input
            type="text"
            value={numeroCarte}
            onChange={(e) => setNumeroCarte(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            pattern="[0-9 ]{12,19}"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date expiration</label>
            <input
              type="month"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="123"
              inputMode="numeric"
              pattern="[0-9]{3,4}"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom du client</label>
          <input
            type="text"
            value={nomClient}
            onChange={(e) => setNomClient(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Jean Dupont"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Créer
        </button>
      </form>
    </div>
  )
}
