





'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ============================ ডেটা ============================ */
type Phase = 'menu' | 'play' | 'shop' | 'over';
type Gun = { id: string; name: string; price: number; dmg: number; rate: number; spread: number; pellets: number; speed: number; pierce: number; color: string; desc: string };
const GUNS: Gun[] = [
  { id: 'pistol', name: 'পিস্তল', price: 0, dmg: 14, rate: 3.5, spread: 0.04, pellets: 1, speed: 760, pierce: 0, color: '#fde047', desc: 'সাধারণ, ভরসাযোগ্য' },
  { id: 'smg', name: 'SMG', price: 500, dmg: 8, rate: 12, spread: 0.14, pellets: 1, speed: 800, pierce: 0, color: '#fb923c', desc: 'ঝড়ের মতো দ্রুত গুলি' },
  { id: 'shotgun', name: 'শটগান', price: 900, dmg: 9, rate: 1.4, spread: 0.42, pellets: 8, speed: 700, pierce: 0, color: '#f87171', desc: 'কাছের ভূতের যম' },
  { id: 'rifle', name: 'রাইফেল', price: 1600, dmg: 28, rate: 5, spread: 0.02, pellets: 1, speed: 1000, pierce: 1, color: '#a3e635', desc: 'গুলি ২টা ভূত ফুঁড়ে যায়' },
  { id: 'plasma', name: 'প্লাজমা গান', price: 3500, dmg: 45, rate: 9, spread: 0.03, pellets: 1, speed: 1100, pierce: 3, color: '#22d3ee', desc: '৪টা ভূত একসাথে ভেদ করে' },
];
const UPS = [
  { id: 'dmg', name: 'ড্যামেজ', desc: 'গুলির ক্ষতি +১০%', base: 150 },
  { id: 'rate', name: 'ফায়ার রেট', desc: 'গুলি ছোড়া +৮% দ্রুত', base: 150 },
  { id: 'hp', name: 'সর্বোচ্চ HP', desc: 'জীবন +২০', base: 120 },
  { id: 'spd', name: 'গতি', desc: 'দৌড় +৫%', base: 100 },
] as const;
type UpId = (typeof UPS)[number]['id'];
type Save = { pts: number; xp: number; lvl: number; owned: string[]; gun: string; up: Record<UpId, number>; bombs: number; kits: number; best: number };
const DEF: Save = { pts: 0, xp: 0, lvl: 1, owned: ['pistol'], gun: 'pistol', up: { dmg: 0, rate: 0, hp: 0, spd: 0 }, bombs: 1, kits: 1, best: 0 };
const LS = 'ghost-hunter-v1';
const WH = 1100; // মানচিত্রের অর্ধেক আকার
const MAXUP = 15;
const need = (l: number) => 60 + l * 45;
const upCost = (id: UpId, l: number) => Math.round(UPS.find((u) => u.id === id)!.base * (1 + l * 0.7));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ভূতের ধরন: n = সাধারণ, f = দ্রুত, t = ট্যাংক, b = বস */
const KIND: Record<string, { hp: number; hpl: number; sp: number; r: number; dmg: number; pts: number; col: string }> = {
  n: { hp: 30, hpl: 7, sp: 62, r: 20, dmg: 8, pts: 10, col: '#e2e8f0' },
  f: { hp: 20, hpl: 4, sp: 125, r: 16, dmg: 6, pts: 16, col: '#67e8f9' },
  t: { hp: 130, hpl: 20, sp: 42, r: 32, dmg: 16, pts: 40, col: '#c4b5fd' },
  b: { hp: 900, hpl: 140, sp: 55, r: 60, dmg: 30, pts: 400, col: '#fb7185' },
};
type Ghost = { x: number; y: number; hp: number; max: number; sp: number; r: number; dmg: number; pts: number; col: string; kind: string; flash: number; atk: number; ph: number };
type Bul = { x: number; y: number; vx: number; vy: number; dmg: number; life: number; pierce: number; hit: Set<Ghost>; col: string };
type Part = { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; sz: number };
type Txt = { x: number; y: number; s: string; life: number; col: string };
type Drop = { x: number; y: number; kind: 'hp' | 'coin'; life: number };

const newGame = (s: Save) => ({
  px: 0, py: 0, hp: 100 + s.up.hp * 20, faceA: 0, aimA: 0, inv: 1.5,
  ghosts: [] as Ghost[], bullets: [] as Bul[], parts: [] as Part[], texts: [] as Txt[], drops: [] as Drop[],
  t: 0, spawn: 1, shake: 0, hurt: 0, cd: 0, kills: 0, earned: 0, bossLvl: 0, msg: '', msgT: 0, flash: 0,
  ring: null as null | { x: number; y: number; t: number },
});

const glass = 'border border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-2xl';
const btn = 'rounded-xl px-4 py-3 text-sm font-black active:scale-95 transition';

/* ============================ কম্পোনেন্ট ============================ */
export default function Page() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const S = useRef<Save>({ ...DEF, owned: [...DEF.owned], up: { ...DEF.up } });
  const G = useRef(newGame(S.current));
  const phaseRef = useRef<Phase>('menu');
  const prevRef = useRef<Phase>('menu');
  const muteRef = useRef(false);
  const bombFn = useRef<() => void>(() => {});
  const kitFn = useRef<() => void>(() => {});
  const audio = useRef<AudioContext | null>(null);
  const inp = useRef({ keys: new Set<string>(), mx: 0, my: 0, firing: false, touch: false, joy: { x: 0, y: 0 }, joyId: -1, joyO: { x: 0, y: 0 }, fireId: -1, w: 800, h: 600 });

  const [phase, setPhaseS] = useState<Phase>('menu');
  const [tab, setTab] = useState<'gun' | 'up' | 'item'>('gun');
  const [mute, setMute] = useState(false);
  const [, force] = useState(0);
  const [hud, setHud] = useState({ hp: 100, max: 100, lvl: 1, xp: 0, need: 105, pts: 0, kills: 0, gun: 'পিস্তল', bombs: 1, kits: 1, msg: '' });
  const [over, setOver] = useState({ kills: 0, earned: 0 });

  const setPhase = (p: Phase) => { phaseRef.current = p; setPhaseS(p); inp.current.keys.clear(); inp.current.firing = false; };
  const persist = () => { try { localStorage.setItem(LS, JSON.stringify(S.current)); } catch { /* ignore */ } };
  const toast = (m: string) => { G.current.msg = m; G.current.msgT = 2.5; };

  const startRun = () => { G.current = newGame(S.current); setPhase('play'); };
  const openShop = () => { if (phaseRef.current === 'shop') return; prevRef.current = phaseRef.current; setPhase('shop'); };
  const closeShop = () => { setPhase(prevRef.current === 'shop' ? 'menu' : prevRef.current); };
  openShopRef.current = openShop; closeShopRef.current = closeShop;

  /* ---- দোকান থেকে কেনা ---- */
  const buyGun = (g: Gun) => {
    const s = S.current;
    if (s.owned.includes(g.id)) { s.gun = g.id; persist(); return force((n) => n + 1); }
    if (s.pts < g.price) return;
    s.pts -= g.price; s.owned.push(g.id); s.gun = g.id; persist(); force((n) => n + 1);
  };
  const buyUp = (id: UpId) => {
    const s = S.current, c = upCost(id, s.up[id]);
    if (s.pts < c || s.up[id] >= MAXUP) return;
    s.pts -= c; s.up[id]++;
    if (id === 'hp') G.current.hp += 20;
    persist(); force((n) => n + 1);
  };
  const buyItem = (k: 'bombs' | 'kits', price: number) => {
    const s = S.current;
    if (s.pts < price || s[k] >= 9) return;
    s.pts -= price; s[k]++; persist(); force((n) => n + 1);
  };

  /* ---- ইনপুট (মাউস / টাচ) ---- */
  const pos = (e: React.PointerEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const pd = (e: React.PointerEvent) => {
    const i = inp.current, { x, y } = pos(e);
    try { audio.current?.resume(); } catch { /* ignore */ }
    if (e.pointerType === 'touch') {
      i.touch = true;
      if (x < i.w * 0.4 && i.joyId < 0) { i.joyId = e.pointerId; i.joyO = { x, y }; i.joy = { x: 0, y: 0 }; }
      else if (i.fireId < 0) { i.fireId = e.pointerId; i.mx = x; i.my = y; i.firing = true; }
    } else { i.touch = false; i.mx = x; i.my = y; i.firing = true; }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const pm = (e: React.PointerEvent) => {
    const i = inp.current, { x, y } = pos(e);
    if (e.pointerId === i.joyId) i.joy = { x: clamp((x - i.joyO.x) / 50, -1, 1), y: clamp((y - i.joyO.y) / 50, -1, 1) };
    else if (e.pointerId === i.fireId || e.pointerType !== 'touch') { i.mx = x; i.my = y; }
  };
  const pu = (e: React.PointerEvent) => {
    const i = inp.current;
    if (e.pointerId === i.joyId) { i.joyId = -1; i.joy = { x: 0, y: 0 }; }
    else if (e.pointerId === i.fireId) { i.fireId = -1; i.firing = false; }
    else if (e.pointerType !== 'touch') i.firing = false;
  };

  /* ============================ গেম লুপ ============================ */
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS) || 'null');
      if (raw) S.current = { ...DEF, ...raw, up: { ...DEF.up, ...(raw.up || {}) }, owned: Array.isArray(raw.owned) && raw.owned.length ? raw.owned : ['pistol'] };
    } catch { /* ignore */ }
    force((n) => n + 1);

    const c = cv.current!, ctx = c.getContext('2d')!, i = inp.current;
    let dpr = 1;
    const resize = () => {
      const w = wrap.current!.clientWidth || 1, h = wrap.current!.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 2); c.width = w * dpr; c.height = h * dpr; i.w = w; i.h = h;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap.current!);

    const beep = (f: number, d: number, type: OscillatorType = 'square', v = 0.04) => {
      if (muteRef.current) return;
      try {
        const a = audio.current ?? (audio.current = new AudioContext()), o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.value = f; g.gain.value = v; g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + d);
      } catch { /* ignore */ }
    };
    const burst = (x: number, y: number, col: string, n: number, sp: number) => {
      const g = G.current;
      for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, v = sp * (0.3 + Math.random()); g.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, col, sz: 2 + Math.random() * 3 }); }
    };
    const gunNow = () => GUNS.find((x) => x.id === S.current.gun) ?? GUNS[0];

    const spawnGhost = (kind: string) => {
      const g = G.current, lvl = S.current.lvl, k = KIND[kind];
      const a = Math.random() * 6.283, d = Math.max(i.w, i.h) * 0.62 + Math.random() * 120;
      const hp = k.hp + k.hpl * lvl;
      g.ghosts.push({ x: clamp(g.px + Math.cos(a) * d, -WH - 100, WH + 100), y: clamp(g.py + Math.sin(a) * d, -WH - 100, WH + 100), hp, max: hp, sp: Math.min(k.sp * (1 + lvl * 0.02), k.sp * 2), r: k.r, dmg: k.dmg + lvl * 0.5, pts: Math.round(k.pts * (1 + lvl * 0.05)), col: k.col, kind, flash: 0, atk: 0, ph: Math.random() * 6 });
    };

    const kill = (a: Ghost) => {
      const g = G.current, s = S.current;
      g.ghosts.splice(g.ghosts.indexOf(a), 1);
      g.kills++; s.pts += a.pts; s.xp += a.pts; g.earned += a.pts;
      burst(a.x, a.y, a.col, a.kind === 'b' ? 40 : 14, 220);
      g.texts.push({ x: a.x, y: a.y - a.r, s: '+' + a.pts, life: 0.9, col: '#fde047' });
      beep(a.kind === 'b' ? 80 : 220, a.kind === 'b' ? 0.5 : 0.12, 'triangle', 0.06);
      const r = Math.random();
      if (r < 0.06) g.drops.push({ x: a.x, y: a.y, kind: 'hp', life: 12 });
      else if (r < 0.2 || a.kind === 'b') g.drops.push({ x: a.x, y: a.y, kind: 'coin', life: 12 });
      while (s.xp >= need(s.lvl)) {
        s.xp -= need(s.lvl); s.lvl++; s.pts += s.lvl * 25; g.earned += s.lvl * 25; g.hp = 100 + s.up.hp * 20;
        toast(`🎉 লেভেল ${s.lvl}! বোনাস +${s.lvl * 25} পয়েন্ট, জীবন পূর্ণ`); beep(660, 0.3, 'sine', 0.07);
      }
    };

    bombFn.current = () => {
      const g = G.current, s = S.current;
      if (phaseRef.current !== 'play' || s.bombs <= 0) return;
      s.bombs--; g.ring = { x: g.px, y: g.py, t: 0 }; g.shake = 18; beep(60, 0.5, 'sawtooth', 0.09);
      [...g.ghosts].forEach((a) => { if (Math.hypot(a.x - g.px, a.y - g.py) < 380) { a.hp -= 250; a.flash = 0.2; if (a.hp <= 0) kill(a); } });
    };
    kitFn.current = () => {
      const g = G.current, s = S.current, max = 100 + s.up.hp * 20;
      if (phaseRef.current !== 'play' || s.kits <= 0 || g.hp >= max) return;
      s.kits--; g.hp = Math.min(max, g.hp + 60); beep(520, 0.2, 'sine', 0.06); toast('💊 মেডকিট: +৬০ জীবন');
    };

    /* ---------- আপডেট ---------- */
    const step = (dt: number) => {
      const g = G.current, s = S.current, gun = gunNow(), lvl = s.lvl, k = i.keys;
      g.t += dt; g.inv -= dt; g.hurt = Math.max(0, g.hurt - dt); g.shake = Math.max(0, g.shake - dt * 30); g.flash -= dt; g.msgT -= dt;

      let ix = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0) + i.joy.x;
      let iy = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0) + i.joy.y;
      const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
      const sp = 210 * (1 + 0.05 * s.up.spd) * (k.has('shift') ? 1.35 : 1);
      g.px = clamp(g.px + ix * sp * dt, -WH, WH); g.py = clamp(g.py + iy * sp * dt, -WH, WH);
      if (l > 0.2 && i.touch) g.faceA = Math.atan2(iy, ix);

      g.aimA = Math.atan2(g.py - i.h / 2 + i.my - g.py, g.px - i.w / 2 + i.mx - g.px);
      let fireA: number | null = null;
      if (i.firing) fireA = g.aimA;
      else if (i.touch) {
        let best = 520, tgt: Ghost | null = null;
        for (const a of g.ghosts) { const d = Math.hypot(a.x - g.px, a.y - g.py); if (d < best) { best = d; tgt = a; } }
        if (tgt) fireA = Math.atan2(tgt.y - g.py, tgt.x - g.px);
      }
      if (fireA !== null) g.faceA = fireA; else if (!i.touch) g.faceA = g.aimA;

      g.cd -= dt;
      if (fireA !== null && g.cd <= 0) {
        g.cd = 1 / (gun.rate * (1 + 0.08 * s.up.rate));
        for (let p = 0; p < gun.pellets; p++) {
          const a = fireA + (Math.random() - 0.5) * gun.spread * 2;
          g.bullets.push({ x: g.px + Math.cos(fireA) * 30, y: g.py + Math.sin(fireA) * 30, vx: Math.cos(a) * gun.speed, vy: Math.sin(a) * gun.speed, dmg: gun.dmg * (1 + 0.1 * s.up.dmg), life: gun.pellets > 1 ? 0.35 : 0.9, pierce: gun.pierce, hit: new Set(), col: gun.color });
        }
        g.flash = 0.06; g.shake = Math.max(g.shake, gun.pellets > 1 ? 5 : 1.5);
        beep(gun.id === 'shotgun' ? 90 : gun.id === 'plasma' ? 700 : 300, 0.07, gun.id === 'plasma' ? 'sine' : 'square', 0.03);
      }

      /* গুলি */
      for (let b = g.bullets.length - 1; b >= 0; b--) {
        const u = g.bullets[b]; u.x += u.vx * dt; u.y += u.vy * dt; u.life -= dt;
        let dead = u.life <= 0;
        if (!dead) for (const a of [...g.ghosts]) {
          if (u.hit.has(a) || Math.hypot(a.x - u.x, a.y - u.y) > a.r + 6) continue;
          u.hit.add(a); a.hp -= u.dmg; a.flash = 0.08; burst(u.x, u.y, a.col, 3, 120);
          a.x += (u.vx / gun.speed) * 6; a.y += (u.vy / gun.speed) * 6;
          if (a.hp <= 0) kill(a);
          if (u.pierce-- <= 0) { dead = true; break; }
        }
        if (dead) g.bullets.splice(b, 1);
      }

      /* ভূত */
      if (lvl % 5 === 0 && g.bossLvl !== lvl) { g.bossLvl = lvl; spawnGhost('b'); toast(`👹 বস ভূত এসেছে! (লেভেল ${lvl})`); beep(70, 0.8, 'sawtooth', 0.08); }
      g.spawn -= dt;
      if (g.spawn <= 0 && g.ghosts.length < Math.min(70, 18 + lvl * 3)) {
        g.spawn = Math.max(0.22, 1.3 - lvl * 0.06);
        const r = Math.random(); spawnGhost(lvl >= 4 && r < 0.12 ? 't' : lvl >= 2 && r < 0.35 ? 'f' : 'n');
      }
      for (const a of g.ghosts) {
        const dx = g.px - a.x, dy = g.py - a.y, d = Math.hypot(dx, dy) || 1;
        a.x += (dx / d) * a.sp * dt; a.y += (dy / d) * a.sp * dt; a.flash -= dt; a.atk -= dt;
        if (d < a.r + 16 && a.atk <= 0) {
          a.atk = 0.8;
          if (g.inv <= 0) { g.hp -= a.dmg; g.hurt = 0.4; g.shake = 10; beep(110, 0.15, 'sawtooth', 0.07); }
        }
      }
      for (let p = 0; p < g.ghosts.length; p++) for (let q = p + 1; q < g.ghosts.length; q++) {
        const a = g.ghosts[p], b = g.ghosts[q], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = (a.r + b.r) * 0.8;
        if (d > 0 && d < m) { const f = (m - d) / 2 / d; a.x -= dx * f; a.y -= dy * f; b.x += dx * f; b.y += dy * f; }
      }

      /* ড্রপ, কণা, লেখা */
      for (let n = g.drops.length - 1; n >= 0; n--) {
        const o = g.drops[n], d = Math.hypot(g.px - o.x, g.py - o.y); o.life -= dt;
        if (d < 130) { o.x += ((g.px - o.x) / d) * 260 * dt; o.y += ((g.py - o.y) / d) * 260 * dt; }
        if (d < 24) {
          if (o.kind === 'coin') { const v = 20 + lvl * 3; s.pts += v; g.earned += v; g.texts.push({ x: o.x, y: o.y, s: '🪙+' + v, life: 0.8, col: '#fbbf24' }); beep(900, 0.08, 'sine', 0.05); }
          else { g.hp = Math.min(100 + s.up.hp * 20, g.hp + 25); g.texts.push({ x: o.x, y: o.y, s: '❤️+25', life: 0.8, col: '#4ade80' }); beep(500, 0.1, 'sine', 0.05); }
          g.drops.splice(n, 1);
        } else if (o.life <= 0) g.drops.splice(n, 1);
      }
      for (let n = g.parts.length - 1; n >= 0; n--) { const p = g.parts[n]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) g.parts.splice(n, 1); }
      for (let n = g.texts.length - 1; n >= 0; n--) { const t = g.texts[n]; t.y -= 40 * dt; t.life -= dt; if (t.life <= 0) g.texts.splice(n, 1); }
      if (g.ring) { g.ring.t += dt; if (g.ring.t > 0.5) g.ring = null; }

      /* মৃত্যু */
      if (g.hp <= 0) {
        s.best = Math.max(s.best, g.kills); persist();
        setOver({ kills: g.kills, earned: g.earned }); beep(60, 0.9, 'sawtooth', 0.09); setPhase('over');
      }
    };

    /* ---------- আঁকা ---------- */
    const drawGhost = (a: Ghost, t: number) => {
      const r = a.r, g = G.current, n = 4, w = (2 * r) / n, ang = Math.atan2(g.py - a.y, g.px - a.x);
      ctx.save(); ctx.translate(a.x, a.y + Math.sin(t * 5 + a.ph) * 3);
      ctx.shadowColor = a.col; ctx.shadowBlur = a.flash > 0 ? 28 : 14;
      ctx.fillStyle = a.flash > 0 ? '#fff' : a.col; ctx.globalAlpha = 0.93;
      ctx.beginPath(); ctx.arc(0, -r * 0.1, r, Math.PI, 0); ctx.lineTo(r, r * 0.9);
      for (let k = 0; k < n; k++) ctx.quadraticCurveTo(r - k * w - w / 2, r * 0.9 + Math.sin(t * 8 + k + a.ph) * r * 0.25, r - (k + 1) * w, r * 0.9);
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      for (const s of [-1, 1]) {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s * r * 0.36, -r * 0.2, r * 0.2, r * 0.27, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(s * r * 0.36 + Math.cos(ang) * r * 0.1, -r * 0.2 + Math.sin(ang) * r * 0.12, r * 0.11, 0, 7); ctx.fill();
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s * r * 0.6, -r * 0.55); ctx.lineTo(s * r * 0.15, -r * 0.4); ctx.stroke();
      }
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.3, r * (0.12 + 0.1 * Math.abs(Math.sin(t * 7 + a.ph))), 0, 0, 7); ctx.fill();
      if (a.kind === 't' || a.kind === 'b') {
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(-r, -r * 1.35, r * 2, 5); ctx.fillStyle = '#f43f5e'; ctx.fillRect(-r, -r * 1.35, r * 2 * Math.max(0, a.hp / a.max), 5);
      }
      ctx.restore();
    };

    const draw = (t: number) => {
      const g = G.current, s = S.current, gun = gunNow(), W = i.w, H = i.h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0a0e17'; ctx.fillRect(0, 0, W, H);
      const sh = g.shake, cx = g.px - W / 2 + (Math.random() - 0.5) * sh, cy = g.py - H / 2 + (Math.random() - 0.5) * sh;
      ctx.save(); ctx.translate(-cx, -cy);
      ctx.strokeStyle = 'rgba(148,163,184,.07)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = Math.floor(cx / 80) * 80; x < cx + W + 80; x += 80) { ctx.moveTo(x, cy - 80); ctx.lineTo(x, cy + H + 80); }
      for (let y = Math.floor(cy / 80) * 80; y < cy + H + 80; y += 80) { ctx.moveTo(cx - 80, y); ctx.lineTo(cx + W + 80, y); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(239,68,68,.6)'; ctx.lineWidth = 4; ctx.strokeRect(-WH - 20, -WH - 20, 2 * WH + 40, 2 * WH + 40);

      for (const o of g.drops) {
        ctx.fillStyle = o.kind === 'coin' ? '#fbbf24' : '#4ade80'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(o.x, o.y, 8 + Math.sin(t * 8) * 1.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.fillText(o.kind === 'coin' ? '$' : '+', o.x, o.y + 4);
      }
      for (const u of g.bullets) {
        ctx.strokeStyle = u.col; ctx.lineWidth = 3; ctx.shadowColor = u.col; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.lineTo(u.x - u.vx * 0.02, u.y - u.vy * 0.02); ctx.stroke(); ctx.shadowBlur = 0;
      }
      [...g.ghosts].sort((a, b) => a.y - b.y).forEach((a) => drawGhost(a, t));

      /* খেলোয়াড় */
      ctx.save(); ctx.translate(g.px, g.py);
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(0, 16, 17, 6, 0, 0, 7); ctx.fill();
      if (g.inv > 0 && Math.floor(t * 20) % 2) ctx.globalAlpha = 0.45;
      ctx.rotate(g.faceA);
      ctx.fillStyle = gun.color; ctx.fillRect(6, -4, 28, 8); ctx.fillStyle = '#0f172a'; ctx.fillRect(6, -4, 9, 8);
      ctx.fillStyle = '#38bdf8'; ctx.strokeStyle = '#0c4a6e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fcd9b6'; ctx.beginPath(); ctx.arc(3, 0, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(8, -3.5, 1.8, 0, 7); ctx.arc(8, 3.5, 1.8, 0, 7); ctx.fill();
      if (g.flash > 0) { ctx.fillStyle = '#fde047'; ctx.shadowColor = '#fde047'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(38, 0, 8, 0, 7); ctx.fill(); }
      ctx.restore();

      for (const p of g.parts) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.sz, p.sz); }
      ctx.globalAlpha = 1;
      if (g.ring) { ctx.strokeStyle = `rgba(251,146,60,${1 - g.ring.t * 2})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(g.ring.x, g.ring.y, g.ring.t * 760, 0, 7); ctx.stroke(); }
      ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
      for (const x of g.texts) { ctx.globalAlpha = Math.min(1, x.life * 2); ctx.fillStyle = x.col; ctx.fillText(x.s, x.x, x.y); }
      ctx.globalAlpha = 1; ctx.restore();

      /* অন্ধকার (টর্চের আলো) ও আঘাতের লাল আভা */
      const dk = ctx.createRadialGradient(W / 2, H / 2, 140, W / 2, H / 2, Math.max(W, H) * 0.72);
      dk.addColorStop(0, 'rgba(0,0,10,0)'); dk.addColorStop(1, 'rgba(0,0,10,.85)'); ctx.fillStyle = dk; ctx.fillRect(0, 0, W, H);
      if (g.hurt > 0) { ctx.fillStyle = `rgba(220,38,38,${g.hurt * 0.55})`; ctx.fillRect(0, 0, W, H); }
      if (i.joyId >= 0) {
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(i.joyO.x, i.joyO.y, 50, 0, 7); ctx.stroke();
        ctx.fillStyle = 'rgba(34,211,238,.7)'; ctx.beginPath(); ctx.arc(i.joyO.x + i.joy.x * 50, i.joyO.y + i.joy.y * 50, 22, 0, 7); ctx.fill();
      }
      void s;
    };

    /* ---------- কিবোর্ড ---------- */
    const kd = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase(), ph = phaseRef.current;
      i.keys.add(key);
      if (key === ' ') { e.preventDefault(); bombFn.current(); }
      if (key === 'h') kitFn.current();
      if (key === 'b' || (key === 'escape' && ph === 'shop')) { if (ph === 'shop') closeShopRef.current(); else if (ph !== 'over') openShopRef.current(); }
      if (key >= '1' && key <= '5') { const gn = GUNS[Number(key) - 1]; if (gn && S.current.owned.includes(gn.id)) { S.current.gun = gn.id; persist(); } }
    };
    const ku = (e: KeyboardEvent) => i.keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    let raf = 0, last = performance.now(), hudT = 0, saveT = 0, lastJson = '';
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (phaseRef.current === 'play') step(dt);
      draw(now / 1000);
      hudT += dt; saveT += dt;
      if (hudT > 0.1) {
        hudT = 0; const g = G.current, s = S.current;
        const h = { hp: Math.max(0, Math.round(g.hp)), max: 100 + s.up.hp * 20, lvl: s.lvl, xp: s.xp, need: need(s.lvl), pts: s.pts, kills: g.kills, gun: gunNow().name, bombs: s.bombs, kits: s.kits, msg: g.msgT > 0 ? g.msg : '' };
        const j = JSON.stringify(h); if (j !== lastJson) { lastJson = j; setHud(h); }
      }
      if (saveT > 2) { saveT = 0; persist(); }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); persist(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================ UI ============================ */
  const s = S.current;
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black text-white select-none">
      <div ref={wrap} className="absolute inset-0">
        <canvas ref={cv} className="h-full w-full touch-none" onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerCancel={pu} onContextMenu={(e) => e.preventDefault()} />
      </div>

      {phase === 'play' && (<>
        <div className={`absolute left-3 top-3 w-[min(270px,60vw)] rounded-2xl p-3 ${glass}`}>
          <div className="flex items-center justify-between text-xs font-black">
            <span className="rounded-lg bg-violet-500 px-2 py-0.5">LV {hud.lvl}</span><span className="text-slate-300">{hud.gun}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all" style={{ width: `${(hud.hp / hud.max) * 100}%` }} /></div>
          <div className="mt-0.5 text-[10px] text-slate-300">❤️ {hud.hp}/{hud.max}</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${(hud.xp / hud.need) * 100}%` }} /></div>
          <div className="mt-0.5 text-[10px] text-slate-400">XP {hud.xp}/{hud.need}</div>
        </div>
        <div className={`absolute right-3 top-3 flex items-center gap-2 rounded-2xl p-2 text-xs font-black ${glass}`}>
          <span className="text-yellow-300">🪙 {hud.pts.toLocaleString()}</span><span>💀 {hud.kills}</span>
          <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { muteRef.current = !mute; setMute(!mute); }}>{mute ? '🔇' : '🔊'}</button>
        </div>
        {hud.msg && <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-2xl bg-violet-600/90 px-5 py-2 text-center text-sm font-black shadow-xl">{hud.msg}</div>}
        <div className="absolute bottom-4 right-3 flex flex-col gap-2">
          <button className={`${btn} ${glass}`} onClick={() => bombFn.current()}>💣 বোমা ({hud.bombs}) <span className="text-[10px] text-slate-400">[Space]</span></button>
          <button className={`${btn} ${glass}`} onClick={() => kitFn.current()}>💊 মেডকিট ({hud.kits}) <span className="text-[10px] text-slate-400">[H]</span></button>
          <button className={`${btn} bg-amber-400 text-slate-950`} onClick={openShop}>🛒 দোকান <span className="text-[10px]">[B]</span></button>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-xl bg-black/50 px-3 py-1 text-[10px] text-slate-300 md:block">WASD চলুন • মাউস ক্লিক/হোল্ড = গুলি • Shift দৌড় • 1-5 অস্ত্র বদল</div>
      </>)}

      {phase === 'menu' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 text-center ${glass}`}>
            <div className="text-5xl">👻</div>
            <h1 className="mt-1 text-3xl font-black tracking-wide text-violet-300">GHOST HUNTER</h1>
            <p className="mt-1 text-xs text-slate-400">ভূতেরা তোমাকে খেতে আসছে — গুলি করে সবাইকে শেষ করো!</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">লেভেল</div><b className="text-lg text-violet-300">{s.lvl}</b></div>
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">পয়েন্ট</div><b className="text-lg text-yellow-300">{s.pts.toLocaleString()}</b></div>
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">সেরা কিল</div><b className="text-lg text-rose-300">{s.best}</b></div>
            </div>
            <button className={`${btn} mt-5 w-full bg-violet-500 text-lg hover:bg-violet-400`} onClick={startRun}>▶️ খেলা শুরু</button>
            <button className={`${btn} mt-2 w-full bg-amber-400 text-slate-950`} onClick={openShop}>🛒 দোকান (অস্ত্র ও আপগ্রেড)</button>
            <p className="mt-4 text-[11px] leading-5 text-slate-400">💻 W A S D = চলা • মাউস = লক্ষ্য ও গুলি • Space = বোমা • H = মেডকিট • B = দোকান<br />📱 বাম পাশে আঙুল টেনে চলুন • ডান পাশে ধরে লক্ষ্য করুন • কাছের ভূতে অটো-ফায়ার</p>
          </div>
        </div>
      )}

      {phase === 'over' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-6 text-center ${glass}`}>
            <div className="text-5xl">💀</div>
            <h2 className="mt-1 text-2xl font-black text-rose-400">ভূতেরা তোমাকে খেয়ে ফেলেছে!</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">মারা ভূত</div><b className="text-lg">{over.kills}</b></div>
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">আয়</div><b className="text-lg text-yellow-300">+{over.earned}</b></div>
              <div className="rounded-xl bg-white/5 p-2"><div className="text-slate-400">লেভেল</div><b className="text-lg text-violet-300">{s.lvl}</b></div>
            </div>
            <p className="mt-3 text-xs text-slate-400">তোমার লেভেল ও পয়েন্ট সেভ আছে। দোকান থেকে শক্তিশালী হয়ে ফিরে এসো!</p>
            <button className={`${btn} mt-4 w-full bg-violet-500 hover:bg-violet-400`} onClick={startRun}>🔄 আবার খেলুন</button>
            <button className={`${btn} mt-2 w-full bg-amber-400 text-slate-950`} onClick={openShop}>🛒 দোকান ({s.pts.toLocaleString()} পয়েন্ট)</button>
          </div>
        </div>
      )}

      {phase === 'shop' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/75 p-3 backdrop-blur-sm">
          <div className={`flex max-h-[92dvh] w-full max-w-lg flex-col rounded-3xl p-4 ${glass}`}>
            <div className="flex items-center justify-between">
              <b className="text-lg">🛒 দোকান</b>
              <div className="flex items-center gap-2"><span className="rounded-xl bg-white/10 px-3 py-1 text-sm font-black text-yellow-300">🪙 {s.pts.toLocaleString()}</span>
                <button className="rounded-lg bg-white/10 px-3 py-1 text-sm" onClick={closeShop}>✕</button></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black">
              {([['gun', '🔫 অস্ত্র'], ['up', '⬆️ আপগ্রেড'], ['item', '🎒 আইটেম']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-xl py-2 ${tab === k ? 'bg-violet-500' : 'bg-white/10'}`}>{l}</button>))}
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto pr-1">
              {tab === 'gun' && GUNS.map((g, idx) => {
                const own = s.owned.includes(g.id), cur = s.gun === g.id;
                return (
                  <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl text-xs font-black text-slate-950" style={{ background: g.color }}>{idx + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black">{g.name}</div>
                      <div className="text-[11px] text-slate-400">{g.desc}</div>
                      <div className="text-[10px] text-slate-500">ড্যামেজ {g.dmg}{g.pellets > 1 ? `×${g.pellets}` : ''} • গতি {g.rate}/সে.</div>
                    </div>
                    <button disabled={!own && s.pts < g.price} onClick={() => buyGun(g)}
                      className={`rounded-xl px-3 py-2 text-xs font-black disabled:opacity-40 ${cur ? 'bg-emerald-500' : own ? 'bg-cyan-500 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
                      {cur ? '✓ ব্যবহৃত' : own ? 'নিন' : `🪙 ${g.price}`}
                    </button>
                  </div>);
              })}
              {tab === 'up' && UPS.map((u) => {
                const lv = s.up[u.id], c = upCost(u.id, lv), max = lv >= MAXUP;
                return (
                  <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-black">{u.name} <span className="text-xs text-violet-300">লেভেল {lv}/{MAXUP}</span></div>
                      <div className="text-[11px] text-slate-400">{u.desc}</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-violet-400" style={{ width: `${(lv / MAXUP) * 100}%` }} /></div>
                    </div>
                    <button disabled={max || s.pts < c} onClick={() => buyUp(u.id)} className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{max ? 'MAX' : `🪙 ${c}`}</button>
                  </div>);
              })}
              {tab === 'item' && ([['bombs', '💣 বোমা', 'কাছের সব ভূতে বিশাল ক্ষতি (Space)', 400], ['kits', '💊 মেডকিট', '+৬০ জীবন (H)', 250]] as const).map(([k, n, d, p]) => (
                <div key={k} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <div className="min-w-0 flex-1"><div className="font-black">{n} <span className="text-xs text-slate-400">আছে: {s[k]}/9</span></div><div className="text-[11px] text-slate-400">{d}</div></div>
                  <button disabled={s.pts < p || s[k] >= 9} onClick={() => buyItem(k, p)} className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-40">🪙 {p}</button>
                </div>))}
            </div>
            <button className={`${btn} mt-3 bg-violet-500 hover:bg-violet-400`} onClick={closeShop}>{prevRef.current === 'play' ? '▶️ খেলায় ফিরুন' : '← ফিরে যান'}</button>
          </div>
        </div>
      )}
    </main>
  );
}

/* দোকান খোলা/বন্ধ করার ফাংশন কিবোর্ড হ্যান্ডলার থেকে ডাকার জন্য রেফ */
const openShopRef: { current: () => void } = { current: () => {} };
const closeShopRef: { current: () => void } = { current: () => {} };


