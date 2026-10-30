// pages/contact-us.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const contactDetails = [
  {
    icon: <MdEmail className="text-3xl text-blue-600 dark:text-blue-400" />,
    title: 'ইমেইল',
    value: 'myshopingscom@gmail.com',
  },
  {
    icon: <MdPhone className="text-3xl text-blue-600 dark:text-blue-400" />,
    title: 'ফোন',
    value: '01784228999',
  },
  {
    icon: <MdLocationOn className="text-3xl text-blue-600 dark:text-blue-400" />,
    title: 'ঠিকানা',
    value: 'পিপুলবাড়ীয়া বাজার, সিরাজগঞ্জ সদর, বাংলাদেশ',
  },
];

const ContactUs = () => {
  return (
    <>

      {/* ✅ Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-gray-800 dark:text-gray-100">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4">
            <TypeAnimation
              sequence={[
                'যোগাযোগ করুন',
                1500,
                'আপনার পরামর্শ দিন',
                1500,
                'আমরা পাশে আছি সব সময়',
                1500,
              ]}
              speed={50}
              repeat={Infinity}
              wrapper="span"
            />
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            আপনার যেকোনো প্রশ্ন, মতামত বা সমস্যার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।
          </p>
          <div className="w-24 h-1 mx-auto mt-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse" />
        </motion.div>

        {/* Contact Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {contactDetails.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                {item.icon}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 max-w-3xl mx-auto border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">বার্তা পাঠান</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="আপনার নাম"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              placeholder="আপনার ইমেইল"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <textarea
            placeholder="আপনার বার্তা লিখুন..."
            rows={5}
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              পাঠান
            </button>
          </div>
        </motion.form>
      </main>
    </>
  );
};

export default ContactUs;

/* ===== SEO UPDATE BACKUP: নিচের মূল লাইনগুলো SEO আপডেটে বদলানো হয়েছে (ব্যাকআপ হিসেবে রাখা) =====
import Head from 'next/head';
      {/* ✅ SEO Setup * /}
      <Head>
        <title>যোগাযোগ করুন | আপনার প্রতিষ্ঠান</title>
        <meta name="description" content="আপনার যেকোনো প্রশ্ন বা মতামতের জন্য আমাদের সাথে যোগাযোগ করুন। আমাদের টিম দ্রুত সহায়তা প্রদান করে।" />
        <meta name="keywords" content="যোগাযোগ, যোগাযোগ করুন, Contact, Contact Us, Support, Help, Assistance" />
        <meta name="author" content="আপনার প্রতিষ্ঠান" />
        <meta property="og:title" content="যোগাযোগ করুন | আপনার প্রতিষ্ঠান" />
        <meta property="og:description" content="আমাদের সাথে সরাসরি যোগাযোগ করুন যেকোনো সমস্যা বা মতামতের জন্য।" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://yourdomain.com/contact-us" />
        <link rel="canonical" href="https://yourdomain.com/contact-us" />
      </Head>
===== END BACKUP ===== */
