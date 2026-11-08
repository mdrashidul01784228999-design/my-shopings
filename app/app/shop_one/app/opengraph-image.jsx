import { ImageResponse } from "next/og";

export const alt = "ShopCube – Upload products, share links, get orders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#0b0b1a,#2e1065 60%,#0e7490)", color: "white" }}>
        <div style={{ display: "flex", fontSize: 40, color: "#22d3ee" }}>◆ ShopCube</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, marginTop: 20, lineHeight: 1.1 }}>Upload Products. Share Links. Get Orders.</div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 30, color: "#c4b5fd" }}>10 · 20 · 50 · 100 · Unlimited uploads</div>
      </div>
    ),
    size
  );
}
