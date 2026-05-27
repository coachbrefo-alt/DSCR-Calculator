import { supabase } from "@/lib/supabase";
import { Statute } from "@/types/statute";
import StatuteCard from "@/components/StatuteCard";
import Link from "next/link";

interface Props {
  params: { state: string };
  searchParams: { q?: string };
}

export async function generateMetadata({ params }: Props) {
  const label = params.state.charAt(0).toUpperCase() + params.state.slice(1);
  return { title: `${label} Landlord-Tenant Statutes` };
}

async function fetchStatutes(state: string, query?: string): Promise<Statute[]> {
  let req = supabase
    .from("statutes")
    .select("*")
    .eq("state", state)
    .order("section_number", { ascending: true });

  if (query) {
    req = req.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return data as Statute[];
}

export default async function StatutesPage({ params, searchParams }: Props) {
  const { state } = params;
  const query = searchParams.q;
  const label = state.charAt(0).toUpperCase() + state.slice(1);

  let statutes: Statute[] = [];
  let fetchError: string | null = null;

  try {
    statutes = await fetchStatutes(state, query);
  } catch (e) {
    fetchError = (e as Error).message;
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <Link
        href="/"
        style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem", display: "inline-block" }}
      >
        ← All States
      </Link>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        {label} Landlord-Tenant Statutes
      </h1>
      {query && (
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Results for: <strong>&ldquo;{query}&rdquo;</strong>{" "}
          <Link href={`/statutes/${state}`} style={{ color: "#1e40af", fontSize: "0.85rem" }}>
            clear
          </Link>
        </p>
      )}

      {fetchError ? (
        <p style={{ color: "#dc2626", marginTop: "1.5rem" }}>
          Could not load statutes: {fetchError}
        </p>
      ) : statutes.length === 0 ? (
        <p style={{ color: "#64748b", marginTop: "1.5rem" }}>
          No statutes found.{" "}
          {query
            ? "Try a different search term."
            : "Run the scraper to populate the database."}
        </p>
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            {statutes.length} section{statutes.length !== 1 ? "s" : ""}
          </p>
          {statutes.map((s) => (
            <StatuteCard key={s.id} statute={s} />
          ))}
        </div>
      )}
    </main>
  );
}
