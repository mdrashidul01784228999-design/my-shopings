import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKey, validId } from "../../../lib/store";
import Share from "../../../components/Share";
import JsonLd from "../../../components/JsonLd";
import { Pyramid } from "../../../components/Shapes";
import { abs } from "../../../lib/site";

export const dynamic = "force-dynamic";

const load = cache(async (id) => (validId(id) ? getKey(`product:${id}`) : null));

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await load(id);
  if (!p) return { title: "Product not found", robots: { index: false, follow: false } };
  const title = `${p.name} – $${Number(p.price).toFixed(2)}`;
  const description = `Buy ${p.name} for $${Number(p.price).toFixed(2)}. ${p.qty} in stock. View details and share this product on ShopCube.`;
  return {
    title,
    description,
    alternates: { canonical: `/p/${p.id}` },
    openGraph: { type: "website", title, description, url: `/p/${p.id}`, images: [{ url: p.image, alt: p.name }] },
    twitter: { card: "summary_large_image", title, description, images: [p.image] },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = await load(id);
  if (!p) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: p.name,
        image: [abs(p.image)],
        description: `${p.name} – available on ShopCube.`,
        sku: p.id,
        url: abs(`/p/${p.id}`),
        offers: {
          "@type": "Offer",
          url: abs(`/p/${p.id}`),
          price: Number(p.price).toFixed(2),
          priceCurrency: "USD",
          availability: p.qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ShopCube", item: abs("/") },
          { "@type": "ListItem", position: 2, name: p.name, item: abs(`/p/${p.id}`) },
        ],
      },
    ],
  };

  return (
    <main className="wrap">
      <JsonLd data={ld} />
      <nav className="topbar" aria-label="Breadcrumb"><Link href="/">← ShopCube</Link></nav>
      <section className="sec pview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} width="640" height="640" />
        <div>
          <h1>{p.name}</h1>
          <div className="pprice">${Number(p.price).toFixed(2)}</div>
          <p className="muted">In stock: {p.qty}</p>
          <div className="row" style={{ margin: "20px 0" }}>
            {p.link && (
              <a className="btn big" href={p.link} target="_blank" rel="noopener noreferrer nofollow ugc">
                🛍️ Buy / View product ↗
              </a>
            )}
            {p.profile && (
              <a className="btn big ghost" href={p.profile} target="_blank" rel="noopener noreferrer nofollow ugc">
                👤 Seller profile ↗
              </a>
            )}
          </div>
          <h2 className="h-left">Share this product</h2>
          <Share path={`/p/${p.id}`} title={p.name} />
          <Pyramid />
        </div>
      </section>
    </main>
  );
}
