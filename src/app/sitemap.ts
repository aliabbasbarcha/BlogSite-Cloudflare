import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { POSTS_INDEX_QUERY } from "@/sanity/lib/queries";
import { siteId, siteUrl } from "@/lib/site";

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
