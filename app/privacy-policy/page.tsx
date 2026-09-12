import type { Metadata } from "next";
import PrivacyClientUI from "./Privacyclie"; // আমরা পাশের ফাইলটিকে এখানে ইম্পোর্ট করছি

// ✅ Next.js 15/16+ এবং React 19 এর জন্য অফিশিয়াল ও পাওয়ারফুল SEO মেটাডেটা
export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি | Privacy Policy",
  description: "আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। এখানে ব্যাখ্যা করা হয়েছে আপনি আমাদের সেবা ব্যবহার করলে আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি।",
  keywords: ["Privacy Policy", "গোপনীয়তা নীতি", "তথ্য সুরক্ষা", "নিরাপত্তা নীতি", "Privacy"],
  openGraph: {
    title: "গোপনীয়তা নীতি | Privacy Policy",
    description: "আমাদের সেবা ব্যবহারকালীন আপনার তথ্য সংগ্রহ ও সুরক্ষার বিস্তারিত গাইডলাইন।",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyClientUI />;
}




// // pages/privacy-policy.tsx
// "use client";
// import React from "react";
// import { motion } from "framer-motion";
// import { FaInfoCircle, FaUserShield, FaLock, FaCookieBite, FaUserCheck, FaSyncAlt, FaEnvelope } from "react-icons/fa";
// import { TypeAnimation } from "react-type-animation";

// const sections = [
//   {
//     title: "তথ্য সংগ্রহ",
//     description:
//       "আমরা আপনার নাম, ইমেইল, ফোন নম্বর এবং অন্যান্য প্রাসঙ্গিক তথ্য সংগ্রহ করতে পারি, যখন আপনি আমাদের সাইটে নিবন্ধন করেন বা অর্ডার দেন।",
//     icon: <FaInfoCircle className="text-xl text-blue-500" />,
//   },
//   {
//     title: "তথ্যের ব্যবহার",
//     description:
//       "আমরা আপনার তথ্য ব্যবহার করি কাস্টমার সার্ভিস উন্নত করতে, অর্ডার প্রক্রিয়া করতে এবং আমাদের অফার ও বিজ্ঞাপন আরও প্রাসঙ্গিক করতে।",
//     icon: <FaUserShield className="text-xl text-green-500" />,
//   },
//   {
//     title: "তথ্য সুরক্ষা",
//     description:
//       "আপনার তথ্য নিরাপদ রাখতে আমরা শক্তিশালী সুরক্ষা ব্যবস্থা গ্রহণ করি এবং আপনার অনুমতি ছাড়া তা কোনো তৃতীয় পক্ষের সাথে শেয়ার করি না।",
//     icon: <FaLock className="text-xl text-red-500" />,
//   },
//   {
//     title: "কুকিজ ব্যবহারের নীতি",
//     description:
//       "আমাদের ওয়েবসাইটে কুকিজ ব্যবহার করা হয় যাতে আমরা ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে পারি। আপনি চাইলে আপনার ব্রাউজার থেকে কুকিজ অস্বীকার করতে পারেন।",
//     icon: <FaCookieBite className="text-xl text-yellow-500" />,
//   },
//   {
//     title: "আপনার অধিকার",
//     description:
//       "আপনি আপনার ব্যক্তিগত তথ্য দেখতে, সংশোধন করতে অথবা মুছে ফেলতে আমাদের সাথে যোগাযোগ করতে পারেন।",
//     icon: <FaUserCheck className="text-xl text-purple-500" />,
//   },
//   {
//     title: "নীতির পরিবর্তন",
//     description:
//       "আমরা প্রয়োজন অনুযায়ী গোপনীয়তা নীতি আপডেট করতে পারি। পরিবর্তনের ক্ষেত্রে আমরা এই পেজে তারিখসহ জানিয়ে দেবো।",
//     icon: <FaSyncAlt className="text-xl text-indigo-500" />,
//   },
//   {
//     title: "যোগাযোগ করুন",
//     description:
//       "গোপনীয়তা নীতি সম্পর্কে যেকোনো প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন: support@yourdomain.com",
//     icon: <FaEnvelope className="text-xl text-pink-500" />,
//   },
// ];

// const PrivacyPolicy = () => {
//   return (
//     <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 text-gray-800 dark:text-gray-100">
//       {/* Hero with Typing Animation */}
//       <motion.div
//         initial={{ opacity: 0, y: -40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-center mb-14"
//       >
//         <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4">
//           <TypeAnimation
//             sequence={[
//               "গোপনীয়তা নীতি",
//               1500,
//               "আমাদের প্রাইভেসি গাইডলাইন",
//               1500,
//               "আপনার তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ",
//               1500,
//             ]}
//             speed={50}
//             repeat={Infinity}
//             wrapper="span"
//           />
//         </h1>
//         <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//           আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। এখানে ব্যাখ্যা করা হয়েছে আপনি আমাদের সেবা ব্যবহার করলে আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি।
//         </p>
//       </motion.div>

//       {/* Content Sections */}
//       <section className="space-y-10">
//         {sections.map((section, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.6, delay: index * 0.15 }}
//             viewport={{ once: true }}
//             className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition duration-300 hover:-translate-y-1"
//           >
//             <div className="flex items-center gap-3 mb-2">
//               {section.icon}
//               <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
//                 {section.title}
//               </h2>
//             </div>
//             <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//               {section.description}
//             </p>
//           </motion.div>
//         ))}
//       </section>
//     </main>
//   );
// };

// export default PrivacyPolicy;

