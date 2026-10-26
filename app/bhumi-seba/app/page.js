"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import data from "../data/land.json";
import forms from "../data/forms.json";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

const WA = "8801700000000"; // আপনার হোয়াটসঅ্যাপ নম্বর
const wa = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const D = "০১২৩৪৫৬৭৮৯";
const bn = (n) => String(n).replace(/\d/g, (d) => D[d]);
const en = (s) => s.replace(/[০-৯]/g, (d) => D.indexOf(d)).trim();

const services = [
  { t: "ভূমি উন্নয়ন কর", d: "অনলাইনে হোল্ডিং নম্বর দিয়ে কর হিসাব ও পরিশোধ।", i: "৳" },
  { t: "খতিয়ান ও পর্চা", d: "সিএস, এসএ, আরএস ও পর্চার সার্টিফাইড কপির আবেদন।", i: "▤" },
  { t: "নামজারি (মিউটেশন)", d: "জমির মালিকানা পরিবর্তনের আবেদন ও শুনানির তারিখ।", i: "⇄" },
  { t: "মৌজা ম্যাপ", d: "মৌজা ও দাগ নম্বর অনুযায়ী ম্যাপের কপি সংগ্রহ।", i: "◈" },
  { t: "জমির তথ্য যাচাই", d: "দাগ, খতিয়ান ও মালিকের তথ্য এক ক্লিকে যাচাই।", i: "✓" },
  { t: "অন্যান্য অনলাইন সেবা", d: "ফরম পূরণ, ডকুমেন্ট স্ক্যান, প্রিন্ট ও ই-সেবার আবেদন।", i: "⌘" },
];
const steps = [
  { t: "আবেদন করুন", d: "সেবা বেছে নিয়ে প্রয়োজনীয় তথ্য ও কাগজ দিন।" },
  { t: "যাচাই ও ফি", d: "আমরা কাগজ যাচাই করে সঠিক ফি জানাই।" },
  { t: "জমা ও ফলোআপ", d: "অফিসে জমা দিয়ে আবেদনের অবস্থা আপডেট দেই।" },
  { t: "ডেলিভারি", d: "প্রস্তুত হলে কপি আপনার হাতে বা মোবাইলে।" },
];
const faqs = [
  ["অনলাইনে নামজারির আবেদন করতে কী কী কাগজ লাগে?", "দলিলের কপি, পূর্ববর্তী খতিয়ান, ভূমি উন্নয়ন কর রসিদ, জাতীয় পরিচয়পত্র ও ছবি লাগে। আমরা আপনার কাগজ যাচাই করে সঠিক তালিকা জানিয়ে দেই।"],
  ["খতিয়ান বা পর্চার সার্টিফাইড কপি পেতে কত সময় লাগে?", "সাধারণত কয়েক কার্যদিবস লাগে। এলাকা ও অফিসের কাজের চাপের ওপর সময় কমবেশি হতে পারে।"],
  ["ভূমি উন্নয়ন কর কীভাবে পরিশোধ করব?", "হোল্ডিং নম্বর ও মালিকের তথ্য দিলে আমরা কর হিসাব করে অনলাইনে পরিশোধে সহায়তা করি এবং রসিদ সংগ্রহ করে দেই।"],
  ["আবেদনের অবস্থা কীভাবে জানব?", "আবেদন নম্বর দিয়ে এই সাইটে বা ফোন ও হোয়াটসঅ্যাপে যেকোনো সময় অবস্থা জেনে নিতে পারবেন।"],
  ["সেবার ফি কত?", "সরকারি ফি ও আমাদের সেবা চার্জ আলাদা। আবেদনের আগেই মোট খরচ জানানো হয়।"],
];
const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
const nav = [["সেবাসমূহ", "#services"], ["আবেদন ফর্ম", "#apply"], ["কীভাবে কাজ করে", "#process"], ["প্রশ্নোত্তর", "#faq"], ["যোগাযোগ", "#contact"]];

function Tilt({ as: Tag = "div", className = "", children, ...rest }) {
  const move = (e) => {
    const el = e.currentTarget, b = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${-((e.clientY - b.top) / b.height - 0.5) * 12}deg`);
    el.style.setProperty("--ry", `${((e.clientX - b.left) / b.width - 0.5) * 14}deg`);
  };
  const leave = (e) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };
  return <Tag className={`tilt ${className}`} onMouseMove={move} onMouseLeave={leave} {...rest}>{children}</Tag>;
}

function Counter({ to }) {
  const [v, setV] = useState(0), ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const tick = (t) => { const p = Math.min((t - t0) / dur, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(ref.current); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{bn(v.toLocaleString("en-US"))}</span>;
}

const COLORS = ["#FFC857", "#FF5FA2", "#35D6FF", "#7CF29C", "#B18CFF"];
function Confetti({ burst }) {
  if (!burst) return null;
  return (
    <div className="confetti" aria-hidden="true" key={burst}>
      {Array.from({ length: 60 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % 5], animationDelay: `${(i % 12) * 0.05}s`, "--dx": `${((i * 53) % 200) - 100}px`, "--rot": `${(i * 47) % 720}deg` }} />
      ))}
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("khatian");
  const [burst, setBurst] = useState(0);
  const fire = () => { setBurst(Date.now()); setTimeout(() => setBurst(0), 2600); };

  const [dag, setDag] = useState(""), [kres, setKres] = useState(null);
  const [land, setLand] = useState({ type: data.taxRates[0].type, zone: 0, area: "" }), [tax, setTax] = useState(null);
  const [aid, setAid] = useState(""), [app, setApp] = useState(null);
  const [svc, setSvc] = useState(services[1].t), [vals, setVals] = useState({}), [errs, setErrs] = useState({}), [done, setDone] = useState(null);
  const setV = (k, v) => setVals((p) => ({ ...p, [k]: v }));
  const pickSvc = (s) => { setSvc(s); setErrs({}); setDone(null); };
  const fields = forms.services[svc];
  const opts = (o) => (typeof o === "string" ? forms.lists[o] : o);
  const prefill = (r) => setVals((p) => ({ ...p, dag: bn(r.dag), mouza: r.mouza, khatian: r.khatian, survey: r.survey, area: bn(r.area), owner: r.owner }));
  const matches = data.records.filter((r) => r.dag === en(vals.dag || ""));

  const submitApply = (e) => {
    e.preventDefault();
    const er = {};
    [...forms.common, ...fields].forEach((f) => {
      const v = (vals[f.k] || "").trim();
      if (f.req && !v) er[f.k] = "এই ঘরটি আবশ্যক";
      else if (v && f.k === "mobile" && !/^01[3-9]\d{8}$/.test(en(v))) er[f.k] = "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন";
      else if (v && f.k === "nid" && !/^(\d{10}|\d{13}|\d{17})$/.test(en(v))) er[f.k] = "NID ১০, ১৩ বা ১৭ সংখ্যার হতে হবে";
    });
    setErrs(er);
    if (Object.keys(er).length) return document.getElementById(`f-${Object.keys(er)[0]}`)?.focus();
    const rec = { id: `BS-2026-${Math.floor(1000 + Math.random() * 9000)}`, service: svc, step: 0, updated: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }) };
    rec.summary = [...forms.common, ...fields].filter((f) => (vals[f.k] || "").trim()).map((f) => [f.l, vals[f.k].trim()]);
    try { const old = JSON.parse(localStorage.getItem("bs_apps") || "[]"); localStorage.setItem("bs_apps", JSON.stringify([rec, ...old])); } catch {}
    setDone(rec); fire();
  };
  const renderField = (f) => (
    <div key={f.k} className={`fld ${f.w === "full" ? "full" : ""} ${errs[f.k] ? "bad" : ""}`}>
      <label htmlFor={`f-${f.k}`}>{f.l}{f.req && <i> *</i>}</label>
      {f.t === "select" ? (
        <select id={`f-${f.k}`} value={vals[f.k] || ""} onChange={(e) => setV(f.k, e.target.value)}>
          <option value="">— নির্বাচন করুন —</option>{opts(f.o).map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : f.t === "textarea" ? (
        <textarea id={`f-${f.k}`} rows={3} value={vals[f.k] || ""} onChange={(e) => setV(f.k, e.target.value)} placeholder={f.ph} />
      ) : (
        <input id={`f-${f.k}`} type={f.t === "tel" || f.t === "date" ? f.t : "text"} inputMode={f.num ? "decimal" : undefined} value={vals[f.k] || ""} onChange={(e) => setV(f.k, e.target.value)} placeholder={f.ph} />
      )}
      {errs[f.k] && <small role="alert">{errs[f.k]}</small>}
      {f.k === "dag" && matches.length > 0 && (
        <button type="button" className="fill" onClick={() => prefill(matches[0])}>✨ রেকর্ড পাওয়া গেছে ({matches[0].mouza}) — বাকি ঘর নিজে পূরণ করুন</button>
      )}
    </div>
  );

  const searchDag = (e) => {
    e.preventDefault();
    const q = en(dag);
    if (!q) return setKres({ list: [], m: "দাগ নম্বর দিন।" });
    const list = data.records.filter((r) => r.dag === q);
    setKres({ list, m: list.length ? "" : `দাগ ${bn(q)} নমুনা ডেটায় পাওয়া যায়নি। চেষ্টা করুন: ১২৩, ৮৮, ৫০১` });
    if (list.length) fire();
  };
  const calcTax = (e) => {
    e.preventDefault();
    const a = parseFloat(en(land.area)); if (!(a > 0)) return setTax({ err: "সঠিক জমির পরিমাণ (শতক) দিন।" });
    const r = data.taxRates.find((x) => x.type === land.type).rate, z = data.zones[land.zone];
    setTax({ total: Math.round(a * r * z.mult), a, r, z: z.name });
  };
  const track = (e) => {
    e.preventDefault();
    let saved = []; try { saved = JSON.parse(localStorage.getItem("bs_apps") || "[]"); } catch {}
    const f = [...saved, ...data.applications].find((x) => x.id === aid.trim().toUpperCase());
    if (!f) return setApp({ err: "আবেদন নম্বর পাওয়া যায়নি। চেষ্টা করুন: BS-2026-0412" });
    setApp(f); if (f.step === data.steps.length - 1) fire();
  };
  const sendContact = (e) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); fire();
    window.open(wa(`আসসালামু আলাইকুম, আমি ${f.get("n")} (${f.get("p")})। আমি "${f.get("s")}" সেবা নিতে চাই।`), "_blank");
  };

  const tabs = [["khatian", "খতিয়ান"], ["tax", "কর হিসাব"], ["track", "ট্র্যাকিং"]];

  return (
    <>
      <Confetti burst={burst} />
      <header className="hdr">
        <div className="wrap hdr-in">
          <a href="#top" className="logo"><span className="mark">ভূ</span>ভূমি সেবা</a>
          <nav className={open ? "nav open" : "nav"}>
            {nav.map(([n, h]) => <a key={h} href={h} onClick={() => setOpen(false)}>{n}</a>)}
            <a href="#contact" className="btn btn-gold sm" onClick={() => setOpen(false)}>আবেদন করুন</a>
          </nav>
          <button className="burger" aria-label="মেনু" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <Hero3D />
          <div className="aurora" aria-hidden="true"><b /><b /><b /></div>
          <div className="wrap hero-in">
            <div className="hero-txt">
              <h1>ভূমি সেবা: <span className="grad">খতিয়ান, নামজারি ও ভূমি কর</span> — ঘরে বসেই।</h1>
              <p>ভূমি কর, খতিয়ান, নামজারি ও মৌজা ম্যাপ — আবেদন থেকে ডেলিভারি পর্যন্ত সবকিছু আপনার ডিজিটাল সেবা সেন্টারে।</p>
              <div className="cta">
                <a href="#services" className="btn btn-gold">সেবা দেখুন</a>
                <a href={wa("আসসালামু আলাইকুম, আমি ভূমি সেবা নিতে চাই।")} target="_blank" rel="noreferrer" className="btn btn-ghost">হোয়াটসঅ্যাপ করুন</a>
              </div>
            </div>
            <div className="stage">
              <Tilt className="track tools">
                <div className="tabs" role="tablist">
                  {tabs.map(([k, n]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab t-${k} ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{n}</button>)}
                </div>

                {tab === "khatian" && (
                  <form onSubmit={searchDag} className="panel">
                    <label htmlFor="dag">দাগ নম্বর দিয়ে খতিয়ান খুঁজুন</label>
                    <input id="dag" value={dag} onChange={(e) => setDag(e.target.value)} placeholder="যেমন: ১২৩" inputMode="numeric" />
                    <button className="btn btn-green" type="submit">খুঁজুন</button>
                    {kres?.m && <p role="status" className="msg err">{kres.m}</p>}
                    {kres?.list.map((r, i) => (
                      <div className="rec" key={i}>
                        <b>{r.owner}</b>
                        <span>মৌজা: {r.mouza} · খতিয়ান: {r.khatian} · {r.survey}</span>
                        <span>দাগ {bn(r.dag)} · {bn(r.area)} শতক · {r.type}</span>
                        <em className={r.tax === "বকেয়া" ? "due" : "paid"}>কর: {r.tax}</em>
                        <button type="button" className="fill" onClick={() => { prefill(r); pickSvc("খতিয়ান ও পর্চা"); location.hash = "#apply"; }}>এই দাগে আবেদন করুন ↓</button>
                        <a href={wa(`দাগ ${bn(r.dag)} (${r.mouza}, খতিয়ান ${r.khatian}) এর সার্টিফাইড কপি চাই।`)} target="_blank" rel="noreferrer">কপির জন্য হোয়াটসঅ্যাপ →</a>
                      </div>
                    ))}
                  </form>
                )}

                {tab === "tax" && (
                  <form onSubmit={calcTax} className="panel">
                    <label htmlFor="lt">জমির ধরন</label>
                    <select id="lt" value={land.type} onChange={(e) => setLand({ ...land, type: e.target.value })}>{data.taxRates.map((r) => <option key={r.type}>{r.type}</option>)}</select>
                    <label htmlFor="lz">এলাকা</label>
                    <select id="lz" value={land.zone} onChange={(e) => setLand({ ...land, zone: +e.target.value })}>{data.zones.map((z, i) => <option key={z.name} value={i}>{z.name}</option>)}</select>
                    <label htmlFor="la">জমির পরিমাণ (শতক)</label>
                    <input id="la" value={land.area} onChange={(e) => setLand({ ...land, area: e.target.value })} placeholder="যেমন: ১২.৫" inputMode="decimal" />
                    <button className="btn btn-green" type="submit">কর হিসাব করুন</button>
                    {tax?.err && <p className="msg err">{tax.err}</p>}
                    {tax?.total != null && <p className="msg ok" role="status">আনুমানিক বার্ষিক কর: <strong>৳ {bn(tax.total.toLocaleString("en-US"))}</strong><br /><small>{bn(tax.a)} শতক × ৳{bn(tax.r)} × {tax.z} (নমুনা হার)</small></p>}
                  </form>
                )}

                {tab === "track" && (
                  <form onSubmit={track} className="panel">
                    <label htmlFor="aid">আবেদন নম্বর</label>
                    <input id="aid" value={aid} onChange={(e) => setAid(e.target.value)} placeholder="যেমন: BS-2026-0412" />
                    <button className="btn btn-green" type="submit">অবস্থা দেখুন</button>
                    {app?.err && <p className="msg err" role="status">{app.err}</p>}
                    {app?.id && (
                      <div className="rec">
                        <b>{app.service}</b><span>সর্বশেষ আপডেট: {app.updated}</span>
                        <ol className="tl">{data.steps.map((s, i) => <li key={s} className={i < app.step ? "done" : i === app.step ? "now" : ""}>{s}</li>)}</ol>
                      </div>
                    )}
                  </form>
                )}
              </Tilt>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><div>{[...services, ...services].map((s, i) => <span key={i}>{s.i} {s.t}</span>)}</div></div>

        <section id="services" className="sec">
          <div className="wrap">
            <h2 className="sh">আমাদের সেবাসমূহ</h2>
            <p className="sub">সবচেয়ে বেশি প্রয়োজন হয় এমন ভূমি ও ডিজিটাল সেবা।</p>
            <div className="grid">
              {services.map((s) => (
                <Tilt as="a" key={s.t} href="#apply" onClick={() => pickSvc(s.t)} className="card">
                  <span className="ico" aria-hidden="true">{s.i}</span><h3>{s.t}</h3><p>{s.d}</p>
                </Tilt>
              ))}
            </div>
          </div>
        </section>

        <section id="apply" className="sec applysec">
          <div className="wrap">
            <h2 className="sh">অনলাইন আবেদন ফর্ম</h2>
            <p className="sub">আবেদনের ধরন বাছাই করলেই সেই সেবার প্রয়োজনীয় ঘরগুলো নিজে থেকে চলে আসবে।</p>
            <div className="chips">{services.map((s) => <button type="button" key={s.t} className={`chip ${svc === s.t ? "on" : ""}`} onClick={() => pickSvc(s.t)}>{s.i} {s.t}</button>)}</div>
            {done ? (
              <div className="aform success">
                <h3>🎉 আবেদন গৃহীত হয়েছে</h3>
                <p>আপনার আবেদন নম্বর</p><strong className="aid">{done.id}</strong>
                <dl>{done.summary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                <div className="cta">
                  <a className="btn btn-gold" target="_blank" rel="noreferrer" href={wa(`নতুন আবেদন: ${done.id}\nসেবা: ${done.service}\n` + done.summary.map(([k, v]) => `${k}: ${v}`).join("\n"))}>হোয়াটসঅ্যাপে পাঠান</a>
                  <button className="btn btn-green" onClick={() => { setAid(done.id); setTab("track"); setApp(done); location.hash = "#top"; }}>অবস্থা দেখুন</button>
                  <button className="btn btn-ghost dk" onClick={() => { setDone(null); setVals({}); }}>নতুন আবেদন</button>
                </div>
              </div>
            ) : (
              <form className="aform" onSubmit={submitApply} noValidate>
                <h3>আবেদনকারীর তথ্য</h3>
                <div className="fgrid">{forms.common.map(renderField)}</div>
                <h3>{svc} — সংশ্লিষ্ট তথ্য</h3>
                <div className="fgrid" key={svc}>{fields.map(renderField)}</div>
                <button className="btn btn-gold" type="submit">আবেদন জমা দিন</button>
              </form>
            )}
          </div>
        </section>

        <section className="sec stats">
          <div className="wrap statgrid">
            {data.stats.map((s) => <div key={s.l}><strong><Counter to={s.n} />{s.n < 1000 ? "" : "+"}</strong><span>{s.l}</span></div>)}
          </div>
        </section>

        <section id="process" className="sec dark">
          <div className="wrap">
            <h2 className="sh">চারটি ধাপে কাজ শেষ</h2>
            <ol className="steps">{steps.map((s, i) => <li key={s.t}><b>{bn(i + 1)}</b><h3>{s.t}</h3><p>{s.d}</p></li>)}</ol>
          </div>
        </section>

        <section id="faq" className="sec faq">
          <div className="wrap">
            <h2 className="sh">সাধারণ প্রশ্নোত্তর</h2>
            <p className="sub">ভূমি সেবা নিয়ে সবচেয়ে বেশি জিজ্ঞাসিত প্রশ্ন।</p>
            <div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        </section>

        <section id="contact" className="sec">
          <div className="wrap contact">
            <div>
              <h2 className="sh">আজই আবেদন শুরু করুন</h2>
              <p className="sub">ফোন বা হোয়াটসঅ্যাপে কাগজের ছবি পাঠালেও আমরা শুরু করে দেই।</p>
              <ul className="info"><li>📞 ০1784-228999</li><li>📍 আপনার ঠিকানা, উপজেলা, জেলা</li><li>🕘 শনি–বৃহস্পতি, সকাল ৯টা – রাত ৮টা</li></ul>
            </div>
            <form className="cform" onSubmit={sendContact}>
              <input required name="n" placeholder="আপনার নাম" aria-label="নাম" />
              <input required name="p" type="tel" placeholder="মোবাইল নম্বর" aria-label="মোবাইল" />
              <select name="s" aria-label="সেবা" defaultValue={services[0].t}>{services.map((s) => <option key={s.t}>{s.t}</option>)}</select>
              <button className="btn btn-gold" type="submit">হোয়াটসঅ্যাপে পাঠান</button>
            </form>
          </div>
        </section>
      </main>

      <a className="wa-fab" href={wa("আসসালামু আলাইকুম, আমি ভূমি সেবা নিতে চাই।")} target="_blank" rel="noreferrer" aria-label="হোয়াটসঅ্যাপ">💬</a>
      <footer className="ftr"><div className="wrap">© ২০২৬ ভূমি সেবা – আপনার ডিজিটাল সেবা সেন্টার। সর্বস্বত্ব সংরক্ষিত।</div></footer>
    </>
  );
}
