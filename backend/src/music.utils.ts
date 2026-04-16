interface ArtistEntity {
  id: number;
  nickname: string;
  full_name?: string | null;
  main_genre?: string | null;
  image_url?: string | null;
}

interface SongEntity {
  id: number;
  title: string;
  genre?: string | null;
  audio_link?: string | null;
  creation_date?: Date | null;
  is_banned?: boolean | null;
}

interface AlbumEntity {
  id: number;
  title: string;
  genre?: string | null;
  release_date?: Date | null;
  cover_url?: string | null;
  distributions?: {
    id: number;
    name: string;
  } | null;
}

interface AsaLink {
  track_number?: number | null;
  artists?: ArtistEntity | null;
  songs?: SongEntity | null;
  albums?: AlbumEntity | null;
}

export function mapArtist(artist: ArtistEntity) {
  return {
    id: artist.id,
    nickname: artist.nickname,
    fullName: artist.full_name ?? null,
    mainGenre: artist.main_genre ?? null,
    imageUrl: artist.image_url ?? null,
  };
}

function uniqById<T extends { id: number }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export function mapArtistsFromAsa(asaMusic: AsaLink[]) {
  return uniqById(
    asaMusic
      .map((item) => item.artists)
      .filter((artist): artist is ArtistEntity => Boolean(artist)),
  ).map(mapArtist);
}

export function mapSongSummary(song: SongEntity & { asa_music?: AsaLink[] }) {
  const asaMusic = song.asa_music ?? [];
  const artists = mapArtistsFromAsa(asaMusic);
  const albums = uniqById(
    asaMusic
      .map((item) => item.albums)
      .filter((album): album is AlbumEntity => Boolean(album)),
  ).map((album) => ({
    id: album.id,
    title: album.title,
    coverUrl: album.cover_url ?? null,
  }));

  return {
    id: song.id,
    title: song.title,
    genre: song.genre ?? null,
    audioLink: song.audio_link ?? null,
    creationDate: song.creation_date ?? null,
    isBanned: song.is_banned ?? false,
    artists,
    albums,
  };
}

export function mapAlbumSummary(album: AlbumEntity & { asa_music: AsaLink[] }) {
  const tracks = uniqById(
    album.asa_music
      .map((item) => item.songs)
      .filter((song): song is SongEntity => Boolean(song)),
  );

  return {
    id: album.id,
    title: album.title,
    genre: album.genre ?? null,
    releaseDate: album.release_date ?? null,
    coverUrl: album.cover_url ?? null,
    artists: mapArtistsFromAsa(album.asa_music),
    trackCount: tracks.length,
  };
}

export function mapAlbumDetail(
  album: AlbumEntity & {
    asa_music: AsaLink[];
    distributions?: { id: number; name: string } | null;
  },
) {
  const trackMap = new Map<
    number,
    {
      id: number;
      title: string;
      genre: string | null;
      audioLink: string | null;
      creationDate: Date | null;
      isBanned: boolean;
      trackNumber: number | null;
      artists: ArtistEntity[];
    }
  >();

  for (const item of album.asa_music) {
    if (!item.songs) {
      continue;
    }

    if (!trackMap.has(item.songs.id)) {
      trackMap.set(item.songs.id, {
        id: item.songs.id,
        title: item.songs.title,
        genre: item.songs.genre ?? null,
        audioLink: item.songs.audio_link ?? null,
        creationDate: item.songs.creation_date ?? null,
        isBanned: item.songs.is_banned ?? false,
        trackNumber: item.track_number ?? null,
        artists: [],
      });
    }

    if (item.artists) {
      trackMap.get(item.songs.id)?.artists.push(item.artists);
    }
  }

  const tracks = Array.from(trackMap.values())
    .map((track) => ({
      ...track,
      artists: uniqById(track.artists).map(mapArtist),
    }))
    .sort((left, right) => {
      const leftTrack = left.trackNumber ?? Number.MAX_SAFE_INTEGER;
      const rightTrack = right.trackNumber ?? Number.MAX_SAFE_INTEGER;
      return leftTrack - rightTrack || left.id - right.id;
    });

  return {
    id: album.id,
    title: album.title,
    genre: album.genre ?? null,
    releaseDate: album.release_date ?? null,
    coverUrl: album.cover_url ?? null,
    distribution: album.distributions
      ? {
          id: album.distributions.id,
          name: album.distributions.name,
        }
      : null,
    artists: mapArtistsFromAsa(album.asa_music),
    tracks,
  };
}
