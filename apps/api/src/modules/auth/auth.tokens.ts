import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../config/env.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN;
export const REFRESH_TOKEN_EXPIRES_DAYS = 7;
export const REFRESH_TOKEN_EXPIRES_MS =
  REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;

// ─── Access Token ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  if (
    typeof decoded !== "object" ||
    typeof decoded["sub"] !== "string" ||
    typeof decoded["email"] !== "string"
  ) {
    throw new Error("Invalid token payload");
  }
  return { sub: decoded["sub"], email: decoded["email"] };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS);
}
