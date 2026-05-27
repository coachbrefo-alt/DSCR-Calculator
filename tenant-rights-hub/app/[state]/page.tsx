import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import statesData from "@/scripts/scraper/states.json";
import StatuteViewer from "@/components/StatuteViewer";
import AdSlot from "@/components/AdSlot";
import LeadCaptureForm from "@/components/LeadCaptureForm";

type StateEntry = (typeof statesData)[0];

function getState(slug: string): StateEntry | undefined {
  return statesData.find((s) => s.slug === slug);
}

// Pre-render a route for every state
export function generateStaticParams() {
  return statesData.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const state = getState(params.state);
  if (!state) return {};
  return {
    title: `${state.name} Landlord-Tenant Laws 2025`,
    description: `Browse all official ${state.name} landlord-tenant statutes. Know your rights as a tenant or property owner in ${state.name} (${state.code}).`,
    alternates: { canonical: `https://tenantRightshub.com/${state.slug}` },
    openGraph: {
      title: `${state.name} Landlord-Tenant Laws 2025 | TenantRightsHub`,
      description: `Complete ${state.name} landlord-tenant statute text, searchable and free.`,
      url: `https://tenantRightshub.com/${state.slug}`,
    },
  };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const stateInfo = getState(params.state);
  if (!stateInfo) notFound();

  const { data: statutes, error } = await supabase
    .from("statutes")
    .select("id, section_number, section_title, full_text, source_url, chapter, state")
    .eq("state", stateInfo.name)
    .order("section_number", { ascending: true });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    name: `${stateInfo.name} Landlord-Tenant Laws`,
    description: `Official landlord-tenant statutes for ${stateInfo.name}`,
    url: `https://tenantRightshub.com/${stateInfo.slug}`,
    jurisdiction: { "@type": "AdministrativeArea", name: stateInfo.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">{stateInfo.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Main column ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {stateInfo.name} Landlord-Tenant Laws
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              {statutes?.length ?? 0} sections • sourced from Justia.com
            </p>

            {error ? (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                Could not load statutes: {error.message}
              </p>
            ) : !statutes || statutes.length === 0 ? (
              <p className="text-gray-500 bg-gray-100 rounded-xl p-6 text-sm">
                No statutes found for {stateInfo.name} yet. Run the scraper to populate this state.
              </p>
            ) : (
              <div>
                {statutes.map((s) => (
                  <StatuteViewer key={s.id} statute={s} stateSlug={stateInfo.slug} />
                ))}
              </div>
            )}

            <div className="mt-8">
              <AdSlot slot="0987654321" format="leaderboard" />
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside className="space-y-6">
            <AdSlot slot="1122334455" format="rectangle" />

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 text-base mb-1">
                Find a Property Manager in {stateInfo.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with a verified local manager today.
              </p>
              <LeadCaptureForm
                compact
                defaultState={stateInfo.name}
                sourcePage={`state-${stateInfo.slug}`}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
