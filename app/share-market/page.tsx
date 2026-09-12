import { Metadata } from "next";
import FullyLoadedTerminal from "./Home"; // আপনার আসল ড্যাশবোর্ড ফাইলটির পাথ দিন

// --- আপনার প্রজেক্টের ডিপোজিট মেকানিজমের সাথে মিল রেখে সম্পূর্ণ বাংলা এসইও ---
export const metadata: Metadata = {
  title: "Maturity Terminal v4 | মেয়াদী ডিপোজিট ও রিয়াল-টাইম সেটেলমেন্ট লেজার",
  description: " অফিশিয়াল এর সুরক্ষিত লিকুইডিটি টার্মিনাল। ১ মাস, ২ মাস ও ৬ মাসের মেয়াদে ফান্ড জমা রাখুন। মধ্যবর্তী দামের ওঠানামা অগ্রাহ্য করে ঠিক মেয়াদের শেষ দিনের লাইভ বাজার মূল্যের ওপর সম্পূর্ণ প্রফিট বুঝে নিন।",
  keywords: [
    "ম্যাচুরিটি টার্মিনাল v4",
    "মো: রশিদুল অফিশিয়াল",
    "Md Rashidul official",
    "মেয়াদী ডিপোজিট প্রফিট",
    "১ মাসের ডিপোজিট প্ল্যান",
    "২ মাসের ফান্ড লক",
    "৬ মাসের মেয়াদী ইনভেস্টমেন্ট",
    "Maturity Day Settlement",
    "পণ্যমূল্যের ওপর ডিপোজিট",
    "Next.js Trading Dashboard"
  ],
  authors: [{ name: "Md Rashidul", url: "https://yourdomain.com" }],
  creator: "Md Rashidul Official",
  publisher: "Maturity Terminal Network",
  
  // গুগল বটের ক্রলিং নির্দেশনা
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ফেসবুক ও সোশ্যাল মিডিয়া শেয়ার প্রিভিউ অপ্টিমাইজেশন
  openGraph: {
    title: "Maturity Terminal v4 | ১, ২ ও ৬ মাসের সুরক্ষিত ডিপোজিট লেজার",
    description: "আপনার ফান্ড নির্দিষ্ট মেয়াদে লক করুন। দৈনিক বাজারের প্যানিক বা ভলাটিলিটি মুক্ত ট্রেডিং; লাভ বা ক্ষতি নির্ধারিত হবে শুধুমাত্র চুক্তির শেষ দিনের লাইভ রেটের ওপর।",
    url: "https://yourdomain.com/dashboard",
    siteName: "Maturity Terminal",
    images: [
      {
        url: "https://yourdomain.com/og-image.png", // ড্যাশবোর্ডের স্ক্রিনশট ইউআরএল
        width: 1200,
        height: 630,
        alt: "Maturity Terminal v4 Deposit Interface",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },

  alternates: {
    canonical: "https://yourdomain.com/dashboard",
  },
};

export default function Page() {
  return <FullyLoadedTerminal />;
}


