import "./globals.css";

export const metadata = { title: "কুমির শিকার – ৩ডি ফিশিং গেম", robots: { index: false, follow: false } }; // /three/nouka-এর ডুপ্লিকেট
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <>{children}</>
  );
}
