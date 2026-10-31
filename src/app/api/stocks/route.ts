import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { organizationId: session.organization.id, isActive: true },
      include: {
        _count: { select: { stockMovements: true } },
      },
      orderBy: { name: "asc" },
    });

    const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
    const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

    return NextResponse.json({
      success: true,
      products,
      summary: {
        totalProducts: products.length,
        totalStockValue,
        lowStockCount,
      },
    });
  } catch (error) {
    console.error("Stocks GET error:", error);
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
    const { name, description, unit, unitPrice, costPrice, stockQuantity, minStockLevel, taxRate } = body;

    if (!name) {
      return NextResponse.json({ error: "Désignation de l'article requise." }, { status: 400 });
    }

    const count = await prisma.product.count({
      where: { organizationId: session.organization.id },
    });
    const code = `ART-${(count + 1).toString().padStart(4, "0")}`;

    const product = await prisma.product.create({
      data: {
        organizationId: session.organization.id,
        code,
        name: name.trim(),
        description: description || null,
        unit: unit || "unité",
        unitPrice: parseFloat(unitPrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        stockQuantity: parseFloat(stockQuantity) || 0,
        minStockLevel: parseFloat(minStockLevel) || 5,
        taxRate: parseFloat(taxRate) || 19.0,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Stock POST error:", error);
    return NextResponse.json({ error: "Erreur création article." }, { status: 500 });
  }
}
