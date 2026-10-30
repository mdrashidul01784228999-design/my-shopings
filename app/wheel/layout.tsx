import type { Metadata } from "next";
import SeoContent from "../seo/SeoContent";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME } from "../seo/site";

const title = "লাকি লটারি হুইল – নাম দিয়ে অনলাইনে লটারি ও র‍্যাফেল ড্র | My Shopings";
const description = "অংশগ্রহণকারীর নাম, নম্বর ও ছবি যোগ করে চাকা ঘুরান এবং স্বচ্ছভাবে বিজয়ী বেছে নিন। ইভেন্ট, গিভঅ্যাওয়ে ও ক্লাসরুমের জন্য ফ্রি টুল।";
const path = "/wheel";

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
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "লাকি হুইল", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
      <SeoContent path={path} />
    </>
  );
}
