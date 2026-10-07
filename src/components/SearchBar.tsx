"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/courses`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for courses, skills, or topics..." 
        className="w-full bg-[#1e2130]/80 backdrop-blur-md border border-slate-200 rounded-full pl-12 pr-24 py-3.5 text-base focus:outline-none focus:border-blue-500 focus:bg-[#1e2130] transition-all text-slate-900 shadow-xl"
      />
      <button 
        type="submit" 
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 py-2 text-sm font-bold transition-colors"
      >
        Search
      </button>
    </form>
  );
}
