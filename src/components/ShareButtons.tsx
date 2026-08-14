"use client";

import { useState } from "react";

function IconButton({
  href,
  label,
  onClick,
  children,
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; nothing to fall back to silently.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">Share:</span>

      <IconButton href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} label="Share on X">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.5-7.2L4.4 22H1.3l8.1-9.3L1 2h7.3l5 6.6L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" />
        </svg>
      </IconButton>

      <IconButton href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} label="Share on LinkedIn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.2V21h-4v-6c0-1.43-.03-3.28-2-3.28-2 0-2.3 1.56-2.3 3.18V21h-4V9Z" />
        </svg>
      </IconButton>

      <IconButton href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} label="Share on Facebook">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46H16.6V4.34C16.3 4.3 15.3 4.2 14.1 4.2c-2.4 0-4 1.46-4 4.15v2.05H7.5v3h2.6V21h3.4Z" />
        </svg>
      </IconButton>

      <IconButton href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.3.4.5 1.9-1.9-.5-.4.2A8.2 8.2 0 1 1 12 3.8Zm-3.4 4.3c-.2 0-.5 0-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.8 2.1.9 2.6.7 3 .7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.1.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5Z" />
        </svg>
      </IconButton>

      <IconButton label={copied ? "Copied!" : "Copy link"} onClick={handleCopy}>
        {copied ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M9.5 14.5 14.5 9.5M11 6l1.6-1.6a3 3 0 0 1 4.2 4.2L15 10M13 18l-1.6 1.6a3 3 0 0 1-4.2-4.2L9 14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </IconButton>
    </div>
  );
}
