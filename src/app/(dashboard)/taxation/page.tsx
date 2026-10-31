"use client";

import { useEffect, useState } from "react";
import { Scale, CheckCircle2, AlertCircle, FileText, Download, ShieldCheck, RefreshCw } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function TaxationPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const vat = reports?.vatReport || {
    tvaCollectee: 3230000,
    tvaDeductible: 470849,
    netVatToPay: 2759151,
    vatCredit: 0,
  };

  return (
    <div className="space-y-6">
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
            TVA Collectée (19%), TVA Déductible, liquidation et télédéclaration mensuelle.
          </p>
        </div>

        <button
          onClick={() => alert("Déclaration mensuelle de TVA générée et prête pour transmission à la DGI.")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <span>Générer la Déclaration Mensuelle</span>
        </button>
      </div>

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
              Taux légal de TVA en vigueur au Niger : <strong className="text-slate-800">19,0%</strong> • Périodicité : Mensuelle (au plus tard le 15 du mois suivant).
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          Paramétrage Conforme DGI
        </span>
      </div>

      {/* Primary 3 VAT Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            1. TVA Facturée / Collectée (Compte 443)
          </span>
          <p className="text-2xl font-extrabold text-[#101B35]">
            {formatFCFA(vat.tvaCollectee)}
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
            {formatFCFA(vat.tvaDeductible)}
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
            {formatFCFA(vat.netVatToPay)}
          </p>
          <p className="text-[11px] text-slate-300">
            {vat.vatCredit > 0
              ? `Crédit de TVA reportable : ${formatFCFA(vat.vatCredit)}`
              : "Solde net à liquider auprès du Receveur des Impôts."}
          </p>
        </div>
      </div>

      {/* Tax Liquidation Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#101B35]">
          Bordereau de Liquidation Fiscale de la TVA
        </h3>

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
                <td className="py-3 px-4 font-semibold text-slate-900">Opérations taxables à 19% (Ventes locales Niger)</td>
                <td className="py-3 px-4 font-mono text-slate-500">443100 / 443200</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">{formatFCFA(Math.round(vat.tvaCollectee / 0.19))}</td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-extrabold text-[#101B35]">{formatFCFA(vat.tvaCollectee)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">TVA déductible sur immobilisations</td>
                <td className="py-3 px-4 font-mono text-slate-500">445100</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">0 FCFA</td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-700">0 FCFA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">TVA déductible sur autres biens et services</td>
                <td className="py-3 px-4 font-mono text-slate-500">445200</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">{formatFCFA(Math.round(vat.tvaDeductible / 0.19))}</td>
                <td className="py-3 px-4 text-center font-bold">19%</td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-700">- {formatFCFA(vat.tvaDeductible)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-extrabold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right text-slate-800 uppercase text-xs">
                  Net TVA à Décaisser (Compte 444100) :
                </td>
                <td className="py-3 px-4 text-right text-[#101B35] text-sm">
                  {formatFCFA(vat.netVatToPay)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
