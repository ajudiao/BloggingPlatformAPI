import { NextFunction, Request, Response } from "express";
import { env } from "./env";

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin;

  if (origin === env.CORS_ORIGIN || origin === "http://127.0.0.1:5500") {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (origin === "null") {
    res.header("Access-Control-Allow-Origin", "null");
  }

  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
