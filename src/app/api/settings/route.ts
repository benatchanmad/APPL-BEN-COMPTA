import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.organization.id },
      include: {
        fiscalYears: { orderBy: { startDate: "desc" } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ success: true, organization });
  } catch (error) {
    console.error("Settings GET error:", error);
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
    const { name, legalName, nif, rccm, address, city, country, phone, email, website, taxSystem, defaultVatRate } = body;

    const updated = await prisma.organization.update({
      where: { id: session.organization.id },
      data: {
        name: name ? name.trim() : undefined,
        legalName: legalName ? legalName.trim() : undefined,
        nif: nif ? nif.trim() : undefined,
        rccm: rccm ? rccm.trim() : undefined,
        address: address ? address.trim() : undefined,
        city: city || undefined,
        country: country || undefined,
        phone: phone ? phone.trim() : undefined,
        email: email ? email.trim() : undefined,
        website: website ? website.trim() : undefined,
        taxSystem: taxSystem || undefined,
        defaultVatRate: defaultVatRate !== undefined ? parseFloat(defaultVatRate) : undefined,
      },
    });

    return NextResponse.json({ success: true, organization: updated });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Erreur mise à jour paramètres." }, { status: 500 });
  }
}
