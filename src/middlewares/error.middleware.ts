import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  const statusCode = "statusCode" in error && typeof error.statusCode === "number"
    ? error.statusCode
    : 500;

  return res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : error.message,
  });
}