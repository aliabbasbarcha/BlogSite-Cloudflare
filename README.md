# BlogSite

A blog built with [Next.js](https://nextjs.org) (App Router), [Tailwind CSS](https://tailwindcss.com), and [Sanity](https://www.sanity.io) as the content backend. Content is managed through an embedded Sanity Studio at `/studio` — no separate admin app to run.

This codebase is designed to be deployed multiple times (one deployment per domain) against the **same** Sanity project/dataset, with each deployment showing only the posts authored for it — see [Multi-site setup](#multi-site-setup).

## Features

- Dark theme with an animated 3-color "aurora" gradient background (pure CSS, respects `prefers-reduced-motion`)
- Home page with a hero section, a compact "latest posts" grid, and a "Free Trading Calculators" section linking out to candlestickshub.com
- `/blog` — full post index, paginated 6 posts per page (GROQ slicing + count, so it never loads the whole collection at once)
- Sanity Studio embedded at `/studio` for writing and editing posts
- Multi-site content scoping — one Sanity project/dataset can back several domains (see [Multi-site setup](#multi-site-setup))
- Per-post SEO fields (meta title/description) with sensible fallbacks, self-referencing canonical URLs on every page, JSON-LD structured data (`WebSite` + `BlogPosting`), `sitemap.xml`, `robots.txt`, and `llms.txt`
- Social share buttons (X, LinkedIn, Facebook, WhatsApp, copy-link) on every post
- A no-login comment system on each post (name + comment, no account required)
- On-demand revalidation via a Sanity webhook — edits in the Studio update the live site within seconds, with a 1-week time-based fallback
- Loading skeletons and an error boundary for the post and blog-index routes
- Security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) applied to every route except `/studio`
- Custom SVG favicon and logo
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- Link prefetching is disabled site-wide to conserve request usage on free hosting plans

## Requirements

- [Node.js](https://nodejs.org) 20+
- A [Sanity](https://www.sanity.io) account (free tier is fine)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and fill in your Sanity project details:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID (from [sanity.io/manage](https://sanity.io/manage) or `npx sanity projects list`) |
   | `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version, e.g. `2024-01-01` |
   | `NEXT_PUBLIC_SITE_URL` | Public URL of the site (used in the sitemap, robots.txt, and SEO tags). Use `http://localhost:3000` locally |
   | `NEXT_PUBLIC_SITE_ID` | Which `site` document's posts this deployment shows — must match a `siteId` value in the Studio (see [Multi-site setup](#multi-site-setup)) |
   | `SANITY_API_READ_TOKEN` | A Sanity API token with **Editor** permissions, used server-side to save and read comments. Not needed for writing posts in the Studio — that just needs you to be logged into your Sanity account in the browser. Create one at `sanity.io/manage` → your project → API → Tokens |
   | `SANITY_REVALIDATE_SECRET` | A random secret shared with the Sanity webhook (see [On-demand revalidation](#on-demand-revalidation) below). Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

   If you don't have a Sanity project yet, run `npx sanity@latest init` in this folder and follow the prompts — it will create one and fill in the project ID/dataset for you.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   - Site: [http://localhost:3000](http://localhost:3000)
   - Studio (content editor): [http://localhost:3000/studio](http://localhost:3000/studio)

## Content model

Defined in [`src/sanity/schemaTypes`](src/sanity/schemaTypes):

- **post** — title, slug, **site** (required reference, see below), author, main image, categories, excerpt, body (rich text with inline images and links), SEO fields (meta title/description)
- **author** — name, slug, image, bio
- **category** — title, description
- **comment** — name, comment text, reference to a post. Comments are created via a server action and publish immediately with no approval step; moderate by deleting unwanted ones from the Studio.
- **site** — name, `siteId` (matches a deployment's `NEXT_PUBLIC_SITE_ID`), domain

## Multi-site setup

One Sanity project/dataset can back several deployments (domains), each showing only its own posts:

- Every `post` has a required **Site** reference. Every GROQ query that lists or fetches posts filters by `site->siteId == $siteId`, where `$siteId` comes from that deployment's `NEXT_PUBLIC_SITE_ID` env var. A post from another site simply won't appear — including a direct hit on `/blog/<slug>`, which 404s.
- **To add a new site**: create a `site` document in the Studio (name, a short lowercase `siteId`, domain), then deploy this same codebase as a new Vercel project with `NEXT_PUBLIC_SITE_ID` set to that `siteId` and its own `NEXT_PUBLIC_SITE_URL`. No code changes needed.
- **Webhook**: since all sites share one dataset, Sanity sends the same change events to every deployment's webhook. The webhook projection includes each changed post/comment's `siteId` (see below), and [`/api/revalidate`](src/app/api/revalidate/route.ts) skips revalidating if it doesn't match `NEXT_PUBLIC_SITE_ID` — so create a webhook per deployment, all pointing at the same dataset.
- `NEXT_PUBLIC_SITE_ID` is required — the app throws on startup if it's missing, rather than silently showing every site's posts.

## On-demand revalidation

Pages are cached for up to 1 week as a fallback, but a Sanity webhook triggers an immediate refresh whenever content changes:

1. In [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **Webhooks** → **Create webhook**.
2. **URL**: `https://<your-domain>/api/revalidate`
3. **Dataset**: `production`
4. **Trigger on**: Create, Update, Delete
5. **Filter**: `_type in ["post", "comment", "author", "category", "site"]`
6. **Projection**: `{"_type": _type, "slug": slug.current, "siteId": select(_type == "post" => site->siteId, _type == "comment" => post->site->siteId)}`
7. **Secret**: the same value as `SANITY_REVALIDATE_SECRET`
8. Repeat for every deployment's domain (all pointing at the same dataset) — each one's handler ignores events for a different site.

The handler lives at [`src/app/api/revalidate/route.ts`](src/app/api/revalidate/route.ts) — it verifies the request signature, then revalidates the home page, `/blog`, `sitemap.xml`, `llms.txt`, and (for posts) the specific post page.

## Project structure

```
src/app/
  page.tsx                   Home page (hero + latest posts + trading tools)
  blog/page.tsx               Paginated post index
  blog/loading.tsx             Loading skeleton for the index
  blog/error.tsx                Error boundary for /blog and /blog/[slug]
  blog/[slug]/page.tsx        Post page (content, share buttons, comments)
  blog/[slug]/loading.tsx      Loading skeleton for a post
  blog/[slug]/actions.ts      Server action that saves a new comment
  blog/[slug]/CommentForm.tsx Comment form (client component)
  api/revalidate/route.ts     Sanity webhook handler (on-demand revalidation)
  studio/[[...tool]]/         Embedded Sanity Studio
  sitemap.ts, robots.ts       Generated SEO files
  llms.txt/route.ts           Generated llms.txt
  icon.svg                    Favicon
src/components/
  Aurora.tsx                  Animated gradient background
  PostCard.tsx, Pagination.tsx, ToolCard.tsx, ShareButtons.tsx
src/sanity/
  schemaTypes/                Content model (post, author, category, comment, site)
  lib/                        Sanity clients (read + write) and GROQ queries
src/lib/site.ts                Site name/description/URL/site-ID constants, jsonLd() helper
next.config.ts                 Security headers (CSP etc.) and Sanity image remote pattern
```

## Deployment

Deploys cleanly to [Vercel](https://vercel.com/new) or [Netlify](https://netlify.com):

1. Set the same environment variables from `.env.local` in the project settings, with `NEXT_PUBLIC_SITE_URL` set to your production domain and `NEXT_PUBLIC_SITE_ID` set per deployment (see [Multi-site setup](#multi-site-setup)).
2. In your Sanity project's API settings, add your production URL to **CORS origins**.
3. Set up the [on-demand revalidation webhook](#on-demand-revalidation) pointing at your production domain.
4. On Vercel: enable **Speed Insights** for the project in the dashboard (Speed Insights tab) to start collecting data.
5. On Netlify: the Next.js build can fail with "Secrets scanning found secrets in build" because `NEXT_PUBLIC_*` values are (correctly) inlined into the client bundle, and Netlify's scanner flags that by default. Fix by adding an env var listing every configured key:
   ```
   SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SANITY_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET,NEXT_PUBLIC_SANITY_API_VERSION,NEXT_PUBLIC_SITE_ID,NEXT_PUBLIC_SITE_URL,SANITY_API_READ_TOKEN,SANITY_REVALIDATE_SECRET
   ```
   (no spaces after the commas), then redeploy with cache cleared.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Sanity documentation](https://www.sanity.io/docs)
