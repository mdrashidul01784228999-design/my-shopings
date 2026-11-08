import { FAQ } from "../lib/faq";

export default function Faq() {
  return (
    <section id="faq" className="sec" aria-labelledby="faq-h">
      <h2 id="faq-h">Frequently Asked Questions</h2>
      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
