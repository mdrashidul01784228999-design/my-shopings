"use client";
import { useRef, useState } from "react";

const tick = () => new Promise((r) => setTimeout(r, 30));
const kb = (b) => (b.size >= 1048576 ? (b.size / 1048576).toFixed(2) + " MB" : (b.size / 1024).toFixed(0) + " KB");
const toBlob = (c, t, q) => new Promise((r) => c.toBlob(r, t, q));
const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

function Compare({ before, after, w, h }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="cmp" style={{ aspectRatio: `${w}/${h}`, maxWidth: `min(100%, ${(70 * w) / h}vh)` }}>
      <img src={after} alt="ব্যাকগ্রাউন্ড ছাড়া" />
      <img src={before} alt="মূল ছবি" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <span className="lbl" style={{ left: 10 }}>আগে</span>
      <span className="lbl" style={{ right: 10 }}>পরে</span>
      <div className="ln" style={{ left: `${pos}%` }} />
      <div className="kn" style={{ left: `${pos}%` }}>⇆</div>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="আগে ও পরে তুলনা" />
    </div>
  );
}

export default function Page() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [orig, setOrig] = useState("");
  const [over, setOver] = useState(false);
  const [method, setMethod] = useState("ai");
  const [quality, setQuality] = useState("high");
  const [tol, setTol] = useState(45);
  const [dark, setDark] = useState(false);
  const [darkS, setDarkS] = useState(80);
  const [psz, setPsz] = useState("413,531");
  const [pbg, setPbg] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [pr, setPr] = useState(null);
  const [out, setOut] = useState(null); // {kind, blob, url, info, name}

  const load = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f), i = new Image();
    i.onload = () => { setFile(f); setImg(i); setOrig(url); setOut(null); setPr(null); };
    i.src = url;
  };

  async function run(passport) {
    if (!img) return;
    setBusy(true); setOut(null);
    const step = async (p, t) => { setPr({ p, t }); await tick(); };
    try {
      let cut = null, W = img.width, H = img.height, N, src, sx, id, d, a;

      if (method === "ai") {
        await step(5, "AI মডেল লোড হচ্ছে (প্রথমবার একটু সময় লাগবে)…");
        const { removeBackground } = await import("@imgly/background-removal");
        cut = await removeBackground(file, {
          model: quality === "high" ? "isnet" : "isnet_fp16",
          output: { format: "image/png", quality: 1 },
          progress: (key, cur, tot) => {
            const f = tot ? cur / tot : 0;
            if (key.startsWith("fetch")) setPr({ p: 5 + Math.round(f * 40), t: "AI মডেল ডাউনলোড হচ্ছে…" });
            else setPr({ p: 45 + Math.round(f * 40), t: "ব্যাকগ্রাউন্ড মোছা হচ্ছে…" });
          },
        });
      }

      const needCanvas = method === "simple" || passport || dark;
      if (needCanvas) {
        await step(86, "ছবি প্রসেস হচ্ছে…");
        src = mk(W, H); sx = src.getContext("2d", { willReadFrequently: true });
        if (cut) { const bm = await createImageBitmap(cut); sx.drawImage(bm, 0, 0, W, H); }
        else sx.drawImage(img, 0, 0, W, H);
        id = sx.getImageData(0, 0, W, H); d = id.data; N = W * H;

        if (!cut) {
          await step(15, "ব্যাকগ্রাউন্ডের রং শনাক্ত হচ্ছে…");
          const R = [], G = [], B = [];
          const sp0 = Math.max(1, Math.floor(Math.max(W, H) / 200));
          const smp = (x, y) => { const i = (y * W + x) * 4; R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]); };
          for (let x = 0; x < W; x += sp0) { smp(x, 0); smp(x, H - 1); }
          for (let y = 0; y < H; y += sp0) { smp(0, y); smp(W - 1, y); }
          const med = (z) => { z.sort((p, q) => p - q); return z[z.length >> 1]; };
          const br = med(R), bg = med(G), bb = med(B), t2 = tol * tol;
          await step(40, "ব্যাকগ্রাউন্ড কাটা হচ্ছে…");
          const vis = new Uint8Array(N), st = new Int32Array(N);
          let sp = 0;
          const ok = (p) => { const i = p * 4, dr = d[i] - br, dg = d[i + 1] - bg, db = d[i + 2] - bb; return dr * dr + dg * dg + db * db <= t2; };
          const push = (p) => { if (!vis[p] && ok(p)) { vis[p] = 1; st[sp++] = p; } };
          for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
          for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
          while (sp) {
            const p = st[--sp], x = p % W, y = (p / W) | 0;
            if (x > 0) push(p - 1); if (x < W - 1) push(p + 1);
            if (y > 0) push(p - W); if (y < H - 1) push(p + W);
          }
          await step(70, "কিনারা মসৃণ করা হচ্ছে…");
          a = new Float32Array(N);
          for (let p = 0; p < N; p++) a[p] = vis[p] ? 0 : 255;
          for (let pass = 0; pass < 2; pass++) {
            const b = new Float32Array(N);
            for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
              const p = y * W + x;
              b[p] = (a[p - W - 1] + a[p - W] + a[p - W + 1] + a[p - 1] + a[p] + a[p + 1] + a[p + W - 1] + a[p + W] + a[p + W + 1]) / 9;
            }
            a = b;
          }
          for (let p = 0; p < N; p++) d[p * 4 + 3] = a[p];
        } else {
          a = new Float32Array(N);
          for (let p = 0; p < N; p++) a[p] = d[p * 4 + 3];
        }

        if (dark) {
          await step(90, "হালকা লেখা কালো করা হচ্ছে…");
          const s = darkS / 100, thr = 225;
          for (let p = 0; p < N; p++) {
            const i = p * 4; if (d[i + 3] < 8) continue;
            const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            if (L < thr) { const f = 1 - s * Math.min(1, (thr - L) / 60); d[i] *= f; d[i + 1] *= f; d[i + 2] *= f; }
          }
        }
        sx.putImageData(id, 0, 0);
      }

      await step(95, "ফাইল তৈরি হচ্ছে…");
      if (!passport) {
        // মূল সাইজ ও রেজোলিউশন অপরিবর্তিত; AI আউটপুট হলে সরাসরি সেটিই দেওয়া হয়
        const blob = cut && !dark ? cut : await toBlob(src, "image/png");
        setOut({ kind: "main", blob, url: URL.createObjectURL(blob), name: "no-bg.png",
          info: [`${W}×${H} px (মূল সাইজ)`, `মূল ${kb(file)}`, `এখন ${kb(blob)}`] });
      } else {
        let x0 = W, x1 = 0, y0 = H, y1 = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[y * W + x] > 128) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        if (x1 <= x0 || y1 <= y0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
        const [pw, ph] = psz.split(",").map(Number), bw = x1 - x0 + 1, bh = y1 - y0 + 1;
        const sc = Math.min((pw * 0.96) / bw, (ph * 0.92) / bh), pc = mk(pw, ph), px = pc.getContext("2d");
        px.fillStyle = pbg; px.fillRect(0, 0, pw, ph);
        px.imageSmoothingQuality = "high";
        px.drawImage(src, x0, y0, bw, bh, (pw - bw * sc) / 2, ph * 0.05, bw * sc, bh * sc);
        const blob = await toBlob(pc, "image/jpeg", 0.95);
        setOut({ kind: "pp", blob, url: URL.createObjectURL(blob), name: "passport.jpg",
          info: [`${pw}×${ph} px`, "300 DPI", kb(blob)] });
      }
      await step(100, "সম্পন্ন! 🎉");
    } catch (e) {
      setPr({ p: 0, t: "ত্রুটি: " + e.message });
    }
    setBusy(false);
  }

  const save = () => { const a = document.createElement("a"); a.href = out.url; a.download = out.name; a.click(); };

  return (
    <main className="wrap">
      <div className="brand"><span className="badge">👑 PREMIUM</span></div>
      <h1>ব্যাকগ্রাউন্ড রিমুভার প্রো</h1>
      <p className="sub">ছবির সাইজ ও কোয়ালিটি একদম অপরিবর্তিত, শুধু ব্যাকগ্রাউন্ড উধাও</p>

      <section className="card">
        <div
          className={`drop ${over ? "on" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); load(e.dataTransfer.files[0]); }}
        >
          <div className="ico">{img ? "✅" : "🖼️"}</div>
          <b>{img ? `${file.name} · ${img.width}×${img.height}` : "ছবি এখানে ড্রপ করুন বা ক্লিক করুন"}</b>
          <small>{img ? "অন্য ছবি দিতে ক্লিক করুন" : "JPG, PNG, WEBP · ছবি আপনার ব্রাউজারেই প্রসেস হয়"}</small>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files[0])} />

        <div className="row">
          <label>পদ্ধতি
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="ai">🤖 AI (যেকোনো ছবি, সেরা কোয়ালিটি)</option>
              <option value="simple">⚡ সরল (একরঙা ব্যাকগ্রাউন্ড)</option>
            </select>
          </label>
          {method === "ai" && (
            <label>কোয়ালিটি
              <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="high">💎 হাই কোয়ালিটি (ধীর, সেরা কিনারা)</option>
                <option value="fast">⚡ দ্রুত (ছোট মডেল)</option>
              </select>
            </label>
          )}
          {method === "simple" && (
            <label>সংবেদনশীলতা
              <input type="range" min="10" max="120" value={tol} onChange={(e) => setTol(+e.target.value)} /> {tol}
            </label>
          )}
          <label><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} /> ✒️ হালকা লেখা কালো করুন</label>
          {dark && (
            <label>গাঢ়তা
              <input type="range" min="20" max="100" value={darkS} onChange={(e) => setDarkS(+e.target.value)} /> {darkS}%
            </label>
          )}
        </div>

        <div className="row">
          <button className="btn" disabled={!img || busy} onClick={() => run(false)}>✨ ব্যাকগ্রাউন্ড রিমুভ করুন</button>
          <label>পাসপোর্ট সাইজ
            <select value={psz} onChange={(e) => setPsz(e.target.value)}>
              <option value="413,531">৩৫×৪৫ মিমি</option>
              <option value="600,600">২×২ ইঞ্চি</option>
              <option value="354,472">৩০×৪০ মিমি</option>
            </select>
          </label>
          <label>রং <input type="color" value={pbg} onChange={(e) => setPbg(e.target.value)} /></label>
          <button className="btn alt" disabled={!img || busy} onClick={() => run(true)}>🪪 পাসপোর্ট সাইজ বানান</button>
        </div>

        {pr && (
          <div className="prog">
            <div className="bar"><div className="fill" style={{ width: pr.p + "%" }} /></div>
            <div className="pt"><span>{pr.t}</span><b>{pr.p}%</b></div>
          </div>
        )}
      </section>

      {out && (
        <section className="card res">
          <h3>{out.kind === "main" ? "✅ ব্যাকগ্রাউন্ড রিমুভ সম্পন্ন" : "🪪 পাসপোর্ট সাইজ তৈরি"}</h3>
          <div className="chips">
            {out.info.map((t, i) => <span key={i} className={`chip ${i === 0 ? "g" : ""}`}>{t}</span>)}
          </div>
          {out.kind === "main"
            ? <Compare before={orig} after={out.url} w={img.width} h={img.height} />
            : <div className="pv"><img src={out.url} alt="পাসপোর্ট ছবি" /></div>}
          <div className="acts"><button className="btn sm" onClick={save}>⬇️ ডাউনলোড</button></div>
        </section>
      )}
      <p className="note">AI পদ্ধতিতে জটিল ব্যাকগ্রাউন্ডের ছবিও কাটা যায়। সরল পদ্ধতি শুধু সাদা বা একরঙা ব্যাকগ্রাউন্ডের জন্য।</p>
    </main>
  );
}
