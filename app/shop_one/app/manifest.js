import { SITE } from "../lib/seo";

export default function manifest() {
  return {
    name: SITE.name, short_name: SITE.name, description: SITE.description,
    start_url: "/", display: "standalone", background_color: "#0b0b1a", theme_color: "#0b0b1a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
