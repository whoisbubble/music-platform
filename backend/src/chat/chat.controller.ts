import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  getMessages() {
    return this.chatService.getMessages();
  }

  @Post('messages')
  createMessage(@CurrentUser() user: AuthUser, @Body() dto: CreateMessageDto) {
    return this.chatService.createMessage(user, dto.message);
  }

  @Delete('messages/:id')
  deleteMessage(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteMessage(user, id);
  }
}
