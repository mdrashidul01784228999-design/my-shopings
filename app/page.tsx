import { Metadata } from "next";
import FullyLoadedTerminal from "./Homes"; // আপনার আসল ড্যাশবোর্ড ফাইলটির পাথ

// আপনার প্রজেক্টের লাইভ ডোমেইন কনফিগ (আপনার আসল ডোমেইন দিন)
const SITE_URL = "https://yourdomain.com"; 
const SHARE_IMAGE_URL = `${SITE_URL}/og-image.png`;

/**
 * 🎯 টপ ৫ সার্চ ইঞ্জিন (Google, Bing, Yahoo, Yandex, Baidu) এবং সোশাল মিডিয়া অপ্টিমাইজড মেটাডাটা
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Maturity Terminal v4 | মেয়াদী ডিপোজিট ও রিয়াল-টাইম সেটেলমেন্ট লেজার",
  description: "মো: রশিদুল অফিশিয়াল-এর সুরক্ষিত লিকুইডিটি টার্মিনাল। ১ মাস, ২ মাস ও ৬ মাসের মেয়াদে ফান্ড জমা রাখুন এবং শেষ দিনের লাইভ বাজার মূল্যের ওপর সম্পূর্ণ প্রফিট বুঝে নিন।",
  keywords: [
    "ম্যাচুরিটি টার্মিনাল v4",
    "মো: রশিদুল অফিশিয়াল",
    "Md Rashidul official",
    "মেয়াদী ডিপোজিট প্রফিট",
    "১ মাসের ডিপোজিট প্ল্যান",
    "২ মাসের ফান্ড লক",
    "৬ মাসের মেয়াদী ইনভেস্টমেন্ট",
    "Maturity Day Settlement",
    "পণ্যমূল্যের ওপর ডিপোজিট",
    "Next.js Trading Dashboard"
  ],
  authors: [{ name: "Md Rashidul", url: SITE_URL }],
  creator: "Md Rashidul Official",
  publisher: "Maturity Terminal Network",
  
  // ক্যানোনিকাল লিংক (ডুপ্লিকেট কন্টেন্ট পেনাল্টি এড়াতে)
  alternates: {
    canonical: `${SITE_URL}/dashboard`,
  },

  // 🔍 টপ ৫ সার্চ ইঞ্জিনের জন্য ক্রলিং পলিসি (Index, Follow এবং ক্রলার ডিরেক্টিভ)
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 👥 সোশাল মিডিয়া শেয়ারিং এবং ওজি মেটাডাটা (Facebook, WhatsApp, Messenger, Telegram)
  openGraph: {
    title: "Maturity Terminal v4 | ১, ২ ও ৬ মাসের সুরক্ষিত ডিপোজিট লেজার",
    description: "আপনার ফান্ড নির্দিষ্ট মেয়াদে লক করুন। দৈনিক বাজারের প্যানিক বা ভলাটিলিটি মুক্ত ট্রেডিং; লাভ বা ক্ষতি নির্ধারিত হবে শুধুমাত্র চুক্তির শেষ দিনের লাইভ রেটের ওপর।",
    url: `${SITE_URL}/dashboard`,
    siteName: "Maturity Terminal",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Maturity Terminal v4 Deposit Interface",
      },
    ],
  },

  // 🐦 টুইটার ও এক্স (X) কার্ড মেটাডাটা
  twitter: {
    card: "summary_large_image",
    title: "Maturity Terminal v4 | Secure Deposit & Real-time Ledger",
    description: "দৈনিক বাজারের প্যানিক বা ভলাটিলিটি মুক্ত ইনভেস্টমেন্ট টার্মিনাল। লাভ বা ক্ষতি নির্ধারিত হবে চুক্তির শেষ দিনের লাইভ রেটে।",
    creator: "@MdRashidulOfficial",
    images: [SHARE_IMAGE_URL],
  },

  // সার্চ ইঞ্জিন ওনারশিপ ভেরিফিকেশন (গুগল ও ইয়ানডেক্স)
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE", // আপনার গুগল সার্চ কনসোল কোড দিন
    yandex: "YOUR_YANDEX_VERIFICATION_CODE", // রাশিয়ার টপ সার্চ ইঞ্জিন ইয়ানডেক্স ভেরিফিকেশন
  },
};

export default function Page() {
  
  // 🤖 গুগল, বিং এবং অন্যান্য সার্চ ইঞ্জিনের জন্য JSON-LD স্কিমা স্ট্রাকচার্ড ডেটা
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Maturity Terminal v4",
    "operatingSystem": "All",
    "applicationCategory": "FinanceApplication",
    "description": "সুরক্ষিত লিকুইডিটি টার্মিনাল যেখানে ১, ২ ও ৬ মাসের মেয়াদে ফান্ড জমা রেখে রিয়াল-টাইম সেটেলমেন্ট লেজার ট্র্যাক করা যায়।",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Md Rashidul",
      "url": SITE_URL
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dashboard",
        "item": `${SITE_URL}/dashboard`
      }
    ]
  };

  return (
    <>
      {/* Bing, Yahoo এবং Baidu ওয়েবমাস্টার ভেরিফিকেশন মেটা ট্যাগ */}
      <head>
        {/* Bing & Yahoo Search Webmaster Verification */}
        <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
        {/* Baidu (চীনের বৃহত্তম সার্চ ইঞ্জিন) Verification */}
        <meta name="baidu-site-verification" content="YOUR_BAIDU_VERIFICATION_CODE" />
      </head>

      {/* সার্চ ইঞ্জিনগুলোর জন্য রিচ রেজাল্টস স্কিমা ইনজেকশন */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* আপনার মূল ড্যাশবোর্ড কম্পোনেন্ট */}
      <FullyLoadedTerminal />
    </>
  );
}

