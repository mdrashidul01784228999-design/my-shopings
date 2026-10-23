// Central SEO config. Set NEXT_PUBLIC_SITE_URL in .env.local (your real domain).
export const SITE = {
  name: "ShopCube",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  title: "ShopCube – Upload Products Online, Share Product Links & Get Orders",
  description:
    "Create your online store in minutes. Upload 10, 20, 50, 100 or unlimited products, get an automatic product link for each item and manage customer orders.",
  keywords: ["online store", "upload products", "multiple product upload", "product link generator", "order management", "ecommerce Bangladesh", "sell online"],
  locale: "en_US",
  currency: "USD",
};
export const absoluteUrl = (p = "/") => `${SITE.url}${p}`;
export const jsonLd = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
