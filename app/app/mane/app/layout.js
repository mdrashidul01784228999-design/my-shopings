import './globals.css';
export const metadata = { title: 'Battle Royale', description: 'মোবাইল ও পিসিতে খেলার ব্যাটল রয়্যাল গেম' };
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false };
export default function RootLayout({ children }) {
  return (<html lang="bn"><body>{children}</body></html>);
}
