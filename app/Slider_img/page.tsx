


"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, ShoppingBag } from "lucide-react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Api from "../api/Api";
import { useCartStore } from "../api/Carssotres";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

/* ------------------------------------------------------------------ */
/* Glass shards                                                        */
/* ------------------------------------------------------------------ */
type Pt = [number, number];

interface Shard {
  cx: number; // home centre
  cy: number;
  pts: Pt[]; // triangle points relative to centre
  x: number; // offset from home
  y: number;
  z: number; // depth (towards viewer)
  rx: number;
  ry: number;
  rz: number;
  vx: number;
  vy: number;
  vz: number;
  vrx: number;
  vry: number;
  vrz: number;
  sx: number; // snapshot when re-assembly starts
  sy: number;
  sz: number;
  srx: number;
  sry: number;
  srz: number;
  delay: number;
  g: number; // glare strength
}

const PERSPECTIVE = 800;
const CRACK_MS = 420;
const SHATTER_MS = 1000;
const GATHER_MS = 850;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const normAngle = (a: number) => {
  const t = Math.PI * 2;
  const v = ((a % t) + t) % t;
  return v > Math.PI ? v - t : v;
};

function buildShards(w: number, h: number): Shard[] {
  const cols = w < 640 ? 6 : 10;
  const rows = Math.min(10, Math.max(5, Math.round((cols * h) / w)));
  const gw = w / cols;
  const gh = h / rows;

  const grid: Pt[][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: Pt[] = [];
    for (let i = 0; i <= cols; i++) {
      let x = i * gw;
      let y = j * gh;
      if (i > 0 && i < cols) x += (Math.random() - 0.5) * gw * 0.75;
      if (j > 0 && j < rows) y += (Math.random() - 0.5) * gh * 0.75;
      row.push([x, y]);
    }
    grid.push(row);
  }

  const shards: Shard[] = [];
  const make = (a: Pt, b: Pt, c: Pt) => {
    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    shards.push({
      cx,
      cy,
      pts: [
        [a[0] - cx, a[1] - cy],
        [b[0] - cx, b[1] - cy],
        [c[0] - cx, c[1] - cy],
      ],
      x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0,
      vx: 0, vy: 0, vz: 0, vrx: 0, vry: 0, vrz: 0,
      sx: 0, sy: 0, sz: 0, srx: 0, sry: 0, srz: 0,
      delay: 0,
      g: Math.random(),
    });
  };

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = grid[j][i];
      const b = grid[j][i + 1];
      const c = grid[j + 1][i + 1];
      const d = grid[j + 1][i];
      if (Math.random() < 0.5) {
        make(a, b, c);
        make(a, c, d);
      } else {
        make(a, b, d);
        make(b, c, d);
      }
    }
  }
  return shards;
}

function drawCracks(
  ctx: CanvasRenderingContext2D,
  shards: Shard[],
  ix: number,
  iy: number,
  p: number,
  w: number,
  h: number
) {
  const maxD = Math.hypot(w, h);
  const reach = p * maxD * 0.9;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(230,245,255,${0.35 + 0.4 * p})`;
  ctx.beginPath();
  for (const s of shards) {
    if (Math.hypot(s.cx - ix, s.cy - iy) > reach) continue;
    ctx.moveTo(s.cx + s.pts[0][0], s.cy + s.pts[0][1]);
    ctx.lineTo(s.cx + s.pts[1][0], s.cy + s.pts[1][1]);
    ctx.lineTo(s.cx + s.pts[2][0], s.cy + s.pts[2][1]);
    ctx.closePath();
  }
  ctx.stroke();

  const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, maxD * 0.3 * p + 10);
  g.addColorStop(0, `rgba(255,255,255,${0.7 * (1 - p)})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawShards(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  shards: Shard[],
  w: number,
  h: number
) {
  const order = [...shards].sort((a, b) => a.z - b.z);
  for (const s of order) {
    const sx = Math.cos(s.ry);
    const sy = Math.cos(s.rx);
    if (Math.abs(sx) < 0.05 || Math.abs(sy) < 0.05) continue; // edge-on
    const persp = PERSPECTIVE / (PERSPECTIVE - s.z);
    const motion = Math.min(1, Math.hypot(s.x, s.y) / 90 + Math.abs(s.z) / 160);

    ctx.save();
    ctx.translate(s.cx + s.x, s.cy + s.y);
    ctx.rotate(s.rz);
    ctx.scale(sx * persp, sy * persp);

    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    ctx.lineTo(s.pts[1][0], s.pts[1][1]);
    ctx.lineTo(s.pts[2][0], s.pts[2][1]);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(src, -s.cx, -s.cy, w, h);

    if (sx * sy < 0) {
      // back face of the glass
      ctx.fillStyle = "rgba(120,165,195,0.55)";
      ctx.fillRect(-w, -h, w * 2, h * 2);
    } else {
      ctx.fillStyle = `rgba(255,255,255,${s.g * motion * 0.22})`;
      ctx.fillRect(-w, -h, w * 2, h * 2);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(235,248,255,${0.5 * motion})`;
    ctx.stroke();
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function PremiumSlider() {
  const { addToCart } = useCartStore() as any;

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [loadTick, setLoadTick] = useState(0);
  const [added, setAdded] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const coverCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const indexRef = useRef(0);
  const productsRef = useRef<any[]>([]);
  const animatingRef = useRef(false);
  const hoverRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const swipeStart = useRef<number | null>(null);

  /* ---------- data ---------- */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await Api.get("/products_index");
        if (res.data?.data?.length > 0) setProducts(res.data.data);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const getImageUrl = (slide: any) => {
    if (!slide) return "";
    if (slide.img) {
      const base = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
      return `${base.replace(/\/$/, "")}/uploads_product/${slide.img}`;
    }
    return slide.imglink || "";
  };

  /* preload (draw-only, so no CORS header is needed) */
  useEffect(() => {
    imagesRef.current = [];
    coverCache.current.clear();
    products.forEach((p, i) => {
      const url = getImageUrl(p);
      if (!url) return;
      const img = new Image();
      img.onload = () => setLoadTick((t) => t + 1);
      img.src = url;
      imagesRef.current[i] = img;
    });
  }, [products]);

  /* ---------- canvas sizing ---------- */
  const ready = products.length > 0;
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      sizeRef.current = { w, h, dpr };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      coverCache.current.clear();
      setSize({ w, h });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  /* image pre-rendered to an off-screen canvas ("cover" fit) */
  const getCover = useCallback((i: number): HTMLCanvasElement | null => {
    const img = imagesRef.current[i];
    const { w, h, dpr } = sizeRef.current;
    if (!img || !img.complete || !img.naturalWidth || !w) return null;
    const key = `${i}-${w}-${h}-${dpr}`;
    const hit = coverCache.current.get(key);
    if (hit) return hit;

    const c = document.createElement("canvas");
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const x = c.getContext("2d");
    if (!x) return null;

    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / h;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    let sx = 0;
    let sy = 0;
    if (ir > cr) {
      sw = img.naturalHeight * cr;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / cr;
      sy = (img.naturalHeight - sh) / 2;
    }
    x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    coverCache.current.set(key, c);
    return c;
  }, []);

  /* static (not animating) frame */
  useEffect(() => {
    if (animatingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { w, h, dpr } = sizeRef.current;
    if (!canvas || !ctx || !w) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cover = getCover(currentIndex);
    if (cover) ctx.drawImage(cover, 0, 0, w, h);
  }, [currentIndex, size, loadTick, isAnimating, products, getCover]);

  /* ---------- the glass animation ---------- */
  const goTo = useCallback(
    (target: number, impact?: { x: number; y: number }) => {
      const list = productsRef.current;
      const n = list.length;
      if (animatingRef.current || n < 2) return;
      target = ((target % n) + n) % n;
      if (target === indexRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { w, h, dpr } = sizeRef.current;
      const from = getCover(indexRef.current);
      const to = getCover(target);
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!canvas || !ctx || !w || !from || !to || reduce) {
        setCurrentIndex(target);
        return;
      }

      animatingRef.current = true;
      setIsAnimating(true);
      setTextVisible(false);

      const shards = buildShards(w, h);
      const ix = impact?.x ?? w * (0.35 + Math.random() * 0.3);
      const iy = impact?.y ?? h * (0.3 + Math.random() * 0.3);
      const maxD = Math.hypot(w, h);

      let phase: "crack" | "shatter" | "gather" = "crack";
      let phaseStart = performance.now();
      let last = phaseStart;
      let maxDelay = 0;
      let textShown = false;

      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const el = now - phaseStart;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        if (phase === "crack") {
          const p = Math.min(1, el / CRACK_MS);
          ctx.drawImage(from, 0, 0, w, h);
          drawCracks(ctx, shards, ix, iy, p, w, h);

          if (p >= 1) {
            // launch the shards away from the impact point
            const base = Math.max(w, h) * 0.75;
            for (const s of shards) {
              const dx = s.cx - ix;
              const dy = s.cy - iy;
              const d = Math.hypot(dx, dy) || 1;
              const f = 1 - Math.min(1, d / maxD) * 0.55;
              s.vx = (dx / d) * base * f * (0.5 + Math.random() * 0.8);
              s.vy = (dy / d) * base * f * (0.5 + Math.random() * 0.8) - h * 0.25 * Math.random();
              s.vz = (Math.random() * 0.8 - 0.1) * 500 * f;
              s.vrx = (Math.random() - 0.5) * 9;
              s.vry = (Math.random() - 0.5) * 9;
              s.vrz = (Math.random() - 0.5) * 6;
            }
            phase = "shatter";
            phaseStart = now;
          }
        } else if (phase === "shatter") {
          const p = Math.min(1, el / SHATTER_MS);

          // the next picture shows faintly behind the broken glass
          ctx.globalAlpha = 0.22 * p;
          ctx.drawImage(to, 0, 0, w, h);
          ctx.globalAlpha = 1;

          const dragXY = Math.pow(0.35, dt);
          for (const s of shards) {
            s.vy += h * 2.4 * dt;
            s.vx *= dragXY;
            s.vz *= dragXY;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.z = Math.min(380, s.z + s.vz * dt);
            s.rx += s.vrx * dt;
            s.ry += s.vry * dt;
            s.rz += s.vrz * dt;
          }
          drawShards(ctx, from, shards, w, h);

          if (p >= 1) {
            for (const s of shards) {
              s.sx = s.x;
              s.sy = s.y;
              s.sz = s.z;
              s.srx = normAngle(s.rx);
              s.sry = normAngle(s.ry);
              s.srz = normAngle(s.rz);
              s.delay = (s.cx / w) * 250 + Math.random() * 150;
              maxDelay = Math.max(maxDelay, s.delay);
            }
            phase = "gather";
            phaseStart = now;
            indexRef.current = target;
            setCurrentIndex(target);
          }
        } else {
          for (const s of shards) {
            const t = Math.min(1, Math.max(0, (el - s.delay) / GATHER_MS));
            const k = 1 - easeOutCubic(t);
            s.x = s.sx * k;
            s.y = s.sy * k;
            s.z = s.sz * k;
            s.rx = s.srx * k;
            s.ry = s.sry * k;
            s.rz = s.srz * k;
          }
          drawShards(ctx, to, shards, w, h);

          if (!textShown && el > 550) {
            textShown = true;
            setTextVisible(true);
          }

          if (el >= GATHER_MS + maxDelay) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(to, 0, 0, w, h);
            animatingRef.current = false;
            setTextVisible(true);
            setIsAnimating(false);
            rafRef.current = null;
            return;
          }
        }

        rafRef.current = requestAnimationFrame(frame);
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [getCover]
  );

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      animatingRef.current = false;
    },
    []
  );

  /* ---------- controls ---------- */
  const next = () => {
    const { w, h } = sizeRef.current;
    goTo(indexRef.current + 1, { x: w * 0.8, y: h * 0.45 });
  };
  const prev = () => {
    const { w, h } = sizeRef.current;
    goTo(indexRef.current - 1, { x: w * 0.2, y: h * 0.45 });
  };

  // autoplay (reads refs only, so it never goes stale)
  useEffect(() => {
    if (products.length < 2) return;
    const id = setInterval(() => {
      if (document.hidden || hoverRef.current || animatingRef.current) return;
      goTo(indexRef.current + 1);
    }, 6500);
    return () => clearInterval(id);
  }, [products.length, goTo]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || animatingRef.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    setTilt({ x: -y * 8, y: x * 8 });
  };
  const onPointerLeave = () => {
    hoverRef.current = false;
    setTilt({ x: 0, y: 0 });
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (dx < -50) next();
    else if (dx > 50) prev();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const p = products[currentIndex];
    if (!p) return;
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  /* ---------- states ---------- */
  const frameClass =
    "relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0f1112] sm:aspect-[16/10] lg:aspect-[16/9] lg:rounded-[2.25rem]";

  if (isLoading || products.length === 0) {
    return (
      <section
        className={`${serif.variable} ${sans.variable} flex w-full justify-center px-3 py-6 font-[family-name:var(--font-sans)] sm:px-6`}
      >
        <div className={`${frameClass} grid max-w-[1120px] place-items-center text-sm text-[#8e8a83]`}>
          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d8b98a] border-t-transparent" />
          ) : (
            "No products to show yet"
          )}
        </div>
      </section>
    );
  }

  const product = products[currentIndex];
  const price = Number(product?.price ?? product?.pricee ?? 0);
  const oldPrice = Number(product?.reprice ?? 0);

  return (
    <section
      className={`${serif.variable} ${sans.variable} flex w-full justify-center px-3 py-6 font-[family-name:var(--font-sans)] text-[#f3eee6] sm:px-6`}
    >
      <div className="w-full max-w-[1120px]" style={{ perspective: "1400px" }}>
        <div
          ref={stageRef}
          onPointerMove={onPointerMove}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") hoverRef.current = true;
          }}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          className={`${frameClass} touch-pan-y select-none shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)]`}
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.25s ease-out",
          }}
        >
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

          {/* legibility gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0f1112] via-[#0f1112]/55 to-transparent" />

          {/* top controls */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-1.5">
              {products.map((p, i) => (
                <button
                  key={p.id ?? i}
                  onClick={() => goTo(i)}
                  disabled={isAnimating}
                  aria-label={`Show product ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentIndex ? "w-8 bg-[#d8b98a]" : "w-1.5 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                disabled={isAnimating}
                aria-label="Previous"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition hover:border-[#d8b98a] hover:text-[#d8b98a] disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b98a] sm:h-11 sm:w-11"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                disabled={isAnimating}
                aria-label="Next"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition hover:border-[#d8b98a] hover:text-[#d8b98a] disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8b98a] sm:h-11 sm:w-11"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* text: shifts slightly against the tilt for depth */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8 lg:p-10"
            style={{ transform: `translate3d(${tilt.y * -2}px, ${tilt.x * 2}px, 0)` }}
          >
            <div
              className={`flex flex-col gap-4 transition-all duration-500 sm:flex-row sm:items-end sm:justify-between ${
                textVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="min-w-0 sm:max-w-[62%]">
                <h2 className="line-clamp-2 font-[family-name:var(--font-serif)] text-3xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                  {product?.name || "Product"}
                </h2>
                {product?.discript && (
                  <p className="mt-2 hidden line-clamp-1 text-sm text-[#cfc9bf] sm:block">
                    {product.discript}
                  </p>
                )}
                {price > 0 && (
                  <p className="mt-3 flex items-baseline gap-3">
                    <span className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[#d8b98a] sm:text-4xl">
                      ৳ {price.toLocaleString("en-US")}
                    </span>
                    {oldPrice > price && (
                      <del className="text-sm text-[#8e8a83]">৳ {oldPrice.toLocaleString("en-US")}</del>
                    )}
                  </p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!textVisible}
                className="pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#d8b98a] px-8 font-semibold text-[#0f1112] transition hover:bg-[#e4c9a0] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8b98a] sm:h-14 sm:w-auto"
              >
                {added ? (
                  <>
                    <Check size={18} /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* glow under the stage */}
        <div className="pointer-events-none mx-auto -mt-3 h-8 w-[75%] rounded-full bg-[#d8b98a]/20 blur-2xl" />
      </div>
    </section>
  );
}









// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { ChevronRight } from "lucide-react";
// import Api from "../api/Api";
// import { useCartStore } from "../api/Carssotres";

// interface Particle {
//   startX: number;
//   startY: number;
//   x: number;
//   y: number;
//   z: number;
//   size: number;
//   color: string;
//   vx: number;
//   vy: number;
//   vz: number;
//   angleX: number;
//   angleY: number;
//   opacity: number;
//   isGathering: boolean;
// }

// interface Product {
//   id: number;
//   name: string;
//   model: string;
//   price: number; // ✨ Fixed property name mapping
//   reprice?: number;
//   qty: number;
//   img?: string;
//   imglink?: string;
//   rating?: number;
//   type?: string;
// }

// export default function PremiumSlider() {
//   const { cart, addToCart, removeFromCart, updateQty } = useCartStore();

//   const [products, setProducts] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [fadeText, setFadeText] = useState(false);
//   const [showFloor, setShowFloor] = useState(false);
//   const [tilt, setTilt] = useState({ x: 0, y: 0 });

//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const imagesRef = useRef<{ [key: number]: HTMLImageElement | null }>({});
//   const currentIndexRef = useRef(currentIndex);
//   const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // 📡 API Data Load
//   useEffect(() => {
//     const fetchData = async () => {
//       console.log('Fetching all data for index sliders...');
//       try {
//         const res = await Api.get('/products_index'); 
//         if (res.data && res.data.data && res.data.data.length > 0) {
//           setProducts(res.data.data);
//           console.log('📦 Products fetched:', res.data.data);
//         }
//       } catch (err) {
//         console.error('❌ Fetch error:', err);
//       } finally {
//         setIsLoading(false);
//         console.log('Product slider fetch attempt completed.');
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     currentIndexRef.current = currentIndex;
//   }, [currentIndex]);

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!containerRef.current || isAnimating) return;
//     const box = containerRef.current.getBoundingClientRect();
//     const x = e.clientX - box.left - box.width / 2;
//     const y = e.clientY - box.top - box.height / 2;
//     setTilt({ x: -y / (box.height / 15), y: x / (box.width / 15) });
//   };

//   const handleMouseLeave = () => {
//     setTilt({ x: 0, y: 0 });
//     startAutoPlay();
//   };

//   const getImageUrl = (slide: any) => {
//     if (!slide) return "";
//     if (slide.img) {
//       const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
//       const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
//       return `${cleanBaseUrl}/uploads_product/${slide.img}`;
//     }
//     return slide.imglink || "";
//   };

//   const drawCoverImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => {
//     if (!img.naturalWidth || !img.naturalHeight) return;
    
//     const imgRatio = img.naturalWidth / img.naturalHeight;
//     const canvasRatio = w / h;
//     let cx, cy, cw, ch;

//     if (imgRatio > canvasRatio) {
//       ch = img.naturalHeight;
//       cw = img.naturalHeight * canvasRatio;
//       cx = (img.naturalWidth - cw) / 2;
//       cy = 0;
//     } else {
//       cw = img.naturalWidth;
//       ch = img.naturalWidth / canvasRatio;
//       cx = 0;
//       cy = (img.naturalHeight - ch) / 2;
//     }
//     ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
//   };

//   const drawImageOnCanvas = (index: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const parent = canvas.parentElement;
//     canvas.width = parent ? parent.offsetWidth : 1000;
//     canvas.height = parent ? parent.offsetHeight : 600;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     const img = imagesRef.current[index];
    
//     if (img) {
//       if (img.complete && img.naturalWidth > 0) {
//         drawCoverImage(ctx, img, canvas.width, canvas.height);
//       } else {
//         img.onload = () => {
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           drawCoverImage(ctx, img, canvas.width, canvas.height);
//         };
//         const currentSrc = img.src;
//         img.src = currentSrc;
//       }
//     }
//   };

//   // 🛒 Handle Add To Cart Function
//   const handleAddToCart = (e: React.MouseEvent, product: Product) => {
//     e.preventDefault();
//     if (!product) return;
//     addToCart(product);
//     alert('Product added to cart successfully! ' + product.name);
//   };

//   const handleNext = () => {
//     if (isAnimating || products.length === 0) return;
//     setIsAnimating(true);
//     setFadeText(true);
//     setTilt({ x: 0, y: 0 });

//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const activeIndex = currentIndexRef.current;
//     const nextIndex = (activeIndex + 1) % products.length;

//     const currentImg = imagesRef.current[activeIndex];
//     const nextImg = imagesRef.current[nextIndex];

//     if (!currentImg || !nextImg || !currentImg.naturalWidth || !nextImg.naturalWidth) {
//       setCurrentIndex(nextIndex);
//       setFadeText(false);
//       setIsAnimating(false);
//       setTimeout(() => drawImageOnCanvas(nextIndex), 50);
//       return;
//     }

//     const w = canvas.width;
//     const h = canvas.height;

//     let currentImgData: Uint8ClampedArray;
//     let nextImgData: Uint8ClampedArray;

//     try {
//       const tempCanvas1 = document.createElement("canvas");
//       tempCanvas1.width = w;
//       tempCanvas1.height = h;
//       const tempCtx1 = tempCanvas1.getContext("2d");
//       if (!tempCtx1) throw new Error("Could not get temp context 1");
//       drawCoverImage(tempCtx1, currentImg, w, h);
//       currentImgData = tempCtx1.getImageData(0, 0, w, h).data;

//       const tempCanvas2 = document.createElement("canvas");
//       tempCanvas2.width = w;
//       tempCanvas2.height = h;
//       const tempCtx2 = tempCanvas2.getContext("2d");
//       if (!tempCtx2) throw new Error("Could not get temp context 2");
//       drawCoverImage(tempCtx2, nextImg, w, h);
//       nextImgData = tempCtx2.getImageData(0, 0, w, h).data;
//     } catch (e) {
//       console.warn("⚠️ CORS issues or Canvas Error, skipping particle animation:", e);
//       setCurrentIndex(nextIndex);
//       setFadeText(false);
//       setIsAnimating(false);
//       setTimeout(() => drawImageOnCanvas(nextIndex), 50);
//       return;
//     }

//     const particles: Particle[] = [];
//     const sampleSize = 15; 

//     for (let y = 0; y < h; y += sampleSize) {
//       for (let x = 0; x < w; x += sampleSize) {
//         const idx = (y * w + x) * 4;
//         if (currentImgData[idx + 3] < 50) continue;

//         particles.push({
//           startX: x,
//           startY: y,
//           x: x,
//           y: y,
//           z: 0,
//           size: sampleSize + 1,
//           color: `rgb(${currentImgData[idx]}, ${currentImgData[idx + 1]}, ${currentImgData[idx + 2]})`,
//           vx: (Math.random() - 0.5) * 14,
//           vy: (Math.random() - 0.5) * 8,
//           vz: (Math.random() - 0.5) * 12,
//           angleX: 0,
//           angleY: 0,
//           opacity: 1,
//           isGathering: false,
//         });
//       }
//     }

//     let phase = "pageFlip"; 
//     let globalFlipAngle = 0; 
//     let holdTimer = 0;

//     const animateSlider = () => {
//       ctx.clearRect(0, 0, w, h);
//       particles.sort((a, b) => b.z - a.z);

//       let activeParticles = 0;

//       if (phase === "pageFlip") {
//         globalFlipAngle += 0.06;
//         if (globalFlipAngle >= Math.PI / 2) { 
//           phase = "shatter";
//         }
//       }

//       for (let i = 0; i < particles.length; i++) {
//         const p = particles[i];

//         if (phase === "pageFlip") {
//           const originX = w / 2;
//           const dx = p.startX - originX;
//           p.x = originX + dx * Math.cos(globalFlipAngle);
//           p.z = -dx * Math.sin(globalFlipAngle);
//           p.y = p.startY + Math.sin(p.startX / w * Math.PI) * (globalFlipAngle * 40);
//           activeParticles++;
//         }
//         else if (phase === "shatter") {
//           p.vy += 0.55; 
//           p.x += p.vx;
//           p.y += p.vy;
//           p.z += p.vz;
//           p.angleX += 0.04;

//           const floorY = h - p.size;
//           if (p.y >= floorY) {
//             p.y = floorY;
//             p.vx *= 0.3;
//             p.vy = 0;
//             p.vz *= 0.3;
//             p.angleX *= 0.5; 
//           }
//           activeParticles++;
//         } 
//         else if (phase === "gather") {
//           if (!p.isGathering) {
//             p.isGathering = true;
//             const idx = (Math.floor(p.startY) * w + Math.floor(p.startX)) * 4;
//             p.color = `rgb(${nextImgData[idx]}, ${nextImgData[idx + 1]}, ${nextImgData[idx + 2]})`;
//           }

//           p.x += (p.startX - p.x) * 0.14;
//           p.y += (p.startY - p.y) * 0.14;
//           p.z += (0 - p.z) * 0.14;
//           p.angleX += (0 - p.angleX) * 0.14;
          
//           const dist = Math.abs(p.x - p.startX) + Math.abs(p.y - p.startY);
//           if (dist > 0.8) {
//             activeParticles++;
//           }
//         }

//         const perspective = 500;
//         const scale = perspective / (perspective + p.z);
//         const drawX = p.x * scale + w / 2 * (1 - scale);
//         const drawY = p.y * scale + h / 2 * (1 - scale);
//         const drawSize = p.size * scale;

//         if (drawSize > 0 && p.opacity > 0) {
//           ctx.save();
//           ctx.translate(drawX, drawY);
//           if (phase !== "pageFlip") ctx.rotate(p.angleX);
          
//           ctx.fillStyle = p.color;
//           ctx.globalAlpha = p.opacity;
          
//           ctx.beginPath();
//           ctx.rect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
//           ctx.fill();
//           ctx.restore();
//         }
//       }

//       if (phase === "shatter") {
//         setShowFloor(true);
//       }

//       if (phase === "shatter" && holdTimer < 35) {
//         let landedCount = particles.filter(p => p.y >= h - (p.size * 2)).length;
//         if (landedCount > particles.length * 0.70) {
//           holdTimer++;
//           if (holdTimer >= 35) {
//             phase = "gather";
//             setCurrentIndex(nextIndex);
//             setShowFloor(false);
//           }
//         }
//       }

//       if (phase === "gather" && activeParticles === 0) {
//         setFadeText(false);
//         setIsAnimating(false);
//         drawImageOnCanvas(nextIndex);
//         return;
//       }

//       requestAnimationFrame(animateSlider);
//     };

//     animateSlider();
//   };

//   const startAutoPlay = () => {
//     stopAutoPlay();
//     if (products.length === 0) return;
//     autoPlayTimerRef.current = setInterval(() => {
//       if (!isAnimating) handleNext();
//     }, 6500);
//   };

//   const stopAutoPlay = () => {
//     if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
//   };

//   useEffect(() => {
//     if (products.length > 0) {
//       if (!isAnimating) {
//         drawImageOnCanvas(currentIndex);
//         startAutoPlay();
//       }
//     }
//     return () => stopAutoPlay();
//   }, [currentIndex, isAnimating, products]);

//   useEffect(() => {
//     const handleResize = () => drawImageOnCanvas(currentIndexRef.current);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (isLoading || products.length === 0) {
//     return (
//       <div className="w-[95%] max-w-[1100px] h-[550px] sm:h-[600px] bg-[#050505] rounded-[40px] flex items-center justify-center text-white font-medium border border-white/10">
//         Loading Premium Experience...
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full flex items-center justify-center">
//       <div 
//         ref={containerRef}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//         onMouseEnter={stopAutoPlay}
//         className="relative w-[95%] max-w-[1100px] h-[550px] sm:h-[600px] bg-[#050505] rounded-[40px] overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out select-none"
//         style={{
//           perspective: "1200px",
//           transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
//           transformStyle: "preserve-3d"
//         }}
//       >
//         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

//         {/* ৩ডি ফ্লোর শ্যাডো */}
//         <div 
//           className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[160px] bg-gradient-to-t from-orange-500/20 via-amber-500/5 to-transparent pointer-events-none z-10 transition-all duration-1000 blur-md ${showFloor ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} 
//           style={{
//             transform: "rotateX(80deg)",
//             transformOrigin: "bottom center",
//           }}
//         />

//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 z-20 pointer-events-none" />

//         {/* টেক্সট ও কন্টেন্ট */}
//         <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 max-w-[680px]" style={{ transform: "translateZ(60px)" }}>
//           <div className={`flex flex-col items-center transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${fadeText ? "opacity-0 translate-y-16 scale-90 blur-md" : "opacity-100 translate-y-0 scale-100 blur-0"}`}>
            
//             <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] bg-gradient-to-b from-white to-gray-400 bg-clip-text">
//               {products[currentIndex]?.name || "Premium Product"}
//             </h2>
            
//             <p className="text-xs sm:text-sm md:text-base text-gray-300/90 font-light leading-relaxed mb-4 px-4 max-w-[550px]">
//               {products[currentIndex]?.discript || "Description not available."}
//             </p>

//             <p className="text-xs sm:text-sm md:text-base text-gray-400 font-mono tracking-wider mb-2 px-4 max-w-[550px]">
//               {products[currentIndex]?.model || "Model not available."}
//             </p>

//             <p className="text-lg sm:text-xl font-bold text-orange-400 mb-8 px-4 max-w-[550px]">
//               {products[currentIndex]?.price ? `Price: ${products[currentIndex].price}` : "Price not available."}
//             </p>
            
//             <button 
//               onClick={(e) => handleAddToCart(e, products[currentIndex])} 
//               className="relative px-12 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_25px_50px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider text-sm border border-white/10 overflow-hidden group"
//             >
//               <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
//               ORDER NOW
//             </button>
//           </div>
//         </div>

//         {/* 🖼️ হিডেন ইমেজ প্রি-লোডার */}
//         <div className="opacity-0 pointer-events-none absolute w-0 h-0 overflow-hidden">
//           {products.map((slide, index) => {
//             const srcUrl = getImageUrl(slide);
//             if (!srcUrl) return null;
//             return (
//               <img
//                 key={slide.id || index}
//                 ref={(el) => { imagesRef.current[index] = el; }}
//                 src={srcUrl}
//                 alt={slide.name || "slider"}
//                 crossOrigin="anonymous"
//                 onLoad={() => {
//                   if (index === currentIndexRef.current) {
//                     drawImageOnCanvas(index);
//                   }
//                 }}
//               />
//             );
//           })}
//         </div>
//       </div>

//       {/* ➡️ নেভিগেশন বাটন */}
//       <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 z-40" style={{ transform: "translateZ(80px)" }}>
//         <button
//           onClick={handleNext}
//           disabled={isAnimating}
//           className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 hover:bg-white hover:text-black hover:scale-110 active:scale-90 disabled:opacity-20 shadow-2xl"
//         >
//           <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
//         </button>
//       </div>
//     </div>
//   );
// }

