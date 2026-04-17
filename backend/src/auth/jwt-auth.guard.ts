import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUser } from './interfaces/auth-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Вы не авторизованы');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY',
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException('Токен недействителен или истек');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .reduce<Record<string, string>>((acc, chunk) => {
        const [key, ...valueParts] = chunk.split('=');
        acc[key] = valueParts.join('=');
        return acc;
      }, {});

    return cookies.music_platform_token || cookies.token;
  }
}
