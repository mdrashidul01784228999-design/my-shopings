
type Props = {}

export default function page({}: Props) {
  return (
    <div>page</div>
  )
};
// import { notFound } from "next/navigation";
// import ArticleCard from "../ArticleCard";
// import { categories, getCategory, byCategory } from "../../data";

// export function generateStaticParams() {
//   return categories.map((c) => ({ id: c.slug }));
// }

// interface PageProps {
//   params: Promise<{
//     id?: string;
//     slug?: string;
//   }>;
// }


// export default async function CategoryPage({ params }: PageProps) {
//   const resolvedParams = await params;
//   // ফোল্ডার [id] হলে id আসবে, [slug] হলে slug আসবে
//   const identifier = resolvedParams.id || resolvedParams.slug || "";

//   const cat = getCategory(identifier);
//   if (!cat) notFound();
//   const list = byCategory(cat.slug);

//   return (
//     <div className="container-x py-10">
//       <h1 className="font-serif text-3xl font-extrabold sm:text-4xl">{cat.name}</h1>
//       <div className="mt-2 h-1 w-16 rounded-full bg-jaba" />

//       {list.length === 0 ? (
//         <p className="mt-10 rounded-2xl bg-white p-8 text-center text-ink/60">
//           এই বিভাগে এখনো কোনো খবর নেই। কিছুক্ষণ পর আবার দেখুন।
//         </p>
//       ) : (
//         <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {list.map((a) => (
//             <ArticleCard key={a.id} article={a} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
