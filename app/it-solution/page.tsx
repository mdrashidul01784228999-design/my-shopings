import React from 'react';
import { FaLaptopCode, FaServer, FaShieldAlt, FaMobileAlt, FaFacebookF, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';
import Home from './Home'

// Next.js 19+ SEO Metadata Setup
export const metadata = {
  title: 'আইটি সমাধান ও টেকনোলজি সার্ভিস | IT Solution',
  description: 'আপনার ব্যবসার ডিজিটাল রূপান্তরের জন্য বিশ্বস্ত আইটি সমাধান। সফটওয়্যার ডেভেলপমেন্ট, ওয়েব ডিজাইন, সাইবার সিকিউরিটি এবং ক্লাউড কম্পিউটিং সেবা।',
  keywords: ['আইটি সমাধান', 'IT Solution Bangladesh', 'ওয়েব ডেভেলপমেন্ট', 'সফটওয়্যার সার্ভিস', 'Next.js 19 Developer'],
  openGraph: {
    title: 'আইটি সমাধান ও টেকনোলজি সার্ভিস',
    description: 'আধুনিক নিয়ন গ্লো টেকনোলজি ও সফটওয়্যার সলিউশন।',
    url: 'https://yourdomain.com/it-solution',
    siteName: 'Rashidul IT',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1603297631957-4b2c6313f93e',
        width: 1200,
        height: 630,
        alt: 'IT Solution Banner',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};


export default function GTSolutionPage() {
  return (
   <>
   <Home />
   
   </>
  );
}// import React from 'react'
// import Home from './Home'

// export default function page() {
//   return (
// <>

// <Home />

// </>
//   )
// }
