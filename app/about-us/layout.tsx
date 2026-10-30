import type { Metadata } from "next";
import { abs, SITE_NAME } from "../seo/site";

const title = "আমাদের সম্পর্কে | My Shopings – বাংলাদেশের বিশ্বস্ত অনলাইন শপ";
const description = "My Shopings সম্পর্কে জানুন: আমাদের যাত্রা, টিম ও লক্ষ্য। সারা বাংলাদেশে নিরাপদ ডেলিভারি ও সেরা গ্রাহকসেবা।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/about-us") },
  openGraph: { title, description, url: abs("/about-us"), type: "website", locale: "bn_BD", siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title, description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
