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

export const siteDescription = "A blog site for sharing knowledge and insights on various topics, including technology, programming, and personal experiences.";

// Escapes "<" so a "</script>" inside CMS content can't break out of a
// JSON-LD <script> tag when injected via dangerouslySetInnerHTML.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
