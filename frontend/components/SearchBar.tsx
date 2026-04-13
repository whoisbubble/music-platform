// frontend/components/SearchBar.tsx
"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Инструмент Next.js для переходов по страницам

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Перекидываем пользователя на страницу поиска и передаем запрос в URL
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <input
        type="text"
        placeholder="Поиск треков, альбомов, артистов..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-[#282828] text-white px-5 py-3 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition shadow-lg"
      />
      <button 
        type="submit" 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
      >
        {/* Иконка лупы (SVG) */}
        <Search className='h-5 w-5'></Search>
      </button>
    </form>
  );
}