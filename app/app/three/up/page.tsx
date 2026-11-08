'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

/* ভাড়া (কয়েন) ও নদী — JSON-এর fare দিয়ে বদলানো যায় */
const FARE = { rickBase: 20, rickPerMeter: 1.5, boat: 30 };
const RIVER_C = [-190, 190], RIVER_HW = 18; // নদীর কেন্দ্র x ও অর্ধ-প্রস্থ
const inRiver = (x: number) => RIVER_C.some((c) => Math.abs(x - c) < RIVER_HW + 4);
const inWater = (x: number, z: number) => z < 175 && RIVER_C.some((c) => Math.abs(x - c) < RIVER_HW);
const onBridge = (z: number) => (z > 25 && z < 53) || (z > 61 && z < 69);

/* দৈনিক টাস্ক: প্রতিদিন সর্বোচ্চ ৪টি, প্রতিটিতে পয়েন্ট; সবগুলো শেষ করলে বোনাস */
const TASKS: { id: string; title: string; pts: number }[] = [
  { id: 'shop', title: 'যেকোনো একটি দোকানে প্রবেশ করুন', pts: 200 },
  { id: 'view', title: 'একটি পণ্যে ক্লিক করে বিস্তারিত দেখুন', pts: 100 },
  { id: 'cart', title: 'কার্টে একটি পণ্য যোগ করুন', pts: 150 },
  { id: 'ride', title: 'বাইক / রিকশা / নৌকায় চড়ুন', pts: 150 },
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
/* ছবির লিংক এখন DATA.images (বা mall-data.json) থেকে আসে */
const IMG: Record<string, string> = {};
const STYLE_KINDS: Record<string, string[]> = {
  fashion: ['tshirt', 'jacket', 'sneaker', 'glasses', 'bag', 'watch'],
  tech: ['phone', 'watch', 'camera', 'headphone'],
  home: ['chair', 'lamp', 'plant', 'book', 'jar'],
  market: ['jar', 'chocolate', 'sack', 'coffee', 'bottle', 'box'],
};
const BASE: Record<string, string> = { tshirt: 'T-Shirt', jacket: 'Jacket', sneaker: 'Sneaker', glasses: 'Sunglasses', bag: 'Handbag', watch: 'Smart Watch', phone: 'Smartphone', camera: 'Camera', headphone: 'Headphones', chair: 'Chair', lamp: 'Table Lamp', plant: 'Indoor Plant', book: 'Notebook', jar: 'Honey Jar', chocolate: 'Chocolate', sack: 'Rice 5KG', coffee: 'Coffee', bottle: 'Juice Bottle', box: 'Gift Box', frame: 'Photo Frame' };
const BASEP: Record<string, number> = { tshirt: 1200, jacket: 4500, sneaker: 3800, glasses: 2200, bag: 3500, watch: 4200, phone: 38000, camera: 52000, headphone: 5200, chair: 7500, lamp: 2800, plant: 900, book: 450, jar: 900, chocolate: 600, sack: 1700, coffee: 1250, bottle: 350, box: 800, frame: 1500 };

/* ছবি লোড না হলে ফলব্যাক: নামসহ রঙিন কার্ড */
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

/* ============================ JSON ইমপোর্ট (দোকান ও পণ্য ডাইনামিক) ============================ */
type RawProduct = { id?: string | number; name?: string; price?: number | string; image?: string; kind?: string; color?: string | number };
type RawShop = { id?: string; name?: string; subtitle?: string; style?: string; accent?: string | number; products?: RawProduct[] };
const toNum = (v: unknown, d: number) => {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') { const m = v.trim().replace('#', '').replace(/^0x/i, ''); if (/^[0-9a-f]{6}$/i.test(m)) return parseInt(m, 16); }
  return d;
};
const SAMPLE_JSON = JSON.stringify({
  fare: { rickBase: 20, rickPerMeter: 1.5, boat: 30 },
  images: { jacket: 'https://example.com/jacket.jpg' },
  shops: [
    { id: 'demo', name: 'DEMO STORE', subtitle: 'JSON থেকে তৈরি', style: 'fashion', accent: '#e11d48', products: [
      { id: 'jk1', name: 'ডেনিম জ্যাকেট', price: 3200, kind: 'jacket', color: '#2563eb', image: 'jacket' },
      { id: 'sn1', name: 'স্পোর্টস জুতা', price: 2800, kind: 'sneaker', color: '#ef4444', image: 'sneaker' },
      { id: 'my1', name: 'নিজের ছবির পণ্য', price: 999, image: 'https://example.com/apnar-chobi.jpg' },
    ] },
    { id: 'booksx', name: 'BOOK CORNER', subtitle: 'বই ও খাতা', style: 'home', accent: '#0ea5e9', products: [
      { name: 'গল্পের বই', price: 450, kind: 'book', image: 'book' },
      { name: 'টেবিল ল্যাম্প', price: 1800, kind: 'lamp', image: 'lamp' },
    ] },
  ],
}, null, 2);

// ================= সব ডেটা এক জায়গায়: ভাড়া + ছবির লিংক + দোকান + পণ্য =================
// public/mall-data.json ফাইল থাকলে সেটাই আগে লোড হবে (একই কাঠামো)।
// fare   : rickBase (শুরুর ভাড়া), rickPerMeter (প্রতি মিটার), boat (নৌকা ভাড়া)
// images : kind অনুযায়ী ডিফল্ট ছবির লিংক
// shops  : দোকান → পণ্য। পণ্যের গ্লোবাল আইডি = "দোকানId:পণ্যId" (id না দিলে p0, p1 …)
// style: fashion | tech | home | market
// kind : tshirt jacket sneaker glasses bag watch phone camera headphone chair lamp plant book jar chocolate sack coffee bottle box frame
// image: পুরো লিংক (https://...) অথবা images-এর কী (যেমন "jacket")। না দিলে kind অনুযায়ী ডিফল্ট ছবি।
const DATA: { fare: typeof FARE; images: Record<string, string>; shops: RawShop[] } = {
  fare: { rickBase: 20, rickPerMeter: 1.5, boat: 30 },
  images: {
    tshirt: u('photo-1521572163474-6864f9cf17ab'), jacket: u('photo-1551488831-00ddcb6c6bd3'), glasses: u('photo-1511499767150-a48a237f0083'),
    sneaker: u('photo-1542291026-7eec264c27ff'), watch: u('photo-1523275335684-37898b6baf30'), camera: u('photo-1516035069371-29a1b244cc32'),
    headphone: u('photo-1505740420928-5e560c06d30e'), phone: u('photo-1511707171634-5f897ff02aa9'), chair: u('photo-1598300042247-d088f8ab3a91'),
    lamp: u('photo-1507473885765-e6ed057f782c'), jar: u('photo-1471943311424-646960669fbc'), chocolate: u('photo-1548907040-4d42c6d3a0b0'),
    sack: u('photo-1586201375761-83865001e31c'), coffee: u('photo-1495474472287-4d71bcdd2085'),
    bag: u('photo-1584917865442-de89df76afd3'), plant: u('photo-1485955900006-10f4d324d411'), book: u('photo-1544716278-ca5e3f4abd8c'),
    bottle: u('photo-1600271886742-f049cd451bba'), box: u('photo-1513885535751-8b9238bd345a'), frame: u('photo-1513519245088-0e12902e5a38'),
  },
  shops: [
    { id: 'fashion', name: 'NOVA FASHION', subtitle: 'Premium Fashion', style: 'fashion', accent: '#7c3aed', products: [
      { name: 'Premium T-Shirt', price: 1800, kind: 'tshirt', color: '#2563eb' },
      { name: 'Urban Jacket', price: 5200, kind: 'jacket', color: '#1e293b' },
      { name: 'Classic Sunglasses', price: 2400, kind: 'glasses', color: '#111827' },
      { name: 'Running Sneaker', price: 4200, kind: 'sneaker', color: '#ef4444' },
      { name: 'Leather Handbag', price: 3800, kind: 'bag', color: '#92400e' },
      { name: 'Denim Jacket', price: 3200, kind: 'jacket', color: '#2563eb' },
    ] },
    { id: 'tech', name: 'TECHHUB', subtitle: 'Smart Devices', style: 'tech', accent: '#0891b2', products: [
      { name: 'Smart Watch', price: 4500, kind: 'watch', color: '#1e293b' },
      { name: 'Mirrorless Camera', price: 62000, kind: 'camera', color: '#cbd5e1' },
      { name: 'Wireless Headphones', price: 6800, kind: 'headphone', color: '#111827' },
      { name: 'Flagship Phone', price: 92000, kind: 'phone', color: '#64748b' },
      { name: 'Budget Phone', price: 18500, kind: 'phone', color: '#0ea5e9' },
      { name: 'Action Camera', price: 21000, kind: 'camera', color: '#f97316' },
    ] },
    { id: 'home', name: 'URBAN HOME', subtitle: 'Furniture & Decor', style: 'home', accent: '#d97706', products: [
      { name: 'Designer Chair', price: 8500, kind: 'chair', color: '#d97706' },
      { name: 'Modern Table Lamp', price: 3200, kind: 'lamp', color: '#facc15' },
      { name: 'Indoor Plant', price: 900, kind: 'plant', color: '#16a34a' },
      { name: 'Wooden Chair', price: 6200, kind: 'chair', color: '#6b4a2e' },
      { name: 'Photo Frame', price: 1500, kind: 'frame', color: '#1e293b' },
      { name: 'Reading Lamp', price: 2200, kind: 'lamp', color: '#38bdf8' },
    ] },
    { id: 'market', name: 'FRESH MART', subtitle: 'Grocery & Food', style: 'market', accent: '#16a34a', products: [
      { name: 'Organic Honey', price: 950, kind: 'jar', color: '#d9901a' },
      { name: 'Imported Chocolate', price: 1500, kind: 'chocolate', color: '#7c3aed' },
      { name: 'Premium Rice 10KG', price: 1800, kind: 'sack', color: '#f1f5f9' },
      { name: 'Fresh Coffee', price: 1250, kind: 'coffee', color: '#1e293b' },
      { name: 'Mango Juice', price: 350, kind: 'bottle', color: '#f59e0b' },
      { name: 'Gift Box', price: 800, kind: 'box', color: '#ec4899' },
    ] },
    { id: 'books', name: 'BOOK WORLD', subtitle: 'Books & Stationery', style: 'home', accent: '#0ea5e9', products: [
      { name: 'Story Book', price: 450, kind: 'book', color: '#ef4444' },
      { name: 'Novel Collection', price: 1200, kind: 'book', color: '#2563eb' },
      { name: 'Study Lamp', price: 1800, kind: 'lamp', color: '#fde047' },
      { name: 'Desk Plant', price: 700, kind: 'plant', color: '#22c55e' },
      { name: 'Art Diary', price: 520, kind: 'book', color: '#14b8a6' },
      { name: 'Gift Box', price: 900, kind: 'box', color: '#f97316' },
    ] },
    { id: 'sports', name: 'SPORTS ZONE', subtitle: 'Sports & Outdoor', style: 'fashion', accent: '#ef4444', products: [
      { name: 'Sports Sneaker', price: 4800, kind: 'sneaker', color: '#2563eb' },
      { name: 'Training T-Shirt', price: 1300, kind: 'tshirt', color: '#ef4444' },
      { name: 'Gym Bag', price: 2600, kind: 'bag', color: '#111827' },
      { name: 'Sports Watch', price: 3900, kind: 'watch', color: '#16a34a' },
      { name: 'Water Bottle', price: 450, kind: 'bottle', color: '#0ea5e9' },
      { name: 'Windbreaker', price: 3600, kind: 'jacket', color: '#f97316' },
    ] },
    { id: 'gadget', name: 'GADGET ZONE', subtitle: 'Mobile & Gadgets', style: 'tech', accent: '#14b8a6', products: [
      { name: 'Smartphone Pro', price: 74000, kind: 'phone', color: '#1e293b' },
      { name: 'Smartphone Lite', price: 24000, kind: 'phone', color: '#14b8a6' },
      { name: 'Bluetooth Headphone', price: 3900, kind: 'headphone', color: '#7c3aed' },
      { name: 'Vlog Camera', price: 38000, kind: 'camera', color: '#111827' },
      { name: 'Smart Watch Pro', price: 7800, kind: 'watch', color: '#ef4444' },
      { name: 'Studio Headphone', price: 9800, kind: 'headphone', color: '#0ea5e9' },
    ] },
    { id: 'gift', name: 'GIFT CORNER', subtitle: 'Gifts & Sweets', style: 'market', accent: '#ec4899', products: [
      { name: 'Gift Box Large', price: 1800, kind: 'box', color: '#ec4899' },
      { name: 'Chocolate Box', price: 1700, kind: 'chocolate', color: '#7c3aed' },
      { name: 'Honey Jar Premium', price: 1250, kind: 'jar', color: '#d9901a' },
      { name: 'Rose Plant', price: 950, kind: 'plant', color: '#f43f5e' },
      { name: 'Photo Frame Gold', price: 2100, kind: 'frame', color: '#facc15' },
      { name: 'Coffee Gift Pack', price: 1600, kind: 'coffee', color: '#78350f' },
    ] },
  ],
};

/* raw JSON → Shop[]। একই নামের দোকান থাকলে সেখানে পণ্য যোগ হয়, না থাকলে নতুন দোকান */
const normalizeShops = (raw: unknown, existing: Shop[], replace: boolean) => {
  const wrapped = raw && typeof raw === 'object' ? (raw as { shops?: unknown }).shops : undefined;
  const list = Array.isArray(raw) ? raw : Array.isArray(wrapped) ? wrapped : null;
  if (!list) throw new Error('JSON অবশ্যই দোকানের অ্যারে [ {...} ] অথবা { "shops": [ ... ] } হতে হবে');
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
      shop = {
        id: r.id ? String(r.id) : (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `j${stamp}${si}`),
        name, subtitle: String(r.subtitle ?? SHOP_SUB[style]).slice(0, 32), ...slot,
        accent: toNum(r.accent, PAL[(base.length * 5 + 1) % (PAL.length - 1)]), style, products: [],
      };
      if (base.some((x) => x.id === shop.id)) shop.id += '-' + stamp + si;
      idx = base.push(shop) - 1; added++;
    }
    const kinds = STYLE_KINDS[shop.style] ?? STYLE_KINDS.market;
    (Array.isArray(r.products) ? r.products : []).forEach((p, pi) => {
      if (!p || typeof p !== 'object' || shop.products.length >= MAX_PRODUCTS) return;
      const pname = String(p.name ?? '').trim(), price = Number(p.price);
      if (!pname || !(price > 0)) return;
      const kind = p.kind && KINDS.some(([k]) => k === p.kind) ? p.kind : kinds[pi % kinds.length];
      const color = toNum(p.color, PAL[pi % PAL.length]);
      const rawImg = typeof p.image === 'string' ? p.image.trim() : '';
      const image = /^(https?:|data:|\/)/.test(rawImg) ? rawImg : IMG[rawImg || kind] ?? ph(kind, color, pname);
      let pid = p.id !== undefined && String(p.id).includes(':') ? String(p.id) : `${shop.id}:${p.id ?? 'p' + shop.products.length}`;
      if (shop.products.some((x) => x.id === pid)) pid += '_' + shop.products.length;
      shop.products.push({ id: pid, name: pname.slice(0, 40), price, image, kind, color });
      products++;
    });
  });
  return { shops: base, added, products };
};

/* ভাড়া ও ছবির লিংক JSON থেকে প্রয়োগ */
const applyConfig = (raw: unknown) => {
  const r = raw as { fare?: Partial<typeof FARE>; images?: Record<string, string> } | null;
  if (r?.images) Object.assign(IMG, r.images);
  if (r?.fare) Object.assign(FARE, r.fare);
};
/* public/mall-data.json থাকলে সেটা, না থাকলে ভেতরের DATA */
const loadData = async (): Promise<unknown> => {
  try { const r = await fetch('/mall-data.json', { cache: 'no-store' }); if (r.ok) return await r.json(); } catch { /* ignore */ }
  return DATA;
};
/* আইডি ধরে খোঁজা */
const findProduct = (list: Shop[], id: string) => { for (const s of list) { const p = s.products.find((x) => x.id === id); if (p) return { p, s }; } return null; };
const findShop = (list: Shop[], id: string) => list.find((s) => s.id === id) ?? null;
applyConfig(DATA);
const defaultShops = (): Shop[] => normalizeShops(DATA, [], true).shops;

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

/* ============================ মানুষ (কার্টুন) ============================ */
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

  /* বাইক/রিকশা/নৌকায় বসার ভঙ্গি */
  let riding = false;
  const setRide = (v: boolean) => { riding = v; };

  /* মানুষের মতো চলন: পা গুটানো, হাত-পায়ের উল্টো দোলা, কোমরের মোচড়, সামনে ঝোঁকা, মাথা স্থির */
  const update = (phase: number, amt: number, t: number, run = 0) => {
    if (riding) {
      root.rotation.set(0, 0, 0); LL.scale.y = LR.scale.y = 1;
      LL.rotation.x = LR.rotation.x = 0.7; AL.rotation.x = AR.rotation.x = 1.1;
      AL.rotation.z = 0.12; AR.rotation.z = -0.12; root.position.set(0, 0, 0); head.rotation.y = 0;
      return;
    }
    const c = Math.cos(phase), sw = (0.62 + 0.5 * run) * amt, s = Math.sin(phase) * sw;
    LL.rotation.x = s; LR.rotation.x = -s;
    LL.scale.y = 1 - 0.07 * amt * Math.max(0, c); LR.scale.y = 1 - 0.07 * amt * Math.max(0, -c);
    const as = (0.5 + 0.5 * run) * amt * Math.sin(phase);
    AL.rotation.x = -as + run * 0.5 * amt; AR.rotation.x = as + run * 0.5 * amt;
    AL.rotation.z = 0.06 + Math.sin(t * 1.6) * 0.015 * (1 - amt); AR.rotation.z = -AL.rotation.z;
    root.rotation.x = -(0.04 + 0.12 * run) * amt;
    root.rotation.y = Math.sin(phase) * 0.14 * amt;
    root.position.x = Math.sin(phase) * 0.025 * amt;
    root.position.y = Math.abs(Math.sin(phase)) * (0.06 + 0.07 * run) * amt + Math.sin(t * 1.6) * 0.008 * (1 - amt);
    head.rotation.y = -root.rotation.y * 0.8 + Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
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
  add(g, bx(0.4, 0.5, 0.9), mt, 0, 0.8, 0.05);
  add(g, sp(0.4), body, 0, 1.45, -0.3, 0.8, 0.7, 1.5);
  add(g, bx(0.46, 0.16, 0.95), dk, 0, 1.25, 0.35);
  add(g, bx(0.4, 0.08, 0.8), body, 0, 1.0, 1.05, 1, 1, 1, -0.2);
  for (const s of [-1, 1]) add(g, cy(0.035, 0.035, 1.16, 8), mt, s * 0.18, 1.14, -0.975, 1, 1, 1, 0.495);
  add(g, bx(1.0, 0.05, 0.05), dk, 0, 1.7, -0.7);
  add(g, sp(0.15), lampM, 0, 1.55, -0.9);
  add(g, bx(0.25, 0.1, 0.06), tail, 0, 1.05, 1.5);
  add(g, cy(0.07, 0.09, 1.0, 10), mt, 0.3, 0.55, 0.55, 1, 1, 1, H);
  const lamp = new THREE.SpotLight(0xfff2cc, 0, 60, 0.55, 0.5, 1.5);
  lamp.position.set(0, 1.5, -1.1); lamp.target.position.set(0, 0.2, -14); g.add(lamp, lamp.target);
  g.traverse((o) => { o.castShadow = true; });
  return { g, wf, wr, lamp };
}

/* ============================ রিকশা (চালকসহ, ভাড়ায় চড়া যায়) ============================ */
function buildRick() {
  const g = new THREE.Group(), H = Math.PI / 2, body = M(0xf59e0b, 0.5, 0.2), steel = M(0x94a3b8, 0.3, 0.8), tire = M(0x0a0a0a, 0.8, 0), seat = M(0x7f1d1d, 0.8, 0);
  const wheels: THREE.Group[] = [];
  for (const [x, z] of [[0, -1.5], [-0.8, 0.9], [0.8, 0.9]] as const) {
    const w = new THREE.Group(); w.position.set(x, 0.45, z); g.add(w);
    add(w, to(0.42, 0.05), tire, 0, 0, 0, 1, 1, 1, 0, H, 0); add(w, bx(0.02, 0.84, 0.05), steel); add(w, bx(0.02, 0.05, 0.84), steel); wheels.push(w);
  }
  add(g, bx(1.7, 0.1, 2.4), body, 0, 0.6, 0.3); add(g, bx(1.3, 0.35, 0.9), seat, 0, 0.85, 0.7); add(g, bx(1.3, 0.7, 0.15), seat, 0, 1.25, 1.15);
  for (const s of [-1, 1]) add(g, bx(0.08, 0.5, 1.4), body, s * 0.8, 0.95, 0.7);
  add(g, cy(0.04, 0.04, 2.1, 8), steel, 0, 0.95, -0.5, 1, 1, 1, H); add(g, bx(0.3, 0.08, 0.3), M(0x111827, 0.5, 0.3), 0, 1.1, -1.05); add(g, bx(0.9, 0.05, 0.05), steel, 0, 1.5, -1.5);
  const p = buildHuman({ shirt: 0x16a34a, pants: 0x334155, skin: 0xb87555, style: 'cap' });
  p.setRide(true); p.update(0, 0, 0); p.group.scale.setScalar(0.5); p.group.position.set(0, 0.3, -1.05); g.add(p.group);
  g.traverse((o) => { o.castShadow = true; });
  return { g, wheels };
}

/* ============================ নৌকা ============================ */
function buildBoat() {
  const g = new THREE.Group(), hull = M(0x9a3412, 0.6, 0.1), dk = M(0x5b3a1e, 0.8, 0), lampM = M(0xfff1b0, 0.3, 0, 0xffd27a, 2.5);
  add(g, bx(1.8, 0.55, 4.2), hull, 0, 0.3, 0.3); add(g, bx(1.27, 0.55, 1.27), hull, 0, 0.3, -2.1, 1, 1, 1, 0, Math.PI / 4, 0);
  add(g, bx(1.5, 0.06, 3.8), dk, 0, 0.58, 0.3); add(g, bx(1.6, 0.08, 0.35), dk, 0, 0.8, 0.9);
  add(g, cy(0.04, 0.04, 1.6, 6), dk, 0, 1.2, -2.2); add(g, sp(0.14, 8, 6), lampM, 0, 2.0, -2.2);
  g.traverse((o) => { o.castShadow = true; });
  return g;
}

/* ============================ নদী, ব্রিজ, ঘাট ============================ */
function addRiver(scene: THREE.Scene) {
  const LEN = 2400, CZ = -1025; // z = -2225 … 175
  const wt = canvasTex(128, 128, (x) => { x.fillStyle = '#2a8fd0'; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 2; for (let i = 0; i < 10; i++) { const y = i * 13 + 4; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(30, y - 8, 90, y + 8, 128, y); x.stroke(); } });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(5, 400);
  const waterM = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.9, emissive: 0x0b3a66, emissiveIntensity: 0.25 });
  const stone = M(0x8b93a0, 0.8, 0.1), deck = M(0x3a3f4b, 0.9, 0), rail = M(0xcbd5e1, 0.4, 0.6), wood = M(0x6b4a2e, 0.8, 0);
  const boats: { g: THREE.Group }[] = [];
  RIVER_C.forEach((c) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(RIVER_HW * 2, LEN), waterM); w.rotation.x = -Math.PI / 2; w.position.set(c, 0.02, CZ); scene.add(w);
    for (const s of [-1, 1]) add(scene, bx(1.4, 0.06, LEN), stone, c + s * (RIVER_HW + 0.7), 0.03, CZ);
    for (const [z0, z1] of [[26, 52], [62, 68]]) { // রাস্তার ব্রিজ ও ফুটব্রিজ
      const wd = RIVER_HW * 2 + 6;
      add(scene, bx(wd, 0.06, z1 - z0), deck, c, 0.05, (z0 + z1) / 2).receiveShadow = true;
      for (const z of [z0, z1]) { add(scene, bx(wd, 0.12, 0.2), rail, c, 1.0, z); for (let x = -wd / 2 + 1; x <= wd / 2; x += 4) add(scene, bx(0.2, 1.1, 0.2), rail, c + x, 0.55, z); }
    }
    const side = c > 0 ? -1 : 1; // শহরের দিকের পাড়ে ঘাট ও নৌকা
    for (const bz of [14, 76]) {
      add(scene, bx(3.2, 0.1, 6.5), wood, c + side * (RIVER_HW - 0.8), 0.07, bz);
      const b = buildBoat(); b.position.set(c + side * (RIVER_HW - 3.6), 0.03, bz); scene.add(b); boats.push({ g: b });
    }
  });
  return { boats, update: (dt: number) => { wt.offset.y += dt * 0.02; } };
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

/* ============================ বাইরের দুনিয়া: রাস্তা, গাড়ি, রিকশা, গাছ, মেঘ, পাখি ============================ */
function addOutdoors(scene: THREE.Scene) {
  const bcol: Box2[] = [];
  const plane = (w: number, d: number, c: number, y: number, z: number, r = 0.9) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(c, r, 0)); m.rotation.x = -Math.PI / 2; m.position.set(0, y, z); m.receiveShadow = true; scene.add(m);
  };
  plane(1600, 3600, 0x2b3a2c, -0.03, -1200); plane(1600, 6, 0x8a93a3, 0.01, 28); plane(1600, 16, 0x20232b, 0.01, 39);
  plane(1600, 30, 0x6b7280, 0.012, 64); // ফুটপাত/প্লাজা
  plane(1600, 0.25, 0xf1f5f9, 0.025, 32.2); plane(1600, 0.25, 0xf1f5f9, 0.025, 45.8); // রাস্তার দুই ধারের সাদা দাগ
  const dashes = new THREE.InstancedMesh(bx(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 110);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 110; i++) { m4.setPosition(-330 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
  scene.add(dashes);

  // গাছ
  const leafMs = [M(0x1f8a4c, 0.9, 0), M(0x2f9e44, 0.9, 0), M(0x15803d, 0.9, 0)], ico = G('ico', () => new THREE.IcosahedronGeometry(1.6, 1));
  for (let x = -210, k = 0; x <= 210; x += 14, k++) for (const z of [31.6, 46.6]) {
    if (inRiver(x)) continue;
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

  // ট্রাফিক সিগন্যাল (জেব্রা ক্রসিংয়ের পাশে)
  const poleM = M(0x2b3550, 0.5, 0.6), housM = M(0x111827, 0.5, 0.3), redL = M(0xef4444, 0.3, 0, 0xff0000, 2), offL = M(0x2a2a2a, 0.6, 0);
  for (const cx of [-60, 0, 60]) for (const [zz, s] of [[30.3, 1], [47.7, -1]] as const) {
    const t = new THREE.Group(); t.position.set(cx + 6 * s, 0, zz); scene.add(t);
    add(t, cy(0.1, 0.1, 4.2, 8), poleM, 0, 2.1, 0); add(t, bx(0.5, 1.4, 0.4), housM, 0, 4.6, 0);
    add(t, sp(0.14), redL, 0, 4.95, 0.22 * s); add(t, sp(0.14), offL, 0, 4.6, 0.22 * s); add(t, sp(0.14), offL, 0, 4.25, 0.22 * s);
  }

  // রিকশা (চালকসহ, ধীরে চলে)
  const dome = G('dome', () => new THREE.SphereGeometry(0.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)), rickWheels: THREE.Object3D[] = [];
  [0xf59e0b, 0x16a34a, 0xdc2626, 0x2563eb, 0xec4899, 0x7c3aed].forEach((color, i) => {
    const dir = i % 2 ? -1 : 1, g = new THREE.Group(), body = M(color, 0.5, 0.2), steel = M(0x94a3b8, 0.3, 0.8);
    for (const [wx, wz] of [[1.3, 0], [-0.7, 0.55], [-0.7, -0.55]] as const) {
      const w = new THREE.Group(); w.position.set(wx, 0.42, wz); g.add(w);
      add(w, to(0.38, 0.04), wheelM, 0, 0, 0); add(w, bx(0.76, 0.05, 0.02), steel); add(w, bx(0.05, 0.76, 0.02), steel); rickWheels.push(w);
    }
    add(g, bx(1.7, 0.1, 1.0), body, -0.3, 0.55, 0); add(g, bx(0.7, 0.3, 0.9), M(0x7f1d1d, 0.8, 0), -0.55, 0.78, 0);
    add(g, dome, body, -0.55, 1.0, 0, 1.1, 1, 0.85); add(g, bx(0.06, 0.8, 0.06), steel, 1.1, 0.8, 0, 1, 1, 1, 0, 0, 0.25);
    add(g, bx(0.05, 0.05, 0.7), steel, 1.0, 1.2, 0); add(g, bx(0.3, 0.08, 0.25), housM, 0.45, 0.85, 0);
    const d = buildHuman({ shirt: [0x16a34a, 0xf8fafc, 0x2563eb][i % 3], pants: 0x334155, skin: [0xb87555, 0x8d5a3b, 0xc98262][i % 3], style: 'cap' });
    d.setRide(true); d.update(0, 0, 0); d.group.scale.setScalar(0.5); d.group.rotation.y = -Math.PI / 2; d.group.position.set(0.45, 0, 0); g.add(d.group);
    g.position.set(-120 + i * 47, 0, dir > 0 ? 33 : 45.3); g.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(g);
    cars.push({ g, dir, sp: 3.2 + (i % 3) * 0.6 });
  });

  // বাস স্টপ (শেড, বেঞ্চ, সাইন)
  for (const bxp of [-52, 52]) {
    const b = new THREE.Group(); b.position.set(bxp, 0, 50.6); scene.add(b);
    add(b, bx(5, 0.15, 2.2), M(0x1d4ed8, 0.5, 0.3), 0, 3, 0);
    for (const px of [-2.3, 2.3]) add(b, cy(0.06, 0.06, 3, 8), poleM, px, 1.5, 1);
    add(b, bx(3.4, 0.12, 0.6), M(0x6b4a2e, 0.6, 0.05), 0, 0.6, 0.6); add(b, bx(3.4, 0.5, 0.08), M(0x6b4a2e, 0.6, 0.05), 0, 0.95, 0.95);
    add(b, bx(4.6, 2, 0.05), M(0x9edfff, 0.1, 0.3), 0, 1.6, 1.05);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), new THREE.MeshBasicMaterial({ map: signTexture('BUS STOP', 'CITY LINE', 0x2563eb) }));
    sg.position.set(3.4, 3.4, 0); sg.rotation.y = Math.PI; b.add(sg); add(b, cy(0.05, 0.05, 3.4, 8), poleM, 3.4, 1.7, 0.05);
  }

  const update = (t: number, dt: number, dayF: number, cloudRGB: number[]) => {
    rickWheels.forEach((w) => { w.rotation.z -= dt * 3.5; });
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

/* ============================ শহর + বাজার ============================ */
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
  for (let x = -260, k = 0; x <= 260; x += 26, k++) { if (inRiver(x)) continue; tower(x + rr() * 3, 125, 18 + rr() * 6, 40 + rr() * 60, 16, k); }
  for (let x = -420, k = 0; x <= 420; x += 34, k++) { if (inRiver(x)) continue; tower(x, 200 + rr() * 40, 24, 70 + rr() * 110, 22, k + 2); }

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

  /* বাজার ও ফুটপাতের মানুষ (১৮ জন, বিভিন্ন লেনে) */
  const crowd = Array.from({ length: 18 }, (_, i) => {
    const h = buildHuman({ shirt: CAN[i % 7], female: i % 2 === 0, style: (['long', 'short', 'bun', 'cap', 'bald'] as const)[i % 5], skin: [0xc98262, 0xe0ac8a, 0x8d5a3b, 0xb87555][i % 4], pants: [0x1e293b, 0x334155, 0x7c2d12, 0x1e3a8a][i % 4], glasses: i % 6 === 0 });
    scene.add(h.group); const side = i % 2 ? 1 : -1;
    return { h, side, x: side * (16 + ((i * 7) % 90)), z: [53.8, 55.4, 63.2, 64.8, 74, 77][i % 6], dir: i % 3 ? 1 : -1, sp: 1.2 + (i % 4) * 0.3, ph: i };
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
  const [message, setMessage] = useState('🏬 হাঁটুন (W A S D, Shift = দৌড়), পণ্যে ক্লিক করুন। F = বাইক/নৌকা, R = রিকশা (ভাড়া কয়েন থেকে কাটবে)।');
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
  const [nearVeh, setNearVeh] = useState('');
  const [rideMode, setRideMode] = useState('walk');
  const [trip, setTrip] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [daily, setDaily] = useState<{ date: string; done: string[] }>({ date: todayKey(), done: [] });
  const [jsonText, setJsonText] = useState('');
  const [jsonMsg, setJsonMsg] = useState('');
  const [jsonUrl, setJsonUrl] = useState('');
  const dailyRef = useRef(daily); dailyRef.current = daily;
  const doneToday = daily.date === todayKey() ? daily.done : [];
  const balanceRef = useRef(100000); balanceRef.current = balance;

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
      const raw = await loadData(); applyConfig(raw);
      const base = normalizeShops(raw, [], true).shops;
      const saved = (await kv.get('shops-v4')) as Shop[] | undefined;
      const list = Array.isArray(saved) && saved.length ? saved : base;
      if (alive) { setShops(list); setSid(list[0]?.id ?? ''); }
      if (alive) setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => { kv.set('shops-v4', shops); }, 500);
    return () => clearTimeout(t);
  }, [loaded, shops]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ profile, cart, balance, score, daily })); } catch { /* ignore */ }
  }, [loaded, profile, cart, balance, score, daily]);
  useEffect(() => { meRef.current?.setName(profile.name, profile.photo); }, [profile]);

  /* আইডি ধরে সরাসরি যাওয়া: ?shop=fashion বা ?product=fashion:p2 */
  useEffect(() => {
    if (!loaded) return;
    const sp2 = new URLSearchParams(location.search), pid = sp2.get('product'), sid2 = sp2.get('shop');
    const f = pid ? findProduct(shopsRef.current, pid) : null;
    if (f) { tpRef.current = { x: 0, z: f.s.z }; setQty(1); setSelected({ ...f.p, shop: f.s.name }); }
    else if (sid2) { const s = findShop(shopsRef.current, sid2); if (s) tpRef.current = { x: 0, z: s.z }; }
  }, [loaded]);

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
      for (let z = -8; z > backZ + 10; z -= 38) for (const sx of [-4.6, 4.6]) {
        add(s, cy(0.7, 0.55, 1.2, 16), M(0x2b2f3a), sx, 0.6, z); add(s, sp(1.1, 16, 12), M(0x1f8a4c, 0.8, 0), sx, 2.1, z).castShadow = true; add(s, sp(0.7, 12, 10), M(0x2f9e44, 0.8, 0), sx + 0.4, 2.8, z + 0.2);
        shellCol.push({ minX: sx - 0.8, maxX: sx + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
      }
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

      // ---- বাড়তি সাজ: ক্যাশ মনিটর, মানিকিন, ঝুড়ি, সেল স্ট্যান্ড, পোস্টার, আরো ক্রেতা ----
      box(0.5, 0.34, 0.04, M(0x0b1d3a, 0.2, 0.3, 0x1d4ed8, 0.8), -5.4, 1.75, 5.7, false); box(0.5, 0.14, 0.4, metal, -4.6, 1.56, 6.1, false);
      if (shop.style === 'fashion') for (const mx of [-6.8, 6.8]) {
        const mq = buildHuman({ shirt: shop.accent, pants: 0x111827, skin: 0xd1d5db, style: 'bald' });
        mq.group.position.set(mx, 0, 8.2); mq.group.rotation.y = Math.PI + (mx < 0 ? 0.3 : -0.3); g.add(mq.group); solid(mx, 8.2, 0.9, 0.9);
      }
      for (let k = 0; k < 3; k++) box(0.55, 0.25, 0.4, M(0xdc2626, 0.6, 0.1), 7.2, 0.13 + k * 0.26, 4.5);
      solid(7.2, 4.5, 0.6, 0.5);
      box(0.9, 1.3, 0.08, dark, -3.6, 0.65, 8.8); solid(-3.6, 8.8, 0.9, 0.2);
      const stand = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.22), new THREE.MeshBasicMaterial({ map: signTexture('SALE', 'UP TO 50% OFF', shop.accent) }));
      stand.position.set(-3.6, 0.9, 8.85); g.add(stand);
      for (const [px, ry] of [[-8.66, Math.PI / 2], [8.66, -Math.PI / 2]] as const) for (const pz of [-4, 3]) {
        const po = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.3), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, 'BIG SALE - NEW ARRIVALS', shop.accent) }));
        po.position.set(px, 7.4, pz); po.rotation.y = ry; g.add(po);
      }
      ([[0, -0.8, 0.6], [6.4, 6.4, 2.6]] as const).forEach(([ex, ez, ry], n) => {
        const c = buildHuman({ shirt: PAL[(hs + n * 3) % PAL.length], pants: [0x1e293b, 0x7c2d12][n], skin: [0xe0ac8a, 0x8d5a3b][n], female: (hs + n) % 2 === 0, style: (['long', 'cap'] as const)[n], glasses: n === 1 });
        c.group.position.set(ex, 0, ez); g.add(c.group); idlers.push({ h: c, base: ry }); solid(ex, ez, 0.9, 0.9);
      });

      // পণ্য: ৩D ডিসপ্লে স্ট্যান্ড — ছবি + নাম + দাম + মডেল নং
      const localBoxes: { box: THREE.Box3; p: Product }[] = [], frameM = M(0x0b1220, 0.4, 0.5), baseM = M(0x1e293b, 0.4, 0.6);
      shop.products.slice(0, MAX_PRODUCTS).forEach((p, i) => {
        const sl = SLOTS[i], k = sl.s, pw = 0.8 * k, ph2 = 0.52 * k, lh = 0.26 * k;
        const grp = new THREE.Group(); grp.position.set(sl.x, sl.y, sl.z); grp.rotation.y = sl.ry; g.add(grp);
        add(grp, bx(0.86 * k, 0.07 * k, 0.34 * k), baseM, 0, 0.035 * k, 0);
        const tilt = new THREE.Group(); tilt.position.set(0, 0.07 * k, 0.06 * k); tilt.rotation.x = -0.14; grp.add(tilt);
        add(tilt, bx(pw + 0.08, lh + 0.05, 0.06 * k), frameM, 0, lh / 2, 0);
        add(tilt, pl(pw, lh), labelMat(p), 0, lh / 2, 0.032 * k);
        add(tilt, bx(pw + 0.08, ph2 + 0.08, 0.07 * k), frameM, 0, lh + 0.04 + ph2 / 2, 0);
        add(tilt, pl(pw, ph2), photoMat(p, textureLoader), 0, lh + 0.04 + ph2 / 2, 0.037 * k);
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
      { shirt: 0x1d4ed8, skin: 0xd9a07c, style: 'short', pants: 0x7c2d12 }, { shirt: 0x14b8a6, skin: 0xb87555, female: true, style: 'bun' },
      { shirt: 0xf1f5f9, skin: 0x8d5a3b, style: 'cap', glasses: true }, { shirt: 0xdc2626, skin: 0xe0ac8a, female: true, style: 'long', hair: 0x5b3a1e },
    ];
    const walkers = looks.map((o, i) => {
      const h = buildHuman(o); scene.add(h.group);
      return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 22, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
    });

    let walk = 0, amt = 0, runV = 0;
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
      const kk = e.key.toLowerCase();
      if ((kk === 'f' || kk === 'r') && !e.repeat && tg !== 'INPUT' && tg !== 'SELECT') rideCmdRef.current = kk === 'r' ? 2 : 1;
    };
    const ku = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    const resize = () => {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      camera.aspect = w / h; camera.fov = w / h < 0.8 ? 72 : 60; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(container);

    /* ---------- যানবাহন: বাইক, রিকশা, নৌকা + নদী ---------- */
    const moto = buildMoto(); moto.g.position.set(10, 0, 30); scene.add(moto.g);
    const rick = buildRick(); rick.g.position.set(-10, 0, 31); scene.add(rick.g);
    const river = addRiver(scene);
    type Mode = 'walk' | 'bike' | 'rick' | 'boat';
    let riding = false, mode: Mode = 'walk', veh: THREE.Group = moto.g, vel = 0, dirX = 0, dirZ = -1, nearLast = '', curShop = '';
    let fareAcc = 0, pending = 0, tripFare = 0;
    const SEAT: Record<string, number[]> = { bike: [0.62, 0.37, 0.15], rick: [0.6, 0.02, 0.7], boat: [0.62, -0.22, 0.9] };
    const inShop = (x: number, z: number) => {
      for (const b of built.values()) if (Math.abs(x - b.shop.x) < 10 && Math.abs(z - b.shop.z) < 9.5) return b.shop;
      return null;
    };
    const dist = (g: THREE.Object3D) => Math.hypot(g.position.x - player.position.x, g.position.z - player.position.z);
    const flush = () => { if (pending > 0) { const c = pending; pending = 0; setBalance((b) => Math.max(0, b - c)); } };
    const board = (kind: Mode, g: THREE.Group) => {
      const base = kind === 'rick' ? FARE.rickBase : kind === 'boat' ? FARE.boat : 0;
      if (base) {
        if (balanceRef.current < base) return setMessage(`❌ ভাড়ার কয়েন নেই (দরকার ${taka(base)})`);
        setBalance((b) => b - base);
      }
      const s = SEAT[kind]; riding = true; mode = kind; veh = g; tripFare = base; fareAcc = 0;
      me.setRide(true); me.group.scale.setScalar(s[0]); me.group.position.set(0, s[1], s[2]);
      player.position.set(g.position.x, 0, g.position.z); player.rotation.y = g.rotation.y;
      vel = 0; camDist = Math.max(camDist, 14);
      setRiding(true); setRideMode(kind); setTrip(Math.round(base)); completeRef.current('ride');
      setMessage(kind === 'rick' ? `🛺 রিকশায় উঠলেন — ভাড়া ${taka(base)} + প্রতি মিটারে ${taka(FARE.rickPerMeter)}। W A S D = দিক` : kind === 'boat' ? `⛵ নৌকা ভাড়া ${taka(base)}। W A S D = চালান, নদীর পাড়ে এনে F চাপলে নামবেন` : '🏍️ বাইকে উঠেছেন! W A S D = চালান, Shift = টার্বো');
    };
    const dismount = () => {
      const a = player.rotation.y;
      if (mode === 'boat') {
        const c = RIVER_C.find((cc) => Math.abs(player.position.x - cc) < RIVER_HW + 1) ?? 0, d = player.position.x - c;
        if (d < -RIVER_HW + 7) player.position.x = c - RIVER_HW - 1.5;
        else if (d > RIVER_HW - 7) player.position.x = c + RIVER_HW + 1.5;
        else { setMessage('⛵ তীরের কাছে এনে নামুন'); return; }
      } else {
        veh.position.set(player.position.x, 0, player.position.z); veh.rotation.y = a;
        player.position.x += Math.cos(a) * 1.8; player.position.z -= Math.sin(a) * 1.8;
      }
      flush();
      setMessage(mode === 'rick' ? `🛺 নামলেন — মোট ভাড়া ${taka(Math.round(tripFare))}` : '🚶 নামলেন।');
      riding = false; mode = 'walk'; me.setRide(false); me.group.scale.setScalar(1); me.group.position.set(0, 0, 0);
      setRiding(false); setRideMode('walk'); setTrip(0);
    };
    const toggleRide = (key: 'f' | 'r') => {
      if (riding) return dismount();
      if (inShop(player.position.x, player.position.z)) return setMessage('🏪 দোকানের ভেতরে যান চলে না — বাইরে এসে চেষ্টা করুন।');
      if (key === 'f') { const bt = river.boats.find((b) => dist(b.g) < 7); if (bt) return board('boat', bt.g); }
      const g = key === 'r' ? rick.g : moto.g;
      if (dist(g) > 6) {
        const a = player.rotation.y; g.position.set(player.position.x - Math.cos(a) * 3, 0, player.position.z + Math.sin(a) * 3); g.rotation.y = a;
        return setMessage(`${key === 'r' ? '🛺 রিকশা' : '🏍️ বাইক'} আপনার পাশে এসেছে — আবার চাপুন।`);
      }
      board(key === 'r' ? 'rick' : 'bike', g);
    };

    /* ---------- মূল লুপ ---------- */
    const R = 0.5;
    const blocked = (x: number, z: number) => {
      if (mode === 'boat') return !RIVER_C.some((c) => Math.abs(x - c) < RIVER_HW - 2.5) || z > 170;
      if (inWater(x, z) && !onBridge(z)) return true;
      const hit = (c: Box2) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R;
      if (shellCol.some(hit)) return true;
      if (z > 55 && outdoors.col.some(hit)) return true;
      if (riding && inShop(x, z)) return true;
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
      const far = Math.abs(px) > 90;
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
        const spd2 = mode === 'bike' ? [20, 30] : mode === 'rick' ? [8, 12] : mode === 'boat' ? [9, 15] : [7.5, 15];
        const top = spd2[k.s ? 1 : 0] * (riding && inMall ? 0.5 : 1);
        vel += ((on ? top * Math.min(1, len) : 0) - vel) * Math.min(1, dt * (riding ? 2.2 : on ? 7 : 12));
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
          const run = THREE.MathUtils.clamp((vel - 7.5) / 6, 0, 1);
          amt += (Math.min(1, vel / 5) - amt) * Math.min(1, dt * 8); walk += dt * vel * (1.15 + 0.1 * run); runV = run;
        } else {
          amt = 0; const spin = (vel * dt) / 0.63;
          if (mode === 'bike') { moto.wf.rotation.x -= spin; moto.wr.rotation.x -= spin; }
          else if (mode === 'rick') rick.wheels.forEach((w) => { w.rotation.x -= spin * 0.8; });
        }
        me.update(walk, amt, t, runV);
        posRef.current = { x: player.position.x, z: player.position.z };
        if (riding) { veh.position.x = player.position.x; veh.position.z = player.position.z; veh.rotation.y = player.rotation.y; }
        if (mode === 'rick' && vel > 0.05) {
          const c = vel * dt * FARE.rickPerMeter; fareAcc += c; tripFare += c;
          const whole = Math.floor(fareAcc); if (whole) { fareAcc -= whole; pending += whole; }
          if (frame % 20 === 0) flush();
          if (balanceRef.current - pending <= 0) { flush(); setMessage('💸 কয়েন শেষ — রিকশা থামানো হলো'); dismount(); }
        }
        river.update(dt);
        river.boats.forEach((b, i) => { b.g.position.y = 0.03 + Math.sin(t * 1.8 + i * 2) * 0.04; b.g.rotation.z = Math.sin(t * 1.3 + i) * 0.03; });

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

      /* বাইকের হেডলাইট, কাছের যান, দোকানে প্রবেশের বার্তা, F/R কমান্ড */
      moto.lamp.intensity = mode === 'bike' ? 250 * (1 - dayF) : 0;
      if (frame % 10 === 0) {
        const nv = riding ? '' : river.boats.some((b) => dist(b.g) < 7) ? 'boat' : dist(moto.g) < 6 ? 'bike' : dist(rick.g) < 6 ? 'rick' : '';
        if (nv !== nearLast) { nearLast = nv; setNearVeh(nv); }
        if (mode === 'rick') setTrip(Math.round(tripFare));
        const sh = inShop(player.position.x, player.position.z), sid2 = sh ? sh.id : '';
        if (sid2 !== curShop) { curShop = sid2; if (sh) { setMessage(`🏪 ${sh.name} এ প্রবেশ করেছেন`); completeRef.current('shop'); } }
      }
      if (rideCmdRef.current) { const c = rideCmdRef.current; rideCmdRef.current = 0; toggleRide(c === 2 ? 'r' : 'f'); }

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

      /* "সূর্য দেখুন" বাটন */
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
    patchShop(shop.id, (s) => ({ ...s, products: [...s.products, { id: `${s.id}:p${Date.now().toString(36)}`, name: np.name.trim(), price, image: np.image || IMG[np.kind] || ph(np.kind, color, np.name.trim()), kind: np.kind, color }] }));
    setNp({ ...np, name: '', price: '', image: '' }); setMessage('✅ পণ্য যোগ হয়েছে!');
  };
  const addDemo = () => {
    const need = Math.min(100, MAX_SHOPS) - shops.length;
    const slots = nextSlots(shops, Math.max(0, need));
    const extra = slots.map((s, i) => genShop(shops.length + i, s, 100));
    const filled = shops.map((s) => (s.products.length < 100 ? { ...s, products: [...s.products, ...genProducts(s.style, 100 - s.products.length, s.id.length * 7, s.id + ':x')] } : s));
    setShops([...filled, ...extra]); setMessage(`🎲 ডেমো তৈরি: মোট ${filled.length + extra.length}টি দোকান, প্রতিটিতে ১০০টি পণ্য`);
  };
  const importJson = (replace: boolean) => {
    try {
      const raw = JSON.parse(jsonText); applyConfig(raw);
      const r = normalizeShops(raw, shops, replace);
      if (!r.added && !r.products) throw new Error('কোনো বৈধ দোকান/পণ্য পাওয়া যায়নি (প্রতিটি পণ্যে name ও price দরকার)');
      setShops(r.shops); if (replace || !sid) setSid(r.shops[0]?.id ?? '');
      const m = `✅ ${r.added}টি নতুন দোকান ও ${r.products}টি পণ্য যোগ হয়েছে (মোট ${r.shops.length}টি দোকান)`;
      setJsonMsg(m); setMessage(m);
    } catch (e) { setJsonMsg('❌ ' + (e instanceof Error ? e.message : 'JSON ভুল')); }
  };
  const exportJson = () => {
    const out = {
      fare: FARE, images: IMG,
      shops: shops.map((s) => ({
        id: s.id, name: s.name, subtitle: s.subtitle, style: s.style, accent: hex(s.accent),
        products: s.products.map((p) => ({ id: p.id, name: p.name, price: p.price, kind: p.kind, color: hex(p.color), image: p.image.startsWith('data:') ? '' : p.image })),
      })),
    };
    setJsonText(JSON.stringify(out, null, 2)); setJsonMsg(`📤 ${out.shops.length}টি দোকানের ডেটা নিচে দেওয়া হলো (আপলোড করা ছবি বাদ যায়)`);
  };
  const fetchJson = async () => {
    try { const r = await fetch(jsonUrl.trim()); if (!r.ok) throw new Error('x'); setJsonText(await r.text()); setJsonMsg('✅ লিংক থেকে ডেটা এসেছে — এবার "যোগ করুন" চাপুন'); }
    catch { setJsonMsg('❌ লিংক থেকে আনা যায়নি (ভুল লিংক বা CORS বন্ধ)। ফাইল আপলোড বা সরাসরি পেস্ট করুন'); }
  };
  const reloadData = async () => {
    const raw = await loadData(); applyConfig(raw);
    const r = normalizeShops(raw, [], true); setShops(r.shops); setSid(r.shops[0]?.id ?? ''); setMessage('🔄 JSON থেকে ডেটা রিলোড হয়েছে');
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

      <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu"
        className={`absolute right-3 top-3 z-50 grid h-11 w-11 place-items-center rounded-full text-2xl font-black ${glass}`}>⋮</button>

      {rideMode === 'rick' && <div className={`absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-black ${glass}`}>🛺 ভাড়া {taka(trip)} • ব্যালেন্স {taka(balance)}</div>}

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
          <div className="mt-2 text-[10px] leading-5 text-slate-400">W A S D হাঁটা • Shift দৌড় • মাউস ড্র্যাগ / Q E ঘোরা • স্ক্রল জুম • ক্লিক = পণ্য • F = বাইক/নৌকা • R = রিকশা</div>
        </div>
      </>)}

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
              <div className="text-[11px] text-slate-400">মডেল নং: {modelNo(selected)} • আইডি: {selected.id}</div>
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
              <p>কিবোর্ডে W A S D বা অ্যারো কী দিয়ে হাঁটুন, Shift চেপে দৌড়ান। গতি ধীরে বাড়ে-কমে, দৌড়ালে শরীর সামনে ঝুঁকে পড়ে। মাউস ড্র্যাগ বা Q / E দিয়ে ঘুরুন, স্ক্রল করে জুম করুন। মোবাইলে বাম পাশের জয়স্টিক দিয়ে চলুন, স্ক্রিনে আঙুল টেনে ঘুরুন।</p></section>
            <section><h3 className="font-black text-cyan-300">🛍️ কেনাকাটা</h3>
              <p>পণ্যের ছবিতে ক্লিক বা ট্যাপ করলে নাম, দাম ও মডেল নং সহ বিস্তারিত খুলবে। সংখ্যা ঠিক করে "কার্টে নিন" চাপুন। মেনু থেকে কার্ট খুলে Checkout করলে ব্যালেন্স থেকে টাকা কাটবে এবং কেনা প্রতিটি পণ্যের জন্য ১০০ পয়েন্ট পাবেন।</p></section>
            <section><h3 className="font-black text-cyan-300">🏍️🛺⛵ বাইক, রিকশা, নৌকা</h3>
              <p>F = বাইক (ফ্রি) বা ঘাটের কাছে থাকলে নৌকা। R = রিকশা। যান দূরে থাকলে প্রথমবার চাপলে সেটা আপনার পাশে আসবে, আবার চাপলে উঠবেন। চলন্ত অবস্থায় আবার চাপলে নামবেন। রিকশায় শুরুতে {FARE.rickBase} কয়েন + প্রতি মিটারে {FARE.rickPerMeter} কয়েন কাটে, নৌকায় {FARE.boat} কয়েন। কয়েন শেষ হলে রিকশা থেমে যায়। দোকানের ভেতরে যান চলে না। নদী পার হতে ব্রিজ ব্যবহার করুন।</p></section>
            <section><h3 className="font-black text-cyan-300">🎯 দৈনিক টাস্ক ও পয়েন্ট</h3>
              <p>দিনে সর্বোচ্চ {TASKS.length}টি টাস্ক: দোকানে ঢোকা, পণ্য দেখা, কার্টে যোগ করা ও যানে চড়া। প্রতিটির আলাদা পয়েন্ট আছে, সব শেষ করলে বোনাস +{BONUS}। মেনুর "🎯 টাস্ক" থেকে অগ্রগতি দেখুন।</p></section>
            <section><h3 className="font-black text-cyan-300">🌗 দিন-রাত</h3>
              <p>মেনুর স্লাইডার দিয়ে সময় বদলান, ⏸ দিয়ে সময় থামান, "দেখুন" চাপলে ক্যামেরা সূর্য বা চাঁদের দিকে ঘুরবে।</p></section>
            <section><h3 className="font-black text-cyan-300">🏪 দোকান ও পণ্য যোগ করা</h3>
              <p>মেনু → দোকান। সেখানে নতুন দোকান খুলুন, পণ্যের নাম, দাম ও ছবির লিংক দিয়ে পণ্য যোগ করুন। তালিকার ✏️ দিয়ে নাম ও দাম এবং 🖼️ দিয়ে ছবির লিংক বদলানো যায়। একটি দোকানে সর্বোচ্চ {MAX_PRODUCTS}টি পণ্য এবং মোট {MAX_SHOPS}টি দোকান রাখা যায়।</p></section>
            <section><h3 className="font-black text-cyan-300">📦 JSON দিয়ে সব ডেটা</h3>
              <p>ভাড়া, ছবির লিংক, দোকান ও পণ্য সব একটাই JSON-এ। কোডের ভেতরে DATA অবজেক্ট আছে; <code>public/mall-data.json</code> ফাইল থাকলে সেটাই আগে লোড হবে। পণ্যের গ্লোবাল আইডি = <code>দোকানId:পণ্যId</code>। লিংকে <code>?shop=fashion</code> বা <code>?product=fashion:p2</code> দিলে সরাসরি সেখানে যাবে। দোকান প্যানেলের "JSON ডেটা" অংশে পেস্ট, ফাইল আপলোড বা লিংক থেকে আনা যায়।</p>
              <pre className="mt-1 overflow-x-auto rounded-xl bg-black/40 p-2 text-[10px] leading-4 text-emerald-200">{`{ "fare": { "rickBase": 20, "rickPerMeter": 1.5, "boat": 30 },
  "images": { "jacket": "https://...jpg" },
  "shops": [{ "id": "fashion", "name": "MY SHOP",
    "style": "fashion|tech|home|market",
    "accent": "#e11d48",
    "products": [{ "id": "jk1", "name": "পণ্য",
      "price": 500, "kind": "jacket",
      "image": "jacket" }] }] }`}</pre>
              <p className="mt-1 text-slate-400">name ও price বাধ্যতামূলক। image এ পুরো লিংক অথবা images-এর কী দেওয়া যায়। না দিলে kind অনুযায়ী ডিফল্ট ছবি বসবে।</p></section>
          </div>
        </div>
      )}

      {panel === 'shops' && (
        <div className={`absolute inset-x-2 top-16 z-50 max-h-[82dvh] overflow-y-auto rounded-3xl p-4 md:inset-x-auto md:right-3 md:w-[400px] ${glass}`}>
          <div className="flex items-center justify-between"><b>🏪 দোকান ম্যানেজার ({shops.length}/{MAX_SHOPS})</b><button onClick={() => setPanel('')} className="rounded-lg bg-white/10 px-2 py-1 text-xs">✕</button></div>
          <button className={`${btn} mt-3 w-full`} onClick={addDemo}>🎲 ডেমো: ১০০টি দোকান × ১০০টি পণ্য তৈরি করুন</button>
          <button className={`${btn} mt-2 w-full`} onClick={reloadData}>🔄 JSON ফাইল থেকে রিলোড</button>
          <input className={`${inp} mt-3`} placeholder="🔍 দোকান খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <select className={inp} value={sid} onChange={(e) => { setSid(e.target.value); setRn(''); }}>
              {filtered.slice(0, 300).map((s) => <option key={s.id} value={s.id} className="text-black">{s.name} ({s.products.length})</option>)}
            </select>
            {shop && <button className={`${btn} whitespace-nowrap`} onClick={() => teleport(shop)}>📍 যান</button>}
          </div>
          {shop && (<>
            <div className="mt-1 text-[10px] text-slate-400">দোকান আইডি: {shop.id}</div>
            <div className="mt-2 flex gap-2">
              <input className={inp} placeholder="নতুন নাম" value={rn} onChange={(e) => setRn(e.target.value)} />
              <button className={`${btn} whitespace-nowrap`} onClick={() => { if (rn.trim()) { patchShop(shop.id, (s) => ({ ...s, name: rn.trim().toUpperCase().slice(0, 18) })); setRn(''); } }}>নাম বদলান</button>
            </div>
            <div className="mt-3 text-[11px] font-bold text-cyan-300">পণ্য ({shop.products.length}/{MAX_PRODUCTS})</div>
            <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
              {shop.products.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 text-xs">
                  <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ph(p.kind, p.color, p.name); }} />
                  <span className="min-w-0 flex-1 truncate" title={p.id}>{p.name}</span><b className="text-yellow-300">{taka(p.price)}</b>
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
          <div className="mt-4 text-[11px] font-bold text-cyan-300">📦 JSON ডেটা (ভাড়া, ছবি, দোকান ও পণ্য)</div>
          <div className="mt-1 space-y-2 rounded-2xl bg-white/5 p-2">
            <textarea className={`${inp} h-36 font-mono text-[11px]`} spellCheck={false} placeholder='{"fare":{...},"images":{...},"shops":[{"name":"MY SHOP","products":[{"name":"পণ্য","price":500}]}]}' value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
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
        <div className="absolute bottom-16 right-5 z-30 flex flex-col gap-2">
          <button onClick={() => { rideCmdRef.current = 2; }} className={`rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
            {riding ? '🛑 নামুন' : nearVeh === 'rick' ? '🛺 রিকশায় চড়ুন (R)' : '🛺 রিকশা ডাকুন (R)'}</button>
          <button onClick={() => { rideCmdRef.current = 1; }} className={`rounded-2xl px-4 py-3 text-sm font-black active:scale-95 ${glass}`}>
            {riding ? '🛑 নামুন' : nearVeh === 'boat' ? '⛵ নৌকায় উঠুন (F)' : nearVeh === 'bike' ? '🏍️ চড়ুন (F)' : '🏍️ বাইক ডাকুন (F)'}</button>
        </div>
      )}

      {paused && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm">
          <button onClick={() => setPaused(false)} className="rounded-2xl bg-cyan-500 px-8 py-4 text-lg font-black text-slate-950">▶️ Resume</button>
        </div>
      )}
    </main>
  );
}
