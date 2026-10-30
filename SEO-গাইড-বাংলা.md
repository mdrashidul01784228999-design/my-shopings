# My Shopings – SEO সেটআপ গাইড (A–Z, বাংলায়)

> **সৎ কথা আগে:** কেউই "গুগলে ১ নম্বর" গ্যারান্টি দিতে পারে না। কোড-SEO (এই প্যাকে যা করা হয়েছে) হলো ভিত্তি। এরপর র‍্যাংক আসে কনটেন্ট, ব্যাকলিংক আর সময় থেকে। সাধারণত ২–৬ মাস লাগে।

---

## ১. আপনার zip চেক করে কী পেয়েছি

আপনার প্রজেক্টে SEO-র বড় অংশ **আগেই করা ছিল** (root layout, robots.ts, sitemap.ts, manifest, OG image, JSON-LD, প্রোডাক্ট পেজের schema)। এগুলো ঠিক আছে, ছুঁইনি।

কিন্তু বেশ কিছু **গুরুতর ভুল** পেয়েছি, যেগুলো র‍্যাংক নষ্ট করছিল:

| # | পেজ | সমস্যা | ফলাফল |
|---|------|--------|--------|
| 1 | `/age` | canonical হোমপেজ দেখাচ্ছিল | গুগল ভাবত `/age` হোমপেজের কপি → ইনডেক্স করত না |
| 2 | `/apps` | canonical `/dashboard` (যে পেজ নেই) | ইনডেক্স হওয়ার সুযোগ নষ্ট |
| 3 | `/advance` | canonical `/bg-remover` (যে পেজ নেই) | একই সমস্যা |
| 4 | `/games` | canonical ছিল না, OG url `/categories` (ভুল) | শেয়ার ও গুগল দুটোতেই ভুল লিংক |
| 5 | `/games/terget` | canonical `/` (হোম), ডোমেইন `your-domain.com` | হোমের কপি হিসেবে গণ্য |
| 6 | `/games/babull` | canonical `/`, `/games` এর প্রায় হুবহু কনটেন্ট | ডুপ্লিকেট কনটেন্ট |
| 7 | `/share-market` | canonical `/`, ডোমেইন `example.com` | হোমের কপি হিসেবে গণ্য |
| 8 | `/Login` | canonical `/login` (ছোট হাতের), ব্র্যান্ড "MyApp" | ভুল URL |
| 9 | `/services` | ভুল ডোমেইন `rashidulofficial.com`, JSON-LD-তে ফেক ফোন (`+8801XXXXXXXXX`), ফেক ঠিকানা (`Your Street`), ফেক Facebook লিংক | structured data নীতিমালা লঙ্ঘন, বিশ্বাসযোগ্যতা কমে |
| 10 | `/it-solution`, `/privacy-policy` | canonical ছিল না | ডুপ্লিকেট URL ঝুঁকি |
| 11 | প্রোডাক্ট পেজ (`/products-view/[id]`) | `product.img` রিলেটিভ হলে OG/Twitter ছবি ভাঙা থাকত | Facebook/WhatsApp শেয়ারে ছবি আসত না |
| 12 | খালি পেজ (`/products`, `/epepar/category/[id]`, `/epepar/category/news/[id]`, `/footers`, `/Slider_img` ইত্যাদি) | কনটেন্ট নেই (শুধু "page" লেখা), তবু ইনডেক্সযোগ্য | thin content → পুরো সাইটের মান কমায় |
| 13 | `/epepar/login`, `/epepar/login/profile`, `/Login/[id]` | প্রাইভেট পেজ, noindex ছিল না | ইনডেক্সে অপ্রয়োজনীয় পেজ |
| 14 | `/games/number`, `/games/qs`, `/advance/video` | কোনো title/description নেই | গুগলে খারাপ snippet |
| 15 | sitemap | `/games/terget`, `/share-market` বাদ ছিল | ইনডেক্স দেরিতে হতো |

---

## ২. আমি কী কী ঠিক করেছি (UI/লজিক অপরিবর্তিত)

**শুধু metadata ও SEO লাইন বদলেছে। কোনো কম্পোনেন্ট, ডিজাইন বা ফাংশন ছোঁয়া হয়নি।**

- ভুল canonical/OG url গুলো সঠিক করেছি (উপরের ১–৮ নম্বর)।
- `app/layout.tsx`-এ একটা লাইন যোগ করেছি: `alternates: { canonical: "./" }` — এতে যে পেজে নিজের canonical নেই, সেখানে স্বয়ংক্রিয়ভাবে নিজের URL-ই canonical হবে।
- `/services` থেকে ফেক ফোন/ঠিকানা/সোশ্যাল লিংক সরিয়ে `LocalBusiness` → `Organization` করেছি। (আসল ফোন, ঠিকানা ও Facebook/YouTube লিংক থাকলে পরে বসিয়ে দিন, নিচে ধাপ ৭ দেখুন।)
- প্রোডাক্ট পেজের OG ছবি সবসময় পূর্ণ URL (`https://...`) হবে।
- ১০টি খালি/প্রাইভেট/থিন পেজে `noindex` দিয়েছি (নতুন ছোট `layout.tsx` ফাইল, বাকি কোডে হাত দিইনি)।
- `sitemap.ts`-এ `/games/terget` ও `/share-market` যোগ করেছি।

পরিবর্তিত ফাইল মোট **২৭টি** (২৭টির মধ্যে ৮টি নতুন layout ফাইল)।

---

## ৩. কীভাবে বসাবেন (ধাপে ধাপে)

1. আপনার প্রজেক্টের একটা **ব্যাকআপ** নিন (বা `git commit` করুন)।
2. এই প্যাকের `app/` ফোল্ডারটা আপনার প্রজেক্টের `app/` ফোল্ডারের উপর **Merge / Replace** করুন। (শুধু ২৭টি ফাইল বদলাবে, বাকি সব যেমন আছে তেমনই থাকবে।)
3. টার্মিনালে চালান:
   ```bash
   npm run build
   ```
   কোনো error না এলে ঠিক আছে।
4. সার্ভারে deploy করুন।

---

## ৪. `.env` সেটআপ (এটা না করলে সবচেয়ে বড় ক্ষতি!)

প্রজেক্টের রুটে `.env.production` (বা সার্ভারের environment) এ এগুলো দিন:

```env
NEXT_PUBLIC_SITE_URL=https://my-shopings.com
NEXT_PUBLIC_API_URL=https://আপনার-লারাভেল-এপিআই-ডোমেইন/api
NEXT_PUBLIC_GOOGLE_VERIFICATION=গুগল-সার্চ-কনসোল-থেকে-পাওয়া-কোড
NEXT_PUBLIC_BING_VERIFICATION=বিং-ওয়েবমাস্টার-থেকে-পাওয়া-কোড
```

> ⚠️ **সবচেয়ে গুরুত্বপূর্ণ:** `NEXT_PUBLIC_API_URL` না দিলে কোড `http://localhost:8000/api` ধরে নেয়। তখন **sitemap-এ একটাও প্রোডাক্ট আসবে না** এবং প্রোডাক্ট পেজের title/description-ও লোড হবে না। অর্থাৎ আপনার আসল র‍্যাংকের জায়গাটাই (প্রোডাক্ট পেজ) গুগল দেখবে না।

---

## ৫. `public/` ফোল্ডারে ছবি রাখুন

আপনার zip-এ শুধু `app/` ফোল্ডার ছিল, তাই `public/` দেখতে পারিনি। কোডে নিচের ছবিগুলোর লিংক আছে। **এগুলো `public/` এ আছে কিনা মিলিয়ে নিন**, না থাকলে বানিয়ে রাখুন (না থাকলে শেয়ার প্রিভিউ ভাঙা দেখাবে):

| ফাইল | সাইজ | কোথায় ব্যবহার |
|------|------|----------------|
| `og-image.png` | 1200×630 | শেয়ার-মার্কেট, Find The Target, Maturity Terminal |
| `og-image.jpg` | 1200×630 | `/age` |
| `og-banner.jpg` | 1200×630 | `/games` |
| `og-image-bg.jpg` | 1200×630 | `/advance` |
| `logo.png` | যেকোনো | fallback |

> ছোট টিপ: হোমপেজের জন্য `app/opengraph-image.tsx` আগে থেকেই আছে, ওটা ঠিক আছে।

---

## ৬. Google Search Console (সবচেয়ে জরুরি ধাপ)

1. https://search.google.com/search-console এ যান → **Add property**।
2. **Domain** বা **URL prefix** (`https://my-shopings.com`) বেছে নিন।
3. **HTML tag** পদ্ধতিতে একটা কোড দেবে → শুধু `content="..."` এর ভেতরের অংশটা `.env` এর `NEXT_PUBLIC_GOOGLE_VERIFICATION` এ বসান → deploy → **Verify** চাপুন।
4. বাঁ মেনু থেকে **Sitemaps** → `sitemap.xml` লিখে **Submit** করুন।
5. **URL Inspection** এ গিয়ে এই পেজগুলো একটা একটা করে দিন, তারপর **Request Indexing** চাপুন:
   - `https://my-shopings.com/`
   - `/products-view`
   - `/games`
   - `/services`
   - ২–৩টা প্রোডাক্ট পেজ
6. ১–২ সপ্তাহ পর **Pages** রিপোর্টে দেখুন কতগুলো ইনডেক্স হয়েছে এবং কেন কিছু হয়নি।

**Bing:** https://www.bing.com/webmasters → সাইট যোগ করুন → Search Console থেকে Import করা যায় (সবচেয়ে সহজ)।

---

## ৭. নিজে হাতে যেগুলো করতে হবে (আমি আপনার তথ্য জানি না)

1. **Organization schema-তে সোশ্যাল লিংক:** `app/layout.tsx`-এর `Organization` অবজেক্টে `url` এর নিচে যোগ করুন:
   ```ts
   sameAs: ["https://facebook.com/আপনার-পেজ", "https://youtube.com/@আপনার-চ্যানেল"],
   ```
2. **আসল ফোন নম্বর** থাকলে একই জায়গায় `contactPoint` দিন:
   ```ts
   contactPoint: { "@type": "ContactPoint", telephone: "+880১XXXXXXXXX", contactType: "customer service", areaServed: "BD", availableLanguage: ["bn", "en"] },
   ```
3. **`/contact-us` ও `/about-us`** পেজে আসল ঠিকানা, ফোন ও ইমেইল স্পষ্ট লিখুন (E-E-A-T বা বিশ্বাসযোগ্যতার সংকেত)।
4. **Facebook পেজ, YouTube, Google Business Profile** খুলুন এবং সবখানে একই নাম/লিংক ব্যবহার করুন।

---

## ৮. র‍্যাংক বাড়ানোর আসল কাজ (কোডের বাইরে)

র‍্যাংকের ৭০% আসে এখান থেকে:

1. **প্রতিটি প্রোডাক্টের নিজস্ব বর্ণনা লিখুন** (১৫০+ শব্দ, বাংলায়)। সব প্রোডাক্টে একই বর্ণনা দিলে গুগল ডুপ্লিকেট ধরবে।
2. **প্রোডাক্টের ছবির নাম ও alt** বাংলা/ইংরেজি কিওয়ার্ড দিয়ে দিন (`iphone-15-price-bd.jpg`)।
3. **ব্যাকলিংক:** Facebook গ্রুপ, YouTube বর্ণনা, বাংলাদেশি ডিরেক্টরি, নিউজ সাইটে গেস্ট পোস্ট। গুণগত ১০টা লিংক, ১০০০ স্প্যাম লিংকের চেয়ে ভালো।
4. **ব্লগ/গাইড লিখুন:** যেমন "২০২৬ সালে বাংলাদেশে সেরা ৫ স্মার্টওয়াচ", "ক্যাশ অন ডেলিভারিতে কীভাবে অর্ডার করবেন"। সার্চে মানুষ এগুলোই খোঁজে।
5. **স্পিড:** মোবাইলে https://pagespeed.web.dev এ সাইট টেস্ট করুন। ৭০+ স্কোর রাখুন।
6. **নিয়মিত আপডেট:** নতুন প্রোডাক্ট ও কনটেন্ট যোগ করুন (সপ্তাহে অন্তত ২–৩টি)।
7. **রিভিউ:** কাস্টমারদের রিভিউ দিতে বলুন। পরে `aggregateRating` schema যোগ করা যাবে, **শুধু আসল রিভিউ থাকলে**।

---

## ৯. কাজ হয়েছে কিনা কীভাবে যাচাই করবেন

1. ব্রাউজারে পেজ খুলে **Right click → View Page Source** → `<title>`, `<meta name="description">`, `<link rel="canonical">` খুঁজুন।
2. https://my-shopings.com/sitemap.xml খুলুন → প্রোডাক্ট URL গুলো আছে কিনা দেখুন।
3. https://my-shopings.com/robots.txt খুলুন → `Sitemap:` লাইন আছে কিনা দেখুন।
4. https://search.google.com/test/rich-results এ একটা প্রোডাক্ট URL দিন → Product schema ঠিক আছে কিনা।
5. https://developers.facebook.com/tools/debug এ লিংক দিয়ে শেয়ার-প্রিভিউ দেখুন।

---

## ১০. যা আমি বদলাইনি, কিন্তু আপনার জানা দরকার

কোড না বদলানোর শর্তে এগুলো ছুঁইনি:

1. **প্রোডাক্ট লিস্ট পেজ ক্লায়েন্ট-সাইড:** `/products-view`, `/games/*`, `/gifts` ইত্যাদি `"use client"`। গুগল এগুলো রেন্ডার করতে পারে, কিন্তু একটু ধীরে। ভবিষ্যতে সার্ভার-সাইডে ডাটা আনলে ইনডেক্সিং আরও দ্রুত হবে।
2. **হোমপেজের `<h1>` `sr-only` (লুকানো):** নিয়মমাফিক অনুমোদিত, ঝুঁকি কম। তবে দৃশ্যমান h1 থাকলে আরও ভালো।
3. **প্রজেক্টে অপ্রয়োজনীয় ভারী ফাইল:** `app/real_shop/img/imgs.jpg` (১৪ MB), `app/app.rar`, `*.rar` ফাইলগুলো, `app/real_shop/mnt/...`। এগুলো `app/` ফোল্ডার থেকে সরান। বিল্ডে সমস্যা না করলেও রিপোজিটরি ভারী করে।
4. **`app/games/terget/` ও `app/games/babull/`-এর ভেতরের `robots.ts`, `manifest.ts`:** এগুলো কোনো কাজ করে না (শুধু রুট `app/robots.ts` কাজ করে)। মুছে দিতে পারেন।
5. **`robots.ts`-এ `/*?*` Disallow:** `?` যুক্ত URL গুগল ক্রল করবে না। এটা ঠিক আছে যদি আপনার কোনো গুরুত্বপূর্ণ পেজ `?id=...` দিয়ে না চলে।
6. **`/three/*` পেজগুলো** আগে থেকেই `noindex`, তাই ঠিক আছে। কিন্তু `app/three/page.tsx` ৭৫০ KB, এত বড় ফাইল সাইট ধীর করতে পারে (যদিও noindex বলে SEO-তে সরাসরি প্রভাব নেই)।
7. **`/games/number`, `/games/qs`, `/advance/video`:** আমি `noindex` দিয়েছি কারণ ভেতরের কনটেন্ট কী তা জানা ছিল না। এগুলো আসল ও দরকারি পেজ হলে `layout.tsx` ফাইলে `robots` লাইনটা মুছে `title`, `description`, `alternates.canonical` দিন, আর `sitemap.ts`-এ পাথ যোগ করুন।
8. **`/Login` URL বড় হাতের:** Next.js-এ `/Login` আর `/login` আলাদা URL। ফোল্ডারের নাম ছোট হাতের (`login`) করলে ভালো হতো, কিন্তু সেটা ফোল্ডার-নাম বদল, তাই করিনি।

---

## ১১. সংক্ষেপে চেকলিস্ট

- [ ] প্যাক merge করেছি ও `npm run build` পাস করেছে
- [ ] `.env` এ `NEXT_PUBLIC_SITE_URL` ও **`NEXT_PUBLIC_API_URL`** দিয়েছি
- [ ] `public/` এ OG ছবিগুলো রেখেছি
- [ ] Google Search Console এ ভেরিফাই + sitemap submit করেছি
- [ ] ৫–১০টা গুরুত্বপূর্ণ URL এ Request Indexing দিয়েছি
- [ ] Bing Webmaster এ যোগ করেছি
- [ ] `sameAs` (Facebook/YouTube) ও আসল ফোন যোগ করেছি
- [ ] প্রতিটি প্রোডাক্টে আলাদা বর্ণনা লিখছি
- [ ] সপ্তাহে ২–৩টা নতুন কনটেন্ট/প্রোডাক্ট যোগ করছি
