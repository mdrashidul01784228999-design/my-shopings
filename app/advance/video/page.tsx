"use client";

import { Hind_Siliguri } from "next/font/google";
import { useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   FrameCut — ব্রাউজারেই চলা ভিডিও এডিটর (Next.js App Router)
   এই ফাইলটি app/page.tsx এ বসান। কোনো বাড়তি প্যাকেজ লাগবে না।
   ──────────────────────────────────────────────────────────── */

const font = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

/* ───────── Types ───────── */
type Seg = { id: string; start: number; end: number; speed: number };
type Filters = {
  brightness: number;
  contrast: number;
  saturate: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
  vignette: number;
};
type Pos = "tl" | "tr" | "c" | "bl" | "br";
type Logo = {
  kind: "none" | "image" | "emoji";
  src?: string;
  emoji: string;
  pos: Pos;
  size: number;
  opacity: number;
};
type TextLayer = { value: string; color: string; size: number; y: number; bg: boolean };
type RatioKey = "orig" | "9:16" | "16:9" | "1:1" | "4:5";
type TabId = "clip" | "filter" | "frame" | "logo" | "text" | "audio" | "export";

/* ───────── Constants ───────── */
const DEF: Filters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  vignette: 0,
};

const PRESETS: { n: string; f: Partial<Filters> }[] = [
  { n: "অরিজিনাল", f: {} },
  { n: "সিনেমা", f: { contrast: 120, saturate: 85, brightness: 95, vignette: 35, sepia: 10 } },
  { n: "ভিভিড", f: { contrast: 112, saturate: 150, brightness: 104 } },
  { n: "ভিনটেজ", f: { sepia: 55, contrast: 95, saturate: 90, brightness: 105, vignette: 25 } },
  { n: "সাদা-কালো", f: { grayscale: 100, contrast: 115 } },
  { n: "ঠান্ডা", f: { hue: -12, saturate: 110, brightness: 102 } },
  { n: "উষ্ণ", f: { sepia: 25, saturate: 120, brightness: 104, hue: -8 } },
  { n: "ড্রিমি", f: { blur: 1, brightness: 110, saturate: 115, contrast: 92 } },
];

const RATIOS: { k: RatioKey; label: string; v: number | null }[] = [
  { k: "orig", label: "মূল", v: null },
  { k: "9:16", label: "9:16", v: 9 / 16 },
  { k: "16:9", label: "16:9", v: 16 / 9 },
  { k: "1:1", label: "1:1", v: 1 },
  { k: "4:5", label: "4:5", v: 4 / 5 },
];

const EMOJIS = ["⭐", "🔥", "💎", "🎬", "🎵", "❤️", "🚀", "👑", "⚡", "🌈", "🎯", "🏆"];
const SWATCHES = ["#FFFFFF", "#000000", "#FFC857", "#FF5C8A", "#5CE1FF", "#7CF29A"];
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];
const MIMES: { type: string; ext: string }[] = [
  { type: "video/mp4;codecs=avc1.640028,mp4a.40.2", ext: "mp4" },
  { type: "video/mp4;codecs=avc1,mp4a.40.2", ext: "mp4" },
  { type: "video/mp4", ext: "mp4" },
  { type: "video/webm;codecs=vp9,opus", ext: "webm" },
  { type: "video/webm;codecs=vp8,opus", ext: "webm" },
  { type: "video/webm", ext: "webm" },
];

/* ───────── Helpers ───────── */
const uid = () => Math.random().toString(36).slice(2, 8);
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (t: number) => {
  if (!isFinite(t) || t < 0) t = 0;
  return `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}.${pad(Math.floor((t % 1) * 100))}`;
};
const fmtShort = (t: number) => `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;
const fsize = (b: number) => (b > 1e6 ? (b / 1e6).toFixed(1) + " MB" : Math.round(b / 1e3) + " KB");
const totalOf = (segs: Seg[]) => segs.reduce((a, s) => a + (s.end - s.start) / s.speed, 0);
const outTimeOf = (segs: Seg[], t: number) => {
  let acc = 0;
  for (const s of segs) {
    if (t >= s.end) acc += (s.end - s.start) / s.speed;
    else if (t >= s.start) acc += (t - s.start) / s.speed;
  }
  return acc;
};
const outDims = (ratio: RatioKey, vw: number, vh: number, rotate: number, res: number) => {
  const r = RATIOS.find((x) => x.k === ratio)?.v;
  const rot = rotate % 180 !== 0;
  const a = r ?? (rot ? vh / vw : vw / vh);
  let W: number, H: number;
  if (a >= 1) {
    H = res;
    W = Math.round(res * a);
  } else {
    W = res;
    H = Math.round(res / a);
  }
  return [W - (W % 2), H - (H % 2)] as const;
};

/* ───────── Icons (inline SVG) ───────── */
const ICONS: Record<string, React.ReactNode> = {
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M2 14h4M10 8h4M18 16h4" />
    </>
  ),
  crop: (
    <>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </>
  ),
  image: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>
  ),
  type: (
    <>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </>
  ),
  volume: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a10 10 0 0 1 0 14" />
    </>
  ),
  mute: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6M16 9l6 6" />
    </>
  ),
  film: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4" />
    </>
  ),
  rotate: (
    <>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </>
  ),
  flip: (
    <>
      <path d="m3 7 5 5-5 5V7z" />
      <path d="m21 7-5 5 5 5V7z" />
      <path d="M12 2v20" strokeDasharray="2 3" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  undo: (
    <>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  stepb: <path d="M19 20 9 12l10-8zM5 19V5" />,
  stepf: <path d="m5 4 10 8-10 8zM19 5v14" />,
};

function Icon({ n, className = "w-5 h-5" }: { n: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[n]}
    </svg>
  );
}

/* ───────── Small UI ───────── */
const BTN =
  "inline-flex items-center justify-center gap-2 h-10 px-3.5 rounded-lg text-sm font-medium transition active:scale-[.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C6CFF]";
const BTN2 = `${BTN} bg-[#1C212C] hover:bg-[#262D3C] border border-[#2B3242]`;
const BTNP = `${BTN} bg-[#7C6CFF] hover:bg-[#8F81FF] text-white`;
const chip = (on: boolean) =>
  `h-9 px-3 rounded-lg text-sm border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C6CFF] ${
    on
      ? "bg-[#7C6CFF]/15 border-[#7C6CFF] text-white"
      : "bg-[#1C212C] border-[#2B3242] text-[#B7BED0] hover:border-[#3A4358]"
  }`;

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  onStart?: () => void;
}) {
  const { label, value, min, max, step = 1, unit = "", onChange, onStart } = props;
  return (
    <label className="block">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-[#B7BED0]">{label}</span>
        <span className="tabular-nums text-[#E8EAF0]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onStart}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-6 accent-[#7C6CFF] cursor-pointer"
      />
    </label>
  );
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "clip", label: "কাট", icon: "scissors" },
  { id: "filter", label: "ফিল্টার", icon: "sliders" },
  { id: "frame", label: "ফ্রেম", icon: "crop" },
  { id: "logo", label: "লোগো", icon: "image" },
  { id: "text", label: "টেক্সট", icon: "type" },
  { id: "audio", label: "সাউন্ড", icon: "volume" },
  { id: "export", label: "এক্সপোর্ট", icon: "download" },
];

/* ═════════════════════════ PAGE ═════════════════════════ */
export default function Page() {
  /* ── state ── */
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [vsize, setVsize] = useState({ w: 0, h: 0 });
  const [segs, setSegs] = useState<Seg[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [tab, setTab] = useState<TabId>("clip");
  const [filters, setFilters] = useState<Filters>(DEF);
  const [preset, setPreset] = useState("অরিজিনাল");
  const [ratio, setRatio] = useState<RatioKey>("orig");
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [zoom, setZoom] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState(false);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [logo, setLogo] = useState<Logo>({ kind: "none", emoji: "⭐", pos: "tr", size: 16, opacity: 100 });
  const [text, setText] = useState<TextLayer>({ value: "", color: "#FFFFFF", size: 7, y: 80, bg: false });
  const [res, setRes] = useState(720);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; ext: string; size: number } | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  /* ── refs ── */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const logoImg = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<{ ctx: AudioContext; gain: GainNode; dest: MediaStreamAudioDestinationNode } | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const exportingRef = useRef(false);
  const cancelRef = useRef(false);
  const dirty = useRef(true);
  const hist = useRef<Seg[][]>([]);
  const drag = useRef<{ kind: "seek" | "l" | "r"; id?: string } | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const live = useRef<any>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const act = useRef<any>({});

  live.current = {
    segs, filters, ratio, fit, zoom, rotate, flip, logo, text, res,
    vol: muted ? 0 : volume / 100,
  };

  useEffect(() => {
    dirty.current = true;
  });

  const toast = (m: string) => {
    setMsg(m);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setMsg(""), 2600);
  };

  /* ── history ── */
  const pushHist = () => {
    hist.current.push(live.current.segs);
    if (hist.current.length > 60) hist.current.shift();
  };
  const commit = (next: Seg[]) => {
    pushHist();
    setSegs(next);
  };
  const undo = () => {
    const prev = hist.current.pop();
    if (!prev) return toast("আর পূর্বাবস্থায় ফেরার কিছু নেই");
    setSegs(prev);
    if (!prev.some((s) => s.id === sel)) setSel(prev[0]?.id ?? null);
  };

  /* ── load video ── */
  const loadFile = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) return toast("শুধু ভিডিও ফাইল দিন");
    if (url) URL.revokeObjectURL(url);
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    hist.current = [];
    setUrl(URL.createObjectURL(f));
    setFileName(f.name);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setSegs([]);
  };

  const onMeta = () => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    const id = uid();
    setDuration(v.duration);
    setVsize({ w: v.videoWidth, h: v.videoHeight });
    setSegs([{ id, start: 0, end: v.duration, speed: 1 }]);
    setSel(id);
    v.currentTime = 0;
    dirty.current = true;
  };

  /* ── logo image element ── */
  useEffect(() => {
    if (logo.kind === "image" && logo.src) {
      const img = new Image();
      img.onload = () => {
        logoImg.current = img;
        dirty.current = true;
      };
      img.src = logo.src;
    } else logoImg.current = null;
  }, [logo.kind, logo.src]);

  /* ── thumbnails (filmstrip) ── */
  useEffect(() => {
    if (!url || !duration) return;
    let dead = false;
    setThumbs([]);
    (async () => {
      const v = document.createElement("video");
      v.src = url;
      v.muted = true;
      v.preload = "auto";
      v.playsInline = true;
      await new Promise<void>((r) => {
        v.onloadeddata = () => r();
        v.onerror = () => r();
      });
      if (!v.videoWidth) return;
      const N = 12;
      const c = document.createElement("canvas");
      c.height = 64;
      c.width = Math.max(32, Math.round(64 * (v.videoWidth / v.videoHeight)));
      const ctx = c.getContext("2d");
      const out: string[] = [];
      for (let i = 0; i < N; i++) {
        if (dead) return;
        v.currentTime = (duration * (i + 0.5)) / N;
        await new Promise<void>((r) => {
          v.onseeked = () => r();
          setTimeout(r, 1500);
        });
        ctx?.drawImage(v, 0, 0, c.width, c.height);
        out.push(c.toDataURL("image/jpeg", 0.6));
      }
      if (!dead) setThumbs(out);
    })();
    return () => {
      dead = true;
    };
  }, [url, duration]);

  /* ── audio graph (volume + export capture) ── */
  const ensureAudio = () => {
    const v = videoRef.current;
    if (!v) return;
    if (audioRef.current) {
      audioRef.current.ctx.resume();
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AC();
      const src = ctx.createMediaElementSource(v);
      const gain = ctx.createGain();
      const dest = ctx.createMediaStreamDestination();
      src.connect(gain);
      gain.connect(ctx.destination);
      gain.connect(dest);
      gain.gain.value = live.current.vol;
      v.volume = 1;
      audioRef.current = { ctx, gain, dest };
      ctx.resume();
    } catch {
      /* audio graph unavailable */
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const vol = muted ? 0 : volume / 100;
    if (audioRef.current) audioRef.current.gain.gain.value = vol;
    else v.volume = Math.min(1, vol);
  }, [volume, muted, url]);

  /* ── drawing (preview = export) ── */
  const draw = () => {
    const c = canvasRef.current;
    const v = videoRef.current;
    if (!c || !v || !v.videoWidth) return;
    const L = live.current;
    const [W, H] = outDims(L.ratio, v.videoWidth, v.videoHeight, L.rotate, exportingRef.current ? L.res : Math.min(L.res, 720));
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    const rot = L.rotate % 180 !== 0;
    const sw = rot ? v.videoHeight : v.videoWidth;
    const sh = rot ? v.videoWidth : v.videoHeight;
    const base = L.fit === "cover" ? Math.max(W / sw, H / sh) : Math.min(W / sw, H / sh);
    const s = (base * L.zoom) / 100;
    const f: Filters = L.filters;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate((L.rotate * Math.PI) / 180);
    if (L.flip) ctx.scale(-1, 1);
    ctx.scale(s, s);
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) hue-rotate(${f.hue}deg) blur(${(f.blur * H) / 720}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%)`;
    ctx.drawImage(v, -v.videoWidth / 2, -v.videoHeight / 2);
    ctx.restore();
    ctx.filter = "none";

    if (f.vignette > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${f.vignette / 100})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    const T: TextLayer = L.text;
    if (T.value.trim()) {
      const fs = (H * T.size) / 100;
      ctx.font = `700 ${fs}px ${font.style.fontFamily}, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = T.value.split("\n");
      const lh = fs * 1.3;
      const y0 = (H * T.y) / 100 - ((lines.length - 1) * lh) / 2;
      if (T.bg) {
        const mw = Math.max(...lines.map((l) => ctx.measureText(l).width));
        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.fillRect(W / 2 - mw / 2 - fs * 0.5, y0 - lh / 2 - fs * 0.1, mw + fs, lh * lines.length + fs * 0.2);
      }
      ctx.shadowColor = "rgba(0,0,0,.55)";
      ctx.shadowBlur = fs * 0.2;
      ctx.fillStyle = T.color;
      lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh));
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }

    const G: Logo = L.logo;
    if (G.kind !== "none") {
      const sz = (Math.min(W, H) * G.size) / 100;
      const m = Math.min(W, H) * 0.04;
      let w = sz;
      let h = sz;
      const img = logoImg.current;
      if (G.kind === "image") {
        if (!img) return;
        h = (sz * img.height) / img.width;
      }
      const x = G.pos === "tl" || G.pos === "bl" ? m : G.pos === "c" ? (W - w) / 2 : W - m - w;
      const y = G.pos === "tl" || G.pos === "tr" ? m : G.pos === "c" ? (H - h) / 2 : H - m - h;
      ctx.globalAlpha = G.opacity / 100;
      if (G.kind === "image" && img) ctx.drawImage(img, x, y, w, h);
      else {
        ctx.font = `${sz * 0.85}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(G.emoji, x + w / 2, y + h / 2 + sz * 0.05);
      }
      ctx.globalAlpha = 1;
    }
  };

  /* ── transport actions ── */
  const finish = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    if (exportingRef.current) {
      if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
    } else {
      const f = live.current.segs[0] as Seg | undefined;
      if (f) {
        v.currentTime = f.start;
        setCurrent(f.start);
      }
    }
  };

  const toggle = () => {
    const v = videoRef.current;
    if (!v || !segs.length || exportingRef.current) return;
    ensureAudio();
    if (!v.paused) return v.pause();
    const t = v.currentTime;
    if (!segs.some((s) => t >= s.start && t < s.end - 0.05)) {
      v.currentTime = (segs.find((s) => s.start > t) ?? segs[0]).start;
    }
    v.play().catch(() => toast("প্লে করা যায়নি"));
  };

  const seekTo = (t: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const tt = clamp(t, 0, duration);
    v.currentTime = tt;
    setCurrent(tt);
    dirty.current = true;
  };

  const step = (dir: number) => {
    const v = videoRef.current;
    if (!v || exportingRef.current) return;
    v.pause();
    seekTo(v.currentTime + dir / 30);
  };

  const split = () => {
    const v = videoRef.current;
    if (!v || exportingRef.current) return;
    const t = v.currentTime;
    const L: Seg[] = live.current.segs;
    const i = L.findIndex((s) => t > s.start + 0.1 && t < s.end - 0.1);
    if (i < 0) return toast("প্লেহেড ক্লিপের ভেতরে রাখুন");
    const s = L[i];
    const a = { ...s, end: t };
    const b = { ...s, id: uid(), start: t };
    commit([...L.slice(0, i), a, b, ...L.slice(i + 1)]);
    setSel(b.id);
  };

  const del = () => {
    const L: Seg[] = live.current.segs;
    if (!sel || exportingRef.current) return;
    if (L.length <= 1) return toast("শেষ ক্লিপটি মোছা যাবে না");
    const i = L.findIndex((s) => s.id === sel);
    const next = L.filter((s) => s.id !== sel);
    commit(next);
    setSel(next[Math.min(i, next.length - 1)].id);
  };

  const resetClips = () => {
    if (!duration) return;
    const id = uid();
    commit([{ id, start: 0, end: duration, speed: 1 }]);
    setSel(id);
  };

  const setSpeed = (speed: number, all = false) => {
    setSegs((L) => L.map((s) => (all || s.id === sel ? { ...s, speed } : s)));
  };

  const snapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    draw();
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `frame-${Date.now()}.png`;
      a.click();
      toast("ফ্রেম সেভ হয়েছে");
    }, "image/png");
  };

  /* ── export ── */
  const startExport = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !segs.length) return;
    if (typeof MediaRecorder === "undefined") return toast("এই ব্রাউজারে এক্সপোর্ট সাপোর্ট নেই — Chrome ব্যবহার করুন");
    const mime = MIMES.find((m) => MediaRecorder.isTypeSupported(m.type));
    if (!mime) return toast("কোনো ভিডিও ফরম্যাট সাপোর্ট করে না");

    ensureAudio();
    v.pause();
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    await new Promise<void>((r) => {
      const done = () => {
        v.removeEventListener("seeked", done);
        r();
      };
      v.addEventListener("seeked", done);
      v.currentTime = segs[0].start;
      setTimeout(done, 1200);
    });

    exportingRef.current = true;
    cancelRef.current = false;
    setExporting(true);
    setProgress(0);
    draw(); // canvas কে এক্সপোর্ট রেজোলিউশনে আনে

    const stream = c.captureStream(30);
    audioRef.current?.dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream, {
      mimeType: mime.type,
      videoBitsPerSecond: res >= 1080 ? 12_000_000 : res >= 720 ? 6_000_000 : 3_000_000,
    });
    recRef.current = rec;
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      exportingRef.current = false;
      setExporting(false);
      const first = live.current.segs[0] as Seg | undefined;
      if (first && videoRef.current) videoRef.current.currentTime = first.start;
      if (cancelRef.current) return toast("এক্সপোর্ট বাতিল হয়েছে");
      const blob = new Blob(chunks, { type: mime.type.split(";")[0] });
      const u = URL.createObjectURL(blob);
      setResult({ url: u, ext: mime.ext, size: blob.size });
      const a = document.createElement("a");
      a.href = u;
      a.download = `framecut-${Date.now()}.${mime.ext}`;
      a.click();
      toast("এক্সপোর্ট শেষ ✓");
    };
    rec.start(250);
    v.play().catch(() => rec.stop());
  };

  const cancelExport = () => {
    cancelRef.current = true;
    videoRef.current?.pause();
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop();
  };

  /* ── main loop ── */
  act.current = { draw, finish, toggle, split, del, step };

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const v = videoRef.current;
      const L = live.current;
      const segsL: Seg[] = L.segs ?? [];
      if (v && segsL.length && v.readyState >= 2) {
        if (!v.paused) {
          const t = v.currentTime;
          const i = segsL.findIndex((s) => t >= s.start - 0.02 && t < s.end);
          if (i === -1) {
            const next = segsL.find((s) => s.start > t);
            if (next) v.currentTime = next.start;
            else act.current.finish();
          } else {
            const s = segsL[i];
            if (v.playbackRate !== s.speed) v.playbackRate = s.speed;
            if (t >= s.end - 0.04) {
              const nx = segsL[i + 1];
              if (!nx) act.current.finish();
              else if (nx.start - s.end > 0.05) v.currentTime = nx.start;
            }
          }
          if (now - last > 60) {
            last = now;
            setCurrent(v.currentTime);
            if (exportingRef.current) {
              setProgress(Math.min(1, outTimeOf(segsL, v.currentTime) / Math.max(0.01, totalOf(segsL))));
            }
          }
        }
        if (!v.paused || dirty.current || exportingRef.current) {
          act.current.draw();
          dirty.current = false;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        act.current.toggle();
      } else if (e.key === "s" || e.key === "S") act.current.split();
      else if (e.key === "Delete" || e.key === "Backspace") act.current.del();
      else if (e.key === "ArrowLeft") act.current.step(-1);
      else if (e.key === "ArrowRight") act.current.step(1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ── timeline pointer handling ── */
  const xToTime = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return clamp(((clientX - r.left) / r.width) * duration, 0, duration);
  };

  const onTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exportingRef.current || !duration) return;
    const el = e.target as HTMLElement;
    e.currentTarget.setPointerCapture(e.pointerId);
    const h = el.dataset.handle as "l" | "r" | undefined;
    if (h) {
      pushHist();
      drag.current = { kind: h, id: el.dataset.id };
    } else {
      drag.current = { kind: "seek" };
      const t = xToTime(e.clientX);
      const hit = (live.current.segs as Seg[]).find((s) => t >= s.start && t <= s.end);
      if (hit) setSel(hit.id);
      videoRef.current?.pause();
      seekTo(t);
    }
  };

  const onTrackMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const t = xToTime(e.clientX);
    if (d.kind === "seek") return seekTo(t);
    const L: Seg[] = live.current.segs;
    const i = L.findIndex((s) => s.id === d.id);
    if (i < 0) return;
    const s = L[i];
    let edge = t;
    let patch: Partial<Seg>;
    if (d.kind === "l") {
      edge = clamp(t, i > 0 ? L[i - 1].end : 0, s.end - 0.1);
      patch = { start: edge };
    } else {
      edge = clamp(t, s.start + 0.1, i < L.length - 1 ? L[i + 1].start : duration);
      patch = { end: edge };
    }
    setSegs(L.map((x, k) => (k === i ? { ...x, ...patch } : x)));
    videoRef.current?.pause();
    seekTo(edge);
  };

  const onTrackUp = () => {
    drag.current = null;
  };

  /* ── derived ── */
  const selSeg = segs.find((s) => s.id === sel) ?? null;
  const selIdx = selSeg ? segs.indexOf(selSeg) : -1;
  const totalOut = totalOf(segs);
  const hasVideo = !!url && duration > 0;
  const [outW, outH] = hasVideo ? outDims(ratio, vsize.w, vsize.h, rotate, res) : [0, 0];
  const mimeName = typeof MediaRecorder !== "undefined" ? MIMES.find((m) => MediaRecorder.isTypeSupported(m.type))?.ext.toUpperCase() : "—";

  /* ═════════════ RENDER ═════════════ */
  return (
    <div
      className={`${font.className} bg-[#0E1116] text-[#E8EAF0] min-h-[100dvh] lg:h-[100dvh] flex flex-col lg:overflow-hidden selection:bg-[#7C6CFF]/40`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        loadFile(e.dataTransfer.files?.[0]);
      }}
    >
      {/* hidden video source */}
      {url && (
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="auto"
          className="fixed w-px h-px opacity-0 pointer-events-none -z-10"
          onLoadedMetadata={onMeta}
          onLoadedData={() => (dirty.current = true)}
          onSeeked={() => {
            dirty.current = true;
            if (videoRef.current) setCurrent(videoRef.current.currentTime);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => act.current.finish()}
        />
      )}
      <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input
        ref={logoFileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setLogo((l) => ({ ...l, kind: "image", src: URL.createObjectURL(f) }));
          e.target.value = "";
        }}
      />

      {/* ── header ── */}
      <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 border-b border-[#232938] bg-[#0E1116]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#7C6CFF] grid place-items-center">
            <Icon n="scissors" className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold leading-none tracking-tight">FrameCut</div>
            <div className="text-xs text-[#8D95A8] truncate max-w-[40vw] sm:max-w-xs mt-0.5">
              {fileName || "ভিডিও এডিটর"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={BTN2} onClick={() => fileRef.current?.click()}>
            <Icon n="upload" className="w-4 h-4" />
            <span className="hidden sm:inline">{hasVideo ? "অন্য ভিডিও" : "ভিডিও আনুন"}</span>
          </button>
          <button className={BTNP} disabled={!hasVideo} onClick={() => setTab("export")}>
            <Icon n="download" className="w-4 h-4" />
            এক্সপোর্ট
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)_auto]">
        {/* ── preview ── */}
        <section className="order-1 lg:order-none lg:col-start-2 lg:row-start-1 relative bg-[#0A0D12] h-[42dvh] sm:h-[50dvh] lg:h-auto min-h-0">
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
            <canvas
              ref={canvasRef}
              className={`max-w-full max-h-full rounded-md shadow-[0_8px_40px_rgba(0,0,0,.5)] bg-black ${hasVideo ? "" : "hidden"}`}
              onClick={toggle}
            />
            {!hasVideo && (
              <button
                onClick={() => fileRef.current?.click()}
                className={`w-full max-w-md rounded-2xl border-2 border-dashed px-6 py-10 sm:py-14 flex flex-col items-center gap-3 text-center transition ${
                  dragOver ? "border-[#7C6CFF] bg-[#7C6CFF]/10" : "border-[#2B3242] hover:border-[#3F4960]"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1C212C] grid place-items-center text-[#7C6CFF]">
                  <Icon n="film" className="w-7 h-7" />
                </div>
                <div className="text-lg font-semibold">{url ? "ভিডিও লোড হচ্ছে…" : "এডিট শুরু করতে ভিডিও দিন"}</div>
                <div className="text-sm text-[#8D95A8]">এখানে ফাইল ছেড়ে দিন, অথবা ট্যাপ করে বেছে নিন</div>
              </button>
            )}
          </div>

          {hasVideo && (
            <button
              onClick={toggle}
              aria-label={playing ? "পজ" : "প্লে"}
              className={`absolute left-1/2 -translate-x-1/2 bottom-4 w-12 h-12 rounded-full bg-black/60 backdrop-blur grid place-items-center hover:bg-black/80 transition ${playing ? "opacity-0 hover:opacity-100" : ""}`}
            >
              <Icon n={playing ? "pause" : "play"} className="w-6 h-6" />
            </button>
          )}

          {exporting && (
            <div className="absolute inset-0 z-10 bg-[#0A0D12]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="text-4xl font-bold tabular-nums">{Math.round(progress * 100)}%</div>
              <div className="w-full max-w-xs h-2 rounded-full bg-[#1C212C] overflow-hidden">
                <div className="h-full bg-[#7C6CFF]" style={{ width: `${progress * 100}%` }} />
              </div>
              <p className="text-sm text-[#8D95A8] max-w-xs">ভিডিও রেকর্ড হচ্ছে। শেষ না হওয়া পর্যন্ত এই ট্যাব খোলা রাখুন।</p>
              <button className={BTN2} onClick={cancelExport}>
                <Icon n="x" className="w-4 h-4" />
                বাতিল
              </button>
            </div>
          )}
        </section>

        {/* ── timeline ── */}
        <section className="order-2 lg:order-none lg:col-span-2 lg:row-start-2 border-t border-[#232938] bg-[#12161E] px-3 sm:px-5 pt-3 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button className={`${BTN2} !px-2.5`} disabled={!hasVideo} onClick={() => step(-1)} aria-label="১ ফ্রেম পিছনে">
                <Icon n="stepb" className="w-4 h-4" />
              </button>
              <button className={`${BTNP} !px-3.5`} disabled={!hasVideo} onClick={toggle} aria-label={playing ? "পজ" : "প্লে"}>
                <Icon n={playing ? "pause" : "play"} className="w-4.5 h-4.5" />
              </button>
              <button className={`${BTN2} !px-2.5`} disabled={!hasVideo} onClick={() => step(1)} aria-label="১ ফ্রেম সামনে">
                <Icon n="stepf" className="w-4 h-4" />
              </button>
              <div className="ml-2 text-sm tabular-nums text-[#B7BED0]">
                <span className="text-[#FFC857]">{fmt(current)}</span>
                <span className="text-[#5E667A]"> / {fmt(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className={BTN2} disabled={!hasVideo} onClick={split}>
                <Icon n="scissors" className="w-4 h-4" />
                <span className="hidden sm:inline">কাটুন</span>
              </button>
              <button className={BTN2} disabled={!hasVideo || segs.length < 2} onClick={del}>
                <Icon n="trash" className="w-4 h-4" />
                <span className="hidden sm:inline">মুছুন</span>
              </button>
              <button className={BTN2} disabled={!hasVideo} onClick={undo}>
                <Icon n="undo" className="w-4 h-4" />
                <span className="hidden sm:inline">আনডু</span>
              </button>
              <button className={BTN2} disabled={!hasVideo} onClick={snapshot} aria-label="ফ্রেম সেভ">
                <Icon n="camera" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`${exporting ? "pointer-events-none opacity-60" : ""} ${hasVideo ? "" : "opacity-40 pointer-events-none"}`}>
            <div ref={trackRef} className="relative touch-none select-none" onPointerDown={onTrackDown} onPointerMove={onTrackMove} onPointerUp={onTrackUp} onPointerCancel={onTrackUp}>
              {/* ruler */}
              <div className="relative h-5 mb-1 text-[11px] text-[#6C748A]">
                {Array.from({ length: 9 }, (_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 tabular-nums"
                    style={{
                      left: `${(i / 8) * 100}%`,
                      transform: i === 0 ? "none" : i === 8 ? "translateX(-100%)" : "translateX(-50%)",
                    }}
                  >
                    {fmtShort((duration * i) / 8)}
                  </span>
                ))}
              </div>

              {/* track */}
              <div className="relative h-16 sm:h-20 rounded-lg bg-[repeating-linear-gradient(135deg,#171B24_0_6px,#1B202B_6px_12px)]">
                {segs.map((s) => {
                  const frac = (s.end - s.start) / (duration || 1);
                  const on = s.id === sel;
                  return (
                    <div
                      key={s.id}
                      className={`absolute top-0 bottom-0 overflow-hidden rounded-md ${on ? "ring-2 ring-[#7C6CFF] z-[1]" : "ring-1 ring-black/60"}`}
                      style={{ left: `${(s.start / duration) * 100}%`, width: `${frac * 100}%` }}
                    >
                      <div
                        className="absolute top-0 bottom-0 flex bg-[#242A38]"
                        style={{ width: `${100 / frac}%`, left: `${-(s.start / duration / frac) * 100}%` }}
                      >
                        {thumbs.map((t, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={t} alt="" draggable={false} className="h-full flex-1 min-w-0 object-cover pointer-events-none" />
                        ))}
                      </div>
                      {s.speed !== 1 && (
                        <span className="absolute left-1.5 bottom-1 px-1.5 rounded bg-black/70 text-[11px] font-semibold text-[#FFC857] pointer-events-none">
                          {s.speed}×
                        </span>
                      )}
                      {on && (
                        <>
                          <div data-handle="l" data-id={s.id} className="absolute left-0 top-0 bottom-0 w-3.5 sm:w-3 bg-[#7C6CFF] grid place-items-center cursor-ew-resize rounded-l-md">
                            <span className="w-0.5 h-5 rounded bg-white/85 pointer-events-none" />
                          </div>
                          <div data-handle="r" data-id={s.id} className="absolute right-0 top-0 bottom-0 w-3.5 sm:w-3 bg-[#7C6CFF] grid place-items-center cursor-ew-resize rounded-r-md">
                            <span className="w-0.5 h-5 rounded bg-white/85 pointer-events-none" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* playhead */}
              <div className="absolute top-3 bottom-0 w-0.5 bg-[#FFC857] z-[2] pointer-events-none" style={{ left: `${(current / (duration || 1)) * 100}%` }}>
                <span className="absolute -top-1 -left-[5px] w-3 h-3 rounded-full bg-[#FFC857]" />
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-[#6C748A]">
            <span>
              {hasVideo ? `${segs.length}টি ক্লিপ · আউটপুট ${fmt(totalOut)}` : "ভিডিও দিলে টাইমলাইন চালু হবে"}
            </span>
            <span className="hidden sm:inline">Space প্লে · S কাট · Delete মোছা · ← → ফ্রেম</span>
          </div>
        </section>

        {/* ── tools panel ── */}
        <aside className="order-3 lg:order-none lg:col-start-1 lg:row-start-1 min-h-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-r border-[#232938] bg-[#12161E]">
          <div className="sticky top-0 z-[3] bg-[#12161E] border-b border-[#232938]">
            <div className="flex lg:flex-wrap overflow-x-auto gap-1 p-2 [scrollbar-width:none]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 flex flex-col items-center gap-1 w-[68px] lg:w-[calc(25%-4px)] py-2 rounded-lg text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C6CFF] ${
                    tab === t.id ? "bg-[#7C6CFF]/15 text-white" : "text-[#8D95A8] hover:bg-[#1C212C]"
                  }`}
                >
                  <Icon n={t.icon} className="w-5 h-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-4 pb-10 space-y-5 ${hasVideo ? "" : "opacity-40 pointer-events-none"} ${exporting ? "pointer-events-none" : ""}`}>
            {/* ── clip ── */}
            {tab === "clip" && (
              <>
                <div className="rounded-xl bg-[#1A1F2A] border border-[#262C3A] p-3.5 text-sm">
                  {selSeg ? (
                    <>
                      <div className="font-semibold mb-1">
                        ক্লিপ {selIdx + 1} / {segs.length}
                      </div>
                      <div className="text-[#8D95A8] tabular-nums">
                        {fmt(selSeg.start)} → {fmt(selSeg.end)} · {fmt((selSeg.end - selSeg.start) / selSeg.speed)}
                      </div>
                    </>
                  ) : (
                    <div className="text-[#8D95A8]">টাইমলাইনে একটি ক্লিপ বেছে নিন</div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">স্লো মোশন ও স্পিড</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {SPEEDS.map((sp) => (
                      <button
                        key={sp}
                        className={chip(selSeg?.speed === sp)}
                        onClick={() => {
                          pushHist();
                          setSpeed(sp);
                        }}
                      >
                        {sp}×
                      </button>
                    ))}
                  </div>
                  <Slider
                    label="কাস্টম স্পিড"
                    value={selSeg?.speed ?? 1}
                    min={0.1}
                    max={4}
                    step={0.05}
                    unit="×"
                    onStart={pushHist}
                    onChange={(v) => setSpeed(Number(v.toFixed(2)))}
                  />
                  <button
                    className={`${BTN2} w-full mt-3`}
                    onClick={() => {
                      if (!selSeg) return;
                      pushHist();
                      setSpeed(selSeg.speed, true);
                      toast("সব ক্লিপে প্রয়োগ হয়েছে");
                    }}
                  >
                    সব ক্লিপে এই স্পিড দিন
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className={BTN2} onClick={split}>
                    <Icon n="scissors" className="w-4 h-4" />
                    প্লেহেডে কাটুন
                  </button>
                  <button className={BTN2} onClick={del} disabled={segs.length < 2}>
                    <Icon n="trash" className="w-4 h-4" />
                    ক্লিপ মুছুন
                  </button>
                </div>
                <button className={`${BTN2} w-full`} onClick={resetClips}>
                  <Icon n="rotate" className="w-4 h-4" />
                  সব কাট রিসেট করুন
                </button>
                <p className="text-xs text-[#6C748A] leading-relaxed">
                  ট্রিম করতে ক্লিপ বেছে নিয়ে দুই প্রান্তের বেগুনি হ্যান্ডেল টানুন। মাঝখান থেকে বাদ দিতে দুইবার কাটুন, তারপর মাঝের অংশটি মুছুন।
                </p>
              </>
            )}

            {/* ── filter ── */}
            {tab === "filter" && (
              <>
                <div>
                  <div className="text-sm font-semibold mb-2">রেডিমেড লুক</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.n}
                        className={chip(preset === p.n)}
                        onClick={() => {
                          setPreset(p.n);
                          setFilters({ ...DEF, ...p.f });
                        }}
                      >
                        {p.n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {(
                    [
                      ["brightness", "উজ্জ্বলতা", 50, 150, ""],
                      ["contrast", "কনট্রাস্ট", 50, 150, ""],
                      ["saturate", "রঙের গাঢ়তা", 0, 200, ""],
                      ["hue", "হিউ", -180, 180, "°"],
                      ["sepia", "সেপিয়া", 0, 100, ""],
                      ["blur", "ব্লার", 0, 10, ""],
                      ["vignette", "ভিনিয়েট", 0, 80, ""],
                    ] as [keyof Filters, string, number, number, string][]
                  ).map(([k, label, min, max, unit]) => (
                    <Slider
                      key={k}
                      label={label}
                      value={filters[k]}
                      min={min}
                      max={max}
                      unit={unit}
                      onChange={(v) => {
                        setPreset("");
                        setFilters((f) => ({ ...f, [k]: v }));
                      }}
                    />
                  ))}
                </div>
                <button className={`${BTN2} w-full`} onClick={() => { setFilters(DEF); setPreset("অরিজিনাল"); }}>
                  ফিল্টার রিসেট
                </button>
                <p className="text-xs text-[#6C748A]">iPhone Safari এ ফিল্টার প্রিভিউ ও এক্সপোর্টে কাজ নাও করতে পারে। Chrome/Edge সবচেয়ে ভালো।</p>
              </>
            )}

            {/* ── frame ── */}
            {tab === "frame" && (
              <>
                <div>
                  <div className="text-sm font-semibold mb-2">অ্যাসপেক্ট রেশিও</div>
                  <div className="flex flex-wrap gap-1.5">
                    {RATIOS.map((r) => (
                      <button key={r.k} className={chip(ratio === r.k)} onClick={() => setRatio(r.k)}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[#6C748A] mt-2">9:16 = Reels/Shorts/TikTok · 16:9 = YouTube · 1:1 = Instagram পোস্ট</p>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">ফিট</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button className={chip(fit === "cover")} onClick={() => setFit("cover")}>ভরাট (ক্রপ)</button>
                    <button className={chip(fit === "contain")} onClick={() => setFit("contain")}>পুরোটা (কালো বার)</button>
                  </div>
                </div>
                <Slider label="জুম" value={zoom} min={100} max={300} unit="%" onChange={setZoom} />
                <div className="grid grid-cols-2 gap-2">
                  <button className={BTN2} onClick={() => setRotate((r) => (r + 90) % 360)}>
                    <Icon n="rotate" className="w-4 h-4" />
                    ঘোরান {rotate}°
                  </button>
                  <button className={`${BTN2} ${flip ? "!border-[#7C6CFF]" : ""}`} onClick={() => setFlip((f) => !f)}>
                    <Icon n="flip" className="w-4 h-4" />
                    মিরর
                  </button>
                </div>
              </>
            )}

            {/* ── logo ── */}
            {tab === "logo" && (
              <>
                <div>
                  <div className="text-sm font-semibold mb-2">লোগো / আইকন</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button className={chip(logo.kind === "none")} onClick={() => setLogo((l) => ({ ...l, kind: "none" }))}>কিছু না</button>
                    <button
                      className={chip(logo.kind === "image")}
                      onClick={() => (logo.src ? setLogo((l) => ({ ...l, kind: "image" })) : logoFileRef.current?.click())}
                    >
                      ছবি
                    </button>
                    <button className={chip(logo.kind === "emoji")} onClick={() => setLogo((l) => ({ ...l, kind: "emoji" }))}>ইমোজি</button>
                  </div>
                </div>

                {logo.kind === "image" && (
                  <button className={`${BTN2} w-full`} onClick={() => logoFileRef.current?.click()}>
                    <Icon n="upload" className="w-4 h-4" />
                    {logo.src ? "অন্য লোগো আপলোড" : "লোগো আপলোড (PNG ভালো)"}
                  </button>
                )}
                {logo.kind === "emoji" && (
                  <div className="grid grid-cols-6 gap-1.5">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setLogo((l) => ({ ...l, emoji: e }))}
                        className={`h-11 rounded-lg text-2xl border transition ${logo.emoji === e ? "border-[#7C6CFF] bg-[#7C6CFF]/15" : "border-[#2B3242] bg-[#1C212C]"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                {logo.kind !== "none" && (
                  <>
                    <div>
                      <div className="text-sm font-semibold mb-2">অবস্থান</div>
                      <div className="grid grid-cols-3 gap-1.5 w-40">
                        {(["tl", "", "tr", "", "c", "", "bl", "", "br"] as (Pos | "")[]).map((p, i) =>
                          p ? (
                            <button
                              key={i}
                              aria-label={p}
                              onClick={() => setLogo((l) => ({ ...l, pos: p }))}
                              className={`h-10 rounded-lg border transition ${logo.pos === p ? "bg-[#7C6CFF] border-[#7C6CFF]" : "bg-[#1C212C] border-[#2B3242] hover:border-[#3A4358]"}`}
                            />
                          ) : (
                            <span key={i} />
                          )
                        )}
                      </div>
                    </div>
                    <Slider label="সাইজ" value={logo.size} min={5} max={50} unit="%" onChange={(v) => setLogo((l) => ({ ...l, size: v }))} />
                    <Slider label="স্বচ্ছতা" value={logo.opacity} min={20} max={100} unit="%" onChange={(v) => setLogo((l) => ({ ...l, opacity: v }))} />
                  </>
                )}
              </>
            )}

            {/* ── text ── */}
            {tab === "text" && (
              <>
                <label className="block">
                  <div className="text-sm font-semibold mb-2">টেক্সট</div>
                  <textarea
                    value={text.value}
                    onChange={(e) => setText((t) => ({ ...t, value: e.target.value }))}
                    rows={3}
                    placeholder="ভিডিওর ওপর যা লিখতে চান…"
                    className="w-full rounded-lg bg-[#1C212C] border border-[#2B3242] p-3 text-sm outline-none focus:border-[#7C6CFF] resize-none"
                  />
                </label>
                <div>
                  <div className="text-sm font-semibold mb-2">রং</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {SWATCHES.map((c) => (
                      <button
                        key={c}
                        aria-label={c}
                        onClick={() => setText((t) => ({ ...t, color: c }))}
                        className={`w-9 h-9 rounded-full border-2 transition ${text.color === c ? "border-[#7C6CFF] scale-110" : "border-[#2B3242]"}`}
                        style={{ background: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={text.color}
                      onChange={(e) => setText((t) => ({ ...t, color: e.target.value }))}
                      className="w-9 h-9 rounded-full bg-transparent border-0 cursor-pointer"
                      aria-label="কাস্টম রং"
                    />
                  </div>
                </div>
                <Slider label="সাইজ" value={text.size} min={3} max={16} onChange={(v) => setText((t) => ({ ...t, size: v }))} />
                <Slider label="ওপর-নিচ অবস্থান" value={text.y} min={8} max={92} unit="%" onChange={(v) => setText((t) => ({ ...t, y: v }))} />
                <button className={`${BTN2} w-full ${text.bg ? "!border-[#7C6CFF]" : ""}`} onClick={() => setText((t) => ({ ...t, bg: !t.bg }))}>
                  {text.bg ? "ব্যাকগ্রাউন্ড বক্স চালু" : "ব্যাকগ্রাউন্ড বক্স বন্ধ"}
                </button>
              </>
            )}

            {/* ── audio ── */}
            {tab === "audio" && (
              <>
                <Slider label="ভলিউম" value={volume} min={0} max={200} unit="%" onChange={setVolume} />
                <button className={`${BTN2} w-full ${muted ? "!border-[#7C6CFF]" : ""}`} onClick={() => setMuted((m) => !m)}>
                  <Icon n={muted ? "mute" : "volume"} className="w-4 h-4" />
                  {muted ? "মিউট করা আছে (এক্সপোর্টেও)" : "মিউট করুন"}
                </button>
                <p className="text-xs text-[#6C748A]">স্পিড বদলালেও কণ্ঠের পিচ স্বাভাবিক থাকে। ২০০% এ কিছু ভিডিওতে শব্দ ফেটে যেতে পারে।</p>
              </>
            )}

            {/* ── export ── */}
            {tab === "export" && (
              <>
                <div>
                  <div className="text-sm font-semibold mb-2">কোয়ালিটি</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[480, 720, 1080].map((r) => (
                      <button key={r} className={chip(res === r)} onClick={() => setRes(r)}>
                        {r}p
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-[#1A1F2A] border border-[#262C3A] p-3.5 text-sm space-y-1.5">
                  <Row k="সাইজ" v={`${outW} × ${outH}`} />
                  <Row k="দৈর্ঘ্য" v={fmt(totalOut)} />
                  <Row k="ক্লিপ" v={`${segs.length}টি`} />
                  <Row k="ফরম্যাট" v={mimeName ?? "—"} />
                </div>
                <button className={`${BTNP} w-full !h-12 text-base`} disabled={!hasVideo || exporting} onClick={startExport}>
                  <Icon n="download" className="w-5 h-5" />
                  ভিডিও এক্সপোর্ট করুন
                </button>
                <p className="text-xs text-[#6C748A] leading-relaxed">
                  এক্সপোর্ট ভিডিওর সমান সময় নেয় (রিয়েল-টাইমে রেকর্ড হয়)। শেষ পর্যন্ত ট্যাব খোলা ও সক্রিয় রাখুন।
                </p>
                {result && (
                  <div className="rounded-xl border border-[#7C6CFF]/50 bg-[#7C6CFF]/10 p-3.5 text-sm space-y-2">
                    <div className="font-semibold">এক্সপোর্ট প্রস্তুত · {fsize(result.size)}</div>
                    <a href={result.url} download={`framecut-${Date.now()}.${result.ext}`} className={`${BTNP} w-full`}>
                      আবার ডাউনলোড করুন (.{result.ext})
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </main>

      {/* toast */}
      {msg && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#232938] border border-[#2F3750] text-sm shadow-xl">
          {msg}
        </div>
      )}

      {dragOver && hasVideo && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#7C6CFF]/20 backdrop-blur-sm pointer-events-none text-lg font-semibold">
          নতুন ভিডিও ছেড়ে দিন
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#8D95A8]">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}
