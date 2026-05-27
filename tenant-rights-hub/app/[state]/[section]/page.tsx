import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import statesData from "@/scripts/scraper/states.json";

interface Props {
  params: { state: string; section: string };
}

function getState(slug: string) {
  return statesData.find((s) => s.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stateInfo = getState(params.state);
  if (!stateInfo) return {};
  const section = decodeURIComponent(params.section);
  return {
    title: `§ ${section} — ${stateInfo.name} Landlord-Tenant Law`,
    description: `Full text of ${stateInfo.name} statute § ${section} covering landlord-tenant law.`,
    alternates: {
      canonical: `https://tenantRightshub.com/${stateInfo.slug}/${encodeURIComponent(section)}`,
    },
  };
}

export default async function SectionPage({ params }: Props) {
  const stateInfo = getState(params.state);
  if (!stateInfo) notFound();

  const sectionNum = decodeURIComponent(params.section);

  const { data: statute, error } = await supabase
    .from("statutes")
    .select("*")
    .eq("state", stateInfo.name)
    .eq("section_number", sectionNum)
    .single();

  if (error || !statute) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    name: `§ ${statute.section_number} — ${statute.section_title}`,
    description: statute.full_text?.slice(0, 200),
    url: `https://tenantRightshub.com/${stateInfo.slug}/${encodeURIComponent(sectionNum)}`,
    jurisdiction: { "@type": "AdministrativeArea", name: stateInfo.name },
    isPartOf: { "@type": "Legislation", name: statute.chapter },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href={`/${stateInfo.slug}`} className="hover:text-blue-600 transition-colors">
            {stateInfo.name}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">§ {statute.section_number}</span>
        </nav>

        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          {statute.chapter}
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-6">
          § {statute.section_number} — {statute.section_title}
        </h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
            {statute.full_text}
          </p>
        </div>

        <div className="flex items-center gap-6 mt-5">
          {statute.source_url && (
            <a
              href={statute.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              View source on Justia <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link
            href={`/${stateInfo.slug}`}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Back to {stateInfo.name} statutes
          </Link>
        </div>
      </div>
    </>
  );
}
