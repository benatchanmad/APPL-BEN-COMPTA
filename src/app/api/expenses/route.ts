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

      return createdExpense;
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("Expense POST error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de la dépense." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, categoryId, supplierId } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "ID et titre obligatoires." }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description !== undefined ? description : existing.description,
        categoryId: categoryId || existing.categoryId,
        supplierId: supplierId !== undefined ? supplierId : existing.supplierId,
      },
    });

    return NextResponse.json({ success: true, expense: updated });
  } catch (error) {
    console.error("Expense PUT error:", error);
    return NextResponse.json({ error: "Erreur modification dépense." }, { status: 500 });
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

    const expense = await prisma.expense.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Restore bank/cash balance
      if (expense.bankAccountId) {
        await tx.bankAccount.update({
          where: { id: expense.bankAccountId },
          data: { currentBalance: { increment: expense.totalTTC } },
        });
      } else if (expense.cashAccountId) {
        await tx.cashAccount.update({
          where: { id: expense.cashAccountId },
          data: { currentBalance: { increment: expense.totalTTC } },
        });
      }

      await tx.expense.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Dépense supprimée et trésorerie réajustée avec succès." });
  } catch (error) {
    console.error("Expense DELETE error:", error);
    return NextResponse.json({ error: "Erreur suppression dépense." }, { status: 500 });
  }
}
