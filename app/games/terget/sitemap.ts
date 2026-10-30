import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://my-shopings.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/games/terget`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
