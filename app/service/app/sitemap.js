export default function sitemap() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
  return [{ url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
