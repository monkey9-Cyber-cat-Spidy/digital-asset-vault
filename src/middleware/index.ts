import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Token-bucket style rate limiter: 120 requests per minute per IP
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please throttle your chunk uploads or API calls.'
  }
});

// Centralized error handling middleware
export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[Error] ${err.name}: ${err.message}`);
  res.status(500).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.'
  });
};
