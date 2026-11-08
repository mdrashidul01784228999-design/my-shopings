import "./globals.css";

export const metadata = { title: "কুমির শিকার – ৩ডি ফিশিং গেম" };
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <>{children}</>
  );
}
