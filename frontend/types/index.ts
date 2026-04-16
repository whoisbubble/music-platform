export interface Artist {
  id: number;
  nickname: string;
  fullName: string | null;
  mainGenre: string | null;
  imageUrl: string | null;
}

export interface SongAlbumRef {
  id: number;
  title: string;
  coverUrl: string | null;
}

export interface SongSummary {
  id: number;
  title: string;
  genre: string | null;
  audioLink: string | null;
  creationDate: string | null;
  isBanned: boolean;
  artists: Artist[];
  albums: SongAlbumRef[];
}

export interface AlbumSummary {
  id: number;
  title: string;
  genre: string | null;
  releaseDate: string | null;
  coverUrl: string | null;
  artists: Artist[];
  trackCount: number;
}

export interface AlbumTrack {
  id: number;
  title: string;
  genre: string | null;
  audioLink: string | null;
  creationDate: string | null;
  isBanned: boolean;
  trackNumber: number | null;
  artists: Artist[];
}

export interface AlbumDetail {
  id: number;
  title: string;
  genre: string | null;
  releaseDate: string | null;
  coverUrl: string | null;
  distribution: {
    id: number;
    name: string;
  } | null;
  artists: Artist[];
  tracks: AlbumTrack[];
}

export interface SearchResults {
  albums: AlbumSummary[];
  songs: SongSummary[];
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  roles: string[];
  isAdmin: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface CollectionState {
  albumIds: number[];
  songIds: number[];
}

export interface CollectionData {
  id: number;
  title: string;
  albums: Array<AlbumSummary & { addedAt: string | null }>;
  songs: Array<SongSummary & { addedAt: string | null }>;
}

export interface ChatMessage {
  id: number;
  message: string;
  createdAt: string | null;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
}
