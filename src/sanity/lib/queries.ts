import { defineQuery } from "next-sanity";

// Every post query is scoped to the current deployment's site so that
// content authored for one site never leaks into another.
const SITE_POST_FILTER = `_type == "post" && defined(slug.current) && site->siteId == $siteId`;

const POST_CARD_PROJECTION = `{
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt
}`;

export const LATEST_POSTS_QUERY = defineQuery(`
  *[${SITE_POST_FILTER}] | order(publishedAt desc) [0...$limit] ${POST_CARD_PROJECTION}
`);

export const PAGINATED_POSTS_QUERY = defineQuery(`
  {
    "posts": *[${SITE_POST_FILTER}] | order(publishedAt desc) [$start...$end] ${POST_CARD_PROJECTION},
    "total": count(*[${SITE_POST_FILTER}])
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug && site->siteId == $siteId][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    body,
    publishedAt,
    "updatedAt": _updatedAt,
    seo,
    "author": author->{name, image, bio},
    "categories": categories[]->{title}
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[${SITE_POST_FILTER}][].slug.current
`);

export const COMMENTS_QUERY = defineQuery(`
  *[_type == "comment" && post._ref == $postId] | order(_createdAt asc) {
    _id,
    name,
    text,
    _createdAt
  }
`);

export const POSTS_INDEX_QUERY = defineQuery(`
  *[${SITE_POST_FILTER}] | order(publishedAt desc) {
    title,
    excerpt,
    "slug": slug.current,
    publishedAt,
    "updatedAt": _updatedAt
  }
`);
