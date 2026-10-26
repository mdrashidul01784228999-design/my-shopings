import dynamic from "next/dynamic";
import RequestForm from "@/components/RequestForm";
const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false, loading: () => <div className="scene-ph" /> });

const SERVICES = [
  ["🖥️", "পিসি ও ল্যাপটপ", "হার্ডওয়্যার, সফটওয়্যার, ডিসপ্লে ও ব্যাটারি সমস্যা"],
  ["📱", "মোবাইল", "স্ক্রিন, চার্জিং পোর্ট, সফটওয়্যার ও পানির ক্ষতি"],
  ["📺", "টিভি", "LED, LCD, স্মার্ট টিভির প্যানেল ও পাওয়ার সমস্যা"],
  ["🧊", "ফ্রিজ ও এসি", "কম্প্রেসার, গ্যাস ও কুলিং সমস্যা"],
];
const STEPS = [["রিকোয়েস্ট পাঠান", "ডিভাইস বেছে ফর্ম পূরণ করুন"], ["আমরা কল করব", "সমস্যা বুঝে আনুমানিক খরচ জানাব"], ["মেরামত ও ডেলিভারি", "ঠিক হলে ডেলিভারি বা পিকআপ"]];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a href="#top" className="logo"><span>⚙</span> টেকফিক্স</a>
        <a href="#request" className="btn sm">রিকোয়েস্ট পাঠান</a>
      </header>

      <section id="top" className="hero">
        <div className="hero-text">
          <h1>যেকোনো ডিভাইস নষ্ট? আমরা ঠিক করে দেব।</h1>
          <p>পিসি, ল্যাপটপ, মোবাইল, টিভি, ফ্রিজ — ডিভাইস বেছে সমস্যা জানান। বাকি কাজ আমাদের।</p>
          <div className="row"><a href="#request" className="btn">এখনই রিকোয়েস্ট করুন</a><a href="#services" className="btn ghost">সার্ভিস দেখুন</a></div>
        </div>
        <div className="scene"><Scene3D /></div>
      </section>

      <section id="services" className="wrap">
        <h2>আমরা যা মেরামত করি</h2>
        <div className="cards">
          {SERVICES.map(([i, t, d]) => (<article key={t} className="card"><span className="ico big" aria-hidden="true">{i}</span><h3>{t}</h3><p>{d}</p></article>))}
        </div>
      </section>

      <section className="wrap">
        <h2>কীভাবে কাজ করে</h2>
        <ol className="steps">{STEPS.map(([t, d]) => (<li key={t}><b>{t}</b><span>{d}</span></li>))}</ol>
      </section>

      <section id="request" className="wrap">
        <h2>অভিযোগ বা সার্ভিস রিকোয়েস্ট</h2>
        <RequestForm />
      </section>

      <footer>© {new Date().getFullYear()} টেকফিক্স সার্ভিস সেন্টার · সব ইলেকট্রনিক্স মেরামত</footer>
    </main>
  );
}
