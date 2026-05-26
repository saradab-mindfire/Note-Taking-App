import bcrypt from "bcryptjs";
import { AppError } from "../../middleware/error-handler.js";
import type { AuthResponse, RefreshResponse, AuthUser } from "@notepad/shared";
import * as repo from "./auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
  verifyAccessToken,
} from "./auth.tokens.js";

const BCRYPT_ROUNDS = 12;

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(data: {
  email: string;
  password: string;
  name?: string | undefined;
}): Promise<AuthResponse> {
  const existing = await repo.findUserByEmail(data.email);
  if (existing) {
    throw new AppError(409, "Email is already registered", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  const user = await repo.createUser({
    email: data.email,
    passwordHash,
    ...(data.name !== undefined ? { name: data.name } : {}),
  });

  const accessToken = generateAccessToken({ sub: user.id, email: user.email });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawRefreshToken);

  await repo.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt: refreshTokenExpiresAt(),
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: toAuthUser(user),
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await repo.findUserByEmail(data.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const accessToken = generateAccessToken({ sub: user.id, email: user.email });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawRefreshToken);

  await repo.createRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt: refreshTokenExpiresAt(),
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: toAuthUser(user),
  };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refresh(rawToken: string): Promise<RefreshResponse> {
  const tokenHash = hashRefreshToken(rawToken);
  const record = await repo.findRefreshToken(tokenHash);

  if (!record) {
    throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
  }
  if (record.revokedAt !== null) {
    throw new AppError(401, "Refresh token has been revoked", "TOKEN_REVOKED");
  }
  if (record.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token has expired", "TOKEN_EXPIRED");
  }

  // Rotate: revoke old, issue new
  await repo.revokeRefreshToken(record.id);

  const newRawToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRawToken);

  await repo.createRefreshToken({
    userId: record.userId,
    tokenHash: newTokenHash,
    expiresAt: refreshTokenExpiresAt(),
  });

  const accessToken = generateAccessToken({
    sub: record.user.id,
    email: record.user.email,
  });

  return { accessToken, refreshToken: newRawToken };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawToken);
  const record = await repo.findRefreshToken(tokenHash);

  if (!record || record.revokedAt !== null) {
    // Idempotent — already revoked or not found is acceptable
    return;
  }

  await repo.revokeRefreshToken(record.id);
}

// ─── Current User ─────────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }
  return toAuthUser(user);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAuthUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export { verifyAccessToken };
