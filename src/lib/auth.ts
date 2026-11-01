import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "bencomptapro_super_secret_jwt_key_2026_niger_ohada_secure_token";
export const AUTH_COOKIE_NAME = "bencomptapro_session";

export interface SessionPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (e) {
    return null;
  }
}

/**
 * Server-side helper to get current authenticated user and organization
 */
export async function getCurrentSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Get active organization membership
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: payload.organizationId,
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    // Fallback: If no specific org in payload or not found, find the user's first org
    const activeMembership =
      membership ||
      (await prisma.organizationMember.findFirst({
        where: { userId: user.id, isActive: true },
        include: { organization: true },
      }));

    if (!activeMembership) {
      return {
        user,
        organization: null,
        membership: null,
        role: "GUEST",
      };
    }

    return {
      user,
      organization: activeMembership.organization,
      membership: activeMembership,
      role: activeMembership.role,
    };
  } catch (error) {
    console.error("Erreur de récupération de session:", error);
    return null;
  }
}

