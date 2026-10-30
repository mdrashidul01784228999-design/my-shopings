import JsonLd from "./JsonLd";
import { PAGE_CONTENT } from "./content";

/** পেজের নিচে ক্রলযোগ্য বর্ণনা + FAQ (এবং FAQPage schema) দেখায় */
export default function SeoContent({ path }: { path: string }) {
  const c = PAGE_CONTENT[path];
  if (!c) return null;
  return (
    <section aria-label={c.heading} className="mx-auto max-w-3xl px-4 py-10 text-sm leading-7 text-neutral-500">
      <h2 className="mb-3 text-lg font-bold text-neutral-400">{c.heading}</h2>
      {c.paragraphs.map((p, i) => (
        <p key={i} className="mb-3">{p}</p>
      ))}
      <h3 className="mb-2 mt-6 font-semibold text-neutral-400">সাধারণ প্রশ্ন</h3>
      <div className="space-y-3">
        {c.faqs.map((f, i) => (
          <div key={i}>
            <p className="font-medium text-neutral-400">{f.q}</p>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </section>
  );
}
