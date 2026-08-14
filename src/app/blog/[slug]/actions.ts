"use server";

import { revalidatePath } from "next/cache";

import { writeClient } from "@/sanity/lib/writeClient";

export type CommentFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitComment(
  postId: string,
  slug: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const honeypot = String(formData.get("website") || "");
  if (honeypot) {
    return { status: "success" };
  }

  const name = String(formData.get("name") || "").trim();
  const text = String(formData.get("text") || "").trim();

  if (!name || !text) {
    return { status: "error", message: "Please fill in your name and comment." };
  }
  if (name.length > 80) {
    return { status: "error", message: "Name must be under 80 characters." };
  }
  if (text.length > 2000) {
    return { status: "error", message: "Comment must be under 2000 characters." };
  }

  await writeClient.create({
    _type: "comment",
    name,
    text,
    post: { _type: "reference", _ref: postId },
  });

  revalidatePath(`/blog/${slug}`);

  return { status: "success" };
}
