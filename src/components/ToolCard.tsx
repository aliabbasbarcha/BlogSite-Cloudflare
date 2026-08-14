export type ToolCardData = {
  name: string;
  description: string;
  href: string;
};

export function ToolCard({ tool }: { tool: ToolCardData }) {
  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener"
      className="group flex flex-col rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <h3 className="text-lg font-semibold text-gray-50 group-hover:underline">
        {tool.name}
      </h3>
      <p className="mt-2 text-sm text-gray-400">{tool.description}</p>
    </a>
  );
}
