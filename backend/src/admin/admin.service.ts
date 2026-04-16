import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { mapAlbumDetail, mapAlbumSummary, mapArtist, mapSongSummary } from '../music.utils';
import { ArtistDto } from './dto/artist.dto';
import { SongDto } from './dto/song.dto';
import { AlbumDto } from './dto/album.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtists() {
    const artists = await this.prisma.artists.findMany({
      orderBy: {
        nickname: 'asc',
      },
    });

    return artists.map(mapArtist);
  }

  async createArtist(dto: ArtistDto) {
    const artist = await this.prisma.artists.create({
      data: {
        nickname: dto.nickname.trim(),
        full_name: dto.fullName?.trim() || null,
        main_genre: dto.mainGenre?.trim() || null,
        image_url: dto.imageUrl?.trim() || null,
      },
    });

    return mapArtist(artist);
  }

  async updateArtist(id: number, dto: ArtistDto) {
    await this.ensureArtistExists(id);

    const artist = await this.prisma.artists.update({
      where: { id },
      data: {
        nickname: dto.nickname.trim(),
        full_name: dto.fullName?.trim() || null,
        main_genre: dto.mainGenre?.trim() || null,
        image_url: dto.imageUrl?.trim() || null,
      },
    });

    return mapArtist(artist);
  }

  async deleteArtist(id: number) {
    await this.ensureArtistExists(id);
    await this.prisma.artists.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async getSongs() {
    const songs = await this.prisma.songs.findMany({
      include: {
        asa_music: {
          include: {
            artists: true,
            albums: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return songs.map(mapSongSummary);
  }

  async createSong(dto: SongDto) {
    const song = await this.prisma.songs.create({
      data: {
        title: dto.title.trim(),
        genre: dto.genre?.trim() || null,
        audio_link: dto.audioLink?.trim() || null,
        creation_date: dto.creationDate ? new Date(dto.creationDate) : null,
        is_banned: dto.isBanned ?? false,
      },
      include: {
        asa_music: {
          include: {
            artists: true,
            albums: true,
          },
        },
      },
    });

    return mapSongSummary(song);
  }

  async updateSong(id: number, dto: SongDto) {
    await this.ensureSongExists(id);

    const song = await this.prisma.songs.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        genre: dto.genre?.trim() || null,
        audio_link: dto.audioLink?.trim() || null,
        creation_date: dto.creationDate ? new Date(dto.creationDate) : null,
        is_banned: dto.isBanned ?? false,
      },
      include: {
        asa_music: {
          include: {
            artists: true,
            albums: true,
          },
        },
      },
    });

    return mapSongSummary(song);
  }

  async deleteSong(id: number) {
    await this.ensureSongExists(id);
    await this.prisma.songs.delete({
      where: { id },
    });

    return { deleted: true };
  }

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

  async getAlbum(id: number) {
    const album = await this.prisma.albums.findUnique({
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

    if (!album) {
      throw new NotFoundException('Альбом не найден');
    }

    return mapAlbumDetail(album);
  }

  async createAlbum(dto: AlbumDto) {
    await this.validateTrackReferences(dto);
    const distributionId = await this.resolveDistributionId(dto.distributionName);

    const album = await this.prisma.$transaction(async (tx) => {
      const createdAlbum = await tx.albums.create({
        data: {
          title: dto.title.trim(),
          genre: dto.genre?.trim() || null,
          release_date: dto.releaseDate ? new Date(dto.releaseDate) : null,
          cover_url: dto.coverUrl?.trim() || null,
          distribution_id: distributionId,
        },
      });

      if (dto.tracks.length > 0) {
        await tx.asa_music.createMany({
          data: dto.tracks.flatMap((track) =>
            [...new Set(track.artistIds)].map((artistId) => ({
              album_id: createdAlbum.id,
              song_id: track.songId,
              artist_id: artistId,
              track_number: track.trackNumber,
            })),
          ),
        });
      }

      return tx.albums.findUniqueOrThrow({
        where: { id: createdAlbum.id },
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
    });

    return mapAlbumDetail(album);
  }

  async updateAlbum(id: number, dto: AlbumDto) {
    await this.ensureAlbumExists(id);
    await this.validateTrackReferences(dto);
    const distributionId = await this.resolveDistributionId(dto.distributionName);

    const album = await this.prisma.$transaction(async (tx) => {
      await tx.albums.update({
        where: { id },
        data: {
          title: dto.title.trim(),
          genre: dto.genre?.trim() || null,
          release_date: dto.releaseDate ? new Date(dto.releaseDate) : null,
          cover_url: dto.coverUrl?.trim() || null,
          distribution_id: distributionId,
        },
      });

      await tx.asa_music.deleteMany({
        where: { album_id: id },
      });

      if (dto.tracks.length > 0) {
        await tx.asa_music.createMany({
          data: dto.tracks.flatMap((track) =>
            [...new Set(track.artistIds)].map((artistId) => ({
              album_id: id,
              song_id: track.songId,
              artist_id: artistId,
              track_number: track.trackNumber,
            })),
          ),
        });
      }

      return tx.albums.findUniqueOrThrow({
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
    });

    return mapAlbumDetail(album);
  }

  async deleteAlbum(id: number) {
    await this.ensureAlbumExists(id);
    await this.prisma.albums.delete({
      where: { id },
    });

    return { deleted: true };
  }

  private async resolveDistributionId(distributionName?: string) {
    const normalizedName = distributionName?.trim();
    if (!normalizedName) {
      return null;
    }

    const distribution = await this.prisma.distributions.upsert({
      where: { name: normalizedName },
      update: {},
      create: { name: normalizedName },
    });

    return distribution.id;
  }

  private async validateTrackReferences(dto: AlbumDto) {
    const songIds = [...new Set(dto.tracks.map((track) => track.songId))];
    const artistIds = [...new Set(dto.tracks.flatMap((track) => track.artistIds))];

    const [songs, artists] = await Promise.all([
      this.prisma.songs.findMany({
        where: { id: { in: songIds } },
        select: { id: true },
      }),
      this.prisma.artists.findMany({
        where: { id: { in: artistIds } },
        select: { id: true },
      }),
    ]);

    if (songs.length !== songIds.length) {
      throw new BadRequestException('Один или несколько треков не найдены');
    }

    if (artists.length !== artistIds.length) {
      throw new BadRequestException('Один или несколько артистов не найдены');
    }

    const duplicatedTrackNumbers = dto.tracks
      .map((track) => track.trackNumber)
      .filter((trackNumber, index, numbers) => numbers.indexOf(trackNumber) !== index);

    if (duplicatedTrackNumbers.length > 0) {
      throw new BadRequestException('Порядковые номера треков в альбоме должны быть уникальными');
    }
  }

  private async ensureArtistExists(id: number) {
    const artist = await this.prisma.artists.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Артист не найден');
    }
  }

  private async ensureSongExists(id: number) {
    const song = await this.prisma.songs.findUnique({
      where: { id },
    });

    if (!song) {
      throw new NotFoundException('Трек не найден');
    }
  }

  private async ensureAlbumExists(id: number) {
    const album = await this.prisma.albums.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('Альбом не найден');
    }
  }
}
