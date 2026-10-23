"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(len = 8) {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => CHARS[n % CHARS.length]).join("");
}

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>
);

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("pc_name") || "");
    setCode(generateCode());
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const clean = (v) => v.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  const start = (mode) => {
    const c = clean(code);
    if (!name.trim()) return setError("আপনার নাম লিখুন");
    if (c.length < 4) return setError("কমপক্ষে ৪ অক্ষরের কোড দিন");
    setError("");
    localStorage.setItem("pc_name", name.trim());
    router.push(`/call/room?code=${c}&mode=${mode}&name=${encodeURIComponent(name.trim())}`);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(clean(code));
      showToast("কোড কপি হয়েছে");
    } catch {
      showToast("কপি করা যায়নি");
    }
  };

  const shareLink = async () => {
    const c = clean(code);
    const url = `${location.origin}/?join=${c}`;
    const text = `Premium Call-এ আমার সাথে কথা বলতে এই কোড দিন: ${c}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Premium Call", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      showToast("লিংক কপি হয়েছে");
    }
  };

  // লিংক থেকে ?join=CODE এলে কোড বসিয়ে দেয়
  useEffect(() => {
    const j = new URLSearchParams(location.search).get("join");
    if (j) setCode(clean(j));
  }, []);

  return (
    <main className="wrap">
      <div className="panel">
        <div className="logo"><PhoneIcon /></div>
        <h1>Premium Call</h1>
        <p className="sub">ক্রিস্টাল ক্লিয়ার অডিও ও ভিডিও কল</p>

        <div className="card">
          <div className="field">
            <label>আপনার নাম</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: রাকিব" />
          </div>
          <div className="field">
            <label>কল কোড</label>
            <input className="code" value={code} maxLength={16} onChange={(e) => setCode(clean(e.target.value))} />
            <div className="row">
              <button className="link" onClick={() => setCode(generateCode())}>নতুন কোড</button>
              <button className="link" onClick={copyCode}>কপি</button>
              <button className="link" onClick={shareLink}>শেয়ার</button>
            </div>
          </div>

          <button className="btn video" onClick={() => start("video")}><VideoIcon /> ভিডিও কল</button>
          <button className="btn audio" onClick={() => start("audio")}><PhoneIcon /> অডিও কল</button>
          <div className="err">{error}</div>
        </div>

        <p className="hint">একই কোড দিয়ে দুজন জয়েন করলেই কল শুরু হবে</p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
