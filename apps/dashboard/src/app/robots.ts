import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboard.geraldmanurung.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /records is the admin surface since the entries -> records rename; it is auth-gated,
        // but it should not be advertised either.
        disallow: ["/records", "/entries", "/stats", "/import", "/settings", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
