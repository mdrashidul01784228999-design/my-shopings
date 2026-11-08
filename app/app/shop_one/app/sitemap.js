import { SITE } from "../lib/seo";
import { getProducts } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const now = new Date();
  const pages = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];
  const products = (await getProducts()).map((p) => ({
    url: `${SITE.url}/p/${p.slug}`,
    lastModified: new Date(p.createdAt || now),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...pages, ...products];
}
