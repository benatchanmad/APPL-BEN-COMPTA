"use client";

import { useEffect, useState } from "react";
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  Printer,
  X,
  Send,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function TaxationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/taxation?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const vat = data?.currentCalculation || {
    totalBaseHT: 17000000,
    totalTvaCollectee: 3230000,
    totalTvaDeductible: 470849,
    netTvaToPay: 2759151,
    vatCredit: 0,
  };

  const declarations = data?.declarations || [];

  async function handleTeledeclaration(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/taxation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodMonth: selectedMonth,
          periodYear: selectedYear,
          totalBaseHT: vat.totalBaseHT,
          totalTvaCollectee: vat.totalTvaCollectee,
          totalTvaDeductible: vat.totalTvaDeductible,
          netTvaToPay: vat.netTvaToPay,
          notes: notes || `Déclaration TVA ${selectedMonth.toString().padStart(2, "0")}/${selectedYear} déposée en ligne auprès de la DGI Niger.`,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setSuccessMessage(`Déclaration ${selectedMonth.toString().padStart(2, "0")}/${selectedYear} enregistrée et télétransmise avec succès !`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setShowDeclarationModal(false);
        loadData();
      } else {
        alert(resData.error || "Erreur lors de la déclaration.");
      }
    } catch (err) {
      alert("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Direction Générale des Impôts (DGI Niger)
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion de la TVA & Fiscalité des Entreprises
          </h1>
          <p className="text-xs text-slate-500">
            TVA Collectée (19%), TVA Déductible, liquidation nette et bordereau de télédéclaration officielle.
          </p>
        </div>

        <button
          onClick={() => setShowDeclarationModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <span>Générer la Déclaration Mensuelle</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tax Rates Configuration Card */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF6E8] text-[#8C6D15] flex items-center justify-center border border-[#D4AF37]/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#101B35]">
              Régime Fiscal : Réel Normal • République du Niger
            </h3>
            <p className="text-[11px] text-slate-500">
              Taux légal de TVA en vigueur au Niger : <strong className="text-slate-800">19,0%</strong> • Déclaration mensuelle obligatoire avant le 15 du mois suivant.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          Paramétrage Conforme DGI Niger
        </span>
      </div>

      {/* Primary 3 VAT Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            1. TVA Facturée / Collectée (Compte 443)
          </span>
          <p className="text-2xl font-extrabold text-[#101B35]">
            {formatFCFA(vat.totalTvaCollectee)}
          </p>
          <p className="text-[11px] text-slate-400">
            Collectée sur ventes de marchandises et prestations de services (19%).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            2. TVA Récupérable / Déductible (Compte 445)
          </span>
          <p className="text-2xl font-extrabold text-emerald-700">
            {formatFCFA(vat.totalTvaDeductible)}
          </p>
          <p className="text-[11px] text-slate-400">
            Déductible sur achats d&apos;exploitation, loyers, électricité et immobilisations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101B35] to-[#1D3157] text-white shadow-lg border border-[#1D3157] space-y-2">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
            3. TVA Nette Due à Payer (Compte 444)
          </span>
          <p className="text-2xl font-extrabold text-white">
            {formatFCFA(vat.netTvaToPay)}
          </p>
          <p className="text-[11px] text-slate-300">
            {vat.vatCredit > 0
              ? `Crédit de TVA reportable : ${formatFCFA(vat.vatCredit)}`
              : "Solde net à liquider auprès de la Recette des Impôts."}
          </p>
        </div>
      </div>

      {/* Tax Liquidation Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#101B35]">
            Bordereau de Liquidation Fiscale de la TVA (Exercice en Cours)
          </h3>
          <button
            onClick={() => setShowDeclarationModal(true)}
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Télédéclarer la période</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ligne de Déclaration</th>
                <th className="py-3 px-4">Compte SYSCOHADA</th>
                <th className="py-3 px-4 text-right">Base Imposable (HT)</th>
                <th className="py-3 px-4 text-center">Taux</th>
                <th className="py-3 px-4 text-right">Montant Taxe (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  Ligne 01 : Opérations taxables à 19% (Ventes locales Niger)
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">443100 / 443200</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">{formatFCFA(vat.totalBaseHT)}</td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">{formatFCFA(vat.totalTvaCollectee)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  Ligne 02 : TVA déductible sur immobilisations
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">445100</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">0 FCFA</td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">0 FCFA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  Ligne 03 : TVA déductible sur autres biens et services
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">445200</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">
                  {formatFCFA(Math.round(vat.totalTvaDeductible / 0.19))}
                </td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                  - {formatFCFA(vat.totalTvaDeductible)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-extrabold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right text-slate-800 uppercase text-xs">
                  Net TVA à Décaisser (Compte 444100) :
                </td>
                <td className="py-3 px-4 text-right text-[#101B35] text-sm">
                  {formatFCFA(vat.netTvaToPay)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Past Declarations List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#101B35]">
          Historique des Déclarations Mensuelles Enregistrées
        </h3>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Période Fiscale</th>
                <th className="py-3 px-4 text-right">Chiffre d&apos;Affaires HT</th>
                <th className="py-3 px-4 text-right">TVA Collectée (19%)</th>
                <th className="py-3 px-4 text-right">TVA Déductible</th>
                <th className="py-3 px-4 text-right">Net à Payer</th>
                <th className="py-3 px-4 text-center">Statut DGI</th>
                <th className="py-3 px-4 text-center">Date de Dépôt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {declarations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Aucune déclaration archivée pour le moment.
                  </td>
                </tr>
              ) : (
                declarations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-[#101B35]">
                      {monthNames[d.periodMonth - 1]} {d.periodYear}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatFCFA(d.totalBaseHT)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatFCFA(d.totalTvaCollectee)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {formatFCFA(d.totalTvaDeductible)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">
                      {formatFCFA(d.netTvaToPay)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {d.status === "SUBMITTED" ? "TÉLÉDÉCLARÉE" : d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {formatDate(d.submittedAt || d.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Générer et Télédéclarer le Bordereau Officiel DGI Niger */}
      {showDeclarationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:static print:p-0 print:bg-white">
          <div className="print-container bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 max-h-[90vh] overflow-y-auto print:max-h-none print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#101B35] text-[#D4AF37] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">
                    Déclaration Mensuelle de TVA • Formulaire DGI Niger
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bordereau officiel de liquidation et télédéclaration en ligne
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeclarationModal(false)}
                className="text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeledeclaration} className="space-y-4 mt-4 text-xs">
              {/* Period selection */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mois d&apos;Imposition *</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Année Fiscale *</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-xs focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Header Info for DGI */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Assujetti :</span>
                  <span className="font-bold text-slate-900">SAHEL TECH INNOVATIONS SARL</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NIF (Niger) :</span>
                  <span className="font-mono font-bold text-slate-900">34567/R</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Centre des Impôts :</span>
                  <span className="font-semibold text-slate-800">Direction des Moyennes Entreprises (DME Niamey)</span>
                </div>
              </div>

              {/* Calculated Summary Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-[#101B35] text-white p-2.5 font-bold flex justify-between">
                  <span>Élément de Liquidation</span>
                  <span>Montant (FCFA)</span>
                </div>
                <div className="divide-y divide-slate-100 p-2 space-y-1.5">
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Chiffre d&apos;Affaires Brut Imposable (HT) :</span>
                    <span className="font-bold">{formatFCFA(vat.totalBaseHT)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>TVA Facturée au Taux Normal (19%) :</span>
                    <span className="font-extrabold text-[#101B35]">{formatFCFA(vat.totalTvaCollectee)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-800">
                    <span>TVA Déductible Récupérable (19%) :</span>
                    <span className="font-extrabold">- {formatFCFA(vat.totalTvaDeductible)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-300 font-black text-sm text-[#101B35]">
                    <span>SOLDE NET À DÉCAISSER :</span>
                    <span className="text-[#D4AF37]">{formatFCFA(vat.netTvaToPay)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observations / Référence bancaire de paiement</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Règlement par virement BOA Niger. Quittance DGI à générer."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimer le Récépissé</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeclarationModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] font-bold shadow-md disabled:opacity-40"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>{submitting ? "Télétransmission..." : "Valider & Télétransmettre"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
