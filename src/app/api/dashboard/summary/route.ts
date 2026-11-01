import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const orgId = session.organization.id;

    // 1. Invoices stats
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: orgId, type: "INVOICE" },
      include: { customer: true },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const unpaidInvoicesCount = invoices.filter((inv) => inv.balanceDue > 0).length;

    // 2. Expenses stats
    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      include: { category: true, supplier: true },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalTTC, 0);

    // 3. Suppliers payables (Dettes)
    const suppliers = await prisma.supplier.findMany({
      where: { organizationId: orgId },
    });
    const totalPayables = suppliers.reduce((sum, s) => sum + s.balance, 0);

    // 4. Treasury balances (Banques + Caisses)
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { organizationId: orgId },
    });
    const cashAccounts = await prisma.cashAccount.findMany({
      where: { organizationId: orgId },
    });

    const totalBank = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
    const totalCash = cashAccounts.reduce((sum, c) => sum + c.currentBalance, 0);
    const totalTreasury = totalBank + totalCash;

    // 5. Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 6. Monthly Evolution (calcul dynamique basé sur les vraies factures et dépenses de l'entreprise)
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();
    const monthsToShow = monthNames.slice(0, Math.max(6, currentMonthIdx + 1));

    const monthlyData = monthsToShow.map((mLabel, mIdx) => {
      const monthInvoices = invoices.filter((inv) => {
        const d = new Date(inv.date);
        return d.getFullYear() === currentYear && d.getMonth() === mIdx;
      });
      const monthExpenses = expenses.filter((exp) => {
        const d = new Date(exp.date);
        return d.getFullYear() === currentYear && d.getMonth() === mIdx;
      });

      const rev = monthInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
      const dep = monthExpenses.reduce((sum, exp) => sum + exp.totalTTC, 0);

      return {
        month: mLabel,
        revenus: rev,
        depenses: dep,
        tresorerie: totalTreasury,
      };
    });

    // 7. Recent Transactions & Entries
    const recentTransactions = await prisma.bankTransaction.findMany({
      where: { organizationId: orgId },
      orderBy: { date: "desc" },
      take: 6,
    });

    // 8. Recent Activities (Audit Logs)
    const recentActivities = await prisma.auditLog.findMany({
      where: { organizationId: orgId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalTreasury,
        totalReceivables,
        totalPayables,
        totalInvoices: invoices.length,
        unpaidInvoicesCount,
      },
      monthlyData,
      recentTransactions,
      recentActivities,
      organization: session.organization,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ error: "Erreur résumé tableau de bord" }, { status: 500 });
  }
}

