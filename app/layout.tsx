import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Anitsniajt from "./animates/Ants";
import { Toaster } from "react-hot-toast";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, abs } from "./seo/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} – ${SITE_TAGLINE}`, template: "%s" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["অনলাইন শপ", "অনলাইন শপিং বাংলাদেশ", "পণ্যের দাম", "ক্যাশ অন ডেলিভারি", "My Shopings", "online shop Bangladesh"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "bn_BD",
    url: SITE_URL,
    title: `${SITE_NAME} – ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // opengraph-image.tsx থেকে অটো যোগ হয়
  },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} – ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Search Console / Bing কোড .env থেকে আসবে (ফাঁকা থাকলে ট্যাগ তৈরি হবে না)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3bb01",
};

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/icon.png"),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "bn-BD",
    publisher: { "@id": abs("/#organization") },
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-900/70`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        {children}
        <Anitsniajt />
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}

/* ===== SEO UPDATE BACKUP: মূল ফাইলের সম্পূর্ণ কোড (কিছুই মুছিনি, এখানে রাখা আছে — দরকারে ফিরিয়ে নিন) =====

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Anitsniajt from './animates/Ants';
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



// export const metadata: Metadata = {
//   title: "My-shopings.com – Best Online Store in Bangladesh",
//   description: "আমাদের ইকমার্সে পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে। Fast Delivery, Secure Payment এবং ২৪/৭ কাস্টমার সার্পোট।",
//   keywords: ["Ecommerce", "Online Shop", "Bangladesh", "Buy Products", "Best Price"],
//   openGraph: {
//     title: "My Shop – Best Online Store in Bangladesh",
//     description: "আমাদের ইকমার্সে পাবেন সেরা মানের পণ্য সাশ্রয়ী দামে।",
//     url: "https://www.my-shopings.com",
//     siteName: "my-shopings.com/home page",
//     images: [
//       {
//         url: "https://www.myshop.com/og-image.jpg",
//         width: 1200,
//         height: 630,
//         alt: "My Shop Banner",
//       },
//     ],
//     locale: "BD",
//     type: "website",
//   },
//   alternates: {
//     canonical: "https://www.my-shopings.com",
//   },
// };




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

<head>

   <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f3bb01ff" />
        <link rel="apple-touch-icon" href="192 favicon.png" />

</head>


      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`+' dark:bg-gray-900/70'}
      >

            {children}
<Anitsniajt />

    

  <Toaster position="top-right" reverseOrder={false} />

      </body>
    </html>
  );
}

===== END BACKUP ===== */
