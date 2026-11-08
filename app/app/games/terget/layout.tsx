import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://my-shopings.com';

const font = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

const title = 'Find The Target – বাংলা ও ইংরেজি অক্ষর খোঁজার ফ্রি অনলাইন গেম';
const description =
  'বাংলা বর্ণ, ইংরেজি অক্ষর ও সংখ্যা ৩০ সেকেন্ডে খুঁজে বের করুন। মোবাইল ও পিসিতে ফ্রি ৩D ব্রেইন গেম — হাই-স্কোর সেভ হয়, ইনস্টল লাগে না।';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s | Find The Target' },
  description,
  keywords: [
    'বাংলা গেম', 'অক্ষর খোঁজার গেম', 'বাংলা বর্ণমালা গেম', 'অনলাইন ফ্রি গেম',
    'বাচ্চাদের গেম', 'Bangla game', 'Bengali alphabet game', 'find the letter game',
    'brain game online', 'memory game', 'free browser game',
  ],
  applicationName: 'Find The Target',
  alternates: { canonical: '/games/terget' },
  openGraph: {
    type: 'website', url: `${SITE_URL}/games/terget`, siteName: 'Find The Target', title, description,
    locale: 'bn_BD',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Find The Target গেম' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Google Search Console থেকে ভেরিফিকেশন কোড পেলে এখানে বসান:
  // verification: { google: 'YOUR_CODE' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={font.className}>{children}</div>
  );
}
