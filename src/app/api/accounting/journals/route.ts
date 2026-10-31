import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const journals = await prisma.accountingJournal.findMany({
      where: { organizationId: session.organization.id },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ success: true, journals });
  } catch (error) {
    console.error("Journals GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
