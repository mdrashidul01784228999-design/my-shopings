'use client';
import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROWS = 10;
const COLS = 7;
const MAX_PLAYS_PER_DAY = 5;
const GAME_DURATION = 15;
const EXTRA_PLAY_COST = 100; // লিমিট শেষ হলে এক্সট্রা চান্স কেনার দাম
const RECORD_BONUS = 50; // নতুন রেকর্ড করলে বোনাস কয়েন
const COIN_KEY = 'premium_coins'; // পোর্টালের সাথে শেয়ার করা localStorage key

type Color = { id: string; light: string; base: string; dark: string; glow: string };
const COLORS: Color[] = [
  { id: 'red', light: '#fecdd3', base: '#f43f5e', dark: '#9f1239', glow: 'rgba(244,63,94,0.75)' },
  { id: 'blue', light: '#a5f3fc', base: '#0ea5e9', dark: '#1e3a8a', glow: 'rgba(14,165,233,0.75)' },
  { id: 'green', light: '#bbf7d0', base: '#10b981', dark: '#065f46', glow: 'rgba(16,185,129,0.75)' },
  { id: 'yellow', light: '#fef08a', base: '#f59e0b', dark: '#9a3412', glow: 'rgba(245,158,11,0.75)' },
  { id: 'purple', light: '#f5d0fe', base: '#a855f7', dark: '#581c87', glow: 'rgba(168,85,247,0.75)' },
];
const colorOf = (id: string | null) => COLORS.find((c) => c.id === id);

type GridType = (string | null)[][];
type Pop = { id: number; r: number; c: number; color: string };
type Result = { score: number; earned: number; record: boolean };

/* ── ৩ডি গোলক ── */
function Sphere({ color, className = '', style = {} }: { color: Color; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle at 32% 28%, ${color.light} 0%, ${color.base} 42%, ${color.dark} 100%)`,
        boxShadow: `inset -4px -6px 10px ${color.dark}cc, inset 3px 3px 6px rgba(255,255,255,0.35), 0 8px 14px -4px ${color.glow}, 0 3px 0 ${color.dark}`,
        ...style,
      }}
    >
      <span className="absolute top-[12%] left-[20%] h-[22%] w-[30%] -rotate-[25deg] rounded-full bg-white/70 blur-[2px]" />
    </div>
  );
}

/* ── ৩ডি সোনার কয়েন আইকন ── */
function CoinIcon({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-black text-amber-900 shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        background: 'radial-gradient(circle at 30% 28%, #fff7d6, #fbbf24 45%, #b45309 100%)',
        boxShadow: 'inset 0 -3px 5px rgba(120,53,15,0.6), inset 0 2px 3px rgba(255,255,255,0.7), 0 4px 8px rgba(245,158,11,0.5), 0 2px 0 #92400e',
      }}
    >
      ৳
    </span>
  );
}

export default function BabulShooter() {
  const getEmptyGrid = (): GridType => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const [grid, setGrid] = useState<GridType>(getEmptyGrid());
  const [currentBubble, setCurrentBubble] = useState(COLORS[0]);
  const [nextBubble, setNextBubble] = useState(COLORS[1]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [playsToday, setPlaysToday] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [flyingBubbleColor, setFlyingBubbleColor] = useState('');
  const [flyStyle, setFlyStyle] = useState({ left: '50%', top: '100%', opacity: 0, duration: '0s' });
  const [pops, setPops] = useState<Pop[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [showCoinPanel, setShowCoinPanel] = useState(false);
  const [customCoin, setCustomCoin] = useState('');
  const [coinBump, setCoinBump] = useState(false);

  // stale-state এড়াতে refs
  const scoreRef = useRef(0);
  const highRef = useRef(0);
  const coinsRef = useRef(0);
  const playsRef = useRef(0);
  const playingRef = useRef(false);
  const popId = useRef(0);

  /* ── কয়েন সেভ (localStorage) ── */
  const saveCoins = (value: number) => {
    const v = Math.max(0, Math.min(Math.floor(value), 999_999_999));
    coinsRef.current = v;
    setCoins(v);
    setCoinBump(true);
    setTimeout(() => setCoinBump(false), 500);
    try {
      localStorage.setItem(COIN_KEY, String(v));
      window.dispatchEvent(new Event('coins-updated')); // পোর্টাল চাইলে এই ইভেন্ট শুনতে পারে
    } catch {}
  };

  const addCoins = (n: number) => {
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('সঠিক সংখ্যা লিখুন', { theme: 'dark' });
      return;
    }
    saveCoins(coinsRef.current + n);
    toast.success(`+${n.toLocaleString()} কয়েন যোগ হয়েছে 🪙`, { theme: 'dark', autoClose: 1500 });
  };

  /* ── লোড ── */
  useEffect(() => {
    setIsMounted(true);
    try {
      const hs = parseInt(localStorage.getItem('premium_bubble_highScore') || '0', 10) || 0;
      highRef.current = hs;
      setHighScore(hs);

      const c = parseInt(localStorage.getItem(COIN_KEY) || '0', 10) || 0;
      coinsRef.current = c;
      setCoins(c);

      const today = new Date().toDateString();
      if (localStorage.getItem('premium_bubble_lastDate') === today) {
        const p = parseInt(localStorage.getItem('premium_bubble_playsToday') || '0', 10) || 0;
        playsRef.current = p;
        setPlaysToday(p);
      } else {
        localStorage.setItem('premium_bubble_lastDate', today);
        localStorage.setItem('premium_bubble_playsToday', '0');
      }
    } catch {}

    // অন্য ট্যাবে কয়েন বদলালে সিঙ্ক
    const onStorage = (e: StorageEvent) => {
      if (e.key === COIN_KEY) {
        const v = parseInt(e.newValue || '0', 10) || 0;
        coinsRef.current = v;
        setCoins(v);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ── টাইমার ── */
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isPlaying]);

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const setPlays = (n: number) => {
    playsRef.current = n;
    setPlaysToday(n);
    try {
      localStorage.setItem('premium_bubble_playsToday', String(n));
    } catch {}
  };

  const startGame = () => {
    if (playsRef.current >= MAX_PLAYS_PER_DAY) {
      toast.error('আজকের লিমিট শেষ! 🔒', { theme: 'dark' });
      return;
    }
    setPlays(playsRef.current + 1); // শুরুতেই গণনা – মাঝপথে বের হয়ে লিমিট ফাঁকি দেওয়া যাবে না

    const initialGrid: GridType = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, () => (r < 3 ? getRandomColor().id : null))
    );
    setGrid(initialGrid);
    setCurrentBubble(getRandomColor());
    setNextBubble(getRandomColor());
    scoreRef.current = 0;
    setScore(0);
    setResult(null);
    setPops([]);
    setTimeLeft(GAME_DURATION);
    playingRef.current = true;
    setIsPlaying(true);
  };

  const finishGame = () => {
    if (!playingRef.current) return;
    playingRef.current = false;
    setIsPlaying(false);
    setIsShooting(false);

    const finalScore = scoreRef.current;
    const record = finalScore > highRef.current;
    const earned = Math.floor(finalScore / 10) + (record ? RECORD_BONUS : 0); // প্রতি বাবলে ১ কয়েন

    if (record) {
      highRef.current = finalScore;
      setHighScore(finalScore);
      try {
        localStorage.setItem('premium_bubble_highScore', String(finalScore));
      } catch {}
    }
    if (earned > 0) saveCoins(coinsRef.current + earned);
    setResult({ score: finalScore, earned, record });
  };

  const buyExtraPlay = () => {
    if (coinsRef.current < EXTRA_PLAY_COST) {
      toast.error(`কমপক্ষে ${EXTRA_PLAY_COST} কয়েন লাগবে`, { theme: 'dark' });
      return;
    }
    saveCoins(coinsRef.current - EXTRA_PLAY_COST);
    setPlays(Math.max(0, playsRef.current - 1));
    toast.success('এক্সট্রা চান্স যোগ হয়েছে 🎮', { theme: 'dark', autoClose: 1500 });
  };

  const findMatches = (r: number, c: number, color: string, g: GridType) => {
    const stack: number[][] = [[r, c]];
    const visited = new Set([`${r},${c}`]);
    const matches: number[][] = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur) continue;
      const [cr, cc] = cur;
      matches.push([cr, cc]);
      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited.has(`${nr},${nc}`) && g[nr][nc] === color) {
          visited.add(`${nr},${nc}`);
          stack.push([nr, nc]);
        }
      }
    }
    return matches;
  };

  const shootBubble = (colIndex: number) => {
    if (!isPlaying || isShooting) return;

    let targetRow = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][colIndex] !== null) {
        targetRow = r + 1;
        break;
      }
    }
    if (targetRow >= ROWS) {
      toast.warning('এই কলাম ভর্তি! অন্য কলামে শুট করুন', { theme: 'dark', autoClose: 900 });
      return;
    }

    setIsShooting(true);
    setFlyingBubbleColor(currentBubble.id);
    const targetLeft = `${(colIndex + 0.5) * (100 / COLS)}%`;
    const targetTop = `${(targetRow + 0.5) * (100 / ROWS)}%`;

    setFlyStyle({ left: '50%', top: '100%', opacity: 1, duration: '0s' });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setFlyStyle({ left: targetLeft, top: targetTop, opacity: 1, duration: '0.35s' }))
    );

    const shotColor = currentBubble;
    setTimeout(() => {
      setFlyStyle((p) => ({ ...p, opacity: 0, duration: '0s' }));
      if (!playingRef.current) return; // শট চলার সময় টাইম শেষ হলে বাতিল

      const newGrid = grid.map((row) => [...row]);
      newGrid[targetRow][colIndex] = shotColor.id;
      const matches = findMatches(targetRow, colIndex, shotColor.id, newGrid);

      if (matches.length >= 3) {
        const newPops: Pop[] = matches.map(([r, c]) => ({ id: popId.current++, r, c, color: shotColor.id }));
        matches.forEach(([r, c]) => (newGrid[r][c] = null));
        setPops((p) => [...p, ...newPops]);
        setTimeout(() => setPops((p) => p.filter((x) => !newPops.some((n) => n.id === x.id))), 450);

        scoreRef.current += matches.length * 10;
        setScore(scoreRef.current);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
      }

      setGrid(newGrid);
      setCurrentBubble(nextBubble);
      setNextBubble(getRandomColor());
      setIsShooting(false);
    }, 350);
  };

  if (!isMounted) return null;

  const limitReached = playsToday >= MAX_PLAYS_PER_DAY;
  const flying = colorOf(flyingBubbleColor);

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#050409] select-none touch-manipulation font-sans">
      <style>{`
        @keyframes floaty { 0%,100% { transform: translateY(0) rotate(0);} 50% { transform: translateY(-14px) rotate(6deg);} }
        @keyframes popOut { 0% { transform: scale(1); opacity: 1;} 40% { transform: scale(1.35); opacity: 1;} 100% { transform: scale(0); opacity: 0;} }
        @keyframes dropIn { from { transform: scale(0.3) translateY(-10px); opacity: 0;} to { transform: scale(1) translateY(0); opacity: 1;} }
        @keyframes coinSpin { 0% { transform: rotateY(0);} 100% { transform: rotateY(360deg);} }
        @keyframes rise { from { transform: translateY(24px) scale(0.92); opacity: 0;} to { transform: translateY(0) scale(1); opacity: 1;} }
        @keyframes shine { to { background-position: 200% center; } }
        .gold-text { background: linear-gradient(100deg,#fff7d6,#f5c542 30%,#fff 50%,#e8b04a 70%,#fff7d6); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shine 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>

      <ToastContainer autoClose={2000} hideProgressBar position="top-center" />

      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-[#120a24] via-[#0a0a18] to-[#05060d] sm:h-[860px] sm:max-w-[410px] sm:rounded-[3rem] sm:border-[10px] sm:border-[#15101f] shadow-[0_40px_90px_-20px_rgba(120,60,255,0.45),0_0_0_1px_rgba(255,255,255,0.06)]">
        {/* ব্যাকগ্রাউন্ড আলো */}
        <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/15 blur-[90px]" />

        {/* ───── হেডার ───── */}
        <header className="relative z-20 px-4 pt-8 pb-3 sm:pt-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-black tracking-wide gold-text">বাবুল শুটার</h1>

            <button
              type="button"
              onClick={() => setShowCoinPanel(true)}
              aria-label={`কয়েন ${coins}, কয়েন যোগ করুন`}
              className={`flex items-center gap-2 rounded-full border border-amber-300/30 bg-gradient-to-b from-amber-400/20 to-amber-700/10 py-1 pl-1.5 pr-1 shadow-[0_8px_18px_-6px_rgba(245,158,11,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform active:scale-95 ${coinBump ? 'scale-110' : ''}`}
            >
              <CoinIcon size={24} />
              <span className="text-sm font-black text-amber-200 tabular-nums">{coins.toLocaleString()}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-400 text-base font-black leading-none text-amber-900 shadow-[0_2px_0_#b45309]">
                +
              </span>
            </button>
          </div>

          <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_24px_-12px_rgba(0,0,0,0.8)]">
            <div className="text-center border-r border-white/10">
              <p className="text-[10px] text-gray-400 font-bold">স্কোর</p>
              <p className="text-xl font-black text-white tabular-nums">{score}</p>
            </div>
            <div className="text-center border-r border-white/10">
              <p className="text-[10px] text-gray-400 font-bold">সময়</p>
              <p className={`text-2xl font-black tabular-nums ${isPlaying && timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-cyan-300'}`}>
                {timeLeft}s
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold">সেরা</p>
              <p className="text-xl font-black text-amber-300 tabular-nums">{highScore}</p>
            </div>
          </div>
        </header>

        {/* ───── মূল এরিয়া ───── */}
        <main className="relative z-10 flex min-h-0 flex-1 flex-col px-3">
          {!isPlaying ? (
            <div className="flex flex-1 flex-col items-center justify-center pb-6">
              {/* ভাসমান ৩ডি বাবল ক্লাস্টার */}
              <div className="relative mb-8 h-36 w-44">
                <Sphere color={COLORS[0]} className="absolute left-2 top-10 h-16 w-16 [animation:floaty_4s_ease-in-out_infinite]" />
                <Sphere color={COLORS[1]} className="absolute left-14 top-0 h-20 w-20 [animation:floaty_5s_ease-in-out_infinite_0.4s]" />
                <Sphere color={COLORS[3]} className="absolute right-0 top-12 h-14 w-14 [animation:floaty_3.6s_ease-in-out_infinite_0.8s]" />
                <Sphere color={COLORS[4]} className="absolute left-20 top-20 h-12 w-12 [animation:floaty_4.4s_ease-in-out_infinite_1.1s]" />
              </div>

              {/* গেম শেষের ফলাফল */}
              {result && (
                <div className="mb-6 w-full max-w-[280px] rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-center backdrop-blur-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] [animation:rise_0.5s_ease-out]">
                  <p className="text-xs text-gray-400">{result.record ? '🏆 নতুন রেকর্ড!' : 'টাইম আপ!'}</p>
                  <p className="text-4xl font-black text-white my-1 tabular-nums">{result.score}</p>
                  <div className="mx-auto mt-2 flex w-fit items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 border border-amber-300/30">
                    <CoinIcon size={20} />
                    <span className="text-sm font-black text-amber-200">+{result.earned} কয়েন জিতেছেন</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={limitReached ? buyExtraPlay : startGame}
                className={`rounded-full px-12 py-4 text-xl font-black transition-transform active:translate-y-1 active:shadow-none ${
                  limitReached
                    ? 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-100 shadow-[0_6px_0_#374151,0_16px_24px_-6px_rgba(0,0,0,0.8)]'
                    : 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-amber-950 shadow-[0_6px_0_#b45309,0_18px_30px_-6px_rgba(245,158,11,0.6),inset_0_2px_0_rgba(255,255,255,0.7)]'
                }`}
              >
                {limitReached ? `🔒 এক্সট্রা চান্স – ${EXTRA_PLAY_COST} কয়েন` : result ? 'আবার খেলুন' : 'খেলা শুরু'}
              </button>

              <p className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-gray-400">
                আজকের সুযোগ: <strong className="text-cyan-300">{Math.max(0, MAX_PLAYS_PER_DAY - playsToday)}</strong> বার বাকি
              </p>
              <p className="mt-3 max-w-[260px] text-center text-[11px] leading-relaxed text-gray-500">
                একই রঙের ৩টি বাবল মেলালে ফাটবে। প্রতি বাবলে ১ কয়েন, নতুন রেকর্ডে +{RECORD_BONUS} বোনাস।
              </p>
            </div>
          ) : (
            <>
              {/* বোর্ড – 3D পারস্পেকটিভে হেলানো */}
              <div className="flex min-h-0 flex-1 items-center justify-center [perspective:1000px]">
                <div
                  className="relative h-full max-w-full overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#1b1236]/80 to-[#0c0a1c]/90 shadow-[0_30px_50px_-15px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(139,92,246,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
                  style={{ aspectRatio: `${COLS}/${ROWS}`, transform: 'rotateX(7deg)', transformOrigin: 'bottom center' }}
                >
                  <div
                    className="absolute inset-0 p-1"
                    style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
                  >
                    {grid.map((row, r) =>
                      row.map((colorId, c) => {
                        const clr = colorOf(colorId);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className="flex items-center justify-center cursor-pointer rounded-lg active:bg-white/5"
                            onClick={() => shootBubble(c)}
                          >
                            {clr && <Sphere color={clr} className="w-[86%] aspect-square [animation:dropIn_0.25s_ease-out]" />}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ফাটার অ্যানিমেশন */}
                  {pops.map((p) => {
                    const clr = colorOf(p.color);
                    if (!clr) return null;
                    return (
                      <div
                        key={p.id}
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${(p.c + 0.5) * (100 / COLS)}%`, top: `${(p.r + 0.5) * (100 / ROWS)}%`, width: `${(100 / COLS) * 0.86}%` }}
                      >
                        <Sphere color={clr} className="w-full aspect-square [animation:popOut_0.45s_ease-out_forwards]" />
                      </div>
                    );
                  })}

                  {/* উড়ন্ত বাবল */}
                  {flying && (
                    <div
                      className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: flyStyle.left,
                        top: flyStyle.top,
                        opacity: flyStyle.opacity,
                        width: `${(100 / COLS) * 0.86}%`,
                        transitionProperty: 'left, top, opacity',
                        transitionDuration: flyStyle.duration,
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
                      }}
                    >
                      <Sphere color={flying} className="w-full aspect-square" />
                    </div>
                  )}
                </div>
              </div>

              {/* শুটার ডক */}
              <div className="relative mb-4 mt-3 flex h-28 shrink-0 items-center justify-around rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-6 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.5),0_20px_30px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-[10px] font-bold text-gray-400">পরেরটা</p>
                  <Sphere color={nextBubble} className="h-9 w-9 opacity-90" />
                </div>

                <div className="relative -mt-10">
                  <div className="absolute inset-0 scale-125 rounded-full blur-xl" style={{ background: currentBubble.glow, opacity: 0.45 }} />
                  <Sphere
                    color={currentBubble}
                    className={`h-20 w-20 border-[3px] border-white/30 transition-all duration-300 ${isShooting ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-black text-white/60">↑</span>
                </div>

                <div className="flex flex-col items-center">
                  <p className="mb-2 text-[10px] font-bold text-gray-400">কয়েন</p>
                  <div className="flex items-center gap-1.5">
                    <CoinIcon size={22} />
                    <span className="text-xs font-black text-amber-200 tabular-nums">{coins.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* ───── কয়েন যোগ করার প্যানেল ───── */}
        {showCoinPanel && (
          <div className="absolute inset-0 z-[60] flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center" onClick={() => setShowCoinPanel(false)}>
            <div
              role="dialog"
              aria-label="কয়েন যোগ করুন"
              onClick={(e) => e.stopPropagation()}
              className="m-3 w-full max-w-[360px] rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#1d1438] to-[#0d0a1f] p-5 shadow-[0_40px_80px_-10px_rgba(0,0,0,1),0_0_50px_-10px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] [animation:rise_0.35s_ease-out]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-black text-white">কয়েন যোগ করুন</h2>
                <button type="button" aria-label="বন্ধ করুন" onClick={() => setShowCoinPanel(false)} className="h-8 w-8 rounded-full bg-white/10 text-gray-300 active:scale-90">
                  ✕
                </button>
              </div>

              <div className="mb-4 flex items-center justify-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/5 py-4">
                <span className="[animation:coinSpin_3s_linear_infinite] [transform-style:preserve-3d]">
                  <CoinIcon size={44} />
                </span>
                <span className="text-3xl font-black text-amber-200 tabular-nums">{coins.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => addCoins(n)}
                    className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-400 py-2.5 text-sm font-black text-amber-950 shadow-[0_4px_0_#b45309] transition-transform active:translate-y-0.5 active:shadow-none"
                  >
                    +{n}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={customCoin}
                  onChange={(e) => setCustomCoin(e.target.value)}
                  placeholder="নিজের সংখ্যা লিখুন"
                  aria-label="কয়েনের সংখ্যা"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-amber-300/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    addCoins(parseInt(customCoin, 10));
                    setCustomCoin('');
                  }}
                  className="rounded-xl bg-gradient-to-b from-cyan-300 to-cyan-500 px-4 text-sm font-black text-cyan-950 shadow-[0_4px_0_#0e7490] transition-transform active:translate-y-0.5 active:shadow-none"
                >
                  যোগ
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  saveCoins(0);
                  toast.info('কয়েন রিসেট হয়েছে', { theme: 'dark', autoClose: 1200 });
                }}
                className="mt-4 w-full text-center text-xs text-gray-500 underline-offset-2 hover:text-rose-400 hover:underline"
              >
                কয়েন রিসেট করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}