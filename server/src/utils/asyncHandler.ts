import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Utility to wrap async express routes and catch any errors.
 * This prevents the process from crashing due to unhandled promise rejections.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
