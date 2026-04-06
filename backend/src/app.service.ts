import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {

  constructor(private prisma: PrismaService) {}

  // Метод, который отдает альбомы
  async getAlbums() {
    return this.prisma.albums.findMany({
      include: {
        asa_music: {
          include: {
            artists: true
          }
        }
      }
    });
  }
}
