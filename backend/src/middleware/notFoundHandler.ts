import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};
