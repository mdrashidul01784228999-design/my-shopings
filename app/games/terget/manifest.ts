import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Find The Target',
    short_name: 'FindTarget',
    description: 'বাংলা ও ইংরেজি অক্ষর খোঁজার ফ্রি ৩D গেম',
    start_url: '/',
    display: 'standalone',
    background_color: '#070712',
    theme_color: '#070712',
    lang: 'bn',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
