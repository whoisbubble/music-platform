// frontend/store/useAuthStore.ts
import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Импортируем библиотеку

interface JwtPayload {
  sub: number;
  email: string;
  exp: number;
}

interface AuthState {
  user: JwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: (token) => {
    // Сохраняем в куки на 2 дня. Secure: true значит только по HTTPS (в деве проигнорится)
    Cookies.set('token', token, { expires: 2, path: '/' });
    const decoded = jwtDecode<JwtPayload>(token);
    set({ user: decoded });
  },

  logout: () => {
    Cookies.remove('token', { path: '/' });
    set({ user: null });
    window.location.href = '/login'; // Жесткий редирект для чистоты стейта
  },

  checkAuth: () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.exp * 1000 < Date.now()) {
          Cookies.remove('token');
          set({ user: null });
          return;
        }
        set({ user: decoded });
      } catch (e) {
        set({ user: null });
      }
    }
  }
}));