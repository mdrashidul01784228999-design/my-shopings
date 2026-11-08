import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const font = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });

export const metadata = { title: "ব্যাকগ্রাউন্ড রিমুভার প্রো", description: "ব্যাকগ্রাউন্ড রিমুভ, হাই/লো কোয়ালিটি ও পাসপোর্ট সাইজ" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={font.className}>
        <div className="aurora"><i /><i /><i /></div>
        {children}
      </body>
    </html>
  );
}
