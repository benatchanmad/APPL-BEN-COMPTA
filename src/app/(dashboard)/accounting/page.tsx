"use client";

import { useEffect, useState } from "react";
import { Calculator, BookOpen, Layers, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { formatFCFA } from "@/lib/utils";

export default function AccountingOverviewPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [resJ, resE] = await Promise.all([
          fetch("/api/accounting/journals"),
          fetch("/api/accounting/entries"),
        ]);
        if (resJ.ok) {
          const dataJ = await resJ.json();
          setJournals(dataJ.journals || []);
        }
        if (resE.ok) {
          const dataE = await resE.json();
          setEntries(dataE.entries || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalEntries = entries.length;
  const postedEntries = entries.filter((e) => e.status === "POSTED").length;

  // Calculate total debits across entries
  let totalDebit = 0;
  let totalCredit = 0;
  for (const entry of entries) {
    for (const line of entry.lines || []) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }
  }

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Norme SYSCOHADA Révisé
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Module Comptabilité Générale
          </h1>
          <p className="text-xs text-slate-500">
            Gestion de la partie double, journaux auxiliaires et conformité OHADA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/entries"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Saisie d&apos;Écriture</span>
          </Link>
          <Link
            href="/chart-of-accounts"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs font-semibold shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Plan Comptable</span>
          </Link>
        </div>
      </div>

      {/* Accounting Integrity Card (Partie Double) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBalanced ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {isBalanced ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101B35]">
                {isBalanced ? "Principe de la Partie Double : Équilibré" : "Alerte Déséquilibre Débit/Crédit"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBalanced
                  ? "Toutes les écritures comptables enregistrées respectent Total Débit = Total Crédit."
                  : "Attention : un déséquilibre a été détecté dans les écritures."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Débit Cumulé</span>
              <span className="text-base font-extrabold text-[#101B35]">{formatFCFA(totalDebit)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Crédit Cumulé</span>
              <span className="text-base font-extrabold text-[#101B35]">{formatFCFA(totalCredit)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Écritures Validées</span>
            <p className="text-xl font-bold text-[#101B35] mt-1">{postedEntries} / {totalEntries}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Journaux Auxiliaires Actifs</span>
            <p className="text-xl font-bold text-[#101B35] mt-1">{journals.length} journaux</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Statut de l&apos;Exercice</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">2026 : Ouvert</p>
          </div>
        </div>
      </div>

      {/* Sub-modules Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/chart-of-accounts"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#D4AF37] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF6E8] text-[#8C6D15] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#101B35] group-hover:text-[#8C6D15] transition-colors">
            Plan Comptable SYSCOHADA
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Classes 1 à 8, comptes généraux, comptes auxiliaires de tiers et lettrage.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-[#8C6D15] mt-3">
            <span>Consulter les comptes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/journals"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#101B35] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#101B35] group-hover:text-blue-700 transition-colors">
            Journaux Comptables
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Journal des Ventes (VT), Achats (AC), Banque BOA (BQ), Caisse (CA) et OD.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-700 mt-3">
            <span>Explorer les journaux</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/entries"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#101B35] group-hover:text-emerald-700 transition-colors">
            Saisie des Écritures
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Saisie assistée, équilibre débit/crédit en direct et contrepassation traçable.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mt-3">
            <span>Saisir une opération</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Recent Entries Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101B35]">
              Dernières Écritures Comptables
            </h3>
            <p className="text-xs text-slate-500">Mouvements validés au journal</p>
          </div>
          <Link
            href="/entries"
            className="text-xs font-bold text-[#D4AF37] hover:underline"
          >
            Voir le journal général
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Écriture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Journal</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4 text-right">Total Débit</th>
                <th className="py-3 px-4 text-right">Total Crédit</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.slice(0, 5).map((entry) => {
                const entryDebit = entry.lines?.reduce((s: number, l: any) => s + l.debit, 0) || 0;
                const entryCredit = entry.lines?.reduce((s: number, l: any) => s + l.credit, 0) || 0;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#101B35]">
                      {entry.entryNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(entry.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {entry.journal?.code} - {entry.journal?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatFCFA(entryDebit)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatFCFA(entryCredit)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
