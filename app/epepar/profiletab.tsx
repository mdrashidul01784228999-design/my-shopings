"use client";
import Link from "next/link";
import { useState } from "react";
import ArticleCard from "./category/ArticleCard";
import { articles, profile } from "./data";

const tabs = [
  { id: "saved", label: "সংরক্ষিত খবর" },
  { id: "comments", label: "আমার মন্তব্য" },
  { id: "settings", label: "সেটিংস" },
];

export default function ProfileTabs() {
  const [tab, setTab] = useState("saved");
  const [saved, setSaved] = useState(false);
  const savedArticles = articles.filter((a) => profile.saved.includes(a.id));

  return (
    <div className="mt-10">
      <div role="tablist" className="flex gap-2 overflow-x-auto border-b border-ink/10 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-4 px-4 py-3 font-semibold transition ${
              tab === t.id ? "border-jaba text-ink" : "border-transparent text-ink/55 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "saved" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedArticles.map((a) => (
              <ArticleCard key={a.id}  />
            ))}
          </div>
        )}

        {tab === "comments" && (
          <ul className="space-y-4">
            {profile.comments.map((c, i) => {
              const a = articles.find((x) => x.id === c.articleId);
              return (
                <li key={i} className="rounded-2xl bg-white p-5">
                  {/* <Link href={`/news/${a.id}`} className="font-serif font-bold hover:text-forest">
                    {a.title}
                  </Link> */}
                  <p className="mt-2 text-ink/80">{c.text}</p>
                  <p className="mt-2 text-sm text-ink/50">{c.time}</p>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "settings" && (
          <form
            onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="grid max-w-2xl gap-5 rounded-2xl bg-white p-6 sm:p-8"
          >
            <label className="grid gap-1.5">
              <span className="font-semibold">নাম</span>
              <input defaultValue={profile.name} className="rounded-xl border border-ink/15 px-4 py-3 outline-none focus:border-forest" />
            </label>
            <label className="grid gap-1.5">
              <span className="font-semibold">পরিচিতি</span>
              <textarea defaultValue={profile.bio} rows={3} className="rounded-xl border border-ink/15 px-4 py-3 outline-none focus:border-forest" />
            </label>
            <label className="grid gap-1.5">
              <span className="font-semibold">অবস্থান</span>
              <input defaultValue={profile.location} className="rounded-xl border border-ink/15 px-4 py-3 outline-none focus:border-forest" />
            </label>
            <div className="flex items-center gap-4">
              <button className="rounded-xl bg-forest px-6 py-3 font-bold text-white hover:bg-forest-dark">
                পরিবর্তন সংরক্ষণ করুন
              </button>
              {saved && <span className="font-semibold text-forest">সংরক্ষণ হয়েছে</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}