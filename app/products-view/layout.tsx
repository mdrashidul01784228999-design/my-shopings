import type { Metadata } from "next";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME, breadcrumbLd } from "../seo/site";

const title = "সব পণ্য ও দাম – অনলাইনে অর্ডার করুন | My Shopings";
const description = "সেরা দামে সব ক্যাটাগরির পণ্য দেখুন ও অর্ডার করুন। দ্রুত হোম ডেলিভারি ও নিরাপদ পেমেন্ট সহ বাংলাদেশ জুড়ে।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/products-view") },
  openGraph: { title, description, url: abs("/products-view"), type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "CollectionPage", name: "সব পণ্য", url: abs("/products-view"), inLanguage: "bn-BD", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") } },
          breadcrumbLd([{ name: "সব পণ্য", path: "/products-view" }]),
        ]}
      />
      {children}
    </>
  );
}
