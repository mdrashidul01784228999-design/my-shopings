'use client';
/*
  কার্টুন হরর ৩ডি গেম — Next.js (App Router) এর app/page.tsx
  সেটআপ:
    npx create-next-app@latest ghost-game --typescript
    cd ghost-game && npm i three && npm i -D @types/three
    এই ফাইলটা app/page.tsx এ বসাও, তারপর: npm run dev
*/
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Creepster } from 'next/font/google';

const creep = Creepster({ weight: '400', subsets: ['latin'] });

type Diff = { n: string; speed: number; hp: number; rate: number; max: number; dmg: number; m: number; color: string };
const DIFFS: Record<string, Diff> = {
  easy: { n: 'সহজ', speed: 2.2, hp: 2, rate: 2.2, max: 8, dmg: 8, m: 1, color: '#7bff4f' },
  hard: { n: 'কঠিন', speed: 3.6, hp: 3, rate: 1.4, max: 14, dmg: 12, m: 2, color: '#ff9e3d' },
  insane: { n: 'আরো কঠিন', speed: 5, hp: 5, rate: 0.8, max: 22, dmg: 18, m: 3, color: '#ff4d6d' },
};

type Ghost = { m: THREE.Group; mat: THREE.MeshToonMaterial; hp: number; hit: number; ph: number; sp: number };
type Veh = { name: string; spd: number; r: number; h: number; d: number; mesh: THREE.Group; p: [number, number] };

export default function Page() {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef({ start: (_k: string) => {}, resume: () => {} });
  const [screen, setScreen] = useState<'menu' | 'play' | 'pause' | 'over'>('menu');
  const [hud, setHud] = useState({ score: 0, level: 1, kills: 0, hp: 100, ammo: 30, reload: false, veh: 'পায়ে হেঁটে', hint: '', diff: '' });
  const [fin, setFin] = useState({ score: 0, level: 1, kills: 0 });
  const [banner, setBanner] = useState('');

  useEffect(() => {
    const el = mount.current!;
    let D = DIFFS.easy, score = 0, level = 1, kills = 0, health = 100, ammo = 30;
    let reloading = false, running = false, paused = false, ride: Veh | null = null, moving = false;
    let yaw = 0, pitch = 0, spawnT = 1, nextShot = 0, firing = false, hudT = 0, raf = 0, bt: any;
    const P = new THREE.Vector3(), keys: Record<string, boolean> = {};
    const ghosts: Ghost[] = [], puffs: { m: THREE.Mesh; t: number }[] = [];
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // ---------- renderer & scene ----------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f2e);
    scene.fog = new THREE.FogExp2(0x1a0f2e, 0.02);
    const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
    scene.add(cam);
    const ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(innerWidth, innerHeight);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.shadowMap.enabled = true;
    el.appendChild(ren.domElement);
    const onResize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);

    // ---------- cartoon (toon + black outline) helpers ----------
    const gm = new THREE.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, THREE.RedFormat);
    gm.minFilter = gm.magFilter = THREE.NearestFilter; gm.needsUpdate = true;
    const outM = new THREE.MeshBasicMaterial({ color: 0x0a0510, side: THREE.BackSide });
    const toon = (g: THREE.BufferGeometry, c: number, em = 0, line = 0.07) => {
      const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: c, gradientMap: gm, emissive: em }));
      const o = new THREE.Mesh(g, outM); o.scale.setScalar(1 + line); m.add(o); m.castShadow = true; return m;
    };
    const rnd = (a: number) => (Math.random() - 0.5) * a;

    scene.add(new THREE.HemisphereLight(0xb08cff, 0x331a44, 1));
    const moon = new THREE.DirectionalLight(0xd9ccff, 1.1);
    moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024);
    Object.assign(moon.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 });
    scene.add(moon, moon.target);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshToonMaterial({ color: 0x3b2a5c, gradientMap: gm }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(14, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfff1a8, fog: false }));
    moonMesh.position.set(90, 120, -220); scene.add(moonMesh);
    { const a: number[] = []; for (let i = 0; i < 600; i++) { const th = Math.random() * 6.28, ph = Math.random() * 1.3; a.push(280 * Math.cos(th) * Math.cos(ph), 280 * Math.sin(ph) + 10, 280 * Math.sin(th) * Math.cos(ph)); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false }))); }

    // বাঁকা ভূতুড়ে গাছ, কুমড়ো, কবর
    for (let i = 0; i < 130; i++) {
      const x = rnd(300), z = rnd(300); if (Math.hypot(x, z) < 14) continue;
      const g = new THREE.Group(), t = toon(new THREE.CylinderGeometry(0.25, 0.45, 3.4, 7), 0x5a3a2a);
      const l1 = toon(new THREE.ConeGeometry(1.8, 3, 7), 0x2f6b3a), l2 = toon(new THREE.ConeGeometry(1.3, 2.4, 7), 0x3f8a4a);
      t.position.y = 1.7; l1.position.y = 4.2; l2.position.y = 5.7;
      g.add(t, l1, l2); g.position.set(x, 0, z); g.rotation.z = rnd(0.5); g.rotation.y = Math.random() * 6; g.scale.setScalar(0.8 + Math.random() * 0.9); scene.add(g);
    }
    for (let i = 0; i < 45; i++) {
      const g = new THREE.Group(), p = toon(new THREE.SphereGeometry(0.7, 12, 10), 0xff7a1a, 0x662200, 0.06), s = toon(new THREE.BoxGeometry(0.15, 0.3, 0.15), 0x3a9b3a);
      p.scale.y = 0.8; p.position.y = 0.55; s.position.y = 1.15; g.add(p, s);
      g.position.set(rnd(200), 0, rnd(200)); g.rotation.y = Math.random() * 6; scene.add(g);
    }
    for (let i = 0; i < 45; i++) {
      const g = new THREE.Group(), b = toon(new THREE.BoxGeometry(1, 1.1, 0.35), 0xcfc8e6), t = toon(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12), 0xcfc8e6);
      b.position.y = 0.55; t.rotation.x = Math.PI / 2; t.position.y = 1.1; g.add(b, t);
      g.position.set(rnd(170), 0, rnd(170)); g.rotation.set(0, rnd(1), rnd(0.3)); if (g.position.length() < 10) continue; scene.add(g);
    }

    // ---------- বাহন ----------
    const wheel = (r: number, w: number) => { const m = toon(new THREE.CylinderGeometry(r, r, w, 14), 0x222222, 0, 0.12); m.rotation.z = Math.PI / 2; return m; };
    const mkCar = () => { const g = new THREE.Group();
      const b = toon(new THREE.BoxGeometry(2.1, 0.8, 4.2), 0xff3b5c), c = toon(new THREE.BoxGeometry(1.7, 0.7, 2), 0x9be7ff);
      b.position.y = 0.8; c.position.set(0, 1.5, 0.2); g.add(b, c);
      ([[-1.1, 1.4], [1.1, 1.4], [-1.1, -1.4], [1.1, -1.4]] as const).forEach(([x, z]) => { const w = wheel(0.5, 0.35); w.position.set(x, 0.5, z); g.add(w); });
      [-0.7, 0.7].forEach(x => { const h = toon(new THREE.SphereGeometry(0.2, 8, 8), 0xffff88, 0xffff88); h.position.set(x, 0.9, -2.15); g.add(h); }); return g; };
    const mkMoto = () => { const g = new THREE.Group();
      const b = toon(new THREE.BoxGeometry(0.45, 0.5, 1.7), 0x4d79ff), t = toon(new THREE.SphereGeometry(0.35, 10, 10), 0xffd23f), h = toon(new THREE.BoxGeometry(1.1, 0.1, 0.1), 0xdddddd);
      b.position.y = 0.8; t.position.set(0, 1.15, -0.2); h.position.set(0, 1.3, -0.7);
      const w1 = wheel(0.45, 0.2), w2 = wheel(0.45, 0.2); w1.position.set(0, 0.45, -0.95); w2.position.set(0, 0.45, 0.95); g.add(b, t, h, w1, w2); return g; };
    const mkBike = () => { const g = new THREE.Group();
      const fr = toon(new THREE.BoxGeometry(0.1, 0.1, 1.3), 0x7bff4f), h = toon(new THREE.BoxGeometry(0.8, 0.08, 0.08), 0xdddddd), s = toon(new THREE.BoxGeometry(0.25, 0.1, 0.35), 0x222222);
      fr.position.y = 0.85; h.position.set(0, 1.2, -0.65); s.position.set(0, 1.05, 0.45); g.add(fr, h, s);
      [-0.7, 0.7].forEach(z => { const w = toon(new THREE.TorusGeometry(0.45, 0.07, 8, 18), 0x222222, 0, 0.1); w.rotation.y = Math.PI / 2; w.position.set(0, 0.5, z); g.add(w); }); return g; };
    const vehicles: Veh[] = [
      { name: 'গাড়ি', spd: 28, r: 2.5, h: 2.8, d: 6.5, mesh: mkCar(), p: [7, -7] },
      { name: 'মোটরসাইকেল', spd: 20, r: 1.9, h: 2.3, d: 4.5, mesh: mkMoto(), p: [-7, -7] },
      { name: 'সাইকেল', spd: 10, r: 1.5, h: 2.1, d: 3.6, mesh: mkBike(), p: [0, -12] },
    ];
    const resetVeh = () => vehicles.forEach(v => { v.mesh.position.set(v.p[0], 0, v.p[1]); v.mesh.rotation.y = 0; });
    vehicles.forEach(v => scene.add(v.mesh)); resetVeh();

    // ---------- বন্দুক (স্লাইম ব্লাস্টার) ----------
    const gun = new THREE.Group();
    const gb = toon(new THREE.BoxGeometry(0.14, 0.2, 0.55), 0x7bff4f, 0x1a5a0a, 0.1), gbar = toon(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 10), 0xc77dff, 0, 0.1), gh = toon(new THREE.BoxGeometry(0.1, 0.24, 0.14), 0x333333, 0, 0.1);
    gbar.rotation.x = Math.PI / 2; gbar.position.set(0, 0.03, -0.45); gh.position.set(0, -0.2, 0.12); gh.rotation.x = 0.2;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffb62e }));
    flash.position.set(0, 0.03, -0.72); flash.visible = false;
    gun.add(gb, gbar, gh, flash); gun.position.set(0.28, -0.25, -0.55); cam.add(gun);

    // ---------- কার্টুন ভূত ----------
    const COLS = [0x8bff5a, 0xc77dff, 0xff9e3d, 0x7be7ff];
    function mkGhost(): Ghost {
      const m = new THREE.Group(), col = COLS[Math.floor(Math.random() * COLS.length)];
      const body = toon(new THREE.SphereGeometry(0.75, 16, 14), col, 0x222222, 0.08); body.scale.y = 1.2; body.position.y = 1.1;
      const mat = body.material as THREE.MeshToonMaterial; m.add(body);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.28, s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat); s.position.set(Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5); m.add(s); }
      [-1, 1].forEach(sx => {
        const e = toon(new THREE.SphereGeometry(0.24, 12, 12), 0xffffff, 0x444444, 0.1), p = toon(new THREE.SphereGeometry(0.11, 8, 8), 0x110011, 0, 0.1);
        e.position.set(sx * 0.27, 1.4, 0.55); p.position.set(sx * 0.27, 1.4, 0.77);
        const arm = toon(new THREE.SphereGeometry(0.2, 8, 8), col, 0x222222, 0.1); arm.position.set(sx * 0.85, 1, 0.1);
        m.add(e, p, arm);
      });
      const mouth = toon(new THREE.SphereGeometry(0.25, 10, 8), 0x330010, 0, 0.08); mouth.scale.set(1.2, 0.8, 0.4); mouth.position.set(0, 0.95, 0.68); m.add(mouth);
      [-0.12, 0.12].forEach(x => { const t = toon(new THREE.ConeGeometry(0.06, 0.16, 6), 0xffffff, 0x666666, 0.1); t.rotation.x = Math.PI; t.position.set(x, 1.05, 0.78); m.add(t); });
      const g: Ghost = { m, mat, hp: D.hp, hit: 0, ph: Math.random() * 6, sp: D.speed * (1 + 0.07 * (level - 1)) * (0.8 + Math.random() * 0.5) };
      m.traverse(o => { o.userData.g = g; }); return g;
    }
    const spawn = () => { const a = Math.random() * 6.28, r = 38 + Math.random() * 10, g = mkGhost(); g.m.position.set(P.x + Math.cos(a) * r, 1, P.z + Math.sin(a) * r); scene.add(g.m); ghosts.push(g); };
    function poof(pos: THREE.Vector3) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
      m.position.copy(pos); m.position.y = 1.2; scene.add(m); puffs.push({ m, t: 0 });
    }
    function kill(g: Ghost) {
      poof(g.m.position); scene.remove(g.m); const i = ghosts.indexOf(g); if (i > -1) ghosts.splice(i, 1);
      kills++; score += 10 * D.m; sfx(500, 0.2);
      if (kills % 10 === 0) { level++; health = Math.min(100, health + 25); setBanner('লেভেল ' + level + '!'); clearTimeout(bt); bt = setTimeout(() => setBanner(''), 1600); }
    }

    // ---------- শব্দ ----------
    let ac: AudioContext | undefined;
    function sfx(f: number, d: number) { try { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = 'square'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(40, t + d);
      g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d); } catch {} }

    // ---------- ইনপুট ----------
    function toggleRide() {
      if (ride) { P.x += Math.cos(yaw) * 2.5; P.z += -Math.sin(yaw) * 2.5; ride = null; return; }
      let best: Veh | null = null, bd = 5;
      vehicles.forEach(v => { const d = Math.hypot(v.mesh.position.x - P.x, v.mesh.position.z - P.z); if (d < bd) { bd = d; best = v; } });
      if (best) { ride = best; P.x = (best as Veh).mesh.position.x; P.z = (best as Veh).mesh.position.z; }
    }
    function reload() { if (reloading || ammo === 30) return; reloading = true; sfx(120, 0.3); setTimeout(() => { ammo = 30; reloading = false; }, 1200); }
    function shoot() {
      if (reloading) return; if (ammo <= 0) { reload(); return; }
      ammo--; nextShot = performance.now() + 130; sfx(260, 0.09);
      flash.visible = true; setTimeout(() => { flash.visible = false; }, 40);
      const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(0, 0), cam);
      const hits = ray.intersectObjects(ghosts.map(g => g.m), true);
      let end = ray.ray.at(60, new THREE.Vector3());
      if (hits.length) { end = hits[0].point; const g = hits[0].object.userData.g as Ghost | undefined; if (g) { g.hp--; g.hit = 0.12; if (g.hp <= 0) kill(g); } }
      const s = new THREE.Vector3(); flash.getWorldPosition(s);
      const geo = new THREE.BufferGeometry().setFromPoints([s, end]), ln = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfff066 }));
      scene.add(ln); setTimeout(() => { scene.remove(ln); geo.dispose(); }, 50);
    }
    const onKD = (e: KeyboardEvent) => { keys[e.code] = true; if (!running || paused) return; if (e.code === 'KeyE') toggleRide(); if (e.code === 'KeyR') reload(); };
    const onKU = (e: KeyboardEvent) => { keys[e.code] = false; };
    const onMM = (e: MouseEvent) => { if (document.pointerLockElement) { yaw -= e.movementX * 0.0022; pitch = clamp(pitch - e.movementY * 0.0022, -1.3, 1.3); } };
    const onMD = () => { if (document.pointerLockElement) firing = true; };
    const onMU = () => { firing = false; };
    const onPL = () => { if (!document.pointerLockElement && running) { paused = true; firing = false; setScreen('pause'); } };
    addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('mousemove', onMM);
    addEventListener('mousedown', onMD); addEventListener('mouseup', onMU); document.addEventListener('pointerlockchange', onPL);

    api.current.start = (k: string) => {
      D = DIFFS[k]; score = 0; level = 1; kills = 0; health = 100; ammo = 30; reloading = false;
      ghosts.forEach(g => scene.remove(g.m)); ghosts.length = 0; ride = null; resetVeh(); P.set(0, 0, 0); yaw = 0; pitch = 0; spawnT = 1;
      running = true; paused = false; setScreen('play'); ren.domElement.requestPointerLock();
    };
    api.current.resume = () => { paused = false; setScreen('play'); ren.domElement.requestPointerLock(); };
    const gameOver = () => { running = false; document.exitPointerLock(); setFin({ score, level, kills }); setScreen('over'); };

    // ---------- আপডেট ----------
    function update(dt: number, t: number) {
      const sp = ride ? ride.spd : keys.ShiftLeft ? 9 : 6;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), r = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const mx = fx * f + rx * r, mz = fz * f + rz * r, l = Math.hypot(mx, mz); moving = l > 0;
      if (l) { P.x = clamp(P.x + (mx / l) * sp * dt, -140, 140); P.z = clamp(P.z + (mz / l) * sp * dt, -140, 140); }
      if (ride) { ride.mesh.position.set(P.x, 0, P.z); ride.mesh.rotation.y = yaw; cam.position.set(P.x + Math.sin(yaw) * ride.d, ride.h, P.z + Math.cos(yaw) * ride.d); }
      else cam.position.set(P.x, 1.7 + (moving ? Math.sin(t * 0.012) * 0.05 : 0), P.z);
      cam.rotation.set(pitch, yaw, 0, 'YXZ');
      moon.position.set(P.x + 40, 80, P.z - 60); moon.target.position.set(P.x, 0, P.z);
      if (firing && performance.now() > nextShot) shoot();

      spawnT -= dt;
      if (spawnT <= 0 && ghosts.length < Math.min(40, D.max + level * 2)) { spawn(); spawnT = Math.max(0.3, D.rate - level * 0.08); }
      for (let i = ghosts.length - 1; i >= 0; i--) {
        const g = ghosts[i], p = g.m.position, dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz);
        if (ride && moving && d < ride.r) { kill(g); continue; }
        if (d > 1.1) { p.x += (dx / d) * g.sp * dt; p.z += (dz / d) * g.sp * dt; }
        p.y = 0.4 + Math.abs(Math.sin(t * 0.004 + g.ph)) * 0.6;           // লাফিয়ে লাফিয়ে আসে
        g.m.scale.set(1 + Math.sin(t * 0.008 + g.ph) * 0.06, 1 - Math.sin(t * 0.008 + g.ph) * 0.06, 1);
        g.m.lookAt(P.x, p.y, P.z);
        if (g.hit > 0) g.hit -= dt; g.mat.emissive.setHex(g.hit > 0 ? 0xff2222 : 0x222222);
        if (d < 1.5) { health -= D.dmg * dt; if (Math.random() < 0.1) sfx(90, 0.1); }
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const q = puffs[i]; q.t += dt * 3; q.m.scale.setScalar(1 + q.t * 2); (q.m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - q.t);
        if (q.t > 0.9) { scene.remove(q.m); puffs.splice(i, 1); }
      }
      if (health <= 0) { health = 0; gameOver(); }

      hudT += dt;
      if (hudT > 0.1) {
        hudT = 0; let near: Veh | null = null;
        if (!ride) vehicles.forEach(v => { if (Math.hypot(v.mesh.position.x - P.x, v.mesh.position.z - P.z) < 5) near = v; });
        const nv = near as Veh | null;
        setHud({ score, level, kills, hp: health, ammo, reload: reloading, veh: ride ? ride.name : 'পায়ে হেঁটে', diff: D.n,
          hint: ride ? 'E চাপো — নামতে' : nv ? 'E চাপো — ' + nv.name + ' চালাতে' : '' });
      }
    }
    let last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (running && !paused) update(dt, t); else { cam.position.set(0, 2.5, 8); cam.rotation.set(-0.1, Math.sin(t * 0.0002) * 0.5, 0, 'YXZ'); }
      ren.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(bt);
      removeEventListener('resize', onResize); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU);
      removeEventListener('mousemove', onMM); removeEventListener('mousedown', onMD); removeEventListener('mouseup', onMU);
      document.removeEventListener('pointerlockchange', onPL); document.exitPointerLock?.();
      ren.dispose(); el.removeChild(ren.domElement);
    };
  }, []);

  const S = {
    hud: { position: 'fixed', top: 0, left: 0, right: 0, padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontWeight: 800, fontSize: 16, color: '#fff', textShadow: '2px 2px 0 #0a0510', pointerEvents: 'none' } as React.CSSProperties,
    center: { position: 'fixed', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', color: '#fff', textShadow: '3px 3px 0 #0a0510' } as React.CSSProperties,
    menu: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20, textAlign: 'center', color: '#fff', background: 'radial-gradient(circle at 50% 30%, #4b2a7bdd, #0a0510f2)' } as React.CSSProperties,
  };
  const btn = (bg: string): React.CSSProperties => ({ font: 'inherit', fontSize: 20, fontWeight: 800, minWidth: 240, padding: '12px 28px', background: bg, color: '#0a0510', border: '4px solid #0a0510', borderRadius: 16, boxShadow: '5px 5px 0 #0a0510', cursor: 'pointer' });

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#1a0f2e', overflow: 'hidden', fontFamily: 'system-ui, "Noto Sans Bengali", sans-serif' }}>
      <div ref={mount} />
      {screen === 'play' && (
        <>
          <div style={S.hud}>
            <span>⭐ স্কোর: {hud.score}</span><span>🎃 লেভেল: {hud.level} ({hud.diff})</span><span>👻 মারা: {hud.kills}</span>
            <span>🚗 {hud.veh}</span><span>🔫 {hud.reload ? 'রিলোড...' : hud.ammo + '/30'}</span>
          </div>
          <div style={{ position: 'fixed', left: '50%', top: '50%', width: 16, height: 16, margin: -8, border: '3px solid #7bff4f', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', left: 16, bottom: 16, width: 240, height: 22, background: '#0a0510', border: '4px solid #0a0510', borderRadius: 12, overflow: 'hidden', boxShadow: '3px 3px 0 #0a0510' }}>
            <div style={{ height: '100%', width: hud.hp + '%', background: hud.hp > 35 ? '#7bff4f' : '#ff4d6d', transition: 'width .1s' }} />
          </div>
          <div style={{ ...S.center, bottom: 70, fontSize: 20, fontWeight: 800 }}>{hud.hint}</div>
          {banner && <div className={creep.className} style={{ ...S.center, top: '28%', fontSize: 72, color: '#ffd23f' }}>{banner}</div>}
        </>
      )}
      {screen !== 'play' && (
        <div style={S.menu}>
          <h1 className={creep.className} style={{ margin: 0, fontSize: 64, color: '#ff7a1a', textShadow: '4px 4px 0 #0a0510', fontWeight: 400 }}>
            {screen === 'over' ? '💀 খেলা শেষ!' : '👻 ভূত শিকারি'}
          </h1>
          {screen === 'over' ? (
            <p style={{ margin: 0, fontSize: 20 }}>স্কোর <b>{fin.score}</b> · লেভেল <b>{fin.level}</b> · মারা ভূত <b>{fin.kills}</b></p>
          ) : (
            <p style={{ margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
              কার্টুন ভূতেরা তোমাকে খেতে আসছে! গুলি করো, আর গাড়ি-মোটরসাইকেল-সাইকেল চালিয়ে পিষে দাও।<br />
              <b>W A S D</b> চলা · <b>মাউস</b> ঘোরা · <b>ক্লিক</b> গুলি · <b>R</b> রিলোড · <b>E</b> বাহনে ওঠা/নামা · <b>Shift</b> দৌড়
            </p>
          )}
          {screen === 'pause' && <button style={btn('#ffd23f')} onClick={() => api.current.resume()}>▶ চালিয়ে যাও</button>}
          {Object.entries(DIFFS).map(([k, d]) => (
            <button key={k} style={btn(d.color)} onClick={() => api.current.start(k)}>{d.n}</button>
          ))}
        </div>
      )}
    </main>
  );
}


