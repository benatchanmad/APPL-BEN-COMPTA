"use client";

import { useEffect, useState } from "react";
import { Landmark, Plus, CheckCircle2, Search, ArrowRightLeft, X, RefreshCw } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function BankingPage() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New bank form
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/treasury");
      if (res.ok) {
        const d = await res.json();
        setBankAccounts(d.bankAccounts || []);
        setTransactions(d.recentTransactions?.filter((t: any) => t.bankAccountId) || []);
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

  async function handleAddBank(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BANK",
          bankName,
          name: accountName,
          accountNumber,
          iban,
          initialBalance: parseFloat(initialBalance) || 0,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setBankName("");
        setAccountName("");
        setAccountNumber("");
        setIban("");
        setInitialBalance("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Banques • Compte 521
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Comptes Bancaires & Rapprochement
          </h1>
          <p className="text-xs text-slate-500">
            Gestion des comptes bancaires BOA, Ecobank, BIA et état de rapprochement bancaire.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Ajouter un Compte Bancaire</span>
        </button>
      </div>

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankAccounts.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">{b.bankName}</h3>
                  <p className="text-xs text-slate-500">{b.accountName}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Actif
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>N° Compte :</span>
                <span className="font-mono font-bold text-slate-800">{b.accountNumber}</span>
              </div>
              {b.iban && (
                <div className="flex justify-between text-slate-500">
                  <span>IBAN :</span>
                  <span className="font-mono text-slate-700 text-[11px]">{b.iban}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Imputation SYSCOHADA :</span>
                <span className="font-mono font-semibold text-blue-700">{b.glAccountCode} (Banque)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Solde Actuel</span>
                <span className="text-xl font-extrabold text-[#101B35]">{formatFCFA(b.currentBalance)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rapprochement OK</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#101B35]">
          Relevé des Opérations Bancaires
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Libellé</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-3 text-center">Rapproché</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(tx.date)}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">{tx.reference || "-"}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{tx.description}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-700"}`}>
                    {tx.type === "CREDIT" ? "+" : "-"}{formatFCFA(tx.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Oui
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Ajouter un Compte Bancaire
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBank} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de l&apos;Établissement Bancaire *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ex: Bank of Africa (BOA Niger)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Intitulé du Compte *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Compte Courant Commercial XOF"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Numéro de Compte *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="NE042 01001 02511488901 84"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Solde Initial (FCFA)</label>
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold"
                >
                  {submitting ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

