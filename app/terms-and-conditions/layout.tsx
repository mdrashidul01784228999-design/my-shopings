import type { Metadata } from "next";
import { abs, SITE_NAME } from "../seo/site";

const title = "শর্তাবলী | Terms & Conditions – My Shopings";
const description = "My Shopings ব্যবহারের শর্তাবলী, অর্ডার, রিটার্ন ও পেমেন্ট সংক্রান্ত নিয়মাবলী বিস্তারিত পড়ুন।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/terms-and-conditions") },
  openGraph: { title, description, url: abs("/terms-and-conditions"), type: "website", locale: "bn_BD", siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title, description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
