// frontend/types/index.ts

export interface Artist {
  id?: number; // Добавил id на всякий случай
  nickname: string;
}

export interface Song {
  id: number;
  title: string;
  is_banned?: boolean; // Тот самый задел под будущий фильтр!
}

export interface AsaMusic {
  artists: Artist;
  songs?: Song; // Сделал опциональным, т.к. на главной странице нам песни не нужны
}

export interface Album {
  id: number;
  title: string;
  cover_url: string;
  asa_music: AsaMusic[];
}

export interface SearchResults {
  albums: Album[];
  artists: Artist[];
  songs: Song[];
}