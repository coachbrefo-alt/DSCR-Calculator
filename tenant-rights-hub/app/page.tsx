import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import StateGrid from "@/components/StateGrid";

export const metadata: Metadata = {
  title: "TenantRightsHub | Landlord-Tenant Laws for All 50 States",
  description:
    "Search official landlord-tenant statutes for all 50 US states. Know your rights as a tenant or property owner. Free, searchable, updated from official sources.",
  openGraph: {
    title: "TenantRightsHub | Landlord-Tenant Laws for All 50 States",
    description: "Searchable landlord-tenant statutes for every US state.",
    url: "https://tenantRightshub.com",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
            Know Your Rights.<br />Find Your State.
          </h1>
          <p className="text-blue-200 text-lg mb-2 max-w-xl mx-auto">
            Official landlord-tenant statutes for all 50 US states — searchable, free, and updated from Justia.com.
          </p>
        </div>
      </section>

      {/* AdSense leaderboard */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <AdSlot slot="1234567890" format="leaderboard" />
      </div>

      {/* 50-state grid with search */}
      <StateGrid />

      {/* Property Manager CTA banner */}
      <section className="border-y border-amber-200 bg-amber-50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Are you a property manager? Get leads in your market.
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Property owners in your area are looking for professional management — connect with them for free.
            </p>
          </div>
          <Link
            href="/find-property-manager"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Get Leads in Your Market →
          </Link>
        </div>
      </section>
    </>
  );
}
