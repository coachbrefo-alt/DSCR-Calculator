import type { Metadata } from "next";
import { Shield, Users, Clock } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import LeadCaptureForm from "@/components/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Find a Property Manager Near You",
  description:
    "Connect with a verified local property manager. Get matched with professionals who know your state's landlord-tenant laws.",
  openGraph: {
    title: "Find a Property Manager | TenantRightsHub",
    description: "Connect with a verified local property manager. Free, fast, no cold calls.",
  },
};

const TRUST_SIGNALS = [
  {
    Icon: Shield,
    title: "Verified Professionals Only",
    body: "Every manager in our network is vetted for licensing and experience.",
  },
  {
    Icon: Users,
    title: "You Control the Contact",
    body: "No cold calls. We share your info only with the manager you're matched with.",
  },
  {
    Icon: Clock,
    title: "Response Within 24 Hours",
    body: "Most landlords hear back from a local manager the same business day.",
  },
];

export default function FindPropertyManagerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Top AdSense leaderboard */}
      <AdSlot slot="2233445566" format="leaderboard" className="mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Pitch */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Connect With a Trusted Property Manager in Your Area
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Managing rental properties is complex. The right property manager handles tenant
            screening, lease compliance, maintenance coordination, and rent collection — so you
            don&rsquo;t have to.
          </p>

          <ul className="space-y-5 mb-8">
            {TRUST_SIGNALS.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-400">
            Your information is never sold. It is shared only with the verified manager we match you with.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Get Connected Now</h2>
          <LeadCaptureForm sourcePage="find-property-manager" />
        </div>
      </div>
    </div>
  );
}
