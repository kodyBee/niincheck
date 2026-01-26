"use client";

import { useEffect, useState } from "react";
import { History, Search, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  query: string;
  created_at: string;
}

export function SearchHistory({ onSearch }: { onSearch: (query: string) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistory(data.history);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (history.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {history.map((item) => (
            <Button
              key={item.id}
              variant="secondary"
              size="sm"
              className="h-auto py-1.5 px-3 bg-secondary/50 hover:bg-secondary border border-secondary"
              onClick={() => onSearch(item.query)}
            >
              <Search className="mr-1.5 h-3 w-3 text-muted-foreground" />
              {item.query}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
