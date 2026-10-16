"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ---------- ম্যাপ ও সেটিংস ---------- */
const BLOCK = 24; // একটা ব্লকের মাপ
const ROAD = 8; // রাস্তার প্রস্থ
const ROAD_C = BLOCK / 2; // রাস্তার মাঝের অফসেট
const LIM = 82; // ম্যাপের সীমা
const SPEED = 9;
const BULLETS = 40;
const ENEMIES = 7;

type Hud = { score: number; hp: number; over: boolean };
type Building = { x: number; z: number; w: number; d: number; h: number; color: string };
type Bullet = { x: number; z: number; vx: number; vz: number; life: number };
type Enemy = { x: number; z: number; hp: number };

function rnd(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

const COLORS = ["#5b6b82", "#7a6a5f", "#4d5a66", "#8a8f98", "#6b4f5a"];

const BUILDINGS: Building[] = (() => {
  const list: Building[] = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const seed = i * 31 + j * 17 + 5;
      const cx = i * BLOCK;
      const cz = j * BLOCK;
      const color = COLORS[Math.floor(rnd(seed + 2) * COLORS.length)];
      if (rnd(seed) > 0.5) {
        list.push({ x: cx - 4, z: cz, w: 7, d: 15, h: 6 + rnd(seed + 1) * 24, color });
        list.push({ x: cx + 4, z: cz, w: 7, d: 15, h: 6 + rnd(seed + 3) * 24, color: COLORS[Math.floor(rnd(seed + 4) * COLORS.length)] });
      } else {
        list.push({ x: cx, z: cz, w: 15, d: 15, h: 8 + rnd(seed + 1) * 26, color });
      }
    }
  }
  return list;
})();

function hitsBuilding(x: number, z: number, r: number) {
  for (const b of BUILDINGS) {
    if (Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + r) return true;
  }
  return false;
}

function step(e: { x: number; z: number }, dx: number, dz: number, r: number) {
  if (!hitsBuilding(e.x + dx, e.z, r)) e.x += dx;
  if (!hitsBuilding(e.x, e.z + dz, r)) e.z += dz;
  e.x = Math.max(-LIM, Math.min(LIM, e.x));
  e.z = Math.max(-LIM, Math.min(LIM, e.z));
}

function spawnPoint(px: number, pz: number) {
  for (let n = 0; n < 30; n++) {
    const x = (Math.floor(Math.random() * 8) - 4) * BLOCK + ROAD_C;
    const z = (Math.floor(Math.random() * 8) - 4) * BLOCK + ROAD_C;
    if (Math.hypot(x - px, z - pz) > 35) return { x, z };
  }
  return { x: -LIM, z: -LIM };
}

function makeGame() {
  const px = ROAD_C;
  const pz = ROAD_C;
  return {
    x: px,
    z: pz,
    angle: 0,
    hp: 100,
    score: 0,
    over: false,
    lastShot: 0,
    t: 0,
    sentHp: 100,
    sentScore: 0,
    bullets: Array.from({ length: BULLETS }, () => ({ x: 0, z: 0, vx: 0, vz: 0, life: 0 })) as Bullet[],
    enemies: Array.from({ length: ENEMIES }, () => ({ ...spawnPoint(px, pz), hp: 3 })) as Enemy[],
  };
}

/* ---------- শহর ---------- */
function City() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#23262d" />
      </mesh>
      {Array.from({ length: 7 }).flatMap((_, a) =>
        Array.from({ length: 7 }).map((__, b) => (
          <mesh key={`p${a}-${b}`} position={[(a - 3) * BLOCK, 0.05, (b - 3) * BLOCK]}>
            <boxGeometry args={[BLOCK - ROAD, 0.1, BLOCK - ROAD]} />
            <meshStandardMaterial color="#3a3f4a" />
          </mesh>
        ))
      )}
      {BUILDINGS.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- গেমের মূল সিন ---------- */
function Scene({ onHud }: { onHud: (h: Hud) => void }) {
  const [g] = useState(makeGame);
  const player = useRef<THREE.Group>(null);
  const bulletRefs = useRef<(THREE.Mesh | null)[]>([]);
  const enemyRefs = useRef<(THREE.Group | null)[]>([]);
  const keys = useRef(new Set<string>());
  const firing = useRef(false);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        firing.current = true;
      }
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") firing.current = false;
      keys.current.delete(e.code);
    };
    const md = (e: MouseEvent) => {
      if (e.button === 0) firing.current = true;
    };
    const mu = (e: MouseEvent) => {
      if (e.button === 0) firing.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
    };
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (g.over) return;
    g.t += dt;

    // চলা (WASD / তীর চিহ্ন)
    const k = keys.current;
    let dx = 0;
    let dz = 0;
    if (k.has("KeyW") || k.has("ArrowUp")) dz -= 1;
    if (k.has("KeyS") || k.has("ArrowDown")) dz += 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) dx -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) dx += 1;
    const len = Math.hypot(dx, dz);
    if (len > 0) step(g, (dx / len) * SPEED * dt, (dz / len) * SPEED * dt, 0.6);

    // মাউসের দিকে তাক করা
    state.raycaster.setFromCamera(state.pointer, state.camera);
    if (state.raycaster.ray.intersectPlane(plane, hit)) {
      g.angle = Math.atan2(hit.x - g.x, hit.z - g.z);
    }
    if (player.current) {
      player.current.position.set(g.x, 0, g.z);
      player.current.rotation.y = g.angle;
    }

    // গুলি করা
    const fx = Math.sin(g.angle);
    const fz = Math.cos(g.angle);
    if (firing.current && g.t - g.lastShot > 0.14) {
      const free = g.bullets.find((b) => b.life <= 0);
      if (free) {
        free.x = g.x + fx * 1.2;
        free.z = g.z + fz * 1.2;
        free.vx = fx * 55;
        free.vz = fz * 55;
        free.life = 1.2;
        g.lastShot = g.t;
      }
    }

    // গুলির চলাচল ও লাগা
    g.bullets.forEach((b, i) => {
      const mesh = bulletRefs.current[i];
      if (b.life > 0) {
        b.life -= dt;
        b.x += b.vx * dt;
        b.z += b.vz * dt;
        if (hitsBuilding(b.x, b.z, 0)) b.life = 0;
        for (const e of g.enemies) {
          if (b.life > 0 && Math.hypot(e.x - b.x, e.z - b.z) < 1.0) {
            b.life = 0;
            e.hp -= 1;
            if (e.hp <= 0) {
              g.score += 10;
              Object.assign(e, spawnPoint(g.x, g.z), { hp: 3 });
            }
          }
        }
      }
      if (mesh) {
        mesh.visible = b.life > 0;
        mesh.position.set(b.x, 1.2, b.z);
      }
    });

    // শত্রুরা তাড়া করে
    g.enemies.forEach((e, i) => {
      const ex = g.x - e.x;
      const ez = g.z - e.z;
      const dist = Math.hypot(ex, ez);
      if (dist > 1.1) {
        step(e, (ex / dist) * 3.2 * dt, (ez / dist) * 3.2 * dt, 0.5);
      } else {
        g.hp -= 15 * dt;
      }
      const m = enemyRefs.current[i];
      if (m) {
        m.position.set(e.x, 0, e.z);
        m.rotation.y = Math.atan2(ex, ez);
      }
    });

    // HUD আপডেট (শুধু বদলালে)
    const hp = Math.max(0, Math.ceil(g.hp));
    if (g.hp <= 0) g.over = true;
    if (hp !== g.sentHp || g.score !== g.sentScore || g.over) {
      g.sentHp = hp;
      g.sentScore = g.score;
      onHud({ score: g.score, hp, over: g.over });
    }

    // ক্যামেরা অনুসরণ
    state.camera.position.lerp(camTarget.set(g.x, 24, g.z + 16), 1 - Math.exp(-6 * dt));
    state.camera.lookAt(g.x, 0, g.z);
  });

  return (
    <>
      <color attach="background" args={["#1a2233"]} />
      <fog attach="fog" args={["#1a2233", 45, 150]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[30, 50, 20]} intensity={1.2} />

      <City />

      {/* খেলোয়াড় */}
      <group ref={player} position={[g.x, 0, g.z]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 1.6, 10]} />
          <meshStandardMaterial color="#2ee6c5" />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#f2c9a5" />
        </mesh>
        <mesh position={[0.3, 1.1, 0.7]}>
          <boxGeometry args={[0.15, 0.15, 1.2]} />
          <meshStandardMaterial color="#111318" />
        </mesh>
      </group>

      {/* শত্রু */}
      {g.enemies.map((e, i) => (
        <group key={i} ref={(el) => { enemyRefs.current[i] = el; }} position={[e.x, 0, e.z]}>
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.45, 0.5, 1.6, 10]} />
            <meshStandardMaterial color="#e5484d" />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#d9a58f" />
          </mesh>
        </group>
      ))}

      {/* গুলি */}
      {Array.from({ length: BULLETS }).map((_, i) => (
        <mesh key={i} ref={(el) => { bulletRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ffd04a" />
        </mesh>
      ))}
    </>
  );
}

/* ---------- পেজ ---------- */
export default function Page() {
  const [run, setRun] = useState(0);
  const [hud, setHud] = useState<Hud>({ score: 0, hp: 100, over: false });

  const restart = useCallback(() => {
    setHud({ score: 0, hp: 100, over: false });
    setRun((r) => r + 1);
  }, []);

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.code === "KeyR") restart();
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [restart]);

  return (
    <main style={{ position: "fixed", inset: 0, background: "#1a2233", overflow: "hidden", userSelect: "none", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <Canvas key={run} camera={{ position: [12, 24, 28], fov: 50 }}>
        <Scene onHud={setHud} />
      </Canvas>

      <div style={{ position: "absolute", top: 16, left: 16, pointerEvents: "none" }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>স্কোর: {hud.score}</div>
        <div style={{ marginTop: 8, width: 180, height: 12, background: "#ffffff22", borderRadius: 6 }}>
          <div style={{ width: `${hud.hp}%`, height: "100%", background: hud.hp > 35 ? "#2ee6c5" : "#e5484d", borderRadius: 6, transition: "width .15s" }} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: 16, fontSize: 14, opacity: 0.75, pointerEvents: "none" }}>
        WASD = চলা · মাউস = তাক করা · ক্লিক / Space = গুলি · R = রিস্টার্ট
      </div>

      {hud.over && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000000aa" }}>
          <div style={{ fontSize: 40, fontWeight: 700 }}>খেলা শেষ</div>
          <div style={{ fontSize: 22, margin: "8px 0 20px" }}>তোমার স্কোর: {hud.score}</div>
          <button onClick={restart} style={{ padding: "10px 24px", fontSize: 18, borderRadius: 8, border: 0, background: "#2ee6c5", color: "#0b1a17", cursor: "pointer" }}>
            আবার খেলো
          </button>
        </div>
      )}
    </main>
  );
}

