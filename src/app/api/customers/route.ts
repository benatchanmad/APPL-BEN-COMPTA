import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      where: { organizationId: session.organization.id },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Customers GET error:", error);
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
      return NextResponse.json({ error: "Le nom du client est obligatoire." }, { status: 400 });
    }

    const count = await prisma.customer.count({
      where: { organizationId: session.organization.id },
    });
    const code = `CLI-${(count + 1).toString().padStart(4, "0")}`;

    const customer = await prisma.customer.create({
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

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création du client." }, { status: 500 });
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

    const existing = await prisma.customer.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    const updated = await prisma.customer.update({
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

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error("Customer PUT error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification du client." }, { status: 500 });
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

    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: session.organization.id },
      include: {
        _count: { select: { invoices: true } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    if (customer._count.invoices > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer ce client car des factures lui sont rattachées." },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Client supprimé avec succès." });
  } catch (error) {
    console.error("Customer DELETE error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
