import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  registerRequestSchema,
  loginRequestSchema,
  refreshRequestSchema,
  logoutRequestSchema,
} from "@notepad/shared";
import { authenticate } from "./auth.middleware.js";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerRequestSchema), registerHandler);
authRouter.post("/login", validate(loginRequestSchema), loginHandler);
authRouter.post("/refresh", validate(refreshRequestSchema), refreshHandler);
authRouter.post("/logout", validate(logoutRequestSchema), logoutHandler);
authRouter.get("/me", authenticate, meHandler);
