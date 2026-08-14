import { client } from "@/sanity/lib/client";
import { POSTS_INDEX_QUERY } from "@/sanity/lib/queries";
import { siteDescription, siteId, siteName, siteUrl } from "@/lib/site";

// Fallback in case the Sanity webhook (see src/app/api/revalidate) doesn't fire.
export const revalidate = 604800;

type PostEntry = {
  title: string;
  excerpt?: string;
  slug: string;
};

export async function GET() {
  const posts = await client.fetch<PostEntry[]>(POSTS_INDEX_QUERY, { siteId });

  const postLines = posts
    .map((post) => {
      const summary = post.excerpt ? `: ${post.excerpt}` : "";
      return `- [${post.title}](${siteUrl}/blog/${post.slug})${summary}`;
    })
    .join("\n");

  const body = `# ${siteName}

> ${siteDescription}

## Posts

${postLines || "- No posts published yet."}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
