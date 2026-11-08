'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent as ReactTouchEvent } from 'react';
import Link from 'next/link';

/* ---------- টাইপ ---------- */
type Level = 'easy' | 'medium' | 'hard';
type Diff = { label: string; icon: string; sp: string; tick: number; min: number; food: number; bld: number; eat: number; miss: number; col: string };
type BoardEntry = { name: string; points: number; best: number; games: number };
type Store = { day: string; plays: number; name: string; level: Level; board: Record<string, BoardEntry> };
type Vec = { x: number; z: number };
type Part = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; col: string };
type Building = { x: number; z: number; h: number; hue: number };
type Game = {
  name: string; lv: Diff; lvKey: Level; mode: 'demo' | 'play';
  occ: Set<number>; rows: Building[][]; snake: Vec[]; dir: Vec; queue: Vec[];
  food: Vec | null; foodT: number; score: number; tick: number; acc: number; t: number;
  cam: Vec; parts: Part[]; msg: string; msgT: number; msgBad: boolean;
  dead: boolean; over: boolean; deadAt: number;
};
type Api = {
  award: (g: Game, d: number) => void;
  sfx: (k: string) => void;
  hud: (g: Game) => void;
  over: (g: Game) => void;
};
type Result = { score: number; len: number; name: string; lv: Level };
type WinAC = Window & { webkitAudioContext?: typeof AudioContext };

const KEY = 'snake3d_v1';
const DAILY = 20;
const N = 18;
const DIFF: Record<Level, Diff> = {
  easy: { label: 'সহজ', icon: '🌱', sp: 'ধীর', tick: 190, min: 120, food: 12, bld: 14, eat: 8, miss: -3, col: '#7dffb0' },
  medium: { label: 'মাঝারি', icon: '⚡', sp: 'মাঝারি', tick: 150, min: 80, food: 9, bld: 26, eat: 10, miss: -5, col: '#ffd24a' },
  hard: { label: 'কঠিন', icon: '🔥', sp: 'দ্রুত', tick: 115, min: 55, food: 6, bld: 40, eat: 15, miss: -10, col: '#ff4466' },
};
const emptyStore: Store = { day: '', plays: 0, name: '', level: 'medium', board: {} };
const dayKey = (): string => {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
};

/* ---------- সাউন্ড ---------- */
const tone = (a: AudioContext, type: OscillatorType, f0: number, f1: number, dur: number, vol: number) => {
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
};
const noise = (a: AudioContext, dur: number, vol: number) => {
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource();
  const g = a.createGain();
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  s.buffer = buf;
  s.connect(g);
  g.connect(a.destination);
  s.start();
};

/* ---------- গেম লজিক ---------- */
function spawnFood(g: Game) {
  for (let i = 0; i < 300; i++) {
    const x = Math.floor(Math.random() * N);
    const z = Math.floor(Math.random() * N);
    if (g.occ.has(x * 100 + z) || g.snake.some((s) => s.x === x && s.z === z)) continue;
    g.food = { x, z };
    g.foodT = g.lv.food;
    return;
  }
  g.food = { x: 0, z: 0 };
  g.foodT = g.lv.food;
}

function burst(g: Game, x: number, z: number, n: number, col: string) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * 3;
    g.parts.push({ x, y: 0.5, z, vx: Math.cos(a) * sp, vy: 2 + Math.random() * 3, vz: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.6, col });
  }
}

function newGame(name: string, demo: boolean, lvKey?: string): Game {
  const lvk: Level = lvKey && lvKey in DIFF ? (lvKey as Level) : 'medium';
  const lv = DIFF[lvk];
  const occ = new Set<number>();
  const city: Building[] = [];
  for (let i = 0; i < lv.bld; i++) {
    let x = 0;
    let z = 0;
    let ok = false;
    for (let t = 0; t < 60 && !ok; t++) {
      x = Math.floor(Math.random() * N);
      z = Math.floor(Math.random() * N);
      ok = !occ.has(x * 100 + z) && !(z >= 8 && z <= 10 && x <= 14);
    }
    if (!ok) continue;
    occ.add(x * 100 + z);
    city.push({ x, z, h: 0.8 + Math.random() * 1.6, hue: 205 + Math.random() * 90 });
  }
  for (let x = -4; x <= N + 3; x++) {
    for (let z = -5; z <= N + 3; z++) {
      if (x >= 0 && x < N && z >= 0 && z < N) continue;
      if (Math.random() < 0.4) continue;
      const h = z >= N ? 0.25 + Math.random() * 0.25 : 2 + Math.random() * 6.5;
      city.push({ x, z, h, hue: 205 + Math.random() * 90 });
    }
  }
  const rows: Building[][] = Array.from({ length: N + 11 }, (): Building[] => []);
  city.forEach((b) => rows[b.z + 6].push(b));
  const g: Game = {
    name, lv, lvKey: lvk, mode: demo ? 'demo' : 'play', occ, rows,
    snake: [{ x: 9, z: 9 }, { x: 8, z: 9 }, { x: 7, z: 9 }],
    dir: { x: 1, z: 0 }, queue: [], food: null, foodT: lv.food,
    score: 0, tick: lv.tick, acc: 0, t: 0, cam: { x: 9, z: 9 }, parts: [],
    msg: '', msgT: 0, msgBad: false, dead: false, over: false, deadAt: 0,
  };
  spawnFood(g);
  return g;
}

function step(g: Game, api: Api) {
  if (g.queue.length) {
    const nd = g.queue.shift();
    if (nd) g.dir = nd;
  }
  const h = g.snake[0];
  const nx = h.x + g.dir.x;
  const nz = h.z + g.dir.z;
  const hitSelf = g.snake.some((s, i) => i < g.snake.length - 1 && s.x === nx && s.z === nz);
  if (nx < 0 || nz < 0 || nx >= N || nz >= N || g.occ.has(nx * 100 + nz) || hitSelf) {
    g.dead = true;
    g.deadAt = g.t;
    burst(g, h.x + 0.5, h.z + 0.5, 40, '#ff4466');
    api.sfx('crash');
    api.hud(g);
    return;
  }
  g.snake.unshift({ x: nx, z: nz });
  const f = g.food;
  if (f && nx === f.x && nz === f.z) {
    const pts = g.lv.eat + Math.ceil(g.foodT);
    g.score += pts;
    api.award(g, pts);
    g.msg = '+' + pts;
    g.msgT = 1.2;
    g.msgBad = false;
    burst(g, nx + 0.5, nz + 0.5, 22, '#7ef0ff');
    api.sfx('eat');
    g.tick = Math.max(g.lv.min, g.lv.tick - g.snake.length * 2);
    spawnFood(g);
    api.hud(g);
  } else {
    g.snake.pop();
  }
}

function update(g: Game, dt: number, api: Api) {
  g.t += dt;
  const demo = g.mode === 'demo';
  const hx = demo ? 9 + Math.sin(g.t * 0.3) * 5 : g.snake[0].x + 0.5;
  const hz = demo ? 9 + Math.cos(g.t * 0.24) * 4 : g.snake[0].z + 0.5;
  const k = Math.min(1, dt * 4);
  g.cam.x += (hx - g.cam.x) * k;
  g.cam.z += (hz - g.cam.z) * k;
  g.parts.forEach((p) => {
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 6 * dt; p.life -= dt;
  });
  g.parts = g.parts.filter((p) => p.life > 0 && p.y > -0.2);
  if (g.msgT > 0) g.msgT -= dt;
  if (demo) return;
  if (g.dead) {
    if (!g.over && g.t - g.deadAt > 1) { g.over = true; api.over(g); }
    return;
  }
  g.foodT -= dt;
  if (g.foodT <= 0) {
    g.score += g.lv.miss;
    api.award(g, g.lv.miss);
    g.msg = '⏱ সময় শেষ  ' + g.lv.miss;
    g.msgT = 1.5;
    g.msgBad = true;
    api.sfx('miss');
    spawnFood(g);
    api.hud(g);
  }
  g.acc += dt * 1000;
  while (g.acc >= g.tick && !g.dead) {
    g.acc -= g.tick;
    step(g, api);
  }
}

/* ---------- 3D রেন্ডার (ক্যানভাস প্রজেকশন) ---------- */
function draw(c: CanvasRenderingContext2D, g: Game, W: number, H: number, t: number) {
  const cam = g.cam;
  const P = 1.12;
  const cp = Math.cos(P);
  const sp = Math.sin(P);
  const D = 14;
  const F = Math.min(W, H) * 1.15;
  const pr = (x: number, y: number, z: number): number[] => {
    const dx = x - cam.x;
    const dz = z - cam.z;
    const z2 = D - y * sp - dz * cp;
    return [W / 2 + (dx * F) / z2, H * 0.56 - ((y * cp - dz * sp) * F) / z2, z2];
  };
  const quad = (pts: number[][], fill: string) => {
    const q = pts.map((p) => pr(p[0], p[1], p[2]));
    if (q.some((v) => v[2] < 1.2)) return;
    c.beginPath();
    q.forEach((v, i) => { if (i) c.lineTo(v[0], v[1]); else c.moveTo(v[0], v[1]); });
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };

  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0420');
  bg.addColorStop(1, '#1a0838');
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);
  quad([[cam.x - 30, 0, cam.z - 40], [cam.x + 30, 0, cam.z - 40], [cam.x + 30, 0, cam.z + 10], [cam.x - 30, 0, cam.z + 10]], '#0d0522');
  quad([[0, 0, 0], [N, 0, 0], [N, 0, N], [0, 0, N]], '#170b38');

  c.lineWidth = 1;
  c.strokeStyle = 'rgba(90,200,255,0.13)';
  for (let i = 0; i <= N; i++) {
    const a = pr(i, 0, 0), b = pr(i, 0, N), d = pr(0, 0, i), e = pr(N, 0, i);
    if (a[2] > 1.2 && b[2] > 1.2) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
    if (d[2] > 1.2 && e[2] > 1.2) { c.beginPath(); c.moveTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.stroke(); }
  }
  const bd = [pr(0, 0, 0), pr(N, 0, 0), pr(N, 0, N), pr(0, 0, N)];
  if (bd.every((v) => v[2] > 1.2)) {
    c.save();
    const bc = g.mode === 'play' ? g.lv.col : '#ff3cc8';
    c.strokeStyle = bc;
    c.lineWidth = 3;
    c.shadowColor = bc;
    c.shadowBlur = 14;
    c.beginPath();
    bd.forEach((v, i) => { if (i) c.lineTo(v[0], v[1]); else c.moveTo(v[0], v[1]); });
    c.closePath();
    c.stroke();
    c.restore();
  }

  const glow = (gx: number, gz: number, rad: number, col: string) => {
    const q = pr(gx, 0, gz);
    if (q[2] < 1.2) return;
    const rr = (F / q[2]) * rad;
    c.save();
    c.translate(q[0], q[1]);
    c.scale(1, 0.9);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, rr);
    gr.addColorStop(0, col);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr;
    c.beginPath();
    c.arc(0, 0, rr, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };
  glow(g.snake[0].x + 0.5, g.snake[0].z + 0.5, 3.2, g.dead ? 'rgba(255,50,80,0.35)' : 'rgba(125,255,176,0.28)');
  if (g.food) glow(g.food.x + 0.5, g.food.z + 0.5, 2.2 + 0.5 * Math.sin(t * 4), 'rgba(0,240,255,0.3)');

  const box = (x: number, z: number, w: number, h: number, hue: number, sat: number, lit: number, seed: number, win: boolean) => {
    const x1 = x + w;
    const z1 = z + w;
    const p = [[x, 0, z], [x1, 0, z], [x1, 0, z1], [x, 0, z1], [x, h, z], [x1, h, z], [x1, h, z1], [x, h, z1]].map((v) => pr(v[0], v[1], v[2]));
    if (p.some((v) => v[2] < 1.2)) return;
    const poly = (ids: number[], col: string) => {
      c.beginPath();
      ids.forEach((id, i) => { if (i) c.lineTo(p[id][0], p[id][1]); else c.moveTo(p[id][0], p[id][1]); });
      c.closePath();
      c.fillStyle = col;
      c.fill();
    };
    poly(x + w / 2 < cam.x ? [1, 2, 6, 5] : [3, 0, 4, 7], 'hsl(' + hue + ',' + sat + '%,' + lit * 0.55 + '%)');
    poly([2, 3, 7, 6], 'hsl(' + hue + ',' + sat + '%,' + lit * 0.8 + '%)');
    poly([4, 5, 6, 7], 'hsl(' + hue + ',' + sat + '%,' + Math.min(88, lit * 1.25) + '%)');
    if (win && h > 4.5) {
      const bp = pr(x + w / 2, h + 0.08, z + w / 2);
      c.fillStyle = 'rgba(255,60,90,' + (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + seed))) + ')';
      c.beginPath();
      c.arc(bp[0], bp[1], 2.2, 0, Math.PI * 2);
      c.fill();
    }
    if (win && h > 0.9) {
      const rws = Math.floor(h / 0.4);
      for (let r = 0; r < rws; r++) {
        for (let cc = 0; cc < 3; cc++) {
          const hs = (Math.imul((seed + r * 31 + cc * 17) | 0, 2654435761) >>> 0) % 5;
          if (hs < 2) continue;
          const wx = x + 0.12 + cc * 0.28;
          const wy = 0.15 + r * 0.4;
          const a = pr(wx, wy, z1);
          const b = pr(wx + 0.16, wy + 0.22, z1);
          c.fillStyle = hs === 4 ? 'rgba(255,210,122,0.9)' : 'rgba(126,240,255,0.8)';
          c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        }
      }
    }
    c.strokeStyle = 'hsla(' + hue + ',100%,70%,0.5)';
    c.lineWidth = 1;
    c.beginPath();
    [4, 5, 6, 7].forEach((id, i) => { if (i) c.lineTo(p[id][0], p[id][1]); else c.moveTo(p[id][0], p[id][1]); });
    c.closePath();
    c.stroke();
  };

  const segRows: Record<number, [Vec, number][]> = {};
  g.snake.forEach((s, i) => { (segRows[s.z] = segRows[s.z] || []).push([s, i]); });
  for (let z = -6; z <= N + 4; z++) {
    if (z - cam.z > 11 || z - cam.z < -22) continue;
    const bl = g.rows[z + 6];
    if (bl) bl.forEach((b) => box(b.x + 0.05, b.z + 0.05, 0.9, b.h, b.hue, 45, 30, b.x * 31 + b.z * 17 + 1000, true));
    const sr = segRows[z];
    if (sr) {
      sr.forEach((pair) => {
        const s = pair[0];
        const i = pair[1];
        const hue = g.dead ? 350 : 135 + Math.min(i, 40) * 2;
        const lit = 55 - Math.min(i, 30) * 0.4;
        if (i === 0) { c.shadowColor = g.dead ? '#ff2244' : '#7dffb0'; c.shadowBlur = 20; }
        box(s.x + (i ? 0.1 : 0.06), s.z + (i ? 0.1 : 0.06), i ? 0.8 : 0.88, i ? 0.62 : 0.8, hue, 90, lit, 0, false);
        c.shadowBlur = 0;
      });
    }
  }

  // ফাইনাল লেয়ার: খাবার, মাথার রিং, কণা
  if (g.food) {
    const f = g.food;
    const bob = 0.55 + 0.15 * Math.sin(t * 4);
    const o = pr(f.x + 0.5, bob, f.z + 0.5);
    const base = pr(f.x + 0.5, 0, f.z + 0.5);
    const top = pr(f.x + 0.5, 3, f.z + 0.5);
    if (o[2] > 1.2 && top[2] > 1.2) {
      const r = (F / o[2]) * 0.28;
      const beam = c.createLinearGradient(0, base[1], 0, top[1]);
      beam.addColorStop(0, 'rgba(0,255,255,0.35)');
      beam.addColorStop(1, 'rgba(0,255,255,0)');
      c.strokeStyle = beam;
      c.lineWidth = r * 1.2;
      c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(top[0], top[1]); c.stroke();
      c.save();
      c.shadowColor = '#00f0ff';
      c.shadowBlur = 25;
      const rg = c.createRadialGradient(o[0], o[1], 1, o[0], o[1], r);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(0.5, '#7ef0ff');
      rg.addColorStop(1, '#ff3cc8');
      c.fillStyle = rg;
      c.beginPath(); c.arc(o[0], o[1], r, 0, Math.PI * 2); c.fill();
      const frac = Math.max(0, g.foodT / g.lv.food);
      c.strokeStyle = frac > 0.5 ? '#7dffb0' : frac > 0.25 ? '#ffd24a' : '#ff4466';
      c.lineWidth = 3;
      c.beginPath(); c.arc(o[0], o[1], r * 1.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke();
      c.restore();
    }
  }
  const hd = g.snake[0];
  const hc = pr(hd.x + 0.5, 0.9, hd.z + 0.5);
  if (hc[2] > 1.2 && !g.dead) {
    const rr = (F / hc[2]) * (0.55 + 0.06 * Math.sin(t * 6));
    c.strokeStyle = 'rgba(125,255,176,0.8)';
    c.lineWidth = 2;
    c.beginPath(); c.arc(hc[0], hc[1], rr, 0, Math.PI * 2); c.stroke();
    [-1, 1].forEach((sg) => {
      const e = pr(hd.x + 0.5 + g.dir.x * 0.22 - g.dir.z * 0.2 * sg, 0.84, hd.z + 0.5 + g.dir.z * 0.22 + g.dir.x * 0.2 * sg);
      const er = (F / e[2]) * 0.07;
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(e[0], e[1], er, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#000';
      c.beginPath(); c.arc(e[0], e[1], er * 0.5, 0, Math.PI * 2); c.fill();
    });
  }
  g.parts.forEach((p) => {
    const q = pr(p.x, p.y, p.z);
    if (q[2] < 1.2) return;
    c.globalAlpha = Math.min(1, p.life * 2);
    c.fillStyle = p.col;
    c.beginPath(); c.arc(q[0], q[1], Math.max(1, (F / q[2]) * 0.07), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  });

  c.strokeStyle = 'rgba(170,200,255,0.22)';
  c.lineWidth = 1;
  c.beginPath();
  for (let i = 0; i < 80; i++) {
    const rx = (i * 97.3 + t * 55) % (W + 40);
    const ry = (i * 53.7 + t * 520) % (H + 40);
    c.moveTo(rx, ry);
    c.lineTo(rx - 5, ry + 16);
  }
  c.stroke();
  const fog = c.createLinearGradient(0, 0, 0, H * 0.4);
  fog.addColorStop(0, 'rgba(11,4,32,0.95)');
  fog.addColorStop(1, 'rgba(11,4,32,0)');
  c.fillStyle = fog;
  c.fillRect(0, 0, W, H * 0.4);
  const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.65)');
  c.fillStyle = vg;
  c.fillRect(0, 0, W, H);

  if (g.msgT > 0 && g.mode === 'play') {
    c.save();
    c.globalAlpha = Math.min(1, g.msgT);
    c.font = '800 ' + Math.max(26, Math.min(W, H) * 0.07) + 'px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillStyle = g.msgBad ? '#ff5577' : '#7dffb0';
    c.shadowColor = g.msgBad ? '#ff2244' : '#00ff99';
    c.shadowBlur = 18;
    c.fillText(g.msg, W / 2, H * 0.3 - (1.5 - g.msgT) * 24);
    c.restore();
  }
}

/* ---------- কম্পোনেন্ট ---------- */
export default function SnakeCity() {
  const [phase, setPhase] = useState<'menu' | 'play' | 'over'>('menu');
  const [name, setName] = useState<string>('');
  const [curName, setCurName] = useState<string>('');
  const [store, setStore] = useState<Store>(emptyStore);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [hud, setHud] = useState<{ score: number; len: number }>({ score: 0, len: 3 });
  const [result, setResult] = useState<Result | null>(null);
  const [curLv, setCurLv] = useState<Level>('medium');
  const [muted, setMuted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const G = useRef<Game | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef<boolean>(false);
  const apiRef = useRef<Api | null>(null);
  const touch = useRef<number[] | null>(null);

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
              board[k] = { name: e.name.slice(0, 14), points: Number(e.points) || 0, best: Number(e.best) || 0, games: Number(e.games) || 0 };
            }
          });
          const lvl: Level = p.level in DIFF ? (p.level as Level) : 'medium';
          setStore({ day: typeof p.day === 'string' ? p.day : '', plays: Number(p.plays) || 0, name: typeof p.name === 'string' ? p.name : '', level: lvl, board });
          if (typeof p.name === 'string') setName(p.name);
        }
      }
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }, [store, loaded]);

  const level: Level = store.level in DIFF ? store.level : 'medium';
  const lv = DIFF[level];
  const left = Math.max(0, DAILY - (store.day === dayKey() ? store.plays : 0));
  const saved = Object.values(store.board).sort((a, b) => b.points - a.points);
  const pts = (n: string): number => (store.board['n_' + n] ? store.board['n_' + n].points : 0);
  const bump = (fn: (s: Store) => Store) => setStore((s) => {
    const t = dayKey();
    return fn(s.day === t ? s : { ...s, day: t, plays: 0 });
  });
  const award = (g: Game, d: number) => {
    const sc = g.score;
    const nm = g.name;
    bump((s) => {
      const k = 'n_' + nm;
      const old: BoardEntry = s.board[k] || { name: nm, points: 0, best: 0, games: 0 };
      return { ...s, board: { ...s.board, [k]: { ...old, points: Math.max(0, old.points + d), best: Math.max(old.best, sc) } } };
    });
  };
  const sfx = (k: string) => {
    const a = ctxRef.current;
    if (!a || mutedRef.current) return;
    try {
      if (a.state === 'suspended') a.resume();
      if (k === 'eat') { tone(a, 'sine', 520, 980, 0.15, 0.25); }
      else if (k === 'miss') { tone(a, 'sawtooth', 220, 80, 0.4, 0.2); }
      else if (k === 'crash') { noise(a, 0.6, 0.5); tone(a, 'square', 140, 40, 0.6, 0.3); }
      else if (k === 'start') { tone(a, 'sine', 300, 700, 0.3, 0.25); }
    } catch (e) {}
  };
  apiRef.current = {
    award, sfx,
    hud: (g) => setHud({ score: g.score, len: g.snake.length }),
    over: (g) => { setResult({ score: g.score, len: g.snake.length, name: g.name, lv: g.lvKey }); setPhase('over'); },
  };

  const turn = (dx: number, dz: number) => {
    const g = G.current;
    if (!g || g.mode !== 'play' || g.dead) return;
    const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
    if ((last.x === -dx && last.z === -dz) || (last.x === dx && last.z === dz)) return;
    if (g.queue.length < 2) g.queue.push({ x: dx, z: dz });
  };

  const startGame = () => {
    if (left <= 0) return;
    const nm = (name.trim() || 'Player').slice(0, 14);
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as WinAC).webkitAudioContext;
        if (AC) ctxRef.current = new AC();
      }
      if (ctxRef.current && ctxRef.current.state === 'suspended') ctxRef.current.resume();
    } catch (e) {}
    bump((s) => {
      const k = 'n_' + nm;
      const old: BoardEntry = s.board[k] || { name: nm, points: 0, best: 0, games: 0 };
      return { ...s, name: nm, plays: s.plays + 1, board: { ...s.board, [k]: { ...old, games: old.games + 1 } } };
    });
    G.current = newGame(nm, false, level);
    setCurName(nm);
    setCurLv(level);
    setHud({ score: 0, len: 3 });
    setResult(null);
    setPhase('play');
    sfx('start');
  };
  const toMenu = () => {
    G.current = newGame('demo', true);
    setPhase('menu');
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return undefined;
    const cx = c.getContext('2d');
    if (!cx) return undefined;
    G.current = newGame('demo', true);
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth;
      const H = c.clientHeight;
      if (c.width !== Math.floor(W * dpr) || c.height !== Math.floor(H * dpr)) {
        c.width = Math.floor(W * dpr);
        c.height = Math.floor(H * dpr);
      }
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = G.current;
      const api = apiRef.current;
      if (g && api && W > 0 && H > 0) {
        update(g, dt, api);
        draw(cx, g, W, H, now / 1000);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const map: Record<string, [number, number]> = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
    };
    const f = (e: KeyboardEvent) => {
      const m = map[e.key];
      if (m) { e.preventDefault(); turn(m[0], m[1]); }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const onTS = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    touch.current = [t.clientX, t.clientY];
  };
  const onTE = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current[0];
    const dy = t.clientY - touch.current[1];
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
    else turn(0, dy > 0 ? 1 : -1);
  };

  return (
    <main className="sx">
      <style>{css}</style>
      <canvas ref={canvasRef} className="cv" onTouchStart={onTS} onTouchEnd={onTE} />

      {phase === 'play' && (
        <>
          <div className="top">
            <div className="glass pill"><small>PLAYER</small><b>{curName}</b></div>
            <div className="glass pill"><small>লেভেল</small><b style={{ background: 'none', color: DIFF[curLv].col, WebkitTextFillColor: DIFF[curLv].col }}>{DIFF[curLv].icon} {DIFF[curLv].label}</b></div>
            <div className="glass pill"><small>স্কোর</small><b className={hud.score < 0 ? 'neg' : ''}>{hud.score}</b></div>
            <div className="glass pill"><small>দৈর্ঘ্য</small><b>{hud.len}</b></div>
            <div className="glass pill"><small>মোট ⭐</small><b>{pts(curName)}</b></div>
            <button className="glass ic" onClick={() => { mutedRef.current = !mutedRef.current; setMuted(mutedRef.current); }}>{muted ? '🔇' : '🔊'}</button>
          </div>
          <div className="dpad">
            <button className="u" onPointerDown={() => turn(0, -1)}>▲</button>
            <button className="l" onPointerDown={() => turn(-1, 0)}>◀</button>
            <button className="r" onPointerDown={() => turn(1, 0)}>▶</button>
            <button className="d" onPointerDown={() => turn(0, 1)}>▼</button>
          </div>
        </>
      )}

      {phase === 'menu' && (
        <div className="center">
          <div className="glass card">
            <h1>NEON CITY <span>SNAKE 3D</span></h1>
            <p className="sub">রাতের শহরে সাপ চালান • সময়মতো খাবার ধরুন</p>
            <input value={name} maxLength={14} placeholder="আপনার নাম" onChange={(e) => setName(e.target.value)} />
            {loaded && saved.length > 0 && (
              <div className="chips">
                {saved.slice(0, 6).map((p) => (
                  <button key={p.name} className="chip" onClick={() => setName(p.name)}>{p.name} ⭐{p.points}</button>
                ))}
              </div>
            )}
            <div className="lvs">
              {(Object.keys(DIFF) as Level[]).map((k) => (
                <button key={k} className={'lvb' + (k === level ? ' on' : '')} style={{ '--c': DIFF[k].col } as CSSProperties}
                  onClick={() => setStore((s) => ({ ...s, level: k }))}>
                  <span className="ic2">{DIFF[k].icon}</span>
                  <b>{DIFF[k].label}</b>
                  <small>+{DIFF[k].eat} • {DIFF[k].food}s • {DIFF[k].miss}</small>
                </button>
              ))}
            </div>
            {loaded && (
              <div className="plays">
                <div className="bar"><i style={{ width: (left / DAILY) * 100 + '%' }} /></div>
                <small>আজ বাকি: <b>{left}/{DAILY}</b> বার</small>
              </div>
            )}
            <ul className="rules">
              <li>🟢 খাবার {lv.food} সেকেন্ডে ধরুন: <b>+{lv.eat} ও সময়ের বোনাস</b></li>
              <li>🔴 সময় ফুরালে: <b>{lv.miss} পয়েন্ট</b></li>
              <li>🏙 বিল্ডিং {lv.bld}টি • সাপের গতি {lv.sp}</li>
              <li>💥 দেয়াল, বিল্ডিং বা নিজের গায়ে ধাক্কা = গেম শেষ</li>
              <li>🎮 কিবোর্ড তীর / WASD / স্ক্রিনে সোয়াইপ</li>
            </ul>
            <button className="go" onClick={startGame} disabled={!loaded || left <= 0} style={{ background: 'linear-gradient(90deg,#00f0ff,' + lv.col + ')' }}>
              {loaded && left <= 0 ? 'আজকের ২০ বার শেষ 🌙' : '▶ ' + lv.label + ' লেভেলে শুরু'}
            </button>
            {loaded && saved.length > 0 && (
              <div className="lb">
                <b>🏆 লিডারবোর্ড</b>
                {saved.slice(0, 5).map((p, i) => (
                  <div key={p.name}><span>{i + 1}. {p.name}</span><span>⭐ {p.points} · সেরা {p.best}</span></div>
                ))}
              </div>
            )}
            <Link className="back" href="/">← Charlie Charlie গেমে যান</Link>
          </div>
        </div>
      )}

      {phase === 'over' && result && (
        <div className="center">
          <div className="glass card over">
            <h1>গেম <span>ওভার</span></h1>
            <div className="big">{result.score}</div>
            <p className="sub">{result.name} • {(DIFF[result.lv] || DIFF.medium).icon} {(DIFF[result.lv] || DIFF.medium).label} • দৈর্ঘ্য {result.len}</p>
            <p>মোট পয়েন্ট: <b>⭐ {pts(result.name)}</b></p>
            <p><small>আজ বাকি: {left}/{DAILY} বার</small></p>
            <button className="go" onClick={startGame} disabled={left <= 0}>{left <= 0 ? 'আজকের খেলা শেষ 🌙' : '↻ আবার খেলুন'}</button>
            <button className="alt" onClick={toMenu}>মেনু</button>
          </div>
        </div>
      )}
    </main>
  );
}

const css = `
*{box-sizing:border-box}
html,body{margin:0;background:#05010f}
.sx{position:fixed;inset:0;overflow:hidden;color:#eef;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;user-select:none;-webkit-user-select:none}
.cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
.glass{background:rgba(22,10,48,.58);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(160,120,255,.35);border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.5),inset 0 0 30px rgba(120,80,255,.12)}
.top{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.pill{padding:6px 12px;display:flex;flex-direction:column;min-width:64px}
.pill small{font-size:.62rem;letter-spacing:.12em;opacity:.65}
.pill b{font-size:1.1rem;background:linear-gradient(90deg,#00f0ff,#c58bff);-webkit-background-clip:text;background-clip:text;color:transparent}
.pill b.neg{background:none;color:#ff5577}
.ic{margin-left:auto;font-size:1.2rem;padding:0 14px;color:#fff;cursor:pointer}
.center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto}
.card{width:min(94vw,440px);padding:24px 22px;display:flex;flex-direction:column;gap:12px;text-align:center;animation:rise .6s ease}
@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
.card h1{margin:0;font-size:clamp(1.6rem,7vw,2.2rem);letter-spacing:.04em;color:#fff;line-height:1.1}
.card h1 span{display:block;background:linear-gradient(90deg,#00f0ff,#8a5cff,#ff3cc8);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(138,92,255,.7))}
.sub{margin:0;opacity:.75;font-size:.9rem}
.card input{padding:12px 14px;border-radius:12px;border:1px solid rgba(160,120,255,.45);background:rgba(8,3,22,.7);color:#fff;font-size:1rem;text-align:center}
.chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.chip{background:rgba(120,80,255,.18);color:#eef;border:1px solid rgba(160,120,255,.4);border-radius:20px;padding:4px 12px;cursor:pointer;font-size:.8rem}
.plays{display:flex;flex-direction:column;gap:5px;align-items:center}
.bar{width:100%;height:7px;border-radius:7px;background:rgba(255,255,255,.1);overflow:hidden}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#00f0ff,#ff3cc8);box-shadow:0 0 12px #00f0ff}
.rules{list-style:none;margin:0;padding:12px;text-align:left;font-size:.82rem;line-height:1.7;background:rgba(0,0,0,.25);border-radius:12px}
.go{border:0;border-radius:40px;padding:14px;font-size:1.1rem;font-weight:700;color:#05010f;cursor:pointer;background:linear-gradient(90deg,#00f0ff,#7dffb0);box-shadow:0 0 28px rgba(0,240,255,.55);animation:pl 1.8s infinite}
.go:disabled{opacity:.45;animation:none;cursor:not-allowed}
@keyframes pl{50%{box-shadow:0 0 44px rgba(0,255,200,.9)}}
.alt{border:1px solid rgba(160,120,255,.5);background:transparent;color:#eef;border-radius:40px;padding:11px;cursor:pointer}
.lb{display:flex;flex-direction:column;gap:4px;font-size:.82rem;text-align:left}
.lb>div{display:flex;justify-content:space-between;padding:4px 10px;background:rgba(255,255,255,.05);border-radius:8px}
.back{color:#c58bff;font-size:.82rem;text-decoration:none;margin-top:2px}
.over .big{font-size:4.5rem;font-weight:800;line-height:1;background:linear-gradient(180deg,#fff,#c58bff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 20px rgba(255,60,200,.6))}
.dpad{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:176px;height:176px;display:none;grid-template:repeat(3,1fr)/repeat(3,1fr);gap:6px}
.dpad button{border-radius:16px;border:1px solid rgba(160,120,255,.45);background:rgba(22,10,48,.6);color:#fff;font-size:1.3rem;backdrop-filter:blur(10px);touch-action:manipulation}
.dpad .u{grid-area:1/2}.dpad .l{grid-area:2/1}.dpad .r{grid-area:2/3}.dpad .d{grid-area:3/2}
.center{align-items:flex-start}
.card{margin:auto;box-shadow:0 0 0 1px rgba(160,120,255,.2),0 20px 60px rgba(0,0,0,.6),0 0 60px -10px rgba(138,92,255,.5)}
.card h1 span{background:linear-gradient(90deg,#00f0ff,#8a5cff,#ff3cc8,#00f0ff);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 4s linear infinite}
@keyframes shine{to{background-position:200% center}}
.lvs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.lvb{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(8,3,22,.55);color:#cdd;cursor:pointer;transition:.25s}
.lvb .ic2{font-size:1.4rem}
.lvb b{font-size:.95rem}
.lvb small{font-size:.62rem;opacity:.7}
.lvb:hover{transform:translateY(-2px)}
.lvb.on{color:#fff;border-color:var(--c);background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(8,3,22,.6));box-shadow:0 0 22px -2px var(--c),inset 0 0 18px -6px var(--c);transform:translateY(-2px)}
.lvb.on b{color:var(--c);text-shadow:0 0 12px var(--c)}
@media (hover:none),(pointer:coarse){.dpad{display:grid}}
`;



// 'use client';
// import { useEffect, useRef, useState } from 'react';

// const KEY = 'snake3d_v1';
// const DAILY = 20;
// const N = 18;
// const FOOD_T = 9;
// const TICK0 = 150;
// const emptyStore = { day: '', plays: 0, name: '', board: {} };
// const dayKey = () => {
//   const d = new Date();
//   return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
// };

// /* ---------- সাউন্ড ---------- */
// const tone = (a, type, f0, f1, dur, vol) => {
//   const o = a.createOscillator();
//   const g = a.createGain();
//   const t = a.currentTime;
//   o.type = type;
//   o.frequency.setValueAtTime(f0, t);
//   o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
//   g.gain.setValueAtTime(vol, t);
//   g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
//   o.connect(g);
//   g.connect(a.destination);
//   o.start(t);
//   o.stop(t + dur + 0.05);
// };
// const noise = (a, dur, vol) => {
//   const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
//   const d = buf.getChannelData(0);
//   for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
//   const s = a.createBufferSource();
//   const g = a.createGain();
//   g.gain.setValueAtTime(vol, a.currentTime);
//   g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
//   s.buffer = buf;
//   s.connect(g);
//   g.connect(a.destination);
//   s.start();
// };

// /* ---------- গেম লজিক ---------- */
// function spawnFood(g) {
//   for (let i = 0; i < 300; i++) {
//     const x = Math.floor(Math.random() * N);
//     const z = Math.floor(Math.random() * N);
//     if (g.occ.has(x * 100 + z) || g.snake.some((s) => s.x === x && s.z === z)) continue;
//     g.food = { x, z };
//     g.foodT = FOOD_T;
//     return;
//   }
//   g.food = { x: 0, z: 0 };
//   g.foodT = FOOD_T;
// }

// function burst(g, x, z, n, col) {
//   for (let i = 0; i < n; i++) {
//     const a = Math.random() * Math.PI * 2;
//     const sp = 1 + Math.random() * 3;
//     g.parts.push({ x, y: 0.5, z, vx: Math.cos(a) * sp, vy: 2 + Math.random() * 3, vz: Math.sin(a) * sp, life: 0.6 + Math.random() * 0.6, col });
//   }
// }

// function newGame(name, demo) {
//   const occ = new Set();
//   const city = [];
//   for (let i = 0; i < 26; i++) {
//     let x = 0;
//     let z = 0;
//     let ok = false;
//     for (let t = 0; t < 60 && !ok; t++) {
//       x = Math.floor(Math.random() * N);
//       z = Math.floor(Math.random() * N);
//       ok = !occ.has(x * 100 + z) && !(z >= 8 && z <= 10 && x <= 14);
//     }
//     if (!ok) continue;
//     occ.add(x * 100 + z);
//     city.push({ x, z, h: 0.8 + Math.random() * 1.6, hue: 205 + Math.random() * 90 });
//   }
//   for (let x = -4; x <= N + 3; x++) {
//     for (let z = -5; z <= N + 3; z++) {
//       if (x >= 0 && x < N && z >= 0 && z < N) continue;
//       if (Math.random() < 0.4) continue;
//       const h = z >= N ? 0.25 + Math.random() * 0.25 : 2 + Math.random() * 6.5;
//       city.push({ x, z, h, hue: 205 + Math.random() * 90 });
//     }
//   }
//   const rows = Array.from({ length: N + 11 }, () => []);
//   city.forEach((b) => rows[b.z + 6].push(b));
//   const g = {
//     name, mode: demo ? 'demo' : 'play', occ, rows,
//     snake: [{ x: 9, z: 9 }, { x: 8, z: 9 }, { x: 7, z: 9 }],
//     dir: { x: 1, z: 0 }, queue: [], food: null, foodT: FOOD_T,
//     score: 0, tick: TICK0, acc: 0, t: 0, cam: { x: 9, z: 9 }, parts: [],
//     msg: '', msgT: 0, msgBad: false, dead: false, over: false, deadAt: 0,
//   };
//   spawnFood(g);
//   return g;
// }

// function step(g, api) {
//   if (g.queue.length) g.dir = g.queue.shift();
//   const h = g.snake[0];
//   const nx = h.x + g.dir.x;
//   const nz = h.z + g.dir.z;
//   const hitSelf = g.snake.some((s, i) => i < g.snake.length - 1 && s.x === nx && s.z === nz);
//   if (nx < 0 || nz < 0 || nx >= N || nz >= N || g.occ.has(nx * 100 + nz) || hitSelf) {
//     g.dead = true;
//     g.deadAt = g.t;
//     burst(g, h.x + 0.5, h.z + 0.5, 40, '#ff4466');
//     api.sfx('crash');
//     api.hud(g);
//     return;
//   }
//   g.snake.unshift({ x: nx, z: nz });
//   if (nx === g.food.x && nz === g.food.z) {
//     const pts = 10 + Math.ceil(g.foodT);
//     g.score += pts;
//     api.award(g, pts);
//     g.msg = '+' + pts;
//     g.msgT = 1.2;
//     g.msgBad = false;
//     burst(g, nx + 0.5, nz + 0.5, 22, '#7ef0ff');
//     api.sfx('eat');
//     g.tick = Math.max(80, TICK0 - g.snake.length * 2);
//     spawnFood(g);
//     api.hud(g);
//   } else {
//     g.snake.pop();
//   }
// }

// function update(g, dt, api) {
//   g.t += dt;
//   const demo = g.mode === 'demo';
//   const hx = demo ? 9 + Math.sin(g.t * 0.3) * 5 : g.snake[0].x + 0.5;
//   const hz = demo ? 9 + Math.cos(g.t * 0.24) * 4 : g.snake[0].z + 0.5;
//   const k = Math.min(1, dt * 4);
//   g.cam.x += (hx - g.cam.x) * k;
//   g.cam.z += (hz - g.cam.z) * k;
//   g.parts.forEach((p) => {
//     p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 6 * dt; p.life -= dt;
//   });
//   g.parts = g.parts.filter((p) => p.life > 0 && p.y > -0.2);
//   if (g.msgT > 0) g.msgT -= dt;
//   if (demo) return;
//   if (g.dead) {
//     if (!g.over && g.t - g.deadAt > 1) { g.over = true; api.over(g); }
//     return;
//   }
//   g.foodT -= dt;
//   if (g.foodT <= 0) {
//     g.score -= 5;
//     api.award(g, -5);
//     g.msg = '⏱ সময় শেষ  −5';
//     g.msgT = 1.5;
//     g.msgBad = true;
//     api.sfx('miss');
//     spawnFood(g);
//     api.hud(g);
//   }
//   g.acc += dt * 1000;
//   while (g.acc >= g.tick && !g.dead) {
//     g.acc -= g.tick;
//     step(g, api);
//   }
// }

// /* ---------- 3D রেন্ডার (ক্যানভাস প্রজেকশন) ---------- */
// function draw(c, g, W, H, t) {
//   const cam = g.cam;
//   const P = 1.12;
//   const cp = Math.cos(P);
//   const sp = Math.sin(P);
//   const D = 14;
//   const F = Math.min(W, H) * 1.15;
//   const pr = (x, y, z) => {
//     const dx = x - cam.x;
//     const dz = z - cam.z;
//     const z2 = D - y * sp - dz * cp;
//     return [W / 2 + (dx * F) / z2, H * 0.56 - ((y * cp - dz * sp) * F) / z2, z2];
//   };
//   const quad = (pts, fill) => {
//     const q = pts.map((p) => pr(p[0], p[1], p[2]));
//     if (q.some((v) => v[2] < 1.2)) return;
//     c.beginPath();
//     q.forEach((v, i) => { if (i) c.lineTo(v[0], v[1]); else c.moveTo(v[0], v[1]); });
//     c.closePath();
//     c.fillStyle = fill;
//     c.fill();
//   };

//   const bg = c.createLinearGradient(0, 0, 0, H);
//   bg.addColorStop(0, '#0b0420');
//   bg.addColorStop(1, '#1a0838');
//   c.fillStyle = bg;
//   c.fillRect(0, 0, W, H);
//   quad([[cam.x - 30, 0, cam.z - 40], [cam.x + 30, 0, cam.z - 40], [cam.x + 30, 0, cam.z + 10], [cam.x - 30, 0, cam.z + 10]], '#0d0522');
//   quad([[0, 0, 0], [N, 0, 0], [N, 0, N], [0, 0, N]], '#170b38');

//   c.lineWidth = 1;
//   c.strokeStyle = 'rgba(90,200,255,0.13)';
//   for (let i = 0; i <= N; i++) {
//     const a = pr(i, 0, 0), b = pr(i, 0, N), d = pr(0, 0, i), e = pr(N, 0, i);
//     if (a[2] > 1.2 && b[2] > 1.2) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
//     if (d[2] > 1.2 && e[2] > 1.2) { c.beginPath(); c.moveTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.stroke(); }
//   }
//   const bd = [pr(0, 0, 0), pr(N, 0, 0), pr(N, 0, N), pr(0, 0, N)];
//   if (bd.every((v) => v[2] > 1.2)) {
//     c.save();
//     c.strokeStyle = 'rgba(255,60,200,0.95)';
//     c.lineWidth = 3;
//     c.shadowColor = '#ff3cc8';
//     c.shadowBlur = 14;
//     c.beginPath();
//     bd.forEach((v, i) => { if (i) c.lineTo(v[0], v[1]); else c.moveTo(v[0], v[1]); });
//     c.closePath();
//     c.stroke();
//     c.restore();
//   }

//   const box = (x, z, w, h, hue, sat, lit, seed, win) => {
//     const x1 = x + w;
//     const z1 = z + w;
//     const p = [[x, 0, z], [x1, 0, z], [x1, 0, z1], [x, 0, z1], [x, h, z], [x1, h, z], [x1, h, z1], [x, h, z1]].map((v) => pr(v[0], v[1], v[2]));
//     if (p.some((v) => v[2] < 1.2)) return;
//     const poly = (ids, col) => {
//       c.beginPath();
//       ids.forEach((id, i) => { if (i) c.lineTo(p[id][0], p[id][1]); else c.moveTo(p[id][0], p[id][1]); });
//       c.closePath();
//       c.fillStyle = col;
//       c.fill();
//     };
//     poly(x + w / 2 < cam.x ? [1, 2, 6, 5] : [3, 0, 4, 7], 'hsl(' + hue + ',' + sat + '%,' + lit * 0.55 + '%)');
//     poly([2, 3, 7, 6], 'hsl(' + hue + ',' + sat + '%,' + lit * 0.8 + '%)');
//     poly([4, 5, 6, 7], 'hsl(' + hue + ',' + sat + '%,' + Math.min(88, lit * 1.25) + '%)');
//     if (win && h > 0.9) {
//       const rws = Math.floor(h / 0.4);
//       for (let r = 0; r < rws; r++) {
//         for (let cc = 0; cc < 3; cc++) {
//           const hs = (Math.imul((seed + r * 31 + cc * 17) | 0, 2654435761) >>> 0) % 5;
//           if (hs < 2) continue;
//           const wx = x + 0.12 + cc * 0.28;
//           const wy = 0.15 + r * 0.4;
//           const a = pr(wx, wy, z1);
//           const b = pr(wx + 0.16, wy + 0.22, z1);
//           c.fillStyle = hs === 4 ? 'rgba(255,210,122,0.9)' : 'rgba(126,240,255,0.8)';
//           c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
//         }
//       }
//     }
//     c.strokeStyle = 'hsla(' + hue + ',100%,70%,0.5)';
//     c.lineWidth = 1;
//     c.beginPath();
//     [4, 5, 6, 7].forEach((id, i) => { if (i) c.lineTo(p[id][0], p[id][1]); else c.moveTo(p[id][0], p[id][1]); });
//     c.closePath();
//     c.stroke();
//   };

//   const segRows = {};
//   g.snake.forEach((s, i) => { (segRows[s.z] = segRows[s.z] || []).push([s, i]); });
//   for (let z = -6; z <= N + 4; z++) {
//     if (z - cam.z > 11 || z - cam.z < -22) continue;
//     const bl = g.rows[z + 6];
//     if (bl) bl.forEach((b) => box(b.x + 0.05, b.z + 0.05, 0.9, b.h, b.hue, 45, 30, b.x * 31 + b.z * 17 + 1000, true));
//     const sr = segRows[z];
//     if (sr) {
//       sr.forEach((pair) => {
//         const s = pair[0];
//         const i = pair[1];
//         const hue = g.dead ? 350 : 135 + Math.min(i, 40) * 2;
//         const lit = 55 - Math.min(i, 30) * 0.4;
//         if (i === 0) { c.shadowColor = g.dead ? '#ff2244' : '#7dffb0'; c.shadowBlur = 20; }
//         box(s.x + (i ? 0.1 : 0.06), s.z + (i ? 0.1 : 0.06), i ? 0.8 : 0.88, i ? 0.62 : 0.8, hue, 90, lit, 0, false);
//         c.shadowBlur = 0;
//       });
//     }
//   }

//   // ফাইনাল লেয়ার: খাবার, মাথার রিং, কণা
//   if (g.food) {
//     const f = g.food;
//     const bob = 0.55 + 0.15 * Math.sin(t * 4);
//     const o = pr(f.x + 0.5, bob, f.z + 0.5);
//     const base = pr(f.x + 0.5, 0, f.z + 0.5);
//     const top = pr(f.x + 0.5, 3, f.z + 0.5);
//     if (o[2] > 1.2 && top[2] > 1.2) {
//       const r = (F / o[2]) * 0.28;
//       const beam = c.createLinearGradient(0, base[1], 0, top[1]);
//       beam.addColorStop(0, 'rgba(0,255,255,0.35)');
//       beam.addColorStop(1, 'rgba(0,255,255,0)');
//       c.strokeStyle = beam;
//       c.lineWidth = r * 1.2;
//       c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(top[0], top[1]); c.stroke();
//       c.save();
//       c.shadowColor = '#00f0ff';
//       c.shadowBlur = 25;
//       const rg = c.createRadialGradient(o[0], o[1], 1, o[0], o[1], r);
//       rg.addColorStop(0, '#ffffff');
//       rg.addColorStop(0.5, '#7ef0ff');
//       rg.addColorStop(1, '#ff3cc8');
//       c.fillStyle = rg;
//       c.beginPath(); c.arc(o[0], o[1], r, 0, Math.PI * 2); c.fill();
//       const frac = Math.max(0, g.foodT / FOOD_T);
//       c.strokeStyle = frac > 0.5 ? '#7dffb0' : frac > 0.25 ? '#ffd24a' : '#ff4466';
//       c.lineWidth = 3;
//       c.beginPath(); c.arc(o[0], o[1], r * 1.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); c.stroke();
//       c.restore();
//     }
//   }
//   const hd = g.snake[0];
//   const hc = pr(hd.x + 0.5, 0.9, hd.z + 0.5);
//   if (hc[2] > 1.2 && !g.dead) {
//     const rr = (F / hc[2]) * (0.55 + 0.06 * Math.sin(t * 6));
//     c.strokeStyle = 'rgba(125,255,176,0.8)';
//     c.lineWidth = 2;
//     c.beginPath(); c.arc(hc[0], hc[1], rr, 0, Math.PI * 2); c.stroke();
//     [-1, 1].forEach((sg) => {
//       const e = pr(hd.x + 0.5 + g.dir.x * 0.22 - g.dir.z * 0.2 * sg, 0.84, hd.z + 0.5 + g.dir.z * 0.22 + g.dir.x * 0.2 * sg);
//       const er = (F / e[2]) * 0.07;
//       c.fillStyle = '#fff';
//       c.beginPath(); c.arc(e[0], e[1], er, 0, Math.PI * 2); c.fill();
//       c.fillStyle = '#000';
//       c.beginPath(); c.arc(e[0], e[1], er * 0.5, 0, Math.PI * 2); c.fill();
//     });
//   }
//   g.parts.forEach((p) => {
//     const q = pr(p.x, p.y, p.z);
//     if (q[2] < 1.2) return;
//     c.globalAlpha = Math.min(1, p.life * 2);
//     c.fillStyle = p.col;
//     c.beginPath(); c.arc(q[0], q[1], Math.max(1, (F / q[2]) * 0.07), 0, Math.PI * 2); c.fill();
//     c.globalAlpha = 1;
//   });

//   const fog = c.createLinearGradient(0, 0, 0, H * 0.4);
//   fog.addColorStop(0, 'rgba(11,4,32,0.95)');
//   fog.addColorStop(1, 'rgba(11,4,32,0)');
//   c.fillStyle = fog;
//   c.fillRect(0, 0, W, H * 0.4);
//   const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
//   vg.addColorStop(0, 'rgba(0,0,0,0)');
//   vg.addColorStop(1, 'rgba(0,0,0,0.65)');
//   c.fillStyle = vg;
//   c.fillRect(0, 0, W, H);

//   if (g.msgT > 0 && g.mode === 'play') {
//     c.save();
//     c.globalAlpha = Math.min(1, g.msgT);
//     c.font = '800 ' + Math.max(26, Math.min(W, H) * 0.07) + 'px system-ui, sans-serif';
//     c.textAlign = 'center';
//     c.fillStyle = g.msgBad ? '#ff5577' : '#7dffb0';
//     c.shadowColor = g.msgBad ? '#ff2244' : '#00ff99';
//     c.shadowBlur = 18;
//     c.fillText(g.msg, W / 2, H * 0.3 - (1.5 - g.msgT) * 24);
//     c.restore();
//   }
// }

// /* ---------- কম্পোনেন্ট ---------- */
// export default function SnakeCity() {
//   const [phase, setPhase] = useState('menu');
//   const [name, setName] = useState('');
//   const [curName, setCurName] = useState('');
//   const [store, setStore] = useState(emptyStore);
//   const [loaded, setLoaded] = useState(false);
//   const [hud, setHud] = useState({ score: 0, len: 3 });
//   const [result, setResult] = useState(null);
//   const [muted, setMuted] = useState(false);
//   const canvasRef = useRef(null);
//   const G = useRef(null);
//   const ctxRef = useRef(null);
//   const mutedRef = useRef(false);
//   const apiRef = useRef(null);
//   const touch = useRef(null);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(KEY);
//       if (raw) {
//         const p = JSON.parse(raw);
//         if (p && typeof p === 'object') {
//           const src = p.board && typeof p.board === 'object' ? p.board : {};
//           const board = {};
//           Object.keys(src).forEach((k) => {
//             const e = src[k];
//             if (e && typeof e.name === 'string') {
//               board[k] = { name: e.name.slice(0, 14), points: Number(e.points) || 0, best: Number(e.best) || 0, games: Number(e.games) || 0 };
//             }
//           });
//           setStore({ day: typeof p.day === 'string' ? p.day : '', plays: Number(p.plays) || 0, name: typeof p.name === 'string' ? p.name : '', board });
//           if (typeof p.name === 'string') setName(p.name);
//         }
//       }
//     } catch (e) {}
//     setLoaded(true);
//   }, []);

//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
//   }, [store, loaded]);

//   const left = Math.max(0, DAILY - (store.day === dayKey() ? store.plays : 0));
//   const saved = Object.values(store.board).sort((a, b) => b.points - a.points);
//   const pts = (n) => (store.board['n_' + n] ? store.board['n_' + n].points : 0);
//   const bump = (fn) => setStore((s) => {
//     const t = dayKey();
//     return fn(s.day === t ? s : { ...s, day: t, plays: 0 });
//   });
//   const award = (g, d) => {
//     const sc = g.score;
//     const nm = g.name;
//     bump((s) => {
//       const k = 'n_' + nm;
//       const old = s.board[k] || { name: nm, points: 0, best: 0, games: 0 };
//       return { ...s, board: { ...s.board, [k]: { ...old, points: Math.max(0, old.points + d), best: Math.max(old.best, sc) } } };
//     });
//   };
//   const sfx = (k) => {
//     const a = ctxRef.current;
//     if (!a || mutedRef.current) return;
//     try {
//       if (a.state === 'suspended') a.resume();
//       if (k === 'eat') { tone(a, 'sine', 520, 980, 0.15, 0.25); }
//       else if (k === 'miss') { tone(a, 'sawtooth', 220, 80, 0.4, 0.2); }
//       else if (k === 'crash') { noise(a, 0.6, 0.5); tone(a, 'square', 140, 40, 0.6, 0.3); }
//       else if (k === 'start') { tone(a, 'sine', 300, 700, 0.3, 0.25); }
//     } catch (e) {}
//   };
//   apiRef.current = {
//     award, sfx,
//     hud: (g) => setHud({ score: g.score, len: g.snake.length }),
//     over: (g) => { setResult({ score: g.score, len: g.snake.length, name: g.name }); setPhase('over'); },
//   };

//   const turn = (dx, dz) => {
//     const g = G.current;
//     if (!g || g.mode !== 'play' || g.dead) return;
//     const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
//     if ((last.x === -dx && last.z === -dz) || (last.x === dx && last.z === dz)) return;
//     if (g.queue.length < 2) g.queue.push({ x: dx, z: dz });
//   };

//   const startGame = () => {
//     if (left <= 0) return;
//     const nm = (name.trim() || 'Player').slice(0, 14);
//     try {
//       if (!ctxRef.current) {
//         const AC = window.AudioContext || window.webkitAudioContext;
//         if (AC) ctxRef.current = new AC();
//       }
//       if (ctxRef.current && ctxRef.current.state === 'suspended') ctxRef.current.resume();
//     } catch (e) {}
//     bump((s) => {
//       const k = 'n_' + nm;
//       const old = s.board[k] || { name: nm, points: 0, best: 0, games: 0 };
//       return { ...s, name: nm, plays: s.plays + 1, board: { ...s.board, [k]: { ...old, games: old.games + 1 } } };
//     });
//     G.current = newGame(nm, false);
//     setCurName(nm);
//     setHud({ score: 0, len: 3 });
//     setResult(null);
//     setPhase('play');
//     sfx('start');
//   };
//   const toMenu = () => {
//     G.current = newGame('demo', true);
//     setPhase('menu');
//   };

//   useEffect(() => {
//     const c = canvasRef.current;
//     if (!c) return undefined;
//     const cx = c.getContext('2d');
//     if (!cx) return undefined;
//     G.current = newGame('demo', true);
//     let raf = 0;
//     let last = performance.now();
//     const frame = (now) => {
//       const dt = Math.min(0.05, (now - last) / 1000);
//       last = now;
//       const dpr = Math.min(2, window.devicePixelRatio || 1);
//       const W = c.clientWidth;
//       const H = c.clientHeight;
//       if (c.width !== Math.floor(W * dpr) || c.height !== Math.floor(H * dpr)) {
//         c.width = Math.floor(W * dpr);
//         c.height = Math.floor(H * dpr);
//       }
//       cx.setTransform(dpr, 0, 0, dpr, 0, 0);
//       const g = G.current;
//       if (g && W > 0 && H > 0) {
//         update(g, dt, apiRef.current);
//         draw(cx, g, W, H, now / 1000);
//       }
//       raf = requestAnimationFrame(frame);
//     };
//     raf = requestAnimationFrame(frame);
//     return () => cancelAnimationFrame(raf);
//   }, []);

//   useEffect(() => {
//     const map = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
//     const f = (e) => {
//       const m = map[e.key];
//       if (m) { e.preventDefault(); turn(m[0], m[1]); }
//     };
//     window.addEventListener('keydown', f);
//     return () => window.removeEventListener('keydown', f);
//   }, []);

//   const onTS = (e) => { const t = e.touches[0]; touch.current = [t.clientX, t.clientY]; };
//   const onTE = (e) => {
//     if (!touch.current) return;
//     const t = e.changedTouches[0];
//     const dx = t.clientX - touch.current[0];
//     const dy = t.clientY - touch.current[1];
//     touch.current = null;
//     if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
//     if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
//     else turn(0, dy > 0 ? 1 : -1);
//   };

//   return (
//     <main className="sx">
//       <style>{css}</style>
//       <canvas ref={canvasRef} className="cv" onTouchStart={onTS} onTouchEnd={onTE} />

//       {phase === 'play' && (
//         <>
//           <div className="top">
//             <div className="glass pill"><small>PLAYER</small><b>{curName}</b></div>
//             <div className="glass pill"><small>স্কোর</small><b className={hud.score < 0 ? 'neg' : ''}>{hud.score}</b></div>
//             <div className="glass pill"><small>দৈর্ঘ্য</small><b>{hud.len}</b></div>
//             <div className="glass pill"><small>মোট ⭐</small><b>{pts(curName)}</b></div>
//             <button className="glass ic" onClick={() => { mutedRef.current = !mutedRef.current; setMuted(mutedRef.current); }}>{muted ? '🔇' : '🔊'}</button>
//           </div>
//           <div className="dpad">
//             <button className="u" onPointerDown={() => turn(0, -1)}>▲</button>
//             <button className="l" onPointerDown={() => turn(-1, 0)}>◀</button>
//             <button className="r" onPointerDown={() => turn(1, 0)}>▶</button>
//             <button className="d" onPointerDown={() => turn(0, 1)}>▼</button>
//           </div>
//         </>
//       )}

//       {phase === 'menu' && (
//         <div className="center">
//           <div className="glass card">
//             <h1>NEON CITY <span>SNAKE 3D</span></h1>
//             <p className="sub">রাতের শহরে সাপ চালান • সময়মতো খাবার ধরুন</p>
//             <input value={name} maxLength={14} placeholder="আপনার নাম" onChange={(e) => setName(e.target.value)} />
//             {loaded && saved.length > 0 && (
//               <div className="chips">
//                 {saved.slice(0, 6).map((p) => (
//                   <button key={p.name} className="chip" onClick={() => setName(p.name)}>{p.name} ⭐{p.points}</button>
//                 ))}
//               </div>
//             )}
//             {loaded && (
//               <div className="plays">
//                 <div className="bar"><i style={{ width: (left / DAILY) * 100 + '%' }} /></div>
//                 <small>আজ বাকি: <b>{left}/{DAILY}</b> বার</small>
//               </div>
//             )}
//             <ul className="rules">
//               <li>🟢 খাবার {FOOD_T} সেকেন্ডে ধরুন: <b>+১০ ও সময়ের বোনাস</b></li>
//               <li>🔴 সময় ফুরালে: <b>−৫ পয়েন্ট</b></li>
//               <li>💥 দেয়াল, বিল্ডিং বা নিজের গায়ে ধাক্কা = গেম শেষ</li>
//               <li>🎮 কিবোর্ড তীর / WASD / স্ক্রিনে সোয়াইপ</li>
//             </ul>
//             <button className="go" onClick={startGame} disabled={!loaded || left <= 0}>
//               {loaded && left <= 0 ? 'আজকের ২০ বার শেষ 🌙' : '▶ খেলা শুরু'}
//             </button>
//             {loaded && saved.length > 0 && (
//               <div className="lb">
//                 <b>🏆 লিডারবোর্ড</b>
//                 {saved.slice(0, 5).map((p, i) => (
//                   <div key={p.name}><span>{i + 1}. {p.name}</span><span>⭐ {p.points} · সেরা {p.best}</span></div>
//                 ))}
//               </div>
//             )}
//             <a className="back" href="/">← Charlie Charlie গেমে যান</a>
//           </div>
//         </div>
//       )}

//       {phase === 'over' && result && (
//         <div className="center">
//           <div className="glass card over">
//             <h1>গেম <span>ওভার</span></h1>
//             <div className="big">{result.score}</div>
//             <p className="sub">{result.name} • সাপের দৈর্ঘ্য {result.len}</p>
//             <p>মোট পয়েন্ট: <b>⭐ {pts(result.name)}</b></p>
//             <p><small>আজ বাকি: {left}/{DAILY} বার</small></p>
//             <button className="go" onClick={startGame} disabled={left <= 0}>{left <= 0 ? 'আজকের খেলা শেষ 🌙' : '↻ আবার খেলুন'}</button>
//             <button className="alt" onClick={toMenu}>মেনু</button>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

// const css = `
// *{box-sizing:border-box}
// html,body{margin:0;background:#05010f}
// .sx{position:fixed;inset:0;overflow:hidden;color:#eef;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;user-select:none;-webkit-user-select:none}
// .cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
// .glass{background:rgba(22,10,48,.58);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(160,120,255,.35);border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.5),inset 0 0 30px rgba(120,80,255,.12)}
// .top{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
// .pill{padding:6px 12px;display:flex;flex-direction:column;min-width:64px}
// .pill small{font-size:.62rem;letter-spacing:.12em;opacity:.65}
// .pill b{font-size:1.1rem;background:linear-gradient(90deg,#00f0ff,#c58bff);-webkit-background-clip:text;background-clip:text;color:transparent}
// .pill b.neg{background:none;color:#ff5577}
// .ic{margin-left:auto;font-size:1.2rem;padding:0 14px;color:#fff;cursor:pointer}
// .center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto}
// .card{width:min(94vw,440px);padding:24px 22px;display:flex;flex-direction:column;gap:12px;text-align:center;animation:rise .6s ease}
// @keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
// .card h1{margin:0;font-size:clamp(1.6rem,7vw,2.2rem);letter-spacing:.04em;color:#fff;line-height:1.1}
// .card h1 span{display:block;background:linear-gradient(90deg,#00f0ff,#8a5cff,#ff3cc8);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(138,92,255,.7))}
// .sub{margin:0;opacity:.75;font-size:.9rem}
// .card input{padding:12px 14px;border-radius:12px;border:1px solid rgba(160,120,255,.45);background:rgba(8,3,22,.7);color:#fff;font-size:1rem;text-align:center}
// .chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
// .chip{background:rgba(120,80,255,.18);color:#eef;border:1px solid rgba(160,120,255,.4);border-radius:20px;padding:4px 12px;cursor:pointer;font-size:.8rem}
// .plays{display:flex;flex-direction:column;gap:5px;align-items:center}
// .bar{width:100%;height:7px;border-radius:7px;background:rgba(255,255,255,.1);overflow:hidden}
// .bar i{display:block;height:100%;background:linear-gradient(90deg,#00f0ff,#ff3cc8);box-shadow:0 0 12px #00f0ff}
// .rules{list-style:none;margin:0;padding:12px;text-align:left;font-size:.82rem;line-height:1.7;background:rgba(0,0,0,.25);border-radius:12px}
// .go{border:0;border-radius:40px;padding:14px;font-size:1.1rem;font-weight:700;color:#05010f;cursor:pointer;background:linear-gradient(90deg,#00f0ff,#7dffb0);box-shadow:0 0 28px rgba(0,240,255,.55);animation:pl 1.8s infinite}
// .go:disabled{opacity:.45;animation:none;cursor:not-allowed}
// @keyframes pl{50%{box-shadow:0 0 44px rgba(0,255,200,.9)}}
// .alt{border:1px solid rgba(160,120,255,.5);background:transparent;color:#eef;border-radius:40px;padding:11px;cursor:pointer}
// .lb{display:flex;flex-direction:column;gap:4px;font-size:.82rem;text-align:left}
// .lb>div{display:flex;justify-content:space-between;padding:4px 10px;background:rgba(255,255,255,.05);border-radius:8px}
// .back{color:#c58bff;font-size:.82rem;text-decoration:none;margin-top:2px}
// .over .big{font-size:4.5rem;font-weight:800;line-height:1;background:linear-gradient(180deg,#fff,#c58bff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 20px rgba(255,60,200,.6))}
// .dpad{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:176px;height:176px;display:none;grid-template:repeat(3,1fr)/repeat(3,1fr);gap:6px}
// .dpad button{border-radius:16px;border:1px solid rgba(160,120,255,.45);background:rgba(22,10,48,.6);color:#fff;font-size:1.3rem;backdrop-filter:blur(10px);touch-action:manipulation}
// .dpad .u{grid-area:1/2}.dpad .l{grid-area:2/1}.dpad .r{grid-area:2/3}.dpad .d{grid-area:3/2}
// @media (hover:none),(pointer:coarse){.dpad{display:grid}}
// `;
