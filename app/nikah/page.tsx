"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronDown,
  Crown,
  Eye,
  EyeOff,
  Heart,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Quote,
  Search,
  Settings as SettingsIcon,
  Smartphone,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import rawData from "./data.json";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type Gender = "male" | "female";
type SortKey = "new" | "ageAsc" | "ageDesc";

interface Profile {
  id: number;
  name: string;
  gender: Gender;
  age: number;
  profession: string;
  location: string;
  education: string;
  religion: string;
  height: string;
  maritalStatus: string;
  income: string;
  family: string;
  interests: string[];
  bio: string;
  expectation: string;
  verified: boolean;
  isNew: boolean;
  avatar: { theme: number; skin: number; hair: number };
}

interface Pkg {
  id: number;
  name: string;
  price: number;
  period: string;
  highlight: boolean;
  features: string[];
}

interface Story {
  id: number;
  couple: string;
  location: string;
  quote: string;
}

interface AvatarTheme {
  bg: [string, string];
  cloth: string;
}

interface DataFile {
  stats: { members: number; verified: number; marriages: number; districts: number };
  avatarThemes: AvatarTheme[];
  skinTones: string[];
  hairColors: string[];
  packages: Pkg[];
  stories: Story[];
  profiles: Profile[];
}

interface Account {
  name: string;
  contact: string;
  gender: Gender;
  age: string;
  profession: string;
  location: string;
  education: string;
  bio: string;
  theme: number;
  skin: number;
}

interface Settings {
  effects3d: boolean;
  tilt: boolean;
  pageSize: number;
  visibility: "all" | "verified" | "hidden";
}

// data.json is bundled at build time (needs "resolveJsonModule": true, which Next.js enables by default)
const data = rawData as unknown as DataFile;

/* -------------------------------------------------------------------------- */
/*  Constants & helpers                                                        */
/* -------------------------------------------------------------------------- */

const AGE_RANGES = [
  { label: "সব বয়স", min: 18, max: 100 },
  { label: "১৮ – ২৫", min: 18, max: 25 },
  { label: "২৬ – ৩৫", min: 26, max: 35 },
  { label: "৩৬+", min: 36, max: 100 },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "নতুন আগে" },
  { key: "ageAsc", label: "বয়স: কম থেকে বেশি" },
  { key: "ageDesc", label: "বয়স: বেশি থেকে কম" },
];

const KEYS = {
  fav: "bondhon:favorites",
  proposals: "bondhon:proposals",
  settings: "bondhon:settings",
  accounts: "bondhon:accounts",
  session: "bondhon:session",
} as const;

const DEFAULT_SETTINGS: Settings = { effects3d: true, tilt: true, pageSize: 8, visibility: "all" };

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-white outline-none placeholder:text-white/40 focus:border-rose-300 focus:ring-2 focus:ring-rose-300/40";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);
const fmt = (n: number) => toBn(n.toLocaleString("en-US"));
const bnToEn = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeContact = (v: string) => bnToEn(v).trim().toLowerCase().replace(/[\s-]/g, "");
const isValidContact = (v: string) => PHONE_RE.test(v) || EMAIL_RE.test(v);

const hashStr = (s: string) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

function newAccount(contact: string, name: string, gender: Gender, prev?: Account): Account {
  const h = hashStr(contact);
  return {
    name: name || prev?.name || (contact.includes("@") ? contact.split("@")[0] : "সদস্য"),
    contact,
    gender,
    age: prev?.age ?? "",
    profession: prev?.profession ?? "",
    location: prev?.location ?? "",
    education: prev?.education ?? "",
    bio: prev?.bio ?? "",
    theme: prev?.theme ?? h % data.avatarThemes.length,
    skin: prev?.skin ?? (h >> 3) % data.skinTones.length,
  };
}

function completeness(a: Account) {
  const fields = [a.name, a.contact, a.gender, a.age, a.profession, a.location, a.education, a.bio];
  return Math.round((fields.filter((v) => String(v).trim() !== "").length / fields.length) * 100);
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: ignore */
  }
}

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
html { scroll-behavior: smooth; }
.bn-root { font-family: 'Hind Siliguri', system-ui, sans-serif; line-height: 1.7; }
.bn-root :focus-visible { outline: 2px solid #fda4af; outline-offset: 2px; }
@keyframes bn-pop { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
.bn-pop { animation: bn-pop 180ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .bn-root * { animation: none !important; transition: none !important; }
}
`;

const selectStyle = { colorScheme: "dark" } as const;

/** Shared heart outline used by the hero heart and the background hearts. */
function makeHeartGeometry(depth: number, bevel: number, bevelSegments: number, curveSegments: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -2.6);
  shape.bezierCurveTo(-0.4, -2.2, -3.2, -0.6, -3.2, 1.2);
  shape.bezierCurveTo(-3.2, 2.9, -1.1, 3.4, 0, 1.9);
  shape.bezierCurveTo(1.1, 3.4, 3.2, 2.9, 3.2, 1.2);
  shape.bezierCurveTo(3.2, -0.6, 0.4, -2.2, 0, -2.6);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel + 0.05,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  geometry.center();
  return geometry;
}

function createRenderer(antialias: boolean, maxPixelRatio: number) {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    return renderer;
  } catch {
    return null; // WebGL unavailable: the page still works without 3D
  }
}

/* -------------------------------------------------------------------------- */
/*  3D: full-page background (floating hearts, wire shapes, particles)        */
/* -------------------------------------------------------------------------- */

function Background3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    const renderer = createRenderer(!small, small ? 1.5 : 2);
    if (!renderer) return;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    // Floating hearts (one draw call via InstancedMesh)
    const COUNT = small ? 16 : 34;
    const XSPAN = small ? 7 : 16;
    const heartGeo = makeHeartGeometry(0.9, 0.35, 3, 18);
    const heartMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 });
    const hearts = new THREE.InstancedMesh(heartGeo, heartMat, COUNT);
    const palette = [0xfb7185, 0xe11d48, 0xc084fc, 0xa855f7, 0xf472b6].map((c) => new THREE.Color(c));
    const seeds = Array.from({ length: COUNT }, (_, i) => {
      hearts.setColorAt(i, palette[i % palette.length]);
      return {
        x: (Math.random() * 2 - 1) * XSPAN,
        y: -22 + Math.random() * 26,
        z: -10 + Math.random() * 10,
        s: 0.1 + Math.random() * 0.2,
        rx: (Math.random() - 0.5) * 0.5,
        ry: 0.15 + Math.random() * 0.4,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      };
    });
    if (hearts.instanceColor) hearts.instanceColor.needsUpdate = true;
    scene.add(hearts);

    // Wireframe shapes
    const wireMat = (color: number) =>
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.3 });
    const wires = [
      { mesh: new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), wireMat(0xc084fc)), x: small ? -4 : -11, y: -3 },
      { mesh: new THREE.Mesh(new THREE.TorusKnotGeometry(1.4, 0.38, 100, 12), wireMat(0xf472b6)), x: small ? 4 : 11, y: -11 },
      { mesh: new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), wireMat(0xfb7185)), x: small ? -4 : -10, y: -18 },
    ];
    wires.forEach((w) => {
      w.mesh.position.set(w.x, w.y, -6);
      scene.add(w.mesh);
    });

    // Particles
    const PCOUNT = small ? 140 : 300;
    const pos = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * (small ? 10 : 22);
      pos[i * 3 + 1] = -28 + Math.random() * 36;
      pos[i * 3 + 2] = -12 + Math.random() * 16;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf9a8d4, size: 0.07, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(5, 8, 8);
    scene.add(key);
    const glow = new THREE.PointLight(0xa855f7, 60, 60);
    glow.position.set(-8, 0, 6);
    scene.add(glow);

    // Scroll -> camera Y (cached; reading layout every frame would be wasteful)
    let targetY = 0;
    const pointer = { x: 0 };
    const dummy = new THREE.Object3D();

    const render = () => renderer.render(scene, camera);

    const updateHearts = (t: number) => {
      for (let i = 0; i < COUNT; i++) {
        const d = seeds[i];
        dummy.position.set(
          d.x + Math.sin(t * 0.3 + d.phase) * 0.6,
          d.y + Math.sin(t * d.speed + d.phase) * 0.8,
          d.z
        );
        dummy.rotation.set(t * d.rx + d.phase, t * d.ry + d.phase, 0);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix();
        hearts.setMatrixAt(i, dummy.matrix);
      }
      hearts.instanceMatrix.needsUpdate = true;
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetY = -(window.scrollY / max) * 20;
      if (reduceMotion) {
        camera.position.y = targetY;
        render();
      }
    };

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      onScroll();
      if (reduceMotion) render();
    };

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    };

    onResize();
    updateHearts(0);
    if (reduceMotion) render();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });
    // Page height changes when profiles load or filters change
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      updateHearts(t);
      wires.forEach((w, i) => {
        w.mesh.rotation.x = t * (0.12 + i * 0.03);
        w.mesh.rotation.y = t * (0.18 + i * 0.04);
      });
      camera.position.y += (targetY - camera.position.y) * 0.06;
      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.04;
      render();
      raf = requestAnimationFrame(tick);
    };
    if (!reduceMotion) tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      heartGeo.dispose();
      heartMat.dispose();
      hearts.dispose();
      wires.forEach((w) => {
        w.mesh.geometry.dispose();
        (w.mesh.material as THREE.Material).dispose();
      });
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}

/* -------------------------------------------------------------------------- */
/*  3D: hero heart                                                             */
/* -------------------------------------------------------------------------- */

function HeroHeart() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = createRenderer(true, 2);
    if (!renderer) return;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const geometry = makeHeartGeometry(1.1, 0.4, 12, 40);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const heart = new THREE.Mesh(geometry, material);
    heart.scale.setScalar(0.9);
    scene.add(heart);

    const ringGeo = new THREE.TorusGeometry(4.3, 0.035, 16, 140);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    const ring2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.6 }));
    ring2.scale.setScalar(0.82);
    ring2.rotation.set(Math.PI / 3, Math.PI / 5, 0);
    scene.add(ring2);

    const COUNT = 140;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 4.6 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf9a8d4, size: 0.07 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0xa855f7, 45, 30);
    rim.position.set(-6, -2, 3);
    scene.add(rim);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 300 ? 11 : 9;
      camera.updateProjectionMatrix();
      if (reduceMotion) renderer.render(scene, camera);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      const beat = 1 + Math.pow(Math.sin(t * 2.2), 8) * 0.06;
      heart.scale.setScalar(0.9 * beat);
      heart.rotation.y = t * 0.5 + pointer.x * 0.4;
      heart.rotation.x = Math.sin(t * 0.6) * 0.12 + pointer.y * 0.2;
      ring.rotation.z = t * 0.25;
      ring2.rotation.z = -t * 0.3;
      particles.rotation.y = t * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (reduceMotion) renderer.render(scene, camera);
    else tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      (ring2.material as THREE.Material).dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" aria-hidden="true" />;
}

/* -------------------------------------------------------------------------- */
/*  UI pieces                                                                  */
/* -------------------------------------------------------------------------- */

/** Card that tilts toward the mouse with a moving highlight (mouse only). */
function TiltCard({ children, className = "", enabled = true }: { children: React.ReactNode; className?: string; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!enabled || !el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) scale(1.02)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ transition: "transform 150ms ease-out", transformStyle: "preserve-3d" }}
      className={`group relative ${className}`}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 0%), rgba(255,255,255,0.16), transparent 55%)" }}
      />
    </div>
  );
}

/** Colorful illustrated avatar (no external images). */
function AvatarArt({
  theme,
  skin,
  hair,
  gender,
  className = "",
}: {
  theme: number;
  skin: number;
  hair: number;
  gender: Gender;
  className?: string;
}) {
  const t = data.avatarThemes[theme % data.avatarThemes.length];
  const skinColor = data.skinTones[skin % data.skinTones.length];
  const hairColor = data.hairColors[hair % data.hairColors.length];
  const female = gender === "female";

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})` }}
    >
      <div className="absolute -left-[6%] top-[4%] aspect-square w-[38%] rounded-full bg-white/25" />
      <div className="absolute -right-[4%] bottom-[18%] aspect-square w-[30%] rounded-full bg-white/20" />
      <div className="absolute right-[14%] top-[10%] aspect-square w-[5%] rounded-full bg-white/70" />
      <div className="absolute bottom-[12%] left-[16%] aspect-square w-[4%] rounded-full bg-white/70" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="relative h-full w-full">
        {female && <ellipse cx="50" cy="43" rx="20" ry="23" fill={hairColor} />}
        {female && <path d="M30 44 C29 68 33 78 38 84 L62 84 C67 78 71 68 70 44 Z" fill={hairColor} />}
        <path d="M13 100 C13 75 31 65 50 65 C69 65 87 75 87 100 Z" fill={t.cloth} />
        <rect x="44" y="52" width="12" height="15" rx="5" fill={skinColor} />
        <circle cx="50" cy="41" r="15" fill={skinColor} />
        <path
          d={female ? "M33 41 C32 22 68 22 67 41 C60 31 42 29 33 41 Z" : "M34 39 C34 23 66 23 66 39 C61 32 40 32 34 39 Z"}
          fill={hairColor}
        />
        <circle cx="45" cy="42" r="1.4" fill="#2b1b14" />
        <circle cx="55" cy="42" r="1.4" fill="#2b1b14" />
        <path d="M45 48 Q50 52 55 48" stroke="#8a4b3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Avatar({ profile, big = false }: { profile: Profile; big?: boolean }) {
  return (
    <AvatarArt
      theme={profile.avatar.theme}
      skin={profile.avatar.skin}
      hair={profile.avatar.hair}
      gender={profile.gender}
      className={big ? "h-24 w-24 shrink-0 rounded-3xl ring-4 ring-white/20" : "h-full w-full"}
    />
  );
}

/** Accessible modal: Esc to close, focus trap, scroll lock, restores focus. */
function Modal({
  label,
  onClose,
  wide = false,
  children,
}: {
  label: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    (
      dialog?.querySelector<HTMLElement>("[data-autofocus], input, select, textarea") ??
      dialog?.querySelector<HTMLElement>("button")
    )?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`bn-pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/15 bg-[#1d0b36] shadow-2xl sm:rounded-[2rem] ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2 text-white/80 backdrop-blur hover:bg-black/50"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-white/80">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-rose-300">
          {error}
        </span>
      )}
    </label>
  );
}

function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4">
      <div>
        <p className="font-semibold">{label}</p>
        {hint && <p className="text-sm text-white/60">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-rose-500" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-white/10 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            value === o.value ? "bg-rose-500 text-white shadow" : "text-white/75 hover:bg-white/10"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Login / Register popup                                                     */
/* -------------------------------------------------------------------------- */

interface AuthValues {
  mode: "login" | "register";
  name: string;
  contact: string;
  gender: Gender;
}

function LoginModal({
  initialTab,
  notice,
  samples,
  onClose,
  onSubmit,
}: {
  initialTab: "login" | "register";
  notice: string | null;
  samples: Profile[];
  onClose: () => void;
  onSubmit: (v: AuthValues) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const c = normalizeContact(contact);
    if (tab === "register" && name.trim().length < 2) next.name = "নাম অন্তত ২ অক্ষরের হতে হবে।";
    if (!isValidContact(c)) next.contact = "সঠিক মোবাইল নম্বর (০১XXXXXXXXX) বা ইমেইল দিন।";
    if (password.length < 6) next.password = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    // The password is only checked here and never stored or sent anywhere.
    timer.current = setTimeout(() => onSubmit({ mode: tab, name: name.trim(), contact: c, gender }), 450);
  };

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    setErrors({});
  };

  const benefits = ["যাচাইকৃত প্রোফাইল", "প্রস্তাব পাঠান নিশ্চিন্তে", "পছন্দের তালিকা সংরক্ষণ"];

  return (
    <Modal label={tab === "login" ? "লগইন" : "নতুন অ্যাকাউন্ট"} onClose={onClose} wide>
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-700 p-8 md:block">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden="true" />
          <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative">
            <span className="inline-flex rounded-xl bg-white/20 p-2.5">
              <Heart className="fill-current text-white" size={26} />
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-snug">স্বাগতম বন্ধনে</h2>
            <p className="mt-2 text-white/85">পছন্দের মানুষকে খুঁজে নিতে অ্যাকাউন্টে ঢুকুন।</p>
            <ul className="mt-6 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5">
                  <span className="rounded-full bg-white/25 p-1">
                    <Check size={14} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center">
              {samples.slice(0, 5).map((p) => (
                <AvatarArt
                  key={p.id}
                  theme={p.avatar.theme}
                  skin={p.avatar.skin}
                  hair={p.avatar.hair}
                  gender={p.gender}
                  className="-ml-3 h-12 w-12 rounded-full ring-2 ring-white first:ml-0"
                />
              ))}
              <span className="ml-3 text-sm text-white/90">{fmt(data.stats.members)}+ সদস্য</span>
            </div>
          </div>
        </aside>

        <div className="p-6 pt-14 sm:p-8 md:pt-8">
          <div role="tablist" aria-label="লগইন বা নিবন্ধন" className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/10 p-1">
            {(
              [
                ["login", "লগইন"],
                ["register", "নতুন অ্যাকাউন্ট"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => switchTab(key)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  tab === key ? "bg-rose-500 shadow" : "text-white/75 hover:bg-white/10"
                }`}
              >
                {text}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold">{tab === "login" ? "আপনার অ্যাকাউন্টে ঢুকুন" : "নতুন অ্যাকাউন্ট খুলুন"}</h2>

          {notice && (
            <p role="status" className="mt-3 rounded-xl border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
              {notice}
            </p>
          )}

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            {tab === "register" && (
              <>
                <Field label="আপনার নাম" error={errors.name}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="যেমন: রাশেদুল ইসলাম"
                    aria-invalid={!!errors.name}
                    className={inputClass}
                  />
                </Field>
                <div>
                  <span className="mb-1 block text-sm font-medium text-white/80">আমি</span>
                  <Segmented
                    label="পাত্র বা পাত্রী"
                    value={gender}
                    onChange={setGender}
                    options={[
                      { value: "male", label: "পাত্র" },
                      { value: "female", label: "পাত্রী" },
                    ]}
                  />
                </div>
              </>
            )}

            <Field label="মোবাইল নম্বর বা ইমেইল" error={errors.contact}>
              <div className="relative">
                <Smartphone size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  data-autofocus
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  autoComplete="username"
                  inputMode="email"
                  placeholder="01XXXXXXXXX"
                  aria-invalid={!!errors.contact}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>

            <Field label="পাসওয়ার্ড" error={errors.password}>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  aria-invalid={!!errors.password}
                  className={`${inputClass} px-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/60 hover:bg-white/10"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 py-3.5 text-lg font-bold shadow-lg shadow-rose-900/40 transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "অপেক্ষা করুন…" : tab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
            </button>

            <p className="text-center text-sm text-white/65">
              {tab === "login" ? "অ্যাকাউন্ট নেই?" : "আগেই অ্যাকাউন্ট আছে?"}{" "}
              <button
                type="button"
                onClick={() => switchTab(tab === "login" ? "register" : "login")}
                className="font-semibold text-rose-300 underline"
              >
                {tab === "login" ? "নতুন অ্যাকাউন্ট খুলুন" : "লগইন করুন"}
              </button>
            </p>
            <p className="rounded-xl bg-white/5 p-3 text-xs text-white/55">
              ডেমো লগইন: পাসওয়ার্ড কোনো সার্ভারে পাঠানো বা সংরক্ষণ করা হয় না। প্রোফাইল শুধু আপনার ব্রাউজারে থাকে।
            </p>
          </form>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  My profile popup                                                           */
/* -------------------------------------------------------------------------- */

function ProfileModal({
  account,
  favoritesCount,
  proposalsCount,
  locations,
  onClose,
  onSave,
  onLogout,
}: {
  account: Account;
  favoritesCount: number;
  proposalsCount: number;
  locations: string[];
  onClose: () => void;
  onSave: (a: Account) => void;
  onLogout: () => void;
}) {
  const [draft, setDraft] = useState<Account>(account);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Account>(key: K, value: Account[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const percent = completeness(draft);
  const theme = data.avatarThemes[draft.theme % data.avatarThemes.length];

  const save = () => {
    const next: Record<string, string> = {};
    if (draft.name.trim().length < 2) next.name = "নাম অন্তত ২ অক্ষরের হতে হবে।";
    if (draft.age !== "") {
      const n = Number(bnToEn(draft.age));
      if (!Number.isInteger(n) || n < 18 || n > 80) next.age = "বয়স ১৮ থেকে ৮০ এর মধ্যে হতে হবে।";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ ...draft, name: draft.name.trim(), age: draft.age === "" ? "" : String(Number(bnToEn(draft.age))) });
  };

  return (
    <Modal label="আমার প্রোফাইল" onClose={onClose} wide>
      <div
        className="h-28"
        style={{ background: `linear-gradient(120deg, ${theme.bg[0]}, ${theme.bg[1]})` }}
        aria-hidden="true"
      />
      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-wrap items-end gap-4">
          <AvatarArt
            theme={draft.theme}
            skin={draft.skin}
            hair={1}
            gender={draft.gender}
            className="h-24 w-24 shrink-0 rounded-3xl ring-4 ring-[#1d0b36]"
          />
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-2xl font-bold">{draft.name || "আপনার নাম"}</h2>
            <p className="truncate text-sm text-white/60">{draft.contact}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">প্রোফাইল সম্পূর্ণতা</span>
            <span className="text-rose-300">{toBn(percent)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-fuchsia-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent < 100 && <p className="mt-2 text-xs text-white/55">বেশি তথ্য দিলে অন্যরা আপনাকে সহজে খুঁজে পাবে।</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{toBn(favoritesCount)}</p>
            <p className="text-sm text-white/60">পছন্দের তালিকায়</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{toBn(proposalsCount)}</p>
            <p className="text-sm text-white/60">প্রস্তাব পাঠানো</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="নাম" error={errors.name}>
            <input data-autofocus value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="বয়স" error={errors.age}>
            <input
              value={draft.age}
              onChange={(e) => set("age", e.target.value)}
              inputMode="numeric"
              placeholder="যেমন: ২৬"
              className={inputClass}
            />
          </Field>
          <div>
            <span className="mb-1 block text-sm font-medium text-white/80">আমি</span>
            <Segmented
              label="পাত্র বা পাত্রী"
              value={draft.gender}
              onChange={(v) => set("gender", v)}
              options={[
                { value: "male", label: "পাত্র" },
                { value: "female", label: "পাত্রী" },
              ]}
            />
          </div>
          <Field label="পেশা">
            <input value={draft.profession} onChange={(e) => set("profession", e.target.value)} className={inputClass} />
          </Field>
          <Field label="জেলা">
            <input
              list="bn-locations"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputClass}
            />
            <datalist id="bn-locations">
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
          <Field label="শিক্ষা">
            <input value={draft.education} onChange={(e) => set("education", e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={`নিজের সম্পর্কে (${toBn(draft.bio.length)}/১৬০)`}>
              <textarea
                value={draft.bio}
                onChange={(e) => set("bio", e.target.value.slice(0, 160))}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium text-white/80">ছবির রঙ ও ত্বকের রং</legend>
          <div className="flex flex-wrap items-center gap-2">
            {data.avatarThemes.map((t, i) => (
              <button
                key={i}
                type="button"
                aria-label={`রঙ ${toBn(i + 1)}`}
                aria-pressed={draft.theme === i}
                onClick={() => set("theme", i)}
                className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-[#1d0b36] transition ${
                  draft.theme === i ? "ring-white" : "ring-transparent hover:ring-white/40"
                }`}
                style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})` }}
              />
            ))}
            <span className="mx-2 h-6 w-px bg-white/20" aria-hidden="true" />
            {data.skinTones.map((c, i) => (
              <button
                key={c}
                type="button"
                aria-label={`ত্বকের রং ${toBn(i + 1)}`}
                aria-pressed={draft.skin === i}
                onClick={() => set("skin", i)}
                className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-[#1d0b36] transition ${
                  draft.skin === i ? "ring-white" : "ring-transparent hover:ring-white/40"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 font-semibold text-white/85 hover:bg-white/10"
          >
            <LogOut size={18} /> লগআউট
          </button>
          <button
            onClick={save}
            className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-600 py-3 font-bold shadow-lg shadow-rose-900/40 hover:brightness-110"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Settings popup                                                             */
/* -------------------------------------------------------------------------- */

function SettingsModal({
  settings,
  onChange,
  onClearData,
  onClose,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClearData: () => void;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Modal label="সেটিংস" onClose={onClose}>
      <div className="p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <SettingsIcon className="text-rose-300" size={24} /> সেটিংস
        </h2>

        <div className="mt-5 space-y-3">
          <Switch
            label="৩ডি ব্যাকগ্রাউন্ড ও হার্ট"
            hint="ফোন ধীর হলে বন্ধ রাখুন। ব্যাটারিও কম খরচ হবে।"
            checked={settings.effects3d}
            onChange={(v) => onChange({ ...settings, effects3d: v })}
          />
          <Switch
            label="কার্ড টিল্ট অ্যানিমেশন"
            hint="মাউস নিলে কার্ড হেলে যায় (শুধু কম্পিউটারে)।"
            checked={settings.tilt}
            onChange={(v) => onChange({ ...settings, tilt: v })}
          />

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="font-semibold">প্রতি পেজে প্রোফাইল</p>
            <div className="mt-3">
              <Segmented
                label="প্রতি পেজে প্রোফাইল"
                value={settings.pageSize}
                onChange={(v) => onChange({ ...settings, pageSize: v })}
                options={[
                  { value: 8, label: "৮টি" },
                  { value: 12, label: "১২টি" },
                  { value: 16, label: "১৬টি" },
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="font-semibold">আমার প্রোফাইল কারা দেখবে</p>
            <p className="mb-3 text-sm text-white/60">সার্ভার যুক্ত হলে এটি কার্যকর হবে। এখন শুধু সংরক্ষিত থাকে।</p>
            <Segmented
              label="প্রোফাইল দৃশ্যমানতা"
              value={settings.visibility}
              onChange={(v) => onChange({ ...settings, visibility: v })}
              options={[
                { value: "all", label: "সবাই" },
                { value: "verified", label: "ভেরিফাইড" },
                { value: "hidden", label: "কেউ না" },
              ]}
            />
          </div>

          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
            <p className="flex items-center gap-2 font-semibold text-rose-100">
              <Trash2 size={18} /> ডেটা মুছুন
            </p>
            <p className="mt-1 text-sm text-white/65">পছন্দের তালিকা, প্রস্তাব, অ্যাকাউন্ট ও সেটিংস এই ব্রাউজার থেকে মুছে যাবে।</p>
            <button
              onClick={() => (confirming ? onClearData() : setConfirming(true))}
              className={`mt-3 rounded-xl px-4 py-2 text-sm font-bold transition ${
                confirming ? "bg-rose-500 hover:bg-rose-400" : "border border-rose-300/50 text-rose-100 hover:bg-white/10"
              }`}
            >
              {confirming ? "নিশ্চিত করুন, সব মুছে ফেলুন" : "সব ডেটা মুছুন"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  // filters
  const [gender, setGender] = useState<"all" | Gender>("all");
  const [ageIdx, setAgeIdx] = useState(0);
  const [location, setLocation] = useState("all");
  const [sort, setSort] = useState<SortKey>("new");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [visible, setVisible] = useState(DEFAULT_SETTINGS.pageSize);

  // ui
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [proposals, setProposals] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [sessionContact, setSessionContact] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [modal, setModal] = useState<null | "login" | "profile" | "settings">(null);
  const [loginTab, setLoginTab] = useState<"login" | "register">("login");
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const account = sessionContact ? accounts[sessionContact] ?? null : null;

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // load saved data once
  useEffect(() => {
    setFavorites(new Set(readJSON<number[]>(KEYS.fav, [])));
    setProposals(new Set(readJSON<number[]>(KEYS.proposals, [])));
    setSettings({ ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) });
    setAccounts(readJSON<Record<string, Account>>(KEYS.accounts, {}));
    setSessionContact(readJSON<string | null>(KEYS.session, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(KEYS.fav, [...favorites]);
  }, [favorites, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.proposals, [...proposals]);
  }, [proposals, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.settings, settings);
  }, [settings, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.accounts, accounts);
  }, [accounts, hydrated]);
  useEffect(() => {
    if (hydrated) writeJSON(KEYS.session, sessionContact);
  }, [sessionContact, hydrated]);

  // close the account dropdown on outside click / Esc
  useEffect(() => {
    if (!userMenu) return;
    const onDown = (e: PointerEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUserMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenu]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // reset pagination when filters change
  useEffect(() => {
    setVisible(settings.pageSize);
  }, [gender, ageIdx, location, sort, debouncedQuery, onlyFav, settings.pageSize]);

  const allProfiles = data.profiles;
  const locations = useMemo(() => [...new Set(allProfiles.map((p) => p.location))].sort(), [allProfiles]);

  const results = useMemo(() => {
    const { min, max } = AGE_RANGES[ageIdx];
    const q = debouncedQuery.trim().toLowerCase();
    const list = allProfiles.filter((p) => {
      if (gender !== "all" && p.gender !== gender) return false;
      if (location !== "all" && p.location !== location) return false;
      if (p.age < min || p.age > max) return false;
      if (onlyFav && !favorites.has(p.id)) return false;
      if (q && !`${p.name} ${p.profession} ${p.education} ${p.interests.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "ageAsc") return a.age - b.age;
      if (sort === "ageDesc") return b.age - a.age;
      return Number(b.isNew) - Number(a.isNew) || b.id - a.id;
    });
    return list;
  }, [allProfiles, gender, ageIdx, location, sort, debouncedQuery, onlyFav, favorites]);

  const shown = results.slice(0, visible);
  const filtersActive = gender !== "all" || ageIdx !== 0 || location !== "all" || query !== "" || onlyFav;

  const toggleFavorite = (id: number) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const resetFilters = () => {
    setGender("all");
    setAgeIdx(0);
    setLocation("all");
    setQuery("");
    setOnlyFav(false);
  };

  const closeModal = useCallback(() => setModal(null), []);
  const closeSelected = useCallback(() => setSelected(null), []);

  const openLogin = (tab: "login" | "register" = "login", notice: string | null = null) => {
    setLoginTab(tab);
    setLoginNotice(notice);
    setUserMenu(false);
    setMenuOpen(false);
    setModal("login");
  };

  const openProfile = () => {
    setUserMenu(false);
    setMenuOpen(false);
    if (!account) {
      openLogin("login", "প্রোফাইল দেখতে আগে লগইন করুন।");
      return;
    }
    setModal("profile");
  };

  const openSettings = () => {
    setUserMenu(false);
    setMenuOpen(false);
    setModal("settings");
  };

  const handleAuth = (v: AuthValues) => {
    const existing = accounts[v.contact];
    const acc = existing && v.mode === "login" ? existing : newAccount(v.contact, v.name, v.gender, existing);
    setAccounts((prev) => ({ ...prev, [acc.contact]: acc }));
    setSessionContact(acc.contact);
    if (!existing || v.mode === "register") {
      setModal("profile");
      notify(`স্বাগতম, ${acc.name}! প্রোফাইল সম্পূর্ণ করুন।`);
    } else {
      setModal(null);
      notify(`আবার স্বাগতম, ${acc.name}!`);
    }
  };

  const saveAccount = (a: Account) => {
    setAccounts((prev) => ({ ...prev, [a.contact]: a }));
    setModal(null);
    notify("প্রোফাইল সংরক্ষিত হয়েছে।");
  };

  const logout = () => {
    setSessionContact(null);
    setModal(null);
    setUserMenu(false);
    notify("লগআউট হয়েছে।");
  };

  const clearData = () => {
    setFavorites(new Set());
    setProposals(new Set());
    setAccounts({});
    setSessionContact(null);
    setSettings(DEFAULT_SETTINGS);
    setModal(null);
    notify("এই ব্রাউজারের সব ডেটা মুছে ফেলা হয়েছে।");
  };

  const sendProposal = (user: Profile) => {
    if (!account) {
      setSelected(null);
      openLogin("login", `${user.name}-কে প্রস্তাব পাঠাতে আগে লগইন করুন।`);
      return;
    }
    if (proposals.has(user.id)) {
      notify("এই প্রোফাইলে আগেই প্রস্তাব পাঠানো হয়েছে।");
      return;
    }
    setProposals((prev) => new Set(prev).add(user.id));
    notify(`${user.name}-কে প্রস্তাব পাঠানো হয়েছে।`);
  };

  const headline = gender === "female" ? "আপনার জীবনসঙ্গিনী খুঁজে নিন" : "আপনার জীবনসঙ্গী খুঁজে নিন";

  const fieldClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-white outline-none placeholder:text-white/50 focus:border-rose-300 focus:ring-2 focus:ring-rose-300/40";
  const glass = "border border-white/15 bg-white/10 backdrop-blur-xl";

  return (
    <div className="bn-root relative min-h-screen text-white">
      <style>{PAGE_CSS}</style>

      {/* Bold background: gradient + live 3D layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 50% at 15% 10%, rgba(225,29,72,0.35), transparent 60%), radial-gradient(60% 50% at 90% 30%, rgba(147,51,234,0.4), transparent 60%), linear-gradient(160deg, #16041f 0%, #1f0a3d 50%, #0c0a2a 100%)",
        }}
        aria-hidden="true"
      />
      {settings.effects3d && <Background3D />}

      <div className="relative z-10 pb-28 md:pb-0">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#16041f]/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="#top" className="flex items-center gap-2">
              <span className="rounded-lg bg-rose-500 p-2 shadow-lg shadow-rose-900/50">
                <Heart className="fill-current text-white" size={22} />
              </span>
              <span className="text-2xl font-bold">বন্ধন</span>
            </a>

            <div className="hidden gap-8 font-medium text-white/80 md:flex">
              <a href="#top" className="transition hover:text-rose-300">হোম</a>
              <a href="#profiles" className="transition hover:text-rose-300">পাত্র-পাত্রী</a>
              <a href="#stories" className="transition hover:text-rose-300">সফল গল্প</a>
              <a href="#packages" className="transition hover:text-rose-300">প্যাকেজ</a>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="নোটিফিকেশন"
                onClick={() => notify("নতুন কোনো নোটিফিকেশন নেই।")}
                className="rounded-full p-2 text-white/70 hover:bg-white/10"
              >
                <Bell size={22} />
              </button>
              <button
                aria-label="সেটিংস"
                onClick={openSettings}
                className="rounded-full p-2 text-white/70 hover:bg-white/10"
              >
                <SettingsIcon size={22} />
              </button>
              {account ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenu}
                    aria-label="অ্যাকাউন্ট মেনু"
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1 pr-2 hover:bg-white/20 sm:pr-3"
                  >
                    <AvatarArt theme={account.theme} skin={account.skin} hair={1} gender={account.gender} className="h-8 w-8 rounded-full" />
                    <span className="hidden max-w-[7rem] truncate text-sm font-semibold sm:block">{account.name}</span>
                    <ChevronDown size={16} className="text-white/70" />
                  </button>
                  {userMenu && (
                    <div role="menu" className="bn-pop absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-white/15 bg-[#1d0b36] p-1.5 shadow-2xl">
                      <p className="truncate px-3 py-2 text-sm text-white/55">{account.contact}</p>
                      <button role="menuitem" onClick={openProfile} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-white/10">
                        <User size={18} className="text-rose-300" /> আমার প্রোফাইল
                      </button>
                      <button role="menuitem" onClick={openSettings} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-white/10">
                        <SettingsIcon size={18} className="text-rose-300" /> সেটিংস
                      </button>
                      <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-white/10">
                        <LogOut size={18} className="text-rose-300" /> লগআউট
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openLogin()}
                  className="rounded-full bg-rose-500 px-5 py-2 font-semibold shadow-lg shadow-rose-900/40 transition hover:bg-rose-400"
                >
                  লগইন
                </button>
              )}
              <button
                aria-label="মেনু"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 md:hidden"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
              {[
                ["হোম", "#top"],
                ["পাত্র-পাত্রী", "#profiles"],
                ["সফল গল্প", "#stories"],
                ["প্যাকেজ", "#packages"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
              <div className="my-1 border-t border-white/10" />
              {account ? (
                <>
                  <button onClick={openProfile} className="rounded-lg px-3 py-3 text-left font-medium text-white/90 hover:bg-white/10">আমার প্রোফাইল</button>
                  <button onClick={openSettings} className="rounded-lg px-3 py-3 text-left font-medium text-white/90 hover:bg-white/10">সেটিংস</button>
                  <button onClick={logout} className="rounded-lg px-3 py-3 text-left font-medium text-white/90 hover:bg-white/10">লগআউট</button>
                </>
              ) : (
                <button onClick={() => openLogin()} className="rounded-lg px-3 py-3 text-left font-medium text-white/90 hover:bg-white/10">লগইন / নতুন অ্যাকাউন্ট</button>
              )}
            </div>
          )}
        </nav>

        {/* Hero */}
        <header id="top" className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="order-2 text-center md:order-1 md:text-left">
            <h1 className="text-3xl font-extrabold leading-snug sm:text-4xl lg:text-5xl">{headline}</h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/75 md:mx-0">
              যাচাইকৃত বায়োডাটা থেকে বেছে নিন পছন্দের মানুষকে। পরিবারের সঙ্গে আলোচনা করে এগিয়ে যান নিশ্চিন্তে।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a
                href="#profiles"
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold shadow-lg shadow-rose-900/50 transition hover:bg-rose-400"
              >
                <Search size={20} /> প্রোফাইল খুঁজুন
              </a>
              <a
                href="#packages"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition hover:bg-white/20 ${glass}`}
              >
                <Crown size={20} /> প্যাকেজ দেখুন
              </a>
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 text-center md:text-left">
              {[
                ["সদস্য", data.stats.members],
                ["যাচাইকৃত", data.stats.verified],
                ["সফল বিয়ে", data.stats.marriages],
              ].map(([label, value]) => (
                <div key={label as string} className={`rounded-2xl px-3 py-3 ${glass}`}>
                  <dd className="text-xl font-bold sm:text-2xl">{fmt(value as number)}</dd>
                  <dt className="text-xs text-white/65 sm:text-sm">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative order-1 mx-auto aspect-square w-full max-w-[260px] sm:max-w-sm md:order-2 md:max-w-md">
            <div className="absolute inset-6 rounded-full bg-rose-500/25 blur-3xl" aria-hidden="true" />
            <div className="relative h-full w-full">
              {settings.effects3d ? (
                <HeroHeart />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Heart className="h-1/2 w-1/2 fill-rose-500 text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Filters */}
        <section id="profiles" className="mx-auto max-w-6xl scroll-mt-20 px-4">
          <div className={`grid gap-3 rounded-3xl p-4 shadow-2xl sm:grid-cols-2 lg:grid-cols-4 ${glass}`}>
            <select aria-label="পাত্র/পাত্রী" style={selectStyle} value={gender} onChange={(e) => setGender(e.target.value as "all" | Gender)} className={fieldClass}>
              <option value="all">পাত্র ও পাত্রী</option>
              <option value="male">পাত্র</option>
              <option value="female">পাত্রী</option>
            </select>

            <select aria-label="বয়স" style={selectStyle} value={ageIdx} onChange={(e) => setAgeIdx(Number(e.target.value))} className={fieldClass}>
              {AGE_RANGES.map((r, i) => (
                <option key={r.label} value={i}>{r.label}</option>
              ))}
            </select>

            <select aria-label="জেলা" style={selectStyle} value={location} onChange={(e) => setLocation(e.target.value)} className={fieldClass}>
              <option value="all">সব জেলা</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select aria-label="সাজানো" style={selectStyle} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={fieldClass}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="নাম, পেশা বা শখ লিখে খুঁজুন"
              aria-label="খুঁজুন"
              className={`${fieldClass} sm:col-span-2 lg:col-span-3`}
            />

            <button
              onClick={() => setOnlyFav((v) => !v)}
              aria-pressed={onlyFav}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 font-semibold transition sm:col-span-2 lg:col-span-1 ${
                onlyFav ? "border-rose-300 bg-rose-500 text-white" : "border-white/15 bg-white/10 text-white/90 hover:bg-white/20"
              }`}
            >
              <Heart size={18} className={onlyFav ? "fill-current" : ""} />
              পছন্দের তালিকা ({toBn(favorites.size)})
            </button>
          </div>
        </section>

        {/* Results */}
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <Users className="text-rose-300" />
              {`${toBn(results.length)}টি প্রোফাইল`}
            </h2>
            {filtersActive && (
              <button onClick={resetFilters} className="text-sm font-semibold text-rose-300 underline">
                ফিল্টার মুছুন
              </button>
            )}
          </div>

          {results.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/25 p-10 text-center">
              <p className="text-white/75">
                {onlyFav && favorites.size === 0
                  ? "এখনো কাউকে পছন্দের তালিকায় রাখা হয়নি। কার্ডের হার্ট চাপুন।"
                  : "এই ফিল্টারে কোনো প্রোফাইল পাওয়া যায়নি।"}
              </p>
              <button onClick={resetFilters} className="mt-3 font-semibold text-rose-300 underline">
                সব ফিল্টার মুছে ফেলুন
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((user) => {
                const liked = favorites.has(user.id);
                return (
                  <TiltCard enabled={settings.tilt} key={user.id} className="rounded-[2rem]">
                    <article className={`overflow-hidden rounded-[2rem] shadow-2xl shadow-black/30 ${glass}`}>
                      <div className="relative h-44">
                        <Avatar profile={user} />
                        <div className="absolute left-4 top-4 flex gap-2">
                          {user.isNew && (
                            <span className="rounded-full bg-emerald-400 px-3 py-0.5 text-xs font-bold text-emerald-950">নতুন</span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleFavorite(user.id)}
                          aria-pressed={liked}
                          aria-label={liked ? `${user.name}-কে পছন্দ থেকে সরান` : `${user.name}-কে পছন্দের তালিকায় যোগ করুন`}
                          className="absolute right-4 top-4 rounded-full bg-black/25 p-2 backdrop-blur-md transition hover:bg-black/40"
                        >
                          <Heart size={20} className={liked ? "fill-rose-400 text-rose-400" : "text-white"} />
                        </button>
                      </div>

                      <div className="p-5">
                        <h3 className="flex items-center gap-1.5 text-xl font-bold">
                          {user.name}
                          {user.verified && <BadgeCheck size={18} className="shrink-0 text-emerald-400" aria-label="ভেরিফাইড" />}
                        </h3>
                        <p className="mb-3 text-sm font-medium text-rose-300">{user.profession}</p>
                        <div className="flex justify-between border-t border-white/10 pt-3 text-sm text-white/70">
                          <span>বয়স: {toBn(user.age)}</span>
                          <span>{user.location}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {user.interests.slice(0, 2).map((i) => (
                            <span key={i} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">{i}</span>
                          ))}
                        </div>
                        <button
                          onClick={() => setSelected(user)}
                          className="mt-4 w-full rounded-2xl bg-white/10 py-3 font-bold transition-colors hover:bg-rose-500"
                        >
                          বায়োডাটা দেখুন
                        </button>
                      </div>
                    </article>
                  </TiltCard>
                );
              })}
          </div>

          {results.length > visible && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisible((v) => v + settings.pageSize)}
                className={`rounded-full px-8 py-3 font-semibold transition hover:bg-white/20 ${glass}`}
              >
                আরও দেখুন ({toBn(results.length - visible)}টি বাকি)
              </button>
            </div>
          )}
        </main>

        {/* Success stories */}
        <section id="stories" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
          <h2 className="mb-6 text-2xl font-bold">সফল গল্প</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {data.stories.map((s) => (
              <TiltCard enabled={settings.tilt} key={s.id} className="rounded-3xl">
                <figure className={`h-full rounded-3xl p-6 ${glass}`}>
                  <Quote className="text-rose-300" size={28} />
                  <blockquote className="mt-3 text-white/85">{s.quote}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {s.couple} <span className="font-normal text-white/60">— {s.location}</span>
                  </figcaption>
                </figure>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20">
          <h2 className="mb-6 text-2xl font-bold">প্যাকেজ</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {data.packages.map((p) => (
              <TiltCard enabled={settings.tilt} key={p.id} className="rounded-3xl">
                <div
                  className={`flex h-full flex-col rounded-3xl p-6 ${
                    p.highlight ? "border border-rose-300/60 bg-gradient-to-br from-rose-500/40 to-purple-600/40 backdrop-blur-xl" : glass
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    {p.highlight && <Crown className="text-amber-300" size={22} aria-label="সেরা বিকল্প" />}
                  </div>
                  <p className="mt-3 text-3xl font-extrabold">
                    {p.price === 0 ? "বিনামূল্যে" : `৳${fmt(p.price)}`}
                    <span className="ml-2 text-sm font-normal text-white/65">/ {p.period}</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-white/85">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={16} className="mt-1 shrink-0 text-emerald-300" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => notify(`${p.name} প্যাকেজ শীঘ্রই চালু হবে।`)}
                    className={`mt-6 rounded-2xl py-3 font-bold transition ${
                      p.highlight ? "bg-rose-500 hover:bg-rose-400" : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    বেছে নিন
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/55">
          © বন্ধন · এই পেজের প্রোফাইল ও সংখ্যা ডেমো ডেটা।
        </footer>
      </div>

      {/* Biodata popup */}
      {selected && (
        <Modal label={`${selected.name}-এর বায়োডাটা`} onClose={closeSelected}>
          <div
            className="h-24"
            style={{
              background: `linear-gradient(120deg, ${data.avatarThemes[selected.avatar.theme].bg[0]}, ${data.avatarThemes[selected.avatar.theme].bg[1]})`,
            }}
            aria-hidden="true"
          />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex items-end gap-4">
              <Avatar profile={selected} big />
              <div className="min-w-0 pb-1">
                <h3 className="flex items-center gap-1.5 text-2xl font-bold">
                  <span className="truncate">{selected.name}</span>
                  {selected.verified && <BadgeCheck size={20} className="shrink-0 text-emerald-400" aria-label="ভেরিফাইড" />}
                </h3>
                <p className="text-rose-300">{selected.profession}</p>
              </div>
            </div>

            <p className="mt-5 text-white/80">{selected.bio}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selected.interests.map((i) => (
                <span key={i} className="rounded-full bg-white/10 px-3 py-1 text-sm">{i}</span>
              ))}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ["বয়স", toBn(selected.age)],
                ["উচ্চতা", selected.height],
                ["জেলা", selected.location],
                ["ধর্ম", selected.religion],
                ["বৈবাহিক অবস্থা", selected.maritalStatus],
                ["শিক্ষা", selected.education],
                ["আয়", selected.income],
                ["পরিবার", selected.family],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/5 p-3">
                  <dt className="text-white/55">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-xl bg-white/5 p-3 text-sm">
              <p className="text-white/55">জীবনসঙ্গী সম্পর্কে প্রত্যাশা</p>
              <p className="font-semibold">{selected.expectation}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => toggleFavorite(selected.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-300/50 py-3 font-semibold text-rose-200 hover:bg-white/10"
              >
                <Heart size={18} className={favorites.has(selected.id) ? "fill-rose-400 text-rose-400" : ""} />
                {favorites.has(selected.id) ? "পছন্দের তালিকায় আছে" : "পছন্দ করুন"}
              </button>
              <button
                onClick={() => sendProposal(selected)}
                disabled={proposals.has(selected.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 font-semibold hover:bg-rose-400 disabled:bg-emerald-600 disabled:opacity-90"
              >
                {proposals.has(selected.id) ? <Check size={18} /> : <MessageCircle size={18} />}
                {proposals.has(selected.id) ? "প্রস্তাব পাঠানো হয়েছে" : "প্রস্তাব পাঠান"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "login" && (
        <LoginModal initialTab={loginTab} notice={loginNotice} samples={data.profiles} onClose={closeModal} onSubmit={handleAuth} />
      )}
      {modal === "profile" && account && (
        <ProfileModal
          account={account}
          favoritesCount={favorites.size}
          proposalsCount={proposals.size}
          locations={locations}
          onClose={closeModal}
          onSave={saveAccount}
          onLogout={logout}
        />
      )}
      {modal === "settings" && (
        <SettingsModal settings={settings} onChange={setSettings} onClearData={clearData} onClose={closeModal} />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-2xl md:bottom-8"
        >
          {toast}
        </div>
      )}

      {/* Floating mobile nav */}
      <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-8 rounded-full border border-white/15 bg-[#1d0b36]/85 px-7 py-3.5 shadow-2xl backdrop-blur-xl md:hidden">
        <a href="#top" aria-label="হোম"><Heart className="fill-current text-rose-400" size={24} /></a>
        <a href="#profiles" aria-label="খুঁজুন"><Search className="text-white/70" size={24} /></a>
        <button aria-label="আমার প্রোফাইল" onClick={openProfile}>
          {account ? (
            <AvatarArt theme={account.theme} skin={account.skin} hair={1} gender={account.gender} className="h-7 w-7 rounded-full ring-2 ring-rose-300" />
          ) : (
            <User className="text-white/70" size={24} />
          )}
        </button>
        <button
          aria-label="মেনু"
          onClick={() => {
            setMenuOpen((v) => !v);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Menu className="text-white/70" size={24} />
        </button>
      </div>
    </div>
  );
}
