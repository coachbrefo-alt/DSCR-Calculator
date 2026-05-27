import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About TenantRightsHub",
  description:
    "TenantRightsHub aggregates official landlord-tenant statutes from all 50 US states into one searchable platform.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About TenantRightsHub</h1>

      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          TenantRightsHub aggregates official landlord-tenant statutes from all 50 US states into one
          searchable platform. Our mission is to make legal information accessible to everyone — tenants,
          landlords, and property professionals alike.
        </p>
        <p>
          All statute text is sourced from{" "}
          <a href="https://law.justia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Justia.com
          </a>{" "}
          and official state legislative publications. We refresh our database regularly to keep
          information current.
        </p>

        <h2 className="text-xl font-bold text-gray-900 pt-4">Legal Disclaimer</h2>
        <p>
          This website provides statute text for informational and educational purposes only. Nothing
          on this site constitutes legal advice. For questions specific to your situation, please
          consult a licensed attorney in your state.
        </p>

        <h2 className="text-xl font-bold text-gray-900 pt-4">Data & Accuracy</h2>
        <p>
          While we strive for accuracy, statutes change. Always verify the current version of a
          statute against your state legislature&rsquo;s official website before relying on it.
        </p>

        <h2 className="text-xl font-bold text-gray-900 pt-4">Contact</h2>
        <p>
          Found an error or want to report outdated information? Email us at{" "}
          <a href="mailto:hello@tenantRightshub.com" className="text-blue-600 hover:underline">
            hello@tenantRightshub.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
