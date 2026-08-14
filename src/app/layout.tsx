import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { Aurora } from "@/components/Aurora";
import { jsonLd, siteDescription, siteName, siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-gray-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }}
        />
        <Aurora />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" prefetch={false} className="flex items-center">
              <Image src="/logo.svg" alt="BlogSite" width={168} height={32} priority />
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
              <Link href="/" prefetch={false} className="hover:text-indigo-400">
                Home
              </Link>
              <Link href="/blog" prefetch={false} className="hover:text-indigo-400">
                Blog
              </Link>
              <a
                href="https://candlestickshub.com/tools/"
                target="_blank"
                rel="noopener"
                className="hover:text-indigo-400"
              >
                Trading Calculator
              </a>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 bg-black/30 backdrop-blur-md">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-400">
            © {new Date().getFullYear()} BlogSite
          </div>
        </footer>

        <SpeedInsights />
      </body>
    </html>
  );
}
