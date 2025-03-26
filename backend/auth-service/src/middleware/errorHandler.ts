// Archivo: src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Clase de error base para errores operativos
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de manejo de errores global
export const errorHandler = (
  err: CustomError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Código de estado por defecto
  err.statusCode = err.statusCode || 500;

  // Preparar respuesta de error
  const errorResponse = {
    status: 'error',
    statusCode: err.statusCode,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Registro de error (puedes expandir esto con un sistema de logging más adelante)
  console.error(`[ERROR] ${err.message}`);

  // Enviar respuesta de error
  res.status(err.statusCode).json(errorResponse);
};

// Función para capturar errores asincrónicos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Exportar clase de error para uso en controladores
export { AppError };