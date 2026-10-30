'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

/* ===================== টাইপ ===================== */
type BoardEntry = { name: string; points: number; eaten: number; rounds: number };
type Store = { day: string; plays: number; board: Record<string, BoardEntry> };
type Player = { name: string; scares: number };
type Answer = { name: string; text: string; q: string };
type SfxFn = (c: AudioContext, v?: number) => void;
type WinAC = Window & { webkitAudioContext?: typeof AudioContext };

/* ===================== সাউন্ড ===================== */
const mkNoise = (ctx: AudioContext, dur: number): AudioBufferSourceNode => {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  return s;
};
const tone = (ctx: AudioContext, type: OscillatorType, f0: number, f1: number, dur: number, vol: number) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
};
const burst = (ctx: AudioContext, dur: number, vol: number, freq: number, type?: BiquadFilterType) => {
  const n = mkNoise(ctx, dur);
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  const t = ctx.currentTime;
  f.type = type || 'lowpass';
  f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  n.start(t);
};
const SFX: Record<string, SfxFn> = {
  heartbeat: (c) => {
    tone(c, 'sine', 70, 40, 0.18, 0.55);
    setTimeout(() => { try { tone(c, 'sine', 65, 38, 0.2, 0.4); } catch (e) {} }, 220);
  },
  creak: (c) => tone(c, 'sawtooth', 80, 160, 1.8, 0.05),
  whisper: (c) => burst(c, 1.8, 0.25, 1800, 'bandpass'),
  thunder: (c) => burst(c, 3, 0.7, 160, 'lowpass'),
  knock: (c) => {
    [0, 250, 500].forEach((d) => setTimeout(() => { try { tone(c, 'square', 120, 60, 0.08, 0.3); } catch (e) {} }, d));
  },
  gulp: (c) => {
    tone(c, 'sine', 220, 40, 0.7, 0.6);
    burst(c, 0.6, 0.4, 300, 'lowpass');
  },
  chomp: (c) => {
    [0, 180, 360].forEach((d) => setTimeout(() => { try { tone(c, 'square', 160, 50, 0.1, 0.35); burst(c, 0.08, 0.4, 1500, 'bandpass'); } catch (e) {} }, d));
  },
  crackle: (c) => burst(c, 0.03, 0.12 + Math.random() * 0.15, 3000, 'highpass'),
  scream: (c, v = 0) => {
    tone(c, 'sawtooth', 700 + v * 150, 150, 1.5, 0.35);
    tone(c, 'square', 1300 - v * 120, 300, 1.1, 0.15);
    burst(c, 1.3, 0.6, 4000, 'highpass');
  },
};
const startAmbient = (ctx: AudioContext) => {
  [55, 82.5].forEach((f) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
  });
  const w = mkNoise(ctx, 4);
  w.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 300;
  const wg = ctx.createGain();
  wg.gain.value = 0.06;
  w.connect(lp);
  lp.connect(wg);
  wg.connect(ctx.destination);
  w.start();
};

/* ===================== ভয়ংকর ভূত (SVG) ===================== */
const Drip = ({ d, w = 7, delay = 0 }: { d: string; w?: number; delay?: number }) => (
  <path d={d} stroke="#a00000" strokeWidth={w} strokeLinecap="round" fill="none" className="dr" style={{ animationDelay: delay + 's' }} />
);

const G0 = () => (
  <svg viewBox="0 0 300 400">
    <path d="M30 400C0 220 30 20 150 14C270 20 300 220 270 400Z" fill="#050505" />
    <ellipse cx="150" cy="195" rx="60" ry="84" fill="#dfe3e1" />
    <path d="M92 150C110 60 190 60 208 150C190 110 110 110 92 150Z" fill="#050505" />
    <ellipse cx="124" cy="178" rx="18" ry="26" fill="#000" />
    <ellipse cx="176" cy="178" rx="18" ry="26" fill="#000" />
    <circle cx="124" cy="182" r="3" fill="#fff" />
    <circle cx="176" cy="182" r="3" fill="#fff" />
    <ellipse cx="150" cy="262" rx="22" ry="46" fill="#1a0000" />
    <ellipse cx="150" cy="275" rx="12" ry="26" fill="#000" />
    <Drip d="M124 200C118 260 130 330 124 400" />
    <Drip d="M176 200C184 270 170 340 178 400" delay={0.3} />
    <Drip d="M150 300C146 340 154 370 150 400" w={9} delay={0.6} />
    <path d="M70 120C60 250 80 330 70 400M230 120C240 250 220 330 230 400" stroke="#000" strokeWidth="10" fill="none" />
  </svg>
);

const G1 = () => (
  <svg viewBox="0 0 300 400">
    <defs>
      <filter id="gl"><feGaussianBlur stdDeviation="5" /></filter>
    </defs>
    <path d="M88 130C50 60 70 20 90 8C90 60 120 90 135 105Z" fill="#2b0c0c" />
    <path d="M212 130C250 60 230 20 210 8C210 60 180 90 165 105Z" fill="#2b0c0c" />
    <ellipse cx="150" cy="200" rx="72" ry="92" fill="#cbb899" />
    <path d="M150 108L142 150L156 175M96 160L120 172M208 170L184 178" stroke="#3b2a18" strokeWidth="3" fill="none" />
    <ellipse cx="118" cy="185" rx="22" ry="17" fill="#000" />
    <ellipse cx="182" cy="185" rx="22" ry="17" fill="#000" />
    <circle cx="118" cy="185" r="12" fill="#f00" filter="url(#gl)" />
    <circle cx="182" cy="185" r="12" fill="#f00" filter="url(#gl)" />
    <circle cx="118" cy="185" r="5" fill="#ff0" />
    <circle cx="182" cy="185" r="5" fill="#ff0" />
    <path d="M140 225L150 205L160 225Z" fill="#000" />
    <path d="M88 258Q150 305 212 258L212 290Q150 345 88 290Z" fill="#000" />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={'M' + (96 + i * 13) + ' ' + (268 + Math.sin((i / 8) * Math.PI) * 28) + 'l6 24l6 -24z'} fill="#f1e8cf" />
    ))}
    <Drip d="M110 310C106 350 114 380 110 400" />
    <Drip d="M190 310C196 350 188 380 192 400" delay={0.4} w={9} />
  </svg>
);

const G2 = () => (
  <svg viewBox="0 0 300 400">
    <path d="M20 400L52 130C70 10 230 10 248 130L280 400Z" fill="#0a0a10" />
    <ellipse cx="150" cy="200" rx="66" ry="86" fill="#000" />
    <ellipse cx="150" cy="205" rx="52" ry="70" fill="#e6e4dc" />
    <ellipse cx="124" cy="185" rx="16" ry="24" fill="#000" transform="rotate(-18 124 185)" />
    <ellipse cx="176" cy="185" rx="16" ry="24" fill="#000" transform="rotate(18 176 185)" />
    <circle cx="124" cy="190" r="4" fill="#f00" />
    <circle cx="176" cy="190" r="4" fill="#f00" />
    <path d="M150 140L140 170L152 190" stroke="#555" strokeWidth="2" fill="none" />
    <path d="M108 252Q150 232 192 252" stroke="#000" strokeWidth="4" fill="none" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={'M' + (114 + i * 10) + ' 240l0 26'} stroke="#000" strokeWidth="3" />
    ))}
    <Drip d="M124 205C118 270 130 340 124 400" />
    <Drip d="M176 205C184 270 170 340 178 400" delay={0.3} />
    <Drip d="M150 262C146 320 154 360 150 400" w={9} delay={0.7} />
  </svg>
);

const EYES: [number, number, number][] = [[110, 120, 16], [180, 110, 12], [85, 175, 10], [215, 170, 13], [150, 150, 9], [140, 205, 7]];

const G3 = () => (
  <svg viewBox="0 0 300 400">
    <path d="M60 400C40 300 50 200 70 130C100 40 200 40 230 130C250 200 260 300 240 400C230 340 215 340 205 400C195 330 180 330 170 400C160 340 140 340 130 400C120 330 100 330 90 400C80 340 70 340 60 400Z" fill="#aab8a2" />
    {EYES.map(([x, y, r], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill="#fff" />
        <circle cx={x + 2} cy={y + 2} r={r / 2.2} fill="#000" />
        <path d={'M' + (x - r) + ' ' + y + 'Q' + x + ' ' + (y - r * 1.5) + ' ' + (x + r) + ' ' + y} stroke="#7a0000" fill="none" strokeWidth="2" />
      </g>
    ))}
    <path d="M85 250Q150 380 215 250Q150 300 85 250Z" fill="#000" />
    <path d="M100 262L108 285L116 266M130 272L138 300L146 274M160 274L168 300L176 272M186 266L194 285L202 260" stroke="#eee" strokeWidth="5" fill="none" />
    <Drip d="M110 120C100 200 120 300 112 400" w={6} />
    <Drip d="M180 110C190 200 170 300 178 400" delay={0.5} />
    <Drip d="M150 330C146 360 154 380 150 400" w={9} delay={0.8} />
  </svg>
);

const GHOSTS = [G0, G1, G2, G3];
const KEY = 'cc3d_v2';
const DAILY = 10;
const MOUTH = [66, 70, 66, 67];
const emptyStore: Store = { day: '', plays: 0, board: {} };
const dayKey = (): string => {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
};
const speak = (name: string) => {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    const bn = s.getVoices().find((v) => v.lang && v.lang.toLowerCase().indexOf('bn') === 0);
    const text = bn ? name + '... ' + name + '... আমি তোমাকে খেয়ে ফেললাম' : name + '... ' + name + '... I ate you';
    const u = new SpeechSynthesisUtterance(text);
    if (bn) u.voice = bn;
    u.lang = bn ? bn.lang : 'en-US';
    u.pitch = 0.1;
    u.rate = 0.7;
    u.volume = 1;
    s.cancel();
    s.speak(u);
  } catch (e) {}
};

/* ===================== রক্তের ডিসপ্লে ===================== */
function Blood({ k, show }: { k: number; show: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!k) return undefined;
    const c = ref.current;
    if (!c) return undefined;
    const w = (c.width = window.innerWidth);
    const h = (c.height = window.innerHeight);
    const g = c.getContext('2d');
    if (!g) return undefined;
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.7;
      const r = 4 + Math.random() * 26;
      g.fillStyle = 'rgba(' + (100 + ((Math.random() * 60) | 0)) + ',0,0,0.85)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      for (let j = 0; j < 6; j++) {
        g.beginPath();
        g.arc(x + (Math.random() - 0.5) * r * 4, y + (Math.random() - 0.5) * r * 4, r * Math.random() * 0.35, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = 'rgba(120,0,0,0.55)';
    g.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      g.lineWidth = 30 + Math.random() * 50;
      const sx = Math.random() * w;
      const sy = Math.random() * h * 0.5;
      g.beginPath();
      g.moveTo(sx, sy);
      g.bezierCurveTo(sx + 80, sy + 120, sx - 80, sy + 240, sx + Math.random() * 120 - 60, sy + 360);
      g.stroke();
    }
    const drips = Array.from({ length: Math.max(20, Math.floor(w / 16)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.4,
      w: 3 + Math.random() * 13,
      s: 0.8 + Math.random() * 3.2,
      max: h * (0.2 + Math.random() * 0.6),
      l: 0,
    }));
    let raf = 0;
    const step = () => {
      let alive = false;
      drips.forEach((d) => {
        if (d.l < d.max) {
          alive = true;
          g.fillStyle = 'rgba(' + (110 + ((Math.random() * 40) | 0)) + ',0,0,0.93)';
          g.fillRect(d.x - d.w / 2, d.y + d.l, d.w, d.s + 1);
          d.l += d.s;
          if (d.l >= d.max) {
            g.beginPath();
            g.arc(d.x, d.y + d.l, d.w * 0.75, 0, Math.PI * 2);
            g.fill();
          }
        }
      });
      if (alive) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [k]);
  return <canvas ref={ref} className={'blood' + (show ? ' show' : '')} />;
}

/* ===================== মূল গেম ===================== */
export default function Page() {
  const [phase, setPhase] = useState<'setup' | 'game'>('setup');
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const [moving, setMoving] = useState<boolean>(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [ghost, setGhost] = useState<number>(-1);
  const [bloodKey, setBloodKey] = useState<number>(0);
  const [bloodShow, setBloodShow] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [victim, setVictim] = useState<string>('');
  const [store, setStore] = useState<Store>(emptyStore);
  const [loaded, setLoaded] = useState<boolean>(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ints = useRef<ReturnType<typeof setInterval>[]>([]);
  const bloodT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tm = timers.current;
    const it = ints.current;
    return () => {
      tm.forEach((t) => clearTimeout(t));
      it.forEach((t) => clearInterval(t));
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          const src = p.board && typeof p.board === 'object' ? p.board : {};
          const board: Record<string, BoardEntry> = {};
          Object.keys(src).forEach((k) => {
            const e = src[k];
            if (e && typeof e.name === 'string') {
              board[k] = { name: e.name.slice(0, 14), points: Number(e.points) || 0, eaten: Number(e.eaten) || 0, rounds: Number(e.rounds) || 0 };
            }
          });
          setStore({ day: typeof p.day === 'string' ? p.day : '', plays: Number(p.plays) || 0, board });
        }
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }, [store, loaded]);

  const left = Math.max(0, DAILY - (store.day === dayKey() ? store.plays : 0));
  const saved = Object.values(store.board).sort((a, b) => b.points - a.points);
  const pts = (n: string): number => (store.board['n_' + n] ? store.board['n_' + n].points : 0);
  const pick = (n: string) => setNames((arr) => {
    if (arr.includes(n)) return arr;
    const i = arr.findIndex((v) => !v.trim());
    if (i < 0) return arr;
    return arr.map((v, j) => (j === i ? n : v));
  });
  const bump = (fn: (s: Store) => Store) => setStore((s) => {
    const t = dayKey();
    const base: Store = s.day === t ? s : { ...s, day: t, plays: 0 };
    return fn(base);
  });
  const award = (name: string, delta: number, eatenInc: number) => bump((s) => {
    const k = 'n_' + name;
    const old: BoardEntry = s.board[k] || { name, points: 0, eaten: 0, rounds: 0 };
    return { ...s, board: { ...s.board, [k]: { ...old, points: Math.max(0, old.points + delta), eaten: old.eaten + eatenInc, rounds: old.rounds + 1 } } };
  });

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  const every = (fn: () => void, ms: number) => {
    ints.current.push(setInterval(fn, ms));
  };
  const play = (name: string, arg?: number) => {
    const c = ctxRef.current;
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      SFX[name](c, arg);
    } catch (e) {}
  };
  const doFlash = () => {
    setFlash(true);
    later(() => setFlash(false), 150);
    later(() => setFlash(true), 280);
    later(() => setFlash(false), 420);
  };

  const start = () => {
    if (left <= 0) return;
    const filled = names.map((n) => n.trim()).filter(Boolean).slice(0, 4);
    const list: Player[] = (filled.length ? filled : ['Player 1']).map((n) => ({ name: n.slice(0, 14), scares: 0 }));
    setPlayers(list);
    setTurn(0);
    bump((s) => {
      const board = { ...s.board };
      list.forEach((pl) => {
        const k = 'n_' + pl.name;
        if (!board[k]) board[k] = { name: pl.name, points: 0, eaten: 0, rounds: 0 };
      });
      return { ...s, board };
    });
    try { if (window.speechSynthesis) window.speechSynthesis.getVoices(); } catch (e) {}
    try {
      const AC = window.AudioContext || (window as WinAC).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        ctxRef.current = ctx;
        if (ctx.resume) ctx.resume();
        startAmbient(ctx);
      }
    } catch (e) {}
    every(() => play('crackle'), 450);
    every(() => {
      const r = Math.random();
      if (r < 0.2) { play('thunder'); doFlash(); }
      else if (r < 0.45) play('whisper');
      else if (r < 0.55) play('knock');
    }, 6000);
    setPhase('game');
  };

  const ask = () => {
    if (moving || ghost >= 0 || !players.length || left <= 0) return;
    const who = turn;
    bump((s) => ({ ...s, plays: s.plays + 1 }));
    setMoving(true);
    setAnswer(null);
    play('creak');
    play('whisper');
    const hb = setInterval(() => play('heartbeat'), 700);
    ints.current.push(hb);
    later(() => {
      clearInterval(hb);
      const yes = Math.random() < 0.5;
      setAngle(yes ? 32 : -32);
      setMoving(false);
      setAnswer({ name: players[who].name, text: yes ? 'YES' : 'NO', q: question.trim() });
      setTurn((who + 1) % players.length);
      const name = players[who].name;
      if (Math.random() < 0.45) {
        award(name, -10, 1);
        later(() => {
          const g = Math.floor(Math.random() * GHOSTS.length);
          setVictim(name);
          setGhost(g);
          setBloodKey((k) => k + 1);
          setBloodShow(true);
          setPlayers((ps) => ps.map((p, i) => (i === who ? { ...p, scares: p.scares + 1 } : p)));
          play('scream', g);
          play('thunder');
          doFlash();
          later(() => play('chomp'), 1800);
          later(() => play('gulp'), 2300);
          later(() => speak(name), 3300);
          if (bloodT.current) clearTimeout(bloodT.current);
          bloodT.current = later(() => setBloodShow(false), 11000);
        }, 900);
        later(() => setGhost(-1), 7200);
      } else {
        award(name, 10, 0);
      }
    }, 2800);
  };

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = tableRef.current;
    if (!el) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    el.style.transform = 'rotateX(' + (52 - y * 10) + 'deg) rotateZ(' + (-6 + x * 12) + 'deg)';
  };

  const GhostSvg = ghost >= 0 ? GHOSTS[ghost] : null;

  return (
    <main className={'room' + (ghost >= 0 ? ' scare' : '')} onPointerMove={onMove}>
      <style>{css}</style>

      {phase === 'setup' ? (
        <div className="intro">
          <h1>Charlie Charlie <span>3D</span></h1>
          <p>অন্ধকার ঘর • মোমবাতি • আত্মার উত্তর<br />সর্বোচ্চ ৪ জনের নাম দিন (ফাঁকা রাখলে বাদ যাবে)</p>
          <div className="names">
            {names.map((n, i) => (
              <input key={i} maxLength={14} value={n} placeholder={'Player ' + (i + 1)}
                onChange={(e) => setNames((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))} />
            ))}
          </div>
          {loaded && saved.length > 0 && (
            <div className="saved">
              <div>🏆 সেভ করা খেলোয়াড় (ট্যাপ করে নাম নিন)</div>
              {saved.slice(0, 8).map((sp) => (
                <button key={sp.name} className="chip" onClick={() => pick(sp.name)}>{sp.name} ⭐{sp.points}</button>
              ))}
            </div>
          )}
          {loaded && <small>আজ বাকি: {left}/{DAILY} বার</small>}
          <button className="btn" onClick={start} disabled={!loaded || left <= 0}>ঘরে ঢুকুন 🕯</button>
          {loaded && left <= 0 && <small>আজকের ১০ বার শেষ! কাল আবার আসুন 🌙</small>}
          <small>হেডফোন পরে খেললে বেশি ভয় পাবেন 👻</small>
        </div>
      ) : (
        <>
          <div className="scene">
            <div className="table" ref={tableRef}>
              <div className="paper">
                <span className="w a">yes</span><span className="w b">NO</span>
                <span className="w c">NO</span><span className="w d">yes</span>
                <div className="pencil bottom"><i /><b /></div>
                <div className={'pencil top' + (moving ? ' wobble' : '')}
                  style={moving ? undefined : { transform: 'translate(-50%,-50%) rotate(' + (90 + angle) + 'deg) translateZ(12px)' }}>
                  <i /><b />
                </div>
              </div>
            </div>
          </div>

          <div className="fog f1" /><div className="fog f2" />
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="dust" style={{ left: ((i * 37) % 100) + '%', animationDelay: (i % 7) * 0.9 + 's', animationDuration: 8 + (i % 5) * 2 + 's' }} />
          ))}

          <div className="candle"><div className="flame" /><div className="wax" /></div>
          <div className="dark" />
          <div className="grain" />

          <div className="hud">
            <div className="board">
              {players.map((p, i) => (
                <div key={i} className={i === turn ? 'me' : ''}>{p.name} <b>⭐ {pts(p.name)} · 😱 {p.scares}</b></div>
              ))}
            </div>
            <div className="turn">এখন পালা: <b>{players[turn] ? players[turn].name : ''}</b><br /><small>আজ বাকি {left}/{DAILY}</small></div>
          </div>

          <div className="ui">
            {answer && (
              <div className="ans">
                <small>{answer.name}{answer.q ? ' — ' + answer.q : ''}</small>
                <span>{answer.text}</span>
              </div>
            )}
            <input value={question} maxLength={60} onChange={(e) => setQuestion(e.target.value)}
              placeholder="প্রশ্ন লিখুন… (Charlie, are you here?)" />
            <button className="btn talk" onClick={ask} disabled={moving || ghost >= 0 || left <= 0}>
              🎙 {left <= 0 ? 'আজকের খেলা শেষ 🌙' : moving ? 'Charlie আসছে…' : 'TALK'}
            </button>
          </div>

          <Blood k={bloodKey} show={bloodShow} />

          {GhostSvg && (
            <div className="ghost">
              <div className="gwrap"><GhostSvg /></div>
              <div className="victim" style={{ '--my': (MOUTH[ghost] - 20) + 'vh' } as CSSProperties}>{victim}</div>
              <div className="maw" style={{ top: MOUTH[ghost] + 'vh' }} />
              <div className="eaten">
                <b>{victim}</b>
                <span>আমি তোমাকে খেয়ে ফেললাম… 🩸</span>
              </div>
            </div>
          )}
          {flash && <div className="flash" />}
        </>
      )}
    </main>
  );
}

const css = `
*{box-sizing:border-box}
html,body{margin:0;background:#000}
.room{position:relative;min-height:100vh;min-height:100dvh;overflow:hidden;color:#eee;font-family:system-ui,sans-serif;
  background:radial-gradient(ellipse at 85% 75%,#3a2410 0%,#0a0604 55%,#000 100%)}
.intro{position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;gap:14px}
.intro h1{font-size:clamp(2.2rem,9vw,4.5rem);color:#c22;text-shadow:0 0 25px #800,0 0 60px #400;margin:0;animation:glitch 3s infinite}
.intro h1 span{color:#fff}
@keyframes glitch{0%,92%,100%{transform:none;filter:none}94%{transform:translateX(-4px);filter:hue-rotate(60deg)}96%{transform:translateX(5px)}98%{transform:translateX(-2px);filter:blur(1px)}}
.names{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(92vw,420px)}
.names input,.ui input{padding:11px 14px;border-radius:10px;border:1px solid #6a2020;background:#150a0a;color:#eee;font-size:1rem;width:100%}
.btn{background:linear-gradient(#a01212,#5a0808);color:#fff;border:2px solid #d44;padding:12px 30px;border-radius:40px;font-size:1.1rem;cursor:pointer;box-shadow:0 0 22px #a00;animation:pulse 1.6s infinite}
.btn:disabled{opacity:.5;animation:none}
@keyframes pulse{50%{box-shadow:0 0 38px #f22}}
.scene{perspective:900px;display:flex;justify-content:center;padding-top:9vh}
.table{transform:rotateX(52deg) rotateZ(-6deg);transform-style:preserve-3d;transition:transform .15s}
.paper{position:relative;width:min(78vw,360px);height:min(78vw,360px);background:repeating-linear-gradient(#f3ead2 0 26px,#c9d6e8 27px 28px);
  box-shadow:0 30px 60px #000,0 0 50px rgba(255,170,60,.3);border-radius:4px;transform-style:preserve-3d}
.w{position:absolute;font:700 clamp(1.6rem,7vw,2.6rem) 'Comic Sans MS',cursive;color:#222}
.a{left:18%;top:14%}.b{right:18%;top:14%}.c{left:18%;bottom:14%}.d{right:18%;bottom:14%}
.pencil{position:absolute;left:50%;top:50%;width:88%;height:14px;display:flex;align-items:center;filter:drop-shadow(3px 6px 4px rgba(0,0,0,.6))}
.pencil b{flex:1;height:100%;background:linear-gradient(#f5c518,#d9a400 60%,#a87c00);border-radius:2px}
.pencil i{width:18px;height:100%;background:#e87a8c;border-radius:3px 0 0 3px}
.pencil.bottom{transform:translate(-50%,-50%) rotate(0deg)}
.pencil.top{transform:translate(-50%,-50%) rotate(90deg) translateZ(12px);transition:transform 1.2s ease}
.pencil.top.wobble{animation:wob 2.8s ease-in-out forwards}
@keyframes wob{0%{transform:translate(-50%,-50%) rotate(90deg) translateZ(12px)}
 15%{transform:translate(-50%,-50%) rotate(68deg) translateZ(26px)}
 35%{transform:translate(-50%,-50%) rotate(120deg) translateZ(30px)}
 55%{transform:translate(-50%,-50%) rotate(78deg) translateZ(24px)}
 80%{transform:translate(-50%,-50%) rotate(105deg) translateZ(20px)}
 100%{transform:translate(-50%,-50%) rotate(90deg) translateZ(12px)}}
.fog{position:absolute;inset:-20%;pointer-events:none;z-index:2;opacity:.18;filter:blur(30px)}
.f1{background:radial-gradient(circle at 30% 60%,#9ab 0,transparent 40%);animation:drift 22s linear infinite alternate}
.f2{background:radial-gradient(circle at 70% 40%,#89a 0,transparent 35%);animation:drift 30s linear infinite alternate-reverse}
@keyframes drift{from{transform:translateX(-8%)}to{transform:translateX(8%)}}
.dust{position:absolute;bottom:-10px;width:3px;height:3px;border-radius:50%;background:#ffd9a0;opacity:.5;z-index:3;pointer-events:none;animation:rise linear infinite}
@keyframes rise{from{transform:translateY(0)}to{transform:translateY(-105vh) translateX(30px)}}
.candle{position:absolute;right:6vw;bottom:24vh;width:34px;z-index:4}
.wax{height:90px;background:linear-gradient(90deg,#d9cfa8,#fff6d6,#c2b88f);border-radius:4px 4px 2px 2px}
.flame{width:16px;height:34px;margin:0 auto -4px;background:radial-gradient(ellipse at 50% 75%,#fff 0%,#ffd45a 35%,#ff7a00 70%,transparent 75%);
  border-radius:50% 50% 50% 50%/60% 60% 40% 40%;box-shadow:0 0 40px 18px rgba(255,150,30,.6);animation:fl .18s infinite alternate;transform-origin:50% 100%}
@keyframes fl{from{transform:scale(1,1) rotate(-3deg);opacity:.9}to{transform:scale(.88,1.1) rotate(3deg);opacity:1}}
.scare .flame{animation:none;transform:scale(.35);opacity:.6;box-shadow:0 0 10px 4px rgba(255,80,0,.4)}
.dark{position:absolute;inset:0;pointer-events:none;z-index:4;
  background:radial-gradient(circle at 85% 72%,transparent 0%,rgba(0,0,0,.55) 22%,rgba(0,0,0,.93) 55%,#000 85%);animation:fk 1.3s infinite alternate}
.scare .dark{background:radial-gradient(circle at 85% 72%,transparent 0%,rgba(0,0,0,.9) 15%,#000 50%)}
@keyframes fk{from{opacity:.93}to{opacity:1}}
.grain{position:absolute;inset:0;pointer-events:none;z-index:5;opacity:.12;mix-blend-mode:overlay;
  background:repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 3px);animation:gr .25s steps(2) infinite}
@keyframes gr{50%{transform:translateY(2px)}}
.hud{position:fixed;top:0;left:0;right:0;z-index:7;display:flex;justify-content:space-between;align-items:flex-start;padding:10px 12px;gap:8px;pointer-events:none}
.board{font-size:.8rem;background:rgba(0,0,0,.55);border:1px solid #411;border-radius:10px;padding:6px 10px;display:flex;flex-direction:column;gap:2px}
.board .me{color:#ff6b6b;font-weight:700}
.turn{background:rgba(90,8,8,.6);border:1px solid #a33;border-radius:10px;padding:6px 12px;font-size:.9rem}
.ui{position:fixed;left:0;right:0;bottom:0;z-index:8;display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 16px 18px;
  background:linear-gradient(transparent,rgba(0,0,0,.9))}
.ui input{width:min(92vw,420px)}
.ans{display:flex;flex-direction:column;align-items:center;animation:pop .5s}
.ans small{opacity:.8}
.ans span{font:800 clamp(2.4rem,10vw,4rem) serif;color:#e33;text-shadow:0 0 20px #f00}
@keyframes pop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
.blood{position:fixed;inset:0;width:100%;height:100%;z-index:15;pointer-events:none;opacity:0;transition:opacity 2.5s}
.blood.show{opacity:1;transition:opacity .2s}
.ghost{position:fixed;inset:0;z-index:20;overflow:hidden;background:radial-gradient(circle,rgba(90,0,0,.8),#000 75%)}
.gwrap{display:flex;align-items:center;justify-content:center;width:100%;height:100%;animation:shake .1s infinite}
.gwrap svg{height:90vh;max-width:96vw;filter:drop-shadow(0 0 30px rgba(255,255,255,.7)) contrast(1.2);animation:zoom 1.6s ease-out forwards,gh .4s infinite,lunge .5s 1.8s forwards}
@keyframes zoom{from{transform:scale(.2)}to{transform:scale(1.15)}}
@keyframes lunge{from{transform:scale(1.15)}to{transform:scale(1.5)}}
.victim{position:absolute;left:50%;top:20vh;z-index:2;font:800 clamp(1.6rem,7vw,3rem) serif;color:#fff;text-shadow:0 0 18px #f00;transform:translate(-50%,0);animation:suck 1.3s 1.5s ease-in forwards}
@keyframes suck{to{transform:translate(-50%,var(--my)) scale(.05);opacity:.2}}
.maw{position:absolute;left:50%;width:12vmin;height:12vmin;margin:-6vmin 0 0 -6vmin;border-radius:50%;z-index:3;background:radial-gradient(circle,#000 55%,#5a0000 100%);transform:scale(0);animation:maw 1.4s 1.8s ease-in forwards}
@keyframes maw{to{transform:scale(40)}}
.eaten{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px;opacity:0;animation:fadein 1s 3.3s forwards}
.eaten b{font:800 clamp(2rem,9vw,4rem) serif;color:#e22;text-shadow:0 0 25px #f00}
.eaten span{font-size:clamp(1.1rem,5vw,1.8rem);color:#fff}
@keyframes fadein{to{opacity:1}}
@keyframes gh{0%,100%{filter:drop-shadow(0 0 30px #fff) hue-rotate(0)}50%{filter:drop-shadow(0 0 40px #f00) hue-rotate(-20deg)}}
@keyframes shake{0%{transform:translate(5px,2px)}50%{transform:translate(-5px,-3px)}100%{transform:translate(3px,-4px)}}
.dr{stroke-dasharray:420;stroke-dashoffset:420;animation:dd 1.6s ease-in forwards}
@keyframes dd{to{stroke-dashoffset:0}}
.flash{position:fixed;inset:0;z-index:25;background:#fff;opacity:.85;pointer-events:none}
.saved{width:min(92vw,420px);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-size:.85rem}
.saved>div{width:100%;opacity:.85}
.chip{background:#1a0a0a;color:#eee;border:1px solid #733;border-radius:20px;padding:5px 12px;cursor:pointer}
@media (max-width:480px){.board{font-size:.7rem}.turn{font-size:.8rem}}
`;
