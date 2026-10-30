import type { Metadata } from "next";
import { abs, SITE_NAME } from "../seo/site";

const title = "সব পণ্য ও দাম – অনলাইনে অর্ডার করুন | My Shopings";
const description = "সেরা দামে সব ক্যাটাগরির পণ্য দেখুন ও অর্ডার করুন। দ্রুত হোম ডেলিভারি ও নিরাপদ পেমেন্ট সহ বাংলাদেশ জুড়ে।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/products-view") },
  openGraph: { title, description, url: abs("/products-view"), type: "website", locale: "bn_BD", siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title, description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
