import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://www.taocreativelabs.com";

    return [
        {
            url: baseUrl,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/solutions`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/consulting`,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
