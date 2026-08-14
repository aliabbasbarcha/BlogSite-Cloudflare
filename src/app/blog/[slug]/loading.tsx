export default function LoadingPost() {
  return (
    <article className="mx-auto max-w-3xl animate-pulse px-4 py-12">
      <div className="h-9 w-3/4 rounded-md bg-white/10" />
      <div className="mt-3 h-4 w-40 rounded-md bg-white/10" />

      <div className="mt-6 h-[400px] w-full rounded-lg bg-white/10" />

      <div className="mt-8 flex flex-col gap-3">
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
      </div>
    </article>
  );
}
