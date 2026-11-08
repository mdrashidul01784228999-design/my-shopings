import Game from './Game';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Find The Target – বাংলা ও ইংরেজি অক্ষর খোঁজার গেম',
  url: SITE_URL,
  description: 'বাংলা ও ইংরেজি অক্ষর এবং সংখ্যা দ্রুত খুঁজে বের করার ফ্রি অনলাইন ৩D গেম।',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  inLanguage: ['bn', 'en'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BDT' },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Game />
      {/* গুগল পড়তে পারবে এমন দৃশ্যমান টেক্সট কনটেন্ট */}
      <article className="mx-auto max-w-2xl bg-[#070712] px-6 py-12 text-gray-300">
        <h2 className="mb-3 text-xl font-bold text-white">Find The Target কীভাবে খেলবেন?</h2>
        <p className="mb-4 leading-relaxed">
          Find The Target একটি ফ্রি অনলাইন ব্রাউজার গেম। স্ক্রিনে ভাসমান ৩D টাইলগুলোর মধ্যে থেকে বাংলা বর্ণ, ইংরেজি অক্ষর
          বা সংখ্যা দ্রুত খুঁজে বের করতে হয়। ৩০ সেকেন্ডে যত বেশি সঠিক উত্তর, তত বেশি স্কোর।
        </p>
        <h2 className="mb-3 text-xl font-bold text-white">এই গেম খেললে কী লাভ?</h2>
        <p className="leading-relaxed">
          গেমটি বাচ্চা ও বড় সবার জন্য। এতে বাংলা স্বরবর্ণ, ব্যঞ্জনবর্ণ, বাংলা সংখ্যা এবং ইংরেজি A–Z ও ০–৯ চেনার অভ্যাস হয়,
          পাশাপাশি দ্রুত চোখ ও হাতের সমন্বয় বাড়ে। মোবাইল ও কম্পিউটার দুটোতেই খেলা যায়, ইনস্টল করতে হয় না।
        </p>
      </article>
    </>
  );
}
