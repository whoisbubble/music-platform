import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { mapAlbumDetail, mapAlbumSummary } from '../music.utils';

@Injectable()
export class AlbumsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlbums() {
    const albums = await this.prisma.albums.findMany({
      include: {
        asa_music: {
          include: {
            artists: true,
            songs: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return albums.map(mapAlbumSummary);
  }

  async getAlbumById(id: number) {
    const album = await this.prisma.albums.findUniqueOrThrow({
      where: { id },
      include: {
        asa_music: {
          include: {
            artists: true,
            songs: true,
          },
        },
        distributions: true,
      },
    });

    return mapAlbumDetail(album);
  }
}
