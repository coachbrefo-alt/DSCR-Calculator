"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import StateCard from "./StateCard";
import statesData from "@/scripts/scraper/states.json";

type State = (typeof statesData)[0];

export default function StateGrid() {
  const [query, setQuery] = useState("");

  const filtered: State[] = statesData.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6 max-w-md">
        <SearchBar
          placeholder="Search a state — e.g. Texas, FL…"
          onSearch={setQuery}
        />
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-5">
        {query
          ? `${filtered.length} state${filtered.length !== 1 ? "s" : ""} found`
          : "Browse All 50 States"}
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {filtered.map((state) => (
          <StateCard key={state.code} name={state.name} code={state.code} slug={state.slug} />
        ))}
      </div>
    </section>
  );
}
