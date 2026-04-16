"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { CollectionToggleButton } from "@/components/CollectionToggleButton";
import { apiFetch } from "@/lib/api";
import type { AlbumDetail } from "@/types";

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await apiFetch<AlbumDetail>(`/albums/${params.id}`);
        setAlbum(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Не удалось загрузить альбом");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      void fetchAlbum();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
        Загружаем альбом...
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 px-6 py-6 text-red-200">
        {error || "Альбом не найден"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:border-violet-300/20 hover:bg-violet-500/10"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Link>

      <section className="ambient-border overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))] p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-end">
          <img
            src={album.coverUrl || "https://placehold.co/600x600/1a1228/ffffff?text=Album"}
            alt={album.title}
            className="aspect-square w-full rounded-[1.6rem] object-cover shadow-[0_24px_60px_rgba(4,4,15,.35)]"
          />

          <div className="min-w-0">
            <div className="mb-3 text-xs uppercase tracking-[0.3em] text-violet-200/55">album page</div>
            <h1 className="safe-text text-4xl font-bold text-white md:text-6xl">{album.title}</h1>
            <p className="safe-text mt-4 max-w-2xl text-base leading-7 text-violet-100/68">
              {album.artists.map((artist) => artist.nickname).join(", ") || "Без артиста"}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-violet-100/62">
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
                {album.tracks.length} треков
              </span>
              {album.releaseDate && (
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
                  {new Date(album.releaseDate).getFullYear()}
                </span>
              )}
              {album.distribution && (
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
                  {album.distribution.name}
                </span>
              )}
              {album.genre && (
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2">
                  {album.genre}
                </span>
              )}
            </div>

            <CollectionToggleButton itemType="album" itemId={album.id} className="mt-6" />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="safe-text text-2xl font-bold text-white">Треки альбома</h2>
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-200/55">
            {album.tracks.length}
          </span>
        </div>

        <div className="space-y-3">
          {album.tracks.map((track) => (
            <div
              key={track.id}
              className="track-row flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-black/15 p-4 transition hover:border-violet-300/20 hover:bg-white/7 md:flex-row md:items-center md:justify-between"
            >
              <a
                href={track.audioLink || undefined}
                target={track.audioLink ? "_blank" : undefined}
                rel={track.audioLink ? "noreferrer" : undefined}
                className="block min-w-0 flex-1"
                onClick={(event) => {
                  if (!track.audioLink) {
                    event.preventDefault();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/18 text-sm font-semibold text-violet-100">
                    {track.trackNumber ?? "?"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="track-title safe-text text-lg font-semibold text-white transition">
                        {track.title}
                      </h3>
                      {track.isBanned && (
                        <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-red-200">
                          banned
                        </span>
                      )}
                    </div>

                    <p className="safe-text mt-1 text-sm text-violet-100/62">
                      {track.artists.map((artist) => artist.nickname).join(", ") || "Без артиста"}
                    </p>
                  </div>
                </div>
              </a>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {track.audioLink && (
                  <a
                    href={track.audioLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/72 transition hover:border-violet-300/20 hover:bg-violet-500/10"
                  >
                    Слушать
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <CollectionToggleButton itemType="song" itemId={track.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
