"use client";

import { useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { authApiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      const data = await authApiFetch<ChatMessage[]>("/chat/messages");
      setMessages(data);
      setError("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Не удалось загрузить сообщения");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
    const timer = window.setInterval(() => {
      void loadMessages();
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setSending(true);

    try {
      const created = await authApiFetch<ChatMessage>("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessages((current) => [...current, created]);
      setMessage("");
      setError("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      await authApiFetch(`/chat/messages/${id}`, { method: "DELETE" });
      setMessages((current) => current.filter((messageItem) => messageItem.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Не удалось удалить сообщение");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-violet-200/55">public room</div>
          <h1 className="mt-3 text-4xl font-bold text-white">Общий чат</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-violet-100/65">
            Все авторизованные пользователи могут писать сообщения. Администратор может модерировать чат.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[1.8rem] border border-white/10 bg-black/15 px-6 py-16 text-center text-violet-100/62">
            Загружаем сообщения...
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-[1.8rem] border border-white/10 bg-black/15 px-6 py-14 text-center text-violet-100/62">
                Чат пока пуст. Напишите первое сообщение.
              </div>
            ) : (
              messages.map((messageItem) => {
                const canDelete = user?.isAdmin || user?.id === messageItem.user?.id;

                return (
                  <div
                    key={messageItem.id}
                    className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/15 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-white">
                          {messageItem.user?.username || "Неизвестный"}
                        </span>
                        <span className="text-xs uppercase tracking-[0.24em] text-violet-200/45">
                          {messageItem.createdAt
                            ? new Date(messageItem.createdAt).toLocaleString("ru-RU")
                            : "сейчас"}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-violet-100/70">
                        {messageItem.message}
                      </p>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void deleteMessage(messageItem.id)}
                        className="rounded-full border border-white/10 bg-white/6 p-2 text-violet-100/72 transition hover:border-red-300/20 hover:bg-red-500/10 hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,.24),transparent_38%),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-6 md:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-violet-200/55">say something</div>
          <h2 className="mt-3 text-2xl font-bold text-white">Новое сообщение</h2>
        </div>

        <form onSubmit={sendMessage} className="space-y-4">
          <textarea
            rows={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Напишите что угодно..."
            className="w-full rounded-[1.6rem] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition placeholder:text-violet-100/35 focus:border-violet-300/45 focus:ring-4 focus:ring-violet-500/10"
          />

          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#a855f7,#7c3aed)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(124,58,237,.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? "Отправляем..." : "Отправить"}
          </button>
        </form>
      </aside>
    </div>
  );
}
