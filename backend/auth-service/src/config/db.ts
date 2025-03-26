// Archivo: src/config/db.ts
// Propósito: Configurar y gestionar la conexión a la base de datos MySQL
// Proporciona un pool de conexiones para manejar múltiples solicitudes eficientemente

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno del archivo .env
dotenv.config();

// Crear un pool de conexiones a MySQL
// Un pool permite reutilizar conexiones en lugar de crear una nueva para cada consulta
const pool = mysql.createPool({
  // Datos de conexión obtenidos de variables de entorno
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  
  // Opciones de configuración del pool
  waitForConnections: true,    // Esperar si no hay conexiones disponibles
  connectionLimit: 10,         // Máximo de 10 conexiones simultáneas
  queueLimit: 0                // Sin límite en la cola de solicitudes de conexión
});

// Función para probar la conexión a la base de datos
// Útil para verificar que la configuración es correcta al iniciar el servidor
export const testConnection = async (): Promise<boolean> => {
  try {
    // Intentar obtener una conexión del pool
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Devolver la conexión al pool
    connection.release();
    return true;
  } catch (error) {
    // Manejar errores de conexión
    console.error('❌ Error al conectarse a la base de datos:', error);
    return false;
  }
};

// Exportar el pool para usarlo en otros archivos
export default pool;

// Función para cerrar el pool de conexiones de manera elegante
export const closePool = async (): Promise<void> => {
    try {
      await pool.end();
      console.log('✅ Pool de conexiones a la base de datos cerrado correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar el pool de conexiones:', error);
    }
  };
  
  // Manejar cierre del servidor
  process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
  });