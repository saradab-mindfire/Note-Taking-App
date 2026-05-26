import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { User, RefreshToken } from "@prisma/client";
import { createApp } from "../../../app.js";

// ─── Mock Prisma ──────────────────────────────────────────────────────────────

vi.mock("../../../lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";

const app = createApp();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    passwordHash: bcrypt.hashSync("password123", 1),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeRefreshTokenRecord(
  overrides: Partial<RefreshToken> = {},
): RefreshToken & { user: User } {
  const user = makeUser();
  return {
    id: "rt-1",
    userId: user.id,
    tokenHash: "hashed-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: new Date(),
    ...overrides,
    user,
  };
}

// ─── Register ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registers a new user successfully", async () => {
    const user = makeUser();
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce(user);
    vi.mocked(prisma.refreshToken.create).mockResolvedValueOnce(
      makeRefreshTokenRecord(),
    );

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
    expect(res.body.data.user.email).toBe("test@example.com");
  });

  it("returns 409 when email is already registered", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(makeUser());

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("returns 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs in with valid credentials", async () => {
    const user = makeUser();
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(user);
    vi.mocked(prisma.refreshToken.create).mockResolvedValueOnce(
      makeRefreshTokenRecord(),
    );

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });

  it("returns 401 when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for wrong password", async () => {
    const user = makeUser();
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(user);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 400 for missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "password123",
    });

    expect(res.status).toBe(400);
  });
});

// ─── Refresh ──────────────────────────────────────────────────────────────────

describe("POST /api/auth/refresh", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rotates a valid refresh token", async () => {
    const record = makeRefreshTokenRecord();
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(record);
    vi.mocked(prisma.refreshToken.update).mockResolvedValueOnce(record);
    vi.mocked(prisma.refreshToken.create).mockResolvedValueOnce(record);

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "some-raw-token" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });

  it("returns 401 for unknown refresh token", async () => {
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "bad-token" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_REFRESH_TOKEN");
  });

  it("returns 401 for revoked refresh token", async () => {
    const record = makeRefreshTokenRecord({ revokedAt: new Date() });
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(record);

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "revoked-token" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("TOKEN_REVOKED");
  });

  it("returns 401 for expired refresh token", async () => {
    const record = makeRefreshTokenRecord({
      expiresAt: new Date(Date.now() - 1000),
    });
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(record);

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "expired-token" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("returns 400 when refresh token is missing", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});

    expect(res.status).toBe(400);
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs out successfully (revokes token)", async () => {
    const record = makeRefreshTokenRecord();
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(record);
    vi.mocked(prisma.refreshToken.update).mockResolvedValueOnce(record);

    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: "some-token" });

    expect(res.status).toBe(204);
  });

  it("returns 204 even when token is unknown (idempotent)", async () => {
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken: "unknown-token" });

    expect(res.status).toBe(204);
  });

  it("returns 400 when refreshToken is missing", async () => {
    const res = await request(app).post("/api/auth/logout").send({});

    expect(res.status).toBe(400);
  });
});

// ─── Auth Middleware / GET /me ────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns current user when JWT is valid", async () => {
    const user = makeUser();
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(user) // login lookup
      .mockResolvedValueOnce(user); // me lookup
    vi.mocked(prisma.refreshToken.create).mockResolvedValueOnce(
      makeRefreshTokenRecord(),
    );

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    const { accessToken } = loginRes.body.data as {
      accessToken: string;
      refreshToken: string;
    };

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe("test@example.com");
  });

  it("returns 401 without Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  it("returns 401 with a malformed Authorization header", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "NotBearer token");
    expect(res.status).toBe(401);
  });
});
