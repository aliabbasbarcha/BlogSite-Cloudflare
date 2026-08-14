import { defineField, defineType } from 'sanity'

export const siteType = defineType({
  name: 'site',
  title: 'Site',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Human-readable name, e.g. "BlogSite" or "CandlestickHub"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteId',
      title: 'Site ID',
      type: 'string',
      description:
        'Short unique id matching that deployment\'s NEXT_PUBLIC_SITE_ID env var, e.g. "blogsite". Lowercase letters, numbers, hyphens only.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, { name: 'lowercase-alphanumeric-hyphen' }),
    }),
    defineField({
      name: 'domain',
      title: 'Domain',
      type: 'url',
      description: 'The live domain this site is deployed to.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'siteId' },
  },
})
