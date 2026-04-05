import Link from 'next/link';
import {Home,Search,Library,Mic2, Medal} from 'lucide-react';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-black h-screen p-6 text-gray-400 flex flex-col">
            <div className="mb-8">
                <h1 className="text-white text-2xl items-center flex gap-4 font-bold tracking-wider">
                    <Medal size={24}/> MusicMedal
                </h1>
            </div>

            {/* Навигация */}
            <nav>
                <Link href="/" className="flex 
                items-center 
                gap-4
                hover:text-white
                transition-colors mb-3">
                    <Home size={24} /> Главная
                </Link>

                <Link href="/search" className="flex 
                items-center 
                gap-4 
                hover:text-white
                transition-colors mb-3">
                    <Search size={24} /> Поиск
                </Link>

                <Link href="/artists" className="flex 
                items-center 
                gap-4 
                hover:text-white
                transition-colors mb-3">
                    <Mic2 size={24} /> Артисты
                </Link>

                <Link href="/library" className="flex 
                items-center 
                gap-4 
                hover:text-white
                transition-colors mb-3">
                    <Library size={24} /> Моя медиатека
                </Link>
            </nav>
        </aside>
    );
};