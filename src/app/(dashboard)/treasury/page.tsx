"use client";

import { useEffect, useState } from "react";
import { Wallet, Landmark, Coins, ArrowRightLeft, Plus, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function TreasuryPage() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/treasury");
      if (res.ok) {
        const d = await res.json();
        setBankAccounts(d.bankAccounts || []);
        setCashAccounts(d.cashAccounts || []);
        setTransactions(d.recentTransactions || []);
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

  const totalBank = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
  const totalCash = cashAccounts.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalLiquid = totalBank + totalCash;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8C6D15] border border-[#D4AF37]/30 uppercase">
              Trésorerie • Classe 5
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#101B35] tracking-tight mt-1">
            Gestion Globale de la Trésorerie
          </h1>
          <p className="text-xs text-slate-500">
            Disponibilités liquides, suivi multi-comptes bancaires et régies de caisses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/banking"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            <Landmark className="w-4 h-4 text-[#D4AF37]" />
            <span>Comptes Bancaires</span>
          </Link>
          <Link
            href="/cash"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101B35] text-white hover:bg-[#1D3157] text-xs font-bold shadow-sm transition-all"
          >
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span>Caisses Espèces</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101B35] to-[#1D3157] text-white shadow-lg border border-[#1D3157]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Total Disponibilités Liquides
          </span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatFCFA(totalLiquid)}
          </p>
          <p className="text-xs text-[#D4AF37] mt-2 font-medium">
            Banques + Caisses disponibles immédiatement
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
            <Landmark className="w-4 h-4" />
            <span>Solde Total Bancaire</span>
          </div>
          <p className="text-2xl font-extrabold text-[#101B35] mt-1">
            {formatFCFA(totalBank)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Réparti sur {bankAccounts.length} comptes bancaires
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase">
            <Coins className="w-4 h-4" />
            <span>Solde Total Caisse</span>
          </div>
          <p className="text-2xl font-extrabold text-[#101B35] mt-1">
            {formatFCFA(totalCash)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Réparti sur {cashAccounts.length} caisses physiques
          </p>
        </div>
      </div>

      {/* Accounts Split Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Accounts List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#101B35] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Comptes Bancaires</span>
            </h3>
            <Link href="/banking" className="text-xs font-bold text-[#D4AF37] hover:underline">
              Gérer
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {bankAccounts.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{b.bankName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{b.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-[#101B35]">{formatFCFA(b.currentBalance)}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Compte 521</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Accounts List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#101B35] flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Caisses Physiques</span>
            </h3>
            <Link href="/cash" className="text-xs font-bold text-[#D4AF37] hover:underline">
              Gérer
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {cashAccounts.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-[#101B35]">{formatFCFA(c.currentBalance)}</p>
                  <span className="text-[10px] text-amber-700 font-semibold">Compte 571</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#101B35]">
          Historique des Mouvements de Trésorerie
        </h3>
        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    tx.type === "CREDIT"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {tx.type === "CREDIT" ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{tx.description}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(tx.date)} {tx.reference ? `• Réf: ${tx.reference}` : ""}
                  </p>
                </div>
              </div>
              <div
                className={`font-bold ${
                  tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {tx.type === "CREDIT" ? "+" : "-"}
                {formatFCFA(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

