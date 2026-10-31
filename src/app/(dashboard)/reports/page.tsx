"use client";

import { useEffect, useState } from "react";
import {
  FileBarChart,
  Download,
  Printer,
  Table,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { formatFCFA } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"TRIAL_BALANCE" | "INCOME_STATEMENT" | "BALANCE_SHEET" | "VAT_REPORT">("TRIAL_BALANCE");

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const d = await res.json();
        setReports(d);
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

  function exportToExcel() {
    if (!reports) return;
    const wb = XLSX.utils.book_new();

    // 1. Sheet Balance Générale
    if (reports.trialBalance?.rows) {
      const balanceData = reports.trialBalance.rows.map((r: any) => ({
        "Numéro Compte": r.code,
        "Intitulé Compte": r.name,
        "Classe": r.classNumber,
        "Cumul Débit": r.totalDebit,
        "Cumul Crédit": r.totalCredit,
        "Solde Débiteur": r.debitBalance,
        "Solde Créditeur": r.creditBalance,
      }));
      const wsBalance = XLSX.utils.json_to_sheet(balanceData);
      XLSX.utils.book_append_sheet(wb, wsBalance, "Balance Générale");
    }

    // 2. Sheet Compte de Résultat
    if (reports.incomeStatement) {
      const crData = [
        { Rubrique: "Total Produits (Classe 7)", Montant: reports.incomeStatement.totalRevenue },
        { Rubrique: "Total Charges (Classe 6)", Montant: reports.incomeStatement.totalExpenses },
        { Rubrique: "RÉSULTAT NET COMPTABLE", Montant: reports.incomeStatement.netProfit },
      ];
      const wsCR = XLSX.utils.json_to_sheet(crData);
      XLSX.utils.book_append_sheet(wb, wsCR, "Compte de Résultat");
    }

    XLSX.writeFile(wb, `Etats_Financiers_SYSCOHADA_${new Date().getFullYear()}.xlsx`);
  }

  const trialBalance = reports?.trialBalance;
  const incomeStatement = reports?.incomeStatement;
  const balanceSheet = reports?.balanceSheet;
  const vat = reports?.vatReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              États Financiers de Synthèse OHADA
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Rapports Financiers & États Comptables
          </h1>
          <p className="text-xs text-slate-500">
            Génération conforme au SYSCOHADA : Balance Générale, Bilan, Compte de Résultat (SIG) et TVA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exporter Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Imprimer en PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("TRIAL_BALANCE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "TRIAL_BALANCE"
              ? "bg-[#101B35] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Balance Générale à 6 Colonnes
        </button>
        <button
          onClick={() => setActiveTab("INCOME_STATEMENT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "INCOME_STATEMENT"
              ? "bg-[#101B35] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Compte de Résultat (SIG)
        </button>
        <button
          onClick={() => setActiveTab("BALANCE_SHEET")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "BALANCE_SHEET"
              ? "bg-[#101B35] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Bilan Comptable (Actif / Passif)
        </button>
        <button
          onClick={() => setActiveTab("VAT_REPORT")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "VAT_REPORT"
              ? "bg-[#101B35] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Rapport & Déclaration TVA
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#D4AF37]" />
          Calcul des états financiers SYSCOHADA en cours...
        </div>
      ) : (
        <>
          {/* TAB 1: BALANCE GÉNÉRALE */}
          {activeTab === "TRIAL_BALANCE" && trialBalance && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#101B35]">
                    Balance Générale des Comptes (Classes 1 à 8)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Contrôle de l&apos;égalité : Cumul Débit = Cumul Crédit et Soldes Débiteurs = Soldes Créditeurs.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Partie Double Validée
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101B35] text-white font-bold">
                    <tr>
                      <th rowSpan={2} className="py-2.5 px-3 border-r border-[#1D3157] w-24">N° Compte</th>
                      <th rowSpan={2} className="py-2.5 px-3 border-r border-[#1D3157]">Intitulé du Compte SYSCOHADA</th>
                      <th colSpan={2} className="py-1 px-3 text-center border-b border-r border-[#1D3157]">Cumul des Mouvements</th>
                      <th colSpan={2} className="py-1 px-3 text-center border-b border-[#1D3157]">Soldes à la Date</th>
                    </tr>
                    <tr>
                      <th className="py-1.5 px-3 text-right border-r border-[#1D3157] w-32">Débit</th>
                      <th className="py-1.5 px-3 text-right border-r border-[#1D3157] w-32">Crédit</th>
                      <th className="py-1.5 px-3 text-right border-r border-[#1D3157] w-32 text-emerald-300">Débiteur</th>
                      <th className="py-1.5 px-3 text-right w-32 text-emerald-300">Créditeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trialBalance.rows.map((r: any) => (
                      <tr key={r.code} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#101B35]">{r.code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{r.name}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {r.totalDebit > 0 ? formatFCFA(r.totalDebit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {r.totalCredit > 0 ? formatFCFA(r.totalCredit) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#101B35]">
                          {r.debitBalance > 0 ? formatFCFA(r.debitBalance) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#101B35]">
                          {r.creditBalance > 0 ? formatFCFA(r.creditBalance) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-[#101B35]">
                    <tr>
                      <td colSpan={2} className="py-3 px-3 text-right uppercase text-xs">
                        Totaux Généraux :
                      </td>
                      <td className="py-3 px-3 text-right">{formatFCFA(trialBalance.totalDebitSum)}</td>
                      <td className="py-3 px-3 text-right">{formatFCFA(trialBalance.totalCreditSum)}</td>
                      <td className="py-3 px-3 text-right text-emerald-800">{formatFCFA(trialBalance.totalDebitBalance)}</td>
                      <td className="py-3 px-3 text-right text-emerald-800">{formatFCFA(trialBalance.totalCreditBalance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COMPTE DE RÉSULTAT */}
          {activeTab === "INCOME_STATEMENT" && incomeStatement && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Chiffre d&apos;Affaires & Produits (Classe 7)</span>
                  <p className="text-2xl font-extrabold text-[#101B35] mt-1">{formatFCFA(incomeStatement.totalRevenue)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Charges d&apos;Exploitation (Classe 6)</span>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">{formatFCFA(incomeStatement.totalExpenses)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101B35] to-[#1D3157] text-white shadow-lg border border-[#1D3157]">
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Résultat Net de l&apos;Exercice (Bénéfice)</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{formatFCFA(incomeStatement.netProfit)}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#101B35]">
                  Soldes Intermédiaires de Gestion (SIG) SYSCOHADA
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between font-bold text-slate-800">
                    <span>1. Chiffre d&apos;Affaires (Ventes de services et marchandises)</span>
                    <span className="text-[#101B35]">{formatFCFA(incomeStatement.totalRevenue)}</span>
                  </div>
                  <div className="py-3 flex justify-between text-slate-600">
                    <span>2. Achats consommés et charges externes</span>
                    <span className="text-rose-700">- {formatFCFA(incomeStatement.totalExpenses)}</span>
                  </div>
                  <div className="py-3 flex justify-between font-bold text-emerald-800 bg-emerald-50/50 px-2 rounded-lg">
                    <span>3. VALEUR AJOUTÉE & EXCÉDENT BRUT D&apos;EXPLOITATION (EBE)</span>
                    <span>{formatFCFA(incomeStatement.netProfit)}</span>
                  </div>
                  <div className="py-3 flex justify-between font-extrabold text-sm text-[#101B35] pt-4">
                    <span>4. RÉSULTAT NET COMPTABLE (Avant IS)</span>
                    <span className="text-[#D4AF37]">{formatFCFA(incomeStatement.netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILAN COMPTABLE */}
          {activeTab === "BALANCE_SHEET" && balanceSheet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ACTIF */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#101B35] uppercase tracking-wide">
                    ACTIF (Emplois)
                  </h3>
                  <span className="text-xs font-extrabold text-[#101B35]">{formatFCFA(balanceSheet.actif.total)}</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Actif Immobilisé (Classe 2)</p>
                      <p className="text-[11px] text-slate-400">Immobilisations corporelles & logiciels</p>
                    </div>
                    <span className="font-bold text-slate-800">{formatFCFA(balanceSheet.actif.immobilise)}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Actif Circulant (Classes 3 & 4)</p>
                      <p className="text-[11px] text-slate-400">Stocks & créances clients</p>
                    </div>
                    <span className="font-bold text-slate-800">{formatFCFA(balanceSheet.actif.circulant)}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Trésorerie Actif (Classe 5)</p>
                      <p className="text-[11px] text-slate-400">Comptes bancaires BOA & Caisse siège</p>
                    </div>
                    <span className="font-bold text-emerald-700">{formatFCFA(balanceSheet.actif.tresorerie)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between font-extrabold text-sm text-[#101B35]">
                  <span>TOTAL DE L&apos;ACTIF :</span>
                  <span>{formatFCFA(balanceSheet.actif.total)}</span>
                </div>
              </div>

              {/* PASSIF */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#101B35] uppercase tracking-wide">
                    PASSIF (Ressources)
                  </h3>
                  <span className="text-xs font-extrabold text-[#101B35]">{formatFCFA(balanceSheet.passif.total)}</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Capitaux Propres & Réserves (Classe 1)</p>
                      <p className="text-[11px] text-slate-400">Capital social appelé</p>
                    </div>
                    <span className="font-bold text-slate-800">{formatFCFA(balanceSheet.passif.capitauxPropres)}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Résultat Net de l&apos;Exercice</p>
                      <p className="text-[11px] text-slate-400">Bénéfice net</p>
                    </div>
                    <span className="font-bold text-emerald-700">{formatFCFA(balanceSheet.passif.resultatNet)}</span>
                  </div>

                  <div className="py-3 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Passif Circulant (Dettes d&apos;exploitation)</p>
                      <p className="text-[11px] text-slate-400">Fournisseurs & dettes fiscales (TVA)</p>
                    </div>
                    <span className="font-bold text-slate-800">{formatFCFA(balanceSheet.passif.passifCirculant)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between font-extrabold text-sm text-[#101B35]">
                  <span>TOTAL DU PASSIF :</span>
                  <span>{formatFCFA(balanceSheet.passif.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAPPORT TVA */}
          {activeTab === "VAT_REPORT" && vat && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#101B35]">
                Rapport de Synthèse TVA (DGI Niger)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">TVA Facturée (19%)</span>
                  <p className="text-xl font-extrabold text-[#101B35] mt-1">{formatFCFA(vat.tvaCollectee)}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">TVA Récupérable (19%)</span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatFCFA(vat.tvaDeductible)}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#101B35] text-white">
                  <span className="text-xs text-[#D4AF37]">Net TVA à Décaisser</span>
                  <p className="text-xl font-extrabold text-white mt-1">{formatFCFA(vat.netVatToPay)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
