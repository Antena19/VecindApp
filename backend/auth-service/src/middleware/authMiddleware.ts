// Archivo: src/middleware/authMiddleware.ts

// Importaciones necesarias para manejo de tipos y autenticación
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interfaz para definir la estructura del payload del token JWT
interface UserPayload {
  id: number;        // ID único del usuario
  rut: string;       // RUT del usuario para identificación
  tipo_usuario: string; // Tipo de usuario (vecino, socio, directiva)
}

// Extensión del objeto Request de Express para incluir información de usuario
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Middleware para autenticar y validar tokens JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Obtener el token del header de autorización
  const authHeader = req.headers['authorization'];
  
  // Extraer el token. Formato esperado: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  // Verificar si se proporcionó un token
  if (!token) {
    res.status(401).json({ 
      mensaje: 'No se proporcionó un token de autenticación',
      error: 'Unauthorized' 
    });
    return;
  }

  try {
    // Verificar la validez del token usando la clave secreta
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || ''
    ) as UserPayload;
    
    // Validaciones adicionales del token
    if (!decoded.id || !decoded.rut || !decoded.tipo_usuario) {
      res.status(403).json({ 
        mensaje: 'Token inválido',
        error: 'Forbidden' 
      });
      return;
    }

    // Adjuntar la información del usuario decodificada al objeto de solicitud
    req.user = decoded;
    
    // Continuar con la siguiente función middleware o manejador de ruta
    next();

  } catch (error) {
    // Manejar diferentes tipos de errores de token
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        mensaje: 'Token expirado',
        error: 'Token Expired' 
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ 
        mensaje: 'Token inválido',
        error: 'Invalid Token' 
      });
      return;
    }

    // Error genérico para cualquier otro problema
    console.error('Error de autenticación:', error);
    res.status(500).json({ 
      mensaje: 'Error interno de autenticación',
      error: 'Internal Server Error' 
    });
  }
};

// Middleware adicional para verificar roles específicos
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      res.status(401).json({ 
        mensaje: 'No autenticado',
        error: 'Unauthorized' 
      });
      return;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!roles.includes(req.user.tipo_usuario)) {
      res.status(403).json({ 
        mensaje: 'No tienes permisos para realizar esta acción',
        error: 'Forbidden' 
      });
      return;
    }

    // Si el rol es válido, continuar
    next();
  };
};