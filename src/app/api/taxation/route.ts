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
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || `${new Date().getMonth() + 1}`, 10);
    const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`, 10);

    // Fetch tax rates
    const taxRates = await prisma.taxRate.findMany({
      where: { organizationId: orgId },
    });

    // Fetch past submitted declarations
    const declarations = await prisma.taxDeclaration.findMany({
      where: { organizationId: orgId },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });

    // Fetch all invoices for VAT calculation
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: orgId, type: "INVOICE" },
    });

    const totalBaseHT = invoices.reduce((sum, inv) => sum + inv.subtotalHT, 0);
    const totalTvaCollectee = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    // Fetch all expenses for deductible VAT
    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
    });

    const totalTvaDeductible = expenses.reduce((sum, exp) => sum + exp.taxAmount, 0);
    const netTvaToPay = Math.max(0, totalTvaCollectee - totalTvaDeductible);
    const vatCredit = Math.max(0, totalTvaDeductible - totalTvaCollectee);

    return NextResponse.json({
      success: true,
      period: { month, year },
      taxRates,
      declarations,
      currentCalculation: {
        totalBaseHT: Math.round(totalBaseHT),
        totalTvaCollectee: Math.round(totalTvaCollectee),
        totalTvaDeductible: Math.round(totalTvaDeductible),
        netTvaToPay: Math.round(netTvaToPay),
        vatCredit: Math.round(vatCredit),
      },
    });
  } catch (error) {
    console.error("Taxation GET error:", error);
    return NextResponse.json({ error: "Erreur serveur fiscalité" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { periodMonth, periodYear, totalBaseHT, totalTvaCollectee, totalTvaDeductible, netTvaToPay, notes } = body;

    const m = parseInt(periodMonth, 10);
    const y = parseInt(periodYear, 10);

    if (!m || !y) {
      return NextResponse.json({ error: "Période (mois et année) invalide." }, { status: 400 });
    }

    const declaration = await prisma.taxDeclaration.upsert({
      where: {
        organizationId_periodYear_periodMonth: {
          organizationId: session.organization.id,
          periodYear: y,
          periodMonth: m,
        },
      },
      update: {
        status: "SUBMITTED",
        totalBaseHT: parseFloat(totalBaseHT) || 0,
        totalTvaCollectee: parseFloat(totalTvaCollectee) || 0,
        totalTvaDeductible: parseFloat(totalTvaDeductible) || 0,
        netTvaToPay: parseFloat(netTvaToPay) || 0,
        notes: notes || "Déclaration mensuelle de TVA télétransmise avec succès à la DGI Niger.",
        submittedAt: new Date(),
      },
      create: {
        organizationId: session.organization.id,
        periodMonth: m,
        periodYear: y,
        status: "SUBMITTED",
        totalBaseHT: parseFloat(totalBaseHT) || 0,
        totalTvaCollectee: parseFloat(totalTvaCollectee) || 0,
        totalTvaDeductible: parseFloat(totalTvaDeductible) || 0,
        netTvaToPay: parseFloat(netTvaToPay) || 0,
        notes: notes || "Déclaration mensuelle de TVA télétransmise avec succès à la DGI Niger.",
        submittedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: session.organization.id,
        userId: session.user.id,
        action: "SUBMIT_TAX_DECLARATION",
        entity: "TAX_DECLARATION",
        entityId: declaration.id,
        details: `Télédéclaration TVA ${m.toString().padStart(2, "0")}/${y} déposée (Net à payer : ${declaration.netTvaToPay} FCFA)`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `La déclaration de TVA pour la période ${m.toString().padStart(2, "0")}/${y} a été validée et enregistrée avec succès.`,
      declaration,
    });
  } catch (error) {
    console.error("Taxation POST error:", error);
    return NextResponse.json({ error: "Erreur enregistrement déclaration." }, { status: 500 });
  }
}

