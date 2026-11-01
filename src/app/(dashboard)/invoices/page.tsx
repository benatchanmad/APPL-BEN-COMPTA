"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  CreditCard,
  Printer,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
} from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [invoiceType, setInvoiceType] = useState("INVOICE");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Règlement sous 30 jours");
  const [items, setItems] = useState<any[]>([
    { description: "Prestation de services informatiques & maintenance", quantity: 1, unitPrice: 1500000, taxRate: 19 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Edit Invoice Modal
  const [editModal, setEditModal] = useState<{ open: boolean; invoice: any | null }>({
    open: false,
    invoice: null,
  });
  const [editDueDate, setEditDueDate] = useState("");
  const [editPaymentTerms, setEditPaymentTerms] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("SENT");
  const [editing, setEditing] = useState(false);

  // Delete Invoice Modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; invoice: any | null }>({
    open: false,
    invoice: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Payment Modal
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoice: any | null }>({
    open: false,
    invoice: null,
  });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [bankAccountId, setBankAccountId] = useState("");
  const [cashAccountId, setCashAccountId] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paying, setPaying] = useState(false);

  // Invoice Preview / Print Modal
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [resInv, resCust, resTreasury] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/customers"),
        fetch("/api/treasury"),
      ]);

      if (resInv.ok) {
        const d = await resInv.json();
        setInvoices(d.invoices || []);
      }
      if (resCust.ok) {
        const d = await resCust.json();
        setCustomers(d.customers || []);
        if (d.customers?.length > 0 && !customerId) {
          setCustomerId(d.customers[0].id);
        }
      }
      if (resTreasury.ok) {
        const d = await resTreasury.json();
        setBankAccounts(d.bankAccounts || []);
        setCashAccounts(d.cashAccounts || []);
        if (d.bankAccounts?.length > 0) {
          setBankAccountId(d.bankAccounts[0].id);
        }
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

  // Compute live invoice totals in form
  let formSubtotalHT = 0;
  let formTaxAmount = 0;
  for (const it of items) {
    const q = parseFloat(it.quantity) || 1;
    const p = parseFloat(it.unitPrice) || 0;
    const t = parseFloat(it.taxRate) || 0;
    const ht = q * p;
    formSubtotalHT += ht;
    formTaxAmount += Math.round(ht * (t / 100));
  }
  const formTotalTTC = formSubtotalHT + formTaxAmount;

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, taxRate: 19 }]);
  }

  function updateItem(index: number, field: string, val: any) {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type: invoiceType,
          date: invoiceDate,
          dueDate,
          notes,
          paymentTerms,
          items,
          autoPostAccounting: true,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setItems([{ description: "", quantity: 1, unitPrice: 0, taxRate: 19 }]);
        setNotes("");
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur lors de la création de la facture.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(inv: any) {
    setEditModal({ open: true, invoice: inv });
    setEditDueDate(inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "");
    setEditPaymentTerms(inv.paymentTerms || "Règlement sous 30 jours");
    setEditNotes(inv.notes || "");
    setEditStatus(inv.status || "SENT");
  }

  async function handleUpdateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.invoice) return;
    setEditing(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.invoice.id,
          dueDate: editDueDate,
          paymentTerms: editPaymentTerms,
          notes: editNotes,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setEditModal({ open: false, invoice: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur lors de la modification.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de réseau");
    } finally {
      setEditing(false);
    }
  }

  function openDelete(inv: any) {
    setDeleteModal({ open: true, invoice: inv });
  }

  async function handleDeleteInvoice() {
    if (!deleteModal.invoice) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/invoices?id=${deleteModal.invoice.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, invoice: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Impossible de supprimer cette facture.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setDeleting(false);
    }
  }

  function openPayment(inv: any) {
    setPaymentModal({ open: true, invoice: inv });
    setPaymentAmount(inv.balanceDue);
    setPaymentRef(`VIR-${Date.now().toString().slice(-6)}`);
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentModal.invoice) return;
    setPaying(true);

    try {
      const res = await fetch(`/api/invoices/${paymentModal.invoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          bankAccountId: paymentMethod === "CASH" ? null : bankAccountId,
          cashAccountId: paymentMethod === "CASH" ? (cashAccounts[0]?.id || null) : null,
          reference: paymentRef,
        }),
      });

      if (res.ok) {
        setPaymentModal({ open: false, invoice: null });
        loadData();
      } else {
        const d = await res.json();
        alert(d.error || "Erreur enregistrement paiement.");
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setPaying(false);
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Facturation Conforme Niger (TVA 19%)
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Facturation Clients & Encaissements
          </h1>
          <p className="text-xs text-slate-500">
            Émission des factures, calcul automatique de TVA, écritures au journal des ventes et suivi des règlements.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvelle Facture</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "SENT", "PARTIAL", "PAID"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? "bg-[#101B35] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st === "ALL" && `Toutes (${invoices.length})`}
              {st === "SENT" && "En attente"}
              {st === "PARTIAL" && "Partielles"}
              {st === "PAID" && "Réglées"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher facture ou client..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-right">Montant HT</th>
                <th className="py-3 px-4 text-right">TVA (19%)</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4 text-right">Reste Dû</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement des factures...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Aucune facture trouvée.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.customer?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatFCFA(inv.subtotalHT)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {formatFCFA(inv.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">
                      {formatFCFA(inv.totalTTC)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-700">
                      {inv.balanceDue > 0 ? formatFCFA(inv.balanceDue) : "0 FCFA"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === "PARTIAL"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status === "PAID" && "RÉGLÉE"}
                        {inv.status === "PARTIAL" && "PARTIELLE"}
                        {inv.status === "SENT" && "EN ATTENTE"}
                        {inv.status === "DRAFT" && "BROUILLON"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Aperçu & Imprimer PDF */}
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          title="Aperçu & Imprimer en PDF"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#101B35] text-slate-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. Modifier */}
                        <button
                          onClick={() => openEdit(inv)}
                          title="Modifier la facture"
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-[#D4AF37] text-amber-700 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Payer (si solde > 0) */}
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => openPayment(inv)}
                            title="Enregistrer un paiement"
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[10px] border border-emerald-200 transition-all shadow-sm flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Payer</span>
                          </button>
                        )}

                        {/* 4. Supprimer */}
                        <button
                          onClick={() => openDelete(inv)}
                          title="Supprimer la facture"
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

      {/* MODAL 1: Nouvelle Facture */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer une Nouvelle Facture Client (SYSCOHADA)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-medium"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name} {c.companyName ? `(${c.companyName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type de Document</label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="INVOICE">Facture Définitive</option>
                    <option value="PROFORMA">Facture Proforma / Devis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d&apos;Émission *</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d&apos;Échéance *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Conditions de règlement</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex: Règlement sous 30 jours par virement bancaire BOA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Items Table in Form */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Lignes de la Facture *</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[#D4AF37] hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        required
                        placeholder="Désignation des prestations ou marchandises"
                        value={it.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Prix HT"
                        value={it.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-right font-medium"
                      />
                      <span className="text-[11px] font-bold text-slate-500 px-1">TVA 19%</span>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="text-rose-500 hover:text-rose-700 p-1 disabled:opacity-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total Hors Taxes (HT) :</span>
                  <span className="font-semibold">{formatFCFA(formSubtotalHT)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA Légale Niger (19%) :</span>
                  <span className="font-semibold">{formatFCFA(formTaxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#101B35] pt-1 border-t border-slate-200">
                  <span>Total Net TTC :</span>
                  <span className="text-[#D4AF37]">{formatFCFA(formTotalTTC)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Précisions de paiement, coordonnées bancaires..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                >
                  {submitting ? "Création..." : "Émettre la Facture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Modifier la Facture */}
      {editModal.open && editModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#101B35]">
                  Modifier la Facture {editModal.invoice.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-500">Client : {editModal.invoice.customer?.name}</p>
              </div>
              <button
                onClick={() => setEditModal({ open: false, invoice: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInvoice} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date d&apos;Échéance</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Conditions de Règlement</label>
                <input
                  type="text"
                  value={editPaymentTerms}
                  onChange={(e) => setEditPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statut</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="SENT">En attente (Envoyée)</option>
                  <option value="PARTIAL">Partiellement payée</option>
                  <option value="PAID">Réglée</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes Internes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, invoice: null })}
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

      {/* MODAL 3: Supprimer la Facture */}
      {deleteModal.open && deleteModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supprimer la Facture</h3>
                <p className="text-[11px] text-slate-500">{deleteModal.invoice.invoiceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement cette facture de{" "}
              <strong className="text-slate-900">{formatFCFA(deleteModal.invoice.totalTTC)}</strong> émise pour{" "}
              <strong className="text-slate-900">{deleteModal.invoice.customer?.name}</strong> ? Le compte client sera réajusté.
            </p>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, invoice: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteInvoice}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 shadow-sm"
              >
                {deleting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Encaisser un Règlement */}
      {paymentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Encaisser le Règlement • {paymentModal.invoice?.invoiceNumber}
              </h3>
              <button
                onClick={() => setPaymentModal({ open: false, invoice: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Client :</span>
                  <span className="font-bold text-slate-800">{paymentModal.invoice?.customer?.name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Reste à payer :</span>
                  <span className="font-bold text-amber-700">{formatFCFA(paymentModal.invoice?.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Montant Encaissé (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentModal.invoice?.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-bold text-sm text-[#101B35]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mode d&apos;Encaissement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Virement Bancaire (Journal BQ)</option>
                  <option value="CHECK">Chèque Bancaire (Journal BQ)</option>
                  <option value="CASH">Espèces en Caisse (Journal CA)</option>
                  <option value="MOBILE_MONEY">Mobile Money (Airtel / Moov)</option>
                </select>
              </div>

              {paymentMethod !== "CASH" ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compte Bancaire d&apos;Imputation *</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-medium"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 text-[11px]">
                  Encaissement imputé à la Caisse Principale Siège (Niamey) - Compte 571100.
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence Transaction</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="N° Virement ou Chèque"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ open: false, invoice: null })}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={paying || !paymentAmount}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40"
                >
                  {paying ? "Enregistrement..." : "Valider l'Encaissement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Modèle d'Impression PDF Complet SYSCOHADA avec Informations de la Société et Tableau */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 print:p-0 print:bg-white print:static">
          <div
            id="printable-invoice"
            className="print-container bg-white rounded-2xl max-w-4xl w-full p-8 sm:p-10 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0"
          >
            {/* Top Toolbar (Hidden when printing) */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">
                    Facture Commerciale Conforme SYSCOHADA & DGI Niger
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Prêt pour impression A4 ou export en PDF
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-md transition-all"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>Imprimer en PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT OFFICIEL IMPRIMABLE */}
            <div className="pt-6 space-y-6 text-xs text-slate-800">
              {/* EN-TÊTE DE LA SOCIÉTÉ ÉMETTRICE & TITRE DU DOCUMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b-2 border-[#101B35]">
                {/* Information Complète de la Société */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#D4AF37]"></span>
                    <h2 className="text-xl font-black text-[#101B35] tracking-tight uppercase">
                      SAHEL TECH INNOVATIONS SARL
                    </h2>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Société à Responsabilité Limitée au capital de 10 000 000 FCFA
                  </p>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>Boulevard Mali Béro, Quartier Plateau, Niamey - RÉPUBLIQUE DU NIGER</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>
                        <strong>NIF :</strong> 34567/R • <strong>RCCM :</strong> NI-NIA-2023-B-1042
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>Régime Fiscal : Réel Normal • Centre des Impôts : DME Niamey</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>(+227) 20 73 00 00 / (+227) 96 00 00 00</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>contact@saheltech.ne • www.saheltech.ne</span>
                    </p>
                  </div>
                </div>

                {/* Bloc Document & Dates */}
                <div className="sm:text-right flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 bg-[#101B35] text-[#D4AF37] rounded-lg font-black text-sm uppercase tracking-wider">
                      FACTURE COMMERCIALE
                    </span>
                    <p className="font-mono text-base font-extrabold text-[#101B35] mt-1">
                      N° {previewInvoice.invoiceNumber}
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div className="flex sm:justify-end gap-3">
                      <span className="text-slate-500">Date d&apos;émission :</span>
                      <strong className="text-slate-900">{formatDate(previewInvoice.date)}</strong>
                    </div>
                    <div className="flex sm:justify-end gap-3">
                      <span className="text-slate-500">Date d&apos;échéance :</span>
                      <strong className="text-slate-900">{formatDate(previewInvoice.dueDate)}</strong>
                    </div>
                    <div className="flex sm:justify-end gap-3">
                      <span className="text-slate-500">Mode de règlement :</span>
                      <strong className="text-slate-900">{previewInvoice.paymentTerms || "Virement Bancaire (30 jours)"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* IDENTIFICATION DU CLIENT (DOIT) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#8C6D15] uppercase tracking-wider block">
                    Facturé à (DOIT) :
                  </span>
                  <p className="text-sm font-extrabold text-[#101B35] mt-1">
                    {previewInvoice.customer?.name}
                  </p>
                  {previewInvoice.customer?.companyName && (
                    <p className="text-xs font-semibold text-slate-700">
                      {previewInvoice.customer.companyName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-600 mt-1">
                    {previewInvoice.customer?.address || "Niamey, République du Niger"}
                  </p>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 sm:text-right">
                  <p>
                    <strong className="text-slate-800">NIF Client :</strong>{" "}
                    {previewInvoice.customer?.nif || "Non assujetti"}
                  </p>
                  <p>
                    <strong className="text-slate-800">RCCM Client :</strong>{" "}
                    {previewInvoice.customer?.rccm || "-"}
                  </p>
                  {previewInvoice.customer?.phone && (
                    <p>
                      <strong className="text-slate-800">Téléphone :</strong>{" "}
                      {previewInvoice.customer.phone}
                    </p>
                  )}
                  {previewInvoice.customer?.email && (
                    <p>
                      <strong className="text-slate-800">Email :</strong>{" "}
                      {previewInvoice.customer.email}
                    </p>
                  )}
                </div>
              </div>

              {/* TABLEAU DÉTAILLÉ DES ARTICLES ET PRESTATIONS */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#101B35] text-white">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center font-bold">#</th>
                      <th className="py-3 px-3 font-bold">Désignation des Prestations & Marchandises</th>
                      <th className="py-3 px-3 text-center w-16 font-bold">Qté</th>
                      <th className="py-3 px-3 text-right w-32 font-bold">Prix Unitaire HT</th>
                      <th className="py-3 px-3 text-center w-20 font-bold">TVA</th>
                      <th className="py-3 px-3 text-right w-36 font-bold">Montant Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewInvoice.items && previewInvoice.items.length > 0 ? (
                      previewInvoice.items.map((it: any, index: number) => (
                        <tr key={it.id || index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900 leading-snug">
                            {it.description}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {it.quantity}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-800 font-mono">
                            {formatFCFA(it.unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {it.taxRate}%
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900 font-mono">
                            {formatFCFA(it.subtotalHT)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          Prestation forfaitaire
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* CADRE TOTALISATION, MENTIONS LÉGALES & COORDONNÉES BANCAIRES */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
                {/* Gauche : Arrêté en lettres, RIB BOA Niger et Cachet */}
                <div className="sm:col-span-7 space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Arrêté de la présente facture :
                    </span>
                    <p className="text-[11px] text-slate-800 font-bold italic mt-1">
                      Arrêtée la présente facture à la somme TTC de :{" "}
                      <span className="text-[#101B35] underline">{formatFCFA(previewInvoice.totalTTC)}</span> (Francs CFA).
                    </p>
                  </div>

                  {/* Coordonnées bancaires officielles pour le règlement */}
                  <div className="p-3 rounded-xl bg-[#FAF6E8] border border-[#D4AF37]/40 text-[11px] space-y-1">
                    <span className="font-extrabold text-[#101B35] block">
                      Coordonnées de Règlement Bancaire (BOA Niger) :
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span>Banque : </span>
                        <strong>Bank Of Africa Niger</strong>
                      </div>
                      <div>
                        <span>Agence : </span>
                        <strong>Siège Niamey (Code 50123)</strong>
                      </div>
                      <div className="col-span-2">
                        <span>IBAN : </span>
                        <strong className="font-mono text-slate-900">NE54 NE04 5012 3456 7890 1234 5678</strong>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center h-28 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Mention Bon pour Accord Client
                      </span>
                      <span className="text-[9px] text-slate-400">Date, Nom & Signature</span>
                    </div>
                    <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center h-28 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#101B35] uppercase">
                        Pour SAHEL TECH INNOVATIONS
                      </span>
                      <div className="text-[9px] text-slate-500">
                        <span className="font-bold block">La Direction Générale</span>
                        <span>Cachet & Signature autorisée</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Droite : Décompte Financier & Solde */}
                <div className="sm:col-span-5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2.5">
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>Total Brut Hors Taxes (HT) :</span>
                      <span className="font-mono font-bold">{formatFCFA(previewInvoice.subtotalHT)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>TVA Légale Niger (19,0%) :</span>
                      <span className="font-mono font-bold">{formatFCFA(previewInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-[#101B35] pt-2 border-t-2 border-slate-300">
                      <span>TOTAL GÉNÉRAL TTC :</span>
                      <span className="font-mono text-[#D4AF37]">{formatFCFA(previewInvoice.totalTTC)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                      <span>Acomptes & Règlements :</span>
                      <span className="font-mono">- {formatFCFA(previewInvoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-rose-700 pt-2 border-t-2 border-slate-300 bg-rose-50/70 p-2 rounded-lg">
                      <span>SOLDE NET À PAYER :</span>
                      <span className="font-mono">{formatFCFA(previewInvoice.balanceDue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PIED DE PAGE LÉGAL */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5 print:pt-4">
                <p className="font-semibold text-slate-600">
                  SAHEL TECH INNOVATIONS SARL • Capital : 10 000 000 FCFA • NIF : 34567/R • RCCM : NI-NIA-2023-B-1042
                </p>
                <p>
                  Siège Social : Boulevard Mali Béro, Quartier Plateau, Niamey - Niger • Téléphone : (+227) 20 73 00 00
                </p>
                <p className="italic">
                  Facture certifiée conforme au Système Comptable Ouest Africain (SYSCOHADA révisé) et au Code Général des Impôts du Niger.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
