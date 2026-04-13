"use client"; // Важно! Это нужно для работы хука usePathname

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Library, Mic2, Medal, LogIn, LogOut, User } from 'lucide-react';

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

    // Достаем данные и функции из нашего мозга
    const { user, checkAuth, logout } = useAuthStore();
    
    // Фикс для Next.js (чтобы сервер и клиент не ругались из-за localStorage)
    const [isMounted, setIsMounted] = useState(false);

    // При первой загрузке сайдбара проверяем авторизацию
    useEffect(() => {
        checkAuth();
        setIsMounted(true);
    }, [checkAuth]);

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

{/* --- БЛОК АВТОРИЗАЦИИ (ВНИЗУ) --- */}
            <div className="mt-auto pt-6 border-t border-neutral-800/50">
                {/* Ждем пока компонент загрузится в браузере, чтобы избежать мерцания */}
                {!isMounted ? null : user ? (
                    // ЕСЛИ ЮЗЕР ЗАЛОГИНИЛСЯ:
                    <div className="flex items-center justify-between px-3 py-2 bg-neutral-800/40 rounded-xl border border-neutral-700/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-green-500/20 p-2 rounded-full text-green-500">
                                <User size={18} />
                            </div>
                            <span className="text-white font-medium truncate text-sm">
                                {user.email}
                            </span>
                        </div>
                        <button 
                            onClick={logout} 
                            className="text-neutral-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                            title="Выйти"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    // ЕСЛИ ЮЗЕР ГОСТЬ:
                    <Link 
                        href="/login" 
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-all duration-300 font-medium group"
                    >
                        <LogIn size={22} className="group-hover:text-green-500 transition-colors" />
                        Войти
                    </Link>
                )}
            </div>

        </aside>
    );
};