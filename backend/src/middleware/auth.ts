import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { ResponseHandler } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'candidate' | 'recruiter';
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For demo purposes, create a mock user
    req.user = {
      uid: 'demo-user-123',
      email: 'demo@hiremenow.com',
      role: 'recruiter',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    ResponseHandler.unauthorized(res, 'Invalid token');
  }
};

export const requireRole = (roles: ('candidate' | 'recruiter')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHandler.unauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseHandler.forbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
      return;
    }

    next();
  };
};

export const requireCandidate = requireRole(['candidate']);
export const requireRecruiter = requireRole(['recruiter']);
export const requireAnyRole = requireRole(['candidate', 'recruiter']);
