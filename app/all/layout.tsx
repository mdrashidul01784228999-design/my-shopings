import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "ওয়েবসাইট ও সফটওয়্যার ডেভেলপমেন্ট সার্ভিস প্যাকেজ ও বাজেট | My Shopings";
const description = "ওয়েবসাইট, অ্যাপ ও আইটি সার্ভিসের প্যাকেজ, অন্তর্ভুক্ত ফিচার ও আনুমানিক বাজেট দেখুন এবং সরাসরি অর্ডার করুন।";
const path = "/all";

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
              { "@type": "ListItem", position: 2, name: "সার্ভিস সমূহ", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
