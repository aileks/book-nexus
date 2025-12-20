import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconSearch, IconX } from "@tabler/icons-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  defaultValue?: string;
  autoFocus?: boolean;
}

interface ControlledSearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "Search books...",
  debounceMs = 300,
  defaultValue = "",
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-2xl">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 py-6 text-lg"
        aria-label="Search books"
        autoFocus={autoFocus}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <IconX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ControlledSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search books...",
  autoFocus = false,
}: ControlledSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    onChange(localValue);
  }, [localValue, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(localValue);
    }
  };

  return (
    <div className="relative w-full max-w-3xl">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10 py-4 text-base"
        aria-label="Search books"
        autoFocus={autoFocus}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <IconX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
