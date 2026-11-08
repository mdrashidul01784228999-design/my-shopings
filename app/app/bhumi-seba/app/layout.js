import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const body = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], variable: "--f-body", display: "swap" });
const display = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["600", "800"], variable: "--f-display", display: "swap" });

import { SITE_URL } from "./site";
const TITLE = "ভূমি সেবা – অনলাইনে খতিয়ান, নামজারি ও ভূমি কর সেবা | ডিজিটাল সেবা সেন্টার";
const DESC = "ভূমি সেবা ডিজিটাল সেবা সেন্টার: ভূমি উন্নয়ন কর, খতিয়ান ও পর্চা, নামজারি (মিউটেশন), মৌজা ম্যাপ ও জমির তথ্য যাচাই। আবেদন করুন সহজে, অবস্থা জানুন ঘরে বসেই।";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | ভূমি সেবা" },
  description: DESC,
  keywords: ["ভূমি সেবা", "ডিজিটাল সেবা সেন্টার", "ভূমি উন্নয়ন কর", "খতিয়ান", "পর্চা", "নামজারি", "মিউটেশন", "মৌজা ম্যাপ", "অনলাইন জমির তথ্য", "ই-পর্চা"],
  alternates: { canonical: "/" },
  applicationName: "ভূমি সেবা",
  authors: [{ name: "ভূমি সেবা" }],
  openGraph: { type: "website", locale: "bn_BD", url: "/", siteName: "ভূমি সেবা", title: TITLE, description: DESC },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: { google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0E3B2C" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "ভূমি সেবা", inLanguage: "bn-BD",
    },
    {
      "@type": "LocalBusiness", "@id": `${SITE_URL}/#org`, name: "ভূমি সেবা – ডিজিটাল সেবা সেন্টার", url: SITE_URL,
      description: DESC, telephone: "+8801700000000", priceRange: "৳",
      address: { "@type": "PostalAddress", streetAddress: "আপনার ঠিকানা", addressLocality: "উপজেলা", addressRegion: "জেলা", addressCountry: "BD" },
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "09:00", closes: "20:00" }],
      areaServed: { "@type": "Country", name: "Bangladesh" },
      hasOfferCatalog: {
        "@type": "OfferCatalog", name: "ভূমি ও ডিজিটাল সেবা",
        itemListElement: ["ভূমি উন্নয়ন কর", "খতিয়ান ও পর্চা", "নামজারি (মিউটেশন)", "মৌজা ম্যাপ", "জমির তথ্য যাচাই"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${body.variable} ${display.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
