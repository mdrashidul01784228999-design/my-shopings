import "./globals.css";
import JsonLd from "../components/JsonLd";
import { SITE_NAME, SITE_URL, abs } from "../lib/site";

const DESC =
  "ShopCube lets you upload 10, 20, 50, 100 or unlimited products, publish your online shop in minutes and share product links on WhatsApp, Facebook and more.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShopCube – Create Your Online Shop, Upload Products & Share Links",
    template: "%s | ShopCube",
  },
  description: DESC,
  applicationName: SITE_NAME,
  keywords: [
    "online shop",
    "create online store",
    "upload products",
    "bulk product upload",
    "product link",
    "share products",
    "ecommerce",
    "sell online",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: "ShopCube – Create Your Online Shop & Share Product Links",
    description: DESC,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopCube – Create Your Online Shop & Share Product Links",
    description: DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: false },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0b1a" };

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": abs("/#org"), name: SITE_NAME, url: abs("/"), logo: abs("/icon") },
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: abs("/"),
      name: SITE_NAME,
      description: DESC,
      publisher: { "@id": abs("/#org") },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="blob b1" aria-hidden="true" />
        <div className="blob b2" aria-hidden="true" />
        <JsonLd data={orgLd} />
        {children}
      </body>
    </html>
  );
}
