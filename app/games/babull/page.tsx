import type { Metadata } from 'next';
import AllCategorySection from './pagets';

export const metadata: Metadata = {
  title: 'সব ক্যাটাগরি – গেমস, শপিং ও গিফট কার্ড',
  description:
    'ফ্রি অনলাইন গেমস, প্রিমিয়াম শপিং, ট্রেন্ডিং আইটেম ও গিফট কার্ড রিডিম – সবকিছু এক জায়গায়। কয়েন জমান, গেম খেলুন, পুরস্কার জিতুন।',
  keywords: ['অনলাইন গেমস', 'ফ্রি গেম', 'প্রিমিয়াম শপিং', 'গিফট কার্ড', 'ট্রেন্ডিং', 'বাবল শুটার'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Premium Portal – গেমস, শপিং ও গিফট কার্ড',
    description: 'ফ্রি অনলাইন গেমস, প্রিমিয়াম শপিং ও গিফট কার্ড এক জায়গায়।',
    url: '/',
    type: 'website',
    locale: 'bn_BD',
  },
};

export default function HomePage() {
  return <AllCategorySection />;
}
