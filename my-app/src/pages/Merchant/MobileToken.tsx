import { useEffect, useState } from "react";
import {
  MdPhoneIphone,
  MdVpnKey,
  MdRefresh,
  MdContentCopy,
  MdCheckCircle,
  MdInfo,
  MdWarning
} from "react-icons/md";

export default function MobileToken() {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState<string>("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const tokenAuth = localStorage.getItem("token");
      if (!tokenAuth || tokenAuth === "SESSION") {
        setError("Erreur: Jeton d'authentification invalide. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:8083/api/mobile-token/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenAuth}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => null);
          const msg = typeof j === "object" && j && ("message" in j) ? String((j as any).message) : "";
          setError(`Erreur serveur (${res.status}): ${msg || "Impossible de générer le jeton."}`);
        } else {
          const t = await res.text().catch(() => "");
          setError(`Erreur serveur (${res.status}): ${t || "Impossible de générer le jeton."}`);
        }
      } else {
        const data = await res.json();
        const newToken = data.token || "";
        setToken(newToken);
        setSuccess("Jeton généré avec succès");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-4 border border-indigo-100">
            <MdPhoneIphone size={14} /> Liaison App Mobile
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Jeton Mobile</h1>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Générez un jeton pour lier l’application mobile à votre compte marchand en toute sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <MdVpnKey size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Jeton d’appareil</p>
                    <p className="text-xs text-slate-500">Utilisable une seule fois par liaison</p>
                  </div>
                </div>
                <button
                  onClick={generate}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all ${
                    loading
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <MdRefresh size={18} />
                      <span>Générer</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                  <MdWarning size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <MdCheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}

              {token ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm break-all">
                    {token}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={copy}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-medium"
                    >
                      <MdContentCopy size={18} />
                      Copier
                    </button>
                    {copied && (
                      <span className="text-xs font-bold text-emerald-600">Copié</span>
                    )}
                    <button
                      onClick={generate}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 font-medium"
                    >
                      <MdRefresh size={18} />
                      Régénérer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                <MdInfo size={18} />
                <span>Instructions</span>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p>1. Appuyez sur Générer pour obtenir un jeton de liaison.</p>
                <p>2. Ouvrez l’application mobile et collez le jeton.</p>
                <p>3. Le jeton expire après utilisation ou après un court délai.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
