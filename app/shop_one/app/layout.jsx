import "./globals.css";
import Nav from "../components/Nav";
import { SITE, absoluteUrl, jsonLd } from "../lib/seo";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: { type: "website", siteName: SITE.name, title: SITE.title, description: SITE.description, locale: SITE.locale },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0b1a" };

const org = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": absoluteUrl("/#org"), name: SITE.name, url: SITE.url, logo: absoluteUrl("/icon.svg") },
    { "@type": "WebSite", "@id": absoluteUrl("/#site"), url: SITE.url, name: SITE.name, publisher: { "@id": absoluteUrl("/#org") },
      potentialAction: { "@type": "SearchAction", target: `${SITE.url}/products?q={search_term_string}`, "query-input": "required name=search_term_string" } },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(org) }} />
        <Nav />
        {children}
      </body>
    </html>
  );
}
