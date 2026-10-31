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
