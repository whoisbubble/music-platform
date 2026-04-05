// backend/src/app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  // Этот блок запускается ПЕРЕД каждым тестом.
  // Он создает изолированную копию твоего модуля (песочницу).
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Метод getAllAlbums', () => {
    
    // Само описание теста (it should = он должен...)
    it('должен возвращать массив альбомов', () => {
      // 1. Вызываем наш метод
      const result = appController.getAllAlbums();
      
      // 2. Проверяем, что результат - это массив (Array)
      expect(Array.isArray(result)).toBe(true);
      
      // 3. Проверяем, что в массиве есть хотя бы один элемент
      expect(result.length).toBeGreaterThan(0);
      
      // 4. Проверяем, что у первого альбома есть нужное поле title
      expect(result[0].title).toBeDefined();
    });
    
  });
});