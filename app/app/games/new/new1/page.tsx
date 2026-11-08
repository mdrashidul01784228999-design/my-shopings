'use client';

/**
 * পলান টুক: অন্ধকার — 3D হরর লুকোচুরি (Next.js + three.js)
 *
 * ইনস্টল:  npm i three && npm i -D @types/three
 * ফাইল:    app/page.tsx  (App Router)
 *
 * কন্ট্রোল:
 *  W A S D  — চলা        Shift — দৌড়
 *  মাউস     — চারদিকে দেখা  F — টর্চ
 *  E        — আলমারিতে লুকানো / বের হওয়া
 *  Space    — (লুকিয়ে থাকলে) দম বন্ধ রাখা
 */

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import * as THREE from 'three';

/* ───────────────────────── constants & types ───────────────────────── */

const CELL = 4;
const N = 17; // odd number
const WALL_H = 3.4;
const TOTAL_KEYS = 3;
const SPOT_I = 135;

type Phase = 'menu' | 'playing' | 'dead' | 'won';
type Mode = 'menu' | 'play' | 'dying' | 'over';
type GhostState = 'patrol' | 'chase' | 'search';
type Cell = [number, number];

interface Wardrobe {
  pos: THREE.Vector3;
  front: THREE.Vector3;
}

interface Pickup {
  mesh: THREE.Object3D;
  x: number;
  z: number;
  kind: 'key' | 'battery';
}

interface Hud {
  keys: number;
  battery: number;
  stamina: number;
  breath: number;
  hidden: boolean;
  flashOn: boolean;
  prompt: string;
  msg: string;
  fear: number;
  score: number;
  pop: string;
  popId: number;
}

const HUD0: Hud = {
  keys: 0,
  battery: 100,
  stamina: 1,
  breath: 1,
  hidden: false,
  flashOn: true,
  prompt: '',
  msg: '',
  fear: 0,
  score: 0,
  pop: '',
  popId: 0,
};

/* ───────────────────────── points & storage ───────────────────────── */

const STORE_KEY = 'polan-tuk-profile-v1';
const LOSS_PENALTY = 150;
const WIN_BONUS = 300;

interface Profile {
  points: number;
  best: number;
  wins: number;
  losses: number;
}

interface Result {
  kind: 'won' | 'dead';
  runPoints: number;
  winBonus: number;
  timeBonus: number;
  penalty: number;
  delta: number;
  before: number;
  total: number;
  best: boolean;
  seconds: number;
}

const DEFAULT_PROFILE: Profile = { points: 0, best: 0, wins: 0, losses: 0 };

const RANKS = [
  { min: 0, name: 'ভীতু' },
  { min: 300, name: 'সাহসী' },
  { min: 900, name: 'ছায়াসঙ্গী' },
  { min: 1800, name: 'অন্ধকারের রাজা' },
];

function loadProfile(): Profile {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Profile>;
      return {
        points: Math.max(0, Math.floor(Number(p.points) || 0)),
        best: Math.max(0, Math.floor(Number(p.best) || 0)),
        wins: Math.max(0, Math.floor(Number(p.wins) || 0)),
        losses: Math.max(0, Math.floor(Number(p.losses) || 0)),
      };
    }
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULT_PROFILE };
}

function saveProfile(p: Profile) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

/** জিতলে পয়েন্ট যোগ হয়, হারলে জরিমানা কাটা হয় (০-এর নিচে নামে না) */
function settle(p: Profile, kind: 'won' | 'dead', runPoints: number, seconds: number): { profile: Profile; result: Result } {
  if (kind === 'won') {
    const timeBonus = Math.max(0, 400 - seconds);
    const delta = runPoints + WIN_BONUS + timeBonus;
    const profile: Profile = { ...p, points: p.points + delta, wins: p.wins + 1, best: Math.max(p.best, delta) };
    return {
      profile,
      result: { kind, runPoints, winBonus: WIN_BONUS, timeBonus, penalty: 0, delta, before: p.points, total: profile.points, best: delta > p.best, seconds },
    };
  }
  const penalty = Math.min(p.points, LOSS_PENALTY);
  const profile: Profile = { ...p, points: p.points - penalty, losses: p.losses + 1 };
  return {
    profile,
    result: { kind, runPoints, winBonus: 0, timeBonus: 0, penalty, delta: -penalty, before: p.points, total: profile.points, best: false, seconds },
  };
}

function rankOf(points: number) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (points >= r.min) idx = i;
  });
  const next = RANKS[idx + 1];
  return {
    name: RANKS[idx].name,
    next: next ? next.name : null,
    need: next ? next.min - points : 0,
    progress: next ? (points - RANKS[idx].min) / (next.min - RANKS[idx].min) : 1,
  };
}

const bn = (n: number) => String(Math.round(n)).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const clockText = (s: number) => `${bn(Math.floor(s / 60))}:${s % 60 < 10 ? '০' : ''}${bn(s % 60)}`;

function detectTouch(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

const WHISPERS = [
  'পেছনে কেউ আছে...',
  'ও তোমাকে খুঁজছে...',
  'নিঃশ্বাস আস্তে নাও...',
  'কেউ ফিসফিস করে নাম ধরে ডাকল।',
  'ও খুব কাছেই আছে।',
  'আলমারির দরজাটা কি নড়ল?',
  'লুকিয়ে পড়ো। এখনই।',
];

/* ───────────────────────── helpers ───────────────────────── */

const rand = (n: number) => Math.floor(Math.random() * n);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const manhattan = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

function lerpAngle(a: number, b: number, t: number) {
  const d = ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * t;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** recursive-backtracker maze, then knock a few walls to make loops */
function generateMaze(n: number): number[][] {
  const g: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  const stack: Cell[] = [[1, 1]];
  g[1][1] = 0;
  const dirs = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = dirs
      .map(([dx, dy]) => [x + dx, y + dy, dx, dy])
      .filter(([nx, ny]) => nx > 0 && ny > 0 && nx < n - 1 && ny < n - 1 && g[ny][nx] === 1);
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [nx, ny, dx, dy] = opts[rand(opts.length)];
    g[y + dy / 2][x + dx / 2] = 0;
    g[ny][nx] = 0;
    stack.push([nx, ny]);
  }
  for (let i = 0; i < n * 1.4; i++) {
    const x = 1 + rand(n - 2);
    const y = 1 + rand(n - 2);
    if (g[y][x] === 1 && ((g[y][x - 1] === 0 && g[y][x + 1] === 0) || (g[y - 1][x] === 0 && g[y + 1][x] === 0))) {
      g[y][x] = 0;
    }
  }
  return g;
}

function bfs(g: number[][], s: Cell, t: Cell): Cell[] {
  const key = (x: number, y: number) => y * N + x;
  if (s[0] === t[0] && s[1] === t[1]) return [];
  const prev = new Map<number, number>();
  const q: Cell[] = [s];
  prev.set(key(s[0], s[1]), -1);
  while (q.length) {
    const [x, y] = q.shift()!;
    if (x === t[0] && y === t[1]) break;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || g[ny][nx] === 1 || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      q.push([nx, ny]);
    }
  }
  if (!prev.has(key(t[0], t[1]))) return [];
  const path: Cell[] = [];
  let cur = key(t[0], t[1]);
  const start = key(s[0], s[1]);
  while (cur !== -1 && cur !== start) {
    path.unshift([cur % N, Math.floor(cur / N)]);
    cur = prev.get(cur)!;
  }
  return path;
}

function makeTexture(kind: 'wall' | 'floor' | 'ceil'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = kind === 'wall' ? '#4d443c' : kind === 'floor' ? '#3b332c' : '#282119';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5500; i++) {
    const v = (Math.random() * 45) | 0;
    x.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.35})`;
    x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  if (kind === 'wall') {
    x.fillStyle = 'rgba(0,0,0,.2)';
    for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 6, 256);
    for (let i = 0; i < 5; i++) {
      const px = Math.random() * 256;
      const py = Math.random() * 120;
      x.fillStyle = 'rgba(95,0,0,.55)';
      x.fillRect(px, py, 2 + Math.random() * 3, 30 + Math.random() * 110);
      x.beginPath();
      x.arc(px + 1, py + 2, 4 + Math.random() * 5, 0, Math.PI * 2);
      x.fill();
    }
    for (let i = 0; i < 4; i++) {
      x.fillStyle = 'rgba(0,0,0,.35)';
      x.beginPath();
      x.arc(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 30, 0, Math.PI * 2);
      x.fill();
    }
  } else if (kind === 'floor') {
    x.fillStyle = 'rgba(0,0,0,.5)';
    for (let i = 0; i < 256; i += 32) x.fillRect(0, i, 256, 2);
    for (let r = 0; r < 8; r++) x.fillRect((r * 97) % 256, r * 32, 2, 32);
    x.fillStyle = 'rgba(80,0,0,.35)';
    for (let i = 0; i < 3; i++) {
      x.beginPath();
      x.ellipse(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 25, 6 + Math.random() * 14, Math.random() * 3, 0, Math.PI * 2);
      x.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildGhost() {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 1, emissive: 0x120000 });
  const bone = new THREE.MeshStandardMaterial({ color: 0xd2cabb, roughness: 0.8, emissive: 0x1a1612 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.75, 2.3, 12), dark);
  body.position.y = 1.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), bone);
  head.scale.set(0.8, 1.35, 0.9);
  head.position.y = 2.65;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.1, 2.72, 0.22);
  eyeR.position.set(0.1, 2.72, 0.22);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.04), new THREE.MeshBasicMaterial({ color: 0x050000 }));
  mouth.position.set(0, 2.5, 0.23);
  const armGeo = new THREE.CylinderGeometry(0.05, 0.035, 1.9, 6);
  const armL = new THREE.Mesh(armGeo, dark);
  const armR = new THREE.Mesh(armGeo, dark);
  armL.position.set(-0.5, 1.5, 0.55);
  armR.position.set(0.5, 1.5, 0.55);
  armL.rotation.x = armR.rotation.x = Math.PI / 2 + 0.5;

  const light = new THREE.PointLight(0xff2200, 10, 10, 2);
  light.position.set(0, 2.4, 0.4);

  g.add(body, head, eyeL, eyeR, mouth, armL, armR, light);
  g.traverse((o) => {
    o.castShadow = true;
  });
  return { group: g, light, eyeMat };
}

function buildWardrobe() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x33200f, roughness: 0.9 });
  const black = new THREE.MeshStandardMaterial({ color: 0x050403 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.9), wood);
  body.position.y = 1.3;
  const gap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.4, 0.02), black);
  gap.position.set(0, 1.3, 0.46);
  const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), black);
  const h2 = h1.clone();
  h1.position.set(-0.1, 1.3, 0.48);
  h2.position.set(0.1, 1.3, 0.48);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.0), wood);
  top.position.y = 2.62;
  g.add(body, gap, h1, h2, top);
  g.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  return g;
}

function buildKey() {
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a520, emissive: 0x996600, emissiveIntensity: 1.2, metalness: 0.8, roughness: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), gold);
  ring.position.y = 0.25;
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), gold);
  shaft.position.y = -0.02;
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), gold);
  t1.position.set(0.08, -0.15, 0);
  const t2 = t1.clone();
  t2.position.set(0.06, -0.06, 0);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.12, depthWrite: false })
  );
  g.add(ring, shaft, t1, t2, glow);
  return g;
}

function buildBattery() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.34, 10),
    new THREE.MeshStandardMaterial({ color: 0x33ff88, emissive: 0x0a7a3a, emissiveIntensity: 1.2 })
  );
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  cap.position.y = 0.2;
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x33ff88, transparent: true, opacity: 0.09, depthWrite: false })
  );
  g.add(b, cap, glow);
  return g;
}

/* ───────────────────────── styles ───────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap');
.hs-root{position:fixed;inset:0;background:#000;color:#e4dccd;font-family:'Hind Siliguri','Noto Sans Bengali','Kalpurush',system-ui,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none}
.hs-canvas{position:absolute;inset:0}
.hs-layer{position:absolute;inset:0;pointer-events:none}
.hs-vig{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(0,0,0,.8) 100%);opacity:.55}
.hs-danger{background:radial-gradient(ellipse at center,rgba(120,0,0,0) 38%,rgba(160,0,0,.8) 100%);opacity:0;mix-blend-mode:multiply}
.hs-flash{background:#b00000;opacity:0}
.hs-grain{opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");animation:hs-grain .5s steps(4) infinite}
@keyframes hs-grain{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-2%)}100%{transform:translate(0,0)}}
.hs-slit{background:linear-gradient(90deg,#030201 0,#030201 46.5%,rgba(3,2,1,.12) 47.5%,rgba(3,2,1,.12) 52.5%,#030201 53.5%,#030201 100%)}

.hs-glass{background:rgba(18,15,14,.55);backdrop-filter:blur(14px) saturate(1.25);-webkit-backdrop-filter:blur(14px) saturate(1.25);border:1px solid rgba(233,225,211,.13);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}

.hs-hud{position:absolute;left:20px;top:20px;width:238px;padding:15px 17px;display:flex;flex-direction:column;gap:14px;pointer-events:none}
.hs-row{display:flex;flex-direction:column;gap:6px}
.hs-lab{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:#a79d8e}
.hs-lab b{color:#f1e7d4;font-weight:600}
.hs-keys{display:flex;gap:9px}
.hs-key{width:24px;height:24px;border-radius:50%;border:2px solid rgba(242,185,91,.28);display:inline-block;transition:all .35s}
.hs-key.on{background:radial-gradient(circle at 35% 30%,#ffe3a0,#d9a520);border-color:#ffd77a;box-shadow:0 0 14px rgba(242,185,91,.75)}
.hs-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden}
.hs-bar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f2b95b,#ffe2a6);transition:width .15s}
.hs-bar.stam>i{background:linear-gradient(90deg,#6fae88,#bde8cb)}
.hs-bar.breath>i{background:linear-gradient(90deg,#5d86a0,#add4ea)}
.hs-bar.low>i{background:linear-gradient(90deg,#8f1712,#e5483f)}

.hs-map{position:absolute;right:20px;top:20px;padding:10px;pointer-events:none}
.hs-map canvas{display:block;width:136px;height:136px;border-radius:8px;background:rgba(0,0,0,.35)}
.hs-map small{display:block;margin-top:7px;font-size:12px;color:#8d8275;text-align:center}
.hs-heart{position:absolute;right:20px;bottom:20px;padding:10px 17px;display:flex;align-items:center;gap:11px;font-size:15px;color:#d9cfbe;pointer-events:none}
.hs-heart svg{width:22px;height:22px;fill:#e0463d;animation:hs-beat var(--d,1s) ease-in-out infinite}
@keyframes hs-beat{0%,100%{transform:scale(1)}18%{transform:scale(1.28)}36%{transform:scale(1)}50%{transform:scale(1.16)}70%{transform:scale(1)}}
.hs-cross{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(255,255,255,.4)}
.hs-prompt{position:absolute;left:50%;bottom:17%;transform:translateX(-50%);padding:11px 24px;border-radius:99px;font-size:18px;color:#f8eedb;white-space:nowrap}
.hs-msg{position:absolute;left:0;right:0;bottom:7%;text-align:center;padding:0 20px;font-size:clamp(18px,2.4vw,25px);color:#ddcdb4;text-shadow:0 0 10px #000,0 0 24px #6a0000}

.hs-kbd{display:inline-block;min-width:30px;padding:1px 9px;text-align:center;border:1px solid rgba(233,225,211,.3);border-bottom-width:3px;border-radius:7px;background:rgba(255,255,255,.06);color:#f3e9d6;font-size:14px;line-height:1.5}
.hs-rules{display:flex;flex-direction:column;gap:20px;font-size:16px;line-height:1.7;color:#cfc6b8;text-align:left}
.hs-rules h3{margin:0 0 7px;font-size:18px;font-weight:600;color:#f2b95b}
.hs-rules p{margin:0}
.hs-rules ol,.hs-rules ul{margin:0;padding-left:22px}
.hs-rules li{margin-bottom:6px}
.hs-rules li::marker{color:#c9463c}
.hs-ctrl{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center}
.hs-rulebox{padding:clamp(18px,3vw,32px);max-height:calc(100dvh - 56px);overflow:auto}

.hs-menu{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(24px,4vw,64px);align-items:center;padding:clamp(20px,5vw,72px);background:radial-gradient(ellipse at 20% 35%,rgba(120,14,14,.42),transparent 60%),radial-gradient(ellipse at 85% 80%,rgba(50,60,110,.26),transparent 55%),rgba(0,0,0,.8);background-size:150% 150%;animation:hs-bg 18s ease-in-out infinite alternate;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);overflow:auto}
.hs-hero{display:flex;flex-direction:column;align-items:flex-start}
.hs-title{font-family:'Tiro Bangla','Hind Siliguri',serif;font-weight:400;font-size:clamp(52px,9vw,112px);line-height:1.08;margin:0;color:#ece3d1;text-shadow:0 0 34px rgba(150,10,10,.75),0 2px 2px #000;animation:hs-flicker 6s infinite}
@keyframes hs-flicker{0%,18%,22%,62%,64%,100%{opacity:1}20%{opacity:.4}63%{opacity:.65}}
.hs-sub{margin:18px 0 0;font-size:clamp(17px,2vw,21px);color:#b5a999;max-width:540px;line-height:1.75}
.hs-btn{margin-top:32px;padding:15px 44px;font:inherit;font-size:20px;font-weight:600;color:#fbf1de;background:linear-gradient(180deg,#c3322b,#8c1510);border:1px solid rgba(255,140,120,.35);border-radius:99px;cursor:pointer;box-shadow:0 8px 30px rgba(170,20,15,.45);transition:transform .15s,box-shadow .2s}
.hs-btn:hover,.hs-btn:focus-visible{transform:translateY(-2px);box-shadow:0 12px 38px rgba(210,30,22,.6);outline:none}
.hs-note{margin-top:22px;font-size:14.5px;color:#8d8275;max-width:480px;line-height:1.7}

.hs-screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:radial-gradient(ellipse at center,rgba(0,0,0,.5),rgba(0,0,0,.93));backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);overflow:auto}
.hs-screen .hs-hero{align-items:center}
.hs-dead{color:#c4251c;text-shadow:0 0 36px #5a0000}
.hs-won{color:#e8d58f;text-shadow:0 0 36px #5a4a00}
.hs-pausecard{width:min(760px,100%)}
@media (max-width:860px){.hs-menu{grid-template-columns:1fr;align-items:start}.hs-hud{width:200px}.hs-map canvas{width:104px;height:104px}}
.hs-root{height:100dvh;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
.hs-canvas{touch-action:none}
.hs-menu,.hs-screen{touch-action:pan-y;overscroll-behavior:contain}
@keyframes hs-bg{from{background-position:0% 40%}to{background-position:100% 60%}}
.hs-profile{margin-top:26px;display:grid;grid-template-columns:repeat(3,auto);gap:8px 30px;padding:16px 22px;text-align:left}
.hs-profile small{display:block;font-size:13px;color:#8d8275}
.hs-profile strong{display:block;font-size:24px;font-weight:600;color:#f2dfb8}
.hs-rank{grid-column:1/-1;height:5px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:4px}
.hs-rank>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#c3322b,#f2b95b)}
.hs-rank-note{grid-column:1/-1;font-size:13.5px;color:#8d8275}
.hs-link{margin-top:10px;background:none;border:0;color:#7d7266;font:inherit;font-size:13.5px;text-decoration:underline;cursor:pointer;padding:6px 0}
.hs-pop{position:absolute;left:50%;top:34%;transform:translateX(-50%);font-size:40px;font-weight:700;color:#ffd77a;text-shadow:0 0 18px rgba(242,185,91,.8),0 2px 4px #000;pointer-events:none;animation:hs-pop 1.3s ease-out forwards}
@keyframes hs-pop{0%{opacity:0;transform:translate(-50%,16px) scale(.8)}15%{opacity:1;transform:translate(-50%,0) scale(1.1)}100%{opacity:0;transform:translate(-50%,-52px) scale(1)}}
.hs-result{margin-top:24px;width:min(440px,100%);padding:18px 22px;display:flex;flex-direction:column;gap:10px;text-align:left;font-size:17px}
.hs-result>div{display:flex;justify-content:space-between;gap:24px}
.hs-result .plus{color:#9fdc9f}
.hs-result .minus{color:#ff7a6e}
.hs-result .total{border-top:1px solid rgba(233,225,211,.18);padding-top:12px;margin-top:2px;font-size:22px;font-weight:600;color:#f6e7c3}
.hs-badge{margin-top:16px;padding:5px 16px;border-radius:99px;background:rgba(242,185,91,.16);border:1px solid rgba(242,185,91,.4);color:#ffd77a;font-size:14.5px}
.hs-joy{position:absolute;left:26px;bottom:30px;width:140px;height:140px;border-radius:50%;background:rgba(18,15,14,.45);border:1px solid rgba(233,225,211,.2);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);touch-action:none}
.hs-knob{position:absolute;left:41px;top:41px;width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,240,210,.92),rgba(200,170,120,.72));box-shadow:0 4px 18px rgba(0,0,0,.5);pointer-events:none}
.hs-act{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid rgba(233,225,211,.25);background:rgba(18,15,14,.55);color:#f1e7d4;font:inherit;font-size:14px;font-weight:600;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);touch-action:none;user-select:none;-webkit-user-select:none;padding:0}
.hs-act.on{background:rgba(195,50,43,.72);border-color:rgba(255,160,140,.6)}
.hs-act.hot{box-shadow:0 0 0 3px rgba(242,185,91,.55),0 0 22px rgba(242,185,91,.5)}
.hs-act.a1{right:28px;bottom:34px;width:84px;height:84px;font-size:16px}
.hs-act.a2{right:128px;bottom:28px;width:68px;height:68px}
.hs-act.a3{right:36px;bottom:134px;width:58px;height:58px}
.hs-act.a4{right:128px;bottom:112px;width:64px;height:64px}
.hs-pausebtn{position:absolute;top:20px;right:178px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#e4dccd;touch-action:none;padding:0}
.hs-pausebtn svg{width:18px;height:18px;fill:currentColor}
.hs-touch .hs-heart{right:auto;left:50%;bottom:14px;transform:translateX(-50%);padding:6px 12px;font-size:13px}
.hs-touch .hs-hud{width:182px;padding:10px 12px;gap:9px;left:12px;top:12px}
.hs-touch .hs-lab{font-size:12px}
.hs-touch .hs-row:first-child .hs-lab:nth-child(2){display:none}
.hs-touch .hs-key{width:17px;height:17px}
.hs-touch .hs-keys{gap:7px}
.hs-touch .hs-hud{gap:7px}
.hs-touch .hs-bar{height:5px}
.hs-touch .hs-map{right:12px;top:12px;padding:7px}
.hs-touch .hs-map canvas{width:98px;height:98px}
.hs-touch .hs-pausebtn{right:130px;top:12px}
.hs-touch .hs-prompt{bottom:30%;font-size:15px;padding:8px 16px}
.hs-touch .hs-msg{bottom:22%}
.hs-touch .hs-rulebox{max-height:calc(100dvh - 40px)}
@media (max-height:460px){.hs-joy{width:118px;height:118px;left:18px;bottom:18px}.hs-knob{left:34px;top:34px;width:50px;height:50px}.hs-act.a1{width:72px;height:72px;bottom:20px;right:20px}.hs-act.a2{width:58px;height:58px;right:104px;bottom:16px}.hs-act.a3{width:50px;height:50px;right:26px;bottom:104px}.hs-act.a4{width:54px;height:54px;right:104px;bottom:84px}}
@media (prefers-reduced-motion:reduce){.hs-grain,.hs-title,.hs-heart svg,.hs-menu{animation:none}}
`;

/* ───────────────────────── rules ───────────────────────── */

function Joystick({ onChange }: { onChange: (x: number, y: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<number | null>(null);
  const R = 52;
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const b = baseRef.current;
    const k = knobRef.current;
    if (!b || !k) return;
    const r = b.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    k.style.transform = `translate(${dx}px, ${dy}px)`;
    onChange(dx / R, -dy / R);
  };
  const end = () => {
    idRef.current = null;
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
    onChange(0, 0);
  };
  return (
    <div
      ref={baseRef}
      className="hs-joy"
      onPointerDown={(e) => {
        if (idRef.current !== null) return;
        idRef.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.pointerId === idRef.current) move(e);
      }}
      onPointerUp={(e) => {
        if (e.pointerId === idRef.current) end();
      }}
      onPointerCancel={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div ref={knobRef} className="hs-knob" />
    </div>
  );
}

function ActBtn({ cls, label, hot, onDown, onUp }: { cls: string; label: string; hot?: boolean; onDown: () => void; onUp?: () => void }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`hs-act ${cls}${hot ? ' hot' : ''}${on ? ' on' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setOn(true);
        onDown();
      }}
      onPointerUp={() => {
        setOn(false);
        onUp?.();
      }}
      onPointerCancel={() => {
        setOn(false);
        onUp?.();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

function CountUp({ from, to, ms = 1300 }: { from: number; to: number; ms?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, ms]);
  return <>{bn(v)}</>;
}

function Rules({ touch }: { touch: boolean }) {
  return (
    <div className="hs-rules">
      <div>
        <h3>লক্ষ্য</h3>
        <p>বাড়ির ভেতরে ছড়ানো তিনটি সোনালি চাবি জোগাড় করো, তারপর কোণের লাল দরজা খুলে পালাও।</p>
      </div>
      <div>
        <h3>খেলার নিয়ম</h3>
        <ol>
          <li>বাড়িতে একটি ভুত ঘুরে বেড়ায়। সে তোমাকে দেখলে বা খুব কাছে এলে টের পেলে তাড়া করবে। ছুঁয়ে ফেললেই তুমি হেরে যাবে।</li>
          <li>দৌড়ালে এবং টর্চ জ্বালা থাকলে ভুত দূর থেকে তোমাকে টের পায়। শক্তি ফুরিয়ে গেলে দৌড়ানো যায় না।</li>
          <li>ভুতের চোখের আড়ালে গিয়ে আলমারিতে লুকাও। ও খুঁজতে এলে দম বন্ধ রাখো, তাহলে ধরা পড়ার সম্ভাবনা কমে। দম ফুরিয়ে গেলে ঝুঁকি আবার বাড়ে।</li>
          <li>প্রতিটি চাবি তুললে আওয়াজে ভুত জেগে ওঠে, তোমার দিকে ছুটে আসে এবং আরও দ্রুত হয়ে যায়।</li>
          <li>টর্চের ব্যাটারি ধীরে ধীরে কমে। সবুজ ব্যাটারি তুললে ৩৫% ভরে যায়।</li>
          <li>তিনটি চাবি না থাকলে দরজা খুলবে না।</li>
        </ol>
      </div>
      <div>
        <h3>পয়েন্ট</h3>
        <ul>
          <li>চাবি তুললে <b>+১০০</b>, ব্যাটারি তুললে <b>+১৫</b>।</li>
          <li>লুকিয়ে থেকে ভুতকে ফাঁকি দিতে পারলে <b>+৫০</b>।</li>
          <li>পালাতে পারলে <b>+৩০০</b> এবং সময়ের বোনাস (সর্বোচ্চ +৪০০, প্রতি সেকেন্ডে ১ করে কমে)।</li>
          <li>ধরা পড়লে <b>−১৫০</b> পয়েন্ট কাটা যাবে এবং ঐ দফায় জমানো পয়েন্ট বাতিল হবে। মোট পয়েন্ট ০-এর নিচে নামে না।</li>
          <li>মোট পয়েন্ট এই ডিভাইসের ব্রাউজারে জমা থাকে। পয়েন্ট বাড়লে উপাধিও বদলায়।</li>
        </ul>
      </div>
      <div>
        <h3>নিয়ন্ত্রণ</h3>
        {touch ? (
          <ul>
            <li>বাঁদিকের গোল জয়স্টিক দিয়ে হাঁটো।</li>
            <li>স্ক্রিনের ফাঁকা জায়গায় আঙুল টেনে চারপাশে তাকাও।</li>
            <li>ডানদিকের বোতাম: <b>লুকাও</b> (আলমারির কাছে গেলে জ্বলে ওঠে), <b>দৌড়</b> (চেপে ধরে রাখো), <b>টর্চ</b>, আর লুকিয়ে থাকলে <b>দম</b> (চেপে ধরে রাখো)।</li>
            <li>ফোন আড়াআড়ি ধরে খেললে সবচেয়ে ভালো লাগবে।</li>
          </ul>
        ) : (
          <div className="hs-ctrl">
            <span>
              <span className="hs-kbd">W</span> <span className="hs-kbd">A</span> <span className="hs-kbd">S</span> <span className="hs-kbd">D</span>
            </span>
            <span>হাঁটা</span>
            <span className="hs-kbd">Shift</span>
            <span>দৌড় (শক্তি খরচ হয়)</span>
            <span className="hs-kbd">মাউস</span>
            <span>চারপাশে তাকানো</span>
            <span className="hs-kbd">F</span>
            <span>টর্চ জ্বালানো বা নেভানো</span>
            <span className="hs-kbd">E</span>
            <span>আলমারিতে লুকানো, আবার বেরোনো</span>
            <span className="hs-kbd">Space</span>
            <span>লুকিয়ে থাকা অবস্থায় দম বন্ধ রাখা</span>
            <span className="hs-kbd">Esc</span>
            <span>খেলা থামানো</span>
          </div>
        )}
      </div>
      <div>
        <h3>কৌশল</h3>
        <ul>
          <li>ডানদিকের মানচিত্রে দেখা জায়গাগুলো দাগ পড়ে। সোনালি বিন্দু মানে আলমারি।</li>
          <li>হৃদস্পন্দন দ্রুত হলে বুঝবে ভুত কাছেই আছে।</li>
          <li>মোড় ঘুরে ভুতের নজর ভাঙতে পারলে ও শেষ দেখা জায়গায় এসে খুঁজবে। তখনই লুকানোর সময়।</li>
          <li>আলো নিভিয়ে ঘুরলে ধরা পড়ার সম্ভাবনা কমে, কিন্তু অন্ধকারে চাবি খোঁজা কঠিন।</li>
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── component ───────────────────────── */

export default function HorrorHideAndSeek() {
  const mountRef = useRef<HTMLDivElement>(null);
  const vigRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<{ start: () => void; resume: () => void; pause: () => void; interact: () => void; toggleFlash: () => void } | null>(null);
  const touchRef = useRef({ jx: 0, jy: 0, sprint: false, breath: false });
  const profileRef = useRef<Profile>(DEFAULT_PROFILE);

  const [phase, setPhase] = useState<Phase>('menu');
  const [hud, setHud] = useState<Hud>(HUD0);
  const [locked, setLocked] = useState(false);
  const [runId, setRunId] = useState(0);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [result, setResult] = useState<Result | null>(null);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    profileRef.current = p;
    setProfile(p);
  }, []);

  useEffect(() => {
    const mount = mountRef.current!;
    const isTouch = detectTouch();
    setTouch(isTouch);
    const tc = touchRef.current;
    const W = () => mount.clientWidth || window.innerWidth;
    const H = () => mount.clientHeight || window.innerHeight;

    /* ── renderer / scene ── */
    const renderer = new THREE.WebGLRenderer({ antialias: !isTouch, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.25 : 1.5));
    renderer.setSize(W(), H());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060a);
    const fog = new THREE.FogExp2(0x07080d, 0.052);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(72, W() / H(), 0.1, 90);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0x3c4058, 1.5));
    scene.add(new THREE.HemisphereLight(0x6a74a0, 0x1d1511, 0.9));

    const spot = new THREE.SpotLight(0xfff0d0, SPOT_I, 38, 0.64, 0.6, 1.1);
    spot.position.set(0.15, -0.15, 0);
    spot.target.position.set(0, 0, -6);
    spot.castShadow = true;
    spot.shadow.mapSize.set(isTouch ? 512 : 1024, isTouch ? 512 : 1024);
    spot.shadow.bias = -0.0004;
    camera.add(spot);
    camera.add(spot.target);

    const aura = new THREE.PointLight(0xffd9a0, 4, 10, 1.6);
    camera.add(aura);

    /* ── world ── */
    const grid = generateMaze(N);
    const isWall = (x: number, z: number) => {
      const cx = Math.floor(x / CELL);
      const cz = Math.floor(z / CELL);
      if (cx < 0 || cz < 0 || cx >= N || cz >= N) return true;
      return grid[cz][cx] === 1;
    };
    const blocked = (x: number, z: number, r: number) =>
      isWall(x - r, z - r) || isWall(x + r, z - r) || isWall(x - r, z + r) || isWall(x + r, z + r);
    const los = (a: THREE.Vector3, b: THREE.Vector3) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const steps = Math.ceil(Math.hypot(dx, dz) / 0.6);
      for (let i = 1; i < steps; i++) {
        const k = i / steps;
        if (isWall(a.x + dx * k, a.z + dz * k)) return false;
      }
      return true;
    };
    const center = (c: Cell) => new THREE.Vector3((c[0] + 0.5) * CELL, 0, (c[1] + 0.5) * CELL);

    const wallTex = makeTexture('wall');
    const floorTex = makeTexture('floor');
    const ceilTex = makeTexture('ceil');
    floorTex.repeat.set(N * 2, N * 2);
    ceilTex.repeat.set(N * 2, N * 2);

    const wallCount = grid.flat().filter((v) => v === 1).length;
    const walls = new THREE.InstancedMesh(
      new THREE.BoxGeometry(CELL, WALL_H, CELL),
      new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 }),
      wallCount
    );
    const m4 = new THREE.Matrix4();
    let wi = 0;
    for (let z = 0; z < N; z++) {
      for (let x = 0; x < N; x++) {
        if (grid[z][x] === 1) {
          m4.setPosition((x + 0.5) * CELL, WALL_H / 2, (z + 0.5) * CELL);
          walls.setMatrixAt(wi++, m4);
        }
      }
    }
    walls.castShadow = true;
    walls.receiveShadow = true;
    scene.add(walls);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(N * CELL, N * CELL), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((N * CELL) / 2, 0, (N * CELL) / 2);
    floor.receiveShadow = true;
    scene.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(N * CELL, N * CELL), new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 1 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set((N * CELL) / 2, WALL_H, (N * CELL) / 2);
    scene.add(ceil);

    /* ── placement ── */
    const free: Cell[] = [];
    for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) if (grid[z][x] === 0) free.push([x, z]);
    const START: Cell = [1, 1];
    const EXIT: Cell = [N - 2, N - 2];
    const GHOST0: Cell = [9, 9];

    const cand = shuffle(free.filter((c) => manhattan(c, START) >= 8 && manhattan(c, EXIT) > 2 && !(c[0] === GHOST0[0] && c[1] === GHOST0[1])));
    const keyCells: Cell[] = [];
    for (const c of cand) {
      if (keyCells.length >= TOTAL_KEYS) break;
      if (keyCells.every((k) => manhattan(k, c) >= 8)) keyCells.push(c);
    }
    while (keyCells.length < TOTAL_KEYS) {
      const extra = cand.find((c) => !keyCells.includes(c));
      if (!extra) break;
      keyCells.push(extra);
    }

    const pickups: Pickup[] = [];
    for (const c of keyCells) {
      const m = buildKey();
      const p = center(c);
      m.position.set(p.x, 1.1, p.z);
      scene.add(m);
      pickups.push({ mesh: m, x: p.x, z: p.z, kind: 'key' });
    }
    for (const c of shuffle(free.filter((f) => manhattan(f, START) > 3 && !keyCells.includes(f))).slice(0, 4)) {
      const m = buildBattery();
      const p = center(c);
      m.position.set(p.x, 0.9, p.z);
      scene.add(m);
      pickups.push({ mesh: m, x: p.x, z: p.z, kind: 'battery' });
    }

    const wardrobes: Wardrobe[] = [];
    const dirs4 = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const c of shuffle(free)) {
      if (wardrobes.length >= 9) break;
      if ((c[0] === START[0] && c[1] === START[1]) || (c[0] === EXIT[0] && c[1] === EXIT[1])) continue;
      const wallDirs = dirs4.filter(([dx, dz]) => grid[c[1] + dz][c[0] + dx] === 1);
      if (!wallDirs.length) continue;
      const [dx, dz] = wallDirs[rand(wallDirs.length)];
      const p = center(c);
      const m = buildWardrobe();
      m.position.set(p.x + dx * (CELL / 2 - 0.55), 0, p.z + dz * (CELL / 2 - 0.55));
      m.rotation.y = Math.atan2(-dx, -dz);
      scene.add(m);
      wardrobes.push({ pos: new THREE.Vector3(m.position.x, 0, m.position.z), front: new THREE.Vector3(-dx, 0, -dz) });
    }

    // exit door on the east wall of the exit cell
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0x880000, emissiveIntensity: 1.4 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3, 2.2), doorMat);
    const exitC = center(EXIT);
    door.position.set(exitC.x + CELL / 2 - 0.3, 1.5, exitC.z);
    scene.add(door);
    const doorPos = new THREE.Vector3(door.position.x, 0, door.position.z);

    // warm lanterns for atmosphere
    const lamps: THREE.PointLight[] = [];
    const lampCells: Cell[] = [START, ...shuffle(free.filter((f) => manhattan(f, START) > 3)).slice(0, isTouch ? 2 : 4)];
    for (const c of lampCells) {
      const p = center(c);
      const l = new THREE.PointLight(0xffb866, 9, 11, 1.6);
      l.position.set(p.x, WALL_H - 0.5, p.z);
      scene.add(l);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffc680 }));
      bulb.position.copy(l.position);
      scene.add(bulb);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffa44d, transparent: true, opacity: 0.13, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      halo.position.copy(l.position);
      scene.add(halo);
      lamps.push(l);
    }

    const exitLight = new THREE.PointLight(0xff2a1a, 7, 10, 1.6);
    exitLight.position.set(exitC.x + CELL / 2 - 1.4, 2.2, exitC.z);
    scene.add(exitLight);

    // floating dust motes
    const DUST = isTouch ? 160 : 320;
    const dg = new THREE.BufferGeometry();
    const dp = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] = Math.random() * N * CELL;
      dp[i * 3 + 1] = Math.random() * WALL_H;
      dp[i * 3 + 2] = Math.random() * N * CELL;
    }
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xb3a98f, size: 0.05, transparent: true, opacity: 0.32, depthWrite: false })));

    /* ── ghost ── */
    const gh = buildGhost();
    const g0 = center(GHOST0);
    gh.group.position.set(g0.x, 0.1, g0.z);
    scene.add(gh.group);
    const ghost = {
      state: 'patrol' as GhostState,
      path: [] as Cell[],
      target: GHOST0 as Cell,
      repath: 0,
      lose: 0,
      searchT: 0,
      findT: 0,
      rollT: 0,
      stepT: 0,
      bonus: 0,
    };

    /* ── player & state ── */
    const pos = center(START);
    const st = {
      mode: 'menu' as Mode,
      locked: false,
      yaw: grid[1][2] === 0 ? -Math.PI / 2 : Math.PI,
      pitch: 0,
      baseYaw: 0,
      time: 0,
      keys: 0,
      battery: 100,
      stamina: 1,
      breath: 1,
      flashOn: true,
      hidden: false,
      holding: false,
      sprinting: false,
      spot: null as Wardrobe | null,
      fear: 0,
      bob: 0,
      stepT: 0,
      hbT: 1,
      msg: '',
      msgUntil: 0,
      whisperT: 15 + Math.random() * 12,
      blackoutT: 22 + Math.random() * 20,
      blackout: 0,
      dying: 0,
      doorMsgT: 0,
      flash: 0,
      score: 0,
      popT: -10,
      popText: '',
      popId: 0,
    };
    const keys: Record<string, boolean> = {};
    const showMsg = (text: string, sec = 3) => {
      st.msg = text;
      st.msgUntil = st.time + sec;
    };
    const pop = (n: number) => {
      st.score += n;
      st.popText = `+${bn(n)}`;
      st.popT = st.time;
      st.popId++;
    };
    const vibrate = (p: number | number[]) => {
      try {
        if (isTouch && navigator.vibrate) navigator.vibrate(p);
      } catch {
        /* ignore */
      }
    };
    const finishRun = (kind: 'won' | 'dead') => {
      const out = settle(profileRef.current, kind, st.score, Math.floor(st.time));
      profileRef.current = out.profile;
      saveProfile(out.profile);
      setProfile(out.profile);
      setResult(out.result);
    };

    /* ── audio ── */
    let ac: AudioContext | null = null;
    let master: GainNode | null = null;
    let noiseBuf: AudioBuffer | null = null;

    const initAudio = () => {
      if (ac) {
        void ac.resume();
        return;
      }
      const a = new AudioContext();
      const m = a.createGain();
      m.gain.value = 0.85;
      m.connect(a.destination);
      ac = a;
      master = m;
      const nb = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noiseBuf = nb;
      [38, 40.6, 57].forEach((f, i) => {
        const o = a.createOscillator();
        o.type = i === 2 ? 'triangle' : 'sine';
        o.frequency.value = f;
        const g = a.createGain();
        g.gain.value = i === 2 ? 0.02 : 0.07;
        o.connect(g);
        g.connect(m);
        o.start();
      });
      const wind = a.createBufferSource();
      wind.buffer = nb;
      wind.loop = true;
      const lp = a.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 240;
      const wg = a.createGain();
      wg.gain.value = 0.05;
      wind.connect(lp);
      lp.connect(wg);
      wg.connect(m);
      wind.start();
    };

    const tone = (f: number, dur: number, type: OscillatorType, vol: number, to?: number, delay = 0) => {
      if (!ac || !master) return;
      const t0 = ac.currentTime + delay;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t0);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    };
    const noise = (dur: number, vol: number, freq: number, type: BiquadFilterType = 'lowpass', delay = 0) => {
      if (!ac || !master || !noiseBuf) return;
      const t0 = ac.currentTime + delay;
      const s = ac.createBufferSource();
      s.buffer = noiseBuf;
      const f = ac.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f);
      f.connect(g);
      g.connect(master);
      s.start(t0, Math.random() * 0.4, dur);
    };
    const sfx = {
      step: () => noise(0.08, 0.06, 500),
      ghostStep: (near: number) => {
        noise(0.14, 0.05 + near * 0.5, 170);
        tone(62, 0.16, 'sine', 0.03 + near * 0.4, 40);
      },
      beat: (v: number) => {
        tone(55, 0.14, 'sine', v, 38);
        tone(46, 0.17, 'sine', v * 0.8, 34, 0.17);
      },
      chime: () => {
        tone(880, 0.55, 'sine', 0.16);
        tone(1320, 0.65, 'sine', 0.1, undefined, 0.09);
      },
      click: () => noise(0.04, 0.18, 2200, 'highpass'),
      creak: () => {
        tone(130, 0.9, 'sawtooth', 0.05, 70);
        noise(0.7, 0.05, 900, 'bandpass');
      },
      whisper: () => noise(1.8, 0.07, 2400, 'bandpass'),
      roar: () => {
        tone(95, 0.9, 'sawtooth', 0.3, 45);
        noise(0.8, 0.25, 700);
      },
      scare: () => {
        tone(110, 1.3, 'sawtooth', 0.55, 720);
        tone(1500, 1.0, 'square', 0.12, 280);
        noise(1.4, 0.6, 2000);
      },
    };

    /* ── game actions ── */
    const nearestWardrobe = (r: number) => {
      let best: Wardrobe | null = null;
      let bd = r;
      for (const w of wardrobes) {
        const d = Math.hypot(w.pos.x - pos.x, w.pos.z - pos.z);
        if (d < bd) {
          bd = d;
          best = w;
        }
      }
      return best;
    };

    const interact = () => {
      if (st.mode !== 'play' || !st.locked) return;
      if (st.hidden && st.spot) {
        const w = st.spot;
        st.hidden = false;
        pos.set(w.pos.x + w.front.x * 1.5, 0, w.pos.z + w.front.z * 1.5);
        st.yaw = Math.atan2(-w.front.x, -w.front.z);
        st.pitch = 0;
        st.spot = null;
        sfx.creak();
        return;
      }
      const w = nearestWardrobe(2.4);
      if (w) {
        st.hidden = true;
        st.spot = w;
        st.baseYaw = Math.atan2(-w.front.x, -w.front.z);
        st.yaw = st.baseYaw;
        st.pitch = 0;
        st.sprinting = false;
        ghost.findT = 0;
        ghost.rollT = 0;
        sfx.creak();
        showMsg('নিঃশ্বাস চেপে রাখো...', 2.5);
      }
    };

    const caught = () => {
      if (st.mode !== 'play') return;
      st.mode = 'dying';
      finishRun('dead');
      vibrate([60, 40, 220]);
      st.dying = 1.6;
      const fwd = new THREE.Vector3(-Math.sin(st.yaw), 0, -Math.cos(st.yaw));
      if (st.hidden && st.spot) {
        pos.set(st.spot.pos.x, 0, st.spot.pos.z);
      }
      st.hidden = false;
      gh.group.position.set(pos.x + fwd.x * 1.15, 0.05, pos.z + fwd.z * 1.15);
      gh.group.rotation.y = Math.atan2(-fwd.x, -fwd.z);
      st.pitch = 0.5;
      st.flash = 1;
      sfx.scare();
    };

    /* ── ghost AI ── */
    const tmp = new THREE.Vector3();
    const updateGhost = (dt: number, t: number) => {
      const gp = gh.group.position;
      const dx = pos.x - gp.x;
      const dz = pos.z - gp.z;
      const d = Math.hypot(dx, dz);
      let sees = false;
      if (!st.hidden) {
        const range = (st.sprinting ? 15 : 9) + (st.flashOn && st.battery > 0 ? 4 : 0);
        if (d < range && los(gp, pos)) sees = true;
        if (d < 3.2) sees = true;
      }
      const pc: Cell = [Math.floor(pos.x / CELL), Math.floor(pos.z / CELL)];
      const gc: Cell = [Math.floor(gp.x / CELL), Math.floor(gp.z / CELL)];

      if (sees) {
        if (ghost.state !== 'chase') {
          sfx.roar();
          vibrate([90, 50, 140]);
          showMsg('ও তোমাকে দেখে ফেলেছে!', 2.2);
        }
        ghost.state = 'chase';
        ghost.target = pc;
        ghost.lose = 0;
      } else if (ghost.state === 'chase') {
        ghost.lose += dt;
        if (ghost.lose > 2.5) {
          ghost.state = 'search';
          ghost.searchT = 0;
          ghost.path = [];
          ghost.repath = 0;
        }
      }

      ghost.repath -= dt;
      let speed = 1.8 + ghost.bonus * 0.5;
      if (ghost.state === 'chase') speed = 3.2 + ghost.bonus;
      if (ghost.state === 'search') speed = 2.4 + ghost.bonus * 0.5;

      let moving = false;
      tmp.set(0, 0, 0);

      if (ghost.state === 'chase' && sees && d < 6) {
        tmp.set(dx, 0, dz).normalize();
        moving = true;
      } else {
        if (ghost.state === 'patrol' && ghost.path.length === 0) {
          let c: Cell;
          const near = free.filter((f) => manhattan(f, pc) <= 8);
          c = Math.random() < 0.45 && near.length ? near[rand(near.length)] : free[rand(free.length)];
          ghost.target = c;
          ghost.path = bfs(grid, gc, c);
        } else if (ghost.state !== 'patrol' && ghost.repath <= 0) {
          ghost.path = bfs(grid, gc, ghost.target);
          ghost.repath = 0.4;
        }
        if (ghost.path.length) {
          const wp = ghost.path[0];
          const wx = (wp[0] + 0.5) * CELL - gp.x;
          const wz = (wp[1] + 0.5) * CELL - gp.z;
          const len = Math.hypot(wx, wz);
          if (len < 0.3) ghost.path.shift();
          else {
            tmp.set(wx / len, 0, wz / len);
            moving = true;
          }
        } else if (ghost.state === 'search') {
          ghost.searchT += dt;
          gh.group.rotation.y += Math.sin(t * 1.7) * dt * 1.4;
          if (ghost.searchT > 7) {
            ghost.state = 'patrol';
            ghost.path = [];
            if (st.hidden) {
              pop(50);
              showMsg('ও চলে গেল... তুমি ওকে ফাঁকি দিয়েছ!', 3);
            }
          }
        }
      }

      if (moving) {
        gp.x += tmp.x * speed * dt;
        gp.z += tmp.z * speed * dt;
        gh.group.rotation.y = lerpAngle(gh.group.rotation.y, Math.atan2(tmp.x, tmp.z), Math.min(1, dt * 7));
        ghost.stepT -= dt;
        if (ghost.stepT <= 0) {
          ghost.stepT = ghost.state === 'chase' ? 0.42 : 0.72;
          sfx.ghostStep(clamp(1 - d / 20, 0, 1));
        }
      }
      gp.y = 0.08 + Math.sin(t * 2.2) * 0.07;
      gh.light.intensity = (ghost.state === 'chase' ? 16 : 8) + Math.sin(t * 9) * 2;
      gh.eyeMat.color.setHex(ghost.state === 'chase' ? 0xff3030 : 0xaa1111);

      // searching near the hiding spot
      if (st.hidden && st.spot && ghost.state === 'search' && ghost.path.length === 0) {
        const wd = Math.hypot(st.spot.pos.x - gp.x, st.spot.pos.z - gp.z);
        if (wd < 5) {
          ghost.findT += dt;
          if (ghost.findT > 2) {
            ghost.rollT += dt;
            if (ghost.rollT >= 1) {
              ghost.rollT = 0;
              const chance = st.holding ? 0.03 : 0.16;
              if (Math.random() < chance) caught();
            }
          }
        }
      }

      if (!st.hidden && d < 1.15) caught();
      return d;
    };

    /* ── minimap (fog of war) ── */
    const seen: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
    const drawMap = () => {
      const cv = mapRef.current;
      if (!cv) return;
      const S = 8;
      if (cv.width !== N * S) {
        cv.width = N * S;
        cv.height = N * S;
      }
      const c2 = cv.getContext('2d');
      if (!c2) return;
      const pcx = Math.floor(pos.x / CELL);
      const pcz = Math.floor(pos.z / CELL);
      for (let dz = -2; dz <= 2; dz++) {
        for (let dx = -2; dx <= 2; dx++) {
          const cx = pcx + dx;
          const cz = pcz + dz;
          if (cx < 0 || cz < 0 || cx >= N || cz >= N) continue;
          if (los(pos, center([cx, cz]))) seen[cz][cx] = true;
        }
      }
      c2.clearRect(0, 0, cv.width, cv.height);
      for (let z = 0; z < N; z++) {
        for (let x = 0; x < N; x++) {
          if (!seen[z][x]) continue;
          c2.fillStyle = grid[z][x] === 1 ? 'rgba(210,198,176,.42)' : 'rgba(255,240,210,.10)';
          c2.fillRect(x * S, z * S, S, S);
        }
      }
      for (const w of wardrobes) {
        if (seen[Math.floor(w.pos.z / CELL)][Math.floor(w.pos.x / CELL)]) {
          c2.fillStyle = '#f2b95b';
          c2.fillRect((w.pos.x / CELL) * S - 2, (w.pos.z / CELL) * S - 2, 4, 4);
        }
      }
      if (seen[EXIT[1]][EXIT[0]]) {
        c2.fillStyle = st.keys >= TOTAL_KEYS ? '#4ade80' : '#c9463c';
        c2.fillRect(EXIT[0] * S + 1, EXIT[1] * S + 1, S - 2, S - 2);
      }
      c2.save();
      c2.translate((pos.x / CELL) * S, (pos.z / CELL) * S);
      c2.rotate(-st.yaw);
      c2.fillStyle = '#ffffff';
      c2.beginPath();
      c2.moveTo(0, -5);
      c2.lineTo(3.5, 4);
      c2.lineTo(0, 2);
      c2.lineTo(-3.5, 4);
      c2.closePath();
      c2.fill();
      c2.restore();
    };

    /* ── main update ── */
    const fwd = new THREE.Vector3();
    const rgt = new THREE.Vector3();
    let hudT = 0;

    const update = (dt: number, t: number) => {
      st.time += dt;

      // look limits when hidden
      if (st.hidden) {
        st.yaw = clamp(st.yaw, st.baseYaw - 0.6, st.baseYaw + 0.6);
        st.pitch = clamp(st.pitch, -0.35, 0.35);
      } else {
        st.pitch = clamp(st.pitch, -1.35, 1.35);
      }

      let moving = false;
      if (!st.hidden) {
        fwd.set(-Math.sin(st.yaw), 0, -Math.cos(st.yaw));
        rgt.set(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
        let mx = 0;
        let mz = 0;
        if (keys['KeyW']) {
          mx += fwd.x;
          mz += fwd.z;
        }
        if (keys['KeyS']) {
          mx -= fwd.x;
          mz -= fwd.z;
        }
        if (keys['KeyD']) {
          mx += rgt.x;
          mz += rgt.z;
        }
        if (keys['KeyA']) {
          mx -= rgt.x;
          mz -= rgt.z;
        }
        let analog = 1;
        if (Math.hypot(mx, mz) < 0.01 && (Math.abs(tc.jx) > 0.12 || Math.abs(tc.jy) > 0.12)) {
          mx += rgt.x * tc.jx + fwd.x * tc.jy;
          mz += rgt.z * tc.jx + fwd.z * tc.jy;
          analog = Math.min(1, Math.hypot(tc.jx, tc.jy) * 1.2);
        }
        const len = Math.hypot(mx, mz);
        moving = len > 0.01;
        st.sprinting = moving && (keys['ShiftLeft'] || keys['ShiftRight'] || tc.sprint) && st.stamina > 0.04;
        if (st.sprinting) st.stamina = Math.max(0, st.stamina - dt / 4.5);
        else st.stamina = Math.min(1, st.stamina + dt / 7);
        if (moving) {
          const sp = (st.sprinting ? 5.2 : 3.1) * analog;
          const sx = (mx / len) * sp * dt;
          const sz = (mz / len) * sp * dt;
          const r = 0.3;
          if (!blocked(pos.x + sx, pos.z, r)) pos.x += sx;
          if (!blocked(pos.x, pos.z + sz, r)) pos.z += sz;
          for (const w of wardrobes) {
            const ddx = pos.x - w.pos.x;
            const ddz = pos.z - w.pos.z;
            const dd = Math.hypot(ddx, ddz);
            if (dd < 0.95 && dd > 0.001) {
              pos.x += (ddx / dd) * (0.95 - dd);
              pos.z += (ddz / dd) * (0.95 - dd);
            }
          }
          st.bob += dt * (st.sprinting ? 11 : 7);
          st.stepT -= dt;
          if (st.stepT <= 0) {
            st.stepT = st.sprinting ? 0.3 : 0.52;
            sfx.step();
          }
        }
      } else {
        st.sprinting = false;
      }

      // breath
      if (st.hidden && (keys['Space'] || tc.breath) && st.breath > 0) {
        st.holding = true;
        st.breath = Math.max(0, st.breath - dt / 6);
      } else {
        st.holding = false;
        st.breath = Math.min(1, st.breath + dt / 9);
      }

      // flashlight
      if (st.flashOn && st.battery > 0 && !st.hidden) st.battery = Math.max(0, st.battery - dt * 0.7);
      st.blackout = Math.max(0, st.blackout - dt);

      // ghost
      const gd = updateGhost(dt, t);
      const gp = gh.group.position;
      const target = clamp((19 - gd) / 15, 0, 1) * (ghost.state === 'chase' ? 1 : 0.75) + (ghost.state === 'chase' ? 0.15 : 0);
      st.fear += (clamp(target, 0, 1) - st.fear) * Math.min(1, dt * 2.5);
      const fear = st.fear;

      // flashlight intensity with horror flicker
      let fl = st.flashOn && st.battery > 0 && !st.hidden ? 1 : 0;
      if (fl) {
        if (st.battery < 25 && Math.random() < 0.15) fl = Math.random() * 0.5;
        if (fear > 0.5 && Math.random() < (fear - 0.35) * 0.22) fl = 0.05;
        if (st.blackout > 0) fl = Math.random() < 0.2 ? 0.4 : 0;
      }
      spot.intensity = SPOT_I * fl;
      aura.intensity = st.blackout > 0 ? 0.4 : 4;
      lamps.forEach((l, i) => {
        l.intensity = (st.blackout > 0 ? 1 : 9) * (0.88 + 0.12 * Math.sin(t * (3 + i) + i * 2)) * (Math.random() < 0.02 ? 0.4 : 1);
      });

      // pickups
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.mesh.rotation.y += dt * 1.6;
        p.mesh.position.y = (p.kind === 'key' ? 1.1 : 0.9) + Math.sin(t * 2 + i) * 0.08;
        if (!st.hidden && Math.hypot(p.x - pos.x, p.z - pos.z) < 1.4) {
          scene.remove(p.mesh);
          pickups.splice(i, 1);
          sfx.chime();
          if (p.kind === 'key') {
            st.keys++;
            pop(100);
            ghost.bonus += 0.25;
            ghost.state = 'search';
            ghost.target = [Math.floor(pos.x / CELL), Math.floor(pos.z / CELL)];
            ghost.path = [];
            ghost.repath = 0;
            ghost.searchT = 0;
            showMsg(st.keys >= TOTAL_KEYS ? 'সব চাবি পেয়েছ! দরজার দিকে ছোটো — ও জেগে উঠেছে!' : `চাবি ${st.keys}/${TOTAL_KEYS} — আওয়াজে ও জেগে উঠেছে...`, 3.5);
            if (st.keys >= TOTAL_KEYS) {
              doorMat.color.setHex(0x002200);
              doorMat.emissive.setHex(0x22cc55);
              exitLight.color.setHex(0x33ff77);
            }
          } else {
            st.battery = Math.min(100, st.battery + 35);
            pop(15);
            showMsg('ব্যাটারি পাওয়া গেল।', 2);
          }
        }
      }

      // exit door
      const dd = Math.hypot(doorPos.x - pos.x, doorPos.z - pos.z);
      st.doorMsgT -= dt;
      if (!st.hidden && dd < 2.4) {
        if (st.keys >= TOTAL_KEYS) {
          st.mode = 'over';
          finishRun('won');
          vibrate([40, 30, 40]);
          document.exitPointerLock();
          setPhase('won');
        } else if (st.doorMsgT <= 0) {
          st.doorMsgT = 2.5;
          showMsg(`দরজা তালাবন্ধ। আরও ${TOTAL_KEYS - st.keys}টি চাবি লাগবে।`, 2.5);
        }
      }

      // random scares
      st.whisperT -= dt;
      if (st.whisperT <= 0) {
        st.whisperT = 18 + Math.random() * 22;
        showMsg(WHISPERS[rand(WHISPERS.length)], 3.2);
        sfx.whisper();
      }
      st.blackoutT -= dt;
      if (st.blackoutT <= 0) {
        st.blackoutT = 28 + Math.random() * 30;
        st.blackout = 1.3;
        sfx.creak();
      }

      // heartbeat
      st.hbT -= dt;
      if (st.hbT <= 0 && fear > 0.1) {
        sfx.beat(0.1 + fear * 0.55);
        st.hbT = lerp(1.15, 0.36, fear);
      } else if (st.hbT <= 0) {
        st.hbT = 0.5;
      }

      // camera
      const shake = fear > 0.55 ? (fear - 0.55) * 0.07 : 0;
      if (st.hidden && st.spot) {
        camera.position.set(st.spot.pos.x, 1.55, st.spot.pos.z);
      } else {
        camera.position.set(pos.x, 1.65 + (moving ? Math.sin(st.bob) * 0.05 : 0), pos.z);
      }
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
      camera.rotation.set(st.pitch, st.yaw, 0);
      const fov = 72 + fear * 7 + (st.sprinting ? 5 : 0);
      if (Math.abs(camera.fov - fov) > 0.05) {
        camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 6));
        camera.updateProjectionMatrix();
      }
      fog.density = 0.052 + fear * 0.025;

      // overlays
      if (vigRef.current) vigRef.current.style.opacity = String(0.5 + fear * 0.35);
      if (dangerRef.current) dangerRef.current.style.opacity = String(clamp(fear * 0.9, 0, 1));
      if (flashRef.current) flashRef.current.style.opacity = '0';

      // HUD
      hudT += dt;
      if (hudT > 0.1) {
        hudT = 0;
        drawMap();
        let prompt = '';
        if (st.hidden) prompt = isTouch ? 'দম বন্ধ রাখতে “দম” বোতাম চেপে ধরো' : 'E — বেরিয়ে আসো     Space — দম বন্ধ রাখো';
        else if (nearestWardrobe(2.4)) prompt = isTouch ? 'আলমারিতে লুকাতে “লুকাও” চাপো' : 'E — আলমারিতে লুকাও';
        setHud({
          keys: st.keys,
          battery: st.battery,
          stamina: st.stamina,
          breath: st.breath,
          hidden: st.hidden,
          flashOn: st.flashOn,
          prompt,
          msg: st.time < st.msgUntil ? st.msg : '',
          fear: st.fear,
          score: st.score,
          pop: st.time - st.popT < 1.3 ? st.popText : '',
          popId: st.popId,
        });
      }
      void gp;
    };

    const updateDying = (dt: number, t: number) => {
      st.dying -= dt;
      const gp = gh.group.position;
      camera.position.set(pos.x + (Math.random() - 0.5) * 0.08, 1.65 + (Math.random() - 0.5) * 0.08, pos.z + (Math.random() - 0.5) * 0.08);
      st.pitch = lerp(st.pitch, 0.42, Math.min(1, dt * 8));
      camera.rotation.set(st.pitch, st.yaw + (Math.random() - 0.5) * 0.05, 0);
      gh.group.scale.setScalar(1 + (1.6 - st.dying) * 0.1);
      gp.y = 0.05;
      gh.light.intensity = 25 + Math.random() * 20;
      gh.eyeMat.color.setHex(Math.random() < 0.5 ? 0xff0000 : 0xffffff);
      spot.intensity = Math.random() < 0.5 ? SPOT_I : 0;
      st.flash = Math.max(0, st.flash - dt * 0.6);
      if (flashRef.current) flashRef.current.style.opacity = String(st.flash * 0.7);
      if (dangerRef.current) dangerRef.current.style.opacity = '1';
      void t;
      if (st.dying <= 0) {
        st.mode = 'over';
        document.exitPointerLock();
        setPhase('dead');
      }
    };

    /* ── loop ── */
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (st.mode === 'play' && st.locked) update(dt, t);
      else if (st.mode === 'dying') updateDying(dt, t);
      else if (st.mode === 'menu') {
        // slow drifting camera in the menu
        camera.position.set(pos.x, 1.65, pos.z);
        camera.rotation.set(0, st.yaw + Math.sin(t * 0.3) * 0.25, 0);
        spot.intensity = 110 + Math.sin(t * 7) * 8 * (Math.random() < 0.1 ? 3 : 0);
      }
      for (let i = 0; i < DUST; i++) {
        dp[i * 3 + 1] += dt * 0.05;
        if (dp[i * 3 + 1] > WALL_H) dp[i * 3 + 1] = 0.1;
        dp[i * 3] += Math.sin(t * 0.5 + i) * dt * 0.06;
      }
      dg.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    camera.position.set(pos.x, 1.65, pos.z);
    tick();

    /* ── events ── */
    const toggleFlash = () => {
      if (st.mode === 'play' && st.locked && !st.hidden) {
        st.flashOn = !st.flashOn;
        sfx.click();
      }
    };
    let lookId: number | null = null;
    let lx = 0;
    let ly = 0;
    const onPD = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || lookId !== null) return;
      lookId = e.pointerId;
      lx = e.clientX;
      ly = e.clientY;
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onPM = (e: PointerEvent) => {
      if (e.pointerId !== lookId) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      if (st.mode === 'play' && st.locked) {
        st.yaw -= dx * 0.0055;
        st.pitch -= dy * 0.0045;
      }
    };
    const onPU = (e: PointerEvent) => {
      if (e.pointerId === lookId) lookId = null;
    };
    const onVis = () => {
      if (document.hidden) apiRef.current?.pause();
    };
    const onMouse = (e: MouseEvent) => {
      if (!st.locked || st.mode !== 'play') return;
      st.yaw -= e.movementX * 0.0022;
      st.pitch -= e.movementY * 0.0022;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') e.preventDefault();
      if (e.repeat) return;
      keys[e.code] = true;
      if (e.code === 'KeyE') interact();
      if (e.code === 'KeyF') toggleFlash();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    const onLock = () => {
      const l = document.pointerLockElement === renderer.domElement;
      st.locked = l;
      setLocked(l);
      if (ac) {
        if (l) void ac.resume();
        else if (st.mode === 'play') void ac.suspend();
      }
    };
    const onResize = () => {
      renderer.setSize(W(), H());
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    };
    document.addEventListener('mousemove', onMouse);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onLock);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', onPD);
    cv.addEventListener('pointermove', onPM);
    cv.addEventListener('pointerup', onPU);
    cv.addEventListener('pointercancel', onPU);

    const setTouchLock = (v: boolean) => {
      st.locked = v;
      setLocked(v);
    };
    const resetTouch = () => {
      tc.jx = 0;
      tc.jy = 0;
      tc.sprint = false;
      tc.breath = false;
    };

    apiRef.current = {
      start: () => {
        initAudio();
        resetTouch();
        st.mode = 'play';
        showMsg('চাবি খুঁজে বের করো। ও এখানেই আছে...', 4);
        if (isTouch) {
          setTouchLock(true);
          try {
            const fs = document.documentElement.requestFullscreen?.();
            if (fs) fs.catch(() => undefined);
          } catch {
            /* ignore */
          }
        } else {
          void renderer.domElement.requestPointerLock();
        }
      },
      resume: () => {
        resetTouch();
        if (isTouch) {
          setTouchLock(true);
          if (ac) void ac.resume();
        } else {
          void renderer.domElement.requestPointerLock();
        }
      },
      pause: () => {
        if (st.mode !== 'play') return;
        resetTouch();
        if (isTouch) {
          setTouchLock(false);
          if (ac) void ac.suspend();
        } else {
          document.exitPointerLock();
        }
      },
      interact,
      toggleFlash,
    };

    /* ── cleanup ── */
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMouse);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onLock);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      cv.removeEventListener('pointerdown', onPD);
      cv.removeEventListener('pointermove', onPM);
      cv.removeEventListener('pointerup', onPU);
      cv.removeEventListener('pointercancel', onPU);
      if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      wallTex.dispose();
      floorTex.dispose();
      ceilTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      if (ac) void ac.close();
      apiRef.current = null;
    };
  }, [runId]);

  const startGame = () => {
    touchRef.current.jx = 0;
    touchRef.current.jy = 0;
    apiRef.current?.start();
    setHud(HUD0);
    setResult(null);
    setPhase('playing');
  };
  const retry = () => {
    setHud(HUD0);
    setLocked(false);
    setResult(null);
    setRunId((r) => r + 1);
    setPhase('menu');
  };
  const resetPoints = () => {
    if (window.confirm('সব পয়েন্ট মুছে ফেলতে চাও?')) {
      const p = { ...DEFAULT_PROFILE };
      profileRef.current = p;
      saveProfile(p);
      setProfile(p);
    }
  };

  const bpm = Math.round(68 + hud.fear * 100);
  const rank = rankOf(profile.points);

  return (
    <div className={'hs-root' + (touch ? ' hs-touch' : '')}>
      <style>{CSS}</style>
      <div ref={mountRef} className="hs-canvas" />

      <div ref={vigRef} className="hs-layer hs-vig" />
      <div ref={dangerRef} className="hs-layer hs-danger" />
      <div className="hs-layer hs-grain" />
      {hud.hidden && phase === 'playing' && <div className="hs-layer hs-slit" />}
      <div ref={flashRef} className="hs-layer hs-flash" />

      {phase === 'playing' && (
        <>
          <div className="hs-hud hs-glass">
            <div className="hs-row">
              <div className="hs-lab">
                <span>এই দফার পয়েন্ট</span>
                <b>{bn(hud.score)}</b>
              </div>
              <div className="hs-lab">
                <span>মোট জমা</span>
                <b>{bn(profile.points)}</b>
              </div>
            </div>
            <div className="hs-row">
              <div className="hs-lab">
                <span>চাবি</span>
                <b>
                  {bn(hud.keys)}/{bn(TOTAL_KEYS)}
                </b>
              </div>
              <div className="hs-keys">
                {Array.from({ length: TOTAL_KEYS }).map((_, i) => (
                  <span key={i} className={'hs-key' + (i < hud.keys ? ' on' : '')} />
                ))}
              </div>
            </div>
            <div className="hs-row">
              <div className="hs-lab">
                <span>টর্চ {hud.flashOn ? '' : '(বন্ধ)'}</span>
                <b>{bn(hud.battery)}%</b>
              </div>
              <div className={'hs-bar' + (hud.battery < 25 ? ' low' : '')}>
                <i style={{ width: `${hud.battery}%` }} />
              </div>
            </div>
            <div className="hs-row">
              <div className="hs-lab">
                <span>শক্তি</span>
              </div>
              <div className={'hs-bar stam' + (hud.stamina < 0.2 ? ' low' : '')}>
                <i style={{ width: `${hud.stamina * 100}%` }} />
              </div>
            </div>
            {hud.hidden && (
              <div className="hs-row">
                <div className="hs-lab">
                  <span>দম</span>
                </div>
                <div className="hs-bar breath">
                  <i style={{ width: `${hud.breath * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="hs-map hs-glass">
            <canvas ref={mapRef} />
            <small>মানচিত্র</small>
          </div>

          <div className="hs-heart hs-glass" style={{ ['--d' as string]: `${(60 / bpm).toFixed(2)}s` }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.8 6.3 4.8c2 0 3.6 1.1 4.5 2.6.3.5.9.5 1.2 0 .9-1.5 2.5-2.6 4.5-2.6 3.6 0 5.4 3.6 3.9 7C19.5 16.4 12 21 12 21z" />
            </svg>
            <span>{bn(bpm)} স্পন্দন</span>
          </div>

          <div className="hs-cross" />
          {hud.pop && (
            <div key={hud.popId} className="hs-pop">
              {hud.pop}
            </div>
          )}
          {hud.prompt && <div className="hs-prompt hs-glass">{hud.prompt}</div>}
          {hud.msg && <div className="hs-msg">{hud.msg}</div>}

          {touch && locked && (
            <>
              <button type="button" className="hs-pausebtn hs-glass" aria-label="থামাও" onPointerDown={() => apiRef.current?.pause()}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="4" width="5" height="16" rx="1.5" />
                  <rect x="14" y="4" width="5" height="16" rx="1.5" />
                </svg>
              </button>
              <Joystick
                onChange={(x, y) => {
                  touchRef.current.jx = x;
                  touchRef.current.jy = y;
                }}
              />
              <ActBtn cls="a1" label={hud.hidden ? 'বেরোও' : 'লুকাও'} hot={!!hud.prompt} onDown={() => apiRef.current?.interact()} />
              <ActBtn
                cls="a2"
                label="দৌড়"
                onDown={() => {
                  touchRef.current.sprint = true;
                }}
                onUp={() => {
                  touchRef.current.sprint = false;
                }}
              />
              <ActBtn cls="a3" label="টর্চ" onDown={() => apiRef.current?.toggleFlash()} />
              {hud.hidden && (
                <ActBtn
                  cls="a4"
                  label="দম"
                  onDown={() => {
                    touchRef.current.breath = true;
                  }}
                  onUp={() => {
                    touchRef.current.breath = false;
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {phase === 'menu' && (
        <div className="hs-menu">
          <div className="hs-hero">
            <h1 className="hs-title">
              পলান টুক
              <br />
              অন্ধকার
            </h1>
            <p className="hs-sub">
              পুরোনো এক বাড়ি। তিনটি চাবি খুঁজে দরজা খুলে পালাতে হবে। কিন্তু বাড়িটা একা নয়। ও-ও লুকোচুরি খেলছে, আর এবার খুঁজে বের করার পালা ওর।
            </p>
            <button className="hs-btn" onClick={startGame}>
              খেলা শুরু করো
            </button>

            <div className="hs-profile hs-glass">
              <div>
                <small>মোট পয়েন্ট</small>
                <strong>{bn(profile.points)}</strong>
              </div>
              <div>
                <small>উপাধি</small>
                <strong>{rank.name}</strong>
              </div>
              <div>
                <small>জয় / হার</small>
                <strong>
                  {bn(profile.wins)} / {bn(profile.losses)}
                </strong>
              </div>
              <div className="hs-rank">
                <i style={{ width: `${Math.round(rank.progress * 100)}%` }} />
              </div>
              <div className="hs-rank-note">
                {rank.next ? `পরের উপাধি “${rank.next}” পেতে আর ${bn(rank.need)} পয়েন্ট লাগবে` : 'তুমি সর্বোচ্চ উপাধিতে পৌঁছে গেছ'}
                {profile.best > 0 ? ` · সেরা দফা: ${bn(profile.best)}` : ''}
              </div>
            </div>

            <p className="hs-note">
              {touch
                ? 'ফোন আড়াআড়ি ধরে খেললে ভালো লাগবে। হেডফোন পরলে ভয় পাওয়ার মজা বেশি।'
                : 'কিবোর্ড ও মাউস দিয়ে খেলো। ফোন বা ট্যাবলেটেও স্পর্শ-নিয়ন্ত্রণে চলবে। হেডফোন পরলে ভয় পাওয়ার মজা বেশি।'}
            </p>
            {profile.points > 0 && (
              <button type="button" className="hs-link" onClick={resetPoints}>
                পয়েন্ট মুছে নতুন করে শুরু করো
              </button>
            )}
          </div>
          <div className="hs-rulebox hs-glass">
            <Rules touch={touch} />
          </div>
        </div>
      )}

      {phase === 'playing' && !locked && (
        <div className="hs-screen">
          <div className="hs-pausecard hs-glass hs-rulebox">
            <h2 className="hs-title" style={{ fontSize: 'clamp(30px,5vw,48px)', animation: 'none', marginBottom: 18 }}>
              খেলা থেমে আছে
            </h2>
            <Rules touch={touch} />
            <div style={{ textAlign: 'center' }}>
              <button className="hs-btn" onClick={() => apiRef.current?.resume()}>
                অন্ধকারে ফিরে যাও
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'dead' && (
        <div className="hs-screen">
          <div className="hs-hero">
            <h2 className="hs-title hs-dead">ও তোমাকে খুঁজে পেয়েছে</h2>
            <p className="hs-sub">এবার আরেকটু ভালো জায়গায় লুকিয়ে দেখো। দম বন্ধ রাখতে ভুলো না।</p>
            {result && (
              <div className="hs-result hs-glass">
                <div>
                  <span>এই দফায় জমানো পয়েন্ট (বাতিল)</span>
                  <span>{bn(result.runPoints)}</span>
                </div>
                <div className="minus">
                  <span>ধরা পড়ার জরিমানা</span>
                  <span>−{bn(result.penalty)}</span>
                </div>
                <div className="total">
                  <span>মোট পয়েন্ট</span>
                  <span>
                    <CountUp from={result.before} to={result.total} />
                  </span>
                </div>
              </div>
            )}
            <button className="hs-btn" onClick={retry}>
              আবার চেষ্টা করো
            </button>
          </div>
        </div>
      )}

      {phase === 'won' && (
        <div className="hs-screen">
          <div className="hs-hero">
            <h2 className="hs-title hs-won">তুমি পালিয়ে এসেছ</h2>
            <p className="hs-sub">দরজা বন্ধ হওয়ার আগে পেছনে একবার ফিসফিস শোনা গেল: &ldquo;আবার খেলবে?&rdquo;</p>
            {result && (
              <>
                <div className="hs-result hs-glass">
                  <div>
                    <span>এই দফার পয়েন্ট</span>
                    <span className="plus">+{bn(result.runPoints)}</span>
                  </div>
                  <div>
                    <span>পালানোর বোনাস</span>
                    <span className="plus">+{bn(result.winBonus)}</span>
                  </div>
                  <div>
                    <span>সময়ের বোনাস ({clockText(result.seconds)})</span>
                    <span className="plus">+{bn(result.timeBonus)}</span>
                  </div>
                  <div className="total">
                    <span>মোট পয়েন্ট</span>
                    <span>
                      <CountUp from={result.before} to={result.total} />
                    </span>
                  </div>
                </div>
                {result.best && <div className="hs-badge">নতুন সেরা স্কোর!</div>}
              </>
            )}
            <button className="hs-btn" onClick={retry}>
              নতুন বাড়িতে খেলো
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// 'use client';

// /**
//  * পলান টুক: অন্ধকার — 3D হরর লুকোচুরি (Next.js + three.js)
//  *
//  * ইনস্টল:  npm i three && npm i -D @types/three
//  * ফাইল:    app/page.tsx  (App Router)
//  *
//  * কন্ট্রোল:
//  *  W A S D  — চলা        Shift — দৌড়
//  *  মাউস     — চারদিকে দেখা  F — টর্চ
//  *  E        — আলমারিতে লুকানো / বের হওয়া
//  *  Space    — (লুকিয়ে থাকলে) দম বন্ধ রাখা
//  */

// import { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';

// /* ───────────────────────── constants & types ───────────────────────── */

// const CELL = 4;
// const N = 17; // odd number
// const WALL_H = 3.4;
// const TOTAL_KEYS = 3;
// const SPOT_I = 135;

// type Phase = 'menu' | 'playing' | 'dead' | 'won';
// type Mode = 'menu' | 'play' | 'dying' | 'over';
// type GhostState = 'patrol' | 'chase' | 'search';
// type Cell = [number, number];

// interface Wardrobe {
//   pos: THREE.Vector3;
//   front: THREE.Vector3;
// }

// interface Pickup {
//   mesh: THREE.Object3D;
//   x: number;
//   z: number;
//   kind: 'key' | 'battery';
// }

// interface Hud {
//   keys: number;
//   battery: number;
//   stamina: number;
//   breath: number;
//   hidden: boolean;
//   flashOn: boolean;
//   prompt: string;
//   msg: string;
//   fear: number;
// }

// const HUD0: Hud = {
//   keys: 0,
//   battery: 100,
//   stamina: 1,
//   breath: 1,
//   hidden: false,
//   flashOn: true,
//   prompt: '',
//   msg: '',
//   fear: 0,
// };

// const WHISPERS = [
//   'পেছনে কেউ আছে...',
//   'ও তোমাকে খুঁজছে...',
//   'নিঃশ্বাস আস্তে নাও...',
//   'কেউ ফিসফিস করে নাম ধরে ডাকল।',
//   'ও খুব কাছেই আছে।',
//   'আলমারির দরজাটা কি নড়ল?',
//   'লুকিয়ে পড়ো। এখনই।',
// ];

// /* ───────────────────────── helpers ───────────────────────── */

// const rand = (n: number) => Math.floor(Math.random() * n);
// const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// const manhattan = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

// function lerpAngle(a: number, b: number, t: number) {
//   const d = ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
//   return a + d * t;
// }

// function shuffle<T>(arr: T[]): T[] {
//   const a = arr.slice();
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = rand(i + 1);
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// /** recursive-backtracker maze, then knock a few walls to make loops */
// function generateMaze(n: number): number[][] {
//   const g: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
//   const stack: Cell[] = [[1, 1]];
//   g[1][1] = 0;
//   const dirs = [
//     [2, 0],
//     [-2, 0],
//     [0, 2],
//     [0, -2],
//   ];
//   while (stack.length) {
//     const [x, y] = stack[stack.length - 1];
//     const opts = dirs
//       .map(([dx, dy]) => [x + dx, y + dy, dx, dy])
//       .filter(([nx, ny]) => nx > 0 && ny > 0 && nx < n - 1 && ny < n - 1 && g[ny][nx] === 1);
//     if (!opts.length) {
//       stack.pop();
//       continue;
//     }
//     const [nx, ny, dx, dy] = opts[rand(opts.length)];
//     g[y + dy / 2][x + dx / 2] = 0;
//     g[ny][nx] = 0;
//     stack.push([nx, ny]);
//   }
//   for (let i = 0; i < n * 1.4; i++) {
//     const x = 1 + rand(n - 2);
//     const y = 1 + rand(n - 2);
//     if (g[y][x] === 1 && ((g[y][x - 1] === 0 && g[y][x + 1] === 0) || (g[y - 1][x] === 0 && g[y + 1][x] === 0))) {
//       g[y][x] = 0;
//     }
//   }
//   return g;
// }

// function bfs(g: number[][], s: Cell, t: Cell): Cell[] {
//   const key = (x: number, y: number) => y * N + x;
//   if (s[0] === t[0] && s[1] === t[1]) return [];
//   const prev = new Map<number, number>();
//   const q: Cell[] = [s];
//   prev.set(key(s[0], s[1]), -1);
//   while (q.length) {
//     const [x, y] = q.shift()!;
//     if (x === t[0] && y === t[1]) break;
//     for (const [dx, dy] of [
//       [1, 0],
//       [-1, 0],
//       [0, 1],
//       [0, -1],
//     ]) {
//       const nx = x + dx;
//       const ny = y + dy;
//       if (nx < 0 || ny < 0 || nx >= N || ny >= N || g[ny][nx] === 1 || prev.has(key(nx, ny))) continue;
//       prev.set(key(nx, ny), key(x, y));
//       q.push([nx, ny]);
//     }
//   }
//   if (!prev.has(key(t[0], t[1]))) return [];
//   const path: Cell[] = [];
//   let cur = key(t[0], t[1]);
//   const start = key(s[0], s[1]);
//   while (cur !== -1 && cur !== start) {
//     path.unshift([cur % N, Math.floor(cur / N)]);
//     cur = prev.get(cur)!;
//   }
//   return path;
// }

// function makeTexture(kind: 'wall' | 'floor' | 'ceil'): THREE.CanvasTexture {
//   const c = document.createElement('canvas');
//   c.width = c.height = 256;
//   const x = c.getContext('2d')!;
//   x.fillStyle = kind === 'wall' ? '#4d443c' : kind === 'floor' ? '#3b332c' : '#282119';
//   x.fillRect(0, 0, 256, 256);
//   for (let i = 0; i < 5500; i++) {
//     const v = (Math.random() * 45) | 0;
//     x.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.35})`;
//     x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
//   }
//   if (kind === 'wall') {
//     x.fillStyle = 'rgba(0,0,0,.2)';
//     for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 6, 256);
//     for (let i = 0; i < 5; i++) {
//       const px = Math.random() * 256;
//       const py = Math.random() * 120;
//       x.fillStyle = 'rgba(95,0,0,.55)';
//       x.fillRect(px, py, 2 + Math.random() * 3, 30 + Math.random() * 110);
//       x.beginPath();
//       x.arc(px + 1, py + 2, 4 + Math.random() * 5, 0, Math.PI * 2);
//       x.fill();
//     }
//     for (let i = 0; i < 4; i++) {
//       x.fillStyle = 'rgba(0,0,0,.35)';
//       x.beginPath();
//       x.arc(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 30, 0, Math.PI * 2);
//       x.fill();
//     }
//   } else if (kind === 'floor') {
//     x.fillStyle = 'rgba(0,0,0,.5)';
//     for (let i = 0; i < 256; i += 32) x.fillRect(0, i, 256, 2);
//     for (let r = 0; r < 8; r++) x.fillRect((r * 97) % 256, r * 32, 2, 32);
//     x.fillStyle = 'rgba(80,0,0,.35)';
//     for (let i = 0; i < 3; i++) {
//       x.beginPath();
//       x.ellipse(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 25, 6 + Math.random() * 14, Math.random() * 3, 0, Math.PI * 2);
//       x.fill();
//     }
//   }
//   const tex = new THREE.CanvasTexture(c);
//   tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//   tex.colorSpace = THREE.SRGBColorSpace;
//   return tex;
// }

// function buildGhost() {
//   const g = new THREE.Group();
//   const dark = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 1, emissive: 0x120000 });
//   const bone = new THREE.MeshStandardMaterial({ color: 0xd2cabb, roughness: 0.8, emissive: 0x1a1612 });
//   const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a });

//   const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.75, 2.3, 12), dark);
//   body.position.y = 1.35;
//   const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), bone);
//   head.scale.set(0.8, 1.35, 0.9);
//   head.position.y = 2.65;
//   const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
//   const eyeR = eyeL.clone();
//   eyeL.position.set(-0.1, 2.72, 0.22);
//   eyeR.position.set(0.1, 2.72, 0.22);
//   const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.04), new THREE.MeshBasicMaterial({ color: 0x050000 }));
//   mouth.position.set(0, 2.5, 0.23);
//   const armGeo = new THREE.CylinderGeometry(0.05, 0.035, 1.9, 6);
//   const armL = new THREE.Mesh(armGeo, dark);
//   const armR = new THREE.Mesh(armGeo, dark);
//   armL.position.set(-0.5, 1.5, 0.55);
//   armR.position.set(0.5, 1.5, 0.55);
//   armL.rotation.x = armR.rotation.x = Math.PI / 2 + 0.5;

//   const light = new THREE.PointLight(0xff2200, 10, 10, 2);
//   light.position.set(0, 2.4, 0.4);

//   g.add(body, head, eyeL, eyeR, mouth, armL, armR, light);
//   g.traverse((o) => {
//     o.castShadow = true;
//   });
//   return { group: g, light, eyeMat };
// }

// function buildWardrobe() {
//   const g = new THREE.Group();
//   const wood = new THREE.MeshStandardMaterial({ color: 0x33200f, roughness: 0.9 });
//   const black = new THREE.MeshStandardMaterial({ color: 0x050403 });
//   const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.9), wood);
//   body.position.y = 1.3;
//   const gap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.4, 0.02), black);
//   gap.position.set(0, 1.3, 0.46);
//   const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), black);
//   const h2 = h1.clone();
//   h1.position.set(-0.1, 1.3, 0.48);
//   h2.position.set(0.1, 1.3, 0.48);
//   const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.0), wood);
//   top.position.y = 2.62;
//   g.add(body, gap, h1, h2, top);
//   g.traverse((o) => {
//     o.castShadow = true;
//     o.receiveShadow = true;
//   });
//   return g;
// }

// function buildKey() {
//   const g = new THREE.Group();
//   const gold = new THREE.MeshStandardMaterial({ color: 0xd9a520, emissive: 0x996600, emissiveIntensity: 1.2, metalness: 0.8, roughness: 0.3 });
//   const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), gold);
//   ring.position.y = 0.25;
//   const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), gold);
//   shaft.position.y = -0.02;
//   const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), gold);
//   t1.position.set(0.08, -0.15, 0);
//   const t2 = t1.clone();
//   t2.position.set(0.06, -0.06, 0);
//   const glow = new THREE.Mesh(
//     new THREE.SphereGeometry(0.45, 12, 12),
//     new THREE.MeshBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.12, depthWrite: false })
//   );
//   g.add(ring, shaft, t1, t2, glow);
//   return g;
// }

// function buildBattery() {
//   const g = new THREE.Group();
//   const b = new THREE.Mesh(
//     new THREE.CylinderGeometry(0.1, 0.1, 0.34, 10),
//     new THREE.MeshStandardMaterial({ color: 0x33ff88, emissive: 0x0a7a3a, emissiveIntensity: 1.2 })
//   );
//   const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
//   cap.position.y = 0.2;
//   const glow = new THREE.Mesh(
//     new THREE.SphereGeometry(0.4, 10, 10),
//     new THREE.MeshBasicMaterial({ color: 0x33ff88, transparent: true, opacity: 0.09, depthWrite: false })
//   );
//   g.add(b, cap, glow);
//   return g;
// }

// /* ───────────────────────── styles ───────────────────────── */

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap');
// .hs-root{position:fixed;inset:0;background:#000;color:#e4dccd;font-family:'Hind Siliguri','Noto Sans Bengali','Kalpurush',system-ui,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none}
// .hs-canvas{position:absolute;inset:0}
// .hs-layer{position:absolute;inset:0;pointer-events:none}
// .hs-vig{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(0,0,0,.8) 100%);opacity:.55}
// .hs-danger{background:radial-gradient(ellipse at center,rgba(120,0,0,0) 38%,rgba(160,0,0,.8) 100%);opacity:0;mix-blend-mode:multiply}
// .hs-flash{background:#b00000;opacity:0}
// .hs-grain{opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");animation:hs-grain .5s steps(4) infinite}
// @keyframes hs-grain{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-2%)}100%{transform:translate(0,0)}}
// .hs-slit{background:linear-gradient(90deg,#030201 0,#030201 46.5%,rgba(3,2,1,.12) 47.5%,rgba(3,2,1,.12) 52.5%,#030201 53.5%,#030201 100%)}

// .hs-glass{background:rgba(18,15,14,.55);backdrop-filter:blur(14px) saturate(1.25);-webkit-backdrop-filter:blur(14px) saturate(1.25);border:1px solid rgba(233,225,211,.13);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.06)}

// .hs-hud{position:absolute;left:20px;top:20px;width:238px;padding:15px 17px;display:flex;flex-direction:column;gap:14px;pointer-events:none}
// .hs-row{display:flex;flex-direction:column;gap:6px}
// .hs-lab{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:#a79d8e}
// .hs-lab b{color:#f1e7d4;font-weight:600}
// .hs-keys{display:flex;gap:9px}
// .hs-key{width:24px;height:24px;border-radius:50%;border:2px solid rgba(242,185,91,.28);display:inline-block;transition:all .35s}
// .hs-key.on{background:radial-gradient(circle at 35% 30%,#ffe3a0,#d9a520);border-color:#ffd77a;box-shadow:0 0 14px rgba(242,185,91,.75)}
// .hs-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden}
// .hs-bar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#f2b95b,#ffe2a6);transition:width .15s}
// .hs-bar.stam>i{background:linear-gradient(90deg,#6fae88,#bde8cb)}
// .hs-bar.breath>i{background:linear-gradient(90deg,#5d86a0,#add4ea)}
// .hs-bar.low>i{background:linear-gradient(90deg,#8f1712,#e5483f)}

// .hs-map{position:absolute;right:20px;top:20px;padding:10px;pointer-events:none}
// .hs-map canvas{display:block;width:136px;height:136px;border-radius:8px;background:rgba(0,0,0,.35)}
// .hs-map small{display:block;margin-top:7px;font-size:12px;color:#8d8275;text-align:center}
// .hs-heart{position:absolute;right:20px;bottom:20px;padding:10px 17px;display:flex;align-items:center;gap:11px;font-size:15px;color:#d9cfbe;pointer-events:none}
// .hs-heart svg{width:22px;height:22px;fill:#e0463d;animation:hs-beat var(--d,1s) ease-in-out infinite}
// @keyframes hs-beat{0%,100%{transform:scale(1)}18%{transform:scale(1.28)}36%{transform:scale(1)}50%{transform:scale(1.16)}70%{transform:scale(1)}}
// .hs-cross{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(255,255,255,.4)}
// .hs-prompt{position:absolute;left:50%;bottom:17%;transform:translateX(-50%);padding:11px 24px;border-radius:99px;font-size:18px;color:#f8eedb;white-space:nowrap}
// .hs-msg{position:absolute;left:0;right:0;bottom:7%;text-align:center;padding:0 20px;font-size:clamp(18px,2.4vw,25px);color:#ddcdb4;text-shadow:0 0 10px #000,0 0 24px #6a0000}

// .hs-kbd{display:inline-block;min-width:30px;padding:1px 9px;text-align:center;border:1px solid rgba(233,225,211,.3);border-bottom-width:3px;border-radius:7px;background:rgba(255,255,255,.06);color:#f3e9d6;font-size:14px;line-height:1.5}
// .hs-rules{display:flex;flex-direction:column;gap:20px;font-size:16px;line-height:1.7;color:#cfc6b8;text-align:left}
// .hs-rules h3{margin:0 0 7px;font-size:18px;font-weight:600;color:#f2b95b}
// .hs-rules p{margin:0}
// .hs-rules ol,.hs-rules ul{margin:0;padding-left:22px}
// .hs-rules li{margin-bottom:6px}
// .hs-rules li::marker{color:#c9463c}
// .hs-ctrl{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;align-items:center}
// .hs-rulebox{padding:clamp(18px,3vw,32px);max-height:calc(100vh - 56px);overflow:auto}

// .hs-menu{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(24px,4vw,64px);align-items:center;padding:clamp(20px,5vw,72px);background:radial-gradient(ellipse at 15% 35%,rgba(110,12,12,.38),rgba(0,0,0,.82) 68%);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);overflow:auto}
// .hs-hero{display:flex;flex-direction:column;align-items:flex-start}
// .hs-title{font-family:'Tiro Bangla','Hind Siliguri',serif;font-weight:400;font-size:clamp(52px,9vw,112px);line-height:1.08;margin:0;color:#ece3d1;text-shadow:0 0 34px rgba(150,10,10,.75),0 2px 2px #000;animation:hs-flicker 6s infinite}
// @keyframes hs-flicker{0%,18%,22%,62%,64%,100%{opacity:1}20%{opacity:.4}63%{opacity:.65}}
// .hs-sub{margin:18px 0 0;font-size:clamp(17px,2vw,21px);color:#b5a999;max-width:540px;line-height:1.75}
// .hs-btn{margin-top:32px;padding:15px 44px;font:inherit;font-size:20px;font-weight:600;color:#fbf1de;background:linear-gradient(180deg,#c3322b,#8c1510);border:1px solid rgba(255,140,120,.35);border-radius:99px;cursor:pointer;box-shadow:0 8px 30px rgba(170,20,15,.45);transition:transform .15s,box-shadow .2s}
// .hs-btn:hover,.hs-btn:focus-visible{transform:translateY(-2px);box-shadow:0 12px 38px rgba(210,30,22,.6);outline:none}
// .hs-note{margin-top:22px;font-size:14.5px;color:#8d8275;max-width:480px;line-height:1.7}

// .hs-screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:radial-gradient(ellipse at center,rgba(0,0,0,.5),rgba(0,0,0,.93));backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);overflow:auto}
// .hs-screen .hs-hero{align-items:center}
// .hs-dead{color:#c4251c;text-shadow:0 0 36px #5a0000}
// .hs-won{color:#e8d58f;text-shadow:0 0 36px #5a4a00}
// .hs-pausecard{width:min(760px,100%)}
// @media (max-width:860px){.hs-menu{grid-template-columns:1fr;align-items:start}.hs-hud{width:200px}.hs-map canvas{width:104px;height:104px}}
// @media (prefers-reduced-motion:reduce){.hs-grain,.hs-title,.hs-heart svg{animation:none}}
// `;

// /* ───────────────────────── rules ───────────────────────── */

// function Rules() {
//   return (
//     <div className="hs-rules">
//       <div>
//         <h3>লক্ষ্য</h3>
//         <p>বাড়ির ভেতরে ছড়ানো তিনটি সোনালি চাবি জোগাড় করো, তারপর কোণের লাল দরজা খুলে পালাও।</p>
//       </div>
//       <div>
//         <h3>খেলার নিয়ম</h3>
//         <ol>
//           <li>বাড়িতে একটি ভুত ঘুরে বেড়ায়। সে তোমাকে দেখলে বা খুব কাছে এলে টের পেলে তাড়া করবে। ছুঁয়ে ফেললেই তুমি হেরে যাবে।</li>
//           <li>দৌড়ালে এবং টর্চ জ্বালা থাকলে ভুত দূর থেকে তোমাকে টের পায়। শক্তি ফুরিয়ে গেলে দৌড়ানো যায় না।</li>
//           <li>ভুতের চোখের আড়ালে গিয়ে আলমারিতে লুকাও। ও খুঁজতে এলে দম বন্ধ রাখো, তাহলে ধরা পড়ার সম্ভাবনা কমে। দম ফুরিয়ে গেলে ঝুঁকি আবার বাড়ে।</li>
//           <li>প্রতিটি চাবি তুললে আওয়াজে ভুত জেগে ওঠে, তোমার দিকে ছুটে আসে এবং আরও দ্রুত হয়ে যায়।</li>
//           <li>টর্চের ব্যাটারি ধীরে ধীরে কমে। সবুজ ব্যাটারি তুললে ৩৫% ভরে যায়।</li>
//           <li>তিনটি চাবি না থাকলে দরজা খুলবে না।</li>
//         </ol>
//       </div>
//       <div>
//         <h3>নিয়ন্ত্রণ</h3>
//         <div className="hs-ctrl">
//           <span><span className="hs-kbd">W</span> <span className="hs-kbd">A</span> <span className="hs-kbd">S</span> <span className="hs-kbd">D</span></span>
//           <span>হাঁটা</span>
//           <span className="hs-kbd">Shift</span>
//           <span>দৌড় (শক্তি খরচ হয়)</span>
//           <span className="hs-kbd">মাউস</span>
//           <span>চারপাশে তাকানো</span>
//           <span className="hs-kbd">F</span>
//           <span>টর্চ জ্বালানো বা নেভানো</span>
//           <span className="hs-kbd">E</span>
//           <span>আলমারিতে লুকানো, আবার বেরোনো</span>
//           <span className="hs-kbd">Space</span>
//           <span>লুকিয়ে থাকা অবস্থায় দম বন্ধ রাখা</span>
//           <span className="hs-kbd">Esc</span>
//           <span>খেলা থামানো</span>
//         </div>
//       </div>
//       <div>
//         <h3>কৌশল</h3>
//         <ul>
//           <li>ডানদিকের মানচিত্রে দেখা জায়গাগুলো দাগ পড়ে। সোনালি বিন্দু মানে আলমারি।</li>
//           <li>নিচের ডানদিকের হৃদস্পন্দন দ্রুত হলে বুঝবে ভুত কাছেই আছে।</li>
//           <li>মোড় ঘুরে ভুতের নজর ভাঙতে পারলে ও শেষ দেখা জায়গায় এসে খুঁজবে। তখনই লুকানোর সময়।</li>
//           <li>আলো নিভিয়ে ঘুরলে ধরা পড়ার সম্ভাবনা কমে, কিন্তু অন্ধকারে চাবি খোঁজা কঠিন।</li>
//         </ul>
//       </div>
//     </div>
//   );
// }

// /* ───────────────────────── component ───────────────────────── */

// export default function HorrorHideAndSeek() {
//   const mountRef = useRef<HTMLDivElement>(null);
//   const vigRef = useRef<HTMLDivElement>(null);
//   const dangerRef = useRef<HTMLDivElement>(null);
//   const flashRef = useRef<HTMLDivElement>(null);
//   const mapRef = useRef<HTMLCanvasElement>(null);
//   const apiRef = useRef<{ start: () => void; resume: () => void } | null>(null);

//   const [phase, setPhase] = useState<Phase>('menu');
//   const [hud, setHud] = useState<Hud>(HUD0);
//   const [locked, setLocked] = useState(false);
//   const [runId, setRunId] = useState(0);

//   useEffect(() => {
//     const mount = mountRef.current!;
//     const W = () => mount.clientWidth || window.innerWidth;
//     const H = () => mount.clientHeight || window.innerHeight;

//     /* ── renderer / scene ── */
//     const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
//     renderer.setSize(W(), H());
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     mount.appendChild(renderer.domElement);

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x05060a);
//     const fog = new THREE.FogExp2(0x07080d, 0.052);
//     scene.fog = fog;

//     const camera = new THREE.PerspectiveCamera(72, W() / H(), 0.1, 90);
//     camera.rotation.order = 'YXZ';
//     scene.add(camera);

//     scene.add(new THREE.AmbientLight(0x3c4058, 1.5));
//     scene.add(new THREE.HemisphereLight(0x6a74a0, 0x1d1511, 0.9));

//     const spot = new THREE.SpotLight(0xfff0d0, SPOT_I, 38, 0.64, 0.6, 1.1);
//     spot.position.set(0.15, -0.15, 0);
//     spot.target.position.set(0, 0, -6);
//     spot.castShadow = true;
//     spot.shadow.mapSize.set(1024, 1024);
//     spot.shadow.bias = -0.0004;
//     camera.add(spot);
//     camera.add(spot.target);

//     const aura = new THREE.PointLight(0xffd9a0, 4, 10, 1.6);
//     camera.add(aura);

//     /* ── world ── */
//     const grid = generateMaze(N);
//     const isWall = (x: number, z: number) => {
//       const cx = Math.floor(x / CELL);
//       const cz = Math.floor(z / CELL);
//       if (cx < 0 || cz < 0 || cx >= N || cz >= N) return true;
//       return grid[cz][cx] === 1;
//     };
//     const blocked = (x: number, z: number, r: number) =>
//       isWall(x - r, z - r) || isWall(x + r, z - r) || isWall(x - r, z + r) || isWall(x + r, z + r);
//     const los = (a: THREE.Vector3, b: THREE.Vector3) => {
//       const dx = b.x - a.x;
//       const dz = b.z - a.z;
//       const steps = Math.ceil(Math.hypot(dx, dz) / 0.6);
//       for (let i = 1; i < steps; i++) {
//         const k = i / steps;
//         if (isWall(a.x + dx * k, a.z + dz * k)) return false;
//       }
//       return true;
//     };
//     const center = (c: Cell) => new THREE.Vector3((c[0] + 0.5) * CELL, 0, (c[1] + 0.5) * CELL);

//     const wallTex = makeTexture('wall');
//     const floorTex = makeTexture('floor');
//     const ceilTex = makeTexture('ceil');
//     floorTex.repeat.set(N * 2, N * 2);
//     ceilTex.repeat.set(N * 2, N * 2);

//     const wallCount = grid.flat().filter((v) => v === 1).length;
//     const walls = new THREE.InstancedMesh(
//       new THREE.BoxGeometry(CELL, WALL_H, CELL),
//       new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 }),
//       wallCount
//     );
//     const m4 = new THREE.Matrix4();
//     let wi = 0;
//     for (let z = 0; z < N; z++) {
//       for (let x = 0; x < N; x++) {
//         if (grid[z][x] === 1) {
//           m4.setPosition((x + 0.5) * CELL, WALL_H / 2, (z + 0.5) * CELL);
//           walls.setMatrixAt(wi++, m4);
//         }
//       }
//     }
//     walls.castShadow = true;
//     walls.receiveShadow = true;
//     scene.add(walls);

//     const floor = new THREE.Mesh(new THREE.PlaneGeometry(N * CELL, N * CELL), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 }));
//     floor.rotation.x = -Math.PI / 2;
//     floor.position.set((N * CELL) / 2, 0, (N * CELL) / 2);
//     floor.receiveShadow = true;
//     scene.add(floor);
//     const ceil = new THREE.Mesh(new THREE.PlaneGeometry(N * CELL, N * CELL), new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 1 }));
//     ceil.rotation.x = Math.PI / 2;
//     ceil.position.set((N * CELL) / 2, WALL_H, (N * CELL) / 2);
//     scene.add(ceil);

//     /* ── placement ── */
//     const free: Cell[] = [];
//     for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) if (grid[z][x] === 0) free.push([x, z]);
//     const START: Cell = [1, 1];
//     const EXIT: Cell = [N - 2, N - 2];
//     const GHOST0: Cell = [9, 9];

//     const cand = shuffle(free.filter((c) => manhattan(c, START) >= 8 && manhattan(c, EXIT) > 2 && !(c[0] === GHOST0[0] && c[1] === GHOST0[1])));
//     const keyCells: Cell[] = [];
//     for (const c of cand) {
//       if (keyCells.length >= TOTAL_KEYS) break;
//       if (keyCells.every((k) => manhattan(k, c) >= 8)) keyCells.push(c);
//     }
//     while (keyCells.length < TOTAL_KEYS) {
//       const extra = cand.find((c) => !keyCells.includes(c));
//       if (!extra) break;
//       keyCells.push(extra);
//     }

//     const pickups: Pickup[] = [];
//     for (const c of keyCells) {
//       const m = buildKey();
//       const p = center(c);
//       m.position.set(p.x, 1.1, p.z);
//       scene.add(m);
//       pickups.push({ mesh: m, x: p.x, z: p.z, kind: 'key' });
//     }
//     for (const c of shuffle(free.filter((f) => manhattan(f, START) > 3 && !keyCells.includes(f))).slice(0, 4)) {
//       const m = buildBattery();
//       const p = center(c);
//       m.position.set(p.x, 0.9, p.z);
//       scene.add(m);
//       pickups.push({ mesh: m, x: p.x, z: p.z, kind: 'battery' });
//     }

//     const wardrobes: Wardrobe[] = [];
//     const dirs4 = [
//       [1, 0],
//       [-1, 0],
//       [0, 1],
//       [0, -1],
//     ];
//     for (const c of shuffle(free)) {
//       if (wardrobes.length >= 9) break;
//       if ((c[0] === START[0] && c[1] === START[1]) || (c[0] === EXIT[0] && c[1] === EXIT[1])) continue;
//       const wallDirs = dirs4.filter(([dx, dz]) => grid[c[1] + dz][c[0] + dx] === 1);
//       if (!wallDirs.length) continue;
//       const [dx, dz] = wallDirs[rand(wallDirs.length)];
//       const p = center(c);
//       const m = buildWardrobe();
//       m.position.set(p.x + dx * (CELL / 2 - 0.55), 0, p.z + dz * (CELL / 2 - 0.55));
//       m.rotation.y = Math.atan2(-dx, -dz);
//       scene.add(m);
//       wardrobes.push({ pos: new THREE.Vector3(m.position.x, 0, m.position.z), front: new THREE.Vector3(-dx, 0, -dz) });
//     }

//     // exit door on the east wall of the exit cell
//     const doorMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0x880000, emissiveIntensity: 1.4 });
//     const door = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3, 2.2), doorMat);
//     const exitC = center(EXIT);
//     door.position.set(exitC.x + CELL / 2 - 0.3, 1.5, exitC.z);
//     scene.add(door);
//     const doorPos = new THREE.Vector3(door.position.x, 0, door.position.z);

//     // warm lanterns for atmosphere
//     const lamps: THREE.PointLight[] = [];
//     const lampCells: Cell[] = [START, ...shuffle(free.filter((f) => manhattan(f, START) > 3)).slice(0, 4)];
//     for (const c of lampCells) {
//       const p = center(c);
//       const l = new THREE.PointLight(0xffb866, 9, 11, 1.6);
//       l.position.set(p.x, WALL_H - 0.5, p.z);
//       scene.add(l);
//       const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffc680 }));
//       bulb.position.copy(l.position);
//       scene.add(bulb);
//       lamps.push(l);
//     }

//     /* ── ghost ── */
//     const gh = buildGhost();
//     const g0 = center(GHOST0);
//     gh.group.position.set(g0.x, 0.1, g0.z);
//     scene.add(gh.group);
//     const ghost = {
//       state: 'patrol' as GhostState,
//       path: [] as Cell[],
//       target: GHOST0 as Cell,
//       repath: 0,
//       lose: 0,
//       searchT: 0,
//       findT: 0,
//       rollT: 0,
//       stepT: 0,
//       bonus: 0,
//     };

//     /* ── player & state ── */
//     const pos = center(START);
//     const st = {
//       mode: 'menu' as Mode,
//       locked: false,
//       yaw: grid[1][2] === 0 ? -Math.PI / 2 : Math.PI,
//       pitch: 0,
//       baseYaw: 0,
//       time: 0,
//       keys: 0,
//       battery: 100,
//       stamina: 1,
//       breath: 1,
//       flashOn: true,
//       hidden: false,
//       holding: false,
//       sprinting: false,
//       spot: null as Wardrobe | null,
//       fear: 0,
//       bob: 0,
//       stepT: 0,
//       hbT: 1,
//       msg: '',
//       msgUntil: 0,
//       whisperT: 15 + Math.random() * 12,
//       blackoutT: 22 + Math.random() * 20,
//       blackout: 0,
//       dying: 0,
//       doorMsgT: 0,
//       flash: 0,
//     };
//     const keys: Record<string, boolean> = {};
//     const showMsg = (text: string, sec = 3) => {
//       st.msg = text;
//       st.msgUntil = st.time + sec;
//     };

//     /* ── audio ── */
//     let ac: AudioContext | null = null;
//     let master: GainNode | null = null;
//     let noiseBuf: AudioBuffer | null = null;

//     const initAudio = () => {
//       if (ac) {
//         void ac.resume();
//         return;
//       }
//       const a = new AudioContext();
//       const m = a.createGain();
//       m.gain.value = 0.85;
//       m.connect(a.destination);
//       ac = a;
//       master = m;
//       const nb = a.createBuffer(1, a.sampleRate, a.sampleRate);
//       const d = nb.getChannelData(0);
//       for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
//       noiseBuf = nb;
//       [38, 40.6, 57].forEach((f, i) => {
//         const o = a.createOscillator();
//         o.type = i === 2 ? 'triangle' : 'sine';
//         o.frequency.value = f;
//         const g = a.createGain();
//         g.gain.value = i === 2 ? 0.02 : 0.07;
//         o.connect(g);
//         g.connect(m);
//         o.start();
//       });
//       const wind = a.createBufferSource();
//       wind.buffer = nb;
//       wind.loop = true;
//       const lp = a.createBiquadFilter();
//       lp.type = 'lowpass';
//       lp.frequency.value = 240;
//       const wg = a.createGain();
//       wg.gain.value = 0.05;
//       wind.connect(lp);
//       lp.connect(wg);
//       wg.connect(m);
//       wind.start();
//     };

//     const tone = (f: number, dur: number, type: OscillatorType, vol: number, to?: number, delay = 0) => {
//       if (!ac || !master) return;
//       const t0 = ac.currentTime + delay;
//       const o = ac.createOscillator();
//       const g = ac.createGain();
//       o.type = type;
//       o.frequency.setValueAtTime(f, t0);
//       if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
//       g.gain.setValueAtTime(0.0001, t0);
//       g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.012);
//       g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
//       o.connect(g);
//       g.connect(master);
//       o.start(t0);
//       o.stop(t0 + dur + 0.05);
//     };
//     const noise = (dur: number, vol: number, freq: number, type: BiquadFilterType = 'lowpass', delay = 0) => {
//       if (!ac || !master || !noiseBuf) return;
//       const t0 = ac.currentTime + delay;
//       const s = ac.createBufferSource();
//       s.buffer = noiseBuf;
//       const f = ac.createBiquadFilter();
//       f.type = type;
//       f.frequency.value = freq;
//       const g = ac.createGain();
//       g.gain.setValueAtTime(0.0001, t0);
//       g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.02);
//       g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
//       s.connect(f);
//       f.connect(g);
//       g.connect(master);
//       s.start(t0, Math.random() * 0.4, dur);
//     };
//     const sfx = {
//       step: () => noise(0.08, 0.06, 500),
//       ghostStep: (near: number) => {
//         noise(0.14, 0.05 + near * 0.5, 170);
//         tone(62, 0.16, 'sine', 0.03 + near * 0.4, 40);
//       },
//       beat: (v: number) => {
//         tone(55, 0.14, 'sine', v, 38);
//         tone(46, 0.17, 'sine', v * 0.8, 34, 0.17);
//       },
//       chime: () => {
//         tone(880, 0.55, 'sine', 0.16);
//         tone(1320, 0.65, 'sine', 0.1, undefined, 0.09);
//       },
//       click: () => noise(0.04, 0.18, 2200, 'highpass'),
//       creak: () => {
//         tone(130, 0.9, 'sawtooth', 0.05, 70);
//         noise(0.7, 0.05, 900, 'bandpass');
//       },
//       whisper: () => noise(1.8, 0.07, 2400, 'bandpass'),
//       roar: () => {
//         tone(95, 0.9, 'sawtooth', 0.3, 45);
//         noise(0.8, 0.25, 700);
//       },
//       scare: () => {
//         tone(110, 1.3, 'sawtooth', 0.55, 720);
//         tone(1500, 1.0, 'square', 0.12, 280);
//         noise(1.4, 0.6, 2000);
//       },
//     };

//     /* ── game actions ── */
//     const nearestWardrobe = (r: number) => {
//       let best: Wardrobe | null = null;
//       let bd = r;
//       for (const w of wardrobes) {
//         const d = Math.hypot(w.pos.x - pos.x, w.pos.z - pos.z);
//         if (d < bd) {
//           bd = d;
//           best = w;
//         }
//       }
//       return best;
//     };

//     const interact = () => {
//       if (st.mode !== 'play' || !st.locked) return;
//       if (st.hidden && st.spot) {
//         const w = st.spot;
//         st.hidden = false;
//         pos.set(w.pos.x + w.front.x * 1.5, 0, w.pos.z + w.front.z * 1.5);
//         st.yaw = Math.atan2(-w.front.x, -w.front.z);
//         st.pitch = 0;
//         st.spot = null;
//         sfx.creak();
//         return;
//       }
//       const w = nearestWardrobe(2.4);
//       if (w) {
//         st.hidden = true;
//         st.spot = w;
//         st.baseYaw = Math.atan2(-w.front.x, -w.front.z);
//         st.yaw = st.baseYaw;
//         st.pitch = 0;
//         st.sprinting = false;
//         ghost.findT = 0;
//         ghost.rollT = 0;
//         sfx.creak();
//         showMsg('নিঃশ্বাস চেপে রাখো...', 2.5);
//       }
//     };

//     const caught = () => {
//       if (st.mode !== 'play') return;
//       st.mode = 'dying';
//       st.dying = 1.6;
//       const fwd = new THREE.Vector3(-Math.sin(st.yaw), 0, -Math.cos(st.yaw));
//       if (st.hidden && st.spot) {
//         pos.set(st.spot.pos.x, 0, st.spot.pos.z);
//       }
//       st.hidden = false;
//       gh.group.position.set(pos.x + fwd.x * 1.15, 0.05, pos.z + fwd.z * 1.15);
//       gh.group.rotation.y = Math.atan2(-fwd.x, -fwd.z);
//       st.pitch = 0.5;
//       st.flash = 1;
//       sfx.scare();
//     };

//     /* ── ghost AI ── */
//     const tmp = new THREE.Vector3();
//     const updateGhost = (dt: number, t: number) => {
//       const gp = gh.group.position;
//       const dx = pos.x - gp.x;
//       const dz = pos.z - gp.z;
//       const d = Math.hypot(dx, dz);
//       let sees = false;
//       if (!st.hidden) {
//         const range = (st.sprinting ? 15 : 9) + (st.flashOn && st.battery > 0 ? 4 : 0);
//         if (d < range && los(gp, pos)) sees = true;
//         if (d < 3.2) sees = true;
//       }
//       const pc: Cell = [Math.floor(pos.x / CELL), Math.floor(pos.z / CELL)];
//       const gc: Cell = [Math.floor(gp.x / CELL), Math.floor(gp.z / CELL)];

//       if (sees) {
//         if (ghost.state !== 'chase') {
//           sfx.roar();
//           showMsg('ও তোমাকে দেখে ফেলেছে!', 2.2);
//         }
//         ghost.state = 'chase';
//         ghost.target = pc;
//         ghost.lose = 0;
//       } else if (ghost.state === 'chase') {
//         ghost.lose += dt;
//         if (ghost.lose > 2.5) {
//           ghost.state = 'search';
//           ghost.searchT = 0;
//           ghost.path = [];
//           ghost.repath = 0;
//         }
//       }

//       ghost.repath -= dt;
//       let speed = 1.8 + ghost.bonus * 0.5;
//       if (ghost.state === 'chase') speed = 3.2 + ghost.bonus;
//       if (ghost.state === 'search') speed = 2.4 + ghost.bonus * 0.5;

//       let moving = false;
//       tmp.set(0, 0, 0);

//       if (ghost.state === 'chase' && sees && d < 6) {
//         tmp.set(dx, 0, dz).normalize();
//         moving = true;
//       } else {
//         if (ghost.state === 'patrol' && ghost.path.length === 0) {
//           let c: Cell;
//           const near = free.filter((f) => manhattan(f, pc) <= 8);
//           c = Math.random() < 0.45 && near.length ? near[rand(near.length)] : free[rand(free.length)];
//           ghost.target = c;
//           ghost.path = bfs(grid, gc, c);
//         } else if (ghost.state !== 'patrol' && ghost.repath <= 0) {
//           ghost.path = bfs(grid, gc, ghost.target);
//           ghost.repath = 0.4;
//         }
//         if (ghost.path.length) {
//           const wp = ghost.path[0];
//           const wx = (wp[0] + 0.5) * CELL - gp.x;
//           const wz = (wp[1] + 0.5) * CELL - gp.z;
//           const len = Math.hypot(wx, wz);
//           if (len < 0.3) ghost.path.shift();
//           else {
//             tmp.set(wx / len, 0, wz / len);
//             moving = true;
//           }
//         } else if (ghost.state === 'search') {
//           ghost.searchT += dt;
//           gh.group.rotation.y += Math.sin(t * 1.7) * dt * 1.4;
//           if (ghost.searchT > 7) {
//             ghost.state = 'patrol';
//             ghost.path = [];
//           }
//         }
//       }

//       if (moving) {
//         gp.x += tmp.x * speed * dt;
//         gp.z += tmp.z * speed * dt;
//         gh.group.rotation.y = lerpAngle(gh.group.rotation.y, Math.atan2(tmp.x, tmp.z), Math.min(1, dt * 7));
//         ghost.stepT -= dt;
//         if (ghost.stepT <= 0) {
//           ghost.stepT = ghost.state === 'chase' ? 0.42 : 0.72;
//           sfx.ghostStep(clamp(1 - d / 20, 0, 1));
//         }
//       }
//       gp.y = 0.08 + Math.sin(t * 2.2) * 0.07;
//       gh.light.intensity = (ghost.state === 'chase' ? 16 : 8) + Math.sin(t * 9) * 2;
//       gh.eyeMat.color.setHex(ghost.state === 'chase' ? 0xff3030 : 0xaa1111);

//       // searching near the hiding spot
//       if (st.hidden && st.spot && ghost.state === 'search' && ghost.path.length === 0) {
//         const wd = Math.hypot(st.spot.pos.x - gp.x, st.spot.pos.z - gp.z);
//         if (wd < 5) {
//           ghost.findT += dt;
//           if (ghost.findT > 2) {
//             ghost.rollT += dt;
//             if (ghost.rollT >= 1) {
//               ghost.rollT = 0;
//               const chance = st.holding ? 0.03 : 0.16;
//               if (Math.random() < chance) caught();
//             }
//           }
//         }
//       }

//       if (!st.hidden && d < 1.15) caught();
//       return d;
//     };

//     /* ── minimap (fog of war) ── */
//     const seen: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));
//     const drawMap = () => {
//       const cv = mapRef.current;
//       if (!cv) return;
//       const S = 8;
//       if (cv.width !== N * S) {
//         cv.width = N * S;
//         cv.height = N * S;
//       }
//       const c2 = cv.getContext('2d');
//       if (!c2) return;
//       const pcx = Math.floor(pos.x / CELL);
//       const pcz = Math.floor(pos.z / CELL);
//       for (let dz = -2; dz <= 2; dz++) {
//         for (let dx = -2; dx <= 2; dx++) {
//           const cx = pcx + dx;
//           const cz = pcz + dz;
//           if (cx < 0 || cz < 0 || cx >= N || cz >= N) continue;
//           if (los(pos, center([cx, cz]))) seen[cz][cx] = true;
//         }
//       }
//       c2.clearRect(0, 0, cv.width, cv.height);
//       for (let z = 0; z < N; z++) {
//         for (let x = 0; x < N; x++) {
//           if (!seen[z][x]) continue;
//           c2.fillStyle = grid[z][x] === 1 ? 'rgba(210,198,176,.42)' : 'rgba(255,240,210,.10)';
//           c2.fillRect(x * S, z * S, S, S);
//         }
//       }
//       for (const w of wardrobes) {
//         if (seen[Math.floor(w.pos.z / CELL)][Math.floor(w.pos.x / CELL)]) {
//           c2.fillStyle = '#f2b95b';
//           c2.fillRect((w.pos.x / CELL) * S - 2, (w.pos.z / CELL) * S - 2, 4, 4);
//         }
//       }
//       if (seen[EXIT[1]][EXIT[0]]) {
//         c2.fillStyle = st.keys >= TOTAL_KEYS ? '#4ade80' : '#c9463c';
//         c2.fillRect(EXIT[0] * S + 1, EXIT[1] * S + 1, S - 2, S - 2);
//       }
//       c2.save();
//       c2.translate((pos.x / CELL) * S, (pos.z / CELL) * S);
//       c2.rotate(-st.yaw);
//       c2.fillStyle = '#ffffff';
//       c2.beginPath();
//       c2.moveTo(0, -5);
//       c2.lineTo(3.5, 4);
//       c2.lineTo(0, 2);
//       c2.lineTo(-3.5, 4);
//       c2.closePath();
//       c2.fill();
//       c2.restore();
//     };

//     /* ── main update ── */
//     const fwd = new THREE.Vector3();
//     const rgt = new THREE.Vector3();
//     let hudT = 0;

//     const update = (dt: number, t: number) => {
//       st.time += dt;

//       // look limits when hidden
//       if (st.hidden) {
//         st.yaw = clamp(st.yaw, st.baseYaw - 0.6, st.baseYaw + 0.6);
//         st.pitch = clamp(st.pitch, -0.35, 0.35);
//       } else {
//         st.pitch = clamp(st.pitch, -1.35, 1.35);
//       }

//       let moving = false;
//       if (!st.hidden) {
//         fwd.set(-Math.sin(st.yaw), 0, -Math.cos(st.yaw));
//         rgt.set(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
//         let mx = 0;
//         let mz = 0;
//         if (keys['KeyW']) {
//           mx += fwd.x;
//           mz += fwd.z;
//         }
//         if (keys['KeyS']) {
//           mx -= fwd.x;
//           mz -= fwd.z;
//         }
//         if (keys['KeyD']) {
//           mx += rgt.x;
//           mz += rgt.z;
//         }
//         if (keys['KeyA']) {
//           mx -= rgt.x;
//           mz -= rgt.z;
//         }
//         const len = Math.hypot(mx, mz);
//         moving = len > 0.01;
//         st.sprinting = moving && (keys['ShiftLeft'] || keys['ShiftRight']) && st.stamina > 0.04;
//         if (st.sprinting) st.stamina = Math.max(0, st.stamina - dt / 4.5);
//         else st.stamina = Math.min(1, st.stamina + dt / 7);
//         if (moving) {
//           const sp = st.sprinting ? 5.2 : 3.1;
//           const sx = (mx / len) * sp * dt;
//           const sz = (mz / len) * sp * dt;
//           const r = 0.3;
//           if (!blocked(pos.x + sx, pos.z, r)) pos.x += sx;
//           if (!blocked(pos.x, pos.z + sz, r)) pos.z += sz;
//           for (const w of wardrobes) {
//             const ddx = pos.x - w.pos.x;
//             const ddz = pos.z - w.pos.z;
//             const dd = Math.hypot(ddx, ddz);
//             if (dd < 0.95 && dd > 0.001) {
//               pos.x += (ddx / dd) * (0.95 - dd);
//               pos.z += (ddz / dd) * (0.95 - dd);
//             }
//           }
//           st.bob += dt * (st.sprinting ? 11 : 7);
//           st.stepT -= dt;
//           if (st.stepT <= 0) {
//             st.stepT = st.sprinting ? 0.3 : 0.52;
//             sfx.step();
//           }
//         }
//       } else {
//         st.sprinting = false;
//       }

//       // breath
//       if (st.hidden && keys['Space'] && st.breath > 0) {
//         st.holding = true;
//         st.breath = Math.max(0, st.breath - dt / 6);
//       } else {
//         st.holding = false;
//         st.breath = Math.min(1, st.breath + dt / 9);
//       }

//       // flashlight
//       if (st.flashOn && st.battery > 0 && !st.hidden) st.battery = Math.max(0, st.battery - dt * 0.7);
//       st.blackout = Math.max(0, st.blackout - dt);

//       // ghost
//       const gd = updateGhost(dt, t);
//       const gp = gh.group.position;
//       const target = clamp((19 - gd) / 15, 0, 1) * (ghost.state === 'chase' ? 1 : 0.75) + (ghost.state === 'chase' ? 0.15 : 0);
//       st.fear += (clamp(target, 0, 1) - st.fear) * Math.min(1, dt * 2.5);
//       const fear = st.fear;

//       // flashlight intensity with horror flicker
//       let fl = st.flashOn && st.battery > 0 && !st.hidden ? 1 : 0;
//       if (fl) {
//         if (st.battery < 25 && Math.random() < 0.15) fl = Math.random() * 0.5;
//         if (fear > 0.5 && Math.random() < (fear - 0.35) * 0.22) fl = 0.05;
//         if (st.blackout > 0) fl = Math.random() < 0.2 ? 0.4 : 0;
//       }
//       spot.intensity = SPOT_I * fl;
//       aura.intensity = st.blackout > 0 ? 0.4 : 4;
//       lamps.forEach((l, i) => {
//         l.intensity = (st.blackout > 0 ? 1 : 9) * (0.88 + 0.12 * Math.sin(t * (3 + i) + i * 2)) * (Math.random() < 0.02 ? 0.4 : 1);
//       });

//       // pickups
//       for (let i = pickups.length - 1; i >= 0; i--) {
//         const p = pickups[i];
//         p.mesh.rotation.y += dt * 1.6;
//         p.mesh.position.y = (p.kind === 'key' ? 1.1 : 0.9) + Math.sin(t * 2 + i) * 0.08;
//         if (!st.hidden && Math.hypot(p.x - pos.x, p.z - pos.z) < 1.4) {
//           scene.remove(p.mesh);
//           pickups.splice(i, 1);
//           sfx.chime();
//           if (p.kind === 'key') {
//             st.keys++;
//             ghost.bonus += 0.25;
//             ghost.state = 'search';
//             ghost.target = [Math.floor(pos.x / CELL), Math.floor(pos.z / CELL)];
//             ghost.path = [];
//             ghost.repath = 0;
//             ghost.searchT = 0;
//             showMsg(st.keys >= TOTAL_KEYS ? 'সব চাবি পেয়েছ! দরজার দিকে ছোটো — ও জেগে উঠেছে!' : `চাবি ${st.keys}/${TOTAL_KEYS} — আওয়াজে ও জেগে উঠেছে...`, 3.5);
//             if (st.keys >= TOTAL_KEYS) {
//               doorMat.color.setHex(0x002200);
//               doorMat.emissive.setHex(0x22cc55);
//             }
//           } else {
//             st.battery = Math.min(100, st.battery + 35);
//             showMsg('ব্যাটারি পাওয়া গেল।', 2);
//           }
//         }
//       }

//       // exit door
//       const dd = Math.hypot(doorPos.x - pos.x, doorPos.z - pos.z);
//       st.doorMsgT -= dt;
//       if (!st.hidden && dd < 2.4) {
//         if (st.keys >= TOTAL_KEYS) {
//           st.mode = 'over';
//           document.exitPointerLock();
//           setPhase('won');
//         } else if (st.doorMsgT <= 0) {
//           st.doorMsgT = 2.5;
//           showMsg(`দরজা তালাবন্ধ। আরও ${TOTAL_KEYS - st.keys}টি চাবি লাগবে।`, 2.5);
//         }
//       }

//       // random scares
//       st.whisperT -= dt;
//       if (st.whisperT <= 0) {
//         st.whisperT = 18 + Math.random() * 22;
//         showMsg(WHISPERS[rand(WHISPERS.length)], 3.2);
//         sfx.whisper();
//       }
//       st.blackoutT -= dt;
//       if (st.blackoutT <= 0) {
//         st.blackoutT = 28 + Math.random() * 30;
//         st.blackout = 1.3;
//         sfx.creak();
//       }

//       // heartbeat
//       st.hbT -= dt;
//       if (st.hbT <= 0 && fear > 0.1) {
//         sfx.beat(0.1 + fear * 0.55);
//         st.hbT = lerp(1.15, 0.36, fear);
//       } else if (st.hbT <= 0) {
//         st.hbT = 0.5;
//       }

//       // camera
//       const shake = fear > 0.55 ? (fear - 0.55) * 0.07 : 0;
//       if (st.hidden && st.spot) {
//         camera.position.set(st.spot.pos.x, 1.55, st.spot.pos.z);
//       } else {
//         camera.position.set(pos.x, 1.65 + (moving ? Math.sin(st.bob) * 0.05 : 0), pos.z);
//       }
//       camera.position.x += (Math.random() - 0.5) * shake;
//       camera.position.y += (Math.random() - 0.5) * shake;
//       camera.rotation.set(st.pitch, st.yaw, 0);
//       const fov = 72 + fear * 7 + (st.sprinting ? 5 : 0);
//       if (Math.abs(camera.fov - fov) > 0.05) {
//         camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 6));
//         camera.updateProjectionMatrix();
//       }
//       fog.density = 0.052 + fear * 0.025;

//       // overlays
//       if (vigRef.current) vigRef.current.style.opacity = String(0.5 + fear * 0.35);
//       if (dangerRef.current) dangerRef.current.style.opacity = String(clamp(fear * 0.9, 0, 1));
//       if (flashRef.current) flashRef.current.style.opacity = '0';

//       // HUD
//       hudT += dt;
//       if (hudT > 0.1) {
//         hudT = 0;
//         drawMap();
//         let prompt = '';
//         if (st.hidden) prompt = 'E — বেরিয়ে আসো     Space — দম বন্ধ রাখো';
//         else if (nearestWardrobe(2.4)) prompt = 'E — আলমারিতে লুকাও';
//         setHud({
//           keys: st.keys,
//           battery: st.battery,
//           stamina: st.stamina,
//           breath: st.breath,
//           hidden: st.hidden,
//           flashOn: st.flashOn,
//           prompt,
//           msg: st.time < st.msgUntil ? st.msg : '',
//           fear: st.fear,
//         });
//       }
//       void gp;
//     };

//     const updateDying = (dt: number, t: number) => {
//       st.dying -= dt;
//       const gp = gh.group.position;
//       camera.position.set(pos.x + (Math.random() - 0.5) * 0.08, 1.65 + (Math.random() - 0.5) * 0.08, pos.z + (Math.random() - 0.5) * 0.08);
//       st.pitch = lerp(st.pitch, 0.42, Math.min(1, dt * 8));
//       camera.rotation.set(st.pitch, st.yaw + (Math.random() - 0.5) * 0.05, 0);
//       gh.group.scale.setScalar(1 + (1.6 - st.dying) * 0.1);
//       gp.y = 0.05;
//       gh.light.intensity = 25 + Math.random() * 20;
//       gh.eyeMat.color.setHex(Math.random() < 0.5 ? 0xff0000 : 0xffffff);
//       spot.intensity = Math.random() < 0.5 ? SPOT_I : 0;
//       st.flash = Math.max(0, st.flash - dt * 0.6);
//       if (flashRef.current) flashRef.current.style.opacity = String(st.flash * 0.7);
//       if (dangerRef.current) dangerRef.current.style.opacity = '1';
//       void t;
//       if (st.dying <= 0) {
//         st.mode = 'over';
//         document.exitPointerLock();
//         setPhase('dead');
//       }
//     };

//     /* ── loop ── */
//     const clock = new THREE.Clock();
//     let raf = 0;
//     const tick = () => {
//       raf = requestAnimationFrame(tick);
//       const dt = Math.min(clock.getDelta(), 0.05);
//       const t = clock.elapsedTime;
//       if (st.mode === 'play' && st.locked) update(dt, t);
//       else if (st.mode === 'dying') updateDying(dt, t);
//       else if (st.mode === 'menu') {
//         // slow drifting camera in the menu
//         camera.position.set(pos.x, 1.65, pos.z);
//         camera.rotation.set(0, st.yaw + Math.sin(t * 0.3) * 0.25, 0);
//         spot.intensity = 110 + Math.sin(t * 7) * 8 * (Math.random() < 0.1 ? 3 : 0);
//       }
//       renderer.render(scene, camera);
//     };
//     camera.position.set(pos.x, 1.65, pos.z);
//     tick();

//     /* ── events ── */
//     const onMouse = (e: MouseEvent) => {
//       if (!st.locked || st.mode !== 'play') return;
//       st.yaw -= e.movementX * 0.0022;
//       st.pitch -= e.movementY * 0.0022;
//     };
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.code === 'Space') e.preventDefault();
//       if (e.repeat) return;
//       keys[e.code] = true;
//       if (e.code === 'KeyE') interact();
//       if (e.code === 'KeyF' && st.mode === 'play' && st.locked && !st.hidden) {
//         st.flashOn = !st.flashOn;
//         sfx.click();
//       }
//     };
//     const onKeyUp = (e: KeyboardEvent) => {
//       keys[e.code] = false;
//     };
//     const onLock = () => {
//       const l = document.pointerLockElement === renderer.domElement;
//       st.locked = l;
//       setLocked(l);
//       if (ac) {
//         if (l) void ac.resume();
//         else if (st.mode === 'play') void ac.suspend();
//       }
//     };
//     const onResize = () => {
//       renderer.setSize(W(), H());
//       camera.aspect = W() / H();
//       camera.updateProjectionMatrix();
//     };
//     document.addEventListener('mousemove', onMouse);
//     window.addEventListener('keydown', onKeyDown);
//     window.addEventListener('keyup', onKeyUp);
//     document.addEventListener('pointerlockchange', onLock);
//     window.addEventListener('resize', onResize);

//     apiRef.current = {
//       start: () => {
//         initAudio();
//         st.mode = 'play';
//         showMsg('চাবি খুঁজে বের করো। ও এখানেই আছে...', 4);
//         void renderer.domElement.requestPointerLock();
//       },
//       resume: () => {
//         void renderer.domElement.requestPointerLock();
//       },
//     };

//     /* ── cleanup ── */
//     return () => {
//       cancelAnimationFrame(raf);
//       document.removeEventListener('mousemove', onMouse);
//       window.removeEventListener('keydown', onKeyDown);
//       window.removeEventListener('keyup', onKeyUp);
//       document.removeEventListener('pointerlockchange', onLock);
//       window.removeEventListener('resize', onResize);
//       if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
//       scene.traverse((o) => {
//         const m = o as THREE.Mesh;
//         if (m.geometry) m.geometry.dispose();
//         const mat = m.material as THREE.Material | THREE.Material[] | undefined;
//         if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
//         else if (mat) mat.dispose();
//       });
//       wallTex.dispose();
//       floorTex.dispose();
//       ceilTex.dispose();
//       renderer.dispose();
//       if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
//       if (ac) void ac.close();
//       apiRef.current = null;
//     };
//   }, [runId]);

//   const startGame = () => {
//     apiRef.current?.start();
//     setHud(HUD0);
//     setPhase('playing');
//   };
//   const retry = () => {
//     setHud(HUD0);
//     setLocked(false);
//     setRunId((r) => r + 1);
//     setPhase('menu');
//   };

//   const bpm = Math.round(68 + hud.fear * 100);

//   return (
//     <div className="hs-root">
//       <style>{CSS}</style>
//       <div ref={mountRef} className="hs-canvas" />

//       <div ref={vigRef} className="hs-layer hs-vig" />
//       <div ref={dangerRef} className="hs-layer hs-danger" />
//       <div className="hs-layer hs-grain" />
//       {hud.hidden && phase === 'playing' && <div className="hs-layer hs-slit" />}
//       <div ref={flashRef} className="hs-layer hs-flash" />

//       {phase === 'playing' && (
//         <>
//           <div className="hs-hud hs-glass">
//             <div className="hs-row">
//               <div className="hs-lab">
//                 <span>চাবি</span>
//                 <b>
//                   {hud.keys}/{TOTAL_KEYS}
//                 </b>
//               </div>
//               <div className="hs-keys">
//                 {Array.from({ length: TOTAL_KEYS }).map((_, i) => (
//                   <span key={i} className={'hs-key' + (i < hud.keys ? ' on' : '')} />
//                 ))}
//               </div>
//             </div>
//             <div className="hs-row">
//               <div className="hs-lab">
//                 <span>টর্চ {hud.flashOn ? '' : '(বন্ধ)'}</span>
//                 <b>{Math.round(hud.battery)}%</b>
//               </div>
//               <div className={'hs-bar' + (hud.battery < 25 ? ' low' : '')}>
//                 <i style={{ width: `${hud.battery}%` }} />
//               </div>
//             </div>
//             <div className="hs-row">
//               <div className="hs-lab">
//                 <span>শক্তি</span>
//               </div>
//               <div className={'hs-bar stam' + (hud.stamina < 0.2 ? ' low' : '')}>
//                 <i style={{ width: `${hud.stamina * 100}%` }} />
//               </div>
//             </div>
//             {hud.hidden && (
//               <div className="hs-row">
//                 <div className="hs-lab">
//                   <span>দম</span>
//                 </div>
//                 <div className="hs-bar breath">
//                   <i style={{ width: `${hud.breath * 100}%` }} />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="hs-map hs-glass">
//             <canvas ref={mapRef} />
//             <small>মানচিত্র</small>
//           </div>

//           <div className="hs-heart hs-glass" style={{ ['--d' as string]: `${(60 / bpm).toFixed(2)}s` }}>
//             <svg viewBox="0 0 24 24" aria-hidden="true">
//               <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.8 6.3 4.8c2 0 3.6 1.1 4.5 2.6.3.5.9.5 1.2 0 .9-1.5 2.5-2.6 4.5-2.6 3.6 0 5.4 3.6 3.9 7C19.5 16.4 12 21 12 21z" />
//             </svg>
//             <span>{bpm} স্পন্দন</span>
//           </div>

//           <div className="hs-cross" />
//           {hud.prompt && <div className="hs-prompt hs-glass">{hud.prompt}</div>}
//           {hud.msg && <div className="hs-msg">{hud.msg}</div>}
//         </>
//       )}

//       {phase === 'menu' && (
//         <div className="hs-menu">
//           <div className="hs-hero">
//             <h1 className="hs-title">
//               পলান টুক
//               <br />
//               অন্ধকার
//             </h1>
//             <p className="hs-sub">
//               পুরোনো এক বাড়ি। তিনটি চাবি খুঁজে দরজা খুলে পালাতে হবে। কিন্তু বাড়িটা একা নয়। ও-ও লুকোচুরি খেলছে, আর এবার খুঁজে বের করার পালা ওর।
//             </p>
//             <button className="hs-btn" onClick={startGame}>
//               খেলা শুরু করো
//             </button>
//             <p className="hs-note">কিবোর্ড ও মাউস লাগবে, তাই ডেস্কটপ ব্রাউজারে খেলো। হেডফোন পরলে ভয় পাওয়ার মজা বেশি।</p>
//           </div>
//           <div className="hs-rulebox hs-glass">
//             <Rules />
//           </div>
//         </div>
//       )}

//       {phase === 'playing' && !locked && (
//         <div className="hs-screen">
//           <div className="hs-pausecard hs-glass hs-rulebox">
//             <h2 className="hs-title" style={{ fontSize: 'clamp(30px,5vw,48px)', animation: 'none', marginBottom: 18 }}>
//               খেলা থেমে আছে
//             </h2>
//             <Rules />
//             <div style={{ textAlign: 'center' }}>
//               <button className="hs-btn" onClick={() => apiRef.current?.resume()}>
//                 অন্ধকারে ফিরে যাও
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {phase === 'dead' && (
//         <div className="hs-screen">
//           <div className="hs-hero">
//             <h2 className="hs-title hs-dead">ও তোমাকে খুঁজে পেয়েছে</h2>
//             <p className="hs-sub">এবার আরেকটু ভালো জায়গায় লুকিয়ে দেখো। দম বন্ধ রাখতে ভুলো না।</p>
//             <button className="hs-btn" onClick={retry}>
//               আবার চেষ্টা করো
//             </button>
//           </div>
//         </div>
//       )}

//       {phase === 'won' && (
//         <div className="hs-screen">
//           <div className="hs-hero">
//             <h2 className="hs-title hs-won">তুমি পালিয়ে এসেছ</h2>
//             <p className="hs-sub">দরজা বন্ধ হওয়ার আগে পেছনে একবার ফিসফিস শোনা গেল: &ldquo;আবার খেলবে?&rdquo;</p>
//             <button className="hs-btn" onClick={retry}>
//               নতুন বাড়িতে খেলো
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
