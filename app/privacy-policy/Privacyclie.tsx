"use client";
import React, { useEffect, useState } from "react";
import { motion, MotionConfig, Variants, useScroll, useSpring } from "framer-motion";
import { FaInfoCircle, FaUserShield, FaLock, FaCookieBite, FaUserCheck, FaSyncAlt, FaEnvelope } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

const sans = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });
const serif = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["600", "800"] });

const EMAIL = "myshopings@gmail.com";

const sections = [
  {
    title: "তথ্য সংগ্রহ",
    description:
      "আমরা আপনার নাম, ইমেইল, ফোন নম্বর এবং অন্যান্য প্রাসঙ্গিক তথ্য সংগ্রহ করতে পারি, যখন আপনি আমাদের সাইটে নিবন্ধন করেন বা অর্ডার দেন।",
    icon: FaInfoCircle,
    grad: "from-sky-300 to-violet-400",
  },
  {
    title: "তথ্যের ব্যবহার",
    description:
      "আমরা আপনার তথ্য ব্যবহার করি কাস্টমার সার্ভিস উন্নত করতে, অর্ডার প্রক্রিয়া করতে এবং আমাদের অফার ও বিজ্ঞাপন আরও প্রাসঙ্গিক করতে।",
    icon: FaUserShield,
    grad: "from-teal-300 to-emerald-400",
  },
  {
    title: "তথ্য সুরক্ষা",
    description:
      "আপনার তথ্য নিরাপদ রাখতে আমরা শক্তিশালী সুরক্ষা ব্যবস্থা গ্রহণ করি এবং আপনার অনুমতি ছাড়া তা কোনো তৃতীয় পক্ষের সাথে শেয়ার করি না।",
    icon: FaLock,
    grad: "from-rose-400 to-pink-400",
  },
  {
    title: "কুকিজ ব্যবহারের নীতি",
    description:
      "আমাদের ওয়েবসাইটে কুকিজ ব্যবহার করা হয় যাতে আমরা ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে পারি। আপনি চাইলে আপনার ব্রাউজার থেকে কুকিজ অস্বীকার করতে পারেন।",
    icon: FaCookieBite,
    grad: "from-amber-300 to-orange-400",
  },
  {
    title: "আপনার অধিকার",
    description: "আপনি আপনার ব্যক্তিগত তথ্য দেখতে, সংশোধন করতে অথবা মুছে ফেলতে আমাদের সাথে যোগাযোগ করতে পারেন।",
    icon: FaUserCheck,
    grad: "from-violet-400 to-fuchsia-400",
  },
  {
    title: "নীতির পরিবর্তন",
    description:
      "আমরা প্রয়োজন অনুযায়ী গোপনীয়তা নীতি আপডেট করতে পারি। পরিবর্তনের ক্ষেত্রে আমরা এই পেজে তারিখসহ জানিয়ে দেবো।",
    icon: FaSyncAlt,
    grad: "from-indigo-300 to-sky-400",
  },
  {
    title: "যোগাযোগ করুন",
    description: "গোপনীয়তা নীতি সম্পর্কে যেকোনো প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন:",
    icon: FaEnvelope,
    grad: "from-amber-300 to-rose-400",
    email: true,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};

export default function PrivacyClientUI() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = sections.map((_, i) => document.getElementById(`sec-${i}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.id.replace("sec-", "")));
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) =>
    document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

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

      <div className={`${sans.className} relative isolate min-h-screen overflow-hidden bg-[#120b2e] text-[#fbf7ef]`}>
        {/* Scroll progress */}
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5">
          <motion.div
            style={{ scaleX: progress }}
            className="h-full origin-left bg-gradient-to-r from-amber-300 via-rose-400 to-violet-500"
          />
        </div>

        {/* Ambient light */}
        <div className="gx-a absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="gx-b absolute -right-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
        <div className="gx-a absolute bottom-20 left-1/4 -z-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />

        <main className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center md:mb-24"
          >
            <span className="inline-block rounded-full border border-amber-200/30 bg-white/5 px-5 py-1.5 text-sm text-amber-200 backdrop-blur">
              আপনার তথ্য, আপনার নিয়ন্ত্রণ
            </span>
            <h1
              style={{ fontFamily: serif.style.fontFamily }}
              className="mt-7 min-h-[2.8em] text-4xl font-extrabold leading-[1.35] sm:min-h-[1.4em] sm:text-6xl"
            >
              <span className="gx-shine">
                <TypeAnimation
                  sequence={[
                    "গোপনীয়তা নীতি",
                    1500,
                    "আমাদের প্রাইভেসি গাইডলাইন",
                    1500,
                    "আপনার তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ",
                    1500,
                  ]}
                  speed={50}
                  repeat={Infinity}
                  wrapper="span"
                />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-xl">
              আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। এখানে ব্যাখ্যা করা হয়েছে আপনি আমাদের সেবা ব্যবহার করলে আমরা কিভাবে তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করি।
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[250px_1fr]">
            {/* Sticky contents (desktop) */}
            <aside className="hidden lg:block">
              <nav aria-label="সূচিপত্র" className="sticky top-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
                <p style={{ fontFamily: serif.style.fontFamily }} className="mb-3 px-3 text-lg font-bold text-amber-200">
                  সূচিপত্র
                </p>
                <ul className="space-y-1">
                  {sections.map((s, i) => (
                    <li key={s.title}>
                      <button
                        onClick={() => goTo(i)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                          active === i
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span
                          className={`mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${s.grad} ${
                            active === i ? "opacity-100" : "opacity-40"
                          }`}
                        />
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Cards */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-6"
            >
              {sections.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.article
                    key={s.title}
                    id={`sec-${i}`}
                    variants={cardVariants}
                    whileHover={{ y: -4 }}
                    className="group relative scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-colors hover:border-amber-200/40 sm:p-8"
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${s.grad}`} />
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} text-[#120b2e] shadow-lg transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="text-2xl" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h2 style={{ fontFamily: serif.style.fontFamily }} className="text-xl font-extrabold sm:text-2xl">
                          {s.title}
                        </h2>
                        <p className="leading-8 text-white/75">
                          {s.description}
                          {s.email && (
                            <>
                              {" "}
                              <a
                                href={`mailto:${EMAIL}`}
                                className="break-all font-semibold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition hover:decoration-amber-200"
                              >
                                {EMAIL}
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
