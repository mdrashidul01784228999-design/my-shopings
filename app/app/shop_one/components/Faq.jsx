import { jsonLd } from "../lib/seo";

export const FAQS = [
  ["How many products can I upload?", "Choose a plan with 10, 20, 50 or 100 product uploads, or go Unlimited. You can select many images at once and publish them together."],
  ["Does every product get its own link?", "Yes. When you publish a product, ShopCube automatically creates a unique, shareable product link you can copy and share anywhere."],
  ["How do customers order?", "Customers open the product link, choose a quantity, enter name, phone and address and place the order. You manage it on the Orders page."],
  ["Can I track order status?", "Yes. Set each order to Pending, Processing, Shipped, Delivered or Cancelled and see total revenue at a glance."],
  ["Is the site mobile friendly?", "Yes. Every page is fully responsive on phones, tablets and desktops."],
];

export default function Faq() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <section className="sc-wrap sc-faq" aria-labelledby="faq">
      <h2 id="faq" className="sc-title" style={{ textAlign: "center", marginBottom: 24 }}>Frequently Asked Questions</h2>
      {FAQS.map(([q, a]) => (
        <details key={q} className="sc-box">
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
    </section>
  );
}
