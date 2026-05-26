import type { User, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

// ─── User ─────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string | undefined;
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      ...(data.name !== undefined ? { name: data.name } : {}),
    },
  });
}

// ─── Refresh Tokens ───────────────────────────────────────────────────────────

type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: true };
}>;

export async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<Prisma.RefreshTokenGetPayload<Record<string, never>>> {
  return prisma.refreshToken.create({ data });
}

export async function findRefreshToken(
  tokenHash: string,
): Promise<RefreshTokenWithUser | null> {
  return prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function revokeRefreshToken(id: string): Promise<void> {
  await prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
