'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* ============ ১) প্রতিদিনের টাস্ক ============ */
export type TaskKey = 'shop' | 'cart' | 'buy' | 'ride' | 'office';
const TASKS: { key: TaskKey; id: string; title: string; goal: number; pts: number }[] = [
  { key: 'shop', id: 't1', title: '🏪 ৩টি দোকানে ঘুরুন', goal: 3, pts: 150 },
  { key: 'cart', id: 't2', title: '🛒 ৩টি পণ্য কার্টে নিন', goal: 3, pts: 100 },
  { key: 'buy', id: 't3', title: '✅ একবার কেনাকাটা সম্পন্ন করুন', goal: 1, pts: 200 },
  { key: 'ride', id: 't4', title: '🏍️ মোটরসাইকেলে ৫০০ মিটার চালান', goal: 500, pts: 250 },
  { key: 'office', id: 't5', title: '🏢 হেড অফিস ঘুরে আসুন', goal: 1, pts: 100 },
];
const today = () => new Date().toISOString().slice(0, 10);
const DK = 'grand-mall-daily-v1';

export function useDaily(onReward: (pts: number) => void) {
  const [d, setD] = useState<{ day: string; prog: Record<string, number>; claimed: string[] }>({ day: today(), prog: {}, claimed: [] });
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(DK) || 'null'); if (s && s.day === today()) setD(s); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem(DK, JSON.stringify(d)); } catch { /* ignore */ } }, [d]);
  // নতুন দিন শুরু হলে রিসেট
  const fresh = (x: typeof d) => (x.day === today() ? x : { day: today(), prog: {}, claimed: [] });
  const bump = (k: TaskKey, n = 1) => setD((p) => { const x = fresh(p); return { ...x, prog: { ...x.prog, [k]: (x.prog[k] || 0) + n } }; });
  const claim = (id: string) => {
    const t = TASKS.find((x) => x.id === id); if (!t || d.claimed.includes(id) || (d.prog[t.key] || 0) < t.goal) return;
    setD({ ...d, claimed: [...d.claimed, id] }); onReward(t.pts);
  };
  // সবগুলো শেষ করলে বোনাস
  const allDone = TASKS.every((t) => d.claimed.includes(t.id));
  return { d, bump, claim, allDone };
}

export function TasksPanel({ api, onClose, only }: { api: ReturnType<typeof useDaily>; onClose: () => void; only?: TaskKey[] }) {
  const { d, claim, allDone } = api;
  return (
    <div className="absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl md:inset-x-auto md:right-3 md:top-24 md:w-[380px]">
      <div className="flex justify-between"><b>📅 আজকের টাস্ক</b><button onClick={onClose} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
      <p className="mt-1 text-[11px] text-slate-400">প্রতিদিন নতুন করে শুরু হয়। সব শেষ করলে আজকের জন্য বাড়তি সম্মান 🏆</p>
      <div className="mt-3 space-y-2">
        {TASKS.filter((t) => !only || only.includes(t.key)).map((t) => {
          const v = Math.min(t.goal, Math.round(d.prog[t.key] || 0)), ok = v >= t.goal, got = d.claimed.includes(t.id);
          return (
            <div key={t.id} className="rounded-2xl bg-white/5 p-2.5">
              <div className="flex items-center justify-between text-xs"><span className="font-bold">{t.title}</span><b className="text-emerald-300">+{t.pts} পয়েন্ট</b></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400" style={{ width: `${(v / t.goal) * 100}%` }} /></div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{v}/{t.goal}</span>
                <button disabled={!ok || got} onClick={() => claim(t.id)} className="rounded-lg bg-cyan-500 px-3 py-1 font-black text-slate-950 disabled:opacity-40">{got ? 'নেওয়া হয়েছে ✓' : 'পুরস্কার নিন'}</button>
              </div>
            </div>
          );
        })}
      </div>
      {allDone && <div className="mt-3 rounded-2xl bg-amber-400/20 p-3 text-center text-xs font-bold text-amber-300">🏆 আজকের সব টাস্ক শেষ! কাল আবার আসুন।</div>}
    </div>
  );
}

/* ============ ২) হেড অফিস: অভিযোগ, কাস্টমার সার্ভিস, পয়েন্ট → টাকা ============ */
export const POINT_RATE = 10; // ১০ পয়েন্ট = ৳১
export const MIN_WITHDRAW = 500; // সর্বনিম্ন পয়েন্ট
type Complaint = { id: string; topic: string; text: string; status: string; date: string };
const CK = 'grand-mall-complaints-v1';
const FAQ: [string[], string][] = [
  [['টাকা', 'উত্তোলন', 'withdraw'], `পয়েন্ট থেকে টাকা তুলতে "উত্তোলন" ট্যাবে যান। ${POINT_RATE} পয়েন্ট = ৳১, সর্বনিম্ন ${MIN_WITHDRAW} পয়েন্ট।`],
  [['অভিযোগ', 'সমস্যা'], '"অভিযোগ" ট্যাবে বিষয় ও বিস্তারিত লিখে জমা দিন। আপনার অভিযোগ নম্বর দিয়ে স্ট্যাটাস দেখতে পারবেন।'],
  [['পয়েন্ট', 'টাস্ক'], 'প্রতিদিনের টাস্ক শেষ করলে পয়েন্ট পাবেন। কেনাকাটা করলেও প্রতি পণ্যে ১০০ পয়েন্ট।'],
  [['ডেলিভারি', 'অর্ডার'], 'অর্ডার সফল হলে কার্ট খালি হয়ে যায়। সমস্যা হলে অভিযোগ করুন।'],
];

export function OfficePanel(p: { score: number; balance: number; onWithdraw: (pts: number) => void; onClose: () => void; onVisit: () => void }) {
  const [tab, setTab] = useState<'c' | 'w' | 's'>('c');
  const [list, setList] = useState<Complaint[]>([]);
  const [topic, setTopic] = useState('পণ্য'); const [text, setText] = useState('');
  const [pts, setPts] = useState(''); const [info, setInfo] = useState('');
  const [chat, setChat] = useState<{ me: boolean; t: string }[]>([{ me: false, t: 'আসসালামু আলাইকুম! আমি কাস্টমার সার্ভিস। কীভাবে সাহায্য করতে পারি?' }]);
  const [msg, setMsg] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { p.onVisit(); try { setList(JSON.parse(localStorage.getItem(CK) || '[]')); } catch { /* ignore */ } /* eslint-disable-next-line */ }, []);
  useEffect(() => { try { localStorage.setItem(CK, JSON.stringify(list)); } catch { /* ignore */ } }, [list]);
  useEffect(() => { box.current?.scrollTo(0, 99999); }, [chat]);
  const submit = () => {
    if (text.trim().length < 10) return setInfo('✏️ অন্তত ১০ অক্ষরে বিস্তারিত লিখুন');
    const c: Complaint = { id: 'C' + Date.now().toString(36).toUpperCase(), topic, text: text.trim(), status: '⏳ গ্রহণ করা হয়েছে', date: new Date().toLocaleString() };
    setList([c, ...list]); setText(''); setInfo(`✅ অভিযোগ নম্বর ${c.id} — ২৪ ঘণ্টার মধ্যে দেখা হবে`);
    // ডেমো: ৮ সেকেন্ড পরে স্ট্যাটাস বদলায় (আসল সার্ভার থাকলে এখানে API কল)
    setTimeout(() => setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: '🔍 পর্যালোচনায়' } : x))), 8000);
  };
  const withdraw = () => {
    const n = Math.floor(Number(pts));
    if (!(n >= MIN_WITHDRAW)) return setInfo(`❌ সর্বনিম্ন ${MIN_WITHDRAW} পয়েন্ট`);
    if (n > p.score) return setInfo('❌ পর্যাপ্ত পয়েন্ট নেই');
    p.onWithdraw(n); setPts(''); setInfo(`✅ ${n} পয়েন্ট → ৳${Math.floor(n / POINT_RATE)} ব্যালেন্সে যোগ হয়েছে`);
  };
  const ask = () => {
    const q = msg.trim(); if (!q) return;
    const hit = FAQ.find(([k]) => k.some((w) => q.toLowerCase().includes(w)));
    setChat((c) => [...c, { me: true, t: q }, { me: false, t: hit ? hit[1] : 'দুঃখিত, বুঝতে পারিনি। অভিযোগ ট্যাবে বিস্তারিত জানান, আমাদের টিম যোগাযোগ করবে।' }]); setMsg('');
  };
  const cls = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
  const b = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
  return (
    <div className="absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl md:inset-x-auto md:right-3 md:top-24 md:w-[400px]">
      <div className="flex justify-between"><b>🏢 হেড অফিস</b><button onClick={p.onClose} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
      <div className="mt-2 flex gap-1 text-xs">
        {([['c', '📝 অভিযোগ'], ['w', '💸 উত্তোলন'], ['s', '🎧 সার্ভিস']] as const).map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setInfo(''); }} className={`flex-1 rounded-lg py-2 font-bold ${tab === k ? 'bg-cyan-500 text-slate-950' : 'bg-white/10'}`}>{l}</button>))}
      </div>
      {info && <p className="mt-2 text-[11px] text-amber-300">{info}</p>}
      {tab === 'c' && (<div className="mt-3 space-y-2">
        <select className={cls} value={topic} onChange={(e) => setTopic(e.target.value)}>{['পণ্য', 'দোকান', 'পেমেন্ট', 'পয়েন্ট', 'অন্যান্য'].map((x) => <option key={x} className="text-black">{x}</option>)}</select>
        <textarea className={cls} rows={3} placeholder="আপনার অভিযোগ বিস্তারিত লিখুন" value={text} onChange={(e) => setText(e.target.value)} />
        <button className={`${b} w-full`} onClick={submit}>📨 জমা দিন</button>
        {list.map((c) => (<div key={c.id} className="rounded-xl bg-white/5 p-2 text-[11px]"><div className="flex justify-between"><b>{c.id} • {c.topic}</b><span>{c.status}</span></div><p className="mt-1 text-slate-300">{c.text}</p><div className="text-slate-500">{c.date}</div></div>))}
      </div>)}
      {tab === 'w' && (<div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-white/5 p-2"><div className="text-[10px] text-slate-400">পয়েন্ট</div><b className="text-emerald-300">{p.score}</b></div><div className="rounded-xl bg-white/5 p-2"><div className="text-[10px] text-slate-400">ব্যালেন্স</div><b className="text-yellow-300">৳{p.balance.toLocaleString()}</b></div></div>
        <input className={cls} type="number" placeholder={`কত পয়েন্ট বদলাবেন? (${POINT_RATE} পয়েন্ট = ৳১)`} value={pts} onChange={(e) => setPts(e.target.value)} />
        <button className={`${b} w-full`} onClick={withdraw}>💸 টাকায় রূপান্তর করুন</button>
        <p className="text-[10px] text-slate-400">ব্যাংক/বিকাশে আসল টাকা পাঠাতে সার্ভার ও পেমেন্ট গেটওয়ে (bKash/SSLCommerz) লাগবে। এখানে ব্যালেন্সে যোগ হয়।</p>
      </div>)}
      {tab === 's' && (<div className="mt-3">
        <div ref={box} className="max-h-60 space-y-1.5 overflow-y-auto rounded-xl bg-black/30 p-2">
          {chat.map((m, i) => <div key={i} className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${m.me ? 'ml-auto bg-cyan-500 text-slate-950' : 'bg-white/10'}`}>{m.t}</div>)}
        </div>
        <div className="mt-2 flex gap-2"><input className={cls} placeholder="প্রশ্ন লিখুন…" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} /><button className={b} onClick={ask}>পাঠান</button></div>
      </div>)}
    </div>
  );
}

/* ============ ৩) পণ্যের ছবি জুম (হুইল / পিঞ্চ / ডাবল-ক্লিক) ============ */
export function ZoomImage({ src, alt, onError }: { src: string; alt: string; onError?: React.ReactEventHandler<HTMLImageElement> }) {
  const [z, setZ] = useState({ s: 1, x: 0, y: 0 });
  const pts = useRef(new Map<number, { x: number; y: number }>()); const pd = useRef(0);
  const clamp = (s: number) => Math.min(5, Math.max(1, s));
  const move = (e: React.PointerEvent) => {
    const m = pts.current; if (!m.has(e.pointerId)) return;
    const o = m.get(e.pointerId)!; m.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (m.size === 2) { const [a, c] = [...m.values()]; const d = Math.hypot(a.x - c.x, a.y - c.y); if (pd.current) setZ((p) => ({ ...p, s: clamp(p.s * (d / pd.current)) })); pd.current = d; }
    else if (z.s > 1) setZ((p) => ({ ...p, x: p.x + e.clientX - o.x, y: p.y + e.clientY - o.y }));
  };
  return (
    <div className="relative h-64 w-full touch-none overflow-hidden bg-black md:h-96"
      onWheel={(e) => setZ((p) => { const s = clamp(p.s - e.deltaY * 0.002); return s === 1 ? { s, x: 0, y: 0 } : { ...p, s }; })}
      onDoubleClick={() => setZ((p) => (p.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 2.5, x: 0, y: 0 }))}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); }}
      onPointerMove={move} onPointerUp={(e) => { pts.current.delete(e.pointerId); pd.current = 0; }} onPointerCancel={(e) => { pts.current.delete(e.pointerId); pd.current = 0; }}>
      <img src={src} alt={alt} draggable={false} onError={onError} className="h-full w-full select-none object-contain" style={{ transform: `translate(${z.x}px,${z.y}px) scale(${z.s})` }} />
      <div className="absolute bottom-2 right-2 flex gap-1 text-xs">
        <button className="h-8 w-8 rounded-lg bg-black/60" onClick={() => setZ((p) => ({ ...p, s: clamp(p.s + 0.5) }))}>＋</button>
        <button className="h-8 w-8 rounded-lg bg-black/60" onClick={() => setZ({ s: 1, x: 0, y: 0 })}>⟲</button>
        <button className="h-8 w-8 rounded-lg bg-black/60" onClick={() => setZ((p) => { const s = clamp(p.s - 0.5); return s === 1 ? { s, x: 0, y: 0 } : { ...p, s }; })}>－</button>
      </div>
    </div>
  );
}

/* ============ ৪) মোটরসাইকেল ============ */
export function buildBike(color = 0xdc2626) {
  const g = new THREE.Group();
  const m = (c: number, r = 0.5, me = 0.3, e = 0, ei = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: me, emissive: e, emissiveIntensity: ei });
  const body = m(color, 0.3, 0.6), dk = m(0x111827), mt = m(0xcbd5e1, 0.2, 0.9);
  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => { const k = new THREE.Mesh(geo, mat); k.position.set(x, y, z); k.rotation.set(rx, ry, rz); k.castShadow = true; g.add(k); return k; };
  const wheels: THREE.Mesh[] = [];
  for (const z of [-0.95, 0.95]) {
    const w = part(new THREE.TorusGeometry(0.42, 0.13, 10, 24), dk, 0, 0.55, z, 0, Math.PI / 2); wheels.push(w);
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10), mt, 0, 0.55, z, 0, 0, Math.PI / 2);
  }
  part(new THREE.BoxGeometry(0.34, 0.34, 1.1), body, 0, 1.05, -0.1);           // ট্যাংক ও কাঠামো
  part(new THREE.BoxGeometry(0.32, 0.12, 0.8), dk, 0, 1.0, 0.1 * -1 - 0.5);    // সিট
  part(new THREE.BoxGeometry(0.1, 0.9, 0.1), mt, 0, 0.95, 0.85, -0.4);         // ফর্ক
  part(new THREE.BoxGeometry(0.9, 0.06, 0.06), dk, 0, 1.5, 0.7);               // হ্যান্ডেল
  part(new THREE.SphereGeometry(0.13, 12, 8), m(0xfff3c4, 0.2, 0, 0xffe08a, 2), 0, 1.3, 1.0); // হেডলাইট
  part(new THREE.CylinderGeometry(0.07, 0.09, 0.8, 10), mt, 0.22, 0.45, -0.6, Math.PI / 2); // সাইলেন্সার
  return { group: g, spin: (d: number) => wheels.forEach((w) => (w.rotation.x += d)) };
}

/* ============ ৫) সম্পূর্ণ শহর: গ্রিড রাস্তা, বিল্ডিং, রাস্তার বাতি ============ */
export function addCity(scene: THREE.Scene) {
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const road = new THREE.MeshStandardMaterial({ color: 0x20232b, roughness: 0.9 });
  const walk = new THREE.MeshStandardMaterial({ color: 0x8a93a3, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: 0x2b3a2c, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.04, 250); ground.receiveShadow = true; scene.add(ground);
  const strip = (w: number, d: number, x: number, z: number) => { const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d), road); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.02, z); scene.add(r); };
  // রাস্তা: z=39 থেকে দক্ষিণে প্রতি ৮০ মিটারে পূর্ব-পশ্চিম, প্রতি ৮০ মিটারে উত্তর-দক্ষিণ
  for (let i = 0; i < 6; i++) strip(1000, 14, 0, 39 + i * 80);
  for (let j = -6; j <= 6; j++) strip(14, 500, j * 80, 39 + 240);
  // বিল্ডিং ব্লক
  const geo = new THREE.BoxGeometry(1, 1, 1), N = 260;
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.2 }), N);
  const mm = new THREE.Matrix4(), col = new THREE.Color(); let n = 0;
  for (let i = 0; i < 5 && n < N; i++) for (let j = -6; j < 6 && n < N; j++) for (let k = 0; k < 4 && n < N; k++) {
    const w = 10 + rnd() * 14, d = 10 + rnd() * 14, h = 8 + rnd() * 55;
    const x = j * 80 + 40 + (k % 2 ? 14 : -14), z = 39 + i * 80 + 40 + (k < 2 ? -14 : 14);
    mm.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
    mesh.setMatrixAt(n, mm); mesh.setColorAt(n, col.setHSL(0.55 + rnd() * 0.1, 0.18, 0.4 + rnd() * 0.3)); n++;
  }
  mesh.count = n; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  // রাস্তার বাতি
  const lamp = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.12, 6, 6), walk, 120); n = 0;
  for (let i = 0; i < 6; i++) for (let x = -240; x < 240 && n < 120; x += 40) { mm.makeTranslation(x, 3, 33 + i * 80); lamp.setMatrixAt(n++, mm); }
  lamp.count = n; scene.add(lamp);
  return { bounds: { minX: -480, maxX: 480, maxZ: 480 } };
}

/* ============ ৬) চালানোর লজিক (page.tsx-এ মাত্র কয়েক লাইনে জোড়া লাগে) ============ */
export function attachRide(scene: THREE.Scene, player: THREE.Group, rider: THREE.Group, onMeters: (m: number) => void) {
  addCity(scene);
  const bike = buildBike(); bike.group.rotation.y = Math.PI; bike.group.visible = false; player.add(bike.group);
  let riding = false, lx = player.position.x, lz = player.position.z, acc = 0;
  return {
    get riding() { return riding; },
    toggle() { riding = !riding; bike.group.visible = riding; rider.position.y = riding ? 0.55 : 0; return riding; },
    limit: () => ({ x: riding ? 480 : 27, zMax: riding ? 480 : 29, speed: riding ? 26 : 0 }),
    // মলের বাইরের দেয়াল ভেদ করা আটকায়
    wall: (x: number, z: number, back: number) => riding && Math.abs(x) > 26.5 && Math.abs(x) < 30 && z < 24 && z > back,
    step(dt: number) { // প্রতি ফ্রেমে ডাকুন
      const d = Math.hypot(player.position.x - lx, player.position.z - lz); lx = player.position.x; lz = player.position.z;
      if (riding) { bike.spin(d * 2.4); acc += d; if (acc >= 10) { onMeters(acc); acc = 0; } }
    },
  };
}
