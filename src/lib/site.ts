export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "BlogSite";

// Identifies which "site" document's posts this deployment shows.
// Missing this in production would mean every site's content leaks
// into every deployment, so fail loudly instead of silently.
export const siteId = (() => {
  const value = process.env.NEXT_PUBLIC_SITE_ID;
  if (!value) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SITE_ID");
  }
  return value;
})();

// Configurable per deployment (see .env.local.example) so multiple sites
// sharing this codebase don't all render an identical meta description.
export const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "A blog site for sharing knowledge and insights on various topics, including technology, programming, and personal experiences.";

// Studio is hosted separately (via `npx sanity deploy`, free on sanity.studio)
// rather than embedded in this app — see README's "Studio" section.
export const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || "https://www.sanity.io/manage";

// Escapes "<" so a "</script>" inside CMS content can't break out of a
// JSON-LD <script> tag when injected via dangerouslySetInnerHTML.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
