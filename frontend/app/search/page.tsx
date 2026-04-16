"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { CollectionToggleButton } from "@/components/CollectionToggleButton";
import { apiFetch } from "@/lib/api";
import type { SearchResults } from "@/types";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const showBanned = searchParams.get("banned") === "true";

  const [results, setResults] = useState<SearchResults>({ albums: [], songs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults({ albums: [], songs: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiFetch<SearchResults>(
          `/search?q=${encodeURIComponent(query)}&banned=${showBanned}`,
        );
        setResults(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Не удалось выполнить поиск");
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [query, showBanned]);

  const toggleBanned = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("banned", String(checked));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 text-xs uppercase tracking-[0.3em] text-violet-200/55">search center</div>
            <h1 className="safe-text mb-4 text-3xl font-bold text-white">Поиск по реальному каталогу</h1>
            <SearchBar initialValue={query} />
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-violet-100/65">
            <input
              type="checkbox"
              checked={showBanned}
              onChange={(event) => toggleBanned(event.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Показывать скрытые треки
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-violet-200/55">albums</div>
            <div className="mt-3 text-3xl font-bold text-white">{results.albums.length}</div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-violet-200/55">tracks</div>
            <div className="mt-3 text-3xl font-bold text-white">{results.songs.length}</div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-violet-200/55">query</div>
            <div className="safe-text mt-3 text-lg font-semibold text-white">{query || "Введите запрос"}</div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
          Ищем совпадения...
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 px-6 py-6 text-red-200">
          {error}
        </div>
      ) : !query ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
          Введите запрос, чтобы найти треки и альбомы.
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Альбомы</h2>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200/55">
                {results.albums.length}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.albums.map((album) => (
                <article
                  key={album.id}
                  className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-4 shadow-[0_14px_45px_rgba(2,2,12,.28)]"
                >
                  <div className="mb-4 overflow-hidden rounded-[1.3rem]">
                    <img
                      src={album.coverUrl || "https://placehold.co/600x600/1a1228/ffffff?text=Album"}
                      alt={album.title}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/album/${album.id}`} className="safe-text block text-xl font-bold text-white">
                        {album.title}
                      </Link>
                      <p className="safe-text mt-2 text-sm text-violet-100/62">
                        {album.artists.map((artist) => artist.nickname).join(", ") || "Без артиста"}
                      </p>
                      <div className="safe-text mt-3 text-xs uppercase tracking-[0.24em] text-violet-200/45">
                        {album.trackCount} tracks
                        {album.genre ? ` • ${album.genre}` : ""}
                      </div>
                    </div>
                    <CollectionToggleButton itemType="album" itemId={album.id} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Треки</h2>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200/55">
                {results.songs.length}
              </span>
            </div>

            <div className="space-y-3">
              {results.songs.map((song) => (
                <div
                  key={song.id}
                  className="track-row flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-violet-300/20 hover:bg-white/8 md:flex-row md:items-center md:justify-between"
                >
                  <a
                    href={song.audioLink || undefined}
                    target={song.audioLink ? "_blank" : undefined}
                    rel={song.audioLink ? "noreferrer" : undefined}
                    className="block min-w-0 flex-1"
                    onClick={(event) => {
                      if (!song.audioLink) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="track-title safe-text text-lg font-semibold text-white transition">
                        {song.title}
                      </h3>
                      {song.isBanned && (
                        <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-red-200">
                          banned
                        </span>
                      )}
                    </div>
                    <p className="safe-text mt-2 text-sm text-violet-100/62">
                      {song.artists.map((artist) => artist.nickname).join(", ") || "Без артиста"}
                    </p>
                    {song.albums.length > 0 && (
                      <p className="safe-text mt-1 text-xs uppercase tracking-[0.24em] text-violet-200/45">
                        {song.albums.map((album) => album.title).join(", ")}
                      </p>
                    )}
                  </a>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {song.audioLink && (
                      <a
                        href={song.audioLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/72 transition hover:border-violet-300/20 hover:bg-violet-500/10"
                      >
                        Слушать
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <CollectionToggleButton itemType="song" itemId={song.id} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {results.albums.length === 0 && results.songs.length === 0 && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
              По запросу “{query}” ничего не найдено.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
          Загружаем поиск...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
