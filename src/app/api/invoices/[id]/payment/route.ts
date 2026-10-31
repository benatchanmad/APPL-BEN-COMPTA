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
    const { amount, paymentMethod, bankAccountId, cashAccountId, reference, notes, date } = body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: "Le montant du paiement doit être supérieur à zéro." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!invoice || invoice.organizationId !== session.organization.id) {
      return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
    }

    if (paymentAmount > invoice.balanceDue + 0.01) {
      return NextResponse.json(
        { error: `Le montant (${paymentAmount.toLocaleString()} FCFA) dépasse le solde dû (${invoice.balanceDue.toLocaleString()} FCFA).` },
        { status: 400 }
      );
    }

    const payDate = date ? new Date(date) : new Date();

    const paymentNumberCount = await prisma.payment.count({
      where: { organizationId: session.organization.id },
    });
    const paymentNumber = `REG-${payDate.getFullYear()}-${(paymentNumberCount + 1).toString().padStart(4, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          organizationId: session.organization.id,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          bankAccountId: bankAccountId || null,
          cashAccountId: cashAccountId || null,
          paymentNumber,
          date: payDate,
          amount: paymentAmount,
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          reference: reference || null,
          notes: notes || `Règlement facture ${invoice.invoiceNumber}`,
        },
      });

      // 2. Update Invoice
      const newPaidAmount = invoice.paidAmount + paymentAmount;
      const newBalanceDue = Math.max(0, invoice.totalTTC - newPaidAmount);
      const newStatus = newBalanceDue <= 0.01 ? "PAID" : "PARTIAL";

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
      });

      // 3. Update Customer balance
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          balance: { decrement: paymentAmount },
        },
      });

      // 4. Update Bank or Cash balance
      if (bankAccountId) {
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: {
            currentBalance: { increment: paymentAmount },
          },
        });
        await tx.bankTransaction.create({
          data: {
            organizationId: session.organization.id,
            bankAccountId,
            date: payDate,
            reference: reference || paymentNumber,
            description: `Encaissement ${paymentNumber} - Facture ${invoice.invoiceNumber}`,
            type: "CREDIT",
            amount: paymentAmount,
            isReconciled: true,
          },
        });
      } else if (cashAccountId) {
        await tx.cashAccount.update({
          where: { id: cashAccountId },
          data: {
            currentBalance: { increment: paymentAmount },
          },
        });
        await tx.bankTransaction.create({
          data: {
            organizationId: session.organization.id,
            cashAccountId,
            date: payDate,
            reference: reference || paymentNumber,
            description: `Encaissement espèces ${paymentNumber} - Facture ${invoice.invoiceNumber}`,
            type: "CREDIT",
            amount: paymentAmount,
            isReconciled: true,
          },
        });
      }

      // 5. Automatic SYSCOHADA entry in Bank (BQ) or Cash (CA) Journal
      const journalCode = bankAccountId ? "BQ" : "CA";
      const targetJournal = await tx.accountingJournal.findFirst({
        where: { organizationId: session.organization.id, code: journalCode },
      });

      const fiscalYear = await tx.fiscalYear.findFirst({
        where: {
          organizationId: session.organization.id,
          startDate: { lte: payDate },
          endDate: { gte: payDate },
          isClosed: false,
        },
      });

      const treasuryAccCode = bankAccountId ? "521100" : "571100";
      const treasuryAcc = await tx.accountingAccount.findFirst({
        where: { organizationId: session.organization.id, code: treasuryAccCode },
      });
      const clientAcc = await tx.accountingAccount.findFirst({
        where: { organizationId: session.organization.id, code: "411100" },
      });

      if (targetJournal && fiscalYear && treasuryAcc && clientAcc) {
        const entryCount = await tx.accountingEntry.count({
          where: { organizationId: session.organization.id, journalId: targetJournal.id },
        });
        const entryNumber = `${journalCode}-${payDate.getFullYear()}-${(entryCount + 1).toString().padStart(4, "0")}`;

        await tx.accountingEntry.create({
          data: {
            organizationId: session.organization.id,
            fiscalYearId: fiscalYear.id,
            journalId: targetJournal.id,
            entryNumber,
            date: payDate,
            description: `Règlement ${paymentNumber} - Client ${invoice.customer.name}`,
            reference: reference || invoice.invoiceNumber,
            sourceType: "PAYMENT",
            sourceId: payment.id,
            status: "POSTED",
            createdBy: session.user.id,
            lines: {
              create: [
                {
                  accountId: treasuryAcc.id,
                  description: `Encaissement ${invoice.invoiceNumber}`,
                  debit: paymentAmount,
                  credit: 0,
                },
                {
                  accountId: clientAcc.id,
                  description: `Règlement facture ${invoice.invoiceNumber}`,
                  debit: 0,
                  credit: paymentAmount,
                },
              ],
            },
          },
        });
      }

      return payment;
    });

    return NextResponse.json({ success: true, payment: result });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du paiement." }, { status: 500 });
  }
}
