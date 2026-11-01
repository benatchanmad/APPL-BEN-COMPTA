import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.organization) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: session.organization.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error("Users GET error:", error);
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
    const { email, firstName, lastName, phone, role, password } = body;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être renseignés." }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const pwd = password || "Password@2026!";
      const passwordHash = await hashPassword(pwd);
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
        },
      });
    }

    // Check if already member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: session.organization.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Cet utilisateur fait déjà partie de l'organisation." },
        { status: 409 }
      );
    }

    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: session.organization.id,
        role,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Erreur création utilisateur." }, { status: 500 });
  }
}

