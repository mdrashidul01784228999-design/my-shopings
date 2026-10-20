import type { Metadata, Viewport } from "next";
import MaturityTerminal from "./MaturityTerminal";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"; // <-- আপনার ডোমেইন দিন
const TITLE = "MATURITY.X6 | কয়েন ও পণ্যে ১ মাস থেকে ১ বছরের ডিপোজিট মার্কেট";
const DESC =
  "বিটকয়েন, ইথেরিয়াম, গোল্ড ও অয়েলে আপনার কয়েন ১ মাস, ৩ মাস, ৬ মাস বা ১ বছরের জন্য লক করুন। মেয়াদপূর্তির দিনের দামে সেটেলমেন্ট। লাইভ চার্ট, থ্রিডি টার্মিনাল।";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  keywords: [
    "বিটকয়েন", "শেয়ার বাজার", "কয়েন ডিপোজিট", "গোল্ড ট্রেডিং", "ক্রিপ্টো মার্কেট",
    "bitcoin deposit", "crypto maturity", "gold oil bitcoin market", "MATURITY.X6",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/",
    siteName: "MATURITY.X6",
    type: "website",
    locale: "bn_BD",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og-image.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = { themeColor: "#05060f", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MATURITY.X6",
  url: SITE,
  inLanguage: "bn",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description: DESC,
  offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MaturityTerminal />
    </>
  );
}
