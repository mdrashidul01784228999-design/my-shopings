export default function robots() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: url + "/sitemap.xml" };
}
