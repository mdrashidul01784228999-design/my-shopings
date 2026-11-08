# টেকফিক্স সার্ভিস সেন্টার (Next.js 14)

## চালানোর নিয়ম
1. Node.js 18+ ইনস্টল রাখুন
2. `npm install`
3. `.env.example` কপি করে `.env.local` নাম দিন, নিজের তথ্য বসান
4. `npm run dev` → http://localhost:3000
5. লাইভ করতে: `npm run build && npm start` অথবা Vercel এ আপলোড

## কাস্টমাইজ
- নাম/টেক্সট: `app/page.js`, `app/layout.js`
- ডিভাইস ও সমস্যার তালিকা: `components/RequestForm.js` এর DEVICES
- 3D আকৃতি: `components/Scene3D.js`
- রিকোয়েস্ট আসে: Telegram (env দিলে) ও সার্ভার লগে

## SEO
Metadata, Open Graph, JSON-LD (LocalBusiness), sitemap.xml, robots.txt, বাংলা lang — সব যুক্ত আছে।
Google এ ভালো র‍্যাংকিংয়ের জন্য: Google Search Console এ সাইট যুক্ত করুন, Google Business Profile বানান, নিজের ঠিকানা/ফোন লিখুন, নিয়মিত কনটেন্ট দিন।
