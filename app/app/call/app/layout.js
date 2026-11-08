import "./globals.css";

export const metadata = {
  title: "Premium Call",
  description: "র‍্যান্ডম কোড দিয়ে অডিও ও ভিডিও কল",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
