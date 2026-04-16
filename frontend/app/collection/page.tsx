"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CollectionToggleButton } from "@/components/CollectionToggleButton";
import { authApiFetch } from "@/lib/api";
import { useCollectionStore } from "@/store/useCollectionStore";
import type { CollectionData } from "@/types";

export default function CollectionPage() {
  const { albumIds, songIds, isLoaded } = useCollectionStore();
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await authApiFetch<CollectionData>("/collections/me");
        setCollection(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Не удалось загрузить коллекцию");
      } finally {
        setLoading(false);
      }
    };

    void fetchCollection();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
        Загружаем коллекцию...
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 px-6 py-6 text-red-200">
        {error || "Коллекция не найдена"}
      </div>
    );
  }

  const visibleAlbums = isLoaded
    ? collection.albums.filter((album) => albumIds.includes(album.id))
    : collection.albums;
  const visibleSongs = isLoaded
    ? collection.songs.filter((song) => songIds.includes(song.id))
    : collection.songs;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-violet-200/55">private collection</div>
        <h1 className="safe-text mt-3 text-4xl font-bold text-white md:text-5xl">{collection.title}</h1>
        <p className="safe-text mt-3 max-w-2xl text-base leading-7 text-violet-100/65">
          Здесь собраны альбомы и треки, которые вы сохранили по всему сайту.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-5">
            <div className="text-violet-200/58">Сохранённые альбомы</div>
            <div className="mt-3 text-4xl font-bold text-white">{visibleAlbums.length}</div>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-5">
            <div className="text-violet-200/58">Сохранённые треки</div>
            <div className="mt-3 text-4xl font-bold text-white">{visibleSongs.length}</div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Альбомы</h2>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200/55">
            {visibleAlbums.length}
          </span>
        </div>

        {visibleAlbums.length === 0 ? (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 px-6 py-12 text-center text-violet-100/62">
            Пока нет сохранённых альбомов.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleAlbums.map((album) => (
              <article key={album.id} className="rounded-[1.7rem] border border-white/10 bg-white/5 p-4">
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
                  </div>
                  <CollectionToggleButton itemType="album" itemId={album.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Треки</h2>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200/55">
            {visibleSongs.length}
          </span>
        </div>

        {visibleSongs.length === 0 ? (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 px-6 py-12 text-center text-violet-100/62">
            Пока нет сохранённых треков.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleSongs.map((song) => (
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
                  <h3 className="track-title safe-text text-lg font-semibold text-white transition">
                    {song.title}
                  </h3>
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
        )}
      </section>
    </div>
  );
}
