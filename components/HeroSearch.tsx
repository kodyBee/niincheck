"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center p-2 bg-background/60 backdrop-blur-xl border border-primary/20 rounded-full shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-300">
          <Search className="ml-4 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder="Search by NSN, Part Number, or Keyword..." 
            className="flex-1 border-0 bg-transparent py-6 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button size="lg" type="submit" className="rounded-full px-8 h-12 text-md shadow-lg shadow-primary/20">
            Search
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
      
      {/* Quick tags or hints could go here */}
      <div className="mt-4 flex justify-center gap-2 text-sm text-muted-foreground/80">
        <span>Try:</span>
        <button onClick={() => setQuery("5965-01-572-6371")} className="hover:text-primary transition-colors underline decoration-dotted">5965-01-572-6371</button>
        <span>•</span>
        <button onClick={() => setQuery("Headset")} className="hover:text-primary transition-colors underline decoration-dotted">Headset</button>
      </div>
    </div>
  );
}
