import type { MetadataRoute } from "next";
import { NAV_LINKS, SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const paths = Array.from(new Set(NAV_LINKS.map((link) => link.href)));

  return paths.map((path) => {
    const url = path === "/" ? baseUrl : `${baseUrl}${path}`;
    const isHome = path === "/";

    return {
      url,
      lastModified: new Date(),
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : 0.7,
    };
  });
}
