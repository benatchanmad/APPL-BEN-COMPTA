"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  Layers,
  FileSpreadsheet,
  Users,
  Building2,
  TrendingUp,
  ShoppingBag,
  Receipt,
  CreditCard,
  Wallet,
  Landmark,
  Coins,
  Scale,
  PackageCheck,
  Boxes,
  FileBarChart,
  UserCheck,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user?: any;
  organization?: any;
}

export default function Sidebar({ user, organization }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuSections = [
    {
      title: "GÉNÉRAL",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "COMPTABILITÉ SYSCOHADA",
      items: [
        { label: "Comptabilité", href: "/accounting", icon: Calculator },
        { label: "Plan comptable", href: "/chart-of-accounts", icon: BookOpen },
        { label: "Journaux comptables", href: "/journals", icon: Layers },
        { label: "Écritures comptables", href: "/entries", icon: FileSpreadsheet },
      ],
    },
    {
      title: "TIERS & GESTION COMMERCIALE",
      items: [
        { label: "Clients", href: "/customers", icon: Users },
        { label: "Fournisseurs", href: "/suppliers", icon: Building2 },
        { label: "Ventes & Devis", href: "/sales", icon: TrendingUp },
        { label: "Achats & Commandes", href: "/purchases", icon: ShoppingBag },
        { label: "Facturation", href: "/invoices", icon: Receipt },
        { label: "Dépenses", href: "/expenses", icon: CreditCard },
      ],
    },
    {
      title: "TRÉSORERIE & FISCALITÉ",
      items: [
        { label: "Trésorerie", href: "/treasury", icon: Wallet },
        { label: "Banque", href: "/banking", icon: Landmark },
        { label: "Caisse", href: "/cash", icon: Coins },
        { label: "TVA et fiscalité", href: "/taxation", icon: Scale },
      ],
    },
    {
      title: "PATRIMOINE & ANALYSES",
      items: [
        { label: "Immobilisations", href: "/fixed-assets", icon: PackageCheck },
        { label: "Stocks", href: "/stocks", icon: Boxes },
        { label: "Rapports financiers", href: "/reports", icon: FileBarChart },
      ],
    },
    {
      title: "ADMINISTRATION SAAS",
      items: [
        { label: "Utilisateurs", href: "/users", icon: UserCheck },
        { label: "Paramètres", href: "/settings", icon: Settings },
      ],
    },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  }

  return (
    <aside className="w-64 bg-[#101B35] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-[#1D3157] z-30 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[#1D3157] bg-gradient-to-r from-[#0C152B] to-[#101B35]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F3DE97] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]">
            <ShieldCheck className="w-6 h-6 text-[#101B35]" />
          </div>
          <div>
            <div className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              <span>BenCompta</span>
              <span className="text-[#D4AF37] text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 uppercase font-extrabold tracking-wider">PRO</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">
              SYSCOHADA • NIGER
            </div>
          </div>
        </div>
      </div>

      {/* Organization Pill */}
      <div className="px-4 py-3 bg-[#132242] border-b border-[#1D3157]/80">
        <div className="flex items-center justify-between text-xs">
          <div className="truncate font-semibold text-slate-200">
            {organization?.name || "SAHEL TECH INNOVATIONS"}
          </div>
          <span className="text-[10px] bg-[#D4AF37]/20 text-[#E5C76B] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/40 uppercase">
            XOF
          </span>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-2">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-[#1D3157] to-[#172745] text-white shadow-md border-l-4 border-[#D4AF37] font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-[#1D3157]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-[#D4AF37]" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#1D3157] bg-[#0C152B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1D3157] text-[#D4AF37] flex items-center justify-center font-bold text-xs border border-[#D4AF37]/30">
              {user?.firstName?.[0] || "I"}{user?.lastName?.[0] || "M"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-[#D4AF37] truncate font-medium">
                {user?.role || "ADMINISTRATEUR"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Se déconnecter"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

