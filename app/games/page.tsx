import React from 'react';
import Snackes from './Home';
import { Metadata } from 'next';

// ১. সার্চ ইঞ্জিন র‍্যাংকিং এবং সোশ্যাল শেয়ারিংয়ের জন্য SEO মেটাডাটা সেটআপ
// এই অংশটি "use client" ফাইলের বাইরে, আপনার page.tsx বা layout.tsx ফাইলে থাকবে।



export const metadata: Metadata = {
  title: 'সব ক্যাটাগরি একসাথে | Premium Online Hub',
  description: 'জনপ্রিয় অনলাইন গেমস, প্রিমিয়াম শপিং, আকর্ষণীয় গিফট কার্ড এবং ভাইরাল ট্রেন্ডস কালেকশন পাবেন এক জায়গায়। এখনই এক্সপ্লোর করুন!',
  keywords: 'অনলাইন গেমস, প্রিমিয়াম শপিং, গিফট কার্ড, ট্রেন্ডিং ডিলস, ক্লাসিক স্নেক, এরিনা গেমস',
  authors: [{ name: 'Your Brand Name' }],
  
  // Facebook / LinkedIn Social Share (Open Graph)
  openGraph: {
    title: 'সব ক্যাটাগরি একসাথে | Premium Online Hub',
    description: 'গেমস, শপিং, এবং গিফট কার্ডের সেরা প্রিমিয়াম কালেকশন এখন লাইভ।',
    url: 'https://yourwebsite.com/categories',
    siteName: 'Premium Portal',
    images: [
      {
        url: 'https://yourwebsite.com/og-banner.jpg', // আপনার প্রমোশনাল ব্যানারের লিংক
        width: 1200,
        height: 630,
        alt: 'Premium Portal All Categories',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },

  // Twitter Social Share Card
  twitter: {
    card: 'summary_large_image',
    title: 'সব ক্যাটাগরি একসাথে | Premium Online Hub',
    description: 'সেরা ক্যাটাগরি বেছে নিন এবং প্রিমিয়াম নেভিগেশন এক্সপেরিয়েন্স উপভোগ করুন।',
    images: ['https://yourwebsite.com/og-banner.jpg'],
  },
};
// ২. কম্পোনেন্টের নাম বড় হাতের অক্ষরে (Capitalized 'Page') করা হয়েছে
export default function Page() {
  return (
    <>
      {/* গেমের মূল কম্পোনেন্ট */}
      <Snackes />
    </>
  );
}

