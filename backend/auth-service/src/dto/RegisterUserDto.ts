// Archivo: src/dto/RegisterUserDto.ts

/**
* DTO (Data Transfer Object) para el registro de usuarios en VecindApp
* 
* Propósito:
* - Validar los datos de entrada para el registro de un nuevo usuario
* - Aplicar reglas de negocio y validación antes de procesar el registro
* 
* Características principales:
* - Validaciones de formato y longitud para cada campo
* - Reglas de seguridad para contraseñas
* - Asegura que la información del usuario cumpla con los requisitos del sistema
*/
import { IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';

export class RegisterUserDto {
 // Constructor para inicializar todas las propiedades del DTO
 // Permite crear una instancia del DTO con todos los datos necesarios
 constructor(
   rut: string,
   nombre: string,
   apellido_paterno: string,
   correo_electronico: string,
   password: string,
   telefono: string,
   direccion: string
 ) {
   this.rut = rut;
   this.nombre = nombre;
   this.apellido_paterno = apellido_paterno;
   this.correo_electronico = correo_electronico;
   this.password = password;
   this.telefono = telefono;
   this.direccion = direccion;
 }

 // Validación de RUT:
 // - Obligatorio
 // - Debe cumplir con formato de RUT chileno (8 dígitos + guión + dígito verificador)
 @IsNotEmpty({ message: 'El RUT es obligatorio' })
 @Matches(/^\d{7,8}-[0-9K]$/, { message: 'Formato de RUT inválido' })
 rut: string;

 // Validación de nombre:
 // - Obligatorio
 // - Entre 2 y 50 caracteres
 @IsNotEmpty({ message: 'El nombre es obligatorio' })
 @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
 nombre: string;

 // Validación de apellido paterno:
 // - Obligatorio
 // - Entre 2 y 50 caracteres
 @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
 @Length(2, 50, { message: 'El apellido paterno debe tener entre 2 y 50 caracteres' })
 apellido_paterno: string;

 // Validación de correo electrónico:
 // - Debe tener formato de email válido
 @IsEmail({}, { message: 'Formato de correo electrónico inválido' })
 correo_electronico: string;

 // Validación de contraseña:
 // - Entre 8 y 20 caracteres
 // - Debe contener:
 //   * Al menos una mayúscula
 //   * Al menos una minúscula
 //   * Al menos un número
 //   * Al menos un carácter especial
 @Length(8, 20, { message: 'La contraseña debe tener entre 8 y 20 caracteres' })
 @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
   message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
 })
 password: string;

 // Validación de teléfono:
 // - Obligatorio
 // - Formato de número chileno (9 dígitos, puede incluir código de país)
 @IsNotEmpty({ message: 'El teléfono es obligatorio' })
 @Matches(/^\+?569\d{8}$/, { message: 'Formato de teléfono inválido. Debe ser un número chileno.' })
 telefono: string;

 // Validación de dirección:
 // - Obligatoria
 // - Entre 5 y 100 caracteres
 @IsNotEmpty({ message: 'La dirección es obligatoria' })
 @Length(5, 100, { message: 'La dirección debe tener entre 5 y 100 caracteres' })
 direccion: string;
}