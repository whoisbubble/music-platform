// frontend/app/page.tsx
import Link from 'next/link';
import { Album, AsaMusic, Artist, Song } from '@/types';
import { API_URL } from '@/config/api';

// 2. Пишем функцию для похода на бэкенд
// async означает, что функция асинхронная (она не блокирует программу, пока ждет данные по сети)
async function fetchAlbums(): Promise<Album[]> {
  // Делаем HTTP GET запрос к нашему NestJS
  // { cache: 'no-store' } говорит Next.js всегда ходить за свежими данными и не кэшировать их
  const response = await fetch(`${API_URL}/albums`, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error('Ошибка при загрузке данных с бэкенда');
  }

  // Превращаем ответ из текстового JSON обратно в массив объектов
  return response.json();
}

// 3. Наш главный компонент теперь асинхронный (async)
export default async function Home() {
  
  // Ждем (await), пока данные придут с бэкенда.
  // Никаких заглушек (MOCK_ALBUMS) больше нет!
  const albums = await fetchAlbums();

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Популярные альбомы с Бэкенда!</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        
        {/* Отрисовываем реальные данные, которые пришли по сети */}
        {albums.map((album) => (
          <Link href={`/album/${album.id}`} key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition group cursor-pointer">
            <img 
              src={album.cover_url} 
              alt={album.title} 
              className="w-full aspect-square object-cover rounded-md mb-4 shadow-lg group-hover:shadow-2xl transition-shadow" 
            />
            <h3 className="font-bold truncate">{album.title}</h3>

          {/* flex выстроит их в ряд, flex-wrap перенесет на новую строку, если они не влезут, а gap-x-1 добавит небольшой отступ */}
          <div className="flex flex-wrap gap-x-1 items-center truncate">

          {/* Извлекаем уникальных артистов, чтобы они не дублировались, если у них несколько треков в альбоме */}
            {Array.from(
              new Map(album.asa_music.map(item => [item.artists.nickname, item.artists])).values()
            ).map((artist, index, array) => (
              
              // group/artist позволяет нам сделать стили при наведении только на одного артиста
              <span key={index} className="text-gray-400 text-sm hover:text-white hover:underline transition-colors">
                
                {artist.nickname}
                
                {/* Если это НЕ последний артист в списке, добавляем запятую */}
                {index < array.length - 1 && <span>,</span>}
                
              </span>
            ))}

          </div>


          </Link>
        ))}

      </div>
    </div>
  );
}