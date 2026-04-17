"use client";

import Cookies from "js-cookie";
import { API_URL } from "@/config/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Ошибка запроса";

    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        message = errorData.message[0];
      } else if (typeof errorData.message === "string") {
        message = errorData.message;
      } else if (typeof errorData.error === "string") {
        message = errorData.error;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
}

export async function authApiFetch<T>(path: string, init: RequestInit = {}) {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  if (!token) {
    throw new Error("Требуется авторизация");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401) {
    Cookies.remove(AUTH_COOKIE_NAME, { path: "/" });
    Cookies.remove("token", { path: "/" });

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return parseResponse<T>(response);
}
