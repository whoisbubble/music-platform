"use client";

import { Heart } from "lucide-react";
import { useCollectionStore } from "@/store/useCollectionStore";
import { useAuthStore } from "@/store/useAuthStore";

interface CollectionToggleButtonProps {
  itemType: "album" | "song";
  itemId: number;
  className?: string;
}

export function CollectionToggleButton({
  itemType,
  itemId,
  className = "",
}: CollectionToggleButtonProps) {
  const { user } = useAuthStore();
  const { albumIds, songIds, pendingKeys, addAlbum, removeAlbum, addSong, removeSong } =
    useCollectionStore();

  if (!user) {
    return null;
  }

  const pendingKey = `${itemType}:${itemId}`;
  const isPending = pendingKeys.includes(pendingKey);
  const isSaved = itemType === "album" ? albumIds.includes(itemId) : songIds.includes(itemId);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (itemType === "album") {
        await (isSaved ? removeAlbum(itemId) : addAlbum(itemId));
      } else {
        await (isSaved ? removeSong(itemId) : addSong(itemId));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось обновить коллекцию";
      window.alert(message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
        isSaved
          ? "border-violet-300/60 bg-violet-500/20 text-violet-100"
          : "border-white/10 bg-white/6 text-violet-100 hover:border-violet-300/40 hover:bg-violet-500/10"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {isPending ? "Сохраняем..." : isSaved ? "В коллекции" : "Сохранить"}
    </button>
  );
}
