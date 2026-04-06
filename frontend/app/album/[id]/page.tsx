// frontend/app/album/[id]/page.tsx
import Link from 'next/link';

// 1. Описываем интерфейсы (что нам приходит от бэкенда)
interface Artist {
  nickname: string;
}

interface Song {
  id: number;
  title: string;
}

interface AsaMusic {
  artists: Artist;
  songs: Song;
}

interface Album {
  id: number;
  title: string;
  cover_url: string;
  asa_music: AsaMusic[];
}

// 2. Функция запроса конкретного альбома
async function fetchAlbum(id: string): Promise<Album> {
  // Заменили localhost на 127.0.0.1
  const response = await fetch(`http://127.0.0.1:3001/api/albums/${id}`, { cache: 'no-store' });
  // ДЕТЕКТИВ: Выводим URL в консоль фронтенда
  const url = `http://127.0.0.1:3001/api/albums/${id}`;
  
  // ДЕТЕКТИВ: Выводим URL в консоль фронтенда
  console.log('🕵️‍♂️ Пытаюсь загрузить:', url);
  if (!response.ok) {
    console.log('❌ Ошибка бэкенда! Статус:', response.status);
    throw new Error('Альбом не найден');
  }
  return response.json();
}

// 3. Главный компонент. Он принимает params, в которых лежит наш [id] из адресной строки
export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Сначала ДОЖИДАЕМСЯ распаковки параметров
  const resolvedParams = await params;
  
  // 2. Теперь передаем настоящий ID (единичку), а не undefined
  const album = await fetchAlbum(resolvedParams.id);

  // ХИТРОСТЬ №1: Достаем уникальных артистов... (и так далее, код ниже не меняется)
  const albumArtists = Array.from(new Set(album.asa_music.map((item) => item.artists.nickname)));
// ...

  // ХИТРОСТЬ №2: Группируем треки. Если есть "фиты", склеиваем авторов к одной песне
  const songsMap = new Map();
  
  album.asa_music.forEach((item) => {
    if (!item.songs) return; // Защита от пустых записей
    
    // Если песни еще нет в нашем словаре, добавляем её
    if (!songsMap.has(item.songs.id)) {
      songsMap.set(item.songs.id, {
        id: item.songs.id,
        title: item.songs.title,
        artists: [item.artists.nickname], // Создаем массив артистов для этой песни
      });
    } else {
      // Если песня уже есть (это фит!), просто докидываем второго артиста
      songsMap.get(item.songs.id).artists.push(item.artists.nickname);
    }
  });

  // Превращаем словарь обратно в массив для удобной отрисовки
  const tracks = Array.from(songsMap.values());

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      
      {/* Кнопка "Назад" */}
      <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block transition">
        ← Назад на главную
      </Link>

      {/* ШАПКА АЛЬБОМА */}
      <div className="flex flex-col md:flex-row gap-8 items-end mb-12">
        <img 
          src={album.cover_url} 
          alt={album.title} 
          className="w-64 h-64 object-cover shadow-2xl rounded-md"
        />
        <div>
          <p className="uppercase text-sm font-bold text-gray-400 mb-2">Альбом</p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">{album.title}</h1>
          <div className="text-gray-300 font-medium">
            {/* Выводим всех авторов альбома через запятую */}
            {albumArtists.join(', ')} • {tracks.length} треков
          </div>
        </div>
      </div>

      {/* СПИСОК ТРЕКОВ */}
      <div className="bg-[#121212] rounded-lg p-4">
        {/* Заголовки таблицы */}
        <div className="grid grid-cols-[50px_1fr] text-gray-400 text-sm border-b border-gray-800 pb-2 mb-4 px-4">
          <div>#</div>
          <div>Название</div>
        </div>

        {/* Сами треки */}
        {tracks.map((track, index) => (
          <div 
            key={track.id} 
            className="grid grid-cols-[50px_1fr] items-center p-4 hover:bg-[#2a2929] rounded-md transition group cursor-pointer"
          >
            <div className="text-gray-400 group-hover:text-white">{index + 1}</div>
            
            <div className="flex flex-col">
              <span className="font-medium text-white">{track.title}</span>
              {/* Выводим авторов конкретного трека (если фит - будут через запятую) */}
              <span className="text-sm text-gray-400">
                {track.artists.join(', ')}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}