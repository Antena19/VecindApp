// Archivo: src/index.ts

/**
 * Punto de entrada principal del microservicio de autenticación de VecindApp
 * 
 * Funciones:
 * - Configurar y iniciar el servidor Express
 * - Cargar variables de entorno
 * - Configurar middlewares
 * - Gestionar rutas de autenticación
 * - Iniciar conexión con base de datos
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Importar rutas de autenticación
import authRoutes from './routes/authRoutes';

// Importar función de prueba de conexión a base de datos
import { testConnection } from './config/db';

import { errorHandler } from './middleware/errorHandler';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de servidor Express
const app = express();

// Puerto de escucha del servidor
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(helmet()); // Añadir headers de seguridad
app.use(express.json()); // Parsear JSON en solicitudes
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Rutas
app.use('/api/auth', authRoutes); // Prefijo para rutas de autenticación
app.use(errorHandler);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Microservicio de Autenticación VecindApp', 
    status: 'Activo' 
  });
});

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    mensaje: 'Ruta no encontrada',
    error: 'Not Found'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Deteniendo servidor.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor de autenticación corriendo en puerto ${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar inicio del servidor
startServer();

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('Deteniendo servidor...');
  process.exit(0);
});