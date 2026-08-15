# BlogSite

A blog built with [Next.js](https://nextjs.org) (App Router), [Tailwind CSS](https://tailwindcss.com), and [Sanity](https://www.sanity.io) as the content backend. Content is managed through Sanity Studio, hosted separately (free) on `sanity.studio` — see [Studio](#studio) below.

This codebase is designed to be deployed multiple times (one deployment per domain) against the **same** Sanity project/dataset, with each deployment showing only the posts authored for it — see [Multi-site setup](#multi-site-setup).

## Features

- Dark theme with an animated 3-color "aurora" gradient background (pure CSS, respects `prefers-reduced-motion`)
- Home page with a hero section, a compact "latest posts" grid, and a "Free Trading Calculators" section linking out to candlestickshub.com
- `/blog` — full post index, paginated 6 posts per page (GROQ slicing + count, so it never loads the whole collection at once)
- Sanity Studio, hosted separately for free on `sanity.studio`, for writing and editing posts (see [Studio](#studio))
- Multi-site content scoping — one Sanity project/dataset can back several domains (see [Multi-site setup](#multi-site-setup))
- Per-post SEO fields (meta title/description) with sensible fallbacks, self-referencing canonical URLs on every page, JSON-LD structured data (`WebSite` + `BlogPosting`), `sitemap.xml`, `robots.txt`, and `llms.txt`
- Social share buttons (X, LinkedIn, Facebook, WhatsApp, copy-link) on every post
- A no-login comment system on each post (name + comment, no account required)
- On-demand revalidation, per deployment either via a Sanity webhook (edits update the live site within seconds) or time-based only (see [On-demand revalidation](#on-demand-revalidation))
- A "More from the blog" internal-linking box (post titles only, no images) under every post's comments
- Loading skeletons and an error boundary for the post and blog-index routes
- Security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) applied to every route
- Site-wide rate limiting on Cloudflare (per-IP, via [`src/middleware.ts`](src/middleware.ts)) to blunt scraping and abuse
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
   | `SANITY_REVALIDATE_SECRET` | A random secret shared with the Sanity webhook (see [On-demand revalidation](#on-demand-revalidation) below). Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Leave unset on a deployment that has no webhook slot (see below). |
   | `NEXT_PUBLIC_STUDIO_URL` | URL of the deployed Studio (see [Studio](#studio) below) — linked to from the homepage's empty state. |
   | `NEXT_PUBLIC_SITE_DESCRIPTION` | Meta description / JSON-LD description for this deployment. Set a distinct value per deployment — sharing this codebase across multiple sites shouldn't mean sharing an identical meta description. Falls back to a generic default if unset. |

   If you don't have a Sanity project yet, run `npx sanity@latest init` in this folder and follow the prompts — it will create one and fill in the project ID/dataset for you.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Site: [http://localhost:3000](http://localhost:3000). For the content editor, see [Studio](#studio) below.

## Studio

Sanity Studio is **not** part of this Next.js app — it's built from the same [`sanity.config.ts`](sanity.config.ts) and [schema](src/sanity/schemaTypes) but hosted separately, for free, on Sanity's own `*.sanity.studio` domain. It used to be embedded at `/studio`, but that bundled Studio's editor code (rich text, structure builder, etc.) into the Next.js server, which pushed the Cloudflare Worker well past the free-tier size limit — keeping it separate avoids that entirely.

`sanity.config.ts` reads `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` (not the `NEXT_PUBLIC_*` ones) — that `SANITY_STUDIO_` prefix is Sanity's own convention for variables its build tool inlines into the Studio's browser bundle; unlike Next.js, it doesn't inline `NEXT_PUBLIC_*` vars, so reusing those here silently ships a broken Studio (`Missing environment variable` at runtime). Set both in `.env.local` alongside the `NEXT_PUBLIC_SANITY_*` ones.

To deploy or update the Studio:

```bash
npx sanity login    # once, opens a browser to authenticate
npx sanity deploy   # prompts for a studio hostname the first time, e.g. "blogsite" → blogsite.sanity.studio
```

Set `NEXT_PUBLIC_STUDIO_URL` to that URL in every deployment's env vars so the "no posts yet" empty state links to it.

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

Two ways to keep pages fresh, and every deployment doesn't have to use the same one:

**Webhook (instant, needs a free webhook slot)** — Sanity's free tier only allows 2 webhooks per project, and in a multi-site setup each deployment needs its own, so this only scales to 2 deployments unless you upgrade:

1. In [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **Webhooks** → **Create webhook**.
2. **URL**: `https://<your-domain>/api/revalidate`
3. **Dataset**: `production`
4. **Trigger on**: Create, Update, Delete
5. **Filter**: `_type in ["post", "comment", "author", "category", "site"]`
6. **Projection**: `{"_type": _type, "slug": slug.current, "siteId": select(_type == "post" => site->siteId, _type == "comment" => post->site->siteId)}`
7. **Secret**: the same value as `SANITY_REVALIDATE_SECRET`
8. Repeat for every deployment's domain (all pointing at the same dataset) — each one's handler ignores events for a different site.

The handler lives at [`src/app/api/revalidate/route.ts`](src/app/api/revalidate/route.ts) — it verifies the request signature, then revalidates the home page, `/blog`, `sitemap.xml`, `llms.txt`, and (for posts) the specific post page. Leave `SANITY_REVALIDATE_SECRET` unset on a deployment that has no webhook — the route just responds 500 and is otherwise unused.

**Time-based only (no webhook slot needed)** — used when a deployment doesn't have a free webhook slot. `export const revalidate` is set per route:

- `/` and `/blog` — 60 seconds, so a newly published post shows up within about a minute without needing a webhook
- `/blog/[slug]` and `/llms.txt` — 4 days, since a published post's content rarely changes after the fact

New comments still show up immediately either way, via the `revalidatePath` call in [`src/app/blog/[slug]/actions.ts`](src/app/blog/%5Bslug%5D/actions.ts).

## Project structure

```
src/app/
  page.tsx                   Home page (hero + latest posts + trading tools)
  blog/page.tsx               Paginated post index
  blog/loading.tsx             Loading skeleton for the index
  blog/error.tsx                Error boundary for /blog and /blog/[slug]
  blog/[slug]/page.tsx        Post page (content, share buttons, comments, "more from the blog")
  blog/[slug]/loading.tsx      Loading skeleton for a post
  blog/[slug]/actions.ts      Server action that saves a new comment
  blog/[slug]/CommentForm.tsx Comment form (client component)
  api/revalidate/route.ts     Sanity webhook handler (on-demand revalidation)
  sitemap.ts, robots.ts       Generated SEO files
  llms.txt/route.ts           Generated llms.txt
  icon.svg                    Favicon
src/components/
  Aurora.tsx                  Animated gradient background
  PostCard.tsx, Pagination.tsx, ToolCard.tsx, ShareButtons.tsx
src/sanity/
  schemaTypes/                Content model (post, author, category, comment, site)
  lib/                        Sanity clients (read + write) and GROQ queries
src/lib/site.ts                Site name/description/URL/site-ID/Studio-URL constants, jsonLd() helper
src/middleware.ts               Per-IP rate limiting (see Cloudflare Workers deployment below)
next.config.ts                 Security headers (CSP etc.) and Sanity image remote pattern
wrangler.jsonc                  Cloudflare Worker config (name, compatibility flags, assets, rate limiter)
open-next.config.ts             OpenNext Cloudflare adapter build config
sanity.config.ts                Studio config (schema, plugins) — deployed separately, see Studio
sanity.cli.ts                   Studio CLI config (projectId/dataset for `npx sanity deploy`)
```

## Deployment

### Cloudflare Workers

Deploys via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare` + `wrangler`, already in `devDependencies`):

1. `npx wrangler login` — authenticate the CLI with your Cloudflare account.
2. Set the same variables from `.env.local` as Worker secrets/vars (`NEXT_PUBLIC_*` ones are inlined at build time, so they must also be present in `.env.local`/CI when you build; `SANITY_API_READ_TOKEN` and `SANITY_REVALIDATE_SECRET` should additionally be set with `npx wrangler secret put <NAME>` so they're available at runtime), with `NEXT_PUBLIC_SITE_URL` set to your production domain and `NEXT_PUBLIC_SITE_ID` set per deployment (see [Multi-site setup](#multi-site-setup)).
3. In your Sanity project's API settings, add your production URL to **CORS origins**.
4. Decide per deployment whether it gets a [webhook or relies on time-based revalidation](#on-demand-revalidation) — free-tier Sanity projects only get 2 webhook slots.
5. `npm run deploy` — runs `opennextjs-cloudflare build` then `opennextjs-cloudflare deploy`. Use `npm run preview` to build and run it locally against Workers runtime first.
6. Worker config lives in [`wrangler.jsonc`](wrangler.jsonc) (name, compatibility flags, assets binding) and [`open-next.config.ts`](open-next.config.ts) (OpenNext build options).

**Rate limiting**: [`src/middleware.ts`](src/middleware.ts) blocks an IP for the rest of the window once it exceeds 60 requests/60s, using the `RATE_LIMITER` binding declared in `wrangler.jsonc`'s `unsafe.bindings` (Rate Limiting bindings are a Workers platform feature, free on every plan — not the same thing as the dashboard's WAF rate limiting rules, which are paid). Static assets never hit the Worker (served straight from the `ASSETS` binding), so this only counts page/API requests. Adjust the `limit`/`period` in `wrangler.jsonc` if it's too strict or too loose for your traffic. This binding only works when deployed or run through `wrangler dev`/`npm run preview` — plain `next dev` has no `RATE_LIMITER`, so the middleware just skips the check locally.

### Vercel or Netlify

Also deploys cleanly to [Vercel](https://vercel.com/new) or [Netlify](https://netlify.com):

1. Set the same environment variables from `.env.local` in the project settings, with `NEXT_PUBLIC_SITE_URL` set to your production domain and `NEXT_PUBLIC_SITE_ID` set per deployment (see [Multi-site setup](#multi-site-setup)).
2. In your Sanity project's API settings, add your production URL to **CORS origins**.
3. Decide per deployment whether it gets a [webhook or relies on time-based revalidation](#on-demand-revalidation) — free-tier Sanity projects only get 2 webhook slots.
4. On Vercel: enable **Speed Insights** for the project in the dashboard (Speed Insights tab) to start collecting data.
5. On Netlify: the Next.js build can fail with "Secrets scanning found secrets in build" because `NEXT_PUBLIC_*` values are (correctly) inlined into the client bundle, and Netlify's scanner flags that by default. Fix by adding an env var listing every configured key:
   ```
   SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SANITY_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET,NEXT_PUBLIC_SANITY_API_VERSION,NEXT_PUBLIC_SITE_ID,NEXT_PUBLIC_SITE_URL,NEXT_PUBLIC_STUDIO_URL,NEXT_PUBLIC_SITE_DESCRIPTION,SANITY_API_READ_TOKEN,SANITY_REVALIDATE_SECRET
   ```
   (no spaces after the commas), then redeploy with cache cleared.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Sanity documentation](https://www.sanity.io/docs)
