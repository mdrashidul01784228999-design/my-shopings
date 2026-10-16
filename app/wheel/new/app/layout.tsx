import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Hind_Siliguri, Cinzel } from "next/font/google";

const bangla = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const display = Cinzel({
  subsets: ["latin"],
  weight: ["600", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ভাগ্যচক্র | Premium Spin Wheel",
  description: "নাম লিখে চাকা ঘোরান, ভাগ্যবান বিজয়ী বেছে নিন।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12060a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${bangla.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
