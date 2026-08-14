"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitComment, type CommentFormState } from "./actions";

const initialState: CommentFormState = { status: "idle" };

export function CommentForm({ postId, slug }: { postId: string; slug: string }) {
  const action = submitComment.bind(null, postId, slug);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-300">
          Comment
        </label>
        <textarea
          id="text"
          name="text"
          required
          maxLength={2000}
          rows={4}
          className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-green-400">Comment posted.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
