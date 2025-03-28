import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Interfaz para configuración de base de datos
export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Configuración por defecto para desarrollo
const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'vecindapp_dev',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Clase para manejar conexiones de base de datos
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  public pool: mysql.Pool;

  private constructor(config: DatabaseConfig = defaultConfig) {
    this.pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // Patrón Singleton para manejar una única instancia
  public static getInstance(config?: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  // Probar conexión
  public async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Conexión a la base de datos establecida correctamente');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Error al conectarse a la base de datos:', error);
      return false;
    }
  }

  // Cerrar pool de conexiones
  public async closeConnection(): Promise<void> {
    try {
      await this.pool.end();
      console.log('✅ Pool de conexiones a la base de datos cerrado correctamente');
    } catch (error) {
      console.error('❌ Error al cerrar el pool de conexiones:', error);
    }
  }
}

// Exportar función para crear conexión
export const createDatabaseConnection = (config?: DatabaseConfig) => 
  DatabaseConnection.getInstance(config);

// Manejar cierre del servidor
process.on('SIGINT', async () => {
  const dbConnection = DatabaseConnection.getInstance();
  await dbConnection.closeConnection();
  process.exit(0);
});