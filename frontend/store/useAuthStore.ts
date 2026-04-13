// frontend/store/useAuthStore.ts
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// Описываем, что лежит в нашем токене (мы клали туда sub и email на бэкенде)
interface JwtPayload {
  sub: number;
  email: string;
  exp: number; // время жизни токена
}

interface AuthState {
  user: JwtPayload | null; // Здесь будет лежать расшифрованный юзер
  login: (token: string) => void; // Функция для входа
  logout: () => void; // Функция для выхода
  checkAuth: () => void; // Функция проверки при перезагрузке страницы
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // Когда юзер логинится: кладем токен в память, расшифровываем и сохраняем данные
  login: (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode<JwtPayload>(token);
    set({ user: decoded });
  },

  // Когда юзер выходит: удаляем токен, стираем данные
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  // При открытии сайта проверяем, есть ли живой токен
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        // Проверяем, не протух ли токен (exp хранится в секундах, Date.now() в мс)
        if (decoded.exp * 1000 < Date.now()) throw new Error('Token expired');
        set({ user: decoded });
      } catch (e) {
        // Если токен сломан или просрочен — выкидываем его
        localStorage.removeItem('token');
        set({ user: null });
      }
    }
  }
}));