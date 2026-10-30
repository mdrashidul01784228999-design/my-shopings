import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "3D ভার্চুয়াল শপিং মল – দোকানে ঢুকে পণ্য দেখুন ও কিনুন | My Shopings";
const description = "3D মলে ঘুরে যেকোনো দোকানে প্রবেশ করুন, পণ্য দেখুন এবং কার্টে নিন — ব্রাউজারেই নতুন ধরনের অনলাইন শপিং অভিজ্ঞতা।";
const path = "/real_shop";

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
            applicationCategory: "ShoppingApplication",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "3D শপিং মল", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
