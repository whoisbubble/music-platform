// backend/src/auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // Ищем токен в заголовках запроса
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Вы не авторизованы (нет токена)');
        }

        try {
            // Пытаемся расшифровать и ПРОВЕРИТЬ ПОДПИСЬ токена
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
            });

            // Если подпись верная, прикрепляем данные юзера к запросу
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException('Токен недействителен или подделан!');
        }
        return true; // Пропускаем!
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}