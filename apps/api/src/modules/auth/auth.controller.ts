import type { Request, Response, NextFunction } from "express";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshRequest,
  LogoutRequest,
} from "@notepad/shared";
import * as authService from "./auth.service.js";
import { AppError } from "../../middleware/error-handler.js";

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as RegisterRequest;
    const result = await authService.register(body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as LoginRequest;
    const result = await authService.login(body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as RefreshRequest;
    const result = await authService.refresh(body.refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as LogoutRequest;
    await authService.logout(body.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
