"use client";

import { useState } from "react";
import { Share2, Link2, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface BlogShareButtonsProps {
  title: string;
  url: string;
}

export default function BlogShareButtons({ title, url }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} - ${url}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1 flex items-center gap-1.5">
        <Share2 size={13} className="text-wine" /> Share:
      </span>

      <button
        onClick={handleCopy}
        type="button"
        title="Copy Link"
        aria-label="Copy link to clipboard"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-line bg-white hover:border-wine/40 hover:bg-[#faf6f2] text-ink transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check size={13} className="text-wine" />
            <span className="text-wine font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Link2 size={13} className="text-muted" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-line bg-white hover:border-[#25D366]/40 hover:bg-[#25D366]/5 text-ink transition-colors"
      >
        <MessageCircle size={13} className="text-[#25D366]" />
        <span>WhatsApp</span>
      </a>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        aria-label="Share on X"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-line bg-white hover:border-ink/30 hover:bg-ink/5 text-ink transition-colors"
      >
        <span className="font-bold text-[11px]">𝕏</span>
        <span>Post</span>
      </a>
    </div>
  );
}
