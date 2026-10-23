import { ImageResponse } from "next/og";

export const alt = "ShopCube – Upload products, publish and share";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#0b0b1a,#1e1b4b)",
          color: "#fff",
          padding: 60,
        }}
      >
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, color: "#22d3ee" }}>ShopCube</div>
        <div style={{ display: "flex", fontSize: 42, marginTop: 24, textAlign: "center" }}>
          Upload 10, 20, 50, 100 or Unlimited Products
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 20, color: "#a78bfa" }}>
          Publish your online shop & share links
        </div>
      </div>
    ),
    size
  );
}
