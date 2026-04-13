"use client"; // Важно! Это нужно для работы хука usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Mic2, Medal } from 'lucide-react';

// Выносим пункты меню в удобный массив. Если захочешь добавить новый раздел — 
// просто допишешь сюда одну строчку!
const navItems = [
    { href: '/', icon: Home, label: 'Главная' },
    { href: '/search', icon: Search, label: 'Поиск' },
    { href: '/artists', icon: Mic2, label: 'Артисты' },
    { href: '/library', icon: Library, label: 'Моя медиатека' },
];

export const Sidebar = () => {
    // Получаем текущий путь (например, "/search")
    const pathname = usePathname();

    return (
        // Добавили легкую границу справа (border-r), чтобы отделить сайдбар от контента
        <aside className="w-64 bg-[#0a0a0a] h-screen p-6 flex flex-col border-r border-neutral-800/50">
            
            {/* --- ЛОГОТИП --- */}
            <div className="mb-10 px-2">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-green-500 p-1.5 rounded-lg text-black group-hover:scale-105 transition-transform">
                        <Medal size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-white text-2xl font-extrabold tracking-tight">
                        MusicMedal
                    </h1>
                </Link>
            </div>

            {/* --- НАВИГАЦИЯ --- */}
            <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                    // Проверяем, находимся ли мы сейчас на странице этого пункта меню
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link 
                            key={item.href} 
                            href={item.href} 
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                                isActive 
                                    // Стили для АКТИВНОЙ страницы
                                    ? 'bg-neutral-800/80 text-white shadow-sm' 
                                    // Стили для НЕАКТИВНОЙ страницы
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                            }`}
                        >
                            {/* Если пункт активен — красим иконку в зеленый */}
                            <Icon size={22} className={isActive ? 'text-green-500' : ''} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
};