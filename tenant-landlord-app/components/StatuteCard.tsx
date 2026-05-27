import { Statute } from "@/types/statute";

export default function StatuteCard({ statute }: { statute: Statute }) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        padding: "1.25rem 1.5rem",
        marginBottom: "1rem",
      }}
    >
      <header style={{ marginBottom: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#64748b",
          }}
        >
          § {statute.section_number} — {statute.chapter}
        </span>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.25rem" }}>
          {statute.title}
        </h3>
      </header>

      <p
        style={{
          fontSize: "0.9rem",
          color: "#334155",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {statute.body}
      </p>

      <a
        href={statute.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "0.75rem",
          fontSize: "0.8rem",
          color: "#1e40af",
          fontWeight: 500,
        }}
      >
        View on Justia →
      </a>
    </article>
  );
}
