"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  isCurrency?: boolean;
  variant?: "default" | "gold" | "night" | "emerald";
}

export default function StatCard({
  title,
  amount,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  isCurrency = true,
  variant = "default",
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "gold":
        return {
          cardBg: "bg-gradient-to-br from-[#FCF9EE] to-white border-[#D4AF37]/40 shadow-sm",
          iconBg: "bg-[#D4AF37]/15 text-[#8A6C16] border border-[#D4AF37]/30",
          titleColor: "text-[#8A6C16]",
          amountColor: "text-[#101B35]",
        };
      case "night":
        return {
          cardBg: "bg-gradient-to-br from-[#101B35] to-[#1D3157] text-white border-[#1D3157] shadow-md",
          iconBg: "bg-white/10 text-[#D4AF37] border border-white/10",
          titleColor: "text-slate-300",
          amountColor: "text-white",
        };
      case "emerald":
        return {
          cardBg: "bg-gradient-to-br from-emerald-50/70 to-white border-emerald-200/80 shadow-sm",
          iconBg: "bg-emerald-100 text-emerald-700 border border-emerald-300",
          titleColor: "text-emerald-800",
          amountColor: "text-emerald-950",
        };
      default:
        return {
          cardBg: "bg-white border-slate-200 shadow-sm",
          iconBg: "bg-slate-100 text-[#101B35] border border-slate-200",
          titleColor: "text-slate-600",
          amountColor: "text-[#101B35]",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${styles.cardBg}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold tracking-tight uppercase ${styles.titleColor}`}>
          {title}
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-xl font-extrabold tracking-tight ${styles.amountColor}`}>
          {isCurrency ? formatFCFA(amount) : amount.toLocaleString()}
        </div>

        {(change || subtitle) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {change && (
              <span
                className={`flex items-center gap-0.5 font-semibold ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {change}
              </span>
            )}
            {subtitle && (
              <span className={variant === "night" ? "text-slate-400" : "text-slate-500"}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
