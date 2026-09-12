
import Script from "next/script";
import AgeCalculatorForm from "./Age"; // ক্লায়েন্ট কম্পোনেন্ট (নিচে দেওয়া আছে)

// ১. প্রিমিয়াম এসইও মেটাডাটা (서버 সাইড রেন্ডারিং)
export const metadata = {
  title: 'সঠিক বয়স ক্যালকুলেটর - বছর, মাস ও দিন হিসাব করুন অনলাইন',
  description: 'সবচেয়ে নিখুঁত অনলাইন বয়স ক্যালকুলেটর। সরকারি চাকরি, ফর্ম পূরণ বা যেকোনো প্রয়োজনে আপনার জন্মতারিখ দিয়ে আজই বয়স বের করুন বছর, মাস ও দিনে।',
  keywords: ['বয়স ক্যালকুলেটর', 'age calculator bangla', 'জন্ম তারিখ দিয়ে বয়স বের করা', 'সঠিক বয়স হিসাব', 'online age calculator'],
  alternates: {
    canonical: 'https://yourwebsite.com', 
  },
  openGraph: {
    title: 'অনলাইন বয়স ক্যালকুলেটর - নিখুঁত বয়স হিসাব করুন',
    description: 'জন্মতারিখ দিয়ে এক ক্লিকে বের করুন আপনার বর্তমান বয়স কত বছর, মাস এবং দিন।',
    url: 'https://yourwebsite.com',
    siteName: 'Age Calculator Bangla',
    images: [
      {
        url: 'https://yourwebsite.com/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'বয়স ক্যালকুলেটর বাংলাদেশ',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function HomePage() {
  // ২. গুগল রিচ স্নিপেটের জন্য JSON-LD স্কিমা
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'অনলাইন বয়স ক্যালকুলেটর',
    'url': 'https://yourwebsite.com',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 support',
    'description': 'জন্মতারিখ দিয়ে নিখুঁতভাবে বছর, মাস, সপ্তাহ এবং দিন হিসাব করার একটি ফ্রি অনলাইন টুল।',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'BDT'
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* গুগল স্কিমা স্ক্রিপ্ট ইনজেকশন */}
      <Script
        id="json-ld-age"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ৩. ইন্টারঅ্যাক্টিভ ক্যালকুলেটর ফর্ম সেকশন */}
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight sm:text-4xl">
            অনলাইন বয়স ক্যালকুলেটর
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            আপনার সঠিক বয়স বছর, মাস এবং দিনে নিখুঁতভাবে হিসাব করুন এক ক্লিকে।
          </p>
        </div>

        {/* আমরা লজিক পার্ট আলাদা ফাইলে বা একই ফাইলে client component হিসেবে রাখব */}
        <AgeCalculatorForm />
      </div>

      {/* ৪. গুগল এসইও কন্টেন্ট লেআউট (Semantic HTML - H2, H3, FAQ) */}
      <article className="max-w-3xl mt-16 text-gray-700 px-4 leading-relaxed border-t border-gray-200 pt-10">
        
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          কেন আমাদের বয়স ক্যালকুলেটর টুলটি সেরা?
        </h2>
        <p className="mb-4 text-gray-600">
          ইন্টারনেটে অনেক বয়স ক্যালকুলেটর থাকলেও আমাদের এই প্রিমিয়াম টুলটি সম্পূর্ণ নিখুঁতভাবে তৈরি করা হয়েছে। এটি লিপ-ইয়ার (Leap Year) এবং প্রতি মাসের দিন সংখ্যা (২৮, ৩০ বা ৩১ দিন) স্বয়ংক্রিয়ভাবে হিসাব করে। ফলে চাকরির আবেদন, সরকারি ফর্ম পূরণ বা পাসপোর্ট করার ক্ষেত্রে আপনি সবসময় ১০০% সঠিক বয়স জানতে পারবেন।
        </p>

        <h2 className="text-2xl font-bold text-blue-900 mt-8 mb-4">
          জন্ম তারিখ দিয়ে বয়স বের করার নিয়ম
        </h2>
        <p className="mb-2 text-gray-600">আমাদের এই অনলাইন টুলটি ব্যবহার করা খুবই সহজ। নিচে উল্লেখিত পদক্ষেপগুলো অনুসরণ করুন:</p>
        <ul className="list-decimal pl-6 space-y-2 text-gray-600 mb-6">
          <li>প্রথমে ওপরের বক্সে আপনার সঠিক <strong>জন্মতারিখ</strong> সিলেক্ট করুন।</li>
          <li>এরপর "বয়স হিসাব করুন" বাটনে ক্লিক করুন।</li>
          <li>মুহূর্তের মধ্যেই স্ক্রিনে আপনার বর্তমান বয়স <strong>বছর, মাস এবং দিন</strong> আকারে দেখতে পাবেন।</li>
        </ul>

        {/* এসইও বুস্টার: এফএকিউ (FAQ) সেকশন */}
        <h3 className="text-xl font-bold text-gray-950 mt-8 mb-4">
          সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
            <h4 className="font-semibold text-blue-800">প্রশ্ন: এই টুলটি কি সরকারি চাকরির বয়স হিসাব করতে পারবে?</h4>
            <p className="text-sm text-gray-600 mt-1">উত্তর: হ্যাঁ, সরকারি বা বেসরকারি যেকোনো চাকরির ফর্মে চাওয়া নির্দিষ্ট তারিখ অনুযায়ী আপনি নিখুঁত বয়স বের করতে পারবেন।</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
            <h4 className="font-semibold text-blue-800">প্রশ্ন: বয়স ক্যালকুলেটর ব্যবহারের জন্য কি কোনো ফি দিতে হয়?</h4>
            <p className="text-sm text-gray-600 mt-1">উত্তর: না, এটি সম্পূর্ণ ফ্রি এবং আপনি আনলিমিটেড বার এটি ব্যবহার করতে পারবেন।</p>
          </div>
        </div>

      </article>
    </main>
  );
}