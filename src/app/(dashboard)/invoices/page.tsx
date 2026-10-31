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
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [invoiceType, setInvoiceType] = useState("INVOICE");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([
    { description: "Prestation de services informatiques", quantity: 1, unitPrice: 1500000, taxRate: 19 },
  ]);
  const [submitting, setSubmitting] = useState(false);

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
          items,
          autoPostAccounting: true,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setItems([{ description: "", quantity: 1, unitPrice: 0, taxRate: 19 }]);
        setNotes("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
          cashAccountId: paymentMethod === "CASH" ? cashAccounts[0]?.id : null,
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
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {["ALL", "SENT", "PARTIAL", "PAID"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === st
                ? "bg-[#101B35] text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {st === "ALL" && `Toutes (${invoices.length})`}
            {st === "SENT" && "En attente"}
            {st === "PARTIAL" && "Partiellement payées"}
            {st === "PAID" && "Réglées intégralement"}
          </button>
        ))}
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
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          title="Aperçu et Impression"
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#101B35]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => openPayment(inv)}
                            title="Enregistrer un paiement"
                            className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Payer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Invoice */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#101B35]">
                Créer une Facture Client (SYSCOHADA)
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4 text-xs flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Destinataire *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
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

              {/* Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Lignes de la Facture</span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Désignation des Prestations / Articles</th>
                        <th className="py-2 px-3 w-20 text-center">Qté</th>
                        <th className="py-2 px-3 w-32 text-right">Prix Unitaire HT</th>
                        <th className="py-2 px-3 w-24 text-center">TVA (%)</th>
                        <th className="py-2 px-3 w-32 text-right">Total HT</th>
                        <th className="py-2 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => {
                        const lineHT = (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0);
                        return (
                          <tr key={idx} className="bg-white">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                required
                                value={it.description}
                                onChange={(e) => updateItem(idx, "description", e.target.value)}
                                placeholder="Désignation du produit ou service"
                                className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                                className="w-full p-1.5 border border-slate-200 rounded-lg text-xs text-center"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={it.unitPrice}
                                onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                                className="w-full p-1.5 border border-slate-200 rounded-lg text-xs text-right font-semibold"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <select
                                value={it.taxRate}
                                onChange={(e) => updateItem(idx, "taxRate", e.target.value)}
                                className="p-1.5 border border-slate-200 rounded-lg text-xs bg-white text-center font-bold"
                              >
                                <option value="19">19% (Niger)</option>
                                <option value="0">0% (Exo)</option>
                              </select>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800">
                              {formatFCFA(lineHT)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end pt-3">
                  <div className="w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total HT :</span>
                      <span className="font-semibold">{formatFCFA(formSubtotalHT)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>TVA (19%) :</span>
                      <span className="font-semibold">{formatFCFA(formTaxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[#101B35] font-extrabold pt-1 border-t border-slate-200 text-sm">
                      <span>Total TTC :</span>
                      <span className="text-[#D4AF37]">{formatFCFA(formTotalTTC)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Conditions de règlement & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Règlement par virement bancaire BOA Niger. Échéance stricte à 30 jours."
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
                  disabled={submitting || items.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold disabled:opacity-40"
                >
                  {submitting ? "Émission..." : "Émettre et Valider au Journal VT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {paymentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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

      {/* Modal: Preview / Print Invoice Template */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] overflow-y-auto print:p-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Modèle Professionnel de Facture SYSCOHADA
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold"
                >
                  <Printer className="w-4 h-4 text-[#D4AF37]" />
                  <span>Imprimer en PDF</span>
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="pt-6 space-y-6 text-xs text-slate-800">
              {/* Header Company & Invoice Title */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold text-[#101B35] tracking-tight">
                    SAHEL TECH INNOVATIONS SARL
                  </h2>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Boulevard Mali Béro, Quartier Plateau, Niamey - Niger
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    NIF: 34567/R • RCCM: NI-NIA-2023-B-1042 • Tél: +227 20 73 00 00
                  </p>
                  <p className="text-slate-500 text-[11px]">Email: contact@saheltech.ne</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-[#101B35] text-white rounded-lg font-mono font-bold text-sm">
                    {previewInvoice.invoiceNumber}
                  </div>
                  <p className="text-slate-500 text-[11px]">Date : {formatDate(previewInvoice.date)}</p>
                  <p className="text-slate-500 text-[11px]">Échéance : {formatDate(previewInvoice.dueDate)}</p>
                </div>
              </div>

              {/* Customer Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Facturé à :</span>
                  <p className="text-sm font-bold text-[#101B35] mt-1">{previewInvoice.customer?.name}</p>
                  <p className="text-slate-500 text-[11px]">{previewInvoice.customer?.address || "Niamey, Niger"}</p>
                  <p className="text-slate-500 text-[11px]">NIF: {previewInvoice.customer?.nif || "-"}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Conditions :</span>
                  <p className="mt-1 font-semibold text-slate-700">{previewInvoice.paymentTerms || "30 jours"}</p>
                  <p>Devise : FCFA (XOF)</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#101B35] text-white">
                  <tr>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-3 text-center w-16">Qté</th>
                    <th className="py-2.5 px-3 text-right w-28">Prix Unitaire HT</th>
                    <th className="py-2.5 px-3 text-center w-20">TVA</th>
                    <th className="py-2.5 px-3 text-right w-32">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewInvoice.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{it.description}</td>
                      <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{formatFCFA(it.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{it.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatFCFA(it.subtotalHT)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Stamp */}
              <div className="flex justify-between items-start pt-4">
                <div className="max-w-xs space-y-2">
                  <p className="text-[11px] text-slate-500 italic">
                    Arrêté la présente facture à la somme de{" "}
                    <span className="font-bold text-slate-800">{formatFCFA(previewInvoice.totalTTC)}</span>.
                  </p>
                  <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                    Cachet & Signature autorisée
                  </div>
                </div>

                <div className="w-64 space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Total HT :</span>
                    <span className="font-semibold">{formatFCFA(previewInvoice.subtotalHT)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TVA (19% Niger) :</span>
                    <span className="font-semibold">{formatFCFA(previewInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#101B35] font-extrabold text-sm pt-2 border-t border-slate-200">
                    <span>Total TTC :</span>
                    <span className="text-[#D4AF37]">{formatFCFA(previewInvoice.totalTTC)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                    <span>Montant Encaissé :</span>
                    <span>{formatFCFA(previewInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-extrabold pt-1 border-t border-slate-200">
                    <span>Solde Dû :</span>
                    <span>{formatFCFA(previewInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
