'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'ডেলিভারি সম্পন্ন', value: 1200 },
  { label: 'সন্তুষ্ট গ্রাহক', value: 950 },
  { label: 'অভিজ্ঞতা (বছর)', value: 5 },
];

const team = [
  { name: 'রাশিদুল ইসলাম', role: '  CEO ‍And App Developer', img: '/mdrashidul.jpeg' },
  { name: 'সাবিনা ইয়াসমিন', role: 'Marketing Head', img: '/team/sabina.jpg' },
  { name: 'তানভীর হাসান', role: 'Lead Developer', img: '/team/tanvir.jpg' },
];

const timeline = [
  { year: '২০১৯', event: 'প্রতিষ্ঠান শুরু' },
  { year: '২০২০', event: '১০০+ পণ্য ক্যাটালগ' },
  { year: '২০২২', event: '১০০০+ গ্রাহক সেবা' },
  { year: '২০২৪', event: 'সারা বাংলাদেশে ডেলিভারি' },
];

const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <span className="text-2xl font-bold text-blue-600">{count}+</span>;
};

const AboutUs = () => {
  // Scroll progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50">
        <div
          className="h-full bg-white transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <motion.div
        className="text-center py-16 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-extrabold mb-2">আমাদের সম্পর্কে</h1>
        <p className="text-sm opacity-90">বিশ্বস্ততা ও প্রযুক্তির সম্মিলন</p>
      </motion.div>

      {/* Goal Section */}
      <motion.section
        className="max-w-4xl mx-auto py-10 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.3 }}
      >
        <motion.h2
          className="text-2xl font-semibold mb-4 text-blue-600"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          আমাদের লক্ষ্য
        </motion.h2>
        <motion.p
          className="leading-7 text-justify mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          আমরা ই-কমার্সকে সহজ, নিরাপদ ও গ্রাহক-বান্ধব করতে প্রতিশ্রুতিবদ্ধ। সেরা পণ্য পৌঁছে দিই নির্ভরযোগ্যভাবে।
        </motion.p>
      </motion.section>

      {/* Animated Stats */}
      <motion.section className="bg-white dark:bg-gray-800 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <Counter target={stat.value} />
              <p className="text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section className="max-w-5xl mx-auto py-12 px-4">
        <motion.h2 className="text-2xl font-semibold mb-8 text-center text-blue-600">
          আমাদের টিম
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full object-cover mb-3 border-4 border-blue-500"
              />
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section className="bg-gray-100 dark:bg-gray-800 py-10 px-4">
        <motion.h2 className="text-2xl font-semibold text-center mb-8 text-blue-600">
          আমাদের যাত্রা
        </motion.h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-blue-600 text-xl font-bold">{item.year}</div>
              <div>{item.event}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Thank You */}
      <motion.div
        className="text-center text-sm py-10 text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
      >
        ❤️ ধন্যবাদ আমাদের ভরসা করার জন্য!
      </motion.div>
    </div>
  );
};

export default AboutUs;
