import { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statuscode: number;
}

export class ApplicationException extends Error {
  constructor(
    message: string,
    public statuscode: number = 400,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}
export class BadRequestException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 400, options);
  }
}
export class NotFoundException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 404, options);
  }
}
export class ConflictException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 409, options);
  }
}
export const globalErrorHandling = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(err.statuscode || 500).json({
    message: err.message,
    stack: process.env.MODE === "DEV" ? err.stack : undefined,
    cause: err.cause,
  });
};
