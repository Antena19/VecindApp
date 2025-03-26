// Archivo: src/dto/LoginDto.ts

/**
 * DTO (Data Transfer Object) para el inicio de sesión en VecindApp
 * 
 * Propósito:
 * - Validar los datos de entrada para el inicio de sesión
 * - Aplicar reglas de validación antes de procesar el login
 * 
 * Características principales:
 * - Validaciones de formato para RUT
 * - Asegura que la contraseña no esté vacía
 */
import { IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  // Constructor para inicializar las propiedades del DTO
  constructor(
    rut: string,
    password: string
  ) {
    this.rut = rut;
    this.password = password;
  }

  // Validación de RUT:
  // - Obligatorio
  // - Debe cumplir con formato de RUT chileno (8 dígitos + guión + dígito verificador)
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @Matches(/^\d{7,8}-[0-9K]$/, { message: 'Formato de RUT inválido' })
  rut: string;

  // Validación de contraseña:
  // - Obligatoria
  // - No se aplican restricciones de complejidad en el login
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}