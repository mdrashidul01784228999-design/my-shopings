import * as THREE from 'three';

/* নদী, ব্রিজ, নৌকা, মাছ ধরা, বাজারের স্টল, রাস্তার বাতি ও পথচারী */
export const RZ0 = 52, RZ1 = 72;          // নদীর দুই পাড়ের z
export const BR = [-90, 0, 90];           // ব্রিজের x অবস্থান

type Box2 = { minX: number; maxX: number; minZ: number; maxZ: number };
type P = { id: string; name: string; price: number; image: string; kind: string; color: number };
type S = { name: string; products: P[] };
type Hu = { group: THREE.Group; update: (p: number, a: number, t: number) => void; setRide: (v: boolean) => void };
type Add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x?: number, y?: number, z?: number, sx?: number, sy?: number, sz?: number, rx?: number, ry?: number, rz?: number) => THREE.Mesh;
export type Helpers = {
  add: Add;
  bx: (w: number, h: number, d: number) => THREE.BufferGeometry;
  cy: (a: number, b: number, h: number, s?: number) => THREE.BufferGeometry;
  sp: (r: number, w?: number, h?: number) => THREE.BufferGeometry;
  pl: (w: number, h: number) => THREE.BufferGeometry;
  M: (c: number, r?: number, m?: number, e?: number, ei?: number) => THREE.MeshStandardMaterial;
  canvasTex: (w: number, h: number, d: (x: CanvasRenderingContext2D) => void) => THREE.CanvasTexture;
  photoMat: (url: string, tl: THREE.TextureLoader) => THREE.MeshBasicMaterial;
  human: (o: { shirt?: number; skin?: number; female?: boolean; style?: 'short' | 'long' | 'bun' | 'cap' | 'bald'; hair?: number; glasses?: boolean }) => Hu;
};

export function createWorld(scene: THREE.Scene, h: Helpers, getShops: () => S[], tl: THREE.TextureLoader) {
  const { add, bx, cy, sp, pl, M } = h, Q = Math.PI / 2;
  const nearBr = (x: number, w: number) => BR.some((b) => Math.abs(x - b) < w);
  const hy = (z: number) => { const t = (z - 49) / 26; return t < 0 || t > 1 ? 0 : 3 * Math.sin(Math.PI * t); };
  const heightAt = (x: number, z: number) => (nearBr(x, 3.8) ? hy(z) : 0);
  const riverBlocked = (x: number, z: number) => z > RZ0 && z < RZ1 && !nearBr(x, 3.6);
  const col: Box2[] = [], hits: { box: THREE.Box3; p: P; shop: string }[] = [];

  /* ---------- নদী ---------- */
  const wt = h.canvasTex(256, 256, (x) => {
    x.fillStyle = '#1f6fa5'; x.fillRect(0, 0, 256, 256); x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 2;
    for (let i = 0; i < 26; i++) { const y = Math.random() * 256, xx = Math.random() * 256; x.beginPath(); x.moveTo(xx, y); x.quadraticCurveTo(xx + 20, y - 6, xx + 44, y); x.stroke(); }
  });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(120, 4);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, RZ1 - RZ0), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.92 }));
  water.rotation.x = -Q; water.position.set(0, 0.02, (RZ0 + RZ1) / 2); water.receiveShadow = true; scene.add(water);
  for (const z of [RZ0 - 0.6, RZ1 + 0.6]) add(scene, bx(1600, 0.7, 1.2), M(0x7a7f8a, 0.8, 0), 0, 0.35, z).receiveShadow = true;

  /* ---------- ব্রিজ (উঁচু আর্চ — নিচ দিয়ে নৌকা যায়) ---------- */
  const stone = M(0x9aa1ad, 0.7, 0.1), rail = M(0x2b3550, 0.4, 0.7);
  BR.forEach((b0) => {
    for (let i = 0; i < 13; i++) {
      const z0 = 49 + i * 2, z1 = z0 + 2, y0 = hy(z0), y1 = hy(z1), L = Math.hypot(2, y1 - y0) + 0.05, a = -Math.atan2(y1 - y0, 2);
      const d = add(scene, bx(8, 0.5, L), stone, b0, (y0 + y1) / 2 - 0.25, (z0 + z1) / 2, 1, 1, 1, a); d.castShadow = d.receiveShadow = true;
      for (const s of [-1, 1]) add(scene, bx(0.2, 0.9, L), rail, b0 + s * 3.9, (y0 + y1) / 2 + 0.45, (z0 + z1) / 2, 1, 1, 1, a);
    }
    for (const s of [-1, 1]) add(scene, cy(0.5, 0.6, 3.2, 12), stone, b0 + s * 3, 1.4, 55).castShadow = true;
    for (const s of [-1, 1]) add(scene, cy(0.5, 0.6, 3.2, 12), stone, b0 + s * 3, 1.4, 69).castShadow = true;
  });

  /* ---------- রাস্তার বাতি (রাতে জ্বলে) ---------- */
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffd98a, emissiveIntensity: 0 });
  const pts: [number, number][] = [];
  for (let x = -300; x <= 300; x += 20) if (!nearBr(x, 7)) pts.push([x, RZ0 - 1.6], [x, RZ1 + 1.6]);
  const poles = new THREE.InstancedMesh(bx(0.18, 5, 0.18), M(0x2b3550, 0.5, 0.6), pts.length), heads = new THREE.InstancedMesh(sp(0.38), lampMat, pts.length), m4 = new THREE.Matrix4();
  pts.forEach(([x, z], i) => { m4.setPosition(x, 2.5, z); poles.setMatrixAt(i, m4); m4.setPosition(x, 5.1, z); heads.setMatrixAt(i, m4); });
  scene.add(poles, heads);

  /* ---------- নৌকা ---------- */
  const hullGeo = (() => {
    const s = new THREE.Shape(); s.moveTo(-0.9, 0); s.lineTo(0.9, 0); s.lineTo(0.9, 1.8); s.lineTo(0, 3.2); s.lineTo(-0.9, 1.8); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false }); g.rotateX(-Q); g.translate(0, 0, 1.4); return g;
  })();
  const mkBoat = (c: number) => {
    const g = new THREE.Group(), hull = new THREE.Mesh(hullGeo, M(c, 0.55, 0.1)); hull.position.y = -0.25; hull.castShadow = true; g.add(hull);
    add(g, bx(1.7, 0.06, 2.6), M(0x8b6b45, 0.7, 0), 0, 0.46, 0.1); add(g, bx(1.6, 0.1, 0.3), M(0xe5e9f0, 0.5, 0), 0, 0.55, 0.9);
    for (const s of [-1, 1]) add(g, bx(0.08, 0.1, 3.3), M(0xf8fafc, 0.5, 0), s * 0.92, 0.48, -0.2);
    return g;
  };
  type Boat = { g: THREE.Group; mine: boolean; vx: number; ph: number; man?: Hu };
  const boats: Boat[] = [];
  [-40, 30, 120].forEach((x, i) => { const g = mkBoat([0xdc2626, 0x2563eb, 0xf59e0b][i]); g.position.set(x, 0, 54.6); g.rotation.y = Q; scene.add(g); boats.push({ g, mine: true, vx: 0, ph: i }); });
  [0, 1, 2, 3].forEach((i) => {
    const g = mkBoat([0x16a34a, 0x7c3aed, 0xf97316, 0x0ea5e9][i]), man = h.human({ shirt: [0xef4444, 0xfacc15, 0x14b8a6, 0xf8fafc][i], style: i % 2 ? 'cap' : 'short' });
    man.setRide(true); man.group.scale.setScalar(0.8); man.group.position.set(0, -0.15, 0.5); g.add(man.group);
    const vx = (i % 2 ? -1 : 1) * (1.6 + i * 0.4); g.position.set(-200 + i * 120, 0, 58 + i * 3.5); g.rotation.y = vx > 0 ? -Q : Q; scene.add(g);
    boats.push({ g, mine: false, vx, ph: i * 2, man });
  });

  /* ---------- মাছ ধরা ---------- */
  const fish = { st: 0, t: 0 };
  const FISH: [string, number][] = [['রুই', 120], ['পাঙ্গাস', 150], ['কাতলা', 300], ['ইলিশ', 450], ['চিংড়ি', 600], ['বোয়াল', 900]];
  const rod = new THREE.Group(); rod.visible = false; add(rod, cy(0.02, 0.035, 2.6, 6), M(0x3b2a1a, 0.6, 0), 0, 2.02, -1.44, 1, 1, 1, 0.5 - Q); scene.add(rod);
  const bob = new THREE.Mesh(sp(0.16, 10, 8), M(0xef4444, 0.4, 0)); bob.visible = false; scene.add(bob);
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff })); line.frustumCulled = false; line.visible = false; scene.add(line);
  const tip = new THREE.Vector3();
  const fishReset = () => { fish.st = 0; };
  const fishPress = (): { msg: string; gain?: number } => {
    if (fish.st === 0) { fish.st = 1; fish.t = 2 + Math.random() * 4; return { msg: '🎣 বড়শি ফেলেছেন… মাছের অপেক্ষা করুন' }; }
    if (fish.st === 1) { fish.st = 0; return { msg: '⚠️ তাড়াতাড়ি টেনে ফেলেছেন — মাছ আসেনি।' }; }
    fish.st = 0; const f = FISH[Math.floor(Math.random() * Math.random() * FISH.length)];
    return { msg: `🎉 ${f[0]} মাছ ধরেছেন! +৳${f[1]}`, gain: f[1] };
  };
  const fishStep = (dt: number, pos: THREE.Vector3 | null, ry: number, t: number): string | null => {
    rod.visible = !!pos;
    if (!pos) { line.visible = bob.visible = false; return null; }
    rod.position.set(pos.x, 0, pos.z); rod.rotation.y = ry; rod.updateMatrixWorld(true);
    let msg: string | null = null;
    if (fish.st === 1) { fish.t -= dt; if (fish.t <= 0) { fish.st = 2; fish.t = 1.6; msg = '🐟 মাছ ঠোকরাচ্ছে! এখনই G চাপুন!'; } }
    else if (fish.st === 2) { fish.t -= dt; if (fish.t <= 0) { fish.st = 0; msg = '😞 মাছ পালিয়ে গেল।'; } }
    line.visible = bob.visible = fish.st > 0;
    if (fish.st > 0) {
      bob.position.set(pos.x - Math.sin(ry) * 7, 0.05 + (fish.st === 2 ? Math.sin(t * 40) * 0.12 - 0.1 : Math.sin(t * 2) * 0.03), pos.z - Math.cos(ry) * 7);
      rod.localToWorld(tip.set(0, 2.65, -2.58));
      const arr = lineGeo.attributes.position as THREE.BufferAttribute; arr.setXYZ(0, tip.x, tip.y, tip.z); arr.setXYZ(1, bob.position.x, bob.position.y, bob.position.z); arr.needsUpdate = true;
    }
    return msg;
  };

  /* ---------- নদীর ওপারের বাজার: প্রতিটি স্টলে আসল ছবির কার্ড ---------- */
  const shops = getShops().filter((s) => s.products.length);
  if (shops.length) {
    const cols = [0xef4444, 0x2563eb, 0xf59e0b, 0x16a34a, 0x7c3aed, 0xec4899];
    let k = 0;
    for (let i = -14; i <= 14; i++) {
      const x = i * 13.5; if (nearBr(x, 8)) continue;
      const sh = shops[k % shops.length], c = cols[k % cols.length], g = new THREE.Group(); g.position.set(x, 0, 80); scene.add(g);
      add(g, bx(4.2, 0.9, 1.6), M(0x6b4a2e, 0.6, 0.05), 0, 0.45, 0).castShadow = true;
      for (const sx of [-2, 2]) for (const sz of [-0.9, 0.9]) add(g, cy(0.06, 0.06, 3, 6), M(0x2b3550, 0.5, 0.6), sx, 1.5, sz);
      const stripe = h.canvasTex(128, 16, (cx) => { for (let j = 0; j < 8; j++) { cx.fillStyle = j % 2 ? '#fff' : '#' + c.toString(16).padStart(6, '0'); cx.fillRect(j * 16, 0, 16, 16); } });
      const can = add(g, bx(4.8, 0.12, 2.4), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.7 }), 0, 3, 0, 1, 1, 1, 0.22); can.castShadow = true;
      const nameTex = h.canvasTex(512, 96, (cx) => { cx.fillStyle = '#0b1220'; cx.fillRect(0, 0, 512, 96); cx.fillStyle = '#fff'; cx.font = '800 54px Arial'; cx.textAlign = 'center'; cx.fillText(sh.name, 256, 66, 480); });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.68), new THREE.MeshBasicMaterial({ map: nameTex })); sign.position.set(0, 3.55, -1.3); sign.rotation.y = Math.PI; g.add(sign);
      for (let j = 0; j < 4; j++) {
        const p = sh.products[(k * 5 + j * 7) % sh.products.length], ox = -1.5 + j;
        add(g, bx(0.92, 0.74, 0.05), M(0x111827, 0.4, 0.3), ox, 1.45, -0.1);
        add(g, pl(0.82, 0.64), h.photoMat(p.image, tl), ox, 1.45, -0.13, 1, 1, 1, 0, Math.PI, 0);
        add(g, bx(0.08, 0.5, 0.04), M(0x6b4a2e, 0.6, 0.05), ox, 1.2, 0.1, 1, 1, 1, -0.3);
        hits.push({ box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x + ox, 1.45, 79.9), new THREE.Vector3(0.95, 0.8, 0.4)), p, shop: sh.name + ' (স্টল)' });
      }
      col.push({ minX: x - 2.2, maxX: x + 2.2, minZ: 79, maxZ: 81 });
      k++;
    }
  }

  /* ---------- পথচারী ---------- */
  const walkers = [49.6, 74.5, 85, 88, 49.6, 74.5, 90, 85].map((z, i) => {
    const u = h.human({ shirt: [0xef4444, 0x22c55e, 0xf59e0b, 0xa855f7, 0x06b6d4, 0xf8fafc, 0xec4899, 0x0ea5e9][i], female: i % 2 === 0, style: (['long', 'short', 'bun', 'cap'] as const)[i % 4], skin: [0xc98262, 0xe0ac8a, 0x8d5a3b, 0xb87555][i % 4] });
    scene.add(u.group); return { u, z, x: -150 + i * 40, dir: i % 2 ? 1 : -1, sp: 1.6 + (i % 3) * 0.4 };
  });

  const update = (t: number, dt: number, dayF: number) => {
    wt.offset.x += dt * 0.01; wt.offset.y = Math.sin(t * 0.3) * 0.02; lampMat.emissiveIntensity = (1 - dayF) * 3;
    boats.forEach((b) => {
      if (!b.mine) {
        b.g.position.x += b.vx * dt;
        if (Math.abs(b.g.position.x) > 320) { b.vx = -b.vx; b.g.rotation.y = b.vx > 0 ? -Q : Q; }
        b.man?.update(0, 0, t);
      }
      b.g.position.y = Math.sin(t * 1.4 + b.ph) * 0.05;
    });
    walkers.forEach((w) => {
      w.x += w.dir * w.sp * dt; if (Math.abs(w.x) > 250) w.dir = -w.dir;
      w.u.group.position.set(w.x, 0, w.z); w.u.group.rotation.y = w.dir < 0 ? Math.PI / 2 : -Math.PI / 2; w.u.update(t * w.sp * 3.2, 1, t);
    });
  };

  return { update, heightAt, riverBlocked, boats, hits, col, fishPress, fishStep, fishReset };
}