import Home from "../components/Home";
import Faq from "../components/Faq";
import JsonLd from "../components/JsonLd";
import { FAQ } from "../lib/faq";
import { abs } from "../lib/site";

export const metadata = { alternates: { canonical: "/" } };

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const appLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ShopCube",
  url: abs("/"),
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "AggregateOffer", lowPrice: "5", highPrice: "79", priceCurrency: "USD", offerCount: 5 },
};

export default function Page() {
  return (
    <main className="wrap">
      <JsonLd data={faqLd} />
      <JsonLd data={appLd} />
      <Home />
      <Faq />
      <footer>© {new Date().getFullYear()} ShopCube. All rights reserved.</footer>
    </main>
  );
}
