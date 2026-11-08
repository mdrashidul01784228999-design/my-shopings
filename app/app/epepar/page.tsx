import Link from "next/link";
import Ticker from "./Ticker";
import Cover from "./cover";
import ArticleCard from "./category/ArticleCard";
import { articles, categories, getCategory } from "./data";

export default function Home() {
  const lead = articles.find((a) => a.featured) ?? articles[0];
  const side = articles.filter((a) => a.id !== lead.id).slice(0, 3);
  const latest = articles.filter((a) => a.id !== lead.id).slice(3);
  const today = new Date().toLocaleDateString("bn-BD", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <Ticker />

      <div className="container-x pt-8">
        <p className="text-sm text-ink/60">{today}</p>

        {/* লিড সংবাদ */}
        <section className="mt-4 grid gap-6 lg:grid-cols-3">
          <Link
            href={`/news/${lead.id}`}
            className="group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl p-6 text-white sm:min-h-[500px] sm:p-10 lg:col-span-2"
          >
            <Cover article={lead} big className="absolute inset-0 -z-10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="w-fit rounded-full bg-gold px-3 py-1 text-sm font-bold text-ink">
              {getCategory(lead.category)?.name}
            </span>
            <h1 className="mt-4 max-w-3xl font-serif text-3xl font-extrabold leading-tight sm:text-5xl sm:leading-[1.25]">
              {lead.title}
            </h1>
            <p className="mt-4 hidden max-w-2xl text-lg text-white/85 sm:block">{lead.excerpt}</p>
            <p className="mt-5 text-sm text-white/75">
              {lead.author} • {lead.time} • পড়তে {lead.readTime}
            </p>
          </Link>

          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-xl font-bold">সর্বশেষ</h2>
            {side.map((a) => (
              <ArticleCard key={a.id}  />
            ))}
          </div>
        </section>

        {/* বিভাগ চিপ */}
        <section className="mt-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-full border border-forest/25 bg-white px-5 py-2 font-medium text-forest transition hover:bg-forest hover:text-white"
            >
              {c.name}
            </Link>
          ))}
        </section>

        {/* সব খবর */}
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">আজকের আলোচিত খবর</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <ArticleCard key={a.id}  />
            ))}
          </div>
        </section>

        {/* নিউজলেটার */}
        <section className="mt-16 overflow-hidden rounded-3xl bg-forest p-8 text-white sm:p-12">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-extrabold sm:text-3xl">প্রতিদিন সকালে খবর পান ইমেইলে</h2>
              <p className="mt-2 text-white/80">দিনের গুরুত্বপূর্ণ ৫টি খবর, এক নজরে।</p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder="আপনার ইমেইল"
                className="flex-1 rounded-xl px-4 py-3 text-ink outline-none"
              />
              <button className="rounded-xl bg-gold px-6 py-3 font-bold text-ink transition hover:brightness-95">
                সাবস্ক্রাইব করুন
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
