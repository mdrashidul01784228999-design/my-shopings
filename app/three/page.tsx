'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// দরকার: three r151+ (mergeGeometries)। পুরনো ভার্সনে এটা mergeBufferGeometries নামে ছিল।
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ============================ টাইপ ও ধ্রুবক ============================ */
type Product = { id: string; name: string; price: number; image: string; kind: string; color: number };
type Sel = Product & { shop: string };
type CartItem = Sel & { count: number };
type Shop = { id: string; name: string; subtitle: string; x: number; z: number; accent: number; style: string; products: Product[] };
type Profile = { name: string; photo: string };
type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
type Slot = { x: number; y: number; z: number; ry: number; s: number };

const MAX_SHOPS = 120;
const LS_KEY = 'grand-mall-ls-v2';

/* দৈনিক টাস্ক: প্রতিদিন সর্বোচ্চ ৪টি, প্রতিটিতে পয়েন্ট; সবগুলো শেষ করলে বোনাস */
const TASKS: { id: string; title: string; pts: number }[] = [
  { id: 'shop', title: 'যেকোনো একটি দোকানে প্রবেশ করুন', pts: 200 },
  { id: 'view', title: 'একটি পণ্যে ক্লিক করে বিস্তারিত দেখুন', pts: 100 },
  { id: 'cart', title: 'কার্টে একটি পণ্য যোগ করুন', pts: 150 },
  { id: 'ride', title: 'বাইকে চড়ুন', pts: 150 },
];
const BONUS = 300;
const todayKey = () => new Date().toLocaleDateString('en-CA');

const KINDS: [string, string][] = [
  ['tshirt', 'টি-শার্ট'], ['jacket', 'জ্যাকেট'], ['sneaker', 'জুতা'], ['glasses', 'সানগ্লাস'],
  ['bag', 'ব্যাগ'], ['watch', 'ঘড়ি'], ['phone', 'ফোন'], ['camera', 'ক্যামেরা'],
  ['headphone', 'হেডফোন'], ['chair', 'চেয়ার'], ['lamp', 'ল্যাম্প'], ['plant', 'গাছ'],
  ['book', 'বই'], ['jar', 'মধু/জার'], ['chocolate', 'চকলেট'], ['sack', 'চালের বস্তা'],
  ['coffee', 'কফি'], ['bottle', 'বোতল'], ['box', 'গিফট বক্স'], ['frame', 'ছবির ফ্রেম'],
];

/* শেলফ ও টেবিলের স্লট — একটি দোকানে সর্বোচ্চ MAX_PRODUCTS টি পণ্য */
const SHELF_Y = [0.8, 2.0, 3.2, 4.4];
const TABLE_X = [-5.3, -1.8, 1.8, 5.3], TABLE_Z = [-3.5, 2.2];
const SLOTS: Slot[] = (() => {
  const a: Slot[] = [];
  TABLE_Z.forEach((z) => TABLE_X.forEach((x) => a.push({ x, y: 1.66, z, ry: 0, s: 1.35 })));
  for (const ti of [1, 2, 0, 3]) {
    const y = SHELF_Y[ti] + 0.04;
    for (let i = 0; i < 12; i++) {
      const z = -7.9 + i;
      a.push({ x: -8, y, z, ry: Math.PI / 2, s: 1 }, { x: 8, y, z, ry: -Math.PI / 2, s: 1 });
    }
    for (let i = 0; i < 13; i++) a.push({ x: -7.2 + i * 1.2, y, z: -9.1, ry: 0, s: 1 });
  }
  return a;
})();
const MAX_PRODUCTS = SLOTS.length;

const shopSlot = (k: number) => ({ x: k % 2 ? 17 : -17, z: -14 - Math.floor(k / 2) * 19 });
const nextSlots = (shops: Shop[], n: number) => {
  const used = new Set(shops.map((s) => `${s.x},${s.z}`));
  const out: { x: number; z: number }[] = [];
  for (let k = 0; k < MAX_SHOPS && out.length < n; k++) { const p = shopSlot(k); if (!used.has(`${p.x},${p.z}`)) out.push(p); }
  return out;
};

/* ============================ ডেমো ডেটা জেনারেটর ============================ */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const taka = (n: number) => '৳' + n.toLocaleString();
const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
const IMG: Record<string, string> = {
  tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
  sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
  headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
  lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
  sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
  bag: u('photo-1584917865442-de89df76afd3'), plant: u('photo-1485955900006-10f4d324d411'), book: u('photo-1544716278-ca5e3f4abd8c'),
  bottle: u('photo-1600271886742-f049cd451bba'), box: u('photo-1513885535751-8b9238bd345a'), frame: u('photo-1513519245088-0e12902e5a38'),
};
const STYLE_KINDS: Record<string, string[]> = {
  fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
  tech: ['phone', 'watch', 'camera', 'headphone'],
  home: ['chair', 'lamp', 'plant', 'book', 'jar'],
  market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
};
const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };

/* ছবি লোড না হলে ফলব্যাক: ইমোজি নয়, নামসহ রঙিন কার্ড */
const ph = (kind: string, c = 0x334155, label?: string) => {
  const t = (label ?? BASE[kind] ?? 'Product').replace(/[<>&]/g, '');
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hex(c)}"/><stop offset="1" stop-color="#0b1220"/></linearGradient></defs>
      <rect width="600" height="500" fill="url(#g)"/>
      <text x="300" y="270" font-family="Arial" font-weight="800" font-size="52" fill="#fff" text-anchor="middle">${t}</text>
    </svg>`);
};

const ADJ = ['Classic', 'Premium', 'Urban', 'Royal', 'Eco', 'Ultra', 'Smart', 'Modern', 'Elite', 'Fresh'];
const PAL = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9, 0x14b8a6, 0xf97316, 0x64748b, 0x1e293b, 0xf1f5f9];
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const genProducts = (style: string, n: number, seed: number, pre: string): Product[] => {
  const r = rng(seed), kinds = STYLE_KINDS[style] ?? STYLE_KINDS.market;
  return Array.from({ length: Math.min(n, MAX_PRODUCTS) }, (_, i) => {
    const kind = kinds[i % kinds.length], color = PAL[Math.floor(r() * PAL.length)];
    const price = Math.round((BASEP[kind] * (0.6 + r() * 1.2)) / 10) * 10;
    return { id: `${pre}${i}`, name: `${ADJ[Math.floor(r() * ADJ.length)]} ${BASE[kind]} ${i + 1}`, price, image: IMG[kind] ?? ph(kind, color), kind, color };
  });
};
const SHOP_A = ['NOVA', 'ZEN', 'ROYAL', 'URBAN', 'PRIME', 'LUXE', 'SKY', 'METRO', 'ALPHA', 'BLUE', 'GOLDEN', 'SMART', 'FRESH', 'MEGA', 'ELITE'];
const SHOP_B: Record<string, string> = { fashion: 'FASHION', tech: 'TECH', home: 'HOME', market: 'MART' };
const SHOP_SUB: Record<string, string> = { fashion: 'Premium Fashion', tech: 'Smart Devices', home: 'Furniture & Decor', market: 'Grocery & Food' };
const genShop = (i: number, slot: { x: number; z: number }, nProducts: number): Shop => {
  const style = Object.keys(STYLE_KINDS)[i % 4], r = rng(i * 977 + 13);
  return { id: `d${i}-${Date.now().toString(36)}`, name: `${SHOP_A[Math.floor(r() * SHOP_A.length)]} ${SHOP_B[style]} ${i + 1}`, subtitle: SHOP_SUB[style], ...slot, accent: PAL[(i * 5 + 1) % (PAL.length - 1)], style, products: genProducts(style, nProducts, i * 31 + 7, `d${i}p`) };
};
const defaultShops = (): Shop[] => {
  const mk = (id: string, name: string, subtitle: string, k: number, accent: number, style: string, first: Product[]): Shop =>
    ({ id, name, subtitle, ...shopSlot(k), accent, style, products: [...first, ...genProducts(style, 36, k * 11 + 3, id + '_g')] });
  const p = (id: string, name: string, price: number, kind: string, color: number): Product => ({ id, name, price, image: IMG[kind] ?? ph(kind, color), kind, color });
  return [
    mk('fashion', 'NOVA FASHION', 'Premium Fashion', 0, 0x7c3aed, 'fashion', [p('f1', 'Premium T-Shirt', 1800, 'tshirt', 0x2563eb), p('f2', 'Urban Jacket', 5200, 'jacket', 0x1e293b), p('f3', 'Classic Sunglasses', 2400, 'glasses', 0x111827), p('f4', 'Running Sneaker', 4200, 'sneaker', 0xef4444)]),
    mk('tech', 'TECHHUB', 'Smart Devices', 1, 0x0891b2, 'tech', [p('t1', 'Smart Watch', 4500, 'watch', 0x1e293b), p('t2', 'Mirrorless Camera', 62000, 'camera', 0xcbd5e1), p('t3', 'Wireless Headphones', 6800, 'headphone', 0x111827), p('t4', 'Flagship Phone', 92000, 'phone', 0x64748b)]),
    mk('home', 'URBAN HOME', 'Furniture & Decor', 2, 0xd97706, 'home', [p('h1', 'Designer Chair', 8500, 'chair', 0xd97706), p('h2', 'Modern Table Lamp', 3200, 'lamp', 0xfacc15)]),
    mk('market', 'FRESH MART', 'Grocery & Food', 3, 0x16a34a, 'market', [p('m1', 'Organic Honey', 950, 'jar', 0xd9901a), p('m2', 'Imported Chocolate', 1500, 'chocolate', 0x7c3aed), p('m3', 'Premium Rice 10KG', 1800, 'sack', 0xf1f5f9), p('m4', 'Fresh Coffee', 1250, 'coffee', 0x1e293b)]),
  ];
};

/* ============================ JSON ইমপোর্ট (দোকান ও পণ্য ডাইনামিক) ============================ */
type RawProduct = { id?: string | number; name?: string; price?: number | string; image?: string; kind?: string; color?: string | number };
type RawShop = { name?: string; subtitle?: string; style?: string; accent?: string | number; products?: RawProduct[] };
const toNum = (v: unknown, d: number) => {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') { const m = v.trim().replace('#', '').replace(/^0x/i, ''); if (/^[0-9a-f]{6}$/i.test(m)) return parseInt(m, 16); }
  return d;
};
const SAMPLE_JSON = JSON.stringify([
  { name: 'DEMO STORE', subtitle: 'JSON থেকে তৈরি', style: 'fashion', accent: '#e11d48', products: [
    { name: 'ডেনিম জ্যাকেট', price: 3200, kind: 'jacket', color: '#2563eb', image: IMG.jacket },
    { name: 'স্পোর্টস জুতা', price: 2800, kind: 'sneaker', color: '#ef4444', image: IMG.sneaker },
    { name: 'নিজের ছবির পণ্য', price: 999, image: 'https://example.com/apnar-chobi.jpg' },
  ] },
  { name: 'BOOK CORNER', subtitle: 'বই ও খাতা', style: 'home', accent: '#0ea5e9', products: [
    { name: 'গল্পের বই', price: 450, kind: 'book', image: IMG.book },
    { name: 'টেবিল ল্যাম্প', price: 1800, kind: 'lamp', image: IMG.lamp },
  ] },
], null, 2);

/* raw JSON → Shop[]। একই নামের দোকান থাকলে সেখানে পণ্য যোগ হয়, না থাকলে নতুন দোকান */
const normalizeShops = (raw: unknown, existing: Shop[], replace: boolean) => {
  const wrapped = raw && typeof raw === 'object' ? (raw as { shops?: unknown }).shops : undefined;
  const list = Array.isArray(raw) ? raw : Array.isArray(wrapped) ? wrapped : null;
  if (!list) throw new Error('JSON অবশ্যই দোকানের অ্যারে [ {...}, {...} ] হতে হবে');
  const base: Shop[] = replace ? [] : [...existing];
  const stamp = Date.now().toString(36);
  let added = 0, products = 0;
  (list as RawShop[]).forEach((r, si) => {
    if (!r || typeof r !== 'object') return;
    const name = String(r.name ?? '').trim().toUpperCase().slice(0, 18);
    if (!name) return;
    let idx = base.findIndex((x) => x.name === name), shop: Shop;
    if (idx >= 0) { shop = { ...base[idx], products: [...base[idx].products] }; base[idx] = shop; }
    else {
      if (base.length >= MAX_SHOPS) return;
      const slot = nextSlots(base, 1)[0]; if (!slot) return;
      const style = r.style && STYLE_KINDS[r.style] ? r.style : 'market';
      shop = { id: `j${stamp}${si}`, name, subtitle: String(r.subtitle ?? SHOP_SUB[style]).slice(0, 32), ...slot, accent: toNum(r.accent, PAL[(base.length * 5 + 1) % (PAL.length - 1)]), style, products: [] };
      idx = base.push(shop) - 1; added++;
    }
    const kinds = STYLE_KINDS[shop.style] ?? STYLE_KINDS.market;
    (Array.isArray(r.products) ? r.products : []).forEach((p, pi) => {
      if (!p || typeof p !== 'object' || shop.products.length >= MAX_PRODUCTS) return;
      const pname = String(p.name ?? '').trim(), price = Number(p.price);
      if (!pname || !(price > 0)) return;
      const kind = p.kind && KINDS.some(([k]) => k === p.kind) ? p.kind : kinds[pi % kinds.length];
      const color = toNum(p.color, PAL[pi % PAL.length]);
      const image = typeof p.image === 'string' && p.image.trim() ? p.image.trim() : IMG[kind] ?? ph(kind, color, pname);
      shop.products.push({ id: `${shop.id}_${p.id ?? `p${shop.products.length}`}_${stamp}${pi}`, name: pname.slice(0, 40), price, image, kind, color });
      products++;
    });
  });
  return { shops: base, added, products };
};

/* ============================ IndexedDB (বড় ডেটার জন্য) ============================ */
const openDB = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open('grand-mall', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const kv = {
  async get(k: string): Promise<unknown> {
    try { const db = await openDB(); return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; }
  },
  async set(k: string, v: unknown) {
    try { const db = await openDB(); await new Promise<void>((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); } catch { /* ignore */ }
  },
};

const fileToDataUrl = (file: File, max: number) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error('read'));
    r.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('img'));
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });

/* ============================ শেয়ার্ড ক্যাশ (জিওমেট্রি / ম্যাটেরিয়াল / টেক্সচার) ============================ */
const GC = new Map<string, THREE.BufferGeometry>();
const G = (k: string, f: () => THREE.BufferGeometry) => { let g = GC.get(k); if (!g) { g = f(); g.userData.keep = true; GC.set(k, g); } return g; };
const bx = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
const cy = (a: number, b: number, h: number, s = 16) => G(`c${a}_${b}_${h}_${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
const sp = (r: number, w = 14, h = 10) => G(`s${r}_${w}_${h}`, () => new THREE.SphereGeometry(r, w, h));
const to = (r: number, t: number, arc = Math.PI * 2) => G(`t${r}_${t}_${arc}`, () => new THREE.TorusGeometry(r, t, 8, 22, arc));
const cp = (r: number, l: number) => G(`p${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
const pl = (w: number, h: number) => G(`pl${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

const MC = new Map<string, THREE.MeshStandardMaterial>();
const M = (c: number, r = 0.6, m = 0.1, e = 0, ei = 0) => {
  const k = `${c}|${r}|${m}|${e}|${ei}`; let x = MC.get(k);
  if (!x) { x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.keep = true; MC.set(k, x); }
  return x;
};
const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const TXC = new Map<string, THREE.CanvasTexture>();
const tileTex = (a: string, b: string, rx: number, ry: number) => {
  const k = `${a}${b}${rx}${ry}`; let t = TXC.get(k);
  if (!t) {
    t = canvasTex(256, 256, (x) => { x.fillStyle = a; x.fillRect(0, 0, 256, 256); x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128); x.strokeStyle = 'rgba(0,0,0,.12)'; x.strokeRect(0, 0, 256, 256); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.userData.keep = true; TXC.set(k, t);
  }
  return t;
};
const slatTex = () => {
  let t = TXC.get('slat');
  if (!t) {
    t = canvasTex(256, 64, (x) => { x.fillStyle = '#1f1710'; x.fillRect(0, 0, 256, 64); for (let k = 0; k < 16; k++) { x.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; x.fillRect(k * 16, 0, 11, 64); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.userData.keep = true; TXC.set('slat', t);
  }
  return t;
};
const signTexture = (title: string, sub: string, accent: number) => canvasTex(1024, 280, (x) => {
  x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280); x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
  x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center'; x.fillText(title, 512, 125, 960);
  x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial'; x.fillText(sub, 512, 190, 960);
});

const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
  const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); p.add(k); return k;
};
const tone = (c: number, k: number) => {
  const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
};
const disposeTree = (root: THREE.Object3D) => root.traverse((o) => {
  const m = o as THREE.Mesh;
  if (m.geometry && !(o as THREE.Sprite).isSprite && !m.geometry.userData.keep) m.geometry.dispose();
  const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
  mats.forEach((mm) => {
    if (mm.userData.keep) return;
    const mp = (mm as THREE.MeshBasicMaterial).map;
    if (mp && !mp.userData.keep) mp.dispose();
    mm.dispose();
  });
});

/* পণ্যের ছবির কার্ড — একই ছবির জন্য একটাই ম্যাটেরিয়াল/টেক্সচার (শেয়ার্ড) */
const PHC = new Map<string, THREE.MeshBasicMaterial>();
const photoMat = (p: { image: string; kind: string; color: number; name: string }, tl: THREE.TextureLoader) => {
  const key = p.image || p.kind + p.color;
  let m = PHC.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ toneMapped: false });
    m.userData.keep = true;
    const setT = (t: THREE.Texture) => { t.colorSpace = THREE.SRGBColorSpace; t.userData.keep = true; m!.map = t; m!.needsUpdate = true; };
    tl.load(p.image || ph(p.kind, p.color, p.name), setT, undefined, () => tl.load(ph(p.kind, p.color, p.name), setT));
    PHC.set(key, m);
  }
  return m;
};

/* মডেল নম্বর (পণ্যের আইডি থেকে স্থির নম্বর) ও নাম/দাম/মডেল লেবেল */
const modelNo = (p: { id: string; kind: string }) => {
  let h = 7; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return `${p.kind.slice(0, 2).toUpperCase()}-${1000 + h}`;
};
const LBC = new Map<string, THREE.MeshBasicMaterial>();
const labelMat = (p: { id: string; name: string; price: number; kind: string; color: number }) => {
  const key = `${p.id}|${p.name}|${p.price}`;
  let m = LBC.get(key);
  if (!m) {
    const t = canvasTex(512, 256, (x) => {
      const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#16213a'); gr.addColorStop(1, '#070d1a');
      x.fillStyle = gr; x.fillRect(0, 0, 512, 256);
      x.fillStyle = hex(p.color); x.fillRect(0, 0, 512, 10);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#fff'; x.font = '800 54px Arial'; x.fillText(p.name, 256, 72, 480);
      x.fillStyle = '#facc15'; x.font = '900 76px Arial'; x.fillText(taka(p.price), 256, 156, 480);
      x.fillStyle = '#94a3b8'; x.font = '600 34px Arial'; x.fillText('Model: ' + modelNo(p), 256, 220, 480);
    });
    t.userData.keep = true;
    m = new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); m.userData.keep = true; LBC.set(key, m);
  }
  return m;
};

/* ============================ ৩D পণ্য (প্রসিডিউরাল মডেল) ============================ */
const shirtGeo = (jacket: boolean) => G(jacket ? 'jacket' : 'tshirt', () => {
  const pts: [number, number][] = jacket
    ? [[-.27, 0], [.27, 0], [.27, .4], [.4, .1], [.58, .16], [.46, .62], [.16, .78], [.1, .72], [-.1, .72], [-.16, .78], [-.46, .62], [-.58, .16], [-.4, .1], [-.27, .4]]
    : [[-.24, 0], [.24, 0], [.24, .42], [.46, .34], [.54, .54], [.3, .74], [.12, .74], [.07, .64], [-.07, .64], [-.12, .74], [-.3, .74], [-.54, .54], [-.46, .34], [-.24, .42]];
  const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
  const d = jacket ? 0.12 : 0.08;
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
});

function buildProduct(kind: string, color: number, image: string, tl: THREE.TextureLoader): THREE.Group {
  const g = new THREE.Group();
  const c = M(color, 0.5, 0.05), c2 = M(tone(color, 0.35), 0.5, 0.05), cd = M(tone(color, -0.35), 0.5, 0.05);
  const dk = M(0x111827, 0.4, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), wh = M(0xf8fafc, 0.5, 0), gold = M(0xfacc15, 0.3, 0.8), wood = M(0x6b4a2e, 0.6, 0.05);
  const scr = M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.7), green = M(0x1f8a4c, 0.8, 0), green2 = M(0x2f9e44, 0.8, 0);
  const H = Math.PI / 2;
  switch (kind) {
    case 'tshirt':
      add(g, shirtGeo(false), c); add(g, bx(0.5, 0.04, 0.085), c2, 0, 0.14, 0);
      add(g, cy(0.07, 0.07, 0.012, 14), wh, 0.12, 0.47, 0.045, 1, 1, 1, H); break;
    case 'jacket':
      add(g, shirtGeo(true), c); add(g, bx(0.03, 0.76, 0.125), dk, 0, 0.38, 0);
      for (const s of [-1, 1]) add(g, bx(0.14, 0.03, 0.13), dk, s * 0.15, 0.2, 0);
      add(g, bx(0.1, 0.05, 0.13), cd, 0, 0.74, 0); break;
    case 'sneaker':
      add(g, bx(0.36, 0.07, 0.86), wh, 0, 0.035, 0);
      add(g, bx(0.32, 0.3, 0.4), c, 0, 0.22, -0.2); add(g, sp(0.17), c, 0, 0.17, 0.2, 1, 0.85, 1.7);
      add(g, bx(0.22, 0.14, 0.32), c2, 0, 0.32, 0.02); add(g, bx(0.335, 0.06, 0.45), cd, 0, 0.14, -0.05);
      for (const z of [-0.04, 0.06, 0.16]) add(g, bx(0.2, 0.025, 0.05), wh, 0, 0.4 - z * 0.3, z);
      break;
    case 'glasses': {
      const lens = M(tone(color, -0.3), 0.05, 0.9);
      for (const s of [-1, 1]) { add(g, to(0.17, 0.022), dk, s * 0.22, 0.2, 0); add(g, cy(0.165, 0.165, 0.012, 20), lens, s * 0.22, 0.2, 0, 1, 1, 1, H); add(g, bx(0.025, 0.025, 0.5), dk, s * 0.4, 0.26, -0.25); }
      add(g, bx(0.1, 0.025, 0.03), dk, 0, 0.26, 0); break;
    }
    case 'watch':
      add(g, cy(0.14, 0.17, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.03, 0.03, 0.2, 10), mt, 0, 0.12, 0);
      add(g, to(0.2, 0.05), c, 0, 0.38, 0, 1, 1.1, 0.6); add(g, cy(0.17, 0.17, 0.07, 24), mt, 0, 0.38, 0, 1, 1, 1, H);
      add(g, cy(0.145, 0.145, 0.078, 24), scr, 0, 0.38, 0, 1, 1, 1, H); add(g, cy(0.02, 0.02, 0.06, 8), mt, 0.19, 0.42, 0, 1, 1, 1, 0, 0, H);
      add(g, bx(0.02, 0.1, 0.01), wh, 0, 0.42, 0.042); add(g, bx(0.07, 0.02, 0.01), wh, 0.03, 0.38, 0.042); break;
    case 'phone': {
      const t = new THREE.Group(); t.position.y = 0.42; t.rotation.x = -0.1; g.add(t);
      add(t, bx(0.36, 0.74, 0.045), c, 0, 0, 0); add(t, bx(0.33, 0.7, 0.01), scr, 0, 0, 0.024);
      add(t, bx(0.13, 0.13, 0.02), dk, -0.08, 0.27, -0.03); add(t, cy(0.035, 0.035, 0.02, 12), M(0x38bdf8, 0.1, 0.9), -0.08, 0.27, -0.045, 1, 1, 1, H);
      add(t, bx(0.12, 0.012, 0.012), wh, 0, 0.3, 0.032); add(g, bx(0.2, 0.05, 0.1), mt, 0, 0.025, -0.02); break;
    }
    case 'camera':
      add(g, bx(0.7, 0.38, 0.3), dk, 0, 0.25, 0); add(g, bx(0.7, 0.12, 0.31), mt, 0, 0.44, 0); add(g, bx(0.2, 0.1, 0.2), dk, -0.1, 0.55, 0);
      add(g, cy(0.17, 0.17, 0.24, 22), dk, 0.03, 0.25, 0.25, 1, 1, 1, H); add(g, cy(0.18, 0.18, 0.04, 22), mt, 0.03, 0.25, 0.2, 1, 1, 1, H);
      add(g, cy(0.12, 0.12, 0.02, 22), M(0x1e3a8a, 0.05, 0.9, 0x1e40af, 0.4), 0.03, 0.25, 0.375, 1, 1, 1, H);
      add(g, bx(0.18, 0.32, 0.12), dk, -0.26, 0.22, 0.14); add(g, cy(0.04, 0.04, 0.04, 10), c, 0.26, 0.5, 0); break;
    case 'headphone':
      add(g, cy(0.17, 0.19, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.035, 0.035, 0.3, 10), mt, 0, 0.17, 0);
      add(g, to(0.3, 0.035, Math.PI), c, 0, 0.36, 0);
      for (const s of [-1, 1]) { add(g, cy(0.13, 0.13, 0.1, 18), c, s * 0.32, 0.36, 0, 1, 1, 1, 0, 0, H); add(g, cy(0.11, 0.11, 0.05, 18), dk, s * 0.26, 0.36, 0, 1, 1, 1, 0, 0, H); }
      break;
    case 'chair':
      add(g, bx(0.55, 0.07, 0.55), wood, 0, 0.5, 0); add(g, bx(0.5, 0.1, 0.5), c, 0, 0.58, 0); add(g, bx(0.52, 0.5, 0.07), c, 0, 0.88, -0.25, 1, 1, 1, -0.12);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, cy(0.03, 0.022, 0.5, 8), wood, sx * 0.23, 0.25, sz * 0.23);
      break;
    case 'lamp':
      add(g, cy(0.16, 0.19, 0.04, 20), dk, 0, 0.02, 0); add(g, cy(0.022, 0.022, 0.55, 8), gold, 0, 0.3, 0);
      add(g, cy(0.16, 0.3, 0.34, 24), M(tone(color, 0.5), 0.7, 0, color, 0.55), 0, 0.72, 0); add(g, sp(0.07), M(0xfff3c4, 0.3, 0, 0xffe08a, 2), 0, 0.68, 0); break;
    case 'plant':
      add(g, cy(0.2, 0.15, 0.3, 16), c, 0, 0.15, 0); add(g, cy(0.2, 0.2, 0.03, 16), dk, 0, 0.3, 0);
      add(g, sp(0.22), green, 0, 0.5, 0); add(g, sp(0.16), green2, 0.16, 0.42, 0.05); add(g, sp(0.17), green2, -0.15, 0.44, -0.05); add(g, sp(0.14), green, 0, 0.7, 0); break;
    case 'book':
      add(g, bx(0.5, 0.12, 0.38), c, 0, 0.06, 0); add(g, bx(0.46, 0.08, 0.36), wh, 0.02, 0.06, 0.005);
      add(g, bx(0.46, 0.1, 0.34), c2, 0.02, 0.17, 0, 1, 1, 1, 0, 0.15); add(g, bx(0.5, 0.012, 0.1), gold, 0, 0.13, 0.15); break;
    case 'jar':
      add(g, cy(0.2, 0.2, 0.38, 20), M(0xd9901a, 0.12, 0.1, 0x7a4a00, 0.25), 0, 0.22, 0); add(g, cy(0.21, 0.21, 0.08, 20), gold, 0, 0.45, 0);
      add(g, cy(0.205, 0.205, 0.17, 20), M(0xfdf3d8, 0.7, 0), 0, 0.22, 0); add(g, cy(0.1, 0.1, 0.01, 6), M(0xd9901a, 0.5, 0), 0, 0.22, 0.205, 1, 1, 1, H); break;
    case 'chocolate':
      add(g, bx(0.5, 0.72, 0.09), c, 0, 0.37, 0); add(g, bx(0.52, 0.14, 0.1), gold, 0, 0.52, 0); add(g, bx(0.3, 0.26, 0.01), wh, 0, 0.26, 0.05); add(g, bx(0.2, 0.05, 0.012), c, 0, 0.26, 0.056); break;
    case 'sack':
      add(g, bx(0.5, 0.66, 0.26), M(0xefe6cf, 0.9, 0), 0, 0.34, 0); add(g, bx(0.52, 0.2, 0.27), c, 0, 0.38, 0); add(g, cp(0.05, 0.12), M(0xefe6cf, 0.9, 0), 0, 0.74, 0, 1, 1, 1, 0, 0, H);
      add(g, bx(0.28, 0.1, 0.01), wh, 0, 0.38, 0.14); break;
    case 'coffee':
      add(g, bx(0.42, 0.62, 0.2), dk, 0, 0.32, 0); add(g, bx(0.43, 0.22, 0.21), c, 0, 0.34, 0); add(g, bx(0.42, 0.06, 0.22), M(0x2b2f3a, 0.6, 0.1), 0, 0.65, 0);
      add(g, cy(0.04, 0.04, 0.02, 12), wh, 0, 0.52, 0.105, 1, 1, 1, H); add(g, bx(0.2, 0.05, 0.01), gold, 0, 0.34, 0.11); break;
    case 'bottle':
      add(g, cy(0.13, 0.13, 0.46, 18), M(color, 0.12, 0.1), 0, 0.24, 0); add(g, cy(0.05, 0.12, 0.14, 14), M(color, 0.12, 0.1), 0, 0.54, 0); add(g, cy(0.05, 0.05, 0.16, 12), M(color, 0.12, 0.1), 0, 0.66, 0);
      add(g, cy(0.055, 0.055, 0.06, 12), gold, 0, 0.76, 0); add(g, cy(0.135, 0.135, 0.2, 18), wh, 0, 0.24, 0); break;
    case 'bag':
      add(g, bx(0.58, 0.4, 0.22), c, 0, 0.22, 0); add(g, bx(0.59, 0.14, 0.24), cd, 0, 0.41, 0); add(g, to(0.17, 0.02, Math.PI), dk, 0, 0.46, 0); add(g, bx(0.08, 0.08, 0.02), gold, 0, 0.38, 0.125); break;
    case 'frame': {
      const tex = tl.load(image || ph('frame')); tex.colorSpace = THREE.SRGBColorSpace;
      add(g, bx(0.72, 0.57, 0.05), wood, 0, 0.36, 0); add(g, pl(0.6, 0.45), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.36, 0.028); add(g, bx(0.04, 0.4, 0.04), wood, 0, 0.2, -0.1, 1, 1, 1, 0.3); break;
    }
    default:
      add(g, bx(0.5, 0.4, 0.5), c, 0, 0.2, 0); add(g, bx(0.54, 0.08, 0.54), c2, 0, 0.44, 0);
      add(g, bx(0.1, 0.4, 0.52), gold, 0, 0.2, 0); add(g, bx(0.52, 0.4, 0.1), gold, 0, 0.2, 0); add(g, sp(0.09), gold, -0.07, 0.54, 0, 1.3, 0.8, 1); add(g, sp(0.09), gold, 0.07, 0.54, 0, 1.3, 0.8, 1);
  }
  return g;
}

/* একই ম্যাটেরিয়ালের সব মেশ একসাথে মার্জ — ১৫০+ পণ্যেও ড্র-কল কম */
function bake(root: THREE.Object3D): THREE.Mesh[] {
  root.updateMatrixWorld(true);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((o) => {
    const m = o as THREE.Mesh; if (!m.isMesh) return;
    let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
    g.applyMatrix4(m.matrixWorld);
    const mat = m.material as THREE.Material, arr = buckets.get(mat);
    if (arr) arr.push(g); else buckets.set(mat, [g]);
  });
  const out: THREE.Mesh[] = [];
  buckets.forEach((list, mat) => {
    const merged = mergeGeometries(list, false); list.forEach((x) => x.dispose());
    if (merged) out.push(new THREE.Mesh(merged, mat));
  });
  return out;
}

/* ============================ মানুষ (আরো সুন্দর কার্টুন) ============================ */
type HumanOpts = { shirt?: number; pants?: number; skin?: number; hair?: number; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; female?: boolean; glasses?: boolean; shoe?: number };
function buildHuman(o: HumanOpts = {}) {
  const skin = M(o.skin ?? 0xc98262, 0.55, 0), shirt = M(o.shirt ?? 0x2563eb, 0.6, 0), pants = M(o.pants ?? 0x1e293b, 0.7, 0), hair = M(o.hair ?? 0x17120f, 0.45, 0.1);
  const dark = M(0x0a0a0a, 0.5, 0.1), white = M(0xffffff, 0.3, 0), shoe = M(o.shoe ?? 0xf1f5f9, 0.5, 0.1), sole = M(0x1f2937, 0.8, 0), lip = M(0xb4534b, 0.5, 0);
  const fem = !!o.female, H = Math.PI / 2;
  const group = new THREE.Group(), root = new THREE.Group(); group.add(root);

  add(root, cp(0.36, 0.46), shirt, 0, 2.4, 0, fem ? 0.9 : 1, 1, 0.6);
  add(root, sp(0.3), fem ? shirt : pants, 0, 1.75, 0, 1.12, 0.62, 0.78);
  if (fem) add(root, cy(0.3, 0.52, 0.7, 20), shirt, 0, 1.62, 0);
  else { add(root, bx(0.74, 0.08, 0.46), dark, 0, 1.9, 0); add(root, bx(0.1, 0.1, 0.05), M(0xfacc15, 0.3, 0.8), 0, 1.9, -0.24); }
  add(root, cy(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
  add(root, to(0.13, 0.035), shirt, 0, 2.97, 0, 1, 1, 1, H);

  const arm = (s: number) => {
    const a = new THREE.Group(); a.position.set(s * (fem ? 0.48 : 0.52), 2.8, 0); root.add(a);
    add(a, sp(0.14), shirt, 0, 0, 0); add(a, cp(0.11, 0.26), shirt, 0, -0.24, 0); add(a, cp(0.085, 0.3), skin, 0, -0.64, 0); add(a, sp(0.095), skin, 0, -0.92, 0);
    return a;
  };
  const leg = (s: number) => {
    const l = new THREE.Group(); l.position.set(s * 0.2, 1.72, 0); root.add(l);
    add(l, cp(0.14, 1.26), fem ? skin : pants, 0, -0.78, 0);
    if (!fem) add(l, to(0.14, 0.02), dark, 0, -1.48, 0, 1, 1, 1, H);
    add(l, bx(0.27, 0.14, 0.54), shoe, 0, -1.6, -0.1); add(l, bx(0.28, 0.05, 0.56), sole, 0, -1.695, -0.1);
    return l;
  };
  const AL = arm(-1), AR = arm(1), LL = leg(-1), LR = leg(1);

  const head = new THREE.Group(); head.position.set(0, 3.42, 0); root.add(head);
  add(head, sp(0.3, 24, 18), skin, 0, 0, 0, 0.9, 1.08, 0.98);
  for (const s of [-1, 1]) {
    add(head, sp(0.05), skin, s * 0.27, -0.02, 0.0, 0.6, 1, 0.8);
    add(head, sp(0.055), white, s * 0.105, 0.05, -0.252, 1, 0.8, 0.5); add(head, sp(0.03), dark, s * 0.105, 0.05, -0.28, 1, 1, 0.5);
    add(head, bx(0.1, 0.018, 0.02), hair, s * 0.105, 0.14, -0.265, 1, 1, 1, 0, 0, s * 0.12);
    if (o.glasses) add(head, to(0.075, 0.01), dark, s * 0.105, 0.05, -0.285);
  }
  if (o.glasses) add(head, bx(0.06, 0.012, 0.012), dark, 0, 0.06, -0.285);
  add(head, sp(0.04), skin, 0, -0.03, -0.285, 1, 1.1, 1); add(head, to(0.065, 0.012, Math.PI), lip, 0, -0.1, -0.27, 1, 1, 0.5, 0, 0, Math.PI);
  const capG = G('hcap', () => new THREE.SphereGeometry(0.315, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
  const st = o.style ?? 'short';
  if (st !== 'bald') {
    add(head, capG, st === 'cap' ? shirt : hair, 0, 0.02, 0.03, 0.93, 1.1, 1);
    if (st === 'short' || st === 'bun') add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9);
    if (st === 'long') { add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9); add(head, cp(0.24, 0.5), hair, 0, -0.38, 0.15, 1, 1, 0.55); }
    if (st === 'bun') add(head, sp(0.12), hair, 0, 0.36, 0.1);
    if (st === 'cap') add(head, bx(0.4, 0.03, 0.28), shirt, 0, 0.12, -0.3);
  }

  const nm: { chest?: THREE.Mesh; tag?: THREE.Sprite } = {};
  const setName = (name: string, photo?: string) => {
    const make = (w: number, h: number, img?: HTMLImageElement) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d')!;
      x.fillStyle = 'rgba(5,11,22,.85)'; x.fillRect(0, 0, w, h);
      const r = h / 2 - 8;
      x.save(); x.beginPath(); x.arc(h / 2, h / 2, r, 0, 7); x.clip();
      if (img) { const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, h / 2 - r, h / 2 - r, r * 2, r * 2); }
      else { x.fillStyle = '#38bdf8'; x.fillRect(0, 0, h, h); }
      x.restore();
      x.fillStyle = '#fff'; x.font = `800 ${h * 0.4}px Arial`; x.textAlign = 'left'; x.textBaseline = 'middle';
      x.fillText(name, h + 4, h / 2 + 2, w - h - 14);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const apply = (img?: HTMLImageElement) => {
      const ct = make(256, 96, img), tt = make(512, 128, img);
      if (!nm.chest || !nm.tag) {
        nm.chest = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshBasicMaterial({ map: ct }));
        nm.chest.position.set(0, 2.5, -0.245); nm.chest.rotation.y = Math.PI; root.add(nm.chest);
        nm.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tt, depthTest: false }));
        nm.tag.scale.set(1.6, 0.4, 1); nm.tag.position.y = 0.62; nm.tag.renderOrder = 10; head.add(nm.tag);
      } else {
        const cm = nm.chest.material as THREE.MeshBasicMaterial, tm = nm.tag.material as THREE.SpriteMaterial;
        cm.map?.dispose(); cm.map = ct; tm.map?.dispose(); tm.map = tt;
      }
    };
    apply();
    if (photo) { const im = new Image(); im.onload = () => apply(im); im.src = photo; }
  };

  /* বাইকে বসার ভঙ্গি */
  let riding = false;
  const setRide = (v: boolean) => { riding = v; };

  const update = (phase: number, amt: number, t: number) => {
    if (riding) {
      LL.rotation.x = LR.rotation.x = 0.7; AL.rotation.x = AR.rotation.x = 1.1;
      AL.rotation.z = 0.12; AR.rotation.z = -0.12; root.position.y = 0; head.rotation.y = 0;
      return;
    }
    const s = Math.sin(phase) * 0.7 * amt;
    LL.rotation.x = s; LR.rotation.x = -s; AL.rotation.x = -s * 0.8; AR.rotation.x = s * 0.8;
    AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
    root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
    head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
  };
  return { group, update, setName, setRide };
}
type Human = ReturnType<typeof buildHuman>;

/* ============================ মোটরসাইকেল ============================ */
function buildMoto() {
  const g = new THREE.Group(), H = Math.PI / 2;
  const body = M(0xdc2626, 0.3, 0.6), dk = M(0x111827, 0.5, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), tire = M(0x0a0a0a, 0.9, 0);
  const lampM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2.5), tail = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
  const wheel = (z: number) => {
    const w = new THREE.Group(); w.position.set(0, 0.63, z); g.add(w);
    add(w, to(0.5, 0.13), tire, 0, 0, 0, 1, 1, 1, 0, H, 0);
    add(w, cy(0.4, 0.4, 0.1, 18), mt, 0, 0, 0, 1, 1, 1, 0, 0, H);
    add(w, bx(0.06, 0.9, 0.06), dk); add(w, bx(0.06, 0.06, 0.9), dk);
    return w;
  };
  const wf = wheel(-1.25), wr = wheel(1.1);
  add(g, bx(0.4, 0.5, 0.9), mt, 0, 0.8, 0.05);                       // ইঞ্জিন
  add(g, sp(0.4), body, 0, 1.45, -0.3, 0.8, 0.7, 1.5);               // ট্যাংক
  add(g, bx(0.46, 0.16, 0.95), dk, 0, 1.25, 0.35);                   // সিট
  add(g, bx(0.4, 0.08, 0.8), body, 0, 1.0, 1.05, 1, 1, 1, -0.2);     // পেছনের ফেন্ডার
  for (const s of [-1, 1]) add(g, cy(0.035, 0.035, 1.16, 8), mt, s * 0.18, 1.14, -0.975, 1, 1, 1, 0.495); // ফর্ক
  add(g, bx(1.0, 0.05, 0.05), dk, 0, 1.7, -0.7);                     // হ্যান্ডেলবার
  add(g, sp(0.15), lampM, 0, 1.55, -0.9);                            // হেডলাইট
  add(g, bx(0.25, 0.1, 0.06), tail, 0, 1.05, 1.5);                   // টেইললাইট
  add(g, cy(0.07, 0.09, 1.0, 10), mt, 0.3, 0.55, 0.55, 1, 1, 1, H);  // এক্সজস্ট
  const lamp = new THREE.SpotLight(0xfff2cc, 0, 60, 0.55, 0.5, 1.5);
  lamp.position.set(0, 1.5, -1.1); lamp.target.position.set(0, 0.2, -14); g.add(lamp, lamp.target);
  g.traverse((o) => { o.castShadow = true; });
  return { g, wf, wr, lamp };
}

/* ============================ আকাশ, সূর্য, চাঁদ, তারা ============================ */
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { zenith: { value: new THREE.Vector3() }, horizon: { value: new THREE.Vector3() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Vector3(1, 1, 1) }, night: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vD; uniform vec3 zenith, horizon, sunDir, sunCol; uniform float night;
      void main(){
        vec3 d = normalize(vD); float h = d.y;
        vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.5));
        col = mix(col, horizon*0.55, clamp(-h*4.0,0.0,1.0));
        float sd = max(dot(d, sunDir), 0.0);
        col += sunCol*(pow(sd,6.0)*0.18 + pow(sd,48.0)*0.55);
        col = mix(col, vec3(1.0,0.98,0.9), smoothstep(0.9988,0.9994,sd));
        float md = max(dot(d,-sunDir),0.0);
        col = mix(col, vec3(0.92,0.95,1.0), smoothstep(0.9993,0.9997,md)*night);
        vec3 p = floor(d*220.0);
        float s = fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453);
        col += vec3(step(0.9985,s))*night*step(0.05,h);
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
  mesh.renderOrder = -10; mesh.frustumCulled = false;
  return mesh;
}
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const NZ = [0.02, 0.04, 0.11], DZ = [0.14, 0.4, 0.85], SZ = [0.28, 0.2, 0.5];
const NH = [0.07, 0.09, 0.2], DH = [0.7, 0.85, 1], SH = [1, 0.58, 0.32];

/* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, গাছ, মেঘ, পাখি ============================ */
function addOutdoors(scene: THREE.Scene) {
  const bcol: Box2[] = []; // বাইরের বস্তুর collision (শহর addCity থেকে যোগ হয়)
  const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
  };
  plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
  plane(1600, 30, 0x6b7280, 0.012, 64); // ফুটপাত/প্লাজা
  const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
  scene.add(dashes);

  // গাছ
  const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
  for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
    const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
    add(t, cy(0.25, 0.35, 3, 8), M(0x5b3a1e, 0.9, 0), 0, 1.5, 0); add(t, ico, leafMs[k % 3], 0, 4, 0); add(t, ico, leafMs[(k + 1) % 3], 0.6, 5.2, 0.2, 0.7, 0.7, 0.7);
    t.scale.setScalar(0.9 + (k % 4) * 0.12); scene.add(t);
  }

  // গাড়ি
  const wheelM = M(0x0a0a0a, 0.8, 0), lightM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2), tailM = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
  const cars = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316].map((color, i) => {
    const dir = i % 2 ? -1 : 1, g = new THREE.Group();
    add(g, bx(4.2, 0.9, 1.9), M(color, 0.3, 0.6), 0, 0.8, 0); add(g, bx(2.2, 0.8, 1.7), M(0x9edfff, 0.1, 0.3), -0.2, 1.6, 0);
    for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) add(g, cy(0.4, 0.4, 0.3, 16), wheelM, wx, 0.4, wz, 1, 1, 1, Math.PI / 2);
    for (const lz of [-0.6, 0.6]) { add(g, bx(0.1, 0.2, 0.35), lightM, 2.1, 0.85, lz); add(g, bx(0.1, 0.2, 0.35), tailM, -2.1, 0.85, lz); }
    g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
    return { g, dir, sp: 9 + (i % 4) * 3 };
  });

  // মেঘ
  const cloudTex = canvasTex(128, 64, (x) => {
    for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 88, cyy = 28 + Math.random() * 12, r = 14 + Math.random() * 12, gr = x.createRadialGradient(cx, cyy, 0, cx, cyy, r); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cyy, r, 0, 7); x.fill(); }
  });
  const clouds = Array.from({ length: 16 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
    s.scale.set(90 + (i % 4) * 25, 36 + (i % 3) * 8, 1); s.position.set(-250 + i * 34, 85 + (i % 5) * 14, -150 + ((i * 53) % 260)); scene.add(s); return s;
  });

  // পাখি
  const wingG = G('wing', () => new THREE.PlaneGeometry(1.2, 0.4)), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
  const birds = Array.from({ length: 14 }, (_, i) => {
    const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group();
    const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
    wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6; L.add(wl); R.add(wr);
    const b = new THREE.Mesh(sp(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
    g.add(L, R, b); scene.add(g);
    return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
  });

  const update = (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
    cars.forEach((c) => { c.g.position.x += c.dir * c.sp * dt; if (c.g.position.x > 150) c.g.position.x = -150; if (c.g.position.x < -150) c.g.position.x = 150; });
    birds.forEach((b) => {
      const a = t * b.sp + b.off;
      b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6); b.g.rotation.y = -a;
      const f = Math.sin(t * 9 + b.off) * 0.7; b.L.rotation.z = f; b.R.rotation.z = -f; b.g.visible = dayF > 0.15;
    });
    clouds.forEach((c, i) => {
      c.position.x += dt * (1.5 + (i % 3) * 0.6); if (c.position.x > 280) c.position.x = -280;
      const m = c.material as THREE.SpriteMaterial; m.color.setRGB(cloudRGB[0], cloudRGB[1], cloudRGB[2], THREE.SRGBColorSpace); m.opacity = 0.35 + 0.55 * dayF;
    });
  };
  return { update, col: bcol };
}

/* ============================ রিয়েলিস্টিক শহর + বাজার ============================ */
function addCity(scene: THREE.Scene) {
  const col: Box2[] = [], rr = rng(7), dummy = new THREE.Object3D(), tc = new THREE.Color();

  /* ভবনের মুখ: জানালা + রাতে জ্বলা আলো */
  const facades = ['#8c7b6b', '#9aa5b5', '#b08968', '#6f7f95', '#c2b8a3', '#7d8a7a'].map((c, s) => {
    const r = rng(s * 91 + 5), lit = Array.from({ length: 128 }, () => r() < 0.4);
    const map = canvasTex(128, 256, (x) => {
      x.fillStyle = c; x.fillRect(0, 0, 128, 256);
      lit.forEach((_, i) => { x.fillStyle = '#2b3d58'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 3); });
    });
    const em = canvasTex(128, 256, (x) => {
      x.fillStyle = '#000'; x.fillRect(0, 0, 128, 256); x.fillStyle = '#ffd27a';
      lit.forEach((on, i) => { if (on) x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); });
    });
    [map, em].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.userData.keep = true; });
    return new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.75 });
  });
  const shopGlow = new THREE.MeshStandardMaterial({ color: 0x1b2a40, emissive: 0xffe2a8, emissiveIntensity: 0.3, roughness: 0.2 });

  const tower = (x: number, z: number, w: number, h: number, d: number, fi: number) => {
    const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 16, (uv.getY(i) * h) / 48);
    const m = new THREE.Mesh(g, facades[fi % 6]); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m);
    add(scene, bx(w * 0.35, 3, d * 0.35), M(0x59606b, 0.8, 0.1), x, h + 1.5, z);
    if (fi % 2) add(scene, cy(1.4, 1.4, 3, 10), M(0x6b4a2e, 0.9, 0), x + w * 0.25, h + 1.5, z - d * 0.2);
    col.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };

  /* সামনের সারি: নিচে দোকান (সাইনবোর্ড, শামিয়ানা, আলোকিত কাচ) */
  const NAMES = ['BAZAAR', 'CAFE', 'PHARMACY', 'FASHION', 'BOOKS', 'MOBILE', 'BAKERY', 'ELECTRO', 'GROCERY', 'TAILOR'];
  const AWN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899];
  for (let i = -9; i <= 9; i++) {
    const x = i * 17, w = 15, d = 14, fi = i + 9, fz = 92 - d / 2 - 0.06;
    tower(x, 92, w, 22 + rr() * 20, d, fi);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w - 3, 3), shopGlow); win.position.set(x, 1.9, fz - 0.01); win.rotation.y = Math.PI; scene.add(win);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2), new THREE.MeshBasicMaterial({ map: signTexture(NAMES[fi % 10], 'OPEN 24H', AWN[fi % 6]) }));
    sign.position.set(x, 5.2, fz - 0.03); sign.rotation.y = Math.PI; scene.add(sign);
    add(scene, bx(w - 2, 0.15, 2.2), M(AWN[fi % 6], 0.7, 0), x, 3.7, fz - 1.0, 1, 1, 1, -0.2).castShadow = true;
  }
  for (let x = -260, k = 0; x <= 260; x += 26, k++) tower(x + rr() * 3, 125, 18 + rr() * 6, 40 + rr() * 60, 16, k);
  for (let x = -420, k = 0; x <= 420; x += 34, k++) tower(x, 200 + rr() * 40, 24, 70 + rr() * 110, 22, k + 2);

  /* রাস্তা: জেব্রা ক্রসিং, কার্ব */
  const zeb = new THREE.InstancedMesh(bx(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 27);
  let zi = 0;
  for (const cx of [-60, 0, 60]) for (let k = 0; k < 9; k++) { dummy.position.set(cx - 4 + k, 0.035, 39); dummy.scale.set(0.55, 0.02, 15); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); zeb.setMatrixAt(zi++, dummy.matrix); }
  scene.add(zeb);
  for (const z of [30.85, 47.15]) add(scene, bx(1600, 0.18, 0.3), M(0x9ca3af, 0.8, 0), 0, 0.09, z).receiveShadow = true;

  /* রাস্তার বাতি (রাতে জ্বলে) */
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd98a, emissiveIntensity: 0 });
  const lp: [number, number][] = [];
  for (let x = -150; x <= 150; x += 15) lp.push([x, 50.5], [x, 78]);
  const poles = new THREE.InstancedMesh(bx(0.18, 5.5, 0.18), M(0x2b3550, 0.5, 0.6), lp.length), heads = new THREE.InstancedMesh(sp(0.4), lampMat, lp.length);
  lp.forEach(([x, z], i) => {
    dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0);
    dummy.position.set(x, 2.75, z); dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 5.6, z); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
  });
  scene.add(poles, heads);

  /* বাজার: ৪৮টি স্টল (টেবিল, ডোরাকাটা শামিয়ানা, ক্রেট, ফল/সবজি) */
  const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number) => {
    const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; scene.add(m); let i = 0;
    return (x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, c?: number) => {
      dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(rx, 0, 0); dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix); if (c !== undefined) m.setColorAt(i, tc.setHex(c)); i++;
    };
  };
  const stripe = canvasTex(64, 16, (x) => { for (let j = 0; j < 8; j++) { x.fillStyle = j % 2 ? '#ffffff' : '#d1d5db'; x.fillRect(j * 8, 0, 8, 16); } });
  stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping;
  const NS = 48;
  const putPost = inst(cy(0.05, 0.05, 2.6, 6), M(0x2b3550, 0.5, 0.6), NS * 4), putTab = inst(bx(1, 1, 1), M(0x7a5230, 0.7, 0.05), NS);
  const putCan = inst(bx(1, 1, 1), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.8 }), NS);
  const putCrate = inst(bx(1, 1, 1), M(0xb08968, 0.8, 0), NS * 3), putFruit = inst(sp(0.15, 8, 6), M(0xffffff, 0.6, 0), NS * 12);
  const PROD = [0xef4444, 0xf59e0b, 0x84cc16, 0x16a34a, 0xfacc15, 0xa855f7, 0xf97316], CAN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9];
  let si = 0;
  for (const z of [58, 70]) for (const sg of [-1, 1]) for (let k = 0; k < 12; k++, si++) {
    const x = sg * (14 + k * 8.5);
    putTab(x, 0.45, z, 4, 0.9, 1.6); putCan(x, 3.0, z, 4.8, 0.12, 2.6, z === 58 ? 0.15 : -0.15, CAN[si % 7]);
    for (const dx of [-2.2, 2.2]) for (const dz of [-1.1, 1.1]) putPost(x + dx, 1.3, z + dz, 1, 1, 1);
    for (let j = 0; j < 3; j++) {
      putCrate(x - 1.2 + j * 1.2, 1.1, z, 0.9, 0.4, 0.7);
      for (let f = 0; f < 4; f++) putFruit(x - 1.2 + j * 1.2 + (f % 2 - 0.5) * 0.4, 1.4, z + (f < 2 ? -0.15 : 0.15), 1, 1, 1, 0, PROD[(si + j + f) % 7]);
    }
    col.push({ minX: x - 2.4, maxX: x + 2.4, minZ: z - 1.1, maxZ: z + 1.1 });
  }

  /* ফোয়ারা */
  const stoneM = M(0x9aa1ad, 0.7, 0.1), wm = new THREE.MeshStandardMaterial({ color: 0x2a8fd0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85, emissive: 0x0b3a66, emissiveIntensity: 0.3 });
  add(scene, cy(3.8, 4, 0.7, 28), stoneM, 0, 0.35, 64).receiveShadow = true; add(scene, cy(3.4, 3.4, 0.1, 28), wm, 0, 0.72, 64);
  add(scene, cy(0.35, 0.5, 2.4, 12), stoneM, 0, 1.6, 64); add(scene, sp(0.9, 14, 10), wm, 0, 2.9, 64, 1, 0.5, 1);
  col.push({ minX: -4.3, maxX: 4.3, minZ: 59.7, maxZ: 68.3 });

  /* বাজারের ক্রেতা */
  const crowd = Array.from({ length: 10 }, (_, i) => {
    const h = buildHuman({ shirt: CAN[i % 7], female: i % 2 === 0, style: (['long', 'short', 'bun', 'cap'] as const)[i % 4], skin: [0xc98262, 0xe0ac8a, 0x8d5a3b, 0xb87555][i % 4] });
    scene.add(h.group); const side = i % 2 ? 1 : -1;
    return { h, side, x: side * (16 + i * 8), z: i % 2 ? 64.8 : 63.2, dir: i % 3 ? 1 : -1, sp: 1.2 + (i % 4) * 0.3, ph: i };
  });

  const update = (t: number, dt: number, dayF: number) => {
    const n = 1 - dayF;
    facades.forEach((m) => { m.emissiveIntensity = n * 1.0; });
    lampMat.emissiveIntensity = n * 3; shopGlow.emissiveIntensity = 0.25 + n * 1.2;
    crowd.forEach((w) => {
      w.x += w.dir * w.sp * dt; w.ph += dt * w.sp * 3.2;
      const a = Math.abs(w.x);
      if (a > 112 || a < 12) { w.dir = -w.dir; w.x = w.side * Math.min(112, Math.max(12, a)); }
      w.h.group.position.set(w.x, 0, w.z); w.h.group.rotation.y = w.dir > 0 ? -Math.PI / 2 : Math.PI / 2; w.h.update(w.ph, 1, t);
    });
  };
  return { update, col };
}

/* ============================ অন্য মানুষ (একই ডিভাইসের অন্য ট্যাব) ============================
   আসল ইন্টারনেট মাল্টিপ্লেয়ারের জন্য সার্ভার (WebSocket/Firebase/Supabase) লাগবে। */
type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
function createNet(getSelf: () => { x: number; z: number; r: number; w: number; a: number }, getProfile: () => Profile) {
  const id = Math.random().toString(36).slice(2, 8);
  let bc: BroadcastChannel | null = null;
  try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
  const peers = new Map<string, Peer>();
  if (bc) bc.onmessage = (e) => {
    const m = e.data;
    if (!m || !m.id || m.id === id) return;
    if (m.t === 'bye') { peers.delete(m.id); return; }
    const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
    if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; } else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
    p.seen = performance.now(); peers.set(m.id, p);
  };
  let lp = 0, lh = 0;
  const tick = (now: number) => {
    if (!bc) return;
    if (now - lh > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lh = now; }
    if (now - lp > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lp = now; }
    peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
  };
  return { peers, tick, close: () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); } };
}

/* ============================ মূল কম্পোনেন্ট ============================ */
const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';
const inp = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
const btn = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
const fmtHour = (h: number) => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

type Built = { shop: Shop; g: THREE.Group; col: Box2[]; hits: { box: THREE.Box3; p: Product }[]; idlers: { h: Human; base: number }[]; screen: (t: number) => void; light: THREE.Vector3 };

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef({ f: false, b: false, l: false, r: false, s: false });
  const joyRef = useRef({ x: 0, y: 0 });
  const pausedRef = useRef(false);
  const meRef = useRef<Human | null>(null);
  const posRef = useRef({ x: 0, z: 18 });
  const tpRef = useRef<{ x: number; z: number } | null>(null);
  const sunCmdRef = useRef(false);
  const dayRef = useRef({ a: 0.65, auto: true });
  const rideCmdRef = useRef(0);

  const [shops, setShops] = useState<Shop[]>(defaultShops);
  const [profile, setProfile] = useState<Profile>({ name: 'আমি', photo: '' });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [balance, setBalance] = useState(100000);
  const [score, setScore] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Sel | null>(null);
  const [hover, setHover] = useState<{ name: string; price: number } | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন। বাইরে বাইক আছে — F চাপুন!');
  const [touch, setTouch] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [panel, setPanel] = useState<'' | 'profile' | 'shops' | 'tasks' | 'help'>('');
  const [online, setOnline] = useState<string[]>([]);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [hour, setHour] = useState(8.5);
  const [autoDay, setAutoDay] = useState(true);
  const [sid, setSid] = useState('fashion');
  const [q, setQ] = useState('');
  const [ns, setNs] = useState({ name: '', subtitle: '', style: 'market', accent: '#2563eb' });
  const [np, setNp] = useState({ name: '', price: '', image: '', kind: 'tshirt', color: '#2563eb' });
  const [rn, setRn] = useState('');
  const [riding, setRiding] = useState(false);
  const [nearBike, setNearBike] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [daily, setDaily] = useState<{ date: string; done: string[] }>({ date: todayKey(), done: [] });
  const [jsonText, setJsonText] = useState('');
  const [jsonMsg, setJsonMsg] = useState('');
  const [jsonUrl, setJsonUrl] = useState('');
  const dailyRef = useRef(daily); dailyRef.current = daily;
  const doneToday = daily.date === todayKey() ? daily.done : [];

  /* দৈনিক টাস্ক সম্পন্ন (দিনে প্রতিটি একবার, সর্বোচ্চ ৪টি) */
  const complete = (id: string) => {
    const t = todayKey(), cur = dailyRef.current.date === t ? dailyRef.current.done : [];
    const task = TASKS.find((x) => x.id === id);
    if (!task || cur.includes(id) || cur.length >= TASKS.length) return;
    const next = { date: t, done: [...cur, id] }, all = next.done.length === TASKS.length;
    dailyRef.current = next; setDaily(next); setScore((sc) => sc + task.pts + (all ? BONUS : 0));
    setMessage(`🎯 টাস্ক সম্পন্ন: ${task.title} (+${task.pts} পয়েন্ট) — আজ ${next.done.length}/${TASKS.length}${all ? ` 🎉 সব টাস্ক শেষ! বোনাস +${BONUS}` : ''}`);
  };
  const completeRef = useRef(complete); completeRef.current = complete;

  const profileRef = useRef(profile); profileRef.current = profile;
  const shopsRef = useRef(shops); shopsRef.current = shops;
  const total = cart.reduce((s, i) => s + i.price * i.count, 0);
  const cartCount = cart.reduce((s, i) => s + i.count, 0);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---- লোড / সেভ ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
        if (ls) {
          if (ls.profile) setProfile(ls.profile); if (ls.cart) setCart(ls.cart); if (ls.daily && Array.isArray(ls.daily.done)) setDaily(ls.daily);
          if (typeof ls.balance === 'number') setBalance(ls.balance); if (typeof ls.score === 'number') setScore(ls.score);
        }
      } catch { /* ignore */ }
      const saved = (await kv.get('shops')) as Shop[] | undefined;
      if (alive && Array.isArray(saved) && saved.length) { setShops(saved); setSid(saved[0].id); }
      if (alive) setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => { kv.set('shops', shops); }, 500);
    return () => clearTimeout(t);
  }, [loaded, shops]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score, daily })); } catch { /* ignore */ }
  }, [loaded, profile, cart, balance, score, daily]);
  useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

  /* ============================ 3D দৃশ্য ============================ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbfd8f0, 25, 260);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a4252, 1.6); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 220 });
    scene.add(sun, sun.target);
    const pool = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xfff1dc, 0, 30, 2); scene.add(l); return l; });

    const sky = makeSky(); scene.add(sky);
    const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
    const outdoors = addOutdoors(scene);
    const updateOutdoors = outdoors.update;
    const city = addCity(scene);
    outdoors.col.push(...city.col);

    const textureLoader = new THREE.TextureLoader(); textureLoader.setCrossOrigin('anonymous');
    const glowMat = M(0xeaf8ff, 0.5, 0, 0xbde9ff, 2.2);
    const built = new Map<string, Built>();

    /* ---------- মলের কাঠামো (দোকানের সংখ্যা অনুযায়ী লম্বা হয়) ---------- */
    let shell: THREE.Group | null = null, shellBack = 0, shellCol: Box2[] = [];
    const needBack = () => { const zs = shopsRef.current.map((s) => s.z); return Math.min(-115, (zs.length ? Math.min(...zs) : -14) - 22); };
    const mkShell = (backZ: number) => {
      if (shell) { scene.remove(shell); disposeTree(shell); }
      shellBack = backZ; shellCol = [];
      // দেয়াল ও প্রবেশদ্বারের পিলারে collision (এখন বাইরে যাওয়া যায়)
      shellCol.push(
        { minX: -29, maxX: -28, minZ: backZ, maxZ: 24 }, { minX: 28, maxX: 29, minZ: backZ, maxZ: 24 },
        { minX: -29, maxX: 29, minZ: backZ - 1, maxZ: backZ },
        { minX: -26.7, maxX: -25.3, minZ: 23.3, maxZ: 24.7 }, { minX: 25.3, maxX: 26.7, minZ: 23.3, maxZ: 24.7 },
      );
      const len = 24 - backZ, cz = (24 + backZ) / 2, s = new THREE.Group();
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ map: tileTex('#2a3447', '#323e55', Math.round(57 / 4), Math.round(len / 4)), roughness: 0.22, metalness: 0.2 }));
      floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz); floor.receiveShadow = true; s.add(floor);
      const wallM = M(0x1a2338, 0.5, 0.3);
      for (const sx of [-28.5, 28.5]) { const w = add(s, bx(1, 14, len), wallM, sx, 7, cz); w.receiveShadow = true; }
      add(s, bx(58, 14, 1), wallM, 0, 7, backZ - 0.5);
      // কাচের ছাদ — আকাশ ও সূর্য দেখা যায়
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ color: 0xa8d8ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
      roof.rotation.x = Math.PI / 2; roof.position.set(0, 14, cz); s.add(roof);
      const nB = Math.floor(len / 9), beams = new THREE.InstancedMesh(bx(57, 0.35, 0.5), M(0x2b3550, 0.4, 0.7), nB), m4 = new THREE.Matrix4();
      for (let i = 0; i < nB; i++) { m4.setPosition(0, 14, 24 - i * 9); beams.setMatrixAt(i, m4); }
      beams.castShadow = true; s.add(beams);
      for (const rx of [-22, -11, 0, 11, 22]) { const r = add(s, bx(0.3, 0.3, len), M(0x2b3550, 0.4, 0.7), rx, 14, cz); r.castShadow = true; }
      const nL = Math.floor(len / 10), bars = new THREE.InstancedMesh(bx(6, 0.15, 0.5), glowMat, nL);
      for (let i = 0; i < nL; i++) { m4.setPosition(0, 13.7, 20 - i * 10); bars.setMatrixAt(i, m4); }
      s.add(bars);
      for (const sx of [-7.3, 7.3]) add(s, bx(0.1, 0.02, len), M(0x22d3ee, 0.3, 0, 0x22d3ee, 2), sx, 0.03, cz);
      // টব ও গাছ
      for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
        add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
        shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
      }
      // প্রবেশদ্বার
      for (const sx of [-26, 26]) add(s, bx(1.4, 14, 1.4), M(0x2b3550, 0.4, 0.7), sx, 7, 24);
      add(s, bx(54, 1.2, 1.2), M(0x2b3550, 0.4, 0.7), 0, 13.2, 24);
      const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8), side: THREE.DoubleSide }));
      arch.position.set(0, 10.6, 23.6); s.add(arch);
      shell = s; scene.add(s);
    };

    /* ---------- দোকান তৈরি (স্ট্রিমিং) ---------- */
    const buildShop = (shop: Shop): Built => {
      const g = new THREE.Group();
      g.position.set(shop.x, 0, shop.z); g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2;
      const col: Box2[] = [], idlers: Built['idlers'] = [];
      const acc = M(shop.accent, 0.3, 0.5), dark = M(0x131a2a, 0.35, 0.6), metal = M(0x64748b, 0.25, 0.85), wood = M(0x6b4a2e, 0.55, 0.1), white = M(0xe5e9f0, 0.25, 0.2);
      const led = M(shop.accent, 0.3, 0.2, shop.accent, 2.5);
      const glassM = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
      const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
        const k = add(g, bx(w, h, d), m, x, y, z); k.castShadow = shadow; k.receiveShadow = true; return k;
      };
      const solid = (lx: number, lz: number, w: number, d: number) => {
        const c = Math.round(Math.cos(g.rotation.y)), s = Math.round(Math.sin(g.rotation.y));
        const wx = shop.x + lx * c + lz * s, wz = shop.z - lx * s + lz * c;
        const sw = Math.abs(w * c) + Math.abs(d * s), sd = Math.abs(w * s) + Math.abs(d * c);
        col.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2 });
      };

      const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 20), new THREE.MeshStandardMaterial({ map: tileTex('#d8dde6', '#c4cad6', 9, 10), roughness: 0.3 }));
      sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true; g.add(sf);
      add(g, pl(3.4, 19), M(shop.accent, 0.9, 0), 0, 0.05, 0, 1, 1, 1, -Math.PI / 2);

      // দেয়াল
      for (const s of [-1, 1]) { box(0.4, 10, 20, acc, s * 8.9, 5, 0); solid(s * 8.9, 0, 0.4, 20); }
      box(18, 10, 0.4, dark, 0, 5, -9.9); solid(0, -9.9, 18, 0.4);
      const slat = add(g, pl(17.4, 9.4), new THREE.MeshStandardMaterial({ map: slatTex(), roughness: 0.55 }), 0, 4.7, -9.68);
      slat.receiveShadow = true;

      // সামনের দিক
      box(18, 3.4, 0.5, dark, 0, 8.3, 10);
      for (const gx of [-5.5, 5.5]) { add(g, bx(7, 6.6, 0.1), glassM, gx, 3.3, 10); solid(gx, 9.9, 7, 0.4); }
      for (const fx of [-2, 2, -9, 9]) box(0.3, 6.6, 0.4, metal, fx, 3.3, 10);
      add(g, new THREE.PlaneGeometry(14, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }), 0, 8.3, 10.27);
      const awn = box(18.4, 0.25, 2.4, acc, 0, 6.9, 11.1, false); awn.rotation.x = 0.18;
      box(14.4, 0.1, 0.1, led, 0, 9.85, 10.3, false);
      for (const lz of [-5, 3]) box(15, 0.12, 0.35, glowMat, 0, 9.7, lz, false);
      for (const s of [-1, 1]) box(0.12, 0.15, 19.4, led, s * 8.5, 9.6, 0, false);

      // শেলফ (দুই পাশ + পেছনে, ৪ থাক, নিচে LED)
      const planks = (cx: number, cz: number, w: number, d: number, vertical: boolean) => {
        SHELF_Y.forEach((y) => { box(w, 0.08, d, wood, cx, y, cz); box(w - 0.1, 0.03, d - 0.1, led, cx, y - 0.06, cz, false); });
        if (vertical) { box(0.12, 5.6, d, dark, cx + (cx < 0 ? -0.6 : 0.6), 2.8, cz); box(w, 0.78, d, dark, cx, 0.39, cz); }
        else { box(w, 5.6, 0.12, dark, cx, 2.8, cz - 0.6); box(w, 0.78, d, dark, cx, 0.39, cz); }
      };
      for (const s of [-1, 1]) { planks(s * 8.0, -2.45, 1.2, 12.2, true); solid(s * 8.0, -2.45, 1.3, 12.3); }
      planks(0, -9.1, 15.8, 1.2, false); solid(0, -9.1, 15.8, 1.3);

      // টেবিল (৮টি) — উপরে শোকেস পণ্য
      for (const cz of TABLE_Z) for (const cx of TABLE_X) {
        box(2.0, 1.6, 1.2, white, cx, 0.8, cz); box(2.05, 0.08, 1.25, led, cx, 1.62, cz, false); solid(cx, cz, 2.0, 1.2);
      }

      // পেছনের স্ক্রিন (চলমান)
      const sc = document.createElement('canvas'); sc.width = 768; sc.height = 300;
      const sx = sc.getContext('2d')!, stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
      const draw = (t: number) => {
        const gr = sx.createLinearGradient(0, 0, 768, 300); gr.addColorStop(0, hex(shop.accent)); gr.addColorStop(1, '#0b1220');
        sx.fillStyle = gr; sx.fillRect(0, 0, 768, 300);
        sx.fillStyle = 'rgba(255,255,255,.14)'; sx.beginPath(); sx.arc(384 + 260 * Math.sin(t * 0.8), 150, 120, 0, 7); sx.fill();
        sx.fillStyle = '#fff'; sx.font = '900 64px Arial'; sx.textAlign = 'center'; sx.fillText(shop.name, 384, 170, 720); stex.needsUpdate = true;
      };
      draw(0);
      box(9.4, 3.9, 0.2, dark, 0, 7.75, -9.55);
      add(g, new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }), 0, 7.75, -9.43);

      // মানুষ
      const hs = [...shop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
      const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: hs % 2 ? 0xb87555 : 0xe0ac8a, female: hs % 3 === 0, style: hs % 3 === 0 ? 'long' : 'short', hair: hs % 2 ? 0x17120f : 0x3b2314 });
      cashier.group.position.set(-5.4, 0, 4.6); cashier.group.rotation.y = Math.PI; g.add(cashier.group); idlers.push({ h: cashier, base: Math.PI }); solid(-5.4, 4.6, 0.8, 0.8);
      const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][hs % 4], skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][hs % 4], female: hs % 2 === 0, style: (['bun', 'cap', 'long', 'short'] as const)[hs % 4], glasses: hs % 5 === 0 });
      browser.group.position.set(3.6, 0, 7.2); g.add(browser.group); idlers.push({ h: browser, base: 0 }); solid(3.6, 7.2, 0.9, 0.9);
      box(3.6, 1.4, 1.3, dark, -5.4, 0.7, 6); box(3.6, 0.08, 1.4, wood, -5.4, 1.42, 6); solid(-5.4, 6, 3.6, 1.3);

      // পণ্য: ৩D ডিসপ্লে স্ট্যান্ড — ছবি + নাম + দাম + মডেল নং (আইকন নেই)
      const localBoxes: { box: THREE.Box3; p: Product }[] = [], frameM = M(0x0b1220, 0.4, 0.5), baseM = M(0x1e293b, 0.4, 0.6);
      shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
        const sl = SLOTS[i], k = sl.s, pw = 0.8 * k, ph2 = 0.52 * k, lh = 0.26 * k;
        const grp = new THREE.Group(); grp.position.set(sl.x, sl.y, sl.z); grp.rotation.y = sl.ry; g.add(grp);
        add(grp, bx(0.86 * k, 0.07 * k, 0.34 * k), baseM, 0, 0.035 * k, 0);                       // ভিত্তি
        const tilt = new THREE.Group(); tilt.position.set(0, 0.07 * k, 0.06 * k); tilt.rotation.x = -0.14; grp.add(tilt);
        add(tilt, bx(pw + 0.08, lh + 0.05, 0.06 * k), frameM, 0, lh / 2, 0);                        // লেবেলের বক্স
        add(tilt, pl(pw, lh), labelMat(p), 0, lh / 2, 0.032 * k);                                   // নাম/দাম/মডেল
        add(tilt, bx(pw + 0.08, ph2 + 0.08, 0.07 * k), frameM, 0, lh + 0.04 + ph2 / 2, 0);        // ছবির ফ্রেম (গভীরতা)
        add(tilt, pl(pw, ph2), photoMat(p, textureLoader), 0, lh + 0.04 + ph2 / 2, 0.037 * k);    // ছবি
        localBoxes.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(sl.x, sl.y + 0.46 * k, sl.z), new THREE.Vector3(1.05 * k, 0.95 * k, 1.05 * k)), p });
      });
      scene.add(g); g.updateMatrixWorld(true);
      const hits = localBoxes.map((h) => ({ p: h.p, box: h.box.applyMatrix4(g.matrixWorld) }));
      return { shop, g, col, hits, idlers, screen: draw, light: new THREE.Vector3(shop.x, 7.5, shop.z) };
    };
    const drop = (id: string) => { const b = built.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); built.delete(id); };

    /* ---------- খেলোয়াড় ও পথচারী ---------- */
    const player = new THREE.Group(); player.position.set(posRef.current.x, 0, posRef.current.z); scene.add(player);
    const me = buildHuman({ shirt: 0x2563eb, skin: 0xc98262, style: 'short' });
    player.add(me.group); meRef.current = me; me.setName(profileRef.current.name, profileRef.current.photo);

    const looks: HumanOpts[] = [
      { shirt: 0xef4444, skin: 0xb87555, female: true, style: 'long' }, { shirt: 0xf8fafc, skin: 0xe0ac8a, hair: 0x3b2314, style: 'cap' }, { shirt: 0x16a34a, skin: 0x8d5a3b, glasses: true },
      { shirt: 0xfacc15, skin: 0xd9a07c, hair: 0x5b3a1e, female: true, style: 'bun' }, { shirt: 0x8b5cf6, skin: 0xc98262, style: 'bald' }, { shirt: 0xf97316, skin: 0xa66a47, female: true, style: 'long', hair: 0x2a1a10 },
      { shirt: 0x0ea5e9, skin: 0xe0ac8a, hair: 0xb45309, style: 'short' }, { shirt: 0xec4899, skin: 0x8d5a3b, female: true, style: 'short', glasses: true },
    ];
    const walkers = looks.map((o, i) => {
      const h = buildHuman(o); scene.add(h.group);
      return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
    });

    let walk = 0, amt = 0;
    const net = createNet(() => ({ x: player.position.x, z: player.position.z, r: player.rotation.y, w: walk, a: amt }), () => profileRef.current);
    const avatars = new Map<string, { h: Human; key: string }>();
    const timer = setInterval(() => {
      const n = [...net.peers.values()].map((p) => p.name);
      setOnline((prev) => (prev.join('|') === n.join('|') ? prev : n));
      if (dayRef.current.auto) setHour(Math.round((((((dayRef.current.a / (Math.PI * 2)) * 24 + 6) % 24) + 24) % 24) * 10) / 10);
    }, 1000);

    /* ---------- ইনপুট ---------- */
    let yaw = 0, pitch = 0.5, camDist = 11;
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tmp = new THREE.Vector3();
    let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;
    const el = renderer.domElement;
    const pickAt = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      let best: { p: Product; shop: string; d: number } | null = null;
      for (const b of built.values()) for (const h of b.hits) {
        if (!ray.ray.intersectBox(h.box, tmp)) continue;
        const d = tmp.distanceTo(ray.ray.origin);
        if (d < 60 && (!best || d < best.d)) best = { p: h.p, shop: b.shop.name, d };
      }
      return best as { p: Product; shop: string; d: number } | null;
    };
    let hoverId = '', lastHover = 0;
    const hoverCheck = (e: PointerEvent) => {
      if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
      const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
      const h = pickAt(e.clientX, e.clientY), id = h ? h.p.id : '';
      if (id !== hoverId) { hoverId = id; setHover(h ? { name: h.p.name, price: h.p.price } : null); el.style.cursor = h ? 'pointer' : 'grab'; }
    };
    const onDown = (e: PointerEvent) => {
      if (down) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() }; sunCmdRef.current = false;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) { if (e.pointerType === 'mouse') hoverCheck(e); return; }
      if (e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
      yaw -= dx * 0.005; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.7, 1.15);
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (down.moved < 8 && performance.now() - down.t < 500) { const h = pickAt(e.clientX, e.clientY); if (h) { setQty(1); setSelected({ ...h.p, shop: h.shop }); completeRef.current('view'); } }
      down = null;
    };
    const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: true });

    const setKey = (e: KeyboardEvent, v: boolean) => {
      const tg = (e.target as HTMLElement)?.tagName; if (tg === 'INPUT' || tg === 'SELECT') return;
      const k = keysRef.current, key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') k.f = v; if (key === 's' || key === 'arrowdown') k.b = v;
      if (key === 'a' || key === 'arrowleft') k.l = v; if (key === 'd' || key === 'arrowright') k.r = v;
      if (key === 'shift') k.s = v;
      if (v && key === 'q') yaw += 0.15; if (v && key === 'e') yaw -= 0.15;
    };
    const kd = (e: KeyboardEvent) => {
      setKey(e, true);
      const tg = (e.target as HTMLElement)?.tagName;
      if (e.key.toLowerCase() === 'f' && !e.repeat && tg !== 'INPUT' && tg !== 'SELECT') rideCmdRef.current = 1;
    };
    const ku = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    const resize = () => {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(container);

    /* ---------- মোটরসাইকেল ও দোকান-প্রবেশ ---------- */
    const moto = buildMoto(); moto.g.position.set(10, 0, 30); scene.add(moto.g);
    let riding = false, vel = 0, dirX = 0, dirZ = -1, nearLast = false, curShop = '';
    const inShop = (x: number, z: number) => {
      for (const b of built.values()) if (Math.abs(x - b.shop.x) < 10 && Math.abs(z - b.shop.z) < 9.5) return b.shop;
      return null;
    };
    const toggleRide = () => {
      if (riding) {
        riding = false; me.setRide(false); me.group.scale.setScalar(1); me.group.position.set(0, 0, 0);
        const a = player.rotation.y;
        moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = a;
        player.position.x += Math.cos(a) * 1.8; player.position.z -= Math.sin(a) * 1.8;
        setRiding(false); setMessage('🚶 বাইক থেকে নামলেন।'); return;
      }
      if (inShop(player.position.x, player.position.z)) { setMessage('🏪 দোকানের ভেতরে বাইক চলে না — বাইরে এসে F চাপুন।'); return; }
      const d = Math.hypot(moto.g.position.x - player.position.x, moto.g.position.z - player.position.z);
      if (d > 6) {
        const a = player.rotation.y;
        moto.g.position.set(player.position.x - Math.cos(a) * 3, 0, player.position.z + Math.sin(a) * 3); moto.g.rotation.y = a;
        setMessage('🏍️ বাইক আপনার পাশে এসেছে — আবার F চাপুন।'); return;
      }
      riding = true; me.setRide(true); me.group.scale.setScalar(0.62); me.group.position.set(0, 0.37, 0.15);
      player.position.set(moto.g.position.x, 0, moto.g.position.z); player.rotation.y = moto.g.rotation.y;
      vel = 0; camDist = Math.max(camDist, 14);
      setRiding(true); setMessage('🏍️ বাইকে উঠেছেন! W A S D = চালান, Shift = টার্বো'); completeRef.current('ride');
    };

    /* ---------- মূল লুপ ---------- */
    const R = 0.5;
    const blocked = (x: number, z: number) => {
      const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
      if (shellCol.some(hit)) return true;
      if (z > 55 && outdoors.col.some(hit)) return true;   // শহরের ভবন ও বাজারের স্টল
      if (riding && inShop(x, z)) return true;             // বাইক নিয়ে দোকানে ঢোকা যাবে না
      for (const b of built.values()) if (Math.abs(b.shop.z - z) < 14 && b.col.some(hit)) return true;
      return false;
    };
    const clock = new THREE.Clock(), camTarget = new THREE.Vector3(), sunDir = new THREE.Vector3(), moon = new THREE.Vector3();
    let raf = 0, lastList: Shop[] | null = null, frame = 0, firstCam = true;
    mkShell(needBack());

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
      const px = player.position.x, pz = player.position.z;

      /* দিন-রাত */
      const D = dayRef.current; if (D.auto && !pausedRef.current) D.a += dt * 0.02;
      const ca = Math.cos(D.a);
      sunDir.set(ca * 0.5, Math.sin(D.a), -0.85 * ca).normalize();
      const elv = sunDir.y, dayF = sm(-0.08, 0.3, elv), dusk = (1 - sm(0, 0.4, elv)) * sm(-0.15, 0.05, elv);
      const zen = mix3(mix3(NZ, DZ, dayF), SZ, dusk * 0.6), hor = mix3(mix3(NH, DH, dayF), SH, dusk * 0.85);
      const sunC = mix3([1, 0.55, 0.25], [1, 0.96, 0.86], sm(0.05, 0.5, elv));
      skyU.zenith.value.set(zen[0], zen[1], zen[2]); skyU.horizon.value.set(hor[0], hor[1], hor[2]);
      skyU.sunDir.value.copy(sunDir); skyU.sunCol.value.set(sunC[0], sunC[1], sunC[2]); skyU.night.value = 1 - dayF;
      sky.position.copy(camera.position);
      (scene.fog as THREE.Fog).color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
      hemi.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); hemi.intensity = 0.25 + 1.45 * dayF;
      const L = elv > 0 ? sunDir : moon.copy(sunDir).negate();
      sun.position.set(px + L.x * 90, Math.max(8, L.y * 90), pz + L.z * 90); sun.target.position.set(px, 0, pz);
      sun.intensity = 1.9 * sm(0, 0.4, elv) + 0.35 * sm(0, 0.3, -elv);
      if (elv > 0) sun.color.setRGB(sunC[0], sunC[1], sunC[2], THREE.SRGBColorSpace); else sun.color.setRGB(0.55, 0.65, 1, THREE.SRGBColorSpace);
      const cloudRGB = mix3(mix3([0.25, 0.28, 0.4], [1, 1, 1], dayF), [1, 0.7, 0.55], dusk * 0.6);

      /* দোকান স্ট্রিমিং */
      if (lastList !== shopsRef.current) {
        lastList = shopsRef.current;
        const map = new Map(lastList.map((s) => [s.id, s]));
        [...built.keys()].forEach((id) => { const s = map.get(id); if (!s || s !== built.get(id)!.shop) drop(id); });
        const nb = needBack(); if (nb !== shellBack) mkShell(nb);
      }
      let nearest: Shop | null = null, nd = Infinity;
      const far = Math.abs(px) > 90; // মল থেকে অনেক দূরে গেলে দোকান বানানো বন্ধ
      for (const s of lastList) {
        const dz = s.z - pz, b = built.get(s.id);
        if (b) { if (far || dz < -105 || dz > 70) drop(s.id); continue; }
        if (!far && dz > -80 && dz < 45 && Math.abs(dz) < nd) { nd = Math.abs(dz); nearest = s; }
      }
      if (nearest && (frame % 2 === 0 || built.size < 3)) built.set((nearest as Shop).id, buildShop(nearest as Shop));

      /* পয়েন্ট লাইট পুল */
      const near = [...built.values()].sort((a, b) => Math.abs(a.shop.z - pz) - Math.abs(b.shop.z - pz)).slice(0, 4);
      pool.forEach((l, i) => { const b = near[i]; if (b) { l.position.copy(b.light); l.intensity = 40 * (0.5 + 0.9 * (1 - dayF)); } else l.intensity = 0; });

      if (tpRef.current) { player.position.set(tpRef.current.x, 0, tpRef.current.z); tpRef.current = null; firstCam = true; }

      if (!pausedRef.current) {
        const k = keysRef.current, j = joyRef.current;
        let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x, iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
        const len = Math.hypot(ix, iz);
        if (len > 1) { ix /= len; iz /= len; }

        const on = len > 0.08, inMall = player.position.z < 24 && Math.abs(player.position.x) < 28;
        const top = riding ? (k.s ? 30 : 20) * (inMall ? 0.5 : 1) : (k.s ? 15 : 7.5);
        vel += ((on ? top * Math.min(1, len) : 0) - vel) * Math.min(1, dt * (riding ? 2.2 : 30));
        if (on) {
          const sin = Math.sin(yaw), cos = Math.cos(yaw);
          const mx = -sin * iz + cos * ix, mz = -cos * iz - sin * ix, n = Math.hypot(mx, mz) || 1;
          dirX = mx / n; dirZ = mz / n;
          let diff = Math.atan2(-dirX, -dirZ) - player.rotation.y;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          player.rotation.y += diff * Math.min(1, dt * (riding ? 4 : 12));
        }
        if (riding) { dirX = -Math.sin(player.rotation.y); dirZ = -Math.cos(player.rotation.y); }
        if (vel > 0.05) {
          const spd = vel * dt;
          const nx = THREE.MathUtils.clamp(player.position.x + dirX * spd, -330, 330);
          const okX = !blocked(nx, player.position.z); if (okX) player.position.x = nx;
          const nz = THREE.MathUtils.clamp(player.position.z + dirZ * spd, shellBack - 80, 150);
          const okZ = !blocked(player.position.x, nz); if (okZ) player.position.z = nz;
          if (riding && (!okX || !okZ)) vel *= 0.6;
        } else if (!on) vel = 0;
        if (!riding) {
          if (on) { walk += dt * (k.s ? 13 : 9); amt = Math.min(1, amt + dt * 6); } else amt = Math.max(0, amt - dt * 6);
        } else {
          amt = 0; const spin = (vel * dt) / 0.63; moto.wf.rotation.x -= spin; moto.wr.rotation.x -= spin;
        }
        me.update(walk, amt, t);
        posRef.current = { x: player.position.x, z: player.position.z };
        if (riding) { moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = player.rotation.y; }

        walkers.forEach((n) => {
          if (Math.abs(n.z - pz) > 75) n.z = THREE.MathUtils.clamp(pz - 60 + Math.random() * 100, shellBack + 6, 26);
          const nr = Math.hypot(n.x - px, n.z - pz) < 2.4;
          n.amt += ((nr ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
          if (!nr) { n.z += n.dir * n.sp * dt; n.ph += dt * n.sp * 3.2; if (n.z < shellBack + 6) n.dir = 1; if (n.z > 26) n.dir = -1; }
          n.h.group.position.set(n.x, 0, n.z); n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI; n.h.update(n.ph, n.amt, t);
        });
        for (const b of built.values()) {
          if (Math.abs(b.shop.z - pz) > 45) continue;
          b.idlers.forEach((i) => { i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * 0.2; i.h.update(0, 0, t); });
          if (frame % 3 === 0 && Math.abs(b.shop.z - pz) < 38) b.screen(t);
        }
        updateOutdoors(t, dt, dayF, cloudRGB);
        city.update(t, dt, dayF);
      }

      /* বাইকের হেডলাইট, কাছাকাছি বাইক, দোকানে প্রবেশের বার্তা, F কমান্ড */
      moto.lamp.intensity = riding ? 250 * (1 - dayF) : 0;
      if (frame % 10 === 0) {
        const nb = !riding && Math.hypot(moto.g.position.x - px, moto.g.position.z - pz) < 6;
        if (nb !== nearLast) { nearLast = nb; setNearBike(nb); }
        const sh = inShop(player.position.x, player.position.z), sid2 = sh ? sh.id : '';
        if (sid2 !== curShop) { curShop = sid2; if (sh) { setMessage(`🏪 ${sh.name} এ প্রবেশ করেছেন`); completeRef.current('shop'); } }
      }
      if (rideCmdRef.current) { rideCmdRef.current = 0; toggleRide(); }

      /* অন্য মানুষ */
      net.tick(performance.now());
      net.peers.forEach((p) => {
        let a = avatars.get(p.id);
        if (!a) {
          const c = [...p.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
          const h = buildHuman({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4][c % 5], female: c % 2 === 0, style: c % 2 ? 'short' : 'long' });
          h.group.position.set(p.x, 0, p.z); scene.add(h.group); a = { h, key: '' }; avatars.set(p.id, a);
        }
        const key = p.name + p.photo.length;
        if (a.key !== key) { a.h.setName(p.name, p.photo); a.key = key; }
        a.h.group.position.x += (p.x - a.h.group.position.x) * 0.25; a.h.group.position.z += (p.z - a.h.group.position.z) * 0.25;
        a.h.group.rotation.y = p.r; a.h.update(p.w, p.a, t);
      });
      avatars.forEach((a, id) => { if (!net.peers.has(id)) { scene.remove(a.h.group); disposeTree(a.h.group); avatars.delete(id); } });

      /* "সূর্য দেখুন" বাটন: ক্যামেরা সূর্যের দিকে ঘোরে */
      if (sunCmdRef.current) {
        const ty = Math.atan2(-sunDir.x, -sunDir.z), tp = THREE.MathUtils.clamp(-0.2 - Math.max(0, elv) * 0.55, -0.7, 0.2);
        let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        yaw += dy * 0.08; pitch += (tp - pitch) * 0.08;
        if (Math.abs(dy) < 0.02 && Math.abs(tp - pitch) < 0.02) sunCmdRef.current = false;
      }

      const up = Math.max(0, -pitch), h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
      camTarget.set(player.position.x + Math.sin(yaw) * d, Math.max(0.6, 2 + h), player.position.z + Math.cos(yaw) * d);
      if (firstCam) { camera.position.copy(camTarget); firstCam = false; } else camera.position.lerp(camTarget, 0.12);
      camera.lookAt(player.position.x, 2.4 + up * 14, player.position.z);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf); clearInterval(timer); net.close(); meRef.current = null; ro.disconnect();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
      built.forEach((b) => disposeTree(b.g)); built.clear();
      disposeTree(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [loaded]);

  /* ============================ অ্যাকশন ============================ */
  const addSelected = () => {
    if (!selected) return;
    setCart((prev) => {
      const old = prev.find((i) => i.id === selected.id);
      if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + qty } : i));
      return [...prev, { ...selected, count: qty }];
    });
    setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`); setSelected(null); complete('cart');
  };
  const changeQty = (id: string, d: number) => setCart((p) => p.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));
  const checkout = () => {
    if (!cart.length) return setMessage('🛒 কার্ট খালি।');
    if (balance < total) return setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`);
    setBalance((b) => b - total); setScore((s) => s + cartCount * 100); setCart([]); setMessage(`🎉 ${taka(total)} পেমেন্ট সফল!`);
  };

  const shop = shops.find((s) => s.id === sid);
  const patchShop = (id: string, f: (s: Shop) => Shop) => setShops(shops.map((s) => (s.id === id ? f(s) : s)));
  const addShop = () => {
    if (shops.length >= MAX_SHOPS) return setMessage(`❌ সর্বোচ্চ ${MAX_SHOPS}টি দোকান`);
    const slot = nextSlots(shops, 1)[0];
    if (!slot) return setMessage('❌ আর খালি জায়গা নেই');
    if (!ns.name.trim()) return setMessage('✏️ দোকানের নাম দিন');
    const id = 's' + Date.now().toString(36);
    setShops([...shops, { id, name: ns.name.trim().toUpperCase().slice(0, 18), subtitle: ns.subtitle.trim() || 'New Store', ...slot, accent: parseInt(ns.accent.slice(1), 16), style: ns.style, products: [] }]);
    setSid(id); setNs({ ...ns, name: '', subtitle: '' }); setMessage('🏪 নতুন দোকান তৈরি হয়েছে!');
  };
  const addProduct = () => {
    if (!shop) return;
    const price = Number(np.price);
    if (!np.name.trim() || !(price > 0)) return setMessage('✏️ পণ্যের নাম ও সঠিক দাম দিন');
    if (shop.products.length >= MAX_PRODUCTS) return setMessage(`❌ একটি দোকানে সর্বোচ্চ ${MAX_PRODUCTS}টি পণ্য`);
    const color = parseInt(np.color.slice(1), 16);
    patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: 'p' + Date.now().toString(36), name: np.name.trim(), price, image: np.image || IMG[np.kind] || ph(np.kind, color, np.name.trim()), kind: np.kind, color }] }));
    setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
  };
  const addDemo = () => {
    const need = Math.min(100, MAX_SHOPS) - shops.length;
    const slots = nextSlots(shops, Math.max(0, need));
    const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
    const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + '_x')] } : s));
    setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
  };
  const importJson = (replace: boolean) => {
    try {
      const r = normalizeShops(JSON.parse(jsonText), shops, replace);
      if (!r.added && !r.products) throw new Error('কোনো বৈধ দোকান/পণ্য পাওয়া যায়নি (প্রতিটি পণ্যে name ও price দরকার)');
      setShops(r.shops); if (replace || !sid) setSid(r.shops[0]?.id ?? '');
      const m = `✅ ${r.added}টি নতুন দোকান ও ${r.products}টি পণ্য যোগ হয়েছে (মোট ${r.shops.length}টি দোকান)`;
      setJsonMsg(m); setMessage(m);
    } catch (e) { setJsonMsg('❌ ' + (e instanceof Error ? e.message : 'JSON ভুল')); }
  };
  const exportJson = () => {
    const out = shops.map((s) => ({ name: s.name, subtitle: s.subtitle, style: s.style, accent: hex(s.accent), products: s.products.map((p) => ({ name: p.name, price: p.price, kind: p.kind, color: hex(p.color), image: p.image.startsWith('data:') ? '' : p.image })) }));
    setJsonText(JSON.stringify(out, null, 2)); setJsonMsg(`📤 ${out.length}টি দোকানের ডেটা নিচে দেওয়া হলো (আপলোড করা ছবি বাদ যায়)`);
  };
  const fetchJson = async () => {
    try { const r = await fetch(jsonUrl.trim()); if (!r.ok) throw new Error('x'); setJsonText(await r.text()); setJsonMsg('✅ লিংক থেকে ডেটা এসেছে — এবার "যোগ করুন" চাপুন'); }
    catch { setJsonMsg('❌ লিংক থেকে আনা যায়নি (ভুল লিংক বা CORS বন্ধ)। ফাইল আপলোড বা সরাসরি পেস্ট করুন'); }
  };
  const teleport = (s: Shop) => { tpRef.current = { x: 0, z: s.z }; setPanel(''); setMessage(`📍 ${s.name} এর সামনে এসেছেন`); };

  const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect(), max = r.width / 2 - 24;
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
    joyRef.current = { x: dx / max, y: dy / max }; setKnob({ x: dx, y: dy });
  };
  const joyStart = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); joyMove(e); };
  const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

  const filtered = shops.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()));
  const isNight = hour < 5.5 || hour >= 18.5;

  /* ============================ UI ============================ */
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
      <div ref={containerRef} className="absolute inset-0" />

      {hover && !selected && (
        <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs md:block">
          <div className="font-bold">{hover.name}</div><div className="font-black text-yellow-300">{taka(hover.price)}</div>
        </div>
      )}
      {!hover && <div ref={tipRef} className="hidden" />}

      {/* ⋮ মেনু বাটন — উপরে শুধু এটাই */}
      <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
        className={`absolute right-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-full text-2xl font-black ${glass}`}>⋮</button>

      {menuOpen && (<>
        <div className="absolute inset-0 z-40" onClick={() => setMenuOpen(false)} />
        <div className={`absolute right-3 top-16 z-50 max-h-[80dvh] w-[min(310px,calc(100vw-24px))] overflow-y-auto rounded-2xl p-3 ${glass}`}>
          <div className="mb-2 text-sm font-black">GRAND SHOPPING CITY</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">BALANCE</div><div className="text-sm font-black text-yellow-300">{taka(balance)}</div></div>
            <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">SCORE</div><div className="text-sm font-black text-emerald-300">{score}</div></div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
            <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('profile'); setMenuOpen(false); }}>👤 প্রোফাইল</button>
            <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('shops'); setMenuOpen(false); }}>🏪 দোকান ({shops.length})</button>
            <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setCartOpen(true); setMenuOpen(false); }}>🛒 কার্ট ({cartCount})</button>
            <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPaused((v) => !v); setMenuOpen(false); }}>{paused ? '▶️ চালু' : '⏸️ পজ'}</button>
            <button className="rounded-xl bg-amber-400/20 py-2.5 text-amber-200" onClick={() => { setPanel('tasks'); setMenuOpen(false); }}>🎯 টাস্ক ({doneToday.length}/{TASKS.length})</button>
            <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('help'); setMenuOpen(false); }}>📖 নির্দেশনা</button>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px]">
            <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { dayRef.current.auto = !autoDay; setAutoDay(!autoDay); }}>{autoDay ? '⏸' : '▶'}</button>
            <span className="w-14 shrink-0">{isNight ? '🌙' : '☀️'} {fmtHour(hour)}</span>
            <input type="range" min={0} max={24} step={0.25} value={hour} className="min-w-0 flex-1"
              onChange={(e) => { const v = Number(e.target.value); setHour(v); dayRef.current.a = ((v - 6) / 24) * Math.PI * 2; }} />
            <button className="rounded-lg bg-amber-400/90 px-2 py-1 text-slate-950" onClick={() => { sunCmdRef.current = true; setMenuOpen(false); }}>{isNight ? '🌙' : '☀️'} দেখুন</button>
          </div>
          <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-emerald-300">🟢 অনলাইন: {profile.name}{online.length ? ', ' + online.join(', ') : ''}</div>
          <div className="mt-2 text-[10px] leading-5 text-slate-400">W A S D হাঁটা • Shift দৌড় • মাউস ড্র্যাগ / Q E ঘোরা • স্ক্রল জুম • ক্লিক = পণ্য • F = বাইক</div>
        </div>
      </>)}

      {/* মেসেজ — নিচে ছোট বাবল */}
      <div key={message} className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-slate-950/80 px-4 py-2 text-center text-xs text-slate-100 backdrop-blur-md">{message}</div>

      {selected && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className={`w-full max-w-md overflow-hidden rounded-3xl ${glass}`} onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover md:h-80"
                onError={(e) => { (e.target as HTMLImageElement).src = ph(selected.kind, selected.color, selected.name); }} />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">{selected.shop}</span>
              <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs" aria-label="Close">✕</button>
            </div>
            <div className="p-4">
              <div className="text-xl font-black">{selected.name}</div>
              <div className="text-[11px] text-slate-400">মডেল নং: {modelNo(selected)}</div>
              <div className="mt-1 text-2xl font-black text-yellow-300">{taka(selected.price * qty)}</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <b className="w-6 text-center">{qty}</b>
                  <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950 hover:bg-cyan-400 active:scale-95">🛒 কার্টে নিন</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {panel === 'profile' && (
        <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
          <div className="flex items-center justify-between"><b>👤 আমার প্রোফাইল</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <div className="mt-3 flex items-center gap-3">
            {profile.photo ? <img src={profile.photo} alt="" className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">👤</div>}
            <label className={`${btn} cursor-pointer`}>ছবি বাছাই করুন
              <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProfile({ ...profile, photo: await fileToDataUrl(f, 160) }); }} />
            </label>
          </div>
          <input className={`${inp} mt-3`} maxLength={16} placeholder="আপনার নাম" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <p className="mt-2 text-[11px] text-slate-400">নাম ও ছবি আপনার কার্টুনের বুকে ও মাথার উপরে দেখা যাবে। আরেকটা ট্যাবে মল খুললে সেখানেও আপনাকে দেখা যাবে।</p>
        </div>
      )}

      {panel === 'tasks' && (
        <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,380px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
          <div className="flex items-center justify-between"><b>🎯 দৈনিক টাস্ক</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">প্রতিদিন সর্বোচ্চ {TASKS.length}টি টাস্ক করা যায়, প্রতিটি দিনে একবারই। সবগুলো শেষ করলে বোনাস +{BONUS} পয়েন্ট। রাত ১২টার পর নতুন দিনে টাস্ক আবার শুরু হয়।</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${(doneToday.length / TASKS.length) * 100}%` }} /></div>
          <div className="mt-1 text-right text-[11px] text-slate-300">আজ {doneToday.length}/{TASKS.length} সম্পন্ন</div>
          <div className="mt-2 space-y-2">
            {TASKS.map((t) => { const ok = doneToday.includes(t.id); return (
              <div key={t.id} className={`flex items-center gap-3 rounded-2xl p-3 text-xs ${ok ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                <span className="text-lg">{ok ? '✅' : '⬜'}</span>
                <span className={`flex-1 ${ok ? 'text-slate-400 line-through' : ''}`}>{t.title}</span>
                <b className="text-yellow-300">+{t.pts}</b>
              </div>); })}
          </div>
          <div className="mt-3 flex justify-between rounded-2xl bg-white/5 p-3 text-sm"><span className="text-slate-400">মোট পয়েন্ট</span><b className="text-emerald-300">{score}</b></div>
        </div>
      )}

      {panel === 'help' && (
        <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:w-[420px] ${glass}`}>
          <div className="flex items-center justify-between"><b>📖 নির্দেশনা</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <div className="mt-3 space-y-3 text-[12px] leading-6 text-slate-200">
            <section><h3 className="font-black text-cyan-300">🕹️ চলাফেরা</h3>
              <p>কিবোর্ডে W A S D বা অ্যারো কী দিয়ে হাঁটুন, Shift চেপে দৌড়ান। মাউস ড্র্যাগ বা Q / E দিয়ে ঘুরুন, স্ক্রল করে জুম করুন। মোবাইলে বাম পাশের জয়স্টিক দিয়ে চলুন, স্ক্রিনে আঙুল টেনে ঘুরুন।</p></section>
            <section><h3 className="font-black text-cyan-300">🛍️ কেনাকাটা</h3>
              <p>পণ্যের ছবিতে ক্লিক বা ট্যাপ করলে নাম, দাম ও মডেল নং সহ বিস্তারিত খুলবে। সংখ্যা ঠিক করে "কার্টে নিন" চাপুন। মেনু থেকে কার্ট খুলে Checkout করলে ব্যালেন্স থেকে টাকা কাটবে এবং কেনা প্রতিটি পণ্যের জন্য ১০০ পয়েন্ট পাবেন।</p></section>
            <section><h3 className="font-black text-cyan-300">🏍️ বাইক</h3>
              <p>F চাপলে বাইকে ওঠা-নামা যায় (মোবাইলে নিচের ডানের বাটন)। বাইক দূরে থাকলে প্রথমবার F চাপলে সেটা আপনার পাশে আসবে। দোকানের ভেতরে বাইক চলে না।</p></section>
            <section><h3 className="font-black text-cyan-300">🎯 দৈনিক টাস্ক ও পয়েন্ট</h3>
              <p>দিনে সর্বোচ্চ {TASKS.length}টি টাস্ক: দোকানে ঢোকা, পণ্য দেখা, কার্টে যোগ করা ও বাইকে চড়া। প্রতিটির আলাদা পয়েন্ট আছে, সব শেষ করলে বোনাস +{BONUS}। মেনুর "🎯 টাস্ক" থেকে অগ্রগতি দেখুন।</p></section>
            <section><h3 className="font-black text-cyan-300">🌗 দিন-রাত</h3>
              <p>মেনুর স্লাইডার দিয়ে সময় বদলান, ⏸ দিয়ে সময় থামান, "দেখুন" চাপলে ক্যামেরা সূর্য বা চাঁদের দিকে ঘুরবে।</p></section>
            <section><h3 className="font-black text-cyan-300">🏪 দোকান ও পণ্য যোগ করা</h3>
              <p>মেনু → দোকান। সেখানে নতুন দোকান খুলুন, পণ্যের নাম, দাম ও ছবির লিংক দিয়ে পণ্য যোগ করুন। তালিকার ✏️ দিয়ে নাম ও দাম এবং 🖼️ দিয়ে ছবির লিংক বদলানো যায়। একটি দোকানে সর্বোচ্চ {MAX_PRODUCTS}টি পণ্য এবং মোট {MAX_SHOPS}টি দোকান রাখা যায়।</p></section>
            <section><h3 className="font-black text-cyan-300">📦 JSON দিয়ে ডেটা যোগ</h3>
              <p>দোকান প্যানেলের নিচে "JSON ডেটা" অংশে অ্যারে পেস্ট করুন, ফাইল আপলোড করুন বা লিংক থেকে আনুন। "➕ যোগ করুন" দিলে একই নামের দোকানে পণ্য যোগ হবে, নতুন নাম হলে নতুন দোকান খুলবে। "♻️ সব বদলান" দিলে আগের সব দোকান মুছে নতুনগুলো বসবে। "📄 নমুনা" চেপে ফরম্যাট দেখে নিন।</p>
              <pre className="mt-1 overflow-x-auto rounded-xl bg-black/40 p-2 text-[10px] leading-4 text-emerald-200">{`[{ "name": "MY SHOP", "subtitle": "ট্যাগলাইন",
   "style": "fashion|tech|home|market",
   "accent": "#e11d48",
   "products": [{ "name": "পণ্য", "price": 500,
      "image": "https://...jpg", "kind": "bag",
      "color": "#2563eb" }] }]`}</pre>
              <p className="mt-1 text-slate-400">name ও price বাধ্যতামূলক। image না দিলে ধরন অনুযায়ী ডিফল্ট ছবি বসবে। ছবি লোড না হলে নামসহ রঙিন কার্ড দেখাবে।</p></section>
          </div>
        </div>
      )}

      {panel === 'shops' && (
        <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:w-[400px] ${glass}`}>
          <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
          <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
              {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
            </select>
            {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
          </div>
          {shop && (<>
            <div className="mt-2 flex gap-2">
              <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
              <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
            </div>
            <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
            <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
              {shop.products.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
                  <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(p.kind, p.color, p.name); }} />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
                  <button className="rounded-lg bg-white/10 px-2 py-1" title="নাম ও দাম বদলান" onClick={() => { const n = prompt('পণ্যের নাম', p.name); if (n === null) return; const pr = Number(prompt('দাম (৳)', String(p.price))); patchShop(shop.id, (s) => ({ ...s, products: s.products.map((x) => (x.id === p.id ? { ...x, name: n.trim() || x.name, price: pr > 0 ? pr : x.price } : x)) })); }}>✏️</button>
                  <button className="rounded-lg bg-white/10 px-2 py-1" title="ছবির লিংক বদলান" onClick={() => { const l = prompt('ছবির লিংক (https://...)', p.image.startsWith('data:') ? '' : p.image); if (l === null) return; patchShop(shop.id, (s) => ({ ...s, products: s.products.map((x) => (x.id === p.id ? { ...x, image: l.trim() || IMG[x.kind] || ph(x.kind, x.color, x.name) } : x)) })); }}>🖼️</button>
                  <button className="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-300" onClick={() => patchShop(shop.id, (s) => ({ ...s, products: s.products.filter((x) => x.id !== p.id) }))}>✕</button>
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-2">
              <input className={inp} placeholder="পণ্যের নাম" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
              <div className="flex gap-2">
                <select className={inp} value={np.kind} onChange={(e) => setNp({ ...np, kind: e.target.value })}>
                  {KINDS.map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
                </select>
                <input type="color" value={np.color} onChange={(e) => setNp({ ...np, color: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
              </div>
              <input className={inp} placeholder="ছবির লিংক (https://...jpg) — খালি রাখলে ডিফল্ট ছবি" value={np.image.startsWith('data:') ? '' : np.image} onChange={(e) => setNp({ ...np, image: e.target.value.trim() })} />
              <div className="flex gap-2">
                <input className={inp} type="number" min={1} placeholder="দাম (৳)" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} />
                <label className={`${btn} flex cursor-pointer items-center whitespace-nowrap`}>{np.image ? '🖼️ ছবি ✓' : '🖼️ ছবি'}
                  <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setNp({ ...np, image: await fileToDataUrl(f, 640) }); }} />
                </label>
              </div>
              <p className="text-[10px] text-slate-400">ছবির লিংক দিন বা ফাইল আপলোড করুন। কিছু না দিলে ধরন অনুযায়ী ডিফল্ট ছবি বসবে। দোকানে শুধু পণ্যের ছবি দেখা যাবে।</p>
              <button className={`${btn} w-full`} onClick={addProduct}>➕ পণ্য যোগ করুন</button>
            </div>
            <button className="mt-2 w-full rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300"
              onClick={() => { if (confirm(`"${shop.name}" মুছে ফেলবেন?`)) { const rest = shops.filter((s) => s.id !== shop.id); setShops(rest); setSid(rest[0]?.id ?? ''); } }}>🗑️ এই দোকান মুছুন</button>
          </>)}
          <div className="mt-4 text-[11px] font-bold text-cyan-300">নতুন দোকান খুলুন</div>
          <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
            <input className={inp} placeholder="দোকানের নাম" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
            <input className={inp} placeholder="ট্যাগলাইন" value={ns.subtitle} onChange={(e) => setNs({ ...ns, subtitle: e.target.value })} />
            <div className="flex gap-2">
              <select className={inp} value={ns.style} onChange={(e) => setNs({ ...ns, style: e.target.value })}>
                {[['fashion', 'ফ্যাশন'], ['tech', 'ইলেকট্রনিক্স'], ['home', 'ফার্নিচার'], ['market', 'গ্রোসারি']].map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
              </select>
              <input type="color" value={ns.accent} onChange={(e) => setNs({ ...ns, accent: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
            </div>
            <button className={`${btn} w-full`} onClick={addShop}>🏪 দোকান তৈরি করুন</button>
          </div>
          <div className="mt-4 text-[11px] font-bold text-cyan-300">📦 JSON ডেটা (দোকান ও পণ্য)</div>
          <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
            <textarea className={`${inp} h-36 font-mono text-[11px]`} spellCheck={false} placeholder='[{"name":"MY SHOP","products":[{"name":"পণ্য","price":500,"image":"https://..."}]}]' value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <button className={btn} onClick={() => { setJsonText(SAMPLE_JSON); setJsonMsg('📄 নমুনা বসানো হয়েছে — এবার "যোগ করুন" চাপুন'); }}>📄 নমুনা</button>
              <button className={btn} onClick={exportJson}>📤 বর্তমান ডেটা</button>
              <button className={btn} onClick={() => importJson(false)}>➕ যোগ করুন</button>
              <button className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white hover:bg-rose-400" onClick={() => { if (confirm('আগের সব দোকান মুছে JSON-এর দোকান বসানো হবে। নিশ্চিত?')) importJson(true); }}>♻️ সব বদলান</button>
            </div>
            <div className="flex gap-2">
              <input className={inp} placeholder="JSON ফাইলের লিংক (https://...)" value={jsonUrl} onChange={(e) => setJsonUrl(e.target.value)} />
              <button className={`${btn} whitespace-nowrap`} onClick={fetchJson}>⬇️ আনুন</button>
            </div>
            <label className={`${btn} flex cursor-pointer justify-center`}>📁 JSON ফাইল বাছাই করুন
              <input type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setJsonText(await f.text()); setJsonMsg(`📁 ${f.name} লোড হয়েছে — এবার "যোগ করুন" চাপুন`); } e.target.value = ''; }} />
            </label>
            {jsonMsg && <p className="text-[11px] leading-5 text-slate-200">{jsonMsg}</p>}
          </div>
        </div>
      )}

      {cartOpen && (
        <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-16 md:w-80 md:rounded-3xl ${glass}`}>
          <div className="flex items-center justify-between"><h2 className="font-black">🛒 MY CART</h2><button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <div className="mt-3 space-y-2">
            {cart.length === 0 ? <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div> : cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
                <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(item.kind, item.color, item.name); }} />
                <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{taka(item.price)}</div></div>
                <div className="flex items-center gap-1 text-xs">
                  <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button><b className="w-5 text-center">{item.count}</b>
                  <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm"><span className="text-slate-400">Total</span><b className="text-yellow-300">{taka(total)}</b></div>
          <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">✅ Checkout</button>
        </aside>
      )}

      {touch && !selected && !cartOpen && !panel && !menuOpen && (
        <div className="absolute bottom-16 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
          onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
          <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-cyan-400/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
        </div>
      )} 


      {!selected && !panel && !cartOpen && !menuOpen && (
        <button onClick={() => { rideCmdRef.current = 1; }} className={`absolute bottom-16 right-5 z-30 rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
          {riding ? '🛑 নামুন (F)' : nearBike ? '🏍️ চড়ুন (F)' : '🏍️ বাইক ডাকুন (F)'}
        </button>
      )}

      {paused && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
        </div>
      )}
    </main>
  );
}














































































// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// // দরকার: three r151+ (mergeGeometries)। পুরনো ভার্সনে এটা mergeBufferGeometries নামে ছিল।
// import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// /* ============================ টাইপ ও ধ্রুবক ============================ */
// type Product = { id: string; name: string; price: number; image: string; kind: string; color: number };
// type Sel = Product & { shop: string };
// type CartItem = Sel & { count: number };
// type Shop = { id: string; name: string; subtitle: string; x: number; z: number; accent: number; style: string; products: Product[] };
// type Profile = { name: string; photo: string };
// type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
// type Slot = { x: number; y: number; z: number; ry: number; s: number };

// const MAX_SHOPS = 120;
// const LS_KEY = 'grand-mall-ls-v2';

// const KINDS: [string, string][] = [
//   ['tshirt', 'টি-শার্ট'], ['jacket', 'জ্যাকেট'], ['sneaker', 'জুতা'], ['glasses', 'সানগ্লাস'],
//   ['bag', 'ব্যাগ'], ['watch', 'ঘড়ি'], ['phone', 'ফোন'], ['camera', 'ক্যামেরা'],
//   ['headphone', 'হেডফোন'], ['chair', 'চেয়ার'], ['lamp', 'ল্যাম্প'], ['plant', 'গাছ'],
//   ['book', 'বই'], ['jar', 'মধু/জার'], ['chocolate', 'চকলেট'], ['sack', 'চালের বস্তা'],
//   ['coffee', 'কফি'], ['bottle', 'বোতল'], ['box', 'গিফট বক্স'], ['frame', 'ছবির ফ্রেম'],
// ];

// /* শেলফ ও টেবিলের স্লট — একটি দোকানে সর্বোচ্চ MAX_PRODUCTS টি পণ্য */
// const SHELF_Y = [0.8, 2.0, 3.2, 4.4];
// const TABLE_X = [-5.3, -1.8, 1.8, 5.3], TABLE_Z = [-3.5, 2.2];
// const SLOTS: Slot[] = (() => {
//   const a: Slot[] = [];
//   TABLE_Z.forEach((z) => TABLE_X.forEach((x) => a.push({ x, y: 1.66, z, ry: 0, s: 1.35 })));
//   for (const ti of [1, 2, 0, 3]) {
//     const y = SHELF_Y[ti] + 0.04;
//     for (let i = 0; i < 12; i++) {
//       const z = -7.9 + i;
//       a.push({ x: -8, y, z, ry: Math.PI / 2, s: 1 }, { x: 8, y, z, ry: -Math.PI / 2, s: 1 });
//     }
//     for (let i = 0; i < 13; i++) a.push({ x: -7.2 + i * 1.2, y, z: -9.1, ry: 0, s: 1 });
//   }
//   return a;
// })();
// const MAX_PRODUCTS = SLOTS.length;

// const shopSlot = (k: number) => ({ x: k % 2 ? 17 : -17, z: -14 - Math.floor(k / 2) * 19 });
// const nextSlots = (shops: Shop[], n: number) => {
//   const used = new Set(shops.map((s) => `${s.x},${s.z}`));
//   const out: { x: number; z: number }[] = [];
//   for (let k = 0; k < MAX_SHOPS && out.length < n; k++) { const p = shopSlot(k); if (!used.has(`${p.x},${p.z}`)) out.push(p); }
//   return out;
// };

// /* ============================ ডেমো ডেটা জেনারেটর ============================ */
// const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
// const taka = (n: number) => '৳' + n.toLocaleString();
// const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
// const IMG: Record<string, string> = {
//   tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
//   sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
//   headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
//   lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
//   sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
//   bag: u('photo-1584917865442-de89df76afd3'), plant: u('photo-1485955900006-10f4d324d411'), book: u('photo-1544716278-ca5e3f4abd8c'),
//   bottle: u('photo-1600271886742-f049cd451bba'), box: u('photo-1513885535751-8b9238bd345a'), frame: u('photo-1513519245088-0e12902e5a38'),
// };
// const STYLE_KINDS: Record<string, string[]> = {
//   fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
//   tech: ['phone', 'watch', 'camera', 'headphone'],
//   home: ['chair', 'lamp', 'plant', 'book', 'jar'],
//   market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
// };
// const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
// const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };

// /* ছবি লোড না হলে ফলব্যাক: ইমোজি নয়, নামসহ রঙিন কার্ড */
// const ph = (kind: string, c = 0x334155, label?: string) => {
//   const t = (label ?? BASE[kind] ?? 'Product').replace(/[<>&]/g, '');
//   return 'data:image/svg+xml;utf8,' + encodeURIComponent(
//     `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500">
//       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hex(c)}"/><stop offset="1" stop-color="#0b1220"/></linearGradient></defs>
//       <rect width="600" height="500" fill="url(#g)"/>
//       <text x="300" y="270" font-family="Arial" font-weight="800" font-size="52" fill="#fff" text-anchor="middle">${t}</text>
//     </svg>`);
// };

// const ADJ = ['Classic', 'Premium', 'Urban', 'Royal', 'Eco', 'Ultra', 'Smart', 'Modern', 'Elite', 'Fresh'];
// const PAL = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9, 0x14b8a6, 0xf97316, 0x64748b, 0x1e293b, 0xf1f5f9];
// const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// const genProducts = (style: string, n: number, seed: number, pre: string): Product[] => {
//   const r = rng(seed), kinds = STYLE_KINDS[style] ?? STYLE_KINDS.market;
//   return Array.from({ length: Math.min(n, MAX_PRODUCTS) }, (_, i) => {
//     const kind = kinds[i % kinds.length], color = PAL[Math.floor(r() * PAL.length)];
//     const price = Math.round((BASEP[kind] * (0.6 + r() * 1.2)) / 10) * 10;
//     return { id: `${pre}${i}`, name: `${ADJ[Math.floor(r() * ADJ.length)]} ${BASE[kind]} ${i + 1}`, price, image: IMG[kind] ?? ph(kind, color), kind, color };
//   });
// };
// const SHOP_A = ['NOVA', 'ZEN', 'ROYAL', 'URBAN', 'PRIME', 'LUXE', 'SKY', 'METRO', 'ALPHA', 'BLUE', 'GOLDEN', 'SMART', 'FRESH', 'MEGA', 'ELITE'];
// const SHOP_B: Record<string, string> = { fashion: 'FASHION', tech: 'TECH', home: 'HOME', market: 'MART' };
// const SHOP_SUB: Record<string, string> = { fashion: 'Premium Fashion', tech: 'Smart Devices', home: 'Furniture & Decor', market: 'Grocery & Food' };
// const genShop = (i: number, slot: { x: number; z: number }, nProducts: number): Shop => {
//   const style = Object.keys(STYLE_KINDS)[i % 4], r = rng(i * 977 + 13);
//   return { id: `d${i}-${Date.now().toString(36)}`, name: `${SHOP_A[Math.floor(r() * SHOP_A.length)]} ${SHOP_B[style]} ${i + 1}`, subtitle: SHOP_SUB[style], ...slot, accent: PAL[(i * 5 + 1) % (PAL.length - 1)], style, products: genProducts(style, nProducts, i * 31 + 7, `d${i}p`) };
// };
// const defaultShops = (): Shop[] => {
//   const mk = (id: string, name: string, subtitle: string, k: number, accent: number, style: string, first: Product[]): Shop =>
//     ({ id, name, subtitle, ...shopSlot(k), accent, style, products: [...first, ...genProducts(style, 36, k * 11 + 3, id + '_g')] });
//   const p = (id: string, name: string, price: number, kind: string, color: number): Product => ({ id, name, price, image: IMG[kind] ?? ph(kind, color), kind, color });
//   return [
//     mk('fashion', 'NOVA FASHION', 'Premium Fashion', 0, 0x7c3aed, 'fashion', [p('f1', 'Premium T-Shirt', 1800, 'tshirt', 0x2563eb), p('f2', 'Urban Jacket', 5200, 'jacket', 0x1e293b), p('f3', 'Classic Sunglasses', 2400, 'glasses', 0x111827), p('f4', 'Running Sneaker', 4200, 'sneaker', 0xef4444)]),
//     mk('tech', 'TECHHUB', 'Smart Devices', 1, 0x0891b2, 'tech', [p('t1', 'Smart Watch', 4500, 'watch', 0x1e293b), p('t2', 'Mirrorless Camera', 62000, 'camera', 0xcbd5e1), p('t3', 'Wireless Headphones', 6800, 'headphone', 0x111827), p('t4', 'Flagship Phone', 92000, 'phone', 0x64748b)]),
//     mk('home', 'URBAN HOME', 'Furniture & Decor', 2, 0xd97706, 'home', [p('h1', 'Designer Chair', 8500, 'chair', 0xd97706), p('h2', 'Modern Table Lamp', 3200, 'lamp', 0xfacc15)]),
//     mk('market', 'FRESH MART', 'Grocery & Food', 3, 0x16a34a, 'market', [p('m1', 'Organic Honey', 950, 'jar', 0xd9901a), p('m2', 'Imported Chocolate', 1500, 'chocolate', 0x7c3aed), p('m3', 'Premium Rice 10KG', 1800, 'sack', 0xf1f5f9), p('m4', 'Fresh Coffee', 1250, 'coffee', 0x1e293b)]),
//   ];
// };

// /* ============================ IndexedDB (বড় ডেটার জন্য) ============================ */
// const openDB = () => new Promise<IDBDatabase>((res, rej) => {
//   const r = indexedDB.open('grand-mall', 1);
//   r.onupgradeneeded = () => r.result.createObjectStore('kv');
//   r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
// });
// const kv = {
//   async get(k: string): Promise<unknown> {
//     try { const db = await openDB(); return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; }
//   },
//   async set(k: string, v: unknown) {
//     try { const db = await openDB(); await new Promise<void>((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); } catch { /* ignore */ }
//   },
// };

// const fileToDataUrl = (file: File, max: number) =>
//   new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onerror = () => rej(new Error('read'));
//     r.onload = () => {
//       const img = new Image();
//       img.onerror = () => rej(new Error('img'));
//       img.onload = () => {
//         const s = Math.min(1, max / Math.max(img.width, img.height));
//         const c = document.createElement('canvas');
//         c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
//         c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
//         res(c.toDataURL('image/jpeg', 0.82));
//       };
//       img.src = r.result as string;
//     };
//     r.readAsDataURL(file);
//   });

// /* ============================ শেয়ার্ড ক্যাশ (জিওমেট্রি / ম্যাটেরিয়াল / টেক্সচার) ============================ */
// const GC = new Map<string, THREE.BufferGeometry>();
// const G = (k: string, f: () => THREE.BufferGeometry) => { let g = GC.get(k); if (!g) { g = f(); g.userData.keep = true; GC.set(k, g); } return g; };
// const bx = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
// const cy = (a: number, b: number, h: number, s = 16) => G(`c${a}_${b}_${h}_${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
// const sp = (r: number, w = 14, h = 10) => G(`s${r}_${w}_${h}`, () => new THREE.SphereGeometry(r, w, h));
// const to = (r: number, t: number, arc = Math.PI * 2) => G(`t${r}_${t}_${arc}`, () => new THREE.TorusGeometry(r, t, 8, 22, arc));
// const cp = (r: number, l: number) => G(`p${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
// const pl = (w: number, h: number) => G(`pl${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

// const MC = new Map<string, THREE.MeshStandardMaterial>();
// const M = (c: number, r = 0.6, m = 0.1, e = 0, ei = 0) => {
//   const k = `${c}|${r}|${m}|${e}|${ei}`; let x = MC.get(k);
//   if (!x) { x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.keep = true; MC.set(k, x); }
//   return x;
// };
// const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => {
//   const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
//   const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
// };
// const TXC = new Map<string, THREE.CanvasTexture>();
// const tileTex = (a: string, b: string, rx: number, ry: number) => {
//   const k = `${a}${b}${rx}${ry}`; let t = TXC.get(k);
//   if (!t) {
//     t = canvasTex(256, 256, (x) => { x.fillStyle = a; x.fillRect(0, 0, 256, 256); x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128); x.strokeStyle = 'rgba(0,0,0,.12)'; x.strokeRect(0, 0, 256, 256); });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.userData.keep = true; TXC.set(k, t);
//   }
//   return t;
// };
// const slatTex = () => {
//   let t = TXC.get('slat');
//   if (!t) {
//     t = canvasTex(256, 64, (x) => { x.fillStyle = '#1f1710'; x.fillRect(0, 0, 256, 64); for (let k = 0; k < 16; k++) { x.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; x.fillRect(k * 16, 0, 11, 64); } });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.userData.keep = true; TXC.set('slat', t);
//   }
//   return t;
// };
// const signTexture = (title: string, sub: string, accent: number) => canvasTex(1024, 280, (x) => {
//   x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280); x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
//   x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center'; x.fillText(title, 512, 125, 960);
//   x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial'; x.fillText(sub, 512, 190, 960);
// });

// const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
//   const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); p.add(k); return k;
// };
// const tone = (c: number, k: number) => {
//   const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
//   return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
// };
// const disposeTree = (root: THREE.Object3D) => root.traverse((o) => {
//   const m = o as THREE.Mesh;
//   if (m.geometry && !(o as THREE.Sprite).isSprite && !m.geometry.userData.keep) m.geometry.dispose();
//   const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
//   mats.forEach((mm) => {
//     if (mm.userData.keep) return;
//     const mp = (mm as THREE.MeshBasicMaterial).map;
//     if (mp && !mp.userData.keep) mp.dispose();
//     mm.dispose();
//   });
// });

// /* পণ্যের ছবির কার্ড — একই ছবির জন্য একটাই ম্যাটেরিয়াল/টেক্সচার (শেয়ার্ড) */
// const PHC = new Map<string, THREE.MeshBasicMaterial>();
// const photoMat = (p: { image: string; kind: string; color: number; name: string }, tl: THREE.TextureLoader) => {
//   const key = p.image || p.kind + p.color;
//   let m = PHC.get(key);
//   if (!m) {
//     m = new THREE.MeshBasicMaterial({ toneMapped: false });
//     m.userData.keep = true;
//     const setT = (t: THREE.Texture) => { t.colorSpace = THREE.SRGBColorSpace; t.userData.keep = true; m!.map = t; m!.needsUpdate = true; };
//     tl.load(p.image || ph(p.kind, p.color, p.name), setT, undefined, () => tl.load(ph(p.kind, p.color, p.name), setT));
//     PHC.set(key, m);
//   }
//   return m;
// };

// /* ============================ ৩D পণ্য (প্রসিডিউরাল মডেল) ============================ */
// const shirtGeo = (jacket: boolean) => G(jacket ? 'jacket' : 'tshirt', () => {
//   const pts: [number, number][] = jacket
//     ? [[-.27, 0], [.27, 0], [.27, .4], [.4, .1], [.58, .16], [.46, .62], [.16, .78], [.1, .72], [-.1, .72], [-.16, .78], [-.46, .62], [-.58, .16], [-.4, .1], [-.27, .4]]
//     : [[-.24, 0], [.24, 0], [.24, .42], [.46, .34], [.54, .54], [.3, .74], [.12, .74], [.07, .64], [-.07, .64], [-.12, .74], [-.3, .74], [-.54, .54], [-.46, .34], [-.24, .42]];
//   const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
//   const d = jacket ? 0.12 : 0.08;
//   const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
// });

// function buildProduct(kind: string, color: number, image: string, tl: THREE.TextureLoader): THREE.Group {
//   const g = new THREE.Group();
//   const c = M(color, 0.5, 0.05), c2 = M(tone(color, 0.35), 0.5, 0.05), cd = M(tone(color, -0.35), 0.5, 0.05);
//   const dk = M(0x111827, 0.4, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), wh = M(0xf8fafc, 0.5, 0), gold = M(0xfacc15, 0.3, 0.8), wood = M(0x6b4a2e, 0.6, 0.05);
//   const scr = M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.7), green = M(0x1f8a4c, 0.8, 0), green2 = M(0x2f9e44, 0.8, 0);
//   const H = Math.PI / 2;
//   switch (kind) {
//     case 'tshirt':
//       add(g, shirtGeo(false), c); add(g, bx(0.5, 0.04, 0.085), c2, 0, 0.14, 0);
//       add(g, cy(0.07, 0.07, 0.012, 14), wh, 0.12, 0.47, 0.045, 1, 1, 1, H); break;
//     case 'jacket':
//       add(g, shirtGeo(true), c); add(g, bx(0.03, 0.76, 0.125), dk, 0, 0.38, 0);
//       for (const s of [-1, 1]) add(g, bx(0.14, 0.03, 0.13), dk, s * 0.15, 0.2, 0);
//       add(g, bx(0.1, 0.05, 0.13), cd, 0, 0.74, 0); break;
//     case 'sneaker':
//       add(g, bx(0.36, 0.07, 0.86), wh, 0, 0.035, 0);
//       add(g, bx(0.32, 0.3, 0.4), c, 0, 0.22, -0.2); add(g, sp(0.17), c, 0, 0.17, 0.2, 1, 0.85, 1.7);
//       add(g, bx(0.22, 0.14, 0.32), c2, 0, 0.32, 0.02); add(g, bx(0.335, 0.06, 0.45), cd, 0, 0.14, -0.05);
//       for (const z of [-0.04, 0.06, 0.16]) add(g, bx(0.2, 0.025, 0.05), wh, 0, 0.4 - z * 0.3, z);
//       break;
//     case 'glasses': {
//       const lens = M(tone(color, -0.3), 0.05, 0.9);
//       for (const s of [-1, 1]) { add(g, to(0.17, 0.022), dk, s * 0.22, 0.2, 0); add(g, cy(0.165, 0.165, 0.012, 20), lens, s * 0.22, 0.2, 0, 1, 1, 1, H); add(g, bx(0.025, 0.025, 0.5), dk, s * 0.4, 0.26, -0.25); }
//       add(g, bx(0.1, 0.025, 0.03), dk, 0, 0.26, 0); break;
//     }
//     case 'watch':
//       add(g, cy(0.14, 0.17, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.03, 0.03, 0.2, 10), mt, 0, 0.12, 0);
//       add(g, to(0.2, 0.05), c, 0, 0.38, 0, 1, 1.1, 0.6); add(g, cy(0.17, 0.17, 0.07, 24), mt, 0, 0.38, 0, 1, 1, 1, H);
//       add(g, cy(0.145, 0.145, 0.078, 24), scr, 0, 0.38, 0, 1, 1, 1, H); add(g, cy(0.02, 0.02, 0.06, 8), mt, 0.19, 0.42, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.02, 0.1, 0.01), wh, 0, 0.42, 0.042); add(g, bx(0.07, 0.02, 0.01), wh, 0.03, 0.38, 0.042); break;
//     case 'phone': {
//       const t = new THREE.Group(); t.position.y = 0.42; t.rotation.x = -0.1; g.add(t);
//       add(t, bx(0.36, 0.74, 0.045), c, 0, 0, 0); add(t, bx(0.33, 0.7, 0.01), scr, 0, 0, 0.024);
//       add(t, bx(0.13, 0.13, 0.02), dk, -0.08, 0.27, -0.03); add(t, cy(0.035, 0.035, 0.02, 12), M(0x38bdf8, 0.1, 0.9), -0.08, 0.27, -0.045, 1, 1, 1, H);
//       add(t, bx(0.12, 0.012, 0.012), wh, 0, 0.3, 0.032); add(g, bx(0.2, 0.05, 0.1), mt, 0, 0.025, -0.02); break;
//     }
//     case 'camera':
//       add(g, bx(0.7, 0.38, 0.3), dk, 0, 0.25, 0); add(g, bx(0.7, 0.12, 0.31), mt, 0, 0.44, 0); add(g, bx(0.2, 0.1, 0.2), dk, -0.1, 0.55, 0);
//       add(g, cy(0.17, 0.17, 0.24, 22), dk, 0.03, 0.25, 0.25, 1, 1, 1, H); add(g, cy(0.18, 0.18, 0.04, 22), mt, 0.03, 0.25, 0.2, 1, 1, 1, H);
//       add(g, cy(0.12, 0.12, 0.02, 22), M(0x1e3a8a, 0.05, 0.9, 0x1e40af, 0.4), 0.03, 0.25, 0.375, 1, 1, 1, H);
//       add(g, bx(0.18, 0.32, 0.12), dk, -0.26, 0.22, 0.14); add(g, cy(0.04, 0.04, 0.04, 10), c, 0.26, 0.5, 0); break;
//     case 'headphone':
//       add(g, cy(0.17, 0.19, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.035, 0.035, 0.3, 10), mt, 0, 0.17, 0);
//       add(g, to(0.3, 0.035, Math.PI), c, 0, 0.36, 0);
//       for (const s of [-1, 1]) { add(g, cy(0.13, 0.13, 0.1, 18), c, s * 0.32, 0.36, 0, 1, 1, 1, 0, 0, H); add(g, cy(0.11, 0.11, 0.05, 18), dk, s * 0.26, 0.36, 0, 1, 1, 1, 0, 0, H); }
//       break;
//     case 'chair':
//       add(g, bx(0.55, 0.07, 0.55), wood, 0, 0.5, 0); add(g, bx(0.5, 0.1, 0.5), c, 0, 0.58, 0); add(g, bx(0.52, 0.5, 0.07), c, 0, 0.88, -0.25, 1, 1, 1, -0.12);
//       for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, cy(0.03, 0.022, 0.5, 8), wood, sx * 0.23, 0.25, sz * 0.23);
//       break;
//     case 'lamp':
//       add(g, cy(0.16, 0.19, 0.04, 20), dk, 0, 0.02, 0); add(g, cy(0.022, 0.022, 0.55, 8), gold, 0, 0.3, 0);
//       add(g, cy(0.16, 0.3, 0.34, 24), M(tone(color, 0.5), 0.7, 0, color, 0.55), 0, 0.72, 0); add(g, sp(0.07), M(0xfff3c4, 0.3, 0, 0xffe08a, 2), 0, 0.68, 0); break;
//     case 'plant':
//       add(g, cy(0.2, 0.15, 0.3, 16), c, 0, 0.15, 0); add(g, cy(0.2, 0.2, 0.03, 16), dk, 0, 0.3, 0);
//       add(g, sp(0.22), green, 0, 0.5, 0); add(g, sp(0.16), green2, 0.16, 0.42, 0.05); add(g, sp(0.17), green2, -0.15, 0.44, -0.05); add(g, sp(0.14), green, 0, 0.7, 0); break;
//     case 'book':
//       add(g, bx(0.5, 0.12, 0.38), c, 0, 0.06, 0); add(g, bx(0.46, 0.08, 0.36), wh, 0.02, 0.06, 0.005);
//       add(g, bx(0.46, 0.1, 0.34), c2, 0.02, 0.17, 0, 1, 1, 1, 0, 0.15); add(g, bx(0.5, 0.012, 0.1), gold, 0, 0.13, 0.15); break;
//     case 'jar':
//       add(g, cy(0.2, 0.2, 0.38, 20), M(0xd9901a, 0.12, 0.1, 0x7a4a00, 0.25), 0, 0.22, 0); add(g, cy(0.21, 0.21, 0.08, 20), gold, 0, 0.45, 0);
//       add(g, cy(0.205, 0.205, 0.17, 20), M(0xfdf3d8, 0.7, 0), 0, 0.22, 0); add(g, cy(0.1, 0.1, 0.01, 6), M(0xd9901a, 0.5, 0), 0, 0.22, 0.205, 1, 1, 1, H); break;
//     case 'chocolate':
//       add(g, bx(0.5, 0.72, 0.09), c, 0, 0.37, 0); add(g, bx(0.52, 0.14, 0.1), gold, 0, 0.52, 0); add(g, bx(0.3, 0.26, 0.01), wh, 0, 0.26, 0.05); add(g, bx(0.2, 0.05, 0.012), c, 0, 0.26, 0.056); break;
//     case 'sack':
//       add(g, bx(0.5, 0.66, 0.26), M(0xefe6cf, 0.9, 0), 0, 0.34, 0); add(g, bx(0.52, 0.2, 0.27), c, 0, 0.38, 0); add(g, cp(0.05, 0.12), M(0xefe6cf, 0.9, 0), 0, 0.74, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.28, 0.1, 0.01), wh, 0, 0.38, 0.14); break;
//     case 'coffee':
//       add(g, bx(0.42, 0.62, 0.2), dk, 0, 0.32, 0); add(g, bx(0.43, 0.22, 0.21), c, 0, 0.34, 0); add(g, bx(0.42, 0.06, 0.22), M(0x2b2f3a, 0.6, 0.1), 0, 0.65, 0);
//       add(g, cy(0.04, 0.04, 0.02, 12), wh, 0, 0.52, 0.105, 1, 1, 1, H); add(g, bx(0.2, 0.05, 0.01), gold, 0, 0.34, 0.11); break;
//     case 'bottle':
//       add(g, cy(0.13, 0.13, 0.46, 18), M(color, 0.12, 0.1), 0, 0.24, 0); add(g, cy(0.05, 0.12, 0.14, 14), M(color, 0.12, 0.1), 0, 0.54, 0); add(g, cy(0.05, 0.05, 0.16, 12), M(color, 0.12, 0.1), 0, 0.66, 0);
//       add(g, cy(0.055, 0.055, 0.06, 12), gold, 0, 0.76, 0); add(g, cy(0.135, 0.135, 0.2, 18), wh, 0, 0.24, 0); break;
//     case 'bag':
//       add(g, bx(0.58, 0.4, 0.22), c, 0, 0.22, 0); add(g, bx(0.59, 0.14, 0.24), cd, 0, 0.41, 0); add(g, to(0.17, 0.02, Math.PI), dk, 0, 0.46, 0); add(g, bx(0.08, 0.08, 0.02), gold, 0, 0.38, 0.125); break;
//     case 'frame': {
//       const tex = tl.load(image || ph('frame')); tex.colorSpace = THREE.SRGBColorSpace;
//       add(g, bx(0.72, 0.57, 0.05), wood, 0, 0.36, 0); add(g, pl(0.6, 0.45), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.36, 0.028); add(g, bx(0.04, 0.4, 0.04), wood, 0, 0.2, -0.1, 1, 1, 1, 0.3); break;
//     }
//     default:
//       add(g, bx(0.5, 0.4, 0.5), c, 0, 0.2, 0); add(g, bx(0.54, 0.08, 0.54), c2, 0, 0.44, 0);
//       add(g, bx(0.1, 0.4, 0.52), gold, 0, 0.2, 0); add(g, bx(0.52, 0.4, 0.1), gold, 0, 0.2, 0); add(g, sp(0.09), gold, -0.07, 0.54, 0, 1.3, 0.8, 1); add(g, sp(0.09), gold, 0.07, 0.54, 0, 1.3, 0.8, 1);
//   }
//   return g;
// }

// /* একই ম্যাটেরিয়ালের সব মেশ একসাথে মার্জ — ১৫০+ পণ্যেও ড্র-কল কম */
// function bake(root: THREE.Object3D): THREE.Mesh[] {
//   root.updateMatrixWorld(true);
//   const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
//   root.traverse((o) => {
//     const m = o as THREE.Mesh; if (!m.isMesh) return;
//     let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
//     g.applyMatrix4(m.matrixWorld);
//     const mat = m.material as THREE.Material, arr = buckets.get(mat);
//     if (arr) arr.push(g); else buckets.set(mat, [g]);
//   });
//   const out: THREE.Mesh[] = [];
//   buckets.forEach((list, mat) => {
//     const merged = mergeGeometries(list, false); list.forEach((x) => x.dispose());
//     if (merged) out.push(new THREE.Mesh(merged, mat));
//   });
//   return out;
// }

// /* ============================ মানুষ (আরো সুন্দর কার্টুন) ============================ */
// type HumanOpts = { shirt?: number; pants?: number; skin?: number; hair?: number; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; female?: boolean; glasses?: boolean; shoe?: number };
// function buildHuman(o: HumanOpts = {}) {
//   const skin = M(o.skin ?? 0xc98262, 0.55, 0), shirt = M(o.shirt ?? 0x2563eb, 0.6, 0), pants = M(o.pants ?? 0x1e293b, 0.7, 0), hair = M(o.hair ?? 0x17120f, 0.45, 0.1);
//   const dark = M(0x0a0a0a, 0.5, 0.1), white = M(0xffffff, 0.3, 0), shoe = M(o.shoe ?? 0xf1f5f9, 0.5, 0.1), sole = M(0x1f2937, 0.8, 0), lip = M(0xb4534b, 0.5, 0);
//   const fem = !!o.female, H = Math.PI / 2;
//   const group = new THREE.Group(), root = new THREE.Group(); group.add(root);

//   add(root, cp(0.36, 0.46), shirt, 0, 2.4, 0, fem ? 0.9 : 1, 1, 0.6);
//   add(root, sp(0.3), fem ? shirt : pants, 0, 1.75, 0, 1.12, 0.62, 0.78);
//   if (fem) add(root, cy(0.3, 0.52, 0.7, 20), shirt, 0, 1.62, 0);
//   else { add(root, bx(0.74, 0.08, 0.46), dark, 0, 1.9, 0); add(root, bx(0.1, 0.1, 0.05), M(0xfacc15, 0.3, 0.8), 0, 1.9, -0.24); }
//   add(root, cy(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
//   add(root, to(0.13, 0.035), shirt, 0, 2.97, 0, 1, 1, 1, H);

//   const arm = (s: number) => {
//     const a = new THREE.Group(); a.position.set(s * (fem ? 0.48 : 0.52), 2.8, 0); root.add(a);
//     add(a, sp(0.14), shirt, 0, 0, 0); add(a, cp(0.11, 0.26), shirt, 0, -0.24, 0); add(a, cp(0.085, 0.3), skin, 0, -0.64, 0); add(a, sp(0.095), skin, 0, -0.92, 0);
//     return a;
//   };
//   const leg = (s: number) => {
//     const l = new THREE.Group(); l.position.set(s * 0.2, 1.72, 0); root.add(l);
//     add(l, cp(0.14, 1.26), fem ? skin : pants, 0, -0.78, 0);
//     if (!fem) add(l, to(0.14, 0.02), dark, 0, -1.48, 0, 1, 1, 1, H);
//     add(l, bx(0.27, 0.14, 0.54), shoe, 0, -1.6, -0.1); add(l, bx(0.28, 0.05, 0.56), sole, 0, -1.695, -0.1);
//     return l;
//   };
//   const AL = arm(-1), AR = arm(1), LL = leg(-1), LR = leg(1);

//   const head = new THREE.Group(); head.position.set(0, 3.42, 0); root.add(head);
//   add(head, sp(0.3, 24, 18), skin, 0, 0, 0, 0.9, 1.08, 0.98);
//   for (const s of [-1, 1]) {
//     add(head, sp(0.05), skin, s * 0.27, -0.02, 0.0, 0.6, 1, 0.8);
//     add(head, sp(0.055), white, s * 0.105, 0.05, -0.252, 1, 0.8, 0.5); add(head, sp(0.03), dark, s * 0.105, 0.05, -0.28, 1, 1, 0.5);
//     add(head, bx(0.1, 0.018, 0.02), hair, s * 0.105, 0.14, -0.265, 1, 1, 1, 0, 0, s * 0.12);
//     if (o.glasses) add(head, to(0.075, 0.01), dark, s * 0.105, 0.05, -0.285);
//   }
//   if (o.glasses) add(head, bx(0.06, 0.012, 0.012), dark, 0, 0.06, -0.285);
//   add(head, sp(0.04), skin, 0, -0.03, -0.285, 1, 1.1, 1); add(head, to(0.065, 0.012, Math.PI), lip, 0, -0.1, -0.27, 1, 1, 0.5, 0, 0, Math.PI);
//   const capG = G('hcap', () => new THREE.SphereGeometry(0.315, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
//   const st = o.style ?? 'short';
//   if (st !== 'bald') {
//     add(head, capG, st === 'cap' ? shirt : hair, 0, 0.02, 0.03, 0.93, 1.1, 1);
//     if (st === 'short' || st === 'bun') add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9);
//     if (st === 'long') { add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9); add(head, cp(0.24, 0.5), hair, 0, -0.38, 0.15, 1, 1, 0.55); }
//     if (st === 'bun') add(head, sp(0.12), hair, 0, 0.36, 0.1);
//     if (st === 'cap') add(head, bx(0.4, 0.03, 0.28), shirt, 0, 0.12, -0.3);
//   }

//   const nm: { chest?: THREE.Mesh; tag?: THREE.Sprite } = {};
//   const setName = (name: string, photo?: string) => {
//     const make = (w: number, h: number, img?: HTMLImageElement) => {
//       const c = document.createElement('canvas'); c.width = w; c.height = h;
//       const x = c.getContext('2d')!;
//       x.fillStyle = 'rgba(5,11,22,.85)'; x.fillRect(0, 0, w, h);
//       const r = h / 2 - 8;
//       x.save(); x.beginPath(); x.arc(h / 2, h / 2, r, 0, 7); x.clip();
//       if (img) { const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, h / 2 - r, h / 2 - r, r * 2, r * 2); }
//       else { x.fillStyle = '#38bdf8'; x.fillRect(0, 0, h, h); }
//       x.restore();
//       x.fillStyle = '#fff'; x.font = `800 ${h * 0.4}px Arial`; x.textAlign = 'left'; x.textBaseline = 'middle';
//       x.fillText(name, h + 4, h / 2 + 2, w - h - 14);
//       const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
//     };
//     const apply = (img?: HTMLImageElement) => {
//       const ct = make(256, 96, img), tt = make(512, 128, img);
//       if (!nm.chest || !nm.tag) {
//         nm.chest = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshBasicMaterial({ map: ct }));
//         nm.chest.position.set(0, 2.5, -0.245); nm.chest.rotation.y = Math.PI; root.add(nm.chest);
//         nm.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tt, depthTest: false }));
//         nm.tag.scale.set(1.6, 0.4, 1); nm.tag.position.y = 0.62; nm.tag.renderOrder = 10; head.add(nm.tag);
//       } else {
//         const cm = nm.chest.material as THREE.MeshBasicMaterial, tm = nm.tag.material as THREE.SpriteMaterial;
//         cm.map?.dispose(); cm.map = ct; tm.map?.dispose(); tm.map = tt;
//       }
//     };
//     apply();
//     if (photo) { const im = new Image(); im.onload = () => apply(im); im.src = photo; }
//   };

//   /* বাইকে বসার ভঙ্গি */
//   let riding = false;
//   const setRide = (v: boolean) => { riding = v; };

//   const update = (phase: number, amt: number, t: number) => {
//     if (riding) {
//       LL.rotation.x = LR.rotation.x = 0.7; AL.rotation.x = AR.rotation.x = 1.1;
//       AL.rotation.z = 0.12; AR.rotation.z = -0.12; root.position.y = 0; head.rotation.y = 0;
//       return;
//     }
//     const s = Math.sin(phase) * 0.7 * amt;
//     LL.rotation.x = s; LR.rotation.x = -s; AL.rotation.x = -s * 0.8; AR.rotation.x = s * 0.8;
//     AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
//     root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
//     head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
//   };
//   return { group, update, setName, setRide };
// }
// type Human = ReturnType<typeof buildHuman>;

// /* ============================ মোটরসাইকেল ============================ */
// function buildMoto() {
//   const g = new THREE.Group(), H = Math.PI / 2;
//   const body = M(0xdc2626, 0.3, 0.6), dk = M(0x111827, 0.5, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), tire = M(0x0a0a0a, 0.9, 0);
//   const lampM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2.5), tail = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const wheel = (z: number) => {
//     const w = new THREE.Group(); w.position.set(0, 0.63, z); g.add(w);
//     add(w, to(0.5, 0.13), tire, 0, 0, 0, 1, 1, 1, 0, H, 0);
//     add(w, cy(0.4, 0.4, 0.1, 18), mt, 0, 0, 0, 1, 1, 1, 0, 0, H);
//     add(w, bx(0.06, 0.9, 0.06), dk); add(w, bx(0.06, 0.06, 0.9), dk);
//     return w;
//   };
//   const wf = wheel(-1.25), wr = wheel(1.1);
//   add(g, bx(0.4, 0.5, 0.9), mt, 0, 0.8, 0.05);                       // ইঞ্জিন
//   add(g, sp(0.4), body, 0, 1.45, -0.3, 0.8, 0.7, 1.5);               // ট্যাংক
//   add(g, bx(0.46, 0.16, 0.95), dk, 0, 1.25, 0.35);                   // সিট
//   add(g, bx(0.4, 0.08, 0.8), body, 0, 1.0, 1.05, 1, 1, 1, -0.2);     // পেছনের ফেন্ডার
//   for (const s of [-1, 1]) add(g, cy(0.035, 0.035, 1.16, 8), mt, s * 0.18, 1.14, -0.975, 1, 1, 1, 0.495); // ফর্ক
//   add(g, bx(1.0, 0.05, 0.05), dk, 0, 1.7, -0.7);                     // হ্যান্ডেলবার
//   add(g, sp(0.15), lampM, 0, 1.55, -0.9);                            // হেডলাইট
//   add(g, bx(0.25, 0.1, 0.06), tail, 0, 1.05, 1.5);                   // টেইললাইট
//   add(g, cy(0.07, 0.09, 1.0, 10), mt, 0.3, 0.55, 0.55, 1, 1, 1, H);  // এক্সজস্ট
//   const lamp = new THREE.SpotLight(0xfff2cc, 0, 60, 0.55, 0.5, 1.5);
//   lamp.position.set(0, 1.5, -1.1); lamp.target.position.set(0, 0.2, -14); g.add(lamp, lamp.target);
//   g.traverse((o) => { o.castShadow = true; });
//   return { g, wf, wr, lamp };
// }

// /* ============================ আকাশ, সূর্য, চাঁদ, তারা ============================ */
// function makeSky() {
//   const mat = new THREE.ShaderMaterial({
//     side: THREE.BackSide, depthWrite: false,
//     uniforms: { zenith: { value: new THREE.Vector3() }, horizon: { value: new THREE.Vector3() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Vector3(1, 1, 1) }, night: { value: 0 } },
//     vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
//     fragmentShader: `
//       varying vec3 vD; uniform vec3 zenith, horizon, sunDir, sunCol; uniform float night;
//       void main(){
//         vec3 d = normalize(vD); float h = d.y;
//         vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.5));
//         col = mix(col, horizon*0.55, clamp(-h*4.0,0.0,1.0));
//         float sd = max(dot(d, sunDir), 0.0);
//         col += sunCol*(pow(sd,6.0)*0.18 + pow(sd,48.0)*0.55);
//         col = mix(col, vec3(1.0,0.98,0.9), smoothstep(0.9988,0.9994,sd));
//         float md = max(dot(d,-sunDir),0.0);
//         col = mix(col, vec3(0.92,0.95,1.0), smoothstep(0.9993,0.9997,md)*night);
//         vec3 p = floor(d*220.0);
//         float s = fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453);
//         col += vec3(step(0.9985,s))*night*step(0.05,h);
//         gl_FragColor = vec4(col,1.0);
//       }`,
//   });
//   const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
//   mesh.renderOrder = -10; mesh.frustumCulled = false;
//   return mesh;
// }
// const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
// const NZ = [0.02, 0.04, 0.11], DZ = [0.14, 0.4, 0.85], SZ = [0.28, 0.2, 0.5];
// const NH = [0.07, 0.09, 0.2], DH = [0.7, 0.85, 1], SH = [1, 0.58, 0.32];

// /* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, গাছ, মেঘ, পাখি ============================ */
// function addOutdoors(scene: THREE.Scene) {
//   const bcol: Box2[] = []; // বাইরের বস্তুর collision (শহর addCity থেকে যোগ হয়)
//   const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
//     const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
//   };
//   plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
//   plane(1600, 30, 0x6b7280, 0.012, 64); // ফুটপাত/প্লাজা
//   const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
//   const m4 = new THREE.Matrix4();
//   for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
//   scene.add(dashes);

//   // গাছ
//   const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
//   for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
//     const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
//     add(t, cy(0.25, 0.35, 3, 8), M(0x5b3a1e, 0.9, 0), 0, 1.5, 0); add(t, ico, leafMs[k % 3], 0, 4, 0); add(t, ico, leafMs[(k + 1) % 3], 0.6, 5.2, 0.2, 0.7, 0.7, 0.7);
//     t.scale.setScalar(0.9 + (k % 4) * 0.12); scene.add(t);
//   }

//   // গাড়ি
//   const wheelM = M(0x0a0a0a, 0.8, 0), lightM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2), tailM = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const cars = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316].map((color, i) => {
//     const dir = i % 2 ? -1 : 1, g = new THREE.Group();
//     add(g, bx(4.2, 0.9, 1.9), M(color, 0.3, 0.6), 0, 0.8, 0); add(g, bx(2.2, 0.8, 1.7), M(0x9edfff, 0.1, 0.3), -0.2, 1.6, 0);
//     for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) add(g, cy(0.4, 0.4, 0.3, 16), wheelM, wx, 0.4, wz, 1, 1, 1, Math.PI / 2);
//     for (const lz of [-0.6, 0.6]) { add(g, bx(0.1, 0.2, 0.35), lightM, 2.1, 0.85, lz); add(g, bx(0.1, 0.2, 0.35), tailM, -2.1, 0.85, lz); }
//     g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
//     return { g, dir, sp: 9 + (i % 4) * 3 };
//   });

//   // মেঘ
//   const cloudTex = canvasTex(128, 64, (x) => {
//     for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 88, cyy = 28 + Math.random() * 12, r = 14 + Math.random() * 12, gr = x.createRadialGradient(cx, cyy, 0, cx, cyy, r); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cyy, r, 0, 7); x.fill(); }
//   });
//   const clouds = Array.from({ length: 16 }, (_, i) => {
//     const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
//     s.scale.set(90 + (i % 4) * 25, 36 + (i % 3) * 8, 1); s.position.set(-250 + i * 34, 85 + (i % 5) * 14, -150 + ((i * 53) % 260)); scene.add(s); return s;
//   });

//   // পাখি
//   const wingG = G('wing', () => new THREE.PlaneGeometry(1.2, 0.4)), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
//   const birds = Array.from({ length: 14 }, (_, i) => {
//     const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group();
//     const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
//     wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6; L.add(wl); R.add(wr);
//     const b = new THREE.Mesh(sp(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
//     g.add(L, R, b); scene.add(g);
//     return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
//   });

//   const update = (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
//     cars.forEach((c) => { c.g.position.x += c.dir * c.sp * dt; if (c.g.position.x > 150) c.g.position.x = -150; if (c.g.position.x < -150) c.g.position.x = 150; });
//     birds.forEach((b) => {
//       const a = t * b.sp + b.off;
//       b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6); b.g.rotation.y = -a;
//       const f = Math.sin(t * 9 + b.off) * 0.7; b.L.rotation.z = f; b.R.rotation.z = -f; b.g.visible = dayF > 0.15;
//     });
//     clouds.forEach((c, i) => {
//       c.position.x += dt * (1.5 + (i % 3) * 0.6); if (c.position.x > 280) c.position.x = -280;
//       const m = c.material as THREE.SpriteMaterial; m.color.setRGB(cloudRGB[0], cloudRGB[1], cloudRGB[2], THREE.SRGBColorSpace); m.opacity = 0.35 + 0.55 * dayF;
//     });
//   };
//   return { update, col: bcol };
// }

// /* ============================ রিয়েলিস্টিক শহর + বাজার ============================ */
// function addCity(scene: THREE.Scene) {
//   const col: Box2[] = [], rr = rng(7), dummy = new THREE.Object3D(), tc = new THREE.Color();

//   /* ভবনের মুখ: জানালা + রাতে জ্বলা আলো */
//   const facades = ['#8c7b6b', '#9aa5b5', '#b08968', '#6f7f95', '#c2b8a3', '#7d8a7a'].map((c, s) => {
//     const r = rng(s * 91 + 5), lit = Array.from({ length: 128 }, () => r() < 0.4);
//     const map = canvasTex(128, 256, (x) => {
//       x.fillStyle = c; x.fillRect(0, 0, 128, 256);
//       lit.forEach((_, i) => { x.fillStyle = '#2b3d58'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 3); });
//     });
//     const em = canvasTex(128, 256, (x) => {
//       x.fillStyle = '#000'; x.fillRect(0, 0, 128, 256); x.fillStyle = '#ffd27a';
//       lit.forEach((on, i) => { if (on) x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); });
//     });
//     [map, em].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.userData.keep = true; });
//     return new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.75 });
//   });
//   const shopGlow = new THREE.MeshStandardMaterial({ color: 0x1b2a40, emissive: 0xffe2a8, emissiveIntensity: 0.3, roughness: 0.2 });

//   const tower = (x: number, z: number, w: number, h: number, d: number, fi: number) => {
//     const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv as THREE.BufferAttribute;
//     for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 16, (uv.getY(i) * h) / 48);
//     const m = new THREE.Mesh(g, facades[fi % 6]); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m);
//     add(scene, bx(w * 0.35, 3, d * 0.35), M(0x59606b, 0.8, 0.1), x, h + 1.5, z);
//     if (fi % 2) add(scene, cy(1.4, 1.4, 3, 10), M(0x6b4a2e, 0.9, 0), x + w * 0.25, h + 1.5, z - d * 0.2);
//     col.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
//   };

//   /* সামনের সারি: নিচে দোকান (সাইনবোর্ড, শামিয়ানা, আলোকিত কাচ) */
//   const NAMES = ['BAZAAR', 'CAFE', 'PHARMACY', 'FASHION', 'BOOKS', 'MOBILE', 'BAKERY', 'ELECTRO', 'GROCERY', 'TAILOR'];
//   const AWN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899];
//   for (let i = -9; i <= 9; i++) {
//     const x = i * 17, w = 15, d = 14, fi = i + 9, fz = 92 - d / 2 - 0.06;
//     tower(x, 92, w, 22 + rr() * 20, d, fi);
//     const win = new THREE.Mesh(new THREE.PlaneGeometry(w - 3, 3), shopGlow); win.position.set(x, 1.9, fz - 0.01); win.rotation.y = Math.PI; scene.add(win);
//     const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2), new THREE.MeshBasicMaterial({ map: signTexture(NAMES[fi % 10], 'OPEN 24H', AWN[fi % 6]) }));
//     sign.position.set(x, 5.2, fz - 0.03); sign.rotation.y = Math.PI; scene.add(sign);
//     add(scene, bx(w - 2, 0.15, 2.2), M(AWN[fi % 6], 0.7, 0), x, 3.7, fz - 1.0, 1, 1, 1, -0.2).castShadow = true;
//   }
//   for (let x = -260, k = 0; x <= 260; x += 26, k++) tower(x + rr() * 3, 125, 18 + rr() * 6, 40 + rr() * 60, 16, k);
//   for (let x = -420, k = 0; x <= 420; x += 34, k++) tower(x, 200 + rr() * 40, 24, 70 + rr() * 110, 22, k + 2);

//   /* রাস্তা: জেব্রা ক্রসিং, কার্ব */
//   const zeb = new THREE.InstancedMesh(bx(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 27);
//   let zi = 0;
//   for (const cx of [-60, 0, 60]) for (let k = 0; k < 9; k++) { dummy.position.set(cx - 4 + k, 0.035, 39); dummy.scale.set(0.55, 0.02, 15); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); zeb.setMatrixAt(zi++, dummy.matrix); }
//   scene.add(zeb);
//   for (const z of [30.85, 47.15]) add(scene, bx(1600, 0.18, 0.3), M(0x9ca3af, 0.8, 0), 0, 0.09, z).receiveShadow = true;

//   /* রাস্তার বাতি (রাতে জ্বলে) */
//   const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd98a, emissiveIntensity: 0 });
//   const lp: [number, number][] = [];
//   for (let x = -150; x <= 150; x += 15) lp.push([x, 50.5], [x, 78]);
//   const poles = new THREE.InstancedMesh(bx(0.18, 5.5, 0.18), M(0x2b3550, 0.5, 0.6), lp.length), heads = new THREE.InstancedMesh(sp(0.4), lampMat, lp.length);
//   lp.forEach(([x, z], i) => {
//     dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0);
//     dummy.position.set(x, 2.75, z); dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
//     dummy.position.set(x, 5.6, z); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
//   });
//   scene.add(poles, heads);

//   /* বাজার: ৪৮টি স্টল (টেবিল, ডোরাকাটা শামিয়ানা, ক্রেট, ফল/সবজি) */
//   const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number) => {
//     const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; scene.add(m); let i = 0;
//     return (x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, c?: number) => {
//       dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(rx, 0, 0); dummy.updateMatrix();
//       m.setMatrixAt(i, dummy.matrix); if (c !== undefined) m.setColorAt(i, tc.setHex(c)); i++;
//     };
//   };
//   const stripe = canvasTex(64, 16, (x) => { for (let j = 0; j < 8; j++) { x.fillStyle = j % 2 ? '#ffffff' : '#d1d5db'; x.fillRect(j * 8, 0, 8, 16); } });
//   stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping;
//   const NS = 48;
//   const putPost = inst(cy(0.05, 0.05, 2.6, 6), M(0x2b3550, 0.5, 0.6), NS * 4), putTab = inst(bx(1, 1, 1), M(0x7a5230, 0.7, 0.05), NS);
//   const putCan = inst(bx(1, 1, 1), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.8 }), NS);
//   const putCrate = inst(bx(1, 1, 1), M(0xb08968, 0.8, 0), NS * 3), putFruit = inst(sp(0.15, 8, 6), M(0xffffff, 0.6, 0), NS * 12);
//   const PROD = [0xef4444, 0xf59e0b, 0x84cc16, 0x16a34a, 0xfacc15, 0xa855f7, 0xf97316], CAN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9];
//   let si = 0;
//   for (const z of [58, 70]) for (const sg of [-1, 1]) for (let k = 0; k < 12; k++, si++) {
//     const x = sg * (14 + k * 8.5);
//     putTab(x, 0.45, z, 4, 0.9, 1.6); putCan(x, 3.0, z, 4.8, 0.12, 2.6, z === 58 ? 0.15 : -0.15, CAN[si % 7]);
//     for (const dx of [-2.2, 2.2]) for (const dz of [-1.1, 1.1]) putPost(x + dx, 1.3, z + dz, 1, 1, 1);
//     for (let j = 0; j < 3; j++) {
//       putCrate(x - 1.2 + j * 1.2, 1.1, z, 0.9, 0.4, 0.7);
//       for (let f = 0; f < 4; f++) putFruit(x - 1.2 + j * 1.2 + (f % 2 - 0.5) * 0.4, 1.4, z + (f < 2 ? -0.15 : 0.15), 1, 1, 1, 0, PROD[(si + j + f) % 7]);
//     }
//     col.push({ minX: x - 2.4, maxX: x + 2.4, minZ: z - 1.1, maxZ: z + 1.1 });
//   }

//   /* ফোয়ারা */
//   const stoneM = M(0x9aa1ad, 0.7, 0.1), wm = new THREE.MeshStandardMaterial({ color: 0x2a8fd0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85, emissive: 0x0b3a66, emissiveIntensity: 0.3 });
//   add(scene, cy(3.8, 4, 0.7, 28), stoneM, 0, 0.35, 64).receiveShadow = true; add(scene, cy(3.4, 3.4, 0.1, 28), wm, 0, 0.72, 64);
//   add(scene, cy(0.35, 0.5, 2.4, 12), stoneM, 0, 1.6, 64); add(scene, sp(0.9, 14, 10), wm, 0, 2.9, 64, 1, 0.5, 1);
//   col.push({ minX: -4.3, maxX: 4.3, minZ: 59.7, maxZ: 68.3 });

//   /* বাজারের ক্রেতা */
//   const crowd = Array.from({ length: 10 }, (_, i) => {
//     const h = buildHuman({ shirt: CAN[i % 7], female: i % 2 === 0, style: (['long', 'short', 'bun', 'cap'] as const)[i % 4], skin: [0xc98262, 0xe0ac8a, 0x8d5a3b, 0xb87555][i % 4] });
//     scene.add(h.group); const side = i % 2 ? 1 : -1;
//     return { h, side, x: side * (16 + i * 8), z: i % 2 ? 64.8 : 63.2, dir: i % 3 ? 1 : -1, sp: 1.2 + (i % 4) * 0.3, ph: i };
//   });

//   const update = (t: number, dt: number, dayF: number) => {
//     const n = 1 - dayF;
//     facades.forEach((m) => { m.emissiveIntensity = n * 1.0; });
//     lampMat.emissiveIntensity = n * 3; shopGlow.emissiveIntensity = 0.25 + n * 1.2;
//     crowd.forEach((w) => {
//       w.x += w.dir * w.sp * dt; w.ph += dt * w.sp * 3.2;
//       const a = Math.abs(w.x);
//       if (a > 112 || a < 12) { w.dir = -w.dir; w.x = w.side * Math.min(112, Math.max(12, a)); }
//       w.h.group.position.set(w.x, 0, w.z); w.h.group.rotation.y = w.dir > 0 ? -Math.PI / 2 : Math.PI / 2; w.h.update(w.ph, 1, t);
//     });
//   };
//   return { update, col };
// }

// /* ============================ অন্য মানুষ (একই ডিভাইসের অন্য ট্যাব) ============================
//    আসল ইন্টারনেট মাল্টিপ্লেয়ারের জন্য সার্ভার (WebSocket/Firebase/Supabase) লাগবে। */
// type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
// function createNet(getSelf: () => { x: number; z: number; r: number; w: number; a: number }, getProfile: () => Profile) {
//   const id = Math.random().toString(36).slice(2, 8);
//   let bc: BroadcastChannel | null = null;
//   try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
//   const peers = new Map<string, Peer>();
//   if (bc) bc.onmessage = (e) => {
//     const m = e.data;
//     if (!m || !m.id || m.id === id) return;
//     if (m.t === 'bye') { peers.delete(m.id); return; }
//     const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
//     if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; } else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
//     p.seen = performance.now(); peers.set(m.id, p);
//   };
//   let lp = 0, lh = 0;
//   const tick = (now: number) => {
//     if (!bc) return;
//     if (now - lh > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lh = now; }
//     if (now - lp > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lp = now; }
//     peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
//   };
//   return { peers, tick, close: () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); } };
// }

// /* ============================ মূল কম্পোনেন্ট ============================ */
// const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';
// const inp = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
// const btn = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
// const fmtHour = (h: number) => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

// type Built = { shop: Shop; g: THREE.Group; col: Box2[]; hits: { box: THREE.Box3; p: Product }[]; idlers: { h: Human; base: number }[]; screen: (t: number) => void; light: THREE.Vector3 };

// export default function Page() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const tipRef = useRef<HTMLDivElement>(null);
//   const keysRef = useRef({ f: false, b: false, l: false, r: false, s: false });
//   const joyRef = useRef({ x: 0, y: 0 });
//   const pausedRef = useRef(false);
//   const meRef = useRef<Human | null>(null);
//   const posRef = useRef({ x: 0, z: 18 });
//   const tpRef = useRef<{ x: number; z: number } | null>(null);
//   const sunCmdRef = useRef(false);
//   const dayRef = useRef({ a: 0.65, auto: true });
//   const rideCmdRef = useRef(0);

//   const [shops, setShops] = useState<Shop[]>(defaultShops);
//   const [profile, setProfile] = useState<Profile>({ name: 'আমি', photo: '' });
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [balance, setBalance] = useState(100000);
//   const [score, setScore] = useState(0);
//   const [loaded, setLoaded] = useState(false);
//   const [selected, setSelected] = useState<Sel | null>(null);
//   const [hover, setHover] = useState<{ name: string; price: number } | null>(null);
//   const [qty, setQty] = useState(1);
//   const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন। বাইরে বাইক আছে — F চাপুন!');
//   const [touch, setTouch] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [panel, setPanel] = useState<'' | 'profile' | 'shops'>('');
//   const [online, setOnline] = useState<string[]>([]);
//   const [knob, setKnob] = useState({ x: 0, y: 0 });
//   const [hour, setHour] = useState(8.5);
//   const [autoDay, setAutoDay] = useState(true);
//   const [sid, setSid] = useState('fashion');
//   const [q, setQ] = useState('');
//   const [ns, setNs] = useState({ name: '', subtitle: '', style: 'market', accent: '#2563eb' });
//   const [np, setNp] = useState({ name: '', price: '', image: '', kind: 'tshirt', color: '#2563eb' });
//   const [rn, setRn] = useState('');
//   const [riding, setRiding] = useState(false);
//   const [nearBike, setNearBike] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   const profileRef = useRef(profile); profileRef.current = profile;
//   const shopsRef = useRef(shops); shopsRef.current = shops;
//   const total = cart.reduce((s, i) => s + i.price * i.count, 0);
//   const cartCount = cart.reduce((s, i) => s + i.count, 0);

//   useEffect(() => { pausedRef.current = paused; }, [paused]);
//   useEffect(() => {
//     const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
//     check(); window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   /* ---- লোড / সেভ ---- */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
//         if (ls) {
//           if (ls.profile) setProfile(ls.profile); if (ls.cart) setCart(ls.cart);
//           if (typeof ls.balance === 'number') setBalance(ls.balance); if (typeof ls.score === 'number') setScore(ls.score);
//         }
//       } catch { /* ignore */ }
//       const saved = (await kv.get('shops')) as Shop[] | undefined;
//       if (alive && Array.isArray(saved) && saved.length) { setShops(saved); setSid(saved[0].id); }
//       if (alive) setLoaded(true);
//     })();
//     return () => { alive = false; };
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     const t = setTimeout(() => { kv.set('shops', shops); }, 500);
//     return () => clearTimeout(t);
//   }, [loaded, shops]);
//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score })); } catch { /* ignore */ }
//   }, [loaded, profile, cart, balance, score]);
//   useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

//   /* ============================ 3D দৃশ্য ============================ */
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container || !loaded) return;

//     const scene = new THREE.Scene();
//     scene.fog = new THREE.Fog(0xbfd8f0, 25, 260);
//     const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
//     renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     container.appendChild(renderer.domElement);
//     renderer.domElement.style.touchAction = 'none';

//     const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a4252, 1.6); scene.add(hemi);
//     const sun = new THREE.DirectionalLight(0xffffff, 1.6);
//     sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
//     Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 220 });
//     scene.add(sun, sun.target);
//     const pool = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xfff1dc, 0, 30, 2); scene.add(l); return l; });

//     const sky = makeSky(); scene.add(sky);
//     const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
//     const outdoors = addOutdoors(scene);
//     const updateOutdoors = outdoors.update;
//     const city = addCity(scene);
//     outdoors.col.push(...city.col);

//     const textureLoader = new THREE.TextureLoader(); textureLoader.setCrossOrigin('anonymous');
//     const glowMat = M(0xeaf8ff, 0.5, 0, 0xbde9ff, 2.2);
//     const built = new Map<string, Built>();

//     /* ---------- মলের কাঠামো (দোকানের সংখ্যা অনুযায়ী লম্বা হয়) ---------- */
//     let shell: THREE.Group | null = null, shellBack = 0, shellCol: Box2[] = [];
//     const needBack = () => { const zs = shopsRef.current.map((s) => s.z); return Math.min(-115, (zs.length ? Math.min(...zs) : -14) - 22); };
//     const mkShell = (backZ: number) => {
//       if (shell) { scene.remove(shell); disposeTree(shell); }
//       shellBack = backZ; shellCol = [];
//       // দেয়াল ও প্রবেশদ্বারের পিলারে collision (এখন বাইরে যাওয়া যায়)
//       shellCol.push(
//         { minX: -29, maxX: -28, minZ: backZ, maxZ: 24 }, { minX: 28, maxX: 29, minZ: backZ, maxZ: 24 },
//         { minX: -29, maxX: 29, minZ: backZ - 1, maxZ: backZ },
//         { minX: -26.7, maxX: -25.3, minZ: 23.3, maxZ: 24.7 }, { minX: 25.3, maxX: 26.7, minZ: 23.3, maxZ: 24.7 },
//       );
//       const len = 24 - backZ, cz = (24 + backZ) / 2, s = new THREE.Group();
//       const floor = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ map: tileTex('#2a3447', '#323e55', Math.round(57 / 4), Math.round(len / 4)), roughness: 0.22, metalness: 0.2 }));
//       floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz); floor.receiveShadow = true; s.add(floor);
//       const wallM = M(0x1a2338, 0.5, 0.3);
//       for (const sx of [-28.5, 28.5]) { const w = add(s, bx(1, 14, len), wallM, sx, 7, cz); w.receiveShadow = true; }
//       add(s, bx(58, 14, 1), wallM, 0, 7, backZ - 0.5);
//       // কাচের ছাদ — আকাশ ও সূর্য দেখা যায়
//       const roof = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ color: 0xa8d8ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
//       roof.rotation.x = Math.PI / 2; roof.position.set(0, 14, cz); s.add(roof);
//       const nB = Math.floor(len / 9), beams = new THREE.InstancedMesh(bx(57, 0.35, 0.5), M(0x2b3550, 0.4, 0.7), nB), m4 = new THREE.Matrix4();
//       for (let i = 0; i < nB; i++) { m4.setPosition(0, 14, 24 - i * 9); beams.setMatrixAt(i, m4); }
//       beams.castShadow = true; s.add(beams);
//       for (const rx of [-22, -11, 0, 11, 22]) { const r = add(s, bx(0.3, 0.3, len), M(0x2b3550, 0.4, 0.7), rx, 14, cz); r.castShadow = true; }
//       const nL = Math.floor(len / 10), bars = new THREE.InstancedMesh(bx(6, 0.15, 0.5), glowMat, nL);
//       for (let i = 0; i < nL; i++) { m4.setPosition(0, 13.7, 20 - i * 10); bars.setMatrixAt(i, m4); }
//       s.add(bars);
//       for (const sx of [-7.3, 7.3]) add(s, bx(0.1, 0.02, len), M(0x22d3ee, 0.3, 0, 0x22d3ee, 2), sx, 0.03, cz);
//       // টব ও গাছ
//       for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
//         add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
//         shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
//       }
//       // প্রবেশদ্বার
//       for (const sx of [-26, 26]) add(s, bx(1.4, 14, 1.4), M(0x2b3550, 0.4, 0.7), sx, 7, 24);
//       add(s, bx(54, 1.2, 1.2), M(0x2b3550, 0.4, 0.7), 0, 13.2, 24);
//       const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8), side: THREE.DoubleSide }));
//       arch.position.set(0, 10.6, 23.6); s.add(arch);
//       shell = s; scene.add(s);
//     };

//     /* ---------- দোকান তৈরি (স্ট্রিমিং) ---------- */
//     const buildShop = (shop: Shop): Built => {
//       const g = new THREE.Group();
//       g.position.set(shop.x, 0, shop.z); g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2;
//       const col: Box2[] = [], idlers: Built['idlers'] = [];
//       const acc = M(shop.accent, 0.3, 0.5), dark = M(0x131a2a, 0.35, 0.6), metal = M(0x64748b, 0.25, 0.85), wood = M(0x6b4a2e, 0.55, 0.1), white = M(0xe5e9f0, 0.25, 0.2);
//       const led = M(shop.accent, 0.3, 0.2, shop.accent, 2.5);
//       const glassM = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
//       const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
//         const k = add(g, bx(w, h, d), m, x, y, z); k.castShadow = shadow; k.receiveShadow = true; return k;
//       };
//       const solid = (lx: number, lz: number, w: number, d: number) => {
//         const c = Math.round(Math.cos(g.rotation.y)), s = Math.round(Math.sin(g.rotation.y));
//         const wx = shop.x + lx * c + lz * s, wz = shop.z - lx * s + lz * c;
//         const sw = Math.abs(w * c) + Math.abs(d * s), sd = Math.abs(w * s) + Math.abs(d * c);
//         col.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2 });
//       };

//       const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 20), new THREE.MeshStandardMaterial({ map: tileTex('#d8dde6', '#c4cad6', 9, 10), roughness: 0.3 }));
//       sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true; g.add(sf);
//       add(g, pl(3.4, 19), M(shop.accent, 0.9, 0), 0, 0.05, 0, 1, 1, 1, -Math.PI / 2);

//       // দেয়াল
//       for (const s of [-1, 1]) { box(0.4, 10, 20, acc, s * 8.9, 5, 0); solid(s * 8.9, 0, 0.4, 20); }
//       box(18, 10, 0.4, dark, 0, 5, -9.9); solid(0, -9.9, 18, 0.4);
//       const slat = add(g, pl(17.4, 9.4), new THREE.MeshStandardMaterial({ map: slatTex(), roughness: 0.55 }), 0, 4.7, -9.68);
//       slat.receiveShadow = true;

//       // সামনের দিক
//       box(18, 3.4, 0.5, dark, 0, 8.3, 10);
//       for (const gx of [-5.5, 5.5]) { add(g, bx(7, 6.6, 0.1), glassM, gx, 3.3, 10); solid(gx, 9.9, 7, 0.4); }
//       for (const fx of [-2, 2, -9, 9]) box(0.3, 6.6, 0.4, metal, fx, 3.3, 10);
//       add(g, new THREE.PlaneGeometry(14, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }), 0, 8.3, 10.27);
//       const awn = box(18.4, 0.25, 2.4, acc, 0, 6.9, 11.1, false); awn.rotation.x = 0.18;
//       box(14.4, 0.1, 0.1, led, 0, 9.85, 10.3, false);
//       for (const lz of [-5, 3]) box(15, 0.12, 0.35, glowMat, 0, 9.7, lz, false);
//       for (const s of [-1, 1]) box(0.12, 0.15, 19.4, led, s * 8.5, 9.6, 0, false);

//       // শেলফ (দুই পাশ + পেছনে, ৪ থাক, নিচে LED)
//       const planks = (cx: number, cz: number, w: number, d: number, vertical: boolean) => {
//         SHELF_Y.forEach((y) => { box(w, 0.08, d, wood, cx, y, cz); box(w - 0.1, 0.03, d - 0.1, led, cx, y - 0.06, cz, false); });
//         if (vertical) { box(0.12, 5.6, d, dark, cx + (cx < 0 ? -0.6 : 0.6), 2.8, cz); box(w, 0.78, d, dark, cx, 0.39, cz); }
//         else { box(w, 5.6, 0.12, dark, cx, 2.8, cz - 0.6); box(w, 0.78, d, dark, cx, 0.39, cz); }
//       };
//       for (const s of [-1, 1]) { planks(s * 8.0, -2.45, 1.2, 12.2, true); solid(s * 8.0, -2.45, 1.3, 12.3); }
//       planks(0, -9.1, 15.8, 1.2, false); solid(0, -9.1, 15.8, 1.3);

//       // টেবিল (৮টি) — উপরে শোকেস পণ্য
//       for (const cz of TABLE_Z) for (const cx of TABLE_X) {
//         box(2.0, 1.6, 1.2, white, cx, 0.8, cz); box(2.05, 0.08, 1.25, led, cx, 1.62, cz, false); solid(cx, cz, 2.0, 1.2);
//       }

//       // পেছনের স্ক্রিন (চলমান)
//       const sc = document.createElement('canvas'); sc.width = 768; sc.height = 300;
//       const sx = sc.getContext('2d')!, stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
//       const draw = (t: number) => {
//         const gr = sx.createLinearGradient(0, 0, 768, 300); gr.addColorStop(0, hex(shop.accent)); gr.addColorStop(1, '#0b1220');
//         sx.fillStyle = gr; sx.fillRect(0, 0, 768, 300);
//         sx.fillStyle = 'rgba(255,255,255,.14)'; sx.beginPath(); sx.arc(384 + 260 * Math.sin(t * 0.8), 150, 120, 0, 7); sx.fill();
//         sx.fillStyle = '#fff'; sx.font = '900 64px Arial'; sx.textAlign = 'center'; sx.fillText(shop.name, 384, 170, 720); stex.needsUpdate = true;
//       };
//       draw(0);
//       box(9.4, 3.9, 0.2, dark, 0, 7.75, -9.55);
//       add(g, new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }), 0, 7.75, -9.43);

//       // মানুষ
//       const hs = [...shop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
//       const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: hs % 2 ? 0xb87555 : 0xe0ac8a, female: hs % 3 === 0, style: hs % 3 === 0 ? 'long' : 'short', hair: hs % 2 ? 0x17120f : 0x3b2314 });
//       cashier.group.position.set(-5.4, 0, 4.6); cashier.group.rotation.y = Math.PI; g.add(cashier.group); idlers.push({ h: cashier, base: Math.PI }); solid(-5.4, 4.6, 0.8, 0.8);
//       const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][hs % 4], skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][hs % 4], female: hs % 2 === 0, style: (['bun', 'cap', 'long', 'short'] as const)[hs % 4], glasses: hs % 5 === 0 });
//       browser.group.position.set(3.6, 0, 7.2); g.add(browser.group); idlers.push({ h: browser, base: 0 }); solid(3.6, 7.2, 0.9, 0.9);
//       box(3.6, 1.4, 1.3, dark, -5.4, 0.7, 6); box(3.6, 0.08, 1.4, wood, -5.4, 1.42, 6); solid(-5.4, 6, 3.6, 1.3);

//       // পণ্য: শুধু আসল ছবি (৩D আইকন/মডেল নেই) — ফ্রেমে বসানো ছবির কার্ড
//       const localBoxes: { box: THREE.Box3; p: Product }[] = [], frameM = M(0x0b1220, 0.5, 0.3);
//       shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
//         const sl = SLOTS[i], cx = sl.x, cyy = sl.y + 0.5 * sl.s, w = 0.9 * sl.s, h = 0.7 * sl.s;
//         const grp = new THREE.Group(); grp.position.set(cx, cyy, sl.z); grp.rotation.y = sl.ry; g.add(grp);
//         add(grp, bx(w + 0.08, h + 0.08, 0.03), frameM, 0, 0, -0.02);
//         add(grp, pl(w, h), photoMat(p, textureLoader), 0, 0, 0.005);
//         localBoxes.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(cx, cyy, sl.z), new THREE.Vector3(1.05 * sl.s, h + 0.1, 1.05 * sl.s)), p });
//       });
//       scene.add(g); g.updateMatrixWorld(true);
//       const hits = localBoxes.map((h) => ({ p: h.p, box: h.box.applyMatrix4(g.matrixWorld) }));
//       return { shop, g, col, hits, idlers, screen: draw, light: new THREE.Vector3(shop.x, 7.5, shop.z) };
//     };
//     const drop = (id: string) => { const b = built.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); built.delete(id); };

//     /* ---------- খেলোয়াড় ও পথচারী ---------- */
//     const player = new THREE.Group(); player.position.set(posRef.current.x, 0, posRef.current.z); scene.add(player);
//     const me = buildHuman({ shirt: 0x2563eb, skin: 0xc98262, style: 'short' });
//     player.add(me.group); meRef.current = me; me.setName(profileRef.current.name, profileRef.current.photo);

//     const looks: HumanOpts[] = [
//       { shirt: 0xef4444, skin: 0xb87555, female: true, style: 'long' }, { shirt: 0xf8fafc, skin: 0xe0ac8a, hair: 0x3b2314, style: 'cap' }, { shirt: 0x16a34a, skin: 0x8d5a3b, glasses: true },
//       { shirt: 0xfacc15, skin: 0xd9a07c, hair: 0x5b3a1e, female: true, style: 'bun' }, { shirt: 0x8b5cf6, skin: 0xc98262, style: 'bald' }, { shirt: 0xf97316, skin: 0xa66a47, female: true, style: 'long', hair: 0x2a1a10 },
//       { shirt: 0x0ea5e9, skin: 0xe0ac8a, hair: 0xb45309, style: 'short' }, { shirt: 0xec4899, skin: 0x8d5a3b, female: true, style: 'short', glasses: true },
//     ];
//     const walkers = looks.map((o, i) => {
//       const h = buildHuman(o); scene.add(h.group);
//       return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
//     });

//     let walk = 0, amt = 0;
//     const net = createNet(() => ({ x: player.position.x, z: player.position.z, r: player.rotation.y, w: walk, a: amt }), () => profileRef.current);
//     const avatars = new Map<string, { h: Human; key: string }>();
//     const timer = setInterval(() => {
//       const n = [...net.peers.values()].map((p) => p.name);
//       setOnline((prev) => (prev.join('|') === n.join('|') ? prev : n));
//       if (dayRef.current.auto) setHour(Math.round((((((dayRef.current.a / (Math.PI * 2)) * 24 + 6) % 24) + 24) % 24) * 10) / 10);
//     }, 1000);

//     /* ---------- ইনপুট ---------- */
//     let yaw = 0, pitch = 0.5, camDist = 11;
//     const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tmp = new THREE.Vector3();
//     let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;
//     const el = renderer.domElement;
//     const pickAt = (cx: number, cy: number) => {
//       const r = el.getBoundingClientRect();
//       ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
//       ray.setFromCamera(ptr, camera);
//       let best: { p: Product; shop: string; d: number } | null = null;
//       for (const b of built.values()) for (const h of b.hits) {
//         if (!ray.ray.intersectBox(h.box, tmp)) continue;
//         const d = tmp.distanceTo(ray.ray.origin);
//         if (d < 60 && (!best || d < best.d)) best = { p: h.p, shop: b.shop.name, d };
//       }
//       return best as { p: Product; shop: string; d: number } | null;
//     };
//     let hoverId = '', lastHover = 0;
//     const hoverCheck = (e: PointerEvent) => {
//       if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
//       const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
//       const h = pickAt(e.clientX, e.clientY), id = h ? h.p.id : '';
//       if (id !== hoverId) { hoverId = id; setHover(h ? { name: h.p.name, price: h.p.price } : null); el.style.cursor = h ? 'pointer' : 'grab'; }
//     };
//     const onDown = (e: PointerEvent) => {
//       if (down) return;
//       down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() }; sunCmdRef.current = false;
//       el.setPointerCapture(e.pointerId);
//     };
//     const onMove = (e: PointerEvent) => {
//       if (!down) { if (e.pointerType === 'mouse') hoverCheck(e); return; }
//       if (e.pointerId !== down.id) return;
//       const dx = e.clientX - down.x, dy = e.clientY - down.y;
//       down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
//       yaw -= dx * 0.005; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.7, 1.15);
//     };
//     const onUp = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       if (down.moved < 8 && performance.now() - down.t < 500) { const h = pickAt(e.clientX, e.clientY); if (h) { setQty(1); setSelected({ ...h.p, shop: h.shop }); } }
//       down = null;
//     };
//     const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
//     el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
//     el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: true });

//     const setKey = (e: KeyboardEvent, v: boolean) => {
//       const tg = (e.target as HTMLElement)?.tagName; if (tg === 'INPUT' || tg === 'SELECT') return;
//       const k = keysRef.current, key = e.key.toLowerCase();
//       if (key === 'w' || key === 'arrowup') k.f = v; if (key === 's' || key === 'arrowdown') k.b = v;
//       if (key === 'a' || key === 'arrowleft') k.l = v; if (key === 'd' || key === 'arrowright') k.r = v;
//       if (key === 'shift') k.s = v;
//       if (v && key === 'q') yaw += 0.15; if (v && key === 'e') yaw -= 0.15;
//     };
//     const kd = (e: KeyboardEvent) => {
//       setKey(e, true);
//       const tg = (e.target as HTMLElement)?.tagName;
//       if (e.key.toLowerCase() === 'f' && !e.repeat && tg !== 'INPUT' && tg !== 'SELECT') rideCmdRef.current = 1;
//     };
//     const ku = (e: KeyboardEvent) => setKey(e, false);
//     window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

//     const resize = () => {
//       const w = container.clientWidth || 1, h = container.clientHeight || 1;
//       camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
//     };
//     resize();
//     const ro = new ResizeObserver(resize); ro.observe(container);

//     /* ---------- মোটরসাইকেল ও দোকান-প্রবেশ ---------- */
//     const moto = buildMoto(); moto.g.position.set(10, 0, 30); scene.add(moto.g);
//     let riding = false, vel = 0, dirX = 0, dirZ = -1, nearLast = false, curShop = '';
//     const inShop = (x: number, z: number) => {
//       for (const b of built.values()) if (Math.abs(x - b.shop.x) < 10 && Math.abs(z - b.shop.z) < 9.5) return b.shop;
//       return null;
//     };
//     const toggleRide = () => {
//       if (riding) {
//         riding = false; me.setRide(false); me.group.scale.setScalar(1); me.group.position.set(0, 0, 0);
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = a;
//         player.position.x += Math.cos(a) * 1.8; player.position.z -= Math.sin(a) * 1.8;
//         setRiding(false); setMessage('🚶 বাইক থেকে নামলেন।'); return;
//       }
//       if (inShop(player.position.x, player.position.z)) { setMessage('🏪 দোকানের ভেতরে বাইক চলে না — বাইরে এসে F চাপুন।'); return; }
//       const d = Math.hypot(moto.g.position.x - player.position.x, moto.g.position.z - player.position.z);
//       if (d > 6) {
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x - Math.cos(a) * 3, 0, player.position.z + Math.sin(a) * 3); moto.g.rotation.y = a;
//         setMessage('🏍️ বাইক আপনার পাশে এসেছে — আবার F চাপুন।'); return;
//       }
//       riding = true; me.setRide(true); me.group.scale.setScalar(0.62); me.group.position.set(0, 0.37, 0.15);
//       player.position.set(moto.g.position.x, 0, moto.g.position.z); player.rotation.y = moto.g.rotation.y;
//       vel = 0; camDist = Math.max(camDist, 14);
//       setRiding(true); setMessage('🏍️ বাইকে উঠেছেন! W A S D = চালান, Shift = টার্বো');
//     };

//     /* ---------- মূল লুপ ---------- */
//     const R = 0.5;
//     const blocked = (x: number, z: number) => {
//       const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
//       if (shellCol.some(hit)) return true;
//       if (z > 55 && outdoors.col.some(hit)) return true;   // শহরের ভবন ও বাজারের স্টল
//       if (riding && inShop(x, z)) return true;             // বাইক নিয়ে দোকানে ঢোকা যাবে না
//       for (const b of built.values()) if (Math.abs(b.shop.z - z) < 14 && b.col.some(hit)) return true;
//       return false;
//     };
//     const clock = new THREE.Clock(), camTarget = new THREE.Vector3(), sunDir = new THREE.Vector3(), moon = new THREE.Vector3();
//     let raf = 0, lastList: Shop[] | null = null, frame = 0, firstCam = true;
//     mkShell(needBack());

//     const animate = () => {
//       raf = requestAnimationFrame(animate);
//       const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
//       const px = player.position.x, pz = player.position.z;

//       /* দিন-রাত */
//       const D = dayRef.current; if (D.auto && !pausedRef.current) D.a += dt * 0.02;
//       const ca = Math.cos(D.a);
//       sunDir.set(ca * 0.5, Math.sin(D.a), -0.85 * ca).normalize();
//       const elv = sunDir.y, dayF = sm(-0.08, 0.3, elv), dusk = (1 - sm(0, 0.4, elv)) * sm(-0.15, 0.05, elv);
//       const zen = mix3(mix3(NZ, DZ, dayF), SZ, dusk * 0.6), hor = mix3(mix3(NH, DH, dayF), SH, dusk * 0.85);
//       const sunC = mix3([1, 0.55, 0.25], [1, 0.96, 0.86], sm(0.05, 0.5, elv));
//       skyU.zenith.value.set(zen[0], zen[1], zen[2]); skyU.horizon.value.set(hor[0], hor[1], hor[2]);
//       skyU.sunDir.value.copy(sunDir); skyU.sunCol.value.set(sunC[0], sunC[1], sunC[2]); skyU.night.value = 1 - dayF;
//       sky.position.copy(camera.position);
//       (scene.fog as THREE.Fog).color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
//       hemi.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); hemi.intensity = 0.25 + 1.45 * dayF;
//       const L = elv > 0 ? sunDir : moon.copy(sunDir).negate();
//       sun.position.set(px + L.x * 90, Math.max(8, L.y * 90), pz + L.z * 90); sun.target.position.set(px, 0, pz);
//       sun.intensity = 1.9 * sm(0, 0.4, elv) + 0.35 * sm(0, 0.3, -elv);
//       if (elv > 0) sun.color.setRGB(sunC[0], sunC[1], sunC[2], THREE.SRGBColorSpace); else sun.color.setRGB(0.55, 0.65, 1, THREE.SRGBColorSpace);
//       const cloudRGB = mix3(mix3([0.25, 0.28, 0.4], [1, 1, 1], dayF), [1, 0.7, 0.55], dusk * 0.6);

//       /* দোকান স্ট্রিমিং */
//       if (lastList !== shopsRef.current) {
//         lastList = shopsRef.current;
//         const map = new Map(lastList.map((s) => [s.id, s]));
//         [...built.keys()].forEach((id) => { const s = map.get(id); if (!s || s !== built.get(id)!.shop) drop(id); });
//         const nb = needBack(); if (nb !== shellBack) mkShell(nb);
//       }
//       let nearest: Shop | null = null, nd = Infinity;
//       const far = Math.abs(px) > 90; // মল থেকে অনেক দূরে গেলে দোকান বানানো বন্ধ
//       for (const s of lastList) {
//         const dz = s.z - pz, b = built.get(s.id);
//         if (b) { if (far || dz < -105 || dz > 70) drop(s.id); continue; }
//         if (!far && dz > -80 && dz < 45 && Math.abs(dz) < nd) { nd = Math.abs(dz); nearest = s; }
//       }
//       if (nearest && (frame % 2 === 0 || built.size < 3)) built.set((nearest as Shop).id, buildShop(nearest as Shop));

//       /* পয়েন্ট লাইট পুল */
//       const near = [...built.values()].sort((a, b) => Math.abs(a.shop.z - pz) - Math.abs(b.shop.z - pz)).slice(0, 4);
//       pool.forEach((l, i) => { const b = near[i]; if (b) { l.position.copy(b.light); l.intensity = 40 * (0.5 + 0.9 * (1 - dayF)); } else l.intensity = 0; });

//       if (tpRef.current) { player.position.set(tpRef.current.x, 0, tpRef.current.z); tpRef.current = null; firstCam = true; }

//       if (!pausedRef.current) {
//         const k = keysRef.current, j = joyRef.current;
//         let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x, iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
//         const len = Math.hypot(ix, iz);
//         if (len > 1) { ix /= len; iz /= len; }

//         const on = len > 0.08, inMall = player.position.z < 24 && Math.abs(player.position.x) < 28;
//         const top = riding ? (k.s ? 30 : 20) * (inMall ? 0.5 : 1) : (k.s ? 15 : 7.5);
//         vel += ((on ? top * Math.min(1, len) : 0) - vel) * Math.min(1, dt * (riding ? 2.2 : 30));
//         if (on) {
//           const sin = Math.sin(yaw), cos = Math.cos(yaw);
//           const mx = -sin * iz + cos * ix, mz = -cos * iz - sin * ix, n = Math.hypot(mx, mz) || 1;
//           dirX = mx / n; dirZ = mz / n;
//           let diff = Math.atan2(-dirX, -dirZ) - player.rotation.y;
//           diff = Math.atan2(Math.sin(diff), Math.cos(diff));
//           player.rotation.y += diff * Math.min(1, dt * (riding ? 4 : 12));
//         }
//         if (riding) { dirX = -Math.sin(player.rotation.y); dirZ = -Math.cos(player.rotation.y); }
//         if (vel > 0.05) {
//           const spd = vel * dt;
//           const nx = THREE.MathUtils.clamp(player.position.x + dirX * spd, -330, 330);
//           const okX = !blocked(nx, player.position.z); if (okX) player.position.x = nx;
//           const nz = THREE.MathUtils.clamp(player.position.z + dirZ * spd, shellBack - 80, 150);
//           const okZ = !blocked(player.position.x, nz); if (okZ) player.position.z = nz;
//           if (riding && (!okX || !okZ)) vel *= 0.6;
//         } else if (!on) vel = 0;
//         if (!riding) {
//           if (on) { walk += dt * (k.s ? 13 : 9); amt = Math.min(1, amt + dt * 6); } else amt = Math.max(0, amt - dt * 6);
//         } else {
//           amt = 0; const spin = (vel * dt) / 0.63; moto.wf.rotation.x -= spin; moto.wr.rotation.x -= spin;
//         }
//         me.update(walk, amt, t);
//         posRef.current = { x: player.position.x, z: player.position.z };
//         if (riding) { moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = player.rotation.y; }

//         walkers.forEach((n) => {
//           if (Math.abs(n.z - pz) > 75) n.z = THREE.MathUtils.clamp(pz - 60 + Math.random() * 100, shellBack + 6, 26);
//           const nr = Math.hypot(n.x - px, n.z - pz) < 2.4;
//           n.amt += ((nr ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
//           if (!nr) { n.z += n.dir * n.sp * dt; n.ph += dt * n.sp * 3.2; if (n.z < shellBack + 6) n.dir = 1; if (n.z > 26) n.dir = -1; }
//           n.h.group.position.set(n.x, 0, n.z); n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI; n.h.update(n.ph, n.amt, t);
//         });
//         for (const b of built.values()) {
//           if (Math.abs(b.shop.z - pz) > 45) continue;
//           b.idlers.forEach((i) => { i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * 0.2; i.h.update(0, 0, t); });
//           if (frame % 3 === 0 && Math.abs(b.shop.z - pz) < 38) b.screen(t);
//         }
//         updateOutdoors(t, dt, dayF, cloudRGB);
//         city.update(t, dt, dayF);
//       }

//       /* বাইকের হেডলাইট, কাছাকাছি বাইক, দোকানে প্রবেশের বার্তা, F কমান্ড */
//       moto.lamp.intensity = riding ? 250 * (1 - dayF) : 0;
//       if (frame % 10 === 0) {
//         const nb = !riding && Math.hypot(moto.g.position.x - px, moto.g.position.z - pz) < 6;
//         if (nb !== nearLast) { nearLast = nb; setNearBike(nb); }
//         const sh = inShop(player.position.x, player.position.z), sid2 = sh ? sh.id : '';
//         if (sid2 !== curShop) { curShop = sid2; if (sh) setMessage(`🏪 ${sh.name} এ প্রবেশ করেছেন`); }
//       }
//       if (rideCmdRef.current) { rideCmdRef.current = 0; toggleRide(); }

//       /* অন্য মানুষ */
//       net.tick(performance.now());
//       net.peers.forEach((p) => {
//         let a = avatars.get(p.id);
//         if (!a) {
//           const c = [...p.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
//           const h = buildHuman({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4][c % 5], female: c % 2 === 0, style: c % 2 ? 'short' : 'long' });
//           h.group.position.set(p.x, 0, p.z); scene.add(h.group); a = { h, key: '' }; avatars.set(p.id, a);
//         }
//         const key = p.name + p.photo.length;
//         if (a.key !== key) { a.h.setName(p.name, p.photo); a.key = key; }
//         a.h.group.position.x += (p.x - a.h.group.position.x) * 0.25; a.h.group.position.z += (p.z - a.h.group.position.z) * 0.25;
//         a.h.group.rotation.y = p.r; a.h.update(p.w, p.a, t);
//       });
//       avatars.forEach((a, id) => { if (!net.peers.has(id)) { scene.remove(a.h.group); disposeTree(a.h.group); avatars.delete(id); } });

//       /* "সূর্য দেখুন" বাটন: ক্যামেরা সূর্যের দিকে ঘোরে */
//       if (sunCmdRef.current) {
//         const ty = Math.atan2(-sunDir.x, -sunDir.z), tp = THREE.MathUtils.clamp(-0.2 - Math.max(0, elv) * 0.55, -0.7, 0.2);
//         let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
//         yaw += dy * 0.08; pitch += (tp - pitch) * 0.08;
//         if (Math.abs(dy) < 0.02 && Math.abs(tp - pitch) < 0.02) sunCmdRef.current = false;
//       }

//       const up = Math.max(0, -pitch), h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
//       camTarget.set(player.position.x + Math.sin(yaw) * d, Math.max(0.6, 2 + h), player.position.z + Math.cos(yaw) * d);
//       if (firstCam) { camera.position.copy(camTarget); firstCam = false; } else camera.position.lerp(camTarget, 0.12);
//       camera.lookAt(player.position.x, 2.4 + up * 14, player.position.z);
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       cancelAnimationFrame(raf); clearInterval(timer); net.close(); meRef.current = null; ro.disconnect();
//       window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
//       el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
//       el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
//       built.forEach((b) => disposeTree(b.g)); built.clear();
//       disposeTree(scene);
//       renderer.dispose();
//       if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
//     };
//   }, [loaded]);

//   /* ============================ অ্যাকশন ============================ */
//   const addSelected = () => {
//     if (!selected) return;
//     setCart((prev) => {
//       const old = prev.find((i) => i.id === selected.id);
//       if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + qty } : i));
//       return [...prev, { ...selected, count: qty }];
//     });
//     setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`); setSelected(null);
//   };
//   const changeQty = (id: string, d: number) => setCart((p) => p.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));
//   const checkout = () => {
//     if (!cart.length) return setMessage('🛒 কার্ট খালি।');
//     if (balance < total) return setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`);
//     setBalance((b) => b - total); setScore((s) => s + cartCount * 100); setCart([]); setMessage(`🎉 ${taka(total)} পেমেন্ট সফল!`);
//   };

//   const shop = shops.find((s) => s.id === sid);
//   const patchShop = (id: string, f: (s: Shop) => Shop) => setShops(shops.map((s) => (s.id === id ? f(s) : s)));
//   const addShop = () => {
//     if (shops.length >= MAX_SHOPS) return setMessage(`❌ সর্বোচ্চ ${MAX_SHOPS}টি দোকান`);
//     const slot = nextSlots(shops, 1)[0];
//     if (!slot) return setMessage('❌ আর খালি জায়গা নেই');
//     if (!ns.name.trim()) return setMessage('✏️ দোকানের নাম দিন');
//     const id = 's' + Date.now().toString(36);
//     setShops([...shops, { id, name: ns.name.trim().toUpperCase().slice(0, 18), subtitle: ns.subtitle.trim() || 'New Store', ...slot, accent: parseInt(ns.accent.slice(1), 16), style: ns.style, products: [] }]);
//     setSid(id); setNs({ ...ns, name: '', subtitle: '' }); setMessage('🏪 নতুন দোকান তৈরি হয়েছে!');
//   };
//   const addProduct = () => {
//     if (!shop) return;
//     const price = Number(np.price);
//     if (!np.name.trim() || !(price > 0)) return setMessage('✏️ পণ্যের নাম ও সঠিক দাম দিন');
//     if (shop.products.length >= MAX_PRODUCTS) return setMessage(`❌ একটি দোকানে সর্বোচ্চ ${MAX_PRODUCTS}টি পণ্য`);
//     const color = parseInt(np.color.slice(1), 16);
//     patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: 'p' + Date.now().toString(36), name: np.name.trim(), price, image: np.image || IMG[np.kind] || ph(np.kind, color, np.name.trim()), kind: np.kind, color }] }));
//     setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
//   };
//   const addDemo = () => {
//     const need = Math.min(100, MAX_SHOPS) - shops.length;
//     const slots = nextSlots(shops, Math.max(0, need));
//     const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
//     const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + '_x')] } : s));
//     setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
//   };
//   const teleport = (s: Shop) => { tpRef.current = { x: 0, z: s.z }; setPanel(''); setMessage(`📍 ${s.name} এর সামনে এসেছেন`); };

//   const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
//     const r = e.currentTarget.getBoundingClientRect(), max = r.width / 2 - 24;
//     let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
//     const l = Math.hypot(dx, dy);
//     if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
//     joyRef.current = { x: dx / max, y: dy / max }; setKnob({ x: dx, y: dy });
//   };
//   const joyStart = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); joyMove(e); };
//   const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

//   const filtered = shops.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()));
//   const isNight = hour < 5.5 || hour >= 18.5;

//   /* ============================ UI ============================ */
//   return (
//     <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
//       <div ref={containerRef} className="absolute inset-0" />

//       {hover && !selected && (
//         <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs md:block">
//           <div className="font-bold">{hover.name}</div><div className="font-black text-yellow-300">{taka(hover.price)}</div>
//         </div>
//       )}
//       {!hover && <div ref={tipRef} className="hidden" />}

//       {/* ⋮ মেনু বাটন — উপরে শুধু এটাই */}
//       <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
//         className={`absolute right-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-full text-2xl font-black ${glass}`}>⋮</button>

//       {menuOpen && (<>
//         <div className="absolute inset-0 z-40" onClick={() => setMenuOpen(false)} />
//         <div className={`absolute right-3 top-16 z-50 max-h-[80dvh] w-[min(310px,calc(100vw-24px))] overflow-y-auto rounded-2xl p-3 ${glass}`}>
//           <div className="mb-2 text-sm font-black">GRAND SHOPPING CITY</div>
//           <div className="grid grid-cols-2 gap-2 text-center">
//             <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">BALANCE</div><div className="text-sm font-black text-yellow-300">{taka(balance)}</div></div>
//             <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">SCORE</div><div className="text-sm font-black text-emerald-300">{score}</div></div>
//           </div>
//           <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('profile'); setMenuOpen(false); }}>👤 প্রোফাইল</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('shops'); setMenuOpen(false); }}>🏪 দোকান ({shops.length})</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setCartOpen(true); setMenuOpen(false); }}>🛒 কার্ট ({cartCount})</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPaused((v) => !v); setMenuOpen(false); }}>{paused ? '▶️ চালু' : '⏸️ পজ'}</button>
//           </div>
//           <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px]">
//             <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { dayRef.current.auto = !autoDay; setAutoDay(!autoDay); }}>{autoDay ? '⏸' : '▶'}</button>
//             <span className="w-14 shrink-0">{isNight ? '🌙' : '☀️'} {fmtHour(hour)}</span>
//             <input type="range" min={0} max={24} step={0.25} value={hour} className="min-w-0 flex-1"
//               onChange={(e) => { const v = Number(e.target.value); setHour(v); dayRef.current.a = ((v - 6) / 24) * Math.PI * 2; }} />
//             <button className="rounded-lg bg-amber-400/90 px-2 py-1 text-slate-950" onClick={() => { sunCmdRef.current = true; setMenuOpen(false); }}>{isNight ? '🌙' : '☀️'} দেখুন</button>
//           </div>
//           <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-emerald-300">🟢 অনলাইন: {profile.name}{online.length ? ', ' + online.join(', ') : ''}</div>
//           <div className="mt-2 text-[10px] leading-5 text-slate-400">W A S D হাঁটা • Shift দৌড় • মাউস ড্র্যাগ / Q E ঘোরা • স্ক্রল জুম • ক্লিক = পণ্য • F = বাইক</div>
//         </div>
//       </>)}

//       {/* মেসেজ — নিচে ছোট বাবল */}
//       <div key={message} className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-slate-950/80 px-4 py-2 text-center text-xs text-slate-100 backdrop-blur-md">{message}</div>

//       {selected && (
//         <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSelected(null)}>
//           <div className={`w-full max-w-md overflow-hidden rounded-3xl ${glass}`} onClick={(e) => e.stopPropagation()}>
//             <div className="relative">
//               <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover md:h-80"
//                 onError={(e) => { (e.target as HTMLImageElement).src = ph(selected.kind, selected.color, selected.name); }} />
//               <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">{selected.shop}</span>
//               <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs" aria-label="Close">✕</button>
//             </div>
//             <div className="p-4">
//               <div className="text-xl font-black">{selected.name}</div>
//               <div className="mt-1 text-2xl font-black text-yellow-300">{taka(selected.price * qty)}</div>
//               <div className="mt-3 flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
//                   <b className="w-6 text-center">{qty}</b>
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(qty + 1)}>+</button>
//                 </div>
//                 <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950 hover:bg-cyan-400 active:scale-95">🛒 কার্টে নিন</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {panel === 'profile' && (
//         <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
//           <div className="flex items-center justify-between"><b>👤 আমার প্রোফাইল</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 flex items-center gap-3">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">👤</div>}
//             <label className={`${btn} cursor-pointer`}>ছবি বাছাই করুন
//               <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProfile({ ...profile, photo: await fileToDataUrl(f, 160) }); }} />
//             </label>
//           </div>
//           <input className={`${inp} mt-3`} maxLength={16} placeholder="আপনার নাম" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
//           <p className="mt-2 text-[11px] text-slate-400">নাম ও ছবি আপনার কার্টুনের বুকে ও মাথার উপরে দেখা যাবে। আরেকটা ট্যাবে মল খুললে সেখানেও আপনাকে দেখা যাবে।</p>
//         </div>
//       )}

//       {panel === 'shops' && (
//         <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:w-[400px] ${glass}`}>
//           <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
//           <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
//           <div className="mt-2 flex gap-2">
//             <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
//               {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
//             </select>
//             {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
//           </div>
//           {shop && (<>
//             <div className="mt-2 flex gap-2">
//               <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
//               <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
//             </div>
//             <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
//             <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
//               {shop.products.map((p) => (
//                 <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
//                   <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(p.kind, p.color, p.name); }} />
//                   <span className="min-w-0 flex-1 truncate">{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
//                   <button className="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-300" onClick={() => patchShop(shop.id, (s) => ({ ...s, products: s.products.filter((x) => x.id !== p.id) }))}>✕</button>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-2">
//               <input className={inp} placeholder="পণ্যের নাম" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
//               <div className="flex gap-2">
//                 <select className={inp} value={np.kind} onChange={(e) => setNp({ ...np, kind: e.target.value })}>
//                   {KINDS.map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
//                 </select>
//                 <input type="color" value={np.color} onChange={(e) => setNp({ ...np, color: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//               </div>
//               <input className={inp} placeholder="ছবির লিংক (https://...jpg) — খালি রাখলে ডিফল্ট ছবি" value={np.image.startsWith('data:') ? '' : np.image} onChange={(e) => setNp({ ...np, image: e.target.value.trim() })} />
//               <div className="flex gap-2">
//                 <input className={inp} type="number" min={1} placeholder="দাম (৳)" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} />
//                 <label className={`${btn} flex cursor-pointer items-center whitespace-nowrap`}>{np.image ? '🖼️ ছবি ✓' : '🖼️ ছবি'}
//                   <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setNp({ ...np, image: await fileToDataUrl(f, 640) }); }} />
//                 </label>
//               </div>
//               <p className="text-[10px] text-slate-400">ছবির লিংক দিন বা ফাইল আপলোড করুন। কিছু না দিলে ধরন অনুযায়ী ডিফল্ট ছবি বসবে। দোকানে শুধু পণ্যের ছবি দেখা যাবে।</p>
//               <button className={`${btn} w-full`} onClick={addProduct}>➕ পণ্য যোগ করুন</button>
//             </div>
//             <button className="mt-2 w-full rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300"
//               onClick={() => { if (confirm(`"${shop.name}" মুছে ফেলবেন?`)) { const rest = shops.filter((s) => s.id !== shop.id); setShops(rest); setSid(rest[0]?.id ?? ''); } }}>🗑️ এই দোকান মুছুন</button>
//           </>)}
//           <div className="mt-4 text-[11px] font-bold text-cyan-300">নতুন দোকান খুলুন</div>
//           <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
//             <input className={inp} placeholder="দোকানের নাম" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
//             <input className={inp} placeholder="ট্যাগলাইন" value={ns.subtitle} onChange={(e) => setNs({ ...ns, subtitle: e.target.value })} />
//             <div className="flex gap-2">
//               <select className={inp} value={ns.style} onChange={(e) => setNs({ ...ns, style: e.target.value })}>
//                 {[['fashion', 'ফ্যাশন'], ['tech', 'ইলেকট্রনিক্স'], ['home', 'ফার্নিচার'], ['market', 'গ্রোসারি']].map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
//               </select>
//               <input type="color" value={ns.accent} onChange={(e) => setNs({ ...ns, accent: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//             </div>
//             <button className={`${btn} w-full`} onClick={addShop}>🏪 দোকান তৈরি করুন</button>
//           </div>
//         </div>
//       )}

//       {cartOpen && (
//         <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-16 md:w-80 md:rounded-3xl ${glass}`}>
//           <div className="flex items-center justify-between"><h2 className="font-black">🛒 MY CART</h2><button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 space-y-2">
//             {cart.length === 0 ? <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div> : cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
//                 <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(item.kind, item.color, item.name); }} />
//                 <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{taka(item.price)}</div></div>
//                 <div className="flex items-center gap-1 text-xs">
//                   <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button><b className="w-5 text-center">{item.count}</b>
//                   <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm"><span className="text-slate-400">Total</span><b className="text-yellow-300">{taka(total)}</b></div>
//           <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">✅ Checkout</button>
//         </aside>
//       )}

//       {touch && !selected && !cartOpen && !panel && !menuOpen && (
//         <div className="absolute bottom-16 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
//           onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
//           <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-cyan-400/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
//         </div>
//       )}

//       {!selected && !panel && !cartOpen && !menuOpen && (
//         <button onClick={() => { rideCmdRef.current = 1; }} className={`absolute bottom-16 right-5 z-30 rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
//           {riding ? '🛑 নামুন (F)' : nearBike ? '🏍️ চড়ুন (F)' : '🏍️ বাইক ডাকুন (F)'}
//         </button>
//       )}

//       {paused && (
//         <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
//           <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
//         </div>
//       )}
//     </main>
//   );
// }


































// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { createWorld, RZ0, type Helpers } from './word';

// /* ===== আপনার দোকান ও পণ্য এখানে বদলান ===== */
// const SHOPS = [
//   { name: 'রহিম স্টোর', products: [1, 2, 3, 4].map((i) => ({ id: 'a' + i, name: 'পণ্য ' + i, price: 100 * i, image: `https://picsum.photos/seed/a${i}/200/160`, kind: 'item', color: 0xef4444 })) },
//   { name: 'করিম বাজার', products: [5, 6, 7, 8].map((i) => ({ id: 'b' + i, name: 'পণ্য ' + i, price: 120 * i, image: `https://picsum.photos/seed/b${i}/200/160`, kind: 'item', color: 0x2563eb })) },
// ];

// type Mode = 'auto' | 'day' | 'night';

// export default function Page() {
//   const mount = useRef<HTMLDivElement>(null);
//   const modeRef = useRef<Mode>('auto');
//   const [menu, setMenu] = useState(false);
//   const [mode, setMode] = useState<Mode>('auto');
//   const [money, setMoney] = useState(1000);
//   const [toast, setToast] = useState('');
//   const moneyRef = useRef(1000);
//   const toastT = useRef<any>(null);
//   const say = (m: string) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2800); };
//   const sayRef = useRef(say); sayRef.current = say;

//   useEffect(() => { modeRef.current = mode; }, [mode]);

//   useEffect(() => {
//     const el = mount.current!;
//     const scene = new THREE.Scene();
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
//     renderer.setSize(innerWidth, innerHeight);
//     renderer.shadowMap.enabled = true;
//     el.appendChild(renderer.domElement);
//     const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);
//     const tl = new THREE.TextureLoader();

//     /* ---------- helpers ---------- */
//     const M = (c: number, r = 0.7, m = 0, e = 0, ei = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei });
//     const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
//     const cy = (a: number, b: number, hh: number, s = 12) => new THREE.CylinderGeometry(a, b, hh, s);
//     const sp = (r: number, w = 16, hh = 12) => new THREE.SphereGeometry(r, w, hh);
//     const pl = (w: number, hh: number) => new THREE.PlaneGeometry(w, hh);
//     const add: Helpers['add'] = (p, g, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
//       const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.rotation.set(rx, ry, rz); p.add(mesh); return mesh;
//     };
//     const canvasTex: Helpers['canvasTex'] = (w, hh, d) => {
//       const c = document.createElement('canvas'); c.width = w; c.height = hh; d(c.getContext('2d')!);
//       const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
//     };
//     const photoMat: Helpers['photoMat'] = (url, loader) => {
//       const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshBasicMaterial({ map: t });
//     };
//     const human: Helpers['human'] = (o) => {
//       const g = new THREE.Group(), skin = M(o.skin ?? 0xe0ac8a, 0.8), shirt = M(o.shirt ?? 0x2563eb, 0.8), pants = M(0x1f2937, 0.8);
//       const body = new THREE.Group(); g.add(body);
//       add(body, bx(0.6, 0.7, 0.32), shirt, 0, 1.25, 0).castShadow = true;
//       add(body, sp(0.22), skin, 0, 1.82, 0);
//       const hc = o.hair ?? 0x1a1a1a, hm = M(hc, 0.9);
//       if (o.style === 'long') add(body, bx(0.46, 0.5, 0.2), hm, 0, 1.75, 0.12);
//       else if (o.style === 'bun') { add(body, sp(0.24, 12, 8), hm, 0, 1.88, 0.02, 1, 0.6, 1); add(body, sp(0.1), hm, 0, 2.06, 0.05); }
//       else if (o.style === 'cap') { add(body, sp(0.24, 12, 8), M(0xdc2626), 0, 1.9, 0, 1, 0.55, 1); add(body, bx(0.3, 0.03, 0.2), M(0xdc2626), 0, 1.86, -0.22); }
//       else if (o.style !== 'bald') add(body, sp(0.235, 12, 8), hm, 0, 1.9, 0.02, 1, 0.6, 1);
//       if (o.glasses) add(body, bx(0.3, 0.06, 0.02), M(0x111111), 0, 1.84, -0.2);
//       const limb = (x: number, y: number, len: number, m: THREE.Material) => {
//         const p = new THREE.Group(); p.position.set(x, y, 0); add(p, bx(0.2, len, 0.2), m, 0, -len / 2, 0).castShadow = true; g.add(p); return p;
//       };
//       const lA = limb(-0.4, 1.55, 0.65, skin), rA = limb(0.4, 1.55, 0.65, skin), lL = limb(-0.15, 0.9, 0.9, pants), rL = limb(0.15, 0.9, 0.9, pants);
//       let ride = false;
//       return {
//         group: g,
//         setRide: (v: boolean) => { ride = v; if (v) { lL.rotation.x = rL.rotation.x = -Math.PI / 2; g.position.y = 0.3; } else { lL.rotation.x = rL.rotation.x = 0; } },
//         update: (p: number, a: number, t: number) => {
//           if (ride) { lA.rotation.x = Math.sin(t * 2) * 0.3; rA.rotation.x = -Math.sin(t * 2) * 0.3; return; }
//           const s = Math.sin(p) * 0.8 * a;
//           lA.rotation.x = s; rA.rotation.x = -s; lL.rotation.x = -s; rL.rotation.x = s;
//         },
//       };
//     };
//     const H: Helpers = { add, bx, cy, sp, pl, M, canvasTex, photoMat, human };

//     /* ---------- আলো, আকাশ, মাটি ---------- */
//     const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(80, 120, 40); sun.castShadow = true;
//     sun.shadow.camera.left = -80; sun.shadow.camera.right = 80; sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80; sun.shadow.mapSize.set(1024, 1024);
//     const amb = new THREE.AmbientLight(0xffffff, 0.6);
//     scene.add(sun, sun.target, amb);
//     const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), M(0x4a7c3a, 0.95));
//     ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
//     const road = new THREE.Mesh(new THREE.PlaneGeometry(1600, 8), M(0x374151, 0.9)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 40); scene.add(road);

//     const world = createWorld(scene, H, () => SHOPS, tl);

//     /* ---------- খেলোয়াড় ---------- */
//     const me = human({ shirt: 0x2563eb, style: 'short' }); scene.add(me.group);
//     const P = { x: 0, z: 30, yaw: Math.PI, walk: 0 };
//     const keys: Record<string, boolean> = {};
//     const kd = (e: KeyboardEvent) => {
//       keys[e.code] = true;
//       if (e.code === 'KeyG') {
//         if (P.z > 44 && P.z < RZ0 - 0.5) { const r = world.fishPress(); sayRef.current(r.msg); if (r.gain) { moneyRef.current += r.gain; setMoney(moneyRef.current); } }
//         else sayRef.current('নদীর পাড়ে গিয়ে G চাপুন');
//       }
//       if (e.code === 'KeyE') {
//         const pt = new THREE.Vector3(P.x, 1.4, P.z);
//         const h = world.hits.find((q) => q.box.distanceToPoint(pt) < 3);
//         if (!h) return sayRef.current('কাছে কোনো পণ্য নেই');
//         if (moneyRef.current < h.p.price) return sayRef.current('টাকা কম!');
//         moneyRef.current -= h.p.price; setMoney(moneyRef.current); sayRef.current(`✅ ${h.p.name} কিনেছেন — ৳${h.p.price} (${h.shop})`);
//       }
//     };
//     const ku = (e: KeyboardEvent) => { keys[e.code] = false; };
//     addEventListener('keydown', kd); addEventListener('keyup', ku);
//     let drag = false;
//     const md = () => (drag = true), mu = () => (drag = false), mm = (e: MouseEvent) => { if (drag) P.yaw -= e.movementX * 0.005; };
//     renderer.domElement.addEventListener('mousedown', md); addEventListener('mouseup', mu); addEventListener('mousemove', mm);

//     const resize = () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
//     addEventListener('resize', resize);

//     /* ---------- লুপ ---------- */
//     const clock = new THREE.Clock(); let raf = 0, dayF = 1;
//     const dayC = new THREE.Color(0x87ceeb), nightC = new THREE.Color(0x0b1228);
//     const blocked = (x: number, z: number) => world.riverBlocked(x, z) || world.col.some((b) => x > b.minX - 0.4 && x < b.maxX + 0.4 && z > b.minZ - 0.4 && z < b.maxZ + 0.4);
//     const loop = () => {
//       raf = requestAnimationFrame(loop);
//       const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
//       const m = modeRef.current;
//       const target = m === 'day' ? 1 : m === 'night' ? 0 : 0.5 + 0.5 * Math.sin(t * 0.05);
//       dayF += (target - dayF) * Math.min(1, dt * 2);
//       scene.background = dayC.clone().lerp(nightC, 1 - dayF); scene.fog = new THREE.Fog(scene.background as THREE.Color, 120, 600);
//       sun.intensity = 0.15 + dayF * 1.05; amb.intensity = 0.25 + dayF * 0.4;

//       if (keys.KeyA || keys.ArrowLeft) P.yaw += 2 * dt;
//       if (keys.KeyD || keys.ArrowRight) P.yaw -= 2 * dt;
//       const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), spd = (keys.ShiftLeft ? 9 : 5) * f * dt;
//       const nx = P.x - Math.sin(P.yaw) * spd, nz = P.z - Math.cos(P.yaw) * spd;
//       if (!blocked(nx, P.z)) P.x = nx;
//       if (!blocked(P.x, nz)) P.z = nz;
//       if (f) P.walk += dt * (keys.ShiftLeft ? 12 : 8);
//       const y = world.heightAt(P.x, P.z);
//       me.group.position.set(P.x, y, P.z); me.group.rotation.y = P.yaw; me.update(P.walk, f ? 1 : 0, t);

//       const nearRiver = P.z > 44 && P.z < RZ0 - 0.5;
//       const msg = world.fishStep(dt, nearRiver ? new THREE.Vector3(P.x, 0, P.z) : null, P.yaw, t);
//       if (!nearRiver) world.fishReset();
//       if (msg) { sayRef.current(msg); }

//       world.update(t, dt, dayF);
//       camera.position.set(P.x + Math.sin(P.yaw) * 8, y + 4.5, P.z + Math.cos(P.yaw) * 8);
//       camera.lookAt(P.x, y + 1.6, P.z);
//       renderer.render(scene, camera);
//     };
//     loop();

//     return () => {
//       cancelAnimationFrame(raf);
//       removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', resize);
//       removeEventListener('mouseup', mu); removeEventListener('mousemove', mm);
//       renderer.dispose(); el.removeChild(renderer.domElement);
//     };
//   }, []);

//   const fs = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); setMenu(false); };
//   const item = 'w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 rounded-lg';

//   return (
//     <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#000' }}>
//       <div ref={mount} style={{ position: 'absolute', inset: 0 }} />

//       {/* ⋮ মেনু — উপরের সব অপশন এর ভেতরে */}
//       <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
//         <button onClick={() => setMenu((v) => !v)} aria-label="menu"
//           style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(15,23,42,.75)', color: '#fff', fontSize: 26, border: 0, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>⋮</button>
//         {menu && (
//           <>
//             <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0 }} />
//             <div style={{ position: 'absolute', right: 0, top: 52, width: 230, padding: 8, borderRadius: 14, background: 'rgba(15,23,42,.92)', color: '#fff', backdropFilter: 'blur(8px)', boxShadow: '0 10px 30px rgba(0,0,0,.4)' }}>
//               <div className="px-4 py-2 text-sm" style={{ padding: '8px 16px', opacity: 0.8 }}>💰 টাকা: ৳{money}</div>
//               <button className={item} style={{ ...btn }} onClick={() => { setMode('auto'); setMenu(false); }}>🔄 দিন-রাত অটো {mode === 'auto' ? '✓' : ''}</button>
//               <button className={item} style={{ ...btn }} onClick={() => { setMode('day'); setMenu(false); }}>☀️ দিন {mode === 'day' ? '✓' : ''}</button>
//               <button className={item} style={{ ...btn }} onClick={() => { setMode('night'); setMenu(false); }}>🌙 রাত {mode === 'night' ? '✓' : ''}</button>
//               <button className={item} style={{ ...btn }} onClick={fs}>⛶ ফুলস্ক্রিন</button>
//               <div style={{ padding: '8px 16px', fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>
//                 W/S চলা • A/D ঘোরা • Shift দৌড়<br />E কেনা • G মাছ ধরা (নদীর পাড়ে)
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {toast && (
//         <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,.85)', color: '#fff', padding: '10px 18px', borderRadius: 12, fontSize: 15, zIndex: 10, maxWidth: '90vw', textAlign: 'center' }}>{toast}</div>
//       )}
//     </div>
//   );
// }

// const btn: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 14, background: 'transparent', color: '#fff', border: 0, borderRadius: 10, cursor: 'pointer' };




// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// // দরকার: three r151+ (mergeGeometries)। পুরনো ভার্সনে এটা mergeBufferGeometries নামে ছিল।
// import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// /* ============================ টাইপ ও ধ্রুবক ============================ */
// type Product = { id: string; name: string; price: number; image: string; kind: string; color: number };
// type Sel = Product & { shop: string };
// type CartItem = Sel & { count: number };
// type Shop = { id: string; name: string; subtitle: string; x: number; z: number; accent: number; style: string; products: Product[] };
// type Profile = { name: string; photo: string };
// type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
// type Slot = { x: number; y: number; z: number; ry: number; s: number };

// const MAX_SHOPS = 120;
// const LS_KEY = 'grand-mall-ls-v2';

// const KINDS: [string, string, string][] = [
//   ['tshirt', 'টি-শার্ট', '👕'], ['jacket', 'জ্যাকেট', '🧥'], ['sneaker', 'জুতা', '👟'], ['glasses', 'সানগ্লাস', '🕶️'],
//   ['bag', 'ব্যাগ', '👜'], ['watch', 'ঘড়ি', '⌚'], ['phone', 'ফোন', '📱'], ['camera', 'ক্যামেরা', '📷'],
//   ['headphone', 'হেডফোন', '🎧'], ['chair', 'চেয়ার', '🪑'], ['lamp', 'ল্যাম্প', '💡'], ['plant', 'গাছ', '🪴'],
//   ['book', 'বই', '📚'], ['jar', 'মধু/জার', '🍯'], ['chocolate', 'চকলেট', '🍫'], ['sack', 'চালের বস্তা', '🌾'],
//   ['coffee', 'কফি', '☕'], ['bottle', 'বোতল', '🧴'], ['box', 'গিফট বক্স', '🎁'], ['frame', 'ছবির ফ্রেম', '🖼️'],
// ];
// const KIND_EMOJI: Record<string, string> = Object.fromEntries(KINDS.map(([k, , e]) => [k, e]));

// /* শেলফ ও টেবিলের স্লট — একটি দোকানে সর্বোচ্চ MAX_PRODUCTS টি পণ্য */
// const SHELF_Y = [0.8, 2.0, 3.2, 4.4];
// const TABLE_X = [-5.3, -1.8, 1.8, 5.3], TABLE_Z = [-3.5, 2.2];
// const SLOTS: Slot[] = (() => {
//   const a: Slot[] = [];
//   TABLE_Z.forEach((z) => TABLE_X.forEach((x) => a.push({ x, y: 1.66, z, ry: 0, s: 1.35 })));
//   for (const ti of [1, 2, 0, 3]) {
//     const y = SHELF_Y[ti] + 0.04;
//     for (let i = 0; i < 12; i++) {
//       const z = -7.9 + i;
//       a.push({ x: -8, y, z, ry: Math.PI / 2, s: 1 }, { x: 8, y, z, ry: -Math.PI / 2, s: 1 });
//     }
//     for (let i = 0; i < 13; i++) a.push({ x: -7.2 + i * 1.2, y, z: -9.1, ry: 0, s: 1 });
//   }
//   return a;
// })();
// const MAX_PRODUCTS = SLOTS.length;

// const shopSlot = (k: number) => ({ x: k % 2 ? 17 : -17, z: -14 - Math.floor(k / 2) * 19 });
// const nextSlots = (shops: Shop[], n: number) => {
//   const used = new Set(shops.map((s) => `${s.x},${s.z}`));
//   const out: { x: number; z: number }[] = [];
//   for (let k = 0; k < MAX_SHOPS && out.length < n; k++) { const p = shopSlot(k); if (!used.has(`${p.x},${p.z}`)) out.push(p); }
//   return out;
// };

// /* ============================ ডেমো ডেটা জেনারেটর ============================ */
// const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
// const taka = (n: number) => '৳' + n.toLocaleString();
// const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
// const ph = (kind: string, c = 0x334155) =>
//   'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500"><rect width="600" height="500" fill="${hex(c)}"/><text x="300" y="320" font-size="190" text-anchor="middle">${KIND_EMOJI[kind] ?? '🛍️'}</text></svg>`);
// const IMG: Record<string, string> = {
//   tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
//   sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
//   headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
//   lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
//   sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
// };
// const STYLE_KINDS: Record<string, string[]> = {
//   fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
//   tech: ['phone', 'watch', 'camera', 'headphone'],
//   home: ['chair', 'lamp', 'plant', 'book', 'jar'],
//   market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
// };
// const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
// const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };
// const ADJ = ['Classic', 'Premium', 'Urban', 'Royal', 'Eco', 'Ultra', 'Smart', 'Modern', 'Elite', 'Fresh'];
// const PAL = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9, 0x14b8a6, 0xf97316, 0x64748b, 0x1e293b, 0xf1f5f9];
// const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// const genProducts = (style: string, n: number, seed: number, pre: string): Product[] => {
//   const r = rng(seed), kinds = STYLE_KINDS[style] ?? STYLE_KINDS.market;
//   return Array.from({ length: Math.min(n, MAX_PRODUCTS) }, (_, i) => {
//     const kind = kinds[i % kinds.length], color = PAL[Math.floor(r() * PAL.length)];
//     const price = Math.round((BASEP[kind] * (0.6 + r() * 1.2)) / 10) * 10;
//     return { id: `${pre}${i}`, name: `${ADJ[Math.floor(r() * ADJ.length)]} ${BASE[kind]} ${i + 1}`, price, image: IMG[kind] ?? ph(kind, color), kind, color };
//   });
// };
// const SHOP_A = ['NOVA', 'ZEN', 'ROYAL', 'URBAN', 'PRIME', 'LUXE', 'SKY', 'METRO', 'ALPHA', 'BLUE', 'GOLDEN', 'SMART', 'FRESH', 'MEGA', 'ELITE'];
// const SHOP_B: Record<string, string> = { fashion: 'FASHION', tech: 'TECH', home: 'HOME', market: 'MART' };
// const SHOP_SUB: Record<string, string> = { fashion: 'Premium Fashion', tech: 'Smart Devices', home: 'Furniture & Decor', market: 'Grocery & Food' };
// const genShop = (i: number, slot: { x: number; z: number }, nProducts: number): Shop => {
//   const style = Object.keys(STYLE_KINDS)[i % 4], r = rng(i * 977 + 13);
//   return { id: `d${i}-${Date.now().toString(36)}`, name: `${SHOP_A[Math.floor(r() * SHOP_A.length)]} ${SHOP_B[style]} ${i + 1}`, subtitle: SHOP_SUB[style], ...slot, accent: PAL[(i * 5 + 1) % (PAL.length - 1)], style, products: genProducts(style, nProducts, i * 31 + 7, `d${i}p`) };
// };
// const defaultShops = (): Shop[] => {
//   const mk = (id: string, name: string, subtitle: string, k: number, accent: number, style: string, first: Product[]): Shop =>
//     ({ id, name, subtitle, ...shopSlot(k), accent, style, products: [...first, ...genProducts(style, 36, k * 11 + 3, id + '_g')] });
//   const p = (id: string, name: string, price: number, kind: string, color: number): Product => ({ id, name, price, image: IMG[kind] ?? ph(kind, color), kind, color });
//   return [
//     mk('fashion', 'NOVA FASHION', 'Premium Fashion', 0, 0x7c3aed, 'fashion', [p('f1', 'Premium T-Shirt', 1800, 'tshirt', 0x2563eb), p('f2', 'Urban Jacket', 5200, 'jacket', 0x1e293b), p('f3', 'Classic Sunglasses', 2400, 'glasses', 0x111827), p('f4', 'Running Sneaker', 4200, 'sneaker', 0xef4444)]),
//     mk('tech', 'TECHHUB', 'Smart Devices', 1, 0x0891b2, 'tech', [p('t1', 'Smart Watch', 4500, 'watch', 0x1e293b), p('t2', 'Mirrorless Camera', 62000, 'camera', 0xcbd5e1), p('t3', 'Wireless Headphones', 6800, 'headphone', 0x111827), p('t4', 'Flagship Phone', 92000, 'phone', 0x64748b)]),
//     mk('home', 'URBAN HOME', 'Furniture & Decor', 2, 0xd97706, 'home', [p('h1', 'Designer Chair', 8500, 'chair', 0xd97706), p('h2', 'Modern Table Lamp', 3200, 'lamp', 0xfacc15)]),
//     mk('market', 'FRESH MART', 'Grocery & Food', 3, 0x16a34a, 'market', [p('m1', 'Organic Honey', 950, 'jar', 0xd9901a), p('m2', 'Imported Chocolate', 1500, 'chocolate', 0x7c3aed), p('m3', 'Premium Rice 10KG', 1800, 'sack', 0xf1f5f9), p('m4', 'Fresh Coffee', 1250, 'coffee', 0x1e293b)]),
//   ];
// };

// /* ============================ IndexedDB (বড় ডেটার জন্য) ============================ */
// const openDB = () => new Promise<IDBDatabase>((res, rej) => {
//   const r = indexedDB.open('grand-mall', 1);
//   r.onupgradeneeded = () => r.result.createObjectStore('kv');
//   r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
// });
// const kv = {
//   async get(k: string): Promise<unknown> {
//     try { const db = await openDB(); return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; }
//   },
//   async set(k: string, v: unknown) {
//     try { const db = await openDB(); await new Promise<void>((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); } catch { /* ignore */ }
//   },
// };

// const fileToDataUrl = (file: File, max: number) =>
//   new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onerror = () => rej(new Error('read'));
//     r.onload = () => {
//       const img = new Image();
//       img.onerror = () => rej(new Error('img'));
//       img.onload = () => {
//         const s = Math.min(1, max / Math.max(img.width, img.height));
//         const c = document.createElement('canvas');
//         c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
//         c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
//         res(c.toDataURL('image/jpeg', 0.82));
//       };
//       img.src = r.result as string;
//     };
//     r.readAsDataURL(file);
//   });

// /* ============================ শেয়ার্ড ক্যাশ (জিওমেট্রি / ম্যাটেরিয়াল / টেক্সচার) ============================ */
// const GC = new Map<string, THREE.BufferGeometry>();
// const G = (k: string, f: () => THREE.BufferGeometry) => { let g = GC.get(k); if (!g) { g = f(); g.userData.keep = true; GC.set(k, g); } return g; };
// const bx = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
// const cy = (a: number, b: number, h: number, s = 16) => G(`c${a}_${b}_${h}_${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
// const sp = (r: number, w = 14, h = 10) => G(`s${r}_${w}_${h}`, () => new THREE.SphereGeometry(r, w, h));
// const to = (r: number, t: number, arc = Math.PI * 2) => G(`t${r}_${t}_${arc}`, () => new THREE.TorusGeometry(r, t, 8, 22, arc));
// const cp = (r: number, l: number) => G(`p${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
// const pl = (w: number, h: number) => G(`pl${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

// const MC = new Map<string, THREE.MeshStandardMaterial>();
// const M = (c: number, r = 0.6, m = 0.1, e = 0, ei = 0) => {
//   const k = `${c}|${r}|${m}|${e}|${ei}`; let x = MC.get(k);
//   if (!x) { x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.keep = true; MC.set(k, x); }
//   return x;
// };
// const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => {
//   const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
//   const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
// };
// const TXC = new Map<string, THREE.CanvasTexture>();
// const tileTex = (a: string, b: string, rx: number, ry: number) => {
//   const k = `${a}${b}${rx}${ry}`; let t = TXC.get(k);
//   if (!t) {
//     t = canvasTex(256, 256, (x) => { x.fillStyle = a; x.fillRect(0, 0, 256, 256); x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128); x.strokeStyle = 'rgba(0,0,0,.12)'; x.strokeRect(0, 0, 256, 256); });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.userData.keep = true; TXC.set(k, t);
//   }
//   return t;
// };
// const slatTex = () => {
//   let t = TXC.get('slat');
//   if (!t) {
//     t = canvasTex(256, 64, (x) => { x.fillStyle = '#1f1710'; x.fillRect(0, 0, 256, 64); for (let k = 0; k < 16; k++) { x.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; x.fillRect(k * 16, 0, 11, 64); } });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.userData.keep = true; TXC.set('slat', t);
//   }
//   return t;
// };
// const signTexture = (title: string, sub: string, accent: number) => canvasTex(1024, 280, (x) => {
//   x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280); x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
//   x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center'; x.fillText(title, 512, 125, 960);
//   x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial'; x.fillText(sub, 512, 190, 960);
// });

// const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
//   const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); p.add(k); return k;
// };
// const tone = (c: number, k: number) => {
//   const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
//   return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
// };
// const disposeTree = (root: THREE.Object3D) => root.traverse((o) => {
//   const m = o as THREE.Mesh;
//   if (m.geometry && !(o as THREE.Sprite).isSprite && !m.geometry.userData.keep) m.geometry.dispose();
//   const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
//   mats.forEach((mm) => {
//     if (mm.userData.keep) return;
//     const mp = (mm as THREE.MeshBasicMaterial).map;
//     if (mp && !mp.userData.keep) mp.dispose();
//     mm.dispose();
//   });
// });

// /* ============================ ৩D পণ্য (প্রসিডিউরাল মডেল) ============================ */
// const shirtGeo = (jacket: boolean) => G(jacket ? 'jacket' : 'tshirt', () => {
//   const pts: [number, number][] = jacket
//     ? [[-.27, 0], [.27, 0], [.27, .4], [.4, .1], [.58, .16], [.46, .62], [.16, .78], [.1, .72], [-.1, .72], [-.16, .78], [-.46, .62], [-.58, .16], [-.4, .1], [-.27, .4]]
//     : [[-.24, 0], [.24, 0], [.24, .42], [.46, .34], [.54, .54], [.3, .74], [.12, .74], [.07, .64], [-.07, .64], [-.12, .74], [-.3, .74], [-.54, .54], [-.46, .34], [-.24, .42]];
//   const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
//   const d = jacket ? 0.12 : 0.08;
//   const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
// });

// function buildProduct(kind: string, color: number, image: string, tl: THREE.TextureLoader): THREE.Group {
//   const g = new THREE.Group();
//   const c = M(color, 0.5, 0.05), c2 = M(tone(color, 0.35), 0.5, 0.05), cd = M(tone(color, -0.35), 0.5, 0.05);
//   const dk = M(0x111827, 0.4, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), wh = M(0xf8fafc, 0.5, 0), gold = M(0xfacc15, 0.3, 0.8), wood = M(0x6b4a2e, 0.6, 0.05);
//   const scr = M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.7), green = M(0x1f8a4c, 0.8, 0), green2 = M(0x2f9e44, 0.8, 0);
//   const H = Math.PI / 2;
//   switch (kind) {
//     case 'tshirt':
//       add(g, shirtGeo(false), c); add(g, bx(0.5, 0.04, 0.085), c2, 0, 0.14, 0);
//       add(g, cy(0.07, 0.07, 0.012, 14), wh, 0.12, 0.47, 0.045, 1, 1, 1, H); break;
//     case 'jacket':
//       add(g, shirtGeo(true), c); add(g, bx(0.03, 0.76, 0.125), dk, 0, 0.38, 0);
//       for (const s of [-1, 1]) add(g, bx(0.14, 0.03, 0.13), dk, s * 0.15, 0.2, 0);
//       add(g, bx(0.1, 0.05, 0.13), cd, 0, 0.74, 0); break;
//     case 'sneaker':
//       add(g, bx(0.36, 0.07, 0.86), wh, 0, 0.035, 0);
//       add(g, bx(0.32, 0.3, 0.4), c, 0, 0.22, -0.2); add(g, sp(0.17), c, 0, 0.17, 0.2, 1, 0.85, 1.7);
//       add(g, bx(0.22, 0.14, 0.32), c2, 0, 0.32, 0.02); add(g, bx(0.335, 0.06, 0.45), cd, 0, 0.14, -0.05);
//       for (const z of [-0.04, 0.06, 0.16]) add(g, bx(0.2, 0.025, 0.05), wh, 0, 0.4 - z * 0.3, z);
//       break;
//     case 'glasses': {
//       const lens = M(tone(color, -0.3), 0.05, 0.9);
//       for (const s of [-1, 1]) { add(g, to(0.17, 0.022), dk, s * 0.22, 0.2, 0); add(g, cy(0.165, 0.165, 0.012, 20), lens, s * 0.22, 0.2, 0, 1, 1, 1, H); add(g, bx(0.025, 0.025, 0.5), dk, s * 0.4, 0.26, -0.25); }
//       add(g, bx(0.1, 0.025, 0.03), dk, 0, 0.26, 0); break;
//     }
//     case 'watch':
//       add(g, cy(0.14, 0.17, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.03, 0.03, 0.2, 10), mt, 0, 0.12, 0);
//       add(g, to(0.2, 0.05), c, 0, 0.38, 0, 1, 1.1, 0.6); add(g, cy(0.17, 0.17, 0.07, 24), mt, 0, 0.38, 0, 1, 1, 1, H);
//       add(g, cy(0.145, 0.145, 0.078, 24), scr, 0, 0.38, 0, 1, 1, 1, H); add(g, cy(0.02, 0.02, 0.06, 8), mt, 0.19, 0.42, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.02, 0.1, 0.01), wh, 0, 0.42, 0.042); add(g, bx(0.07, 0.02, 0.01), wh, 0.03, 0.38, 0.042); break;
//     case 'phone': {
//       const t = new THREE.Group(); t.position.y = 0.42; t.rotation.x = -0.1; g.add(t);
//       add(t, bx(0.36, 0.74, 0.045), c, 0, 0, 0); add(t, bx(0.33, 0.7, 0.01), scr, 0, 0, 0.024);
//       add(t, bx(0.13, 0.13, 0.02), dk, -0.08, 0.27, -0.03); add(t, cy(0.035, 0.035, 0.02, 12), M(0x38bdf8, 0.1, 0.9), -0.08, 0.27, -0.045, 1, 1, 1, H);
//       add(t, bx(0.12, 0.012, 0.012), wh, 0, 0.3, 0.032); add(g, bx(0.2, 0.05, 0.1), mt, 0, 0.025, -0.02); break;
//     }
//     case 'camera':
//       add(g, bx(0.7, 0.38, 0.3), dk, 0, 0.25, 0); add(g, bx(0.7, 0.12, 0.31), mt, 0, 0.44, 0); add(g, bx(0.2, 0.1, 0.2), dk, -0.1, 0.55, 0);
//       add(g, cy(0.17, 0.17, 0.24, 22), dk, 0.03, 0.25, 0.25, 1, 1, 1, H); add(g, cy(0.18, 0.18, 0.04, 22), mt, 0.03, 0.25, 0.2, 1, 1, 1, H);
//       add(g, cy(0.12, 0.12, 0.02, 22), M(0x1e3a8a, 0.05, 0.9, 0x1e40af, 0.4), 0.03, 0.25, 0.375, 1, 1, 1, H);
//       add(g, bx(0.18, 0.32, 0.12), dk, -0.26, 0.22, 0.14); add(g, cy(0.04, 0.04, 0.04, 10), c, 0.26, 0.5, 0); break;
//     case 'headphone':
//       add(g, cy(0.17, 0.19, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.035, 0.035, 0.3, 10), mt, 0, 0.17, 0);
//       add(g, to(0.3, 0.035, Math.PI), c, 0, 0.36, 0);
//       for (const s of [-1, 1]) { add(g, cy(0.13, 0.13, 0.1, 18), c, s * 0.32, 0.36, 0, 1, 1, 1, 0, 0, H); add(g, cy(0.11, 0.11, 0.05, 18), dk, s * 0.26, 0.36, 0, 1, 1, 1, 0, 0, H); }
//       break;
//     case 'chair':
//       add(g, bx(0.55, 0.07, 0.55), wood, 0, 0.5, 0); add(g, bx(0.5, 0.1, 0.5), c, 0, 0.58, 0); add(g, bx(0.52, 0.5, 0.07), c, 0, 0.88, -0.25, 1, 1, 1, -0.12);
//       for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, cy(0.03, 0.022, 0.5, 8), wood, sx * 0.23, 0.25, sz * 0.23);
//       break;
//     case 'lamp':
//       add(g, cy(0.16, 0.19, 0.04, 20), dk, 0, 0.02, 0); add(g, cy(0.022, 0.022, 0.55, 8), gold, 0, 0.3, 0);
//       add(g, cy(0.16, 0.3, 0.34, 24), M(tone(color, 0.5), 0.7, 0, color, 0.55), 0, 0.72, 0); add(g, sp(0.07), M(0xfff3c4, 0.3, 0, 0xffe08a, 2), 0, 0.68, 0); break;
//     case 'plant':
//       add(g, cy(0.2, 0.15, 0.3, 16), c, 0, 0.15, 0); add(g, cy(0.2, 0.2, 0.03, 16), dk, 0, 0.3, 0);
//       add(g, sp(0.22), green, 0, 0.5, 0); add(g, sp(0.16), green2, 0.16, 0.42, 0.05); add(g, sp(0.17), green2, -0.15, 0.44, -0.05); add(g, sp(0.14), green, 0, 0.7, 0); break;
//     case 'book':
//       add(g, bx(0.5, 0.12, 0.38), c, 0, 0.06, 0); add(g, bx(0.46, 0.08, 0.36), wh, 0.02, 0.06, 0.005);
//       add(g, bx(0.46, 0.1, 0.34), c2, 0.02, 0.17, 0, 1, 1, 1, 0, 0.15); add(g, bx(0.5, 0.012, 0.1), gold, 0, 0.13, 0.15); break;
//     case 'jar':
//       add(g, cy(0.2, 0.2, 0.38, 20), M(0xd9901a, 0.12, 0.1, 0x7a4a00, 0.25), 0, 0.22, 0); add(g, cy(0.21, 0.21, 0.08, 20), gold, 0, 0.45, 0);
//       add(g, cy(0.205, 0.205, 0.17, 20), M(0xfdf3d8, 0.7, 0), 0, 0.22, 0); add(g, cy(0.1, 0.1, 0.01, 6), M(0xd9901a, 0.5, 0), 0, 0.22, 0.205, 1, 1, 1, H); break;
//     case 'chocolate':
//       add(g, bx(0.5, 0.72, 0.09), c, 0, 0.37, 0); add(g, bx(0.52, 0.14, 0.1), gold, 0, 0.52, 0); add(g, bx(0.3, 0.26, 0.01), wh, 0, 0.26, 0.05); add(g, bx(0.2, 0.05, 0.012), c, 0, 0.26, 0.056); break;
//     case 'sack':
//       add(g, bx(0.5, 0.66, 0.26), M(0xefe6cf, 0.9, 0), 0, 0.34, 0); add(g, bx(0.52, 0.2, 0.27), c, 0, 0.38, 0); add(g, cp(0.05, 0.12), M(0xefe6cf, 0.9, 0), 0, 0.74, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.28, 0.1, 0.01), wh, 0, 0.38, 0.14); break;
//     case 'coffee':
//       add(g, bx(0.42, 0.62, 0.2), dk, 0, 0.32, 0); add(g, bx(0.43, 0.22, 0.21), c, 0, 0.34, 0); add(g, bx(0.42, 0.06, 0.22), M(0x2b2f3a, 0.6, 0.1), 0, 0.65, 0);
//       add(g, cy(0.04, 0.04, 0.02, 12), wh, 0, 0.52, 0.105, 1, 1, 1, H); add(g, bx(0.2, 0.05, 0.01), gold, 0, 0.34, 0.11); break;
//     case 'bottle':
//       add(g, cy(0.13, 0.13, 0.46, 18), M(color, 0.12, 0.1), 0, 0.24, 0); add(g, cy(0.05, 0.12, 0.14, 14), M(color, 0.12, 0.1), 0, 0.54, 0); add(g, cy(0.05, 0.05, 0.16, 12), M(color, 0.12, 0.1), 0, 0.66, 0);
//       add(g, cy(0.055, 0.055, 0.06, 12), gold, 0, 0.76, 0); add(g, cy(0.135, 0.135, 0.2, 18), wh, 0, 0.24, 0); break;
//     case 'bag':
//       add(g, bx(0.58, 0.4, 0.22), c, 0, 0.22, 0); add(g, bx(0.59, 0.14, 0.24), cd, 0, 0.41, 0); add(g, to(0.17, 0.02, Math.PI), dk, 0, 0.46, 0); add(g, bx(0.08, 0.08, 0.02), gold, 0, 0.38, 0.125); break;
//     case 'frame': {
//       const tex = tl.load(image || ph('frame')); tex.colorSpace = THREE.SRGBColorSpace;
//       add(g, bx(0.72, 0.57, 0.05), wood, 0, 0.36, 0); add(g, pl(0.6, 0.45), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.36, 0.028); add(g, bx(0.04, 0.4, 0.04), wood, 0, 0.2, -0.1, 1, 1, 1, 0.3); break;
//     }
//     default:
//       add(g, bx(0.5, 0.4, 0.5), c, 0, 0.2, 0); add(g, bx(0.54, 0.08, 0.54), c2, 0, 0.44, 0);
//       add(g, bx(0.1, 0.4, 0.52), gold, 0, 0.2, 0); add(g, bx(0.52, 0.4, 0.1), gold, 0, 0.2, 0); add(g, sp(0.09), gold, -0.07, 0.54, 0, 1.3, 0.8, 1); add(g, sp(0.09), gold, 0.07, 0.54, 0, 1.3, 0.8, 1);
//   }
//   return g;
// }

// /* একই ম্যাটেরিয়ালের সব মেশ একসাথে মার্জ — ১৫০+ পণ্যেও ড্র-কল কম */
// function bake(root: THREE.Object3D): THREE.Mesh[] {
//   root.updateMatrixWorld(true);
//   const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
//   root.traverse((o) => {
//     const m = o as THREE.Mesh; if (!m.isMesh) return;
//     let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
//     g.applyMatrix4(m.matrixWorld);
//     const mat = m.material as THREE.Material, arr = buckets.get(mat);
//     if (arr) arr.push(g); else buckets.set(mat, [g]);
//   });
//   const out: THREE.Mesh[] = [];
//   buckets.forEach((list, mat) => {
//     const merged = mergeGeometries(list, false); list.forEach((x) => x.dispose());
//     if (merged) out.push(new THREE.Mesh(merged, mat));
//   });
//   return out;
// }

// /* ============================ মানুষ (আরো সুন্দর কার্টুন) ============================ */
// type HumanOpts = { shirt?: number; pants?: number; skin?: number; hair?: number; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; female?: boolean; glasses?: boolean; shoe?: number };
// function buildHuman(o: HumanOpts = {}) {
//   const skin = M(o.skin ?? 0xc98262, 0.55, 0), shirt = M(o.shirt ?? 0x2563eb, 0.6, 0), pants = M(o.pants ?? 0x1e293b, 0.7, 0), hair = M(o.hair ?? 0x17120f, 0.45, 0.1);
//   const dark = M(0x0a0a0a, 0.5, 0.1), white = M(0xffffff, 0.3, 0), shoe = M(o.shoe ?? 0xf1f5f9, 0.5, 0.1), sole = M(0x1f2937, 0.8, 0), lip = M(0xb4534b, 0.5, 0);
//   const fem = !!o.female, H = Math.PI / 2;
//   const group = new THREE.Group(), root = new THREE.Group(); group.add(root);

//   add(root, cp(0.36, 0.46), shirt, 0, 2.4, 0, fem ? 0.9 : 1, 1, 0.6);
//   add(root, sp(0.3), fem ? shirt : pants, 0, 1.75, 0, 1.12, 0.62, 0.78);
//   if (fem) add(root, cy(0.3, 0.52, 0.7, 20), shirt, 0, 1.62, 0);
//   else { add(root, bx(0.74, 0.08, 0.46), dark, 0, 1.9, 0); add(root, bx(0.1, 0.1, 0.05), M(0xfacc15, 0.3, 0.8), 0, 1.9, -0.24); }
//   add(root, cy(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
//   add(root, to(0.13, 0.035), shirt, 0, 2.97, 0, 1, 1, 1, H);

//   const arm = (s: number) => {
//     const a = new THREE.Group(); a.position.set(s * (fem ? 0.48 : 0.52), 2.8, 0); root.add(a);
//     add(a, sp(0.14), shirt, 0, 0, 0); add(a, cp(0.11, 0.26), shirt, 0, -0.24, 0); add(a, cp(0.085, 0.3), skin, 0, -0.64, 0); add(a, sp(0.095), skin, 0, -0.92, 0);
//     return a;
//   };
//   const leg = (s: number) => {
//     const l = new THREE.Group(); l.position.set(s * 0.2, 1.72, 0); root.add(l);
//     add(l, cp(0.14, 1.26), fem ? skin : pants, 0, -0.78, 0);
//     if (!fem) add(l, to(0.14, 0.02), dark, 0, -1.48, 0, 1, 1, 1, H);
//     add(l, bx(0.27, 0.14, 0.54), shoe, 0, -1.6, -0.1); add(l, bx(0.28, 0.05, 0.56), sole, 0, -1.695, -0.1);
//     return l;
//   };
//   const AL = arm(-1), AR = arm(1), LL = leg(-1), LR = leg(1);

//   const head = new THREE.Group(); head.position.set(0, 3.42, 0); root.add(head);
//   add(head, sp(0.3, 24, 18), skin, 0, 0, 0, 0.9, 1.08, 0.98);
//   for (const s of [-1, 1]) {
//     add(head, sp(0.05), skin, s * 0.27, -0.02, 0.0, 0.6, 1, 0.8);
//     add(head, sp(0.055), white, s * 0.105, 0.05, -0.252, 1, 0.8, 0.5); add(head, sp(0.03), dark, s * 0.105, 0.05, -0.28, 1, 1, 0.5);
//     add(head, bx(0.1, 0.018, 0.02), hair, s * 0.105, 0.14, -0.265, 1, 1, 1, 0, 0, s * 0.12);
//     if (o.glasses) add(head, to(0.075, 0.01), dark, s * 0.105, 0.05, -0.285);
//   }
//   if (o.glasses) add(head, bx(0.06, 0.012, 0.012), dark, 0, 0.06, -0.285);
//   add(head, sp(0.04), skin, 0, -0.03, -0.285, 1, 1.1, 1); add(head, to(0.065, 0.012, Math.PI), lip, 0, -0.1, -0.27, 1, 1, 0.5, 0, 0, Math.PI);
//   const capG = G('hcap', () => new THREE.SphereGeometry(0.315, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
//   const st = o.style ?? 'short';
//   if (st !== 'bald') {
//     add(head, capG, st === 'cap' ? shirt : hair, 0, 0.02, 0.03, 0.93, 1.1, 1);
//     if (st === 'short' || st === 'bun') add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9);
//     if (st === 'long') { add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9); add(head, cp(0.24, 0.5), hair, 0, -0.38, 0.15, 1, 1, 0.55); }
//     if (st === 'bun') add(head, sp(0.12), hair, 0, 0.36, 0.1);
//     if (st === 'cap') add(head, bx(0.4, 0.03, 0.28), shirt, 0, 0.12, -0.3);
//   }

//   const nm: { chest?: THREE.Mesh; tag?: THREE.Sprite } = {};
//   const setName = (name: string, photo?: string) => {
//     const make = (w: number, h: number, img?: HTMLImageElement) => {
//       const c = document.createElement('canvas'); c.width = w; c.height = h;
//       const x = c.getContext('2d')!;
//       x.fillStyle = 'rgba(5,11,22,.85)'; x.fillRect(0, 0, w, h);
//       const r = h / 2 - 8;
//       x.save(); x.beginPath(); x.arc(h / 2, h / 2, r, 0, 7); x.clip();
//       if (img) { const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, h / 2 - r, h / 2 - r, r * 2, r * 2); }
//       else { x.fillStyle = '#38bdf8'; x.fillRect(0, 0, h, h); }
//       x.restore();
//       x.fillStyle = '#fff'; x.font = `800 ${h * 0.4}px Arial`; x.textAlign = 'left'; x.textBaseline = 'middle';
//       x.fillText(name, h + 4, h / 2 + 2, w - h - 14);
//       const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
//     };
//     const apply = (img?: HTMLImageElement) => {
//       const ct = make(256, 96, img), tt = make(512, 128, img);
//       if (!nm.chest || !nm.tag) {
//         nm.chest = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshBasicMaterial({ map: ct }));
//         nm.chest.position.set(0, 2.5, -0.245); nm.chest.rotation.y = Math.PI; root.add(nm.chest);
//         nm.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tt, depthTest: false }));
//         nm.tag.scale.set(1.6, 0.4, 1); nm.tag.position.y = 0.62; nm.tag.renderOrder = 10; head.add(nm.tag);
//       } else {
//         const cm = nm.chest.material as THREE.MeshBasicMaterial, tm = nm.tag.material as THREE.SpriteMaterial;
//         cm.map?.dispose(); cm.map = ct; tm.map?.dispose(); tm.map = tt;
//       }
//     };
//     apply();
//     if (photo) { const im = new Image(); im.onload = () => apply(im); im.src = photo; }
//   };

//   /* বাইকে বসার ভঙ্গি */
//   let riding = false;
//   const setRide = (v: boolean) => { riding = v; };

//   const update = (phase: number, amt: number, t: number) => {
//     if (riding) {
//       LL.rotation.x = LR.rotation.x = 0.7; AL.rotation.x = AR.rotation.x = 1.1;
//       AL.rotation.z = 0.12; AR.rotation.z = -0.12; root.position.y = 0; head.rotation.y = 0;
//       return;
//     }
//     const s = Math.sin(phase) * 0.7 * amt;
//     LL.rotation.x = s; LR.rotation.x = -s; AL.rotation.x = -s * 0.8; AR.rotation.x = s * 0.8;
//     AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
//     root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
//     head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
//   };
//   return { group, update, setName, setRide };
// }
// type Human = ReturnType<typeof buildHuman>;

// /* ============================ মোটরসাইকেল ============================ */
// function buildMoto() {
//   const g = new THREE.Group(), H = Math.PI / 2;
//   const body = M(0xdc2626, 0.3, 0.6), dk = M(0x111827, 0.5, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), tire = M(0x0a0a0a, 0.9, 0);
//   const lampM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2.5), tail = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const wheel = (z: number) => {
//     const w = new THREE.Group(); w.position.set(0, 0.63, z); g.add(w);
//     add(w, to(0.5, 0.13), tire, 0, 0, 0, 1, 1, 1, 0, H, 0);
//     add(w, cy(0.4, 0.4, 0.1, 18), mt, 0, 0, 0, 1, 1, 1, 0, 0, H);
//     add(w, bx(0.06, 0.9, 0.06), dk); add(w, bx(0.06, 0.06, 0.9), dk);
//     return w;
//   };
//   const wf = wheel(-1.25), wr = wheel(1.1);
//   add(g, bx(0.4, 0.5, 0.9), mt, 0, 0.8, 0.05);                       // ইঞ্জিন
//   add(g, sp(0.4), body, 0, 1.45, -0.3, 0.8, 0.7, 1.5);               // ট্যাংক
//   add(g, bx(0.46, 0.16, 0.95), dk, 0, 1.25, 0.35);                   // সিট
//   add(g, bx(0.4, 0.08, 0.8), body, 0, 1.0, 1.05, 1, 1, 1, -0.2);     // পেছনের ফেন্ডার
//   for (const s of [-1, 1]) add(g, cy(0.035, 0.035, 1.16, 8), mt, s * 0.18, 1.14, -0.975, 1, 1, 1, 0.495); // ফর্ক
//   add(g, bx(1.0, 0.05, 0.05), dk, 0, 1.7, -0.7);                     // হ্যান্ডেলবার
//   add(g, sp(0.15), lampM, 0, 1.55, -0.9);                            // হেডলাইট
//   add(g, bx(0.25, 0.1, 0.06), tail, 0, 1.05, 1.5);                   // টেইললাইট
//   add(g, cy(0.07, 0.09, 1.0, 10), mt, 0.3, 0.55, 0.55, 1, 1, 1, H);  // এক্সজস্ট
//   const lamp = new THREE.SpotLight(0xfff2cc, 0, 60, 0.55, 0.5, 1.5);
//   lamp.position.set(0, 1.5, -1.1); lamp.target.position.set(0, 0.2, -14); g.add(lamp, lamp.target);
//   g.traverse((o) => { o.castShadow = true; });
//   return { g, wf, wr, lamp };
// }

// /* ============================ আকাশ, সূর্য, চাঁদ, তারা ============================ */
// function makeSky() {
//   const mat = new THREE.ShaderMaterial({
//     side: THREE.BackSide, depthWrite: false,
//     uniforms: { zenith: { value: new THREE.Vector3() }, horizon: { value: new THREE.Vector3() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Vector3(1, 1, 1) }, night: { value: 0 } },
//     vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
//     fragmentShader: `
//       varying vec3 vD; uniform vec3 zenith, horizon, sunDir, sunCol; uniform float night;
//       void main(){
//         vec3 d = normalize(vD); float h = d.y;
//         vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.5));
//         col = mix(col, horizon*0.55, clamp(-h*4.0,0.0,1.0));
//         float sd = max(dot(d, sunDir), 0.0);
//         col += sunCol*(pow(sd,6.0)*0.18 + pow(sd,48.0)*0.55);
//         col = mix(col, vec3(1.0,0.98,0.9), smoothstep(0.9988,0.9994,sd));
//         float md = max(dot(d,-sunDir),0.0);
//         col = mix(col, vec3(0.92,0.95,1.0), smoothstep(0.9993,0.9997,md)*night);
//         vec3 p = floor(d*220.0);
//         float s = fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453);
//         col += vec3(step(0.9985,s))*night*step(0.05,h);
//         gl_FragColor = vec4(col,1.0);
//       }`,
//   });
//   const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
//   mesh.renderOrder = -10; mesh.frustumCulled = false;
//   return mesh;
// }
// const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
// const NZ = [0.02, 0.04, 0.11], DZ = [0.14, 0.4, 0.85], SZ = [0.28, 0.2, 0.5];
// const NH = [0.07, 0.09, 0.2], DH = [0.7, 0.85, 1], SH = [1, 0.58, 0.32];

// /* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, গাছ, মেঘ, পাখি ============================ */
// function addOutdoors(scene: THREE.Scene) {
//   const bcol: Box2[] = []; // বাইরের বস্তুর collision (শহর addCity থেকে যোগ হয়)
//   const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
//     const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
//   };
//   plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
//   plane(1600, 30, 0x6b7280, 0.012, 64); // ফুটপাত/প্লাজা
//   const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
//   const m4 = new THREE.Matrix4();
//   for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
//   scene.add(dashes);

//   // গাছ
//   const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
//   for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
//     const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
//     add(t, cy(0.25, 0.35, 3, 8), M(0x5b3a1e, 0.9, 0), 0, 1.5, 0); add(t, ico, leafMs[k % 3], 0, 4, 0); add(t, ico, leafMs[(k + 1) % 3], 0.6, 5.2, 0.2, 0.7, 0.7, 0.7);
//     t.scale.setScalar(0.9 + (k % 4) * 0.12); scene.add(t);
//   }

//   // গাড়ি
//   const wheelM = M(0x0a0a0a, 0.8, 0), lightM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2), tailM = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const cars = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316].map((color, i) => {
//     const dir = i % 2 ? -1 : 1, g = new THREE.Group();
//     add(g, bx(4.2, 0.9, 1.9), M(color, 0.3, 0.6), 0, 0.8, 0); add(g, bx(2.2, 0.8, 1.7), M(0x9edfff, 0.1, 0.3), -0.2, 1.6, 0);
//     for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) add(g, cy(0.4, 0.4, 0.3, 16), wheelM, wx, 0.4, wz, 1, 1, 1, Math.PI / 2);
//     for (const lz of [-0.6, 0.6]) { add(g, bx(0.1, 0.2, 0.35), lightM, 2.1, 0.85, lz); add(g, bx(0.1, 0.2, 0.35), tailM, -2.1, 0.85, lz); }
//     g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
//     return { g, dir, sp: 9 + (i % 4) * 3 };
//   });

//   // মেঘ
//   const cloudTex = canvasTex(128, 64, (x) => {
//     for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 88, cyy = 28 + Math.random() * 12, r = 14 + Math.random() * 12, gr = x.createRadialGradient(cx, cyy, 0, cx, cyy, r); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cyy, r, 0, 7); x.fill(); }
//   });
//   const clouds = Array.from({ length: 16 }, (_, i) => {
//     const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
//     s.scale.set(90 + (i % 4) * 25, 36 + (i % 3) * 8, 1); s.position.set(-250 + i * 34, 85 + (i % 5) * 14, -150 + ((i * 53) % 260)); scene.add(s); return s;
//   });

//   // পাখি
//   const wingG = G('wing', () => new THREE.PlaneGeometry(1.2, 0.4)), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
//   const birds = Array.from({ length: 14 }, (_, i) => {
//     const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group();
//     const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
//     wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6; L.add(wl); R.add(wr);
//     const b = new THREE.Mesh(sp(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
//     g.add(L, R, b); scene.add(g);
//     return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
//   });

//   const update = (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
//     cars.forEach((c) => { c.g.position.x += c.dir * c.sp * dt; if (c.g.position.x > 150) c.g.position.x = -150; if (c.g.position.x < -150) c.g.position.x = 150; });
//     birds.forEach((b) => {
//       const a = t * b.sp + b.off;
//       b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6); b.g.rotation.y = -a;
//       const f = Math.sin(t * 9 + b.off) * 0.7; b.L.rotation.z = f; b.R.rotation.z = -f; b.g.visible = dayF > 0.15;
//     });
//     clouds.forEach((c, i) => {
//       c.position.x += dt * (1.5 + (i % 3) * 0.6); if (c.position.x > 280) c.position.x = -280;
//       const m = c.material as THREE.SpriteMaterial; m.color.setRGB(cloudRGB[0], cloudRGB[1], cloudRGB[2], THREE.SRGBColorSpace); m.opacity = 0.35 + 0.55 * dayF;
//     });
//   };
//   return { update, col: bcol };
// }

// /* ============================ রিয়েলিস্টিক শহর + বাজার ============================ */
// function addCity(scene: THREE.Scene) {
//   const col: Box2[] = [], rr = rng(7), dummy = new THREE.Object3D(), tc = new THREE.Color();

//   /* ভবনের মুখ: জানালা + রাতে জ্বলা আলো */
//   const facades = ['#8c7b6b', '#9aa5b5', '#b08968', '#6f7f95', '#c2b8a3', '#7d8a7a'].map((c, s) => {
//     const r = rng(s * 91 + 5), lit = Array.from({ length: 128 }, () => r() < 0.4);
//     const map = canvasTex(128, 256, (x) => {
//       x.fillStyle = c; x.fillRect(0, 0, 128, 256);
//       lit.forEach((_, i) => { x.fillStyle = '#2b3d58'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 3); });
//     });
//     const em = canvasTex(128, 256, (x) => {
//       x.fillStyle = '#000'; x.fillRect(0, 0, 128, 256); x.fillStyle = '#ffd27a';
//       lit.forEach((on, i) => { if (on) x.fillRect((i % 8) * 16 + 3, Math.floor(i / 8) * 16 + 4, 10, 9); });
//     });
//     [map, em].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.userData.keep = true; });
//     return new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.75 });
//   });
//   const shopGlow = new THREE.MeshStandardMaterial({ color: 0x1b2a40, emissive: 0xffe2a8, emissiveIntensity: 0.3, roughness: 0.2 });

//   const tower = (x: number, z: number, w: number, h: number, d: number, fi: number) => {
//     const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv as THREE.BufferAttribute;
//     for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 16, (uv.getY(i) * h) / 48);
//     const m = new THREE.Mesh(g, facades[fi % 6]); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m);
//     add(scene, bx(w * 0.35, 3, d * 0.35), M(0x59606b, 0.8, 0.1), x, h + 1.5, z);
//     if (fi % 2) add(scene, cy(1.4, 1.4, 3, 10), M(0x6b4a2e, 0.9, 0), x + w * 0.25, h + 1.5, z - d * 0.2);
//     col.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
//   };

//   /* সামনের সারি: নিচে দোকান (সাইনবোর্ড, শামিয়ানা, আলোকিত কাচ) */
//   const NAMES = ['BAZAAR', 'CAFE', 'PHARMACY', 'FASHION', 'BOOKS', 'MOBILE', 'BAKERY', 'ELECTRO', 'GROCERY', 'TAILOR'];
//   const AWN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899];
//   for (let i = -9; i <= 9; i++) {
//     const x = i * 17, w = 15, d = 14, fi = i + 9, fz = 92 - d / 2 - 0.06;
//     tower(x, 92, w, 22 + rr() * 20, d, fi);
//     const win = new THREE.Mesh(new THREE.PlaneGeometry(w - 3, 3), shopGlow); win.position.set(x, 1.9, fz - 0.01); win.rotation.y = Math.PI; scene.add(win);
//     const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.2), new THREE.MeshBasicMaterial({ map: signTexture(NAMES[fi % 10], 'OPEN 24H', AWN[fi % 6]) }));
//     sign.position.set(x, 5.2, fz - 0.03); sign.rotation.y = Math.PI; scene.add(sign);
//     add(scene, bx(w - 2, 0.15, 2.2), M(AWN[fi % 6], 0.7, 0), x, 3.7, fz - 1.0, 1, 1, 1, -0.2).castShadow = true;
//   }
//   for (let x = -260, k = 0; x <= 260; x += 26, k++) tower(x + rr() * 3, 125, 18 + rr() * 6, 40 + rr() * 60, 16, k);
//   for (let x = -420, k = 0; x <= 420; x += 34, k++) tower(x, 200 + rr() * 40, 24, 70 + rr() * 110, 22, k + 2);

//   /* রাস্তা: জেব্রা ক্রসিং, কার্ব */
//   const zeb = new THREE.InstancedMesh(bx(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 27);
//   let zi = 0;
//   for (const cx of [-60, 0, 60]) for (let k = 0; k < 9; k++) { dummy.position.set(cx - 4 + k, 0.035, 39); dummy.scale.set(0.55, 0.02, 15); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); zeb.setMatrixAt(zi++, dummy.matrix); }
//   scene.add(zeb);
//   for (const z of [30.85, 47.15]) add(scene, bx(1600, 0.18, 0.3), M(0x9ca3af, 0.8, 0), 0, 0.09, z).receiveShadow = true;

//   /* রাস্তার বাতি (রাতে জ্বলে) */
//   const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd98a, emissiveIntensity: 0 });
//   const lp: [number, number][] = [];
//   for (let x = -150; x <= 150; x += 15) lp.push([x, 50.5], [x, 78]);
//   const poles = new THREE.InstancedMesh(bx(0.18, 5.5, 0.18), M(0x2b3550, 0.5, 0.6), lp.length), heads = new THREE.InstancedMesh(sp(0.4), lampMat, lp.length);
//   lp.forEach(([x, z], i) => {
//     dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0);
//     dummy.position.set(x, 2.75, z); dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
//     dummy.position.set(x, 5.6, z); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
//   });
//   scene.add(poles, heads);

//   /* বাজার: ৪৮টি স্টল (টেবিল, ডোরাকাটা শামিয়ানা, ক্রেট, ফল/সবজি) */
//   const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, n: number) => {
//     const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; scene.add(m); let i = 0;
//     return (x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, c?: number) => {
//       dummy.position.set(x, y, z); dummy.scale.set(sx, sy, sz); dummy.rotation.set(rx, 0, 0); dummy.updateMatrix();
//       m.setMatrixAt(i, dummy.matrix); if (c !== undefined) m.setColorAt(i, tc.setHex(c)); i++;
//     };
//   };
//   const stripe = canvasTex(64, 16, (x) => { for (let j = 0; j < 8; j++) { x.fillStyle = j % 2 ? '#ffffff' : '#d1d5db'; x.fillRect(j * 8, 0, 8, 16); } });
//   stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping;
//   const NS = 48;
//   const putPost = inst(cy(0.05, 0.05, 2.6, 6), M(0x2b3550, 0.5, 0.6), NS * 4), putTab = inst(bx(1, 1, 1), M(0x7a5230, 0.7, 0.05), NS);
//   const putCan = inst(bx(1, 1, 1), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.8 }), NS);
//   const putCrate = inst(bx(1, 1, 1), M(0xb08968, 0.8, 0), NS * 3), putFruit = inst(sp(0.15, 8, 6), M(0xffffff, 0.6, 0), NS * 12);
//   const PROD = [0xef4444, 0xf59e0b, 0x84cc16, 0x16a34a, 0xfacc15, 0xa855f7, 0xf97316], CAN = [0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9];
//   let si = 0;
//   for (const z of [58, 70]) for (const sg of [-1, 1]) for (let k = 0; k < 12; k++, si++) {
//     const x = sg * (14 + k * 8.5);
//     putTab(x, 0.45, z, 4, 0.9, 1.6); putCan(x, 3.0, z, 4.8, 0.12, 2.6, z === 58 ? 0.15 : -0.15, CAN[si % 7]);
//     for (const dx of [-2.2, 2.2]) for (const dz of [-1.1, 1.1]) putPost(x + dx, 1.3, z + dz, 1, 1, 1);
//     for (let j = 0; j < 3; j++) {
//       putCrate(x - 1.2 + j * 1.2, 1.1, z, 0.9, 0.4, 0.7);
//       for (let f = 0; f < 4; f++) putFruit(x - 1.2 + j * 1.2 + (f % 2 - 0.5) * 0.4, 1.4, z + (f < 2 ? -0.15 : 0.15), 1, 1, 1, 0, PROD[(si + j + f) % 7]);
//     }
//     col.push({ minX: x - 2.4, maxX: x + 2.4, minZ: z - 1.1, maxZ: z + 1.1 });
//   }

//   /* ফোয়ারা */
//   const stoneM = M(0x9aa1ad, 0.7, 0.1), wm = new THREE.MeshStandardMaterial({ color: 0x2a8fd0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85, emissive: 0x0b3a66, emissiveIntensity: 0.3 });
//   add(scene, cy(3.8, 4, 0.7, 28), stoneM, 0, 0.35, 64).receiveShadow = true; add(scene, cy(3.4, 3.4, 0.1, 28), wm, 0, 0.72, 64);
//   add(scene, cy(0.35, 0.5, 2.4, 12), stoneM, 0, 1.6, 64); add(scene, sp(0.9, 14, 10), wm, 0, 2.9, 64, 1, 0.5, 1);
//   col.push({ minX: -4.3, maxX: 4.3, minZ: 59.7, maxZ: 68.3 });

//   /* বাজারের ক্রেতা */
//   const crowd = Array.from({ length: 10 }, (_, i) => {
//     const h = buildHuman({ shirt: CAN[i % 7], female: i % 2 === 0, style: (['long', 'short', 'bun', 'cap'] as const)[i % 4], skin: [0xc98262, 0xe0ac8a, 0x8d5a3b, 0xb87555][i % 4] });
//     scene.add(h.group); const side = i % 2 ? 1 : -1;
//     return { h, side, x: side * (16 + i * 8), z: i % 2 ? 64.8 : 63.2, dir: i % 3 ? 1 : -1, sp: 1.2 + (i % 4) * 0.3, ph: i };
//   });

//   const update = (t: number, dt: number, dayF: number) => {
//     const n = 1 - dayF;
//     facades.forEach((m) => { m.emissiveIntensity = n * 1.0; });
//     lampMat.emissiveIntensity = n * 3; shopGlow.emissiveIntensity = 0.25 + n * 1.2;
//     crowd.forEach((w) => {
//       w.x += w.dir * w.sp * dt; w.ph += dt * w.sp * 3.2;
//       const a = Math.abs(w.x);
//       if (a > 112 || a < 12) { w.dir = -w.dir; w.x = w.side * Math.min(112, Math.max(12, a)); }
//       w.h.group.position.set(w.x, 0, w.z); w.h.group.rotation.y = w.dir > 0 ? -Math.PI / 2 : Math.PI / 2; w.h.update(w.ph, 1, t);
//     });
//   };
//   return { update, col };
// }

// /* ============================ অন্য মানুষ (একই ডিভাইসের অন্য ট্যাব) ============================
//    আসল ইন্টারনেট মাল্টিপ্লেয়ারের জন্য সার্ভার (WebSocket/Firebase/Supabase) লাগবে। */
// type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
// function createNet(getSelf: () => { x: number; z: number; r: number; w: number; a: number }, getProfile: () => Profile) {
//   const id = Math.random().toString(36).slice(2, 8);
//   let bc: BroadcastChannel | null = null;
//   try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
//   const peers = new Map<string, Peer>();
//   if (bc) bc.onmessage = (e) => {
//     const m = e.data;
//     if (!m || !m.id || m.id === id) return;
//     if (m.t === 'bye') { peers.delete(m.id); return; }
//     const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
//     if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; } else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
//     p.seen = performance.now(); peers.set(m.id, p);
//   };
//   let lp = 0, lh = 0;
//   const tick = (now: number) => {
//     if (!bc) return;
//     if (now - lh > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lh = now; }
//     if (now - lp > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lp = now; }
//     peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
//   };
//   return { peers, tick, close: () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); } };
// }

// /* ============================ মূল কম্পোনেন্ট ============================ */
// const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';
// const inp = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
// const btn = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
// const fmtHour = (h: number) => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

// type Built = { shop: Shop; g: THREE.Group; col: Box2[]; hits: { box: THREE.Box3; p: Product }[]; idlers: { h: Human; base: number }[]; screen: (t: number) => void; light: THREE.Vector3 };

// export default function Page() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const tipRef = useRef<HTMLDivElement>(null);
//   const keysRef = useRef({ f: false, b: false, l: false, r: false, s: false });
//   const joyRef = useRef({ x: 0, y: 0 });
//   const pausedRef = useRef(false);
//   const meRef = useRef<Human | null>(null);
//   const posRef = useRef({ x: 0, z: 18 });
//   const tpRef = useRef<{ x: number; z: number } | null>(null);
//   const sunCmdRef = useRef(false);
//   const dayRef = useRef({ a: 0.65, auto: true });
//   const rideCmdRef = useRef(0);

//   const [shops, setShops] = useState<Shop[]>(defaultShops);
//   const [profile, setProfile] = useState<Profile>({ name: 'আমি', photo: '' });
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [balance, setBalance] = useState(100000);
//   const [score, setScore] = useState(0);
//   const [loaded, setLoaded] = useState(false);
//   const [selected, setSelected] = useState<Sel | null>(null);
//   const [hover, setHover] = useState<{ name: string; price: number } | null>(null);
//   const [qty, setQty] = useState(1);
//   const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন। বাইরে বাইক আছে — F চাপুন!');
//   const [touch, setTouch] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [panel, setPanel] = useState<'' | 'profile' | 'shops'>('');
//   const [online, setOnline] = useState<string[]>([]);
//   const [knob, setKnob] = useState({ x: 0, y: 0 });
//   const [hour, setHour] = useState(8.5);
//   const [autoDay, setAutoDay] = useState(true);
//   const [sid, setSid] = useState('fashion');
//   const [q, setQ] = useState('');
//   const [ns, setNs] = useState({ name: '', subtitle: '', style: 'market', accent: '#2563eb' });
//   const [np, setNp] = useState({ name: '', price: '', image: '', kind: 'tshirt', color: '#2563eb' });
//   const [rn, setRn] = useState('');
//   const [riding, setRiding] = useState(false);
//   const [nearBike, setNearBike] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   const profileRef = useRef(profile); profileRef.current = profile;
//   const shopsRef = useRef(shops); shopsRef.current = shops;
//   const total = cart.reduce((s, i) => s + i.price * i.count, 0);
//   const cartCount = cart.reduce((s, i) => s + i.count, 0);

//   useEffect(() => { pausedRef.current = paused; }, [paused]);
//   useEffect(() => {
//     const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
//     check(); window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   /* ---- লোড / সেভ ---- */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
//         if (ls) {
//           if (ls.profile) setProfile(ls.profile); if (ls.cart) setCart(ls.cart);
//           if (typeof ls.balance === 'number') setBalance(ls.balance); if (typeof ls.score === 'number') setScore(ls.score);
//         }
//       } catch { /* ignore */ }
//       const saved = (await kv.get('shops')) as Shop[] | undefined;
//       if (alive && Array.isArray(saved) && saved.length) { setShops(saved); setSid(saved[0].id); }
//       if (alive) setLoaded(true);
//     })();
//     return () => { alive = false; };
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     const t = setTimeout(() => { kv.set('shops', shops); }, 500);
//     return () => clearTimeout(t);
//   }, [loaded, shops]);
//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score })); } catch { /* ignore */ }
//   }, [loaded, profile, cart, balance, score]);
//   useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

//   /* ============================ 3D দৃশ্য ============================ */
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container || !loaded) return;

//     const scene = new THREE.Scene();
//     scene.fog = new THREE.Fog(0xbfd8f0, 25, 260);
//     const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
//     renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     container.appendChild(renderer.domElement);
//     renderer.domElement.style.touchAction = 'none';

//     const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a4252, 1.6); scene.add(hemi);
//     const sun = new THREE.DirectionalLight(0xffffff, 1.6);
//     sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
//     Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 220 });
//     scene.add(sun, sun.target);
//     const pool = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xfff1dc, 0, 30, 2); scene.add(l); return l; });

//     const sky = makeSky(); scene.add(sky);
//     const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
//     const outdoors = addOutdoors(scene);
//     const updateOutdoors = outdoors.update;
//     const city = addCity(scene);
//     outdoors.col.push(...city.col);

//     const textureLoader = new THREE.TextureLoader(); textureLoader.setCrossOrigin('anonymous');
//     const glowMat = M(0xeaf8ff, 0.5, 0, 0xbde9ff, 2.2);
//     const built = new Map<string, Built>();

//     /* ---------- মলের কাঠামো (দোকানের সংখ্যা অনুযায়ী লম্বা হয়) ---------- */
//     let shell: THREE.Group | null = null, shellBack = 0, shellCol: Box2[] = [];
//     const needBack = () => { const zs = shopsRef.current.map((s) => s.z); return Math.min(-115, (zs.length ? Math.min(...zs) : -14) - 22); };
//     const mkShell = (backZ: number) => {
//       if (shell) { scene.remove(shell); disposeTree(shell); }
//       shellBack = backZ; shellCol = [];
//       // দেয়াল ও প্রবেশদ্বারের পিলারে collision (এখন বাইরে যাওয়া যায়)
//       shellCol.push(
//         { minX: -29, maxX: -28, minZ: backZ, maxZ: 24 }, { minX: 28, maxX: 29, minZ: backZ, maxZ: 24 },
//         { minX: -29, maxX: 29, minZ: backZ - 1, maxZ: backZ },
//         { minX: -26.7, maxX: -25.3, minZ: 23.3, maxZ: 24.7 }, { minX: 25.3, maxX: 26.7, minZ: 23.3, maxZ: 24.7 },
//       );
//       const len = 24 - backZ, cz = (24 + backZ) / 2, s = new THREE.Group();
//       const floor = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ map: tileTex('#2a3447', '#323e55', Math.round(57 / 4), Math.round(len / 4)), roughness: 0.22, metalness: 0.2 }));
//       floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz); floor.receiveShadow = true; s.add(floor);
//       const wallM = M(0x1a2338, 0.5, 0.3);
//       for (const sx of [-28.5, 28.5]) { const w = add(s, bx(1, 14, len), wallM, sx, 7, cz); w.receiveShadow = true; }
//       add(s, bx(58, 14, 1), wallM, 0, 7, backZ - 0.5);
//       // কাচের ছাদ — আকাশ ও সূর্য দেখা যায়
//       const roof = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ color: 0xa8d8ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
//       roof.rotation.x = Math.PI / 2; roof.position.set(0, 14, cz); s.add(roof);
//       const nB = Math.floor(len / 9), beams = new THREE.InstancedMesh(bx(57, 0.35, 0.5), M(0x2b3550, 0.4, 0.7), nB), m4 = new THREE.Matrix4();
//       for (let i = 0; i < nB; i++) { m4.setPosition(0, 14, 24 - i * 9); beams.setMatrixAt(i, m4); }
//       beams.castShadow = true; s.add(beams);
//       for (const rx of [-22, -11, 0, 11, 22]) { const r = add(s, bx(0.3, 0.3, len), M(0x2b3550, 0.4, 0.7), rx, 14, cz); r.castShadow = true; }
//       const nL = Math.floor(len / 10), bars = new THREE.InstancedMesh(bx(6, 0.15, 0.5), glowMat, nL);
//       for (let i = 0; i < nL; i++) { m4.setPosition(0, 13.7, 20 - i * 10); bars.setMatrixAt(i, m4); }
//       s.add(bars);
//       for (const sx of [-7.3, 7.3]) add(s, bx(0.1, 0.02, len), M(0x22d3ee, 0.3, 0, 0x22d3ee, 2), sx, 0.03, cz);
//       // টব ও গাছ
//       for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
//         add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
//         shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
//       }
//       // প্রবেশদ্বার
//       for (const sx of [-26, 26]) add(s, bx(1.4, 14, 1.4), M(0x2b3550, 0.4, 0.7), sx, 7, 24);
//       add(s, bx(54, 1.2, 1.2), M(0x2b3550, 0.4, 0.7), 0, 13.2, 24);
//       const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8), side: THREE.DoubleSide }));
//       arch.position.set(0, 10.6, 23.6); s.add(arch);
//       shell = s; scene.add(s);
//     };

//     /* ---------- দোকান তৈরি (স্ট্রিমিং) ---------- */
//     const buildShop = (shop: Shop): Built => {
//       const g = new THREE.Group();
//       g.position.set(shop.x, 0, shop.z); g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2;
//       const col: Box2[] = [], idlers: Built['idlers'] = [];
//       const acc = M(shop.accent, 0.3, 0.5), dark = M(0x131a2a, 0.35, 0.6), metal = M(0x64748b, 0.25, 0.85), wood = M(0x6b4a2e, 0.55, 0.1), white = M(0xe5e9f0, 0.25, 0.2);
//       const led = M(shop.accent, 0.3, 0.2, shop.accent, 2.5);
//       const glassM = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
//       const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
//         const k = add(g, bx(w, h, d), m, x, y, z); k.castShadow = shadow; k.receiveShadow = true; return k;
//       };
//       const solid = (lx: number, lz: number, w: number, d: number) => {
//         const c = Math.round(Math.cos(g.rotation.y)), s = Math.round(Math.sin(g.rotation.y));
//         const wx = shop.x + lx * c + lz * s, wz = shop.z - lx * s + lz * c;
//         const sw = Math.abs(w * c) + Math.abs(d * s), sd = Math.abs(w * s) + Math.abs(d * c);
//         col.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2 });
//       };

//       const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 20), new THREE.MeshStandardMaterial({ map: tileTex('#d8dde6', '#c4cad6', 9, 10), roughness: 0.3 }));
//       sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true; g.add(sf);
//       add(g, pl(3.4, 19), M(shop.accent, 0.9, 0), 0, 0.05, 0, 1, 1, 1, -Math.PI / 2);

//       // দেয়াল
//       for (const s of [-1, 1]) { box(0.4, 10, 20, acc, s * 8.9, 5, 0); solid(s * 8.9, 0, 0.4, 20); }
//       box(18, 10, 0.4, dark, 0, 5, -9.9); solid(0, -9.9, 18, 0.4);
//       const slat = add(g, pl(17.4, 9.4), new THREE.MeshStandardMaterial({ map: slatTex(), roughness: 0.55 }), 0, 4.7, -9.68);
//       slat.receiveShadow = true;

//       // সামনের দিক
//       box(18, 3.4, 0.5, dark, 0, 8.3, 10);
//       for (const gx of [-5.5, 5.5]) { add(g, bx(7, 6.6, 0.1), glassM, gx, 3.3, 10); solid(gx, 9.9, 7, 0.4); }
//       for (const fx of [-2, 2, -9, 9]) box(0.3, 6.6, 0.4, metal, fx, 3.3, 10);
//       add(g, new THREE.PlaneGeometry(14, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }), 0, 8.3, 10.27);
//       const awn = box(18.4, 0.25, 2.4, acc, 0, 6.9, 11.1, false); awn.rotation.x = 0.18;
//       box(14.4, 0.1, 0.1, led, 0, 9.85, 10.3, false);
//       for (const lz of [-5, 3]) box(15, 0.12, 0.35, glowMat, 0, 9.7, lz, false);
//       for (const s of [-1, 1]) box(0.12, 0.15, 19.4, led, s * 8.5, 9.6, 0, false);

//       // শেলফ (দুই পাশ + পেছনে, ৪ থাক, নিচে LED)
//       const planks = (cx: number, cz: number, w: number, d: number, vertical: boolean) => {
//         SHELF_Y.forEach((y) => { box(w, 0.08, d, wood, cx, y, cz); box(w - 0.1, 0.03, d - 0.1, led, cx, y - 0.06, cz, false); });
//         if (vertical) { box(0.12, 5.6, d, dark, cx + (cx < 0 ? -0.6 : 0.6), 2.8, cz); box(w, 0.78, d, dark, cx, 0.39, cz); }
//         else { box(w, 5.6, 0.12, dark, cx, 2.8, cz - 0.6); box(w, 0.78, d, dark, cx, 0.39, cz); }
//       };
//       for (const s of [-1, 1]) { planks(s * 8.0, -2.45, 1.2, 12.2, true); solid(s * 8.0, -2.45, 1.3, 12.3); }
//       planks(0, -9.1, 15.8, 1.2, false); solid(0, -9.1, 15.8, 1.3);

//       // টেবিল (৮টি) — উপরে শোকেস পণ্য
//       for (const cz of TABLE_Z) for (const cx of TABLE_X) {
//         box(2.0, 1.6, 1.2, white, cx, 0.8, cz); box(2.05, 0.08, 1.25, led, cx, 1.62, cz, false); solid(cx, cz, 2.0, 1.2);
//       }

//       // পেছনের স্ক্রিন (চলমান)
//       const sc = document.createElement('canvas'); sc.width = 768; sc.height = 300;
//       const sx = sc.getContext('2d')!, stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
//       const draw = (t: number) => {
//         const gr = sx.createLinearGradient(0, 0, 768, 300); gr.addColorStop(0, hex(shop.accent)); gr.addColorStop(1, '#0b1220');
//         sx.fillStyle = gr; sx.fillRect(0, 0, 768, 300);
//         sx.fillStyle = 'rgba(255,255,255,.14)'; sx.beginPath(); sx.arc(384 + 260 * Math.sin(t * 0.8), 150, 120, 0, 7); sx.fill();
//         sx.fillStyle = '#fff'; sx.font = '900 64px Arial'; sx.textAlign = 'center'; sx.fillText(shop.name, 384, 170, 720); stex.needsUpdate = true;
//       };
//       draw(0);
//       box(9.4, 3.9, 0.2, dark, 0, 7.75, -9.55);
//       add(g, new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }), 0, 7.75, -9.43);

//       // মানুষ
//       const hs = [...shop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
//       const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: hs % 2 ? 0xb87555 : 0xe0ac8a, female: hs % 3 === 0, style: hs % 3 === 0 ? 'long' : 'short', hair: hs % 2 ? 0x17120f : 0x3b2314 });
//       cashier.group.position.set(-5.4, 0, 4.6); cashier.group.rotation.y = Math.PI; g.add(cashier.group); idlers.push({ h: cashier, base: Math.PI }); solid(-5.4, 4.6, 0.8, 0.8);
//       const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][hs % 4], skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][hs % 4], female: hs % 2 === 0, style: (['bun', 'cap', 'long', 'short'] as const)[hs % 4], glasses: hs % 5 === 0 });
//       browser.group.position.set(3.6, 0, 7.2); g.add(browser.group); idlers.push({ h: browser, base: 0 }); solid(3.6, 7.2, 0.9, 0.9);
//       box(3.6, 1.4, 1.3, dark, -5.4, 0.7, 6); box(3.6, 0.08, 1.4, wood, -5.4, 1.42, 6); solid(-5.4, 6, 3.6, 1.3);

//       // পণ্য: ৩D মডেল → মার্জ → কম ড্র-কল
//       const prodRoot = new THREE.Group(), localBoxes: { box: THREE.Box3; p: Product }[] = [];
//       shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
//         const sl = SLOTS[i], m = buildProduct(p.kind, p.color, p.image, textureLoader);
//         m.position.set(sl.x, sl.y, sl.z); m.rotation.y = sl.ry; m.scale.setScalar(sl.s); prodRoot.add(m);
//         localBoxes.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(sl.x, sl.y + 0.45 * sl.s, sl.z), new THREE.Vector3(1.05 * sl.s, 1.05 * sl.s, 1.05 * sl.s)), p });
//       });
//       bake(prodRoot).forEach((mesh) => g.add(mesh));
//       scene.add(g); g.updateMatrixWorld(true);
//       const hits = localBoxes.map((h) => ({ p: h.p, box: h.box.applyMatrix4(g.matrixWorld) }));
//       return { shop, g, col, hits, idlers, screen: draw, light: new THREE.Vector3(shop.x, 7.5, shop.z) };
//     };
//     const drop = (id: string) => { const b = built.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); built.delete(id); };

//     /* ---------- খেলোয়াড় ও পথচারী ---------- */
//     const player = new THREE.Group(); player.position.set(posRef.current.x, 0, posRef.current.z); scene.add(player);
//     const me = buildHuman({ shirt: 0x2563eb, skin: 0xc98262, style: 'short' });
//     player.add(me.group); meRef.current = me; me.setName(profileRef.current.name, profileRef.current.photo);

//     const looks: HumanOpts[] = [
//       { shirt: 0xef4444, skin: 0xb87555, female: true, style: 'long' }, { shirt: 0xf8fafc, skin: 0xe0ac8a, hair: 0x3b2314, style: 'cap' }, { shirt: 0x16a34a, skin: 0x8d5a3b, glasses: true },
//       { shirt: 0xfacc15, skin: 0xd9a07c, hair: 0x5b3a1e, female: true, style: 'bun' }, { shirt: 0x8b5cf6, skin: 0xc98262, style: 'bald' }, { shirt: 0xf97316, skin: 0xa66a47, female: true, style: 'long', hair: 0x2a1a10 },
//       { shirt: 0x0ea5e9, skin: 0xe0ac8a, hair: 0xb45309, style: 'short' }, { shirt: 0xec4899, skin: 0x8d5a3b, female: true, style: 'short', glasses: true },
//     ];
//     const walkers = looks.map((o, i) => {
//       const h = buildHuman(o); scene.add(h.group);
//       return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
//     });

//     let walk = 0, amt = 0;
//     const net = createNet(() => ({ x: player.position.x, z: player.position.z, r: player.rotation.y, w: walk, a: amt }), () => profileRef.current);
//     const avatars = new Map<string, { h: Human; key: string }>();
//     const timer = setInterval(() => {
//       const n = [...net.peers.values()].map((p) => p.name);
//       setOnline((prev) => (prev.join('|') === n.join('|') ? prev : n));
//       if (dayRef.current.auto) setHour(Math.round((((((dayRef.current.a / (Math.PI * 2)) * 24 + 6) % 24) + 24) % 24) * 10) / 10);
//     }, 1000);

//     /* ---------- ইনপুট ---------- */
//     let yaw = 0, pitch = 0.5, camDist = 11;
//     const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tmp = new THREE.Vector3();
//     let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;
//     const el = renderer.domElement;
//     const pickAt = (cx: number, cy: number) => {
//       const r = el.getBoundingClientRect();
//       ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
//       ray.setFromCamera(ptr, camera);
//       let best: { p: Product; shop: string; d: number } | null = null;
//       for (const b of built.values()) for (const h of b.hits) {
//         if (!ray.ray.intersectBox(h.box, tmp)) continue;
//         const d = tmp.distanceTo(ray.ray.origin);
//         if (d < 60 && (!best || d < best.d)) best = { p: h.p, shop: b.shop.name, d };
//       }
//       return best as { p: Product; shop: string; d: number } | null;
//     };
//     let hoverId = '', lastHover = 0;
//     const hoverCheck = (e: PointerEvent) => {
//       if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
//       const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
//       const h = pickAt(e.clientX, e.clientY), id = h ? h.p.id : '';
//       if (id !== hoverId) { hoverId = id; setHover(h ? { name: h.p.name, price: h.p.price } : null); el.style.cursor = h ? 'pointer' : 'grab'; }
//     };
//     const onDown = (e: PointerEvent) => {
//       if (down) return;
//       down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() }; sunCmdRef.current = false;
//       el.setPointerCapture(e.pointerId);
//     };
//     const onMove = (e: PointerEvent) => {
//       if (!down) { if (e.pointerType === 'mouse') hoverCheck(e); return; }
//       if (e.pointerId !== down.id) return;
//       const dx = e.clientX - down.x, dy = e.clientY - down.y;
//       down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
//       yaw -= dx * 0.005; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.7, 1.15);
//     };
//     const onUp = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       if (down.moved < 8 && performance.now() - down.t < 500) { const h = pickAt(e.clientX, e.clientY); if (h) { setQty(1); setSelected({ ...h.p, shop: h.shop }); } }
//       down = null;
//     };
//     const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
//     el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
//     el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: true });

//     const setKey = (e: KeyboardEvent, v: boolean) => {
//       const tg = (e.target as HTMLElement)?.tagName; if (tg === 'INPUT' || tg === 'SELECT') return;
//       const k = keysRef.current, key = e.key.toLowerCase();
//       if (key === 'w' || key === 'arrowup') k.f = v; if (key === 's' || key === 'arrowdown') k.b = v;
//       if (key === 'a' || key === 'arrowleft') k.l = v; if (key === 'd' || key === 'arrowright') k.r = v;
//       if (key === 'shift') k.s = v;
//       if (v && key === 'q') yaw += 0.15; if (v && key === 'e') yaw -= 0.15;
//     };
//     const kd = (e: KeyboardEvent) => {
//       setKey(e, true);
//       const tg = (e.target as HTMLElement)?.tagName;
//       if (e.key.toLowerCase() === 'f' && !e.repeat && tg !== 'INPUT' && tg !== 'SELECT') rideCmdRef.current = 1;
//     };
//     const ku = (e: KeyboardEvent) => setKey(e, false);
//     window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

//     const resize = () => {
//       const w = container.clientWidth || 1, h = container.clientHeight || 1;
//       camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
//     };
//     resize();
//     const ro = new ResizeObserver(resize); ro.observe(container);

//     /* ---------- মোটরসাইকেল ও দোকান-প্রবেশ ---------- */
//     const moto = buildMoto(); moto.g.position.set(10, 0, 30); scene.add(moto.g);
//     let riding = false, vel = 0, dirX = 0, dirZ = -1, nearLast = false, curShop = '';
//     const inShop = (x: number, z: number) => {
//       for (const b of built.values()) if (Math.abs(x - b.shop.x) < 10 && Math.abs(z - b.shop.z) < 9.5) return b.shop;
//       return null;
//     };
//     const toggleRide = () => {
//       if (riding) {
//         riding = false; me.setRide(false); me.group.scale.setScalar(1); me.group.position.set(0, 0, 0);
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = a;
//         player.position.x += Math.cos(a) * 1.8; player.position.z -= Math.sin(a) * 1.8;
//         setRiding(false); setMessage('🚶 বাইক থেকে নামলেন।'); return;
//       }
//       if (inShop(player.position.x, player.position.z)) { setMessage('🏪 দোকানের ভেতরে বাইক চলে না — বাইরে এসে F চাপুন।'); return; }
//       const d = Math.hypot(moto.g.position.x - player.position.x, moto.g.position.z - player.position.z);
//       if (d > 6) {
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x - Math.cos(a) * 3, 0, player.position.z + Math.sin(a) * 3); moto.g.rotation.y = a;
//         setMessage('🏍️ বাইক আপনার পাশে এসেছে — আবার F চাপুন।'); return;
//       }
//       riding = true; me.setRide(true); me.group.scale.setScalar(0.62); me.group.position.set(0, 0.37, 0.15);
//       player.position.set(moto.g.position.x, 0, moto.g.position.z); player.rotation.y = moto.g.rotation.y;
//       vel = 0; camDist = Math.max(camDist, 14);
//       setRiding(true); setMessage('🏍️ বাইকে উঠেছেন! W A S D = চালান, Shift = টার্বো');
//     };

//     /* ---------- মূল লুপ ---------- */
//     const R = 0.5;
//     const blocked = (x: number, z: number) => {
//       const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
//       if (shellCol.some(hit)) return true;
//       if (z > 55 && outdoors.col.some(hit)) return true;   // শহরের ভবন ও বাজারের স্টল
//       if (riding && inShop(x, z)) return true;             // বাইক নিয়ে দোকানে ঢোকা যাবে না
//       for (const b of built.values()) if (Math.abs(b.shop.z - z) < 14 && b.col.some(hit)) return true;
//       return false;
//     };
//     const clock = new THREE.Clock(), camTarget = new THREE.Vector3(), sunDir = new THREE.Vector3(), moon = new THREE.Vector3();
//     let raf = 0, lastList: Shop[] | null = null, frame = 0, firstCam = true;
//     mkShell(needBack());

//     const animate = () => {
//       raf = requestAnimationFrame(animate);
//       const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
//       const px = player.position.x, pz = player.position.z;

//       /* দিন-রাত */
//       const D = dayRef.current; if (D.auto && !pausedRef.current) D.a += dt * 0.02;
//       const ca = Math.cos(D.a);
//       sunDir.set(ca * 0.5, Math.sin(D.a), -0.85 * ca).normalize();
//       const elv = sunDir.y, dayF = sm(-0.08, 0.3, elv), dusk = (1 - sm(0, 0.4, elv)) * sm(-0.15, 0.05, elv);
//       const zen = mix3(mix3(NZ, DZ, dayF), SZ, dusk * 0.6), hor = mix3(mix3(NH, DH, dayF), SH, dusk * 0.85);
//       const sunC = mix3([1, 0.55, 0.25], [1, 0.96, 0.86], sm(0.05, 0.5, elv));
//       skyU.zenith.value.set(zen[0], zen[1], zen[2]); skyU.horizon.value.set(hor[0], hor[1], hor[2]);
//       skyU.sunDir.value.copy(sunDir); skyU.sunCol.value.set(sunC[0], sunC[1], sunC[2]); skyU.night.value = 1 - dayF;
//       sky.position.copy(camera.position);
//       (scene.fog as THREE.Fog).color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
//       hemi.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); hemi.intensity = 0.25 + 1.45 * dayF;
//       const L = elv > 0 ? sunDir : moon.copy(sunDir).negate();
//       sun.position.set(px + L.x * 90, Math.max(8, L.y * 90), pz + L.z * 90); sun.target.position.set(px, 0, pz);
//       sun.intensity = 1.9 * sm(0, 0.4, elv) + 0.35 * sm(0, 0.3, -elv);
//       if (elv > 0) sun.color.setRGB(sunC[0], sunC[1], sunC[2], THREE.SRGBColorSpace); else sun.color.setRGB(0.55, 0.65, 1, THREE.SRGBColorSpace);
//       const cloudRGB = mix3(mix3([0.25, 0.28, 0.4], [1, 1, 1], dayF), [1, 0.7, 0.55], dusk * 0.6);

//       /* দোকান স্ট্রিমিং */
//       if (lastList !== shopsRef.current) {
//         lastList = shopsRef.current;
//         const map = new Map(lastList.map((s) => [s.id, s]));
//         [...built.keys()].forEach((id) => { const s = map.get(id); if (!s || s !== built.get(id)!.shop) drop(id); });
//         const nb = needBack(); if (nb !== shellBack) mkShell(nb);
//       }
//       let nearest: Shop | null = null, nd = Infinity;
//       const far = Math.abs(px) > 90; // মল থেকে অনেক দূরে গেলে দোকান বানানো বন্ধ
//       for (const s of lastList) {
//         const dz = s.z - pz, b = built.get(s.id);
//         if (b) { if (far || dz < -105 || dz > 70) drop(s.id); continue; }
//         if (!far && dz > -80 && dz < 45 && Math.abs(dz) < nd) { nd = Math.abs(dz); nearest = s; }
//       }
//       if (nearest && (frame % 2 === 0 || built.size < 3)) built.set((nearest as Shop).id, buildShop(nearest as Shop));

//       /* পয়েন্ট লাইট পুল */
//       const near = [...built.values()].sort((a, b) => Math.abs(a.shop.z - pz) - Math.abs(b.shop.z - pz)).slice(0, 4);
//       pool.forEach((l, i) => { const b = near[i]; if (b) { l.position.copy(b.light); l.intensity = 40 * (0.5 + 0.9 * (1 - dayF)); } else l.intensity = 0; });

//       if (tpRef.current) { player.position.set(tpRef.current.x, 0, tpRef.current.z); tpRef.current = null; firstCam = true; }

//       if (!pausedRef.current) {
//         const k = keysRef.current, j = joyRef.current;
//         let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x, iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
//         const len = Math.hypot(ix, iz);
//         if (len > 1) { ix /= len; iz /= len; }

//         const on = len > 0.08, inMall = player.position.z < 24 && Math.abs(player.position.x) < 28;
//         const top = riding ? (k.s ? 30 : 20) * (inMall ? 0.5 : 1) : (k.s ? 15 : 7.5);
//         vel += ((on ? top * Math.min(1, len) : 0) - vel) * Math.min(1, dt * (riding ? 2.2 : 30));
//         if (on) {
//           const sin = Math.sin(yaw), cos = Math.cos(yaw);
//           const mx = -sin * iz + cos * ix, mz = -cos * iz - sin * ix, n = Math.hypot(mx, mz) || 1;
//           dirX = mx / n; dirZ = mz / n;
//           let diff = Math.atan2(-dirX, -dirZ) - player.rotation.y;
//           diff = Math.atan2(Math.sin(diff), Math.cos(diff));
//           player.rotation.y += diff * Math.min(1, dt * (riding ? 4 : 12));
//         }
//         if (riding) { dirX = -Math.sin(player.rotation.y); dirZ = -Math.cos(player.rotation.y); }
//         if (vel > 0.05) {
//           const spd = vel * dt;
//           const nx = THREE.MathUtils.clamp(player.position.x + dirX * spd, -330, 330);
//           const okX = !blocked(nx, player.position.z); if (okX) player.position.x = nx;
//           const nz = THREE.MathUtils.clamp(player.position.z + dirZ * spd, shellBack - 80, 150);
//           const okZ = !blocked(player.position.x, nz); if (okZ) player.position.z = nz;
//           if (riding && (!okX || !okZ)) vel *= 0.6;
//         } else if (!on) vel = 0;
//         if (!riding) {
//           if (on) { walk += dt * (k.s ? 13 : 9); amt = Math.min(1, amt + dt * 6); } else amt = Math.max(0, amt - dt * 6);
//         } else {
//           amt = 0; const spin = (vel * dt) / 0.63; moto.wf.rotation.x -= spin; moto.wr.rotation.x -= spin;
//         }
//         me.update(walk, amt, t);
//         posRef.current = { x: player.position.x, z: player.position.z };
//         if (riding) { moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = player.rotation.y; }

//         walkers.forEach((n) => {
//           if (Math.abs(n.z - pz) > 75) n.z = THREE.MathUtils.clamp(pz - 60 + Math.random() * 100, shellBack + 6, 26);
//           const nr = Math.hypot(n.x - px, n.z - pz) < 2.4;
//           n.amt += ((nr ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
//           if (!nr) { n.z += n.dir * n.sp * dt; n.ph += dt * n.sp * 3.2; if (n.z < shellBack + 6) n.dir = 1; if (n.z > 26) n.dir = -1; }
//           n.h.group.position.set(n.x, 0, n.z); n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI; n.h.update(n.ph, n.amt, t);
//         });
//         for (const b of built.values()) {
//           if (Math.abs(b.shop.z - pz) > 45) continue;
//           b.idlers.forEach((i) => { i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * 0.2; i.h.update(0, 0, t); });
//           if (frame % 3 === 0 && Math.abs(b.shop.z - pz) < 38) b.screen(t);
//         }
//         updateOutdoors(t, dt, dayF, cloudRGB);
//         city.update(t, dt, dayF);
//       }

//       /* বাইকের হেডলাইট, কাছাকাছি বাইক, দোকানে প্রবেশের বার্তা, F কমান্ড */
//       moto.lamp.intensity = riding ? 250 * (1 - dayF) : 0;
//       if (frame % 10 === 0) {
//         const nb = !riding && Math.hypot(moto.g.position.x - px, moto.g.position.z - pz) < 6;
//         if (nb !== nearLast) { nearLast = nb; setNearBike(nb); }
//         const sh = inShop(player.position.x, player.position.z), sid2 = sh ? sh.id : '';
//         if (sid2 !== curShop) { curShop = sid2; if (sh) setMessage(`🏪 ${sh.name} এ প্রবেশ করেছেন`); }
//       }
//       if (rideCmdRef.current) { rideCmdRef.current = 0; toggleRide(); }

//       /* অন্য মানুষ */
//       net.tick(performance.now());
//       net.peers.forEach((p) => {
//         let a = avatars.get(p.id);
//         if (!a) {
//           const c = [...p.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
//           const h = buildHuman({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4][c % 5], female: c % 2 === 0, style: c % 2 ? 'short' : 'long' });
//           h.group.position.set(p.x, 0, p.z); scene.add(h.group); a = { h, key: '' }; avatars.set(p.id, a);
//         }
//         const key = p.name + p.photo.length;
//         if (a.key !== key) { a.h.setName(p.name, p.photo); a.key = key; }
//         a.h.group.position.x += (p.x - a.h.group.position.x) * 0.25; a.h.group.position.z += (p.z - a.h.group.position.z) * 0.25;
//         a.h.group.rotation.y = p.r; a.h.update(p.w, p.a, t);
//       });
//       avatars.forEach((a, id) => { if (!net.peers.has(id)) { scene.remove(a.h.group); disposeTree(a.h.group); avatars.delete(id); } });

//       /* "সূর্য দেখুন" বাটন: ক্যামেরা সূর্যের দিকে ঘোরে */
//       if (sunCmdRef.current) {
//         const ty = Math.atan2(-sunDir.x, -sunDir.z), tp = THREE.MathUtils.clamp(-0.2 - Math.max(0, elv) * 0.55, -0.7, 0.2);
//         let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
//         yaw += dy * 0.08; pitch += (tp - pitch) * 0.08;
//         if (Math.abs(dy) < 0.02 && Math.abs(tp - pitch) < 0.02) sunCmdRef.current = false;
//       }

//       const up = Math.max(0, -pitch), h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
//       camTarget.set(player.position.x + Math.sin(yaw) * d, Math.max(0.6, 2 + h), player.position.z + Math.cos(yaw) * d);
//       if (firstCam) { camera.position.copy(camTarget); firstCam = false; } else camera.position.lerp(camTarget, 0.12);
//       camera.lookAt(player.position.x, 2.4 + up * 14, player.position.z);
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       cancelAnimationFrame(raf); clearInterval(timer); net.close(); meRef.current = null; ro.disconnect();
//       window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
//       el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
//       el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
//       built.forEach((b) => disposeTree(b.g)); built.clear();
//       disposeTree(scene);
//       renderer.dispose();
//       if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
//     };
//   }, [loaded]);

//   /* ============================ অ্যাকশন ============================ */
//   const addSelected = () => {
//     if (!selected) return;
//     setCart((prev) => {
//       const old = prev.find((i) => i.id === selected.id);
//       if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + qty } : i));
//       return [...prev, { ...selected, count: qty }];
//     });
//     setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`); setSelected(null);
//   };
//   const changeQty = (id: string, d: number) => setCart((p) => p.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));
//   const checkout = () => {
//     if (!cart.length) return setMessage('🛒 কার্ট খালি।');
//     if (balance < total) return setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`);
//     setBalance((b) => b - total); setScore((s) => s + cartCount * 100); setCart([]); setMessage(`🎉 ${taka(total)} পেমেন্ট সফল!`);
//   };

//   const shop = shops.find((s) => s.id === sid);
//   const patchShop = (id: string, f: (s: Shop) => Shop) => setShops(shops.map((s) => (s.id === id ? f(s) : s)));
//   const addShop = () => {
//     if (shops.length >= MAX_SHOPS) return setMessage(`❌ সর্বোচ্চ ${MAX_SHOPS}টি দোকান`);
//     const slot = nextSlots(shops, 1)[0];
//     if (!slot) return setMessage('❌ আর খালি জায়গা নেই');
//     if (!ns.name.trim()) return setMessage('✏️ দোকানের নাম দিন');
//     const id = 's' + Date.now().toString(36);
//     setShops([...shops, { id, name: ns.name.trim().toUpperCase().slice(0, 18), subtitle: ns.subtitle.trim() || 'New Store', ...slot, accent: parseInt(ns.accent.slice(1), 16), style: ns.style, products: [] }]);
//     setSid(id); setNs({ ...ns, name: '', subtitle: '' }); setMessage('🏪 নতুন দোকান তৈরি হয়েছে!');
//   };
//   const addProduct = () => {
//     if (!shop) return;
//     const price = Number(np.price);
//     if (!np.name.trim() || !(price > 0)) return setMessage('✏️ পণ্যের নাম ও সঠিক দাম দিন');
//     if (shop.products.length >= MAX_PRODUCTS) return setMessage(`❌ একটি দোকানে সর্বোচ্চ ${MAX_PRODUCTS}টি পণ্য`);
//     const color = parseInt(np.color.slice(1), 16);
//     patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: 'p' + Date.now().toString(36), name: np.name.trim(), price, image: np.image || ph(np.kind, color), kind: np.kind, color }] }));
//     setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
//   };
//   const addDemo = () => {
//     const need = Math.min(100, MAX_SHOPS) - shops.length;
//     const slots = nextSlots(shops, Math.max(0, need));
//     const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
//     const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + '_x')] } : s));
//     setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
//   };
//   const teleport = (s: Shop) => { tpRef.current = { x: 0, z: s.z }; setPanel(''); setMessage(`📍 ${s.name} এর সামনে এসেছেন`); };

//   const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
//     const r = e.currentTarget.getBoundingClientRect(), max = r.width / 2 - 24;
//     let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
//     const l = Math.hypot(dx, dy);
//     if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
//     joyRef.current = { x: dx / max, y: dy / max }; setKnob({ x: dx, y: dy });
//   };
//   const joyStart = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); joyMove(e); };
//   const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

//   const filtered = shops.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()));
//   const isNight = hour < 5.5 || hour >= 18.5;

//   /* ============================ UI ============================ */
//   return (
//     <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
//       <div ref={containerRef} className="absolute inset-0" />

//       {hover && !selected && (
//         <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs md:block">
//           <div className="font-bold">{hover.name}</div><div className="font-black text-yellow-300">{taka(hover.price)}</div>
//         </div>
//       )}
//       {!hover && <div ref={tipRef} className="hidden" />}

//       {/* ⋮ মেনু বাটন — উপরে শুধু এটাই */}
//       <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
//         className={`absolute right-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-full text-2xl font-black ${glass}`}>⋮</button>

//       {menuOpen && (<>
//         <div className="absolute inset-0 z-40" onClick={() => setMenuOpen(false)} />
//         <div className={`absolute right-3 top-16 z-50 max-h-[80dvh] w-[min(310px,calc(100vw-24px))] overflow-y-auto rounded-2xl p-3 ${glass}`}>
//           <div className="mb-2 text-sm font-black">GRAND SHOPPING CITY</div>
//           <div className="grid grid-cols-2 gap-2 text-center">
//             <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">BALANCE</div><div className="text-sm font-black text-yellow-300">{taka(balance)}</div></div>
//             <div className="rounded-xl bg-white/5 p-2"><div className="text-[9px] text-slate-400">SCORE</div><div className="text-sm font-black text-emerald-300">{score}</div></div>
//           </div>
//           <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('profile'); setMenuOpen(false); }}>👤 প্রোফাইল</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPanel('shops'); setMenuOpen(false); }}>🏪 দোকান ({shops.length})</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setCartOpen(true); setMenuOpen(false); }}>🛒 কার্ট ({cartCount})</button>
//             <button className="rounded-xl bg-white/10 py-2.5" onClick={() => { setPaused((v) => !v); setMenuOpen(false); }}>{paused ? '▶️ চালু' : '⏸️ পজ'}</button>
//           </div>
//           <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[11px]">
//             <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { dayRef.current.auto = !autoDay; setAutoDay(!autoDay); }}>{autoDay ? '⏸' : '▶'}</button>
//             <span className="w-14 shrink-0">{isNight ? '🌙' : '☀️'} {fmtHour(hour)}</span>
//             <input type="range" min={0} max={24} step={0.25} value={hour} className="min-w-0 flex-1"
//               onChange={(e) => { const v = Number(e.target.value); setHour(v); dayRef.current.a = ((v - 6) / 24) * Math.PI * 2; }} />
//             <button className="rounded-lg bg-amber-400/90 px-2 py-1 text-slate-950" onClick={() => { sunCmdRef.current = true; setMenuOpen(false); }}>{isNight ? '🌙' : '☀️'} দেখুন</button>
//           </div>
//           <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-emerald-300">🟢 অনলাইন: {profile.name}{online.length ? ', ' + online.join(', ') : ''}</div>
//           <div className="mt-2 text-[10px] leading-5 text-slate-400">W A S D হাঁটা • Shift দৌড় • মাউস ড্র্যাগ / Q E ঘোরা • স্ক্রল জুম • ক্লিক = পণ্য • F = বাইক</div>
//         </div>
//       </>)}

//       {/* মেসেজ — নিচে ছোট বাবল */}
//       <div key={message} className="pointer-events-none absolute bottom-6 left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-slate-950/80 px-4 py-2 text-center text-xs text-slate-100 backdrop-blur-md">{message}</div>

//       {selected && (
//         <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSelected(null)}>
//           <div className={`w-full max-w-md overflow-hidden rounded-3xl ${glass}`} onClick={(e) => e.stopPropagation()}>
//             <div className="relative">
//               <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover md:h-80"
//                 onError={(e) => { (e.target as HTMLImageElement).src = ph(selected.kind, selected.color); }} />
//               <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">{selected.shop}</span>
//               <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs" aria-label="Close">✕</button>
//             </div>
//             <div className="p-4">
//               <div className="text-xl font-black">{selected.name}</div>
//               <div className="mt-1 text-2xl font-black text-yellow-300">{taka(selected.price * qty)}</div>
//               <div className="mt-3 flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
//                   <b className="w-6 text-center">{qty}</b>
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(qty + 1)}>+</button>
//                 </div>
//                 <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950 hover:bg-cyan-400 active:scale-95">🛒 কার্টে নিন</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {panel === 'profile' && (
//         <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
//           <div className="flex items-center justify-between"><b>👤 আমার প্রোফাইল</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 flex items-center gap-3">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">👤</div>}
//             <label className={`${btn} cursor-pointer`}>ছবি বাছাই করুন
//               <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProfile({ ...profile, photo: await fileToDataUrl(f, 160) }); }} />
//             </label>
//           </div>
//           <input className={`${inp} mt-3`} maxLength={16} placeholder="আপনার নাম" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
//           <p className="mt-2 text-[11px] text-slate-400">নাম ও ছবি আপনার কার্টুনের বুকে ও মাথার উপরে দেখা যাবে। আরেকটা ট্যাবে মল খুললে সেখানেও আপনাকে দেখা যাবে।</p>
//         </div>
//       )}

//       {panel === 'shops' && (
//         <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:w-[400px] ${glass}`}>
//           <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
//           <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
//           <div className="mt-2 flex gap-2">
//             <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
//               {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
//             </select>
//             {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
//           </div>
//           {shop && (<>
//             <div className="mt-2 flex gap-2">
//               <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
//               <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
//             </div>
//             <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
//             <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
//               {shop.products.map((p) => (
//                 <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
//                   <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: hex(p.color) + '55' }}>{KIND_EMOJI[p.kind] ?? '🛍️'}</span>
//                   <span className="min-w-0 flex-1 truncate">{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
//                   <button className="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-300" onClick={() => patchShop(shop.id, (s) => ({ ...s, products: s.products.filter((x) => x.id !== p.id) }))}>✕</button>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-2">
//               <input className={inp} placeholder="পণ্যের নাম" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
//               <div className="flex gap-2">
//                 <select className={inp} value={np.kind} onChange={(e) => setNp({ ...np, kind: e.target.value })}>
//                   {KINDS.map(([v, l, em]) => <option key={v} value={v} className="text-black">{em} {l}</option>)}
//                 </select>
//                 <input type="color" value={np.color} onChange={(e) => setNp({ ...np, color: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//               </div>
//               <div className="flex gap-2">
//                 <input className={inp} type="number" min={1} placeholder="দাম (৳)" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} />
//                 <label className={`${btn} flex cursor-pointer items-center whitespace-nowrap`}>{np.image ? '🖼️ ছবি ✓' : '🖼️ ছবি'}
//                   <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setNp({ ...np, image: await fileToDataUrl(f, 640) }); }} />
//                 </label>
//               </div>
//               <p className="text-[10px] text-slate-400">৩D আকার = ধরন + রঙ। ছবি দিলে পণ্যের বিস্তারিত ভিউয়ে দেখা যাবে; "ছবির ফ্রেম" ধরন বাছলে ছবিটা ৩D ফ্রেমেও দেখা যাবে।</p>
//               <button className={`${btn} w-full`} onClick={addProduct}>➕ পণ্য যোগ করুন</button>
//             </div>
//             <button className="mt-2 w-full rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300"
//               onClick={() => { if (confirm(`"${shop.name}" মুছে ফেলবেন?`)) { const rest = shops.filter((s) => s.id !== shop.id); setShops(rest); setSid(rest[0]?.id ?? ''); } }}>🗑️ এই দোকান মুছুন</button>
//           </>)}
//           <div className="mt-4 text-[11px] font-bold text-cyan-300">নতুন দোকান খুলুন</div>
//           <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
//             <input className={inp} placeholder="দোকানের নাম" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
//             <input className={inp} placeholder="ট্যাগলাইন" value={ns.subtitle} onChange={(e) => setNs({ ...ns, subtitle: e.target.value })} />
//             <div className="flex gap-2">
//               <select className={inp} value={ns.style} onChange={(e) => setNs({ ...ns, style: e.target.value })}>
//                 {[['fashion', 'ফ্যাশন'], ['tech', 'ইলেকট্রনিক্স'], ['home', 'ফার্নিচার'], ['market', 'গ্রোসারি']].map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
//               </select>
//               <input type="color" value={ns.accent} onChange={(e) => setNs({ ...ns, accent: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//             </div>
//             <button className={`${btn} w-full`} onClick={addShop}>🏪 দোকান তৈরি করুন</button>
//           </div>
//         </div>
//       )}

//       {cartOpen && (
//         <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-16 md:w-80 md:rounded-3xl ${glass}`}>
//           <div className="flex items-center justify-between"><h2 className="font-black">🛒 MY CART</h2><button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 space-y-2">
//             {cart.length === 0 ? <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div> : cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
//                 <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(item.kind, item.color); }} />
//                 <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{taka(item.price)}</div></div>
//                 <div className="flex items-center gap-1 text-xs">
//                   <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button><b className="w-5 text-center">{item.count}</b>
//                   <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm"><span className="text-slate-400">Total</span><b className="text-yellow-300">{taka(total)}</b></div>
//           <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">✅ Checkout</button>
//         </aside>
//       )}

//       {touch && !selected && !cartOpen && !panel && !menuOpen && (
//         <div className="absolute bottom-16 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
//           onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
//           <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-cyan-400/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
//         </div>
//       )}

//       {!selected && !panel && !cartOpen && !menuOpen && (
//         <button onClick={() => { rideCmdRef.current = 1; }} className={`absolute bottom-16 right-5 z-30 rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
//           {riding ? '🛑 নামুন (F)' : nearBike ? '🏍️ চড়ুন (F)' : '🏍️ বাইক ডাকুন (F)'}
//         </button>
//       )}

//       {paused && (
//         <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
//           <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
//         </div>
//       )}
//     </main>
//   );
// }




































// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// // দরকার: three r151+ (mergeGeometries)। পুরনো ভার্সনে এটা mergeBufferGeometries নামে ছিল।
// import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// /* ============================ টাইপ ও ধ্রুবক ============================ */
// type Product = { id: string; name: string; price: number; image: string; kind: string; color: number };
// type Sel = Product & { shop: string };
// type CartItem = Sel & { count: number };
// type Shop = { id: string; name: string; subtitle: string; x: number; z: number; accent: number; style: string; products: Product[] };
// type Profile = { name: string; photo: string };
// type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
// type Slot = { x: number; y: number; z: number; ry: number; s: number };

// const MAX_SHOPS = 120;
// const LS_KEY = 'grand-mall-ls-v2';

// const KINDS: [string, string, string][] = [
//   ['tshirt', 'টি-শার্ট', '👕'], ['jacket', 'জ্যাকেট', '🧥'], ['sneaker', 'জুতা', '👟'], ['glasses', 'সানগ্লাস', '🕶️'],
//   ['bag', 'ব্যাগ', '👜'], ['watch', 'ঘড়ি', '⌚'], ['phone', 'ফোন', '📱'], ['camera', 'ক্যামেরা', '📷'],
//   ['headphone', 'হেডফোন', '🎧'], ['chair', 'চেয়ার', '🪑'], ['lamp', 'ল্যাম্প', '💡'], ['plant', 'গাছ', '🪴'],
//   ['book', 'বই', '📚'], ['jar', 'মধু/জার', '🍯'], ['chocolate', 'চকলেট', '🍫'], ['sack', 'চালের বস্তা', '🌾'],
//   ['coffee', 'কফি', '☕'], ['bottle', 'বোতল', '🧴'], ['box', 'গিফট বক্স', '🎁'], ['frame', 'ছবির ফ্রেম', '🖼️'],
// ];
// const KIND_EMOJI: Record<string, string> = Object.fromEntries(KINDS.map(([k, , e]) => [k, e]));

// /* শেলফ ও টেবিলের স্লট — একটি দোকানে সর্বোচ্চ MAX_PRODUCTS টি পণ্য */
// const SHELF_Y = [0.8, 2.0, 3.2, 4.4];
// const TABLE_X = [-5.3, -1.8, 1.8, 5.3], TABLE_Z = [-3.5, 2.2];
// const SLOTS: Slot[] = (() => {
//   const a: Slot[] = [];
//   TABLE_Z.forEach((z) => TABLE_X.forEach((x) => a.push({ x, y: 1.66, z, ry: 0, s: 1.35 })));
//   for (const ti of [1, 2, 0, 3]) {
//     const y = SHELF_Y[ti] + 0.04;
//     for (let i = 0; i < 12; i++) {
//       const z = -7.9 + i;
//       a.push({ x: -8, y, z, ry: Math.PI / 2, s: 1 }, { x: 8, y, z, ry: -Math.PI / 2, s: 1 });
//     }
//     for (let i = 0; i < 13; i++) a.push({ x: -7.2 + i * 1.2, y, z: -9.1, ry: 0, s: 1 });
//   }
//   return a;
// })();
// const MAX_PRODUCTS = SLOTS.length;

// const shopSlot = (k: number) => ({ x: k % 2 ? 17 : -17, z: -14 - Math.floor(k / 2) * 19 });
// const nextSlots = (shops: Shop[], n: number) => {
//   const used = new Set(shops.map((s) => `${s.x},${s.z}`));
//   const out: { x: number; z: number }[] = [];
//   for (let k = 0; k < MAX_SHOPS && out.length < n; k++) { const p = shopSlot(k); if (!used.has(`${p.x},${p.z}`)) out.push(p); }
//   return out;
// };

// /* ============================ ডেমো ডেটা জেনারেটর ============================ */
// const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
// const taka = (n: number) => '৳' + n.toLocaleString();
// const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
// const ph = (kind: string, c = 0x334155) =>
//   'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500"><rect width="600" height="500" fill="${hex(c)}"/><text x="300" y="320" font-size="190" text-anchor="middle">${KIND_EMOJI[kind] ?? '🛍️'}</text></svg>`);
// const IMG: Record<string, string> = {
//   tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
//   sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
//   headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
//   lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
//   sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
// };
// const STYLE_KINDS: Record<string, string[]> = {
//   fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
//   tech: ['phone', 'watch', 'camera', 'headphone'],
//   home: ['chair', 'lamp', 'plant', 'book', 'jar'],
//   market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
// };
// const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
// const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };
// const ADJ = ['Classic', 'Premium', 'Urban', 'Royal', 'Eco', 'Ultra', 'Smart', 'Modern', 'Elite', 'Fresh'];
// const PAL = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9, 0x14b8a6, 0xf97316, 0x64748b, 0x1e293b, 0xf1f5f9];
// const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// const genProducts = (style: string, n: number, seed: number, pre: string): Product[] => {
//   const r = rng(seed), kinds = STYLE_KINDS[style] ?? STYLE_KINDS.market;
//   return Array.from({ length: Math.min(n, MAX_PRODUCTS) }, (_, i) => {
//     const kind = kinds[i % kinds.length], color = PAL[Math.floor(r() * PAL.length)];
//     const price = Math.round((BASEP[kind] * (0.6 + r() * 1.2)) / 10) * 10;
//     return { id: `${pre}${i}`, name: `${ADJ[Math.floor(r() * ADJ.length)]} ${BASE[kind]} ${i + 1}`, price, image: IMG[kind] ?? ph(kind, color), kind, color };
//   });
// };
// const SHOP_A = ['NOVA', 'ZEN', 'ROYAL', 'URBAN', 'PRIME', 'LUXE', 'SKY', 'METRO', 'ALPHA', 'BLUE', 'GOLDEN', 'SMART', 'FRESH', 'MEGA', 'ELITE'];
// const SHOP_B: Record<string, string> = { fashion: 'FASHION', tech: 'TECH', home: 'HOME', market: 'MART' };
// const SHOP_SUB: Record<string, string> = { fashion: 'Premium Fashion', tech: 'Smart Devices', home: 'Furniture & Decor', market: 'Grocery & Food' };
// const genShop = (i: number, slot: { x: number; z: number }, nProducts: number): Shop => {
//   const style = Object.keys(STYLE_KINDS)[i % 4], r = rng(i * 977 + 13);
//   return { id: `d${i}-${Date.now().toString(36)}`, name: `${SHOP_A[Math.floor(r() * SHOP_A.length)]} ${SHOP_B[style]} ${i + 1}`, subtitle: SHOP_SUB[style], ...slot, accent: PAL[(i * 5 + 1) % (PAL.length - 1)], style, products: genProducts(style, nProducts, i * 31 + 7, `d${i}p`) };
// };
// const defaultShops = (): Shop[] => {
//   const mk = (id: string, name: string, subtitle: string, k: number, accent: number, style: string, first: Product[]): Shop =>
//     ({ id, name, subtitle, ...shopSlot(k), accent, style, products: [...first, ...genProducts(style, 36, k * 11 + 3, id + '_g')] });
//   const p = (id: string, name: string, price: number, kind: string, color: number): Product => ({ id, name, price, image: IMG[kind] ?? ph(kind, color), kind, color });
//   return [
//     mk('fashion', 'NOVA FASHION', 'Premium Fashion', 0, 0x7c3aed, 'fashion', [p('f1', 'Premium T-Shirt', 1800, 'tshirt', 0x2563eb), p('f2', 'Urban Jacket', 5200, 'jacket', 0x1e293b), p('f3', 'Classic Sunglasses', 2400, 'glasses', 0x111827), p('f4', 'Running Sneaker', 4200, 'sneaker', 0xef4444)]),
//     mk('tech', 'TECHHUB', 'Smart Devices', 1, 0x0891b2, 'tech', [p('t1', 'Smart Watch', 4500, 'watch', 0x1e293b), p('t2', 'Mirrorless Camera', 62000, 'camera', 0xcbd5e1), p('t3', 'Wireless Headphones', 6800, 'headphone', 0x111827), p('t4', 'Flagship Phone', 92000, 'phone', 0x64748b)]),
//     mk('home', 'URBAN HOME', 'Furniture & Decor', 2, 0xd97706, 'home', [p('h1', 'Designer Chair', 8500, 'chair', 0xd97706), p('h2', 'Modern Table Lamp', 3200, 'lamp', 0xfacc15)]),
//     mk('market', 'FRESH MART', 'Grocery & Food', 3, 0x16a34a, 'market', [p('m1', 'Organic Honey', 950, 'jar', 0xd9901a), p('m2', 'Imported Chocolate', 1500, 'chocolate', 0x7c3aed), p('m3', 'Premium Rice 10KG', 1800, 'sack', 0xf1f5f9), p('m4', 'Fresh Coffee', 1250, 'coffee', 0x1e293b)]),
//   ];
// };

// /* ============================ IndexedDB (বড় ডেটার জন্য) ============================ */
// const openDB = () => new Promise<IDBDatabase>((res, rej) => {
//   const r = indexedDB.open('grand-mall', 1);
//   r.onupgradeneeded = () => r.result.createObjectStore('kv');
//   r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
// });
// const kv = {
//   async get(k: string): Promise<unknown> {
//     try { const db = await openDB(); return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; }
//   },
//   async set(k: string, v: unknown) {
//     try { const db = await openDB(); await new Promise<void>((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); } catch { /* ignore */ }
//   },
// };

// const fileToDataUrl = (file: File, max: number) =>
//   new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onerror = () => rej(new Error('read'));
//     r.onload = () => {
//       const img = new Image();
//       img.onerror = () => rej(new Error('img'));
//       img.onload = () => {
//         const s = Math.min(1, max / Math.max(img.width, img.height));
//         const c = document.createElement('canvas');
//         c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
//         c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
//         res(c.toDataURL('image/jpeg', 0.82));
//       };
//       img.src = r.result as string;
//     };
//     r.readAsDataURL(file);
//   });

// /* ============================ শেয়ার্ড ক্যাশ (জিওমেট্রি / ম্যাটেরিয়াল / টেক্সচার) ============================ */
// const GC = new Map<string, THREE.BufferGeometry>();
// const G = (k: string, f: () => THREE.BufferGeometry) => { let g = GC.get(k); if (!g) { g = f(); g.userData.keep = true; GC.set(k, g); } return g; };
// const bx = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
// const cy = (a: number, b: number, h: number, s = 16) => G(`c${a}_${b}_${h}_${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
// const sp = (r: number, w = 14, h = 10) => G(`s${r}_${w}_${h}`, () => new THREE.SphereGeometry(r, w, h));
// const to = (r: number, t: number, arc = Math.PI * 2) => G(`t${r}_${t}_${arc}`, () => new THREE.TorusGeometry(r, t, 8, 22, arc));
// const cp = (r: number, l: number) => G(`p${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
// const pl = (w: number, h: number) => G(`pl${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

// const MC = new Map<string, THREE.MeshStandardMaterial>();
// const M = (c: number, r = 0.6, m = 0.1, e = 0, ei = 0) => {
//   const k = `${c}|${r}|${m}|${e}|${ei}`; let x = MC.get(k);
//   if (!x) { x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.keep = true; MC.set(k, x); }
//   return x;
// };
// const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => {
//   const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
//   const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
// };
// const TXC = new Map<string, THREE.CanvasTexture>();
// const tileTex = (a: string, b: string, rx: number, ry: number) => {
//   const k = `${a}${b}${rx}${ry}`; let t = TXC.get(k);
//   if (!t) {
//     t = canvasTex(256, 256, (x) => { x.fillStyle = a; x.fillRect(0, 0, 256, 256); x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128); x.strokeStyle = 'rgba(0,0,0,.12)'; x.strokeRect(0, 0, 256, 256); });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.userData.keep = true; TXC.set(k, t);
//   }
//   return t;
// };
// const slatTex = () => {
//   let t = TXC.get('slat');
//   if (!t) {
//     t = canvasTex(256, 64, (x) => { x.fillStyle = '#1f1710'; x.fillRect(0, 0, 256, 64); for (let k = 0; k < 16; k++) { x.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; x.fillRect(k * 16, 0, 11, 64); } });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.userData.keep = true; TXC.set('slat', t);
//   }
//   return t;
// };
// const signTexture = (title: string, sub: string, accent: number) => canvasTex(1024, 280, (x) => {
//   x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280); x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
//   x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center'; x.fillText(title, 512, 125, 960);
//   x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial'; x.fillText(sub, 512, 190, 960);
// });

// const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
//   const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); p.add(k); return k;
// };
// const tone = (c: number, k: number) => {
//   const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
//   return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
// };
// const disposeTree = (root: THREE.Object3D) => root.traverse((o) => {
//   const m = o as THREE.Mesh;
//   if (m.geometry && !(o as THREE.Sprite).isSprite && !m.geometry.userData.keep) m.geometry.dispose();
//   const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
//   mats.forEach((mm) => {
//     if (mm.userData.keep) return;
//     const mp = (mm as THREE.MeshBasicMaterial).map;
//     if (mp && !mp.userData.keep) mp.dispose();
//     mm.dispose();
//   });
// });

// /* ============================ ৩D পণ্য (প্রসিডিউরাল মডেল) ============================ */
// const shirtGeo = (jacket: boolean) => G(jacket ? 'jacket' : 'tshirt', () => {
//   const pts: [number, number][] = jacket
//     ? [[-.27, 0], [.27, 0], [.27, .4], [.4, .1], [.58, .16], [.46, .62], [.16, .78], [.1, .72], [-.1, .72], [-.16, .78], [-.46, .62], [-.58, .16], [-.4, .1], [-.27, .4]]
//     : [[-.24, 0], [.24, 0], [.24, .42], [.46, .34], [.54, .54], [.3, .74], [.12, .74], [.07, .64], [-.07, .64], [-.12, .74], [-.3, .74], [-.54, .54], [-.46, .34], [-.24, .42]];
//   const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
//   const d = jacket ? 0.12 : 0.08;
//   const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
// });

// function buildProduct(kind: string, color: number, image: string, tl: THREE.TextureLoader): THREE.Group {
//   const g = new THREE.Group();
//   const c = M(color, 0.5, 0.05), c2 = M(tone(color, 0.35), 0.5, 0.05), cd = M(tone(color, -0.35), 0.5, 0.05);
//   const dk = M(0x111827, 0.4, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), wh = M(0xf8fafc, 0.5, 0), gold = M(0xfacc15, 0.3, 0.8), wood = M(0x6b4a2e, 0.6, 0.05);
//   const scr = M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.7), green = M(0x1f8a4c, 0.8, 0), green2 = M(0x2f9e44, 0.8, 0);
//   const H = Math.PI / 2;
//   switch (kind) {
//     case 'tshirt':
//       add(g, shirtGeo(false), c); add(g, bx(0.5, 0.04, 0.085), c2, 0, 0.14, 0);
//       add(g, cy(0.07, 0.07, 0.012, 14), wh, 0.12, 0.47, 0.045, 1, 1, 1, H); break;
//     case 'jacket':
//       add(g, shirtGeo(true), c); add(g, bx(0.03, 0.76, 0.125), dk, 0, 0.38, 0);
//       for (const s of [-1, 1]) add(g, bx(0.14, 0.03, 0.13), dk, s * 0.15, 0.2, 0);
//       add(g, bx(0.1, 0.05, 0.13), cd, 0, 0.74, 0); break;
//     case 'sneaker':
//       add(g, bx(0.36, 0.07, 0.86), wh, 0, 0.035, 0);
//       add(g, bx(0.32, 0.3, 0.4), c, 0, 0.22, -0.2); add(g, sp(0.17), c, 0, 0.17, 0.2, 1, 0.85, 1.7);
//       add(g, bx(0.22, 0.14, 0.32), c2, 0, 0.32, 0.02); add(g, bx(0.335, 0.06, 0.45), cd, 0, 0.14, -0.05);
//       for (const z of [-0.04, 0.06, 0.16]) add(g, bx(0.2, 0.025, 0.05), wh, 0, 0.4 - z * 0.3, z);
//       break;
//     case 'glasses': {
//       const lens = M(tone(color, -0.3), 0.05, 0.9);
//       for (const s of [-1, 1]) { add(g, to(0.17, 0.022), dk, s * 0.22, 0.2, 0); add(g, cy(0.165, 0.165, 0.012, 20), lens, s * 0.22, 0.2, 0, 1, 1, 1, H); add(g, bx(0.025, 0.025, 0.5), dk, s * 0.4, 0.26, -0.25); }
//       add(g, bx(0.1, 0.025, 0.03), dk, 0, 0.26, 0); break;
//     }
//     case 'watch':
//       add(g, cy(0.14, 0.17, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.03, 0.03, 0.2, 10), mt, 0, 0.12, 0);
//       add(g, to(0.2, 0.05), c, 0, 0.38, 0, 1, 1.1, 0.6); add(g, cy(0.17, 0.17, 0.07, 24), mt, 0, 0.38, 0, 1, 1, 1, H);
//       add(g, cy(0.145, 0.145, 0.078, 24), scr, 0, 0.38, 0, 1, 1, 1, H); add(g, cy(0.02, 0.02, 0.06, 8), mt, 0.19, 0.42, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.02, 0.1, 0.01), wh, 0, 0.42, 0.042); add(g, bx(0.07, 0.02, 0.01), wh, 0.03, 0.38, 0.042); break;
//     case 'phone': {
//       const t = new THREE.Group(); t.position.y = 0.42; t.rotation.x = -0.1; g.add(t);
//       add(t, bx(0.36, 0.74, 0.045), c, 0, 0, 0); add(t, bx(0.33, 0.7, 0.01), scr, 0, 0, 0.024);
//       add(t, bx(0.13, 0.13, 0.02), dk, -0.08, 0.27, -0.03); add(t, cy(0.035, 0.035, 0.02, 12), M(0x38bdf8, 0.1, 0.9), -0.08, 0.27, -0.045, 1, 1, 1, H);
//       add(t, bx(0.12, 0.012, 0.012), wh, 0, 0.3, 0.032); add(g, bx(0.2, 0.05, 0.1), mt, 0, 0.025, -0.02); break;
//     }
//     case 'camera':
//       add(g, bx(0.7, 0.38, 0.3), dk, 0, 0.25, 0); add(g, bx(0.7, 0.12, 0.31), mt, 0, 0.44, 0); add(g, bx(0.2, 0.1, 0.2), dk, -0.1, 0.55, 0);
//       add(g, cy(0.17, 0.17, 0.24, 22), dk, 0.03, 0.25, 0.25, 1, 1, 1, H); add(g, cy(0.18, 0.18, 0.04, 22), mt, 0.03, 0.25, 0.2, 1, 1, 1, H);
//       add(g, cy(0.12, 0.12, 0.02, 22), M(0x1e3a8a, 0.05, 0.9, 0x1e40af, 0.4), 0.03, 0.25, 0.375, 1, 1, 1, H);
//       add(g, bx(0.18, 0.32, 0.12), dk, -0.26, 0.22, 0.14); add(g, cy(0.04, 0.04, 0.04, 10), c, 0.26, 0.5, 0); break;
//     case 'headphone':
//       add(g, cy(0.17, 0.19, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.035, 0.035, 0.3, 10), mt, 0, 0.17, 0);
//       add(g, to(0.3, 0.035, Math.PI), c, 0, 0.36, 0);
//       for (const s of [-1, 1]) { add(g, cy(0.13, 0.13, 0.1, 18), c, s * 0.32, 0.36, 0, 1, 1, 1, 0, 0, H); add(g, cy(0.11, 0.11, 0.05, 18), dk, s * 0.26, 0.36, 0, 1, 1, 1, 0, 0, H); }
//       break;
//     case 'chair':
//       add(g, bx(0.55, 0.07, 0.55), wood, 0, 0.5, 0); add(g, bx(0.5, 0.1, 0.5), c, 0, 0.58, 0); add(g, bx(0.52, 0.5, 0.07), c, 0, 0.88, -0.25, 1, 1, 1, -0.12);
//       for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, cy(0.03, 0.022, 0.5, 8), wood, sx * 0.23, 0.25, sz * 0.23);
//       break;
//     case 'lamp':
//       add(g, cy(0.16, 0.19, 0.04, 20), dk, 0, 0.02, 0); add(g, cy(0.022, 0.022, 0.55, 8), gold, 0, 0.3, 0);
//       add(g, cy(0.16, 0.3, 0.34, 24), M(tone(color, 0.5), 0.7, 0, color, 0.55), 0, 0.72, 0); add(g, sp(0.07), M(0xfff3c4, 0.3, 0, 0xffe08a, 2), 0, 0.68, 0); break;
//     case 'plant':
//       add(g, cy(0.2, 0.15, 0.3, 16), c, 0, 0.15, 0); add(g, cy(0.2, 0.2, 0.03, 16), dk, 0, 0.3, 0);
//       add(g, sp(0.22), green, 0, 0.5, 0); add(g, sp(0.16), green2, 0.16, 0.42, 0.05); add(g, sp(0.17), green2, -0.15, 0.44, -0.05); add(g, sp(0.14), green, 0, 0.7, 0); break;
//     case 'book':
//       add(g, bx(0.5, 0.12, 0.38), c, 0, 0.06, 0); add(g, bx(0.46, 0.08, 0.36), wh, 0.02, 0.06, 0.005);
//       add(g, bx(0.46, 0.1, 0.34), c2, 0.02, 0.17, 0, 1, 1, 1, 0, 0.15); add(g, bx(0.5, 0.012, 0.1), gold, 0, 0.13, 0.15); break;
//     case 'jar':
//       add(g, cy(0.2, 0.2, 0.38, 20), M(0xd9901a, 0.12, 0.1, 0x7a4a00, 0.25), 0, 0.22, 0); add(g, cy(0.21, 0.21, 0.08, 20), gold, 0, 0.45, 0);
//       add(g, cy(0.205, 0.205, 0.17, 20), M(0xfdf3d8, 0.7, 0), 0, 0.22, 0); add(g, cy(0.1, 0.1, 0.01, 6), M(0xd9901a, 0.5, 0), 0, 0.22, 0.205, 1, 1, 1, H); break;
//     case 'chocolate':
//       add(g, bx(0.5, 0.72, 0.09), c, 0, 0.37, 0); add(g, bx(0.52, 0.14, 0.1), gold, 0, 0.52, 0); add(g, bx(0.3, 0.26, 0.01), wh, 0, 0.26, 0.05); add(g, bx(0.2, 0.05, 0.012), c, 0, 0.26, 0.056); break;
//     case 'sack':
//       add(g, bx(0.5, 0.66, 0.26), M(0xefe6cf, 0.9, 0), 0, 0.34, 0); add(g, bx(0.52, 0.2, 0.27), c, 0, 0.38, 0); add(g, cp(0.05, 0.12), M(0xefe6cf, 0.9, 0), 0, 0.74, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.28, 0.1, 0.01), wh, 0, 0.38, 0.14); break;
//     case 'coffee':
//       add(g, bx(0.42, 0.62, 0.2), dk, 0, 0.32, 0); add(g, bx(0.43, 0.22, 0.21), c, 0, 0.34, 0); add(g, bx(0.42, 0.06, 0.22), M(0x2b2f3a, 0.6, 0.1), 0, 0.65, 0);
//       add(g, cy(0.04, 0.04, 0.02, 12), wh, 0, 0.52, 0.105, 1, 1, 1, H); add(g, bx(0.2, 0.05, 0.01), gold, 0, 0.34, 0.11); break;
//     case 'bottle':
//       add(g, cy(0.13, 0.13, 0.46, 18), M(color, 0.12, 0.1), 0, 0.24, 0); add(g, cy(0.05, 0.12, 0.14, 14), M(color, 0.12, 0.1), 0, 0.54, 0); add(g, cy(0.05, 0.05, 0.16, 12), M(color, 0.12, 0.1), 0, 0.66, 0);
//       add(g, cy(0.055, 0.055, 0.06, 12), gold, 0, 0.76, 0); add(g, cy(0.135, 0.135, 0.2, 18), wh, 0, 0.24, 0); break;
//     case 'bag':
//       add(g, bx(0.58, 0.4, 0.22), c, 0, 0.22, 0); add(g, bx(0.59, 0.14, 0.24), cd, 0, 0.41, 0); add(g, to(0.17, 0.02, Math.PI), dk, 0, 0.46, 0); add(g, bx(0.08, 0.08, 0.02), gold, 0, 0.38, 0.125); break;
//     case 'frame': {
//       const tex = tl.load(image || ph('frame')); tex.colorSpace = THREE.SRGBColorSpace;
//       add(g, bx(0.72, 0.57, 0.05), wood, 0, 0.36, 0); add(g, pl(0.6, 0.45), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.36, 0.028); add(g, bx(0.04, 0.4, 0.04), wood, 0, 0.2, -0.1, 1, 1, 1, 0.3); break;
//     }
//     default:
//       add(g, bx(0.5, 0.4, 0.5), c, 0, 0.2, 0); add(g, bx(0.54, 0.08, 0.54), c2, 0, 0.44, 0);
//       add(g, bx(0.1, 0.4, 0.52), gold, 0, 0.2, 0); add(g, bx(0.52, 0.4, 0.1), gold, 0, 0.2, 0); add(g, sp(0.09), gold, -0.07, 0.54, 0, 1.3, 0.8, 1); add(g, sp(0.09), gold, 0.07, 0.54, 0, 1.3, 0.8, 1);
//   }
//   return g;
// }

// /* একই ম্যাটেরিয়ালের সব মেশ একসাথে মার্জ — ১৫০+ পণ্যেও ড্র-কল কম */
// function bake(root: THREE.Object3D): THREE.Mesh[] {
//   root.updateMatrixWorld(true);
//   const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
//   root.traverse((o) => {
//     const m = o as THREE.Mesh; if (!m.isMesh) return;
//     let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
//     g.applyMatrix4(m.matrixWorld);
//     const mat = m.material as THREE.Material, arr = buckets.get(mat);
//     if (arr) arr.push(g); else buckets.set(mat, [g]);
//   });
//   const out: THREE.Mesh[] = [];
//   buckets.forEach((list, mat) => {
//     const merged = mergeGeometries(list, false); list.forEach((x) => x.dispose());
//     if (merged) out.push(new THREE.Mesh(merged, mat));
//   });
//   return out;
// }

// /* ============================ মানুষ (আরো সুন্দর কার্টুন) ============================ */
// type HumanOpts = { shirt?: number; pants?: number; skin?: number; hair?: number; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; female?: boolean; glasses?: boolean; shoe?: number };
// function buildHuman(o: HumanOpts = {}) {
//   const skin = M(o.skin ?? 0xc98262, 0.55, 0), shirt = M(o.shirt ?? 0x2563eb, 0.6, 0), pants = M(o.pants ?? 0x1e293b, 0.7, 0), hair = M(o.hair ?? 0x17120f, 0.45, 0.1);
//   const dark = M(0x0a0a0a, 0.5, 0.1), white = M(0xffffff, 0.3, 0), shoe = M(o.shoe ?? 0xf1f5f9, 0.5, 0.1), sole = M(0x1f2937, 0.8, 0), lip = M(0xb4534b, 0.5, 0);
//   const fem = !!o.female, H = Math.PI / 2;
//   const group = new THREE.Group(), root = new THREE.Group(); group.add(root);

//   add(root, cp(0.36, 0.46), shirt, 0, 2.4, 0, fem ? 0.9 : 1, 1, 0.6);
//   add(root, sp(0.3), fem ? shirt : pants, 0, 1.75, 0, 1.12, 0.62, 0.78);
//   if (fem) add(root, cy(0.3, 0.52, 0.7, 20), shirt, 0, 1.62, 0);
//   else { add(root, bx(0.74, 0.08, 0.46), dark, 0, 1.9, 0); add(root, bx(0.1, 0.1, 0.05), M(0xfacc15, 0.3, 0.8), 0, 1.9, -0.24); }
//   add(root, cy(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
//   add(root, to(0.13, 0.035), shirt, 0, 2.97, 0, 1, 1, 1, H);

//   const arm = (s: number) => {
//     const a = new THREE.Group(); a.position.set(s * (fem ? 0.48 : 0.52), 2.8, 0); root.add(a);
//     add(a, sp(0.14), shirt, 0, 0, 0); add(a, cp(0.11, 0.26), shirt, 0, -0.24, 0); add(a, cp(0.085, 0.3), skin, 0, -0.64, 0); add(a, sp(0.095), skin, 0, -0.92, 0);
//     return a;
//   };
//   const leg = (s: number) => {
//     const l = new THREE.Group(); l.position.set(s * 0.2, 1.72, 0); root.add(l);
//     add(l, cp(0.14, 1.26), fem ? skin : pants, 0, -0.78, 0);
//     if (!fem) add(l, to(0.14, 0.02), dark, 0, -1.48, 0, 1, 1, 1, H);
//     add(l, bx(0.27, 0.14, 0.54), shoe, 0, -1.6, -0.1); add(l, bx(0.28, 0.05, 0.56), sole, 0, -1.695, -0.1);
//     return l;
//   };
//   const AL = arm(-1), AR = arm(1), LL = leg(-1), LR = leg(1);

//   const head = new THREE.Group(); head.position.set(0, 3.42, 0); root.add(head);
//   add(head, sp(0.3, 24, 18), skin, 0, 0, 0, 0.9, 1.08, 0.98);
//   for (const s of [-1, 1]) {
//     add(head, sp(0.05), skin, s * 0.27, -0.02, 0.0, 0.6, 1, 0.8);
//     add(head, sp(0.055), white, s * 0.105, 0.05, -0.252, 1, 0.8, 0.5); add(head, sp(0.03), dark, s * 0.105, 0.05, -0.28, 1, 1, 0.5);
//     add(head, bx(0.1, 0.018, 0.02), hair, s * 0.105, 0.14, -0.265, 1, 1, 1, 0, 0, s * 0.12);
//     if (o.glasses) add(head, to(0.075, 0.01), dark, s * 0.105, 0.05, -0.285);
//   }
//   if (o.glasses) add(head, bx(0.06, 0.012, 0.012), dark, 0, 0.06, -0.285);
//   add(head, sp(0.04), skin, 0, -0.03, -0.285, 1, 1.1, 1); add(head, to(0.065, 0.012, Math.PI), lip, 0, -0.1, -0.27, 1, 1, 0.5, 0, 0, Math.PI);
//   const capG = G('hcap', () => new THREE.SphereGeometry(0.315, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
//   const st = o.style ?? 'short';
//   if (st !== 'bald') {
//     add(head, capG, st === 'cap' ? shirt : hair, 0, 0.02, 0.03, 0.93, 1.1, 1);
//     if (st === 'short' || st === 'bun') add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9);
//     if (st === 'long') { add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9); add(head, cp(0.24, 0.5), hair, 0, -0.38, 0.15, 1, 1, 0.55); }
//     if (st === 'bun') add(head, sp(0.12), hair, 0, 0.36, 0.1);
//     if (st === 'cap') add(head, bx(0.4, 0.03, 0.28), shirt, 0, 0.12, -0.3);
//   }

//   const nm: { chest?: THREE.Mesh; tag?: THREE.Sprite } = {};
//   const setName = (name: string, photo?: string) => {
//     const make = (w: number, h: number, img?: HTMLImageElement) => {
//       const c = document.createElement('canvas'); c.width = w; c.height = h;
//       const x = c.getContext('2d')!;
//       x.fillStyle = 'rgba(5,11,22,.85)'; x.fillRect(0, 0, w, h);
//       const r = h / 2 - 8;
//       x.save(); x.beginPath(); x.arc(h / 2, h / 2, r, 0, 7); x.clip();
//       if (img) { const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, h / 2 - r, h / 2 - r, r * 2, r * 2); }
//       else { x.fillStyle = '#38bdf8'; x.fillRect(0, 0, h, h); }
//       x.restore();
//       x.fillStyle = '#fff'; x.font = `800 ${h * 0.4}px Arial`; x.textAlign = 'left'; x.textBaseline = 'middle';
//       x.fillText(name, h + 4, h / 2 + 2, w - h - 14);
//       const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
//     };
//     const apply = (img?: HTMLImageElement) => {
//       const ct = make(256, 96, img), tt = make(512, 128, img);
//       if (!nm.chest || !nm.tag) {
//         nm.chest = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshBasicMaterial({ map: ct }));
//         nm.chest.position.set(0, 2.5, -0.245); nm.chest.rotation.y = Math.PI; root.add(nm.chest);
//         nm.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tt, depthTest: false }));
//         nm.tag.scale.set(1.6, 0.4, 1); nm.tag.position.y = 0.62; nm.tag.renderOrder = 10; head.add(nm.tag);
//       } else {
//         const cm = nm.chest.material as THREE.MeshBasicMaterial, tm = nm.tag.material as THREE.SpriteMaterial;
//         cm.map?.dispose(); cm.map = ct; tm.map?.dispose(); tm.map = tt;
//       }
//     };
//     apply();
//     if (photo) { const im = new Image(); im.onload = () => apply(im); im.src = photo; }
//   };

//   /* বাইকে বসার ভঙ্গি */
//   let riding = false;
//   const setRide = (v: boolean) => { riding = v; };

//   const update = (phase: number, amt: number, t: number) => {
//     if (riding) {
//       LL.rotation.x = LR.rotation.x = 0.7; AL.rotation.x = AR.rotation.x = 1.1;
//       AL.rotation.z = 0.12; AR.rotation.z = -0.12; root.position.y = 0; head.rotation.y = 0;
//       return;
//     }
//     const s = Math.sin(phase) * 0.7 * amt;
//     LL.rotation.x = s; LR.rotation.x = -s; AL.rotation.x = -s * 0.8; AR.rotation.x = s * 0.8;
//     AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
//     root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
//     head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
//   };
//   return { group, update, setName, setRide };
// }
// type Human = ReturnType<typeof buildHuman>;

// /* ============================ মোটরসাইকেল ============================ */
// function buildMoto() {
//   const g = new THREE.Group(), H = Math.PI / 2;
//   const body = M(0xdc2626, 0.3, 0.6), dk = M(0x111827, 0.5, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), tire = M(0x0a0a0a, 0.9, 0);
//   const lampM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2.5), tail = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const wheel = (z: number) => {
//     const w = new THREE.Group(); w.position.set(0, 0.63, z); g.add(w);
//     add(w, to(0.5, 0.13), tire, 0, 0, 0, 1, 1, 1, 0, H, 0);
//     add(w, cy(0.4, 0.4, 0.1, 18), mt, 0, 0, 0, 1, 1, 1, 0, 0, H);
//     add(w, bx(0.06, 0.9, 0.06), dk); add(w, bx(0.06, 0.06, 0.9), dk);
//     return w;
//   };
//   const wf = wheel(-1.25), wr = wheel(1.1);
//   add(g, bx(0.4, 0.5, 0.9), mt, 0, 0.8, 0.05);                       // ইঞ্জিন
//   add(g, sp(0.4), body, 0, 1.45, -0.3, 0.8, 0.7, 1.5);               // ট্যাংক
//   add(g, bx(0.46, 0.16, 0.95), dk, 0, 1.25, 0.35);                   // সিট
//   add(g, bx(0.4, 0.08, 0.8), body, 0, 1.0, 1.05, 1, 1, 1, -0.2);     // পেছনের ফেন্ডার
//   for (const s of [-1, 1]) add(g, cy(0.035, 0.035, 1.16, 8), mt, s * 0.18, 1.14, -0.975, 1, 1, 1, 0.495); // ফর্ক
//   add(g, bx(1.0, 0.05, 0.05), dk, 0, 1.7, -0.7);                     // হ্যান্ডেলবার
//   add(g, sp(0.15), lampM, 0, 1.55, -0.9);                            // হেডলাইট
//   add(g, bx(0.25, 0.1, 0.06), tail, 0, 1.05, 1.5);                   // টেইললাইট
//   add(g, cy(0.07, 0.09, 1.0, 10), mt, 0.3, 0.55, 0.55, 1, 1, 1, H);  // এক্সজস্ট
//   const lamp = new THREE.SpotLight(0xfff2cc, 0, 60, 0.55, 0.5, 1.5);
//   lamp.position.set(0, 1.5, -1.1); lamp.target.position.set(0, 0.2, -14); g.add(lamp, lamp.target);
//   g.traverse((o) => { o.castShadow = true; });
//   return { g, wf, wr, lamp };
// }

// /* ============================ আকাশ, সূর্য, চাঁদ, তারা ============================ */
// function makeSky() {
//   const mat = new THREE.ShaderMaterial({
//     side: THREE.BackSide, depthWrite: false,
//     uniforms: { zenith: { value: new THREE.Vector3() }, horizon: { value: new THREE.Vector3() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Vector3(1, 1, 1) }, night: { value: 0 } },
//     vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
//     fragmentShader: `
//       varying vec3 vD; uniform vec3 zenith, horizon, sunDir, sunCol; uniform float night;
//       void main(){
//         vec3 d = normalize(vD); float h = d.y;
//         vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.5));
//         col = mix(col, horizon*0.55, clamp(-h*4.0,0.0,1.0));
//         float sd = max(dot(d, sunDir), 0.0);
//         col += sunCol*(pow(sd,6.0)*0.18 + pow(sd,48.0)*0.55);
//         col = mix(col, vec3(1.0,0.98,0.9), smoothstep(0.9988,0.9994,sd));
//         float md = max(dot(d,-sunDir),0.0);
//         col = mix(col, vec3(0.92,0.95,1.0), smoothstep(0.9993,0.9997,md)*night);
//         vec3 p = floor(d*220.0);
//         float s = fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453);
//         col += vec3(step(0.9985,s))*night*step(0.05,h);
//         gl_FragColor = vec4(col,1.0);
//       }`,
//   });
//   const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
//   mesh.renderOrder = -10; mesh.frustumCulled = false;
//   return mesh;
// }
// const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
// const NZ = [0.02, 0.04, 0.11], DZ = [0.14, 0.4, 0.85], SZ = [0.28, 0.2, 0.5];
// const NH = [0.07, 0.09, 0.2], DH = [0.7, 0.85, 1], SH = [1, 0.58, 0.32];

// /* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, গাছ, শহর, মেঘ, পাখি ============================ */
// function addOutdoors(scene: THREE.Scene) {
//   const bcol: Box2[] = []; // শহরের ভবনের collision
//   const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
//     const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
//   };
//   plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
//   plane(1600, 30, 0x6b7280, 0.012, 64); // ফুটপাত/প্লাজা
//   const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
//   const m4 = new THREE.Matrix4();
//   for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
//   scene.add(dashes);

//   // গাছ
//   const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
//   for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
//     const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
//     add(t, cy(0.25, 0.35, 3, 8), M(0x5b3a1e, 0.9, 0), 0, 1.5, 0); add(t, ico, leafMs[k % 3], 0, 4, 0); add(t, ico, leafMs[(k + 1) % 3], 0.6, 5.2, 0.2, 0.7, 0.7, 0.7);
//     t.scale.setScalar(0.9 + (k % 4) * 0.12); scene.add(t);
//   }

//   // দূরের শহর (জানালায় রাতে আলো জ্বলে)
//   const wt = canvasTex(64, 128, (x) => {
//     x.fillStyle = '#7a8aa5'; x.fillRect(0, 0, 64, 128);
//     for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { x.fillStyle = Math.random() < 0.45 ? '#ffe9a8' : '#33415c'; x.fillRect(c * 8 + 1, r * 8 + 1, 5, 5); }
//   });
//   const cityMat = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: wt, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.7 });
//   const N = 90, city = new THREE.InstancedMesh(bx(1, 1, 1), cityMat, N), rr = rng(42), mm = new THREE.Matrix4(), col = new THREE.Color();
//   for (let i = 0; i < N; i++) {
//     const w = 10 + rr() * 14, h = 18 + rr() * 70, d = 10 + rr() * 12;
//     const cx = -340 + i * 7.6 + rr() * 4, cz = 82 + rr() * 40;
//     mm.compose(new THREE.Vector3(cx, h / 2, cz), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
//     bcol.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
//     city.setMatrixAt(i, mm); city.setColorAt(i, col.setHSL(0.58 + rr() * 0.08, 0.15, 0.55 + rr() * 0.3));
//   }
//   scene.add(city);

//   // গাড়ি
//   const wheelM = M(0x0a0a0a, 0.8, 0), lightM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2), tailM = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const cars = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316].map((color, i) => {
//     const dir = i % 2 ? -1 : 1, g = new THREE.Group();
//     add(g, bx(4.2, 0.9, 1.9), M(color, 0.3, 0.6), 0, 0.8, 0); add(g, bx(2.2, 0.8, 1.7), M(0x9edfff, 0.1, 0.3), -0.2, 1.6, 0);
//     for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) add(g, cy(0.4, 0.4, 0.3, 16), wheelM, wx, 0.4, wz, 1, 1, 1, Math.PI / 2);
//     for (const lz of [-0.6, 0.6]) { add(g, bx(0.1, 0.2, 0.35), lightM, 2.1, 0.85, lz); add(g, bx(0.1, 0.2, 0.35), tailM, -2.1, 0.85, lz); }
//     g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
//     return { g, dir, sp: 9 + (i % 4) * 3 };
//   });

//   // মেঘ
//   const cloudTex = canvasTex(128, 64, (x) => {
//     for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 88, cyy = 28 + Math.random() * 12, r = 14 + Math.random() * 12, gr = x.createRadialGradient(cx, cyy, 0, cx, cyy, r); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cyy, r, 0, 7); x.fill(); }
//   });
//   const clouds = Array.from({ length: 16 }, (_, i) => {
//     const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
//     s.scale.set(90 + (i % 4) * 25, 36 + (i % 3) * 8, 1); s.position.set(-250 + i * 34, 85 + (i % 5) * 14, -150 + ((i * 53) % 260)); scene.add(s); return s;
//   });

//   // পাখি
//   const wingG = G('wing', () => new THREE.PlaneGeometry(1.2, 0.4)), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
//   const birds = Array.from({ length: 14 }, (_, i) => {
//     const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group();
//     const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
//     wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6; L.add(wl); R.add(wr);
//     const b = new THREE.Mesh(sp(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
//     g.add(L, R, b); scene.add(g);
//     return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
//   });

//   const update = (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
//     cars.forEach((c) => { c.g.position.x += c.dir * c.sp * dt; if (c.g.position.x > 150) c.g.position.x = -150; if (c.g.position.x < -150) c.g.position.x = 150; });
//     birds.forEach((b) => {
//       const a = t * b.sp + b.off;
//       b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6); b.g.rotation.y = -a;
//       const f = Math.sin(t * 9 + b.off) * 0.7; b.L.rotation.z = f; b.R.rotation.z = -f; b.g.visible = dayF > 0.15;
//     });
//     clouds.forEach((c, i) => {
//       c.position.x += dt * (1.5 + (i % 3) * 0.6); if (c.position.x > 280) c.position.x = -280;
//       const m = c.material as THREE.SpriteMaterial; m.color.setRGB(cloudRGB[0], cloudRGB[1], cloudRGB[2], THREE.SRGBColorSpace); m.opacity = 0.35 + 0.55 * dayF;
//     });
//     cityMat.emissiveIntensity = (1 - dayF) * 0.9;
//   };
//   return { update, col: bcol };
// }

// /* ============================ অন্য মানুষ (একই ডিভাইসের অন্য ট্যাব) ============================
//    আসল ইন্টারনেট মাল্টিপ্লেয়ারের জন্য সার্ভার (WebSocket/Firebase/Supabase) লাগবে। */
// type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
// function createNet(getSelf: () => { x: number; z: number; r: number; w: number; a: number }, getProfile: () => Profile) {
//   const id = Math.random().toString(36).slice(2, 8);
//   let bc: BroadcastChannel | null = null;
//   try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
//   const peers = new Map<string, Peer>();
//   if (bc) bc.onmessage = (e) => {
//     const m = e.data;
//     if (!m || !m.id || m.id === id) return;
//     if (m.t === 'bye') { peers.delete(m.id); return; }
//     const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
//     if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; } else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
//     p.seen = performance.now(); peers.set(m.id, p);
//   };
//   let lp = 0, lh = 0;
//   const tick = (now: number) => {
//     if (!bc) return;
//     if (now - lh > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lh = now; }
//     if (now - lp > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lp = now; }
//     peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
//   };
//   return { peers, tick, close: () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); } };
// }

// /* ============================ মূল কম্পোনেন্ট ============================ */
// const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';
// const inp = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
// const btn = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
// const fmtHour = (h: number) => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

// type Built = { shop: Shop; g: THREE.Group; col: Box2[]; hits: { box: THREE.Box3; p: Product }[]; idlers: { h: Human; base: number }[]; screen: (t: number) => void; light: THREE.Vector3 };

// export default function Page() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const tipRef = useRef<HTMLDivElement>(null);
//   const keysRef = useRef({ f: false, b: false, l: false, r: false, s: false });
//   const joyRef = useRef({ x: 0, y: 0 });
//   const pausedRef = useRef(false);
//   const meRef = useRef<Human | null>(null);
//   const posRef = useRef({ x: 0, z: 18 });
//   const tpRef = useRef<{ x: number; z: number } | null>(null);
//   const sunCmdRef = useRef(false);
//   const dayRef = useRef({ a: 0.65, auto: true });
//   const rideCmdRef = useRef(0);

//   const [shops, setShops] = useState<Shop[]>(defaultShops);
//   const [profile, setProfile] = useState<Profile>({ name: 'আমি', photo: '' });
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [balance, setBalance] = useState(100000);
//   const [score, setScore] = useState(0);
//   const [loaded, setLoaded] = useState(false);
//   const [selected, setSelected] = useState<Sel | null>(null);
//   const [hover, setHover] = useState<{ name: string; price: number } | null>(null);
//   const [qty, setQty] = useState(1);
//   const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন। বাইরে বাইক আছে — F চাপুন!');
//   const [touch, setTouch] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [panel, setPanel] = useState<'' | 'profile' | 'shops'>('');
//   const [online, setOnline] = useState<string[]>([]);
//   const [knob, setKnob] = useState({ x: 0, y: 0 });
//   const [hour, setHour] = useState(8.5);
//   const [autoDay, setAutoDay] = useState(true);
//   const [sid, setSid] = useState('fashion');
//   const [q, setQ] = useState('');
//   const [ns, setNs] = useState({ name: '', subtitle: '', style: 'market', accent: '#2563eb' });
//   const [np, setNp] = useState({ name: '', price: '', image: '', kind: 'tshirt', color: '#2563eb' });
//   const [rn, setRn] = useState('');
//   const [riding, setRiding] = useState(false);
//   const [nearBike, setNearBike] = useState(false);

//   const profileRef = useRef(profile); profileRef.current = profile;
//   const shopsRef = useRef(shops); shopsRef.current = shops;
//   const total = cart.reduce((s, i) => s + i.price * i.count, 0);
//   const cartCount = cart.reduce((s, i) => s + i.count, 0);

//   useEffect(() => { pausedRef.current = paused; }, [paused]);
//   useEffect(() => {
//     const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
//     check(); window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   /* ---- লোড / সেভ ---- */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
//         if (ls) {
//           if (ls.profile) setProfile(ls.profile); if (ls.cart) setCart(ls.cart);
//           if (typeof ls.balance === 'number') setBalance(ls.balance); if (typeof ls.score === 'number') setScore(ls.score);
//         }
//       } catch { /* ignore */ }
//       const saved = (await kv.get('shops')) as Shop[] | undefined;
//       if (alive && Array.isArray(saved) && saved.length) { setShops(saved); setSid(saved[0].id); }
//       if (alive) setLoaded(true);
//     })();
//     return () => { alive = false; };
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     const t = setTimeout(() => { kv.set('shops', shops); }, 500);
//     return () => clearTimeout(t);
//   }, [loaded, shops]);
//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score })); } catch { /* ignore */ }
//   }, [loaded, profile, cart, balance, score]);
//   useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

//   /* ============================ 3D দৃশ্য ============================ */
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container || !loaded) return;

//     const scene = new THREE.Scene();
//     scene.fog = new THREE.Fog(0xbfd8f0, 25, 135);
//     const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
//     renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     container.appendChild(renderer.domElement);
//     renderer.domElement.style.touchAction = 'none';

//     const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a4252, 1.6); scene.add(hemi);
//     const sun = new THREE.DirectionalLight(0xffffff, 1.6);
//     sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
//     Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 220 });
//     scene.add(sun, sun.target);
//     const pool = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xfff1dc, 0, 30, 2); scene.add(l); return l; });

//     const sky = makeSky(); scene.add(sky);
//     const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
//     const outdoors = addOutdoors(scene);
//     const updateOutdoors = outdoors.update;

//     const textureLoader = new THREE.TextureLoader(); textureLoader.setCrossOrigin('anonymous');
//     const glowMat = M(0xeaf8ff, 0.5, 0, 0xbde9ff, 2.2);
//     const built = new Map<string, Built>();
//     const screens: Built[] = [];
//     void screens;

//     /* ---------- মলের কাঠামো (দোকানের সংখ্যা অনুযায়ী লম্বা হয়) ---------- */
//     let shell: THREE.Group | null = null, shellBack = 0, shellCol: Box2[] = [];
//     const needBack = () => { const zs = shopsRef.current.map((s) => s.z); return Math.min(-115, (zs.length ? Math.min(...zs) : -14) - 22); };
//     const mkShell = (backZ: number) => {
//       if (shell) { scene.remove(shell); disposeTree(shell); }
//       shellBack = backZ; shellCol = [];
//       // দেয়াল ও প্রবেশদ্বারের পিলারে collision (এখন বাইরে যাওয়া যায়)
//       shellCol.push(
//         { minX: -29, maxX: -28, minZ: backZ, maxZ: 24 }, { minX: 28, maxX: 29, minZ: backZ, maxZ: 24 },
//         { minX: -29, maxX: 29, minZ: backZ - 1, maxZ: backZ },
//         { minX: -26.7, maxX: -25.3, minZ: 23.3, maxZ: 24.7 }, { minX: 25.3, maxX: 26.7, minZ: 23.3, maxZ: 24.7 },
//       );
//       const len = 24 - backZ, cz = (24 + backZ) / 2, s = new THREE.Group();
//       const floor = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ map: tileTex('#2a3447', '#323e55', Math.round(57 / 4), Math.round(len / 4)), roughness: 0.22, metalness: 0.2 }));
//       floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz); floor.receiveShadow = true; s.add(floor);
//       const wallM = M(0x1a2338, 0.5, 0.3);
//       for (const sx of [-28.5, 28.5]) { const w = add(s, bx(1, 14, len), wallM, sx, 7, cz); w.receiveShadow = true; }
//       add(s, bx(58, 14, 1), wallM, 0, 7, backZ - 0.5);
//       // কাচের ছাদ — আকাশ ও সূর্য দেখা যায়
//       const roof = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ color: 0xa8d8ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
//       roof.rotation.x = Math.PI / 2; roof.position.set(0, 14, cz); s.add(roof);
//       const nB = Math.floor(len / 9), beams = new THREE.InstancedMesh(bx(57, 0.35, 0.5), M(0x2b3550, 0.4, 0.7), nB), m4 = new THREE.Matrix4();
//       for (let i = 0; i < nB; i++) { m4.setPosition(0, 14, 24 - i * 9); beams.setMatrixAt(i, m4); }
//       beams.castShadow = true; s.add(beams);
//       for (const rx of [-22, -11, 0, 11, 22]) { const r = add(s, bx(0.3, 0.3, len), M(0x2b3550, 0.4, 0.7), rx, 14, cz); r.castShadow = true; }
//       const nL = Math.floor(len / 10), bars = new THREE.InstancedMesh(bx(6, 0.15, 0.5), glowMat, nL);
//       for (let i = 0; i < nL; i++) { m4.setPosition(0, 13.7, 20 - i * 10); bars.setMatrixAt(i, m4); }
//       s.add(bars);
//       for (const sx of [-7.3, 7.3]) add(s, bx(0.1, 0.02, len), M(0x22d3ee, 0.3, 0, 0x22d3ee, 2), sx, 0.03, cz);
//       // টব ও গাছ
//       for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
//         add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
//         shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
//       }
//       // প্রবেশদ্বার
//       for (const sx of [-26, 26]) add(s, bx(1.4, 14, 1.4), M(0x2b3550, 0.4, 0.7), sx, 7, 24);
//       add(s, bx(54, 1.2, 1.2), M(0x2b3550, 0.4, 0.7), 0, 13.2, 24);
//       const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8), side: THREE.DoubleSide }));
//       arch.position.set(0, 10.6, 23.6); s.add(arch);
//       shell = s; scene.add(s);
//     };

//     /* ---------- দোকান তৈরি (স্ট্রিমিং) ---------- */
//     const buildShop = (shop: Shop): Built => {
//       const g = new THREE.Group();
//       g.position.set(shop.x, 0, shop.z); g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2;
//       const col: Box2[] = [], idlers: Built['idlers'] = [];
//       const acc = M(shop.accent, 0.3, 0.5), dark = M(0x131a2a, 0.35, 0.6), metal = M(0x64748b, 0.25, 0.85), wood = M(0x6b4a2e, 0.55, 0.1), white = M(0xe5e9f0, 0.25, 0.2);
//       const led = M(shop.accent, 0.3, 0.2, shop.accent, 2.5);
//       const glassM = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
//       const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
//         const k = add(g, bx(w, h, d), m, x, y, z); k.castShadow = shadow; k.receiveShadow = true; return k;
//       };
//       const solid = (lx: number, lz: number, w: number, d: number) => {
//         const c = Math.round(Math.cos(g.rotation.y)), s = Math.round(Math.sin(g.rotation.y));
//         const wx = shop.x + lx * c + lz * s, wz = shop.z - lx * s + lz * c;
//         const sw = Math.abs(w * c) + Math.abs(d * s), sd = Math.abs(w * s) + Math.abs(d * c);
//         col.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2 });
//       };

//       const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 20), new THREE.MeshStandardMaterial({ map: tileTex('#d8dde6', '#c4cad6', 9, 10), roughness: 0.3 }));
//       sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true; g.add(sf);
//       add(g, pl(3.4, 19), M(shop.accent, 0.9, 0), 0, 0.05, 0, 1, 1, 1, -Math.PI / 2);

//       // দেয়াল
//       for (const s of [-1, 1]) { box(0.4, 10, 20, acc, s * 8.9, 5, 0); solid(s * 8.9, 0, 0.4, 20); }
//       box(18, 10, 0.4, dark, 0, 5, -9.9); solid(0, -9.9, 18, 0.4);
//       const slat = add(g, pl(17.4, 9.4), new THREE.MeshStandardMaterial({ map: slatTex(), roughness: 0.55 }), 0, 4.7, -9.68);
//       slat.receiveShadow = true;

//       // সামনের দিক
//       box(18, 3.4, 0.5, dark, 0, 8.3, 10);
//       for (const gx of [-5.5, 5.5]) { add(g, bx(7, 6.6, 0.1), glassM, gx, 3.3, 10); solid(gx, 9.9, 7, 0.4); }
//       for (const fx of [-2, 2, -9, 9]) box(0.3, 6.6, 0.4, metal, fx, 3.3, 10);
//       add(g, new THREE.PlaneGeometry(14, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }), 0, 8.3, 10.27);
//       const awn = box(18.4, 0.25, 2.4, acc, 0, 6.9, 11.1, false); awn.rotation.x = 0.18;
//       box(14.4, 0.1, 0.1, led, 0, 9.85, 10.3, false);
//       for (const lz of [-5, 3]) box(15, 0.12, 0.35, glowMat, 0, 9.7, lz, false);
//       for (const s of [-1, 1]) box(0.12, 0.15, 19.4, led, s * 8.5, 9.6, 0, false);

//       // শেলফ (দুই পাশ + পেছনে, ৪ থাক, নিচে LED)
//       const planks = (cx: number, cz: number, w: number, d: number, vertical: boolean) => {
//         SHELF_Y.forEach((y) => { box(w, 0.08, d, wood, cx, y, cz); box(w - 0.1, 0.03, d - 0.1, led, cx, y - 0.06, cz, false); });
//         if (vertical) { box(0.12, 5.6, d, dark, cx + (cx < 0 ? -0.6 : 0.6), 2.8, cz); box(w, 0.78, d, dark, cx, 0.39, cz); }
//         else { box(w, 5.6, 0.12, dark, cx, 2.8, cz - 0.6); box(w, 0.78, d, dark, cx, 0.39, cz); }
//       };
//       for (const s of [-1, 1]) { planks(s * 8.0, -2.45, 1.2, 12.2, true); solid(s * 8.0, -2.45, 1.3, 12.3); }
//       planks(0, -9.1, 15.8, 1.2, false); solid(0, -9.1, 15.8, 1.3);

//       // টেবিল (৮টি) — উপরে শোকেস পণ্য
//       for (const cz of TABLE_Z) for (const cx of TABLE_X) {
//         box(2.0, 1.6, 1.2, white, cx, 0.8, cz); box(2.05, 0.08, 1.25, led, cx, 1.62, cz, false); solid(cx, cz, 2.0, 1.2);
//       }

//       // পেছনের স্ক্রিন (চলমান)
//       const sc = document.createElement('canvas'); sc.width = 768; sc.height = 300;
//       const sx = sc.getContext('2d')!, stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
//       const draw = (t: number) => {
//         const gr = sx.createLinearGradient(0, 0, 768, 300); gr.addColorStop(0, hex(shop.accent)); gr.addColorStop(1, '#0b1220');
//         sx.fillStyle = gr; sx.fillRect(0, 0, 768, 300);
//         sx.fillStyle = 'rgba(255,255,255,.14)'; sx.beginPath(); sx.arc(384 + 260 * Math.sin(t * 0.8), 150, 120, 0, 7); sx.fill();
//         sx.fillStyle = '#fff'; sx.font = '900 64px Arial'; sx.textAlign = 'center'; sx.fillText(shop.name, 384, 170, 720); stex.needsUpdate = true;
//       };
//       draw(0);
//       box(9.4, 3.9, 0.2, dark, 0, 7.75, -9.55);
//       add(g, new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }), 0, 7.75, -9.43);

//       // মানুষ
//       const hs = [...shop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
//       const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: hs % 2 ? 0xb87555 : 0xe0ac8a, female: hs % 3 === 0, style: hs % 3 === 0 ? 'long' : 'short', hair: hs % 2 ? 0x17120f : 0x3b2314 });
//       cashier.group.position.set(-5.4, 0, 4.6); cashier.group.rotation.y = Math.PI; g.add(cashier.group); idlers.push({ h: cashier, base: Math.PI }); solid(-5.4, 4.6, 0.8, 0.8);
//       const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][hs % 4], skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][hs % 4], female: hs % 2 === 0, style: (['bun', 'cap', 'long', 'short'] as const)[hs % 4], glasses: hs % 5 === 0 });
//       browser.group.position.set(3.6, 0, 7.2); g.add(browser.group); idlers.push({ h: browser, base: 0 }); solid(3.6, 7.2, 0.9, 0.9);
//       box(3.6, 1.4, 1.3, dark, -5.4, 0.7, 6); box(3.6, 0.08, 1.4, wood, -5.4, 1.42, 6); solid(-5.4, 6, 3.6, 1.3);

//       // পণ্য: ৩D মডেল → মার্জ → কম ড্র-কল
//       const prodRoot = new THREE.Group(), localBoxes: { box: THREE.Box3; p: Product }[] = [];
//       shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
//         const sl = SLOTS[i], m = buildProduct(p.kind, p.color, p.image, textureLoader);
//         m.position.set(sl.x, sl.y, sl.z); m.rotation.y = sl.ry; m.scale.setScalar(sl.s); prodRoot.add(m);
//         localBoxes.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(sl.x, sl.y + 0.45 * sl.s, sl.z), new THREE.Vector3(1.05 * sl.s, 1.05 * sl.s, 1.05 * sl.s)), p });
//       });
//       bake(prodRoot).forEach((mesh) => g.add(mesh));
//       scene.add(g); g.updateMatrixWorld(true);
//       const hits = localBoxes.map((h) => ({ p: h.p, box: h.box.applyMatrix4(g.matrixWorld) }));
//       return { shop, g, col, hits, idlers, screen: draw, light: new THREE.Vector3(shop.x, 7.5, shop.z) };
//     };
//     const drop = (id: string) => { const b = built.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); built.delete(id); };

//     /* ---------- খেলোয়াড় ও পথচারী ---------- */
//     const player = new THREE.Group(); player.position.set(posRef.current.x, 0, posRef.current.z); scene.add(player);
//     const me = buildHuman({ shirt: 0x2563eb, skin: 0xc98262, style: 'short' });
//     player.add(me.group); meRef.current = me; me.setName(profileRef.current.name, profileRef.current.photo);

//     const looks: HumanOpts[] = [
//       { shirt: 0xef4444, skin: 0xb87555, female: true, style: 'long' }, { shirt: 0xf8fafc, skin: 0xe0ac8a, hair: 0x3b2314, style: 'cap' }, { shirt: 0x16a34a, skin: 0x8d5a3b, glasses: true },
//       { shirt: 0xfacc15, skin: 0xd9a07c, hair: 0x5b3a1e, female: true, style: 'bun' }, { shirt: 0x8b5cf6, skin: 0xc98262, style: 'bald' }, { shirt: 0xf97316, skin: 0xa66a47, female: true, style: 'long', hair: 0x2a1a10 },
//       { shirt: 0x0ea5e9, skin: 0xe0ac8a, hair: 0xb45309, style: 'short' }, { shirt: 0xec4899, skin: 0x8d5a3b, female: true, style: 'short', glasses: true },
//     ];
//     const walkers = looks.map((o, i) => {
//       const h = buildHuman(o); scene.add(h.group);
//       return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
//     });

//     let walk = 0, amt = 0;
//     const net = createNet(() => ({ x: player.position.x, z: player.position.z, r: player.rotation.y, w: walk, a: amt }), () => profileRef.current);
//     const avatars = new Map<string, { h: Human; key: string }>();
//     const timer = setInterval(() => {
//       const n = [...net.peers.values()].map((p) => p.name);
//       setOnline((prev) => (prev.join('|') === n.join('|') ? prev : n));
//       if (dayRef.current.auto) setHour(Math.round((((((dayRef.current.a / (Math.PI * 2)) * 24 + 6) % 24) + 24) % 24) * 10) / 10);
//     }, 1000);

//     /* ---------- ইনপুট ---------- */
//     let yaw = 0, pitch = 0.5, camDist = 11;
//     const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tmp = new THREE.Vector3();
//     let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;
//     const el = renderer.domElement;
//     const pickAt = (cx: number, cy: number) => {
//       const r = el.getBoundingClientRect();
//       ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
//       ray.setFromCamera(ptr, camera);
//       let best: { p: Product; shop: string; d: number } | null = null;
//       for (const b of built.values()) for (const h of b.hits) {
//         if (!ray.ray.intersectBox(h.box, tmp)) continue;
//         const d = tmp.distanceTo(ray.ray.origin);
//         if (d < 60 && (!best || d < best.d)) best = { p: h.p, shop: b.shop.name, d };
//       }
//       return best as { p: Product; shop: string; d: number } | null;
//     };
//     let hoverId = '', lastHover = 0;
//     const hoverCheck = (e: PointerEvent) => {
//       if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
//       const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
//       const h = pickAt(e.clientX, e.clientY), id = h ? h.p.id : '';
//       if (id !== hoverId) { hoverId = id; setHover(h ? { name: h.p.name, price: h.p.price } : null); el.style.cursor = h ? 'pointer' : 'grab'; }
//     };
//     const onDown = (e: PointerEvent) => {
//       if (down) return;
//       down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() }; sunCmdRef.current = false;
//       el.setPointerCapture(e.pointerId);
//     };
//     const onMove = (e: PointerEvent) => {
//       if (!down) { if (e.pointerType === 'mouse') hoverCheck(e); return; }
//       if (e.pointerId !== down.id) return;
//       const dx = e.clientX - down.x, dy = e.clientY - down.y;
//       down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
//       yaw -= dx * 0.005; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.7, 1.15);
//     };
//     const onUp = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       if (down.moved < 8 && performance.now() - down.t < 500) { const h = pickAt(e.clientX, e.clientY); if (h) { setQty(1); setSelected({ ...h.p, shop: h.shop }); } }
//       down = null;
//     };
//     const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
//     el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
//     el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: true });

//     const setKey = (e: KeyboardEvent, v: boolean) => {
//       const tg = (e.target as HTMLElement)?.tagName; if (tg === 'INPUT' || tg === 'SELECT') return;
//       const k = keysRef.current, key = e.key.toLowerCase();
//       if (key === 'w' || key === 'arrowup') k.f = v; if (key === 's' || key === 'arrowdown') k.b = v;
//       if (key === 'a' || key === 'arrowleft') k.l = v; if (key === 'd' || key === 'arrowright') k.r = v;
//       if (key === 'shift') k.s = v;
//       if (v && key === 'q') yaw += 0.15; if (v && key === 'e') yaw -= 0.15;
//     };
//     const kd = (e: KeyboardEvent) => {
//       setKey(e, true);
//       const tg = (e.target as HTMLElement)?.tagName;
//       if (e.key.toLowerCase() === 'f' && !e.repeat && tg !== 'INPUT' && tg !== 'SELECT') rideCmdRef.current = 1;
//     };
//     const ku = (e: KeyboardEvent) => setKey(e, false);
//     window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

//     const resize = () => {
//       const w = container.clientWidth || 1, h = container.clientHeight || 1;
//       camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
//     };
//     resize();
//     const ro = new ResizeObserver(resize); ro.observe(container);

//     /* ---------- মোটরসাইকেল ও দোকান-প্রবেশ ---------- */
//     const moto = buildMoto(); moto.g.position.set(10, 0, 30); scene.add(moto.g);
//     let riding = false, vel = 0, dirX = 0, dirZ = -1, nearLast = false, curShop = '';
//     const inShop = (x: number, z: number) => {
//       for (const b of built.values()) if (Math.abs(x - b.shop.x) < 10 && Math.abs(z - b.shop.z) < 9.5) return b.shop;
//       return null;
//     };
//     const toggleRide = () => {
//       if (riding) {
//         riding = false; me.setRide(false); me.group.scale.setScalar(1); me.group.position.set(0, 0, 0);
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = a;
//         player.position.x += Math.cos(a) * 1.8; player.position.z -= Math.sin(a) * 1.8;
//         setRiding(false); setMessage('🚶 বাইক থেকে নামলেন।'); return;
//       }
//       if (inShop(player.position.x, player.position.z)) { setMessage('🏪 দোকানের ভেতরে বাইক চলে না — বাইরে এসে F চাপুন।'); return; }
//       const d = Math.hypot(moto.g.position.x - player.position.x, moto.g.position.z - player.position.z);
//       if (d > 6) {
//         const a = player.rotation.y;
//         moto.g.position.set(player.position.x - Math.cos(a) * 3, 0, player.position.z + Math.sin(a) * 3); moto.g.rotation.y = a;
//         setMessage('🏍️ বাইক আপনার পাশে এসেছে — আবার F চাপুন।'); return;
//       }
//       riding = true; me.setRide(true); me.group.scale.setScalar(0.62); me.group.position.set(0, 0.37, 0.15);
//       player.position.set(moto.g.position.x, 0, moto.g.position.z); player.rotation.y = moto.g.rotation.y;
//       vel = 0; camDist = Math.max(camDist, 14);
//       setRiding(true); setMessage('🏍️ বাইকে উঠেছেন! W A S D = চালান, Shift = টার্বো');
//     };

//     /* ---------- মূল লুপ ---------- */
//     const R = 0.5;
//     const blocked = (x: number, z: number) => {
//       const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
//       if (shellCol.some(hit)) return true;
//       if (z > 55 && outdoors.col.some(hit)) return true;   // শহরের ভবন
//       if (riding && inShop(x, z)) return true;             // বাইক নিয়ে দোকানে ঢোকা যাবে না
//       for (const b of built.values()) if (Math.abs(b.shop.z - z) < 14 && b.col.some(hit)) return true;
//       return false;
//     };
//     const clock = new THREE.Clock(), camTarget = new THREE.Vector3(), sunDir = new THREE.Vector3(), moon = new THREE.Vector3();
//     let raf = 0, lastList: Shop[] | null = null, frame = 0, firstCam = true;
//     mkShell(needBack());

//     const animate = () => {
//       raf = requestAnimationFrame(animate);
//       const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
//       const px = player.position.x, pz = player.position.z;

//       /* দিন-রাত */
//       const D = dayRef.current; if (D.auto && !pausedRef.current) D.a += dt * 0.02;
//       const ca = Math.cos(D.a);
//       sunDir.set(ca * 0.5, Math.sin(D.a), -0.85 * ca).normalize();
//       const elv = sunDir.y, dayF = sm(-0.08, 0.3, elv), dusk = (1 - sm(0, 0.4, elv)) * sm(-0.15, 0.05, elv);
//       const zen = mix3(mix3(NZ, DZ, dayF), SZ, dusk * 0.6), hor = mix3(mix3(NH, DH, dayF), SH, dusk * 0.85);
//       const sunC = mix3([1, 0.55, 0.25], [1, 0.96, 0.86], sm(0.05, 0.5, elv));
//       skyU.zenith.value.set(zen[0], zen[1], zen[2]); skyU.horizon.value.set(hor[0], hor[1], hor[2]);
//       skyU.sunDir.value.copy(sunDir); skyU.sunCol.value.set(sunC[0], sunC[1], sunC[2]); skyU.night.value = 1 - dayF;
//       sky.position.copy(camera.position);
//       (scene.fog as THREE.Fog).color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
//       hemi.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); hemi.intensity = 0.25 + 1.45 * dayF;
//       const L = elv > 0 ? sunDir : moon.copy(sunDir).negate();
//       sun.position.set(px + L.x * 90, Math.max(8, L.y * 90), pz + L.z * 90); sun.target.position.set(px, 0, pz);
//       sun.intensity = 1.9 * sm(0, 0.4, elv) + 0.35 * sm(0, 0.3, -elv);
//       if (elv > 0) sun.color.setRGB(sunC[0], sunC[1], sunC[2], THREE.SRGBColorSpace); else sun.color.setRGB(0.55, 0.65, 1, THREE.SRGBColorSpace);
//       const cloudRGB = mix3(mix3([0.25, 0.28, 0.4], [1, 1, 1], dayF), [1, 0.7, 0.55], dusk * 0.6);

//       /* দোকান স্ট্রিমিং */
//       if (lastList !== shopsRef.current) {
//         lastList = shopsRef.current;
//         const map = new Map(lastList.map((s) => [s.id, s]));
//         [...built.keys()].forEach((id) => { const s = map.get(id); if (!s || s !== built.get(id)!.shop) drop(id); });
//         const nb = needBack(); if (nb !== shellBack) mkShell(nb);
//       }
//       let nearest: Shop | null = null, nd = Infinity;
//       const far = Math.abs(px) > 90; // মল থেকে অনেক দূরে গেলে দোকান বানানো বন্ধ
//       for (const s of lastList) {
//         const dz = s.z - pz, b = built.get(s.id);
//         if (b) { if (far || dz < -105 || dz > 70) drop(s.id); continue; }
//         if (!far && dz > -80 && dz < 45 && Math.abs(dz) < nd) { nd = Math.abs(dz); nearest = s; }
//       }
//       if (nearest && (frame % 2 === 0 || built.size < 3)) built.set((nearest as Shop).id, buildShop(nearest as Shop));

//       /* পয়েন্ট লাইট পুল */
//       const near = [...built.values()].sort((a, b) => Math.abs(a.shop.z - pz) - Math.abs(b.shop.z - pz)).slice(0, 4);
//       pool.forEach((l, i) => { const b = near[i]; if (b) { l.position.copy(b.light); l.intensity = 40 * (0.5 + 0.9 * (1 - dayF)); } else l.intensity = 0; });

//       if (tpRef.current) { player.position.set(tpRef.current.x, 0, tpRef.current.z); tpRef.current = null; firstCam = true; }

//       if (!pausedRef.current) {
//         const k = keysRef.current, j = joyRef.current;
//         let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x, iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
//         const len = Math.hypot(ix, iz);
//         if (len > 1) { ix /= len; iz /= len; }

//         const on = len > 0.08, inMall = player.position.z < 24 && Math.abs(player.position.x) < 28;
//         const top = riding ? (k.s ? 30 : 20) * (inMall ? 0.5 : 1) : (k.s ? 15 : 7.5);
//         vel += ((on ? top * Math.min(1, len) : 0) - vel) * Math.min(1, dt * (riding ? 2.2 : 30));
//         if (on) {
//           const sin = Math.sin(yaw), cos = Math.cos(yaw);
//           const mx = -sin * iz + cos * ix, mz = -cos * iz - sin * ix, n = Math.hypot(mx, mz) || 1;
//           dirX = mx / n; dirZ = mz / n;
//           let diff = Math.atan2(-dirX, -dirZ) - player.rotation.y;
//           diff = Math.atan2(Math.sin(diff), Math.cos(diff));
//           player.rotation.y += diff * Math.min(1, dt * (riding ? 4 : 12));
//         }
//         if (riding) { dirX = -Math.sin(player.rotation.y); dirZ = -Math.cos(player.rotation.y); }
//         if (vel > 0.05) {
//           const spd = vel * dt;
//           const nx = THREE.MathUtils.clamp(player.position.x + dirX * spd, -330, 330);
//           const okX = !blocked(nx, player.position.z); if (okX) player.position.x = nx;
//           const nz = THREE.MathUtils.clamp(player.position.z + dirZ * spd, shellBack - 80, 150);
//           const okZ = !blocked(player.position.x, nz); if (okZ) player.position.z = nz;
//           if (riding && (!okX || !okZ)) vel *= 0.6;
//         } else if (!on) vel = 0;
//         if (!riding) {
//           if (on) { walk += dt * (k.s ? 13 : 9); amt = Math.min(1, amt + dt * 6); } else amt = Math.max(0, amt - dt * 6);
//         } else {
//           amt = 0; const spin = (vel * dt) / 0.63; moto.wf.rotation.x -= spin; moto.wr.rotation.x -= spin;
//         }
//         me.update(walk, amt, t);
//         posRef.current = { x: player.position.x, z: player.position.z };
//         if (riding) { moto.g.position.set(player.position.x, 0, player.position.z); moto.g.rotation.y = player.rotation.y; }

//         walkers.forEach((n) => {
//           if (Math.abs(n.z - pz) > 75) n.z = THREE.MathUtils.clamp(pz - 60 + Math.random() * 100, shellBack + 6, 26);
//           const nr = Math.hypot(n.x - px, n.z - pz) < 2.4;
//           n.amt += ((nr ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
//           if (!nr) { n.z += n.dir * n.sp * dt; n.ph += dt * n.sp * 3.2; if (n.z < shellBack + 6) n.dir = 1; if (n.z > 26) n.dir = -1; }
//           n.h.group.position.set(n.x, 0, n.z); n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI; n.h.update(n.ph, n.amt, t);
//         });
//         for (const b of built.values()) {
//           if (Math.abs(b.shop.z - pz) > 45) continue;
//           b.idlers.forEach((i) => { i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * 0.2; i.h.update(0, 0, t); });
//           if (frame % 3 === 0 && Math.abs(b.shop.z - pz) < 38) b.screen(t);
//         }
//         updateOutdoors(t, dt, dayF, cloudRGB);
//       }

//       /* বাইকের হেডলাইট, কাছাকাছি বাইক, দোকানে প্রবেশের বার্তা, F কমান্ড */
//       moto.lamp.intensity = riding ? 250 * (1 - dayF) : 0;
//       if (frame % 10 === 0) {
//         const nb = !riding && Math.hypot(moto.g.position.x - px, moto.g.position.z - pz) < 6;
//         if (nb !== nearLast) { nearLast = nb; setNearBike(nb); }
//         const sh = inShop(player.position.x, player.position.z), sid2 = sh ? sh.id : '';
//         if (sid2 !== curShop) { curShop = sid2; if (sh) setMessage(`🏪 ${sh.name} এ প্রবেশ করেছেন`); }
//       }
//       if (rideCmdRef.current) { rideCmdRef.current = 0; toggleRide(); }

//       /* অন্য মানুষ */
//       net.tick(performance.now());
//       net.peers.forEach((p) => {
//         let a = avatars.get(p.id);
//         if (!a) {
//           const c = [...p.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
//           const h = buildHuman({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4][c % 5], female: c % 2 === 0, style: c % 2 ? 'short' : 'long' });
//           h.group.position.set(p.x, 0, p.z); scene.add(h.group); a = { h, key: '' }; avatars.set(p.id, a);
//         }
//         const key = p.name + p.photo.length;
//         if (a.key !== key) { a.h.setName(p.name, p.photo); a.key = key; }
//         a.h.group.position.x += (p.x - a.h.group.position.x) * 0.25; a.h.group.position.z += (p.z - a.h.group.position.z) * 0.25;
//         a.h.group.rotation.y = p.r; a.h.update(p.w, p.a, t);
//       });
//       avatars.forEach((a, id) => { if (!net.peers.has(id)) { scene.remove(a.h.group); disposeTree(a.h.group); avatars.delete(id); } });

//       /* "সূর্য দেখুন" বাটন: ক্যামেরা সূর্যের দিকে ঘোরে */
//       if (sunCmdRef.current) {
//         const ty = Math.atan2(-sunDir.x, -sunDir.z), tp = THREE.MathUtils.clamp(-0.2 - Math.max(0, elv) * 0.55, -0.7, 0.2);
//         let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
//         yaw += dy * 0.08; pitch += (tp - pitch) * 0.08;
//         if (Math.abs(dy) < 0.02 && Math.abs(tp - pitch) < 0.02) sunCmdRef.current = false;
//       }

//       const up = Math.max(0, -pitch), h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
//       camTarget.set(player.position.x + Math.sin(yaw) * d, Math.max(0.6, 2 + h), player.position.z + Math.cos(yaw) * d);
//       if (firstCam) { camera.position.copy(camTarget); firstCam = false; } else camera.position.lerp(camTarget, 0.12);
//       camera.lookAt(player.position.x, 2.4 + up * 14, player.position.z);
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       cancelAnimationFrame(raf); clearInterval(timer); net.close(); meRef.current = null; ro.disconnect();
//       window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
//       el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
//       el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
//       built.forEach((b) => disposeTree(b.g)); built.clear();
//       disposeTree(scene);
//       renderer.dispose();
//       if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
//     };
//   }, [loaded]);

//   /* ============================ অ্যাকশন ============================ */
//   const addSelected = () => {
//     if (!selected) return;
//     setCart((prev) => {
//       const old = prev.find((i) => i.id === selected.id);
//       if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + qty } : i));
//       return [...prev, { ...selected, count: qty }];
//     });
//     setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`); setSelected(null);
//   };
//   const changeQty = (id: string, d: number) => setCart((p) => p.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));
//   const checkout = () => {
//     if (!cart.length) return setMessage('🛒 কার্ট খালি।');
//     if (balance < total) return setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`);
//     setBalance((b) => b - total); setScore((s) => s + cartCount * 100); setCart([]); setMessage(`🎉 ${taka(total)} পেমেন্ট সফল!`);
//   };

//   const shop = shops.find((s) => s.id === sid);
//   const patchShop = (id: string, f: (s: Shop) => Shop) => setShops(shops.map((s) => (s.id === id ? f(s) : s)));
//   const addShop = () => {
//     if (shops.length >= MAX_SHOPS) return setMessage(`❌ সর্বোচ্চ ${MAX_SHOPS}টি দোকান`);
//     const slot = nextSlots(shops, 1)[0];
//     if (!slot) return setMessage('❌ আর খালি জায়গা নেই');
//     if (!ns.name.trim()) return setMessage('✏️ দোকানের নাম দিন');
//     const id = 's' + Date.now().toString(36);
//     setShops([...shops, { id, name: ns.name.trim().toUpperCase().slice(0, 18), subtitle: ns.subtitle.trim() || 'New Store', ...slot, accent: parseInt(ns.accent.slice(1), 16), style: ns.style, products: [] }]);
//     setSid(id); setNs({ ...ns, name: '', subtitle: '' }); setMessage('🏪 নতুন দোকান তৈরি হয়েছে!');
//   };
//   const addProduct = () => {
//     if (!shop) return;
//     const price = Number(np.price);
//     if (!np.name.trim() || !(price > 0)) return setMessage('✏️ পণ্যের নাম ও সঠিক দাম দিন');
//     if (shop.products.length >= MAX_PRODUCTS) return setMessage(`❌ একটি দোকানে সর্বোচ্চ ${MAX_PRODUCTS}টি পণ্য`);
//     const color = parseInt(np.color.slice(1), 16);
//     patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: 'p' + Date.now().toString(36), name: np.name.trim(), price, image: np.image || ph(np.kind, color), kind: np.kind, color }] }));
//     setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
//   };
//   const addDemo = () => {
//     const need = Math.min(100, MAX_SHOPS) - shops.length;
//     const slots = nextSlots(shops, Math.max(0, need));
//     const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
//     const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + '_x')] } : s));
//     setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
//   };
//   const teleport = (s: Shop) => { tpRef.current = { x: 0, z: s.z }; setPanel(''); setMessage(`📍 ${s.name} এর সামনে এসেছেন`); };

//   const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
//     const r = e.currentTarget.getBoundingClientRect(), max = r.width / 2 - 24;
//     let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
//     const l = Math.hypot(dx, dy);
//     if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
//     joyRef.current = { x: dx / max, y: dy / max }; setKnob({ x: dx, y: dy });
//   };
//   const joyStart = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); joyMove(e); };
//   const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

//   const filtered = shops.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()));
//   const isNight = hour < 5.5 || hour >= 18.5;

//   /* ============================ UI ============================ */
//   return (
//     <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
//       <div ref={containerRef} className="absolute inset-0" />

//       {hover && !selected && (
//         <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs md:block">
//           <div className="font-bold">{hover.name}</div><div className="font-black text-yellow-300">{taka(hover.price)}</div>
//         </div>
//       )}
//       {!hover && <div ref={tipRef} className="hidden" />}

//       <header className="pointer-events-none absolute inset-x-2 top-2 z-20 flex items-start justify-between gap-2">
//         <div className={`pointer-events-auto rounded-2xl px-3 py-2 ${glass}`}><div className="text-sm font-black md:text-lg">GRAND SHOPPING CITY</div></div>
//         <div className="pointer-events-auto flex gap-1.5">
//           <div className={`rounded-2xl px-3 py-2 text-right ${glass}`}><div className="text-[9px] text-slate-400">BALANCE</div><div className="text-sm font-black text-yellow-300">{taka(balance)}</div></div>
//           <div className={`hidden rounded-2xl px-3 py-2 text-right sm:block ${glass}`}><div className="text-[9px] text-slate-400">SCORE</div><div className="text-sm font-black text-emerald-300">{score}</div></div>
//           <button onClick={() => setPanel(panel === 'profile' ? '' : 'profile')} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Profile">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-7 w-7 rounded-full object-cover" /> : '👤'}
//           </button>
//           <button onClick={() => setPanel(panel === 'shops' ? '' : 'shops')} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Shops">🏪</button>
//           <button onClick={() => setCartOpen((v) => !v)} className={`relative rounded-2xl px-3 text-lg ${glass}`} aria-label="Cart">
//             🛒{cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-slate-950">{cartCount}</span>}
//           </button>
//           <button onClick={() => setPaused((v) => !v)} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Pause">{paused ? '▶️' : '⏸️'}</button>
//         </div>
//       </header>

//       <aside className={`absolute left-2 top-[64px] z-20 w-[min(340px,calc(100vw-16px))] rounded-2xl p-3 ${glass} pointer-events-none`}>
//         <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Mall Assistant</div>
//         <p className="text-xs leading-5 text-slate-200">{message}</p>
//         <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-emerald-300">🟢 অনলাইন: {profile.name}{online.length ? ', ' + online.join(', ') : ''} • 🏪 {shops.length} দোকান</div>
//         <div className="pointer-events-auto mt-2 flex items-center gap-2 border-t border-white/10 pt-2 text-[11px]">
//           <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { dayRef.current.auto = !autoDay; setAutoDay(!autoDay); }}>{autoDay ? '⏸' : '▶'}</button>
//           <span className="w-14 shrink-0">{isNight ? '🌙' : '☀️'} {fmtHour(hour)}</span>
//           <input type="range" min={0} max={24} step={0.25} value={hour} className="min-w-0 flex-1"
//             onChange={(e) => { const v = Number(e.target.value); setHour(v); dayRef.current.a = ((v - 6) / 24) * Math.PI * 2; }} />
//           <button className="rounded-lg bg-amber-400/90 px-2 py-1 text-slate-950" onClick={() => { sunCmdRef.current = true; }} aria-label="Look at sun">{isNight ? '🌙' : '☀️'} দেখুন</button>
//         </div>
//       </aside>

//       {selected && (
//         <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSelected(null)}>
//           <div className={`w-full max-w-md overflow-hidden rounded-3xl ${glass}`} onClick={(e) => e.stopPropagation()}>
//             <div className="relative">
//               <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover md:h-80"
//                 onError={(e) => { (e.target as HTMLImageElement).src = ph(selected.kind, selected.color); }} />
//               <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">{selected.shop}</span>
//               <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs" aria-label="Close">✕</button>
//             </div>
//             <div className="p-4">
//               <div className="text-xl font-black">{selected.name}</div>
//               <div className="mt-1 text-2xl font-black text-yellow-300">{taka(selected.price * qty)}</div>
//               <div className="mt-3 flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
//                   <b className="w-6 text-center">{qty}</b>
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(qty + 1)}>+</button>
//                 </div>
//                 <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950 hover:bg-cyan-400 active:scale-95">🛒 কার্টে নিন</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {panel === 'profile' && (
//         <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
//           <div className="flex items-center justify-between"><b>👤 আমার প্রোফাইল</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 flex items-center gap-3">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">👤</div>}
//             <label className={`${btn} cursor-pointer`}>ছবি বাছাই করুন
//               <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProfile({ ...profile, photo: await fileToDataUrl(f, 160) }); }} />
//             </label>
//           </div>
//           <input className={`${inp} mt-3`} maxLength={16} placeholder="আপনার নাম" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
//           <p className="mt-2 text-[11px] text-slate-400">নাম ও ছবি আপনার কার্টুনের বুকে ও মাথার উপরে দেখা যাবে। আরেকটা ট্যাবে মল খুললে সেখানেও আপনাকে দেখা যাবে।</p>
//         </div>
//       )}

//       {panel === 'shops' && (
//         <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:top-24 md:w-[400px] ${glass}`}>
//           <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
//           <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
//           <div className="mt-2 flex gap-2">
//             <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
//               {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
//             </select>
//             {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
//           </div>
//           {shop && (<>
//             <div className="mt-2 flex gap-2">
//               <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
//               <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
//             </div>
//             <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
//             <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
//               {shop.products.map((p) => (
//                 <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
//                   <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: hex(p.color) + '55' }}>{KIND_EMOJI[p.kind] ?? '🛍️'}</span>
//                   <span className="min-w-0 flex-1 truncate">{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
//                   <button className="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-300" onClick={() => patchShop(shop.id, (s) => ({ ...s, products: s.products.filter((x) => x.id !== p.id) }))}>✕</button>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-2">
//               <input className={inp} placeholder="পণ্যের নাম" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
//               <div className="flex gap-2">
//                 <select className={inp} value={np.kind} onChange={(e) => setNp({ ...np, kind: e.target.value })}>
//                   {KINDS.map(([v, l, em]) => <option key={v} value={v} className="text-black">{em} {l}</option>)}
//                 </select>
//                 <input type="color" value={np.color} onChange={(e) => setNp({ ...np, color: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//               </div>
//               <div className="flex gap-2">
//                 <input className={inp} type="number" min={1} placeholder="দাম (৳)" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} />
//                 <label className={`${btn} flex cursor-pointer items-center whitespace-nowrap`}>{np.image ? '🖼️ ছবি ✓' : '🖼️ ছবি'}
//                   <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setNp({ ...np, image: await fileToDataUrl(f, 640) }); }} />
//                 </label>
//               </div>
//               <p className="text-[10px] text-slate-400">৩D আকার = ধরন + রঙ। ছবি দিলে পণ্যের বিস্তারিত ভিউয়ে দেখা যাবে; "ছবির ফ্রেম" ধরন বাছলে ছবিটা ৩D ফ্রেমেও দেখা যাবে।</p>
//               <button className={`${btn} w-full`} onClick={addProduct}>➕ পণ্য যোগ করুন</button>
//             </div>
//             <button className="mt-2 w-full rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300"
//               onClick={() => { if (confirm(`"${shop.name}" মুছে ফেলবেন?`)) { const rest = shops.filter((s) => s.id !== shop.id); setShops(rest); setSid(rest[0]?.id ?? ''); } }}>🗑️ এই দোকান মুছুন</button>
//           </>)}
//           <div className="mt-4 text-[11px] font-bold text-cyan-300">নতুন দোকান খুলুন</div>
//           <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
//             <input className={inp} placeholder="দোকানের নাম" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
//             <input className={inp} placeholder="ট্যাগলাইন" value={ns.subtitle} onChange={(e) => setNs({ ...ns, subtitle: e.target.value })} />
//             <div className="flex gap-2">
//               <select className={inp} value={ns.style} onChange={(e) => setNs({ ...ns, style: e.target.value })}>
//                 {[['fashion', 'ফ্যাশন'], ['tech', 'ইলেকট্রনিক্স'], ['home', 'ফার্নিচার'], ['market', 'গ্রোসারি']].map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
//               </select>
//               <input type="color" value={ns.accent} onChange={(e) => setNs({ ...ns, accent: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//             </div>
//             <button className={`${btn} w-full`} onClick={addShop}>🏪 দোকান তৈরি করুন</button>
//           </div>
//         </div>
//       )}

//       {cartOpen && (
//         <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:w-80 md:rounded-3xl ${glass}`}>
//           <div className="flex items-center justify-between"><h2 className="font-black">🛒 MY CART</h2><button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 space-y-2">
//             {cart.length === 0 ? <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div> : cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
//                 <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(item.kind, item.color); }} />
//                 <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{taka(item.price)}</div></div>
//                 <div className="flex items-center gap-1 text-xs">
//                   <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button><b className="w-5 text-center">{item.count}</b>
//                   <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm"><span className="text-slate-400">Total</span><b className="text-yellow-300">{taka(total)}</b></div>
//           <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">✅ Checkout</button>
//         </aside>
//       )}

//       {touch && !selected && !cartOpen && !panel && (
//         <div className="absolute bottom-6 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
//           onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
//           <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-cyan-400/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
//         </div>
//       )}
//       {!touch && !selected && !panel && (
//         <div className={`absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl px-5 py-3 text-xs text-slate-300 md:block ${glass}`}>
//           <b className="text-cyan-300">W A S D</b> হাঁটা • <b className="text-cyan-300">Shift</b> দৌড় • <b className="text-cyan-300">মাউস ড্র্যাগ / Q E</b> ঘোরা (উপরে টানলে আকাশ) • <b className="text-cyan-300">স্ক্রল</b> জুম • <b className="text-cyan-300">ক্লিক</b> পণ্য দেখুন • <b className="text-cyan-300">F</b> বাইকে চড়া/নামা
//         </div>
//       )}

//       {!selected && !panel && !cartOpen && (
//         <button onClick={() => { rideCmdRef.current = 1; }} className={`absolute bottom-6 right-5 z-30 rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
//           {riding ? '🛑 নামুন (F)' : nearBike ? '🏍️ চড়ুন (F)' : '🏍️ বাইক ডাকুন (F)'}
//         </button>
//       )}

//       {paused && (
//         <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
//           <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
//         </div>
//       )}
//     </main>
//   );
// }

// 'use client';
// // ব্যবহার: আপনার আগের পুরো কোডটা `mall-original.tsx` নামে সেভ করুন (কিছু বদলাতে হবে না)। এই ফাইলটা `page.tsx`।
// import React, { useEffect, useRef, useState } from 'react';
// import Original from './mall-original';
// import { useDaily, TasksPanel, OfficePanel } from './mall-extras';

// const LS_ORIG = 'grand-mall-ls-v2', LS_X = 'grand-mall-extra-v1';
// const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';

// export default function Page() {
//   const [panel, setPanel] = useState<'' | 'tasks' | 'office'>('');
//   const [x, setX] = useState({ taskPts: 0, withdrawn: 0, bank: 0 }); // টাস্কের পয়েন্ট, তোলা পয়েন্ট, ব্যাংক ব্যালেন্স
//   const [orig, setOrig] = useState({ score: 0 });
//   const ready = useRef(false);
//   const prev = useRef<{ cart: number; balance: number } | null>(null);
//   const daily = useDaily((p) => setX((v) => ({ ...v, taskPts: v.taskPts + p })));
//   const dRef = useRef(daily); dRef.current = daily;

//   useEffect(() => { try { const s = JSON.parse(localStorage.getItem(LS_X) || 'null'); if (s) setX(s); } catch { /* ignore */ } ready.current = true; }, []);
//   useEffect(() => { if (ready.current) try { localStorage.setItem(LS_X, JSON.stringify(x)); } catch { /* ignore */ } }, [x]);

//   // মূল গেমের সেভ করা ডেটা দেখে কার্ট/কেনার টাস্ক গোনা
//   useEffect(() => {
//     const t = setInterval(() => {
//       try {
//         const s = JSON.parse(localStorage.getItem(LS_ORIG) || 'null'); if (!s) return;
//         const cart = (s.cart || []).reduce((a: number, i: { count: number }) => a + i.count, 0), balance = Number(s.balance) || 0;
//         setOrig((o) => (o.score === s.score ? o : { score: Number(s.score) || 0 }));
//         const p = prev.current;
//         if (p) { if (cart > p.cart) dRef.current.bump('cart', cart - p.cart); if (balance < p.balance) dRef.current.bump('buy'); }
//         prev.current = { cart, balance };
//       } catch { /* ignore */ }
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   const points = Math.max(0, orig.score + x.taskPts - x.withdrawn);
//   return (
//     <>
//       <Original />
//       <div className="pointer-events-none fixed inset-0 z-[45] text-white">
//         <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col gap-2">
//           <button onClick={() => setPanel(panel === 'tasks' ? '' : 'tasks')} className={`rounded-2xl px-3 py-2 text-lg ${glass}`} aria-label="Tasks">📅</button>
//           <button onClick={() => setPanel(panel === 'office' ? '' : 'office')} className={`rounded-2xl px-3 py-2 text-lg ${glass}`} aria-label="Office">🏢</button>
//         </div>
//         <div className="pointer-events-auto">
//           {panel === 'tasks' && <TasksPanel api={daily} only={['cart', 'buy', 'office']} onClose={() => setPanel('')} />}
//           {panel === 'office' && <OfficePanel score={points} balance={x.bank} onVisit={() => daily.bump('office')} onClose={() => setPanel('')}
//             onWithdraw={(n) => setX((v) => ({ ...v, withdrawn: v.withdrawn + n, bank: v.bank + Math.floor(n / 10) }))} />}
//         </div>
//       </div>
//     </>
//   );
// }// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// // দরকার: three r151+ (mergeGeometries)। পুরনো ভার্সনে এটা mergeBufferGeometries নামে ছিল।
// import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// /* ============================ টাইপ ও ধ্রুবক ============================ */
// type Product = { id: string; name: string; price: number; image: string; kind: string; color: number };
// type Sel = Product & { shop: string };
// type CartItem = Sel & { count: number };
// type Shop = { id: string; name: string; subtitle: string; x: number; z: number; accent: number; style: string; products: Product[] };
// type Profile = { name: string; photo: string };
// type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
// type Slot = { x: number; y: number; z: number; ry: number; s: number };

// const MAX_SHOPS = 120;
// const LS_KEY = 'grand-mall-ls-v2';

// const KINDS: [string, string, string][] = [
//   ['tshirt', 'টি-শার্ট', '👕'], ['jacket', 'জ্যাকেট', '🧥'], ['sneaker', 'জুতা', '👟'], ['glasses', 'সানগ্লাস', '🕶️'],
//   ['bag', 'ব্যাগ', '👜'], ['watch', 'ঘড়ি', '⌚'], ['phone', 'ফোন', '📱'], ['camera', 'ক্যামেরা', '📷'],
//   ['headphone', 'হেডফোন', '🎧'], ['chair', 'চেয়ার', '🪑'], ['lamp', 'ল্যাম্প', '💡'], ['plant', 'গাছ', '🪴'],
//   ['book', 'বই', '📚'], ['jar', 'মধু/জার', '🍯'], ['chocolate', 'চকলেট', '🍫'], ['sack', 'চালের বস্তা', '🌾'],
//   ['coffee', 'কফি', '☕'], ['bottle', 'বোতল', '🧴'], ['box', 'গিফট বক্স', '🎁'], ['frame', 'ছবির ফ্রেম', '🖼️'],
// ];
// const KIND_EMOJI: Record<string, string> = Object.fromEntries(KINDS.map(([k, , e]) => [k, e]));

// /* শেলফ ও টেবিলের স্লট — একটি দোকানে সর্বোচ্চ MAX_PRODUCTS টি পণ্য */
// const SHELF_Y = [0.8, 2.0, 3.2, 4.4];
// const TABLE_X = [-5.3, -1.8, 1.8, 5.3], TABLE_Z = [-3.5, 2.2];
// const SLOTS: Slot[] = (() => {
//   const a: Slot[] = [];
//   TABLE_Z.forEach((z) => TABLE_X.forEach((x) => a.push({ x, y: 1.66, z, ry: 0, s: 1.35 })));
//   for (const ti of [1, 2, 0, 3]) {
//     const y = SHELF_Y[ti] + 0.04;
//     for (let i = 0; i < 12; i++) {
//       const z = -7.9 + i;
//       a.push({ x: -8, y, z, ry: Math.PI / 2, s: 1 }, { x: 8, y, z, ry: -Math.PI / 2, s: 1 });
//     }
//     for (let i = 0; i < 13; i++) a.push({ x: -7.2 + i * 1.2, y, z: -9.1, ry: 0, s: 1 });
//   }
//   return a;
// })();
// const MAX_PRODUCTS = SLOTS.length;

// const shopSlot = (k: number) => ({ x: k % 2 ? 17 : -17, z: -14 - Math.floor(k / 2) * 19 });
// const nextSlots = (shops: Shop[], n: number) => {
//   const used = new Set(shops.map((s) => `${s.x},${s.z}`));
//   const out: { x: number; z: number }[] = [];
//   for (let k = 0; k < MAX_SHOPS && out.length < n; k++) { const p = shopSlot(k); if (!used.has(`${p.x},${p.z}`)) out.push(p); }
//   return out;
// };

// /* ============================ ডেমো ডেটা জেনারেটর ============================ */
// const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
// const taka = (n: number) => '৳' + n.toLocaleString();
// const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
// const ph = (kind: string, c = 0x334155) =>
//   'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500"><rect width="600" height="500" fill="${hex(c)}"/><text x="300" y="320" font-size="190" text-anchor="middle">${KIND_EMOJI[kind] ?? '🛍️'}</text></svg>`);
// const IMG: Record<string, string> = {
//   tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
//   sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
//   headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
//   lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
//   sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
// };
// const STYLE_KINDS: Record<string, string[]> = {
//   fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
//   tech: ['phone', 'watch', 'camera', 'headphone'],
//   home: ['chair', 'lamp', 'plant', 'book', 'jar'],
//   market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
// };
// const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
// const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };
// const ADJ = ['Classic', 'Premium', 'Urban', 'Royal', 'Eco', 'Ultra', 'Smart', 'Modern', 'Elite', 'Fresh'];
// const PAL = [0xef4444, 0x2563eb, 0x16a34a, 0xf59e0b, 0x7c3aed, 0xec4899, 0x0ea5e9, 0x14b8a6, 0xf97316, 0x64748b, 0x1e293b, 0xf1f5f9];
// const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// const genProducts = (style: string, n: number, seed: number, pre: string): Product[] => {
//   const r = rng(seed), kinds = STYLE_KINDS[style] ?? STYLE_KINDS.market;
//   return Array.from({ length: Math.min(n, MAX_PRODUCTS) }, (_, i) => {
//     const kind = kinds[i % kinds.length], color = PAL[Math.floor(r() * PAL.length)];
//     const price = Math.round((BASEP[kind] * (0.6 + r() * 1.2)) / 10) * 10;
//     return { id: `${pre}${i}`, name: `${ADJ[Math.floor(r() * ADJ.length)]} ${BASE[kind]} ${i + 1}`, price, image: IMG[kind] ?? ph(kind, color), kind, color };
//   });
// };
// const SHOP_A = ['NOVA', 'ZEN', 'ROYAL', 'URBAN', 'PRIME', 'LUXE', 'SKY', 'METRO', 'ALPHA', 'BLUE', 'GOLDEN', 'SMART', 'FRESH', 'MEGA', 'ELITE'];
// const SHOP_B: Record<string, string> = { fashion: 'FASHION', tech: 'TECH', home: 'HOME', market: 'MART' };
// const SHOP_SUB: Record<string, string> = { fashion: 'Premium Fashion', tech: 'Smart Devices', home: 'Furniture & Decor', market: 'Grocery & Food' };
// const genShop = (i: number, slot: { x: number; z: number }, nProducts: number): Shop => {
//   const style = Object.keys(STYLE_KINDS)[i % 4], r = rng(i * 977 + 13);
//   return { id: `d${i}-${Date.now().toString(36)}`, name: `${SHOP_A[Math.floor(r() * SHOP_A.length)]} ${SHOP_B[style]} ${i + 1}`, subtitle: SHOP_SUB[style], ...slot, accent: PAL[(i * 5 + 1) % (PAL.length - 1)], style, products: genProducts(style, nProducts, i * 31 + 7, `d${i}p`) };
// };
// const defaultShops = (): Shop[] => {
//   const mk = (id: string, name: string, subtitle: string, k: number, accent: number, style: string, first: Product[]): Shop =>
//     ({ id, name, subtitle, ...shopSlot(k), accent, style, products: [...first, ...genProducts(style, 36, k * 11 + 3, id + '_g')] });
//   const p = (id: string, name: string, price: number, kind: string, color: number): Product => ({ id, name, price, image: IMG[kind] ?? ph(kind, color), kind, color });
//   return [
//     mk('fashion', 'NOVA FASHION', 'Premium Fashion', 0, 0x7c3aed, 'fashion', [p('f1', 'Premium T-Shirt', 1800, 'tshirt', 0x2563eb), p('f2', 'Urban Jacket', 5200, 'jacket', 0x1e293b), p('f3', 'Classic Sunglasses', 2400, 'glasses', 0x111827), p('f4', 'Running Sneaker', 4200, 'sneaker', 0xef4444)]),
//     mk('tech', 'TECHHUB', 'Smart Devices', 1, 0x0891b2, 'tech', [p('t1', 'Smart Watch', 4500, 'watch', 0x1e293b), p('t2', 'Mirrorless Camera', 62000, 'camera', 0xcbd5e1), p('t3', 'Wireless Headphones', 6800, 'headphone', 0x111827), p('t4', 'Flagship Phone', 92000, 'phone', 0x64748b)]),
//     mk('home', 'URBAN HOME', 'Furniture & Decor', 2, 0xd97706, 'home', [p('h1', 'Designer Chair', 8500, 'chair', 0xd97706), p('h2', 'Modern Table Lamp', 3200, 'lamp', 0xfacc15)]),
//     mk('market', 'FRESH MART', 'Grocery & Food', 3, 0x16a34a, 'market', [p('m1', 'Organic Honey', 950, 'jar', 0xd9901a), p('m2', 'Imported Chocolate', 1500, 'chocolate', 0x7c3aed), p('m3', 'Premium Rice 10KG', 1800, 'sack', 0xf1f5f9), p('m4', 'Fresh Coffee', 1250, 'coffee', 0x1e293b)]),
//   ];
// };

// /* ============================ IndexedDB (বড় ডেটার জন্য) ============================ */
// const openDB = () => new Promise<IDBDatabase>((res, rej) => {
//   const r = indexedDB.open('grand-mall', 1);
//   r.onupgradeneeded = () => r.result.createObjectStore('kv');
//   r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
// });
// const kv = {
//   async get(k: string): Promise<unknown> {
//     try { const db = await openDB(); return await new Promise((res) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); } catch { return undefined; }
//   },
//   async set(k: string, v: unknown) {
//     try { const db = await openDB(); await new Promise<void>((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); }); } catch { /* ignore */ }
//   },
// };

// const fileToDataUrl = (file: File, max: number) =>
//   new Promise<string>((res, rej) => {
//     const r = new FileReader();
//     r.onerror = () => rej(new Error('read'));
//     r.onload = () => {
//       const img = new Image();
//       img.onerror = () => rej(new Error('img'));
//       img.onload = () => {
//         const s = Math.min(1, max / Math.max(img.width, img.height));
//         const c = document.createElement('canvas');
//         c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
//         c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
//         res(c.toDataURL('image/jpeg', 0.82));
//       };
//       img.src = r.result as string;
//     };
//     r.readAsDataURL(file);
//   });

// /* ============================ শেয়ার্ড ক্যাশ (জিওমেট্রি / ম্যাটেরিয়াল / টেক্সচার) ============================ */
// const GC = new Map<string, THREE.BufferGeometry>();
// const G = (k: string, f: () => THREE.BufferGeometry) => { let g = GC.get(k); if (!g) { g = f(); g.userData.keep = true; GC.set(k, g); } return g; };
// const bx = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
// const cy = (a: number, b: number, h: number, s = 16) => G(`c${a}_${b}_${h}_${s}`, () => new THREE.CylinderGeometry(a, b, h, s));
// const sp = (r: number, w = 14, h = 10) => G(`s${r}_${w}_${h}`, () => new THREE.SphereGeometry(r, w, h));
// const to = (r: number, t: number, arc = Math.PI * 2) => G(`t${r}_${t}_${arc}`, () => new THREE.TorusGeometry(r, t, 8, 22, arc));
// const cp = (r: number, l: number) => G(`p${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 12));
// const pl = (w: number, h: number) => G(`pl${w}_${h}`, () => new THREE.PlaneGeometry(w, h));

// const MC = new Map<string, THREE.MeshStandardMaterial>();
// const M = (c: number, r = 0.6, m = 0.1, e = 0, ei = 0) => {
//   const k = `${c}|${r}|${m}|${e}|${ei}`; let x = MC.get(k);
//   if (!x) { x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.keep = true; MC.set(k, x); }
//   return x;
// };
// const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => {
//   const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
//   const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
// };
// const TXC = new Map<string, THREE.CanvasTexture>();
// const tileTex = (a: string, b: string, rx: number, ry: number) => {
//   const k = `${a}${b}${rx}${ry}`; let t = TXC.get(k);
//   if (!t) {
//     t = canvasTex(256, 256, (x) => { x.fillStyle = a; x.fillRect(0, 0, 256, 256); x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128); x.strokeStyle = 'rgba(0,0,0,.12)'; x.strokeRect(0, 0, 256, 256); });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.userData.keep = true; TXC.set(k, t);
//   }
//   return t;
// };
// const slatTex = () => {
//   let t = TXC.get('slat');
//   if (!t) {
//     t = canvasTex(256, 64, (x) => { x.fillStyle = '#1f1710'; x.fillRect(0, 0, 256, 64); for (let k = 0; k < 16; k++) { x.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; x.fillRect(k * 16, 0, 11, 64); } });
//     t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.userData.keep = true; TXC.set('slat', t);
//   }
//   return t;
// };
// const signTexture = (title: string, sub: string, accent: number) => canvasTex(1024, 280, (x) => {
//   x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280); x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
//   x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center'; x.fillText(title, 512, 125, 960);
//   x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial'; x.fillText(sub, 512, 190, 960);
// });

// const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
//   const k = new THREE.Mesh(g, m); k.position.set(x, y, z); k.scale.set(sx, sy, sz); k.rotation.set(rx, ry, rz); p.add(k); return k;
// };
// const tone = (c: number, k: number) => {
//   const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
//   return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
// };
// const disposeTree = (root: THREE.Object3D) => root.traverse((o) => {
//   const m = o as THREE.Mesh;
//   if (m.geometry && !(o as THREE.Sprite).isSprite && !m.geometry.userData.keep) m.geometry.dispose();
//   const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
//   mats.forEach((mm) => {
//     if (mm.userData.keep) return;
//     const mp = (mm as THREE.MeshBasicMaterial).map;
//     if (mp && !mp.userData.keep) mp.dispose();
//     mm.dispose();
//   });
// });

// /* ============================ ৩D পণ্য (প্রসিডিউরাল মডেল) ============================ */
// const shirtGeo = (jacket: boolean) => G(jacket ? 'jacket' : 'tshirt', () => {
//   const pts: [number, number][] = jacket
//     ? [[-.27, 0], [.27, 0], [.27, .4], [.4, .1], [.58, .16], [.46, .62], [.16, .78], [.1, .72], [-.1, .72], [-.16, .78], [-.46, .62], [-.58, .16], [-.4, .1], [-.27, .4]]
//     : [[-.24, 0], [.24, 0], [.24, .42], [.46, .34], [.54, .54], [.3, .74], [.12, .74], [.07, .64], [-.07, .64], [-.12, .74], [-.3, .74], [-.54, .54], [-.46, .34], [-.24, .42]];
//   const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
//   const d = jacket ? 0.12 : 0.08;
//   const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g;
// });

// function buildProduct(kind: string, color: number, image: string, tl: THREE.TextureLoader): THREE.Group {
//   const g = new THREE.Group();
//   const c = M(color, 0.5, 0.05), c2 = M(tone(color, 0.35), 0.5, 0.05), cd = M(tone(color, -0.35), 0.5, 0.05);
//   const dk = M(0x111827, 0.4, 0.3), mt = M(0xcbd5e1, 0.25, 0.9), wh = M(0xf8fafc, 0.5, 0), gold = M(0xfacc15, 0.3, 0.8), wood = M(0x6b4a2e, 0.6, 0.05);
//   const scr = M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.7), green = M(0x1f8a4c, 0.8, 0), green2 = M(0x2f9e44, 0.8, 0);
//   const H = Math.PI / 2;
//   switch (kind) {
//     case 'tshirt':
//       add(g, shirtGeo(false), c); add(g, bx(0.5, 0.04, 0.085), c2, 0, 0.14, 0);
//       add(g, cy(0.07, 0.07, 0.012, 14), wh, 0.12, 0.47, 0.045, 1, 1, 1, H); break;
//     case 'jacket':
//       add(g, shirtGeo(true), c); add(g, bx(0.03, 0.76, 0.125), dk, 0, 0.38, 0);
//       for (const s of [-1, 1]) add(g, bx(0.14, 0.03, 0.13), dk, s * 0.15, 0.2, 0);
//       add(g, bx(0.1, 0.05, 0.13), cd, 0, 0.74, 0); break;
//     case 'sneaker':
//       add(g, bx(0.36, 0.07, 0.86), wh, 0, 0.035, 0);
//       add(g, bx(0.32, 0.3, 0.4), c, 0, 0.22, -0.2); add(g, sp(0.17), c, 0, 0.17, 0.2, 1, 0.85, 1.7);
//       add(g, bx(0.22, 0.14, 0.32), c2, 0, 0.32, 0.02); add(g, bx(0.335, 0.06, 0.45), cd, 0, 0.14, -0.05);
//       for (const z of [-0.04, 0.06, 0.16]) add(g, bx(0.2, 0.025, 0.05), wh, 0, 0.4 - z * 0.3, z);
//       break;
//     case 'glasses': {
//       const lens = M(tone(color, -0.3), 0.05, 0.9);
//       for (const s of [-1, 1]) { add(g, to(0.17, 0.022), dk, s * 0.22, 0.2, 0); add(g, cy(0.165, 0.165, 0.012, 20), lens, s * 0.22, 0.2, 0, 1, 1, 1, H); add(g, bx(0.025, 0.025, 0.5), dk, s * 0.4, 0.26, -0.25); }
//       add(g, bx(0.1, 0.025, 0.03), dk, 0, 0.26, 0); break;
//     }
//     case 'watch':
//       add(g, cy(0.14, 0.17, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.03, 0.03, 0.2, 10), mt, 0, 0.12, 0);
//       add(g, to(0.2, 0.05), c, 0, 0.38, 0, 1, 1.1, 0.6); add(g, cy(0.17, 0.17, 0.07, 24), mt, 0, 0.38, 0, 1, 1, 1, H);
//       add(g, cy(0.145, 0.145, 0.078, 24), scr, 0, 0.38, 0, 1, 1, 1, H); add(g, cy(0.02, 0.02, 0.06, 8), mt, 0.19, 0.42, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.02, 0.1, 0.01), wh, 0, 0.42, 0.042); add(g, bx(0.07, 0.02, 0.01), wh, 0.03, 0.38, 0.042); break;
//     case 'phone': {
//       const t = new THREE.Group(); t.position.y = 0.42; t.rotation.x = -0.1; g.add(t);
//       add(t, bx(0.36, 0.74, 0.045), c, 0, 0, 0); add(t, bx(0.33, 0.7, 0.01), scr, 0, 0, 0.024);
//       add(t, bx(0.13, 0.13, 0.02), dk, -0.08, 0.27, -0.03); add(t, cy(0.035, 0.035, 0.02, 12), M(0x38bdf8, 0.1, 0.9), -0.08, 0.27, -0.045, 1, 1, 1, H);
//       add(t, bx(0.12, 0.012, 0.012), wh, 0, 0.3, 0.032); add(g, bx(0.2, 0.05, 0.1), mt, 0, 0.025, -0.02); break;
//     }
//     case 'camera':
//       add(g, bx(0.7, 0.38, 0.3), dk, 0, 0.25, 0); add(g, bx(0.7, 0.12, 0.31), mt, 0, 0.44, 0); add(g, bx(0.2, 0.1, 0.2), dk, -0.1, 0.55, 0);
//       add(g, cy(0.17, 0.17, 0.24, 22), dk, 0.03, 0.25, 0.25, 1, 1, 1, H); add(g, cy(0.18, 0.18, 0.04, 22), mt, 0.03, 0.25, 0.2, 1, 1, 1, H);
//       add(g, cy(0.12, 0.12, 0.02, 22), M(0x1e3a8a, 0.05, 0.9, 0x1e40af, 0.4), 0.03, 0.25, 0.375, 1, 1, 1, H);
//       add(g, bx(0.18, 0.32, 0.12), dk, -0.26, 0.22, 0.14); add(g, cy(0.04, 0.04, 0.04, 10), c, 0.26, 0.5, 0); break;
//     case 'headphone':
//       add(g, cy(0.17, 0.19, 0.03, 20), dk, 0, 0.015, 0); add(g, cy(0.035, 0.035, 0.3, 10), mt, 0, 0.17, 0);
//       add(g, to(0.3, 0.035, Math.PI), c, 0, 0.36, 0);
//       for (const s of [-1, 1]) { add(g, cy(0.13, 0.13, 0.1, 18), c, s * 0.32, 0.36, 0, 1, 1, 1, 0, 0, H); add(g, cy(0.11, 0.11, 0.05, 18), dk, s * 0.26, 0.36, 0, 1, 1, 1, 0, 0, H); }
//       break;
//     case 'chair':
//       add(g, bx(0.55, 0.07, 0.55), wood, 0, 0.5, 0); add(g, bx(0.5, 0.1, 0.5), c, 0, 0.58, 0); add(g, bx(0.52, 0.5, 0.07), c, 0, 0.88, -0.25, 1, 1, 1, -0.12);
//       for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, cy(0.03, 0.022, 0.5, 8), wood, sx * 0.23, 0.25, sz * 0.23);
//       break;
//     case 'lamp':
//       add(g, cy(0.16, 0.19, 0.04, 20), dk, 0, 0.02, 0); add(g, cy(0.022, 0.022, 0.55, 8), gold, 0, 0.3, 0);
//       add(g, cy(0.16, 0.3, 0.34, 24), M(tone(color, 0.5), 0.7, 0, color, 0.55), 0, 0.72, 0); add(g, sp(0.07), M(0xfff3c4, 0.3, 0, 0xffe08a, 2), 0, 0.68, 0); break;
//     case 'plant':
//       add(g, cy(0.2, 0.15, 0.3, 16), c, 0, 0.15, 0); add(g, cy(0.2, 0.2, 0.03, 16), dk, 0, 0.3, 0);
//       add(g, sp(0.22), green, 0, 0.5, 0); add(g, sp(0.16), green2, 0.16, 0.42, 0.05); add(g, sp(0.17), green2, -0.15, 0.44, -0.05); add(g, sp(0.14), green, 0, 0.7, 0); break;
//     case 'book':
//       add(g, bx(0.5, 0.12, 0.38), c, 0, 0.06, 0); add(g, bx(0.46, 0.08, 0.36), wh, 0.02, 0.06, 0.005);
//       add(g, bx(0.46, 0.1, 0.34), c2, 0.02, 0.17, 0, 1, 1, 1, 0, 0.15); add(g, bx(0.5, 0.012, 0.1), gold, 0, 0.13, 0.15); break;
//     case 'jar':
//       add(g, cy(0.2, 0.2, 0.38, 20), M(0xd9901a, 0.12, 0.1, 0x7a4a00, 0.25), 0, 0.22, 0); add(g, cy(0.21, 0.21, 0.08, 20), gold, 0, 0.45, 0);
//       add(g, cy(0.205, 0.205, 0.17, 20), M(0xfdf3d8, 0.7, 0), 0, 0.22, 0); add(g, cy(0.1, 0.1, 0.01, 6), M(0xd9901a, 0.5, 0), 0, 0.22, 0.205, 1, 1, 1, H); break;
//     case 'chocolate':
//       add(g, bx(0.5, 0.72, 0.09), c, 0, 0.37, 0); add(g, bx(0.52, 0.14, 0.1), gold, 0, 0.52, 0); add(g, bx(0.3, 0.26, 0.01), wh, 0, 0.26, 0.05); add(g, bx(0.2, 0.05, 0.012), c, 0, 0.26, 0.056); break;
//     case 'sack':
//       add(g, bx(0.5, 0.66, 0.26), M(0xefe6cf, 0.9, 0), 0, 0.34, 0); add(g, bx(0.52, 0.2, 0.27), c, 0, 0.38, 0); add(g, cp(0.05, 0.12), M(0xefe6cf, 0.9, 0), 0, 0.74, 0, 1, 1, 1, 0, 0, H);
//       add(g, bx(0.28, 0.1, 0.01), wh, 0, 0.38, 0.14); break;
//     case 'coffee':
//       add(g, bx(0.42, 0.62, 0.2), dk, 0, 0.32, 0); add(g, bx(0.43, 0.22, 0.21), c, 0, 0.34, 0); add(g, bx(0.42, 0.06, 0.22), M(0x2b2f3a, 0.6, 0.1), 0, 0.65, 0);
//       add(g, cy(0.04, 0.04, 0.02, 12), wh, 0, 0.52, 0.105, 1, 1, 1, H); add(g, bx(0.2, 0.05, 0.01), gold, 0, 0.34, 0.11); break;
//     case 'bottle':
//       add(g, cy(0.13, 0.13, 0.46, 18), M(color, 0.12, 0.1), 0, 0.24, 0); add(g, cy(0.05, 0.12, 0.14, 14), M(color, 0.12, 0.1), 0, 0.54, 0); add(g, cy(0.05, 0.05, 0.16, 12), M(color, 0.12, 0.1), 0, 0.66, 0);
//       add(g, cy(0.055, 0.055, 0.06, 12), gold, 0, 0.76, 0); add(g, cy(0.135, 0.135, 0.2, 18), wh, 0, 0.24, 0); break;
//     case 'bag':
//       add(g, bx(0.58, 0.4, 0.22), c, 0, 0.22, 0); add(g, bx(0.59, 0.14, 0.24), cd, 0, 0.41, 0); add(g, to(0.17, 0.02, Math.PI), dk, 0, 0.46, 0); add(g, bx(0.08, 0.08, 0.02), gold, 0, 0.38, 0.125); break;
//     case 'frame': {
//       const tex = tl.load(image || ph('frame')); tex.colorSpace = THREE.SRGBColorSpace;
//       add(g, bx(0.72, 0.57, 0.05), wood, 0, 0.36, 0); add(g, pl(0.6, 0.45), new THREE.MeshBasicMaterial({ map: tex }), 0, 0.36, 0.028); add(g, bx(0.04, 0.4, 0.04), wood, 0, 0.2, -0.1, 1, 1, 1, 0.3); break;
//     }
//     default:
//       add(g, bx(0.5, 0.4, 0.5), c, 0, 0.2, 0); add(g, bx(0.54, 0.08, 0.54), c2, 0, 0.44, 0);
//       add(g, bx(0.1, 0.4, 0.52), gold, 0, 0.2, 0); add(g, bx(0.52, 0.4, 0.1), gold, 0, 0.2, 0); add(g, sp(0.09), gold, -0.07, 0.54, 0, 1.3, 0.8, 1); add(g, sp(0.09), gold, 0.07, 0.54, 0, 1.3, 0.8, 1);
//   }
//   return g;
// }

// /* একই ম্যাটেরিয়ালের সব মেশ একসাথে মার্জ — ১৫০+ পণ্যেও ড্র-কল কম */
// function bake(root: THREE.Object3D): THREE.Mesh[] {
//   root.updateMatrixWorld(true);
//   const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
//   root.traverse((o) => {
//     const m = o as THREE.Mesh; if (!m.isMesh) return;
//     let g = m.geometry.clone(); if (g.index) g = g.toNonIndexed();
//     g.applyMatrix4(m.matrixWorld);
//     const mat = m.material as THREE.Material, arr = buckets.get(mat);
//     if (arr) arr.push(g); else buckets.set(mat, [g]);
//   });
//   const out: THREE.Mesh[] = [];
//   buckets.forEach((list, mat) => {
//     const merged = mergeGeometries(list, false); list.forEach((x) => x.dispose());
//     if (merged) out.push(new THREE.Mesh(merged, mat));
//   });
//   return out;
// }

// /* ============================ মানুষ (আরো সুন্দর কার্টুন) ============================ */
// type HumanOpts = { shirt?: number; pants?: number; skin?: number; hair?: number; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; female?: boolean; glasses?: boolean; shoe?: number };
// function buildHuman(o: HumanOpts = {}) {
//   const skin = M(o.skin ?? 0xc98262, 0.55, 0), shirt = M(o.shirt ?? 0x2563eb, 0.6, 0), pants = M(o.pants ?? 0x1e293b, 0.7, 0), hair = M(o.hair ?? 0x17120f, 0.45, 0.1);
//   const dark = M(0x0a0a0a, 0.5, 0.1), white = M(0xffffff, 0.3, 0), shoe = M(o.shoe ?? 0xf1f5f9, 0.5, 0.1), sole = M(0x1f2937, 0.8, 0), lip = M(0xb4534b, 0.5, 0);
//   const fem = !!o.female, H = Math.PI / 2;
//   const group = new THREE.Group(), root = new THREE.Group(); group.add(root);

//   add(root, cp(0.36, 0.46), shirt, 0, 2.4, 0, fem ? 0.9 : 1, 1, 0.6);
//   add(root, sp(0.3), fem ? shirt : pants, 0, 1.75, 0, 1.12, 0.62, 0.78);
//   if (fem) add(root, cy(0.3, 0.52, 0.7, 20), shirt, 0, 1.62, 0);
//   else { add(root, bx(0.74, 0.08, 0.46), dark, 0, 1.9, 0); add(root, bx(0.1, 0.1, 0.05), M(0xfacc15, 0.3, 0.8), 0, 1.9, -0.24); }
//   add(root, cy(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
//   add(root, to(0.13, 0.035), shirt, 0, 2.97, 0, 1, 1, 1, H);

//   const arm = (s: number) => {
//     const a = new THREE.Group(); a.position.set(s * (fem ? 0.48 : 0.52), 2.8, 0); root.add(a);
//     add(a, sp(0.14), shirt, 0, 0, 0); add(a, cp(0.11, 0.26), shirt, 0, -0.24, 0); add(a, cp(0.085, 0.3), skin, 0, -0.64, 0); add(a, sp(0.095), skin, 0, -0.92, 0);
//     return a;
//   };
//   const leg = (s: number) => {
//     const l = new THREE.Group(); l.position.set(s * 0.2, 1.72, 0); root.add(l);
//     add(l, cp(0.14, 1.26), fem ? skin : pants, 0, -0.78, 0);
//     if (!fem) add(l, to(0.14, 0.02), dark, 0, -1.48, 0, 1, 1, 1, H);
//     add(l, bx(0.27, 0.14, 0.54), shoe, 0, -1.6, -0.1); add(l, bx(0.28, 0.05, 0.56), sole, 0, -1.695, -0.1);
//     return l;
//   };
//   const AL = arm(-1), AR = arm(1), LL = leg(-1), LR = leg(1);

//   const head = new THREE.Group(); head.position.set(0, 3.42, 0); root.add(head);
//   add(head, sp(0.3, 24, 18), skin, 0, 0, 0, 0.9, 1.08, 0.98);
//   for (const s of [-1, 1]) {
//     add(head, sp(0.05), skin, s * 0.27, -0.02, 0.0, 0.6, 1, 0.8);
//     add(head, sp(0.055), white, s * 0.105, 0.05, -0.252, 1, 0.8, 0.5); add(head, sp(0.03), dark, s * 0.105, 0.05, -0.28, 1, 1, 0.5);
//     add(head, bx(0.1, 0.018, 0.02), hair, s * 0.105, 0.14, -0.265, 1, 1, 1, 0, 0, s * 0.12);
//     if (o.glasses) add(head, to(0.075, 0.01), dark, s * 0.105, 0.05, -0.285);
//   }
//   if (o.glasses) add(head, bx(0.06, 0.012, 0.012), dark, 0, 0.06, -0.285);
//   add(head, sp(0.04), skin, 0, -0.03, -0.285, 1, 1.1, 1); add(head, to(0.065, 0.012, Math.PI), lip, 0, -0.1, -0.27, 1, 1, 0.5, 0, 0, Math.PI);
//   const capG = G('hcap', () => new THREE.SphereGeometry(0.315, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52));
//   const st = o.style ?? 'short';
//   if (st !== 'bald') {
//     add(head, capG, st === 'cap' ? shirt : hair, 0, 0.02, 0.03, 0.93, 1.1, 1);
//     if (st === 'short' || st === 'bun') add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9);
//     if (st === 'long') { add(head, sp(0.29, 14, 10), hair, 0, -0.02, 0.08, 0.92, 1, 0.9); add(head, cp(0.24, 0.5), hair, 0, -0.38, 0.15, 1, 1, 0.55); }
//     if (st === 'bun') add(head, sp(0.12), hair, 0, 0.36, 0.1);
//     if (st === 'cap') add(head, bx(0.4, 0.03, 0.28), shirt, 0, 0.12, -0.3);
//   }

//   const nm: { chest?: THREE.Mesh; tag?: THREE.Sprite } = {};
//   const setName = (name: string, photo?: string) => {
//     const make = (w: number, h: number, img?: HTMLImageElement) => {
//       const c = document.createElement('canvas'); c.width = w; c.height = h;
//       const x = c.getContext('2d')!;
//       x.fillStyle = 'rgba(5,11,22,.85)'; x.fillRect(0, 0, w, h);
//       const r = h / 2 - 8;
//       x.save(); x.beginPath(); x.arc(h / 2, h / 2, r, 0, 7); x.clip();
//       if (img) { const s = Math.min(img.width, img.height); x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, h / 2 - r, h / 2 - r, r * 2, r * 2); }
//       else { x.fillStyle = '#38bdf8'; x.fillRect(0, 0, h, h); }
//       x.restore();
//       x.fillStyle = '#fff'; x.font = `800 ${h * 0.4}px Arial`; x.textAlign = 'left'; x.textBaseline = 'middle';
//       x.fillText(name, h + 4, h / 2 + 2, w - h - 14);
//       const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
//     };
//     const apply = (img?: HTMLImageElement) => {
//       const ct = make(256, 96, img), tt = make(512, 128, img);
//       if (!nm.chest || !nm.tag) {
//         nm.chest = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new THREE.MeshBasicMaterial({ map: ct }));
//         nm.chest.position.set(0, 2.5, -0.245); nm.chest.rotation.y = Math.PI; root.add(nm.chest);
//         nm.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tt, depthTest: false }));
//         nm.tag.scale.set(1.6, 0.4, 1); nm.tag.position.y = 0.62; nm.tag.renderOrder = 10; head.add(nm.tag);
//       } else {
//         const cm = nm.chest.material as THREE.MeshBasicMaterial, tm = nm.tag.material as THREE.SpriteMaterial;
//         cm.map?.dispose(); cm.map = ct; tm.map?.dispose(); tm.map = tt;
//       }
//     };
//     apply();
//     if (photo) { const im = new Image(); im.onload = () => apply(im); im.src = photo; }
//   };

//   const update = (phase: number, amt: number, t: number) => {
//     const s = Math.sin(phase) * 0.7 * amt;
//     LL.rotation.x = s; LR.rotation.x = -s; AL.rotation.x = -s * 0.8; AR.rotation.x = s * 0.8;
//     AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
//     root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
//     head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
//   };
//   return { group, update, setName };
// }
// type Human = ReturnType<typeof buildHuman>;

// /* ============================ আকাশ, সূর্য, চাঁদ, তারা ============================ */
// function makeSky() {
//   const mat = new THREE.ShaderMaterial({
//     side: THREE.BackSide, depthWrite: false,
//     uniforms: { zenith: { value: new THREE.Vector3() }, horizon: { value: new THREE.Vector3() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Vector3(1, 1, 1) }, night: { value: 0 } },
//     vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
//     fragmentShader: `
//       varying vec3 vD; uniform vec3 zenith, horizon, sunDir, sunCol; uniform float night;
//       void main(){
//         vec3 d = normalize(vD); float h = d.y;
//         vec3 col = mix(horizon, zenith, pow(clamp(h,0.0,1.0), 0.5));
//         col = mix(col, horizon*0.55, clamp(-h*4.0,0.0,1.0));
//         float sd = max(dot(d, sunDir), 0.0);
//         col += sunCol*(pow(sd,6.0)*0.18 + pow(sd,48.0)*0.55);
//         col = mix(col, vec3(1.0,0.98,0.9), smoothstep(0.9988,0.9994,sd));
//         float md = max(dot(d,-sunDir),0.0);
//         col = mix(col, vec3(0.92,0.95,1.0), smoothstep(0.9993,0.9997,md)*night);
//         vec3 p = floor(d*220.0);
//         float s = fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453);
//         col += vec3(step(0.9985,s))*night*step(0.05,h);
//         gl_FragColor = vec4(col,1.0);
//       }`,
//   });
//   const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
//   mesh.renderOrder = -10; mesh.frustumCulled = false;
//   return mesh;
// }
// const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
// const NZ = [0.02, 0.04, 0.11], DZ = [0.14, 0.4, 0.85], SZ = [0.28, 0.2, 0.5];
// const NH = [0.07, 0.09, 0.2], DH = [0.7, 0.85, 1], SH = [1, 0.58, 0.32];

// /* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, গাছ, শহর, মেঘ, পাখি ============================ */
// function addOutdoors(scene: THREE.Scene) {
//   const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
//     const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
//   };
//   plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
//   const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
//   const m4 = new THREE.Matrix4();
//   for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
//   scene.add(dashes);

//   // গাছ
//   const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
//   for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
//     const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
//     add(t, cy(0.25, 0.35, 3, 8), M(0x5b3a1e, 0.9, 0), 0, 1.5, 0); add(t, ico, leafMs[k % 3], 0, 4, 0); add(t, ico, leafMs[(k + 1) % 3], 0.6, 5.2, 0.2, 0.7, 0.7, 0.7);
//     t.scale.setScalar(0.9 + (k % 4) * 0.12); scene.add(t);
//   }

//   // দূরের শহর (জানালায় রাতে আলো জ্বলে)
//   const wt = canvasTex(64, 128, (x) => {
//     x.fillStyle = '#7a8aa5'; x.fillRect(0, 0, 64, 128);
//     for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { x.fillStyle = Math.random() < 0.45 ? '#ffe9a8' : '#33415c'; x.fillRect(c * 8 + 1, r * 8 + 1, 5, 5); }
//   });
//   const cityMat = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: wt, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.7 });
//   const N = 90, city = new THREE.InstancedMesh(bx(1, 1, 1), cityMat, N), rr = rng(42), mm = new THREE.Matrix4(), col = new THREE.Color();
//   for (let i = 0; i < N; i++) {
//     const w = 10 + rr() * 14, h = 18 + rr() * 70, d = 10 + rr() * 12;
//     mm.compose(new THREE.Vector3(-340 + i * 7.6 + rr() * 4, h / 2, 82 + rr() * 40), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
//     city.setMatrixAt(i, mm); city.setColorAt(i, col.setHSL(0.58 + rr() * 0.08, 0.15, 0.55 + rr() * 0.3));
//   }
//   scene.add(city);

//   // গাড়ি
//   const wheelM = M(0x0a0a0a, 0.8, 0), lightM = M(0xfff6d0, 0.3, 0, 0xfff0b0, 2), tailM = M(0xff2222, 0.3, 0, 0xff0000, 1.5);
//   const cars = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316].map((color, i) => {
//     const dir = i % 2 ? -1 : 1, g = new THREE.Group();
//     add(g, bx(4.2, 0.9, 1.9), M(color, 0.3, 0.6), 0, 0.8, 0); add(g, bx(2.2, 0.8, 1.7), M(0x9edfff, 0.1, 0.3), -0.2, 1.6, 0);
//     for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) add(g, cy(0.4, 0.4, 0.3, 16), wheelM, wx, 0.4, wz, 1, 1, 1, Math.PI / 2);
//     for (const lz of [-0.6, 0.6]) { add(g, bx(0.1, 0.2, 0.35), lightM, 2.1, 0.85, lz); add(g, bx(0.1, 0.2, 0.35), tailM, -2.1, 0.85, lz); }
//     g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
//     return { g, dir, sp: 9 + (i % 4) * 3 };
//   });

//   // মেঘ
//   const cloudTex = canvasTex(128, 64, (x) => {
//     for (let i = 0; i < 9; i++) { const cx = 20 + Math.random() * 88, cyy = 28 + Math.random() * 12, r = 14 + Math.random() * 12, gr = x.createRadialGradient(cx, cyy, 0, cx, cyy, r); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cyy, r, 0, 7); x.fill(); }
//   });
//   const clouds = Array.from({ length: 16 }, (_, i) => {
//     const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false }));
//     s.scale.set(90 + (i % 4) * 25, 36 + (i % 3) * 8, 1); s.position.set(-250 + i * 34, 85 + (i % 5) * 14, -150 + ((i * 53) % 260)); scene.add(s); return s;
//   });

//   // পাখি
//   const wingG = G('wing', () => new THREE.PlaneGeometry(1.2, 0.4)), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
//   const birds = Array.from({ length: 14 }, (_, i) => {
//     const g = new THREE.Group(), L = new THREE.Group(), R = new THREE.Group();
//     const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
//     wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6; L.add(wl); R.add(wr);
//     const b = new THREE.Mesh(sp(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
//     g.add(L, R, b); scene.add(g);
//     return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
//   });

//   return (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
//     cars.forEach((c) => { c.g.position.x += c.dir * c.sp * dt; if (c.g.position.x > 150) c.g.position.x = -150; if (c.g.position.x < -150) c.g.position.x = 150; });
//     birds.forEach((b) => {
//       const a = t * b.sp + b.off;
//       b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6); b.g.rotation.y = -a;
//       const f = Math.sin(t * 9 + b.off) * 0.7; b.L.rotation.z = f; b.R.rotation.z = -f; b.g.visible = dayF > 0.15;
//     });
//     clouds.forEach((c, i) => {
//       c.position.x += dt * (1.5 + (i % 3) * 0.6); if (c.position.x > 280) c.position.x = -280;
//       const m = c.material as THREE.SpriteMaterial; m.color.setRGB(cloudRGB[0], cloudRGB[1], cloudRGB[2], THREE.SRGBColorSpace); m.opacity = 0.35 + 0.55 * dayF;
//     });
//     cityMat.emissiveIntensity = (1 - dayF) * 0.9;
//   };
// }

// /* ============================ অন্য মানুষ (একই ডিভাইসের অন্য ট্যাব) ============================
//    আসল ইন্টারনেট মাল্টিপ্লেয়ারের জন্য সার্ভার (WebSocket/Firebase/Supabase) লাগবে। */
// type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
// function createNet(getSelf: () => { x: number; z: number; r: number; w: number; a: number }, getProfile: () => Profile) {
//   const id = Math.random().toString(36).slice(2, 8);
//   let bc: BroadcastChannel | null = null;
//   try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
//   const peers = new Map<string, Peer>();
//   if (bc) bc.onmessage = (e) => {
//     const m = e.data;
//     if (!m || !m.id || m.id === id) return;
//     if (m.t === 'bye') { peers.delete(m.id); return; }
//     const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
//     if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; } else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
//     p.seen = performance.now(); peers.set(m.id, p);
//   };
//   let lp = 0, lh = 0;
//   const tick = (now: number) => {
//     if (!bc) return;
//     if (now - lh > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lh = now; }
//     if (now - lp > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lp = now; }
//     peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
//   };
//   return { peers, tick, close: () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); } };
// }

// /* ============================ মূল কম্পোনেন্ট ============================ */
// const glass = 'border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl';
// const inp = 'w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-slate-500';
// const btn = 'rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-cyan-400';
// const fmtHour = (h: number) => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

// type Built = { shop: Shop; g: THREE.Group; col: Box2[]; hits: { box: THREE.Box3; p: Product }[]; idlers: { h: Human; base: number }[]; screen: (t: number) => void; light: THREE.Vector3 };

// export default function Page() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const tipRef = useRef<HTMLDivElement>(null);
//   const keysRef = useRef({ f: false, b: false, l: false, r: false, s: false });
//   const joyRef = useRef({ x: 0, y: 0 });
//   const pausedRef = useRef(false);
//   const meRef = useRef<Human | null>(null);
//   const posRef = useRef({ x: 0, z: 18 });
//   const tpRef = useRef<{ x: number; z: number } | null>(null);
//   const sunCmdRef = useRef(false);
//   const dayRef = useRef({ a: 0.65, auto: true });

//   const [shops, setShops] = useState<Shop[]>(defaultShops);
//   const [profile, setProfile] = useState<Profile>({ name: 'আমি', photo: '' });
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [balance, setBalance] = useState(100000);
//   const [score, setScore] = useState(0);
//   const [loaded, setLoaded] = useState(false);
//   const [selected, setSelected] = useState<Sel | null>(null);
//   const [hover, setHover] = useState<{ name: string; price: number } | null>(null);
//   const [qty, setQty] = useState(1);
//   const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন।');
//   const [touch, setTouch] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [panel, setPanel] = useState<'' | 'profile' | 'shops'>('');
//   const [online, setOnline] = useState<string[]>([]);
//   const [knob, setKnob] = useState({ x: 0, y: 0 });
//   const [hour, setHour] = useState(8.5);
//   const [autoDay, setAutoDay] = useState(true);
//   const [sid, setSid] = useState('fashion');
//   const [q, setQ] = useState('');
//   const [ns, setNs] = useState({ name: '', subtitle: '', style: 'market', accent: '#2563eb' });
//   const [np, setNp] = useState({ name: '', price: '', image: '', kind: 'tshirt', color: '#2563eb' });
//   const [rn, setRn] = useState('');

//   const profileRef = useRef(profile); profileRef.current = profile;
//   const shopsRef = useRef(shops); shopsRef.current = shops;
//   const total = cart.reduce((s, i) => s + i.price * i.count, 0);
//   const cartCount = cart.reduce((s, i) => s + i.count, 0);

//   useEffect(() => { pausedRef.current = paused; }, [paused]);
//   useEffect(() => {
//     const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
//     check(); window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   /* ---- লোড / সেভ ---- */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
//         if (ls) {
//           if (ls.profile) setProfile(ls.profile); if (ls.cart) setCart(ls.cart);
//           if (typeof ls.balance === 'number') setBalance(ls.balance); if (typeof ls.score === 'number') setScore(ls.score);
//         }
//       } catch { /* ignore */ }
//       const saved = (await kv.get('shops')) as Shop[] | undefined;
//       if (alive && Array.isArray(saved) && saved.length) { setShops(saved); setSid(saved[0].id); }
//       if (alive) setLoaded(true);
//     })();
//     return () => { alive = false; };
//   }, []);
//   useEffect(() => {
//     if (!loaded) return;
//     const t = setTimeout(() => { kv.set('shops', shops); }, 500);
//     return () => clearTimeout(t);
//   }, [loaded, shops]);
//   useEffect(() => {
//     if (!loaded) return;
//     try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score })); } catch { /* ignore */ }
//   }, [loaded, profile, cart, balance, score]);
//   useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

//   /* ============================ 3D দৃশ্য ============================ */
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container || !loaded) return;

//     const scene = new THREE.Scene();
//     scene.fog = new THREE.Fog(0xbfd8f0, 25, 135);
//     const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
//     renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     container.appendChild(renderer.domElement);
//     renderer.domElement.style.touchAction = 'none';

//     const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x3a4252, 1.6); scene.add(hemi);
//     const sun = new THREE.DirectionalLight(0xffffff, 1.6);
//     sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
//     Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 220 });
//     scene.add(sun, sun.target);
//     const pool = Array.from({ length: 4 }, () => { const l = new THREE.PointLight(0xfff1dc, 0, 30, 2); scene.add(l); return l; });

//     const sky = makeSky(); scene.add(sky);
//     const skyU = (sky.material as THREE.ShaderMaterial).uniforms;
//     const updateOutdoors = addOutdoors(scene);

//     const textureLoader = new THREE.TextureLoader(); textureLoader.setCrossOrigin('anonymous');
//     const glowMat = M(0xeaf8ff, 0.5, 0, 0xbde9ff, 2.2);
//     const built = new Map<string, Built>();
//     const screens: Built[] = [];
//     void screens;

//     /* ---------- মলের কাঠামো (দোকানের সংখ্যা অনুযায়ী লম্বা হয়) ---------- */
//     let shell: THREE.Group | null = null, shellBack = 0, shellCol: Box2[] = [];
//     const needBack = () => { const zs = shopsRef.current.map((s) => s.z); return Math.min(-115, (zs.length ? Math.min(...zs) : -14) - 22); };
//     const mkShell = (backZ: number) => {
//       if (shell) { scene.remove(shell); disposeTree(shell); }
//       shellBack = backZ; shellCol = [];
//       const len = 24 - backZ, cz = (24 + backZ) / 2, s = new THREE.Group();
//       const floor = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ map: tileTex('#2a3447', '#323e55', Math.round(57 / 4), Math.round(len / 4)), roughness: 0.22, metalness: 0.2 }));
//       floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, cz); floor.receiveShadow = true; s.add(floor);
//       const wallM = M(0x1a2338, 0.5, 0.3);
//       for (const sx of [-28.5, 28.5]) { const w = add(s, bx(1, 14, len), wallM, sx, 7, cz); w.receiveShadow = true; }
//       add(s, bx(58, 14, 1), wallM, 0, 7, backZ - 0.5);
//       // কাচের ছাদ — আকাশ ও সূর্য দেখা যায়
//       const roof = new THREE.Mesh(new THREE.PlaneGeometry(57, len), new THREE.MeshStandardMaterial({ color: 0xa8d8ff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }));
//       roof.rotation.x = Math.PI / 2; roof.position.set(0, 14, cz); s.add(roof);
//       const nB = Math.floor(len / 9), beams = new THREE.InstancedMesh(bx(57, 0.35, 0.5), M(0x2b3550, 0.4, 0.7), nB), m4 = new THREE.Matrix4();
//       for (let i = 0; i < nB; i++) { m4.setPosition(0, 14, 24 - i * 9); beams.setMatrixAt(i, m4); }
//       beams.castShadow = true; s.add(beams);
//       for (const rx of [-22, -11, 0, 11, 22]) { const r = add(s, bx(0.3, 0.3, len), M(0x2b3550, 0.4, 0.7), rx, 14, cz); r.castShadow = true; }
//       const nL = Math.floor(len / 10), bars = new THREE.InstancedMesh(bx(6, 0.15, 0.5), glowMat, nL);
//       for (let i = 0; i < nL; i++) { m4.setPosition(0, 13.7, 20 - i * 10); bars.setMatrixAt(i, m4); }
//       s.add(bars);
//       for (const sx of [-7.3, 7.3]) add(s, bx(0.1, 0.02, len), M(0x22d3ee, 0.3, 0, 0x22d3ee, 2), sx, 0.03, cz);
//       // টব ও গাছ
//       for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
//         add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
//         shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
//       }
//       // প্রবেশদ্বার
//       for (const sx of [-26, 26]) add(s, bx(1.4, 14, 1.4), M(0x2b3550, 0.4, 0.7), sx, 7, 24);
//       add(s, bx(54, 1.2, 1.2), M(0x2b3550, 0.4, 0.7), 0, 13.2, 24);
//       const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8), side: THREE.DoubleSide }));
//       arch.position.set(0, 10.6, 23.6); s.add(arch);
//       shell = s; scene.add(s);
//     };

//     /* ---------- দোকান তৈরি (স্ট্রিমিং) ---------- */
//     const buildShop = (shop: Shop): Built => {
//       const g = new THREE.Group();
//       g.position.set(shop.x, 0, shop.z); g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2;
//       const col: Box2[] = [], idlers: Built['idlers'] = [];
//       const acc = M(shop.accent, 0.3, 0.5), dark = M(0x131a2a, 0.35, 0.6), metal = M(0x64748b, 0.25, 0.85), wood = M(0x6b4a2e, 0.55, 0.1), white = M(0xe5e9f0, 0.25, 0.2);
//       const led = M(shop.accent, 0.3, 0.2, shop.accent, 2.5);
//       const glassM = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
//       const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
//         const k = add(g, bx(w, h, d), m, x, y, z); k.castShadow = shadow; k.receiveShadow = true; return k;
//       };
//       const solid = (lx: number, lz: number, w: number, d: number) => {
//         const c = Math.round(Math.cos(g.rotation.y)), s = Math.round(Math.sin(g.rotation.y));
//         const wx = shop.x + lx * c + lz * s, wz = shop.z - lx * s + lz * c;
//         const sw = Math.abs(w * c) + Math.abs(d * s), sd = Math.abs(w * s) + Math.abs(d * c);
//         col.push({ minX: wx - sw / 2, maxX: wx + sw / 2, minZ: wz - sd / 2, maxZ: wz + sd / 2 });
//       };

//       const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 20), new THREE.MeshStandardMaterial({ map: tileTex('#d8dde6', '#c4cad6', 9, 10), roughness: 0.3 }));
//       sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true; g.add(sf);
//       add(g, pl(3.4, 19), M(shop.accent, 0.9, 0), 0, 0.05, 0, 1, 1, 1, -Math.PI / 2);

//       // দেয়াল
//       for (const s of [-1, 1]) { box(0.4, 10, 20, acc, s * 8.9, 5, 0); solid(s * 8.9, 0, 0.4, 20); }
//       box(18, 10, 0.4, dark, 0, 5, -9.9); solid(0, -9.9, 18, 0.4);
//       const slat = add(g, pl(17.4, 9.4), new THREE.MeshStandardMaterial({ map: slatTex(), roughness: 0.55 }), 0, 4.7, -9.68);
//       slat.receiveShadow = true;

//       // সামনের দিক
//       box(18, 3.4, 0.5, dark, 0, 8.3, 10);
//       for (const gx of [-5.5, 5.5]) { add(g, bx(7, 6.6, 0.1), glassM, gx, 3.3, 10); solid(gx, 9.9, 7, 0.4); }
//       for (const fx of [-2, 2, -9, 9]) box(0.3, 6.6, 0.4, metal, fx, 3.3, 10);
//       add(g, new THREE.PlaneGeometry(14, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }), 0, 8.3, 10.27);
//       const awn = box(18.4, 0.25, 2.4, acc, 0, 6.9, 11.1, false); awn.rotation.x = 0.18;
//       box(14.4, 0.1, 0.1, led, 0, 9.85, 10.3, false);
//       for (const lz of [-5, 3]) box(15, 0.12, 0.35, glowMat, 0, 9.7, lz, false);
//       for (const s of [-1, 1]) box(0.12, 0.15, 19.4, led, s * 8.5, 9.6, 0, false);

//       // শেলফ (দুই পাশ + পেছনে, ৪ থাক, নিচে LED)
//       const planks = (cx: number, cz: number, w: number, d: number, vertical: boolean) => {
//         SHELF_Y.forEach((y) => { box(w, 0.08, d, wood, cx, y, cz); box(w - 0.1, 0.03, d - 0.1, led, cx, y - 0.06, cz, false); });
//         if (vertical) { box(0.12, 5.6, d, dark, cx + (cx < 0 ? -0.6 : 0.6), 2.8, cz); box(w, 0.78, d, dark, cx, 0.39, cz); }
//         else { box(w, 5.6, 0.12, dark, cx, 2.8, cz - 0.6); box(w, 0.78, d, dark, cx, 0.39, cz); }
//       };
//       for (const s of [-1, 1]) { planks(s * 8.0, -2.45, 1.2, 12.2, true); solid(s * 8.0, -2.45, 1.3, 12.3); }
//       planks(0, -9.1, 15.8, 1.2, false); solid(0, -9.1, 15.8, 1.3);

//       // টেবিল (৮টি) — উপরে শোকেস পণ্য
//       for (const cz of TABLE_Z) for (const cx of TABLE_X) {
//         box(2.0, 1.6, 1.2, white, cx, 0.8, cz); box(2.05, 0.08, 1.25, led, cx, 1.62, cz, false); solid(cx, cz, 2.0, 1.2);
//       }

//       // পেছনের স্ক্রিন (চলমান)
//       const sc = document.createElement('canvas'); sc.width = 768; sc.height = 300;
//       const sx = sc.getContext('2d')!, stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
//       const draw = (t: number) => {
//         const gr = sx.createLinearGradient(0, 0, 768, 300); gr.addColorStop(0, hex(shop.accent)); gr.addColorStop(1, '#0b1220');
//         sx.fillStyle = gr; sx.fillRect(0, 0, 768, 300);
//         sx.fillStyle = 'rgba(255,255,255,.14)'; sx.beginPath(); sx.arc(384 + 260 * Math.sin(t * 0.8), 150, 120, 0, 7); sx.fill();
//         sx.fillStyle = '#fff'; sx.font = '900 64px Arial'; sx.textAlign = 'center'; sx.fillText(shop.name, 384, 170, 720); stex.needsUpdate = true;
//       };
//       draw(0);
//       box(9.4, 3.9, 0.2, dark, 0, 7.75, -9.55);
//       add(g, new THREE.PlaneGeometry(9, 3.5), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }), 0, 7.75, -9.43);

//       // মানুষ
//       const hs = [...shop.id].reduce((a, c) => a + c.charCodeAt(0), 0);
//       const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: hs % 2 ? 0xb87555 : 0xe0ac8a, female: hs % 3 === 0, style: hs % 3 === 0 ? 'long' : 'short', hair: hs % 2 ? 0x17120f : 0x3b2314 });
//       cashier.group.position.set(-5.4, 0, 4.6); cashier.group.rotation.y = Math.PI; g.add(cashier.group); idlers.push({ h: cashier, base: Math.PI }); solid(-5.4, 4.6, 0.8, 0.8);
//       const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][hs % 4], skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][hs % 4], female: hs % 2 === 0, style: (['bun', 'cap', 'long', 'short'] as const)[hs % 4], glasses: hs % 5 === 0 });
//       browser.group.position.set(3.6, 0, 7.2); g.add(browser.group); idlers.push({ h: browser, base: 0 }); solid(3.6, 7.2, 0.9, 0.9);
//       box(3.6, 1.4, 1.3, dark, -5.4, 0.7, 6); box(3.6, 0.08, 1.4, wood, -5.4, 1.42, 6); solid(-5.4, 6, 3.6, 1.3);

//       // পণ্য: ৩D মডেল → মার্জ → কম ড্র-কল
//       const prodRoot = new THREE.Group(), localBoxes: { box: THREE.Box3; p: Product }[] = [];
//       shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
//         const sl = SLOTS[i], m = buildProduct(p.kind, p.color, p.image, textureLoader);
//         m.position.set(sl.x, sl.y, sl.z); m.rotation.y = sl.ry; m.scale.setScalar(sl.s); prodRoot.add(m);
//         localBoxes.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(sl.x, sl.y + 0.45 * sl.s, sl.z), new THREE.Vector3(1.05 * sl.s, 1.05 * sl.s, 1.05 * sl.s)), p });
//       });
//       bake(prodRoot).forEach((mesh) => g.add(mesh));
//       scene.add(g); g.updateMatrixWorld(true);
//       const hits = localBoxes.map((h) => ({ p: h.p, box: h.box.applyMatrix4(g.matrixWorld) }));
//       return { shop, g, col, hits, idlers, screen: draw, light: new THREE.Vector3(shop.x, 7.5, shop.z) };
//     };
//     const drop = (id: string) => { const b = built.get(id); if (!b) return; scene.remove(b.g); disposeTree(b.g); built.delete(id); };

//     /* ---------- খেলোয়াড় ও পথচারী ---------- */
//     const player = new THREE.Group(); player.position.set(posRef.current.x, 0, posRef.current.z); scene.add(player);
//     const me = buildHuman({ shirt: 0x2563eb, skin: 0xc98262, style: 'short' });
//     player.add(me.group); meRef.current = me; me.setName(profileRef.current.name, profileRef.current.photo);

//     const looks: HumanOpts[] = [
//       { shirt: 0xef4444, skin: 0xb87555, female: true, style: 'long' }, { shirt: 0xf8fafc, skin: 0xe0ac8a, hair: 0x3b2314, style: 'cap' }, { shirt: 0x16a34a, skin: 0x8d5a3b, glasses: true },
//       { shirt: 0xfacc15, skin: 0xd9a07c, hair: 0x5b3a1e, female: true, style: 'bun' }, { shirt: 0x8b5cf6, skin: 0xc98262, style: 'bald' }, { shirt: 0xf97316, skin: 0xa66a47, female: true, style: 'long', hair: 0x2a1a10 },
//       { shirt: 0x0ea5e9, skin: 0xe0ac8a, hair: 0xb45309, style: 'short' }, { shirt: 0xec4899, skin: 0x8d5a3b, female: true, style: 'short', glasses: true },
//     ];
//     const walkers = looks.map((o, i) => {
//       const h = buildHuman(o); scene.add(h.group);
//       return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
//     });

//     let walk = 0, amt = 0;
//     const net = createNet(() => ({ x: player.position.x, z: player.position.z, r: player.rotation.y, w: walk, a: amt }), () => profileRef.current);
//     const avatars = new Map<string, { h: Human; key: string }>();
//     const timer = setInterval(() => {
//       const n = [...net.peers.values()].map((p) => p.name);
//       setOnline((prev) => (prev.join('|') === n.join('|') ? prev : n));
//       if (dayRef.current.auto) setHour(Math.round((((((dayRef.current.a / (Math.PI * 2)) * 24 + 6) % 24) + 24) % 24) * 10) / 10);
//     }, 1000);

//     /* ---------- ইনপুট ---------- */
//     let yaw = 0, pitch = 0.5, camDist = 11;
//     const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tmp = new THREE.Vector3();
//     let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;
//     const el = renderer.domElement;
//     const pickAt = (cx: number, cy: number) => {
//       const r = el.getBoundingClientRect();
//       ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
//       ray.setFromCamera(ptr, camera);
//       let best: { p: Product; shop: string; d: number } | null = null;
//       for (const b of built.values()) for (const h of b.hits) {
//         if (!ray.ray.intersectBox(h.box, tmp)) continue;
//         const d = tmp.distanceTo(ray.ray.origin);
//         if (d < 60 && (!best || d < best.d)) best = { p: h.p, shop: b.shop.name, d };
//       }
//       return best as { p: Product; shop: string; d: number } | null;
//     };
//     let hoverId = '', lastHover = 0;
//     const hoverCheck = (e: PointerEvent) => {
//       if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
//       const now = performance.now(); if (now - lastHover < 70) return; lastHover = now;
//       const h = pickAt(e.clientX, e.clientY), id = h ? h.p.id : '';
//       if (id !== hoverId) { hoverId = id; setHover(h ? { name: h.p.name, price: h.p.price } : null); el.style.cursor = h ? 'pointer' : 'grab'; }
//     };
//     const onDown = (e: PointerEvent) => {
//       if (down) return;
//       down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() }; sunCmdRef.current = false;
//       el.setPointerCapture(e.pointerId);
//     };
//     const onMove = (e: PointerEvent) => {
//       if (!down) { if (e.pointerType === 'mouse') hoverCheck(e); return; }
//       if (e.pointerId !== down.id) return;
//       const dx = e.clientX - down.x, dy = e.clientY - down.y;
//       down.x = e.clientX; down.y = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
//       yaw -= dx * 0.005; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.7, 1.15);
//     };
//     const onUp = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       if (down.moved < 8 && performance.now() - down.t < 500) { const h = pickAt(e.clientX, e.clientY); if (h) { setQty(1); setSelected({ ...h.p, shop: h.shop }); } }
//       down = null;
//     };
//     const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
//     el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove);
//     el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('wheel', onWheel, { passive: true });

//     const setKey = (e: KeyboardEvent, v: boolean) => {
//       const tg = (e.target as HTMLElement)?.tagName; if (tg === 'INPUT' || tg === 'SELECT') return;
//       const k = keysRef.current, key = e.key.toLowerCase();
//       if (key === 'w' || key === 'arrowup') k.f = v; if (key === 's' || key === 'arrowdown') k.b = v;
//       if (key === 'a' || key === 'arrowleft') k.l = v; if (key === 'd' || key === 'arrowright') k.r = v;
//       if (key === 'shift') k.s = v;
//       if (v && key === 'q') yaw += 0.15; if (v && key === 'e') yaw -= 0.15;
//     };
//     const kd = (e: KeyboardEvent) => setKey(e, true), ku = (e: KeyboardEvent) => setKey(e, false);
//     window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

//     const resize = () => {
//       const w = container.clientWidth || 1, h = container.clientHeight || 1;
//       camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
//     };
//     resize();
//     const ro = new ResizeObserver(resize); ro.observe(container);

//     /* ---------- মূল লুপ ---------- */
//     const R = 0.5;
//     const blocked = (x: number, z: number) => {
//       const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
//       if (shellCol.some(hit)) return true;
//       for (const b of built.values()) if (Math.abs(b.shop.z - z) < 14 && b.col.some(hit)) return true;
//       return false;
//     };
//     const clock = new THREE.Clock(), camTarget = new THREE.Vector3(), sunDir = new THREE.Vector3(), moon = new THREE.Vector3();
//     let raf = 0, lastList: Shop[] | null = null, frame = 0, firstCam = true;
//     mkShell(needBack());

//     const animate = () => {
//       raf = requestAnimationFrame(animate);
//       const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; frame++;
//       const px = player.position.x, pz = player.position.z;

//       /* দিন-রাত */
//       const D = dayRef.current; if (D.auto && !pausedRef.current) D.a += dt * 0.02;
//       const ca = Math.cos(D.a);
//       sunDir.set(ca * 0.5, Math.sin(D.a), -0.85 * ca).normalize();
//       const elv = sunDir.y, dayF = sm(-0.08, 0.3, elv), dusk = (1 - sm(0, 0.4, elv)) * sm(-0.15, 0.05, elv);
//       const zen = mix3(mix3(NZ, DZ, dayF), SZ, dusk * 0.6), hor = mix3(mix3(NH, DH, dayF), SH, dusk * 0.85);
//       const sunC = mix3([1, 0.55, 0.25], [1, 0.96, 0.86], sm(0.05, 0.5, elv));
//       skyU.zenith.value.set(zen[0], zen[1], zen[2]); skyU.horizon.value.set(hor[0], hor[1], hor[2]);
//       skyU.sunDir.value.copy(sunDir); skyU.sunCol.value.set(sunC[0], sunC[1], sunC[2]); skyU.night.value = 1 - dayF;
//       sky.position.copy(camera.position);
//       (scene.fog as THREE.Fog).color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace);
//       hemi.color.setRGB(hor[0], hor[1], hor[2], THREE.SRGBColorSpace); hemi.intensity = 0.25 + 1.45 * dayF;
//       const L = elv > 0 ? sunDir : moon.copy(sunDir).negate();
//       sun.position.set(px + L.x * 90, Math.max(8, L.y * 90), pz + L.z * 90); sun.target.position.set(px, 0, pz);
//       sun.intensity = 1.9 * sm(0, 0.4, elv) + 0.35 * sm(0, 0.3, -elv);
//       if (elv > 0) sun.color.setRGB(sunC[0], sunC[1], sunC[2], THREE.SRGBColorSpace); else sun.color.setRGB(0.55, 0.65, 1, THREE.SRGBColorSpace);
//       const cloudRGB = mix3(mix3([0.25, 0.28, 0.4], [1, 1, 1], dayF), [1, 0.7, 0.55], dusk * 0.6);

//       /* দোকান স্ট্রিমিং */
//       if (lastList !== shopsRef.current) {
//         lastList = shopsRef.current;
//         const map = new Map(lastList.map((s) => [s.id, s]));
//         [...built.keys()].forEach((id) => { const s = map.get(id); if (!s || s !== built.get(id)!.shop) drop(id); });
//         const nb = needBack(); if (nb !== shellBack) mkShell(nb);
//       }
//       let nearest: Shop | null = null, nd = Infinity;
//       for (const s of lastList) {
//         const dz = s.z - pz, b = built.get(s.id);
//         if (b) { if (dz < -105 || dz > 70) drop(s.id); continue; }
//         if (dz > -80 && dz < 45 && Math.abs(dz) < nd) { nd = Math.abs(dz); nearest = s; }
//       }
//       if (nearest && (frame % 2 === 0 || built.size < 3)) built.set((nearest as Shop).id, buildShop(nearest as Shop));

//       /* পয়েন্ট লাইট পুল */
//       const near = [...built.values()].sort((a, b) => Math.abs(a.shop.z - pz) - Math.abs(b.shop.z - pz)).slice(0, 4);
//       pool.forEach((l, i) => { const b = near[i]; if (b) { l.position.copy(b.light); l.intensity = 40 * (0.5 + 0.9 * (1 - dayF)); } else l.intensity = 0; });

//       if (tpRef.current) { player.position.set(tpRef.current.x, 0, tpRef.current.z); tpRef.current = null; firstCam = true; }

//       if (!pausedRef.current) {
//         const k = keysRef.current, j = joyRef.current;
//         let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x, iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
//         const len = Math.hypot(ix, iz);
//         if (len > 1) { ix /= len; iz /= len; }
//         if (len > 0.08) {
//           const sin = Math.sin(yaw), cos = Math.cos(yaw);
//           const mx = -sin * iz + cos * ix, mz = -cos * iz - sin * ix, sp = (k.s ? 15 : 7.5) * dt;
//           const nx = THREE.MathUtils.clamp(player.position.x + mx * sp, -27, 27);
//           if (!blocked(nx, player.position.z)) player.position.x = nx;
//           const nz = THREE.MathUtils.clamp(player.position.z + mz * sp, shellBack + 2, 29);
//           if (!blocked(player.position.x, nz)) player.position.z = nz;
//           let diff = Math.atan2(-mx, -mz) - player.rotation.y;
//           diff = Math.atan2(Math.sin(diff), Math.cos(diff));
//           player.rotation.y += diff * Math.min(1, dt * 12);
//           walk += dt * (k.s ? 13 : 9); amt = Math.min(1, amt + dt * 6);
//         } else amt = Math.max(0, amt - dt * 6);
//         me.update(walk, amt, t);
//         posRef.current = { x: player.position.x, z: player.position.z };

//         walkers.forEach((n) => {
//           if (Math.abs(n.z - pz) > 75) n.z = THREE.MathUtils.clamp(pz - 60 + Math.random() * 100, shellBack + 6, 26);
//           const nr = Math.hypot(n.x - px, n.z - pz) < 2.4;
//           n.amt += ((nr ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
//           if (!nr) { n.z += n.dir * n.sp * dt; n.ph += dt * n.sp * 3.2; if (n.z < shellBack + 6) n.dir = 1; if (n.z > 26) n.dir = -1; }
//           n.h.group.position.set(n.x, 0, n.z); n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI; n.h.update(n.ph, n.amt, t);
//         });
//         for (const b of built.values()) {
//           if (Math.abs(b.shop.z - pz) > 45) continue;
//           b.idlers.forEach((i) => { i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * 0.2; i.h.update(0, 0, t); });
//           if (frame % 3 === 0 && Math.abs(b.shop.z - pz) < 38) b.screen(t);
//         }
//         updateOutdoors(t, dt, dayF, cloudRGB);
//       }

//       /* অন্য মানুষ */
//       net.tick(performance.now());
//       net.peers.forEach((p) => {
//         let a = avatars.get(p.id);
//         if (!a) {
//           const c = [...p.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
//           const h = buildHuman({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4][c % 5], female: c % 2 === 0, style: c % 2 ? 'short' : 'long' });
//           h.group.position.set(p.x, 0, p.z); scene.add(h.group); a = { h, key: '' }; avatars.set(p.id, a);
//         }
//         const key = p.name + p.photo.length;
//         if (a.key !== key) { a.h.setName(p.name, p.photo); a.key = key; }
//         a.h.group.position.x += (p.x - a.h.group.position.x) * 0.25; a.h.group.position.z += (p.z - a.h.group.position.z) * 0.25;
//         a.h.group.rotation.y = p.r; a.h.update(p.w, p.a, t);
//       });
//       avatars.forEach((a, id) => { if (!net.peers.has(id)) { scene.remove(a.h.group); disposeTree(a.h.group); avatars.delete(id); } });

//       /* "সূর্য দেখুন" বাটন: ক্যামেরা সূর্যের দিকে ঘোরে */
//       if (sunCmdRef.current) {
//         const ty = Math.atan2(-sunDir.x, -sunDir.z), tp = THREE.MathUtils.clamp(-0.2 - Math.max(0, elv) * 0.55, -0.7, 0.2);
//         let dy = ty - yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
//         yaw += dy * 0.08; pitch += (tp - pitch) * 0.08;
//         if (Math.abs(dy) < 0.02 && Math.abs(tp - pitch) < 0.02) sunCmdRef.current = false;
//       }

//       const up = Math.max(0, -pitch), h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
//       camTarget.set(player.position.x + Math.sin(yaw) * d, Math.max(0.6, 2 + h), player.position.z + Math.cos(yaw) * d);
//       if (firstCam) { camera.position.copy(camTarget); firstCam = false; } else camera.position.lerp(camTarget, 0.12);
//       camera.lookAt(player.position.x, 2.4 + up * 14, player.position.z);
//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       cancelAnimationFrame(raf); clearInterval(timer); net.close(); meRef.current = null; ro.disconnect();
//       window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
//       el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
//       el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', onUp); el.removeEventListener('wheel', onWheel);
//       built.forEach((b) => disposeTree(b.g)); built.clear();
//       disposeTree(scene);
//       renderer.dispose();
//       if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
//     };
//   }, [loaded]);

//   /* ============================ অ্যাকশন ============================ */
//   const addSelected = () => {
//     if (!selected) return;
//     setCart((prev) => {
//       const old = prev.find((i) => i.id === selected.id);
//       if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + qty } : i));
//       return [...prev, { ...selected, count: qty }];
//     });
//     setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`); setSelected(null);
//   };
//   const changeQty = (id: string, d: number) => setCart((p) => p.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));
//   const checkout = () => {
//     if (!cart.length) return setMessage('🛒 কার্ট খালি।');
//     if (balance < total) return setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`);
//     setBalance((b) => b - total); setScore((s) => s + cartCount * 100); setCart([]); setMessage(`🎉 ${taka(total)} পেমেন্ট সফল!`);
//   };

//   const shop = shops.find((s) => s.id === sid);
//   const patchShop = (id: string, f: (s: Shop) => Shop) => setShops(shops.map((s) => (s.id === id ? f(s) : s)));
//   const addShop = () => {
//     if (shops.length >= MAX_SHOPS) return setMessage(`❌ সর্বোচ্চ ${MAX_SHOPS}টি দোকান`);
//     const slot = nextSlots(shops, 1)[0];
//     if (!slot) return setMessage('❌ আর খালি জায়গা নেই');
//     if (!ns.name.trim()) return setMessage('✏️ দোকানের নাম দিন');
//     const id = 's' + Date.now().toString(36);
//     setShops([...shops, { id, name: ns.name.trim().toUpperCase().slice(0, 18), subtitle: ns.subtitle.trim() || 'New Store', ...slot, accent: parseInt(ns.accent.slice(1), 16), style: ns.style, products: [] }]);
//     setSid(id); setNs({ ...ns, name: '', subtitle: '' }); setMessage('🏪 নতুন দোকান তৈরি হয়েছে!');
//   };
//   const addProduct = () => {
//     if (!shop) return;
//     const price = Number(np.price);
//     if (!np.name.trim() || !(price > 0)) return setMessage('✏️ পণ্যের নাম ও সঠিক দাম দিন');
//     if (shop.products.length >= MAX_PRODUCTS) return setMessage(`❌ একটি দোকানে সর্বোচ্চ ${MAX_PRODUCTS}টি পণ্য`);
//     const color = parseInt(np.color.slice(1), 16);
//     patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: 'p' + Date.now().toString(36), name: np.name.trim(), price, image: np.image || ph(np.kind, color), kind: np.kind, color }] }));
//     setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
//   };
//   const addDemo = () => {
//     const need = Math.min(100, MAX_SHOPS) - shops.length;
//     const slots = nextSlots(shops, Math.max(0, need));
//     const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
//     const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + '_x')] } : s));
//     setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
//   };
//   const teleport = (s: Shop) => { tpRef.current = { x: 0, z: s.z }; setPanel(''); setMessage(`📍 ${s.name} এর সামনে এসেছেন`); };

//   const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
//     const r = e.currentTarget.getBoundingClientRect(), max = r.width / 2 - 24;
//     let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
//     const l = Math.hypot(dx, dy);
//     if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
//     joyRef.current = { x: dx / max, y: dy / max }; setKnob({ x: dx, y: dy });
//   };
//   const joyStart = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); joyMove(e); };
//   const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

//   const filtered = shops.filter((s) => !q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()));
//   const isNight = hour < 5.5 || hour >= 18.5;

//   /* ============================ UI ============================ */
//   return (
//     <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
//       <div ref={containerRef} className="absolute inset-0" />

//       {hover && !selected && (
//         <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-30 hidden rounded-xl border border-white/10 bg-slate-950/90 px-3 py-2 text-xs md:block">
//           <div className="font-bold">{hover.name}</div><div className="font-black text-yellow-300">{taka(hover.price)}</div>
//         </div>
//       )}
//       {!hover && <div ref={tipRef} className="hidden" />}

//       <header className="pointer-events-none absolute inset-x-2 top-2 z-20 flex items-start justify-between gap-2">
//         <div className={`pointer-events-auto rounded-2xl px-3 py-2 ${glass}`}><div className="text-sm font-black md:text-lg">GRAND SHOPPING CITY</div></div>
//         <div className="pointer-events-auto flex gap-1.5">
//           <div className={`rounded-2xl px-3 py-2 text-right ${glass}`}><div className="text-[9px] text-slate-400">BALANCE</div><div className="text-sm font-black text-yellow-300">{taka(balance)}</div></div>
//           <div className={`hidden rounded-2xl px-3 py-2 text-right sm:block ${glass}`}><div className="text-[9px] text-slate-400">SCORE</div><div className="text-sm font-black text-emerald-300">{score}</div></div>
//           <button onClick={() => setPanel(panel === 'profile' ? '' : 'profile')} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Profile">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-7 w-7 rounded-full object-cover" /> : '👤'}
//           </button>
//           <button onClick={() => setPanel(panel === 'shops' ? '' : 'shops')} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Shops">🏪</button>
//           <button onClick={() => setCartOpen((v) => !v)} className={`relative rounded-2xl px-3 text-lg ${glass}`} aria-label="Cart">
//             🛒{cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-slate-950">{cartCount}</span>}
//           </button>
//           <button onClick={() => setPaused((v) => !v)} className={`rounded-2xl px-3 text-lg ${glass}`} aria-label="Pause">{paused ? '▶️' : '⏸️'}</button>
//         </div>
//       </header>

//       <aside className={`absolute left-2 top-[64px] z-20 w-[min(340px,calc(100vw-16px))] rounded-2xl p-3 ${glass} pointer-events-none`}>
//         <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Mall Assistant</div>
//         <p className="text-xs leading-5 text-slate-200">{message}</p>
//         <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-emerald-300">🟢 অনলাইন: {profile.name}{online.length ? ', ' + online.join(', ') : ''} • 🏪 {shops.length} দোকান</div>
//         <div className="pointer-events-auto mt-2 flex items-center gap-2 border-t border-white/10 pt-2 text-[11px]">
//           <button className="rounded-lg bg-white/10 px-2 py-1" onClick={() => { dayRef.current.auto = !autoDay; setAutoDay(!autoDay); }}>{autoDay ? '⏸' : '▶'}</button>
//           <span className="w-14 shrink-0">{isNight ? '🌙' : '☀️'} {fmtHour(hour)}</span>
//           <input type="range" min={0} max={24} step={0.25} value={hour} className="min-w-0 flex-1"
//             onChange={(e) => { const v = Number(e.target.value); setHour(v); dayRef.current.a = ((v - 6) / 24) * Math.PI * 2; }} />
//           <button className="rounded-lg bg-amber-400/90 px-2 py-1 text-slate-950" onClick={() => { sunCmdRef.current = true; }} aria-label="Look at sun">{isNight ? '🌙' : '☀️'} দেখুন</button>
//         </div>
//       </aside>

//       {selected && (
//         <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={() => setSelected(null)}>
//           <div className={`w-full max-w-md overflow-hidden rounded-3xl ${glass}`} onClick={(e) => e.stopPropagation()}>
//             <div className="relative">
//               <img src={selected.image} alt={selected.name} className="h-64 w-full object-cover md:h-80"
//                 onError={(e) => { (e.target as HTMLImageElement).src = ph(selected.kind, selected.color); }} />
//               <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs">{selected.shop}</span>
//               <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs" aria-label="Close">✕</button>
//             </div>
//             <div className="p-4">
//               <div className="text-xl font-black">{selected.name}</div>
//               <div className="mt-1 text-2xl font-black text-yellow-300">{taka(selected.price * qty)}</div>
//               <div className="mt-3 flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
//                   <b className="w-6 text-center">{qty}</b>
//                   <button className="h-9 w-9 rounded-lg bg-white/10" onClick={() => setQty(qty + 1)}>+</button>
//                 </div>
//                 <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950 hover:bg-cyan-400 active:scale-95">🛒 কার্টে নিন</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {panel === 'profile' && (
//         <div className={`absolute left-1/2 top-20 z-50 w-[min(92vw,360px)] -translate-x-1/2 rounded-3xl p-4 ${glass}`}>
//           <div className="flex items-center justify-between"><b>👤 আমার প্রোফাইল</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 flex items-center gap-3">
//             {profile.photo ? <img src={profile.photo} alt="" className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover" /> : <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl">👤</div>}
//             <label className={`${btn} cursor-pointer`}>ছবি বাছাই করুন
//               <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProfile({ ...profile, photo: await fileToDataUrl(f, 160) }); }} />
//             </label>
//           </div>
//           <input className={`${inp} mt-3`} maxLength={16} placeholder="আপনার নাম" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
//           <p className="mt-2 text-[11px] text-slate-400">নাম ও ছবি আপনার কার্টুনের বুকে ও মাথার উপরে দেখা যাবে। আরেকটা ট্যাবে মল খুললে সেখানেও আপনাকে দেখা যাবে।</p>
//         </div>
//       )}

//       {panel === 'shops' && (
//         <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:top-24 md:w-[400px] ${glass}`}>
//           <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
//           <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
//           <div className="mt-2 flex gap-2">
//             <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
//               {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
//             </select>
//             {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
//           </div>
//           {shop && (<>
//             <div className="mt-2 flex gap-2">
//               <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
//               <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
//             </div>
//             <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
//             <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
//               {shop.products.map((p) => (
//                 <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
//                   <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: hex(p.color) + '55' }}>{KIND_EMOJI[p.kind] ?? '🛍️'}</span>
//                   <span className="min-w-0 flex-1 truncate">{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
//                   <button className="rounded-lg bg-rose-500/20 px-2 py-1 text-rose-300" onClick={() => patchShop(shop.id, (s) => ({ ...s, products: s.products.filter((x) => x.id !== p.id) }))}>✕</button>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-2">
//               <input className={inp} placeholder="পণ্যের নাম" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
//               <div className="flex gap-2">
//                 <select className={inp} value={np.kind} onChange={(e) => setNp({ ...np, kind: e.target.value })}>
//                   {KINDS.map(([v, l, em]) => <option key={v} value={v} className="text-black">{em} {l}</option>)}
//                 </select>
//                 <input type="color" value={np.color} onChange={(e) => setNp({ ...np, color: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//               </div>
//               <div className="flex gap-2">
//                 <input className={inp} type="number" min={1} placeholder="দাম (৳)" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} />
//                 <label className={`${btn} flex cursor-pointer items-center whitespace-nowrap`}>{np.image ? '🖼️ ছবি ✓' : '🖼️ ছবি'}
//                   <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setNp({ ...np, image: await fileToDataUrl(f, 640) }); }} />
//                 </label>
//               </div>
//               <p className="text-[10px] text-slate-400">৩D আকার = ধরন + রঙ। ছবি দিলে পণ্যের বিস্তারিত ভিউয়ে দেখা যাবে; "ছবির ফ্রেম" ধরন বাছলে ছবিটা ৩D ফ্রেমেও দেখা যাবে।</p>
//               <button className={`${btn} w-full`} onClick={addProduct}>➕ পণ্য যোগ করুন</button>
//             </div>
//             <button className="mt-2 w-full rounded-xl bg-rose-500/20 py-2 text-xs font-bold text-rose-300"
//               onClick={() => { if (confirm(`"${shop.name}" মুছে ফেলবেন?`)) { const rest = shops.filter((s) => s.id !== shop.id); setShops(rest); setSid(rest[0]?.id ?? ''); } }}>🗑️ এই দোকান মুছুন</button>
//           </>)}
//           <div className="mt-4 text-[11px] font-bold text-cyan-300">নতুন দোকান খুলুন</div>
//           <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
//             <input className={inp} placeholder="দোকানের নাম" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
//             <input className={inp} placeholder="ট্যাগলাইন" value={ns.subtitle} onChange={(e) => setNs({ ...ns, subtitle: e.target.value })} />
//             <div className="flex gap-2">
//               <select className={inp} value={ns.style} onChange={(e) => setNs({ ...ns, style: e.target.value })}>
//                 {[['fashion', 'ফ্যাশন'], ['tech', 'ইলেকট্রনিক্স'], ['home', 'ফার্নিচার'], ['market', 'গ্রোসারি']].map(([v, l]) => <option key={v} value={v} className="text-black">{l}</option>)}
//               </select>
//               <input type="color" value={ns.accent} onChange={(e) => setNs({ ...ns, accent: e.target.value })} className="h-10 w-14 rounded-lg bg-transparent" />
//             </div>
//             <button className={`${btn} w-full`} onClick={addShop}>🏪 দোকান তৈরি করুন</button>
//           </div>
//         </div>
//       )}

//       {cartOpen && (
//         <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:w-80 md:rounded-3xl ${glass}`}>
//           <div className="flex items-center justify-between"><h2 className="font-black">🛒 MY CART</h2><button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
//           <div className="mt-3 space-y-2">
//             {cart.length === 0 ? <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div> : cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
//                 <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(item.kind, item.color); }} />
//                 <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{item.name}</div><div className="text-[10px] text-slate-400">{taka(item.price)}</div></div>
//                 <div className="flex items-center gap-1 text-xs">
//                   <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button><b className="w-5 text-center">{item.count}</b>
//                   <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm"><span className="text-slate-400">Total</span><b className="text-yellow-300">{taka(total)}</b></div>
//           <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">✅ Checkout</button>
//         </aside>
//       )}

//       {touch && !selected && !cartOpen && !panel && (
//         <div className="absolute bottom-6 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
//           onPointerDown={joyStart} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd}>
//           <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-cyan-400/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
//         </div>
//       )}
//       {!touch && !selected && !panel && (
//         <div className={`absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl px-5 py-3 text-xs text-slate-300 md:block ${glass}`}>
//           <b className="text-cyan-300">W A S D</b> হাঁটা • <b className="text-cyan-300">Shift</b> দৌড় • <b className="text-cyan-300">মাউস ড্র্যাগ / Q E</b> ঘোরা (উপরে টানলে আকাশ) • <b className="text-cyan-300">স্ক্রল</b> জুম • <b className="text-cyan-300">ক্লিক</b> পণ্য দেখুন
//         </div>
//       )}
//       {paused && (
//         <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
//           <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
//         </div>
//       )}
//     </main>
//   );
// }































// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// /* ------------------------------------------------------------------ */
// /*  DATA                                                               */
// /* ------------------------------------------------------------------ */

// type Product = { id: string; name: string; price: number; image: string };
// type Selected = Product & { shop: string };
// type CartItem = Selected & { count: number };

// type Shop = {
//   id: string;
//   name: string;
//   subtitle: string;
//   x: number;
//   z: number;
//   accent: number;
//   video: string;
//   products: Product[];
// };

// // Replace these with your own files, e.g. '/videos/fashion.mp4' (put them in /public/videos)
// const V = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
// const VIDEO = {
//   fashion: V + 'ForBiggerBlazes.mp4',
//   tech: V + 'ForBiggerEscapes.mp4',
//   home: V + 'ForBiggerJoyrides.mp4',
//   market: V + 'ForBiggerFun.mp4',
//   hall: V + 'ForBiggerMeltdowns.mp4',
// };

// const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
// const IMG = {
//   watch: u('photo-1523275335684-37898b6baf30'),
//   shoe: u('photo-1542291026-7eec264c27ff'),
//   sunglasses: u('photo-1511499767150-a48a237f0083'),
//   camera: u('photo-1516035069371-29a1b244cc32'),
//   headphones: u('photo-1505740420928-5e560c06d30e'),
//   phone: u('photo-1511707171634-5f897ff02aa9'),
//   shirt: u('photo-1521572163474-6864f9cf17ab'),
//   jacket: u('photo-1551488831-00ddcb6c6bd3'),
//   bag: u('photo-1553062407-98eeb64c6a62'),
//   chair: u('photo-1598300042247-d088f8ab3a91'),
//   lamp: u('photo-1507473885765-e6ed057f782c'),
//   coffee: u('photo-1495474472287-4d71bcdd2085'),
//   perfume: u('photo-1541643600914-78b084683601'),
//   chocolate: u('photo-1548907040-4d42c6d3a0b0'),
//   honey: u('photo-1471943311424-646960669fbc'),
//   rice: u('photo-1586201375761-83865001e31c'),
// };

// const SHOPS: Shop[] = [
//   {
//     id: 'fashion', name: 'NOVA FASHION', subtitle: 'Premium Fashion & Lifestyle',
//     x: -17, z: -25, accent: 0x7c3aed, video: VIDEO.fashion,
//     products: [
//       { id: 'f1', name: 'Premium T-Shirt', price: 1800, image: IMG.shirt },
//       { id: 'f2', name: 'Urban Jacket', price: 5200, image: IMG.jacket },
//       { id: 'f3', name: 'Classic Sunglasses', price: 2400, image: IMG.sunglasses },
//       { id: 'f4', name: 'Leather Bag', price: 3900, image: IMG.bag },
//       { id: 'f5', name: 'Running Sneaker', price: 4200, image: IMG.shoe },
//       { id: 'f6', name: 'Signature Perfume', price: 3100, image: IMG.perfume },
//       { id: 'f7', name: 'Smart Casual Shirt', price: 2600, image: IMG.shirt },
//       { id: 'f8', name: 'Premium Coat', price: 7800, image: IMG.jacket },
//     ],
//   },
//   {
//     id: 'tech', name: 'TECHHUB', subtitle: 'Smart Devices & Electronics',
//     x: 17, z: -25, accent: 0x0891b2, video: VIDEO.tech,
//     products: [
//       { id: 't1', name: 'Smart Watch', price: 4500, image: IMG.watch },
//       { id: 't2', name: 'Mirrorless Camera', price: 62000, image: IMG.camera },
//       { id: 't3', name: 'Wireless Headphones', price: 6800, image: IMG.headphones },
//       { id: 't4', name: 'Flagship Phone', price: 92000, image: IMG.phone },
//       { id: 't5', name: 'Bluetooth Speaker', price: 3900, image: IMG.headphones },
//       { id: 't6', name: 'Action Camera', price: 18500, image: IMG.camera },
//       { id: 't7', name: 'Premium Watch', price: 8500, image: IMG.watch },
//       { id: 't8', name: 'Smart Phone Pro', price: 72000, image: IMG.phone },
//     ],
//   },
//   {
//     id: 'home', name: 'URBAN HOME', subtitle: 'Furniture & Home Decor',
//     x: -17, z: -65, accent: 0xd97706, video: VIDEO.home,
//     products: [
//       { id: 'h1', name: 'Designer Chair', price: 8500, image: IMG.chair },
//       { id: 'h2', name: 'Modern Table Lamp', price: 3200, image: IMG.lamp },
//       { id: 'h3', name: 'Luxury Lounge Chair', price: 14500, image: IMG.chair },
//       { id: 'h4', name: 'Premium Lamp', price: 5200, image: IMG.lamp },
//       { id: 'h5', name: 'Home Accent Chair', price: 9200, image: IMG.chair },
//       { id: 'h6', name: 'Designer Light', price: 4600, image: IMG.lamp },
//     ],
//   },
//   {
//     id: 'market', name: 'FRESH MART', subtitle: 'Premium Grocery & Food',
//     x: 17, z: -65, accent: 0x16a34a, video: VIDEO.market,
//     products: [
//       { id: 'm1', name: 'Pure Organic Honey', price: 950, image: IMG.honey },
//       { id: 'm2', name: 'Imported Chocolate', price: 1500, image: IMG.chocolate },
//       { id: 'm3', name: 'Premium Rice 10KG', price: 1800, image: IMG.rice },
//       { id: 'm4', name: 'Fresh Coffee', price: 1250, image: IMG.coffee },
//       { id: 'm5', name: 'Dark Chocolate', price: 950, image: IMG.chocolate },
//       { id: 'm6', name: 'Arabica Coffee', price: 1650, image: IMG.coffee },
//       { id: 'm7', name: 'Natural Honey', price: 1150, image: IMG.honey },
//       { id: 'm8', name: 'Premium Basmati Rice', price: 2400, image: IMG.rice },
//     ],
//   },
// ];

// const taka = (n: number) => '৳' + n.toLocaleString();

// /* ------------------------------------------------------------------ */
// /*  COMPONENT                                                          */
// /* ------------------------------------------------------------------ */

// /* ------------------------------------------------------------------ */
// /*  REALISTIC HUMAN (jointed legs/arms, face, hair, clothes)           */
// /* ------------------------------------------------------------------ */

// type Human = { group: THREE.Group; update: (phase: number, amt: number, t: number) => void };
// type HumanOpts = { skin?: number; shirt?: number; pants?: number; hair?: number; shoe?: number; female?: boolean; skirt?: boolean; mannequin?: boolean };

// const buildHuman = (o: HumanOpts = {}): Human => {
//   const std = (c: number, r = 0.65, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
//   const man = !!o.mannequin;
//   const skin = std(man ? 0xe9eaf0 : o.skin ?? 0xc98262, man ? 0.25 : 0.62);
//   const shirt = std(o.shirt ?? 0x2563eb, 0.75);
//   const pants = std(o.pants ?? 0x172033, 0.8);
//   const hairM = std(o.hair ?? 0x17120f, 0.8);
//   const shoeM = std(o.shoe ?? 0x0b0f17, 0.4, 0.2);
//   const sole = std(0xf1f5f9, 0.6);
//   const white = std(0xffffff, 0.3);
//   const dark = std(0x0a0a0a, 0.3);
//   const lip = std(0x9a4a4a, 0.5);

//   const group = new THREE.Group();
//   const root = new THREE.Group();
//   group.add(root);
//   if (o.female) group.scale.setScalar(0.95);

//   const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
//     const m = new THREE.Mesh(geo, mat);
//     m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true;
//     parent.add(m);
//     return m;
//   };

//   // torso, pelvis, belt
//   add(root, new THREE.CapsuleGeometry(o.female ? 0.33 : 0.37, 0.5, 6, 16), shirt, 0, 2.35, 0, 1, 1, 0.62);
//   add(root, new THREE.SphereGeometry(0.3, 16, 12), pants, 0, 1.72, 0, o.female ? 1.2 : 1.05, 0.7, 0.75);
//   add(root, new THREE.CylinderGeometry(0.34, 0.34, 0.07, 20), dark, 0, 1.82, 0, 1, 1, 0.65);
//   if (o.female && o.skirt) add(root, new THREE.CylinderGeometry(0.3, 0.5, 0.75, 24), pants, 0, 1.38, 0, 1, 1, 0.8);

//   const makeArm = (side: number) => {
//     const sh = new THREE.Group();
//     sh.position.set(side * (o.female ? 0.48 : 0.53), 2.82, 0);
//     root.add(sh);
//     add(sh, new THREE.SphereGeometry(0.13, 12, 10), shirt);
//     add(sh, new THREE.CapsuleGeometry(0.1, 0.34, 4, 10), skin, 0, -0.32, 0);
//     add(sh, new THREE.CapsuleGeometry(0.115, 0.16, 4, 10), shirt, 0, -0.18, 0);
//     const el = new THREE.Group();
//     el.position.y = -0.6;
//     sh.add(el);
//     add(el, new THREE.SphereGeometry(0.09, 10, 8), skin);
//     add(el, new THREE.CapsuleGeometry(0.082, 0.32, 4, 10), skin, 0, -0.3, 0);
//     add(el, new THREE.SphereGeometry(0.095, 10, 8), skin, 0, -0.64, 0, 1, 1.2, 0.7);
//     return { sh, el };
//   };

//   const makeLeg = (side: number) => {
//     const hip = new THREE.Group();
//     hip.position.set(side * 0.24, 1.68, 0);
//     root.add(hip);
//     add(hip, new THREE.CapsuleGeometry(0.15, 0.52, 4, 12), pants, 0, -0.4, 0);
//     const kn = new THREE.Group();
//     kn.position.y = -0.8;
//     hip.add(kn);
//     add(kn, new THREE.SphereGeometry(0.125, 10, 8), pants);
//     add(kn, new THREE.CapsuleGeometry(0.12, 0.46, 4, 12), pants, 0, -0.38, 0);
//     const foot = new THREE.Group();
//     foot.position.y = -0.77;
//     kn.add(foot);
//     add(foot, new THREE.BoxGeometry(0.28, 0.16, 0.62), shoeM, 0, 0, -0.12);
//     add(foot, new THREE.BoxGeometry(0.29, 0.05, 0.63), sole, 0, -0.08, -0.12);
//     return { hip, kn };
//   };

//   const AL = makeArm(-1), AR = makeArm(1), LL = makeLeg(-1), LR = makeLeg(1);

//   // neck + head (front faces -Z)
//   add(root, new THREE.CylinderGeometry(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
//   const head = new THREE.Group();
//   head.position.set(0, 3.42, 0);
//   root.add(head);
//   add(head, new THREE.SphereGeometry(0.3, 28, 22), skin, 0, 0, 0, 0.9, 1.08, 0.98);
//   if (!man) {
//     for (const s of [-1, 1]) {
//       add(head, new THREE.SphereGeometry(0.05, 12, 10), white, s * 0.11, 0.04, -0.26, 1, 0.8, 0.5);
//       add(head, new THREE.SphereGeometry(0.026, 10, 8), dark, s * 0.11, 0.04, -0.285);
//       add(head, new THREE.BoxGeometry(0.11, 0.016, 0.02), hairM, s * 0.11, 0.12, -0.27);
//       add(head, new THREE.SphereGeometry(0.05, 8, 8), skin, s * 0.275, 0, 0, 0.5, 1, 0.8);
//     }
//     add(head, new THREE.SphereGeometry(0.04, 10, 8), skin, 0, -0.04, -0.3, 0.8, 1.1, 1);
//     add(head, new THREE.BoxGeometry(0.12, 0.018, 0.02), lip, 0, -0.14, -0.275);
//     add(head, new THREE.SphereGeometry(0.315, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.02, 0.02, 0.93, 1.1, 1.0);
//     add(head, new THREE.SphereGeometry(0.29, 16, 12), hairM, 0, -0.02, 0.08, 0.92, 1.0, 0.9);
//     if (o.female) add(head, new THREE.CapsuleGeometry(0.27, 0.45, 6, 12), hairM, 0, -0.32, 0.1, 0.95, 1, 0.7);
//   }

//   const update = (phase: number, amt: number, t: number) => {
//     const s = Math.sin(phase) * 0.75 * amt;
//     LL.hip.rotation.x = s; LR.hip.rotation.x = -s;
//     LL.kn.rotation.x = -Math.max(0, Math.cos(phase)) * 0.9 * amt;
//     LR.kn.rotation.x = -Math.max(0, -Math.cos(phase)) * 0.9 * amt;
//     AL.sh.rotation.x = -s * 0.7; AR.sh.rotation.x = s * 0.7;
//     AL.el.rotation.x = 0.15 + amt * 0.5 * Math.max(0, -s);
//     AR.el.rotation.x = 0.15 + amt * 0.5 * Math.max(0, s);
//     root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt;
//     root.rotation.x = -0.04 * amt;
//     root.rotation.y = s * 0.12;
//     root.scale.y = 1 + Math.sin(t * 1.6) * 0.004;
//     head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
//   };
//   update(0, 0, 0);
//   return { group, update };
// };

// export default function ModernRealisticMall() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const keysRef = useRef({ f: false, b: false, l: false, r: false });
//   const joyRef = useRef({ x: 0, y: 0 });
//   const pausedRef = useRef(false);

//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [balance, setBalance] = useState(100000);
//   const [score, setScore] = useState(0);
//   const [selected, setSelected] = useState<Selected | null>(null);
//   const [message, setMessage] = useState('🏬 মলের ভেতরে হাঁটুন, যেকোনো পণ্যে ট্যাপ/ক্লিক করে কিনুন।');
//   const [touch, setTouch] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [cartOpen, setCartOpen] = useState(false);
//   const [knob, setKnob] = useState({ x: 0, y: 0 });

//   const total = cart.reduce((s, i) => s + i.price * i.count, 0);
//   const cartCount = cart.reduce((s, i) => s + i.count, 0);

//   useEffect(() => { pausedRef.current = paused; }, [paused]);

//   useEffect(() => {
//     const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
//     check();
//     setCartOpen(window.innerWidth >= 768);
//     window.addEventListener('resize', check);
//     return () => window.removeEventListener('resize', check);
//   }, []);

//   /* ------------------------------ 3D SCENE ------------------------------ */
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x070b14);
//     scene.fog = new THREE.FogExp2(0x070b14, 0.007);

//     const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

//     const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace;
//     renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     renderer.toneMappingExposure = 1.1;
//     container.appendChild(renderer.domElement);
//     renderer.domElement.style.touchAction = 'none';
//     const pmrem = new THREE.PMREMGenerator(renderer);
//     scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
//     (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.55;

//     /* ---------- lights ---------- */
//     scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1a2030, 1.6));
//     const sun = new THREE.DirectionalLight(0xffffff, 1.4);
//     sun.position.set(20, 50, 20);
//     sun.castShadow = true;
//     sun.shadow.mapSize.set(2048, 2048);
//     Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 40, bottom: -130, far: 160 });
//     sun.target.position.set(0, 0, -45);
//     scene.add(sun, sun.target);

//     /* ---------- helpers ---------- */
//     const colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
//     const hitboxes: THREE.Mesh[] = [];
//     const floaters: { obj: THREE.Object3D; base: number; i: number }[] = [];
//     const idlers: { h: Human; base: number; sway: number }[] = [];
//     const spinners: THREE.Object3D[] = [];
//     const textureLoader = new THREE.TextureLoader();
//     textureLoader.setCrossOrigin('anonymous');
//     const imageCache = new Map<string, THREE.Texture>();

//     const loadImage = (url: string, targetAspect: number) => {
//       const hit = imageCache.get(url);
//       if (hit) return hit;
//       const tex = textureLoader.load(url, (t) => {
//         const img = t.image as HTMLImageElement;
//         const a = img.width / img.height;
//         if (a > targetAspect) { t.repeat.x = targetAspect / a; t.offset.x = (1 - t.repeat.x) / 2; }
//         else { t.repeat.y = a / targetAspect; t.offset.y = (1 - t.repeat.y) / 2; }
//       });
//       tex.colorSpace = THREE.SRGBColorSpace;
//       imageCache.set(url, tex);
//       return tex;
//     };

//     const tileTexture = (a: string, b: string, line: string, rx: number, ry: number) => {
//       const c = document.createElement('canvas');
//       c.width = c.height = 256;
//       const x = c.getContext('2d')!;
//       x.fillStyle = a; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128);
//       x.strokeStyle = line; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256);
//       const t = new THREE.CanvasTexture(c);
//       t.wrapS = t.wrapT = THREE.RepeatWrapping;
//       t.repeat.set(rx, ry);
//       t.anisotropy = 8;
//       t.colorSpace = THREE.SRGBColorSpace;
//       return t;
//     };

//     const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

//     const signTexture = (title: string, sub: string, accent: number) => {
//       const c = document.createElement('canvas');
//       c.width = 1024; c.height = 280;
//       const x = c.getContext('2d')!;
//       x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280);
//       x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
//       x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center';
//       x.fillText(title, 512, 125);
//       x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial';
//       x.fillText(sub, 512, 190);
//       const t = new THREE.CanvasTexture(c);
//       t.colorSpace = THREE.SRGBColorSpace;
//       return t;
//     };

//     const priceTexture = (name: string, price: number) => {
//       const c = document.createElement('canvas');
//       c.width = 640; c.height = 190;
//       const x = c.getContext('2d')!;
//       x.fillStyle = '#050b16'; x.fillRect(0, 0, 640, 190);
//       x.fillStyle = '#fff'; x.font = 'bold 34px Arial'; x.textAlign = 'center';
//       x.fillText(name.length > 24 ? name.slice(0, 23) + '…' : name, 320, 70);
//       x.fillStyle = '#facc15'; x.font = '900 52px Arial';
//       x.fillText(`৳ ${price.toLocaleString()}`, 320, 140);
//       const t = new THREE.CanvasTexture(c);
//       t.colorSpace = THREE.SRGBColorSpace;
//       return t;
//     };

//     /* ---------- video screens (with animated fallback) ---------- */
//     type Screen = { video: HTMLVideoElement; obj: THREE.Object3D; failed: boolean; draw: (t: number) => void; tex: THREE.CanvasTexture };
//     const screens: Screen[] = [];

//     const addScreen = (parent: THREE.Object3D, src: string, w: number, h: number, title: string, accent: number, x: number, y: number, z: number) => {
//       const video = document.createElement('video');
//       video.src = src;
//       video.crossOrigin = 'anonymous';
//       video.loop = true;
//       video.muted = true;
//       video.playsInline = true;
//       video.preload = 'auto';
//       video.setAttribute('playsinline', '');
//       const vTex = new THREE.VideoTexture(video);
//       vTex.colorSpace = THREE.SRGBColorSpace;

//       const fc = document.createElement('canvas');
//       fc.width = 640; fc.height = Math.round((640 * h) / w);
//       const fx = fc.getContext('2d')!;
//       const fTex = new THREE.CanvasTexture(fc);
//       fTex.colorSpace = THREE.SRGBColorSpace;
//       const draw = (t: number) => {
//         const g = fx.createLinearGradient(0, 0, fc.width, fc.height);
//         g.addColorStop(0, hex(accent));
//         g.addColorStop(1, '#0b1220');
//         fx.fillStyle = g; fx.fillRect(0, 0, fc.width, fc.height);
//         fx.fillStyle = 'rgba(255,255,255,.12)';
//         fx.beginPath(); fx.arc(fc.width * (0.5 + 0.35 * Math.sin(t * 0.8)), fc.height / 2, fc.height * 0.4, 0, 7); fx.fill();
//         fx.fillStyle = '#fff'; fx.font = '900 54px Arial'; fx.textAlign = 'center';
//         fx.fillText(title, fc.width / 2, fc.height / 2 + 18);
//         fTex.needsUpdate = true;
//       };

//       const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x05080f, metalness: 0.8, roughness: 0.3 }));
//       frame.position.set(x, y, z);
//       const mat = new THREE.MeshBasicMaterial({ map: vTex, toneMapped: false });
//       const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
//       plane.position.z = 0.17;
//       frame.add(plane);
//       parent.add(frame);

//       const s: Screen = { video, obj: frame, failed: false, draw, tex: fTex };
//       video.addEventListener('error', () => {
//         s.failed = true;
//         mat.map = fTex;
//         mat.needsUpdate = true;
//       });
//       video.play().catch(() => {});
//       screens.push(s);
//     };

//     /* ---------- floor, walls, ceiling ---------- */
//     const floor = new THREE.Mesh(
//       new THREE.PlaneGeometry(80, 140),
//       new THREE.MeshStandardMaterial({ map: tileTexture('#2a3447', '#303b50', '#1a2232', 20, 35), roughness: 0.25, metalness: 0.15 })
//     );
//     floor.rotation.x = -Math.PI / 2;
//     floor.position.set(0, 0, -45);
//     floor.receiveShadow = true;
//     scene.add(floor);

//     const runner = new THREE.Mesh(
//       new THREE.PlaneGeometry(9, 140),
//       new THREE.MeshStandardMaterial({ color: 0x1b2638, roughness: 0.15, metalness: 0.3 })
//     );
//     runner.rotation.x = -Math.PI / 2;
//     runner.position.set(0, 0.02, -45);
//     scene.add(runner);

//     const wallMat = new THREE.MeshStandardMaterial({ color: 0x10172a, roughness: 0.4, metalness: 0.5 });
//     const outerL = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 140), wallMat);
//     outerL.position.set(-40.5, 7, -45);
//     const outerR = outerL.clone(); outerR.position.x = 40.5;
//     const outerB = new THREE.Mesh(new THREE.BoxGeometry(82, 14, 1), wallMat);
//     outerB.position.set(0, 7, -115.5);
//     scene.add(outerL, outerR, outerB);

//     const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(80, 140), new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.9 }));
//     ceiling.rotation.x = Math.PI / 2;
//     ceiling.position.set(0, 14, -45);
//     scene.add(ceiling);

//     const glowMat = new THREE.MeshStandardMaterial({ color: 0xeaf8ff, emissive: 0xbde9ff, emissiveIntensity: 2.2 });
//     for (let z = 10; z > -112; z -= 10) {
//       const bar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 0.5), glowMat);
//       bar.position.set(0, 13.85, z);
//       scene.add(bar);
//       const stripe = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
//       stripe.position.set(0, 0.04, z - 5);
//       scene.add(stripe);
//     }

//     // end-wall big screen
//     addScreen(scene, VIDEO.hall, 28, 9, 'GRAND MALL', 0x38bdf8, 0, 7, -114.8);

//     // entrance arch
//     const archMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.25 });
//     const beam = new THREE.Mesh(new THREE.BoxGeometry(30, 4.5, 1.2), archMat);
//     beam.position.set(0, 11.7, 10);
//     scene.add(beam);
//     for (const px of [-14.4, 14.4]) {
//       const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 1.2), archMat);
//       p.position.set(px, 7, 10);
//       p.castShadow = true;
//       scene.add(p);
//     }
//     const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8) }));
//     arch.position.set(0, 11.7, 10.65);
//     scene.add(arch);
//     const archBack = arch.clone(); archBack.rotation.y = Math.PI; archBack.position.z = 9.35;
//     scene.add(archBack);

//     // plants & benches
//     const potMat = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.6 });
//     const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f8a4c, roughness: 0.8 });
//     const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.7 });
//     const addCollider = (minX: number, maxX: number, minZ: number, maxZ: number) => colliders.push({ minX, maxX, minZ, maxZ });
//     for (const sx of [-5.2, 5.2]) {
//       for (const pz of [-8, -45, -85]) {
//         const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 1.2, 16), potMat);
//         pot.position.set(sx, 0.6, pz); pot.castShadow = true;
//         const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), leafMat);
//         leaf.position.set(sx, 2.1, pz); leaf.castShadow = true;
//         scene.add(pot, leaf);
//         addCollider(sx - 0.8, sx + 0.8, pz - 0.8, pz + 0.8);
//       }
//       for (const bz of [-43, -47]) {
//         const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 2.6), woodMat);
//         seat.position.set(sx * 0.82, 0.9, bz + (bz < -45 ? -0.2 : 0.2) - 0.0);
//         seat.position.z = bz * 1 + (bz === -43 ? 0 : 0);
//         seat.castShadow = true;
//         scene.add(seat);
//       }
//     }

//     /* ---------- shops ---------- */
//     SHOPS.forEach((shop, si) => {
//       const g = new THREE.Group();
//       g.position.set(shop.x, 0, shop.z);
//       g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2; // door faces the walkway
//       scene.add(g);

//       const accentHex = hex(shop.accent);
//       const accentMat = new THREE.MeshStandardMaterial({ color: shop.accent, roughness: 0.3, metalness: 0.5 });
//       const darkMat = new THREE.MeshStandardMaterial({ color: 0x131a2a, roughness: 0.35, metalness: 0.6 });
//       const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.85 });
//       const glassMat = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.3, depthWrite: false });

//       const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
//         const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
//         mesh.position.set(x, y, z);
//         mesh.castShadow = shadow; mesh.receiveShadow = true;
//         g.add(mesh);
//         return mesh;
//       };

//       // convert local box -> world AABB collider
//       const solid = (lx: number, lz: number, w: number, d: number) => {
//         const c = Math.round(Math.cos(g.rotation.y));
//         const s = Math.round(Math.sin(g.rotation.y));
//         const wx = shop.x + lx * c + lz * s;
//         const wz = shop.z - lx * s + lz * c;
//         const sw = Math.abs(w * c) + Math.abs(d * s);
//         const sd = Math.abs(w * s) + Math.abs(d * c);
//         addCollider(wx - sw / 2, wx + sw / 2, wz - sd / 2, wz + sd / 2);
//       };

//       // floor + accent carpet
//       const sf = new THREE.Mesh(
//         new THREE.PlaneGeometry(16, 20),
//         new THREE.MeshStandardMaterial({ map: tileTexture('#d8dde6', '#c4cad6', '#9aa3b2', 8, 10), roughness: 0.3, metalness: 0.1 })
//       );
//       sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true;
//       g.add(sf);
//       const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 19), new THREE.MeshStandardMaterial({ color: shop.accent, roughness: 0.9 }));
//       carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.05, 0);
//       g.add(carpet);

//       // walls (solid)
//       box(0.4, 10, 20, accentMat, -7.9, 5, 0); solid(-7.9, 0, 0.4, 20);
//       box(0.4, 10, 20, accentMat, 7.9, 5, 0); solid(7.9, 0, 0.4, 20);
//       box(16, 10, 0.4, darkMat, 0, 5, -9.9); solid(0, -9.9, 16, 0.4);

//       // storefront: header, glass, door frame
//       box(16, 3.4, 0.5, darkMat, 0, 8.3, 10);
//       for (const gx of [-5, 5]) {
//         const gl = new THREE.Mesh(new THREE.BoxGeometry(6, 6.6, 0.1), glassMat);
//         gl.position.set(gx, 3.3, 10); g.add(gl);
//         solid(gx, 9.9, 6, 0.4);
//       }
//       for (const fx of [-2, 2]) box(0.3, 6.6, 0.4, metalMat, fx, 3.3, 10);
//       const sign = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }));
//       sign.position.set(0, 8.3, 10.27);
//       g.add(sign);

//       // lights
//       const pl = new THREE.PointLight(0xfff1dc, 45, 28, 2);
//       pl.position.set(0, 8, 0);
//       g.add(pl);
//       for (const lz of [-5, 3]) box(13, 0.12, 0.35, glowMat, 0, 9.7, lz, false);

//       // back wall video screen
//       addScreen(g, shop.video, 9, 5, shop.name, shop.accent, 0, 6.1, -9.5);
//       box(9.5, 0.12, 0.2, new THREE.MeshBasicMaterial({ color: shop.accent }), 0, 3.4, -9.55, false);

//       // ---- modern finishes ----
//       const slatC = document.createElement('canvas');
//       slatC.width = 256; slatC.height = 64;
//       const sc = slatC.getContext('2d')!;
//       sc.fillStyle = '#1f1710'; sc.fillRect(0, 0, 256, 64);
//       for (let k = 0; k < 16; k++) { sc.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; sc.fillRect(k * 16, 0, 11, 64); }
//       const slatTex = new THREE.CanvasTexture(slatC);
//       slatTex.wrapS = slatTex.wrapT = THREE.RepeatWrapping;
//       slatTex.repeat.set(2, 1);
//       slatTex.colorSpace = THREE.SRGBColorSpace;
//       const slat = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 9.4), new THREE.MeshStandardMaterial({ map: slatTex, roughness: 0.55 }));
//       slat.position.set(0, 4.7, -9.68);
//       g.add(slat);

//       const ledMat = new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 2.5 });
//       for (const s of [-1, 1]) box(0.12, 0.15, 19.4, ledMat, s * 7.65, 9.6, 0, false);
//       box(15.6, 0.15, 0.12, ledMat, 0, 9.6, -9.65, false);
//       box(12.9, 0.1, 0.1, ledMat, 0, 9.85, 10.3, false);
//       box(12.9, 0.1, 0.1, ledMat, 0, 6.75, 10.3, false);
//       for (const rz of [-6, 0, 6]) {
//         const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.05, 8, 40), ledMat);
//         ring.rotation.x = Math.PI / 2; ring.position.set(0, 9.0, rz);
//         g.add(ring);
//       }

//       const fabric = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
//       if (shop.id === 'fashion') {
//         [-4.2, 4.2].forEach((mx, k) => {
//           box(1.5, 0.15, 1.5, darkMat, mx, 0.075, -7);
//           const mq = buildHuman({ mannequin: true, shirt: k ? shop.accent : 0xf8fafc, pants: k ? 0x1e293b : 0x334155, female: !!k, skirt: !!k });
//           mq.group.position.set(mx, 0.15, -7);
//           mq.group.rotation.y = Math.PI;
//           g.add(mq.group);
//           solid(mx, -7, 1.5, 1.5);
//         });
//       } else if (shop.id === 'tech') {
//         const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.0, 24), darkMat);
//         ped.position.set(0, 0.5, -7);
//         g.add(ped);
//         const holo = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true }));
//         holo.position.set(0, 2.3, -7);
//         g.add(holo);
//         spinners.push(holo);
//         solid(0, -7, 1.7, 1.7);
//       } else if (shop.id === 'home') {
//         const rug = new THREE.Mesh(new THREE.CircleGeometry(2.9, 40), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 1 }));
//         rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.07, -6.4);
//         g.add(rug);
//         box(4.2, 0.7, 1.6, fabric, 0, 0.35, -7.1);
//         box(4.2, 1.3, 0.35, fabric, 0, 1.15, -7.8);
//         for (const ax of [-2.1, 2.1]) box(0.35, 1.0, 1.6, fabric, ax, 0.5, -7.1);
//         const cush = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 1 });
//         for (const cx2 of [-1, 1]) box(1.8, 0.3, 1.2, cush, cx2, 0.85, -7.0);
//         box(0.08, 3.2, 0.08, metalMat, -4.8, 1.6, -7.5);
//         box(0.7, 0.6, 0.7, new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffd58a, emissiveIntensity: 1.5 }), -4.8, 3.4, -7.5, false);
//         solid(0, -7.3, 4.6, 1.9);
//       } else {
//         [-4, 0, 4].forEach((cx3, k) => {
//           box(2.4, 0.7, 1.3, woodMat, cx3, 0.35, -7.3);
//           solid(cx3, -7.3, 2.4, 1.3);
//           const fm = new THREE.MeshStandardMaterial({ color: [0xf97316, 0x22c55e, 0xef4444][k], roughness: 0.5 });
//           for (let q = 0; q < 8; q++) {
//             const f = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), fm);
//             f.position.set(cx3 - 0.9 + (q % 4) * 0.6, 0.85, -7.3 + (q < 4 ? -0.3 : 0.3));
//             f.castShadow = true;
//             g.add(f);
//           }
//         });
//       }

//       // staff + customer inside the shop
//       const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: si % 2 ? 0xb87555 : 0xe0ac8a, hair: 0x1a1410, female: si % 2 === 0 });
//       cashier.group.position.set(-5.4, 0, 4.6);
//       cashier.group.rotation.y = Math.PI;
//       g.add(cashier.group);
//       idlers.push({ h: cashier, base: Math.PI, sway: 0.12 });
//       solid(-5.4, 4.6, 0.8, 0.8);
//       const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][si], pants: 0x1f2937, skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][si], hair: 0x201a14, female: si % 2 === 1, skirt: si === 1 });
//       browser.group.position.set(3.6, 0, -0.8);
//       g.add(browser.group);
//       idlers.push({ h: browser, base: 0, sway: 0.35 });
//       solid(3.6, -0.8, 0.9, 0.9);

//       // wall shelves with merchandise (instanced)
//       const decoGeo = new THREE.BoxGeometry(1, 1, 1);
//       const decoMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 });
//       const decoCount = 2 * 3 * 12;
//       const deco = new THREE.InstancedMesh(decoGeo, decoMat, decoCount);
//       const m4 = new THREE.Matrix4();
//       const col = new THREE.Color();
//       let di = 0;
//       for (const side of [-1, 1]) {
//         for (let lv = 0; lv < 3; lv++) {
//           const y = 1.6 + lv * 2.0;
//           box(0.9, 0.12, 17, metalMat, side * 7.4, y, 0);
//           for (let k = 0; k < 12; k++) {
//             const hh = 0.5 + ((k * 7 + lv * 3) % 5) * 0.18;
//             const ww = 0.5 + ((k * 3 + lv) % 3) * 0.2;
//             m4.compose(
//               new THREE.Vector3(side * 7.4, y + 0.06 + hh / 2, -7.6 + k * 1.35),
//               new THREE.Quaternion(),
//               new THREE.Vector3(0.6, hh, ww)
//             );
//             deco.setMatrixAt(di, m4);
//             col.setHSL((((shop.accent >> 8) % 360) / 360 + k * 0.07 + lv * 0.11) % 1, 0.55, 0.5);
//             deco.setColorAt(di, col);
//             di++;
//           }
//         }
//       }
//       deco.castShadow = true;
//       g.add(deco);

//       // checkout counter
//       box(3.6, 1.4, 1.3, darkMat, -5.4, 0.7, 6); solid(-5.4, 6, 3.6, 1.3);
//       box(3.7, 0.12, 1.4, new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 0.6 }), -5.4, 1.45, 6, false);

//       // display tables + product cards
//       const tableMat = new THREE.MeshStandardMaterial({ color: 0xe5e9f0, roughness: 0.25, metalness: 0.2 });
//       const cols = [-5.3, -1.8, 1.8, 5.3];
//       shop.products.forEach((p, i) => {
//         const cx = cols[i % 4];
//         const cz = i < 4 ? -3.5 : 2.2;

//         box(2.0, 1.6, 1.2, tableMat, cx, 0.8, cz); solid(cx, cz, 2.0, 1.2);
//         box(2.05, 0.08, 1.25, new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 0.8 }), cx, 1.62, cz, false);

//         const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), metalMat);
//         post.position.set(cx, 1.95, cz); g.add(post);

//         const card = new THREE.Group();
//         card.position.set(cx, 3.1, cz);
//         const fr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.7, 0.1), darkMat);
//         const im = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.5), new THREE.MeshBasicMaterial({ map: loadImage(p.image, 1.2), color: 0xffffff }));
//         im.position.z = 0.06;
//         card.add(fr, im);
//         g.add(card);
//         floaters.push({ obj: card, base: 3.1, i });

//         const label = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.56), new THREE.MeshBasicMaterial({ map: priceTexture(p.name, p.price) }));
//         label.position.set(cx, 0.85, cz + 0.61);
//         g.add(label);

//         const hit = new THREE.Mesh(
//           new THREE.BoxGeometry(2.2, 3.8, 1.4),
//           new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
//         );
//         hit.position.set(cx, 1.9, cz);
//         hit.userData = { product: p, shop: shop.name };
//         g.add(hit);
//         hitboxes.push(hit);
//       });
//     });

//     /* ---------- player + walking shoppers ---------- */
//     const player = new THREE.Group();
//     player.position.set(0, 0, 18);
//     scene.add(player);
//     const me = buildHuman({ shirt: 0x2563eb, pants: 0x1e293b, skin: 0xc98262, hair: 0x17120f });
//     player.add(me.group);

//     const looks: HumanOpts[] = [
//       { shirt: 0xef4444, pants: 0x1f2937, skin: 0xb87555, hair: 0x111111 },
//       { shirt: 0xf8fafc, pants: 0x334155, skin: 0xe0ac8a, hair: 0x3b2314, female: true, skirt: true },
//       { shirt: 0x16a34a, pants: 0x0f172a, skin: 0x8d5a3b, hair: 0x0a0a0a },
//       { shirt: 0xfacc15, pants: 0x1e3a8a, skin: 0xd9a07c, hair: 0x5b3a1e, female: true },
//       { shirt: 0x8b5cf6, pants: 0x111827, skin: 0xc98262, hair: 0x1a1a1a },
//       { shirt: 0x0ea5e9, pants: 0x44403c, skin: 0xa66a47, hair: 0x0a0a0a, female: true, skirt: true },
//       { shirt: 0xf97316, pants: 0x1f2937, skin: 0xe0ac8a, hair: 0x6b4423 },
//       { shirt: 0x111827, pants: 0x475569, skin: 0xb87555, hair: 0x111111, female: true },
//     ];
//     const walkers = looks.map((o, i) => {
//       const h = buildHuman(o);
//       scene.add(h.group);
//       return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 14, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
//     });

//     /* ---------- input: look + tap ---------- */
//     let yaw = 0, pitch = 0.5, camDist = 11;
//     const ray = new THREE.Raycaster();
//     const ptr = new THREE.Vector2();
//     let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;

//     const pick = (cx: number, cy: number) => {
//       const r = renderer.domElement.getBoundingClientRect();
//       ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
//       ray.setFromCamera(ptr, camera);
//       const h = ray.intersectObjects(hitboxes, false)[0];
//       if (!h) return;
//       const { product, shop } = h.object.userData as { product: Product; shop: string };
//       setSelected({ ...product, shop });
//       setMessage(`🛍️ ${product.name} — ${taka(product.price)} | ${shop}`);
//       if (window.innerWidth < 768) setCartOpen(false);
//     };

//     const el = renderer.domElement;
//     const onDown = (e: PointerEvent) => {
//       if (down) return;
//       down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() };
//       el.setPointerCapture(e.pointerId);
//       screens.forEach((s) => s.video.paused && s.video.play().catch(() => {})); // unlock autoplay on first touch
//     };
//     const onMove = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       const dx = e.clientX - down.x, dy = e.clientY - down.y;
//       down.x = e.clientX; down.y = e.clientY;
//       down.moved += Math.abs(dx) + Math.abs(dy);
//       yaw -= dx * 0.005;
//       pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.15, 1.1);
//     };
//     const onUp = (e: PointerEvent) => {
//       if (!down || e.pointerId !== down.id) return;
//       if (down.moved < 8 && performance.now() - down.t < 500) pick(e.clientX, e.clientY);
//       down = null;
//     };
//     const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
//     el.addEventListener('pointerdown', onDown);
//     el.addEventListener('pointermove', onMove);
//     el.addEventListener('pointerup', onUp);
//     el.addEventListener('pointercancel', onUp);
//     el.addEventListener('wheel', onWheel, { passive: true });

//     const setKey = (e: KeyboardEvent, v: boolean) => {
//       const k = keysRef.current;
//       const key = e.key.toLowerCase();
//       if (key === 'w' || key === 'arrowup') k.f = v;
//       if (key === 's' || key === 'arrowdown') k.b = v;
//       if (key === 'a' || key === 'arrowleft') k.l = v;
//       if (key === 'd' || key === 'arrowright') k.r = v;
//       if (v && key === 'q') yaw += 0.15;
//       if (v && key === 'e') yaw -= 0.15;
//     };
//     const kd = (e: KeyboardEvent) => setKey(e, true);
//     const ku = (e: KeyboardEvent) => setKey(e, false);
//     window.addEventListener('keydown', kd);
//     window.addEventListener('keyup', ku);

//     /* ---------- resize ---------- */
//     const resize = () => {
//       const w = container.clientWidth || 1, h = container.clientHeight || 1;
//       camera.aspect = w / h;
//       camera.fov = w / h < 0.8 ? 72 : 60; // wider view on portrait phones
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//     };
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(container);

//     /* ---------- loop ---------- */
//     const R = 0.5;
//     const blocked = (x: number, z: number) =>
//       colliders.some((c) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R);

//     const clock = new THREE.Clock();
//     const camTarget = new THREE.Vector3();
//     const wp = new THREE.Vector3();
//     let walk = 0, amt = 0, vidTimer = 0, raf = 0;

//     const animate = () => {
//       raf = requestAnimationFrame(animate);
//       const dt = Math.min(clock.getDelta(), 0.05);
//       const t = clock.elapsedTime;

//       if (!pausedRef.current) {
//         const k = keysRef.current, j = joyRef.current;
//         let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x;
//         let iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
//         const len = Math.hypot(ix, iz);
//         if (len > 1) { ix /= len; iz /= len; }
//         const moving = len > 0.08;

//         if (moving) {
//           const sin = Math.sin(yaw), cos = Math.cos(yaw);
//           const mx = -sin * iz + cos * ix;
//           const mz = -cos * iz - sin * ix;
//           const sp = 6.5 * dt;
//           const nx = THREE.MathUtils.clamp(player.position.x + mx * sp, -38, 38);
//           if (!blocked(nx, player.position.z)) player.position.x = nx;
//           const nz = THREE.MathUtils.clamp(player.position.z + mz * sp, -112, 22);
//           if (!blocked(player.position.x, nz)) player.position.z = nz;

//           const target = Math.atan2(-mx, -mz);
//           let diff = target - player.rotation.y;
//           diff = Math.atan2(Math.sin(diff), Math.cos(diff));
//           player.rotation.y += diff * Math.min(1, dt * 12);

//           walk += dt * 9;
//           amt = Math.min(1, amt + dt * 6);
//         } else {
//           amt = Math.max(0, amt - dt * 6);
//         }
//         me.update(walk, amt, t);

//         walkers.forEach((n) => {
//           const near = Math.hypot(n.x - player.position.x, n.z - player.position.z) < 2.4;
//           n.amt += ((near ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
//           if (!near) {
//             n.z += n.dir * n.sp * dt;
//             n.ph += dt * n.sp * 3.2;
//             if (n.z < -108) n.dir = 1;
//             if (n.z > 14) n.dir = -1;
//           }
//           n.h.group.position.set(n.x, 0, n.z);
//           n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI;
//           n.h.update(n.ph, n.amt, t);
//         });
//         idlers.forEach((i) => {
//           i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * i.sway;
//           i.h.update(0, 0, t);
//         });
//         spinners.forEach((sp) => { sp.rotation.y = t; sp.rotation.x = t * 0.5; });

//         floaters.forEach((f) => { f.obj.position.y = f.base + Math.sin(t * 1.4 + f.i) * 0.05; });
//       }

//       // camera orbit
//       const h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
//       camTarget.set(player.position.x + Math.sin(yaw) * d, 2 + h, player.position.z + Math.cos(yaw) * d);
//       camera.position.lerp(camTarget, 0.12);
//       camera.lookAt(player.position.x, 2.4, player.position.z);

//       // videos: only play the ones near the player
//       vidTimer += dt;
//       if (vidTimer > 0.4) {
//         vidTimer = 0;
//         screens.forEach((s) => {
//           s.obj.getWorldPosition(wp);
//           const dist = wp.distanceTo(player.position);
//           if (pausedRef.current || dist > 55) { if (!s.video.paused) s.video.pause(); }
//           else if (s.video.paused && !s.failed) s.video.play().catch(() => {});
//         });
//       }
//       screens.forEach((s) => s.failed && s.draw(t));

//       renderer.render(scene, camera);
//     };
//     animate();

//     return () => {
//       cancelAnimationFrame(raf);
//       ro.disconnect();
//       window.removeEventListener('keydown', kd);
//       window.removeEventListener('keyup', ku);
//       el.removeEventListener('pointerdown', onDown);
//       el.removeEventListener('pointermove', onMove);
//       el.removeEventListener('pointerup', onUp);
//       el.removeEventListener('pointercancel', onUp);
//       el.removeEventListener('wheel', onWheel);
//       screens.forEach((s) => { s.video.pause(); s.video.removeAttribute('src'); s.video.load(); });
//       scene.traverse((o) => {
//         const m = o as THREE.Mesh;
//         m.geometry?.dispose?.();
//         const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
//         mats.forEach((mm) => { (mm as THREE.MeshBasicMaterial).map?.dispose(); mm.dispose(); });
//       });
//       pmrem.dispose();
//       renderer.dispose();
//       if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
//     };
//   }, []);

//   /* ------------------------------ ACTIONS ------------------------------ */

//   const addSelected = () => {
//     if (!selected) { setMessage('👆 আগে কোনো পণ্যে ট্যাপ/ক্লিক করুন।'); return; }
//     setCart((prev) => {
//       const old = prev.find((i) => i.id === selected.id);
//       if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + 1 } : i));
//       return [...prev, { ...selected, count: 1 }];
//     });
//     setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`);
//     setSelected(null);
//   };

//   const changeQty = (id: string, d: number) =>
//     setCart((prev) => prev.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));

//   const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

//   const checkout = () => {
//     if (!cart.length) { setMessage('🛒 কার্ট খালি।'); return; }
//     if (balance < total) { setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`); return; }
//     setBalance((b) => b - total);
//     setScore((s) => s + cartCount * 100);
//     setCart([]);
//     setMessage(`🎉 ${taka(total)} পেমেন্ট সফল! ধন্যবাদ।`);
//   };

//   /* joystick */
//   const joyStart = (e: React.PointerEvent<HTMLDivElement>) => {
//     e.currentTarget.setPointerCapture(e.pointerId);
//     joyMove(e);
//   };
//   const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
//     const r = e.currentTarget.getBoundingClientRect();
//     const max = r.width / 2 - 24;
//     let dx = e.clientX - (r.left + r.width / 2);
//     let dy = e.clientY - (r.top + r.height / 2);
//     const l = Math.hypot(dx, dy);
//     if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
//     joyRef.current = { x: dx / max, y: dy / max };
//     setKnob({ x: dx, y: dy });
//   };
//   const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

//   /* ------------------------------ UI ------------------------------ */
//   const glass = 'border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl';

//   return (
//     <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
//       <div ref={containerRef} className="absolute inset-0" />

//       {/* top bar */}
//       <header className="pointer-events-none absolute inset-x-2 top-2 z-20 flex items-start justify-between gap-2 md:inset-x-3 md:top-3">
//         <div className={`pointer-events-auto rounded-2xl px-3 py-2 md:px-4 md:py-3 ${glass}`}>
//           <div className="hidden text-[10px] font-bold tracking-[0.3em] text-cyan-300 sm:block">NEXT GENERATION MALL</div>
//           <div className="text-sm font-black md:text-lg">GRAND SHOPPING CITY</div>
//         </div>
//         <div className="pointer-events-auto flex gap-1.5 md:gap-2">
//           <div className={`rounded-2xl px-3 py-2 text-right md:px-4 md:py-3 ${glass}`}>
//             <div className="text-[9px] text-slate-400 md:text-[10px]">BALANCE</div>
//             <div className="text-sm font-black text-yellow-300 md:text-base">{taka(balance)}</div>
//           </div>
//           <div className={`hidden rounded-2xl px-4 py-3 text-right sm:block ${glass}`}>
//             <div className="text-[10px] text-slate-400">SCORE</div>
//             <div className="font-black text-emerald-300">{score}</div>
//           </div>
//           <button onClick={() => setCartOpen((v) => !v)} className={`relative rounded-2xl px-3 text-lg md:px-4 ${glass}`} aria-label="Cart">
//             🛒
//             {cartCount > 0 && (
//               <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-slate-950">{cartCount}</span>
//             )}
//           </button>
//           <button onClick={() => setPaused((v) => !v)} className={`rounded-2xl px-3 text-lg md:px-4 ${glass}`} aria-label="Pause">
//             {paused ? '▶️' : '⏸️'}
//           </button>
//         </div>
//       </header>

//       {/* assistant message */}
//       <aside className={`pointer-events-none absolute left-2 top-[64px] z-20 max-w-[min(340px,calc(100vw-16px))] rounded-2xl p-3 md:left-3 md:top-24 md:p-4 ${glass}`}>
//         <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Mall Assistant</div>
//         <p className="text-xs leading-5 text-slate-200 md:text-sm md:leading-6">{message}</p>
//       </aside>

//       {/* product card */}
//       {selected && (
//         <div className={`absolute inset-x-2 bottom-2 z-30 overflow-hidden rounded-3xl md:inset-x-auto md:bottom-5 md:left-1/2 md:w-[380px] md:-translate-x-1/2 ${glass}`}>
//           <div className="flex md:block">
//             <img src={selected.image} alt={selected.name} className="h-28 w-28 shrink-0 object-cover md:h-40 md:w-full" />
//             <div className="min-w-0 flex-1 p-3 md:p-4">
//               <div className="truncate text-[11px] text-slate-400">{selected.shop}</div>
//               <div className="truncate text-base font-black md:text-lg">{selected.name}</div>
//               <div className="text-lg font-black text-yellow-300 md:text-xl">{taka(selected.price)}</div>
//               <div className="mt-2 flex gap-2">
//                 <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 px-3 py-2.5 font-black text-slate-950 active:scale-95 hover:bg-cyan-400">
//                   🛒 কার্টে নিন
//                 </button>
//                 <button onClick={() => setSelected(null)} className="rounded-xl bg-white/10 px-4 py-2.5" aria-label="Close">✕</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* cart */}
//       {cartOpen && (
//         <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:w-80 md:max-h-[70dvh] md:rounded-3xl ${glass}`}>
//           <div className="flex items-center justify-between">
//             <h2 className="font-black">🛒 MY CART</h2>
//             <div className="flex items-center gap-2">
//               <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300">{cartCount} items</span>
//               <button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs md:hidden">✕</button>
//             </div>
//           </div>

//           <div className="mt-3 space-y-2">
//             {cart.length === 0 ? (
//               <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div>
//             ) : cart.map((item) => (
//               <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
//                 <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
//                 <div className="min-w-0 flex-1">
//                   <div className="truncate text-xs font-bold">{item.name}</div>
//                   <div className="text-[10px] text-slate-400">{taka(item.price)}</div>
//                 </div>
//                 <div className="flex items-center gap-1 text-xs">
//                   <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button>
//                   <b className="w-5 text-center">{item.count}</b>
//                   <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
//                 </div>
//                 <button onClick={() => removeItem(item.id)} className="rounded-lg bg-rose-500/15 px-2 py-1 text-rose-300">✕</button>
//               </div>
//             ))}
//           </div>

//           <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
//             <span className="text-slate-400">Total</span>
//             <b className="text-yellow-300">{taka(total)}</b>
//           </div>
//           <button onClick={checkout} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 active:scale-95 hover:bg-emerald-400 disabled:opacity-40" disabled={!cart.length}>
//             ✅ Checkout
//           </button>
//         </aside>
//       )}

//       {/* mobile joystick */}
//       {touch && !selected && !cartOpen && (
//         <div
//           className="absolute bottom-6 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
//           onPointerDown={joyStart}
//           onPointerMove={joyMove}
//           onPointerUp={joyEnd}
//           onPointerCancel={joyEnd}
//         >
//           <div
//             className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/80 shadow-lg"
//             style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
//           />
//         </div>
//       )}
//       {touch && !selected && !cartOpen && (
//         <div className="pointer-events-none absolute bottom-8 right-5 z-20 max-w-[170px] text-right text-[11px] text-slate-300">
//           স্ক্রিন ড্র্যাগ করে ঘুরে দেখুন • পণ্যে ট্যাপ করুন
//         </div>
//       )}

//       {/* desktop help */}
//       {!touch && !selected && (
//         <div className={`absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl px-5 py-3 text-xs text-slate-300 md:block ${glass}`}>
//           <b className="text-cyan-300">W A S D</b> হাঁটা &nbsp;•&nbsp; <b className="text-cyan-300">Mouse Drag / Q E</b> ঘোরা &nbsp;•&nbsp;
//           <b className="text-cyan-300">Scroll</b> জুম &nbsp;•&nbsp; <b className="text-cyan-300">Click</b> পণ্য দেখুন
//         </div>
//       )}

//       {paused && (
//         <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
//           <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
//         </div>
//       )}
//     </main>
//   );
// }
