"use client";

import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function AccountingEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<string>("ALL");

  // New entry modal
  const [showModal, setShowModal] = useState(false);
  const [journalId, setJournalId] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<any[]>([
    { accountId: "", description: "", debit: 0, credit: 0 },
    { accountId: "", description: "", debit: 0, credit: 0 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Counterpass modal
  const [counterpassModal, setCounterpassModal] = useState<{ open: boolean; entry: any | null }>({
    open: false,
    entry: null,
  });
  const [counterpassReason, setCounterpassReason] = useState("");
  const [counterpassing, setCounterpassing] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [resE, resJ, resA] = await Promise.all([
        fetch("/api/accounting/entries"),
        fetch("/api/accounting/journals"),
        fetch("/api/accounting/accounts"),
      ]);

      if (resE.ok) {
        const d = await resE.json();
        setEntries(d.entries || []);
      }
      if (resJ.ok) {
        const d = await resJ.json();
        setJournals(d.journals || []);
        if (d.journals?.length > 0 && !journalId) {
          setJournalId(d.journals[0].id);
        }
      }
      if (resA.ok) {
        const d = await resA.json();
        setAccounts(d.accounts || []);
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

  // Compute live debit/credit totals in form
  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  function updateLine(index: number, field: string, value: any) {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  }

  function addLine() {
    setLines([...lines, { accountId: "", description: "", debit: 0, credit: 0 }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  async function handleCreateEntry(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!isBalanced) {
      setFormError(`L'écriture doit être rigoureusement équilibrée : Total Débit (${formatFCFA(totalDebit)}) != Total Crédit (${formatFCFA(totalCredit)}).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalId,
          date: entryDate,
          description,
          reference,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la création de l'écriture.");
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setDescription("");
      setReference("");
      setLines([
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ]);
      loadData();
    } catch (err) {
      setFormError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCounterpass() {
    if (!counterpassModal.entry) return;
    setCounterpassing(true);

    try {
      const res = await fetch(`/api/accounting/entries/${counterpassModal.entry.id}/counterpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: counterpassReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erreur lors de la contrepassation.");
        setCounterpassing(false);
        return;
      }

      setCounterpassModal({ open: false, entry: null });
      setCounterpassReason("");
      loadData();
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setCounterpassing(false);
    }
  }

  const filteredEntries = selectedJournal === "ALL"
    ? entries
    : entries.filter((e) => e.journalId === selectedJournal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Partie Double • SYSCOHADA
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Écritures Comptables & Journal Général
          </h1>
          <p className="text-xs text-slate-500">
            Saisie assistée, vérification d&apos;équilibre et contrepassation traçable.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvelle Écriture</span>
        </button>
      </div>

      {/* Journal Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedJournal("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedJournal === "ALL"
              ? "bg-[#101B35] text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Tous les journaux ({entries.length})
        </button>
        {journals.map((j) => (
          <button
            key={j.id}
            onClick={() => setSelectedJournal(j.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedJournal === j.id
                ? "bg-[#D4AF37] text-[#101B35] font-bold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {j.code} - {j.name}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
            Chargement du journal général...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Aucune écriture trouvée pour ce journal.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const entryDebit = entry.lines?.reduce((s: number, l: any) => s + l.debit, 0) || 0;
            const entryCredit = entry.lines?.reduce((s: number, l: any) => s + l.credit, 0) || 0;
            const isCancelled = entry.status === "CANCELLED";

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border ${
                  isCancelled ? "border-slate-300 opacity-75" : "border-slate-200"
                } shadow-sm overflow-hidden`}
              >
                {/* Entry Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-[#101B35] text-white px-2.5 py-1 rounded-lg">
                      {entry.entryNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#101B35]">
                        {entry.description}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(entry.date)} • Journal: <span className="font-semibold text-slate-700">{entry.journal?.code} ({entry.journal?.name})</span>
                        {entry.reference ? ` • Réf: ${entry.reference}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCancelled
                          ? "bg-slate-200 text-slate-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isCancelled ? "ANNULÉE / CONTREPASSÉE" : "VALIDÉE (PARTIE DOUBLE)"}
                    </span>

                    {!isCancelled && (
                      <button
                        onClick={() => setCounterpassModal({ open: true, entry })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors"
                        title="Contrepasser conformément aux normes comptables"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Contrepasser</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Entry Lines */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-2 px-4 w-28">N° Compte</th>
                        <th className="py-2 px-4">Libellé de l&apos;opération</th>
                        <th className="py-2 px-4 text-right w-36">Débit</th>
                        <th className="py-2 px-4 text-right w-36">Crédit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entry.lines?.map((line: any) => (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-mono font-bold text-[#101B35]">
                            {line.account?.code}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700">
                            <span className="font-medium">{line.description}</span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              ({line.account?.name})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                            {line.debit > 0 ? formatFCFA(line.debit) : "-"}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                            {line.credit > 0 ? formatFCFA(line.credit) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                      <tr>
                        <td colSpan={2} className="py-2 px-4 text-right">
                          Total de l&apos;Écriture :
                        </td>
                        <td className="py-2 px-4 text-right text-[#101B35]">
                          {formatFCFA(entryDebit)}
                        </td>
                        <td className="py-2 px-4 text-right text-[#101B35]">
                          {formatFCFA(entryCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Accounting Entry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#101B35]">
                  Saisie d&apos;Écriture Comptable (Partie Double)
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-4 mt-4 text-xs flex-1 overflow-y-auto pr-1">
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Journal Auxiliaire *
                  </label>
                  <select
                    value={journalId}
                    onChange={(e) => setJournalId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none bg-white"
                  >
                    {journals.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.code} - {j.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date de Valeur *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Référence Document (N° Facture / Chèque)
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="FAC-2026-0001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Libellé Général de l&apos;Écriture *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Règlement facture Orange Niger par virement BOA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Dynamic Accounting Lines */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Lignes d&apos;Écriture</span>
                  <button
                    type="button"
                    onClick={addLine}
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
                        <th className="py-2 px-3 w-64">Compte SYSCOHADA</th>
                        <th className="py-2 px-3">Libellé</th>
                        <th className="py-2 px-3 w-32 text-right">Débit (FCFA)</th>
                        <th className="py-2 px-3 w-32 text-right">Crédit (FCFA)</th>
                        <th className="py-2 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lines.map((line, index) => (
                        <tr key={index} className="bg-white">
                          <td className="py-2 px-3">
                            <select
                              required
                              value={line.accountId}
                              onChange={(e) => updateLine(index, "accountId", e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono"
                            >
                              <option value="">Sélectionner un compte...</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.code} - {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) => updateLine(index, "description", e.target.value)}
                              placeholder={description || "Libellé de la ligne"}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={line.debit || ""}
                              onChange={(e) => updateLine(index, "debit", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs text-right font-semibold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={line.credit || ""}
                              onChange={(e) => updateLine(index, "credit", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs text-right font-semibold"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            {lines.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeLine(index)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Balance verification bar */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isBalanced
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-semibold">
                      {isBalanced
                        ? "Écriture équilibrée (Débit = Crédit)"
                        : `Déséquilibre : Écart de ${formatFCFA(difference)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-bold">
                    <span>Total Débit: {formatFCFA(totalDebit)}</span>
                    <span>Total Crédit: {formatFCFA(totalCredit)}</span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  disabled={submitting || !isBalanced}
                  className="px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold disabled:opacity-40"
                >
                  {submitting ? "Validation..." : "Valider et Enregistrer au Journal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Counterpass (Contrepassation) */}
      {counterpassModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#101B35]">
                Contrepassation de l&apos;Écriture {counterpassModal.entry?.entryNumber}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Conformément à la norme SYSCOHADA, une écriture validée ne peut être supprimée directement. Une opération de contrepassation va générer une écriture inverse traçable inversant tous les débits et crédits.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motif de la régularisation *
                </label>
                <input
                  type="text"
                  required
                  value={counterpassReason}
                  onChange={(e) => setCounterpassReason(e.target.value)}
                  placeholder="Ex: Erreur d'imputation comptable sur facture fournisseur"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCounterpassModal({ open: false, entry: null })}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCounterpass}
                  disabled={counterpassing || !counterpassReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40"
                >
                  {counterpassing ? "Traitement..." : "Confirmer la Contrepassation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
