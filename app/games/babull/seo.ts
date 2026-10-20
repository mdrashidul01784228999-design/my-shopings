import type { Metadata, MetadataRoute } from 'next';

// .env.local এ NEXT_PUBLIC_SITE_URL=https://আপনার-ডোমেইন.com দিন
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourwebsite.com').replace(/\/$/, '');
export const SITE_NAME = 'Premium Portal';
export const OG_IMAGE = '/og-image.png'; // public/ ফোল্ডারে ১২০০×৬৩০ ছবি রাখুন

/** app/layout.tsx এ: export const metadata = rootMetadata; */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} – গেমস, শপিং ও গিফট কার্ড`, template: `%s | ${SITE_NAME}` },
  description: 'ফ্রি অনলাইন গেমস, প্রিমিয়াম শপিং, ট্রেন্ডিং আইটেম ও গিফট কার্ড রিডিম – সবকিছু এক জায়গায়।',
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'bn_BD',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: 'summary_large_image', images: [OG_IMAGE] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  // verification: { google: 'Search Console এর কোড' },
};

type Route = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] };

/** সাইটম্যাপে যাওয়া পেজগুলো – নতুন পেজ হলে এখানে যোগ করুন */
export const ROUTES: Route[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/trending', priority: 0.9, changeFrequency: 'daily' },
  { path: '/shopping', priority: 0.9, changeFrequency: 'daily' },
  { path: '/gifts', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/games/game1', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/games/babull', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/games/shoter', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/games/Snack', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/games/Jamgam', priority: 0.7, changeFrequency: 'weekly' },
];
