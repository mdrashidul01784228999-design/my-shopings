import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const font = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: "টেকফিক্স সার্ভিস সেন্টার | পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ মেরামত", template: "%s | টেকফিক্স" },
  description: "পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ, এসি সহ সব ইলেকট্রনিক্স মেরামত। অনলাইনে অভিযোগ ও রিকোয়েস্ট পাঠান, দ্রুত সার্ভিস পান।",
  keywords: ["সার্ভিস সেন্টার", "ল্যাপটপ মেরামত", "মোবাইল মেরামত", "পিসি সার্ভিসিং", "টিভি মেরামত", "ফ্রিজ মেরামত", "electronics repair Bangladesh"],
  alternates: { canonical: "/" },
  openGraph: { title: "টেকফিক্স সার্ভিস সেন্টার", description: "সব ডিভাইসের দ্রুত ও বিশ্বস্ত মেরামত", url: SITE, siteName: "টেকফিক্স", locale: "bn_BD", type: "website" },
  twitter: { card: "summary_large_image", title: "টেকফিক্স সার্ভিস সেন্টার", description: "সব ডিভাইসের দ্রুত ও বিশ্বস্ত মেরামত" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#081018" };

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsRepairShop",
    name: "টেকফিক্স সার্ভিস সেন্টার",
    url: SITE,
    areaServed: "BD",
    priceRange: "৳",
    description: "পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ মেরামত সার্ভিস",
    hasOfferCatalog: { "@type": "OfferCatalog", name: "মেরামত সার্ভিস", itemListElement: ["পিসি", "ল্যাপটপ", "মোবাইল", "টিভি", "ফ্রিজ", "এসি"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n + " মেরামত" } })) },
  };
  return (
    <html lang="bn">
      <body className={font.className}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
