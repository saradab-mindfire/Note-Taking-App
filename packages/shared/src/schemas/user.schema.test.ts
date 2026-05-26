import { describe, it, expect } from "vitest";
import { createUserSchema } from "./user.schema.js";

describe("createUserSchema", () => {
  it("validates a valid user input", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = createUserSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("allows name to be optional", () => {
    const result = createUserSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});
