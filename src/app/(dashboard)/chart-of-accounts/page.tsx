"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Plus, Filter, Check, X, Shield, RefreshCw } from "lucide-react";
import { SYSCOHADA_CLASSES } from "@/lib/syscohada";

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New account form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountClass, setAccountClass] = useState("4");
  const [type, setType] = useState("ASSET");
  const [isReconcilable, setIsReconcilable] = useState(false);
  const [isAuxiliary, setIsAuxiliary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchAccounts() {
    try {
      setLoading(true);
      let url = "/api/accounting/accounts";
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("class", selectedClass);
      if (search) params.append("search", search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, [selectedClass, search]);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/accounting/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          accountClass: parseInt(accountClass, 10),
          type,
          isReconcilable,
          isAuxiliary,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la création du compte.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setCode("");
      setName("");
      setIsReconcilable(false);
      setIsAuxiliary(false);
      fetchAccounts();
    } catch (err) {
      setFormError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Répertoire Officiel OHADA
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Plan Comptable Général SYSCOHADA
          </h1>
          <p className="text-xs text-slate-500">
            Nomenclature des comptes de bilan (1 à 5) et de gestion (6 à 8).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouveau Compte</span>
        </button>
      </div>

      {/* Class filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedClass("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedClass === "ALL"
              ? "bg-[#101B35] text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Toutes les classes
        </button>
        {SYSCOHADA_CLASSES.map((cls) => (
          <button
            key={cls.number}
            onClick={() => setSelectedClass(cls.number.toString())}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedClass === cls.number.toString()
                ? "bg-[#D4AF37] text-[#101B35] font-bold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Classe {cls.number}
          </button>
        ))}
      </div>

      {/* Search and Table container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par code (ex: 411100) ou libellé (ex: BOA)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Numéro de Compte</th>
                <th className="py-3 px-4">Intitulé SYSCOHADA</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4 text-center">Lettrable</th>
                <th className="py-3 px-4 text-center">Compte Tiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des comptes...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun compte trouvé.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {acc.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {acc.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        Classe {acc.accountClass}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-slate-600">
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isReconcilable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Oui
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.isAuxiliary ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Tiers
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Account */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer un Compte Comptable SYSCOHADA
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Numéro de Compte (ex: 411120, 605400) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6 chiffres recommandés"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Intitulé du Compte *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fournisseurs d'électricité et eau"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Classe *
                  </label>
                  <select
                    value={accountClass}
                    onChange={(e) => setAccountClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                      <option key={c} value={c}>
                        Classe {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Type de Solde *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none bg-white"
                  >
                    <option value="ASSET">Actif</option>
                    <option value="LIABILITY">Passif</option>
                    <option value="EQUITY">Capitaux</option>
                    <option value="EXPENSE">Charge</option>
                    <option value="REVENUE">Produit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReconcilable}
                    onChange={(e) => setIsReconcilable(e.target.checked)}
                    className="rounded text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-medium text-slate-700">Compte lettrable (Rapprochement)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAuxiliary}
                    onChange={(e) => setIsAuxiliary(e.target.checked)}
                    className="rounded text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-medium text-slate-700">Compte auxiliaire de tiers</span>
                </label>
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
                  className="px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold"
                >
                  {submitting ? "Création..." : "Enregistrer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
