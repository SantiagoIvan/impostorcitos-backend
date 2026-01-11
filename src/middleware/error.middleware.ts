import { Request, Response, NextFunction } from "express";
import { HttpError } from "../domain";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof HttpError) {
    res.status(err.httpCode).json({
      message: err.message
    });
    return;
  }

  // Error inesperado / bug
  console.error("Error inesperado", err);

  res.status(500).json({
    message: `Error: ${err.message}`
  });
};
