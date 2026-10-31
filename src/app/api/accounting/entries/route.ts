import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { validateDoubleEntry } from "@/lib/syscohada";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const journalId = searchParams.get("journalId");
    const status = searchParams.get("status");

    const where: any = {
      organizationId: session.organization.id,
    };

    if (journalId) where.journalId = journalId;
    if (status) where.status = status;

    const entries = await prisma.accountingEntry.findMany({
      where,
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("Entries GET error:", error);
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
    const { journalId, date, description, reference, lines } = body;

    if (!journalId || !description || !lines || lines.length < 2) {
      return NextResponse.json(
        { error: "Veuillez fournir un journal, un libellé et au minimum 2 lignes d'écriture." },
        { status: 400 }
      );
    }

    // Strict Double Entry Rule validation: Total Débit === Total Crédit
    const validation = validateDoubleEntry(lines);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errorMessage },
        { status: 422 }
      );
    }

    // Find active fiscal year
    const entryDate = date ? new Date(date) : new Date();
    const fiscalYear = await prisma.fiscalYear.findFirst({
      where: {
        organizationId: session.organization.id,
        startDate: { lte: entryDate },
        endDate: { gte: entryDate },
        isClosed: false,
      },
    });

    if (!fiscalYear) {
      return NextResponse.json(
        { error: "Aucun exercice comptable ouvert trouvé pour cette date." },
        { status: 400 }
      );
    }

    // Get journal to generate entry number
    const journal = await prisma.accountingJournal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal introuvable." }, { status: 404 });
    }

    const count = await prisma.accountingEntry.count({
      where: {
        organizationId: session.organization.id,
        journalId: journal.id,
      },
    });

    const entryNumber = `${journal.code}-${entryDate.getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    // Create entry with lines inside transaction
    const entry = await prisma.accountingEntry.create({
      data: {
        organizationId: session.organization.id,
        fiscalYearId: fiscalYear.id,
        journalId: journal.id,
        entryNumber,
        date: entryDate,
        description,
        reference: reference || null,
        sourceType: "MANUAL",
        status: "POSTED",
        createdBy: session.user.id,
        lines: {
          create: lines.map((l: any) => ({
            accountId: l.accountId,
            description: l.description || description,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
          })),
        },
      },
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: session.organization.id,
        userId: session.user.id,
        action: "POST_ENTRY",
        entity: "ACCOUNTING_ENTRY",
        entityId: entry.id,
        details: `Saisie de l'écriture ${entryNumber} : ${description} (Total: ${validation.totalDebit} FCFA)`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Entry POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'écriture." }, { status: 500 });
  }
}
