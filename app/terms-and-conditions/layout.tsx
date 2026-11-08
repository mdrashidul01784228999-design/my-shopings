import type { Metadata } from "next";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME, breadcrumbLd } from "../seo/site";

const title = "শর্তাবলী | Terms & Conditions – My Shopings";
const description = "My Shopings ব্যবহারের শর্তাবলী, অর্ডার, রিটার্ন ও পেমেন্ট সংক্রান্ত নিয়মাবলী বিস্তারিত পড়ুন।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/terms-and-conditions") },
  openGraph: { title, description, url: abs("/terms-and-conditions"), type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebPage", name: "শর্তাবলী", url: abs("/terms-and-conditions"), inLanguage: "bn-BD", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") } },
          breadcrumbLd([{ name: "শর্তাবলী", path: "/terms-and-conditions" }]),
        ]}
      />
      {children}
    </>
  );
}
