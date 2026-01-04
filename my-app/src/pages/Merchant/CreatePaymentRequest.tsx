import { useMemo, useState } from "react";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";
import {
  MdAttachMoney,
  MdCreditCard,
  MdCalendarToday,
  MdLock,
  MdCheckCircle,
  MdError,
  MdPayment,
  MdArrowForward
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

// --- Helpers ---

function onlyDigits(v: string) {
  return v.replace(/\D+/g, "");
}

function formatCard(v: string) {
  const d = onlyDigits(v).slice(0, 19);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function luhnValid(v: string) {
  const d = onlyDigits(v);
  if (d.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function brandName(v: string) {
  const d = onlyDigits(v);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]|720))/.test(d)) return "mastercard";
  if (/^(34|37)/.test(d)) return "amex";
  return "";
}

// --- Components ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string;
}

function Modal({ isOpen, onClose, type, title, message, details }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-8 flex flex-col items-center text-center ${type === 'success' ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
          <div className={`rounded-full p-4 mb-4 shadow-sm ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {type === 'success' ? <MdCheckCircle size={48} /> : <MdError size={48} />}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${type === 'success' ? 'text-emerald-900' : 'text-rose-900'}`}>
            {title}
          </h3>
          <p className="text-slate-600 font-medium">
            {message}
          </p>
        </div>
        
        {details && (
          <div className="px-8 py-4 bg-slate-50 border-t border-b border-slate-100">
            <p className="text-xs text-slate-500 font-mono text-center break-all uppercase tracking-wider">
              {details}
            </p>
          </div>
        )}

        <div className="p-6 bg-white">
          <button
            onClick={onClose}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] ${
              type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' 
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'
            }`}
          >
            {type === 'success' ? 'Terminer' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreatePaymentRequest() {
  const navigate = useNavigate();
  const [montant, setMontant] = useState("");
  const [numeroCarte, setNumeroCarte] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });

  const digits = useMemo(() => onlyDigits(numeroCarte), [numeroCarte]);
  const brand = useMemo(() => brandName(numeroCarte), [numeroCarte]);

  const nowIso = new Date().toISOString().slice(0, 7);
  const expValid = expiration && expiration >= nowIso;
  const cvvValid = /^[0-9]{3,4}$/.test(cvv);
  const amountValid = parseFloat(montant) > 0;
  const cardValid = luhnValid(numeroCarte);
  const canSubmit = amountValid && cardValid && expValid && cvvValid && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    const payload = {
      montant: parseFloat(montant),
      numeroCarte: digits,
      expiration,
      cvv,
    };
    
    // Get JWT from storage
    const token = localStorage.getItem("token");
    
    if (!token) {
      setModal({
        open: true,
        type: 'error',
        title: 'Authentification requise',
        message: 'Vous devez être connecté pour effectuer cette action.',
      });
      setLoading(false);
      return;
    }

    const authHeader = `Bearer ${token}`;

    try {
      const res = await fetch("http://localhost:8083/merchant/api/payments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success || data.status === 'SUCCESS') {
        setModal({
          open: true,
          type: 'success',
          title: 'Paiement Approuvé',
          message: 'La transaction a été validée avec succès par la banque.',
          details: `REF: ${data.transactionId || data.id || 'N/A'}`
        });
        // Reset form
        setMontant("");
        setNumeroCarte("");
        setExpiration("");
        setCvv("");
      } else {
        setModal({
          open: true,
          type: 'error',
          title: 'Paiement Refusé',
          message: data.message || 'La transaction a été refusée par la banque.',
          details: `CODE: ${data.status || 'ERROR'}`
        });
      }
    } catch (error) {
      setModal({
        open: true,
        type: 'error',
        title: 'Erreur de Connexion',
        message: 'Impossible de joindre le serveur de paiement.',
        details: 'Vérifiez votre connexion ou réessayez plus tard.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.type === 'success') {
      navigate('/merchant/history');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <Modal 
        isOpen={modal.open}
        onClose={handleCloseModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        details={modal.details}
      />

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-4 border border-indigo-100">
            <MdPayment size={14} /> Terminal de Paiement
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Nouvelle Transaction
          </h1>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto text-lg">
            Saisissez les détails de la carte pour initier un débit sécurisé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Preview Section */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 order-2 lg:order-1">
            <div className="space-y-6">
              
              {/* The Credit Card */}
              <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-500/20 group perspective-1000">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-violet-500/30 blur-3xl mix-blend-overlay" />
                
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

                <div className="relative h-full p-8 flex flex-col justify-between text-white z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-9 rounded bg-gradient-to-r from-yellow-200 to-yellow-400 shadow-sm flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 opacity-50 border border-black/20 rounded" />
                      <div className="w-full h-[1px] bg-black/20 absolute top-2" />
                      <div className="w-full h-[1px] bg-black/20 absolute bottom-2" />
                      <div className="h-full w-[1px] bg-black/20 absolute left-4" />
                      <div className="h-full w-[1px] bg-black/20 absolute right-4" />
                    </div>
                    <div className="opacity-90 drop-shadow-lg">
                      {brand === "visa" && <FaCcVisa size={48} />}
                      {brand === "mastercard" && <FaCcMastercard size={48} />}
                      {brand === "amex" && <FaCcAmex size={48} />}
                      {!brand && <div className="text-xs font-mono opacity-50 border border-white/30 px-2 py-1 rounded">BANK CARD</div>}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="text-2xl sm:text-3xl font-mono tracking-widest drop-shadow-md">
                        {formatCard(numeroCarte) || "•••• •••• •••• ••••"}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Titulaire</div>
                        <div className="font-medium tracking-wide text-lg uppercase truncate max-w-[180px]">
                          CLIENT ANONYME
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Expire</div>
                        <div className="font-mono text-lg">{expiration ? expiration.replace('-', '/') : "MM/AA"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Résumé de la commande</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600">Montant HT</span>
                    <span className="font-mono text-slate-400">
                      {montant ? (parseFloat(montant) * 0.8).toFixed(2) : "0.00"} MAD
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600">TVA (20%)</span>
                    <span className="font-mono text-slate-400">
                      {montant ? (parseFloat(montant) * 0.2).toFixed(2) : "0.00"} MAD
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-slate-800">Total à payer</span>
                    <span className="font-bold text-xl text-indigo-600">
                      {montant || "0.00"} <span className="text-sm text-indigo-400">MAD</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <form onSubmit={onSubmit} className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Montant Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Montant de la transaction
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                      <MdAttachMoney size={24} />
                    </div>
                    <input
                      type="number"
                      value={montant}
                      onChange={(e) => setMontant(e.target.value)}
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-4 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-lg text-slate-800 placeholder:text-slate-300 placeholder:font-normal"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">MAD</div>
                  </div>
                </div>

                {/* Card Number Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Numéro de carte
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                      <MdCreditCard size={22} />
                    </div>
                    <input
                      type="text"
                      value={formatCard(numeroCarte)}
                      onChange={(e) => setNumeroCarte(e.target.value)}
                      required
                      className={`w-full bg-slate-50 border-2 rounded-2xl pl-16 pr-4 py-4 outline-none focus:bg-white transition-all font-mono text-lg text-slate-800 placeholder:text-slate-300 ${
                        !cardValid && digits.length >= 13 ? 'border-rose-300 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                      }`}
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      maxLength={23}
                    />
                    {cardValid && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in fade-in zoom-in">
                        <MdCheckCircle size={24} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiration Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Date d'expiration
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                      <MdCalendarToday size={20} />
                    </div>
                    <input
                      type="month"
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                      required
                      min={nowIso}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-4 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* CVV Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Code CVC/CVV
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                      <MdLock size={20} />
                    </div>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-4 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono text-lg text-slate-800 placeholder:text-slate-300"
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full group relative flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 transform active:scale-[0.98] ${
                    canSubmit
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-200 hover:-translate-y-1"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Traitement sécurisé...</span>
                    </>
                  ) : (
                    <>
                      <span>Valider le paiement</span>
                      <MdArrowForward size={22} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                  <MdLock size={14} />
                  <span>Transactions chiffrées et sécurisées de bout en bout</span>
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
