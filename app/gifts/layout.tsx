import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "লাভ হিসাব ক্যালকুলেটর ও অর্ডার ব্যাগ – ব্যবসায়ীদের জন্য | My Shopings";
const description = "পণ্যের কেনা দাম ও লাভের হার দিয়ে বিক্রয়মূল্য, মোট লাভ ও সর্বমোট প্রদেয় অনলাইনে হিসাব করুন এবং ব্যাগ থেকে সরাসরি অর্ডার সম্পন্ন করুন।";
const path = "/gifts";

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
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "লাভ হিসাব ও অর্ডার ব্যাগ", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
