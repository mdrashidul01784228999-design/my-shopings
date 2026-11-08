import type { Metadata } from "next";
import JsonLd from "../../seo/JsonLd";
import { abs, SITE_NAME, breadcrumbLd } from "../../seo/site";

type Props = { params: Promise<{ catagori: string }>; children: React.ReactNode };

const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export async function generateMetadata({ params }: { params: Props["params"] }): Promise<Metadata> {
  const p = await params;
  const name = dec(p.catagori);
  const title = `${name} – সেরা দাম ও অনলাইন অর্ডার | ${SITE_NAME}`;
  const description = `${name} এর লেটেস্ট দাম, ছবি ও স্পেসিফিকেশন দেখুন। বাংলাদেশে দ্রুত হোম ডেলিভারি সহ ${SITE_NAME} থেকে এখনই অর্ডার করুন।`;
  const url = abs(`/products/${p.catagori}`);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "bn_BD", siteName: SITE_NAME, images: [{ url: abs("/opengraph-image"), width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [abs("/opengraph-image")] },
  };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Props["params"] }) {
  const p = await params;
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: dec(p.catagori), path: `/products/${p.catagori}` }])} />
      {children}
    </>
  );
}
