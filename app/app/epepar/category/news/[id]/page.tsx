
type Props = {}

function page({}: Props) {
  return (
    <div>page</div>
  )
};

export default page;

// import Link from "next/link";
// import { notFound } from "next/navigation";
// import Cover from "../../../cover";
// import ArticleCard from "../../ArticleCard";
// //import JsonLd from "@/components/JsonLd";
// import { articles, getArticle, getCategory } from "../../../data";
// // import { siteConfig } from "@/lib/site";

// export function generateStaticParams() {
//   return articles.map((a) => ({ id: a.id }));
// }

// export function generateMetadata({ params }) {
//   const a = getArticle(params.id);
//   if (!a) return { title: "খবর পাওয়া যায়নি", robots: { index: false } };

//   const url = `/news/${a.id}`;
//   const image = a.image || "/og-default.png";

//   return {
//     title: a.title,
//     description: a.excerpt,
//     alternates: { canonical: url },
//     openGraph: {
//       type: "article",
//       url,
//       title: a.title,
//       description: a.excerpt,
//       publishedTime: a.publishedAt,
//       modifiedTime: a.updatedAt ?? a.publishedAt,
//       authors: [a.author],
//       section: getCategory(a.category)?.name,
//       images: [{ url: image, width: 1200, height: 630, alt: a.title }],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: a.title,
//       description: a.excerpt,
//       images: [image],
//     },
//   };
// }

// export default function NewsPage({ params }) {
//   const article = getArticle(params.id);
//   if (!article) notFound();

//   const cat = getCategory(article.category);
//   const related = articles
//     .filter((a) => a.id !== article.id && a.category === article.category)
//     .slice(0, 3);
//   const more = related.length
//     ? related
//     : articles.filter((a) => a.id !== article.id).slice(0, 3);

//   const pageUrl = `${siteConfig.url}/news/${article.id}`;
//   const image = `${siteConfig.url}${article.image || "/og-default.png"}`;
// const siteConfig ='myd';
//   const articleSchema = {
//     "@context": "https://schema.org",
//     "@type": "NewsArticle",
//     mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
//     headline: article.title,
//     description: article.excerpt,
//     image: [image],
//     datePublished: article.publishedAt,
//     dateModified: article.updatedAt ?? article.publishedAt,
//     articleSection: cat?.name,
//     inLanguage: "bn",
//     author: { "@type": "Person", name: article.author },
//     publisher: {
//       "@type": "Organization",
//       name: siteConfig,
//       logo: { "@type": "ImageObject", url: `${siteConfig}/icon-512.png` },
//     },
//   };

//   const breadcrumbSchema = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       { "@type": "ListItem", position: 1, name: "হোম", item: siteConfig.url },
//       {
//         "@type": "ListItem",
//         position: 2,
//         name: cat?.name,
//         item: `${siteConfig.url}/category/${cat?.slug}`,
//       },
//       { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
//     ],
//   };

//   return (
//     <article className="container-x py-8 sm:py-12">
//       {/* <JsonLd data={articleSchema} />
//       <JsonLd data={breadcrumbSchema} /> */}

//       <div className="mx-auto max-w-3xl">
//         <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
//           <Link href="/" className="hover:text-forest">হোম</Link>
//           <span className="mx-2">/</span>
//           <Link href={`/category/${cat?.slug}`} className="font-semibold text-jaba">
//             {cat?.name}
//           </Link>
//         </nav>

//         <h1 className="mt-3 font-serif text-3xl font-extrabold leading-tight sm:text-5xl sm:leading-[1.3]">
//           {article.title}
//         </h1>
//         <p className="mt-4 text-lg text-ink/70">{article.excerpt}</p>

//         <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-ink/10 py-4 text-sm text-ink/65">
//           <span className="grid h-9 w-9 place-items-center rounded-full bg-forest font-serif text-white">
//             {article.author.charAt(0)}
//           </span>
//           <span className="font-semibold text-ink">{article.author}</span>
//           <time dateTime={article.publishedAt}>{article.time}</time>
//           <span>পড়তে {article.readTime}</span>
//           <span>{article.views} পাঠক</span>
//         </div>
//       </div>

//       <Cover article={article} big className="mx-auto mt-8 h-60 max-w-5xl rounded-3xl sm:h-[420px]" />

//       <div className="mx-auto mt-10 max-w-3xl space-y-6 font-serif text-lg leading-[2] sm:text-xl sm:leading-[2.1]">
//         {article.body.map((p, i) => (
//           <p key={i}>{p}</p>
//         ))}
//       </div>

//       <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-3">
//         <button className="rounded-full bg-forest px-5 py-2.5 font-semibold text-white hover:bg-forest-dark">
//           সংরক্ষণ করুন
//         </button>
//         <button className="rounded-full border border-forest/30 px-5 py-2.5 font-semibold text-forest hover:bg-forest-light">
//           শেয়ার করুন
//         </button>
//       </div>

//       <section className="mx-auto mt-16 max-w-5xl">
//         <h2 className="font-serif text-2xl font-bold">আরও পড়ুন</h2>
//         <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {more.map((a) => (
//             <ArticleCard key={a.id} article={a} />
//           ))}
//         </div>
//       </section>
//     </article>
//   );
// }
