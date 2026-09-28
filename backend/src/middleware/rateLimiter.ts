import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter map: key -> { count, resetTime }
const requestCounts = new Map<string, RateLimitRecord>();

// Clean up stale records every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds (e.g., 15 minutes)
  maxRequests: number; // Max generation requests per window
  message?: string;
}

export function createGenerationLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message } = options;

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Admins bypass rate limits for administrative operations
    if (req.user?.role === 'admin') {
      next();
      return;
    }

    // Identify user by auth ID or fallback to client IP
    const identifier = req.user?.id || req.ip || req.socket.remoteAddress || 'anonymous_client';
    const now = Date.now();

    const record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new window
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const waitMinutes = Math.ceil((record.resetTime - now) / 60000);
      res.status(429).json({
        success: false,
        message:
          message ||
          `অতিরিক্ত পোস্টার তৈরির অনুরোধ শনাক্ত হয়েছে। অনুগ্রহ করে ${waitMinutes} মিনিট পর পুনরায় চেষ্টা করুন। (Rate limit exceeded: maximum ${maxRequests} posters per ${Math.round(
            windowMs / 60000
          )} minutes).`,
        retryAfterMinutes: waitMinutes,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Default export: 150 poster generations per 15 minutes per user (supports bulk batch creation)
export const posterGenerationLimiter = createGenerationLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 150,
});
