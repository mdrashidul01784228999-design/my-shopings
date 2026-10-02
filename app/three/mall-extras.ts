import * as THREE from 'three';

export type Profile = { name: string; photo: string };

/* ---------- local database (localStorage) ---------- */
export const DB_KEY = 'grand-mall-db-v1';
export const loadDB = <T,>(): T | null => {
  try { const s = localStorage.getItem(DB_KEY); return s ? (JSON.parse(s) as T) : null; } catch { return null; }
};
export const saveDB = (d: unknown) => {
  try { localStorage.setItem(DB_KEY, JSON.stringify(d)); return true; } catch { return false; }
};

/* shop plots along the walkway (x<0 = left side) */
export const SLOTS = [
  { x: -17, z: -5 }, { x: 17, z: -5 }, { x: -17, z: -25 }, { x: 17, z: -25 },
  { x: -17, z: -65 }, { x: 17, z: -65 }, { x: -17, z: -105 }, { x: 17, z: -105 },
];

/* photo upload -> small JPEG data URL (fits in localStorage) */
export const fileToDataUrl = (file: File, max = 640) =>
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

/* ---------- outdoor world: sky, street, cars, trees, birds ---------- */
export function addOutdoors(scene: THREE.Scene) {
  const std = (c: number, r = 0.5, m = 0.1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

  // sky dome
  const sc = document.createElement('canvas'); sc.width = 2; sc.height = 256;
  const sx = sc.getContext('2d')!;
  const sg = sx.createLinearGradient(0, 0, 0, 256);
  sg.addColorStop(0, '#1e3a8a'); sg.addColorStop(0.5, '#5b9bd5'); sg.addColorStop(0.85, '#fbd1a2'); sg.addColorStop(1, '#f59e6b');
  sx.fillStyle = sg; sx.fillRect(0, 0, 2, 256);
  const skyTex = new THREE.CanvasTexture(sc); skyTex.colorSpace = THREE.SRGBColorSpace;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(330, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })));

  // ground, sidewalk, road, lane dashes
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), std(0x1d2a22, 1, 0));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.03, -45); ground.receiveShadow = true;
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(300, 6), std(0x8a93a3, 0.8, 0));
  walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.01, 28); walk.receiveShadow = true;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(300, 16), std(0x20232b, 0.9, 0));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 39); road.receiveShadow = true;
  scene.add(ground, walk, road);
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 0.02, 0.2), new THREE.MeshBasicMaterial({ color: 0xf1f5f9 }), 50);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 50; i++) { m4.setPosition(-147 + i * 6, 0.03, 39); dashes.setMatrixAt(i, m4); }
  scene.add(dashes);

  // trees along both sides of the road
  const trunkG = new THREE.CylinderGeometry(0.25, 0.35, 3, 8), trunkM = std(0x5b3a1e, 0.9, 0);
  const leafG = new THREE.IcosahedronGeometry(1.6, 1), leafMs = [std(0x1f8a4c, 0.9, 0), std(0x2f9e44, 0.9, 0), std(0x15803d, 0.9, 0)];
  for (let x = -126, k = 0; x <= 126; x += 14, k++) {
    for (const z of [31.6, 46.6]) {
      const t = new THREE.Group(); t.position.set(x + (z > 40 ? 5 : 0), 0, z);
      const tr = new THREE.Mesh(trunkG, trunkM); tr.position.y = 1.5; tr.castShadow = true;
      const l1 = new THREE.Mesh(leafG, leafMs[k % 3]); l1.position.y = 4; l1.castShadow = true;
      const l2 = new THREE.Mesh(leafG, leafMs[(k + 1) % 3]); l2.position.set(0.6, 5.2, 0.2); l2.scale.setScalar(0.7);
      t.add(tr, l1, l2); t.scale.setScalar(0.9 + (k % 4) * 0.12);
      scene.add(t);
    }
  }

  // cars
  const wheelG = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), wheelM = std(0x0a0a0a, 0.8, 0);
  const lightM = new THREE.MeshStandardMaterial({ color: 0xfff6d0, emissive: 0xfff0b0, emissiveIntensity: 2 });
  const tailM = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 1.5 });
  const makeCar = (color: number) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 1.9), std(color, 0.3, 0.6)); body.position.y = 0.8;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.7), std(0x9edfff, 0.1, 0.3)); cab.position.set(-0.2, 1.6, 0);
    body.castShadow = true; g.add(body, cab);
    for (const wx of [-1.3, 1.3]) for (const wz of [-0.95, 0.95]) {
      const w = new THREE.Mesh(wheelG, wheelM); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.4, wz); g.add(w);
    }
    for (const lz of [-0.6, 0.6]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.35), lightM); h.position.set(2.1, 0.85, lz);
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.35), tailM); t.position.set(-2.1, 0.85, lz);
      g.add(h, t);
    }
    return g;
  };
  const colors = [0xdc2626, 0x2563eb, 0xf8fafc, 0xfacc15, 0x16a34a, 0x7c3aed, 0x0f172a, 0xf97316];
  const cars = colors.map((c, i) => {
    const dir = i % 2 ? -1 : 1;
    const g = makeCar(c);
    g.position.set(-140 + i * 36, 0, dir > 0 ? 35 : 43);
    g.rotation.y = dir > 0 ? 0 : Math.PI;
    scene.add(g);
    return { g, dir, sp: 9 + (i % 4) * 3 };
  });

  // birds
  const wingG = new THREE.PlaneGeometry(1.2, 0.4), birdM = new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.DoubleSide });
  const birds = Array.from({ length: 14 }, (_, i) => {
    const g = new THREE.Group();
    const L = new THREE.Group(), R = new THREE.Group();
    const wl = new THREE.Mesh(wingG, birdM), wr = new THREE.Mesh(wingG, birdM);
    wl.rotation.x = wr.rotation.x = -Math.PI / 2; wl.position.x = -0.6; wr.position.x = 0.6;
    L.add(wl); R.add(wr);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), birdM); b.scale.set(0.8, 0.8, 1.6);
    g.add(L, R, b); scene.add(g);
    return { g, L, R, off: i * 0.9, rad: 45 + (i % 5) * 14, h: 30 + (i % 4) * 7, sp: 0.12 + (i % 3) * 0.03 };
  });

  return (t: number, dt: number) => {
    cars.forEach((c) => {
      c.g.position.x += c.dir * c.sp * dt;
      if (c.g.position.x > 150) c.g.position.x = -150;
      if (c.g.position.x < -150) c.g.position.x = 150;
    });
    birds.forEach((b) => {
      const a = t * b.sp + b.off;
      b.g.position.set(Math.cos(a) * b.rad, b.h + Math.sin(t + b.off) * 2, 20 + Math.sin(a) * b.rad * 0.6);
      b.g.rotation.y = -a;
      const f = Math.sin(t * 9 + b.off) * 0.7;
      b.L.rotation.z = f; b.R.rotation.z = -f;
    });
  };
}

/* ---------- presence between browser tabs (same device) ----------
   Real internet multiplayer needs a server (WebSocket / Supabase Realtime / Firebase).
   Keep the same message shapes and swap BroadcastChannel for that transport. */
export type Peer = { id: string; name: string; photo: string; x: number; z: number; r: number; w: number; a: number; seen: number };
type SelfState = { x: number; z: number; r: number; w: number; a: number };

export function createNet(getSelf: () => SelfState, getProfile: () => Profile) {
  const id = Math.random().toString(36).slice(2, 8);
  let bc: BroadcastChannel | null = null;
  try { bc = new BroadcastChannel('grand-mall-v1'); } catch { /* unsupported */ }
  const peers = new Map<string, Peer>();
  if (bc) {
    bc.onmessage = (e) => {
      const m = e.data;
      if (!m || !m.id || m.id === id) return;
      if (m.t === 'bye') { peers.delete(m.id); return; }
      const p = peers.get(m.id) ?? { id: m.id, name: 'অতিথি', photo: '', x: m.x ?? 0, z: m.z ?? 0, r: 0, w: 0, a: 0, seen: 0 };
      if (m.t === 'hello') { p.name = m.name || 'অতিথি'; p.photo = m.photo || ''; }
      else Object.assign(p, { x: m.x, z: m.z, r: m.r, w: m.w, a: m.a });
      p.seen = performance.now();
      peers.set(m.id, p);
    };
  }
  let lastPos = 0, lastHello = 0;
  const tick = (now: number) => {
    if (!bc) return;
    if (now - lastHello > 2000) { bc.postMessage({ t: 'hello', id, ...getProfile() }); lastHello = now; }
    if (now - lastPos > 100) { bc.postMessage({ t: 'pos', id, ...getSelf() }); lastPos = now; }
    peers.forEach((p, k) => { if (now - p.seen > 5000) peers.delete(k); });
  };
  const close = () => { bc?.postMessage({ t: 'bye', id }); bc?.close(); };
  return { id, peers, tick, close };
}
