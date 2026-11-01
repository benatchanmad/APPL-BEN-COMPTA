"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Receipt, FileText, Plus, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const d = await res.json();
          setInvoices(d.invoices || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCA = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Gestion Commerciale Ventes
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Cycle des Ventes & Devis
          </h1>
          <p className="text-xs text-slate-500">
            Devis, factures proforma, factures définitives et suivi des encaissements.
          </p>
        </div>

        <Link
          href="/invoices"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Émettre une Facture</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Chiffre d&apos;Affaires Ventes TTC</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{formatFCFA(totalCA)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Encaissé</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatFCFA(totalPaid)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Créances à Recouvrer</span>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{formatFCFA(totalPending)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#101B35]">
            Historique des Opérations de Ventes
          </h3>
          <Link href="/invoices" className="text-xs font-bold text-[#D4AF37] hover:underline">
            Voir le module facturation
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Numéro</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Montant TTC</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement...
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#101B35]">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{inv.customer?.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(inv.date)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#101B35]">{formatFCFA(inv.totalTTC)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

