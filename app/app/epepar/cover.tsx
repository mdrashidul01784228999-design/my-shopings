// ছবির বদলে গ্রেডিয়েন্ট কভার। চাইলে <img> বা next/image বসাতে পারেন।

interface Article {
  title: string;
  colors: string[];
  [key: string]: any;
}

interface CoverProps {
  article: Article;
  className?: string;
  big?: boolean;
}

export default function Cover({ article, className = "", big = false }: CoverProps) {
  const [c1, c2] = article.colors;
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      <div
        className="absolute -right-8 -bottom-12 h-56 w-56 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)" }}
      />
      <span
        className={`absolute left-4 bottom-2 font-serif font-extrabold text-white/20 select-none ${
          big ? "text-[9rem] sm:text-[12rem]" : "text-7xl"
        }`}
      >
        {article.title.charAt(0)}
      </span>
    </div>
  );
}