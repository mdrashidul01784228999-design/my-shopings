import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKey, validId } from "../../../lib/store";
import Share from "../../../components/Share";
import JsonLd from "../../../components/JsonLd";
import { abs } from "../../../lib/site";

export const dynamic = "force-dynamic";

const load = cache(async (id) => {
  if (!validId(id)) return null;
  const shop = await getKey(`shop:${id}`);
  if (!shop) return null;
  const products = (await Promise.all(shop.ids.map((pid) => getKey(`product:${pid}`)))).filter(Boolean);
  return { shop, products };
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) return { title: "Shop not found", robots: { index: false, follow: false } };
  const n = d.products.length;
  const title = `Online Shop – ${n} Products`;
  const description = `Browse ${n} products in this online shop on ShopCube. ${d.products
    .slice(0, 3)
    .map((p) => p.name)
    .join(", ")} and more.`;
  const img = d.products[0]?.image;
  return {
    title,
    description,
    alternates: { canonical: `/shop/${id}` },
    openGraph: { type: "website", title, description, url: `/shop/${id}`, images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: img ? [img] : undefined },
  };
}

export default async function ShopPage({ params }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) notFound();
  const { products } = d;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Online Shop – ${products.length} Products`,
        url: abs(`/shop/${id}`),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: abs(`/p/${p.id}`),
            name: p.name,
            image: abs(p.image),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ShopCube", item: abs("/") },
          { "@type": "ListItem", position: 2, name: "Shop", item: abs(`/shop/${id}`) },
        ],
      },
    ],
  };

  return (
    <main className="wrap">
      <JsonLd data={ld} />
      <nav className="topbar" aria-label="Breadcrumb"><Link href="/">← ShopCube</Link></nav>
      <section className="sec">
        <h1 className="h-center">🛍️ Shop · {products.length} products</h1>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <Share path={`/shop/${id}`} title="Check out this shop" />
        </div>
        <div className="shopgrid">
          {products.map((p) => (
            <Link key={p.id} href={`/p/${p.id}`} className="pcard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" width="400" height="400" />
              <b>{p.name}</b>
              <span>${Number(p.price).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
