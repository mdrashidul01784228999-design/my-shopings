export const SITE_NAME = "ShopCube";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const abs = (path = "") => `${SITE_URL}${path}`;

// JSON-LD safe stringify (XSS-safe)
export const jsonLdString = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
