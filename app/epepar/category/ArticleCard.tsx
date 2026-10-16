
type Props = {}

export default function ArticleCard({}: Props) {
  return (
    <div>ArticleCard</div>
  )
};
// // /app/epepar/category/ArticleCard.tsx
// import Link from "next/link";
// import Cover, { type Article } from "../cover";
// import { getCategory } from "../data";

// interface ArticleCardProps {
//   article: Article;
//   layout?: "vertical" | "horizontal";
// }

// export default function ArticleCard({ article, layout = "vertical" }: ArticleCardProps) {
//   const cat = getCategory(article.category || "");

//   if (layout === "horizontal") {
//     return (
//       <Link
//         href={`/news/${article.id}`}
//         className="group flex gap-4 rounded-2xl bg-white p-3 transition hover:shadow-lift"
//       >
//         <Cover article={article} className="h-24 w-28 shrink-0 rounded-xl sm:h-28 sm:w-36" />
//         <div className="min-w-0">
//           <span className="text-sm font-semibold text-jaba">{cat?.name}</span>
//           <h3 className="font-serif text-base font-bold leading-snug group-hover:text-forest sm:text-lg line-clamp-3">
//             {article.title}
//           </h3>
//           <p className="mt-1 text-sm text-ink/60">{article.time}</p>
//         </div>
//       </Link>
//     );
//   }

//   return (
//     <Link
//       href={`/news/${article.id}`}
//       className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition hover:shadow-lift"
//     >
//       <Cover article={article} className="h-44 w-full" />
//       <div className="flex flex-1 flex-col p-5">
//         <span className="text-sm font-semibold text-jaba">{cat?.name}</span>
//         <h3 className="mt-1 font-serif text-lg font-bold leading-snug group-hover:text-forest line-clamp-3">
//           {article.title}
//         </h3>
//         <p className="mt-2 flex-1 text-[15px] text-ink/70 line-clamp-2">{article.excerpt}</p>
//         <p className="mt-4 text-sm text-ink/55">
//           {article.author} • {article.time}
//         </p>
//       </div>
//     </Link>
//   );
// }