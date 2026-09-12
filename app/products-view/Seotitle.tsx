import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "লগইন করুন ও রেফার করে আয় করুন | MyApp 🚀",
  description:
    "এখনই লগইন করুন, বন্ধুদের রেফার করুন এবং প্রতি রেফারে ৫/১০/২০ টাকা আয় করুন। সহজে ইনকাম শুরু করুন অনলাইনে।",

  keywords: [
    "রেফার এন্ড আর্ন",
    "লগইন",
    "অনলাইন ইনকাম",
    "বাংলা আয়",
    "refer and earn",
    "make money online",
    "affiliate income",
  ],

  metadataBase: new URL("https://yourdomain.com"),

  openGraph: {
    title: "🔥 রেফার করলেই আয় শুরু করুন | MyApp",
    description:
      "লগইন করুন, রেফার লিংক শেয়ার করুন এবং প্রতিটি সফল রেফারে আয় করুন ৫/১০/২০ টাকা।",
    url: "https://yourdomain.com/login",
    siteName: "MyApp",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Refer & Earn Banner",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "রেফার করলেই আয় | MyApp",
    description:
      "লগইন করুন এবং রেফার করে আয় করুন সহজেই। এখনই শুরু করুন!",
    images: ["https://yourdomain.com/og-image.png"],
    creator: "@yourhandle",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://yourdomain.com/login",
  },

  category: "finance",
};

export default function Page() {
  return <h3>tile ki</h3>
}