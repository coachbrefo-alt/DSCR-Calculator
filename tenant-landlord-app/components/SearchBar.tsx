"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/statutes/texas?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search statutes — e.g. security deposit, eviction notice…"
        style={{
          flex: 1,
          padding: "0.625rem 1rem",
          border: "1px solid #cbd5e1",
          borderRadius: "0.375rem",
          fontSize: "0.95rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "0.625rem 1.25rem",
          background: "#1e40af",
          color: "#fff",
          border: "none",
          borderRadius: "0.375rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}
