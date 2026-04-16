"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialValue?: string;
}

export default function SearchBar({ initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <input
        type="text"
        placeholder="Найти треки, альбомы или артистов"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-full border border-white/10 bg-white/6 px-5 py-3.5 pr-13 text-sm text-white outline-none transition placeholder:text-violet-200/45 focus:border-violet-300/60 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/15"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-violet-500 text-white transition hover:bg-violet-400"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
