// Archivo: src/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import pool from '../config/db';
import { AppError } from '../middleware/errorHandler';

// Función para registrar un nuevo usuario (vecino)
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { 
      rut, 
      nombre, 
      apellido_paterno, 
      correo_electronico, 
      telefono, 
      direccion, 
      password 
    } = req.body;

    // Validar campos obligatorios
    if (!rut || !nombre || !apellido_paterno || !correo_electronico || !password) {
      throw new AppError('Faltan campos obligatorios', 400);
    }

    // Validar formato de RUT (ejemplo básico)
    const rutRegex = /^\d{7,8}-[0-9K]$/;
    if (!rutRegex.test(rut)) {
      throw new AppError('Formato de RUT inválido', 400);
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo_electronico)) {
      throw new AppError('Formato de correo electrónico inválido', 400);
    }

    // Verificar si el RUT ya está registrado
    const [existingUsers] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Usuarios WHERE rut = ?', 
      [rut]
    );

    if (existingUsers.length > 0) {
      throw new AppError('El RUT ya está registrado', 409);
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar nuevo usuario en la base de datos
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO Usuarios 
      (rut, nombre, apellido_paterno, correo_electronico, 
       telefono, direccion, password, fecha_registro, estado, tipo_usuario) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'activo', 'vecino')`,
      [
        rut, 
        nombre, 
        apellido_paterno, 
        correo_electronico, 
        telefono || null, 
        direccion || null, 
        hashedPassword
      ]
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        rut: rut, 
        tipo_usuario: 'vecino' 
      }, 
      process.env.JWT_SECRET || '', 
      { expiresIn: '24h' }
    );

    // Responder con éxito
    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente', 
      token,
      usuario: {
        id: result.insertId,
        rut,
        nombre,
        tipo_usuario: 'vecino'
      }
    });

  } catch (error) {
    next(error);
  }
};

// Función para iniciar sesión
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rut, password } = req.body;

    // Validar que se proporcionen RUT y contraseña
    if (!rut || !password) {
      throw new AppError('RUT y contraseña son obligatorios', 400);
    }

    // Buscar usuario por RUT
    const [users] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Usuarios WHERE rut = ?', 
      [rut]
    );

    // Verificar si el usuario existe
    if (users.length === 0) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const user = users[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si el usuario está activo
    if (user.estado !== 'activo') {
      throw new AppError('Cuenta de usuario desactivada', 403);
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        rut: user.rut, 
        tipo_usuario: user.tipo_usuario 
      }, 
      process.env.JWT_SECRET || '', 
      { expiresIn: '24h' }
    );

    // Responder con token
    res.status(200).json({ 
      mensaje: 'Inicio de sesión exitoso', 
      token,
      usuario: {
        id: user.id_usuario,
        rut: user.rut,
        nombre: user.nombre,
        tipo_usuario: user.tipo_usuario
      }
    });

  } catch (error) {
    next(error);
  }
};

// Función para solicitar membresía de socio
export const requestSocioStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ID de usuario obtenido del token JWT
    const usuarioId = req.user?.id;

    // Verificar si se obtuvo el ID de usuario
    if (!usuarioId) {
      throw new AppError('No se pudo obtener el ID de usuario', 401);
    }

    // Datos para la solicitud de socio
    const { 
      documento_identidad, 
      documento_domicilio 
    } = req.body;

    // Validar que se proporcionen documentos
    if (!documento_identidad || !documento_domicilio) {
      throw new AppError('Debe proporcionar documentos de identidad y domicilio', 400);
    }

    // Verificar si ya existe una solicitud pendiente
    const [existingSolicitud] = await pool.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM Socios WHERE id_usuario = ? AND estado_solicitud = "pendiente"', 
      [usuarioId]
    );

    if (existingSolicitud.length > 0) {
      throw new AppError('Ya tienes una solicitud de socio pendiente', 400);
    }

    // Insertar nueva solicitud de socio
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO Socios 
      (id_usuario, fecha_solicitud, estado_solicitud, documento_identidad, documento_domicilio) 
      VALUES (?, NOW(), "pendiente", ?, ?)`,
      [usuarioId, documento_identidad, documento_domicilio]
    );

    res.status(201).json({ 
      mensaje: 'Solicitud de membresía enviada exitosamente',
      datos: {
        usuarioId,
        solicitudId: result.insertId,
        fecha_solicitud: new Date()
      }
    });

  } catch (error) {
    next(error);
  }
};

// Función para validar solicitud de socio (solo para directiva)
export const validateSocioRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar que el usuario sea de tipo directiva
    if (req.user?.tipo_usuario !== 'directiva') {
      throw new AppError('No autorizado', 403);
    }

    const { 
      solicitudId, 
      estado, 
      motivoRechazo 
    } = req.body;

    // Validar que se proporcione un estado
    if (!estado || !['aprobada', 'rechazada'].includes(estado)) {
      throw new AppError('Estado inválido', 400);
    }

    // Si es rechazada, verificar que se proporcione un motivo
    if (estado === 'rechazada' && !motivoRechazo) {
      throw new AppError('Debe proporcionar un motivo de rechazo', 400);
    }

    // Actualizar estado de la solicitud
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `UPDATE Socios 
       SET estado_solicitud = ?, 
           fecha_aprobacion = ${estado === 'aprobada' ? 'NOW()' : 'NULL'},
           motivo_rechazo = ? 
       WHERE id_socio = ?`,
      [estado, estado === 'rechazada' ? motivoRechazo : null, solicitudId]
    );

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      throw new AppError('Solicitud no encontrada', 404);
    }

    res.status(200).json({ 
      mensaje: `Solicitud ${estado} exitosamente`,
      datos: {
        solicitudId,
        estado,
        fechaActualizacion: new Date()
      }
    });

  } catch (error) {
    next(error);
  }
};