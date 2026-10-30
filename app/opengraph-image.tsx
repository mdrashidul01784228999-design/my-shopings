import { ImageResponse } from "next/og";

export const alt = "My Shopings – অনলাইন শপ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ফন্ট/ফাইল ছাড়াই শেয়ার-প্রিভিউ ইমেজ (Facebook, WhatsApp, Google Discover)
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "#f3bb01" }}>
        <div style={{ fontSize: 120, fontWeight: 800 }}>My Shopings</div>
        <div style={{ fontSize: 40, color: "#e2e8f0", marginTop: 20 }}>Online Shop · Games · Gifts · Bangladesh</div>
        <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 16 }}>my-shopings.com</div>
      </div>
    ),
    size
  );
}
