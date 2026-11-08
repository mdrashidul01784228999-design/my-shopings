'use client';
// ইনস্টল: npm i three @types/three   |   ফাইল: app/page.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Phase = 'menu' | 'play' | 'level' | 'over';
type Col = [number, number, number, number]; // minX, maxX, minZ, maxZ

export default function Page() {
  const mountRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joy = useRef({ x: 0, y: 0 });
  const api = useRef<(lv: number, resume?: boolean) => void>(() => {});
  const snd = useRef({ init: () => {}, mute: (_b: boolean) => {} });
  const jumpReq = useRef(false);
  const [phase, setPhase] = useState<Phase>('menu');
  const [hud, setHud] = useState({ score: 0, level: 1, left: 0, time: 0 });
  const [save, setSave] = useState({ coins: 0, best: 0, maxLevel: 1, score: 0, muted: false });
  const [pop, setPop] = useState({ id: 0, text: '', color: '#ffd166' });
  const saveRef = useRef(save);

  useEffect(() => {
    const el = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f2b98f');
    scene.fog = new THREE.Fog('#f2b98f', 45, 150);
    const cam = new THREE.PerspectiveCamera(58, el.clientWidth / el.clientHeight, 0.1, 300);
    cam.position.set(0, 10, 26);
    scene.add(new THREE.HemisphereLight('#ffe9d2', '#4b5d6b', 1.05));
    const sun = new THREE.DirectionalLight('#ffd9a8', 1.7);
    sun.position.set(30, 70, 0);
    sun.target.position.set(0, 0, -20);
    scene.add(sun, sun.target);
    sun.castShadow = true;
    sun.shadow.mapSize.set(window.innerWidth < 700 ? 1024 : 2048, window.innerWidth < 700 ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -75, right: 75, top: 75, bottom: -75, far: 220 });
    sun.shadow.camera.updateProjectionMatrix();

    // ---------- helpers ----------
    const M = (c: string, o: THREE.MeshStandardMaterialParameters = {}) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
    const box = (w: number, h: number, d: number, c: THREE.Material | string,
      x: number, y: number, z: number, p: THREE.Object3D = scene) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'string' ? M(c) : c);
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      p.add(m);
      return m;
    };
    const cols: Col[] = [];
    const blocked = (x: number, z: number, r: number) =>
      cols.some(c => x > c[0] - r && x < c[1] + r && z > c[2] - r && z < c[3] + r);
    const groundH = (x: number, z: number) => {
      if (Math.abs(x - 20) < 2.5) {
        const a = Math.abs(z);
        if (a < 8) return 4.5;
        if (a < 16) return (4.5 * (16 - a)) / 8;
      }
      return 0;
    };
    const label = (txt: string, bg: string) => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 64;
      const x = c.getContext('2d')!;
      x.fillStyle = bg; x.fillRect(0, 0, 256, 64);
      x.fillStyle = '#fff'; x.font = 'bold 34px sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(txt, 128, 34);
      return new THREE.CanvasTexture(c);
    };
    const windows = (h: number) => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const x = c.getContext('2d')!;
      x.fillStyle = '#2a3350'; x.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        x.fillStyle = Math.random() > 0.45 ? '#ffd98a' : '#3d4a6e';
        x.fillRect(i * 16 + 3, j * 16 + 3, 10, 10);
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, h / 4);
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
    };

    // ---------- world ----------
    box(170, 1, 92, '#78b97c', 0, -0.5, 14);          // main land
    box(170, 1, 60, '#78b97c', 0, -0.5, -74);         // far bank
    box(170, 0.2, 12, '#2f80ed', 0, -0.6, -38);       // river
    box(170, 0.2, 12, '#173a63', 0, -1.4, -38);
    box(170, 0.06, 8, '#2b2f3a', 0, 0.03, 0);         // main road
    box(8, 0.06, 92, '#2b2f3a', 0, 0.035, 14);        // cross road
    for (let i = -80; i <= 80; i += 6) {
      box(2.5, 0.02, 0.25, '#f5f5f5', i, 0.08, 0);
      if (i > -30 && i < 58) box(0.25, 0.02, 2.5, '#f5f5f5', 0, 0.085, i + 2);
    }
    [-5, 5].forEach(z => box(170, 0.08, 2, '#bfc4cc', 0, 0.04, z));

    // river bridge
    box(8, 0.6, 12, '#8b8f98', 0, -0.3, -38);
    [-4, 4].forEach(x => box(0.3, 1, 12, '#e2e8f0', x, 0.5, -38));
    [-3, 3].forEach(x => box(1, 2.4, 1, '#6b7280', x, -1.2, -38));
    cols.push([4.2, 100, -44, -32], [-100, -4.2, -44, -32]);

    // shops
    const names = ['Cafe', 'Books', 'Pizza', 'Tech', 'Bakery', 'Fashion', 'Toys', 'Gym', 'Market'];
    const pal = ['#e4572e', '#17a398', '#f3a712', '#7b61ff', '#e83f6f', '#2e86ab'];
    let n = 0;
    [-54, -42, -30, -18, -9, 9, 31, 43, 55].forEach(x => [-1, 1].forEach(s => {
      const h = 5 + ((n * 7) % 4), c = pal[n % pal.length], z = s * 12;
      box(9, h, 8, '#efe6d8', x, h / 2, z);
      box(9.4, 0.5, 8.4, c, x, h + 0.25, z);
      box(7, 2.6, 0.2, M('#9ad7ff', { roughness: 0.2, metalness: 0.4 }), x, 1.8, s * 7.95);
      box(9, 0.35, 2, c, x, 3.6, s * 7);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5),
        new THREE.MeshBasicMaterial({ map: label(names[n % names.length], c) }));
      sg.position.set(x, 4.6, s * 7.9);
      sg.rotation.y = s > 0 ? Math.PI : 0;
      scene.add(sg);
      cols.push([x - 4.5, x + 4.5, s > 0 ? 8 : -16, s > 0 ? 16 : -8]);
      n++;
    }));

    // towers behind shops
    [-56, -42, -28, -14, 14, 32, 46, 60].forEach((x, i) => [-1, 1].forEach(s => {
      const h = 14 + ((i * 5 + (s > 0 ? 2 : 0)) % 4) * 5;
      box(10, h, 10, windows(h), x, h / 2, s * 25);
      cols.push([x - 5, x + 5, s * 25 - 5, s * 25 + 5]);
    }));

    // overbridge (x = 20)
    box(5, 0.4, 16, '#9ca3af', 20, 4.3, 0);
    [-2.4, 2.4].forEach(dx => box(0.2, 1, 16, '#f8fafc', 20 + dx, 5, 0));
    const ang = Math.atan2(4.5, 8);
    [-1, 1].forEach(s => {
      const g = new THREE.Group();
      g.position.set(20, 2.25, s * 12);
      g.rotation.x = s * ang;
      box(5, 0.4, 9.2, '#9ca3af', 0, -0.2, 0, g);
      [-2.4, 2.4].forEach(dx => box(0.2, 1, 9.2, '#f8fafc', dx, 0.5, 0, g));
      scene.add(g);
      [17.8, 22.2].forEach(px => box(0.8, 4.2, 0.8, '#6b7280', px, 2.1, s * 6));
    });
    cols.push([17.3, 17.7, -16, 16], [22.3, 22.7, -16, 16]);

    // lamps & trees
    for (let x = -60; x <= 60; x += 12) {
      if (Math.abs(x - 20) < 5) continue;
      [-5, 5].forEach(z => {
        box(0.2, 4, 0.2, '#374151', x, 2, z);
        box(0.6, 0.4, 0.6, M('#ffe08a', { emissive: '#ffd166', emissiveIntensity: 1 }), x, 4.2, z);
      });
    }
    const trunk = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 6);
    const crown = new THREE.ConeGeometry(1.6, 4, 8);
    for (let i = 0; i < 46; i++) {
      const x = (Math.random() - 0.5) * 150;
      const z = i % 2 ? 34 + Math.random() * 20 : -64 - Math.random() * 26;
      const t = new THREE.Mesh(trunk, M('#6b4a2f')); t.position.set(x, 0.8, z);
      const c = new THREE.Mesh(crown, M('#2f8f5b')); c.position.set(x, 3.4, z);
      scene.add(t, c);
    }

    // ---------- hero (3D human) ----------
    const hero = new THREE.Group();
    const skin = M('#f1c27d'), shirt = M('#4f6df5'), pants = M('#1f2937'), hair = M('#2b1b12');
    const part = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D) => {
      const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o;
    };
    part(new THREE.BoxGeometry(0.75, 0.95, 0.42), shirt, 0, 1.4, 0, hero);
    part(new THREE.SphereGeometry(0.3, 20, 16), skin, 0, 2.17, 0, hero);
    const hr = part(new THREE.SphereGeometry(0.32, 20, 12), hair, 0, 2.3, -0.04, hero); hr.scale.y = 0.65;
    [-0.11, 0.11].forEach(x => part(new THREE.SphereGeometry(0.04, 8, 8), M('#111'), x, 2.2, 0.27, hero));
    const limb = (x: number, y: number, w: number, len: number, m: THREE.Material, tip?: THREE.Material) => {
      const p = new THREE.Group(); p.position.set(x, y, 0);
      part(new THREE.BoxGeometry(w, len, w), m, 0, -len / 2, 0, p);
      if (tip) part(new THREE.BoxGeometry(w * 1.02, len * 0.3, w * 1.02), tip, 0, -len * 0.85, 0, p);
      hero.add(p); return p;
    };
    const armL = limb(-0.52, 1.82, 0.22, 0.85, shirt, skin), armR = limb(0.52, 1.82, 0.22, 0.85, shirt, skin);
    const legL = limb(-0.2, 0.92, 0.3, 0.92, pants), legR = limb(0.2, 0.92, 0.3, 0.92, pants);
    scene.add(hero);

    // ---------- game state ----------
    const g = { play: false, t: 0, score: 0, base: 0, level: 1, x: 0, y: 0, z: 14, walk: 0, amp: 0, acc: 0 };
    let coins: { m: THREE.Group; p: number; ph: number; y: number }[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24);
    const push = () => setHud({ score: g.score, level: g.level, left: coins.length, time: Math.max(0, Math.ceil(g.t)) });

    api.current = (lv: number) => {
      if (lv === 1) g.base = 0;
      g.score = g.base; g.level = lv; g.x = 0; g.z = 14; g.y = 0;
      coins.forEach(c => scene.remove(c.m)); coins = [];
      const count = 8 + lv * 4;
      for (let i = 0; i < count; i++) {
        let x = 0, z = 0, p = 10, col = '#ffc400';
        if (i < 2) { x = (Math.random() - 0.5) * 4; z = -33 - Math.random() * 10; p = 15; col = '#ff6fae'; }
        else if (i < 5) { x = 20 + (Math.random() - 0.5) * 2; z = (Math.random() - 0.5) * 12; p = 25; col = '#35e0ff'; }
        else do { x = (Math.random() - 0.5) * 120; z = -60 + Math.random() * 90; }
        while (blocked(x, z, 1.2) || (Math.abs(x - 20) < 3.5 && Math.abs(z) < 17));
        const m = new THREE.Group();
        const d = new THREE.Mesh(coinGeo, M(col, { emissive: col, emissiveIntensity: 0.55, metalness: 0.6, roughness: 0.3 }));
        d.rotation.x = Math.PI / 2; d.castShadow = true; m.add(d);
        const y = groundH(x, z) + 1.2;
        m.position.set(x, y, z); scene.add(m);
        coins.push({ m, p, ph: Math.random() * 6, y });
      }
      g.t = Math.max(40, 30 + count * 4 - lv * 6);
      g.play = true; push(); setPhase('play');
    };

    // ---------- input ----------
    const keys = new Set<string>();
    const kd = (e: KeyboardEvent) => { keys.add(e.key.toLowerCase()); if (e.key.startsWith('Arrow')) e.preventDefault(); };
    const ku = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ---------- loop ----------
    const clock = new THREE.Clock();
    let raf = 0, amp = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05), tt = clock.elapsedTime;
      let ix = joy.current.x + (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
      let iz = joy.current.y + (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
      const m = Math.hypot(ix, iz);
      if (m > 1) { ix /= m; iz /= m; }
      const moving = g.play && m > 0.08;
      if (moving) {
        const sp = (keys.has('shift') ? 13 : 9) * dt;
        const nx = g.x + ix * sp; if (!blocked(nx, g.z, 0.5)) g.x = THREE.MathUtils.clamp(nx, -76, 76);
        const nz = g.z + iz * sp; if (!blocked(g.x, nz, 0.5)) g.z = THREE.MathUtils.clamp(nz, -92, 57);
        let d = Math.atan2(ix, iz) - hero.rotation.y;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        hero.rotation.y += d * Math.min(1, dt * 12);
        g.walk += dt * 12;
      }
      amp += ((moving ? 1 : 0) - amp) * Math.min(1, dt * 10);
      const sw = Math.sin(g.walk) * 0.9 * amp;
      armL.rotation.x = sw; armR.rotation.x = -sw; legL.rotation.x = -sw; legR.rotation.x = sw;
      g.y += (groundH(g.x, g.z) - g.y) * Math.min(1, dt * 14);
      hero.position.set(g.x, g.y + Math.abs(Math.sin(g.walk)) * 0.08 * amp, g.z);

      coins.forEach(c => { c.m.rotation.y = tt * 2.5 + c.ph; c.m.position.y = c.y + Math.sin(tt * 2 + c.ph) * 0.2; });
      if (g.play) {
        const before = coins.length;
        coins = coins.filter(c => {
          const hit = Math.hypot(c.m.position.x - g.x, c.m.position.z - g.z) < 1.3 && Math.abs(c.y - 1.2 - g.y) < 2;
          if (hit) { scene.remove(c.m); g.score += c.p; }
          return !hit;
        });
        g.t -= dt; g.acc += dt;
        if (coins.length === 0) {
          g.score += Math.ceil(g.t) * 2; g.base = g.score; g.play = false; push(); setPhase('level');
        } else if (g.t <= 0) {
          g.t = 0; g.play = false; push(); setPhase('over');
        } else if (before !== coins.length || g.acc > 0.25) { g.acc = 0; push(); }
      }
      const off = cam.aspect < 1 ? [0, 14, 16] : [0, 10, 12];
      cam.position.lerp(new THREE.Vector3(g.x + off[0], g.y + off[1], g.z + off[2]), Math.min(1, dt * 5));
      cam.lookAt(g.x, g.y + 1.2, g.z);
      renderer.render(scene, cam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      window.removeEventListener('resize', onResize);
      renderer.dispose(); el.removeChild(renderer.domElement);
    };
  }, []);

  // ---------- joystick ----------
  const moveJoy = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const max = r.width / 2, m = Math.hypot(dx, dy), k = Math.min(m, max) / Math.max(m, 1);
    joy.current = { x: (dx * k) / max, y: (dy * k) / max };
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
  };
  const endJoy = () => {
    joy.current = { x: 0, y: 0 };
    if (knobRef.current) knobRef.current.style.transform = 'translate(0,0)';
  };

  return (
    <main className="cg-root">
      <style>{css}</style>
      <div ref={mountRef} className="cg-canvas" />

      {phase === 'play' && (
        <>
          <div className="cg-hud">
            <div className="cg-chip"><span>স্কোর</span><b>{hud.score}</b></div>
            <div className="cg-chip"><span>লেভেল</span><b>{hud.level}</b></div>
            <div className="cg-chip"><span>কয়েন বাকি</span><b>{hud.left}</b></div>
            <div className={`cg-chip ${hud.time <= 10 ? 'cg-warn' : ''}`}><span>সময়</span><b>{hud.time}s</b></div>
          </div>
          <div className="cg-tip">ওভারব্রিজের উপরের নীল কয়েনে ২৫ পয়েন্ট, নদীর ব্রিজে ১৫ পয়েন্ট</div>
          <div className="cg-joy" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); moveJoy(e); }}
            onPointerMove={e => e.buttons && moveJoy(e)} onPointerUp={endJoy} onPointerCancel={endJoy}>
            <div className="cg-knob" ref={knobRef} />
          </div>
        </>
      )}

      {phase !== 'play' && (
        <div className="cg-overlay">
          <div className="cg-card">
            {phase === 'menu' && (<>
              <h1>নিও সিটি</h1>
              <p>রাস্তা, দোকান, নদীর ব্রিজ আর ওভারব্রিজ ঘুরে সময় শেষ হওয়ার আগে সব কয়েন কুড়াও।</p>
              <p className="cg-hint">কম্পিউটারে W A S D বা তীর চিহ্ন, Shift চাপলে দৌড়। মোবাইলে নিচের জয়স্টিক।</p>
              <button onClick={() => api.current(1)}>খেলা শুরু করো</button>
            </>)}
            {phase === 'level' && (<>
              <h2>লেভেল {hud.level} শেষ</h2>
              <div className="cg-big">{hud.score}</div>
              <p>বাকি সময়ের জন্য বোনাস যোগ হয়েছে।</p>
              <button onClick={() => api.current(hud.level + 1)}>লেভেল {hud.level + 1} শুরু করো</button>
            </>)}
            {phase === 'over' && (<>
              <h2>সময় শেষ</h2>
              <div className="cg-big">{hud.score}</div>
              <p>লেভেল {hud.level} এ {hud.left}টি কয়েন বাকি ছিল।</p>
              <button onClick={() => api.current(hud.level)}>এই লেভেল আবার খেলো</button>
              <button className="cg-ghost" onClick={() => api.current(1)}>প্রথম থেকে শুরু</button>
            </>)}
          </div>
        </div>
      )}
    </main>
  );
}

const css = `
.cg-root{position:fixed;inset:0;overflow:hidden;background:#f2b98f;color:#fff6e8;
  font-family:"Hind Siliguri","Noto Sans Bengali",system-ui,sans-serif;touch-action:none;user-select:none}
.cg-canvas{position:absolute;inset:0}
.cg-canvas canvas{display:block;width:100%;height:100%}
.cg-hud{position:absolute;top:max(12px,env(safe-area-inset-top));left:12px;right:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.cg-chip{min-width:78px;padding:8px 14px;border-radius:14px;background:rgba(22,18,40,.62);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,214,140,.28);
  display:flex;flex-direction:column;align-items:center;line-height:1.15}
.cg-chip span{font-size:11px;opacity:.75}
.cg-chip b{font-size:20px;font-weight:700;color:#ffd166;font-variant-numeric:tabular-nums}
.cg-warn b{color:#ff6b6b}
.cg-tip{position:absolute;top:calc(max(12px,env(safe-area-inset-top)) + 70px);left:50%;transform:translateX(-50%);
  max-width:90vw;text-align:center;font-size:12px;padding:6px 12px;border-radius:999px;background:rgba(22,18,40,.45)}
.cg-joy{position:absolute;left:max(20px,env(safe-area-inset-left));bottom:max(24px,env(safe-area-inset-bottom));
  width:132px;height:132px;border-radius:50%;background:rgba(22,18,40,.45);border:1.5px solid rgba(255,214,140,.4);
  backdrop-filter:blur(8px);display:grid;place-items:center}
.cg-knob{width:56px;height:56px;border-radius:50%;background:linear-gradient(160deg,#ffe29a,#f5a524);
  box-shadow:0 4px 14px rgba(0,0,0,.35);transition:transform .04s linear}
.cg-overlay{position:absolute;inset:0;display:grid;place-items:center;padding:20px;
  background:radial-gradient(circle at 50% 30%,rgba(20,16,44,.55),rgba(10,8,26,.85))}
.cg-card{width:min(440px,100%);padding:32px 28px;border-radius:26px;text-align:center;
  background:linear-gradient(160deg,rgba(40,32,78,.88),rgba(18,14,40,.92));
  border:1px solid rgba(255,214,140,.35);box-shadow:0 30px 80px rgba(0,0,0,.5)}
.cg-card h1{margin:0 0 10px;font-size:clamp(40px,10vw,56px);font-weight:800;line-height:1.1;
  background:linear-gradient(90deg,#ffe29a,#ff9a62);-webkit-background-clip:text;background-clip:text;color:transparent}
.cg-card h2{margin:0 0 6px;font-size:28px;color:#ffd166}
.cg-card p{margin:0 0 12px;line-height:1.7;font-size:16px;opacity:.92}
.cg-hint{font-size:13px!important;opacity:.7!important}
.cg-big{font-size:64px;font-weight:800;color:#ffd166;margin:4px 0 8px;font-variant-numeric:tabular-nums}
.cg-card button{display:block;width:100%;margin-top:10px;padding:15px 18px;border:0;border-radius:16px;cursor:pointer;
  font:700 18px inherit;font-family:inherit;color:#2a1a05;background:linear-gradient(180deg,#ffe29a,#f5a524);
  box-shadow:0 8px 24px rgba(245,165,36,.35);transition:transform .15s}
.cg-card button:hover{transform:translateY(-2px)}
.cg-card button:focus-visible{outline:3px solid #fff;outline-offset:3px}
.cg-card .cg-ghost{background:transparent;color:#ffd166;border:1.5px solid rgba(255,214,140,.5);box-shadow:none}
@media (max-width:520px){.cg-chip{min-width:70px;padding:6px 10px}.cg-chip b{font-size:17px}.cg-joy{width:120px;height:120px}}
@media (prefers-reduced-motion:reduce){.cg-card button{transition:none}}
`;
