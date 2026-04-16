// frontend/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  
  // Состояния для наших инпутов
  const [username, setUsername] = useState(''); // + состояние для реги
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Состояния для UI (ошибки и загрузка)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Отменяем перезагрузку страницы
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // NestJS может вернуть массив ошибок валидации или одну строку
        const errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(errorMessage || 'Ошибка при регистрации');
      }

      // МАГИЯ: Сохраняем токен в память браузера!
      login(data.access_token);
      
      // Перекидываем на главную
    window.location.href = '/';
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Добро пожаловать</h1>
          <p className="text-neutral-400">Зарегистрироваться, чтобы слушать свою медиатеку - это круто!</p>
        </div>

        {/* Вывод ошибки, если она есть */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-neutral-700 focus:border-transparent"
              placeholder="dvgpupsik"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-neutral-700 focus:border-transparent"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-neutral-700 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-black font-bold py-3.5 rounded-xl hover:bg-green-400 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-4"
          >
            {isLoading ? 'Регистрация...' : 'Зарегаться'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-400">
          Есть аккаунт?{' '}
          <Link href="/login" className="text-white font-medium hover:text-green-500 transition-colors">
            Войти
          </Link>
        </div>

      </div>
    </div>
  );
}