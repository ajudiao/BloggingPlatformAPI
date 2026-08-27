export type AppError = Error & { statusCode: number };

export function NotFoundError(message: string): AppError {
  return Object.assign(new Error(message), { statusCode: 404 });
}

export function BadRequestError(message: string): AppError {
  return Object.assign(new Error(message), { statusCode: 400 });
}