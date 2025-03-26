// Archivo: src/routes/authRoutes.ts

/**
 * Middleware de Autenticación y Autorización
 * 
 * Funciones:
 * - Validar tokens JWT
 * - Proteger rutas que requieren autenticación
 * - Control de acceso basado en roles de usuario
 * 
 * Componentes principales:
 * - authenticateToken: Verifica la validez del token de acceso
 * - checkRole: Valida permisos específicos por tipo de usuario
 * 
 * Casos de uso en VecindApp:
 * - Restringir acceso a funciones de socios y directiva
 * - Proteger rutas sensibles
 * - Gestionar niveles de acceso en la aplicación
 */

// Importar Express para crear rutas de la API y tipos necesarios
import express, { Request, Response, NextFunction } from 'express';

// Importar funciones de controlador de autenticación que manejarán la lógica de cada ruta
import { 
  registerUser,     // Función para registrar un nuevo usuario (vecino)
  loginUser,        // Función para iniciar sesión 
  requestSocioStatus, // Función para que un vecino solicite ser socio
  validateSocioRequest // Función para que la directiva valide solicitudes de membresía
} from '../controllers/authController';

// Importar middleware de autenticación para verificar tokens JWT
import { authenticateToken } from '../middleware/authMiddleware';

// Crear un nuevo enrutador de Express
const router = express.Router();

// Función auxiliar para manejar errores asincrónicos
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Definir explícitamente el tipo del middleware de autenticación
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  authenticateToken(req, res, next);
};


// Ruta POST para registro de usuarios
// Permite a un nuevo vecino crear una cuenta en la aplicación
// No requiere autenticación previa
router.post('/register', asyncHandler(registerUser));

// Ruta POST para inicio de sesión
// Permite a usuarios existentes autenticarse en la aplicación
// Verificará credenciales y generará un token JWT
router.post('/login', asyncHandler(loginUser));

// Ruta POST para solicitar membresía de socio
// Requiere que el usuario esté autenticado (token JWT válido)
// Solo usuarios registrados pueden solicitar ser socios
router.post('/request-socio', authenticateToken, asyncHandler(requestSocioStatus));

// Ruta POST para validar solicitud de membresía de socio
// Requiere autenticación con token JWT
// Solo la directiva puede validar solicitudes de membresía
router.post('/validate-socio-request', authenticateToken, asyncHandler(validateSocioRequest));

// Exportar el enrutador para ser usado en el archivo principal de la aplicación
export default router;