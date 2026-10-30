import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME } from "../../seo/site";

const title = "নাম্বার রানার গেম – দৌড়ে প্রশ্নের উত্তর দিন ও কয়েন জিতুন | My Shopings";
const description = "দৌড়াতে দৌড়াতে সঠিক উত্তর বেছে নিন — সঠিক হলে কয়েন বাড়বে, ভুল হলে কমবে। ফ্রি ব্রাউজার গেম।";
const path = "/games/number";

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
            genre: "Runner",
            gamePlatform: "Web browser",
            applicationCategory: "Game",
            offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "নাম্বার রানার", item: abs(path) },
            ],
          },
        ]}
      />
      {children}
    </>
  );
}
