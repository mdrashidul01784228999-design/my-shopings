import type { Metadata } from "next";
import { abs, SITE_NAME } from "../../../seo/site";

type Props = { params: Promise<{ catagori: string; brandname: string }>; children: React.ReactNode };

const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export async function generateMetadata({ params }: { params: Props["params"] }): Promise<Metadata> {
  const p = await params;
  const name = `${dec(p.brandname)} ${dec(p.catagori)}`;
  const title = `${name} – সেরা দাম ও অনলাইন অর্ডার | ${SITE_NAME}`;
  const description = `${name} এর লেটেস্ট দাম, ছবি ও স্পেসিফিকেশন দেখুন। বাংলাদেশে দ্রুত হোম ডেলিভারি সহ ${SITE_NAME} থেকে এখনই অর্ডার করুন।`;
  const url = abs(`/products/${p.catagori}/${p.brandname}`);
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "bn_BD", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) { return children; }
