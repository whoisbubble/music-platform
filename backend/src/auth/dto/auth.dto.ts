// backend/src/auth/dto/auth.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Имя должно быть не короче 3 символов' })
  @MaxLength(30, { message: 'Имя не может быть длиннее 30 символов' })
  username!: string;

  @IsEmail({}, { message: 'Некорректный email адрес' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(50, { message: 'Пароль слишком длинный' })
  password!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email!: string;

  @IsString()
  password!: string;
}