"use client";
import { useState } from "react";
import Icon from "./Icons";

const DEVICES = {
  pc: { icon: "pc", name: "ডেস্কটপ পিসি", hint: "যেমন: Core i5, Gigabyte H410", chips: ["চালু হয় না", "বারবার রিস্টার্ট", "ধীর গতি", "মনিটরে ডিসপ্লে নেই", "ভাইরাস/উইন্ডোজ সমস্যা"] },
  laptop: { icon: "laptop", name: "ল্যাপটপ", hint: "যেমন: Dell Inspiron 15 3520", chips: ["চার্জ হয় না", "স্ক্রিন ভাঙা", "অতিরিক্ত গরম", "কিবোর্ড কাজ করে না", "ব্যাটারি ব্যাকআপ নেই"] },
  mobile: { icon: "mobile", name: "মোবাইল", hint: "যেমন: Samsung Galaxy A34", chips: ["ডিসপ্লে ভাঙা", "চার্জ ঢোকে না", "পানিতে পড়েছে", "হ্যাং করে", "ব্যাটারি দ্রুত শেষ"] },
  tv: { icon: "tv", name: "টিভি", hint: "যেমন: Sony Bravia 43 inch LED", chips: ["ছবি আসে না", "শব্দ নেই", "স্ক্রিনে লাইন", "চালু হয় না", "রিমোট কাজ করে না"] },
  fridge: { icon: "fridge", name: "ফ্রিজ", hint: "যেমন: Walton 250L Double Door", chips: ["ঠান্ডা হয় না", "কম্প্রেসার চলে না", "পানি পড়ে", "অতিরিক্ত শব্দ", "বরফ জমে যায়"] },
  ac: { icon: "ac", name: "এসি", hint: "যেমন: Gree 1.5 Ton Inverter", chips: ["ঠান্ডা কম", "পানি পড়ে", "গ্যাস লিক", "আউটডোর চলে না", "গ্যাস ভরা"] },
  wm: { icon: "wm", name: "ওয়াশিং মেশিন", hint: "যেমন: LG 7kg Front Load", chips: ["ঘোরে না", "পানি জমে থাকে", "শব্দ করে", "চালু হয় না", "ড্রাইয়ার কাজ করে না"] },
  printer: { icon: "printer", name: "প্রিন্টার", hint: "যেমন: HP LaserJet 1020", chips: ["প্রিন্ট হয় না", "পেপার জ্যাম", "কালি সমস্যা", "ঝাপসা প্রিন্ট", "ড্রাইভার সমস্যা"] },
  other: { icon: "other", name: "অন্যান্য", hint: "ডিভাইসের নাম ও মডেল লিখুন", chips: ["চালু হয় না", "শব্দ করে", "গরম হয়", "পার্টস নষ্ট", "পরীক্ষা করাতে চাই"] },
};
const TYPES = ["মেরামত রিকোয়েস্ট", "অভিযোগ", "ওয়ারেন্টি ক্লেইম", "মূল্য জানতে চাই"];
const DURATIONS = ["আজ থেকে", "১-৩ দিন", "১ সপ্তাহ", "১ মাস", "১ মাসের বেশি"];
const URGENCY = ["সাধারণ", "জরুরি", "অতি জরুরি"];
const empty = { type: TYPES[0], name: "", phone: "", brand: "", model: "", address: "", problem: "", duration: DURATIONS[1], urgency: URGENCY[0] };

export default function RequestForm() {
  const [dev, setDev] = useState(null);
  const [f, setF] = useState(empty);
  const [state, setState] = useState({ s: "idle", msg: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;

  async function submit(e) {
    e.preventDefault();
    setState({ s: "loading", msg: "" });
    try {
      const r = await fetch("/api/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, device: DEVICES[dev].name }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setState({ s: "done", msg: j.id });
    } catch (err) {
      setState({ s: "error", msg: err.message || "পাঠানো যায়নি, আবার চেষ্টা করুন" });
    }
  }

  if (state.s === "done")
    return (
      <div className="panel done" role="status">
        <div className="tick"><Icon name="check" size={34} /></div>
        <h3>রিকোয়েস্ট পাঠানো হয়েছে</h3>
        <p>আপনার ট্র্যাকিং কোড: <b>{state.msg}</b></p>
        <p>আমরা শীঘ্রই {f.phone} নম্বরে যোগাযোগ করব।</p>
        {wa && <a className="btn ghost" href={`https://wa.me/${wa}?text=${encodeURIComponent("আমার রিকোয়েস্ট কোড " + state.msg)}`} target="_blank" rel="noopener noreferrer">WhatsApp এ জানান</a>}
        <button className="btn" onClick={() => { setDev(null); setF(empty); setState({ s: "idle", msg: "" }); }}>নতুন রিকোয়েস্ট</button>
      </div>
    );

  return (
    <div className="panel">
      <h3 id="pick"><i className="n">১</i>কোন ডিভাইসে সমস্যা?</h3>
      <div className="devices" role="radiogroup" aria-labelledby="pick">
        {Object.entries(DEVICES).map(([k, d]) => (
          <button key={k} type="button" role="radio" aria-checked={dev === k} className={"dev" + (dev === k ? " on" : "")} onClick={() => setDev(k)}>
            <span className="ico"><Icon name={d.icon} size={30} /></span>{d.name}
          </button>
        ))}
      </div>

      {dev && (
        <form onSubmit={submit} className="form" key={dev}>
          <h3><i className="n">২</i>{DEVICES[dev].name} এর বিবরণ দিন</h3>
          <div className="seg" role="radiogroup" aria-label="ধরন">
            {TYPES.map((t) => <button type="button" key={t} role="radio" aria-checked={f.type === t} className={f.type === t ? "on" : ""} onClick={() => set("type", t)}>{t}</button>)}
          </div>
          <div className="grid">
            <label>আপনার নাম *<input required value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></label>
            <label>মোবাইল নম্বর *<input required type="tel" inputMode="tel" placeholder="01XXXXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></label>
            <label>ব্র্যান্ড<input placeholder="Samsung, Dell, Walton..." value={f.brand} onChange={(e) => set("brand", e.target.value)} /></label>
            <label>মডেল<input placeholder={DEVICES[dev].hint} value={f.model} onChange={(e) => set("model", e.target.value)} /></label>
          </div>
          <label>ঠিকানা (গ্রাম/মহল্লা, থানা, জেলা) *<input required value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" /></label>
          <div>
            <span className="lbl">সাধারণ সমস্যা বেছে নিন</span>
            <div className="chips">{DEVICES[dev].chips.map((c) => <button type="button" key={c} onClick={() => set("problem", f.problem ? f.problem + ", " + c : c)}>+ {c}</button>)}</div>
          </div>
          <label>সমস্যার বিস্তারিত বিবরণ *<textarea required rows={4} value={f.problem} onChange={(e) => set("problem", e.target.value)} placeholder="কী হয়েছে, কীভাবে শুরু হলো লিখুন..." /></label>
          <div className="grid">
            <label>কতদিন ধরে সমস্যা?<select value={f.duration} onChange={(e) => set("duration", e.target.value)}>{DURATIONS.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label>জরুরি কিনা<select value={f.urgency} onChange={(e) => set("urgency", e.target.value)}>{URGENCY.map((d) => <option key={d}>{d}</option>)}</select></label>
          </div>
          {state.s === "error" && <p className="err" role="alert">{state.msg}</p>}
          <button className="btn" disabled={state.s === "loading"}>{state.s === "loading" ? "পাঠানো হচ্ছে..." : "রিকোয়েস্ট পাঠান"}</button>
        </form>
      )}
    </div>
  );
}
