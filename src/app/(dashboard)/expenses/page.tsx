"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, Search, Filter, X, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Expense form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amountHT, setAmountHT] = useState("");
  const [taxRate, setTaxRate] = useState("19");
  const [paymentSource, setPaymentSource] = useState("BANK"); // BANK or CASH
  const [bankAccountId, setBankAccountId] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  // Edit Expense form
  const [editModal, setEditModal] = useState<{ open: boolean; expense: any | null }>({
    open: false,
    expense: null,
  });
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSupplierId, setEditSupplierId] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete Expense state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; expense: any | null }>({
    open: false,
    expense: null,
  });
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [resExp, resTreasury, resSuppliers] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/treasury"),
        fetch("/api/suppliers"),
      ]);

      if (resExp.ok) {
        const d = await resExp.json();
        setExpenses(d.expenses || []);
        setCategories(d.categories || []);
        if (d.categories?.length > 0 && !categoryId) {
          setCategoryId(d.categories[0].id);
        }
      }

      if (resTreasury.ok) {
        const d = await resTreasury.json();
        setBankAccounts(d.bankAccounts || []);
        setCashAccounts(d.cashAccounts || []);
        if (d.bankAccounts?.length > 0) setBankAccountId(d.bankAccounts[0].id);
        if (d.cashAccounts?.length > 0) setCashAccountId(d.cashAccounts[0].id);
      }

      if (resSuppliers.ok) {
        const d = await resSuppliers.json();
        setSuppliers(d.suppliers || []);
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

  // Compute live totals
  const numHT = parseFloat(amountHT) || 0;
  const numTaxRate = parseFloat(taxRate) || 0;
  const computedTax = Math.round(numHT * (numTaxRate / 100));
  const computedTTC = numHT + computedTax;

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          supplierId: supplierId || null,
          amountHT: numHT,
          taxRate: numTaxRate,
          bankAccountId: paymentSource === "BANK" ? bankAccountId : null,
          cashAccountId: paymentSource === "CASH" ? cashAccountId : null,
          paymentMethod: paymentSource === "BANK" ? "BANK_TRANSFER" : "CASH",
          date: expenseDate,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setAmountHT("");
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur enregistrement dépense.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(exp: any) {
    setEditModal({ open: true, expense: exp });
    setEditTitle(exp.title || "");
    setEditDescription(exp.description || "");
    setEditCategoryId(exp.categoryId || "");
    setEditSupplierId(exp.supplierId || "");
  }

  async function handleUpdateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.expense) return;
    setEditing(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.expense.id,
          title: editTitle,
          description: editDescription,
          categoryId: editCategoryId,
          supplierId: editSupplierId || null,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, expense: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur modification dépense.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(exp: any) {
    setDeleteModal({ open: true, expense: exp });
  }

  async function handleDeleteExpense() {
    if (!deleteModal.expense) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/expenses?id=${deleteModal.expense.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, expense: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur suppression dépense.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
    }
  }

  const totalDepenses = expenses.reduce((sum, e) => sum + e.totalTTC, 0);
  const totalTVArecup = expenses.reduce((sum, e) => sum + e.taxAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Charges & Dépenses • Classe 6
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion des Dépenses d&apos;Exploitation
          </h1>
          <p className="text-xs text-slate-500">
            Saisie des charges, récupération de la TVA (19%) et imputation automatique en banque ou caisse.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvelle Dépense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Dépenses TTC</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{formatFCFA(totalDepenses)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">TVA Déductible Récupérable (Compte 445)</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatFCFA(totalTVArecup)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Nombre d&apos;Opérations</span>
          <p className="text-xl font-extrabold text-slate-700 mt-1">{expenses.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Dépense</th>
                <th className="py-3 px-4">Titre de la Dépense</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Montant HT</th>
                <th className="py-3 px-4 text-right">TVA Déductible</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4 text-center">Règlement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des dépenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{exp.title}</div>
                      {exp.supplier && (
                        <div className="text-[11px] text-slate-400">Fournisseur : {exp.supplier.name}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {exp.category?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatFCFA(exp.amountHT)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatFCFA(exp.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">
                      {formatFCFA(exp.totalTTC)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {exp.bankAccount ? `Banque: ${exp.bankAccount.bankName}` : "Caisse Espèces"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(exp)}
                          title="Modifier la dépense"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(exp)}
                          title="Supprimer la dépense"
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

      {/* Modal: Nouvelle Dépense */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Enregistrer une Dépense d&apos;Exploitation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de la Dépense *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Facture électricité NIGELEC Siège"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie Comptable *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur (Optionnel)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="">-- Aucun / Frais divers --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant Hors Taxe (HT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amountHT}
                    onChange={(e) => setAmountHT(e.target.value)}
                    placeholder="Montant FCFA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Taux TVA (Niger)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  >
                    <option value="19">19% (Taux Normal Niger)</option>
                    <option value="0">0% (Exonéré / Non assujetti)</option>
                  </select>
                </div>
              </div>

              {/* Total simulation */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>TVA Récupérable (Compte 445200) :</span>
                  <span className="font-bold text-emerald-700">{formatFCFA(computedTax)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#101B35] pt-1 border-t border-slate-200">
                  <span>Total TTC Décaissé :</span>
                  <span className="text-[#D4AF37]">{formatFCFA(computedTTC)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source de Règlement *</label>
                  <select
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold"
                  >
                    <option value="BANK">Banque (BOA Niger)</option>
                    <option value="CASH">Caisse Principale (Espèces)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date de la dépense *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Motif</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Justification de la dépense..."
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
                  disabled={submitting || !amountHT}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {submitting ? "Enregistrement..." : "Valider la Dépense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier Dépense */}
      {editModal.open && editModal.expense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier la Dépense • {editModal.expense.expenseNumber}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Montant : {formatFCFA(editModal.expense.totalTTC)}
                </p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, expense: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de la Dépense *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie Comptable *</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur</label>
                  <select
                    value={editSupplierId}
                    onChange={(e) => setEditSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="">-- Aucun / Frais divers --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Motif</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, expense: null })}
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

      {/* Modal: Supprimer Dépense */}
      {deleteModal.open && deleteModal.expense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer la Dépense</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.expense.expenseNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cette dépense de{" "}
              <strong className="text-slate-900">{formatFCFA(deleteModal.expense.totalTTC)}</strong> ({deleteModal.expense.title}) ?
              Le solde de trésorerie associé (banque ou caisse) sera automatiquement réajusté.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, expense: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
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
