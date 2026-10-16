




'use client';

/**
 * ভুতুড়ে উঠোন — হেঁটে খেলার থ্রিডি কার্টুন হরর গেম (ভার্সন ৩)
 *
 * ইনস্টল:  npm i three  &&  npm i -D @types/three
 * ফাইল:   app/page.tsx  (Next.js App Router)
 *
 * ভার্সন ৩-এ নতুন:
 *  - নতুন চরিত্র: পেত্নী (দ্রুত, আঁকাবাঁকা), দৈত্য (বিশাল, শিংওয়ালা), জোনাকি পরী (সাহায্যকারী)
 *  - ভূতেরা সময়ের সাথে আসে (পেত্নী ৪৫ সেকেন্ডে, দৈত্য ১০০ সেকেন্ডে)
 *  - মোবাইল: ভাসমান জয়স্টিক, দৌড় বোতাম, বিরতি ও ফুলস্ক্রিন বোতাম, নিরাপদ এলাকা (notch) সমর্থন
 *  - পিসি: মাউস সেনসিটিভিটি, P = বিরতি, M = শব্দ বন্ধ
 *  - সেটিং ব্রাউজারে সংরক্ষিত থাকে
 *  - যেকোনো স্ক্রিন সাইজ ও আড়াআড়ি/খাড়া দুই অবস্থায় ঠিকঠাক চলে
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';

type Phase = 'menu' | 'playing' | 'paused' | 'won' | 'lost';
type Panel = 'main' | 'rules' | 'controls' | 'settings' | 'chars';
type Kind = 'ghost' | 'petni' | 'daitya';
type Api = {
  start: () => void;
  resume: () => void;
  restart: () => void;
  quit: () => void;
  pause: () => void;
  click: () => void;
  setFire: (on: boolean) => void;
  setSprint: (on: boolean) => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setQuality: (q: 'low' | 'high') => void;
  setSens: (s: number) => void;
  fullscreen: () => void;
};

const TOTAL_CANDLES = 5;
const DAILY_LIMIT = 4;
const ARENA_R = 88;
const PETNI_AT = 45; // সেকেন্ড
const DAITYA_AT = 100; // সেকেন্ড

const KINDS: Record<
  Kind,
  {
    label: string; hp: number; speed: number; litMul: number; dmg: number; scale: number; pts: number;
    respawn: number; kb: number; stun: number; color: number; emissive: number; aura: number; auraI: number;
    map: string; mapSize: number;
  }
> = {
  ghost: { label: 'ভূত', hp: 3, speed: 2.6, litMul: 0.35, dmg: 15, scale: 1, pts: 100, respawn: 8, kb: 1.4, stun: 0.6, color: 0xe9f5ef, emissive: 0x69d3ae, aura: 0x7dffd0, auraI: 6, map: '#ff4d4d', mapSize: 3.5 },
  petni: { label: 'পেত্নী', hp: 2, speed: 4.3, litMul: 0.6, dmg: 10, scale: 0.9, pts: 150, respawn: 10, kb: 1.6, stun: 0.4, color: 0xe9d5ff, emissive: 0xb66bff, aura: 0xc58bff, auraI: 6, map: '#c58bff', mapSize: 3.5 },
  daitya: { label: 'দৈত্য', hp: 6, speed: 1.7, litMul: 0.7, dmg: 25, scale: 1.6, pts: 300, respawn: 16, kb: 0.45, stun: 0.3, color: 0xffd9c2, emissive: 0xff7a3c, aura: 0xff9a5c, auraI: 9, map: '#ff9a3c', mapSize: 5.5 },
};

// ---------- সংখ্যা বাংলায় ----------
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
const fmtTime = (s: number) => `${bn(String(Math.floor(s / 60)).padStart(2, '0'))}:${bn(String(Math.floor(s % 60)).padStart(2, '0'))}`;

const CHARS = [
  {
    name: 'ভূত', color: '#7dffd0',
    desc: `সাধারণ ভূত। ${bn(KINDS.ghost.hp)} আঘাতে মরে। ছুঁলে ${bn(KINDS.ghost.dmg)} প্রাণ কমে। খেলার শুরু থেকেই ঘোরে।`,
  },
  {
    name: 'পেত্নী', color: '#c58bff',
    desc: `লম্বা চুলের পেত্নী। মাত্র ${bn(KINDS.petni.hp)} আঘাতে মরে, কিন্তু খুব দ্রুত আর আঁকাবাঁকা পথে ছোটে। ছুঁলে ${bn(KINDS.petni.dmg)} প্রাণ কমে। ${bn(PETNI_AT)} সেকেন্ড পর থেকে আসে।`,
  },
  {
    name: 'দৈত্য', color: '#ff9a3c',
    desc: `শিংওয়ালা বিশাল দৈত্য। ${bn(KINDS.daitya.hp)} আঘাত লাগে, ধীরে হাঁটে কিন্তু ছুঁলে ${bn(KINDS.daitya.dmg)} প্রাণ কমে। কাছে এলে মাটি কাঁপে। ${bn(DAITYA_AT)} সেকেন্ড পর জেগে ওঠে।`,
  },
  {
    name: 'জোনাকি পরী', color: '#7df3ff',
    desc: 'নীল আলোর ছোট্ট পরী, তোমার বন্ধু। ছুঁলে ২০ প্রাণ ফেরত পাবে, শক্তি পুরো ভরে যাবে আর ৭৫ পয়েন্ট জুটবে। ২৫ সেকেন্ড পর অন্য জায়গায় ফিরে আসে। মিনিম্যাপে নীল বিন্দু।'.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]),
  },
];

// ---------- দৈনিক সীমা (এই ব্রাউজারে সংরক্ষিত) ----------
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const readPlays = (): number => {
  try {
    const raw = localStorage.getItem('bhut_plays');
    if (!raw) return 0;
    const o = JSON.parse(raw);
    return o.day === todayKey() ? Number(o.count) || 0 : 0;
  } catch { return 0; }
};
const writePlays = (count: number) => {
  try { localStorage.setItem('bhut_plays', JSON.stringify({ day: todayKey(), count })); } catch { /* ignore */ }
};
const readBest = (): number => {
  try { return Number(localStorage.getItem('bhut_best')) || 0; } catch { return 0; }
};
const hoursToReset = () => {
  const n = new Date();
  const m = new Date(n);
  m.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((m.getTime() - n.getTime()) / 3600000));
};

export default function Page() {
  const mountRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const joyBaseRef = useRef<HTMLDivElement>(null);
  const joyKnobRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);

  const [phase, setPhase] = useState<Phase>('menu');
  const [panel, setPanel] = useState<Panel>('main');
  const [hp, setHp] = useState(100);
  const [candles, setCandles] = useState(0);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [time, setTime] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [fairyCount, setFairyCount] = useState(0);
  const [best, setBest] = useState(0);
  const [plays, setPlays] = useState(0);
  const [flash, setFlash] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string; color: string }[]>([]);
  const [volume, setVolumeState] = useState(70);
  const [muted, setMutedState] = useState(false);
  const [quality, setQualityState] = useState<'low' | 'high'>('high');
  const [sens, setSensState] = useState(100);
  const [isTouch, setIsTouch] = useState(false);
  const [canFs, setCanFs] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPlays(readPlays());
    setBest(readBest());
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    setIsTouch(coarse);
    setCanFs(!!document.fullscreenEnabled);
    if (coarse) setQualityState('low');
    try {
      const s = JSON.parse(localStorage.getItem('bhut_settings') || 'null');
      if (s) {
        if (typeof s.volume === 'number') setVolumeState(s.volume);
        if (typeof s.muted === 'boolean') setMutedState(s.muted);
        if (s.quality === 'low' || s.quality === 'high') setQualityState(s.quality);
        if (typeof s.sens === 'number') setSensState(s.sens);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('bhut_settings', JSON.stringify({ volume, muted, quality, sens })); } catch { /* ignore */ }
  }, [loaded, volume, muted, quality, sens]);

  useEffect(() => { setPanel('main'); }, [phase]);

  // ======================================================================
  //                           গেম ইঞ্জিন
  // ======================================================================
  useEffect(() => {
    const mount = mountRef.current!;
    const touchDevice = window.matchMedia('(pointer: coarse)').matches;

    // ---------- সিড করা র‍্যান্ডম ----------
    let seed = 1337;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    // ---------- রেন্ডারার ----------
    const renderer = new THREE.WebGLRenderer({ antialias: !touchDevice });
    let pixelCap = touchDevice ? 1.5 : 2;
    const applySize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap));
      renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
    };
    applySize();
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    const skyColor = new THREE.Color(0x070b16);
    const skyFlash = new THREE.Color(0x9fb4ff);
    const scene = new THREE.Scene();
    scene.background = skyColor.clone();
    scene.fog = new THREE.FogExp2(0x0a1020, 0.026);

    const camera = new THREE.PerspectiveCamera(72, (mount.clientWidth || 1) / (mount.clientHeight || 1), 0.1, 400);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    // ---------- আলো ----------
    const hemi = new THREE.HemisphereLight(0x3a4d7a, 0x0d140f, 0.9);
    scene.add(hemi);
    const moonLight = new THREE.DirectionalLight(0x9db8ff, 1.1);
    moonLight.position.set(-60, 80, -120);
    scene.add(moonLight);

    const torch = new THREE.SpotLight(0xfff1cf, 220, 38, Math.PI / 6.5, 0.55, 1.4);
    torch.position.set(0.25, -0.15, 0);
    torch.target.position.set(0, 0, -6);
    camera.add(torch);
    camera.add(torch.target);

    // হাতের আলোর গোলা (অস্ত্র)
    const orbCore = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), new THREE.MeshBasicMaterial({ color: 0xbdfaff }));
    const orbGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x5fe6ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const heldOrb = new THREE.Group();
    heldOrb.add(orbCore, orbGlow);
    heldOrb.position.set(0.3, -0.27, -0.55);
    camera.add(heldOrb);

    // ---------- চাঁদ, তারা ----------
    const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 32), new THREE.MeshBasicMaterial({ color: 0xeaf1ff, fog: false }));
    moon.position.set(-60, 80, -120);
    scene.add(moon);

    const starPos: number[] = [];
    for (let i = 0; i < 700; i++) {
      const th = rand() * Math.PI * 2;
      const ph = rand() * 1.2 + 0.1;
      starPos.push(300 * Math.sin(ph) * Math.cos(th), 300 * Math.cos(ph), 300 * Math.sin(ph) * Math.sin(th));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false, fog: false })));

    // ---------- মাটি ও পথ ----------
    const gc = document.createElement('canvas');
    gc.width = gc.height = 256;
    const g2 = gc.getContext('2d')!;
    g2.fillStyle = '#1b2a21';
    g2.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) {
      g2.fillStyle = `rgba(${15 + rand() * 30},${40 + rand() * 45},${25 + rand() * 20},0.65)`;
      g2.fillRect(rand() * 256, rand() * 256, 2, 2 + rand() * 4);
    }
    const groundTex = new THREE.CanvasTexture(gc);
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(80, 80);
    groundTex.colorSpace = THREE.SRGBColorSpace;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const pathMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 68), new THREE.MeshStandardMaterial({ color: 0x2c2218, roughness: 1 }));
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(0, 0.02, -7);
    scene.add(pathMesh);

    // ---------- সীমানার বেড়া ----------
    const postGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
    const posts = new THREE.InstancedMesh(postGeo, new THREE.MeshStandardMaterial({ color: 0x15121a, roughness: 0.8 }), 140);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < 140; i++) {
      const a = (i / 140) * Math.PI * 2;
      mtx.makeTranslation(Math.cos(a) * 93, 1.6, Math.sin(a) * 93);
      posts.setMatrixAt(i, mtx);
    }
    scene.add(posts);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(93, 0.08, 6, 160), new THREE.MeshStandardMaterial({ color: 0x15121a }));
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 2.4;
    scene.add(rail);

    // ---------- বাধা ----------
    const obstacles: { x: number; z: number; r: number }[] = [];
    const HOUSE = { x: 0, z: -45 };
    const onPath = (x: number, z: number) => Math.abs(x) < 4.5 && z > -40 && z < 30;
    const okSpot = (x: number, z: number) =>
      Math.hypot(x, z - 25) > 9 && Math.hypot(x - HOUSE.x, z - HOUSE.z) > 16 && !onPath(x, z);

    // গাছ
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x2a1f1a, roughness: 1 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x10261a, roughness: 1 });
    for (let i = 0; i < 80; i++) {
      const a = rand() * Math.PI * 2;
      const d = 12 + rand() * 62;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d - 10;
      if (!okSpot(x, z)) continue;
      const tree = new THREE.Group();
      const h = 4 + rand() * 3;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, h, 7), barkMat);
      trunk.position.y = h / 2;
      tree.add(trunk);
      if (rand() > 0.45) {
        for (let b = 0; b < 5; b++) {
          const len = 1.6 + rand() * 1.8;
          const br = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, len, 5), barkMat);
          br.position.set(0, h * (0.55 + rand() * 0.4), 0);
          br.rotation.z = (rand() > 0.5 ? 1 : -1) * (0.7 + rand() * 0.7);
          br.rotation.y = rand() * Math.PI * 2;
          br.translateY(len / 2);
          tree.add(br);
        }
      } else {
        for (let c = 0; c < 3; c++) {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1 - c * 0.5, 2.6, 8), pineMat);
          cone.position.y = h * 0.6 + c * 1.5;
          tree.add(cone);
        }
      }
      tree.position.set(x, 0, z);
      scene.add(tree);
      obstacles.push({ x, z, r: 0.7 });
    }

    // কবরের পাথর
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.9 });
    const moundMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 1 });
    for (let i = 0; i < 34; i++) {
      const x = (rand() - 0.5) * 70;
      const z = -5 - rand() * 40 + 15;
      if (!okSpot(x, z)) continue;
      const s = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.25), stoneMat);
      slab.position.y = 0.55;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 12), stoneMat);
      top.rotation.x = Math.PI / 2;
      top.position.y = 1.1;
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), moundMat);
      mound.scale.set(1, 0.25, 1.6);
      mound.position.z = 1.2;
      s.add(slab, top, mound);
      s.rotation.y = (rand() - 0.5) * 0.6;
      s.rotation.z = (rand() - 0.5) * 0.15;
      s.position.set(x, 0, z);
      scene.add(s);
      obstacles.push({ x, z, r: 0.7 });
    }

    // জ্যাক-ও-ল্যান্টার্ন কুমড়ো
    const pumpkinMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 0.9, roughness: 0.6 });
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x120800 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2f4a1c });
    for (let i = 0; i < 16; i++) {
      const a = rand() * Math.PI * 2;
      const d = 8 + rand() * 60;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d - 8;
      if (!okSpot(x, z)) continue;
      const p = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12), pumpkinMat);
      body.scale.set(1.1, 0.85, 1.1);
      body.position.y = 0.4;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.2, 6), stemMat);
      stem.position.y = 0.82;
      [-1, 1].forEach((s) => {
        const e = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 3), faceMat);
        e.position.set(s * 0.17, 0.5, 0.42);
        p.add(e);
      });
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.05), faceMat);
      m.position.set(0, 0.3, 0.44);
      p.add(body, stem, m);
      p.rotation.y = rand() * Math.PI * 2;
      p.position.set(x, 0, z);
      scene.add(p);
      obstacles.push({ x, z, r: 0.5 });
    }

    // পথের দুই ধারে লণ্ঠন
    const lanternBulb = new THREE.MeshBasicMaterial({ color: 0xffd27a });
    [18, 8, -2, -12, -22, -32].forEach((z) => {
      [-3.4, 3.4].forEach((x) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x15121a }));
        post.position.set(x, 1.2, z);
        const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), lanternBulb);
        bulb.position.set(x, 2.55, z);
        scene.add(post, bulb);
      });
    });

    // ভুতুড়ে বাড়ি
    const house = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3340, roughness: 1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 1 });
    const hbody = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 10), wallMat);
    hbody.position.y = 4;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 5, 4), roofMat);
    roof.position.y = 10.5;
    roof.rotation.y = Math.PI / 4;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3.5, 12, 3.5), wallMat);
    tower.position.set(5.5, 6, 0);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3, 4, 4), roofMat);
    towerRoof.position.set(5.5, 14, 0);
    towerRoof.rotation.y = Math.PI / 4;
    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x1b0f0a }));
    door.position.set(0, 1.7, 5.1);
    house.add(hbody, roof, tower, towerRoof, door);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffc766 });
    [-4.5, 4.5].forEach((wx) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), winMat);
      w.position.set(wx, 4.6, 5.06);
      house.add(w);
    });
    const winLight = new THREE.PointLight(0xffb347, 40, 22, 1.6);
    winLight.position.set(0, 4.5, 7);
    house.add(winLight);
    house.position.set(HOUSE.x, 0, HOUSE.z);
    scene.add(house);
    obstacles.push({ x: HOUSE.x, z: HOUSE.z, r: 8.5 });

    // জোনাকির ঝাঁক
    const FIRE_N = 140;
    const fireBase: number[] = [];
    const firePos = new Float32Array(FIRE_N * 3);
    for (let i = 0; i < FIRE_N; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * 70;
      fireBase.push(Math.cos(a) * d, 0.6 + rand() * 2.6, Math.sin(a) * d - 10, rand() * 6.28);
    }
    const fireGeo = new THREE.BufferGeometry();
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    scene.add(
      new THREE.Points(
        fireGeo,
        new THREE.PointsMaterial({ color: 0xd8ff7a, size: 0.2, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      )
    );

    // ---------- মোমবাতি ----------
    type Candle = { group: THREE.Group; light: THREE.PointLight; parts: THREE.Object3D[]; x: number; z: number; taken: boolean; phase: number };
    const candleList: Candle[] = [];
    const candlePositions: [number, number][] = [];
    let guard = 0;
    while (candlePositions.length < TOTAL_CANDLES && guard++ < 500) {
      const a = rand() * Math.PI * 2;
      const d = 18 + rand() * 42;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d - 10;
      const clear = obstacles.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + 2);
      if (clear && okSpot(x, z) && candlePositions.every(([cx, cz]) => Math.hypot(cx - x, cz - z) > 18)) candlePositions.push([x, z]);
    }
    candlePositions.forEach(([x, z], i) => {
      const grp = new THREE.Group();
      const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xf3ead2, emissive: 0x332a10 }));
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffb233 }));
      flame.scale.set(0.8, 1.6, 0.8);
      flame.position.y = 0.36;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 40, 10, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.1, depthWrite: false, fog: false })
      );
      beam.position.y = 20;
      grp.add(wax, flame, beam);
      const light = new THREE.PointLight(0xffa640, 10, 12, 1.5);
      light.position.y = 0.6;
      grp.add(light);
      grp.position.set(x, 1.0, z);
      scene.add(grp);
      candleList.push({ group: grp, light, parts: [wax, flame, beam], x, z, taken: false, phase: i });
    });

    // ---------- জোনাকি পরী (সাহায্যকারী) ----------
    type Fairy = {
      grp: THREE.Group; pivots: THREE.Group[]; bx: number; bz: number; ph: number; active: boolean; timer: number;
    };
    const fairyCoreGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const fairyGlowGeo = new THREE.SphereGeometry(0.42, 12, 12);
    const fairyCoreMat = new THREE.MeshBasicMaterial({ color: 0xeaffff });
    const fairyGlowMat = new THREE.MeshBasicMaterial({ color: 0x4fe3ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const fairyWingGeo = new THREE.CircleGeometry(0.26, 12);
    const fairyWingMat = new THREE.MeshBasicMaterial({
      color: 0xaef7ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const fairies: Fairy[] = [];
    const pickFairySpot = (rnd: () => number): [number, number] => {
      for (let k = 0; k < 40; k++) {
        const a = rnd() * Math.PI * 2;
        const d = 14 + rnd() * 55;
        const x = Math.cos(a) * d;
        const z = Math.sin(a) * d - 10;
        if (okSpot(x, z) && obstacles.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + 1.5)) return [x, z];
      }
      return [20, 10];
    };
    for (let i = 0; i < 3; i++) {
      const grp = new THREE.Group();
      grp.add(new THREE.Mesh(fairyCoreGeo, fairyCoreMat), new THREE.Mesh(fairyGlowGeo, fairyGlowMat));
      const pivots: THREE.Group[] = [];
      [-1, 1].forEach((s) => {
        const pv = new THREE.Group();
        const wing = new THREE.Mesh(fairyWingGeo, fairyWingMat);
        wing.scale.set(0.7, 1.3, 1);
        wing.position.set(s * 0.2, 0.05, 0);
        pv.add(wing);
        pv.userData.s = s;
        grp.add(pv);
        pivots.push(pv);
      });
      const [bx, bz] = pickFairySpot(rand);
      grp.position.set(bx, 1.4, bz);
      scene.add(grp);
      fairies.push({ grp, pivots, bx, bz, ph: i * 2.1, active: true, timer: 0 });
    }

    // ---------- কার্টুন ভূত (৩ রকম চরিত্র) ----------
    const ghostBaseMat = new THREE.MeshStandardMaterial({
      color: 0xe9f5ef, emissive: 0x69d3ae, emissiveIntensity: 0.4, roughness: 0.55, transparent: true, opacity: 0.94,
    });
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x04070b, side: THREE.BackSide });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x020305 });
    const eyeGlow = new THREE.MeshBasicMaterial({ color: 0xff3b3b });
    const eyeGlowPetni = new THREE.MeshBasicMaterial({ color: 0xd98cff });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0b0710, roughness: 1 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.7 });

    const lathePts = [
      [0.01, 0], [0.62, 0.02], [0.74, 0.28], [0.58, 0.75], [0.4, 1.1], [0.44, 1.35], [0.3, 1.55], [0.01, 1.6],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const latheGeo = new THREE.LatheGeometry(lathePts, 28);
    {
      const p = latheGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < 0.3) {
          const ang = Math.atan2(p.getZ(i), p.getX(i));
          p.setY(i, y + Math.sin(ang * 7) * 0.12 * (1 - y / 0.3));
        }
      }
      latheGeo.computeVertexNormals();
    }
    const headGeo = new THREE.SphereGeometry(0.42, 24, 20);
    const limbGeo = new THREE.CapsuleGeometry(0.11, 0.65, 6, 10);
    const hairGeo = new THREE.CapsuleGeometry(0.33, 1.05, 6, 10);
    const hornGeo = new THREE.ConeGeometry(0.11, 0.5, 8);
    const fangGeo = new THREE.ConeGeometry(0.035, 0.12, 5);

    function makeGhost(id: Kind) {
      const K = KINDS[id];
      const mat = ghostBaseMat.clone();
      mat.color.setHex(K.color);
      mat.emissive.setHex(K.emissive);
      const grp = new THREE.Group();
      const inner = new THREE.Group();
      grp.add(inner);
      grp.scale.setScalar(K.scale);

      const bodyOutline = new THREE.Mesh(latheGeo, outlineMat);
      bodyOutline.scale.set(1.06, 1.03, 1.06);
      inner.add(new THREE.Mesh(latheGeo, mat), bodyOutline);

      const head = new THREE.Mesh(headGeo, mat);
      head.scale.set(1, 1.12, 1);
      head.position.y = 1.98;
      const headOutline = new THREE.Mesh(headGeo, outlineMat);
      headOutline.scale.set(1.08, 1.2, 1.08);
      headOutline.position.y = 1.98;
      inner.add(head, headOutline);

      // পেত্নীর লম্বা চুল
      if (id === 'petni') {
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.scale.set(1.1, 1, 0.65);
        hair.position.set(0, 1.62, -0.3);
        inner.add(hair);
        const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), hairMat);
        fringe.scale.set(1, 1.12, 1);
        fringe.position.y = 1.98;
        fringe.rotation.x = -0.35;
        inner.add(fringe);
      }
      // দৈত্যের শিং ও দাঁত
      if (id === 'daitya') {
        [-1, 1].forEach((s) => {
          const horn = new THREE.Mesh(hornGeo, hornMat);
          horn.position.set(s * 0.28, 2.55, 0);
          horn.rotation.z = -s * 0.45;
          inner.add(horn);
          const fang = new THREE.Mesh(fangGeo, new THREE.MeshBasicMaterial({ color: 0xfff4dc }));
          fang.position.set(s * 0.09, 1.7, 0.4);
          fang.rotation.x = Math.PI;
          inner.add(fang);
        });
      }

      [-1, 1].forEach((s) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), blackMat);
        eye.scale.set(1, 1.5, 0.5);
        eye.position.set(s * 0.17, 2.04, 0.37);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), id === 'petni' ? eyeGlowPetni : eyeGlow);
        pupil.position.set(s * 0.17, 2.02, 0.41);
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.04), blackMat);
        brow.position.set(s * 0.17, 2.24, 0.39);
        brow.rotation.z = -s * (id === 'daitya' ? 0.7 : 0.45);
        inner.add(eye, pupil, brow);
      });

      const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), blackMat);
      mouth.scale.set(1.2, 1.4, 0.5);
      mouth.position.set(0, 1.78, 0.38);
      inner.add(mouth);

      const arms: THREE.Group[] = [];
      [-1, 1].forEach((s) => {
        const arm = new THREE.Group();
        const limb = new THREE.Mesh(limbGeo, mat);
        limb.position.y = -0.4;
        const limbOutline = new THREE.Mesh(limbGeo, outlineMat);
        limbOutline.scale.setScalar(1.25);
        limbOutline.position.y = -0.4;
        arm.add(limb, limbOutline);
        arm.position.set(s * 0.52, 1.4, 0.05);
        arm.rotation.x = -1.35;
        arm.rotation.z = s * 0.25;
        inner.add(arm);
        arms.push(arm);
      });

      const aura = new THREE.PointLight(K.aura, K.auraI, 9, 1.8);
      aura.position.y = 1.5;
      grp.add(aura);

      // প্রাণের দাগ
      const hpBar = new THREE.Group();
      const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.14), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 }));
      const fgGeo = new THREE.PlaneGeometry(1, 0.1);
      fgGeo.translate(0.5, 0, 0);
      const hpFg = new THREE.Mesh(fgGeo, new THREE.MeshBasicMaterial({ color: 0xff4d4d }));
      hpFg.position.set(-0.5, 0, 0.01);
      hpBar.add(hpBg, hpFg);
      hpBar.position.y = id === 'daitya' ? 3.1 : 2.9;
      hpBar.visible = false;
      grp.add(hpBar);

      return { id, kind: K, grp, inner, mouth, arms, mat, aura, hpBar, hpFg };
    }

    type GhostState = {
      tx: number; tz: number; phase: number; lit: boolean;
      hp: number; alive: boolean; dying: number; respawn: number; stun: number; flash: number; announced: boolean;
    };
    type Ghost = ReturnType<typeof makeGhost> & GhostState;

    const roster: { kind: Kind; pos: [number, number]; delay: number }[] = [
      { kind: 'ghost', pos: [-30, -20], delay: 0 },
      { kind: 'ghost', pos: [32, -30], delay: 0 },
      { kind: 'ghost', pos: [0, -70], delay: 0 },
      { kind: 'petni', pos: [-45, 30], delay: PETNI_AT },
      { kind: 'daitya', pos: [50, 10], delay: DAITYA_AT },
    ];

    // আলো কমবেশি না করে শুধু দেখানো/লুকানো (শেডার বারবার না বদলানোর জন্য)
    const showGhost = (gh: Ghost, on: boolean) => {
      gh.inner.visible = on;
      gh.aura.intensity = on ? gh.kind.auraI : 0;
      if (!on) gh.hpBar.visible = false;
    };
    const initGhost = (gh: Ghost, r: (typeof roster)[number]) => {
      gh.grp.position.set(r.pos[0], 0, r.pos[1]);
      gh.grp.rotation.y = 0;
      Object.assign(gh, { tx: r.pos[0], tz: r.pos[1], hp: gh.kind.hp, dying: 0, stun: 0, flash: 0, lit: false, announced: r.delay === 0 });
      gh.inner.scale.setScalar(1);
      gh.inner.rotation.y = 0;
      gh.mat.opacity = 0.94;
      if (r.delay === 0) { gh.alive = true; gh.respawn = 0; showGhost(gh, true); }
      else { gh.alive = false; gh.respawn = r.delay; showGhost(gh, false); }
    };

    const ghosts: Ghost[] = roster.map((r, i) => {
      const gh: Ghost = Object.assign(makeGhost(r.kind), {
        tx: 0, tz: 0, phase: i * 2, lit: false, hp: 0, alive: false, dying: 0, respawn: 0, stun: 0, flash: 0, announced: true,
      });
      scene.add(gh.grp);
      initGhost(gh, r);
      return gh;
    });

    // ---------- আলোর গোলা (গুলি) ----------
    const projGeo = new THREE.SphereGeometry(0.17, 12, 12);
    const projMat = new THREE.MeshBasicMaterial({ color: 0xcffaff });
    const projGlowGeo = new THREE.SphereGeometry(0.42, 12, 12);
    const projGlowMat = new THREE.MeshBasicMaterial({ color: 0x4fe3ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    type Proj = { mesh: THREE.Group; dir: THREE.Vector3; life: number };
    const projs: Proj[] = [];

    // ======================================================================
    //                           সাউন্ড ইঞ্জিন
    // ======================================================================
    let audio: AudioContext | null = null;
    let master: GainNode | null = null;
    let droneGain: GainNode | null = null;
    let noiseBuf: AudioBuffer | null = null;
    let vol = 0.7;
    let muteOn = false;
    const applyVol = () => { if (master) master.gain.value = muteOn ? 0 : vol; };

    const tone = (f0: number, f1: number, dur: number, v: number, type: OscillatorType = 'sine', delay = 0) => {
      if (!audio || !master) return;
      const t0 = audio.currentTime + delay;
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t0);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.05);
    };
    const noise = (dur: number, freq: number, v: number, type: BiquadFilterType = 'lowpass', delay = 0) => {
      if (!audio || !master || !noiseBuf) return;
      const t0 = audio.currentTime + delay;
      const s = audio.createBufferSource();
      s.buffer = noiseBuf;
      s.loop = true;
      const f = audio.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = audio.createGain();
      g.gain.setValueAtTime(v, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(master);
      s.start(t0); s.stop(t0 + dur + 0.05);
    };

    const sfx = {
      step: () => noise(0.09, 500, 0.35),
      shoot: () => { tone(1100, 320, 0.22, 0.25); tone(500, 120, 0.2, 0.1, 'sawtooth'); noise(0.12, 3000, 0.1, 'highpass'); },
      empty: () => tone(140, 100, 0.08, 0.15, 'square'),
      hit: () => { tone(260, 90, 0.18, 0.3, 'square'); noise(0.1, 1200, 0.2); },
      die: () => { tone(520, 60, 0.9, 0.25, 'sawtooth'); tone(780, 90, 0.9, 0.12, 'sine', 0.05); noise(0.6, 900, 0.15, 'bandpass'); },
      hurt: () => { tone(620, 180, 0.55, 0.2, 'sawtooth'); noise(0.3, 700, 0.2); },
      candle: () => { [660, 880, 1320].forEach((f, i) => tone(f, f, 0.5, 0.18, 'sine', i * 0.09)); },
      fairy: () => { [880, 1175, 1568].forEach((f, i) => tone(f, f * 1.02, 0.35, 0.13, 'sine', i * 0.07)); },
      shriek: () => { tone(1400, 650, 0.55, 0.12, 'sawtooth'); tone(1900, 900, 0.5, 0.07, 'square', 0.06); },
      roar: () => { tone(95, 42, 1.3, 0.3, 'sawtooth'); noise(1.0, 400, 0.35); },
      stomp: () => { tone(58, 28, 0.3, 0.5); noise(0.15, 200, 0.4); },
      thump: () => { tone(70, 35, 0.25, 0.5); },
      thunder: () => { noise(2.4, 180, 0.9); noise(1.2, 90, 0.8, 'lowpass', 0.3); },
      moan: () => { tone(150, 110, 1.4, 0.1, 'sawtooth'); tone(155, 105, 1.4, 0.06, 'sine', 0.05); },
      owl: () => { tone(420, 380, 0.35, 0.07); tone(400, 350, 0.45, 0.07, 'sine', 0.5); },
      win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.6, 0.2, 'triangle', i * 0.16)); },
      lose: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.95, 0.7, 0.2, 'sawtooth', i * 0.25)); },
      click: () => tone(700, 500, 0.07, 0.12, 'triangle'),
    };

    const startAudio = () => {
      if (audio) { audio.resume(); return; }
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audio = new Ctx();
        master = audio.createGain();
        applyVol();
        master.connect(audio.destination);

        noiseBuf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        // গুমগুম ড্রোন
        droneGain = audio.createGain();
        droneGain.gain.value = 0.05;
        droneGain.connect(master);
        [55, 58.3, 82].forEach((f) => {
          const o = audio!.createOscillator();
          o.type = 'sine';
          o.frequency.value = f;
          o.connect(droneGain!);
          o.start();
        });

        // বাতাসের শোঁ শোঁ
        const ws = audio.createBufferSource();
        ws.buffer = noiseBuf;
        ws.loop = true;
        const wf = audio.createBiquadFilter();
        wf.type = 'bandpass';
        wf.frequency.value = 420;
        wf.Q.value = 0.6;
        const wg = audio.createGain();
        wg.gain.value = 0.05;
        const lfo = audio.createOscillator();
        lfo.frequency.value = 0.12;
        const lfoG = audio.createGain();
        lfoG.gain.value = 0.03;
        lfo.connect(lfoG); lfoG.connect(wg.gain);
        ws.connect(wf); wf.connect(wg); wg.connect(master);
        ws.start(); lfo.start();
      } catch { /* শব্দ না চললেও গেম চলবে */ }
    };

    // ======================================================================
    //                           খেলার অবস্থা
    // ======================================================================
    const player = {
      x: 0, z: 25, yaw: 0, pitch: 0, hp: 100, candles: 0, bob: 0, hitCd: 0, stepAcc: 0, beat: 0,
      energy: 100, fireCd: 0, score: 0, kills: 0, time: 0, lastKill: -99, combo: 0, maxCombo: 0, fairies: 0, shownSec: -1,
    };
    let phaseNow: Phase = 'menu';
    const setPhaseBoth = (p: Phase) => { phaseNow = p; setPhase(p); };

    let sens = 1;
    let sprintHeld = false;
    const keys: Record<string, boolean> = {};
    let mouseDown = false;
    let fireHeld = false;
    const touch = { moveId: -1, lookId: -1, sx: 0, sy: 0, mx: 0, my: 0, lx: 0, ly: 0 };

    const hideJoy = () => {
      const b = joyBaseRef.current;
      if (b) b.style.display = 'none';
    };

    let toastId = 0;
    const toast = (text: string, color = '#ffc766') => {
      const id = ++toastId;
      setToasts((t) => [...t.slice(-3), { id, text, color }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1500);
    };

    const respawnGhost = (gh: Ghost) => {
      const a = Math.random() * Math.PI * 2;
      let x = player.x + Math.cos(a) * 45;
      let z = player.z + Math.sin(a) * 45;
      const r = Math.hypot(x, z);
      if (r > 84) { x *= 84 / r; z *= 84 / r; }
      gh.grp.position.set(x, 0, z);
      Object.assign(gh, { tx: x, tz: z, hp: gh.kind.hp, alive: true, dying: 0, stun: 0, flash: 0 });
      showGhost(gh, true);
      gh.inner.scale.setScalar(1);
      gh.inner.rotation.y = 0;
      gh.mat.opacity = 0.94;
      if (!gh.announced) {
        gh.announced = true;
        if (gh.id === 'petni') { toast('পেত্নী এসেছে!', '#d9a8ff'); sfx.shriek(); }
        else if (gh.id === 'daitya') { toast('দৈত্য জেগেছে!', '#ff9a3c'); sfx.roar(); }
      }
    };

    const relocateFairy = (f: Fairy) => {
      const [x, z] = pickFairySpot(Math.random);
      f.bx = x; f.bz = z; f.active = true; f.grp.visible = true;
    };

    const clearProjs = () => { projs.forEach((p) => scene.remove(p.mesh)); projs.length = 0; };
    const resetGhosts = () => { ghosts.forEach((gh, i) => initGhost(gh, roster[i])); };

    const reset = () => {
      Object.assign(player, {
        x: 0, z: 25, yaw: 0, pitch: 0, hp: 100, candles: 0, hitCd: 0, energy: 100, fireCd: 0,
        score: 0, kills: 0, time: 0, lastKill: -99, combo: 0, maxCombo: 0, fairies: 0, shownSec: -1,
      });
      setHp(100); setCandles(0); setScore(0); setKills(0); setTime(0); setBonus(0); setToasts([]);
      candleList.forEach((c) => {
        c.taken = false;
        c.parts.forEach((p) => { p.visible = true; });
      });
      resetGhosts();
      fairies.forEach((f) => { f.timer = 0; relocateFairy(f); });
      touch.moveId = -1; touch.lookId = -1; touch.mx = 0; touch.my = 0;
      hideJoy();
      clearProjs();
    };

    const lock = () => {
      if (touchDevice) return;
      try {
        const r = renderer.domElement.requestPointerLock?.() as unknown;
        if (r && typeof (r as Promise<void>).catch === 'function') (r as Promise<void>).catch(() => {});
      } catch { /* ignore */ }
    };
    const unlock = () => { if (document.pointerLockElement) document.exitPointerLock(); };

    const begin = () => {
      const used = readPlays();
      if (used >= DAILY_LIMIT) {
        setPlays(used);
        setPhaseBoth('menu');
        return;
      }
      writePlays(used + 1);
      setPlays(used + 1);
      startAudio();
      reset();
      setPhaseBoth('playing');
      lock();
    };

    apiRef.current = {
      start: begin,
      restart: begin,
      resume: () => { startAudio(); setPhaseBoth('playing'); lock(); },
      quit: () => { setPhaseBoth('menu'); unlock(); resetGhosts(); clearProjs(); },
      pause: () => { if (phaseNow === 'playing') { setPhaseBoth('paused'); unlock(); hideJoy(); fireHeld = false; sprintHeld = false; } },
      click: () => { startAudio(); sfx.click(); },
      setFire: (on) => { fireHeld = on; },
      setSprint: (on) => { sprintHeld = on; },
      setVolume: (v) => { vol = v; applyVol(); },
      setMuted: (m) => { muteOn = m; applyVol(); },
      setQuality: (q) => { pixelCap = q === 'low' ? 1 : 2; applySize(); },
      setSens: (s) => { sens = s; },
      fullscreen: () => {
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            const p = document.documentElement.requestFullscreen?.();
            const so = screen.orientation as unknown as { lock?: (o: string) => Promise<void> };
            Promise.resolve(p).then(() => so.lock?.('landscape')).catch(() => {});
          }
        } catch { /* ignore */ }
      },
    };

    const endGame = (p: 'won' | 'lost') => {
      let extra = 0;
      if (p === 'won') {
        extra = 500 + Math.round(player.hp * 3) + Math.max(0, 240 - Math.floor(player.time)) * 2;
        player.score += extra;
      }
      setBonus(extra);
      setScore(player.score);
      setBestCombo(player.maxCombo);
      setFairyCount(player.fairies);
      try {
        if (player.score > readBest()) localStorage.setItem('bhut_best', String(player.score));
      } catch { /* ignore */ }
      setBest(readBest());
      setPhaseBoth(p);
      unlock();
      hideJoy();
      fireHeld = false;
      sprintHeld = false;
      if (p === 'won') sfx.win(); else sfx.lose();
    };

    // ---------- গুলি ছোড়া ----------
    const tmpDir = new THREE.Vector3();
    const tmpStart = new THREE.Vector3();
    const tmpTarget = new THREE.Vector3();
    const fire = () => {
      if (phaseNow !== 'playing' || player.fireCd > 0) return;
      if (player.energy < 15) { player.fireCd = 0.3; sfx.empty(); return; }
      player.energy -= 15;
      player.fireCd = 0.34;
      camera.getWorldDirection(tmpDir);
      const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
      tmpStart.set(camera.position.x + tmpDir.x * 0.9 + rx * 0.24, camera.position.y + tmpDir.y * 0.9 - 0.2, camera.position.z + tmpDir.z * 0.9 + rz * 0.24);
      tmpTarget.copy(camera.position).addScaledVector(tmpDir, 30);
      const dir = tmpTarget.clone().sub(tmpStart).normalize();
      const m = new THREE.Group();
      m.add(new THREE.Mesh(projGeo, projMat), new THREE.Mesh(projGlowGeo, projGlowMat));
      m.position.copy(tmpStart);
      scene.add(m);
      projs.push({ mesh: m, dir, life: 1.3 });
      sfx.shoot();
    };

    const killGhost = (gh: Ghost) => {
      gh.dying = 0.9;
      player.kills += 1;
      player.combo = player.time - player.lastKill < 6 ? player.combo + 1 : 1;
      player.maxCombo = Math.max(player.maxCombo, player.combo);
      player.lastKill = player.time;
      const mult = Math.min(player.combo, 5);
      const pts = gh.kind.pts * mult;
      player.score += pts;
      setScore(player.score);
      setKills(player.kills);
      toast(mult > 1 ? `+${bn(pts)}  কম্বো ×${bn(mult)}` : `+${bn(pts)}`, mult > 1 ? '#ff9a3c' : gh.id === 'petni' ? '#d9a8ff' : '#7dffd0');
      sfx.die();
    };

    // ---------- ইনপুট ----------
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phaseNow === 'playing') e.preventDefault();
      keys[e.code] = true;
      if (e.repeat) return;
      if (phaseNow === 'playing') {
        if (e.code === 'KeyP' || e.code === 'Escape') apiRef.current?.pause();
        else if (e.code === 'KeyM') setMutedState((m) => !m);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== renderer.domElement || phaseNow !== 'playing') return;
      player.yaw -= e.movementX * 0.0022 * sens;
      player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - e.movementY * 0.0022 * sens));
    };
    const onMouseDown = (e: MouseEvent) => { if (e.button === 0 && document.pointerLockElement === renderer.domElement) mouseDown = true; };
    const onMouseUp = (e: MouseEvent) => { if (e.button === 0) mouseDown = false; };
    const onLockChange = () => {
      if (!touchDevice && document.pointerLockElement !== renderer.domElement && phaseNow === 'playing') apiRef.current?.pause();
      if (document.pointerLockElement !== renderer.domElement) mouseDown = false;
    };
    const onVisibility = () => { if (document.hidden) apiRef.current?.pause(); };
    const onBlur = () => { Object.keys(keys).forEach((k) => { keys[k] = false; }); mouseDown = false; };

    const onTouchStart = (e: TouchEvent) => {
      if (phaseNow !== 'playing') return;
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < window.innerWidth / 2 && touch.moveId < 0) {
          touch.moveId = t.identifier; touch.sx = t.clientX; touch.sy = t.clientY; touch.mx = 0; touch.my = 0;
          const b = joyBaseRef.current, k = joyKnobRef.current;
          if (b && k) {
            b.style.display = 'block';
            b.style.left = `${t.clientX - 55}px`;
            b.style.top = `${t.clientY - 55}px`;
            k.style.transform = 'translate(0px,0px)';
          }
        } else if (touch.lookId < 0) {
          touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (phaseNow !== 'playing') return;
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touch.moveId) {
          let mx = (t.clientX - touch.sx) / 50;
          let my = (t.clientY - touch.sy) / 50;
          const l = Math.hypot(mx, my);
          if (l > 1) { mx /= l; my /= l; }
          touch.mx = mx; touch.my = my;
          const k = joyKnobRef.current;
          if (k) k.style.transform = `translate(${mx * 42}px,${my * 42}px)`;
        } else if (t.identifier === touch.lookId) {
          player.yaw -= (t.clientX - touch.lx) * 0.005 * sens;
          player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - (t.clientY - touch.ly) * 0.005 * sens));
          touch.lx = t.clientX; touch.ly = t.clientY;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touch.moveId) { touch.moveId = -1; touch.mx = 0; touch.my = 0; hideJoy(); }
        if (t.identifier === touch.lookId) touch.lookId = -1;
      }
    };
    const onResize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.fov = camera.aspect < 1 ? 88 : 72; // খাড়া স্ক্রিনে বেশি চওড়া দৃষ্টি
      camera.updateProjectionMatrix();
      applySize();
    };
    onResize();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(mount);
    const el = renderer.domElement;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    // ---------- মিনিম্যাপ ----------
    const drawMap = () => {
      const c = minimapRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const S = c.width, R = S / 2, range = 45;
      ctx.clearRect(0, 0, S, S);
      ctx.save();
      ctx.beginPath(); ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6,10,20,0.72)'; ctx.fill(); ctx.clip();
      const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
      const k = S / 130;
      const plot = (wx: number, wz: number, color: string, size: number, clampEdge: boolean) => {
        const dx = wx - player.x, dz = wz - player.z;
        let sx = dx * cos - dz * sin;
        let sy = dx * sin + dz * cos;
        const d = Math.hypot(sx, sy);
        if (d > range) {
          if (!clampEdge) return;
          sx = (sx / d) * range; sy = (sy / d) * range;
        }
        ctx.beginPath();
        ctx.arc(R + (sx / range) * (R - 8 * k), R + (sy / range) * (R - 8 * k), size * k, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
      };
      plot(HOUSE.x, HOUSE.z, '#6b6577', 5, true);
      candleList.forEach((cd) => { if (!cd.taken) plot(cd.x, cd.z, '#ffc766', 3.5, true); });
      fairies.forEach((f) => { if (f.active) plot(f.grp.position.x, f.grp.position.z, '#7df3ff', 3, false); });
      ghosts.forEach((gh) => { if (gh.alive && gh.dying <= 0) plot(gh.grp.position.x, gh.grp.position.z, gh.kind.map, gh.kind.mapSize, false); });
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(R, R - 7 * k); ctx.lineTo(R - 5 * k, R + 5 * k); ctx.lineTo(R + 5 * k, R + 5 * k); ctx.closePath();
      ctx.fillStyle = '#bdf5dc'; ctx.fill();
      ctx.beginPath(); ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#05070c'; ctx.lineWidth = 3 * k; ctx.stroke();
    };

    // ======================================================================
    //                              মূল লুপ
    // ======================================================================
    const clock = new THREE.Clock();
    const fwd = new THREE.Vector3();
    let raf = 0;
    let frame = 0;
    let flashTimer: ReturnType<typeof setTimeout> | undefined;
    let hitTimer: ReturnType<typeof setTimeout> | undefined;
    let thunderTimer: ReturnType<typeof setTimeout> | undefined;
    let lightningT = 20 + Math.random() * 12;
    let flashT = 0;
    let moanT = 5;
    let owlT = 12 + Math.random() * 12;
    let stompT = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      frame++;

      // ---- সব সময়: মোমবাতি, জানালা, জোনাকি, পরী, বজ্রপাত ----
      candleList.forEach((c) => {
        if (c.taken) return;
        c.group.position.y = 1.0 + Math.sin(t * 2 + c.phase) * 0.08;
        c.light.intensity = 9 + Math.sin(t * 17 + c.phase * 3) * 2.5;
      });
      winLight.intensity = 38 + Math.sin(t * 9) * 5 + (Math.random() > 0.97 ? -20 : 0);

      for (let i = 0; i < FIRE_N; i++) {
        const b = i * 4;
        firePos[i * 3] = fireBase[b] + Math.sin(t * 0.5 + fireBase[b + 3]) * 1.5;
        firePos[i * 3 + 1] = fireBase[b + 1] + Math.sin(t * 0.9 + fireBase[b + 3] * 2) * 0.5;
        firePos[i * 3 + 2] = fireBase[b + 2] + Math.cos(t * 0.4 + fireBase[b + 3]) * 1.5;
      }
      fireGeo.attributes.position.needsUpdate = true;

      fairies.forEach((f) => {
        if (!f.active) {
          if (phaseNow === 'playing') {
            f.timer -= dt;
            if (f.timer <= 0) relocateFairy(f);
          }
          return;
        }
        f.grp.position.set(
          f.bx + Math.sin(t * 0.6 + f.ph) * 3,
          1.4 + Math.sin(t * 2.2 + f.ph) * 0.3,
          f.bz + Math.cos(t * 0.5 + f.ph) * 3
        );
        f.pivots.forEach((pv) => { pv.rotation.y = (pv.userData.s as number) * (0.55 + Math.sin(t * 28 + f.ph) * 0.45); });
        f.grp.scale.setScalar(1 + Math.sin(t * 4 + f.ph) * 0.1);
      });

      lightningT -= dt;
      if (lightningT <= 0) {
        flashT = 0.4;
        lightningT = 22 + Math.random() * 20;
        thunderTimer = setTimeout(() => sfx.thunder(), 600 + Math.random() * 600);
      }
      if (flashT > 0) {
        flashT -= dt;
        const f = Math.max(0, Math.sin(flashT * 40)) * Math.min(1, flashT * 4);
        moonLight.intensity = 1.1 + f * 6;
        hemi.intensity = 0.9 + f * 2.5;
        (scene.background as THREE.Color).copy(skyColor).lerp(skyFlash, f * 0.7);
      } else {
        moonLight.intensity = 1.1;
        hemi.intensity = 0.9;
        (scene.background as THREE.Color).copy(skyColor);
      }

      // ---- ভূতের সাধারণ এনিমেশন ----
      ghosts.forEach((gh) => {
        gh.inner.rotation.z = Math.sin(t * 1.6 + gh.phase) * 0.08;
        gh.mouth.scale.y = 1.3 + Math.sin(t * 6 + gh.phase) * 0.5;
        const armSpeed = gh.id === 'petni' ? 6 : 3;
        gh.arms.forEach((a, i) => { a.rotation.x = -1.35 + Math.sin(t * armSpeed + gh.phase + i) * 0.2; });
        gh.flash = Math.max(0, gh.flash - dt);
        if (gh.flash > 0) { gh.mat.emissive.setHex(0xff3b3b); gh.mat.emissiveIntensity = 1.4; }
        else { gh.mat.emissive.setHex(gh.kind.emissive); gh.mat.emissiveIntensity = 0.4; }
      });

      // হাতের গোলা
      heldOrb.visible = phaseNow === 'playing';
      heldOrb.scale.setScalar((0.55 + (player.energy / 100) * 0.7) * (1 + Math.sin(t * 6) * 0.06));

      if (phaseNow === 'playing') {
        player.time += dt;
        const sec = Math.floor(player.time);
        if (sec !== player.shownSec) { player.shownSec = sec; setTime(sec); }

        // --- হাঁটা ---
        let mx = 0, mz = 0;
        if (keys['KeyW'] || keys['ArrowUp']) mz -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) mz += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
        mx += touch.mx; mz += touch.my;
        const len = Math.hypot(mx, mz);
        if (len > 1) { mx /= len; mz /= len; }
        const sprint = !!(keys['ShiftLeft'] || keys['ShiftRight'] || sprintHeld || (len > 0.98 && touch.moveId >= 0));
        const speed = sprint ? 7.5 : 4.4;
        const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
        player.x += (mx * cos + mz * sin) * speed * dt;
        player.z += (-mx * sin + mz * cos) * speed * dt;

        for (const o of obstacles) {
          const dx = player.x - o.x, dz = player.z - o.z;
          const d = Math.hypot(dx, dz);
          const min = o.r + 0.4;
          if (d < min && d > 0.0001) { player.x = o.x + (dx / d) * min; player.z = o.z + (dz / d) * min; }
        }
        const pr = Math.hypot(player.x, player.z);
        if (pr > ARENA_R) { player.x *= ARENA_R / pr; player.z *= ARENA_R / pr; }

        const moving = len > 0.05;
        if (moving) {
          player.bob += dt * (sprint ? 13 : 9);
          player.stepAcc += dt * (sprint ? 13 : 9);
          if (player.stepAcc > Math.PI) { player.stepAcc -= Math.PI; sfx.step(); }
        }
        camera.position.set(player.x, 1.7 + (moving ? Math.sin(player.bob) * 0.06 : 0), player.z);
        camera.rotation.set(player.pitch, player.yaw, Math.sin(player.bob * 0.5) * (moving ? 0.008 : 0));
        torch.intensity = 220 * (Math.random() > 0.985 ? 0.35 : 1);

        // --- শক্তি ও গুলি ---
        player.fireCd = Math.max(0, player.fireCd - dt);
        player.energy = Math.min(100, player.energy + 12 * dt);
        if (mouseDown || keys['Space'] || keys['KeyF'] || fireHeld) fire();
        if (energyRef.current) energyRef.current.style.width = `${player.energy}%`;

        // --- মোমবাতি তোলা ---
        candleList.forEach((c) => {
          if (!c.taken && Math.hypot(c.x - player.x, c.z - player.z) < 1.8) {
            c.taken = true;
            c.parts.forEach((p) => { p.visible = false; });
            c.light.intensity = 0;
            player.candles += 1;
            player.score += 150;
            player.hp = Math.min(100, player.hp + 10);
            setHp(player.hp); setCandles(player.candles); setScore(player.score);
            toast(`+${bn(150)} মোমবাতি`, '#ffc766');
            sfx.candle();
            if (player.candles >= TOTAL_CANDLES) endGame('won');
          }
        });

        // --- পরী ছোঁয়া ---
        fairies.forEach((f) => {
          if (!f.active || phaseNow !== 'playing') return;
          const fp = f.grp.position;
          if (Math.hypot(fp.x - player.x, fp.z - player.z) < 2.0) {
            f.active = false;
            f.grp.visible = false;
            f.timer = 25;
            player.fairies += 1;
            player.hp = Math.min(100, player.hp + 20);
            player.energy = 100;
            player.score += 75;
            setHp(player.hp); setScore(player.score);
            toast(`+${bn(75)}  পরীর আশীর্বাদ`, '#7df3ff');
            sfx.fairy();
          }
        });

        // --- গুলির চলাচল ও আঘাত ---
        for (let i = projs.length - 1; i >= 0; i--) {
          const pj = projs[i];
          pj.life -= dt;
          pj.mesh.position.addScaledVector(pj.dir, 42 * dt);
          let used = pj.life <= 0;
          if (!used) {
            for (const gh of ghosts) {
              if (!gh.alive || gh.dying > 0) continue;
              const gp = gh.grp.position;
              const sc = gh.kind.scale;
              const d = Math.hypot(pj.mesh.position.x - gp.x, pj.mesh.position.y - (gp.y + 1.3 * sc), pj.mesh.position.z - gp.z);
              if (d < 1.15 * sc) {
                gh.hp -= 1;
                gh.stun = gh.kind.stun;
                gh.flash = 0.2;
                const kx = gp.x - player.x, kz = gp.z - player.z, kd = Math.hypot(kx, kz) || 1;
                gp.x += (kx / kd) * gh.kind.kb; gp.z += (kz / kd) * gh.kind.kb;
                if (crossRef.current) {
                  crossRef.current.style.transform = 'translate(-50%,-50%) scale(1.8)';
                  clearTimeout(hitTimer);
                  hitTimer = setTimeout(() => { if (crossRef.current) crossRef.current.style.transform = 'translate(-50%,-50%) scale(1)'; }, 120);
                }
                if (gh.hp <= 0) killGhost(gh); else sfx.hit();
                used = true;
                break;
              }
            }
          }
          if (used) { scene.remove(pj.mesh); projs.splice(i, 1); }
        }

        // --- ভূতের চালচলন ---
        camera.getWorldDirection(fwd);
        let nearest = 999;
        let aimed = false;
        let shake = 0;
        player.hitCd = Math.max(0, player.hitCd - dt);
        const speedMul = 1 + Math.min(player.kills * 0.04, 0.5);

        ghosts.forEach((gh) => {
          const K = gh.kind;
          const gp = gh.grp.position;

          // মরার এনিমেশন / আবার জন্ম
          if (gh.dying > 0) {
            gh.dying -= dt;
            const p = 1 - Math.max(0, gh.dying) / 0.9;
            gh.inner.scale.setScalar(Math.max(0.05, 1 - p * 0.75));
            gh.mat.opacity = 0.94 * (1 - p);
            gp.y += dt * 1.6;
            gh.inner.rotation.y += dt * 9;
            gh.hpBar.visible = false;
            if (gh.dying <= 0) { gh.alive = false; showGhost(gh, false); gh.respawn = K.respawn; gh.inner.rotation.y = 0; }
            return;
          }
          if (!gh.alive) {
            gh.respawn -= dt;
            if (gh.respawn <= 0) respawnGhost(gh);
            return;
          }

          const dx = player.x - gp.x, dz = player.z - gp.z;
          const dist = Math.hypot(dx, dz);
          nearest = Math.min(nearest, dist);

          const nx = dx / (dist || 1), nz = dz / (dist || 1);
          const facing = -(fwd.x * nx + fwd.z * nz);
          gh.lit = facing > 0.93 && dist < 18;
          if (gh.lit) aimed = true;

          gh.stun = Math.max(0, gh.stun - dt);
          let sp = 0.9;
          const chasing = dist < 28;
          if (chasing) {
            sp = K.speed * (gh.lit ? K.litMul : 1) * speedMul;
            gh.tx = player.x; gh.tz = player.z;
          } else if (Math.hypot(gh.tx - gp.x, gh.tz - gp.z) < 2) {
            gh.tx = gp.x + (Math.random() - 0.5) * 40;
            gh.tz = gp.z + (Math.random() - 0.5) * 40;
          }
          if (gh.stun > 0) sp = 0;
          let tx = gh.tx - gp.x, tz = gh.tz - gp.z;
          // পেত্নী আঁকাবাঁকা পথে ছোটে
          if (gh.id === 'petni' && chasing) {
            const a = Math.sin(t * 4 + gh.phase) * 0.7;
            const c = Math.cos(a), s = Math.sin(a);
            const rx = tx * c - tz * s, rz = tx * s + tz * c;
            tx = rx; tz = rz;
          }
          const td = Math.hypot(tx, tz) || 1;
          if (dist > 1.1 * K.scale) { gp.x += (tx / td) * sp * dt; gp.z += (tz / td) * sp * dt; }
          const gr = Math.hypot(gp.x, gp.z);
          if (gr > 90) { gp.x *= 90 / gr; gp.z *= 90 / gr; }
          gp.y = 0.35 + Math.sin(t * 2 + gh.phase) * 0.22;

          const targetYaw = Math.atan2(tx, tz);
          let dy = targetYaw - gh.grp.rotation.y;
          dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          gh.grp.rotation.y += dy * Math.min(1, dt * 4);

          gh.hpBar.visible = gh.hp < K.hp;
          gh.hpBar.lookAt(camera.position);
          gh.hpFg.scale.x = Math.max(0.01, gh.hp / K.hp);

          // দৈত্য কাছে এলে মাটি কাঁপে
          if (gh.id === 'daitya' && dist < 14) shake = Math.max(shake, (1 - dist / 14) * 0.06);

          if (dist < 1.5 * K.scale && player.hitCd <= 0) {
            player.hitCd = 1.3;
            player.hp = Math.max(0, player.hp - K.dmg);
            setHp(player.hp);
            setFlash(true);
            clearTimeout(flashTimer);
            flashTimer = setTimeout(() => setFlash(false), 220);
            sfx.hurt();
            const k = 3.5 / (dist || 1);
            player.x += (player.x - gp.x) * k * 0.5;
            player.z += (player.z - gp.z) * k * 0.5;
            if (player.hp <= 0) endGame('lost');
          }
        });

        if (shake > 0.005) {
          camera.position.x += (Math.random() - 0.5) * shake;
          camera.position.y += (Math.random() - 0.5) * shake;
          stompT -= dt;
          if (stompT <= 0) { sfx.stomp(); stompT = 0.9; }
        }

        if (crossRef.current) {
          crossRef.current.style.borderColor = aimed ? '#ff4d4d' : 'rgba(255,255,255,0.75)';
          crossRef.current.style.background = aimed ? 'rgba(255,77,77,0.35)' : 'transparent';
        }

        // ভয়, হার্টবিট, ফিসফিস, পেঁচা
        const fear = Math.max(0, Math.min(1, (16 - nearest) / 16));
        if (vignetteRef.current) vignetteRef.current.style.opacity = String(0.25 + fear * 0.75);
        if (fear > 0.15) {
          player.beat -= dt;
          if (player.beat <= 0) { sfx.thump(); player.beat = 1.0 - fear * 0.6; }
        }
        if (nearest < 26) {
          moanT -= dt;
          if (moanT <= 0) { sfx.moan(); moanT = 4 + Math.random() * 4; }
        }
        owlT -= dt;
        if (owlT <= 0) { sfx.owl(); owlT = 14 + Math.random() * 18; }
        if (droneGain) droneGain.gain.value = 0.04 + fear * 0.12;

        if (frame % 3 === 0) drawMap();
      } else if (phaseNow === 'menu') {
        camera.position.set(Math.sin(t * 0.1) * 14, 3.4, 30 + Math.cos(t * 0.1) * 6);
        camera.lookAt(HOUSE.x, 5, HOUSE.z);
        ghosts.forEach((gh) => { if (gh.alive) gh.grp.position.y = 0.35 + Math.sin(t * 2 + gh.phase) * 0.22; });
        if (vignetteRef.current) vignetteRef.current.style.opacity = '0.4';
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(flashTimer);
      clearTimeout(hitTimer);
      clearTimeout(thunderTimer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      ro?.disconnect();
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      if (document.pointerLockElement) document.exitPointerLock();
      audio?.close();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // সেটিং বদলালে ইঞ্জিনকে জানাও
  useEffect(() => { apiRef.current?.setVolume(volume / 100); }, [volume]);
  useEffect(() => { apiRef.current?.setMuted(muted); }, [muted]);
  useEffect(() => { apiRef.current?.setQuality(quality); }, [quality]);
  useEffect(() => { apiRef.current?.setSens(sens / 100); }, [sens]);

  const api = () => apiRef.current!;
  const act = (fn: () => void) => () => { api().click(); fn(); };
  const left = Math.max(0, DAILY_LIMIT - plays);
  const limitReached = left === 0;

  const PlayPips = () => (
    <div style={styles.pipRow} aria-label={`আজ ${left}বার খেলা বাকি`}>
      {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
        <span key={i} style={{ ...styles.pip, ...(i < plays ? styles.pipUsed : {}) }} />
      ))}
      <span style={styles.pipText}>আজ বাকি {bn(left)}/{bn(DAILY_LIMIT)}</span>
    </div>
  );

  const BackBtn = () => <button className="gbtn small" onClick={act(() => setPanel('main'))}>পিছনে যাও</button>;

  const holdProps = (on: () => void, off: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); on(); },
    onPointerUp: off,
    onPointerLeave: off,
    onPointerCancel: off,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <main style={styles.root} onContextMenu={(e) => e.preventDefault()}>
      <style>{css}</style>
      <div ref={mountRef} style={styles.canvas} />
      <div ref={vignetteRef} style={styles.vignette} />
      {flash && <div style={styles.flash} />}

      {/* ভাসমান জয়স্টিক */}
      <div ref={joyBaseRef} className="joy-base"><div ref={joyKnobRef} className="joy-knob" /></div>

      {/* ---------- খেলার সময় HUD ---------- */}
      {phase === 'playing' && (
        <>
          <div ref={crossRef} style={styles.cross} />

          <div className="hud-left">
            <div className="hud-row">
              <span className="hud-label">প্রাণ</span>
              <div className="bar">
                <div className="bar-in" style={{ width: `${hp}%`, background: hp > 40 ? '#7dd3a8' : '#e5484d' }} />
              </div>
            </div>
            <div className="hud-row">
              <span className="hud-label">শক্তি</span>
              <div className="bar">
                <div ref={energyRef} className="bar-in" style={{ width: '100%', background: '#5fe6ff', transition: 'none' }} />
              </div>
            </div>
            <div className="hud-row">
              <span className="hud-label">মোমবাতি</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: TOTAL_CANDLES }).map((_, i) => (
                  <span key={i} className={`candle-icon ${i < candles ? 'on' : ''}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="hud-right">
            <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
              <div className="score-num">{bn(score)}</div>
              <div className="score-sub">পয়েন্ট • ভূত {bn(kills)} • {fmtTime(time)}</div>
            </div>
            <canvas ref={minimapRef} width={180} height={180} className="minimap" />
          </div>

          <div className="top-btns">
            {isTouch && <button className="gbtn tiny" onClick={() => api().pause()} aria-label="বিরতি">বিরতি</button>}
            {isTouch && canFs && <button className="gbtn tiny alt" onClick={() => api().fullscreen()} aria-label="ফুলস্ক্রিন">⛶</button>}
          </div>

          <div className="toast-wrap">
            {toasts.map((t) => (
              <div key={t.id} className="toast" style={{ color: t.color }}>{t.text}</div>
            ))}
          </div>

          {isTouch ? (
            <>
              <button className="fire-btn" {...holdProps(() => api().setFire(true), () => api().setFire(false))} aria-label="আলোর গোলা ছোড়ো">
                ছোড়ো
              </button>
              <button className="run-btn" {...holdProps(() => api().setSprint(true), () => api().setSprint(false))} aria-label="দৌড়">
                দৌড়
              </button>
            </>
          ) : (
            <p className="hint">ক্লিক = আলোর গোলা • Shift = দৌড় • P বা Esc = মেনু • M = শব্দ বন্ধ</p>
          )}
        </>
      )}

      {/* ---------- মেনু ---------- */}
      {phase !== 'playing' && (
        <div style={styles.overlay}>
          <div className="panel">
            {/* প্রধান মেনু */}
            {panel === 'main' && phase === 'menu' && (
              <>
                <h1 style={styles.title}>ভুতুড়ে উঠোন</h1>
                <p style={styles.lead}>অমাবস্যার রাত। পাঁচটা মোমবাতি জোগাড় করো, আলোর গোলায় ভূত, পেত্নী আর দৈত্য তাড়াও। পরীরা তোমাকে সাহায্য করবে।</p>
                {isTouch && <p className="rotate-hint">ফোন আড়াআড়ি ধরলে খেলতে সুবিধা বেশি</p>}
                <PlayPips />
                {limitReached && (
                  <p style={styles.warn}>আজকের ৪ বার খেলা শেষ। আরও {bn(hoursToReset())} ঘণ্টা পর আবার খেলতে পারবে।</p>
                )}
                <div className="btn-col">
                  <button className="gbtn" disabled={limitReached} onClick={act(() => api().start())}>খেলা শুরু</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('chars'))}>চরিত্র পরিচয়</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('rules'))}>খেলার নিয়ম</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('controls'))}>কন্ট্রোল</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('settings'))}>সাউন্ড ও সেটিং</button>
                </div>
                <p style={styles.bestLine}>সর্বোচ্চ স্কোর: {bn(best)}</p>
              </>
            )}

            {panel === 'main' && phase === 'paused' && (
              <>
                <h2 style={styles.title2}>থেমে আছে</h2>
                <p style={styles.lead}>পয়েন্ট {bn(score)} • ভূত মারা {bn(kills)} • মোমবাতি {bn(candles)}/{bn(TOTAL_CANDLES)}</p>
                <div className="btn-col">
                  <button className="gbtn" onClick={act(() => api().resume())}>আবার চালাও</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('chars'))}>চরিত্র পরিচয়</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('rules'))}>খেলার নিয়ম</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('controls'))}>কন্ট্রোল</button>
                  <button className="gbtn alt" onClick={act(() => setPanel('settings'))}>সাউন্ড ও সেটিং</button>
                  <button className="gbtn danger" onClick={act(() => api().quit())}>মেনুতে ফিরে যাও</button>
                </div>
              </>
            )}

            {/* শেষ স্ক্রিন */}
            {panel === 'main' && (phase === 'won' || phase === 'lost') && (
              <>
                <h2 style={{ ...styles.title2, color: phase === 'won' ? '#ffc766' : '#ff6b6f' }}>
                  {phase === 'won' ? 'ভূতেরা পালিয়েছে' : 'ভূতে ধরেছে'}
                </h2>
                <p style={styles.lead}>
                  {phase === 'won' ? 'পাঁচটা মোমবাতিই জোগাড় করেছ। ভোর হয়ে আসছে।' : 'এবার হলো না। টর্চ ধরে ভূতকে ধীর করে গোলা ছুড়ে দেখো, আর বিপদে পরীর কাছে যাও।'}
                </p>
                <div className="stat-grid">
                  <div style={styles.stat}><b>{bn(score)}</b><span>মোট পয়েন্ট</span></div>
                  <div style={styles.stat}><b>{bn(kills)}</b><span>ভূত মারা</span></div>
                  <div style={styles.stat}><b>{bn(candles)}/{bn(TOTAL_CANDLES)}</b><span>মোমবাতি</span></div>
                  <div style={styles.stat}><b>{fmtTime(time)}</b><span>সময়</span></div>
                  <div style={styles.stat}><b>×{bn(bestCombo)}</b><span>সেরা কম্বো</span></div>
                  <div style={styles.stat}><b>{bn(fairyCount)}</b><span>পরীর সাহায্য</span></div>
                </div>
                {phase === 'won' && <p style={styles.bonusLine}>জেতার বোনাস: +{bn(bonus)}</p>}
                {score >= best && score > 0 && <p style={styles.bonusLine}>নতুন সর্বোচ্চ স্কোর</p>}
                <PlayPips />
                {limitReached && <p style={styles.warn}>আজকের খেলা শেষ। {bn(hoursToReset())} ঘণ্টা পর আবার এসো।</p>}
                <div className="btn-col">
                  {!limitReached && <button className="gbtn" onClick={act(() => api().restart())}>আবার খেলো</button>}
                  <button className="gbtn alt" onClick={act(() => api().quit())}>মেনুতে যাও</button>
                </div>
              </>
            )}

            {/* চরিত্র */}
            {panel === 'chars' && (
              <>
                <h2 style={styles.title2}>চরিত্র পরিচয়</h2>
                <div className="scroll">
                  {CHARS.map((c) => (
                    <div key={c.name} style={styles.charCard}>
                      <span style={{ ...styles.charDot, background: c.color, boxShadow: `0 0 14px ${c.color}` }} />
                      <div>
                        <div style={{ ...styles.charName, color: c.color }}>{c.name}</div>
                        <div style={styles.charDesc}>{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <BackBtn />
              </>
            )}

            {/* নিয়ম */}
            {panel === 'rules' && (
              <>
                <h2 style={styles.title2}>খেলার নিয়ম</h2>
                <div className="scroll">
                  <h3 style={styles.h3}>লক্ষ্য</h3>
                  <p style={styles.p}>উঠোনে ছড়িয়ে থাকা ৫টা মোমবাতি জোগাড় করলেই তুমি জিতবে। প্রতিটা মোমবাতির ওপর আকাশ পর্যন্ত আলোর রেখা আছে, আর মিনিম্যাপে হলুদ বিন্দু দিয়ে দিক দেখা যায়।</p>

                  <h3 style={styles.h3}>ভূত মারবে কীভাবে</h3>
                  <ul style={styles.ul}>
                    <li>মাউসে ক্লিক, Space বা F চাপলে (মোবাইলে "ছোড়ো" বোতাম) আলোর গোলা ছোড়া যায়।</li>
                    <li>ভূত, পেত্নী আর দৈত্যের সহ্যক্ষমতা আলাদা: ভূতের ৩, পেত্নীর ২, দৈত্যের ৬ আঘাত। আঘাতে ওরা পিছিয়ে যায় আর কিছুক্ষণ থমকে থাকে।</li>
                    <li>প্রতিটা গোলায় ১৫ শক্তি খরচ হয়। শক্তি নিজে নিজে ভরে, কিন্তু ফুরিয়ে গেলে গোলা ছোড়া যায় না।</li>
                    <li>টর্চ ওদের দিকে ধরলে ওরা ধীর হয়ে যায়, তখন নিশানা করা সহজ।</li>
                  </ul>

                  <h3 style={styles.h3}>পয়েন্ট</h3>
                  <ul style={styles.ul}>
                    <li>ভূত মারলে ১০০, পেত্নী ১৫০, দৈত্য ৩০০ পয়েন্ট।</li>
                    <li>৬ সেকেন্ডের মধ্যে পরপর মারলে কম্বো হয়: ২য়বার ×২, এভাবে সর্বোচ্চ ×৫।</li>
                    <li>একটা মোমবাতি নিলে ১৫০ পয়েন্ট আর ১০ প্রাণ ফেরত।</li>
                    <li>পরীকে ছুঁলে ৭৫ পয়েন্ট, ২০ প্রাণ ফেরত আর শক্তি পুরো ভরে।</li>
                    <li>জিতলে ৫০০ বোনাস, সঙ্গে বাকি প্রাণ ×৩ এবং তাড়াতাড়ি শেষ করার সময়-বোনাস।</li>
                  </ul>

                  <h3 style={styles.h3}>বিপদ</h3>
                  <ul style={styles.ul}>
                    <li>ছুঁলে ভূত ১৫, পেত্নী ১০, দৈত্য ২৫ প্রাণ কমায়। প্রাণ ০ হলে খেলা শেষ।</li>
                    <li>৪৫ সেকেন্ড পর পেত্নী আসে, ১০০ সেকেন্ড পর জাগে দৈত্য।</li>
                    <li>মারা ওরা কিছুক্ষণ পর আবার জন্ম নেয়, আর যত বেশি মারবে ওরা তত দ্রুত হবে।</li>
                    <li>ওরা কাছে এলে পর্দার কিনারা কালো হয়ে আসে আর হার্টবিট শোনা যায়।</li>
                  </ul>

                  <h3 style={styles.h3}>দিনে ৪ বার</h3>
                  <ul style={styles.ul}>
                    <li>প্রতিদিন সর্বোচ্চ ৪ বার খেলা যায়। "খেলা শুরু" বা "আবার খেলো" চাপলেই একবার গোনা হয়, মাঝপথে ছেড়ে দিলেও।</li>
                    <li>রাত ১২টার পর সীমা নতুন করে ৪ থেকে শুরু হয়।</li>
                  </ul>
                </div>
                <BackBtn />
              </>
            )}

            {/* কন্ট্রোল */}
            {panel === 'controls' && (
              <>
                <h2 style={styles.title2}>কন্ট্রোল</h2>
                <div className="scroll">
                  <table style={styles.table}>
                    <tbody>
                      {[
                        ['W A S D / তীরচিহ্ন', 'হাঁটা'],
                        ['Shift', 'দৌড়'],
                        ['মাউস নাড়ানো', 'চারদিকে দেখা'],
                        ['বাঁ ক্লিক / Space / F', 'আলোর গোলা ছোড়া'],
                        ['P / Esc', 'বিরতি ও মেনু'],
                        ['M', 'শব্দ চালু/বন্ধ'],
                        ['মোবাইলে বাঁ পাশে আঙুল রাখো', 'জয়স্টিক দিয়ে হাঁটা (পুরো টানলে দৌড়)'],
                        ['মোবাইলে ডান পাশে আঙুল টানো', 'চারদিকে দেখা'],
                        ['"ছোড়ো" / "দৌড়" বোতাম', 'গোলা ছোড়া / ধরে রেখে দৌড়'],
                      ].map(([k, v]) => (
                        <tr key={k}><td style={styles.tdKey}>{k}</td><td style={styles.tdVal}>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={styles.p}>ক্রসহেয়ার লাল হলে কেউ তোমার নিশানায় আছে। গোলা লাগলে ক্রসহেয়ার একবার বড় হয়ে ওঠে।</p>
                </div>
                <BackBtn />
              </>
            )}

            {/* সেটিং */}
            {panel === 'settings' && (
              <>
                <h2 style={styles.title2}>সাউন্ড ও সেটিং</h2>
                <div className="scroll">
                  <label style={styles.setRow}>
                    <span>ভলিউম: {bn(volume)}%</span>
                    <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolumeState(+e.target.value)} style={{ width: '100%' }} />
                  </label>
                  <label style={styles.setCheck}>
                    <input type="checkbox" checked={muted} onChange={(e) => { setMutedState(e.target.checked); api().click(); }} />
                    <span>সব শব্দ বন্ধ</span>
                  </label>
                  <label style={styles.setRow}>
                    <span>{isTouch ? 'আঙুলে ঘোরানোর গতি' : 'মাউস সেনসিটিভিটি'}: {bn(sens)}%</span>
                    <input type="range" min={40} max={220} step={10} value={sens} onChange={(e) => setSensState(+e.target.value)} style={{ width: '100%' }} />
                  </label>
                  <div style={styles.setRow}>
                    <span>গ্রাফিক্স</span>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button className={`gbtn small ${quality === 'high' ? '' : 'alt'}`} onClick={act(() => setQualityState('high'))}>সুন্দর</button>
                      <button className={`gbtn small ${quality === 'low' ? '' : 'alt'}`} onClick={act(() => setQualityState('low'))}>হালকা (ধীর ফোনে)</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="gbtn small alt" onClick={() => { api().click(); setTimeout(() => api().click(), 150); }}>শব্দ পরীক্ষা করো</button>
                    {canFs && <button className="gbtn small alt" onClick={act(() => api().fullscreen())}>ফুলস্ক্রিন</button>}
                  </div>
                </div>
                <BackBtn />
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ======================================================================
//                              স্টাইল
// ======================================================================
const css = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
html, body { margin: 0; background: #070b16; overscroll-behavior: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }

.gbtn {
  font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
  font-size: 20px; font-weight: 700; color: #1a1205;
  background: #ffc766; border: 3px solid #05070c; border-radius: 14px;
  padding: 11px 30px; cursor: pointer; box-shadow: 0 5px 0 #05070c;
  transition: transform .08s, box-shadow .08s, background .12s;
  min-height: 44px;
}
.gbtn:hover:not(:disabled) { background: #ffd48a; }
.gbtn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 #05070c; }
.gbtn:focus-visible { outline: 3px solid #9db8ff; outline-offset: 3px; }
.gbtn:disabled { opacity: .45; cursor: not-allowed; }
.gbtn.alt { background: #2a3556; color: #e6ecff; }
.gbtn.alt:hover:not(:disabled) { background: #36446e; }
.gbtn.danger { background: #7a2430; color: #ffe4e6; }
.gbtn.small { font-size: 16px; padding: 7px 18px; }
.gbtn.tiny { font-size: 14px; padding: 4px 14px; min-height: 36px; border-radius: 10px; box-shadow: 0 3px 0 #05070c; }

/* ---------- মেনু প্যানেল ---------- */
.panel {
  max-width: 560px; width: 100%; max-height: 94vh; max-height: 94dvh; overflow: auto; text-align: center;
  background: rgba(10,14,28,0.88); border: 3px solid #05070c; border-radius: 22px;
  padding: clamp(16px, 4vw, 26px) clamp(14px, 4vw, 26px) clamp(18px, 4vw, 30px);
  box-shadow: 0 10px 0 #05070c, 0 0 60px rgba(105,211,174,0.15);
  box-sizing: border-box; -webkit-overflow-scrolling: touch;
}
.btn-col { display: flex; flex-direction: column; gap: 12px; align-items: center; margin: 10px 0 6px; }
.btn-col .gbtn { width: min(100%, 320px); }
.scroll { text-align: left; max-height: 56vh; max-height: 56dvh; overflow: auto; margin: 0 0 16px; padding-right: 6px; -webkit-overflow-scrolling: touch; }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 6px 0 12px; }
.rotate-hint { display: none; margin: 0 0 10px; font-size: 14px; color: #ffc766; }

/* ---------- HUD ---------- */
.hud-left { position: absolute; top: calc(12px + env(safe-area-inset-top)); left: calc(12px + env(safe-area-inset-left)); display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.hud-row { display: flex; align-items: center; gap: 8px; }
.hud-label { font-size: 14px; font-weight: 600; min-width: 58px; text-shadow: 0 2px 0 #05070c, 0 0 8px rgba(0,0,0,.9); }
.bar { width: clamp(90px, 22vw, 150px); height: 12px; border-radius: 8px; background: rgba(0,0,0,0.55); border: 2px solid #05070c; overflow: hidden; }
.bar-in { height: 100%; transition: width .25s; }
.candle-icon { width: 11px; height: 22px; border-radius: 4px; background: rgba(255,255,255,0.15); border: 2px solid #05070c; display: inline-block; }
.candle-icon.on { background: #ffc766; box-shadow: 0 0 10px #ffb233; }
.hud-right { position: absolute; top: calc(12px + env(safe-area-inset-top)); right: calc(12px + env(safe-area-inset-right)); display: flex; flex-direction: column; align-items: flex-end; gap: 8px; pointer-events: none; }
.score-num { font-size: clamp(24px, 5vw, 38px); font-weight: 700; line-height: 1; color: #ffe3a3; text-shadow: 0 2px 0 #05070c, 0 0 8px rgba(0,0,0,.9); }
.score-sub { font-size: clamp(10px, 2.4vw, 13px); opacity: .85; margin-top: 4px; text-shadow: 0 2px 0 #05070c, 0 0 8px rgba(0,0,0,.9); }
.minimap { width: clamp(84px, 17vw, 130px); height: clamp(84px, 17vw, 130px); }
.top-btns { position: absolute; top: calc(10px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.toast-wrap { position: absolute; top: 24%; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; pointer-events: none; }
.toast { font-size: clamp(20px, 5vw, 30px); font-weight: 700; text-shadow: 0 2px 0 #05070c, 0 0 8px rgba(0,0,0,.9); animation: toastUp 1.4s ease-out forwards; text-align: center; padding: 0 12px; }
.hint { position: absolute; bottom: 14px; width: 100%; text-align: center; font-size: 14px; opacity: .65; margin: 0; pointer-events: none; text-shadow: 0 2px 0 #05070c, 0 0 8px rgba(0,0,0,.9); }

/* ---------- মোবাইল বোতাম ও জয়স্টিক ---------- */
.fire-btn, .run-btn {
  position: absolute; border-radius: 50%; border: 4px solid #05070c; font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
  font-weight: 700; touch-action: none; user-select: none; -webkit-user-select: none;
}
.fire-btn {
  right: calc(18px + env(safe-area-inset-right)); bottom: calc(26px + env(safe-area-inset-bottom));
  width: clamp(76px, 18vw, 96px); height: clamp(76px, 18vw, 96px); font-size: 20px; color: #052026;
  background: radial-gradient(circle at 35% 30%, #d8fbff, #4fe3ff); box-shadow: 0 6px 0 #05070c, 0 0 24px rgba(79,227,255,.6);
}
.fire-btn:active { transform: translateY(3px); }
.run-btn {
  right: calc(18px + env(safe-area-inset-right) + clamp(86px, 20vw, 108px)); bottom: calc(18px + env(safe-area-inset-bottom));
  width: clamp(56px, 13vw, 68px); height: clamp(56px, 13vw, 68px); font-size: 15px; color: #1a1205;
  background: radial-gradient(circle at 35% 30%, #ffe6b3, #ffc766); box-shadow: 0 5px 0 #05070c;
}
.run-btn:active { transform: translateY(3px); }
.joy-base { position: fixed; width: 110px; height: 110px; border-radius: 50%; border: 3px solid rgba(255,255,255,.35); background: rgba(255,255,255,.07); display: none; pointer-events: none; z-index: 5; }
.joy-knob { position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin: -24px 0 0 -24px; border-radius: 50%; background: rgba(255,255,255,.4); border: 3px solid rgba(5,7,12,.8); }

@keyframes toastUp { 0% { opacity: 0; transform: translateY(14px) scale(.9); } 15% { opacity: 1; transform: translateY(0) scale(1.08); } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-22px); } }

/* ---------- ছোট উচ্চতার স্ক্রিন (ফোন আড়াআড়ি) ---------- */
@media (max-height: 520px) {
  .btn-col { display: grid; grid-template-columns: 1fr 1fr; justify-items: center; gap: 10px; }
  .btn-col .gbtn { font-size: 17px; padding: 8px 14px; }
  .scroll { max-height: 40vh; max-height: 40dvh; }
  .hud-label { display: none; }
  .hud-left { gap: 5px; }
  .minimap { width: 84px; height: 84px; }
  .toast-wrap { top: 16%; }
  .stat-grid { grid-template-columns: repeat(6, 1fr); gap: 6px; }
}
/* ---------- খাড়া ফোন ---------- */
@media (orientation: portrait) {
  .rotate-hint { display: block; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .hint { display: none; }
  .fire-btn { bottom: calc(40px + env(safe-area-inset-bottom)); }
  .run-btn { bottom: calc(32px + env(safe-area-inset-bottom)); }
}
@media (max-width: 380px) {
  .gbtn { font-size: 18px; padding: 9px 20px; }
}
@media (prefers-reduced-motion: reduce) { .gbtn, .toast { transition: none; animation-duration: .01s; } }
`;

const font = "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif";

const styles: Record<string, CSSProperties> = {
  root: { position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: font, color: '#eef2ff', background: '#070b16', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' },
  canvas: { position: 'absolute', inset: 0 },
  vignette: { position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.25, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)', transition: 'opacity .3s' },
  flash: { position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(229,72,77,0.15), rgba(229,72,77,0.65))' },
  cross: { position: 'absolute', left: '50%', top: '50%', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.75)', transform: 'translate(-50%,-50%)', transition: 'transform .1s', pointerEvents: 'none' },

  overlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,6,12,0.58)', padding: 'max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left))', boxSizing: 'border-box' },
  title: { fontSize: 'clamp(36px, 8vw, 64px)', margin: '0 0 6px', fontWeight: 700, color: '#bdf5dc', textShadow: '0 4px 0 #05070c, 0 0 24px rgba(105,211,174,0.5)', lineHeight: 1.2 },
  title2: { fontSize: 'clamp(28px, 6vw, 44px)', margin: '0 0 10px', fontWeight: 700, color: '#bdf5dc', textShadow: '0 4px 0 #05070c', lineHeight: 1.2 },
  lead: { fontSize: 'clamp(15px, 3.6vw, 17px)', lineHeight: 1.7, margin: '0 0 14px', color: '#d6dcf2' },
  warn: { fontSize: 16, color: '#ff9aa0', margin: '0 0 12px', lineHeight: 1.6 },
  bestLine: { margin: '16px 0 0', fontSize: 15, color: '#9aa6cc' },

  pipRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '4px 0 12px' },
  pip: { width: 16, height: 16, borderRadius: '50%', background: '#ffc766', border: '2px solid #05070c', boxShadow: '0 0 8px rgba(255,199,102,.6)' },
  pipUsed: { background: '#2a3556', boxShadow: 'none' },
  pipText: { marginLeft: 8, fontSize: 15, color: '#c4cdea' },

  stat: { display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 6px', fontSize: 14, color: '#9aa6cc' },
  bonusLine: { margin: '0 0 8px', color: '#ffc766', fontSize: 16 },

  h3: { fontSize: 18, margin: '14px 0 6px', color: '#ffc766' },
  p: { fontSize: 16, lineHeight: 1.75, margin: '0 0 8px', color: '#d6dcf2' },
  ul: { fontSize: 16, lineHeight: 1.75, margin: '0 0 8px', paddingLeft: 22, color: '#d6dcf2' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 12 },
  tdKey: { padding: '8px 10px', fontWeight: 700, color: '#ffe3a3', borderBottom: '1px solid rgba(255,255,255,.1)', width: '48%', verticalAlign: 'top' },
  tdVal: { padding: '8px 10px', color: '#d6dcf2', borderBottom: '1px solid rgba(255,255,255,.1)' },
  setRow: { display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 18px', fontSize: 16 },
  setCheck: { display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 18px', fontSize: 16 },

  charCard: { display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '12px 14px', margin: '0 0 10px' },
  charDot: { flex: '0 0 auto', width: 22, height: 22, borderRadius: '50%', marginTop: 6, border: '2px solid #05070c' },
  charName: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  charDesc: { fontSize: 15, lineHeight: 1.7, color: '#d6dcf2' },
};
