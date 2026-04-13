// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth') // Путь будет /api/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Путь: POST /api/auth/register
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login') // Путь: POST /api/auth/login
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}