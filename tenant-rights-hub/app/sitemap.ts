import { MetadataRoute } from "next";
import statesData from "@/scripts/scraper/states.json";

const BASE = "https://tenantRightshub.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/find-property-manager`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const statePages: MetadataRoute.Sitemap = statesData.map((state) => ({
    url: `${BASE}/${state.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...statePages];
}
