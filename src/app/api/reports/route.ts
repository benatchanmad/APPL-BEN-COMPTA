import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { computeTrialBalance } from "@/lib/syscohada";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "TRIAL_BALANCE"; // TRIAL_BALANCE, INCOME_STATEMENT, BALANCE_SHEET, GENERAL_LEDGER, VAT_REPORT

    const orgId = session.organization.id;

    // Fetch accounts and posted entry lines
    const accounts = await prisma.accountingAccount.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { code: "asc" },
    });

    const entryLines = await prisma.accountingEntryLine.findMany({
      where: {
        entry: {
          organizationId: orgId,
          status: "POSTED",
        },
      },
      include: {
        entry: {
          include: { journal: true },
        },
        account: true,
      },
    });

    // 1. Compute Trial Balance (Balance Générale)
    const trialBalance = computeTrialBalance(accounts, entryLines);

    // 2. Compute Income Statement (Compte de Résultat SYSCOHADA)
    // Products: Class 7
    // Charges: Class 6
    // HAO: Class 8
    let totalRevenue = 0;
    let totalExpenses = 0;
    let grossMargin = 0;
    let operatingProfit = 0;

    const revenueByAccount: any[] = [];
    const expensesByAccount: any[] = [];

    for (const row of trialBalance.rows) {
      if (row.classNumber === 7) {
        const netRev = row.creditBalance - row.debitBalance;
        if (netRev !== 0) {
          totalRevenue += netRev;
          revenueByAccount.push({ code: row.code, name: row.name, amount: netRev });
        }
      } else if (row.classNumber === 6) {
        const netExp = row.debitBalance - row.creditBalance;
        if (netExp !== 0) {
          totalExpenses += netExp;
          expensesByAccount.push({ code: row.code, name: row.name, amount: netExp });
        }
      }
    }

    const netProfit = totalRevenue - totalExpenses;

    // 3. Compute Balance Sheet (Bilan SYSCOHADA)
    // Actif: Class 2 (Immobilisations), Class 3 (Stocks), Class 4 Débiteur (Créances), Class 5 Débiteur (Trésorerie Actif)
    // Passif: Class 1 (Capitaux & Emprunts), Class 4 Créditeur (Dettes tiers), Class 5 Créditeur, + Résultat Net
    let totalActifImmobilise = 0;
    let totalActifCirculant = 0;
    let totalTresorerieActif = 0;

    let totalCapitauxPropres = 0;
    let totalDettesFinancieres = 0;
    let totalPassifCirculant = 0;
    let totalTresoreriePassif = 0;

    for (const row of trialBalance.rows) {
      if (row.classNumber === 2) {
        totalActifImmobilise += (row.debitBalance - row.creditBalance);
      } else if (row.classNumber === 3) {
        totalActifCirculant += (row.debitBalance - row.creditBalance);
      } else if (row.classNumber === 4) {
        if (row.debitBalance > 0) totalActifCirculant += row.debitBalance;
        if (row.creditBalance > 0) totalPassifCirculant += row.creditBalance;
      } else if (row.classNumber === 5) {
        if (row.debitBalance > 0) totalTresorerieActif += row.debitBalance;
        if (row.creditBalance > 0) totalTresoreriePassif += row.creditBalance;
      } else if (row.classNumber === 1) {
        if (row.code.startsWith("16")) {
          totalDettesFinancieres += (row.creditBalance - row.debitBalance);
        } else {
          totalCapitauxPropres += (row.creditBalance - row.debitBalance);
        }
      }
    }

    const totalActif = totalActifImmobilise + totalActifCirculant + totalTresorerieActif;
    const totalPassif = totalCapitauxPropres + totalDettesFinancieres + totalPassifCirculant + totalTresoreriePassif + netProfit;

    // 4. VAT Report (TVA collectée vs déductible)
    let tvaCollectee = 0;
    let tvaDeductible = 0;

    for (const row of trialBalance.rows) {
      if (row.code.startsWith("443")) {
        tvaCollectee += (row.creditBalance - row.debitBalance);
      } else if (row.code.startsWith("445")) {
        tvaDeductible += (row.debitBalance - row.creditBalance);
      }
    }

    const netVatToPay = Math.max(0, tvaCollectee - tvaDeductible);
    const vatCredit = Math.max(0, tvaDeductible - tvaCollectee);

    return NextResponse.json({
      success: true,
      trialBalance,
      incomeStatement: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        netProfit: Math.round(netProfit),
        revenueByAccount,
        expensesByAccount,
      },
      balanceSheet: {
        actif: {
          immobilise: Math.round(totalActifImmobilise),
          circulant: Math.round(totalActifCirculant),
          tresorerie: Math.round(totalTresorerieActif),
          total: Math.round(totalActif),
        },
        passif: {
          capitauxPropres: Math.round(totalCapitauxPropres),
          resultatNet: Math.round(netProfit),
          dettesFinancieres: Math.round(totalDettesFinancieres),
          passifCirculant: Math.round(totalPassifCirculant),
          tresorerie: Math.round(totalTresoreriePassif),
          total: Math.round(totalPassif),
        },
      },
      vatReport: {
        tvaCollectee: Math.round(tvaCollectee),
        tvaDeductible: Math.round(tvaDeductible),
        netVatToPay: Math.round(netVatToPay),
        vatCredit: Math.round(vatCredit),
      },
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Erreur serveur rapports" }, { status: 500 });
  }
}
