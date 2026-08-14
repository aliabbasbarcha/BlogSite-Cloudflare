export function Aurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060a]"
    >
      <div className="aurora-blob-1 absolute -top-1/4 -left-1/4 h-[36rem] w-[36rem] rounded-full bg-indigo-600/40 blur-[110px]" />
      <div className="aurora-blob-2 absolute top-1/4 -right-1/4 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/30 blur-[110px]" />
      <div className="aurora-blob-3 absolute -bottom-1/4 left-1/4 h-[38rem] w-[38rem] rounded-full bg-cyan-500/30 blur-[120px]" />
    </div>
  );
}
