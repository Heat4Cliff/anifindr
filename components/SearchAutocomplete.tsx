"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, ArrowRight, Tag, Clock } from "lucide-react";

interface AnimeSuggestion {
  id: string;
  title: string;
  titleOriginal: string;
  imageUrl: string | null;
  score: number | null;
  type: string | null;
  year: number | null;
  genres: string[];
}

interface SuggestionsData {
  animes: AnimeSuggestion[];
  genres: string[];
}

interface SearchAutocompleteProps {
  placeholder?: string;
  variant?: "hero" | "navbar";
  onSearch?: () => void;
}

export default function SearchAutocomplete({
  placeholder = "Cari anime...",
  variant = "navbar",
  onSearch,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setIsOpen(data.animes?.length > 0 || data.genres?.length > 0);
    } catch {
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  // Navigate to search or anime detail
  const handleSearch = (q?: string) => {
    const searchQuery = q ?? query;
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setQuery("");
      setIsOpen(false);
      onSearch?.();
    }
  };

  const handleAnimeClick = (id: string) => {
    router.push(`/anime/${id}`);
    setQuery("");
    setIsOpen(false);
    onSearch?.();
  };

  const handleGenreClick = (genre: string) => {
    router.push(`/search?genre=${encodeURIComponent(genre)}`);
    setQuery("");
    setIsOpen(false);
    onSearch?.();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions) return;

    const totalItems = (suggestions.animes?.length ?? 0) + (suggestions.genres?.length ?? 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const animeCount = suggestions.animes?.length ?? 0;
        if (selectedIndex < animeCount) {
          handleAnimeClick(suggestions.animes[selectedIndex].id);
        } else {
          handleGenreClick(suggestions.genres[selectedIndex - animeCount]);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Input Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: isHero ? "var(--bg-elevated)" : "var(--bg-elevated)",
          border: `1px solid ${isOpen ? "var(--accent-primary)" : "var(--border)"}`,
          borderRadius: isOpen ? "var(--radius) var(--radius) 0 0" : "var(--radius)",
          padding: isHero ? "0.4rem" : "0",
          transition: "border-color 0.2s ease, border-radius 0.2s ease",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={isHero ? 18 : 16}
            style={{
              position: "absolute",
              left: isHero ? 14 : 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: isLoading ? "var(--accent-primary)" : "var(--text-muted)",
              pointerEvents: "none",
              transition: "color 0.2s ease",
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions && (suggestions.animes?.length > 0 || suggestions.genres?.length > 0)) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              padding: isHero ? "0.6rem 1rem 0.6rem 2.8rem" : "0.45rem 1rem 0.45rem 2.2rem",
              fontSize: isHero ? "0.95rem" : "0.875rem",
              outline: "none",
            }}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            border: "none",
            borderRadius: "var(--radius-sm)",
            color: "#fff",
            padding: isHero ? "0.6rem 1.5rem" : "0.45rem 1rem",
            fontWeight: isHero ? 700 : 600,
            fontSize: isHero ? "0.9rem" : "0.875rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s ease",
            marginRight: isHero ? 0 : "0.35rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {isHero ? "Cari Sekarang" : "Cari"}
        </button>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && suggestions && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--accent-primary)",
            borderTop: "none",
            borderRadius: "0 0 var(--radius) var(--radius)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            zIndex: 100,
            maxHeight: 420,
            overflowY: "auto",
            animation: "dropdownSlide 0.2s ease",
          }}
        >
          {/* Anime suggestions */}
          {suggestions.animes?.length > 0 && (
            <div>
              <div style={{
                padding: "0.5rem 1rem 0.35rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Anime
              </div>
              {suggestions.animes.map((anime, i) => (
                <button
                  key={anime.id}
                  onClick={() => handleAnimeClick(anime.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "0.6rem 1rem",
                    border: "none",
                    background: selectedIndex === i ? "var(--bg-hover)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                    outline: "none",
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {/* Thumbnail */}
                  {anime.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={anime.imageUrl}
                      alt=""
                      style={{
                        width: 36,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={{
                      width: 36,
                      height: 50,
                      borderRadius: 4,
                      background: "var(--bg-elevated)",
                      flexShrink: 0,
                    }} />
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {anime.title}
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      marginTop: "0.15rem",
                    }}>
                      {anime.type && (
                        <span style={{
                          background: "rgba(13,148,136,0.12)",
                          color: "var(--accent-primary)",
                          padding: "1px 5px",
                          borderRadius: 3,
                          fontWeight: 600,
                        }}>
                          {anime.type}
                        </span>
                      )}
                      {anime.year && <span>{anime.year}</span>}
                      {anime.genres.length > 0 && (
                        <span>· {anime.genres.slice(0, 2).join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {anime.score && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: anime.score >= 8 ? "#4ade80" : anime.score >= 7 ? "#f59e0b" : "var(--text-muted)",
                      flexShrink: 0,
                    }}>
                      <Star size={11} style={{ fill: "currentColor" }} />
                      {anime.score.toFixed(1)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Genre suggestions */}
          {suggestions.genres?.length > 0 && (
            <div>
              <div style={{
                padding: "0.5rem 1rem 0.35rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderTop: suggestions.animes?.length > 0 ? "1px solid var(--border)" : "none",
              }}>
                Genre
              </div>
              {suggestions.genres.map((genre, i) => {
                const idx = (suggestions.animes?.length ?? 0) + i;
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      width: "100%",
                      padding: "0.55rem 1rem",
                      border: "none",
                      background: selectedIndex === idx ? "var(--bg-hover)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                      outline: "none",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Tag size={14} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
                    <span>Cari genre <strong style={{ color: "var(--text-primary)" }}>{genre}</strong></span>
                    <ArrowRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)", flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Search all */}
          {query.trim() && (
            <button
              onClick={() => handleSearch()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                width: "100%",
                padding: "0.6rem 1rem",
                border: "none",
                borderTop: "1px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
                color: "var(--accent-primary)",
                fontWeight: 600,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Search size={14} />
              <span>Cari semua untuk &ldquo;<strong>{query}</strong>&rdquo;</span>
              <ArrowRight size={14} style={{ marginLeft: "auto" }} />
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
