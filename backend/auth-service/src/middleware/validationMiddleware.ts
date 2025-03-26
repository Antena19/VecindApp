// Archivo: src/middleware/validationMiddleware.ts
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(dtoClass, req.body);
    const errors = await validate(dto, { 
      whitelist: true, 
      forbidNonWhitelisted: true 
    });

    if (errors.length > 0) {
      const firstError = errors[0];
      const errorMessage = Object.values(firstError.constraints || {})[0] || 'Error de validación';

      throw new AppError(errorMessage, 400);
    }

    next();
  };
};