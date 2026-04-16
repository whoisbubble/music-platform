"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { CollectionToggleButton } from "@/components/CollectionToggleButton";
import { apiFetch } from "@/lib/api";
import type { AlbumSummary } from "@/types";

export default function HomePage() {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await apiFetch<AlbumSummary[]>("/albums");
        setAlbums(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Не удалось загрузить альбомы");
      } finally {
        setLoading(false);
      }
    };

    void fetchAlbums();
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(4,4,16,.28)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-violet-200/60">
              BOSTONCOLLECT
            </div>
            <h1 className="safe-text max-w-3xl text-4xl font-bold leading-tight text-white md:text-5xl">
              Музыкальный каталог, личная коллекция и общий чат.
            </h1>
            <p className="safe-text mt-4 max-w-2xl text-base leading-7 text-violet-100/65">
              Ищите альбомы и треки, сохраняйте любимые релизы и открывайте ссылки на прослушивание.
            </p>
          </div>

          <div className="min-w-0 space-y-4">
            <SearchBar />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-violet-100/55">Альбомы</div>
                <div className="mt-2 text-3xl font-bold text-white">{albums.length}</div>
              </div>
              <Link
                href="/search"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-violet-500/15 p-4 text-sm font-semibold text-white transition hover:bg-violet-500/25"
              >
                Поиск
                <Search className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.28em] text-violet-200/55">catalog</div>
            <h2 className="safe-text mt-2 text-3xl font-bold text-white">Альбомы</h2>
          </div>
          <Link
            href="/search"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:border-violet-300/20 hover:bg-violet-500/10"
          >
            Открыть поиск
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
            Загружаем каталог...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 px-6 py-6 text-red-200">
            {error}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {albums.map((album) => (
              <article
                key={album.id}
                className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-violet-300/20 hover:bg-white/8"
              >
                <Link href={`/album/${album.id}`} className="block overflow-hidden rounded-[1.15rem]">
                  <img
                    src={album.coverUrl || "https://placehold.co/600x600/1a1228/ffffff?text=BOSTONCOLLECT"}
                    alt={album.title}
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/album/${album.id}`} className="safe-text clamp-2 block text-lg font-bold text-white">
                      {album.title}
                    </Link>
                    <p className="safe-text mt-2 text-sm text-violet-100/62">
                      {album.artists.map((artist) => artist.nickname).join(", ") || "Без артиста"}
                    </p>
                    <p className="safe-text mt-2 text-xs uppercase tracking-[0.18em] text-violet-200/45">
                      {album.trackCount} tracks{album.genre ? ` • ${album.genre}` : ""}
                    </p>
                  </div>
                  <CollectionToggleButton itemType="album" itemId={album.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
