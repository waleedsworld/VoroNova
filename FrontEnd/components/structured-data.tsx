const SITE_URL = "https://voronova.waleeds.world"

/**
 * JSON-LD structured data for rich search results.
 * Describes VoroNova as a SoftwareApplication plus its authoring organization,
 * helping Google/Bing render richer cards and understand the product.
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: "VoroNova",
        applicationCategory: "DesignApplication",
        applicationSubCategory: "Space Habitat Design",
        operatingSystem: "Web",
        url: SITE_URL,
        description:
          "VoroNova turns complex space-habitat engineering into an interactive, AI-assisted design studio. Generate NASA-grade floor plans, visualize them in 2D/3D, and iterate in seconds.",
        image: `${SITE_URL}/og-image.png`,
        featureList: [
          "AI habitat generation from plain-English mission briefs",
          "Conversational step-by-step design assistant",
          "2D to 3D visualization",
          "CAD-style ADD / MODIFY / REMOVE editing",
          "Automatic efficiency, safety, and cost scoring",
          "Export and side-by-side design comparison",
        ],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@id": `${SITE_URL}/#person`,
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Waleed Ajmal",
        url: "https://github.com/waleedsworld",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "VoroNova",
        description:
          "An AI-powered design studio for space habitats — trained on authentic NASA schematics.",
        publisher: {
          "@id": `${SITE_URL}/#person`,
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
