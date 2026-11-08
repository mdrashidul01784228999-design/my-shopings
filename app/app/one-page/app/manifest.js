export default function manifest() {
  return {
    name: "ShopCube – Online Product Store",
    short_name: "ShopCube",
    description: "Upload products, publish your shop and share links.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b1a",
    theme_color: "#0b0b1a",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}
