'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type Product = { id: string; name: string; price: number; image: string };
type Selected = Product & { shop: string };
type CartItem = Selected & { count: number };

type Shop = {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  z: number;
  accent: number;
  video: string;
  products: Product[];
};

// Replace these with your own files, e.g. '/videos/fashion.mp4' (put them in /public/videos)
const V = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const VIDEO = {
  fashion: V + 'ForBiggerBlazes.mp4',
  tech: V + 'ForBiggerEscapes.mp4',
  home: V + 'ForBiggerJoyrides.mp4',
  market: V + 'ForBiggerFun.mp4',
  hall: V + 'ForBiggerMeltdowns.mp4',
};

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;
const IMG = {
  watch: u('photo-1523275335684-37898b6baf30'),
  shoe: u('photo-1542291026-7eec264c27ff'),
  sunglasses: u('photo-1511499767150-a48a237f0083'),
  camera: u('photo-1516035069371-29a1b244cc32'),
  headphones: u('photo-1505740420928-5e560c06d30e'),
  phone: u('photo-1511707171634-5f897ff02aa9'),
  shirt: u('photo-1521572163474-6864f9cf17ab'),
  jacket: u('photo-1551488831-00ddcb6c6bd3'),
  bag: u('photo-1553062407-98eeb64c6a62'),
  chair: u('photo-1598300042247-d088f8ab3a91'),
  lamp: u('photo-1507473885765-e6ed057f782c'),
  coffee: u('photo-1495474472287-4d71bcdd2085'),
  perfume: u('photo-1541643600914-78b084683601'),
  chocolate: u('photo-1548907040-4d42c6d3a0b0'),
  honey: u('photo-1471943311424-646960669fbc'),
  rice: u('photo-1586201375761-83865001e31c'),
};

const SHOPS: Shop[] = [
  {
    id: 'fashion', name: 'NOVA FASHION', subtitle: 'Premium Fashion & Lifestyle',
    x: -17, z: -25, accent: 0x7c3aed, video: VIDEO.fashion,
    products: [
      { id: 'f1', name: 'Premium T-Shirt', price: 1800, image: IMG.shirt },
      { id: 'f2', name: 'Urban Jacket', price: 5200, image: IMG.jacket },
      { id: 'f3', name: 'Classic Sunglasses', price: 2400, image: IMG.sunglasses },
      { id: 'f4', name: 'Leather Bag', price: 3900, image: IMG.bag },
      { id: 'f5', name: 'Running Sneaker', price: 4200, image: IMG.shoe },
      { id: 'f6', name: 'Signature Perfume', price: 3100, image: IMG.perfume },
      { id: 'f7', name: 'Smart Casual Shirt', price: 2600, image: IMG.shirt },
      { id: 'f8', name: 'Premium Coat', price: 7800, image: IMG.jacket },
    ],
  },
  {
    id: 'tech', name: 'TECHHUB', subtitle: 'Smart Devices & Electronics',
    x: 17, z: -25, accent: 0x0891b2, video: VIDEO.tech,
    products: [
      { id: 't1', name: 'Smart Watch', price: 4500, image: IMG.watch },
      { id: 't2', name: 'Mirrorless Camera', price: 62000, image: IMG.camera },
      { id: 't3', name: 'Wireless Headphones', price: 6800, image: IMG.headphones },
      { id: 't4', name: 'Flagship Phone', price: 92000, image: IMG.phone },
      { id: 't5', name: 'Bluetooth Speaker', price: 3900, image: IMG.headphones },
      { id: 't6', name: 'Action Camera', price: 18500, image: IMG.camera },
      { id: 't7', name: 'Premium Watch', price: 8500, image: IMG.watch },
      { id: 't8', name: 'Smart Phone Pro', price: 72000, image: IMG.phone },
    ],
  },
  {
    id: 'home', name: 'URBAN HOME', subtitle: 'Furniture & Home Decor',
    x: -17, z: -65, accent: 0xd97706, video: VIDEO.home,
    products: [
      { id: 'h1', name: 'Designer Chair', price: 8500, image: IMG.chair },
      { id: 'h2', name: 'Modern Table Lamp', price: 3200, image: IMG.lamp },
      { id: 'h3', name: 'Luxury Lounge Chair', price: 14500, image: IMG.chair },
      { id: 'h4', name: 'Premium Lamp', price: 5200, image: IMG.lamp },
      { id: 'h5', name: 'Home Accent Chair', price: 9200, image: IMG.chair },
      { id: 'h6', name: 'Designer Light', price: 4600, image: IMG.lamp },
    ],
  },
  {
    id: 'market', name: 'FRESH MART', subtitle: 'Premium Grocery & Food',
    x: 17, z: -65, accent: 0x16a34a, video: VIDEO.market,
    products: [
      { id: 'm1', name: 'Pure Organic Honey', price: 950, image: IMG.honey },
      { id: 'm2', name: 'Imported Chocolate', price: 1500, image: IMG.chocolate },
      { id: 'm3', name: 'Premium Rice 10KG', price: 1800, image: IMG.rice },
      { id: 'm4', name: 'Fresh Coffee', price: 1250, image: IMG.coffee },
      { id: 'm5', name: 'Dark Chocolate', price: 950, image: IMG.chocolate },
      { id: 'm6', name: 'Arabica Coffee', price: 1650, image: IMG.coffee },
      { id: 'm7', name: 'Natural Honey', price: 1150, image: IMG.honey },
      { id: 'm8', name: 'Premium Basmati Rice', price: 2400, image: IMG.rice },
    ],
  },
];

const taka = (n: number) => '৳' + n.toLocaleString();

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  REALISTIC HUMAN (jointed legs/arms, face, hair, clothes)           */
/* ------------------------------------------------------------------ */

type Human = { group: THREE.Group; update: (phase: number, amt: number, t: number) => void };
type HumanOpts = { skin?: number; shirt?: number; pants?: number; hair?: number; shoe?: number; female?: boolean; skirt?: boolean; mannequin?: boolean };

const buildHuman = (o: HumanOpts = {}): Human => {
  const std = (c: number, r = 0.65, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const man = !!o.mannequin;
  const skin = std(man ? 0xe9eaf0 : o.skin ?? 0xc98262, man ? 0.25 : 0.62);
  const shirt = std(o.shirt ?? 0x2563eb, 0.75);
  const pants = std(o.pants ?? 0x172033, 0.8);
  const hairM = std(o.hair ?? 0x17120f, 0.8);
  const shoeM = std(o.shoe ?? 0x0b0f17, 0.4, 0.2);
  const sole = std(0xf1f5f9, 0.6);
  const white = std(0xffffff, 0.3);
  const dark = std(0x0a0a0a, 0.3);
  const lip = std(0x9a4a4a, 0.5);

  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);
  if (o.female) group.scale.setScalar(0.95);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true;
    parent.add(m);
    return m;
  };

  // torso, pelvis, belt
  add(root, new THREE.CapsuleGeometry(o.female ? 0.33 : 0.37, 0.5, 6, 16), shirt, 0, 2.35, 0, 1, 1, 0.62);
  add(root, new THREE.SphereGeometry(0.3, 16, 12), pants, 0, 1.72, 0, o.female ? 1.2 : 1.05, 0.7, 0.75);
  add(root, new THREE.CylinderGeometry(0.34, 0.34, 0.07, 20), dark, 0, 1.82, 0, 1, 1, 0.65);
  if (o.female && o.skirt) add(root, new THREE.CylinderGeometry(0.3, 0.5, 0.75, 24), pants, 0, 1.38, 0, 1, 1, 0.8);

  const makeArm = (side: number) => {
    const sh = new THREE.Group();
    sh.position.set(side * (o.female ? 0.48 : 0.53), 2.82, 0);
    root.add(sh);
    add(sh, new THREE.SphereGeometry(0.13, 12, 10), shirt);
    add(sh, new THREE.CapsuleGeometry(0.1, 0.34, 4, 10), skin, 0, -0.32, 0);
    add(sh, new THREE.CapsuleGeometry(0.115, 0.16, 4, 10), shirt, 0, -0.18, 0);
    const el = new THREE.Group();
    el.position.y = -0.6;
    sh.add(el);
    add(el, new THREE.SphereGeometry(0.09, 10, 8), skin);
    add(el, new THREE.CapsuleGeometry(0.082, 0.32, 4, 10), skin, 0, -0.3, 0);
    add(el, new THREE.SphereGeometry(0.095, 10, 8), skin, 0, -0.64, 0, 1, 1.2, 0.7);
    return { sh, el };
  };

  const makeLeg = (side: number) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.24, 1.68, 0);
    root.add(hip);
    add(hip, new THREE.CapsuleGeometry(0.15, 0.52, 4, 12), pants, 0, -0.4, 0);
    const kn = new THREE.Group();
    kn.position.y = -0.8;
    hip.add(kn);
    add(kn, new THREE.SphereGeometry(0.125, 10, 8), pants);
    add(kn, new THREE.CapsuleGeometry(0.12, 0.46, 4, 12), pants, 0, -0.38, 0);
    const foot = new THREE.Group();
    foot.position.y = -0.77;
    kn.add(foot);
    add(foot, new THREE.BoxGeometry(0.28, 0.16, 0.62), shoeM, 0, 0, -0.12);
    add(foot, new THREE.BoxGeometry(0.29, 0.05, 0.63), sole, 0, -0.08, -0.12);
    return { hip, kn };
  };

  const AL = makeArm(-1), AR = makeArm(1), LL = makeLeg(-1), LR = makeLeg(1);

  // neck + head (front faces -Z)
  add(root, new THREE.CylinderGeometry(0.1, 0.12, 0.22, 12), skin, 0, 3.08, 0);
  const head = new THREE.Group();
  head.position.set(0, 3.42, 0);
  root.add(head);
  add(head, new THREE.SphereGeometry(0.3, 28, 22), skin, 0, 0, 0, 0.9, 1.08, 0.98);
  if (!man) {
    for (const s of [-1, 1]) {
      add(head, new THREE.SphereGeometry(0.05, 12, 10), white, s * 0.11, 0.04, -0.26, 1, 0.8, 0.5);
      add(head, new THREE.SphereGeometry(0.026, 10, 8), dark, s * 0.11, 0.04, -0.285);
      add(head, new THREE.BoxGeometry(0.11, 0.016, 0.02), hairM, s * 0.11, 0.12, -0.27);
      add(head, new THREE.SphereGeometry(0.05, 8, 8), skin, s * 0.275, 0, 0, 0.5, 1, 0.8);
    }
    add(head, new THREE.SphereGeometry(0.04, 10, 8), skin, 0, -0.04, -0.3, 0.8, 1.1, 1);
    add(head, new THREE.BoxGeometry(0.12, 0.018, 0.02), lip, 0, -0.14, -0.275);
    add(head, new THREE.SphereGeometry(0.315, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.02, 0.02, 0.93, 1.1, 1.0);
    add(head, new THREE.SphereGeometry(0.29, 16, 12), hairM, 0, -0.02, 0.08, 0.92, 1.0, 0.9);
    if (o.female) add(head, new THREE.CapsuleGeometry(0.27, 0.45, 6, 12), hairM, 0, -0.32, 0.1, 0.95, 1, 0.7);
  }

  const update = (phase: number, amt: number, t: number) => {
    const s = Math.sin(phase) * 0.75 * amt;
    LL.hip.rotation.x = s; LR.hip.rotation.x = -s;
    LL.kn.rotation.x = -Math.max(0, Math.cos(phase)) * 0.9 * amt;
    LR.kn.rotation.x = -Math.max(0, -Math.cos(phase)) * 0.9 * amt;
    AL.sh.rotation.x = -s * 0.7; AR.sh.rotation.x = s * 0.7;
    AL.el.rotation.x = 0.15 + amt * 0.5 * Math.max(0, -s);
    AR.el.rotation.x = 0.15 + amt * 0.5 * Math.max(0, s);
    root.position.y = Math.abs(Math.sin(phase)) * 0.07 * amt;
    root.rotation.x = -0.04 * amt;
    root.rotation.y = s * 0.12;
    root.scale.y = 1 + Math.sin(t * 1.6) * 0.004;
    head.rotation.y = Math.sin(t * 0.5 + phase * 0.1) * 0.18 * (1 - amt);
  };
  update(0, 0, 0);
  return { group, update };
};

export default function ModernRealisticMall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef({ f: false, b: false, l: false, r: false });
  const joyRef = useRef({ x: 0, y: 0 });
  const pausedRef = useRef(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [balance, setBalance] = useState(100000);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [message, setMessage] = useState('🏬 মলের ভেতরে হাঁটুন, যেকোনো পণ্যে ট্যাপ/ক্লিক করে কিনুন।');
  const [touch, setTouch] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const total = cart.reduce((s, i) => s + i.price * i.count, 0);
  const cartCount = cart.reduce((s, i) => s + i.count, 0);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const check = () => setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    check();
    setCartOpen(window.innerWidth >= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ------------------------------ 3D SCENE ------------------------------ */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.007);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.55;

    /* ---------- lights ---------- */
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x1a2030, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(20, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 40, bottom: -130, far: 160 });
    sun.target.position.set(0, 0, -45);
    scene.add(sun, sun.target);

    /* ---------- helpers ---------- */
    const colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
    const hitboxes: THREE.Mesh[] = [];
    const floaters: { obj: THREE.Object3D; base: number; i: number }[] = [];
    const idlers: { h: Human; base: number; sway: number }[] = [];
    const spinners: THREE.Object3D[] = [];
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    const imageCache = new Map<string, THREE.Texture>();

    const loadImage = (url: string, targetAspect: number) => {
      const hit = imageCache.get(url);
      if (hit) return hit;
      const tex = textureLoader.load(url, (t) => {
        const img = t.image as HTMLImageElement;
        const a = img.width / img.height;
        if (a > targetAspect) { t.repeat.x = targetAspect / a; t.offset.x = (1 - t.repeat.x) / 2; }
        else { t.repeat.y = a / targetAspect; t.offset.y = (1 - t.repeat.y) / 2; }
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      imageCache.set(url, tex);
      return tex;
    };

    const tileTexture = (a: string, b: string, line: string, rx: number, ry: number) => {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const x = c.getContext('2d')!;
      x.fillStyle = a; x.fillRect(0, 0, 256, 256);
      x.fillStyle = b; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128);
      x.strokeStyle = line; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.anisotropy = 8;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

    const signTexture = (title: string, sub: string, accent: number) => {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 280;
      const x = c.getContext('2d')!;
      x.fillStyle = '#07111f'; x.fillRect(0, 0, 1024, 280);
      x.fillStyle = hex(accent); x.fillRect(0, 250, 1024, 30);
      x.fillStyle = '#fff'; x.font = '900 86px Arial'; x.textAlign = 'center';
      x.fillText(title, 512, 125);
      x.fillStyle = '#b9c6d8'; x.font = '500 36px Arial';
      x.fillText(sub, 512, 190);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    const priceTexture = (name: string, price: number) => {
      const c = document.createElement('canvas');
      c.width = 640; c.height = 190;
      const x = c.getContext('2d')!;
      x.fillStyle = '#050b16'; x.fillRect(0, 0, 640, 190);
      x.fillStyle = '#fff'; x.font = 'bold 34px Arial'; x.textAlign = 'center';
      x.fillText(name.length > 24 ? name.slice(0, 23) + '…' : name, 320, 70);
      x.fillStyle = '#facc15'; x.font = '900 52px Arial';
      x.fillText(`৳ ${price.toLocaleString()}`, 320, 140);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    /* ---------- video screens (with animated fallback) ---------- */
    type Screen = { video: HTMLVideoElement; obj: THREE.Object3D; failed: boolean; draw: (t: number) => void; tex: THREE.CanvasTexture };
    const screens: Screen[] = [];

    const addScreen = (parent: THREE.Object3D, src: string, w: number, h: number, title: string, accent: number, x: number, y: number, z: number) => {
      const video = document.createElement('video');
      video.src = src;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('playsinline', '');
      const vTex = new THREE.VideoTexture(video);
      vTex.colorSpace = THREE.SRGBColorSpace;

      const fc = document.createElement('canvas');
      fc.width = 640; fc.height = Math.round((640 * h) / w);
      const fx = fc.getContext('2d')!;
      const fTex = new THREE.CanvasTexture(fc);
      fTex.colorSpace = THREE.SRGBColorSpace;
      const draw = (t: number) => {
        const g = fx.createLinearGradient(0, 0, fc.width, fc.height);
        g.addColorStop(0, hex(accent));
        g.addColorStop(1, '#0b1220');
        fx.fillStyle = g; fx.fillRect(0, 0, fc.width, fc.height);
        fx.fillStyle = 'rgba(255,255,255,.12)';
        fx.beginPath(); fx.arc(fc.width * (0.5 + 0.35 * Math.sin(t * 0.8)), fc.height / 2, fc.height * 0.4, 0, 7); fx.fill();
        fx.fillStyle = '#fff'; fx.font = '900 54px Arial'; fx.textAlign = 'center';
        fx.fillText(title, fc.width / 2, fc.height / 2 + 18);
        fTex.needsUpdate = true;
      };

      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x05080f, metalness: 0.8, roughness: 0.3 }));
      frame.position.set(x, y, z);
      const mat = new THREE.MeshBasicMaterial({ map: vTex, toneMapped: false });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      plane.position.z = 0.17;
      frame.add(plane);
      parent.add(frame);

      const s: Screen = { video, obj: frame, failed: false, draw, tex: fTex };
      video.addEventListener('error', () => {
        s.failed = true;
        mat.map = fTex;
        mat.needsUpdate = true;
      });
      video.play().catch(() => {});
      screens.push(s);
    };

    /* ---------- floor, walls, ceiling ---------- */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 140),
      new THREE.MeshStandardMaterial({ map: tileTexture('#2a3447', '#303b50', '#1a2232', 20, 35), roughness: 0.25, metalness: 0.15 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -45);
    floor.receiveShadow = true;
    scene.add(floor);

    const runner = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 140),
      new THREE.MeshStandardMaterial({ color: 0x1b2638, roughness: 0.15, metalness: 0.3 })
    );
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.02, -45);
    scene.add(runner);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x10172a, roughness: 0.4, metalness: 0.5 });
    const outerL = new THREE.Mesh(new THREE.BoxGeometry(1, 14, 140), wallMat);
    outerL.position.set(-40.5, 7, -45);
    const outerR = outerL.clone(); outerR.position.x = 40.5;
    const outerB = new THREE.Mesh(new THREE.BoxGeometry(82, 14, 1), wallMat);
    outerB.position.set(0, 7, -115.5);
    scene.add(outerL, outerR, outerB);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(80, 140), new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.9 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 14, -45);
    scene.add(ceiling);

    const glowMat = new THREE.MeshStandardMaterial({ color: 0xeaf8ff, emissive: 0xbde9ff, emissiveIntensity: 2.2 });
    for (let z = 10; z > -112; z -= 10) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 0.5), glowMat);
      bar.position.set(0, 13.85, z);
      scene.add(bar);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      stripe.position.set(0, 0.04, z - 5);
      scene.add(stripe);
    }

    // end-wall big screen
    addScreen(scene, VIDEO.hall, 28, 9, 'GRAND MALL', 0x38bdf8, 0, 7, -114.8);

    // entrance arch
    const archMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.25 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(30, 4.5, 1.2), archMat);
    beam.position.set(0, 11.7, 10);
    scene.add(beam);
    for (const px of [-14.4, 14.4]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 1.2), archMat);
      p.position.set(px, 7, 10);
      p.castShadow = true;
      scene.add(p);
    }
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.4), new THREE.MeshBasicMaterial({ map: signTexture('GRAND MALL', 'FUTURE SHOPPING EXPERIENCE', 0x38bdf8) }));
    arch.position.set(0, 11.7, 10.65);
    scene.add(arch);
    const archBack = arch.clone(); archBack.rotation.y = Math.PI; archBack.position.z = 9.35;
    scene.add(archBack);

    // plants & benches
    const potMat = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.6 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f8a4c, roughness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.7 });
    const addCollider = (minX: number, maxX: number, minZ: number, maxZ: number) => colliders.push({ minX, maxX, minZ, maxZ });
    for (const sx of [-5.2, 5.2]) {
      for (const pz of [-8, -45, -85]) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 1.2, 16), potMat);
        pot.position.set(sx, 0.6, pz); pot.castShadow = true;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), leafMat);
        leaf.position.set(sx, 2.1, pz); leaf.castShadow = true;
        scene.add(pot, leaf);
        addCollider(sx - 0.8, sx + 0.8, pz - 0.8, pz + 0.8);
      }
      for (const bz of [-43, -47]) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 2.6), woodMat);
        seat.position.set(sx * 0.82, 0.9, bz + (bz < -45 ? -0.2 : 0.2) - 0.0);
        seat.position.z = bz * 1 + (bz === -43 ? 0 : 0);
        seat.castShadow = true;
        scene.add(seat);
      }
    }

    /* ---------- shops ---------- */
    SHOPS.forEach((shop, si) => {
      const g = new THREE.Group();
      g.position.set(shop.x, 0, shop.z);
      g.rotation.y = shop.x < 0 ? Math.PI / 2 : -Math.PI / 2; // door faces the walkway
      scene.add(g);

      const accentHex = hex(shop.accent);
      const accentMat = new THREE.MeshStandardMaterial({ color: shop.accent, roughness: 0.3, metalness: 0.5 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x131a2a, roughness: 0.35, metalness: 0.6 });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.85 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x9edfff, transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.3, depthWrite: false });

      const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, shadow = true) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        mesh.position.set(x, y, z);
        mesh.castShadow = shadow; mesh.receiveShadow = true;
        g.add(mesh);
        return mesh;
      };

      // convert local box -> world AABB collider
      const solid = (lx: number, lz: number, w: number, d: number) => {
        const c = Math.round(Math.cos(g.rotation.y));
        const s = Math.round(Math.sin(g.rotation.y));
        const wx = shop.x + lx * c + lz * s;
        const wz = shop.z - lx * s + lz * c;
        const sw = Math.abs(w * c) + Math.abs(d * s);
        const sd = Math.abs(w * s) + Math.abs(d * c);
        addCollider(wx - sw / 2, wx + sw / 2, wz - sd / 2, wz + sd / 2);
      };

      // floor + accent carpet
      const sf = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 20),
        new THREE.MeshStandardMaterial({ map: tileTexture('#d8dde6', '#c4cad6', '#9aa3b2', 8, 10), roughness: 0.3, metalness: 0.1 })
      );
      sf.rotation.x = -Math.PI / 2; sf.position.y = 0.03; sf.receiveShadow = true;
      g.add(sf);
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 19), new THREE.MeshStandardMaterial({ color: shop.accent, roughness: 0.9 }));
      carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.05, 0);
      g.add(carpet);

      // walls (solid)
      box(0.4, 10, 20, accentMat, -7.9, 5, 0); solid(-7.9, 0, 0.4, 20);
      box(0.4, 10, 20, accentMat, 7.9, 5, 0); solid(7.9, 0, 0.4, 20);
      box(16, 10, 0.4, darkMat, 0, 5, -9.9); solid(0, -9.9, 16, 0.4);

      // storefront: header, glass, door frame
      box(16, 3.4, 0.5, darkMat, 0, 8.3, 10);
      for (const gx of [-5, 5]) {
        const gl = new THREE.Mesh(new THREE.BoxGeometry(6, 6.6, 0.1), glassMat);
        gl.position.set(gx, 3.3, 10); g.add(gl);
        solid(gx, 9.9, 6, 0.4);
      }
      for (const fx of [-2, 2]) box(0.3, 6.6, 0.4, metalMat, fx, 3.3, 10);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 3.0), new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.subtitle, shop.accent) }));
      sign.position.set(0, 8.3, 10.27);
      g.add(sign);

      // lights
      const pl = new THREE.PointLight(0xfff1dc, 45, 28, 2);
      pl.position.set(0, 8, 0);
      g.add(pl);
      for (const lz of [-5, 3]) box(13, 0.12, 0.35, glowMat, 0, 9.7, lz, false);

      // back wall video screen
      addScreen(g, shop.video, 9, 5, shop.name, shop.accent, 0, 6.1, -9.5);
      box(9.5, 0.12, 0.2, new THREE.MeshBasicMaterial({ color: shop.accent }), 0, 3.4, -9.55, false);

      // ---- modern finishes ----
      const slatC = document.createElement('canvas');
      slatC.width = 256; slatC.height = 64;
      const sc = slatC.getContext('2d')!;
      sc.fillStyle = '#1f1710'; sc.fillRect(0, 0, 256, 64);
      for (let k = 0; k < 16; k++) { sc.fillStyle = k % 2 ? '#4a3626' : '#2a2018'; sc.fillRect(k * 16, 0, 11, 64); }
      const slatTex = new THREE.CanvasTexture(slatC);
      slatTex.wrapS = slatTex.wrapT = THREE.RepeatWrapping;
      slatTex.repeat.set(2, 1);
      slatTex.colorSpace = THREE.SRGBColorSpace;
      const slat = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 9.4), new THREE.MeshStandardMaterial({ map: slatTex, roughness: 0.55 }));
      slat.position.set(0, 4.7, -9.68);
      g.add(slat);

      const ledMat = new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 2.5 });
      for (const s of [-1, 1]) box(0.12, 0.15, 19.4, ledMat, s * 7.65, 9.6, 0, false);
      box(15.6, 0.15, 0.12, ledMat, 0, 9.6, -9.65, false);
      box(12.9, 0.1, 0.1, ledMat, 0, 9.85, 10.3, false);
      box(12.9, 0.1, 0.1, ledMat, 0, 6.75, 10.3, false);
      for (const rz of [-6, 0, 6]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.05, 8, 40), ledMat);
        ring.rotation.x = Math.PI / 2; ring.position.set(0, 9.0, rz);
        g.add(ring);
      }

      const fabric = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
      if (shop.id === 'fashion') {
        [-4.2, 4.2].forEach((mx, k) => {
          box(1.5, 0.15, 1.5, darkMat, mx, 0.075, -7);
          const mq = buildHuman({ mannequin: true, shirt: k ? shop.accent : 0xf8fafc, pants: k ? 0x1e293b : 0x334155, female: !!k, skirt: !!k });
          mq.group.position.set(mx, 0.15, -7);
          mq.group.rotation.y = Math.PI;
          g.add(mq.group);
          solid(mx, -7, 1.5, 1.5);
        });
      } else if (shop.id === 'tech') {
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.0, 24), darkMat);
        ped.position.set(0, 0.5, -7);
        g.add(ped);
        const holo = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true }));
        holo.position.set(0, 2.3, -7);
        g.add(holo);
        spinners.push(holo);
        solid(0, -7, 1.7, 1.7);
      } else if (shop.id === 'home') {
        const rug = new THREE.Mesh(new THREE.CircleGeometry(2.9, 40), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 1 }));
        rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.07, -6.4);
        g.add(rug);
        box(4.2, 0.7, 1.6, fabric, 0, 0.35, -7.1);
        box(4.2, 1.3, 0.35, fabric, 0, 1.15, -7.8);
        for (const ax of [-2.1, 2.1]) box(0.35, 1.0, 1.6, fabric, ax, 0.5, -7.1);
        const cush = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 1 });
        for (const cx2 of [-1, 1]) box(1.8, 0.3, 1.2, cush, cx2, 0.85, -7.0);
        box(0.08, 3.2, 0.08, metalMat, -4.8, 1.6, -7.5);
        box(0.7, 0.6, 0.7, new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffd58a, emissiveIntensity: 1.5 }), -4.8, 3.4, -7.5, false);
        solid(0, -7.3, 4.6, 1.9);
      } else {
        [-4, 0, 4].forEach((cx3, k) => {
          box(2.4, 0.7, 1.3, woodMat, cx3, 0.35, -7.3);
          solid(cx3, -7.3, 2.4, 1.3);
          const fm = new THREE.MeshStandardMaterial({ color: [0xf97316, 0x22c55e, 0xef4444][k], roughness: 0.5 });
          for (let q = 0; q < 8; q++) {
            const f = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), fm);
            f.position.set(cx3 - 0.9 + (q % 4) * 0.6, 0.85, -7.3 + (q < 4 ? -0.3 : 0.3));
            f.castShadow = true;
            g.add(f);
          }
        });
      }

      // staff + customer inside the shop
      const cashier = buildHuman({ shirt: shop.accent, pants: 0x0f172a, skin: si % 2 ? 0xb87555 : 0xe0ac8a, hair: 0x1a1410, female: si % 2 === 0 });
      cashier.group.position.set(-5.4, 0, 4.6);
      cashier.group.rotation.y = Math.PI;
      g.add(cashier.group);
      idlers.push({ h: cashier, base: Math.PI, sway: 0.12 });
      solid(-5.4, 4.6, 0.8, 0.8);
      const browser = buildHuman({ shirt: [0xef4444, 0xf8fafc, 0xfacc15, 0x14b8a6][si], pants: 0x1f2937, skin: [0xd9a07c, 0x8d5a3b, 0xe0ac8a, 0xb87555][si], hair: 0x201a14, female: si % 2 === 1, skirt: si === 1 });
      browser.group.position.set(3.6, 0, -0.8);
      g.add(browser.group);
      idlers.push({ h: browser, base: 0, sway: 0.35 });
      solid(3.6, -0.8, 0.9, 0.9);

      // wall shelves with merchandise (instanced)
      const decoGeo = new THREE.BoxGeometry(1, 1, 1);
      const decoMat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 });
      const decoCount = 2 * 3 * 12;
      const deco = new THREE.InstancedMesh(decoGeo, decoMat, decoCount);
      const m4 = new THREE.Matrix4();
      const col = new THREE.Color();
      let di = 0;
      for (const side of [-1, 1]) {
        for (let lv = 0; lv < 3; lv++) {
          const y = 1.6 + lv * 2.0;
          box(0.9, 0.12, 17, metalMat, side * 7.4, y, 0);
          for (let k = 0; k < 12; k++) {
            const hh = 0.5 + ((k * 7 + lv * 3) % 5) * 0.18;
            const ww = 0.5 + ((k * 3 + lv) % 3) * 0.2;
            m4.compose(
              new THREE.Vector3(side * 7.4, y + 0.06 + hh / 2, -7.6 + k * 1.35),
              new THREE.Quaternion(),
              new THREE.Vector3(0.6, hh, ww)
            );
            deco.setMatrixAt(di, m4);
            col.setHSL((((shop.accent >> 8) % 360) / 360 + k * 0.07 + lv * 0.11) % 1, 0.55, 0.5);
            deco.setColorAt(di, col);
            di++;
          }
        }
      }
      deco.castShadow = true;
      g.add(deco);

      // checkout counter
      box(3.6, 1.4, 1.3, darkMat, -5.4, 0.7, 6); solid(-5.4, 6, 3.6, 1.3);
      box(3.7, 0.12, 1.4, new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 0.6 }), -5.4, 1.45, 6, false);

      // display tables + product cards
      const tableMat = new THREE.MeshStandardMaterial({ color: 0xe5e9f0, roughness: 0.25, metalness: 0.2 });
      const cols = [-5.3, -1.8, 1.8, 5.3];
      shop.products.forEach((p, i) => {
        const cx = cols[i % 4];
        const cz = i < 4 ? -3.5 : 2.2;

        box(2.0, 1.6, 1.2, tableMat, cx, 0.8, cz); solid(cx, cz, 2.0, 1.2);
        box(2.05, 0.08, 1.25, new THREE.MeshStandardMaterial({ color: shop.accent, emissive: shop.accent, emissiveIntensity: 0.8 }), cx, 1.62, cz, false);

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), metalMat);
        post.position.set(cx, 1.95, cz); g.add(post);

        const card = new THREE.Group();
        card.position.set(cx, 3.1, cz);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.7, 0.1), darkMat);
        const im = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.5), new THREE.MeshBasicMaterial({ map: loadImage(p.image, 1.2), color: 0xffffff }));
        im.position.z = 0.06;
        card.add(fr, im);
        g.add(card);
        floaters.push({ obj: card, base: 3.1, i });

        const label = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.56), new THREE.MeshBasicMaterial({ map: priceTexture(p.name, p.price) }));
        label.position.set(cx, 0.85, cz + 0.61);
        g.add(label);

        const hit = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 3.8, 1.4),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        hit.position.set(cx, 1.9, cz);
        hit.userData = { product: p, shop: shop.name };
        g.add(hit);
        hitboxes.push(hit);
      });
    });

    /* ---------- player + walking shoppers ---------- */
    const player = new THREE.Group();
    player.position.set(0, 0, 18);
    scene.add(player);
    const me = buildHuman({ shirt: 0x2563eb, pants: 0x1e293b, skin: 0xc98262, hair: 0x17120f });
    player.add(me.group);

    const looks: HumanOpts[] = [
      { shirt: 0xef4444, pants: 0x1f2937, skin: 0xb87555, hair: 0x111111 },
      { shirt: 0xf8fafc, pants: 0x334155, skin: 0xe0ac8a, hair: 0x3b2314, female: true, skirt: true },
      { shirt: 0x16a34a, pants: 0x0f172a, skin: 0x8d5a3b, hair: 0x0a0a0a },
      { shirt: 0xfacc15, pants: 0x1e3a8a, skin: 0xd9a07c, hair: 0x5b3a1e, female: true },
      { shirt: 0x8b5cf6, pants: 0x111827, skin: 0xc98262, hair: 0x1a1a1a },
      { shirt: 0x0ea5e9, pants: 0x44403c, skin: 0xa66a47, hair: 0x0a0a0a, female: true, skirt: true },
      { shirt: 0xf97316, pants: 0x1f2937, skin: 0xe0ac8a, hair: 0x6b4423 },
      { shirt: 0x111827, pants: 0x475569, skin: 0xb87555, hair: 0x111111, female: true },
    ];
    const walkers = looks.map((o, i) => {
      const h = buildHuman(o);
      scene.add(h.group);
      return { h, x: [-3.2, -1.2, 1.2, 3.2][i % 4], z: 10 - i * 14, dir: i % 2 ? 1 : -1, sp: 1.8 + (i % 3) * 0.5, ph: i * 1.7, amt: 0 };
    });

    /* ---------- input: look + tap ---------- */
    let yaw = 0, pitch = 0.5, camDist = 11;
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let down: { id: number; x: number; y: number; moved: number; t: number } | null = null;

    const pick = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const h = ray.intersectObjects(hitboxes, false)[0];
      if (!h) return;
      const { product, shop } = h.object.userData as { product: Product; shop: string };
      setSelected({ ...product, shop });
      setMessage(`🛍️ ${product.name} — ${taka(product.price)} | ${shop}`);
      if (window.innerWidth < 768) setCartOpen(false);
    };

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      if (down) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, t: performance.now() };
      el.setPointerCapture(e.pointerId);
      screens.forEach((s) => s.video.paused && s.video.play().catch(() => {})); // unlock autoplay on first touch
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down.x = e.clientX; down.y = e.clientY;
      down.moved += Math.abs(dx) + Math.abs(dy);
      yaw -= dx * 0.005;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.15, 1.1);
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      if (down.moved < 8 && performance.now() - down.t < 500) pick(e.clientX, e.clientY);
      down = null;
    };
    const onWheel = (e: WheelEvent) => { camDist = THREE.MathUtils.clamp(camDist + e.deltaY * 0.01, 6, 18); };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: true });

    const setKey = (e: KeyboardEvent, v: boolean) => {
      const k = keysRef.current;
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') k.f = v;
      if (key === 's' || key === 'arrowdown') k.b = v;
      if (key === 'a' || key === 'arrowleft') k.l = v;
      if (key === 'd' || key === 'arrowright') k.r = v;
      if (v && key === 'q') yaw += 0.15;
      if (v && key === 'e') yaw -= 0.15;
    };
    const kd = (e: KeyboardEvent) => setKey(e, true);
    const ku = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    /* ---------- resize ---------- */
    const resize = () => {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.fov = w / h < 0.8 ? 72 : 60; // wider view on portrait phones
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ---------- loop ---------- */
    const R = 0.5;
    const blocked = (x: number, z: number) =>
      colliders.some((c) => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R);

    const clock = new THREE.Clock();
    const camTarget = new THREE.Vector3();
    const wp = new THREE.Vector3();
    let walk = 0, amt = 0, vidTimer = 0, raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (!pausedRef.current) {
        const k = keysRef.current, j = joyRef.current;
        let ix = (k.r ? 1 : 0) - (k.l ? 1 : 0) + j.x;
        let iz = (k.f ? 1 : 0) - (k.b ? 1 : 0) - j.y;
        const len = Math.hypot(ix, iz);
        if (len > 1) { ix /= len; iz /= len; }
        const moving = len > 0.08;

        if (moving) {
          const sin = Math.sin(yaw), cos = Math.cos(yaw);
          const mx = -sin * iz + cos * ix;
          const mz = -cos * iz - sin * ix;
          const sp = 6.5 * dt;
          const nx = THREE.MathUtils.clamp(player.position.x + mx * sp, -38, 38);
          if (!blocked(nx, player.position.z)) player.position.x = nx;
          const nz = THREE.MathUtils.clamp(player.position.z + mz * sp, -112, 22);
          if (!blocked(player.position.x, nz)) player.position.z = nz;

          const target = Math.atan2(-mx, -mz);
          let diff = target - player.rotation.y;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          player.rotation.y += diff * Math.min(1, dt * 12);

          walk += dt * 9;
          amt = Math.min(1, amt + dt * 6);
        } else {
          amt = Math.max(0, amt - dt * 6);
        }
        me.update(walk, amt, t);

        walkers.forEach((n) => {
          const near = Math.hypot(n.x - player.position.x, n.z - player.position.z) < 2.4;
          n.amt += ((near ? 0 : 1) - n.amt) * Math.min(1, dt * 6);
          if (!near) {
            n.z += n.dir * n.sp * dt;
            n.ph += dt * n.sp * 3.2;
            if (n.z < -108) n.dir = 1;
            if (n.z > 14) n.dir = -1;
          }
          n.h.group.position.set(n.x, 0, n.z);
          n.h.group.rotation.y = n.dir < 0 ? 0 : Math.PI;
          n.h.update(n.ph, n.amt, t);
        });
        idlers.forEach((i) => {
          i.h.group.rotation.y = i.base + Math.sin(t * 0.5 + i.base) * i.sway;
          i.h.update(0, 0, t);
        });
        spinners.forEach((sp) => { sp.rotation.y = t; sp.rotation.x = t * 0.5; });

        floaters.forEach((f) => { f.obj.position.y = f.base + Math.sin(t * 1.4 + f.i) * 0.05; });
      }

      // camera orbit
      const h = Math.sin(pitch) * camDist, d = Math.cos(pitch) * camDist;
      camTarget.set(player.position.x + Math.sin(yaw) * d, 2 + h, player.position.z + Math.cos(yaw) * d);
      camera.position.lerp(camTarget, 0.12);
      camera.lookAt(player.position.x, 2.4, player.position.z);

      // videos: only play the ones near the player
      vidTimer += dt;
      if (vidTimer > 0.4) {
        vidTimer = 0;
        screens.forEach((s) => {
          s.obj.getWorldPosition(wp);
          const dist = wp.distanceTo(player.position);
          if (pausedRef.current || dist > 55) { if (!s.video.paused) s.video.pause(); }
          else if (s.video.paused && !s.failed) s.video.play().catch(() => {});
        });
      }
      screens.forEach((s) => s.failed && s.draw(t));

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      screens.forEach((s) => { s.video.pause(); s.video.removeAttribute('src'); s.video.load(); });
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mm) => { (mm as THREE.MeshBasicMaterial).map?.dispose(); mm.dispose(); });
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ------------------------------ ACTIONS ------------------------------ */

  const addSelected = () => {
    if (!selected) { setMessage('👆 আগে কোনো পণ্যে ট্যাপ/ক্লিক করুন।'); return; }
    setCart((prev) => {
      const old = prev.find((i) => i.id === selected.id);
      if (old) return prev.map((i) => (i.id === selected.id ? { ...i, count: i.count + 1 } : i));
      return [...prev, { ...selected, count: 1 }];
    });
    setMessage(`✅ ${selected.name} কার্টে যোগ হয়েছে!`);
    setSelected(null);
  };

  const changeQty = (id: string, d: number) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, count: i.count + d } : i)).filter((i) => i.count > 0));

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const checkout = () => {
    if (!cart.length) { setMessage('🛒 কার্ট খালি।'); return; }
    if (balance < total) { setMessage(`❌ পর্যাপ্ত টাকা নেই। ব্যালেন্স ${taka(balance)}, দরকার ${taka(total)}`); return; }
    setBalance((b) => b - total);
    setScore((s) => s + cartCount * 100);
    setCart([]);
    setMessage(`🎉 ${taka(total)} পেমেন্ট সফল! ধন্যবাদ।`);
  };

  /* joystick */
  const joyStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    joyMove(e);
  };
  const joyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect();
    const max = r.width / 2 - 24;
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > max) { dx = (dx / l) * max; dy = (dy / l) * max; }
    joyRef.current = { x: dx / max, y: dy / max };
    setKnob({ x: dx, y: dy });
  };
  const joyEnd = () => { joyRef.current = { x: 0, y: 0 }; setKnob({ x: 0, y: 0 }); };

  /* ------------------------------ UI ------------------------------ */
  const glass = 'border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl';

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#050811] text-white select-none">
      <div ref={containerRef} className="absolute inset-0" />

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-2 top-2 z-20 flex items-start justify-between gap-2 md:inset-x-3 md:top-3">
        <div className={`pointer-events-auto rounded-2xl px-3 py-2 md:px-4 md:py-3 ${glass}`}>
          <div className="hidden text-[10px] font-bold tracking-[0.3em] text-cyan-300 sm:block">NEXT GENERATION MALL</div>
          <div className="text-sm font-black md:text-lg">GRAND SHOPPING CITY</div>
        </div>
        <div className="pointer-events-auto flex gap-1.5 md:gap-2">
          <div className={`rounded-2xl px-3 py-2 text-right md:px-4 md:py-3 ${glass}`}>
            <div className="text-[9px] text-slate-400 md:text-[10px]">BALANCE</div>
            <div className="text-sm font-black text-yellow-300 md:text-base">{taka(balance)}</div>
          </div>
          <div className={`hidden rounded-2xl px-4 py-3 text-right sm:block ${glass}`}>
            <div className="text-[10px] text-slate-400">SCORE</div>
            <div className="font-black text-emerald-300">{score}</div>
          </div>
          <button onClick={() => setCartOpen((v) => !v)} className={`relative rounded-2xl px-3 text-lg md:px-4 ${glass}`} aria-label="Cart">
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-slate-950">{cartCount}</span>
            )}
          </button>
          <button onClick={() => setPaused((v) => !v)} className={`rounded-2xl px-3 text-lg md:px-4 ${glass}`} aria-label="Pause">
            {paused ? '▶️' : '⏸️'}
          </button>
        </div>
      </header>

      {/* assistant message */}
      <aside className={`pointer-events-none absolute left-2 top-[64px] z-20 max-w-[min(340px,calc(100vw-16px))] rounded-2xl p-3 md:left-3 md:top-24 md:p-4 ${glass}`}>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Mall Assistant</div>
        <p className="text-xs leading-5 text-slate-200 md:text-sm md:leading-6">{message}</p>
      </aside>

      {/* product card */}
      {selected && (
        <div className={`absolute inset-x-2 bottom-2 z-30 overflow-hidden rounded-3xl md:inset-x-auto md:bottom-5 md:left-1/2 md:w-[380px] md:-translate-x-1/2 ${glass}`}>
          <div className="flex md:block">
            <img src={selected.image} alt={selected.name} className="h-28 w-28 shrink-0 object-cover md:h-40 md:w-full" />
            <div className="min-w-0 flex-1 p-3 md:p-4">
              <div className="truncate text-[11px] text-slate-400">{selected.shop}</div>
              <div className="truncate text-base font-black md:text-lg">{selected.name}</div>
              <div className="text-lg font-black text-yellow-300 md:text-xl">{taka(selected.price)}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={addSelected} className="flex-1 rounded-xl bg-cyan-500 px-3 py-2.5 font-black text-slate-950 active:scale-95 hover:bg-cyan-400">
                  🛒 কার্টে নিন
                </button>
                <button onClick={() => setSelected(null)} className="rounded-xl bg-white/10 px-4 py-2.5" aria-label="Close">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* cart */}
      {cartOpen && (
        <aside className={`absolute inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto rounded-t-3xl p-4 md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:w-80 md:max-h-[70dvh] md:rounded-3xl ${glass}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-black">🛒 MY CART</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300">{cartCount} items</span>
              <button onClick={() => setCartOpen(false)} className="rounded-lg bg-white/10 px-2 py-1 text-xs md:hidden">✕</button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {cart.length === 0 ? (
              <div className="rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">কার্ট এখনো খালি</div>
            ) : cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2">
                <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{taka(item.price)}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <button onClick={() => changeQty(item.id, -1)} className="h-6 w-6 rounded-md bg-white/10">−</button>
                  <b className="w-5 text-center">{item.count}</b>
                  <button onClick={() => changeQty(item.id, 1)} className="h-6 w-6 rounded-md bg-white/10">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="rounded-lg bg-rose-500/15 px-2 py-1 text-rose-300">✕</button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
            <span className="text-slate-400">Total</span>
            <b className="text-yellow-300">{taka(total)}</b>
          </div>
          <button onClick={checkout} className="mt-3 w-full rounded-xl bg-emerald-500 py-3 font-black text-slate-950 active:scale-95 hover:bg-emerald-400 disabled:opacity-40" disabled={!cart.length}>
            ✅ Checkout
          </button>
        </aside>
      )}

      {/* mobile joystick */}
      {touch && !selected && !cartOpen && (
        <div
          className="absolute bottom-6 left-5 z-30 h-32 w-32 touch-none rounded-full border border-white/15 bg-slate-950/50 backdrop-blur-md"
          onPointerDown={joyStart}
          onPointerMove={joyMove}
          onPointerUp={joyEnd}
          onPointerCancel={joyEnd}
        >
          <div
            className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/80 shadow-lg"
            style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
          />
        </div>
      )}
      {touch && !selected && !cartOpen && (
        <div className="pointer-events-none absolute bottom-8 right-5 z-20 max-w-[170px] text-right text-[11px] text-slate-300">
          স্ক্রিন ড্র্যাগ করে ঘুরে দেখুন • পণ্যে ট্যাপ করুন
        </div>
      )}

      {/* desktop help */}
      {!touch && !selected && (
        <div className={`absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-2xl px-5 py-3 text-xs text-slate-300 md:block ${glass}`}>
          <b className="text-cyan-300">W A S D</b> হাঁটা &nbsp;•&nbsp; <b className="text-cyan-300">Mouse Drag / Q E</b> ঘোরা &nbsp;•&nbsp;
          <b className="text-cyan-300">Scroll</b> জুম &nbsp;•&nbsp; <b className="text-cyan-300">Click</b> পণ্য দেখুন
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



// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';

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
//     SHOPS.forEach((shop) => {
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

//     /* ---------- player ---------- */
//     const player = new THREE.Group();
//     player.position.set(0, 0, 18);
//     scene.add(player);
//     const skin = new THREE.MeshStandardMaterial({ color: 0xc98262, roughness: 0.7 });
//     const shirtM = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
//     const pantsM = new THREE.MeshStandardMaterial({ color: 0x172033, roughness: 0.65 });
//     const shoeM = new THREE.MeshStandardMaterial({ color: 0x0b0f17, metalness: 0.3, roughness: 0.5 });

//     const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.55), shirtM);
//     torso.position.y = 2.0; torso.castShadow = true; player.add(torso);
//     const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), skin);
//     head.position.y = 3.15; head.castShadow = true; player.add(head);
//     const hair = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0x17120f, roughness: 0.9 }));
//     hair.position.y = 3.2; player.add(hair);

//     const limb = (x: number, y: number, m: THREE.Material, len: number, w: number) => {
//       const lg = new THREE.Group(); lg.position.set(x, y, 0);
//       const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(w, len, 5, 10), m);
//       mesh.position.y = -len / 2; mesh.castShadow = true; lg.add(mesh); player.add(lg);
//       return lg;
//     };
//     const lArm = limb(-0.67, 2.6, skin, 0.9, 0.12);
//     const rArm = limb(0.67, 2.6, skin, 0.9, 0.12);
//     const lLeg = limb(-0.28, 1.35, pantsM, 1.0, 0.15);
//     const rLeg = limb(0.28, 1.35, pantsM, 1.0, 0.15);
//     const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.55), shoeM);
//     shoe.position.set(0, -1.2, -0.14);
//     lLeg.add(shoe); rLeg.add(shoe.clone());

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
//     let walk = 0, vidTimer = 0, raf = 0;

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

//           walk += dt * 10;
//           const sw = Math.sin(walk) * 0.65;
//           lLeg.rotation.x = sw; rLeg.rotation.x = -sw;
//           lArm.rotation.x = -sw * 0.65; rArm.rotation.x = sw * 0.65;
//         } else {
//           [lLeg, rLeg, lArm, rArm].forEach((p) => (p.rotation.x *= 0.82));
//         }

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


