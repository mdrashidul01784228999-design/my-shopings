import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "ফ্রি PDF থেকে ইমেজ ও ইমেজ থেকে PDF কনভার্টার অনলাইন | My Shopings";
const description = "ব্রাউজারেই PDF-কে ছবিতে এবং ছবিকে PDF-এ রূপান্তর করুন — সম্পূর্ণ ফ্রি, কোনো সফটওয়্যার বা রেজিস্ট্রেশন লাগবে না।";
const path = "/pdf";

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
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
            isAccessibleForFree: true,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "PDF কনভার্টার", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
