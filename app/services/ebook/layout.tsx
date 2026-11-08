import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "ই-বুক পাঠ | My Shopings";
const description = "My Shopings-এর ই-বুক সংগ্রহ অনলাইনে পড়ুন — মোবাইল বা কম্পিউটারে যেকোনো সময়, রেজিস্ট্রেশন ছাড়াই ফ্রি পড়ার সুযোগ।";
const path = "/services/ebook";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs(path) },
  openGraph: { title, description, url: abs(path), type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
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
              { "@type": "ListItem", position: 2, name: "ই-বুক", item: abs(path) },
            ],
          },
        ]}
      />
      <h1 className="sr-only">{title}</h1>
      {children}
    </>
  );
}
