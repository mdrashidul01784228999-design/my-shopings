"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Entry = { id: number; name: string; number: number | string; img?: string };
type Win = Entry & { title: string; at: string };

// ডিফল্ট ডাটা (JSON) — এখানে নাম বদলাতে পারেন
const defaults: Entry[] = [
  { id: 1, name: "মো:রাশিদুল্ ইসলাম", number: 101 },
  { id: 2, name:  "মোঃ ইব্রাহিম খান", number: 102 },
  { id: 3, name:  " মোাছাঃ আতিয়া (লিজা)",  number: 103 },
  { id: 4, name: "মোছাঃ রাফিয়া ",   number: 104 },
  { id: 5, name: "মোছাঃ হেনা ", number: 105 },
  { id: 6, name: "মোছাঃ আদিবা ", number: 106 },
  { id: 7, name: "মোছাঃ রাশিদা খাতুন",  number: 107 },
  { id: 8, name: "মোছাঃ  রিফা", number: 108 },
  
];

const KEY = "lottery-wheel-v2";
const COLORS = ["#b3121f", "#0e7490", "#1c1917", "#c2410c", "#0f766e", "#7f1d1d"];
const TAU = Math.PI * 2;
const FONT = '"Hind Siliguri", "Noto Sans Bengali", sans-serif';
const bn = (n: number) => n.toLocaleString("bn-BD");

const toDataUrl = (file: File): Promise<string> =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = 200, c = document.createElement("canvas"); c.width = c.height = s;
        const m = Math.min(im.width, im.height);
        c.getContext("2d")!.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, s, s);
        res(c.toDataURL("image/jpeg", 0.8));
      };
      im.src = r.result as string;
    };
    r.readAsDataURL(file);
  });

function drawFace(canvas: HTMLCanvasElement, list: Entry[], imgs: Map<number, HTMLImageElement>) {
  const S = canvas.width, c = S / 2, R = c - 6;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);
  if (!list.length) {
    ctx.fillStyle = "#3a1a12"; ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
    ctx.fillStyle = "#f5c542"; ctx.textAlign = "center"; ctx.font = `700 46px ${FONT}`;
    ctx.fillText("নাম যোগ করুন", c, c + 90);
    return;
  }
  const n = list.length, seg = TAU / n;
  list.forEach((e, i) => {
    const a0 = i * seg - Math.PI / 2;
    const g = ctx.createRadialGradient(c, c, R * 0.2, c, c, R);
    g.addColorStop(0, "#000000aa"); g.addColorStop(0.35, COLORS[i % COLORS.length]); g.addColorStop(1, COLORS[i % COLORS.length]);
    ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0, a0 + seg); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "#f5c542"; ctx.lineWidth = 4; ctx.stroke();

    ctx.save(); ctx.translate(c, c); ctx.rotate(a0 + seg / 2);
    let nameX = R - 30;
    const im = imgs.get(e.id);
    if (im) {
      const ar = Math.max(14, Math.min(44, seg * R * 0.2)), cx = R - 26 - ar;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, 0, ar, 0, TAU); ctx.clip();
      ctx.drawImage(im, cx - ar, -ar, ar * 2, ar * 2); ctx.restore();
      ctx.strokeStyle = "#f5c542"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, 0, ar, 0, TAU); ctx.stroke();
      nameX = cx - ar - 12;
    }
    const fs = Math.max(20, Math.min(50, seg * R * 0.34));
    ctx.font = `700 ${fs}px ${FONT}`; ctx.textBaseline = "middle";
    const numX = R * 0.34, numTxt = String(e.number);
    ctx.textAlign = "left"; ctx.fillStyle = "#ffd966"; ctx.fillText(numTxt, numX, 0);
    const maxW = nameX - (numX + ctx.measureText(numTxt).width + 18);
    let t = e.name;
    while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1);
    if (t !== e.name) t += "…";
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.fillText(t, nameX, 0);
    ctx.restore();
  });
}

export default function Page() {
  const mount = useRef<HTMLDivElement>(null);
  const T = useRef<any>({ mouse: { x: 0, y: 0 } });
  const imgsRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const [entries, setEntries] = useState<Entry[]>(defaults);
  const [history, setHistory] = useState<Win[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [winner, setWinner] = useState<Win | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [photo, setPhoto0] = useState("");
  const [prize, setPrize] = useState("");
  const [muted, setMuted] = useState(false);
  const entriesRef = useRef(entries); entriesRef.current = entries;
  const historyRef = useRef(history); historyRef.current = history;
  const prizeRef = useRef(prize); prizeRef.current = prize;
  const mutedRef = useRef(false); mutedRef.current = muted;
  const audioRef = useRef<AudioContext | null>(null);
  const doneRef = useRef<((w: number) => void) | null>(null);

  const beep = (f: number, d = 0.06, type: OscillatorType = "square", v = 0.04) => {
    if (mutedRef.current) return;
    try {
      const A = audioRef.current || (audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)());
      if (A.state === "suspended") A.resume();
      const o = A.createOscillator(), g = A.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = v;
      o.connect(g); g.connect(A.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + d); o.stop(A.currentTime + d);
    } catch {}
  };
  const beepRef = useRef(beep); beepRef.current = beep;
  const speak = (text: string) => {
    if (mutedRef.current || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD"; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("bn"));
    if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  };
  const speakRef = useRef(speak); speakRef.current = speak;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.entries)) setEntries(d.entries);
        if (Array.isArray(d.history)) setHistory(d.history);
        if (typeof d.muted === "boolean") setMuted(d.muted);
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ entries, history, muted })); } catch {}
  }, [entries, history, muted, loaded]);

  const redraw = () => {
    const t = T.current; if (!t.canvas) return;
    drawFace(t.canvas, entriesRef.current, imgsRef.current); t.tex.needsUpdate = true;
    t.buildPins(entriesRef.current.length);
  };

  // ---- 3D দৃশ্য ----
  useEffect(() => {
    const el = mount.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, -0.35, 8.8); camera.lookAt(0, -0.35, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfff0c0, 2.4); key.position.set(3, 5, 7); scene.add(key);
    const orbit = new THREE.PointLight(0xff9a3c, 40, 20); scene.add(orbit);

    const gold = new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 1, roughness: 0.22 });
    const darkGold = new THREE.MeshStandardMaterial({ color: 0x7a5200, metalness: 0.9, roughness: 0.4 });
    const tilt = new THREE.Group(); scene.add(tilt);

    const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.35, 64), darkGold);
    drum.rotation.x = Math.PI / 2; drum.position.z = -0.18; tilt.add(drum);
    tilt.add(new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.19, 32, 140), gold));
    const inner = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.05, 16, 140), gold); inner.position.z = 0.03; tilt.add(inner);

    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const face = new THREE.Mesh(new THREE.CircleGeometry(2, 128), new THREE.MeshPhysicalMaterial({
      map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.55,
      roughness: 0.45, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true,
    }));
    face.position.z = 0.02; tilt.add(face);

    // সেগমেন্টের পিন (চাকার সাথে ঘোরে)
    const pins = new THREE.Group(); face.add(pins);
    const pinGeo = new THREE.SphereGeometry(0.055, 16, 16);
    let pinN = -1;
    const buildPins = (n: number) => {
      if (n === pinN) return; pinN = n;
      pins.clear();
      for (let j = 0; j < n; j++) {
        const a = Math.PI / 2 - (j * TAU) / n;
        const m = new THREE.Mesh(pinGeo, gold); m.position.set(Math.cos(a) * 1.99, Math.sin(a) * 1.99, 0.06); pins.add(m);
      }
    };

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.34, 48), gold);
    hub.rotation.x = Math.PI / 2; hub.position.z = 0.17; tilt.add(hub);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), gold); knob.position.z = 0.34; tilt.add(knob);

    const bulbs: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * TAU;
      const m = new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffc233, emissiveIntensity: 1 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), m);
      b.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0.19); tilt.add(b); bulbs.push(m);
    }

    const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.65, 24),
      new THREE.MeshStandardMaterial({ color: 0xd11a2a, metalness: 0.5, roughness: 0.25 }));
    pointer.rotation.z = Math.PI; pointer.position.set(0, 2.4, 0.34); tilt.add(pointer);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), gold); cap.position.set(0, 2.78, 0.34); tilt.add(cap);

    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.9, 32), gold); stand.position.y = -2.5; tilt.add(stand);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.3, 0.3, 64), gold); base.position.y = -3.0; tilt.add(base);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -3.16, 0); tilt.add(shadow);

    const N = 180, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 11; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = -2.5 + Math.random() * 4; }
    const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)),
      new THREE.PointsMaterial({ color: 0xffd56a, size: 0.05, transparent: true, opacity: 0.8 }));
    scene.add(dust);

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    Object.assign(T.current, { face, tex, canvas, spin: null, buildPins });
    redraw();
    document.fonts?.ready.then(redraw);

    let raf = 0, kick = 0;
    const loop = (now: number) => {
      const s = T.current.spin, t = now / 1000, m = T.current.mouse;
      if (s) {
        const k = Math.min(1, (now - s.start) / s.dur);
        face.rotation.z = s.from + (s.to - s.from) * (1 - Math.pow(1 - k, 4));
        const n = entriesRef.current.length;
        if (n) {
          const idx = Math.floor((((face.rotation.z % TAU) + TAU) % TAU) / (TAU / n));
          if (idx !== s.last) { s.last = idx; kick = 0.45; beepRef.current(900, 0.03, "square", 0.02); }
        }
        if (k >= 1) { T.current.spin = null; doneRef.current?.(s.w); }
      }
      kick *= 0.88; pointer.rotation.z = Math.PI + kick;
      bulbs.forEach((b, i) => { b.emissiveIntensity = 0.4 + 0.9 * Math.sin(t * (s ? 9 : 3) - i * 0.5) ** 2; });
      tilt.rotation.y += (m.x * 0.45 + Math.sin(t * 0.6) * 0.08 - tilt.rotation.y) * 0.06;
      tilt.rotation.x += (-m.y * 0.25 + Math.sin(t * 0.4) * 0.03 - tilt.rotation.x) * 0.06;
      orbit.position.set(Math.cos(t * 0.8) * 5, Math.sin(t * 0.6) * 3, 4);
      dust.rotation.y = t * 0.03; dust.position.y = Math.sin(t * 0.5) * 0.15;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse((o: any) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      tex.dispose(); pmrem.dispose(); renderer.dispose(); el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    entries.forEach((e) => {
      if (e.img && !imgsRef.current.has(e.id)) {
        const im = new Image(); im.onload = () => { imgsRef.current.set(e.id, im); redraw(); }; im.src = e.img;
      }
    });
    redraw();
  }, [entries]);

  doneRef.current = (w: number) => {
    const picked = entriesRef.current[w];
    setSpinning(false);
    if (!picked) return;
    const rank = historyRef.current.length + 1;
    const title = prizeRef.current.trim() || `${bn(rank)} নম্বর পুরস্কার`;
    const win: Win = { ...picked, title, at: new Date().toLocaleString("bn-BD") };
    setWinner(win);
    setHistory((h) => [win, ...h].slice(0, 100));
    setEntries((es) => es.filter((x) => x.id !== picked.id)); // বিজয়ী মুছে যাবে
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beepRef.current(f, 0.25, "triangle", 0.08), i * 140));
    setTimeout(() => speakRef.current(`অভিনন্দন! ${title}। বিজয়ী ${picked.name}, নম্বর ${picked.number}`), 800);
  };

  const spin = () => {
    const list = entriesRef.current;
    if (list.length < 1 || T.current.spin) return;
    const seg = TAU / list.length, w = Math.floor(Math.random() * list.length);
    const target = (w + 0.5) * seg + (Math.random() - 0.5) * seg * 0.7;
    const cur = T.current.face.rotation.z;
    const delta = (((target - cur) % TAU) + TAU) % TAU;
    T.current.spin = { from: cur, to: cur + TAU * (6 + Math.floor(Math.random() * 3)) + delta, start: performance.now(), dur: 6500, w };
    setWinner(null); setSpinning(true); beepRef.current(300, 0.03);
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const nm = name.trim(); if (!nm) return;
    const all = [...entries, ...history];
    const next = num !== "" ? Number(num) : Math.max(100, ...all.map((x) => Number(x.number) || 0)) + 1;
    setEntries([...entries, { id: Date.now(), name: nm, number: next, img: photo || undefined }]);
    setName(""); setNum(""); setPhoto0("");
  };
  const pickNew = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0], inp = ev.target; if (!f) return;
    setPhoto0(await toDataUrl(f)); inp.value = "";
  };
  const changePhoto = async (id: number, ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0], inp = ev.target; if (!f) return;
    const u = await toDataUrl(f); inp.value = "";
    imgsRef.current.delete(id);
    setEntries((es) => es.map((x) => (x.id === id ? { ...x, img: u } : x)));
  };
  const importJson = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    f.text().then((t) => {
      try {
        const a = JSON.parse(t); if (!Array.isArray(a)) throw 0;
        imgsRef.current.clear();
        setEntries(a.filter((x: any) => x && x.name).map((x: any, i: number) => ({ id: Date.now() + i, name: String(x.name), number: x.number ?? i + 1, img: x.img })));
      } catch { alert('সঠিক JSON ফাইল দিন: [{"name":"নাম","number":1}]'); }
    });
    ev.target.value = "";
  };
  const exportJson = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" }));
    a.download = "entries.json"; a.click();
  };
  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    T.current.mouse = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 };
  };

  const confetti = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    left: (i * 37) % 100, delay: ((i * 13) % 20) / 10, dur: 2.5 + ((i * 7) % 20) / 10,
    color: ["#f5c542", "#ff4d5a", "#4dd0e1", "#fff", "#ff9a3c"][i % 5], rot: (i * 53) % 360,
  })), []);

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Tiro+Bangla&display=swap" rel="stylesheet" />
      <main className="wrap">
        <section className="left">
          <header>
            <h1>লাকি লটারি হুইল</h1>
            <p className="sub">চাকা ঘুরান — ভাগ্য আপনার সাথে</p>
          </header>
          <div className="stage" ref={mount} onPointerMove={onMove} onPointerLeave={() => (T.current.mouse = { x: 0, y: 0 })} aria-label="3D lottery wheel" />
          <input className="prize" value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="🎁 এই ঘোরার পুরস্কার (যেমন: প্রথম পুরস্কার – টিভি)" aria-label="পুরস্কারের নাম" />
          <button className="spin" onClick={spin} disabled={spinning || entries.length < 1}>
            {spinning ? "ঘুরছে…" : entries.length < 1 ? "কোনো নাম নেই" : "চাকা ঘুরান"}
          </button>
        </section>

        <section className="right">
          <div className="panel">
            <h2>নতুন অংশগ্রহণকারী</h2>
            <form className="add" onSubmit={add}>
              <label className="avatar add-av" title="ছবি যোগ করুন">
                {photo ? <img src={photo} alt="" /> : <span>📷</span>}
                <input type="file" accept="image/*" onChange={pickNew} hidden />
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" aria-label="নাম" />
              <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="নম্বর" type="number" aria-label="নম্বর" />
              <button className="btn gold" type="submit">যোগ</button>
            </form>
          </div>

          <div className="panel">
            <h2>অংশগ্রহণকারী ({entries.length})</h2>
            <ul className="list">
              {entries.length === 0 && <li className="empty">কোনো নাম নেই। উপরে নাম, নম্বর ও ছবি দিয়ে যোগ করুন।</li>}
              {entries.map((e) => (
                <li key={e.id}>
                  <label className="avatar" title="ছবি বদলান">
                    {e.img ? <img src={e.img} alt="" /> : <span>📷</span>}
                    <input type="file" accept="image/*" onChange={(ev) => changePhoto(e.id, ev)} hidden />
                  </label>
                  <span className="no">{e.number}</span>
                  <span className="nm">{e.name}</span>
                  <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} aria-label={`${e.name} মুছুন`}>✕</button>
                </li>
              ))}
            </ul>
            <div className="row">
              <label className="chk"><input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} /> শব্দ ও ঘোষণা বন্ধ</label>
            </div>
            <div className="row">
              <label className="btn">JSON আপলোড<input type="file" accept="application/json" onChange={importJson} hidden /></label>
              <button className="btn" onClick={exportJson}>JSON ডাউনলোড</button>
              <button className="btn danger" onClick={() => { imgsRef.current.clear(); setEntries(defaults); }}>ডিফল্ট</button>
              <button className="btn danger" onClick={() => setEntries([])}>সব মুছুন</button>
            </div>
          </div>

          <div className="panel">
            <h2>🏆 বিজয়ীদের তালিকা ({history.length})</h2>
            <ul className="list">
              {history.length === 0 && <li className="empty">এখনো কেউ জেতেনি।</li>}
              {history.map((h, i) => (
                <li key={i}>
                  <span className="avatar">{h.img ? <img src={h.img} alt="" /> : <span>🏆</span>}</span>
                  <span className="no">{h.number}</span>
                  <span className="nm">{h.name}<small>{h.title}</small></span>
                </li>
              ))}
            </ul>
            {history.length > 0 && <div className="row"><button className="btn danger" onClick={() => setHistory([])}>তালিকা মুছুন</button></div>}
          </div>
        </section>

        {winner && (
          <div className="modal" onClick={() => setWinner(null)}>
            <div className="rays" />
            {confetti.map((c, i) => (
              <i key={i} className="conf" style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, transform: `rotate(${c.rot}deg)` }} />
            ))}
            <div className="win" onClick={(e) => e.stopPropagation()}>
              <div className="crown">👑</div>
              <div className="ribbon">{winner.title}</div>
              <div className="frame">{winner.img ? <img src={winner.img} alt={winner.name} /> : <span>🏆</span>}</div>
              <p className="congrats">অভিনন্দন!</p>
              <div className="who">{winner.name}</div>
              <div className="big">নম্বর {winner.number}</div>
              <div className="row center">
                <button className="btn" onClick={() => speak(`অভিনন্দন! ${winner.title}। বিজয়ী ${winner.name}, নম্বর ${winner.number}`)}>🔊 আবার শুনুন</button>
                <button className="btn gold" onClick={() => setWinner(null)}>পরের জন</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

const CSS = `
:root { --gold:#f5c542; --gold2:#b8860b; }
* { box-sizing: border-box; margin: 0; }
body { font-family: "Hind Siliguri", system-ui, sans-serif; color: #fff3d6; min-height: 100vh;
  background: radial-gradient(ellipse at 50% -10%, #7a2314 0%, #2a0b0c 50%, #0b0405 100%) fixed; }
.wrap { max-width: 1200px; margin: 0 auto; padding: 16px; display: grid; gap: 22px; }
@media (min-width: 980px) { .wrap { grid-template-columns: 1.15fr 1fr; align-items: start; padding: 28px 24px; } .left { position: sticky; top: 16px; } }
header { text-align: center; }
h1 { font-family: "Tiro Bangla", serif; font-weight: 400; font-size: clamp(30px, 6vw, 52px); line-height: 1.2;
  background: linear-gradient(180deg, #fff6c9, #f5c542 50%, #b8860b); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 3px 14px rgba(245,197,66,.35)); }
.sub { opacity: .75; margin-top: 2px; }
.stage { width: 100%; max-width: 680px; aspect-ratio: 1; margin: 6px auto 0; position: relative; touch-action: pan-y; }
.stage::before { content: ""; position: absolute; inset: 8%; border-radius: 50%; background: radial-gradient(circle, rgba(255,170,60,.35), transparent 70%); filter: blur(24px); }
.stage canvas { position: relative; display: block; width: 100%; height: 100%; }
.prize { width: 100%; max-width: 680px; display: block; margin: 8px auto 0; text-align: center; }
.spin { width: 100%; max-width: 680px; display: block; margin: 12px auto 0; padding: 16px; font: 700 22px "Hind Siliguri", sans-serif; color: #3a1b00;
  border: 0; border-radius: 999px; cursor: pointer; background: linear-gradient(#fff0a8, #f0b81f 55%, #c98a0a);
  box-shadow: 0 6px 0 #7a4f00, 0 14px 30px rgba(245,170,40,.35); animation: glow 2.4s ease-in-out infinite; }
.spin:active { transform: translateY(3px); box-shadow: 0 3px 0 #7a4f00; }
.spin:disabled { opacity: .55; cursor: not-allowed; animation: none; }
@keyframes glow { 50% { box-shadow: 0 6px 0 #7a4f00, 0 14px 44px rgba(255,200,60,.65); } }
.panel { background: rgba(45,16,18,.7); backdrop-filter: blur(10px); border: 1px solid rgba(245,197,66,.3); border-radius: 18px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.panel + .panel { margin-top: 16px; }
.panel h2 { font-family: "Tiro Bangla", serif; font-weight: 400; font-size: 22px; color: var(--gold); margin-bottom: 10px; }
.add { display: grid; grid-template-columns: 48px 1fr 88px auto; gap: 8px; align-items: center; }
input:not([type=checkbox]):not([type=file]) { min-width: 0; padding: 11px 12px; border-radius: 12px; border: 1px solid #7a4630; background: rgba(10,4,5,.7); color: #fff; font: 16px "Hind Siliguri", sans-serif; }
input:focus-visible, button:focus-visible, label:focus-within { outline: 2px solid var(--gold); outline-offset: 2px; }
.btn { padding: 10px 14px; border-radius: 12px; border: 1px solid var(--gold2); background: rgba(70,28,18,.8); color: var(--gold); font: 600 15px "Hind Siliguri", sans-serif; cursor: pointer; }
.btn.gold { background: linear-gradient(#ffe38a, #d9a21b); color: #3a1b00; border: 0; }
.btn.danger { color: #ff9b9b; border-color: #8a2b2b; }
.avatar { width: 44px; height: 44px; flex: none; border-radius: 50%; overflow: hidden; display: grid; place-items: center; cursor: pointer; background: #14090a; border: 2px solid var(--gold); }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.add-av { width: 48px; height: 48px; border-style: dashed; }
.list { list-style: none; padding: 0; max-height: 300px; overflow: auto; display: grid; gap: 6px; }
.list li { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 12px; background: rgba(10,4,5,.6); }
.list .no { min-width: 52px; text-align: center; padding: 2px 8px; border-radius: 8px; background: linear-gradient(#ffe38a, #d9a21b); color: #3a1b00; font-weight: 700; }
.list .nm { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: grid; }
.list small { opacity: .65; font-size: 12px; }
.list button { background: none; border: 0; color: #ff9b9b; font-size: 18px; cursor: pointer; }
.row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.row.center { justify-content: center; }
.chk { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.chk input { width: 18px; height: 18px; accent-color: var(--gold); }
.empty { opacity: .6; }
.modal { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; background: rgba(8,2,3,.82); padding: 16px; overflow: hidden; }
.rays { position: absolute; width: 160vmax; height: 160vmax; background: repeating-conic-gradient(from 0deg, rgba(245,197,66,.16) 0 10deg, transparent 10deg 20deg);
  -webkit-mask: radial-gradient(circle, #000 0, transparent 60%); mask: radial-gradient(circle, #000 0, transparent 60%); animation: spinr 24s linear infinite; }
.conf { position: absolute; top: -20px; width: 10px; height: 16px; border-radius: 2px; animation: fall linear infinite; }
@keyframes fall { to { top: 110%; margin-left: 40px; } }
@keyframes spinr { to { transform: rotate(360deg); } }
.win { position: relative; text-align: center; width: min(92vw, 440px); padding: 54px 24px 26px; border-radius: 24px; border: 2px solid var(--gold);
  background: linear-gradient(#5a1d12, #1d0a0a); box-shadow: 0 0 80px rgba(245,197,66,.5), inset 0 0 30px rgba(245,197,66,.15); animation: pop .55s cubic-bezier(.2,1.4,.4,1); }
.crown { position: absolute; top: -34px; left: 50%; transform: translateX(-50%); font-size: 54px; filter: drop-shadow(0 4px 8px #000); }
.ribbon { display: inline-block; margin: 6px 0 16px; padding: 8px 26px; font-family: "Tiro Bangla", serif; font-size: clamp(18px, 5vw, 24px); color: #3a1b00;
  background: linear-gradient(#ffe38a, #d9a21b); clip-path: polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%); }
.frame { width: 150px; height: 150px; margin: 0 auto; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 76px;
  border: 5px solid var(--gold); background: #14090a; box-shadow: 0 0 0 6px rgba(245,197,66,.25), 0 0 40px rgba(245,197,66,.6); }
.frame img { width: 100%; height: 100%; object-fit: cover; }
.congrats { margin-top: 14px; opacity: .85; }
.who { font-family: "Tiro Bangla", serif; font-size: clamp(28px, 8vw, 40px); color: #fff; margin: 2px 0; }
.big { font-size: clamp(22px, 6vw, 30px); font-weight: 700; color: var(--gold); margin-bottom: 8px; }
@keyframes pop { from { transform: scale(.5) rotate(-4deg); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .win, .rays, .conf, .spin { animation: none; } }
`;


// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as THREE from "three";

// type Entry = { id: number; name: string; number: number | string };

// const defaults: Entry[] = [
//  { "id": 1, "name": "মো:রাশিদুল্ ইসলাম", "number": 101 },
//   { "id": 2, "name": "মোঃ ইব্রাহিম খান", "number": 102 },
//   { "id": 3, "name": "মোছাঃ রিফা (মাহবুবা) ", "number": 103 },
//   { "id": 4, "name": " মোাছাঃ আতিয়া (লিজা)", "number": 104 },
//   { "id": 5, "name": "মোছাঃ রাফিয়া ", "number": 105 },
//   { "id": 6, "name": "মোছাঃ হেনা ", "number": 106 },
//   { "id": 7, "name": "মোছাঃ আদিবা ", "number": 107 },
//   { "id": 8, "name": "মোছাঃ রাশিদা খাতুন", "number": 108 }
// ];

// const CSS = `:root { --gold:#f5c542; --gold2:#b8860b; --panel:#241012; }
// * { box-sizing: border-box; margin: 0; }
// html, body { min-height: 100%; }
// body {
//   font-family: "Hind Siliguri", system-ui, sans-serif; color: #fff3d6;
//   background: radial-gradient(circle at 30% 10%, #5a1a10 0%, #1d0a0a 55%, #0b0405 100%) fixed;
// }
// .wrap { max-width: 1180px; margin: 0 auto; padding: 16px; display: grid; gap: 20px; }
// @media (min-width: 960px) { .wrap { grid-template-columns: 1.15fr 1fr; align-items: start; padding: 32px 24px; } }
// h1 { font-size: clamp(26px, 5vw, 40px); color: var(--gold); text-shadow: 0 2px 18px rgba(245,197,66,.4); }
// .sub { opacity: .75; margin-top: 4px; }
// .stage { width: 100%; max-width: 640px; aspect-ratio: 1; margin: 8px auto 0; position: relative; }
// .stage canvas { display: block; width: 100%; height: 100%; }
// .spin {
//   width: 100%; max-width: 640px; display: block; margin: 12px auto 0; padding: 14px;
//   font-family: inherit; font-weight: 700; font-size: 20px; color: #3a1b00; border: 0; border-radius: 999px; cursor: pointer;
//   background: linear-gradient(#ffe38a, #d9a21b); box-shadow: 0 6px 0 #8a5d00, 0 12px 24px rgba(0,0,0,.4);
// }
// .spin:active { transform: translateY(3px); box-shadow: 0 3px 0 #8a5d00; }
// .spin:disabled { opacity: .5; cursor: not-allowed; }
// .panel { background: var(--panel); border: 1px solid rgba(245,197,66,.35); border-radius: 16px; padding: 16px; }
// .panel h2 { font-size: 20px; color: var(--gold); margin-bottom: 10px; }
// .panel + .panel { margin-top: 16px; }
// .add { display: grid; grid-template-columns: 1fr 90px auto; gap: 8px; }
// input {
//   min-width: 0; padding: 10px 12px; border-radius: 10px; border: 1px solid #6b3a2a; background: #14090a;
//   color: #fff; font-family: inherit; font-size: 16px;
// }
// input:focus-visible, button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
// .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid var(--gold2); background: #3a1a12; color: var(--gold); font-family: inherit; font-weight: 600; cursor: pointer; }
// .btn.danger { color: #ff9b9b; border-color: #8a2b2b; }
// .list { list-style: none; padding: 0; margin-top: 12px; max-height: 280px; overflow: auto; display: grid; gap: 6px; }
// .list li { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: #14090a; }
// .list .no { min-width: 52px; text-align: center; padding: 2px 8px; border-radius: 8px; background: var(--gold); color: #3a1b00; font-weight: 700; }
// .list .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
// .list button { background: none; border: 0; color: #ff9b9b; font-size: 18px; cursor: pointer; }
// .list small { opacity: .6; font-size: 11px; }
// .row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
// .empty { opacity: .6; }
// .modal { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; background: rgba(0,0,0,.7); padding: 16px; }
// .win { text-align: center; background: linear-gradient(#4a1a10, #1d0a0a); border: 2px solid var(--gold); border-radius: 20px; padding: 28px 24px; width: min(92vw, 420px); box-shadow: 0 0 60px rgba(245,197,66,.45); animation: pop .45s cubic-bezier(.2,1.4,.4,1); }
// .win .big { font-size: clamp(44px, 14vw, 72px); font-weight: 700; color: var(--gold); line-height: 1.1; }
// .win .who { font-size: clamp(24px, 7vw, 34px); margin: 6px 0 18px; }
// @keyframes pop { from { transform: scale(.6); opacity: 0; } }
// @media (prefers-reduced-motion: reduce) { .win { animation: none; } }

// .chk { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 15px; }
// .chk input { width: 18px; height: 18px; accent-color: var(--gold); }
// `;

// const KEY = "lottery-wheel-v1";
// const COLORS = ["#b3121f", "#0e7490", "#1c1917", "#c2410c", "#0f766e", "#7f1d1d"];
// const TAU = Math.PI * 2;
// const FONT = '"Hind Siliguri", "Noto Sans Bengali", sans-serif';

// function drawFace(canvas: HTMLCanvasElement, list: Entry[]) {
//   const S = canvas.width, c = S / 2, R = c - 6;
//   const ctx = canvas.getContext("2d")!;
//   ctx.clearRect(0, 0, S, S);
//   if (!list.length) {
//     ctx.fillStyle = "#3a1a12"; ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
//     ctx.fillStyle = "#f5c542"; ctx.textAlign = "center"; ctx.font = `700 44px ${FONT}`;
//     ctx.fillText("নাম যোগ করুন", c, c + 80);
//     return;
//   }
//   const n = list.length, seg = TAU / n;
//   list.forEach((e, i) => {
//     const a0 = i * seg - Math.PI / 2;
//     ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0, a0 + seg); ctx.closePath();
//     ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
//     ctx.strokeStyle = "#f5c542"; ctx.lineWidth = 4; ctx.stroke();

//     ctx.save(); ctx.translate(c, c); ctx.rotate(a0 + seg / 2);
//     const fs = Math.max(20, Math.min(50, seg * R * 0.34));
//     ctx.font = `700 ${fs}px ${FONT}`; ctx.textBaseline = "middle";
//     const numX = R * 0.34, numTxt = String(e.number);
//     ctx.textAlign = "left"; ctx.fillStyle = "#ffd966"; ctx.fillText(numTxt, numX, 0);
//     const maxW = R - 30 - (numX + ctx.measureText(numTxt).width + 18);
//     let t = e.name;
//     while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1);
//     if (t !== e.name) t += "…";
//     ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.fillText(t, R - 30, 0);
//     ctx.restore();
//   });
// }

// export default function Page() {
//   const mount = useRef<HTMLDivElement>(null);
//   const T = useRef<any>({});
//   const [entries, setEntries] = useState<Entry[]>(defaults);
//   const [history, setHistory] = useState<any[]>([]);
//   const [loaded, setLoaded] = useState(false);
//   const [winner, setWinner] = useState<Entry | null>(null);
//   const [spinning, setSpinning] = useState(false);
//   const [name, setName] = useState("");
//   const [num, setNum] = useState("");
//   const [removeWinner, setRemoveWinner] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const audioRef = useRef<AudioContext | null>(null);
//   const mutedRef = useRef(false); mutedRef.current = muted;
//   const beep = (f: number, d = 0.06, type: OscillatorType = "square", v = 0.04) => {
//     if (mutedRef.current) return;
//     try {
//       const A = audioRef.current || (audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)());
//       if (A.state === "suspended") A.resume();
//       const o = A.createOscillator(), g = A.createGain();
//       o.type = type; o.frequency.value = f; g.gain.value = v;
//       o.connect(g); g.connect(A.destination); o.start();
//       g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + d); o.stop(A.currentTime + d);
//     } catch {}
//   };
//   const beepRef = useRef(beep); beepRef.current = beep;
//   const entriesRef = useRef(entries); entriesRef.current = entries;
//   const doneRef = useRef<((w: number) => void) | null>(null);

//   // localStorage load / save
//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(KEY);
//       if (raw) {
//         const d = JSON.parse(raw);
//         if (Array.isArray(d.entries)) setEntries(d.entries);
//         if (Array.isArray(d.history)) setHistory(d.history);
//         if (typeof d.removeWinner === "boolean") setRemoveWinner(d.removeWinner);
//         if (typeof d.muted === "boolean") setMuted(d.muted);
//       }
//     } catch {}
//     setLoaded(true);
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(KEY, JSON.stringify({ entries, history, removeWinner, muted })); } catch {}
//   }, [entries, history, removeWinner, muted, loaded]);

//   // three.js scene (once)
//   useEffect(() => {
//     const el = mount.current!;
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     el.appendChild(renderer.domElement);
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
//     camera.position.set(0, -0.35, 8.8); camera.lookAt(0, -0.35, 0);

//     scene.add(new THREE.AmbientLight(0xffffff, 0.9));
//     const d = new THREE.DirectionalLight(0xfff0c0, 2.2); d.position.set(3, 5, 7); scene.add(d);
//     const p = new THREE.PointLight(0xff9a3c, 30, 20); p.position.set(-4, -2, 5); scene.add(p);

//     const gold = new THREE.MeshStandardMaterial({ color: 0xe0a82a, metalness: 0.75, roughness: 0.3 });
//     const tilt = new THREE.Group(); scene.add(tilt);

//     tilt.add(new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.17, 24, 120), gold));
//     const rim2 = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.05, 12, 120), gold); rim2.position.z = 0.03; tilt.add(rim2);

//     const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
//     const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
//     const face = new THREE.Mesh(new THREE.CircleGeometry(2, 128), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
//     face.position.z = 0.02; tilt.add(face);

//     const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.3, 48), gold);
//     hub.rotation.x = Math.PI / 2; hub.position.z = 0.15; tilt.add(hub);
//     const knob = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), gold); knob.position.z = 0.3; tilt.add(knob);

//     const bulbs: THREE.MeshStandardMaterial[] = [];
//     for (let i = 0; i < 28; i++) {
//       const a = (i / 28) * TAU;
//       const m = new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffc233, emissiveIntensity: 1 });
//       const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), m);
//       b.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0.17); tilt.add(b); bulbs.push(m);
//     }

//     const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.6, 24),
//       new THREE.MeshStandardMaterial({ color: 0xd11a2a, metalness: 0.4, roughness: 0.3 }));
//     pointer.rotation.z = Math.PI; pointer.position.set(0, 2.38, 0.32); tilt.add(pointer);
//     const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), gold); cap.position.set(0, 2.72, 0.32); tilt.add(cap);

//     const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.9, 32), gold); stand.position.y = -2.5; tilt.add(stand);
//     const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 0.28, 48), gold); base.position.y = -3.0; tilt.add(base);

//     const resize = () => {
//       const w = el.clientWidth, h = el.clientHeight;
//       if (!w || !h) return;
//       renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
//     };
//     const ro = new ResizeObserver(resize); ro.observe(el); resize();

//     T.current = { face, tex, canvas, spin: null };
//     drawFace(canvas, entriesRef.current); tex.needsUpdate = true;
//     document.fonts?.ready.then(() => { drawFace(canvas, entriesRef.current); tex.needsUpdate = true; });

//     let raf = 0;
//     const loop = (now: number) => {
//       const s = T.current.spin, t = now / 1000;
//       if (s) {
//         const k = Math.min(1, (now - s.start) / s.dur);
//         face.rotation.z = s.from + (s.to - s.from) * (1 - Math.pow(1 - k, 4));
//         const n = entriesRef.current.length;
//         if (n) {
//           const idx = Math.floor((((face.rotation.z % TAU) + TAU) % TAU) / (TAU / n));
//           if (idx !== s.last) { s.last = idx; beepRef.current(900, 0.03, "square", 0.02); }
//         }
//         if (k >= 1) { T.current.spin = null; doneRef.current?.(s.w); }
//       }
//       bulbs.forEach((m, i) => { m.emissiveIntensity = 0.4 + 0.8 * Math.sin(t * (s ? 9 : 3) - i * 0.6) ** 2; });
//       tilt.rotation.y = Math.sin(t * 0.6) * 0.1; tilt.rotation.x = Math.sin(t * 0.4) * 0.04;
//       renderer.render(scene, camera);
//       raf = requestAnimationFrame(loop);
//     };
//     raf = requestAnimationFrame(loop);

//     return () => {
//       cancelAnimationFrame(raf); ro.disconnect();
//       scene.traverse((o: any) => { o.geometry?.dispose(); o.material?.dispose?.(); });
//       tex.dispose(); renderer.dispose(); el.removeChild(renderer.domElement);
//     };
//   }, []);

//   // redraw wheel when data changes
//   useEffect(() => {
//     const { canvas, tex } = T.current;
//     if (!canvas) return;
//     drawFace(canvas, entries); tex.needsUpdate = true;
//   }, [entries]);

//   doneRef.current = (w: number) => {
//     const win = entriesRef.current[w];
//     if (!win) return setSpinning(false);
//     setSpinning(false); setWinner(win);
//     [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beepRef.current(f, 0.25, "triangle", 0.08), i * 140));
//     setHistory((h) => [{ ...win, at: new Date().toLocaleString("bn-BD") }, ...h].slice(0, 30));
//   };

//   const spin = () => {
//     const list = entriesRef.current;
//     if (list.length < 2 || T.current.spin) return;
//     const seg = TAU / list.length, w = Math.floor(Math.random() * list.length);
//     const target = (w + 0.5) * seg + (Math.random() - 0.5) * seg * 0.7;
//     const cur = T.current.face.rotation.z;
//     const delta = (((target - cur) % TAU) + TAU) % TAU;
//     T.current.spin = { from: cur, to: cur + TAU * (6 + Math.floor(Math.random() * 3)) + delta, start: performance.now(), dur: 6500, w };
//     setWinner(null); setSpinning(true); beepRef.current(300, 0.03);
//   };

//   const closeWinner = () => {
//     if (winner && removeWinner) setEntries((es) => es.filter((x) => x.id !== winner.id));
//     setWinner(null);
//   };
//   const importJson = (ev: React.ChangeEvent<HTMLInputElement>) => {
//     const f = ev.target.files?.[0]; if (!f) return;
//     f.text().then((t) => {
//       try {
//         const a = JSON.parse(t); if (!Array.isArray(a)) throw 0;
//         setEntries(a.filter((x: any) => x && x.name).map((x: any, i: number) => ({ id: Date.now() + i, name: String(x.name), number: x.number ?? i + 1 })));
//       } catch { alert('সঠিক JSON ফাইল দিন: [{"name":"নাম","number":1}]'); }
//     });
//     ev.target.value = "";
//   };
//   const add = (e: React.FormEvent) => {
//     e.preventDefault();
//     const nm = name.trim(); if (!nm) return;
//     const next = num !== "" ? Number(num) : Math.max(100, ...entries.map((x) => Number(x.number) || 0)) + 1;
//     setEntries([...entries, { id: Date.now(), name: nm, number: next }]);
//     setName(""); setNum("");
//   };
//   const exportJson = () => {
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" }));
//     a.download = "entries.json"; a.click();
//   };

//   return (
//     <>
//     <style>{CSS}</style>
//     <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />
//     <main className="wrap">
//       <section>
//         <h1>লটারি হুইল</h1>
//         <p className="sub">চাকা ঘুরান, ভাগ্য যাচাই করুন</p>
//         <div className="stage" ref={mount} aria-label="3D lottery wheel" />
//         <button className="spin" onClick={spin} disabled={spinning || entries.length < 2}>
//           {spinning ? "ঘুরছে…" : "চাকা ঘুরান"}
//         </button>
//       </section>

//       <section>
//         <div className="panel">
//           <h2>অংশগ্রহণকারী ({entries.length})</h2>
//           <form className="add" onSubmit={add}>
//             <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" aria-label="নাম" />
//             <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="নম্বর" type="number" aria-label="নম্বর" />
//             <button className="btn" type="submit">যোগ করুন</button>
//           </form>
//           <ul className="list">
//             {entries.length === 0 && <li className="empty">কোনো নাম নেই। উপরে নাম ও নম্বর দিয়ে যোগ করুন।</li>}
//             {entries.map((e) => (
//               <li key={e.id}>
//                 <span className="no">{e.number}</span>
//                 <span className="nm">{e.name}</span>
//                 <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} aria-label={`${e.name} মুছুন`}>✕</button>
//               </li>
//             ))}
//           </ul>
//           <div className="row">
//             <label className="chk"><input type="checkbox" checked={removeWinner} onChange={(e) => setRemoveWinner(e.target.checked)} /> জেতার পর তালিকা থেকে বাদ দিন</label>
//             <label className="chk"><input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} /> শব্দ বন্ধ</label>
//           </div>
//           <div className="row">
//             <label className="btn">JSON আপলোড<input type="file" accept="application/json" onChange={importJson} hidden /></label>
//             <button className="btn" onClick={exportJson}>JSON ডাউনলোড</button>
//             <button className="btn danger" onClick={() => setEntries(defaults)}>ডিফল্টে ফিরুন</button>
//             <button className="btn danger" onClick={() => setEntries([])}>সব মুছুন</button>
//           </div>
//         </div>

//         <div className="panel">
//           <h2>বিজয়ীর তালিকা</h2>
//           <ul className="list">
//             {history.length === 0 && <li className="empty">এখনো কেউ জেতেনি।</li>}
//             {history.map((h, i) => (
//               <li key={i}><span className="no">{h.number}</span><span className="nm">{h.name}</span><small>{h.at}</small></li>
//             ))}
//           </ul>
//           {history.length > 0 && <div className="row"><button className="btn danger" onClick={() => setHistory([])}>তালিকা মুছুন</button></div>}
//         </div>
//       </section>

//       {winner && (
//         <div className="modal" onClick={closeWinner}>
//           <div className="win" onClick={(e) => e.stopPropagation()}>
//             <p>বিজয়ী নম্বর</p>
//             <div className="big">{winner.number}</div>
//             <div className="who">{winner.name}</div>
//             <button className="btn" onClick={closeWinner}>ঠিক আছে</button>
//           </div>
//         </div>
//       )}
//     </main>
//     </>
//   );
// }


// // "use client";
// // import { useEffect, useRef, useState } from "react";
// // import "./global.css";
// // import * as THREE from "three";
// // // import defaults from "./value.json";

// // const KEY = "lottery-wheel-v1";
// // const COLORS = ["#b3121f", "#0e7490", "#1c1917", "#c2410c", "#0f766e", "#7f1d1d"];
// // const TAU = Math.PI * 2;
// // const FONT = '"Hind Siliguri", "Noto Sans Bengali", sans-serif';

// // function drawFace(canvas, list) {
// //   const S = canvas.width, c = S / 2, R = c - 6;
// //   const ctx = canvas.getContext("2d");
// //   ctx.clearRect(0, 0, S, S);
// //   if (!list.length) {
// //     ctx.fillStyle = "#3a1a12"; ctx.beginPath(); ctx.arc(c, c, R, 0, TAU); ctx.fill();
// //     ctx.fillStyle = "#f5c542"; ctx.textAlign = "center"; ctx.font = `700 44px ${FONT}`;
// //     ctx.fillText("নাম যোগ করুন", c, c + 80);
// //     return;
// //   }
// //   const n = list.length, seg = TAU / n;
// //   list.forEach((e, i) => {
// //     const a0 = i * seg - Math.PI / 2;
// //     ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0, a0 + seg); ctx.closePath();
// //     ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
// //     ctx.strokeStyle = "#f5c542"; ctx.lineWidth = 4; ctx.stroke();

// //     ctx.save(); ctx.translate(c, c); ctx.rotate(a0 + seg / 2);
// //     const fs = Math.max(20, Math.min(50, seg * R * 0.34));
// //     ctx.font = `700 ${fs}px ${FONT}`; ctx.textBaseline = "middle";
// //     const numX = R * 0.34, numTxt = String(e.number);
// //     ctx.textAlign = "left"; ctx.fillStyle = "#ffd966"; ctx.fillText(numTxt, numX, 0);
// //     const maxW = R - 30 - (numX + ctx.measureText(numTxt).width + 18);
// //     let t = e.name;
// //     while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1);
// //     if (t !== e.name) t += "…";
// //     ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.fillText(t, R - 30, 0);
// //     ctx.restore();
// //   });
// // }

// // export default function LotteryWheel() {
// //   const mount = useRef(null);
// //   const T = useRef({});
// //   const [entries, setEntries] = useState(defaults);
// //   const [history, setHistory] = useState([]);
// //   const [loaded, setLoaded] = useState(false);
// //   const [winner, setWinner] = useState(null);
// //   const [spinning, setSpinning] = useState(false);
// //   const [name, setName] = useState("");
// //   const [num, setNum] = useState("");
// //   const entriesRef = useRef(entries); entriesRef.current = entries;
// //   const doneRef = useRef(null);

// //   // localStorage load / save
// //   useEffect(() => {
// //     try {
// //       const raw = localStorage.getItem(KEY);
// //       if (raw) {
// //         const d = JSON.parse(raw);
// //         if (Array.isArray(d.entries)) setEntries(d.entries);
// //         if (Array.isArray(d.history)) setHistory(d.history);
// //       }
// //     } catch {}
// //     setLoaded(true);
// //   }, []);
// //   useEffect(() => {
// //     if (!loaded) return;
// //     try { localStorage.setItem(KEY, JSON.stringify({ entries, history })); } catch {}
// //   }, [entries, history, loaded]);

// //   // three.js scene (once)
// //   useEffect(() => {
// //     const el = mount.current;
// //     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
// //     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// //     el.appendChild(renderer.domElement);
// //     const scene = new THREE.Scene();
// //     const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
// //     camera.position.set(0, -0.35, 8.8); camera.lookAt(0, -0.35, 0);

// //     scene.add(new THREE.AmbientLight(0xffffff, 0.9));
// //     const d = new THREE.DirectionalLight(0xfff0c0, 2.2); d.position.set(3, 5, 7); scene.add(d);
// //     const p = new THREE.PointLight(0xff9a3c, 30, 20); p.position.set(-4, -2, 5); scene.add(p);

// //     const gold = new THREE.MeshStandardMaterial({ color: 0xe0a82a, metalness: 0.75, roughness: 0.3 });
// //     const tilt = new THREE.Group(); scene.add(tilt);

// //     tilt.add(new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.17, 24, 120), gold));
// //     const rim2 = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.05, 12, 120), gold); rim2.position.z = 0.03; tilt.add(rim2);

// //     const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1024;
// //     const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
// //     const face = new THREE.Mesh(new THREE.CircleGeometry(2, 128), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
// //     face.position.z = 0.02; tilt.add(face);

// //     const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.3, 48), gold);
// //     hub.rotation.x = Math.PI / 2; hub.position.z = 0.15; tilt.add(hub);
// //     const knob = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), gold); knob.position.z = 0.3; tilt.add(knob);

// //     const bulbs = [];
// //     for (let i = 0; i < 28; i++) {
// //       const a = (i / 28) * TAU;
// //       const m = new THREE.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffc233, emissiveIntensity: 1 });
// //       const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), m);
// //       b.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0.17); tilt.add(b); bulbs.push(m);
// //     }

// //     const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.6, 24),
// //       new THREE.MeshStandardMaterial({ color: 0xd11a2a, metalness: 0.4, roughness: 0.3 }));
// //     pointer.rotation.z = Math.PI; pointer.position.set(0, 2.38, 0.32); tilt.add(pointer);
// //     const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), gold); cap.position.set(0, 2.72, 0.32); tilt.add(cap);

// //     const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.9, 32), gold); stand.position.y = -2.5; tilt.add(stand);
// //     const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 0.28, 48), gold); base.position.y = -3.0; tilt.add(base);

// //     const resize = () => {
// //       const w = el.clientWidth, h = el.clientHeight;
// //       if (!w || !h) return;
// //       renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
// //     };
// //     const ro = new ResizeObserver(resize); ro.observe(el); resize();

// //     T.current = { face, tex, canvas, spin: null };
// //     drawFace(canvas, entriesRef.current); tex.needsUpdate = true;
// //     document.fonts?.ready.then(() => { drawFace(canvas, entriesRef.current); tex.needsUpdate = true; });

// //     let raf;
// //     const loop = (now) => {
// //       const s = T.current.spin, t = now / 1000;
// //       if (s) {
// //         const k = Math.min(1, (now - s.start) / s.dur);
// //         face.rotation.z = s.from + (s.to - s.from) * (1 - Math.pow(1 - k, 4));
// //         if (k >= 1) { T.current.spin = null; doneRef.current?.(s.w); }
// //       }
// //       bulbs.forEach((m, i) => { m.emissiveIntensity = 0.4 + 0.8 * Math.sin(t * (s ? 9 : 3) - i * 0.6) ** 2; });
// //       tilt.rotation.y = Math.sin(t * 0.6) * 0.1; tilt.rotation.x = Math.sin(t * 0.4) * 0.04;
// //       renderer.render(scene, camera);
// //       raf = requestAnimationFrame(loop);
// //     };
// //     raf = requestAnimationFrame(loop);

// //     return () => {
// //       cancelAnimationFrame(raf); ro.disconnect();
// //       scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
// //       tex.dispose(); renderer.dispose(); el.removeChild(renderer.domElement);
// //     };
// //   }, []);

// //   // redraw wheel when data changes
// //   useEffect(() => {
// //     const { canvas, tex } = T.current;
// //     if (!canvas) return;
// //     drawFace(canvas, entries); tex.needsUpdate = true;
// //   }, [entries]);

// //   doneRef.current = (w) => {
// //     const win = entriesRef.current[w];
// //     if (!win) return setSpinning(false);
// //     setSpinning(false); setWinner(win);
// //     setHistory((h) => [{ ...win, at: new Date().toLocaleString("bn-BD") }, ...h].slice(0, 30));
// //   };

// //   const spin = () => {
// //     const list = entriesRef.current;
// //     if (list.length < 2 || T.current.spin) return;
// //     const seg = TAU / list.length, w = Math.floor(Math.random() * list.length);
// //     const target = (w + 0.5) * seg + (Math.random() - 0.5) * seg * 0.7;
// //     const cur = T.current.face.rotation.z;
// //     const delta = (((target - cur) % TAU) + TAU) % TAU;
// //     T.current.spin = { from: cur, to: cur + TAU * (6 + Math.floor(Math.random() * 3)) + delta, start: performance.now(), dur: 6500, w };
// //     setWinner(null); setSpinning(true);
// //   };

// //   const add = (e) => {
// //     e.preventDefault();
// //     const nm = name.trim(); if (!nm) return;
// //     const next = num !== "" ? Number(num) : Math.max(100, ...entries.map((x) => Number(x.number) || 0)) + 1;
// //     setEntries([...entries, { id: Date.now(), name: nm, number: next }]);
// //     setName(""); setNum("");
// //   };
// //   const exportJson = () => {
// //     const a = document.createElement("a");
// //     a.href = URL.createObjectURL(new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" }));
// //     a.download = "entries.json"; a.click();
// //   };

// //   return (
// //     <main className="wrap">
// //       <section>
// //         <h1>লটারি হুইল</h1>
// //         <p className="sub">চাকা ঘুরান, ভাগ্য যাচাই করুন</p>
// //         <div className="stage" ref={mount} aria-label="3D lottery wheel" />
// //         <button className="spin" onClick={spin} disabled={spinning || entries.length < 2}>
// //           {spinning ? "ঘুরছে…" : "চাকা ঘুরান"}
// //         </button>
// //       </section>

// //       <section>
// //         <div className="panel">
// //           <h2>অংশগ্রহণকারী ({entries.length})</h2>
// //           <form className="add" onSubmit={add}>
// //             <input value={name} onChange={(e) => setName(e.target.value)} placeholder="নাম" aria-label="নাম" />
// //             <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="নম্বর" type="number" aria-label="নম্বর" />
// //             <button className="btn" type="submit">যোগ করুন</button>
// //           </form>
// //           <ul className="list">
// //             {entries.length === 0 && <li className="empty">কোনো নাম নেই। উপরে নাম ও নম্বর দিয়ে যোগ করুন।</li>}
// //             {entries.map((e) => (
// //               <li key={e.id}>
// //                 <span className="no">{e.number}</span>
// //                 <span className="nm">{e.name}</span>
// //                 <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} aria-label={`${e.name} মুছুন`}>✕</button>
// //               </li>
// //             ))}
// //           </ul>
// //           <div className="row">
// //             <button className="btn" onClick={exportJson}>JSON ডাউনলোড</button>
// //             <button className="btn danger" onClick={() => setEntries(defaults)}>ডিফল্টে ফিরুন</button>
// //             <button className="btn danger" onClick={() => setEntries([])}>সব মুছুন</button>
// //           </div>
// //         </div>

// //         <div className="panel">
// //           <h2>বিজয়ীর তালিকা</h2>
// //           <ul className="list">
// //             {history.length === 0 && <li className="empty">এখনো কেউ জেতেনি।</li>}
// //             {history.map((h, i) => (
// //               <li key={i}><span className="no">{h.number}</span><span className="nm">{h.name}</span><small>{h.at}</small></li>
// //             ))}
// //           </ul>
// //           {history.length > 0 && <div className="row"><button className="btn danger" onClick={() => setHistory([])}>তালিকা মুছুন</button></div>}
// //         </div>
// //       </section>

// //       {winner && (
// //         <div className="modal" onClick={() => setWinner(null)}>
// //           <div className="win" onClick={(e) => e.stopPropagation()}>
// //             <p>বিজয়ী নম্বর</p>
// //             <div className="big">{winner.number}</div>
// //             <div className="who">{winner.name}</div>
// //             <button className="btn" onClick={() => setWinner(null)}>ঠিক আছে</button>
// //           </div>
// //         </div>
// //       )}
// //     </main>
// //   );
// // }
