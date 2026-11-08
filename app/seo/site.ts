// ===== একটি জায়গা থেকে পুরো সাইটের SEO কনফিগ =====
// Production-এ .env এ NEXT_PUBLIC_SITE_URL=https://my-shopings.com দিন
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://my-shopings.com").replace(/\/$/, "");
export const SITE_NAME = "My Shopings";
export const SITE_TAGLINE = "বাংলাদেশের অনলাইন শপ, গেমস ও গিফট";
export const SITE_DESCRIPTION =
  "My Shopings-এ পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে, ফাস্ট ডেলিভারি ও নিরাপদ পেমেন্ট। পাশাপাশি আছে অনলাইন গেমস, গিফট ও আইটি সার্ভিস।";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** রিলেটিভ পাথ থেকে পূর্ণ URL (canonical / sitemap / JSON-LD এর জন্য) */
export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** ছবির লিংক absolute করে (Google Product schema-র জন্য আবশ্যক) */
export const absImage = (img?: string | null, fallback = "/opengraph-image") =>
  !img ? abs(fallback) : /^https?:\/\//i.test(img) ? img : abs(img);

/** পণ্যের ছবির পূর্ণ (absolute) URL — শেয়ার প্রিভিউ ও Product schema-র জন্য। ProductViews-এর imageOf()-এর মতো একই নিয়ম। */
export const IMAGE_URL = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");
export const productImageUrl = (p?: { img?: string | null; imglink?: string | null } | null): string => {
  const img = p?.img ? String(p.img) : "";
  if (img) {
    if (/^https?:\/\//i.test(img)) return img;
    return IMAGE_URL ? `${IMAGE_URL}/uploads_product/${img}` : abs(`/uploads_product/${img}`);
  }
  const link = p?.imglink ? String(p.imglink) : "";
  if (link) return /^https?:\/\//i.test(link) ? link : abs(link);
  return abs("/opengraph-image");
};

/** BreadcrumbList schema — Google সার্চে পেজের পাথ সুন্দরভাবে দেখায় */
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "হোম", path: "/" }, ...items].map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
});
