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
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {
      organizationId: session.organization.id,
    };

    if (status) where.status = status;
    if (type) where.type = type;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error) {
    console.error("Invoices GET error:", error);
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
      customerId,
      type = "INVOICE",
      date,
      dueDate,
      items,
      notes,
      paymentTerms,
      autoPostAccounting = true,
    } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Veuillez sélectionner un client et au moins un article." },
        { status: 400 }
      );
    }

    const invDate = date ? new Date(date) : new Date();
    const invDueDate = dueDate
      ? new Date(dueDate)
      : new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    let subtotalHT = 0;
    let taxAmount = 0;

    const formattedItems = items.map((item: any) => {
      const qty = parseFloat(item.quantity) || 1;
      const price = parseFloat(item.unitPrice) || 0;
      const rate = parseFloat(item.taxRate ?? 19.0);
      const discount = parseFloat(item.discountPercent) || 0;

      const itemHT = qty * price * (1 - discount / 100);
      const itemTax = Math.round(itemHT * (rate / 100));
      const itemTTC = itemHT + itemTax;

      subtotalHT += itemHT;
      taxAmount += itemTax;

      return {
        productId: item.productId || null,
        description: item.description || "Article / Prestation",
        quantity: qty,
        unitPrice: price,
        discountPercent: discount,
        taxRate: rate,
        subtotalHT: Math.round(itemHT),
        taxAmount: itemTax,
        totalTTC: Math.round(itemTTC),
      };
    });

    const totalTTC = Math.round(subtotalHT + taxAmount);

    const count = await prisma.invoice.count({
      where: {
        organizationId: session.organization.id,
        type,
      },
    });

    const prefix = type === "QUOTE" ? "DEV" : type === "PROFORMA" ? "PRO" : "FAC";
    const invoiceNumber = `${prefix}-${invDate.getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const invoice = await prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          organizationId: session.organization.id,
          customerId,
          invoiceNumber,
          type,
          date: invDate,
          dueDate: invDueDate,
          status: "SENT",
          subtotalHT: Math.round(subtotalHT),
          taxRate: 19.0,
          taxAmount,
          totalTTC,
          paidAmount: 0.0,
          balanceDue: totalTTC,
          notes: notes || null,
          paymentTerms: paymentTerms || "Règlement sous 30 jours",
          items: {
            create: formattedItems,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      await tx.customer.update({
        where: { id: customerId },
        data: {
          balance: { increment: totalTTC },
        },
      });

      return createdInvoice;
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la facture." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, notes, paymentTerms, status, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: session.organization.id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        notes: notes !== undefined ? notes : invoice.notes,
        paymentTerms: paymentTerms !== undefined ? paymentTerms : invoice.paymentTerms,
        status: status !== undefined ? status : invoice.status,
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Invoice PUT error:", error);
    return NextResponse.json({ error: "Erreur mise à jour facture." }, { status: 500 });
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

    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: session.organization.id },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
    }

    if (invoice.paidAmount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une facture ayant des paiements enregistrés. Veuillez annuler les paiements d'abord." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Revert customer balance
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          balance: { decrement: invoice.balanceDue },
        },
      });

      // Delete items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Delete invoice
      await tx.invoice.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Facture supprimée et créance ajustée." });
  } catch (error) {
    console.error("Invoice DELETE error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de la facture." }, { status: 500 });
  }
}
