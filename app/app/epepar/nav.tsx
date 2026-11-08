"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { categories } from "./data";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const pathname = usePathname();

  const active = (href: String) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        {/* লোগো */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest font-serif text-xl font-extrabold text-white">
            <span className="relative">
              বা
              <span className="absolute -right-2 -top-1 h-2.5 w-2.5 rounded-full bg-jaba" />
            </span>
          </span>
          <span className="font-serif text-xl font-extrabold tracking-tight sm:text-2xl">
            বাংলা <span className="text-forest">পেপার</span>
          </span>
        </Link>

        {/* ডেস্কটপ মেনু */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="প্রধান মেনু">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`rounded-full px-4 py-2 text-[15px] font-medium transition hover:bg-forest-light hover:text-forest ${
                active(`/category/${c.slug}`) ? "bg-forest text-white hover:bg-forest hover:text-white" : ""
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearch((s) => !s)}
            aria-label="খুঁজুন"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-forest-light"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            href="/profile"
            aria-label="আমার প্রোফাইল"
            className="flex items-center gap-2 rounded-full bg-forest-light py-1 pl-1 pr-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-forest font-serif text-white">আ</span>
            <span className="hidden sm:inline">প্রোফাইল</span>
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="মেনু"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-forest-light lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* সার্চ বার */}
      {search && (
        <div className="border-t border-ink/10 bg-white">
          <div className="container-x py-3">
            <input
              autoFocus
              type="search"
              placeholder="খবর খুঁজুন..."
              className="w-full rounded-xl border border-ink/15 bg-mist px-4 py-3 outline-none focus:border-forest"
            />
          </div>
        </div>
      )}

      {/* মোবাইল মেনু */}
      {open && (
        <nav className="border-t border-ink/10 bg-white lg:hidden" aria-label="মোবাইল মেনু">
          <div className="container-x grid grid-cols-2 gap-2 py-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-mist px-4 py-3 font-medium hover:bg-forest-light hover:text-forest"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}