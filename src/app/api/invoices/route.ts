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

    // Compute totals
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

    // Generate invoice number: FAC-2026-0004
    const count = await prisma.invoice.count({
      where: {
        organizationId: session.organization.id,
        type,
      },
    });

    const prefix = type === "QUOTE" ? "DEV" : type === "PROFORMA" ? "PRO" : "FAC";
    const invoiceNumber = `${prefix}-${invDate.getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
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

      // Update customer balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          balance: { increment: totalTTC },
        },
      });

      // 2. Automatically generate SYSCOHADA double-entry if requested and type === 'INVOICE'
      if (autoPostAccounting && type === "INVOICE") {
        const fiscalYear = await tx.fiscalYear.findFirst({
          where: {
            organizationId: session.organization.id,
            startDate: { lte: invDate },
            endDate: { gte: invDate },
            isClosed: false,
          },
        });

        const vtJournal = await tx.accountingJournal.findFirst({
          where: {
            organizationId: session.organization.id,
            code: "VT",
          },
        });

        // Find or fallback accounts: 411100, 706100, 443100
        const clientAcc = await tx.accountingAccount.findFirst({
          where: { organizationId: session.organization.id, code: "411100" },
        });
        const salesAcc = await tx.accountingAccount.findFirst({
          where: { organizationId: session.organization.id, code: { in: ["706100", "701100"] } },
        });
        const vatAcc = await tx.accountingAccount.findFirst({
          where: { organizationId: session.organization.id, code: "443100" },
        });

        if (fiscalYear && vtJournal && clientAcc && salesAcc) {
          const entryCount = await tx.accountingEntry.count({
            where: { organizationId: session.organization.id, journalId: vtJournal.id },
          });
          const entryNumber = `VT-${invDate.getFullYear()}-${(entryCount + 1).toString().padStart(4, "0")}`;

          const entryLines: any[] = [
            {
              accountId: clientAcc.id,
              description: `Facture ${invoiceNumber} - ${createdInvoice.customer.name}`,
              debit: totalTTC,
              credit: 0,
            },
            {
              accountId: salesAcc.id,
              description: `Vente de services / produits HT - Facture ${invoiceNumber}`,
              debit: 0,
              credit: Math.round(subtotalHT),
            },
          ];

          if (taxAmount > 0 && vatAcc) {
            entryLines.push({
              accountId: vatAcc.id,
              description: `TVA collectée sur ventes 19% - ${invoiceNumber}`,
              debit: 0,
              credit: taxAmount,
            });
          }

          const entry = await tx.accountingEntry.create({
            data: {
              organizationId: session.organization.id,
              fiscalYearId: fiscalYear.id,
              journalId: vtJournal.id,
              entryNumber,
              date: invDate,
              description: `Facture ${invoiceNumber} client ${createdInvoice.customer.name}`,
              reference: invoiceNumber,
              sourceType: "INVOICE",
              sourceId: createdInvoice.id,
              status: "POSTED",
              createdBy: session.user.id,
              lines: {
                create: entryLines,
              },
            },
          });

          await tx.invoice.update({
            where: { id: createdInvoice.id },
            data: { accountingEntryId: entry.id },
          });
        }
      }

      return createdInvoice;
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice POST error:", error);
    return NextResponse.json({ error: "Erreur lors de la création de la facture." }, { status: 500 });
  }
}
