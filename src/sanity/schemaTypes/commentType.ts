import { defineField, defineType } from "sanity";

export const commentType = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "text",
      title: "Comment",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(2000),
    }),
    defineField({
      name: "post",
      title: "Post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "text",
      post: "post.title",
    },
    prepare({ title, subtitle, post }) {
      return {
        title: `${title}${post ? ` on "${post}"` : ""}`,
        subtitle,
      };
    },
  },
});
