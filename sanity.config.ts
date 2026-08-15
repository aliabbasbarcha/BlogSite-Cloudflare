/**
 * This configuration is for the standalone Sanity Studio hosted separately
 * from the Next.js app (via `npx sanity deploy`, free on sanity.studio) —
 * kept out of the Next.js app so its bundle doesn't count against the
 * Cloudflare Worker's free-tier size limit.
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'

// Sanity's own build tool (used by `sanity deploy`) only statically inlines
// SANITY_STUDIO_*-prefixed env vars into the Studio's browser bundle — unlike
// Next.js, it does not inline NEXT_PUBLIC_* vars, so this config can't reuse
// ./src/sanity/env.ts (that one is for the Next.js app only).
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}

const apiVersion = process.env.SANITY_STUDIO_API_VERSION || '2026-08-10'
const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: SANITY_STUDIO_DATASET'
)
const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: SANITY_STUDIO_PROJECT_ID'
)

export default defineConfig({
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
