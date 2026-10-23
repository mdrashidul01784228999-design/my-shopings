"use client";
import { useEffect, useState } from "react";

export default function Share({ path, title }) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => setNative(typeof navigator !== "undefined" && !!navigator.share), []);

  const full = () => `${window.location.origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Link copy korun:", full());
    }
  };

  const go = (build) => {
    const u = encodeURIComponent(full());
    const t = encodeURIComponent(title || "Check this out");
    window.open(build(u, t), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="share">
      <button className="chip" onClick={copy}>{copied ? "✓ Copied" : "🔗 Copy link"}</button>
      <button className="chip" onClick={() => go((u, t) => `https://wa.me/?text=${t}%20${u}`)}>WhatsApp</button>
      <button className="chip" onClick={() => go((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`)}>Facebook</button>
      <button className="chip" onClick={() => go((u, t) => `https://t.me/share/url?url=${u}&text=${t}`)}>Telegram</button>
      <button className="chip" onClick={() => go((u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`)}>X</button>
      {native && (
        <button className="chip" onClick={() => navigator.share({ title, url: full() }).catch(() => {})}>
          📤 Share…
        </button>
      )}
    </div>
  );
}
