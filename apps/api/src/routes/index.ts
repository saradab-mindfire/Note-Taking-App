import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";

export const apiRouter = Router();

// Health check for API namespace
apiRouter.get("/", (_req, res) => {
  res.json({ message: "Notepad API v1", version: "1.0.0" });
});

// Auth routes
apiRouter.use("/auth", authRouter);
