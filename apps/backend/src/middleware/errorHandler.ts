import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { config } from '../config/environment.js';

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  isOperational?: boolean;
  code?: string | number;
}

interface ErrorResponseBody {
  status: number;
  message: string;
  code?: string | number;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode =
    typeof err.statusCode === 'number'
      ? err.statusCode
      : typeof err.status === 'number'
        ? err.status
        : 500;

  const isOperational = err.isOperational === true;
  const message =
    isOperational || statusCode < 500
      ? err.message || 'Request failed'
      : 'Internal Server Error';

  // eslint-disable-next-line no-console
  console.error('[error]', {
    name: err.name,
    message: err.message,
    statusCode,
    isOperational,
    stack: err.stack,
  });

  const body: ErrorResponseBody = {
    status: statusCode,
    message,
  };

  if (err.code !== undefined) {
    body.code = err.code;
  }

  if (config.nodeEnv === 'development' && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
