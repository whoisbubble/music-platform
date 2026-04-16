import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { mapAlbumSummary, mapSongSummary } from '../music.utils';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, includeBanned: boolean) {
    if (!query) {
      return { albums: [], songs: [] };
    }

    const [albums, songs] = await Promise.all([
      this.prisma.albums.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              asa_music: {
                some: {
                  artists: {
                    nickname: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          asa_music: {
            include: {
              artists: true,
              songs: true,
            },
          },
        },
      }),
      this.prisma.songs.findMany({
        where: {
          AND: [
            includeBanned ? {} : { is_banned: false },
            {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  asa_music: {
                    some: {
                      artists: {
                        nickname: {
                          contains: query,
                          mode: 'insensitive',
                        },
                      },
                    },
                  },
                },
                {
                  asa_music: {
                    some: {
                      albums: {
                        title: {
                          contains: query,
                          mode: 'insensitive',
                        },
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          asa_music: {
            include: {
              artists: true,
              albums: true,
            },
          },
        },
      }),
    ]);

    return {
      albums: albums.map(mapAlbumSummary),
      songs: songs.map(mapSongSummary),
    };
  }
}
