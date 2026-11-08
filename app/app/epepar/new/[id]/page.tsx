import Link from "next/link";
import { notFound } from "next/navigation";
import Cover from "../../cover";
import ArticleCard from "../../category/ArticleCard";
import { articles, getArticle, getCategory } from "../../data";

interface PageProps {
  params: Promise<{
    id: string;
    article: null;
  }>;
}

export function generateStaticParams() {
  return articles.map((a: any) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const a = getArticle(id);
  return { title: a ? `${a.title} — বাংলা পেপার` : "খবর পাওয়া যায়নি" };
}

export default async function NewsPage({ params }: PageProps) {
  const { id } = await params;
  const article = getArticle(id);

  if (!article) notFound();

  const cat = getCategory(article.category);
  const related = articles
    .filter((a: any) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);
  const more = related.length
    ? related
    : articles.filter((a: any) => a.id !== article.id).slice(0, 3);

  return (
    <article className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href={`/category/${cat?.slug}`} className="font-semibold text-jaba">
          {cat?.name}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-extrabold leading-tight sm:text-5xl sm:leading-[1.3]">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-ink/70">{article.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-ink/10 py-4 text-sm text-ink/65">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-serif text-white">
            {article.author?.charAt(0)}
          </span>
          <span className="font-semibold text-ink">{article.author}</span>
          <span>{article.time}</span>
          <span>পড়তে {article.readTime}</span>
          <span>{article.views} পাঠক</span>
        </div>
      </div>

      <Cover article={article} big className="mx-auto mt-8 h-60 max-w-5xl rounded-3xl sm:h-[420px]" />

      <div className="mx-auto mt-10 max-w-3xl space-y-6 font-serif text-lg leading-[2] sm:text-xl sm:leading-[2.1]">
        {article.body?.map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-3">
        <button className="rounded-full bg-forest px-5 py-2.5 font-semibold text-white hover:bg-forest-dark">
          সংরক্ষণ করুন
        </button>
        <button className="rounded-full border border-forest/30 px-5 py-2.5 font-semibold text-forest hover:bg-forest-light">
          শেয়ার করুন
        </button>
      </div>

      <section className="mx-auto mt-16 max-w-5xl">
        <h2 className="font-serif text-2xl font-bold">আরও পড়ুন</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((a: any) => (
            <ArticleCard key={a.id}  />
          ))}
        </div>
      </section>
    </article>
  );
}
