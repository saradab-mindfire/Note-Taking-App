import type { Request, Response, NextFunction } from "express";
import { type ZodSchema } from "zod";

export function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: result.error.flatten().fieldErrors,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
