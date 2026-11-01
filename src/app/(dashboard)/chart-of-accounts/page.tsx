"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Plus, Filter, Check, X, Shield, RefreshCw, Pencil, Trash2 } from "lucide-react";
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

  // Edit account state
  const [editModal, setEditModal] = useState<{ open: boolean; account: any | null }>({
    open: false,
    account: null,
  });
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("ASSET");
  const [editIsReconcilable, setEditIsReconcilable] = useState(false);
  const [editIsAuxiliary, setEditIsAuxiliary] = useState(false);
  const [editing, setEditing] = useState(false);

  // Delete account state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; account: any | null }>({
    open: false,
    account: null,
  });
  const [deleting, setDeleting] = useState(false);

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

  function openEdit(acc: any) {
    setEditModal({ open: true, account: acc });
    setEditName(acc.name || "");
    setEditType(acc.type || "ASSET");
    setEditIsReconcilable(Boolean(acc.isReconcilable));
    setEditIsAuxiliary(Boolean(acc.isAuxiliary));
  }

  async function handleUpdateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.account) return;
    setEditing(true);

    try {
      const res = await fetch("/api/accounting/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.account.id,
          name: editName,
          type: editType,
          isReconcilable: editIsReconcilable,
          isAuxiliary: editIsAuxiliary,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, account: null });
        fetchAccounts();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur modification compte.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(acc: any) {
    setDeleteModal({ open: true, account: acc });
  }

  async function handleDeleteAccount() {
    if (!deleteModal.account) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/accounting/accounts?id=${deleteModal.account.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, account: null });
        fetchAccounts();
      } else {
        const d = await res.json();
        alert(d.error || "Impossible de supprimer ce compte.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
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
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des comptes...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
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
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(acc)}
                          title="Modifier le compte"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(acc)}
                          title="Supprimer le compte"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer un Compte au Plan Comptable
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Numéro de Compte (6 chiffres conseillés) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 411100"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (e.target.value.length > 0) {
                      setAccountClass(e.target.value[0]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Intitulé du Compte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clients - Ventes de services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Classe SYSCOHADA
                  </label>
                  <select
                    value={accountClass}
                    onChange={(e) => setAccountClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {SYSCOHADA_CLASSES.map((c) => (
                      <option key={c.number} value={c.number}>
                        Classe {c.number} ({c.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nature Comptable
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="ASSET">Actif (Bilan)</option>
                    <option value="LIABILITY">Passif (Bilan)</option>
                    <option value="EXPENSE">Charge (Compte 6)</option>
                    <option value="REVENUE">Produit (Compte 7)</option>
                    <option value="EQUITY">Capitaux Propres</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReconcilable}
                    onChange={(e) => setIsReconcilable(e.target.checked)}
                    className="rounded border-slate-300 text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-semibold text-slate-700">
                    Compte Lettrable (autorise le rapprochement des écritures)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAuxiliary}
                    onChange={(e) => setIsAuxiliary(e.target.checked)}
                    className="rounded border-slate-300 text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-semibold text-slate-700">
                    Compte de Tiers / Auxiliaire (Clients, Fournisseurs)
                  </span>
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
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {submitting ? "Création..." : "Créer le Compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Compte */}
      {editModal.open && editModal.account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier le Compte • {editModal.account.code}
                </h3>
                <p className="text-[11px] text-slate-500">{editModal.account.name}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, account: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Intitulé du Compte *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nature Comptable
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                >
                  <option value="ASSET">Actif (Bilan)</option>
                  <option value="LIABILITY">Passif (Bilan)</option>
                  <option value="EXPENSE">Charge (Compte 6)</option>
                  <option value="REVENUE">Produit (Compte 7)</option>
                  <option value="EQUITY">Capitaux Propres</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsReconcilable}
                    onChange={(e) => setEditIsReconcilable(e.target.checked)}
                    className="rounded border-slate-300 text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-semibold text-slate-700">
                    Compte Lettrable (autorise le rapprochement des écritures)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsAuxiliary}
                    onChange={(e) => setEditIsAuxiliary(e.target.checked)}
                    className="rounded border-slate-300 text-[#101B35] focus:ring-[#D4AF37]"
                  />
                  <span className="font-semibold text-slate-700">
                    Compte de Tiers / Auxiliaire (Clients, Fournisseurs)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, account: null })}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {editing ? "Modification..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Supprimer Compte */}
      {deleteModal.open && deleteModal.account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer le Compte</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.account.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir supprimer le compte{" "}
              <strong className="text-slate-900">{deleteModal.account.code} - {deleteModal.account.name}</strong> ?
              Les comptes possédant des écritures comptables enregistrées ne peuvent pas être supprimés afin de préserver l&apos;intégrité SYSCOHADA.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, account: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 shadow-sm"
              >
                {deleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
