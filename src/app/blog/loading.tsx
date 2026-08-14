export default function LoadingBlogIndex() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-12">
      <div className="h-9 w-32 rounded-md bg-white/10" />

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
          >
            <div className="h-44 w-full bg-white/10" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-5 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
