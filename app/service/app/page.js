import RequestForm from "../components/RequestForm";
import SceneClient from "../components/SceneClient";
import Icon from "../components/Icons";

const SERVICES = [
  ["laptop", "পিসি ও ল্যাপটপ", "হার্ডওয়্যার, সফটওয়্যার, ডিসপ্লে, ব্যাটারি ও কুলিং সমস্যা", "big"],
  ["mobile", "মোবাইল", "স্ক্রিন, চার্জিং পোর্ট, সফটওয়্যার ও পানির ক্ষতি", ""],
  ["tv", "টিভি", "LED, LCD ও স্মার্ট টিভির প্যানেল ও পাওয়ার সমস্যা", ""],
  ["fridge", "ফ্রিজ ও এসি", "কম্প্রেসার, গ্যাস ও কুলিং সমস্যার সমাধান", "big"],
];
const STEPS = [["রিকোয়েস্ট পাঠান", "ডিভাইস বেছে সমস্যার বিবরণ দিন"], ["আমরা কল করব", "সমস্যা বুঝে আনুমানিক খরচ জানাব"], ["মেরামত ও ডেলিভারি", "ঠিক হলে পিকআপ বা ডেলিভারি"]];
const WHY = [["shield", "ওয়ারেন্টি সহ মেরামত", "মেরামতের পর সার্ভিস ওয়ারেন্টি"], ["bolt", "দ্রুত সার্ভিস", "বেশিরভাগ কাজ অল্প সময়ে সম্পন্ন"], ["tag", "স্বচ্ছ মূল্য", "কাজের আগে খরচ জানানো হয়"], ["pin", "হোম সার্ভিস", "ঠিকানা দিলে আমরা আসব"]];
const FAQ = [
  ["রিকোয়েস্ট পাঠানোর পর কতক্ষণে কল পাব?", "সাধারণত অফিস সময়ের মধ্যে দ্রুত আপনার সাথে যোগাযোগ করা হয়। জরুরি হলে ফর্মে “জরুরি” বেছে নিন।"],
  ["কোন কোন ডিভাইস মেরামত করেন?", "পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ, এসি, ওয়াশিং মেশিন, প্রিন্টারসহ অন্যান্য ইলেকট্রনিক্স।"],
  ["মেরামতের খরচ আগে জানা যাবে?", "হ্যাঁ। সমস্যা পরীক্ষার পর কাজ শুরুর আগে আনুমানিক খরচ জানানো হয়।"],
  ["অভিযোগ বা ওয়ারেন্টি ক্লেইম করা যাবে?", "যাবে। ফর্মে “অভিযোগ” বা “ওয়ারেন্টি ক্লেইম” সিলেক্ট করে বিবরণ দিন।"],
];

export default function Home() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <>
      <div className="aurora" aria-hidden="true"><i /><i /></div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <header className="nav">
        <a href="#top" className="logo"><span className="mark"><Icon name="gear" size={20} /></span>টেকফিক্স</a>
        <nav aria-label="প্রধান মেনু" className="links"><a href="#services">সার্ভিস</a><a href="#why">কেন আমরা</a><a href="#faq">প্রশ্নোত্তর</a></nav>
        <a href="#request" className="btn sm">রিকোয়েস্ট পাঠান</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-text">
            <span className="pill"><i className="dot" />সারা দেশে সার্ভিস সাপোর্ট</span>
            <h1>যেকোনো ডিভাইস নষ্ট?<br /><em>আমরা ঠিক করে দেব।</em></h1>
            <p>পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ — ডিভাইস বেছে সমস্যা জানান। বাকি কাজ আমাদের।</p>
            <div className="row"><a href="#request" className="btn">এখনই রিকোয়েস্ট করুন</a><a href="#services" className="btn ghost">সার্ভিস দেখুন</a></div>
            <ul className="stats"><li><b>৯+</b>ডিভাইস ক্যাটাগরি</li><li><b>২৪/৭</b>অনলাইন রিকোয়েস্ট</li><li><b>১০০%</b>স্বচ্ছ মূল্য</li></ul>
          </div>
          <div className="scene"><SceneClient /></div>
        </section>

        <section id="services" className="wrap">
          <h2>আমরা যা মেরামত করি</h2>
          <div className="bento">
            {SERVICES.map(([i, t, d, c]) => (
              <article key={t} className={"card glass " + c}><span className="ibox"><Icon name={i} size={30} /></span><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </section>

        <section className="wrap">
          <h2>কীভাবে কাজ করে</h2>
          <ol className="steps">{STEPS.map(([t, d]) => (<li key={t} className="glass"><b>{t}</b><span>{d}</span></li>))}</ol>
        </section>

        <section id="why" className="wrap">
          <h2>কেন টেকফিক্স</h2>
          <div className="why">{WHY.map(([i, t, d]) => (<div key={t} className="glass"><Icon name={i} size={26} className="gold" /><h3>{t}</h3><p>{d}</p></div>))}</div>
        </section>

        <section id="request" className="wrap">
          <h2>অভিযোগ বা সার্ভিস রিকোয়েস্ট</h2>
          <RequestForm />
        </section>

        <section id="faq" className="wrap narrow">
          <h2>সাধারণ প্রশ্নোত্তর</h2>
          {FAQ.map(([q, a]) => (<details key={q} className="glass"><summary>{q}</summary><p>{a}</p></details>))}
        </section>
      </main>

      <footer><span className="logo"><span className="mark"><Icon name="gear" size={18} /></span>টেকফিক্স</span><p>© {new Date().getFullYear()} টেকফিক্স সার্ভিস সেন্টার · সব ইলেকট্রনিক্স মেরামত</p></footer>

      {wa && <a className="fab" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp এ মেসেজ করুন"><Icon name="chat" size={26} /></a>}
    </>
  );
}
