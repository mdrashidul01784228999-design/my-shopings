// pages/contact-us.tsx
'use client';

import React, { useState } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { MdEmail, MdPhone, MdLocationOn, MdSend, MdCheckCircle } from 'react-icons/md';
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google';

const sans = Hind_Siliguri({ subsets: ['bengali', 'latin'], weight: ['400', '500', '600', '700'] });
const serif = Noto_Serif_Bengali({ subsets: ['bengali', 'latin'], weight: ['600', '800'] });

const address = 'পিপুলবাড়ীয়া বাজার, সিরাজগঞ্জ সদর, বাংলাদেশ';

const contactDetails = [
  {
    icon: MdEmail,
    title: 'ইমেইল',
    value: 'myshopingscom@gmail.com',
    href: 'mailto:myshopingscom@gmail.com',
    grad: 'from-amber-300 to-rose-400',
  },
  {
    icon: MdPhone,
    title: 'ফোন',
    value: '01784228999',
    href: 'tel:+8801784228999',
    grad: 'from-teal-300 to-violet-400',
  },
  {
    icon: MdLocationOn,
    title: 'ঠিকানা',
    value: address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    grad: 'from-rose-400 to-violet-400',
  },
];

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-[#fbf7ef] placeholder-white/40 outline-none transition focus:border-amber-300/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-amber-300/10';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // TODO: এখানে আপনার API কল বসান, যেমন:
      // await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      await new Promise((r) => setTimeout(r, 900));
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('idle');
    }
  };

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

      <main className={`${sans.className} relative isolate overflow-hidden bg-[#120b2e] text-[#fbf7ef]`}>
        <div className="gx-a absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="gx-b absolute -right-24 top-1/4 -z-10 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="gx-a absolute bottom-10 left-1/3 -z-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-28">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <span className="inline-block rounded-full border border-amber-200/30 bg-white/5 px-5 py-1.5 text-sm text-amber-200 backdrop-blur">
              আমরা শুনছি
            </span>
            <h1
              style={{ fontFamily: serif.style.fontFamily }}
              className="mt-7 min-h-[1.4em] text-4xl font-extrabold leading-[1.35] sm:text-6xl"
            >
              <span className="gx-shine">
                <TypeAnimation
                  sequence={['যোগাযোগ করুন', 1500, 'আপনার পরামর্শ দিন', 1500, 'আমরা পাশে আছি সব সময়', 1500]}
                  speed={50}
                  repeat={Infinity}
                  wrapper="span"
                />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
              আপনার যেকোনো প্রশ্ন, মতামত বা সমস্যার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।
            </p>
          </motion.div>

          {/* Contact cards */}
          <section className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactDetails.map((item, i) => {
              const Icon = item.icon;
              const external = item.href.startsWith('http');
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur transition-colors hover:border-amber-200/40"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.grad}`} />
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.grad} text-[#120b2e] shadow-lg`}>
                    <Icon className="text-3xl" />
                  </div>
                  <h3 style={{ fontFamily: serif.style.fontFamily }} className="text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="mt-2 break-words leading-7 text-white/75">{item.value}</p>
                </motion.a>
              );
            })}
          </section>

          {/* Form */}
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur sm:p-10"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-rose-400 to-violet-500" />
            <h2 style={{ fontFamily: serif.style.fontFamily }} className="mb-8 text-center text-3xl font-extrabold">
              <span className="gx-shine">বার্তা পাঠান</span>
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <input name="name" value={form.name} onChange={onChange} type="text" placeholder="আপনার নাম" className={fieldClass} required />
                <input name="email" value={form.email} onChange={onChange} type="email" placeholder="আপনার ইমেইল" className={fieldClass} required />
              </div>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                placeholder="আপনার বার্তা লিখুন..."
                rows={5}
                className={`${fieldClass} resize-none`}
                required
              />
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <motion.button
                type="submit"
                disabled={status === 'sending'}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-violet-500 px-10 py-3.5 font-bold text-[#120b2e] shadow-lg shadow-rose-500/20 transition disabled:opacity-70"
              >
                {status === 'sending' ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
                <MdSend className="text-xl" />
              </motion.button>

              <AnimatePresence>
                {status === 'sent' && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="flex items-center gap-2 text-teal-300"
                  >
                    <MdCheckCircle className="text-xl" /> আপনার বার্তা পাঠানো হয়েছে, ধন্যবাদ!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </div>
      </main>
    </MotionConfig>
  );
};

export default ContactUs;
