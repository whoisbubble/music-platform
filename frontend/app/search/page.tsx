// frontend/app/search/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { Album, Artist, Song, SearchResults } from '@/types';
import SearchBar from '@/components/SearchBar';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get('q') || '';
  const isBannedParam = searchParams.get('banned') === 'true';
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleBanned = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('banned', checked.toString());
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/search?q=${query}&banned=${isBannedParam}`);
        const data = await response.json();
        setResults(data);
      } catch (e) {
        console.error("Ошибка поиска:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, isBannedParam]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen text-white">
      
      {/* --- ШАПКА ПОИСКА И ФИЛЬТРЫ --- */}
      <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 mb-10 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full flex-1">
            <h1 className="text-sm font-semibold tracking-wider text-green-500 uppercase mb-3">Поиск по медиатеке</h1>
            <SearchBar />
            </div>
          
          {query && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-neutral-400 text-sm">Результаты для: <strong className="text-white">«{query}»</strong></span>
              <label className="flex items-center gap-3 text-neutral-400 cursor-pointer hover:text-white transition group bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-700 hover:border-neutral-500">
                <input 
                  type="checkbox" 
                  checked={isBannedParam}
                  onChange={(e) => toggleBanned(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                <span className="text-sm font-medium">Скрытые треки</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* --- ИНДИКАТОР ЗАГРУЗКИ --- */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="space-y-14">
          
          {/* --- АРТИСТЫ --- */}
          {results?.artists && results.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                Артисты
                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{results.artists.length}</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {results.artists.map(artist => (
                  <div key={artist.nickname} className="bg-gradient-to-br from-neutral-800 to-neutral-900 px-6 py-3 rounded-full border border-neutral-700/50 text-white font-medium shadow-md hover:scale-105 hover:border-green-500/50 transition-all cursor-pointer">
                    {artist.nickname}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- АЛЬБОМЫ --- */}
          {results?.albums && results.albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                Альбомы
                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{results.albums.length}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.albums.map((album) => (
                  <Link href={`/album/${album.id}`} key={album.id} className="group bg-neutral-900 p-4 rounded-xl hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-green-500/5 block">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-md">
                      <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-bold block truncate">{album.title}</span>
                    <span className="text-neutral-400 text-sm block truncate mt-1">Альбом</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* --- ТРЕКИ --- */}
          {results?.songs && results.songs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                Треки
                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{results.songs.length}</span>
              </h2>
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800/50 overflow-hidden">
                {results.songs.map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-4 border-b border-neutral-800/50 last:border-0 hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      {/* Иконка вместо скучной цифры */}
                      <svg className="w-5 h-5 text-neutral-500 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className={`font-medium ${song.is_banned ? "text-red-400 line-through opacity-70" : "text-white"}`}>
                        {song.title}
                      </span>
                    </div>
                    {song.is_banned && (
                      <span className="text-[10px] font-bold tracking-wider bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-full">
                        BANNED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- ПУСТОЙ РЕЗУЛЬТАТ --- */}
          {query && results && results.albums.length === 0 && results.songs.length === 0 && results.artists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/30 rounded-2xl border border-neutral-800 border-dashed">
              <svg className="w-16 h-16 text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 className="text-xl font-bold text-neutral-300 mb-2">Ничего не найдено</h3>
              <p className="text-neutral-500 max-w-md">По запросу «{query}» нет совпадений. Попробуйте изменить фильтры или ввести другое название.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-7xl mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}