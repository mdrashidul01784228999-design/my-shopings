// // pages/terms-and-conditions.tsx
// "use client";
// import React from "react";
// import Head from "next/head";
// import { motion } from "framer-motion";
// import { TypeAnimation } from "react-type-animation";
// import {
//   FaGavel,
//   FaRegListAlt,
//   FaHandshake,
//   FaShieldAlt,
//   FaUserTimes,
//   FaHistory,
//   FaEnvelopeOpenText,
// } from "react-icons/fa";

// // Type definition
// type Section = {
//   title: string;
//   description: React.ReactNode;
//   icon: React.ReactNode;
// };

// const sections: Section[] = [
//   {
//     title: "ব্যবহারের শর্তাবলি",
//     description:
//       "আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলিতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলিতে সম্মত না হন, তাহলে অনুগ্রহ করে সাইটটি ব্যবহার করবেন না।",
//     icon: <FaGavel className="text-xl text-blue-500" />,
//   },
//   {
//     title: "সেবার পরিসর",
//     description:
//       "আমরা আমাদের প্ল্যাটফর্মের মাধ্যমে পণ্য, তথ্য ও গ্রাহকসেবা প্রদান করি। আমাদের সেবার পরিসর পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার আমাদের রয়েছে।",
//     icon: <FaRegListAlt className="text-xl text-green-500" />,
//   },
//   {
//     title: "ব্যবহারকারীর দায়িত্ব",
//     description:
//       "আপনি সাইটে প্রদত্ত তথ্য সঠিকভাবে প্রদান করবেন এবং অবৈধ কার্যক্রম থেকে বিরত থাকবেন।",
//     icon: <FaHandshake className="text-xl text-yellow-500" />,
//   },
//   {
//     title: "বাধ্যতামূলক নিরাপত্তা",
//     description:
//       "আমরা আপনার তথ্য সুরক্ষায় সর্বোচ্চ প্রচেষ্টা করি, তবে ইন্টারনেটের মাধ্যমে সম্পূর্ণ নিরাপত্তা নিশ্চিত করা সম্ভব নয়।",
//     icon: <FaShieldAlt className="text-xl text-red-500" />,
//   },
//   {
//     title: "অ্যাকাউন্ট বাতিলকরণ",
//     description:
//       "যদি কেউ আমাদের নীতিমালা ভঙ্গ করেন, তাহলে আমরা তার অ্যাকাউন্ট বাতিল করার অধিকার রাখি।",
//     icon: <FaUserTimes className="text-xl text-purple-500" />,
//   },
//   {
//     title: "শর্তাবলির পরিবর্তন",
//     description:
//       "আমরা যেকোনো সময় এই শর্তাবলি পরিবর্তন করতে পারি এবং পরিবর্তনের তথ্য এই পেজে হালনাগাদ করা হবে।",
//     icon: <FaHistory className="text-xl text-indigo-500" />,
//   },
//   {
//     title: "যোগাযোগ",
//     description: (
//       <>
//         শর্তাবলি সম্পর্কে আরও জানতে আমাদের সাথে যোগাযোগ করুন:{" "}
//         <a
//           href="mailto:myshopings@gmail.com"
//           className="text-blue-500 hover:underline"
//         >
//           myshopings@gmail.com
//         </a>
//       </>
//     ),
//     icon: <FaEnvelopeOpenText className="text-xl text-pink-500" />,
//   },
// ];

// const TermsAndConditions = () => {
//   return (
//     <>
//       <Head>
//         <title>ব্যবহারের শর্তাবলি | আমাদের নিয়মনীতি</title>
//         <meta
//           name="description"
//           content="এই পেজে আমাদের সাইট ব্যবহারের শর্তাবলি, দায়িত্ব, অধিকার এবং নিরাপত্তা নীতিমালা বিস্তারিতভাবে বর্ণনা করা হয়েছে।"
//         />
//       </Head>

//       <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-gray-800 dark:text-gray-100">
//         {/* Hero with Typing Animation */}
//         <motion.div
//           initial={{ opacity: 0, y: -40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-14"
//         >
//           <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent mb-4">
//             <TypeAnimation
//               sequence={[
//                 "ব্যবহারের শর্তাবলি",
//                 1500,
//                 "আমাদের নিয়মনীতি",
//                 1500,
//                 "নিরাপদ ব্যবহারের গাইডলাইন",
//                 1500,
//               ]}
//               speed={50}
//               repeat={Infinity}
//               wrapper="span"
//             />
//           </h1>
//           <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
//             এই পেজে আমাদের সাইট ব্যবহারের শর্তাবলি, দায়িত্ব, অধিকার এবং নিরাপত্তা নীতিমালা বিস্তারিতভাবে বর্ণনা করা হয়েছে।
//           </p>
//         </motion.div>

//         {/* Content Sections */}
//         <section className="space-y-10">
//           {sections.map((section, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, scale: 0.95 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: index * 0.1 }}
//               viewport={{ once: true, amount: 0.3 }}
//               className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition duration-300 hover:-translate-y-1"
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 {section.icon}
//                 <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
//                   {section.title}
//                 </h2>
//               </div>
//               <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
//                 {section.description}
//               </p>
//             </motion.div>
//           ))}
//         </section>
//       </main>
//     </>
//   );
// };

// export default TermsAndConditions;


// pages/terms-and-conditions.tsx
"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { motion, MotionConfig, Variants, useScroll, useSpring } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  FaGavel,
  FaRegListAlt,
  FaHandshake,
  FaShieldAlt,
  FaUserTimes,
  FaHistory,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

const sans = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });
const serif = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], weight: ["600", "800"] });

const EMAIL = "myshopings@gmail.com";

type Section = {
  title: string;
  description: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  grad: string;
};

const sections: Section[] = [
  {
    title: "ব্যবহারের শর্তাবলি",
    description:
      "আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলিতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলিতে সম্মত না হন, তাহলে অনুগ্রহ করে সাইটটি ব্যবহার করবেন না।",
    icon: FaGavel,
    grad: "from-sky-300 to-violet-400",
  },
  {
    title: "সেবার পরিসর",
    description:
      "আমরা আমাদের প্ল্যাটফর্মের মাধ্যমে পণ্য, তথ্য ও গ্রাহকসেবা প্রদান করি। আমাদের সেবার পরিসর পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার আমাদের রয়েছে।",
    icon: FaRegListAlt,
    grad: "from-teal-300 to-emerald-400",
  },
  {
    title: "ব্যবহারকারীর দায়িত্ব",
    description: "আপনি সাইটে প্রদত্ত তথ্য সঠিকভাবে প্রদান করবেন এবং অবৈধ কার্যক্রম থেকে বিরত থাকবেন।",
    icon: FaHandshake,
    grad: "from-amber-300 to-orange-400",
  },
  {
    title: "বাধ্যতামূলক নিরাপত্তা",
    description:
      "আমরা আপনার তথ্য সুরক্ষায় সর্বোচ্চ প্রচেষ্টা করি, তবে ইন্টারনেটের মাধ্যমে সম্পূর্ণ নিরাপত্তা নিশ্চিত করা সম্ভব নয়।",
    icon: FaShieldAlt,
    grad: "from-rose-400 to-pink-400",
  },
  {
    title: "অ্যাকাউন্ট বাতিলকরণ",
    description: "যদি কেউ আমাদের নীতিমালা ভঙ্গ করেন, তাহলে আমরা তার অ্যাকাউন্ট বাতিল করার অধিকার রাখি।",
    icon: FaUserTimes,
    grad: "from-violet-400 to-fuchsia-400",
  },
  {
    title: "শর্তাবলির পরিবর্তন",
    description:
      "আমরা যেকোনো সময় এই শর্তাবলি পরিবর্তন করতে পারি এবং পরিবর্তনের তথ্য এই পেজে হালনাগাদ করা হবে।",
    icon: FaHistory,
    grad: "from-indigo-300 to-sky-400",
  },
  {
    title: "যোগাযোগ",
    description: (
      <>
        শর্তাবলি সম্পর্কে আরও জানতে আমাদের সাথে যোগাযোগ করুন:{" "}
        <a
          href={`mailto:${EMAIL}`}
          className="break-all font-semibold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition hover:decoration-amber-200"
        >
          {EMAIL}
        </a>
      </>
    ),
    icon: FaEnvelopeOpenText,
    grad: "from-amber-300 to-rose-400",
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

const TermsAndConditions = () => {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = sections.map((_, i) => document.getElementById(`term-${i}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.id.replace("term-", "")));
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) =>
    document.getElementById(`term-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <>
      <Head>
        <title>ব্যবহারের শর্তাবলি | আমাদের নিয়মনীতি</title>
        <meta
          name="description"
          content="এই পেজে আমাদের সাইট ব্যবহারের শর্তাবলি, দায়িত্ব, অধিকার এবং নিরাপত্তা নীতিমালা বিস্তারিতভাবে বর্ণনা করা হয়েছে।"
        />
      </Head>

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
                স্বচ্ছতা ও বিশ্বাসের ভিত্তি
              </span>
              <h1
                style={{ fontFamily: serif.style.fontFamily }}
                className="mt-7 min-h-[2.8em] text-4xl font-extrabold leading-[1.35] sm:min-h-[1.4em] sm:text-6xl"
              >
                <span className="gx-shine">
                  <TypeAnimation
                    sequence={[
                      "ব্যবহারের শর্তাবলি",
                      1500,
                      "আমাদের নিয়মনীতি",
                      1500,
                      "নিরাপদ ব্যবহারের গাইডলাইন",
                      1500,
                    ]}
                    speed={50}
                    repeat={Infinity}
                    wrapper="span"
                  />
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-xl">
                এই পেজে আমাদের সাইট ব্যবহারের শর্তাবলি, দায়িত্ব, অধিকার এবং নিরাপত্তা নীতিমালা বিস্তারিতভাবে বর্ণনা করা হয়েছে।
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[250px_1fr]">
              {/* Sticky contents (desktop) */}
              <aside className="hidden lg:block">
                <nav
                  aria-label="সূচিপত্র"
                  className="sticky top-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur"
                >
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
                      id={`term-${i}`}
                      variants={cardVariants}
                      whileHover={{ y: -4 }}
                      className="group relative scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-colors hover:border-amber-200/40 sm:p-8"
                    >
                      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${s.grad}`} />
                      {/* Big number watermark */}
                      <span
                        aria-hidden
                        style={{ fontFamily: serif.style.fontFamily }}
                        className={`pointer-events-none absolute -right-2 -top-4 bg-gradient-to-br ${s.grad} bg-clip-text text-8xl font-extrabold text-transparent opacity-15 sm:text-9xl`}
                      >
                        {`০${(i + 1).toLocaleString("bn-BD")}`}
                      </span>

                      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} text-[#120b2e] shadow-lg transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className="text-2xl" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h2 style={{ fontFamily: serif.style.fontFamily }} className="text-xl font-extrabold sm:text-2xl">
                            {s.title}
                          </h2>
                          <p className="leading-8 text-white/75">{s.description}</p>
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
    </>
  );
};

export default TermsAndConditions;



