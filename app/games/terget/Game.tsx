
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ---------- ক্যারেক্টার সেট ---------- */
const ENGLISH_ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BENGALI_VOWELS = "অআইঈউঊঋএঐওঔ".split("");
// ড় ঢ় য় দুটি কোডপয়েন্টের অক্ষর, তাই split("") ব্যবহার না করে আলাদাভাবে দেওয়া হয়েছে
const BENGALI_CONSONANTS = [..."কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ", "ড়", "ঢ়", "য়"];
const BENGALI_NUMBERS = "০১২৩৪৫৬৭৮৯".split("");
const ENGLISH_NUMBERS = "0123456789".split("");

const ALL_CHARS = [
  ...ENGLISH_ALPHABETS,
  ...BENGALI_VOWELS,
  ...BENGALI_CONSONANTS,
  ...BENGALI_NUMBERS,
  ...ENGLISH_NUMBERS,
];

/* ---------- 3D টাইলের রঙ (face = উপরের পিঠ, side = পুরুত্ব) ---------- */
const PALETTE = [
  { face: '#22d3ee', side: '#0e7490' },
  { face: '#f472b6', side: '#9d174d' },
  { face: '#fbbf24', side: '#b45309' },
  { face: '#4ade80', side: '#15803d' },
  { face: '#a78bfa', side: '#5b21b6' },
  { face: '#fb923c', side: '#9a3412' },
];

const DEPTH = 9;
const buildShadow = (side: string, depth: number) =>
  Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${side}`).join(',') +
  `,0 ${depth + 10}px ${depth + 14}px rgba(0,0,0,.5)`;

// ৩×৩ গ্রিডের স্লট — যাতে টাইলগুলো একটার উপর আরেকটা না পড়ে
const SLOTS = [
  [20, 18], [50, 18], [80, 18],
  [20, 50], [50, 50], [80, 50],
  [20, 82], [50, 82], [80, 82],
];

const MAX_PLAYS_PER_DAY = 5;
const GAME_DURATION = 30;
const STORAGE_KEY = 'find_the_target_v2';

type Stats = {
  highScore: number;
  playsToday: number;
  lastDate: string;
  totalGames: number;
  lastScore: number;
  soundOn: boolean;
  voiceOn: boolean;
};

type Tile = {
  id: string; char: string; top: string; left: string;
  z: number; rx: number; ry: number; rot: number; ci: number;
};

const defaultStats = (): Stats => ({
  highScore: 0, playsToday: 0, lastDate: new Date().toDateString(), totalGames: 0, lastScore: 0, soundOn: true, voiceOn: true,
});

// localStorage থেকে সেভ করা ডাটা পড়া (প্রতিদিন playsToday রিসেট হবে)
const loadStats = (): Stats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = { ...defaultStats(), ...(raw ? JSON.parse(raw) : {}) } as Stats;
    if (base.lastDate !== new Date().toDateString()) {
      base.lastDate = new Date().toDateString();
      base.playsToday = 0;
    }
    return base;
  } catch {
    return defaultStats();
  }
};

const saveStats = (s: Stats) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* private mode ইত্যাদি */ }
};

/* ---------- সাউন্ড ইফেক্ট (Web Audio, কোনো ফাইল লাগে না) ---------- */
type Sfx = 'correct' | 'wrong' | 'start' | 'tick' | 'best' | 'over';
let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch { return null; }
};

const tone = (ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
};

const sfx = (kind: Sfx, on: boolean) => {
  if (!on) return;
  const ctx = getCtx();
  if (!ctx) return;
  switch (kind) {
    case 'correct': tone(ctx, 660, 0, 0.12); tone(ctx, 990, 0.08, 0.18); break;
    case 'wrong': tone(ctx, 180, 0, 0.25, 'sawtooth', 0.12); break;
    case 'start': tone(ctx, 440, 0, 0.1); tone(ctx, 554, 0.1, 0.1); tone(ctx, 660, 0.2, 0.2); break;
    case 'tick': tone(ctx, 880, 0, 0.06, 'square', 0.06); break;
    case 'best': [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, i * 0.12, 0.25)); break;
    case 'over': [392, 330, 262].forEach((f, i) => tone(ctx, f, i * 0.15, 0.25, 'triangle')); break;
  }
};

/* ---------- টেক্সট টু স্পিচ (ব্রাউজারের বিল্ট-ইন ভয়েস) ---------- */
const hasBengali = (s: string) => /[\u0980-\u09FF]/.test(s);
let warnedNoBangla = false;

const stopSpeak = () => {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
};

const speak = (text: string, on: boolean) => {
  if (!on || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const bn = hasBengali(text);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bn ? 'bn-BD' : 'en-US';
    u.rate = 0.85;
    const voices = synth.getVoices();
    const v = voices.find((x) => x.lang.toLowerCase().replace('_', '-').startsWith(bn ? 'bn' : 'en'));
    if (v) u.voice = v;
    else if (bn && voices.length > 0 && !warnedNoBangla) {
      warnedNoBangla = true;
      toast.info('এই ডিভাইসে বাংলা ভয়েস পাওয়া যায়নি। ফোন/পিসির Text-to-speech সেটিংসে বাংলা ভয়েস ইনস্টল করুন।', { theme: 'dark', autoClose: 5000 });
    }
    synth.speak(u);
  } catch { /* ignore */ }
};

const SidebarContent = () => (
  <div className="flex h-full flex-col text-white">
    <h2 className="mb-6 border-b border-white/10 pb-4 text-2xl font-black text-cyan-400">🎮 গেমের নিয়মাবলী</h2>
    <ul className="space-y-6 text-sm text-gray-300">
      <li className="flex items-start"><span className="mr-4 text-2xl">🎯</span>
        <p><strong className="mb-1 block text-base text-white">কী খুঁজতে হবে?</strong>স্ক্রিনের উপরে দেওয়া অক্ষর (বাংলা/ইংরেজি) বা সংখ্যাটি ভাসমান ৩D টাইলগুলো থেকে দ্রুত খুঁজে বের করুন।</p></li>
      <li className="flex items-start"><span className="mr-4 text-2xl">✅</span>
        <p><strong className="mb-1 block text-base text-green-400">পয়েন্ট যোগ (+১০)</strong>সঠিক টাইলে ক্লিক করলে ১০ পয়েন্ট।</p></li>
      <li className="flex items-start"><span className="mr-4 text-2xl">❌</span>
        <p><strong className="mb-1 block text-base text-red-400">পয়েন্ট কাটা (-৫)</strong>ভুল টাইলে ক্লিক করলে ৫ পয়েন্ট কাটা যাবে।</p></li>
      <li className="flex items-start"><span className="mr-4 text-2xl">⏱️</span>
        <p><strong className="mb-1 block text-base text-white">সময়সীমা</strong>মোট ৩০ সেকেন্ড। দিনে ৫ বার খেলা যাবে।</p></li>
    </ul>
  </div>
);

export default function Game() {
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState<Stats>(defaultStats());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [targetChar, setTargetChar] = useState('');
  const [tiles, setTiles] = useState<Tile[]>([]);

  const scoreRef = useRef(0);
  const statsRef = useRef<Stats>(stats);

  const commitStats = useCallback((next: Stats) => {
    statsRef.current = next;
    setStats(next);
    saveStats(next);
  }, []);

  useEffect(() => {
    const s = loadStats();
    statsRef.current = s;
    setStats(s);
    saveStats(s);
    setIsMounted(true);
  }, []);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setTiles([]);
    const finalScore = scoreRef.current;
    const prev = statsRef.current;
    const isNewBest = finalScore > prev.highScore;
    commitStats({
      ...prev,
      playsToday: prev.playsToday + 1,
      totalGames: prev.totalGames + 1,
      lastScore: finalScore,
      highScore: isNewBest ? finalScore : prev.highScore,
    });
    stopSpeak();
    sfx(isNewBest ? 'best' : 'over', prev.soundOn);
    if (isNewBest) toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${finalScore} 🏆`, { theme: 'dark', autoClose: 4000 });
    else toast.warning(`গেম ওভার! আপনার স্কোর: ${finalScore}`, { theme: 'dark', autoClose: 3000 });
  }, [commitStats]);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) { endGame(); return; }
    if (timeLeft <= 5) sfx('tick', statsRef.current.soundOn);
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, timeLeft, endGame]);

  const generateLevel = () => {
    const target = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
    const decoys: string[] = [];
    while (decoys.length < 6) {
      const c = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
      if (c !== target && !decoys.includes(c)) decoys.push(c);
    }
    const chars = [target, ...decoys].sort(() => Math.random() - 0.5);
    const slots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, chars.length);

    setTargetChar(target);
    speak(target, statsRef.current.voiceOn);
    setTiles(chars.map((char, i) => ({
      id: Math.random().toString(36).slice(2, 9),
      char,
      left: `${slots[i][0] + (Math.random() * 8 - 4)}%`,
      top: `${slots[i][1] + (Math.random() * 8 - 4)}%`,
      z: Math.floor(Math.random() * 50),
      rx: Math.floor(Math.random() * 24) - 12,
      ry: Math.floor(Math.random() * 24) - 12,
      rot: Math.floor(Math.random() * 30) - 15,
      ci: Math.floor(Math.random() * PALETTE.length),
    })));
  };

  const startGame = () => {
    if (stats.playsToday >= MAX_PLAYS_PER_DAY) {
      toast.error('আজকের খেলার লিমিট শেষ! 🔒', { theme: 'dark' });
      return;
    }
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    sfx('start', statsRef.current.soundOn);
    generateLevel();
    toast.info('গেম শুরু! সঠিক অক্ষর বা সংখ্যাটি খুঁজুন 🚀', {
      theme: 'dark', position: 'top-center', autoClose: 1500, hideProgressBar: true,
    });
  };

  const handleTileClick = (char: string, e: React.PointerEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (char === targetChar) {
      sfx('correct', statsRef.current.soundOn);
      scoreRef.current += 10;
      setScore(scoreRef.current);
      generateLevel();
    } else {
      sfx('wrong', statsRef.current.soundOn);
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(scoreRef.current);
      setShake(true);
      setTimeout(() => setShake(false), 300);
      toast.error('ভুল! -৫ পয়েন্ট ❌', { theme: 'colored', autoClose: 500, hideProgressBar: true, position: 'bottom-center' });
    }
  };

  const toggle = (key: 'soundOn' | 'voiceOn') => {
    const next = { ...statsRef.current, [key]: !statsRef.current[key] };
    commitStats(next);
    if (key === 'voiceOn' && !next.voiceOn) stopSpeak();
    if (key === 'soundOn' && next.soundOn) sfx('correct', true);
  };

  if (!isMounted) return null;
  const limitReached = stats.playsToday >= MAX_PLAYS_PER_DAY;

  return (
    <div className="flex min-h-[100dvh] w-full touch-manipulation select-none overflow-hidden bg-[#070712] font-sans">
      <style>{`
        .tbtn { position:absolute; padding:0; border:0; background:none; cursor:pointer; transform-style:preserve-3d; -webkit-tap-highlight-color:transparent; }
        .tile { display:flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:18px;
          font-weight:900; font-size:34px; color:#0b1020; box-shadow:var(--sh); transform:translateY(0);
          transition:transform .08s, box-shadow .08s; text-shadow:0 2px 0 rgba(255,255,255,.45); border-top:2px solid rgba(255,255,255,.55); }
        .tbtn:active .tile { transform:translateY(${DEPTH - 2}px); box-shadow:var(--shp); }
        .tbtn:focus-visible .tile { outline:3px solid #fff; outline-offset:3px; }
        @media (min-width:640px){ .tile{ width:72px; height:72px; font-size:38px; } }
        .target3d { color:#fff; text-shadow:0 1px 0 #67e8f9,0 2px 0 #22d3ee,0 3px 0 #0e7490,0 4px 0 #155e75,0 5px 0 #164e63,0 6px 0 #083344,0 12px 18px rgba(0,0,0,.6); }
        @keyframes shake3d { 0%,100%{transform:rotateX(14deg)} 25%{transform:rotateX(14deg) translateX(-8px) rotateY(-3deg)} 75%{transform:rotateX(14deg) translateX(8px) rotateY(3deg)} }
        .stage { transform:rotateX(14deg); transform-style:preserve-3d; }
        .stage.shake { animation:shake3d .3s; }
        @media (prefers-reduced-motion: reduce){ .stage.shake{ animation:none; } .tile{ transition:none; } }
      `}</style>

      <ToastContainer />

      {/* PC Sidebar */}
      <aside className="z-20 hidden h-[100dvh] w-80 border-r border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative h-full w-[280px] border-r border-white/10 bg-gray-900/95 p-6 shadow-2xl">
            <button aria-label="বন্ধ করুন" onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white">✕</button>
            <div className="mt-8 h-full"><SidebarContent /></div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="relative flex flex-1 flex-col items-center justify-center sm:p-6">
        <button onClick={() => setIsSidebarOpen(true)} className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2 px-4 text-sm text-white shadow-lg backdrop-blur-md active:scale-95 lg:hidden">
          ☰ নিয়ম
        </button>

        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button
            onClick={() => toggle('soundOn')}
            aria-pressed={stats.soundOn}
            aria-label="সাউন্ড অন/অফ"
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-md active:scale-95"
          >
            {stats.soundOn ? '🔊 সাউন্ড' : '🔇 সাউন্ড'}
          </button>
          <button
            onClick={() => toggle('voiceOn')}
            aria-pressed={stats.voiceOn}
            aria-label="কণ্ঠস্বর অন/অফ"
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-md active:scale-95"
          >
            {stats.voiceOn ? '🗣️ ভয়েস' : '🤐 ভয়েস'}
          </button>
        </div>

        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden border-white/10 bg-gray-900/40 shadow-2xl backdrop-blur-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border">
          {/* Header */}
          <header className="z-10 rounded-b-3xl border-b border-white/10 bg-white/5 p-6 pb-4 pt-16 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md lg:pt-6">
            <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-center text-2xl font-black uppercase tracking-widest text-transparent">
              Find The Target
            </h1>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner">
              <div className="w-1/3 text-center">
                <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">SCORE</p>
                <p className="text-2xl font-black text-white sm:text-3xl">{score}</p>
              </div>
              <div className="w-1/3 border-x border-white/10 text-center">
                <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">TIME</p>
                <p className={`text-3xl font-black sm:text-4xl ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse text-red-400' : 'text-cyan-400'}`}>{timeLeft}</p>
              </div>
              <div className="w-1/3 text-center">
                <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">BEST</p>
                <p className="text-2xl font-black text-yellow-400 sm:text-3xl">{stats.highScore}</p>
              </div>
            </div>

            {isPlaying && (
              <>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/5 bg-black/50">
                  <div className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                    style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }} />
                </div>
                <div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-3 text-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <p className="mb-1 text-sm text-cyan-200/80">খুঁজে বের করুন:</p>
                  <div className="flex items-center justify-center gap-3">
                    <p className="target3d text-5xl font-black" aria-live="polite">{targetChar}</p>
                    <button onClick={() => speak(targetChar, true)} aria-label="আবার শুনুন" className="rounded-full bg-white/10 p-2 text-xl active:scale-90">🔊</button>
                  </div>
                </div>
              </>
            )}
          </header>

          {/* Play area (3D stage) */}
          <section className="relative w-full flex-1 overflow-hidden" style={{ perspective: '900px' }} aria-label="গেম এরিয়া">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />

            {!isPlaying ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
                <button
                  onClick={startGame}
                  disabled={limitReached}
                  className="w-full max-w-[250px] rounded-2xl border-t-2 border-white/60 bg-cyan-400 px-8 py-4 text-2xl font-black text-slate-900 transition-all active:translate-y-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ boxShadow: limitReached ? '0 6px 0 #0e7490' : '0 8px 0 #0e7490, 0 18px 24px rgba(0,0,0,.5)' }}
                >
                  {limitReached ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}
                </button>
                <p className="mt-8 rounded-full border border-white/5 bg-black/40 px-4 py-2 text-center text-sm text-gray-400">
                  আজকের সুযোগ: {MAX_PLAYS_PER_DAY - stats.playsToday} বার বাকি
                </p>
                {stats.totalGames > 0 && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    মোট গেম: {stats.totalGames} · শেষ স্কোর: {stats.lastScore}
                  </p>
                )}
              </div>
            ) : (
              <div className={`stage absolute inset-0 ${shake ? 'shake' : ''}`}>
                {tiles.map((t) => {
                  const p = PALETTE[t.ci];
                  return (
                    <button
                      key={t.id}
                      className="tbtn"
                      aria-label={`অক্ষর ${t.char}`}
                      onPointerDown={(e) => handleTileClick(t.char, e)}
                      style={{
                        top: t.top, left: t.left,
                        transform: `translate(-50%,-50%) translateZ(${t.z}px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotateZ(${t.rot}deg)`,
                      }}
                    >
                      <span
                        className="tile"
                        style={{
                          background: `linear-gradient(145deg, ${p.face}, ${p.face}dd)`,
                          ['--sh' as string]: buildShadow(p.side, DEPTH),
                          ['--shp' as string]: buildShadow(p.side, 2),
                        } as React.CSSProperties}
                      >
                        {t.char}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}



// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// /* ---------- ক্যারেক্টার সেট ---------- */
// const ENGLISH_ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// const BENGALI_VOWELS = "অআইঈউঊঋএঐওঔ".split("");
// // ড় ঢ় য় দুটি কোডপয়েন্টের অক্ষর, তাই split("") ব্যবহার না করে আলাদাভাবে দেওয়া হয়েছে
// const BENGALI_CONSONANTS = [..."কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ", "ড়", "ঢ়", "য়"];
// const BENGALI_NUMBERS = "০১২৩৪৫৬৭৮৯".split("");
// const ENGLISH_NUMBERS = "0123456789".split("");

// const ALL_CHARS = [
//   ...ENGLISH_ALPHABETS,
//   ...BENGALI_VOWELS,
//   ...BENGALI_CONSONANTS,
//   ...BENGALI_NUMBERS,
//   ...ENGLISH_NUMBERS,
// ];

// /* ---------- 3D টাইলের রঙ (face = উপরের পিঠ, side = পুরুত্ব) ---------- */
// const PALETTE = [
//   { face: '#22d3ee', side: '#0e7490' },
//   { face: '#f472b6', side: '#9d174d' },
//   { face: '#fbbf24', side: '#b45309' },
//   { face: '#4ade80', side: '#15803d' },
//   { face: '#a78bfa', side: '#5b21b6' },
//   { face: '#fb923c', side: '#9a3412' },
// ];

// const DEPTH = 9;
// const buildShadow = (side: string, depth: number) =>
//   Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${side}`).join(',') +
//   `,0 ${depth + 10}px ${depth + 14}px rgba(0,0,0,.5)`;

// // ৩×৩ গ্রিডের স্লট — যাতে টাইলগুলো একটার উপর আরেকটা না পড়ে
// const SLOTS = [
//   [20, 18], [50, 18], [80, 18],
//   [20, 50], [50, 50], [80, 50],
//   [20, 82], [50, 82], [80, 82],
// ];

// const MAX_PLAYS_PER_DAY = 5;
// const GAME_DURATION = 30;
// const STORAGE_KEY = 'find_the_target_v2';

// type Stats = {
//   highScore: number;
//   playsToday: number;
//   lastDate: string;
//   totalGames: number;
//   lastScore: number;
// };

// type Tile = {
//   id: string; char: string; top: string; left: string;
//   z: number; rx: number; ry: number; rot: number; ci: number;
// };

// const defaultStats = (): Stats => ({
//   highScore: 0, playsToday: 0, lastDate: new Date().toDateString(), totalGames: 0, lastScore: 0,
// });

// // localStorage থেকে সেভ করা ডাটা পড়া (প্রতিদিন playsToday রিসেট হবে)
// const loadStats = (): Stats => {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     const base = { ...defaultStats(), ...(raw ? JSON.parse(raw) : {}) } as Stats;
//     if (base.lastDate !== new Date().toDateString()) {
//       base.lastDate = new Date().toDateString();
//       base.playsToday = 0;
//     }
//     return base;
//   } catch {
//     return defaultStats();
//   }
// };

// const saveStats = (s: Stats) => {
//   try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* private mode ইত্যাদি */ }
// };

// const SidebarContent = () => (
//   <div className="flex h-full flex-col text-white">
//     <h2 className="mb-6 border-b border-white/10 pb-4 text-2xl font-black text-cyan-400">🎮 গেমের নিয়মাবলী</h2>
//     <ul className="space-y-6 text-sm text-gray-300">
//       <li className="flex items-start"><span className="mr-4 text-2xl">🎯</span>
//         <p><strong className="mb-1 block text-base text-white">কী খুঁজতে হবে?</strong>স্ক্রিনের উপরে দেওয়া অক্ষর (বাংলা/ইংরেজি) বা সংখ্যাটি ভাসমান ৩D টাইলগুলো থেকে দ্রুত খুঁজে বের করুন।</p></li>
//       <li className="flex items-start"><span className="mr-4 text-2xl">✅</span>
//         <p><strong className="mb-1 block text-base text-green-400">পয়েন্ট যোগ (+১০)</strong>সঠিক টাইলে ক্লিক করলে ১০ পয়েন্ট।</p></li>
//       <li className="flex items-start"><span className="mr-4 text-2xl">❌</span>
//         <p><strong className="mb-1 block text-base text-red-400">পয়েন্ট কাটা (-৫)</strong>ভুল টাইলে ক্লিক করলে ৫ পয়েন্ট কাটা যাবে।</p></li>
//       <li className="flex items-start"><span className="mr-4 text-2xl">⏱️</span>
//         <p><strong className="mb-1 block text-base text-white">সময়সীমা</strong>মোট ৩০ সেকেন্ড। দিনে ৫ বার খেলা যাবে।</p></li>
//     </ul>
//   </div>
// );

// export default function Game() {
//   const [score, setScore] = useState(0);
//   const [stats, setStats] = useState<Stats>(defaultStats());
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [shake, setShake] = useState(false);
//   const [targetChar, setTargetChar] = useState('');
//   const [tiles, setTiles] = useState<Tile[]>([]);

//   const scoreRef = useRef(0);
//   const statsRef = useRef<Stats>(stats);

//   const commitStats = useCallback((next: Stats) => {
//     statsRef.current = next;
//     setStats(next);
//     saveStats(next);
//   }, []);

//   useEffect(() => {
//     const s = loadStats();
//     statsRef.current = s;
//     setStats(s);
//     saveStats(s);
//     setIsMounted(true);
//   }, []);

//   const endGame = useCallback(() => {
//     setIsPlaying(false);
//     setTiles([]);
//     const finalScore = scoreRef.current;
//     const prev = statsRef.current;
//     const isNewBest = finalScore > prev.highScore;
//     commitStats({
//       ...prev,
//       playsToday: prev.playsToday + 1,
//       totalGames: prev.totalGames + 1,
//       lastScore: finalScore,
//       highScore: isNewBest ? finalScore : prev.highScore,
//     });
//     if (isNewBest) toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${finalScore} 🏆`, { theme: 'dark', autoClose: 4000 });
//     else toast.warning(`গেম ওভার! আপনার স্কোর: ${finalScore}`, { theme: 'dark', autoClose: 3000 });
//   }, [commitStats]);

//   useEffect(() => {
//     if (!isPlaying) return;
//     if (timeLeft <= 0) { endGame(); return; }
//     const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
//     return () => clearTimeout(t);
//   }, [isPlaying, timeLeft, endGame]);

//   const generateLevel = () => {
//     const target = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
//     const decoys: string[] = [];
//     while (decoys.length < 6) {
//       const c = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
//       if (c !== target && !decoys.includes(c)) decoys.push(c);
//     }
//     const chars = [target, ...decoys].sort(() => Math.random() - 0.5);
//     const slots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, chars.length);

//     setTargetChar(target);
//     setTiles(chars.map((char, i) => ({
//       id: Math.random().toString(36).slice(2, 9),
//       char,
//       left: `${slots[i][0] + (Math.random() * 8 - 4)}%`,
//       top: `${slots[i][1] + (Math.random() * 8 - 4)}%`,
//       z: Math.floor(Math.random() * 50),
//       rx: Math.floor(Math.random() * 24) - 12,
//       ry: Math.floor(Math.random() * 24) - 12,
//       rot: Math.floor(Math.random() * 30) - 15,
//       ci: Math.floor(Math.random() * PALETTE.length),
//     })));
//   };

//   const startGame = () => {
//     if (stats.playsToday >= MAX_PLAYS_PER_DAY) {
//       toast.error('আজকের খেলার লিমিট শেষ! 🔒', { theme: 'dark' });
//       return;
//     }
//     scoreRef.current = 0;
//     setScore(0);
//     setTimeLeft(GAME_DURATION);
//     setIsPlaying(true);
//     generateLevel();
//     toast.info('গেম শুরু! সঠিক অক্ষর বা সংখ্যাটি খুঁজুন 🚀', {
//       theme: 'dark', position: 'top-center', autoClose: 1500, hideProgressBar: true,
//     });
//   };

//   const handleTileClick = (char: string, e: React.PointerEvent) => {
//     e.preventDefault();
//     if (!isPlaying) return;
//     if (char === targetChar) {
//       scoreRef.current += 10;
//       setScore(scoreRef.current);
//       generateLevel();
//     } else {
//       scoreRef.current = Math.max(0, scoreRef.current - 5);
//       setScore(scoreRef.current);
//       setShake(true);
//       setTimeout(() => setShake(false), 300);
//       toast.error('ভুল! -৫ পয়েন্ট ❌', { theme: 'colored', autoClose: 500, hideProgressBar: true, position: 'bottom-center' });
//     }
//   };

//   if (!isMounted) return null;
//   const limitReached = stats.playsToday >= MAX_PLAYS_PER_DAY;

//   return (
//     <div className="flex min-h-[100dvh] w-full touch-manipulation select-none overflow-hidden bg-[#070712] font-sans">
//       <style>{`
//         .tbtn { position:absolute; padding:0; border:0; background:none; cursor:pointer; transform-style:preserve-3d; -webkit-tap-highlight-color:transparent; }
//         .tile { display:flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:18px;
//           font-weight:900; font-size:34px; color:#0b1020; box-shadow:var(--sh); transform:translateY(0);
//           transition:transform .08s, box-shadow .08s; text-shadow:0 2px 0 rgba(255,255,255,.45); border-top:2px solid rgba(255,255,255,.55); }
//         .tbtn:active .tile { transform:translateY(${DEPTH - 2}px); box-shadow:var(--shp); }
//         .tbtn:focus-visible .tile { outline:3px solid #fff; outline-offset:3px; }
//         @media (min-width:640px){ .tile{ width:72px; height:72px; font-size:38px; } }
//         .target3d { color:#fff; text-shadow:0 1px 0 #67e8f9,0 2px 0 #22d3ee,0 3px 0 #0e7490,0 4px 0 #155e75,0 5px 0 #164e63,0 6px 0 #083344,0 12px 18px rgba(0,0,0,.6); }
//         @keyframes shake3d { 0%,100%{transform:rotateX(14deg)} 25%{transform:rotateX(14deg) translateX(-8px) rotateY(-3deg)} 75%{transform:rotateX(14deg) translateX(8px) rotateY(3deg)} }
//         .stage { transform:rotateX(14deg); transform-style:preserve-3d; }
//         .stage.shake { animation:shake3d .3s; }
//         @media (prefers-reduced-motion: reduce){ .stage.shake{ animation:none; } .tile{ transition:none; } }
//       `}</style>

//       <ToastContainer />

//       {/* PC Sidebar */}
//       <aside className="z-20 hidden h-[100dvh] w-80 border-r border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl lg:block">
//         <SidebarContent />
//       </aside>

//       {/* Mobile Sidebar */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-50 flex lg:hidden">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//           <div className="relative h-full w-[280px] border-r border-white/10 bg-gray-900/95 p-6 shadow-2xl">
//             <button aria-label="বন্ধ করুন" onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white">✕</button>
//             <div className="mt-8 h-full"><SidebarContent /></div>
//           </div>
//         </div>
//       )}

//       {/* Main */}
//       <main className="relative flex flex-1 flex-col items-center justify-center sm:p-6">
//         <button onClick={() => setIsSidebarOpen(true)} className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2 px-4 text-sm text-white shadow-lg backdrop-blur-md active:scale-95 lg:hidden">
//           ☰ নিয়ম
//         </button>

//         <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden border-white/10 bg-gray-900/40 shadow-2xl backdrop-blur-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border">
//           {/* Header */}
//           <header className="z-10 rounded-b-3xl border-b border-white/10 bg-white/5 p-6 pb-4 pt-16 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md lg:pt-6">
//             <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-center text-2xl font-black uppercase tracking-widest text-transparent">
//               Find The Target
//             </h1>
//             <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner">
//               <div className="w-1/3 text-center">
//                 <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">SCORE</p>
//                 <p className="text-2xl font-black text-white sm:text-3xl">{score}</p>
//               </div>
//               <div className="w-1/3 border-x border-white/10 text-center">
//                 <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">TIME</p>
//                 <p className={`text-3xl font-black sm:text-4xl ${timeLeft <= 10 && timeLeft > 0 ? 'animate-pulse text-red-400' : 'text-cyan-400'}`}>{timeLeft}</p>
//               </div>
//               <div className="w-1/3 text-center">
//                 <p className="mb-1 text-[10px] font-semibold text-cyan-200/70 sm:text-xs">BEST</p>
//                 <p className="text-2xl font-black text-yellow-400 sm:text-3xl">{stats.highScore}</p>
//               </div>
//             </div>

//             {isPlaying && (
//               <>
//                 <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-white/5 bg-black/50">
//                   <div className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
//                     style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }} />
//                 </div>
//                 <div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-3 text-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
//                   <p className="mb-1 text-sm text-cyan-200/80">খুঁজে বের করুন:</p>
//                   <p className="target3d text-5xl font-black" aria-live="polite">{targetChar}</p>
//                 </div>
//               </>
//             )}
//           </header>

//           {/* Play area (3D stage) */}
//           <section className="relative w-full flex-1 overflow-hidden" style={{ perspective: '900px' }} aria-label="গেম এরিয়া">
//             <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />

//             {!isPlaying ? (
//               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
//                 <button
//                   onClick={startGame}
//                   disabled={limitReached}
//                   className="w-full max-w-[250px] rounded-2xl border-t-2 border-white/60 bg-cyan-400 px-8 py-4 text-2xl font-black text-slate-900 transition-all active:translate-y-2 disabled:cursor-not-allowed disabled:opacity-50"
//                   style={{ boxShadow: limitReached ? '0 6px 0 #0e7490' : '0 8px 0 #0e7490, 0 18px 24px rgba(0,0,0,.5)' }}
//                 >
//                   {limitReached ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}
//                 </button>
//                 <p className="mt-8 rounded-full border border-white/5 bg-black/40 px-4 py-2 text-center text-sm text-gray-400">
//                   আজকের সুযোগ: {MAX_PLAYS_PER_DAY - stats.playsToday} বার বাকি
//                 </p>
//                 {stats.totalGames > 0 && (
//                   <p className="mt-3 text-center text-xs text-gray-500">
//                     মোট গেম: {stats.totalGames} · শেষ স্কোর: {stats.lastScore}
//                   </p>
//                 )}
//               </div>
//             ) : (
//               <div className={`stage absolute inset-0 ${shake ? 'shake' : ''}`}>
//                 {tiles.map((t) => {
//                   const p = PALETTE[t.ci];
//                   return (
//                     <button
//                       key={t.id}
//                       className="tbtn"
//                       aria-label={`অক্ষর ${t.char}`}
//                       onPointerDown={(e) => handleTileClick(t.char, e)}
//                       style={{
//                         top: t.top, left: t.left,
//                         transform: `translate(-50%,-50%) translateZ(${t.z}px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotateZ(${t.rot}deg)`,
//                       }}
//                     >
//                       <span
//                         className="tile"
//                         style={{
//                           background: `linear-gradient(145deg, ${p.face}, ${p.face}dd)`,
//                           ['--sh' as string]: buildShadow(p.side, DEPTH),
//                           ['--shp' as string]: buildShadow(p.side, 2),
//                         } as React.CSSProperties}
//                       >
//                         {t.char}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </section>
//         </div>
//       </main>
//     </div>
//   );
// }
