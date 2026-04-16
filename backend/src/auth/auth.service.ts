import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthUser } from './interfaces/auth-user.interface';

type UserWithRoles = {
  id: number;
  email: string;
  username: string;
  app_user_roles: {
    app_roles: {
      name: string;
    };
  }[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.app_users.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email или username уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userRole = await this.prisma.app_roles.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new BadRequestException('Роль user не найдена в базе данных');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.app_users.create({
        data: {
          username: dto.username,
          email: dto.email,
          password_hash: hashedPassword,
        },
      });

      await tx.app_user_roles.create({
        data: {
          user_id: createdUser.id,
          role_id: userRole.id,
        },
      });

      await tx.collections.create({
        data: {
          user_id: createdUser.id,
          title: 'My Collection',
        },
      });

      return tx.app_users.findUniqueOrThrow({
        where: { id: createdUser.id },
        include: {
          app_user_roles: {
            include: {
              app_roles: true,
            },
          },
        },
      });
    });

    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.app_users.findFirst({
      where: { email: dto.email },
      include: {
        app_user_roles: {
          include: {
            app_roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    await this.prisma.audit_logins.create({
      data: {
        user_id: user.id,
        login_time: new Date(),
      },
    });

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.app_users.findUnique({
      where: { id: userId },
      include: {
        app_user_roles: {
          include: {
            app_roles: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return this.serializeUser(user);
  }

  private generateAuthResponse(user: UserWithRoles) {
    const serializedUser = this.serializeUser(user);
    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: serializedUser.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: serializedUser,
    };
  }

  private serializeUser(user: UserWithRoles) {
    const roles = user.app_user_roles.map((userRole) => userRole.app_roles.name);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roles,
      isAdmin: roles.includes('admin'),
    };
  }
}
