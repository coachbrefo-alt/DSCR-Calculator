import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">TenantRightsHub</h3>
          <p className="text-sm leading-relaxed">
            Aggregating official landlord-tenant statutes for all 50 US states into one searchable platform.
          </p>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="text-sm space-y-2">
            <li><Link href="/" className="hover:text-white transition-colors">Browse All States</Link></li>
            <li><Link href="/find-property-manager" className="hover:text-white transition-colors">Find a Property Manager</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-3">Legal Disclaimer</h3>
          <p className="text-xs leading-relaxed">
            This site provides statute text for informational and educational purposes only. Nothing on
            this site constitutes legal advice. Consult a licensed attorney in your state for legal guidance.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-600 mt-10">
        © {new Date().getFullYear()} TenantRightsHub. All rights reserved.
      </div>
    </footer>
  );
}
