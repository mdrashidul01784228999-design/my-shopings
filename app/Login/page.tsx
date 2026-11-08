import type { Metadata } from "next";
import Homeps from "./Home";

export const metadata: Metadata = {
  title: "লগইন | My Shopings",
  description: "My Shopings অ্যাকাউন্টে লগইন করুন।",
  // লগইন পেজ সার্চ রেজাল্টে আসার দরকার নেই
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Page() {
  return <Homeps />;
}

/* ===== SEO UPDATE BACKUP: নিচের মূল লাইনগুলো SEO আপডেটে বদলানো হয়েছে (ব্যাকআপ হিসেবে রাখা) =====
  metadataBase: new URL("https://yourdomain.com"),
    url: "https://yourdomain.com/login",
        url: "https://yourdomain.com/og-image.png",
    images: ["https://yourdomain.com/og-image.png"],
    creator: "@yourhandle",
    canonical: "https://yourdomain.com/login",
===== END BACKUP ===== */
