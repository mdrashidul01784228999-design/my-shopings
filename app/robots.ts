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