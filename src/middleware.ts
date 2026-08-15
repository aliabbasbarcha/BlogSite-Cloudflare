import { NextResponse, type NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const config = {
  // Static assets (_next/static, images, favicon) are served straight from
  // the Cloudflare Assets binding and never reach this Worker, so this
  // matcher only needs to cover actual page/API requests.
  matcher: ["/((?!_next/static|_next/image).*)"],
};

type RateLimiterBinding = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

export default async function middleware(request: NextRequest) {
  const { env } = getCloudflareContext();
  const rateLimiter = (env as unknown as { RATE_LIMITER?: RateLimiterBinding })
    .RATE_LIMITER;

  if (rateLimiter) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const { success } = await rateLimiter.limit({ key: ip });
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  return NextResponse.next();
}
