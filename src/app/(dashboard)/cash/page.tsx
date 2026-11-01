"use client";

import { useEffect, useState } from "react";
import { Coins, Plus, CheckCircle2, ArrowUpRight, ArrowDownRight, X, RefreshCw } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function CashPage() {
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("Niamey");
  const [initialBalance, setInitialBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/treasury");
      if (res.ok) {
        const d = await res.json();
        setCashAccounts(d.cashAccounts || []);
        setTransactions(d.recentTransactions?.filter((t: any) => t.cashAccountId) || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddCash(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CASH",
          name,
          location,
          initialBalance: parseFloat(initialBalance) || 0,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setInitialBalance("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const totalCash = cashAccounts.reduce((sum, c) => sum + c.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Caisses • Compte 571
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion des Caisses & Menues Dépenses
          </h1>
          <p className="text-xs text-slate-500">
            Suivi des flux en espèces, arrêtés de caisse et procès-verbaux de caisse.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Créer une Caisse</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cashAccounts.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">{c.name}</h3>
                  <p className="text-xs text-slate-500">{c.location}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Ouverte
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Imputation SYSCOHADA :</span>
                <span className="font-mono font-semibold text-amber-700">{c.glAccountCode} (Caisse Siège)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Devise officielle :</span>
                <span className="font-bold text-slate-700">FCFA (XOF)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Solde en Espèces</span>
                <span className="text-xl font-extrabold text-[#101B35]">{formatFCFA(c.currentBalance)}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Arrêté vérifié</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#101B35]">
          Livre de Caisse (Entrées & Sorties Espèces)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3 text-right">Montant Espèces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Aucun mouvement d&apos;espèces récent.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">{tx.reference || "-"}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{tx.description}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-700"}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{formatFCFA(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer une Caisse Physique
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCash} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de la Caisse *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Caisse Menues Dépenses"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Localisation</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Siège Niamey - Agence Plateau"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Solde Initial en Espèces (FCFA)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold"
                >
                  {submitting ? "Création..." : "Créer la caisse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

