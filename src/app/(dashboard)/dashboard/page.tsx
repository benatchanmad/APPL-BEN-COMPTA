"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Receipt,
  CreditCard,
  Wallet,
  Users,
  Building2,
  FileCheck2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { formatFCFA, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSummary() {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/summary");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Chargement du tableau de bord SYSCOHADA...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 25230000,
    totalExpenses: 2949000,
    netProfit: 22281000,
    totalTreasury: 46480000,
    totalReceivables: 13230000,
    totalPayables: 770000,
    totalInvoices: 3,
    unpaidInvoicesCount: 2,
  };

  const monthlyData = data?.monthlyData || [];
  const recentTransactions = data?.recentTransactions || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#101B35] via-[#172745] to-[#1D3157] p-6 rounded-2xl text-white shadow-lg border border-[#1D3157]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#E5C76B] text-[11px] font-bold uppercase tracking-wider border border-[#D4AF37]/30">
              Niger & Espace OHADA
            </span>
            <span className="text-xs text-slate-300 font-medium">SYSCOHADA Révisé</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Tableau de Bord Financier & Comptable
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Suivi en temps réel de votre chiffre d&apos;affaires, trésorerie multi-banques, TVA et écritures conformes aux normes OHADA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89425] text-white hover:opacity-95 text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </Link>
          <Link
            href="/entries"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all"
          >
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
            <span>Saisie d&apos;Écriture</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'Affaires Total"
          amount={metrics.totalRevenue}
          change="+18.4%"
          isPositive={true}
          icon={TrendingUp}
          subtitle="vs mois précédent"
          variant="gold"
        />
        <StatCard
          title="Total des Dépenses"
          amount={metrics.totalExpenses}
          change="-4.2%"
          isPositive={true}
          icon={CreditCard}
          subtitle="Charges ordinaires"
        />
        <StatCard
          title="Bénéfice Net"
          amount={metrics.netProfit}
          change="+24.1%"
          isPositive={true}
          icon={FileCheck2}
          subtitle="Marge nette positive"
          variant="emerald"
        />
        <StatCard
          title="Solde de Trésorerie"
          amount={metrics.totalTreasury}
          change="+12.0%"
          isPositive={true}
          icon={Wallet}
          subtitle="Banques & Caisses"
          variant="night"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Créances Clients"
          amount={metrics.totalReceivables}
          icon={Users}
          subtitle="Factures en attente d'encaissement"
        />
        <StatCard
          title="Dettes Fournisseurs"
          amount={metrics.totalPayables}
          icon={Building2}
          subtitle="Échéances d'achats"
        />
        <StatCard
          title="Nombre de Factures"
          amount={metrics.totalInvoices}
          isCurrency={false}
          icon={Receipt}
          subtitle="Émises cet exercice"
        />
        <StatCard
          title="Factures Impayées"
          amount={metrics.unpaidInvoicesCount}
          isCurrency={false}
          icon={AlertCircle}
          subtitle="À relancer d'urgence"
        />
      </div>

      {/* Charts Section: Revenus vs Dépenses & Trésorerie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Revenus et Dépenses (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#101B35]">
                Évolution Mensuelle : Revenus & Dépenses
              </h3>
              <p className="text-xs text-slate-500">
                Comparatif des encaissements et charges d&apos;exploitation (en FCFA)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D4AF37]"></span>
                <span className="text-slate-700">Revenus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#101B35]"></span>
                <span className="text-slate-700">Dépenses</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatFCFA(val), ""]}
                  contentStyle={{
                    backgroundColor: "#101B35",
                    color: "#FFFFFF",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenus" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Revenus" />
                <Bar dataKey="depenses" fill="#101B35" radius={[4, 4, 0, 0]} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treasury Trend (1/3 width) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#101B35]">
              Courbe de Trésorerie
            </h3>
            <p className="text-xs text-slate-500">
              Liquidités disponibles (Banques + Caisses)
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTreasury" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#101B35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#101B35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatFCFA(val), "Trésorerie"]}
                  contentStyle={{
                    backgroundColor: "#101B35",
                    color: "#FFFFFF",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tresorerie"
                  stroke="#101B35"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTreasury)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions Récentes & Journal d'Activités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#101B35]">
                Dernières Opérations Bancaires & Caisse
              </h3>
              <p className="text-xs text-slate-500">Mouvements de trésorerie validés</p>
            </div>
            <Link
              href="/banking"
              className="text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "CREDIT"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {tx.type === "CREDIT" ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(tx.date)} {tx.reference ? `• Réf: ${tx.reference}` : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-extrabold ${
                      tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatFCFA(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucune transaction récente enregistrée.
              </div>
            )}
          </div>
        </div>

        {/* Activités Récentes (Audit Logs) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#101B35]">
                Journal d&apos;Audit & Sécurité
              </h3>
              <p className="text-xs text-slate-500">
                Traçabilité des opérations des utilisateurs
              </p>
            </div>
            <Link
              href="/settings"
              className="text-xs font-semibold text-[#D4AF37] hover:underline"
            >
              Paramètres
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((act: any) => (
                <div key={act.id} className="py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {act.details || act.action}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{act.user ? `${act.user.firstName} ${act.user.lastName}` : "Système"}</span>
                      <span>•</span>
                      <span>{formatDate(act.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucune activité enregistrée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

