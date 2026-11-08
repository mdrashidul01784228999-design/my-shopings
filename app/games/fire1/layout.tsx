import type { Metadata } from "next";

// এই পেজটি /three/* বা অন্য গেমের ডুপ্লিকেট কপি — Google-এ ইনডেক্স না হওয়াই ভালো (ডুপ্লিকেট কনটেন্ট এড়াতে)
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
