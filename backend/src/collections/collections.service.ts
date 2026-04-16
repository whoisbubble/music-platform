import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { mapAlbumSummary, mapSongSummary } from '../music.utils';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCollection(userId: number) {
    const collection = await this.getOrCreateCollection(userId);

    const hydratedCollection = await this.prisma.collections.findUniqueOrThrow({
      where: { id: collection.id },
      include: {
        collection_albums: {
          include: {
            albums: {
              include: {
                asa_music: {
                  include: {
                    artists: true,
                    songs: true,
                  },
                },
              },
            },
          },
          orderBy: {
            added_at: 'desc',
          },
        },
        collection_songs: {
          include: {
            songs: {
              include: {
                asa_music: {
                  include: {
                    artists: true,
                    albums: true,
                  },
                },
              },
            },
          },
          orderBy: {
            added_at: 'desc',
          },
        },
      },
    });

    return {
      id: hydratedCollection.id,
      title: hydratedCollection.title,
      albums: hydratedCollection.collection_albums.map((item) => ({
        addedAt: item.added_at ?? null,
        ...mapAlbumSummary(item.albums),
      })),
      songs: hydratedCollection.collection_songs.map((item) => ({
        addedAt: item.added_at ?? null,
        ...mapSongSummary(item.songs),
      })),
    };
  }

  async getCollectionState(userId: number) {
    const collection = await this.getOrCreateCollection(userId);

    const state = await this.prisma.collections.findUniqueOrThrow({
      where: { id: collection.id },
      include: {
        collection_albums: true,
        collection_songs: true,
      },
    });

    return {
      albumIds: state.collection_albums.map((item) => item.album_id),
      songIds: state.collection_songs.map((item) => item.song_id),
    };
  }

  async addAlbum(userId: number, albumId: number) {
    const collection = await this.getOrCreateCollection(userId);
    await this.ensureAlbumExists(albumId);

    await this.prisma.collection_albums.upsert({
      where: {
        collection_id_album_id: {
          collection_id: collection.id,
          album_id: albumId,
        },
      },
      update: {
        added_at: new Date(),
      },
      create: {
        collection_id: collection.id,
        album_id: albumId,
      },
    });

    return { saved: true };
  }

  async removeAlbum(userId: number, albumId: number) {
    const collection = await this.getOrCreateCollection(userId);

    await this.prisma.collection_albums.deleteMany({
      where: {
        collection_id: collection.id,
        album_id: albumId,
      },
    });

    return { saved: false };
  }

  async addSong(userId: number, songId: number) {
    const collection = await this.getOrCreateCollection(userId);
    await this.ensureSongExists(songId);

    await this.prisma.collection_songs.upsert({
      where: {
        collection_id_song_id: {
          collection_id: collection.id,
          song_id: songId,
        },
      },
      update: {
        added_at: new Date(),
      },
      create: {
        collection_id: collection.id,
        song_id: songId,
      },
    });

    return { saved: true };
  }

  async removeSong(userId: number, songId: number) {
    const collection = await this.getOrCreateCollection(userId);

    await this.prisma.collection_songs.deleteMany({
      where: {
        collection_id: collection.id,
        song_id: songId,
      },
    });

    return { saved: false };
  }

  private async getOrCreateCollection(userId: number) {
    const existing = await this.prisma.collections.findFirst({
      where: { user_id: userId },
      orderBy: { id: 'asc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.collections.create({
      data: {
        user_id: userId,
        title: 'My Collection',
      },
    });
  }

  private async ensureAlbumExists(albumId: number) {
    const album = await this.prisma.albums.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      throw new NotFoundException('Альбом не найден');
    }
  }

  private async ensureSongExists(songId: number) {
    const song = await this.prisma.songs.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new NotFoundException('Трек не найден');
    }
  }
}
