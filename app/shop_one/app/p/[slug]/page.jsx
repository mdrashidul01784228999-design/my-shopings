import { notFound } from "next/navigation";
import ProductView from "../../../components/ProductView";
import { getProductBySlug } from "../../../lib/data";
import { SITE, absoluteUrl, jsonLd } from "../../../lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const p = await getProductBySlug(params.slug);
  // Not found on the server (e.g. only in localStorage) -> do not index
  if (!p) return { title: "Product", robots: { index: false, follow: true } };
  const title = p.seoTitle || p.name;
  const description = p.seoDesc || (p.desc || "").slice(0, 155) || `Buy ${p.name} online`;
  const url = absoluteUrl(`/p/${p.slug}`);
  const imgUrl = p.image?.startsWith("/") ? absoluteUrl(p.image) : p.image;
  const images = imgUrl?.startsWith("http") ? [{ url: imgUrl, alt: p.alt || p.name }] : undefined;
  return {
    title, description,
    keywords: (p.keywords || "").split(",").map((s) => s.trim()).filter(Boolean),
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE.name, images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}

export default async function Page({ params }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  const ld = p && [
    {
      "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.desc || p.name,
      image: p.image?.startsWith("/") ? absoluteUrl(p.image) : (p.image?.startsWith("http") ? p.image : undefined), sku: p.id,
      offers: {
        "@type": "Offer", url: absoluteUrl(`/p/${p.slug}`), priceCurrency: SITE.currency, price: p.price,
        itemCondition: "https://schema.org/NewCondition",
        availability: p.qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
        { "@type": "ListItem", position: 3, name: p.name, item: absoluteUrl(`/p/${p.slug}`) },
      ],
    },
  ];
  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />}
      <ProductView product={p} />
    </>
  );
}
