import type { Metadata } from "next";
import JsonLd from "../seo/JsonLd";
import { abs, SITE_NAME, breadcrumbLd } from "../seo/site";

const title = "যোগাযোগ করুন | My Shopings কাস্টমার সাপোর্ট";
const description = "অর্ডার, ডেলিভারি বা যেকোনো প্রশ্নে My Shopings-এর সাপোর্ট টিমের সাথে যোগাযোগ করুন — ইমেইল, ফোন ও ঠিকানা এক জায়গায়।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/contact-us") },
  openGraph: { title, description, url: abs("/contact-us"), type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ContactPage", name: "যোগাযোগ", url: abs("/contact-us"), inLanguage: "bn-BD", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: abs("/") } },
          breadcrumbLd([{ name: "যোগাযোগ", path: "/contact-us" }]),
        ]}
      />
      {children}
    </>
  );
}
