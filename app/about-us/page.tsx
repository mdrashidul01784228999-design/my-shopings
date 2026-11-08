'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  MotionValue,
  animate,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google';

const sans = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'] });
const serif = Noto_Serif_Bengali({ subsets: ['bengali', 'latin'], weight: ['600', '800'] });

/* ---------- Data ---------- */

const stats = [
  { label: 'ডেলিভারি সম্পন্ন', value: 1200, suffix: '+', grad: 'from-amber-300 to-rose-400' },
  { label: 'সন্তুষ্ট গ্রাহক', value: 950, suffix: '+', grad: 'from-teal-300 to-violet-400' },
  { label: 'বছরের অভিজ্ঞতা', value: 5, suffix: '+', grad: 'from-rose-400 to-violet-400' },
];

const team = [
  { name: 'রাশিদুল ইসলাম', role: 'CEO & App Developer', img: '/mdrashidul.jpeg', ring: 'from-amber-300 via-rose-400 to-violet-500' },
  { name: 'সাবিনা ইয়াসমিন', role: 'Marketing Head', img: '/team/sabina.jpg', ring: 'from-teal-300 via-sky-400 to-violet-500' },
  { name: 'তানভীর হাসান', role: 'Lead Developer', img: '/team/tanvir.jpg', ring: 'from-rose-400 via-fuchsia-400 to-amber-300' },
];

const timeline = [
  { year: '২০১৯', event: 'প্রতিষ্ঠান শুরু' },
  { year: '২০২০', event: '১০০+ পণ্য ক্যাটালগ' },
  { year: '২০২২', event: '১০০০+ গ্রাহক সেবা' },
  { year: '২০২৪', event: 'সারা বাংলাদেশে ডেলিভারি' },
];

const rotating = ['সহজ', 'নিরাপদ', 'দ্রুত', 'গ্রাহক-বান্ধব'];
const marquee = ['ই-কমার্স', 'নিরাপদ পেমেন্ট', 'দ্রুত ডেলিভারি', 'বিশ্বস্ত সেবা', 'সেরা মানের পণ্য', 'সারা বাংলাদেশে'];

const goalText =
  'আমরা ই-কমার্সকে সহজ, নিরাপদ ও গ্রাহক-বান্ধব করতে প্রতিশ্রুতিবদ্ধ। সেরা পণ্য পৌঁছে দিই নির্ভরযোগ্যভাবে, প্রতিটি অর্ডারে আমাদের কথা ও মানের নিশ্চয়তা।';

/* ---------- Small pieces ---------- */

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('bn-BD')}
      {suffix}
    </span>
  );
};

const ScrollWord = ({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) => {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  );
};

const Avatar = ({ src, name }: { src: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1b1240] text-3xl font-bold text-amber-200">
      {name.charAt(0)}
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full rounded-full object-cover" />
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h2
    style={{ fontFamily: serif.style.fontFamily }}
    className="mb-12 text-center text-3xl font-extrabold sm:text-4xl"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
  >
    <span className="gx-shine">{children}</span>
  </motion.h2>
);

/* ---------- Page ---------- */

const AboutUs = () => {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % rotating.length), 2200);
    return () => clearInterval(t);
  }, []);

  const goalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: goalProgress } = useScroll({
    target: goalRef,
    offset: ['start 0.85', 'end 0.4'],
  });
  const goalWords = goalText.split(' ');

  const tlRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: tlProgress } = useScroll({
    target: tlRef,
    offset: ['start 0.7', 'end 0.6'],
  });

  const heroWords = ['বিশ্বস্ততা', 'ও', 'প্রযুক্তির', 'সম্মিলন'];

  return (
    <MotionConfig reducedMotion="user">
      <style>{`
        @keyframes gx-shine { to { background-position: 200% center; } }
        @keyframes gx-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.15); } }
        @keyframes gx-float-b { 0%,100% { transform: translate(0,0) scale(1.1); } 50% { transform: translate(-50px,-20px) scale(0.95); } }
        @keyframes gx-marquee { to { transform: translateX(-50%); } }
        .gx-shine {
          background: linear-gradient(90deg, #f6d99a, #ff6f9c, #a78bfa, #5eead4, #f6d99a);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: gx-shine 6s linear infinite;
        }
        .gx-a { animation: gx-float-a 14s ease-in-out infinite; }
        .gx-b { animation: gx-float-b 18s ease-in-out infinite; }
        .gx-marquee { animation: gx-marquee 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gx-shine, .gx-a, .gx-b, .gx-marquee { animation: none; }
        }
      `}</style>

      <div className={`${sans.className} relative overflow-x-hidden bg-[#120b2e] text-[#fbf7ef]`}>
        {/* Scroll progress */}
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5">
          <motion.div
            style={{ scaleX: progress }}
            className="h-full origin-left bg-gradient-to-r from-amber-300 via-rose-400 to-violet-500"
          />
        </div>

        {/* Hero */}
        <section className="relative isolate flex min-h-[92vh] items-center justify-center px-5 py-24 text-center">
          <div className="gx-a absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl sm:h-96 sm:w-96" />
          <div className="gx-b absolute -right-20 top-1/3 -z-10 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl sm:h-96 sm:w-96" />
          <div className="gx-a absolute bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full bg-teal-400/25 blur-3xl" />

          <div className="mx-auto max-w-4xl">
            <motion.span
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-block rounded-full border border-amber-200/30 bg-white/5 px-5 py-1.5 text-sm text-amber-200 backdrop-blur"
            >
              আমাদের সম্পর্কে
            </motion.span>

            <h1
              style={{ fontFamily: serif.style.fontFamily }}
              className="mt-8 text-4xl font-extrabold leading-[1.35] sm:text-6xl lg:text-7xl"
            >
              {heroWords.map((w, i) => (
                <motion.span
                  key={w}
                  className="gx-shine mr-3 inline-block"
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.3 + i * 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-2 text-lg text-white/80 sm:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              <span>আমরা ই-কমার্সকে</span>
              <span className="relative inline-flex h-9 min-w-[7.5rem] items-center justify-center overflow-hidden sm:h-11">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotating[wordIndex]}
                    initial={{ y: 28, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -28, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="font-bold text-amber-300"
                  >
                    {rotating[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>করছি</span>
            </motion.p>
          </div>
        </section>

        {/* Marquee */}
        <div className="border-y border-white/10 bg-white/[0.03] py-4">
          <div className="flex w-max gx-marquee">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center">
                {marquee.map((m) => (
                  <span key={`${dup}-${m}`} className="flex items-center text-lg font-semibold text-white/70 sm:text-xl">
                    <span className="mx-6 sm:mx-10">{m}</span>
                    <span className="text-amber-300">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Goal: words light up while scrolling */}
        <section className="mx-auto max-w-4xl px-5 py-24 sm:py-32">
          <h2 className="mb-6 text-center text-xl font-semibold text-rose-300">আমাদের লক্ষ্য</h2>
          <div ref={goalRef}>
            <p
              style={{ fontFamily: serif.style.fontFamily }}
              className="text-center text-2xl font-semibold leading-[1.7] sm:text-4xl sm:leading-[1.6]"
            >
              {goalWords.map((w, i) => (
                <ScrollWord
                  key={i}
                  word={w}
                  progress={goalProgress}
                  range={[i / goalWords.length, (i + 1) / goalWords.length]}
                />
              ))}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-5 pb-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.grad}`} />
                <div
                  style={{ fontFamily: serif.style.fontFamily }}
                  className={`bg-gradient-to-r ${s.grad} bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl`}
                >
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-3 text-base text-white/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-gradient-to-b from-transparent via-[#1a1040] to-transparent px-5 py-24">
          <SectionTitle>আমাদের টিম</SectionTitle>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <motion.div
                key={m.name}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur transition-colors hover:border-amber-200/40"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                whileHover={{ y: -8 }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className={`mx-auto h-32 w-32 rounded-full bg-gradient-to-tr ${m.ring} p-[3px]`}>
                  <Avatar src={m.img} name={m.name} />
                </div>
                <h3 className="mt-6 text-xl font-bold">{m.name}</h3>
                <p className="mt-1 text-sm font-medium text-amber-200/90">{m.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="px-5 py-24">
          <SectionTitle>আমাদের যাত্রা</SectionTitle>
          <div ref={tlRef} className="relative mx-auto max-w-4xl">
            <div className="absolute bottom-0 left-4 top-0 w-[2px] bg-white/10 md:left-1/2 md:-ml-px" />
            <div className="absolute bottom-0 left-4 top-0 w-[2px] md:left-1/2 md:-ml-px">
              <motion.div
                style={{ scaleY: tlProgress }}
                className="h-full origin-top bg-gradient-to-b from-amber-300 via-rose-400 to-violet-500"
              />
            </div>

            <div className="space-y-10">
              {timeline.map((item, i) => {
                const right = i % 2 === 1;
                return (
                  <motion.div
                    key={item.year}
                    className={`relative pl-12 md:w-1/2 md:pl-0 ${
                      right ? 'md:ml-auto md:pl-12' : 'md:mr-auto md:pr-12 md:text-right'
                    }`}
                    initial={{ opacity: 0, x: right ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7 }}
                  >
                    <span
                      className={`absolute top-6 h-[14px] w-[14px] rounded-full border-2 border-[#120b2e] bg-amber-300 shadow-[0_0_0_4px_rgba(252,211,77,0.2)] left-[10px] ${
                        right ? 'md:-left-[7px]' : 'md:left-auto md:-right-[7px]'
                      }`}
                    />
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
                      <div
                        style={{ fontFamily: serif.style.fontFamily }}
                        className="gx-shine text-2xl font-extrabold"
                      >
                        {item.year}
                      </div>
                      <div className="mt-1 text-white/80">{item.event}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Thank you */}
        <motion.div
          className="px-5 pb-24 pt-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p style={{ fontFamily: serif.style.fontFamily }} className="text-2xl font-extrabold sm:text-4xl">
            <span className="gx-shine">ধন্যবাদ আমাদের ভরসা করার জন্য</span> <span aria-hidden>❤️</span>
          </p>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default AboutUs;

// 'use client';
// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';

// const stats = [
//   { label: 'ডেলিভারি সম্পন্ন', value: 1200 },
//   { label: 'সন্তুষ্ট গ্রাহক', value: 950 },
//   { label: 'অভিজ্ঞতা (বছর)', value: 5 },
// ];

// const team = [
//   { name: 'রাশিদুল ইসলাম', role: '  CEO ‍And App Developer', img: '/mdrashidul.jpeg' },
//   { name: 'সাবিনা ইয়াসমিন', role: 'Marketing Head', img: '/team/sabina.jpg' },
//   { name: 'তানভীর হাসান', role: 'Lead Developer', img: '/team/tanvir.jpg' },
// ];

// const timeline = [
//   { year: '২০১৯', event: 'প্রতিষ্ঠান শুরু' },
//   { year: '২০২০', event: '১০০+ পণ্য ক্যাটালগ' },
//   { year: '২০২২', event: '১০০০+ গ্রাহক সেবা' },
//   { year: '২০২৪', event: 'সারা বাংলাদেশে ডেলিভারি' },
// ];

// const Counter = ({ target }: { target: number }) => {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     let start = 0;
//     const duration = 2000;
//     const increment = target / (duration / 20);
//     const timer = setInterval(() => {
//       start += increment;
//       if (start >= target) {
//         setCount(target);
//         clearInterval(timer);
//       } else {
//         setCount(Math.floor(start));
//       }
//     }, 20);
//     return () => clearInterval(timer);
//   }, [target]);
//   return <span className="text-2xl font-bold text-blue-600">{count}+</span>;
// };

// const AboutUs = () => {
//   // Scroll progress state
//   const [scrollProgress, setScrollProgress] = useState(0);

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY;
//       const docHeight = document.body.scrollHeight - window.innerHeight;
//       const scrolled = (scrollTop / docHeight) * 100;
//       setScrollProgress(scrolled);
//     };
//     window.addEventListener('scroll', handleScroll);
//     // Clean up
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <div className="relative bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//       {/* Scroll Progress Bar */}
//       <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50">
//         <div
//           className="h-full bg-white transition-all duration-150 ease-out"
//           style={{ width: `${scrollProgress}%` }}
//         />
//       </div>

//       {/* Hero Section */}
//       <motion.div
//         className="text-center py-16 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
//         initial={{ opacity: 0, y: -40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <h1 className="text-4xl font-extrabold mb-2">আমাদের সম্পর্কে</h1>
//         <p className="text-sm opacity-90">বিশ্বস্ততা ও প্রযুক্তির সম্মিলন</p>
//       </motion.div>

//       {/* Goal Section */}
//       <motion.section
//         className="max-w-4xl mx-auto py-10 px-4"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true }}
//         transition={{ staggerChildren: 0.3 }}
//       >
//         <motion.h2
//           className="text-2xl font-semibold mb-4 text-blue-600"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           আমাদের লক্ষ্য
//         </motion.h2>
//         <motion.p
//           className="leading-7 text-justify mb-4"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           আমরা ই-কমার্সকে সহজ, নিরাপদ ও গ্রাহক-বান্ধব করতে প্রতিশ্রুতিবদ্ধ। সেরা পণ্য পৌঁছে দিই নির্ভরযোগ্যভাবে।
//         </motion.p>
//       </motion.section>

//       {/* Animated Stats */}
//       <motion.section className="bg-white dark:bg-gray-800 py-10 px-4">
//         <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
//           {stats.map((stat, i) => (
//             <motion.div
//               key={i}
//               className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow"
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.2 }}
//               viewport={{ once: true }}
//             >
//               <Counter target={stat.value} />
//               <p className="text-sm mt-2">{stat.label}</p>
//             </motion.div>
//           ))}
//         </div>
//       </motion.section>

//       {/* Team Section */}
//       <motion.section className="max-w-5xl mx-auto py-12 px-4">
//         <motion.h2 className="text-2xl font-semibold mb-8 text-center text-blue-600">
//           আমাদের টিম
//         </motion.h2>
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//           {team.map((member, i) => (
//             <motion.div
//               key={i}
//               className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition"
//               whileHover={{ scale: 1.05 }}
//             >
//               <img
//                 src={member.img}
//                 alt={member.name}
//                 className="w-24 h-24 mx-auto rounded-full object-cover mb-3 border-4 border-blue-500"
//               />
//               <h3 className="font-semibold text-lg">{member.name}</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
//             </motion.div>
//           ))}
//         </div>
//       </motion.section>

//       {/* Timeline Section */}
//       <motion.section className="bg-gray-100 dark:bg-gray-800 py-10 px-4">
//         <motion.h2 className="text-2xl font-semibold text-center mb-8 text-blue-600">
//           আমাদের যাত্রা
//         </motion.h2>
//         <div className="max-w-3xl mx-auto space-y-4">
//           {timeline.map((item, i) => (
//             <motion.div
//               key={i}
//               className="flex items-start gap-4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
//               initial={{ opacity: 0, x: -40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ delay: i * 0.2 }}
//               viewport={{ once: true }}
//             >
//               <div className="text-blue-600 text-xl font-bold">{item.year}</div>
//               <div>{item.event}</div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.section>

//       {/* Thank You */}
//       <motion.div
//         className="text-center text-sm py-10 text-gray-500 dark:text-gray-400"
//         initial={{ opacity: 0 }}
//         whileInView={{ opacity: 1 }}
//         transition={{ delay: 0.3 }}
//         viewport={{ once: true }}
//       >
//         ❤️ ধন্যবাদ আমাদের ভরসা করার জন্য!
//       </motion.div>
//     </div>
//   );
// };

// export default AboutUs;
