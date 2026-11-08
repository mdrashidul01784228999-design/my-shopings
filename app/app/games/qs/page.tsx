'use client';

import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// শেয়ার্ড কয়েন ওয়ালেট (localStorage) — RunnerGame3D এর সাথে একই key
// ==========================================
const WALLET_KEY = 'rg_wallet';
const readWallet = (): number => {
  try { return parseInt(localStorage.getItem(WALLET_KEY) || '0', 10) || 0; } catch { return 0; }
};
const addToWallet = (d: number): number => {
  const n = Math.max(0, readWallet() + d);
  try { localStorage.setItem(WALLET_KEY, String(n)); } catch { /* ignore */ }
  window.dispatchEvent(new Event('rg-wallet'));
  return n;
};

type Q = { text: string; answer: number; options: number[] };

// স্ট্রিক বাড়লে প্রশ্ন কঠিন হয়
const makeQuestion = (streak: number): Q => {
  const level = Math.min(2, Math.floor(streak / 3));
  let text = '';
  let answer = 0;
  const r = (n: number) => Math.floor(Math.random() * n) + 1;
  if (level === 0) {
    const a = r(10), b = r(10);
    text = `${a} + ${b}`; answer = a + b;
  } else if (level === 1) {
    const a = r(20) + 10, b = r(10);
    const sub = Math.random() < 0.5;
    text = sub ? `${a} − ${b}` : `${a} + ${b}`; answer = sub ? a - b : a + b;
  } else {
    const a = r(9) + 1, b = r(9) + 1;
    text = `${a} × ${b}`; answer = a * b;
  }
  const set = new Set<number>([answer]);
  while (set.size < 3) {
    const off = r(5) * (Math.random() < 0.5 ? -1 : 1);
    const wrong = answer + off;
    if (wrong >= 0) set.add(wrong);
  }
  return { text, answer, options: Array.from(set).sort(() => Math.random() - 0.5) };
};

// ==========================================
// গেম ২: 3D কুইজ (MathQuiz3D)
// ==========================================
export default function MathQuiz3D() {
  const [wallet, setWallet] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [q, setQ] = useState<Q>({ text: '5 + 3', answer: 8, options: [6, 8, 10] });
  const [msg, setMsg] = useState('সঠিক উত্তর দিয়ে কয়েন জিতো!');
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWallet(readWallet());
    setQ(makeQuestion(0));
    const sync = () => setWallet(readWallet());
    window.addEventListener('rg-wallet', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('rg-wallet', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const answer = (sel: number) => {
    if (sel === q.answer) {
      const next = streak + 1;
      const gain = 10 + Math.min(next, 5) * 2;
      setWallet(addToWallet(gain));
      setStreak(next);
      setBestStreak((b) => Math.max(b, next));
      setMsg(`সঠিক! +${gain} কয়েন 🪙`);
      setFlash('ok');
      setQ(makeQuestion(next));
    } else {
      setWallet(addToWallet(-5));
      setStreak(0);
      setMsg(`ভুল! সঠিক উত্তর ছিল ${q.answer} (−৫ কয়েন)`);
      setFlash('bad');
      setQ(makeQuestion(0));
    }
    setTimeout(() => setFlash(null), 350);
  };

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    setTilt({ x: -((e.clientY - b.top) / b.height - 0.5) * 14, y: ((e.clientX - b.left) / b.width - 0.5) * 18 });
  };

  const level = Math.min(2, Math.floor(streak / 3)) + 1;

  return (
    <div className="w-full flex flex-col items-center gap-6 p-6 bg-slate-950 text-white" style={{ perspective: 1200 }}>
      <style>{`
        @keyframes qz-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes qz-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .qz-coin { width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
          background: radial-gradient(circle at 35% 30%, #fff3b0, #e0a800); border: 3px solid #a87400; color: #7a5200;
          font-weight: 900; box-shadow: 0 4px 0 #a87400, 0 8px 14px rgba(0,0,0,.5); animation: qz-spin 2.4s linear infinite; }
        .qz-btn { transform-style: preserve-3d; transition: transform .12s ease, box-shadow .12s ease;
          box-shadow: 0 6px 0 #1e3a8a, 0 12px 18px rgba(0,0,0,.45); }
        .qz-btn:hover { transform: translateY(-3px) rotateX(8deg); box-shadow: 0 9px 0 #1e3a8a, 0 16px 22px rgba(0,0,0,.5); }
        .qz-btn:active { transform: translateY(5px); box-shadow: 0 1px 0 #1e3a8a, 0 3px 6px rgba(0,0,0,.5); }
      `}</style>

      <div className="flex items-center gap-4">
        <span className="qz-coin">₿</span>
        <div>
          <div className="text-sm text-gray-400">মোট কয়েন</div>
          <div className="text-3xl font-mono text-yellow-400">{wallet}</div>
        </div>
      </div>

      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform .15s ease-out, background .3s',
          background: flash === 'ok' ? 'linear-gradient(145deg,#14532d,#166534)' : flash === 'bad' ? 'linear-gradient(145deg,#7f1d1d,#991b1b)' : 'linear-gradient(145deg,#1e293b,#0f172a)',
          border: '2px solid #3b82f6',
          boxShadow: '0 20px 0 -6px #0b1220, 0 34px 50px rgba(0,0,0,.65)',
          animation: flash === 'bad' ? 'qz-shake .3s' : undefined,
        }}
      >
        <div style={{ transform: 'translateZ(30px)' }}>
          <p className="text-sm text-gray-300 mb-1">{msg}</p>
          <p className="text-xs text-gray-500 mb-5">লেভেল {level} · স্ট্রিক {streak} · সেরা স্ট্রিক {bestStreak}</p>
          <div className="text-6xl font-black mb-8" style={{ textShadow: '0 4px 0 #1d4ed8, 0 10px 18px rgba(0,0,0,.6)' }}>
            {q.text} = ?
          </div>
          <div className="grid grid-cols-3 gap-4">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => answer(opt)} className="qz-btn bg-blue-600 py-4 rounded-xl font-black text-2xl">
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 max-w-md text-center">
        সঠিক = +১০ কয়েন (স্ট্রিক বোনাস সহ), ভুল = −৫ কয়েন। কয়েন ব্রাউজারের localStorage এ সেভ হয় এবং রানার গেমের সাথে শেয়ার হয়।
      </p>
    </div>
  );
}

