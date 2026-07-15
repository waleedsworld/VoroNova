import type { MetadataRoute } from "next"

const SITE_URL = "https://voronova.waleeds.world"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/app/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/results/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}

export const dynamic = "force-static"
