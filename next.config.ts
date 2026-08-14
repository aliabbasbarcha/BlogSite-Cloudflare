import type { NextConfig } from "next";

// Applied everywhere, including /studio — safe with no downsides there.
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// Skipped on /studio: the embedded Sanity Studio bundle needs eval/blob/worker
// sources a strict CSP would block, and framing restrictions aren't relevant there.
const siteSecurityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is required because Next.js's streaming/hydration
      // bootstrap injects inline <script> tags with no nonce; without this,
      // the browser blocks them and pages get stuck showing loading.tsx
      // forever since the Suspense fallback never gets swapped for content.
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.sanity.io",
      "font-src 'self'",
      "connect-src 'self' https://va.vercel-scripts.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: baseSecurityHeaders },
      { source: "/:path((?!studio).*)", headers: siteSecurityHeaders },
    ];
  },
};

export default nextConfig;
