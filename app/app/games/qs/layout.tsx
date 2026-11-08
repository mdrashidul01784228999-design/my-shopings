import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "প্রশ্নোত্তর গেম – সঠিক উত্তর দিয়ে কয়েন জিতুন | My Shopings";
const description = "প্রশ্নের সঠিক উত্তর দিয়ে কয়েন জিতুন, লেভেল ও স্ট্রিক বাড়ান। ফ্রি অনলাইন কুইজ গেম — মোবাইল ও কম্পিউটারে খেলুন।";
const path = "/games/qs";

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
            "@type": "VideoGame",
            name: title,
            description,
            url: abs(path),
            inLanguage: "bn-BD",
            genre: "Quiz",
            gamePlatform: "Web browser",
            applicationCategory: "Game",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "প্রশ্নোত্তর গেম", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
    </>
  );
}
