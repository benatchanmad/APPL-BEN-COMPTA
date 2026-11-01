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

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, unit, unitPrice, costPrice, stockQuantity, minStockLevel, taxRate } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID et nom requis." }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description !== undefined ? description : existing.description,
        unit: unit || existing.unit,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : existing.costPrice,
        stockQuantity: stockQuantity !== undefined ? parseFloat(stockQuantity) : existing.stockQuantity,
        minStockLevel: minStockLevel !== undefined ? parseFloat(minStockLevel) : existing.minStockLevel,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : existing.taxRate,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Stock PUT error:", error);
    return NextResponse.json({ error: "Erreur mise à jour article." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Article supprimé avec succès." });
  } catch (error) {
    console.error("Stock DELETE error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de l'article." }, { status: 500 });
  }
}
