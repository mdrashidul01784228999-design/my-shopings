import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "ব্রাউজারেই ফ্রি অনলাইন ভিডিও এডিটর – ফিল্টার ও এডিট | My Shopings";
const description = "কোনো সফটওয়্যার ইনস্টল ছাড়াই ব্রাউজারে ভিডিও এডিট করুন — সিনেমা, ভিনটেজ, সাদা-কালো ও অন্যান্য ফিল্টার সহ ফ্রি ভিডিও এডিটর।";
const path = "/advance/video";

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
            "@type": "WebApplication",
            name: title,
            description,
            url: abs(path),
            inLanguage: "bn-BD",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "ভিডিও এডিটর", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
    </>
  );
}
