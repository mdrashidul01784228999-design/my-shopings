# Premium Call (Next.js)

র‍্যান্ডম কোড দিয়ে অডিও ও ভিডিও কল। Jitsi Meet (iframe API) ব্যবহার করা হয়েছে — আলাদা API key বা ব্যাকএন্ড লাগে না।

## চালানো
```bash
npm install
npm run dev
```
http://localhost:3000 খুলুন। দুজন একই কোড দিলেই কল শুরু হবে।
(ক্যামেরা/মাইক ব্রাউজারে চলতে HTTPS বা localhost লাগে।)

## ডিপ্লয়
Vercel-এ সরাসরি ডিপ্লয় করা যায়: `vercel` অথবা GitHub রেপো কানেক্ট করুন।

## নিজের সার্ভার
`.env.local` ফাইলে `NEXT_PUBLIC_JITSI_DOMAIN=your.jitsi.domain` দিন।
