"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Plus, CreditCard, Building2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function PurchasesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [resE, resS] = await Promise.all([
          fetch("/api/expenses"),
          fetch("/api/suppliers"),
        ]);
        if (resE.ok) {
          const d = await resE.json();
          setExpenses(d.expenses || []);
        }
        if (resS.ok) {
          const d = await resS.json();
          setSuppliers(d.suppliers || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAchats = expenses.reduce((sum, e) => sum + e.totalTTC, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Gestion Commerciale Achats
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Achats & Factures Fournisseurs
          </h1>
          <p className="text-xs text-slate-500">
            Enregistrement des achats de matières, marchandises, prestations et suivi des paiements.
          </p>
        </div>

        <Link
          href="/expenses"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nouvel Achat / Dépense</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Achats & Dépenses TTC</span>
          <p className="text-xl font-extrabold text-[#101B35] mt-1">{formatFCFA(totalAchats)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Fournisseurs Actifs</span>
          <p className="text-xl font-extrabold text-blue-900 mt-1">{suppliers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#101B35]">
            Derniers Achats & Factures Fournisseurs
          </h3>
          <Link href="/expenses" className="text-xs font-bold text-[#D4AF37] hover:underline">
            Voir le détail des dépenses
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Numéro</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Fournisseur</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Montant TTC</th>
                <th className="py-2.5 px-3 text-center">Règlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    Chargement...
                  </td>
                </tr>
              ) : expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#101B35]">{exp.expenseNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{exp.title}</td>
                  <td className="py-2.5 px-3 text-slate-600">{exp.supplier?.name || "Divers"}</td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDate(exp.date)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatFCFA(exp.totalTTC)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {exp.paymentMethod}
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

