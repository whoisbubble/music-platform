// backend/src/auth/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // <-- 1. Импортируем нашего охранника

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // === 2. НОВЫЙ ЗАЩИЩЕННЫЙ МАРШРУТ ДЛЯ ТЕСТА ===
  @UseGuards(JwtAuthGuard) // <-- ВЕШАЕМ ЗАМОК!
  @Get('me')
  getProfile(@Request() req) {
    // Сюда попадут только те, кто прошел проверку JwtAuthGuard.
    return {
      message: 'Доступ разрешен!',
      user: req.user // Отправляем обратно данные, которые охранник достал из токена
    };
  }
}