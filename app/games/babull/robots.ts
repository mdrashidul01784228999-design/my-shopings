import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// /robots.txt নিজে থেকেই তৈরি হবে
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/profile', '/settings', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
