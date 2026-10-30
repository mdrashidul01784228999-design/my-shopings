import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "অনলাইন ই-পেপার – জাতীয়, আন্তর্জাতিক, প্রযুক্তি ও অর্থনীতির সংবাদ | My Shopings";
const description = "জাতীয়, আন্তর্জাতিক, প্রযুক্তি, অর্থনীতি, স্বাস্থ্য ও বিজ্ঞানের লেটেস্ট সংবাদ ক্যাটাগরি অনুযায়ী এক জায়গায় পড়ুন।";
const path = "/services/e-paper";

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
            "@type": "CollectionPage",
            name: title,
            description,
            url: abs(path),
            inLanguage: "bn-BD",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "ই-পেপার", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
    </>
  );
}
