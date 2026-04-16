import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useCollectionStore } from "./useCollectionStore";
import type { AuthResponse, AuthUser } from "@/types";

interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  roles: string[];
  exp: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (response: AuthResponse | string) => void;
  logout: () => void;
  checkAuth: () => void;
}

function decodeToken(token: string): AuthUser {
  const decoded = jwtDecode<JwtPayload>(token);

  return {
    id: decoded.sub,
    email: decoded.email,
    username: decoded.username,
    roles: decoded.roles ?? [],
    isAdmin: (decoded.roles ?? []).includes("admin"),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: (response) => {
    const token = typeof response === "string" ? response : response.access_token;
    const user = typeof response === "string" ? decodeToken(token) : response.user;

    Cookies.set("token", token, { expires: 2, path: "/" });
    set({ user, token });
  },

  logout: () => {
    Cookies.remove("token", { path: "/" });
    useCollectionStore.getState().reset();
    set({ user: null, token: null });
    window.location.href = "/login";
  },

  checkAuth: () => {
    const token = Cookies.get("token");
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        Cookies.remove("token", { path: "/" });
        useCollectionStore.getState().reset();
        set({ user: null, token: null });
        return;
      }

      set({ user: decodeToken(token), token });
    } catch {
      Cookies.remove("token", { path: "/" });
      useCollectionStore.getState().reset();
      set({ user: null, token: null });
    }
  },
}));
