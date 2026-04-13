// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // --- РЕГИСТРАЦИЯ ---
  async register(dto: RegisterDto) {
    // 1. Проверяем, нет ли уже такого email в базе
    const existingUser = await this.prisma.app_users.findFirst({
      where: { email: dto.email }
    });
    if (existingUser) throw new BadRequestException('Пользователь с таким email уже существует');

    // 2. Хэшируем пароль (перемешиваем его 10 раз)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Сохраняем в таблицу app_users
    const user = await this.prisma.app_users.create({
      data: {
        username: dto.username,
        email: dto.email,
        password_hash: hashedPassword, // Кладем зашифрованную кашу
      }
    });

    // 4. Сразу выдаем токен, чтобы юзеру не пришлось логиниться после реги
    return this.generateToken(user.id, user.email);
  }

  // --- ЛОГИН ---
  async login(dto: LoginDto) {
    // 1. Ищем юзера по email
    const user = await this.prisma.app_users.findFirst({
      where: { email: dto.email }
    });
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    // 2. Сравниваем введенный пароль с хэшем из базы
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) throw new UnauthorizedException('Неверный email или пароль');


    // === НОВОЕ: ЗАПИСЬ В АУДИТ ===
    await this.prisma.audit_logins.create({
      data: {
        user_id: user.id,
        login_time: new Date(), // Фиксируем точное время входа
      }
    });
    // ==============================


    // 3. Выдаем токен (в следующей итерации добавим сюда запись в аудит!)
    return this.generateToken(user.id, user.email);
  }

  // Вспомогательная функция для сборки токена
  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email }; // sub - это стандартное поле для ID юзера в JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}