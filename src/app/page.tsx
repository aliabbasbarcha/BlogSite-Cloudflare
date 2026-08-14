import Link from "next/link";

import { client } from "@/sanity/lib/client";
import { LATEST_POSTS_QUERY } from "@/sanity/lib/queries";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { ToolCard, type ToolCardData } from "@/components/ToolCard";
import { siteId } from "@/lib/site";

// Fallback in case the Sanity webhook (see src/app/api/revalidate) doesn't fire.
export const revalidate = 604800;

const LATEST_POSTS_LIMIT = 3;

const TRADING_TOOLS: ToolCardData[] = [
  {
    name: "Position Size Calculator",
    description: "Exact lot size for forex, gold, crypto and futures",
    href: "https://candlestickshub.com/tools/position-size-calculator/",
  },
  {
    name: "Prop Firm Calculator",
    description: "Drawdown, daily loss limit, profit target and consistency rule",
    href: "https://candlestickshub.com/tools/prop-firm-calculator/",
  },
  {
    name: "Trading Performance Calculator",
    description: "Win rate, expectancy, risk-reward and breakeven",
    href: "https://candlestickshub.com/tools/trading-performance-calculator/",
  },
  {
    name: "Margin & Leverage Calculator",
    description: "Required margin, free margin, margin call level",
    href: "https://candlestickshub.com/tools/margin-leverage-calculator/",
  },
  {
    name: "Profit & Loss Calculator",
    description: "What a trade pays in forex pips, gold or crypto",
    href: "https://candlestickshub.com/tools/profit-loss-calculator/",
  },
  {
    name: "Compounding & DCA Calculator",
    description: "Account growth and dollar cost averaging",
    href: "https://candlestickshub.com/tools/compounding-dca-calculator/",
  },
  {
    name: "Crypto Position Calculator",
    description: "Liquidation price, funding rate cost, impermanent loss",
    href: "https://candlestickshub.com/tools/crypto-position-calculator/",
  },
  {
    name: "Crypto Tax Calculator",
    description: "Cost basis using FIFO, LIFO or HIFO",
    href: "https://candlestickshub.com/tools/crypto-tax-calculator/",
  },
  {
    name: "Staking Yield Calculator",
    description: "Real returns across major proof-of-stake coins",
    href: "https://candlestickshub.com/tools/staking-calculator/",
  },
];

export default async function HomePage() {
  const posts = await client.fetch<PostCardData[]>(LATEST_POSTS_QUERY, {
    limit: LATEST_POSTS_LIMIT,
    siteId,
  });

  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-400">
            Welcome to BlogSite
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Words that inform.
            <br />
            Stories that inspire.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
            A space for in-depth articles, practical guides, and honest
            perspectives.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/blog"
              prefetch={false}
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              Explore posts
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Latest posts
          </h2>
          {posts.length > 0 && (
            <Link
              href="/blog"
              prefetch={false}
              className="text-sm font-medium text-indigo-400 hover:underline"
            >
              View all posts →
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="mt-6 text-gray-400">
            No posts yet. Add some in the{" "}
            <Link href="/studio" prefetch={false} className="text-indigo-400 underline">
              Studio
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Free Trading Calculators
          </h2>
          <p className="mt-2 text-gray-400">
            Risk, position size and prop firm tools — free, no signup, formulas
            shown.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TRADING_TOOLS.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
