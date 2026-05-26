import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/error-handler.js";
import { verifyAccessToken } from "./auth.tokens.js";

// Augment the Express Request type to carry the authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or malformed authorization header", "UNAUTHORIZED");
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AppError(401, "Invalid or expired access token", "UNAUTHORIZED");
  }
}
