"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFilters {
  fsc?: string;
  classIX?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  isSubscribed?: boolean;
}

export function SearchBar({ onSearch, placeholder = "Complete NSN required", isSubscribed = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Button
          type="button"
          variant={showFilters ? "secondary" : "outline"}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-5 w-5" />
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button type="submit" size="lg" className="px-8">
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FSC Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Federal Supply Class</label>
              <Input
                type="text"
                placeholder="e.g., 5930"
                value={filters.fsc || ''}
                onChange={(e) => setFilters({ ...filters, fsc: e.target.value })}
              />
            </div>

            {/* Class IX Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Class IX</label>
              <Select
                value={filters.classIX || 'all'}
                onValueChange={(value) => setFilters({ ...filters, classIX: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Min Price ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Max Price ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="999999.99"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
