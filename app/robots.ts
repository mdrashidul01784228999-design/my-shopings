import type { MetadataRoute } from "next";
import { SITE_URL } from "./seo/site";

// নোট: প্রাইভেট পেজ (profile, checkout ...) এখানে Disallow করা হয়নি —
// সেগুলোতে layout.tsx এ noindex দেওয়া আছে; Disallow করলে Google noindex ট্যাগটাই দেখতে পাবে না।
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/*?*"] },
      { userAgent: "AdsBot-Google", allow: "/" }, // মূল ফাইলের নিয়মটি রাখা হয়েছে
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

/* ===== SEO UPDATE BACKUP: মূল ফাইলের সম্পূর্ণ কোড (কিছুই মুছিনি, এখানে রাখা আছে — দরকারে ফিরিয়ে নিন) =====
import { MetadataRoute } from 'next';
import  siteUrl  from "./api/Api";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",       // Don't crawl your internal API routes
          "/admin/",     // Hide your dashboard
          "/login",      // No value in indexing login
          "/signup",     // No value in indexing signup
          "/cart",       // Private user data
          "/checkout",   // Private user data
          "/account",    // User profile pages
          "/*?*",        // Optional: Disallow URL parameters (filters/sorting) to avoid duplicate content
        ],
      },
      {
        userAgent: "AdsBot-Google", // Allow Google Ads to check your landing pages
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
===== END BACKUP ===== */
