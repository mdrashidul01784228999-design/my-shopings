import type { MetadataRoute } from 'next';
import { ROUTES, SITE_URL } from '@/lib/seo';

// /sitemap.xml নিজে থেকেই তৈরি হবে
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
