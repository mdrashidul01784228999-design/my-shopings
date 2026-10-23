import { listIndex } from "../lib/store";
import { SITE_URL } from "../lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let products = [];
  let shops = [];
  try {
    [products, shops] = await Promise.all([listIndex("products", 2000), listIndex("shops", 2000)]);
  } catch {}
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...shops.map((id) => ({ url: `${SITE_URL}/shop/${id}`, changeFrequency: "weekly", priority: 0.7 })),
    ...products.map((id) => ({ url: `${SITE_URL}/p/${id}`, changeFrequency: "weekly", priority: 0.6 })),
  ];
}
