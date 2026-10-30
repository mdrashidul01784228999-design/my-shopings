import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "বন্ধন – পছন্দের জীবনসঙ্গী খুঁজুন | প্রোফাইল ও প্রস্তাব | My Shopings";
const description = "প্রোফাইল তৈরি করে পছন্দের মানুষকে খুঁজুন, পছন্দের তালিকা ও প্রস্তাব পাঠান। আপনার প্রোফাইল কারা দেখবে তা নিজেই নিয়ন্ত্রণ করুন।";
const path = "/nikah";

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
            applicationCategory: "SocialNetworkingApplication",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "বন্ধন", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
