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

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, type, isAuxiliary, isReconcilable } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID et nom requis." }, { status: 400 });
    }

    const existing = await prisma.accountingAccount.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    const updated = await prisma.accountingAccount.update({
      where: { id },
      data: {
        name: name.trim(),
        type: type || existing.type,
        isAuxiliary: isAuxiliary !== undefined ? Boolean(isAuxiliary) : existing.isAuxiliary,
        isReconcilable: isReconcilable !== undefined ? Boolean(isReconcilable) : existing.isReconcilable,
      },
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (error) {
    console.error("Account PUT error:", error);
    return NextResponse.json({ error: "Erreur modification compte." }, { status: 500 });
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

    const account = await prisma.accountingAccount.findFirst({
      where: { id, organizationId: session.organization.id },
      include: {
        _count: { select: { entryLines: true } },
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }

    if (account._count.entryLines > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer ce compte car des écritures comptables y sont rattachées." },
        { status: 400 }
      );
    }

    await prisma.accountingAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Compte supprimé avec succès." });
  } catch (error) {
    console.error("Account DELETE error:", error);
    return NextResponse.json({ error: "Erreur suppression compte." }, { status: 500 });
  }
}
