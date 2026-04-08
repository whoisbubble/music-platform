// backend/src/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // <-- ВЕРНУЛИ КАК БЫЛО
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Этот метод сработает автоматически при старте сервера NestJS

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

  }



  async onModuleInit() {
    await this.$connect(); // Подключаемся к твоему PostgreSQL
    console.log('Успешное подключение к базе данных!');
  }
}