"use client";

import { useEffect, useMemo, useState } from "react";
import { Disc3, Music4, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { authApiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { AlbumDetail, AlbumSummary, Artist, SongSummary } from "@/types";

type AdminSection = "artists" | "songs" | "albums";

interface ArtistFormState {
  id: number | null;
  nickname: string;
  fullName: string;
  mainGenre: string;
  imageUrl: string;
}

interface SongFormState {
  id: number | null;
  title: string;
  genre: string;
  audioLink: string;
  creationDate: string;
  isBanned: boolean;
}

interface AlbumTrackFormState {
  songId: string;
  artistIds: string[];
  trackNumber: string;
}

interface AlbumFormState {
  id: number | null;
  title: string;
  genre: string;
  releaseDate: string;
  coverUrl: string;
  distributionName: string;
  tracks: AlbumTrackFormState[];
}

const emptyArtistForm: ArtistFormState = {
  id: null,
  nickname: "",
  fullName: "",
  mainGenre: "",
  imageUrl: "",
};

const emptySongForm: SongFormState = {
  id: null,
  title: "",
  genre: "",
  audioLink: "",
  creationDate: "",
  isBanned: false,
};

const emptyAlbumForm: AlbumFormState = {
  id: null,
  title: "",
  genre: "",
  releaseDate: "",
  coverUrl: "",
  distributionName: "",
  tracks: [{ songId: "", artistIds: [], trackNumber: "1" }],
};

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

export default function AdminPage() {
  const { user } = useAuthStore();

  const [activeSection, setActiveSection] = useState<AdminSection>("artists");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [artistForm, setArtistForm] = useState<ArtistFormState>(emptyArtistForm);
  const [songForm, setSongForm] = useState<SongFormState>(emptySongForm);
  const [albumForm, setAlbumForm] = useState<AlbumFormState>(emptyAlbumForm);
  const [artistQuery, setArtistQuery] = useState("");
  const [songQuery, setSongQuery] = useState("");
  const [albumQuery, setAlbumQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      const [artistsData, songsData, albumsData] = await Promise.all([
        authApiFetch<Artist[]>("/admin/artists"),
        authApiFetch<SongSummary[]>("/admin/songs"),
        authApiFetch<AlbumSummary[]>("/admin/albums"),
      ]);

      setArtists(artistsData);
      setSongs(songsData);
      setAlbums(albumsData);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить админку");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      void loadDashboard();
    } else {
      setLoading(false);
    }
  }, [user?.isAdmin]);

  const filteredArtists = useMemo(
    () =>
      artists.filter((artist) =>
        matchesQuery(
          `${artist.nickname} ${artist.fullName ?? ""} ${artist.mainGenre ?? ""}`,
          artistQuery,
        ),
      ),
    [artists, artistQuery],
  );

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) =>
        matchesQuery(
          `${song.title} ${song.genre ?? ""} ${song.artists.map((artist) => artist.nickname).join(" ")}`,
          songQuery,
        ),
      ),
    [songs, songQuery],
  );

  const filteredAlbums = useMemo(
    () =>
      albums.filter((album) =>
        matchesQuery(
          `${album.title} ${album.genre ?? ""} ${album.artists.map((artist) => artist.nickname).join(" ")}`,
          albumQuery,
        ),
      ),
    [albums, albumQuery],
  );

  const resetArtistForm = () => setArtistForm(emptyArtistForm);
  const resetSongForm = () => setSongForm(emptySongForm);
  const resetAlbumForm = () => setAlbumForm(emptyAlbumForm);

  const handleArtistSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving("artist");

    try {
      const path = artistForm.id ? `/admin/artists/${artistForm.id}` : "/admin/artists";
      const method = artistForm.id ? "PATCH" : "POST";
      await authApiFetch(path, {
        method,
        body: JSON.stringify({
          nickname: artistForm.nickname,
          fullName: artistForm.fullName,
          mainGenre: artistForm.mainGenre,
          imageUrl: artistForm.imageUrl,
        }),
      });
      resetArtistForm();
      await loadDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить артиста");
    } finally {
      setSaving(null);
    }
  };

  const handleSongSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving("song");

    try {
      const path = songForm.id ? `/admin/songs/${songForm.id}` : "/admin/songs";
      const method = songForm.id ? "PATCH" : "POST";
      await authApiFetch(path, {
        method,
        body: JSON.stringify({
          title: songForm.title,
          genre: songForm.genre,
          audioLink: songForm.audioLink,
          creationDate: songForm.creationDate || undefined,
          isBanned: songForm.isBanned,
        }),
      });
      resetSongForm();
      await loadDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить трек");
    } finally {
      setSaving(null);
    }
  };

  const handleAlbumSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving("album");

    try {
      const path = albumForm.id ? `/admin/albums/${albumForm.id}` : "/admin/albums";
      const method = albumForm.id ? "PATCH" : "POST";
      await authApiFetch(path, {
        method,
        body: JSON.stringify({
          title: albumForm.title,
          genre: albumForm.genre,
          releaseDate: albumForm.releaseDate || undefined,
          coverUrl: albumForm.coverUrl,
          distributionName: albumForm.distributionName,
          tracks: albumForm.tracks
            .filter((track) => track.songId && track.artistIds.length > 0)
            .map((track) => ({
              songId: Number(track.songId),
              artistIds: track.artistIds.map(Number),
              trackNumber: Number(track.trackNumber),
            })),
        }),
      });
      resetAlbumForm();
      await loadDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось сохранить альбом");
    } finally {
      setSaving(null);
    }
  };

  const editAlbum = async (id: number) => {
    try {
      const album = await authApiFetch<AlbumDetail>(`/admin/albums/${id}`);
      setAlbumForm({
        id: album.id,
        title: album.title,
        genre: album.genre ?? "",
        releaseDate: album.releaseDate ? album.releaseDate.slice(0, 10) : "",
        coverUrl: album.coverUrl ?? "",
        distributionName: album.distribution?.name ?? "",
        tracks: album.tracks.map((track) => ({
          songId: String(track.id),
          artistIds: track.artists.map((artist) => String(artist.id)),
          trackNumber: String(track.trackNumber ?? 1),
        })),
      });
      setActiveSection("albums");
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Не удалось открыть альбом");
    }
  };

  const deleteEntity = async (path: string, message: string) => {
    if (!window.confirm(message)) {
      return;
    }

    try {
      await authApiFetch(path, { method: "DELETE" });
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить запись");
    }
  };

  const updateAlbumTrack = (index: number, patch: Partial<AlbumTrackFormState>) => {
    setAlbumForm((current) => ({
      ...current,
      tracks: current.tracks.map((track, trackIndex) =>
        trackIndex === index ? { ...track, ...patch } : track,
      ),
    }));
  };

  const openArtistEdit = (artist: Artist) => {
    setArtistForm({
      id: artist.id,
      nickname: artist.nickname,
      fullName: artist.fullName ?? "",
      mainGenre: artist.mainGenre ?? "",
      imageUrl: artist.imageUrl ?? "",
    });
    setActiveSection("artists");
  };

  const openSongEdit = (song: SongSummary) => {
    setSongForm({
      id: song.id,
      title: song.title,
      genre: song.genre ?? "",
      audioLink: song.audioLink ?? "",
      creationDate: song.creationDate ? song.creationDate.slice(0, 10) : "",
      isBanned: song.isBanned,
    });
    setActiveSection("songs");
  };

  if (!user?.isAdmin) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-violet-200/70" />
        <h1 className="mt-5 text-3xl font-bold text-white">Доступ только для администратора</h1>
        <p className="mt-3 text-violet-100/62">
          Эта страница открывается только пользователям с ролью admin.
        </p>
      </div>
    );
  }

  const sections = [
    {
      id: "artists" as const,
      title: "Артисты",
      description: "Создание и редактирование исполнителей",
      count: artists.length,
      icon: UserRound,
    },
    {
      id: "songs" as const,
      title: "Треки",
      description: "Треки, ссылки на прослушивание и бан",
      count: songs.length,
      icon: Music4,
    },
    {
      id: "albums" as const,
      title: "Альбомы",
      description: "Состав альбома и порядок треков",
      count: albums.length,
      icon: Disc3,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-violet-200/55">admin workspace</div>
        <h1 className="safe-text mt-3 text-4xl font-bold text-white md:text-5xl">Управление каталогом</h1>
        <p className="safe-text mt-3 max-w-2xl text-base leading-7 text-violet-100/65">
          Открывайте нужный блок отдельно: так админка остаётся удобной даже когда данных станет много.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 text-center text-violet-100/62">
          Загружаем админские данные...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${
                    isActive
                      ? "border-violet-300/30 bg-violet-500/18"
                      : "border-white/10 bg-white/5 hover:border-violet-300/20 hover:bg-white/8"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-violet-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-bold text-white">
                      {section.count}
                    </span>
                  </div>
                  <h2 className="safe-text text-xl font-bold text-white">{section.title}</h2>
                  <p className="safe-text mt-2 text-sm leading-6 text-violet-100/62">{section.description}</p>
                </button>
              );
            })}
          </div>

          {activeSection === "artists" && (
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
              <SectionHeader
                icon={<UserRound className="h-5 w-5" />}
                title="Артисты"
                count={filteredArtists.length}
                query={artistQuery}
                onQueryChange={setArtistQuery}
              />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <form onSubmit={handleArtistSubmit} className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                  <FormTitle title={artistForm.id ? "Редактировать артиста" : "Добавить артиста"} />
                  <TextInput required placeholder="Nickname" value={artistForm.nickname} onChange={(value) => setArtistForm((current) => ({ ...current, nickname: value }))} />
                  <TextInput placeholder="Полное имя" value={artistForm.fullName} onChange={(value) => setArtistForm((current) => ({ ...current, fullName: value }))} />
                  <TextInput placeholder="Жанр" value={artistForm.mainGenre} onChange={(value) => setArtistForm((current) => ({ ...current, mainGenre: value }))} />
                  <TextInput placeholder="URL изображения" value={artistForm.imageUrl} onChange={(value) => setArtistForm((current) => ({ ...current, imageUrl: value }))} />
                  <FormActions saving={saving === "artist"} isEditing={Boolean(artistForm.id)} onCancel={resetArtistForm} />
                </form>

                <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
                  {filteredArtists.map((artist) => (
                    <AdminListItem key={artist.id} title={artist.nickname} subtitle={artist.fullName || artist.mainGenre || "Без описания"} onEdit={() => openArtistEdit(artist)} onDelete={() => void deleteEntity(`/admin/artists/${artist.id}`, "Удалить артиста?")} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === "songs" && (
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
              <SectionHeader
                icon={<Music4 className="h-5 w-5" />}
                title="Треки"
                count={filteredSongs.length}
                query={songQuery}
                onQueryChange={setSongQuery}
              />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <form onSubmit={handleSongSubmit} className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                  <FormTitle title={songForm.id ? "Редактировать трек" : "Добавить трек"} />
                  <TextInput required placeholder="Название трека" value={songForm.title} onChange={(value) => setSongForm((current) => ({ ...current, title: value }))} />
                  <TextInput placeholder="Жанр" value={songForm.genre} onChange={(value) => setSongForm((current) => ({ ...current, genre: value }))} />
                  <TextInput placeholder="Ссылка на прослушивание" value={songForm.audioLink} onChange={(value) => setSongForm((current) => ({ ...current, audioLink: value }))} />
                  <input
                    type="date"
                    value={songForm.creationDate}
                    onChange={(event) => setSongForm((current) => ({ ...current, creationDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  />
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-violet-100/65">
                    <input
                      type="checkbox"
                      checked={songForm.isBanned}
                      onChange={(event) => setSongForm((current) => ({ ...current, isBanned: event.target.checked }))}
                      className="h-4 w-4 accent-violet-500"
                    />
                    Скрыть трек в обычном поиске
                  </label>
                  <FormActions saving={saving === "song"} isEditing={Boolean(songForm.id)} onCancel={resetSongForm} />
                </form>

                <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
                  {filteredSongs.map((song) => (
                    <AdminListItem
                      key={song.id}
                      title={song.title}
                      subtitle={song.artists.map((artist) => artist.nickname).join(", ") || song.genre || "Без артиста"}
                      badge={song.isBanned ? "banned" : undefined}
                      onEdit={() => openSongEdit(song)}
                      onDelete={() => void deleteEntity(`/admin/songs/${song.id}`, "Удалить трек?")}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === "albums" && (
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 md:p-6">
              <SectionHeader
                icon={<Disc3 className="h-5 w-5" />}
                title="Альбомы"
                count={filteredAlbums.length}
                query={albumQuery}
                onQueryChange={setAlbumQuery}
              />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
                <form onSubmit={handleAlbumSubmit} className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                  <FormTitle title={albumForm.id ? "Редактировать альбом" : "Добавить альбом"} />
                  <TextInput required placeholder="Название альбома" value={albumForm.title} onChange={(value) => setAlbumForm((current) => ({ ...current, title: value }))} />
                  <TextInput placeholder="Жанр" value={albumForm.genre} onChange={(value) => setAlbumForm((current) => ({ ...current, genre: value }))} />
                  <input
                    type="date"
                    value={albumForm.releaseDate}
                    onChange={(event) => setAlbumForm((current) => ({ ...current, releaseDate: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  />
                  <TextInput placeholder="URL обложки" value={albumForm.coverUrl} onChange={(value) => setAlbumForm((current) => ({ ...current, coverUrl: value }))} />
                  <TextInput placeholder="Дистрибуция" value={albumForm.distributionName} onChange={(value) => setAlbumForm((current) => ({ ...current, distributionName: value }))} />

                  <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="safe-text text-sm font-semibold text-white">Треки альбома</div>
                      <button
                        type="button"
                        onClick={() =>
                          setAlbumForm((current) => ({
                            ...current,
                            tracks: [
                              ...current.tracks,
                              { songId: "", artistIds: [], trackNumber: String(current.tracks.length + 1) },
                            ],
                          }))
                        }
                        className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Добавить
                      </button>
                    </div>

                    {albumForm.tracks.map((track, index) => (
                      <div key={`${index}-${track.songId}`} className="space-y-3 rounded-[1.2rem] border border-white/10 p-3">
                        <select
                          value={track.songId}
                          onChange={(event) => updateAlbumTrack(index, { songId: event.target.value })}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        >
                          <option value="">Выбрать трек</option>
                          {songs.map((song) => (
                            <option key={song.id} value={song.id}>
                              {song.title}
                            </option>
                          ))}
                        </select>

                        <select
                          multiple
                          value={track.artistIds}
                          onChange={(event) =>
                            updateAlbumTrack(index, {
                              artistIds: Array.from(event.target.selectedOptions).map((option) => option.value),
                            })
                          }
                          className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                        >
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              {artist.nickname}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-3">
                          <input
                            type="number"
                            min={1}
                            value={track.trackNumber}
                            onChange={(event) => updateAlbumTrack(index, { trackNumber: event.target.value })}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                            placeholder="Порядок"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAlbumForm((current) => ({
                                ...current,
                                tracks:
                                  current.tracks.length === 1
                                    ? current.tracks
                                    : current.tracks.filter((_, trackIndex) => trackIndex !== index),
                              }))
                            }
                            className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <FormActions saving={saving === "album"} isEditing={Boolean(albumForm.id)} onCancel={resetAlbumForm} />
                </form>

                <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
                  {filteredAlbums.map((album) => (
                    <AdminListItem
                      key={album.id}
                      title={album.title}
                      subtitle={album.artists.map((artist) => artist.nickname).join(", ") || album.genre || "Без артиста"}
                      badge={`${album.trackCount} tracks`}
                      onEdit={() => void editAlbum(album.id)}
                      onDelete={() => void deleteEntity(`/admin/albums/${album.id}`, "Удалить альбом?")}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  query,
  onQueryChange,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/18 text-violet-100">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="safe-text text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-violet-100/55">Найдено: {count}</p>
        </div>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-100/45" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск внутри блока"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-10 py-3 text-sm text-white outline-none placeholder:text-violet-100/35 focus:border-violet-300/40"
        />
      </label>
    </div>
  );
}

function FormTitle({ title }: { title: string }) {
  return <h3 className="safe-text mb-3 text-lg font-bold text-white">{title}</h3>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-violet-100/35 focus:border-violet-300/40"
    />
  );
}

function FormActions({
  saving,
  isEditing,
  onCancel,
}: {
  saving: boolean;
  isEditing: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="submit"
        disabled={saving}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#a855f7,#7c3aed)] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {saving ? "Сохраняем..." : isEditing ? "Сохранить" : "Добавить"}
      </button>
      {isEditing && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white"
        >
          Отмена
        </button>
      )}
    </div>
  );
}

function AdminListItem({
  title,
  subtitle,
  badge,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="safe-text font-semibold text-white">{title}</div>
            {badge && (
              <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100/70">
                {badge}
              </span>
            )}
          </div>
          <div className="safe-text mt-1 text-sm text-violet-100/62">{subtitle}</div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-white/10 bg-white/6 p-2 text-violet-100/72 transition hover:bg-violet-500/15"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-white/10 bg-white/6 p-2 text-violet-100/72 transition hover:bg-red-500/15 hover:text-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
