import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre email et mot de passe." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Identifiants invalides ou compte inactif." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Identifiants invalides ou compte inactif." },
        { status: 401 }
      );
    }

    // Determine primary organization
    const activeMembership = user.memberships[0];
    const organizationId = activeMembership?.organizationId || "";
    const role = activeMembership?.role || (user.isSuperAdmin ? "SUPER_ADMIN" : "MEMBER");

    const token = signToken({
      userId: user.id,
      email: user.email,
      organizationId,
      role,
    });

    // Record login audit log
    if (organizationId) {
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: user.id,
          action: "LOGIN",
          entity: "USER",
          entityId: user.id,
          details: `Connexion réussie de ${user.email} (${role})`,
        },
      }).catch(() => {});
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
        role,
      },
      organization: activeMembership?.organization || null,
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

