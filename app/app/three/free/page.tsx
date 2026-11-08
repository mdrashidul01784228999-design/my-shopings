'use client';
/*
  দ্বীপ যুদ্ধ — ব্যাটল রয়্যাল স্টাইল ৩ডি গেম (Next.js App Router: app/page.tsx)
  সেটআপ:
    npx create-next-app@latest island-clash --typescript
    cd island-clash && npm i three && npm i -D @types/three
    এই ফাইলটা app/page.tsx এ বসাও, তারপর: npm run dev
  নিয়ন্ত্রণ: WASD চলা · Shift দৌড় · Space লাফ · মাউস ঘোরা · ক্লিক গুলি · ডান-ক্লিক জুম
             R রিলোড · 1/2 অস্ত্র বদল · লুটের উপর দিয়ে হাঁটলেই তোলা হয়
  (এটা মৌলিক নকশার গেম; Free Fire এর কোনো ছবি/মডেল/নাম ব্যবহার করা হয়নি)
*/
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Bangers } from 'next/font/google';

const bang = Bangers({ weight: '400', subsets: ['latin'] });

type WKey = 'pistol' | 'rifle' | 'shotgun' | 'sniper';
type Ent = { x: number; z: number; hp: number; armor: number; alive: boolean; name: string; isPlayer: boolean };
type Bot = Ent & { g: THREE.Group; lL: THREE.Group; lR: THREE.Group; tgt: Ent | null; scanT: number; fireT: number; aimT: number; wx: number; wz: number; wt: number; walk: number; strafe: number; sT: number; deadT: number };
type Loot = { m: THREE.Group; type: string; x: number; z: number; ph: number };
type Box = { x0: number; x1: number; z0: number; z1: number };

const DIFFS: Record<string, { n: string; bots: number; acc: number; dmg: number; rate: number; react: number; color: string }> = {
  easy: { n: 'সহজ', bots: 11, acc: 0.25, dmg: 6, rate: 0.6, react: 0.7, color: '#7bff4f' },
  hard: { n: 'কঠিন', bots: 17, acc: 0.42, dmg: 9, rate: 0.42, react: 0.45, color: '#ffb534' },
  insane: { n: 'আরো কঠিন', bots: 23, acc: 0.6, dmg: 12, rate: 0.3, react: 0.25, color: '#ff4d6d' },
};
const WP: Record<WKey, { n: string; dmg: number; rate: number; mag: number; spread: number; pel: number; range: number; col: number; len: number; auto: boolean; rl: number }> = {
  pistol: { n: 'পিস্তল', dmg: 18, rate: 380, mag: 12, spread: 0.012, pel: 1, range: 90, col: 0x555555, len: 0.4, auto: false, rl: 1100 },
  rifle: { n: 'রাইফেল', dmg: 22, rate: 105, mag: 30, spread: 0.02, pel: 1, range: 130, col: 0x2e8b57, len: 0.75, auto: true, rl: 1600 },
  shotgun: { n: 'শটগান', dmg: 11, rate: 800, mag: 6, spread: 0.05, pel: 8, range: 35, col: 0x8b4513, len: 0.6, auto: false, rl: 2000 },
  sniper: { n: 'স্নাইপার', dmg: 90, rate: 1400, mag: 5, spread: 0.002, pel: 1, range: 260, col: 0x3a3a8a, len: 1.0, auto: false, rl: 2200 },
};
const LOOT_COL: Record<string, number> = { rifle: 0x2ecc71, shotgun: 0xff9f43, sniper: 0xa55eea, ammo: 0xfeca57, med: 0xff4757, armor: 0x54a0ff };
const LOOT_N: Record<string, string> = { rifle: 'রাইফেল', shotgun: 'শটগান', sniper: 'স্নাইপার', ammo: 'গুলি', med: 'মেডকিট', armor: 'আর্মার' };
const PH = [
  { r: 125, wait: 0, shrink: 0, dps: 0 }, { r: 85, wait: 30, shrink: 25, dps: 2 }, { r: 55, wait: 25, shrink: 20, dps: 4 },
  { r: 30, wait: 20, shrink: 20, dps: 7 }, { r: 12, wait: 15, shrink: 15, dps: 12 }, { r: 3, wait: 10, shrink: 15, dps: 20 },
];
const OUT = [0xff5252, 0x4dabf7, 0xffd43b, 0xb197fc, 0x69db7c, 0xff922b, 0xf06595, 0x3bc9db];

export default function Page() {
  const mount = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const vigRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const api = useRef({ start: (_k: string) => {}, resume: () => {} });
  const [screen, setScreen] = useState<'menu' | 'play' | 'pause' | 'over'>('menu');
  const [hud, setHud] = useState({ hp: 100, armor: 0, alive: 0, kills: 0, wn: '', mag: 0, reserve: 0, reload: false, zone: '', out: false, scope: false, slot: 0, w2: '' });
  const [fin, setFin] = useState({ win: false, rank: 0, kills: 0 });
  const [toastTxt, setToastTxt] = useState('');
  const [feed, setFeed] = useState<string[]>([]);

  useEffect(() => {
    const el = mount.current!;
    let D = DIFFS.easy, running = false, paused = false, raf = 0, tt: any, hudT = 0, mapT = 0, over = false;
    let yaw = 0, pitch = 0, py = 0, vy = 0, kills = 0, reserve = 60, cur = 0, reloading = false, firing = false, fireOnce = false, zoom = false, nextShot = 0, vig = 0, bob = 0, moving = false;
    const slots: (WKey | null)[] = ['pistol', null], mags = [12, 0], keys: Record<string, boolean> = {};
    const me: Ent = { x: 0, z: 0, hp: 100, armor: 0, alive: true, name: 'তুমি', isPlayer: true };
    const bots: Bot[] = [], loot: Loot[] = [], boxes: Box[] = [], blockers: THREE.Object3D[] = [], bInfo: { cx: number; cz: number; w: number; d: number }[] = [], bRects: Box[] = [];
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const rnd = (a: number) => (Math.random() - 0.5) * a;

    // ---------- রেন্ডারার ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fd3ff);
    scene.fog = new THREE.Fog(0x8fd3ff, 70, 280);
    const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 400);
    scene.add(cam);
    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(innerWidth, innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio, 2)); ren.shadowMap.enabled = true;
    el.appendChild(ren.domElement);
    const onResize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);

    const gm = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
    gm.minFilter = gm.magFilter = THREE.NearestFilter; gm.needsUpdate = true;
    const outM = new THREE.MeshBasicMaterial({ color: 0x1b1030, side: THREE.BackSide });
    const toon = (g: THREE.BufferGeometry, c: number, em = 0, line = 0.06) => {
      const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: c, gradientMap: gm, emissive: em }));
      if (line > 0) { const o = new THREE.Mesh(g, outM); o.scale.setScalar(1 + line); m.add(o); }
      m.castShadow = true; return m;
    };

    scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 1.1));
    const sun = new THREE.DirectionalLight(0xfff2cc, 1.2);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 300 });
    scene.add(sun, sun.target);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), new THREE.MeshToonMaterial({ color: 0x2aa8ff, gradientMap: gm }));
    water.rotation.x = -Math.PI / 2; water.position.y = -0.3; scene.add(water);
    const island = new THREE.Mesh(new THREE.CircleGeometry(142, 56), new THREE.MeshToonMaterial({ color: 0x6fd36a, gradientMap: gm }));
    island.rotation.x = -Math.PI / 2; island.receiveShadow = true; scene.add(island);
    const sand = new THREE.Mesh(new THREE.RingGeometry(124, 142, 56), new THREE.MeshToonMaterial({ color: 0xf2d98a, gradientMap: gm }));
    sand.rotation.x = -Math.PI / 2; sand.position.y = 0.02; scene.add(sand);

    // ---------- ম্যাপ: বাড়ি, গাছ, পাথর ----------
    const wallBox = (x0: number, x1: number, z0: number, z1: number, h: number, col: number) => {
      const m = toon(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), col, 0, 0); m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); m.receiveShadow = true;
      scene.add(m); blockers.push(m); boxes.push({ x0, x1, z0, z1 });
    };
    function building(cx: number, cz: number) {
      const w = 9 + Math.random() * 6, d = 9 + Math.random() * 5, h = 3.6, t = 0.4, dw = 1.4;
      const col = [0xff8a65, 0x64b5f6, 0xffd54f, 0xba68c8, 0x81c784][Math.floor(Math.random() * 5)];
      const fl = toon(new THREE.BoxGeometry(w, 0.1, d), 0xe0d6c0, 0, 0); fl.position.set(cx, 0.06, cz); fl.receiveShadow = true; scene.add(fl);
      wallBox(cx - w / 2, cx + w / 2, cz - d / 2, cz - d / 2 + t, h, col);
      wallBox(cx - w / 2, cx - w / 2 + t, cz - d / 2, cz + d / 2, h, col);
      wallBox(cx + w / 2 - t, cx + w / 2, cz - d / 2, cz + d / 2, h, col);
      wallBox(cx - w / 2, cx - dw, cz + d / 2 - t, cz + d / 2, h, col);
      wallBox(cx + dw, cx + w / 2, cz + d / 2 - t, cz + d / 2, h, col);
      const roof = toon(new THREE.BoxGeometry(w + 0.8, 0.35, d + 0.8), 0x8d3b3b, 0, 0.03); roof.position.set(cx, h + 0.17, cz); scene.add(roof); blockers.push(roof);
      bInfo.push({ cx, cz, w, d }); bRects.push({ x0: cx - w / 2 - 3, x1: cx + w / 2 + 3, z0: cz - d / 2 - 3, z1: cz + d / 2 + 3 });
    }
    for (let i = 0, n = 0; i < 200 && n < 14; i++) {
      const a = Math.random() * 6.28, r = Math.random() * 100, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (bInfo.some(b => Math.hypot(b.cx - x, b.cz - z) < 24)) continue; building(x, z); n++;
    }
    for (let i = 0, n = 0; i < 400 && n < 100; i++) {
      const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 120, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (bRects.some(b => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) continue; n++;
      const g = new THREE.Group(), tr = toon(new THREE.CylinderGeometry(0.3, 0.45, 3, 7), 0x7a4a2a), l1 = toon(new THREE.ConeGeometry(1.9, 3, 7), 0x2f9e44), l2 = toon(new THREE.ConeGeometry(1.4, 2.4, 7), 0x51cf66);
      tr.position.y = 1.5; l1.position.y = 4; l2.position.y = 5.5; g.add(tr, l1, l2); g.position.set(x, 0, z); g.scale.setScalar(0.8 + Math.random() * 0.8); scene.add(g);
      blockers.push(tr); g.updateMatrixWorld(true);
      boxes.push({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 });
    }
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * 6.28, r = Math.random() * 120, x = Math.cos(a) * r, z = Math.sin(a) * r, s = 1 + Math.random() * 0.9;
      if (bRects.some(b => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) continue;
      const m = toon(new THREE.DodecahedronGeometry(s), 0x9aa0a6); m.position.set(x, s * 0.5, z); scene.add(m); blockers.push(m); m.updateMatrixWorld(true);
      boxes.push({ x0: x - s * 0.8, x1: x + s * 0.8, z0: z - s * 0.8, z1: z + s * 0.8 });
    }
    // সেফ জোনের দেয়াল
    const zoneM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 220, 72, 1, true), new THREE.MeshBasicMaterial({ color: 0x3d7bff, transparent: true, opacity: 0.28, side: THREE.DoubleSide, fog: false }));
    zoneM.position.y = 100; scene.add(zoneM);

    function collide(e: { x: number; z: number }, r: number) {
      for (const b of boxes) {
        const cx = clamp(e.x, b.x0, b.x1), cz = clamp(e.z, b.z0, b.z1), dx = e.x - cx, dz = e.z - cz, d = Math.hypot(dx, dz);
        if (d < r) {
          if (d > 0.0001) { e.x += (dx / d) * (r - d); e.z += (dz / d) * (r - d); }
          else { const l = e.x - b.x0, rr = b.x1 - e.x, t = e.z - b.z0, bt = b.z1 - e.z, m = Math.min(l, rr, t, bt); if (m === l) e.x = b.x0 - r; else if (m === rr) e.x = b.x1 + r; else if (m === t) e.z = b.z0 - r; else e.z = b.z1 + r; }
        }
      }
    }

    // ---------- লুট ----------
    function mkLoot(type: string, x: number, z: number) {
      const g = new THREE.Group(), c = LOOT_COL[type];
      const b = toon(new THREE.BoxGeometry(0.6, 0.45, 0.6), c, c, 0.1); b.position.y = 0.9;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3, fog: false })); beam.position.y = 4.5;
      g.add(b, beam); g.position.set(x, 0, z); scene.add(g); loot.push({ m: g, type, x, z, ph: Math.random() * 6 });
    }
    const randType = () => { const r = Math.random(); return r < 0.3 ? 'ammo' : r < 0.5 ? 'med' : r < 0.65 ? 'armor' : r < 0.8 ? 'rifle' : r < 0.92 ? 'shotgun' : 'sniper'; };
    function spawnAllLoot() {
      loot.forEach(l => scene.remove(l.m)); loot.length = 0;
      bInfo.forEach(b => { for (let i = 0; i < 3; i++) mkLoot(randType(), b.cx + rnd(b.w - 3), b.cz + rnd(b.d - 3)); });
      for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = Math.random() * 115; const p = { x: Math.cos(a) * r, z: Math.sin(a) * r }; collide(p, 0.8); mkLoot(randType(), p.x, p.z); }
    }

    // ---------- বন্দুক (ফার্স্ট পারসন) ----------
    const gun = new THREE.Group();
    const gBody = toon(new THREE.BoxGeometry(0.12, 0.18, 0.5), 0x555555, 0, 0.1), gGrip = toon(new THREE.BoxGeometry(0.09, 0.22, 0.12), 0x222222, 0, 0.1);
    gGrip.position.set(0, -0.18, 0.1); gGrip.rotation.x = 0.2;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb62e })); flash.visible = false;
    gun.add(gBody, gGrip, flash); gun.position.set(0.27, -0.25, -0.55); cam.add(gun);
    function setupGun() { const w = WP[slots[cur]!]; (gBody.material as THREE.MeshToonMaterial).color.setHex(w.col); gBody.scale.z = w.len / 0.5; gBody.position.z = -w.len / 2 + 0.25; flash.position.set(0, 0, -w.len - 0.1); }

    // ---------- বট ----------
    function mkBot(i: number): Bot {
      const col = OUT[i % OUT.length], g = new THREE.Group();
      const torso = toon(new THREE.BoxGeometry(0.7, 0.85, 0.4), col); torso.position.y = 1.2;
      const head = toon(new THREE.SphereGeometry(0.28, 12, 10), 0xffd1a6); head.position.y = 1.85;
      const band = toon(new THREE.BoxGeometry(0.58, 0.09, 0.58), col, 0, 0.05); band.position.y = 1.95;
      const mkLeg = (x: number) => { const p = new THREE.Group(); p.position.set(x, 0.8, 0); const l = toon(new THREE.BoxGeometry(0.25, 0.8, 0.28), 0x2d3436); l.position.y = -0.4; p.add(l); return p; };
      const lL = mkLeg(-0.18), lR = mkLeg(0.18);
      const gn = toon(new THREE.BoxGeometry(0.12, 0.16, 0.7), 0x222222, 0, 0.1); gn.position.set(0.25, 1.2, 0.5);
      const arm = toon(new THREE.BoxGeometry(0.2, 0.2, 0.6), col, 0, 0.08); arm.position.set(0.25, 1.25, 0.25);
      g.add(torso, head, band, lL, lR, gn, arm); scene.add(g);
      const b: Bot = { x: 0, z: 0, hp: 100, armor: 0, alive: true, name: 'বট-' + (i + 1), isPlayer: false, g, lL, lR, tgt: null, scanT: Math.random(), fireT: 0, aimT: 0, wx: 0, wz: 0, wt: 0, walk: 0, strafe: 1, sT: 0, deadT: 0 };
      g.traverse(o => { o.userData.b = b; }); return b;
    }

    // ---------- শব্দ ও UI ----------
    let ac: AudioContext | undefined;
    function sfx(f: number, d: number, vol = 0.1) { try { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'square'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(40, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d); } catch {} }
    const toast = (s: string) => { setToastTxt(s); clearTimeout(tt); tt = setTimeout(() => setToastTxt(''), 1800); };
    const feedLog = (s: string) => { setFeed(f => [...f.slice(-3), s]); setTimeout(() => setFeed(f => f.slice(1)), 5000); };
    const aliveCount = () => bots.filter(b => b.alive).length + (me.alive ? 1 : 0);

    // ---------- যুদ্ধ ----------
    const lr = new THREE.Raycaster(), pr = new THREE.Raycaster();
    function los(a: Ent, c: Ent) {
      const o = new THREE.Vector3(a.x, 1.5, a.z), t = new THREE.Vector3(c.x, 1.3, c.z), dir = t.clone().sub(o), dist = dir.length();
      lr.set(o, dir.normalize()); lr.far = dist; const h = lr.intersectObjects(blockers, false); return !h.length || h[0].distance > dist - 0.3;
    }
    function tracer(a: THREE.Vector3, b: THREE.Vector3, c: number) {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b]), ln = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: c }));
      scene.add(ln); setTimeout(() => { scene.remove(ln); geo.dispose(); }, 60);
    }
    function die(e: Ent, by: Ent | null) {
      const rank = aliveCount();
      e.alive = false;
      feedLog(by ? by.name + ' মেরেছে ' + e.name + ' কে' : e.name + ' জোনে মারা গেছে');
      if (by && by.isPlayer) kills++;
      if (e.isPlayer) { finish(false, rank); return; }
      const b = e as Bot; b.deadT = 0; mkLoot(randType(), b.x, b.z); mkLoot('ammo', b.x + 1, b.z);
    }
    function dmgEnt(e: Ent, amt: number, by: Ent | null) {
      if (!e.alive) return;
      if (e.armor > 0) { const a = Math.min(e.armor, amt * 0.6); e.armor -= a; amt -= a; }
      e.hp -= amt; if (e.isPlayer) { vig = 1; sfx(110, 0.12, 0.15); }
      if (e.hp <= 0) die(e, by);
    }
    function reload() {
      const w = WP[slots[cur]!], c = cur; if (reloading || mags[c] >= w.mag || reserve <= 0) return;
      reloading = true; sfx(150, 0.25);
      setTimeout(() => { const n = Math.min(w.mag - mags[c], reserve); mags[c] += n; reserve -= n; reloading = false; }, w.rl);
    }
    function shoot() {
      const w = WP[slots[cur]!]; if (reloading) return; if (mags[cur] <= 0) { reload(); return; }
      mags[cur]--; nextShot = performance.now() + w.rate; sfx(w.pel > 1 ? 120 : 260, 0.1, 0.14);
      flash.visible = true; setTimeout(() => { flash.visible = false; }, 40);
      const sp = w.spread * (zoom ? 0.3 : 1) + (moving ? 0.006 : 0), from = new THREE.Vector3(); flash.getWorldPosition(from);
      const bt = bots.filter(b => !b.g.userData.gone);
      for (let p = 0; p < w.pel; p++) {
        pr.setFromCamera(new THREE.Vector2(rnd(sp * 10), rnd(sp * 10)), cam); pr.far = w.range;
        const hits = pr.intersectObjects([...blockers, ...bt.map(b => b.g)], true);
        let end = pr.ray.at(Math.min(w.range, 120), new THREE.Vector3());
        if (hits.length) {
          end = hits[0].point; const b = hits[0].object.userData.b as Bot | undefined;
          if (b && b.alive) { const head = end.y > 1.65; dmgEnt(b, w.dmg * (head ? 2 : 1), me); const h = hitRef.current; if (h) { h.style.opacity = '1'; h.style.borderColor = head ? '#ff3b3b' : '#fff'; setTimeout(() => { h.style.opacity = '0'; }, 120); } }
        }
        tracer(from, end, 0xfff066);
      }
    }
    function giveWeapon(k: WKey) { if (slots[1] === k) reserve += WP[k].mag; else { slots[1] = k; mags[1] = WP[k].mag; } cur = 1; reloading = false; setupGun(); }
    function pickup(l: Loot) {
      if (l.type === 'ammo') reserve = Math.min(240, reserve + 30);
      else if (l.type === 'med') { if (me.hp >= 100) return false; me.hp = Math.min(100, me.hp + 50); }
      else if (l.type === 'armor') { if (me.armor >= 100) return false; me.armor = Math.min(100, me.armor + 50); }
      else giveWeapon(l.type as WKey);
      toast('পেয়েছ: ' + LOOT_N[l.type]); sfx(700, 0.12, 0.08); return true;
    }

    // ---------- জোন ----------
    let zone = { x: 0, z: 0, r: 125 }, zFrom = { ...zone }, zTo = { ...zone }, zi = 1, zt = 0, shrinking = false;
    function nextTarget() { const p = PH[Math.min(zi, PH.length - 1)], a = Math.random() * 6.28, off = Math.random() * Math.max(0, zone.r - p.r) * 0.8; zTo = { x: zone.x + Math.cos(a) * off, z: zone.z + Math.sin(a) * off, r: p.r }; }
    function updZone(dt: number) {
      if (zi < PH.length) {
        const p = PH[zi]; zt += dt;
        if (!shrinking) { if (zt >= p.wait) { shrinking = true; zt = 0; zFrom = { ...zone }; toast('⚠ জোন সংকুচিত হচ্ছে!'); } }
        else { const k = Math.min(1, zt / p.shrink); zone.x = zFrom.x + (zTo.x - zFrom.x) * k; zone.z = zFrom.z + (zTo.z - zFrom.z) * k; zone.r = zFrom.r + (zTo.r - zFrom.r) * k;
          if (k >= 1) { shrinking = false; zt = 0; zi++; if (zi < PH.length) nextTarget(); } }
      }
      zoneM.scale.set(zone.r, 1, zone.r); zoneM.position.x = zone.x; zoneM.position.z = zone.z;
    }

    // ---------- বটের মস্তিষ্ক ----------
    function updBot(b: Bot, dt: number) {
      if (!b.alive) { b.deadT += dt; b.g.rotation.x = -Math.PI / 2 * Math.min(1, b.deadT / 0.4); b.g.position.y = 0.3 * Math.min(1, b.deadT / 0.4); if (b.deadT > 5 && !b.g.userData.gone) { scene.remove(b.g); b.g.userData.gone = true; } return; }
      b.scanT -= dt;
      if (b.scanT <= 0) {
        b.scanT = 0.4 + Math.random() * 0.2; const prev = b.tgt; b.tgt = null; let bd = 48;
        for (const c of [me, ...bots]) { if (c === b || !c.alive) continue; const d = Math.hypot(c.x - b.x, c.z - b.z); if (d < bd && los(b, c)) { bd = d; b.tgt = c; } }
        if (b.tgt && !prev) b.aimT = D.react;
      }
      const dzone = Math.hypot(b.x - zone.x, b.z - zone.z), outside = dzone > zone.r - 4;
      let mx = 0, mz = 0, speed = 3.5, face = b.g.rotation.y;
      if (outside) { mx = zone.x - b.x; mz = zone.z - b.z; speed = 5.5; face = Math.atan2(mx, mz); }
      else if (b.tgt) {
        const dx = b.tgt.x - b.x, dz = b.tgt.z - b.z, d = Math.hypot(dx, dz) || 1; face = Math.atan2(dx, dz); b.sT -= dt; if (b.sT <= 0) { b.strafe *= -1; b.sT = 1 + Math.random() * 2; }
        if (d > 22) { mx = dx; mz = dz; } else if (d < 10) { mx = -dx; mz = -dz; } else { mx = -dz * b.strafe; mz = dx * b.strafe; speed = 2.6; }
      } else {
        b.wt -= dt; if (b.wt <= 0 || Math.hypot(b.wx - b.x, b.wz - b.z) < 2) { const a = Math.random() * 6.28, r = Math.random() * zone.r * 0.8; b.wx = zone.x + Math.cos(a) * r; b.wz = zone.z + Math.sin(a) * r; b.wt = 6 + Math.random() * 6; }
        mx = b.wx - b.x; mz = b.wz - b.z; face = Math.atan2(mx, mz);
      }
      const l = Math.hypot(mx, mz);
      if (l > 0.1) { b.x += (mx / l) * speed * dt; b.z += (mz / l) * speed * dt; b.walk += dt * speed * 2.2; }
      collide(b, 0.45); const rr = Math.hypot(b.x, b.z); if (rr > 135) { b.x *= 135 / rr; b.z *= 135 / rr; }
      b.g.position.set(b.x, 0, b.z); b.g.rotation.y = face; b.lL.rotation.x = Math.sin(b.walk) * 0.7; b.lR.rotation.x = -Math.sin(b.walk) * 0.7;
      if (b.tgt && b.tgt.alive) {
        b.aimT -= dt; b.fireT -= dt;
        if (b.aimT <= 0 && b.fireT <= 0) {
          b.fireT = D.rate * (0.8 + Math.random() * 0.5); const d = Math.hypot(b.tgt.x - b.x, b.tgt.z - b.z), chance = D.acc * clamp(1 - d / 70, 0.2, 1);
          const a = new THREE.Vector3(b.x, 1.3, b.z), t = new THREE.Vector3(b.tgt.x + rnd(1.5), 1.2, b.tgt.z + rnd(1.5)); tracer(a, t, 0xff7043);
          if (Math.random() < chance) dmgEnt(b.tgt, D.dmg, b);
          const dm = Math.hypot(b.x - me.x, b.z - me.z); if (dm < 45) sfx(200, 0.08, 0.05 * (1 - dm / 45));
        }
      }
    }

    // ---------- মিনিম্যাপ ----------
    function drawMap() {
      const c = mapRef.current; if (!c) return; const x = c.getContext('2d')!, S = 0.5, o = 75; x.clearRect(0, 0, 150, 150);
      x.fillStyle = '#2aa8ffcc'; x.fillRect(0, 0, 150, 150); x.fillStyle = '#6fd36a'; x.beginPath(); x.arc(o, o, 140 * S, 0, 6.3); x.fill();
      x.fillStyle = '#b08a5a'; bInfo.forEach(b => x.fillRect(o + (b.cx - b.w / 2) * S, o + (b.cz - b.d / 2) * S, b.w * S, b.d * S));
      x.lineWidth = 2; x.strokeStyle = '#3d7bff'; x.beginPath(); x.arc(o + zone.x * S, o + zone.z * S, zone.r * S, 0, 6.3); x.stroke();
      x.strokeStyle = '#fff'; x.lineWidth = 1; x.beginPath(); x.arc(o + zTo.x * S, o + zTo.z * S, zTo.r * S, 0, 6.3); x.stroke();
      x.fillStyle = '#ff3b3b'; bots.forEach(b => { if (b.alive && Math.hypot(b.x - me.x, b.z - me.z) < 60) { x.beginPath(); x.arc(o + b.x * S, o + b.z * S, 2.5, 0, 6.3); x.fill(); } });
      const ang = Math.atan2(-Math.cos(yaw), -Math.sin(yaw)); x.save(); x.translate(o + me.x * S, o + me.z * S); x.rotate(ang); x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(7, 0); x.lineTo(-5, 4.5); x.lineTo(-5, -4.5); x.closePath(); x.fill(); x.stroke(); x.restore();
    }

    // ---------- ইনপুট ----------
    const onKD = (e: KeyboardEvent) => { keys[e.code] = true; if (!running || paused) return; if (e.code === 'KeyR') reload(); if (e.code === 'Digit1') { cur = 0; reloading = false; setupGun(); } if (e.code === 'Digit2' && slots[1]) { cur = 1; reloading = false; setupGun(); } };
    const onKU = (e: KeyboardEvent) => { keys[e.code] = false; };
    const onMM = (e: MouseEvent) => { if (document.pointerLockElement) { const s = zoom ? 0.0011 : 0.0022; yaw -= e.movementX * s; pitch = clamp(pitch - e.movementY * s, -1.4, 1.4); } };
    const onMD = (e: MouseEvent) => { if (!document.pointerLockElement) return; if (e.button === 2) zoom = true; else { firing = true; fireOnce = true; } };
    const onMU = (e: MouseEvent) => { if (e.button === 2) zoom = false; else firing = false; };
    const onCM = (e: Event) => e.preventDefault();
    const onPL = () => { if (!document.pointerLockElement && running) { paused = true; firing = false; zoom = false; setScreen('pause'); } };
    addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('mousemove', onMM); addEventListener('mousedown', onMD);
    addEventListener('mouseup', onMU); addEventListener('contextmenu', onCM); document.addEventListener('pointerlockchange', onPL);

    function finish(win: boolean, rank: number) { if (over) return; over = true; running = false; document.exitPointerLock(); setFin({ win, rank, kills }); setScreen('over'); }
    api.current.start = (k: string) => {
      D = DIFFS[k]; over = false; kills = 0; reserve = 60; cur = 0; slots[1] = null; mags[0] = 12; mags[1] = 0; reloading = false; vig = 0; py = 0; vy = 0;
      me.hp = 100; me.armor = 0; me.alive = true; yaw = Math.random() * 6; pitch = 0;
      const a = Math.random() * 6.28, r = 50 + Math.random() * 50; me.x = Math.cos(a) * r; me.z = Math.sin(a) * r; collide(me, 0.6);
      bots.forEach(b => scene.remove(b.g)); bots.length = 0;
      for (let i = 0; i < D.bots; i++) {
        const b = mkBot(i); let x = 0, z = 0; do { const a2 = Math.random() * 6.28, r2 = Math.random() * 112; x = Math.cos(a2) * r2; z = Math.sin(a2) * r2; } while (Math.hypot(x - me.x, z - me.z) < 35);
        b.x = x; b.z = z; collide(b, 0.6); b.g.position.set(b.x, 0, b.z); b.wt = 0; bots.push(b);
      }
      zone = { x: 0, z: 0, r: 125 }; zFrom = { ...zone }; zi = 1; zt = 0; shrinking = false; nextTarget();
      spawnAllLoot(); setupGun(); setFeed([]); running = true; paused = false; setScreen('play'); ren.domElement.requestPointerLock(); toast('বাঁচো! শেষ জন জিতবে');
    };
    api.current.resume = () => { paused = false; setScreen('play'); ren.domElement.requestPointerLock(); };

    // ---------- মূল আপডেট ----------
    function update(dt: number, t: number) {
      const sp = keys.ShiftLeft ? 8.5 : 5.5, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), r = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), mx = fx * f + rx * r, mz = fz * f + rz * r, l = Math.hypot(mx, mz); moving = l > 0;
      if (l) { me.x += (mx / l) * sp * dt; me.z += (mz / l) * sp * dt; bob += dt * sp * 1.8; }
      collide(me, 0.5); const rr = Math.hypot(me.x, me.z); if (rr > 135) { me.x *= 135 / rr; me.z *= 135 / rr; }
      if (keys.Space && py <= 0.001) vy = 8; vy -= 22 * dt; py = Math.max(0, py + vy * dt); if (py === 0 && vy < 0) vy = 0;
      cam.position.set(me.x, py + 1.7 + (moving && py === 0 ? Math.sin(bob) * 0.05 : 0), me.z); cam.rotation.set(pitch, yaw, 0, 'YXZ');
      const scope = zoom && slots[cur] === 'sniper', tf = zoom ? (scope ? 22 : 45) : 75; cam.fov += (tf - cam.fov) * Math.min(1, dt * 12); cam.updateProjectionMatrix(); gun.visible = !scope;
      sun.position.set(me.x + 60, 100, me.z + 40); sun.target.position.set(me.x, 0, me.z);
      const w = WP[slots[cur]!];
      if (firing && performance.now() >= nextShot && (w.auto || fireOnce)) { shoot(); fireOnce = false; }
      updZone(dt);
      const dps = PH[Math.min(zi, PH.length - 1)].dps, outMe = Math.hypot(me.x - zone.x, me.z - zone.z) > zone.r;
      if (outMe && me.alive) dmgEnt(me, dps * dt, null);
      for (const b of bots) { if (b.alive && Math.hypot(b.x - zone.x, b.z - zone.z) > zone.r) { b.hp -= dps * dt; if (b.hp <= 0) die(b, null); } updBot(b, dt); }
      for (let i = loot.length - 1; i >= 0; i--) { const q = loot[i]; q.m.rotation.y += dt * 2; q.m.children[0].position.y = 0.9 + Math.sin(t * 0.004 + q.ph) * 0.15;
        if (Math.hypot(q.x - me.x, q.z - me.z) < 1.6 && pickup(q)) { scene.remove(q.m); loot.splice(i, 1); } }
      if (vig > 0) vig = Math.max(0, vig - dt * 1.5); if (vigRef.current) vigRef.current.style.opacity = String(Math.min(1, vig));
      if (me.alive && !over && bots.every(b => !b.alive)) finish(true, 1);
      mapT += dt; if (mapT > 0.1) { mapT = 0; drawMap(); }
      hudT += dt;
      if (hudT > 0.1) { hudT = 0; const p = PH[Math.min(zi, PH.length - 1)];
        setHud({ hp: Math.round(me.hp), armor: Math.round(me.armor), alive: aliveCount(), kills, wn: w.n, mag: mags[cur], reserve, reload: reloading, out: outMe, scope, slot: cur, w2: slots[1] ? WP[slots[1]!].n : '—',
          zone: zi >= PH.length ? 'শেষ জোন' : shrinking ? 'জোন সংকুচিত হচ্ছে!' : 'জোন সংকুচিত হবে: ' + Math.max(0, Math.ceil(p.wait - zt)) + ' সেকেন্ডে' }); }
    }
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (running && !paused) update(dt, t); else { cam.fov = 75; cam.updateProjectionMatrix(); cam.position.set(0, 40, 90); cam.rotation.set(-0.35, Math.sin(t * 0.0002) * 0.6, 0, 'YXZ'); gun.visible = false; }
      ren.render(scene, cam);
    };
    setupGun(); raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(tt);
      removeEventListener('resize', onResize); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('mousemove', onMM);
      removeEventListener('mousedown', onMD); removeEventListener('mouseup', onMU); removeEventListener('contextmenu', onCM); document.removeEventListener('pointerlockchange', onPL);
      document.exitPointerLock?.(); ren.dispose(); el.removeChild(ren.domElement);
    };
  }, []);

  const txt: React.CSSProperties = { color: '#fff', textShadow: '2px 2px 0 #1b1030', fontWeight: 800 };
  const btn = (bg: string): React.CSSProperties => ({ font: 'inherit', fontSize: 20, fontWeight: 800, minWidth: 250, padding: '12px 28px', background: bg, color: '#1b1030', border: '4px solid #1b1030', borderRadius: 16, boxShadow: '5px 5px 0 #1b1030', cursor: 'pointer' });
  const bar = (v: number, c: string): React.CSSProperties => ({ height: '100%', width: v + '%', background: c, transition: 'width .1s' });

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#8fd3ff', overflow: 'hidden', fontFamily: 'system-ui, "Noto Sans Bengali", sans-serif' }}>
      <div ref={mount} />
      <div ref={vigRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0, background: 'radial-gradient(circle, transparent 45%, #ff1a1acc 100%)' }} />
      {screen === 'play' && (
        <>
          {hud.scope && <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, transparent 22%, #000 23%)' }} />}
          <div style={{ position: 'fixed', left: '50%', top: '50%', width: 22, height: 22, margin: -11, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: 9, top: 9, width: 4, height: 4, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 1px #000' }} />
            <div ref={hitRef} style={{ position: 'absolute', inset: -4, border: '3px solid #fff', borderRadius: 4, transform: 'rotate(45deg) scale(.7)', opacity: 0 }} />
          </div>
          <canvas ref={mapRef} width={150} height={150} style={{ position: 'fixed', left: 14, top: 14, border: '4px solid #1b1030', borderRadius: 12, boxShadow: '4px 4px 0 #1b1030' }} />
          <div style={{ position: 'fixed', top: 14, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', ...txt, fontSize: 18 }}>
            <div>{hud.zone}</div>
            {hud.out && <div style={{ color: '#ff6b6b', fontSize: 22 }}>জোনের বাইরে! ভেতরে যাও!</div>}
            {toastTxt && <div style={{ color: '#ffd43b', fontSize: 22, marginTop: 6 }}>{toastTxt}</div>}
          </div>
          <div style={{ position: 'fixed', top: 14, right: 16, textAlign: 'right', pointerEvents: 'none', ...txt, fontSize: 17 }}>
            <div className={bang.className} style={{ fontSize: 28, fontWeight: 400 }}>👥 {hud.alive} জীবিত · ☠ {hud.kills} কিল</div>
            {feed.map((f, i) => <div key={i} style={{ fontSize: 14, opacity: 0.95 }}>{f}</div>)}
          </div>
          <div style={{ position: 'fixed', left: 16, bottom: 16, width: 260, pointerEvents: 'none', ...txt }}>
            <div style={{ fontSize: 14 }}>🛡 আর্মার {hud.armor}</div>
            <div style={{ height: 12, background: '#1b1030', border: '3px solid #1b1030', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}><div style={bar(hud.armor, '#54a0ff')} /></div>
            <div style={{ fontSize: 14 }}>❤ হেলথ {hud.hp}</div>
            <div style={{ height: 18, background: '#1b1030', border: '3px solid #1b1030', borderRadius: 10, overflow: 'hidden' }}><div style={bar(hud.hp, hud.hp > 35 ? '#7bff4f' : '#ff4d6d')} /></div>
          </div>
          <div style={{ position: 'fixed', right: 18, bottom: 16, textAlign: 'right', pointerEvents: 'none', ...txt }}>
            <div className={bang.className} style={{ fontSize: 46, fontWeight: 400, lineHeight: 1 }}>{hud.reload ? 'রিলোড...' : hud.mag + ' / ' + hud.reserve}</div>
            <div style={{ fontSize: 15 }}>[{hud.slot === 0 ? '1' : '2'}] {hud.wn} · অন্য অস্ত্র: {hud.slot === 0 ? hud.w2 : 'পিস্তল'}</div>
          </div>
        </>
      )}
      {screen !== 'play' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20, textAlign: 'center', ...txt, background: 'radial-gradient(circle at 50% 30%, #ff9f43dd, #1b1030f2)' }}>
          <h1 className={bang.className} style={{ margin: 0, fontSize: 72, fontWeight: 400, color: '#ffd43b', textShadow: '5px 5px 0 #1b1030', letterSpacing: 2 }}>
            {screen === 'over' ? (fin.win ? '🏆 CHAMPION!' : '💀 ELIMINATED') : 'ISLAND CLASH'}
          </h1>
          {screen === 'over' ? (
            <p style={{ margin: 0, fontSize: 22 }}>{fin.win ? 'তুমিই শেষ জীবিত — চ্যাম্পিয়ন!' : 'তোমার র‍্যাঙ্ক #' + fin.rank} · কিল <b>{fin.kills}</b></p>
          ) : (
            <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.8, fontWeight: 600 }}>
              দ্বীপে নামো, লুট কুড়াও, শত্রুদের হারাও আর ছোট হতে থাকা নীল জোনের ভেতরে থাকো। শেষ জন জিতবে!<br />
              <b>WASD</b> চলা · <b>Shift</b> দৌড় · <b>Space</b> লাফ · <b>ক্লিক</b> গুলি · <b>ডান-ক্লিক</b> জুম · <b>R</b> রিলোড · <b>1/2</b> অস্ত্র বদল
            </p>
          )}
          {screen === 'pause' && <button style={btn('#ffd43b')} onClick={() => api.current.resume()}>▶ চালিয়ে যাও</button>}
          {Object.entries(DIFFS).map(([k, d]) => <button key={k} style={btn(d.color)} onClick={() => api.current.start(k)}>{d.n} ({d.bots + 1} জন)</button>)}
        </div>
      )}
    </main>
  );
}

