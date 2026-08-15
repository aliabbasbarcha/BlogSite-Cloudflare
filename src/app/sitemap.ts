import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { POSTS_INDEX_QUERY } from "@/sanity/lib/queries";
import { siteId, siteUrl } from "@/lib/site";

// No Sanity webhook configured for this deployment (free-tier webhook slots
// are used by other sites) — without this, the sitemap is generated once at
// build time and never picks up new posts until the next deploy.
export const revalidate = 345600;

type PostEntry = {
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch<PostEntry[]>(POSTS_INDEX_QUERY, { siteId });

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...postEntries,
  ];
}
