import winston from 'winston';
import path from 'path';

// Configurar los transportes (destinos) de los logs
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

const fileTransport = new winston.transports.File({
  filename: path.join(__dirname, '../../logs/error.log'),
  level: 'error'
});

const combinedTransport = new winston.transports.File({
  filename: path.join(__dirname, '../../logs/combined.log')
});

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'auth-service' },
  transports: [
    consoleTransport,
    fileTransport,
    combinedTransport
  ]
});

export default logger;