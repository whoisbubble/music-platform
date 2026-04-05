import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  // Создаем наши данные прямо тут (позже заменим на запрос к базе данных Prisma)
  private readonly mockAlbums = [
    { id: 1, title: 'Master of Nuggets', artist: 'Metallica', cover: 'https://images.unsplash.com/photo-1620853755452-19e4879d71c8?q=80&w=300&auto=format&fit=crop' },
    { id: 2, title: 'Discovery', artist: 'Daft Punk', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop' },
    { id: 3, title: 'After Hours', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop' },
    { id: 4, title: 'Nevermind', artist: 'Nirvana', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop' },
  ];

  // Метод, который отдает альбомы
  getAlbums() {
    return this.mockAlbums;
  }
}
