import type { Metadata } from "next";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME, breadcrumbLd } from "../seo/site";

const title = "আমাদের সম্পর্কে | My Shopings – বাংলাদেশের বিশ্বস্ত অনলাইন শপ";
const description = "My Shopings সম্পর্কে জানুন: আমাদের যাত্রা, টিম ও লক্ষ্য। সারা বাংলাদেশে নিরাপদ ডেলিভারি ও সেরা গ্রাহকসেবা।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/about-us") },
  openGraph: { title, description, url: abs("/about-us"), type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "AboutPage", name: "আমাদের সম্পর্কে", url: abs("/about-us"), inLanguage: "bn-BD", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") } },
          breadcrumbLd([{ name: "আমাদের সম্পর্কে", path: "/about-us" }]),
        ]}
      />
      {children}
    </>
  );
}
