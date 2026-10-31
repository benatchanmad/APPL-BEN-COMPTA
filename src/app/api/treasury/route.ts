import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { organizationId: session.organization.id },
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { isDefault: "desc" },
    });

    const cashAccounts = await prisma.cashAccount.findMany({
      where: { organizationId: session.organization.id },
      orderBy: { isDefault: "desc" },
    });

    const recentTransactions = await prisma.bankTransaction.findMany({
      where: { organizationId: session.organization.id },
      include: {
        bankAccount: true,
        cashAccount: true,
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.currentBalance, 0);
    const totalCashBalance = cashAccounts.reduce((acc, c) => acc + c.currentBalance, 0);
    const totalLiquidAssets = totalBankBalance + totalCashBalance;

    return NextResponse.json({
      success: true,
      bankAccounts,
      cashAccounts,
      recentTransactions,
      summary: {
        totalBankBalance,
        totalCashBalance,
        totalLiquidAssets,
      },
    });
  } catch (error) {
    console.error("Treasury GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { type, name, bankName, accountNumber, iban, rib, location, initialBalance, glAccountCode } = body;

    const startingBalance = parseFloat(initialBalance) || 0;

    if (type === "BANK") {
      if (!bankName || !accountNumber) {
        return NextResponse.json({ error: "Nom de la banque et numéro de compte obligatoires." }, { status: 400 });
      }

      const bank = await prisma.bankAccount.create({
        data: {
          organizationId: session.organization.id,
          bankName: bankName.trim(),
          accountName: name || `${bankName} Compte Pro`,
          accountNumber: accountNumber.trim(),
          iban: iban ? iban.trim() : null,
          rib: rib ? rib.trim() : null,
          initialBalance: startingBalance,
          currentBalance: startingBalance,
          glAccountCode: glAccountCode || "521100",
        },
      });

      return NextResponse.json({ success: true, account: bank });
    } else {
      if (!name) {
        return NextResponse.json({ error: "Nom de la caisse obligatoire." }, { status: 400 });
      }

      const cash = await prisma.cashAccount.create({
        data: {
          organizationId: session.organization.id,
          name: name.trim(),
          location: location || "Siège Niamey",
          initialBalance: startingBalance,
          currentBalance: startingBalance,
          glAccountCode: glAccountCode || "571100",
        },
      });

      return NextResponse.json({ success: true, account: cash });
    }
  } catch (error) {
    console.error("Treasury POST error:", error);
    return NextResponse.json({ error: "Erreur création compte trésorerie." }, { status: 500 });
  }
}
