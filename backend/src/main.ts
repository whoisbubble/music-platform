import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // безопасности штуковина

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ДОБАВЛЯЕМ ЭТУ СТРОЧКУ:
  app.setGlobalPrefix('api');

  // ГЛОБАЛЬНЫЙ ФЕЙСКОНТРОЛЬ (Защита от лишних данных)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // <-- МАГИЯ ЗДЕСЬ: автоматически удаляет любые поля из JSON, которых нет в DTO (например, если хакер пришлет is_admin: true)
    forbidNonWhitelisted: true, // <-- Если прислали лишнее, сразу выдает ошибку
  }));

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Бэкенд запущен на http://localhost:${process.env.PORT || 3001}`);
}
bootstrap();
