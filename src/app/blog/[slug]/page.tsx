import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import Image from "next/image";

import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { writeClient } from "@/sanity/lib/writeClient";
import { COMMENTS_QUERY, POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";
import { jsonLd, siteId, siteName, siteUrl } from "@/lib/site";

import { CommentForm } from "./CommentForm";
import { ShareButtons } from "@/components/ShareButtons";

// Fallback in case the Sanity webhook (see src/app/api/revalidate) doesn't fire.
// New comments still show up immediately via the revalidatePath in ./actions.ts.
export const revalidate = 604800;

type Comment = {
  _id: string;
  name: string;
  text: string;
  _createdAt: string;
};

type SanityImage = import("sanity").Image & { alt?: string };

type Post = {
  _id: string;
  title: string;
  excerpt?: string;
  mainImage?: SanityImage;
  body?: PortableTextBlock[];
  publishedAt?: string;
  updatedAt?: string;
  author?: { name: string };
  seo?: { metaTitle?: string; metaDescription?: string };
};

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: SanityImage }) => (
      <Image
        src={urlFor(value).width(1200).height(675).url()}
        alt={value.alt || ""}
        width={1200}
        height={675}
        className="rounded-lg object-cover"
      />
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || "";
      const isExternal = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(POST_SLUGS_QUERY, { siteId });
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(POST_QUERY, { slug, siteId });

  if (!post) {
    return {};
  }

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;
  const ogImage = post.mainImage
    ? [{ url: urlFor(post.mainImage).width(1200).height(630).url() }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: { title, description, images: ogImage },
    twitter: { card: "summary_large_image", title, description, images: ogImage },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(POST_QUERY, { slug, siteId });

  if (!post) {
    notFound();
  }

  const comments = await writeClient.fetch<Comment[]>(COMMENTS_QUERY, {
    postId: post._id,
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.mainImage
      ? urlFor(post.mainImage).width(1200).height(630).url()
      : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : undefined,
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: `${siteUrl}/blog/${slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }}
      />
      <h1 className="text-3xl font-bold tracking-tight text-white">{post.title}</h1>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-gray-400">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.publishedAt && (
            <time className="ml-2">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
        <ShareButtons url={`${siteUrl}/blog/${slug}`} title={post.title} />
      </div>

      {post.mainImage && (
        <Image
          src={urlFor(post.mainImage).width(1200).height(600).url()}
          alt={post.mainImage.alt || post.title}
          width={1200}
          height={600}
          className="mt-6 w-full rounded-lg object-cover"
        />
      )}

      {post.body && (
        <div className="prose prose-invert mt-8 max-w-none prose-a:text-indigo-400">
          <PortableText value={post.body} components={portableTextComponents} />
        </div>
      )}

      <div className="mt-10 border-t border-white/10 pt-6">
        <ShareButtons url={`${siteUrl}/blog/${slug}`} title={post.title} />
      </div>

      <section className="mt-10 border-t border-white/10 pt-8">
        <h2 className="text-xl font-semibold text-white">
          Comments{comments.length > 0 && ` (${comments.length})`}
        </h2>

        <ul className="mt-6 flex flex-col gap-6">
          {comments.map((comment) => (
            <li key={comment._id} className="border-b border-white/10 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-gray-100">{comment.name}</span>
                <time className="text-xs text-gray-500">
                  {new Date(comment._createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-gray-300">{comment.text}</p>
            </li>
          ))}
        </ul>

        <CommentForm postId={post._id} slug={slug} />
      </section>
    </article>
  );
}
