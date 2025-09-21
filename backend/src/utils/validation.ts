import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from './response';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    ResponseHandler.validationError(res, errorMessages);
    return;
  }
  
  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    ResponseHandler.validationError(res, ['Page must be a positive number']);
    return;
  }
  
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    ResponseHandler.validationError(res, ['Limit must be between 1 and 100']);
    return;
  }
  
  next();
};
