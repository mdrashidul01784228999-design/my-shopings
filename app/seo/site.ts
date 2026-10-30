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
