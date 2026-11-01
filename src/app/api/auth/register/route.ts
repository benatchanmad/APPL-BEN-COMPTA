import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { companyName, firstName, lastName, email, password, phone, country } = await req.json();

    if (!companyName || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cette adresse email existe déjà." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30) + `-${Date.now().toString().slice(-4)}`;

    // Create user and organization inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: companyName,
          slug,
          country: country || "Niger",
          currency: "XOF",
          defaultVatRate: 19.0,
        },
      });

      // Add user as ADMIN of this organization
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      });

      // Create initial Fiscal Year
      await tx.fiscalYear.create({
        data: {
          organizationId: organization.id,
          name: `Exercice ${new Date().getFullYear()}`,
          startDate: new Date(`${new Date().getFullYear()}-01-01T00:00:00Z`),
          endDate: new Date(`${new Date().getFullYear()}-12-31T23:59:59Z`),
        },
      });

      // Create default journals (SYSCOHADA)
      const journals = [
        { code: "VT", name: "Journal des Ventes", type: "SALES" },
        { code: "AC", name: "Journal des Achats", type: "PURCHASES" },
        { code: "BQ", name: "Journal de Banque", type: "BANK" },
        { code: "CA", name: "Journal de Caisse", type: "CASH" },
        { code: "OD", name: "Journal des Opérations Diverses", type: "GENERAL" },
      ];

      for (const j of journals) {
        await tx.accountingJournal.create({
          data: {
            organizationId: organization.id,
            code: j.code,
            name: j.name,
            type: j.type,
          },
        });
      }

      // Create initial subscription trial
      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          plan: "BUSINESS",
          status: "TRIAL",
          billingCycle: "MONTHLY",
          amount: 45000.0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          maxUsers: 10,
        },
      });

      return { user, organization };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "Votre compte et entreprise ont été créés avec succès.",
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: "ADMIN",
      },
      organization: result.organization,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'entreprise." },
      { status: 500 }
    );
  }
}

