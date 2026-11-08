// components/Footer.tsx
"use client";
import React from "react";
import Link from "next/link";
import { motion, MotionConfig, Variants } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { QRCodeSVG } from "qrcode.react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaLink,
  FaMobileAlt,
  FaArrowRight,
} from "react-icons/fa";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

const sans = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });
const serif = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["600", "800"] });

const EMAIL = "myshopings@gmail.com";
const PHONE_DISPLAY = "01784-228999";
const PHONE_HREF = "tel:+8801784228999";
const ADDRESS = "পিপুলবাড়ীয়া বাজার, সিরাজগঞ্জ সদর, বাংলাদেশ";
const APP_URL = "https://myshopings.com/app";

const links = [
  { href: "/about-us", label: "আমাদের সম্পর্কে" },
  { href: "/contact-us", label: "যোগাযোগ করুন" },
  { href: "/privacy-policy", label: "প্রাইভেসি পলিসি" },
  { href: "/terms-and-conditions", label: "শর্তাবলি" },
];

const socials = [
  { href: "https://facebook.com/", label: "Facebook", icon: FaFacebookF, grad: "from-sky-400 to-blue-600" },
  { href: "https://instagram.com/", label: "Instagram", icon: FaInstagram, grad: "from-amber-300 via-rose-500 to-fuchsia-600" },
  { href: "https://twitter.com/", label: "Twitter", icon: FaTwitter, grad: "from-sky-300 to-cyan-500" },
  { href: "https://linkedin.com/", label: "LinkedIn", icon: FaLinkedinIn, grad: "from-sky-500 to-indigo-600" },
  { href: "https://youtube.com/@myshopingscom?si=59q7Kro_ZEzprhsM", label: "YouTube", icon: FaYoutube, grad: "from-rose-500 to-red-600" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const cardClass =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-colors duration-300 hover:border-amber-200/40";

const CardTitle = ({
  icon: Icon,
  grad,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  grad: string;
  children: React.ReactNode;
}) => (
  <h3 style={{ fontFamily: serif.style.fontFamily }} className="mb-5 flex items-center gap-3 text-xl font-extrabold text-white">
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-[#120b2e] shadow-lg`}>
      <Icon className="text-base" />
    </span>
    {children}
  </h3>
);

const Footer = () => {
  return (
    <MotionConfig reducedMotion="user">
      <style>{`
        @keyframes gx-shine { to { background-position: 200% center; } }
        @keyframes gx-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.15); } }
        @keyframes gx-float-b { 0%,100% { transform: translate(0,0) scale(1.1); } 50% { transform: translate(-50px,-20px) scale(0.95); } }
        .gx-shine {
          background: linear-gradient(90deg, #f6d99a, #ff6f9c, #a78bfa, #5eead4, #f6d99a);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: gx-shine 6s linear infinite;
        }
        .gx-a { animation: gx-float-a 14s ease-in-out infinite; }
        .gx-b { animation: gx-float-b 18s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .gx-shine, .gx-a, .gx-b { animation: none; } }
      `}</style>

      <footer className={`${sans.className} relative isolate mt-16 overflow-hidden bg-[#120b2e] px-5 pb-8 pt-20 text-[#fbf7ef] sm:px-6`}>
        {/* Gold top line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        {/* Ambient light */}
        <div className="gx-a absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-violet-600/35 blur-3xl sm:h-96 sm:w-96" />
        <div className="gx-b absolute -right-24 bottom-10 -z-10 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-7xl">
          {/* Animated title */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-14 text-center"
          >
            <h2
              style={{ fontFamily: serif.style.fontFamily }}
              className="min-h-[2.8em] text-3xl font-extrabold leading-[1.35] sm:min-h-[1.4em] sm:text-5xl"
            >
              <span className="gx-shine">
                <TypeAnimation
                  sequence={[
                    "আমাদের সম্পর্কে",
                    1500,
                    "যোগাযোগ করুন",
                    1500,
                    "সোশ্যাল মিডিয়াতে যুক্ত থাকুন",
                    1500,
                    "সেরা সেবা নিশ্চিতে অঙ্গীকারবদ্ধ",
                    1500,
                  ]}
                  speed={50}
                  repeat={Infinity}
                  wrapper="span"
                />
              </span>
            </h2>
          </motion.div>

          {/* Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* About */}
            <motion.div variants={item} whileHover={{ y: -6 }} className={cardClass}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-300 to-violet-400" />
              <CardTitle icon={FaInfoCircle} grad="from-sky-300 to-violet-400">
                আমাদের সম্পর্কে
              </CardTitle>
              <p className="text-sm leading-7 text-white/70">
                আমরা একটি বিশ্বস্ত ই-কমার্স প্রতিষ্ঠান, যেখানে আপনি পাবেন সেরা মানের পণ্য, সহজে ও দ্রুত ডেলিভারির মাধ্যমে।
              </p>
            </motion.div>

            {/* Links */}
            <motion.div variants={item} whileHover={{ y: -6 }} className={cardClass}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
              <CardTitle icon={FaLink} grad="from-violet-400 to-fuchsia-400">
                প্রয়োজনীয় লিংক
              </CardTitle>
              <ul className="space-y-3 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group/link flex items-center gap-2 text-white/70 transition hover:translate-x-1 hover:text-amber-200"
                    >
                      <FaArrowRight className="text-[10px] text-amber-300 opacity-60 transition group-hover/link:opacity-100" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div variants={item} whileHover={{ y: -6 }} className={cardClass}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-300 to-emerald-400" />
              <CardTitle icon={FaEnvelope} grad="from-teal-300 to-emerald-400">
                যোগাযোগ
              </CardTitle>
              <ul className="space-y-4 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <FaPhoneAlt className="mt-1 shrink-0 text-teal-300" />
                  <a href={PHONE_HREF} className="transition hover:text-amber-200">
                    {PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FaEnvelope className="mt-1 shrink-0 text-sky-300" />
                  <a href={`mailto:${EMAIL}`} className="break-all transition hover:text-amber-200">
                    {EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-3 leading-6">
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-rose-300" />
                  {ADDRESS}
                </li>
              </ul>
            </motion.div>

            {/* QR */}
            <motion.div variants={item} whileHover={{ y: -6 }} className={`${cardClass} flex flex-col items-center`}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 to-rose-400" />
              <CardTitle icon={FaMobileAlt} grad="from-amber-300 to-rose-400">
                আমাদের অ্যাপ
              </CardTitle>
              <div className="rounded-2xl bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 p-[3px] shadow-lg">
                <div className="rounded-[0.9rem] bg-white p-3">
                  <QRCodeSVG value={APP_URL} size={116} bgColor="#ffffff" fgColor="#120b2e" level="H" />
                </div>
              </div>
              <p className="mt-4 text-center text-sm leading-6 text-white/60">
                স্ক্যান করে আমাদের ওয়েবসাইট/অ্যাপ ভিজিট করুন
              </p>
            </motion.div>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-6 backdrop-blur sm:flex-row"
          >
            <p style={{ fontFamily: serif.style.fontFamily }} className="text-xl font-extrabold">
              <span className="gx-shine">আমাদের ফলো করুন</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    whileHover={{ y: -4, scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="group/s relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] text-white"
                  >
                    <span className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 transition-opacity duration-300 group-hover/s:opacity-100`} />
                    <Icon className="relative text-lg" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/50"
          >
            © ২০২২ - {new Date().getFullYear().toLocaleString("bn-BD", { useGrouping: false })} আপনার ই-কমার্স{" "}
            <span className="text-amber-300">✦</span> সর্বস্বত্ব সংরক্ষিত
          </motion.div>
        </div>
      </footer>
    </MotionConfig>
  );
};

export default Footer;


// // components/Footer.tsx
// "use client";
// import React from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { TypeAnimation } from "react-type-animation";
// import {
//   FaFacebookF,
//   FaInstagram,
//   FaTwitter,
//   FaGlobe,
//   FaLinkedinIn,
//   FaYoutube,
//   FaPhoneAlt,
//   FaEnvelope,
//   FaMapMarkerAlt,
//   FaInfoCircle,
//   FaUserShield,
//   FaLock,
//   FaCookieBite,
//   FaUserCheck,
//   FaSyncAlt,
//   FaEnvelopeOpenText,
// } from "react-icons/fa";

// const Footer = () => {
//   return (
//     <motion.footer
//       className="bg-gray-900 text-gray-300 pt-12 pb-6 px-6 mt-16"
//       initial={{ opacity: 0, y: 40 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//     >
//       {/* Animated Title */}
//       <div className="text-center mb-12">
//         <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
//           <TypeAnimation
//             sequence={[
//               "আমাদের সম্পর্কে",
//               1500,
//               "যোগাযোগ করুন",
//               1500,
//               "সোশ্যাল মিডিয়াতে যুক্ত থাকুন",
//               1500,
//               "সেরা সেবা নিশ্চিতে অঙ্গীকারবদ্ধ",
//               1500,
//             ]}
//             speed={50}
//             repeat={Infinity}
//             wrapper="span"
//           />
//         </h2>
//       </div>

//       {/* Grid Section */}
//       <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
//         {/* আমাদের সম্পর্কে */}
//         <motion.div
//           whileHover={{ scale: 1.03 }}
//           className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-cyan-500/30 transition duration-300"
//         >
//           <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
//             <FaInfoCircle className="text-cyan-400" /> আমাদের সম্পর্কে
//           </h3>
//           <p className="text-sm leading-6 text-gray-300">
//             আমরা একটি বিশ্বস্ত ই-কমার্স প্রতিষ্ঠান, যেখানে আপনি পাবেন সেরা মানের পণ্য, সহজে ও দ্রুত ডেলিভারির মাধ্যমে।
//           </p>
//         </motion.div>

//         {/* প্রয়োজনীয় লিংক */}
//         <motion.div
//           whileHover={{ scale: 1.03 }}
//           className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-purple-500/30 transition duration-300"
//         >
//           <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//             <FaUserShield className="text-purple-400" /> প্রয়োজনীয় লিংক
//           </h3>
//           <ul className="space-y-3 text-sm">
//             <li>
//               <Link href="/about-us" className="hover:text-white flex items-center gap-2">
//                 <FaUserCheck className="text-pink-400" /> আমাদের সম্পর্কে
//               </Link>
//             </li>
//             <li>
//               <Link href="/contact-us" className="hover:text-white flex items-center gap-2">
//                 <FaEnvelopeOpenText className="text-blue-400" /> যোগাযোগ করুন
//               </Link>
//             </li>
//             <li>
//               <Link href="/privacy-policy" className="hover:text-white flex items-center gap-2">
//                 <FaLock className="text-red-400" /> প্রাইভেসি পলিসি
//               </Link>
//             </li>
//             <li>
//               <Link href="/terms-and-conditions" className="hover:text-white flex items-center gap-2">
//                 <FaSyncAlt className="text-indigo-400" /> শর্তাবলি
//               </Link>
//             </li>
//           </ul>
//         </motion.div>

//         {/* যোগাযোগ */}
//         <motion.div
//           whileHover={{ scale: 1.03 }}
//           className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-green-500/30 transition duration-300"
//         >
//           <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//             <FaEnvelope className="text-green-400" /> যোগাযোগ
//           </h3>
//           <ul className="space-y-3 text-sm">
//             <li className="flex items-center gap-2">
//               <FaPhoneAlt className="text-green-400" /> 01784-228999
//             </li>
//             <li className="flex items-center gap-2">
//               <FaEnvelope className="text-blue-400" />
//               <a href="mailto:support@yourdomain.com" className="hover:underline">
//               myshopings@gmail.com
//               </a>
//             </li>
//             <li className="flex items-center gap-2">
//               <FaMapMarkerAlt className="text-red-400" /> সিরাজগঞ্জ, ঢাকা, বাংলাদেশ
//             </li>
//           </ul>
//         </motion.div>

//         {/* Social Media */}
//         <motion.div
//           whileHover={{ scale: 1.03 }}
//           className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-pink-500/30 transition duration-300"
//         >
//           <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//             <FaGlobe className="text-pink-400" /> ফলো করুন
//           </h3>
//           <div className="flex gap-4 text-xl text-white">
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.2, color: "#3b82f6" }}
//               className="transition"
//               aria-label="Facebook"
//             >
//               <FaFacebookF />
//             </motion.a>
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.2, color: "#f43f5e" }}
//               className="transition"
//               aria-label="Instagram"
//             >
//               <FaInstagram />
//             </motion.a>
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.2, color: "#0ea5e9" }}
//               className="transition"
//               aria-label="Twitter"
//             >
//               <FaTwitter />
//             </motion.a>
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.2, color: "#0e76a8" }}
//               className="transition"
//               aria-label="LinkedIn"
//             >
//               <FaLinkedinIn />
//             </motion.a>
//             <motion.a
//               href="https://youtube.com/@myshopingscom?si=59q7Kro_ZEzprhsM"
//               whileHover={{ scale: 1.2, color: "#dc2626" }}
//               className="transition"
//               aria-label="YouTube"
//             >
//               <FaYoutube />
//             </motion.a>
//           </div>
//         </motion.div>
//       </div>

//       {/* Copyright */}
//       <motion.div
//         className="text-center text-sm mt-12 border-t border-gray-700 pt-6"
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         2022  © {new Date().getFullYear()} আপনার ই-কমার্স | সর্বস্বত্ব সংরক্ষিত
//       </motion.div>
//     </motion.footer>
//   );
// };

// export default Footer;
