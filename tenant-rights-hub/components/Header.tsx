import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-200 transition-colors">
          TenantRightsHub
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            All States
          </Link>
          <Link href="/find-property-manager" className="hover:text-blue-200 transition-colors">
            Find Property Manager
          </Link>
          <Link href="/about" className="hover:text-blue-200 transition-colors">
            About
          </Link>
          <Link
            href="/find-property-manager"
            className="bg-amber-400 hover:bg-amber-300 text-blue-900 font-semibold px-4 py-1.5 rounded-lg transition-colors text-xs"
          >
            Get Free Leads →
          </Link>
        </nav>
      </div>
    </header>
  );
}
