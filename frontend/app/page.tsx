// frontend/app/page.tsx

// Массив мок-данных (позже мы заменим его на вызов к NestJS/БД)
const MOCK_ALBUMS = [
  { id: 1, title: 'Master of Puppets', artist: 'Metallica', cover: 'https://images.unsplash.com/photo-1620853755452-19e4879d71c8?q=80&w=300&auto=format&fit=crop' },
  { id: 2, title: 'Discovery', artist: 'Daft Punk', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop' },
  { id: 3, title: 'After Hours', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop' },
  { id: 4, title: 'Nevermind', artist: 'Nirvana', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop' },
];

export default function Home() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Популярные альбомы</h2>
      
      {/* Сетка: 2 колонки на мобилках, 3 на планшетах, 5 на ПК */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        
        {/* Проходимся циклом map по массиву и для каждого альбома рисуем карточку */}
        {MOCK_ALBUMS.map((album) => (
          <div key={album.id} className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition group cursor-pointer">
            {/* Картинка альбома */}
            <img 
              src={album.cover} 
              alt={album.title} 
              className="w-full aspect-square object-cover rounded-md mb-4 shadow-lg group-hover:shadow-2xl transition-shadow" 
            />
            {/* Тексты */}
            <h3 className="font-bold truncate">{album.title}</h3>
            <p className="text-gray-400 text-sm truncate">{album.artist}</p>
          </div>
        ))}

      </div>
    </div>
  );
}