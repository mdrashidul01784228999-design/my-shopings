'use client';

import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// কনফিগ ও হেল্পার
// ==========================================
const DAILY_LIMIT = 5;
type Mode = 'daily' | 'unlimited';
type Status = 'menu' | 'playing' | 'over';
type Entity = { lane: number; z: number; kind: 'coin' | 'block' | 'wall'; taken?: boolean };

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const ls = {
  get: (k: string): string | null => {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set: (k: string, v: string) => {
    try { localStorage.setItem(k, v); } catch { /* ignore */ }
  },
};

// শেয়ার্ড কয়েন ওয়ালেট (localStorage) — দুই গেমেই একই key
const WALLET_KEY = 'rg_wallet';
const readWallet = () => parseInt(ls.get(WALLET_KEY) || '0', 10) || 0;
const addToWallet = (d: number) => {
  const n = Math.max(0, readWallet() + d);
  ls.set(WALLET_KEY, String(n));
  window.dispatchEvent(new Event('rg-wallet'));
  return n;
};

// 3D প্রজেকশন: z = 0 (কাছে) → 1+ (দূরে)
const W = 900;
const H = 440;
const HOR = H * 0.36; // horizon
const BOT = H * 0.9;
const sc = (z: number) => 1 / (1 + z * 4);
const yAt = (z: number) => HOR + (BOT - HOR) * sc(z);
const ROAD = W * 0.46;

// ==========================================
// গেম ১: 3D কয়েন রানার (RunnerGame3D)
// ==========================================
export default function RunnerGame3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const actRef = useRef<(a: 'left' | 'right' | 'jump') => void>(() => {});

  const [status, setStatus] = useState<Status>('menu');
  const [mode, setMode] = useState<Mode>('unlimited');
  const [wallet, setWallet] = useState(0);
  const [best, setBest] = useState(0);
  const [used, setUsed] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState({ score: 0, coins: 0 });

  // সেভ করা ডাটা লোড
  useEffect(() => {
    setWallet(readWallet());
    setBest(parseInt(ls.get('pc_best') || '0', 10) || 0);
    try {
      const d = JSON.parse(ls.get('pc_daily') || 'null');
      if (d && d.d === todayKey()) setUsed(d.n);
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) ls.set('pc_best', String(best));
  }, [best, loaded]);

  // অন্য গেম/ট্যাব থেকে কয়েন বদলালে সিঙ্ক
  useEffect(() => {
    const sync = () => setWallet(readWallet());
    window.addEventListener('rg-wallet', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('rg-wallet', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const dailyLeft = Math.max(0, DAILY_LIMIT - used);

  const startGame = (m: Mode) => {
    if (m === 'daily') {
      if (dailyLeft <= 0) return;
      const n = used + 1;
      setUsed(n);
      ls.set('pc_daily', JSON.stringify({ d: todayKey(), n }));
    }
    setMode(m);
    setStatus('playing');
  };

  // গেম লুপ
  useEffect(() => {
    if (status !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c2d = canvas.getContext('2d');
    if (!c2d) return;
    const ctx = c2d;

    const DPR = window.devicePixelRatio || 1;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    const cx = W / 2;
    const s = {
      target: 1, laneX: 1, h: 0, vy: 0, dist: 0, speed: 0.55, coins: 0,
      next: 0.3, over: false, ents: [] as Entity[],
    };

    actRef.current = (a) => {
      if (s.over) return;
      if (a === 'left') s.target = Math.max(0, s.target - 1);
      if (a === 'right') s.target = Math.min(2, s.target + 1);
      if (a === 'jump' && s.h === 0) s.vy = 3.5;
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowleft', 'a'].includes(k)) actRef.current('left');
      if (['arrowright', 'd'].includes(k)) actRef.current('right');
      if (['arrowup', 'w', ' '].includes(k)) { actRef.current('jump'); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);

    let tx = 0, ty = 0;
    const tStart = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const tEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 25) actRef.current(dx > 0 ? 'right' : 'left'); }
      else if (dy < -25) actRef.current('jump');
    };
    canvas.addEventListener('touchstart', tStart, { passive: true });
    canvas.addEventListener('touchend', tEnd, { passive: true });

    const poly = (p: number[]) => {
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.closePath();
      ctx.fill();
    };

    const box = (x: number, yb: number, w: number, h: number, d: number, col: [string, string, string]) => {
      const yt = yb - h;
      const sd = x < cx ? 1 : -1;
      ctx.fillStyle = col[2];
      poly([x + (sd * w) / 2, yt, x + (sd * w) / 2, yb, x + sd * w * 0.4, yb - d, x + sd * w * 0.4, yt - d]);
      ctx.fillStyle = col[1];
      poly([x - w / 2, yt, x + w / 2, yt, x + w * 0.4, yt - d, x - w * 0.4, yt - d]);
      ctx.fillStyle = col[0];
      ctx.fillRect(x - w / 2, yt, w, h);
    };

    const laneXpx = (lane: number, sv: number) => cx + (lane - 1) * ((2 * ROAD * sv) / 3);

    const spawn = () => {
      const r = Math.random();
      const lane = Math.floor(Math.random() * 3);
      if (r < 0.55) {
        for (let i = 0; i < 5; i++) s.ents.push({ lane, z: 1.1 + i * 0.06, kind: 'coin' });
      } else if (r < 0.82) s.ents.push({ lane, z: 1.1, kind: 'block' });
      else s.ents.push({ lane, z: 1.1, kind: 'wall' });
    };

    const end = () => {
      s.over = true;
      const score = Math.floor(s.dist * 100);
      setResult({ score, coins: s.coins });
      setWallet(addToWallet(s.coins));
      setBest((b) => Math.max(b, score));
      setStatus('over');
    };

    const update = (dt: number) => {
      s.speed = Math.min(1.5, 0.55 + s.dist * 0.015);
      s.dist += s.speed * dt;
      s.laneX += (s.target - s.laneX) * Math.min(1, dt * 12);

      if (s.h > 0 || s.vy > 0) {
        s.vy -= 9 * dt;
        s.h += s.vy * dt;
        if (s.h <= 0) { s.h = 0; s.vy = 0; }
      }

      s.next -= s.speed * dt;
      if (s.next <= 0) { spawn(); s.next = 0.45 + Math.random() * 0.35; }

      for (const e of s.ents) {
        e.z -= s.speed * dt;
        if (e.taken || e.z > 0.1 || e.z < 0) continue;
        if (Math.abs(s.laneX - e.lane) > 0.5) continue;
        if (e.kind === 'coin') { e.taken = true; s.coins += 1; }
        else if (e.kind === 'wall' || s.h < 0.4) { end(); return; }
      }
      s.ents = s.ents.filter((e) => e.z > -0.15 && !e.taken);
    };

    const draw = () => {
      // আকাশ
      const g = ctx.createLinearGradient(0, 0, 0, HOR);
      g.addColorStop(0, '#0b1d4d');
      g.addColorStop(1, '#ff9a5a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, HOR + 2);
      ctx.fillStyle = '#ffd27a';
      ctx.beginPath();
      ctx.arc(W * 0.72, HOR - 10, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a2150';
      ctx.beginPath();
      ctx.moveTo(0, HOR);
      for (let i = 0; i <= 15; i++) ctx.lineTo(i * 60, HOR - 20 - (i % 3) * 18 - ((i * 37) % 23));
      ctx.lineTo(W, HOR);
      ctx.fill();

      // মাটি + রাস্তা (পার্সপেক্টিভ ব্যান্ড)
      ctx.fillStyle = '#0f6b30';
      ctx.fillRect(0, HOR, W, H - HOR);
      const BD = 0.12;
      const phase = s.dist % (BD * 2);
      let idx = 0;
      for (let z0 = -phase; z0 < 3; z0 += BD, idx++) {
        const za = Math.max(0, z0), zb = z0 + BD;
        if (zb <= 0) continue;
        const ya = yAt(za), yb = yAt(zb);
        const ra = ROAD * sc(za), rb = ROAD * sc(zb);
        ctx.fillStyle = idx % 2 ? '#14803c' : '#0f6b30';
        ctx.fillRect(0, yb, W, ya - yb + 1);
        ctx.fillStyle = idx % 2 ? '#3a3f4d' : '#343846';
        poly([cx - ra, ya, cx + ra, ya, cx + rb, yb, cx - rb, yb]);
        ctx.fillStyle = idx % 2 ? '#ffffff' : '#e33b3b';
        poly([cx - ra, ya, cx - ra * 1.05, ya, cx - rb * 1.05, yb, cx - rb, yb]);
        poly([cx + ra, ya, cx + ra * 1.05, ya, cx + rb * 1.05, yb, cx + rb, yb]);
        if (idx % 2) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          for (const l of [-1, 1]) {
            const wa = 3 * sc(za), wb = 3 * sc(zb);
            poly([cx + (l * ra) / 3 - wa, ya, cx + (l * ra) / 3 + wa, ya, cx + (l * rb) / 3 + wb, yb, cx + (l * rb) / 3 - wb, yb]);
          }
        }
      }

      // অবজেক্ট (দূর থেকে কাছে)
      const t = performance.now() / 1000;
      const sorted = [...s.ents].sort((a, b) => b.z - a.z);
      for (const e of sorted) {
        if (e.z < 0) continue;
        const sv = sc(e.z), y = yAt(e.z), x = laneXpx(e.lane, sv);
        ctx.globalAlpha = Math.max(0, Math.min(1, (1.1 - e.z) * 8));
        // ছায়া
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(x, y, 34 * sv, 8 * sv, 0, 0, Math.PI * 2);
        ctx.fill();
        if (e.kind === 'coin') {
          const cy = y - 46 * sv - Math.sin(t * 4 + e.z * 12) * 4 * sv;
          const r = 20 * sv;
          const rw = Math.max(2 * sv, r * Math.abs(Math.cos(t * 5 + e.lane)));
          const cg = ctx.createRadialGradient(x - rw * 0.3, cy - r * 0.3, 1, x, cy, r);
          cg.addColorStop(0, '#fff3b0');
          cg.addColorStop(1, '#e0a800');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.ellipse(x, cy, rw, r, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a87400';
          ctx.lineWidth = Math.max(1, 2 * sv);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(x, cy, rw * 0.6, r * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (e.kind === 'block') {
          box(x, y, 78 * sv, 55 * sv, 14 * sv, ['#c0392b', '#ff7a66', '#8e2a20']);
        } else {
          box(x, y, 84 * sv, 140 * sv, 16 * sv, ['#5b4bd6', '#9a8cff', '#3a2fa3']);
          ctx.fillStyle = '#ffd43b';
          ctx.fillRect(x - 36 * sv, y - 92 * sv, 72 * sv, 10 * sv);
        }
        ctx.globalAlpha = 1;
      }

      // প্লেয়ার (3D ক্যারেক্টার)
      const pz = 0.06, sp = sc(pz), yb = yAt(pz), px = laneXpx(s.laneX, sp);
      const jp = s.h * 150 * sp;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(px, yb, 26 * sp * (1 - s.h * 0.4), 7 * sp, 0, 0, Math.PI * 2);
      ctx.fill();
      const sw = s.h > 0 ? 0 : Math.sin(s.dist * 60) * 8 * sp;
      ctx.fillStyle = '#243b6b';
      ctx.fillRect(px - 15 * sp, yb - jp - 22 * sp + sw, 11 * sp, 22 * sp);
      ctx.fillRect(px + 4 * sp, yb - jp - 22 * sp - sw, 11 * sp, 22 * sp);
      box(px, yb - jp - 20 * sp, 40 * sp, 40 * sp, 10 * sp, ['#4f8cff', '#8fb6ff', '#2d5fc4']);
      const hy = yb - jp - 72 * sp;
      const hg = ctx.createRadialGradient(px - 5 * sp, hy - 5 * sp, 2, px, hy, 17 * sp);
      hg.addColorStop(0, '#ffe8cc');
      hg.addColorStop(1, '#d99a63');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(px, hy, 17 * sp, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d14a78';
      ctx.fillRect(px - 18 * sp, hy - 14 * sp, 36 * sp, 8 * sp);

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(12, 12, 250, 34);
      ctx.fillStyle = '#fff';
      ctx.font = '15px monospace';
      ctx.fillText(`Coins: ${s.coins}   Score: ${Math.floor(s.dist * 100)}`, 22, 34);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '12px monospace';
      ctx.fillText(mode === 'daily' ? 'Daily mode' : 'Unlimited mode', W - 130, 26);
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (!s.over) {
        update(dt);
        draw();
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      s.over = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', tStart);
      canvas.removeEventListener('touchend', tEnd);
    };
  }, [status, mode]);

  return (
    <div className="w-full flex flex-col items-center gap-5 p-6 bg-slate-950 min-h-screen text-white">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-yellow-400">Md Rashidul&apos;s Runner 3D</h1>
        <div className="bg-slate-800 rounded-lg px-4 py-1.5 font-mono">
          🪙 <span className="text-yellow-400 text-xl">{wallet}</span>
        </div>
      </div>

      {status === 'playing' ? (
        <>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: W, aspectRatio: `${W} / ${H}`, borderRadius: 14, boxShadow: '0 8px 36px rgba(0,0,0,0.65)', touchAction: 'none' }}
          />
          <div className="flex gap-3">
            <button onClick={() => actRef.current('left')} className="bg-slate-700 active:bg-slate-500 px-6 py-3 rounded-lg text-xl">◀</button>
            <button onClick={() => actRef.current('jump')} className="bg-blue-600 active:bg-blue-400 px-8 py-3 rounded-lg font-bold">JUMP</button>
            <button onClick={() => actRef.current('right')} className="bg-slate-700 active:bg-slate-500 px-6 py-3 rounded-lg text-xl">▶</button>
          </div>
          <p className="text-xs text-gray-400">← → বা A/D = লেন বদল, ↑ / W / Space = জাম্প (মোবাইলে সোয়াইপ করো)। লাল বক্স জাম্প করে পার হও, বেগুনি দেয়াল লেন বদলে এড়াও।</p>
        </>
      ) : (
        <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700 p-6 text-center">
          {status === 'over' && (
            <div className="mb-6">
              <div className="text-xl font-bold text-red-400 mb-1">গেম শেষ!</div>
              <div className="text-gray-300">স্কোর: {result.score} · কয়েন: +{result.coins} · সেরা: {best}</div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => startGame('daily')}
              disabled={dailyLeft <= 0}
              className="rounded-xl p-5 bg-amber-500 text-black font-bold disabled:bg-slate-700 disabled:text-slate-400 hover:bg-amber-400 transition-colors"
            >
              <div className="text-lg">Daily Play</div>
              <div className="text-sm font-normal mt-1">
                {dailyLeft > 0 ? `আজ বাকি আছে ${dailyLeft}/${DAILY_LIMIT}` : 'আজকের ৫টা শেষ, কাল আবার এসো'}
              </div>
            </button>
            <button
              onClick={() => startGame('unlimited')}
              className="rounded-xl p-5 bg-blue-600 font-bold hover:bg-blue-500 transition-colors"
            >
              <div className="text-lg">Unlimited Play</div>
              <div className="text-sm font-normal mt-1">যতবার খুশি খেলো</div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
