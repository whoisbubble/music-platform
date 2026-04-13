// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service'; // <-- 1. ПРОВЕРЬ ЭТОТ ИМПОРТ (путь должен быть правильным)

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY', // Раз уж ты добавил .env, давай использовать его!
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService], // <-- 2. ПРОВЕРЬ, ЧТО PRISMA ЕСТЬ ЗДЕСЬ
})
export class AuthModule {}