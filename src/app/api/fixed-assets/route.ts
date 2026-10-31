import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const assets = await prisma.fixedAsset.findMany({
      where: { organizationId: session.organization.id },
      orderBy: { acquisitionDate: "desc" },
    });

    const totalAcquisitionCost = assets.reduce((sum, a) => sum + a.acquisitionCost, 0);
    const totalAccumulatedDepr = assets.reduce((sum, a) => sum + a.accumulatedDepr, 0);
    const totalNetBookValue = assets.reduce((sum, a) => sum + a.netBookValue, 0);

    return NextResponse.json({
      success: true,
      assets,
      summary: {
        totalAcquisitionCost,
        totalAccumulatedDepr,
        totalNetBookValue,
      },
    });
  } catch (error) {
    console.error("Fixed assets GET error:", error);
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
    const { name, acquisitionCost, acquisitionDate, usefulLifeYears, assetAccountCode } = body;

    const cost = parseFloat(acquisitionCost);
    if (!name || !cost || cost <= 0) {
      return NextResponse.json({ error: "Nom et coût d'acquisition requis." }, { status: 400 });
    }

    const years = parseInt(usefulLifeYears, 10) || 5;
    const acqDate = acquisitionDate ? new Date(acquisitionDate) : new Date();

    const count = await prisma.fixedAsset.count({
      where: { organizationId: session.organization.id },
    });
    const assetCode = `IMMO-${acqDate.getFullYear()}-${(count + 1).toString().padStart(3, "0")}`;

    const asset = await prisma.fixedAsset.create({
      data: {
        organizationId: session.organization.id,
        assetCode,
        name: name.trim(),
        acquisitionDate: acqDate,
        acquisitionCost: cost,
        usefulLifeYears: years,
        depreciationMethod: "LINEAR",
        accumulatedDepr: 0.0,
        netBookValue: cost,
        assetAccountCode: assetAccountCode || "245200",
        deprExpenseCode: "681100",
        accumDeprCode: "284500",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error("Fixed assets POST error:", error);
    return NextResponse.json({ error: "Erreur création immobilisation." }, { status: 500 });
  }
}
