import type { Metadata } from "next";
import { abs, SITE_NAME } from "../seo/site";

const title = "যোগাযোগ করুন | My Shopings কাস্টমার সাপোর্ট";
const description = "অর্ডার, ডেলিভারি বা যেকোনো প্রশ্নে My Shopings-এর সাপোর্ট টিমের সাথে যোগাযোগ করুন — ইমেইল, ফোন ও ঠিকানা এক জায়গায়।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: abs("/contact-us") },
  openGraph: { title, description, url: abs("/contact-us"), type: "website", locale: "bn_BD", siteName: SITE_NAME },
  twitter: { card: "summary_large_image", title, description },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
