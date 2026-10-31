import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: { organizationId: session.organization.id },
      include: {
        category: true,
        supplier: true,
        bankAccount: true,
        cashAccount: true,
      },
      orderBy: { date: "desc" },
    });

    const categories = await prisma.expenseCategory.findMany({
      where: { organizationId: session.organization.id },
    });

    return NextResponse.json({ success: true, expenses, categories });
  } catch (error) {
    console.error("Expenses GET error:", error);
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
    const {
      categoryId,
      supplierId,
      bankAccountId,
      cashAccountId,
      title,
      description,
      amountHT,
      taxRate = 19.0,
      paymentMethod = "CASH",
      date,
    } = body;

    const baseAmount = parseFloat(amountHT);
    if (!categoryId || !title || !baseAmount || baseAmount <= 0) {
      return NextResponse.json(
        { error: "Veuillez renseigner le titre, la catégorie et un montant valide." },
        { status: 400 }
      );
    }

    const rate = parseFloat(taxRate) || 0;
    const taxAmount = Math.round(baseAmount * (rate / 100));
    const totalTTC = Math.round(baseAmount + taxAmount);
    const expDate = date ? new Date(date) : new Date();

    const count = await prisma.expense.count({
      where: { organizationId: session.organization.id },
    });
    const expenseNumber = `DEP-${expDate.getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const expense = await prisma.$transaction(async (tx) => {
      // 1. Create Expense
      const createdExpense = await tx.expense.create({
        data: {
          organizationId: session.organization.id,
          categoryId,
          supplierId: supplierId || null,
          bankAccountId: bankAccountId || null,
          cashAccountId: cashAccountId || null,
          expenseNumber,
          title: title.trim(),
          description: description || null,
          date: expDate,
          amountHT: baseAmount,
          taxRate: rate,
          taxAmount,
          totalTTC,
          paymentMethod,
          status: "PAID",
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      // 2. Decrement Treasury balance
      if (bankAccountId) {
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { currentBalance: { decrement: totalTTC } },
        });
        await tx.bankTransaction.create({
          data: {
            organizationId: session.organization.id,
            bankAccountId,
            date: expDate,
            reference: expenseNumber,
            description: `Dépense ${expenseNumber} - ${title}`,
            type: "DEBIT",
            amount: totalTTC,
            isReconciled: true,
          },
        });
      } else if (cashAccountId) {
        await tx.cashAccount.update({
          where: { id: cashAccountId },
          data: { currentBalance: { decrement: totalTTC } },
        });
        await tx.bankTransaction.create({
          data: {
            organizationId: session.organization.id,
            cashAccountId,
            date: expDate,
            reference: expenseNumber,
            description: `Dépense espèces ${expenseNumber} - ${title}`,
            type: "DEBIT",
            amount: totalTTC,
            isReconciled: true,
          },
        });
      }

      // 3. Post SYSCOHADA double-entry
      const journalCode = bankAccountId ? "BQ" : "CA";
      const journal = await tx.accountingJournal.findFirst({
        where: { organizationId: session.organization.id, code: journalCode },
      });
      const fiscalYear = await tx.fiscalYear.findFirst({
        where: {
          organizationId: session.organization.id,
          startDate: { lte: expDate },
          endDate: { gte: expDate },
          isClosed: false,
        },
      });

      const expenseCat = await tx.expenseCategory.findUnique({ where: { id: categoryId } });
      const chargeAccountCode = expenseCat?.defaultAccount || "605300";

      const chargeAccount = await tx.accountingAccount.findFirst({
        where: { organizationId: session.organization.id, code: chargeAccountCode },
      });
      const vatDeductibleAccount = await tx.accountingAccount.findFirst({
        where: { organizationId: session.organization.id, code: "445200" },
      });
      const treasuryAccountCode = bankAccountId ? "521100" : "571100";
      const treasuryAccount = await tx.accountingAccount.findFirst({
        where: { organizationId: session.organization.id, code: treasuryAccountCode },
      });

      if (journal && fiscalYear && chargeAccount && treasuryAccount) {
        const entryCount = await tx.accountingEntry.count({
          where: { organizationId: session.organization.id, journalId: journal.id },
        });
        const entryNumber = `${journalCode}-${expDate.getFullYear()}-${(entryCount + 1).toString().padStart(4, "0")}`;

        const entryLines: any[] = [
          {
            accountId: chargeAccount.id,
            description: `Charge HT - ${title}`,
            debit: baseAmount,
            credit: 0,
          },
        ];

        if (taxAmount > 0 && vatDeductibleAccount) {
          entryLines.push({
            accountId: vatDeductibleAccount.id,
            description: `TVA récupérable 19% - ${title}`,
            debit: taxAmount,
            credit: 0,
          });
        }

        entryLines.push({
          accountId: treasuryAccount.id,
          description: `Règlement dépense ${expenseNumber}`,
          debit: 0,
          credit: totalTTC,
        });

        const entry = await tx.accountingEntry.create({
          data: {
            organizationId: session.organization.id,
            fiscalYearId: fiscalYear.id,
            journalId: journal.id,
            entryNumber,
            date: expDate,
            description: `Dépense ${expenseNumber} : ${title}`,
            reference: expenseNumber,
            sourceType: "EXPENSE",
            sourceId: createdExpense.id,
            status: "POSTED",
            createdBy: session.user.id,
            lines: {
              create: entryLines,
            },
          },
        });

        await tx.expense.update({
          where: { id: createdExpense.id },
          data: { accountingEntryId: entry.id },
        });
      }

      return createdExpense;
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Expense POST error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de la dépense." }, { status: 500 });
  }
}
