import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHandler {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, error: string, statusCode: number = 500, message?: string): void {
    const response: ApiResponse = {
      success: false,
      error,
      message,
    };
    res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: string[]): void {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: errors.join(', '),
    };
    res.status(400).json(response);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message,
    };
    res.status(401).json(response);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message,
    };
    res.status(403).json(response);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    const response: ApiResponse = {
      success: false,
      error: 'Not found',
      message,
    };
    res.status(404).json(response);
  }
}
