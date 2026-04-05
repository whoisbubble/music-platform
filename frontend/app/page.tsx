// frontend/app/page.tsx

interface Album {
  id: number;
  title: string;
  artist: string;
  cover: string;
}

// 2. Пишем функцию для похода на бэкенд
// async означает, что функция асинхронная (она не блокирует программу, пока ждет данные по сети)
async function fetchAlbums(): Promise<Album[]> {
  // Делаем HTTP GET запрос к нашему NestJS
  // { cache: 'no-store' } говорит Next.js всегда ходить за свежими данными и не кэшировать их
  const response = await fetch('http://localhost:3001/api/albums', { cache: 'no-store' });
  
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
          <div key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition group cursor-pointer">
            <img 
              src={album.cover} 
              alt={album.title} 
              className="w-full aspect-square object-cover rounded-md mb-4 shadow-lg group-hover:shadow-2xl transition-shadow" 
            />
            <h3 className="font-bold truncate">{album.title}</h3>
            <p className="text-gray-400 text-sm truncate">{album.artist}</p>
          </div>
        ))}

      </div>
    </div>
  );
}