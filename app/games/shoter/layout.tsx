import type { Metadata } from "next";
import SeoContent from "../../seo/SeoContent";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "Bengal Mission – অ্যাকশন শুটার গেম অনলাইনে ফ্রি খেলুন | My Shopings";
const description = "বাংলার পটভূমিতে অ্যাকশন শুটার গেম। কোনো ডাউনলোড ছাড়া ব্রাউজারেই ফ্রি খেলুন।";
const path = "/games/shoter";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs(path) },
  openGraph: { title, description, url: abs(path), type: "website", locale: "bn_BD", siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title, description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: title,
            description,
            url: abs(path),
            inLanguage: "bn-BD",
            genre: "Arcade",
            gamePlatform: "Web browser",
            applicationCategory: "Game",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
            isAccessibleForFree: true,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "Bengal Mission", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
