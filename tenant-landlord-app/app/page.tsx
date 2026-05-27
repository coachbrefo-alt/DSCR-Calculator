import Link from "next/link";
import SearchBar from "@/components/SearchBar";

const SUPPORTED_STATES = [
  { code: "texas", label: "Texas" },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Tenant-Landlord Law Aggregator
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Browse landlord-tenant statutes by state. Updated directly from official
        sources.
      </p>

      <SearchBar />

      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Available States
        </h2>
        <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {SUPPORTED_STATES.map(({ code, label }) => (
            <li key={code}>
              <Link
                href={`/statutes/${code}`}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1.25rem",
                  background: "#1e40af",
                  color: "#fff",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
