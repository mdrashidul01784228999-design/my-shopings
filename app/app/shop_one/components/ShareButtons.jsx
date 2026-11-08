"use client";
import { useEffect, useState } from "react";
import { copyText } from "../lib/store";

export default function ShareButtons({ slug, name, showLink = true }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    setUrl(`${window.location.origin}/p/${slug}`);
    setNative(!!navigator.share);
  }, [slug]);

  const msg = encodeURIComponent(`Check out ${name}`);
  const u = encodeURIComponent(url);
  const items = [
    ["WhatsApp", `https://wa.me/?text=${msg}%20${u}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["Telegram", `https://t.me/share/url?url=${u}&text=${msg}`],
    ["X", `https://twitter.com/intent/tweet?url=${u}&text=${msg}`],
    ["Email", `mailto:?subject=${msg}&body=${u}`],
  ];
  const copy = async () => { if (await copyText(url)) { setCopied(true); setTimeout(() => setCopied(false), 1500); } };

  return (
    <div>
      {showLink && (
        <div className="sc-link">
          <code>{url || "…"}</code>
          <button className="sc-btn sc-sm" onClick={copy}>{copied ? "Copied ✓" : "🔗 Copy link"}</button>
        </div>
      )}
      <div className="sc-row">
        {items.map(([l, href]) => (
          <a key={l} href={url ? href : undefined} target="_blank" rel="noopener noreferrer" className="sc-btn sc-sm sc-ghost">{l}</a>
        ))}
        {native && <button className="sc-btn sc-sm" onClick={() => navigator.share({ title: name, url })}>📤 Share…</button>}
      </div>
    </div>
  );
}
