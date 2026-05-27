import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenant-Landlord Law Aggregator",
  description: "Search landlord-tenant statutes by state",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
