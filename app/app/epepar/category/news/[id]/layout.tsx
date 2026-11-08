import type { Metadata } from "next";

// SEO: এই পেজ গুগলে ইনডেক্স হবে না (প্রাইভেট / খালি / টেস্ট পেজ)
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
