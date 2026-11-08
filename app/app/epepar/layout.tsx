import type { Metadata } from "next";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "ই-পেপার – আজকের সংবাদ ও শিরোনাম অনলাইনে পড়ুন | My Shopings";
const description = "বিভিন্ন ক্যাটাগরির আজকের লেটেস্ট সংবাদ ও শিরোনাম এক জায়গায় পড়ুন, যেকোনো ডিভাইসে।";
const path = "/epepar";

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
            isAccessibleForFree: true,
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
