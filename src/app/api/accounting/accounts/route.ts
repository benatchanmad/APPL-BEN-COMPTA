import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classParam = searchParams.get("class");
    const search = searchParams.get("search");

    const where: any = {
      organizationId: session.organization.id,
      isActive: true,
    };

    if (classParam) {
      where.accountClass = parseInt(classParam, 10);
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const accounts = await prisma.accountingAccount.findMany({
      where,
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Accounts GET error:", error);
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
    const { code, name, accountClass, type, isAuxiliary, isReconcilable } = body;

    if (!code || !name || !accountClass || !type) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const existing = await prisma.accountingAccount.findUnique({
      where: {
        organizationId_code: {
          organizationId: session.organization.id,
          code: code.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Le compte ${code} existe déjà dans ce plan comptable.` },
        { status: 409 }
      );
    }

    const account = await prisma.accountingAccount.create({
      data: {
        organizationId: session.organization.id,
        code: code.trim(),
        name: name.trim(),
        accountClass: parseInt(accountClass, 10),
        type,
        isAuxiliary: Boolean(isAuxiliary),
        isReconcilable: Boolean(isReconcilable),
      },
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Account POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
