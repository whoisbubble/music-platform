import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages() {
    const messages = await this.prisma.chat_messages.findMany({
      include: {
        app_users: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return messages.map((message) => ({
      id: message.id,
      message: message.message,
      createdAt: message.created_at ?? null,
      user: message.app_users
        ? {
            id: message.app_users.id,
            username: message.app_users.username,
            email: message.app_users.email,
          }
        : null,
    }));
  }

  async createMessage(user: AuthUser, message: string) {
    const createdMessage = await this.prisma.chat_messages.create({
      data: {
        user_id: user.sub,
        message: message.trim(),
      },
      include: {
        app_users: true,
      },
    });

    return {
      id: createdMessage.id,
      message: createdMessage.message,
      createdAt: createdMessage.created_at ?? null,
      user: createdMessage.app_users
        ? {
            id: createdMessage.app_users.id,
            username: createdMessage.app_users.username,
            email: createdMessage.app_users.email,
          }
        : null,
    };
  }

  async deleteMessage(currentUser: AuthUser, messageId: number) {
    const message = await this.prisma.chat_messages.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    const canDelete = currentUser.roles.includes('admin') || message.user_id === currentUser.sub;
    if (!canDelete) {
      throw new ForbiddenException('Нельзя удалить чужое сообщение');
    }

    await this.prisma.chat_messages.delete({
      where: { id: messageId },
    });

    return { deleted: true };
  }
}
