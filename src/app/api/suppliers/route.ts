import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const suppliers = await prisma.supplier.findMany({
      where: { organizationId: session.organization.id },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    console.error("Suppliers GET error:", error);
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
    const { name, companyName, email, phone, address, city, country, nif, rccm, paymentTermsDays } = body;

    if (!name) {
      return NextResponse.json({ error: "Le nom du fournisseur est obligatoire." }, { status: 400 });
    }

    const count = await prisma.supplier.count({
      where: { organizationId: session.organization.id },
    });
    const code = `FOU-${(count + 1).toString().padStart(4, "0")}`;

    const supplier = await prisma.supplier.create({
      data: {
        organizationId: session.organization.id,
        code,
        name: name.trim(),
        companyName: companyName ? companyName.trim() : null,
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        city: city || "Niamey",
        country: country || "Niger",
        nif: nif ? nif.trim() : null,
        rccm: rccm ? rccm.trim() : null,
        paymentTermsDays: parseInt(paymentTermsDays, 10) || 30,
      },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    console.error("Supplier POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du fournisseur." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, companyName, email, phone, address, city, country, nif, rccm, paymentTermsDays } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID et nom obligatoires." }, { status: 400 });
    }

    const existing = await prisma.supplier.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fournisseur introuvable." }, { status: 404 });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: name.trim(),
        companyName: companyName ? companyName.trim() : null,
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        city: city || "Niamey",
        country: country || "Niger",
        nif: nif ? nif.trim() : null,
        rccm: rccm ? rccm.trim() : null,
        paymentTermsDays: parseInt(paymentTermsDays, 10) || 30,
      },
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error) {
    console.error("Supplier PUT error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification du fournisseur." }, { status: 500 });
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

    const supplier = await prisma.supplier.findFirst({
      where: { id, organizationId: session.organization.id },
      include: {
        _count: { select: { expenses: true } },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Fournisseur introuvable." }, { status: 404 });
    }

    if (supplier._count.expenses > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer ce fournisseur car des dépenses lui sont rattachées." },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Fournisseur supprimé avec succès." });
  } catch (error) {
    console.error("Supplier DELETE error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
