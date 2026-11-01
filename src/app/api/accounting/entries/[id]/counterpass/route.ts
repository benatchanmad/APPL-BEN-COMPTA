import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { reason } = body;

    const originalEntry = await prisma.accountingEntry.findUnique({
      where: { id },
      include: {
        journal: true,
        lines: true,
      },
    });

    if (!originalEntry || originalEntry.organizationId !== session.organization.id) {
      return NextResponse.json({ error: "Écriture introuvable" }, { status: 404 });
    }

    if (originalEntry.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cette écriture a déjà été contrepassée/annulée." },
        { status: 400 }
      );
    }

    // Generate counter-passation entry number
    const count = await prisma.accountingEntry.count({
      where: {
        organizationId: session.organization.id,
        journalId: originalEntry.journalId,
      },
    });

    const now = new Date();
    const entryNumber = `${originalEntry.journal.code}-${now.getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    // Create the reversing entry: swap debits and credits
    const reversingEntry = await prisma.$transaction(async (tx) => {
      // Mark original entry as CANCELLED (not deleted!)
      await tx.accountingEntry.update({
        where: { id: originalEntry.id },
        data: { status: "CANCELLED" },
      });

      // Create reversing entry (contrepassation)
      const counterEntry = await tx.accountingEntry.create({
        data: {
          organizationId: session.organization.id,
          fiscalYearId: originalEntry.fiscalYearId,
          journalId: originalEntry.journalId,
          entryNumber,
          date: now,
          description: `CONTREPASSATION de ${originalEntry.entryNumber} - ${reason || "Correction comptable"}`,
          reference: originalEntry.entryNumber,
          sourceType: "MANUAL",
          status: "POSTED",
          createdBy: session.user.id,
          lines: {
            create: originalEntry.lines.map((l) => ({
              accountId: l.accountId,
              description: `Annulation ${l.description}`,
              debit: l.credit, // SWAP DEBIT AND CREDIT
              credit: l.debit, // SWAP DEBIT AND CREDIT
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          organizationId: session.organization.id,
          userId: session.user.id,
          action: "COUNTERPASS_ENTRY",
          entity: "ACCOUNTING_ENTRY",
          entityId: counterEntry.id,
          details: `Contrepassation de l'écriture ${originalEntry.entryNumber} générant ${counterEntry.entryNumber}`,
        },
      });

      return counterEntry;
    });

    return NextResponse.json({
      success: true,
      message: `L'écriture a été contrepassée avec succès (Nouvelle écriture : ${reversingEntry.entryNumber})`,
      counterEntry: reversingEntry,
    });
  } catch (error) {
    console.error("Counterpass error:", error);
    return NextResponse.json({ error: "Erreur lors de la contrepassation." }, { status: 500 });
  }
}

