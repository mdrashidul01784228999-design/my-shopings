






"use client";

import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers, HeartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFemale, FaLaptopCode, FaMale } from "react-icons/fa";

// টাইপস
type Particle = {
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  colorIndex: number;
  shapeIndex: number;
  rotate: number;
  opacity: number;
  parallax: number;
  id: number;
};

type Burst = {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
};

type Category = {
  title: string;
  icon: React.ReactNode;
  img: string;
  color: string;
  link: string;
};

const shapes = ["circle", "star", "triangle"];
const colors = [
  "#FF3CFF",
  "#00FFFF",
  "#FFAA00",
  "#FF0055",
  "#00FFAA",
  "#FF33AA",
  "#33FFAA",
];

/* ------------------------------------------------------------------ */
/*  Three.js লাক্সারি ৩ডি ব্যাকগ্রাউন্ড (গোল্ড, গ্লাস, জেম, ধুলো)          */
/* ------------------------------------------------------------------ */
const LuxuryScene = memo(function LuxuryScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 640;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 12);

    // রিফ্লেকশনের জন্য এনভায়রনমেন্ট (এটাই মেটাল/গ্লাসকে প্রিমিয়াম দেখায়)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // লাইট
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const l1 = new THREE.PointLight(0xff3cff, 60, 40);
    l1.position.set(-8, 5, 4);
    const l2 = new THREE.PointLight(0x00ffff, 60, 40);
    l2.position.set(8, -4, 4);
    const l3 = new THREE.PointLight(0xffc857, 50, 40);
    l3.position.set(0, 8, 6);
    scene.add(l1, l2, l3);

    // ম্যাটেরিয়াল
    const gold = new THREE.MeshPhysicalMaterial({ color: 0xffc857, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 });
    const rose = new THREE.MeshPhysicalMaterial({ color: 0xff5fa2, metalness: 0.9, roughness: 0.2, clearcoat: 1 });
    const cyan = new THREE.MeshPhysicalMaterial({ color: 0x4de8ff, metalness: 0.9, roughness: 0.18, clearcoat: 1 });
    const violet = new THREE.MeshPhysicalMaterial({ color: 0xa855f7, metalness: 0.9, roughness: 0.2, clearcoat: 1 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.02,
      transmission: 1,
      thickness: 1.4,
      ior: 1.5,
      transparent: true,
      envMapIntensity: 1.5,
    });
    const mats = [gold, rose, cyan, violet];

    const geos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusKnotGeometry(0.7, 0.22, 160, 24),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.28, 24, 64),
      new THREE.DodecahedronGeometry(0.9, 0),
      new THREE.SphereGeometry(0.9, 48, 48),
    ];

    const group = new THREE.Group();
    scene.add(group);

    type Floater = { mesh: THREE.Mesh; baseY: number; speed: number; phase: number; spin: number };
    const floaters: Floater[] = [];
    const count = isMobile ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const useGlass = !isMobile && i % 5 === 4;
      const mesh = new THREE.Mesh(geos[i % geos.length], useGlass ? glass : mats[i % mats.length]);
      const s = 0.5 + Math.random() * 0.9;
      mesh.scale.setScalar(s);
      mesh.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, -8 + Math.random() * 6);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(mesh);
      floaters.push({
        mesh,
        baseY: mesh.position.y,
        speed: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        spin: 0.15 + Math.random() * 0.4,
      });
    }

    // সোনালি রিং হ্যালো
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.04, 16, 220), gold);
    ring1.position.z = -9;
    ring1.rotation.x = 1.1;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.03, 16, 240), rose);
    ring2.position.z = -10;
    ring2.rotation.set(0.5, 0.8, 0);
    group.add(ring1, ring2);

    // সোনালি ধুলো (গ্লিটার)
    const dustCount = isMobile ? 160 : 420;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 2] = -12 + Math.random() * 14;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xffe27a,
        size: 0.06,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(dust);

    // ইনপুট
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollPos = 0;
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scrollPos = window.scrollY;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.max(mount.clientHeight, 1);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime() * (reduce ? 0.15 : 1);

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      group.rotation.y = mouse.x * 0.25 + t * 0.03;
      group.rotation.x = mouse.y * 0.12;
      camera.position.x = mouse.x * 0.8;
      camera.position.y = -mouse.y * 0.5 - scrollPos * 0.003;
      camera.lookAt(0, 0, 0);

      floaters.forEach((f) => {
        f.mesh.rotation.x += 0.004 * f.spin * (reduce ? 0.2 : 1);
        f.mesh.rotation.y += 0.006 * f.spin * (reduce ? 0.2 : 1);
        f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.7;
      });
      ring1.rotation.z = t * 0.12;
      ring2.rotation.z = -t * 0.08;
      dust.rotation.y = t * 0.02;
      dust.position.y = Math.sin(t * 0.3) * 0.4;

      l1.position.x = -8 + Math.sin(t * 0.6) * 3;
      l2.position.x = 8 + Math.cos(t * 0.5) * 3;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => x.dispose());
      });
      geos.forEach((g) => g.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className="absolute inset-0 pointer-events-none" />;
});

const shapeClip: Record<string, string | undefined> = {
  circle: undefined,
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
};

/* ------------------------------------------------------------------ */
/*  ভাসমান পার্টিকেল লেয়ার (মাউস + স্ক্রলে প্যারালাক্স)                  */
/* ------------------------------------------------------------------ */
const ParticleLayer = memo(function ParticleLayer({
  particles,
  scrollY,
  pointerPos,
  windowSize,
}: {
  particles: Particle[];
  scrollY: number;
  pointerPos: { x: number; y: number };
  windowSize: { width: number; height: number };
}) {
  const cx = windowSize.width / 2;
  const cy = windowSize.height / 2;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const color = colors[p.colorIndex];
        const shape = shapes[p.shapeIndex];
        const dx = (pointerPos.x - cx) * p.parallax * 0.04;
        const dy = (pointerPos.y - cy) * p.parallax * 0.04 - scrollY * p.parallax * 0.05;
        return (
          <div
            key={p.id}
            className="absolute transition-transform duration-300 ease-out"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: `translate3d(${dx}px, ${dy}px, 0)`,
            }}
          >
            <motion.div
              animate={{
                y: [0, -40, 0],
                x: [0, 14, 0],
                rotate: [p.rotate, p.rotate + 180, p.rotate + 360],
                opacity: [p.opacity, p.opacity + 0.3, p.opacity],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: p.size,
                height: p.size,
                background: color,
                clipPath: shapeClip[shape],
                borderRadius: shape === "circle" ? "9999px" : undefined,
                boxShadow: `0 0 ${p.size * 2}px ${color}`,
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  ৩ডি ভাসমান কার্ড                                                  */
/* ------------------------------------------------------------------ */
const CategoryCard = memo(function CategoryCard({
  cat,
  index,
}: {
  cat: Category;
  index: number;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 16 });
  const sy = useSpring(my, { stiffness: 160, damping: 16 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const shineX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const floatDuration = 4 + (index % 4) * 0.7;

  return (
    // এন্ট্রি অ্যানিমেশন
    <motion.div
      initial={{ opacity: 0, y: 70, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.12, type: "spring", bounce: 0.35 }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      {/* ভাসমান অ্যানিমেশন */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.25,
        }}
        className="relative"
      >
        {/* নিচের ভাসমান ছায়া/গ্লো */}
        <motion.div
          aria-hidden
          animate={{ scaleX: [1, 0.8, 1], opacity: [0.55, 0.3, 0.55] }}
          transition={{
            duration: floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.25,
          }}
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-[100%] blur-xl bg-gradient-to-r ${cat.color}`}
        />

        {/* ৩ডি টিল্ট */}
        <motion.div
          onMouseMove={handleMove}
          onMouseLeave={reset}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative cursor-pointer group"
        >
          {/* কার্ডের মুখ */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-amber-200/40">
            <Image
              src={cat.img}
              alt={cat.title}
              width={500}
              height={300}
              className="w-full h-48 sm:h-56 md:h-60 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`}
            />
            {/* গ্লাস রিফ্লেকশন */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/40 pointer-events-none" />
            {/* মাউস অনুসরণ করা আলো */}
            <motion.div
              aria-hidden
              className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ left: shineX, top: shineY }}
            />
            {/* ঝলমলে স্পার্কল */}
            {[
              { t: "12%", l: "14%", d: 0 },
              { t: "22%", l: "82%", d: 0.8 },
              { t: "78%", l: "70%", d: 1.5 },
            ].map((s, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
                style={{ top: s.t, left: s.l, boxShadow: "0 0 12px 4px rgba(255,226,122,0.9)" }}
                animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: s.d + index * 0.3 }}
              />
            ))}
            {/* শাইন সোয়াইপ */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -inset-y-4 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-[500%] transition-transform duration-1000 ease-out" />
            </div>
          </div>

          {/* গ্লোয়িং বর্ডার */}
          <div
            aria-hidden
            className="absolute -inset-[2px] rounded-3xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              transform: "translateZ(10px)",
              padding: 2,
              background:
                "linear-gradient(120deg,#ffe27a,#fff7d1,#ff9ad5,#7af0ff,#ffe27a)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 5s ease-in-out infinite",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              filter: "drop-shadow(0 0 8px rgba(255,226,122,0.7))",
            }}
          />

          {/* কনটেন্ট - সামনে ভাসমান (translateZ) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-3 sm:p-4 space-y-2 sm:space-y-3"
            style={{ transform: "translateZ(70px)" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] relative flex items-center justify-center"
            >
              {cat.icon}
            </motion.div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              {cat.title}
            </h3>
            <Link href={cat.link}>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  textShadow: "0 0 15px #fff",
                  boxShadow: "0 0 20px #fff",
                }}
                className="mt-1 sm:mt-2 px-4 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/25 transition-all duration-300"
              >
                Explore Now →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  মূল সেকশন                                                         */
/* ------------------------------------------------------------------ */
export default function AllCategorySection() {
  const [scrollY, setScrollY] = useState(0);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [clickBursts, setClickBursts] = useState<Burst[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // স্ক্রল, মাউস ও সাইজ ট্র্যাকিং
  useEffect(() => {
    const onResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const onScroll = () => setScrollY(window.scrollY);
    onResize();
    onScroll();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // পার্টিকেল তৈরি (ক্লায়েন্টে, হাইড্রেশন সমস্যা এড়াতে)
  useEffect(() => {
    const count = window.innerWidth < 640 ? 18 : 36;
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 4 + Math.random() * 10,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
        colorIndex: Math.floor(Math.random() * colors.length),
        shapeIndex: Math.floor(Math.random() * shapes.length),
        rotate: Math.random() * 360,
        opacity: 0.35 + Math.random() * 0.3,
        parallax: 1 + Math.random() * 4,
      }))
    );
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setPointerPos({ x: e.clientX, y: e.clientY });
  }, []);

  // ক্লিক করলে রঙিন বার্স্ট
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now() + Math.random();
    const burst: Burst = {
      id,
      x: e.clientX,
      y: e.clientY,
      size: 60 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setClickBursts((prev) => [...prev, burst]);
    setTimeout(() => setClickBursts((prev) => prev.filter((b) => b.id !== id)), 900);
  }, []);

  // ক্যাটাগরি ডাটা
  const categories: Category[] = useMemo(
    () => [
      {
        title: "নতুন পণ্য",
        icon: <ShoppingBag size={36} />,
        img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        color: "from-pink-500 to-purple-600",
        link: "/products/new",
      },
      {
        title: "পুরাতন পণ্য",
        icon: <Layers size={36} />,
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        color: "from-blue-500 to-cyan-500",
        link: "/products/old",
      },
      {
        title: "শেয়ার মার্কেট",
        icon: <TrendingUp size={36} />,
        img: "https://images.unsplash.com/photo-1569025690938-a00729c9e1e8",
        color: "from-green-500 to-emerald-500",
        link: "/share-market",
      },
      {
        title: "গেমস",
        icon: <Gamepad2 size={36} />,
        img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
        color: "from-yellow-500 to-orange-600",
        link: "/games",
      },
      {
        title: "লটারী স্পিন",
        icon: <Gift size={36} />,
        img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
        color: "from-red-500 to-pink-600",
        link: "/Lottery",
      },
      {
        title: "আইটি সমাধান",
        icon: (
          <div className="relative flex items-center justify-center w-12 h-12">
            {/* গ্লো ইফেক্ট ও অ্যানিমেশনসহ মডার্ন ল্যাপটপ/কোড আইকন */}
            <FaLaptopCode
              size={36}
              className="text-cyan-400 animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))" }}
            />
          </div>
        ),
        img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
        // একটি ভাইব্রেন্ট টেক-নিয়ন গ্রেডিয়েন্ট
        color: "from-cyan-500 via-blue-600 to-indigo-700 shadow-[0_0_20px_rgba(6,182,212,0.6)]",
        link: "/it-solution",
      },
      {
        title: "বিবাহ বন্ধন বা ঘটক",
        icon: (
          <div className="relative flex items-center justify-center w-14 h-10">
            <FaMale size={36} style={{ position: "absolute", marginLeft: "22px" }} />
            <FaFemale size={36} />
          </div>
        ),
        img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
        color: "from-red-500 to-pink-600",
        link: "/nikah",
      },
      {
        title: "অন্য সেবা",
        icon: <Layers size={36} />,
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        color: "from-indigo-500 to-violet-600",
        link: "/services",
      },
    ],
    []
  );

  return (
    <div
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 bg-black overflow-hidden"
    >
      {/* কাস্টম কীফ্রেম */}
      <style>{`
        @keyframes scroll { from { background-position: 0 0; } to { background-position: 0 60px; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-50px) scale(1.2); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,40px) scale(1.15); } }
        @keyframes orbFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,60px) scale(1.25); } }
        @media (prefers-reduced-motion: reduce) {
          .acs-orb, .acs-title { animation: none !important; }
        }
      `}</style>

      {/* Background Effects */}
      {/* গভীর রঙিন গ্রেডিয়েন্ট বেস */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1b0b3a_0%,#05010f_55%,#000_100%)] pointer-events-none" />

      {/* ভাসমান রঙিন অরব */}
      <div className="acs-orb absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-fuchsia-600/40 blur-[100px] pointer-events-none" style={{ animation: "orbFloat1 12s ease-in-out infinite" }} />
      <div className="acs-orb absolute top-1/3 -right-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-cyan-500/30 blur-[110px] pointer-events-none" style={{ animation: "orbFloat2 14s ease-in-out infinite" }} />
      <div className="acs-orb absolute -bottom-24 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/25 blur-[100px] pointer-events-none" style={{ animation: "orbFloat3 16s ease-in-out infinite" }} />

      {/* Three.js লাক্সারি ৩ডি দৃশ্য */}
      <LuxuryScene />

      {/* গ্রিড */}
      <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

      {/* Particles */}
      <ParticleLayer
        particles={particles}
        scrollY={scrollY}
        pointerPos={pointerPos}
        windowSize={windowSize}
      />

      {/* Burst effect */}
      <AnimatePresence>
        {clickBursts.map((b) => (
          <motion.span
            key={b.id}
            initial={{ opacity: 0.9, scale: 0 }}
            animate={{ opacity: 0, scale: 2.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="fixed z-50 rounded-full pointer-events-none"
            style={{
              left: b.x - b.size / 2,
              top: b.y - b.size / 2,
              width: b.size,
              height: b.size,
              border: `3px solid ${b.color}`,
              boxShadow: `0 0 30px ${b.color}, inset 0 0 20px ${b.color}`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* শিরোনাম */}
      <motion.h2
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="acs-title text-3xl sm:text-4xl md:text-5xl font-extrabold mb-12 sm:mb-16 z-10 relative text-center bg-clip-text text-transparent bg-[linear-gradient(90deg,#ff3cff,#00ffff,#ffaa00,#00ffaa,#ff3cff)] bg-[length:300%_100%] drop-shadow-[0_0_25px_rgba(255,60,255,0.45)]"
        style={{ animation: "gradientShift 6s ease-in-out infinite" }}
      >
        সব ক্যাটাগরি একসাথে
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 w-full max-w-7xl z-10 relative">
        {categories.map((cat, index) => (
          <CategoryCard key={index} cat={cat} index={index} />
        ))}
      </div>
    </div>
  );
}




// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers, HeartIcon } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { FaFemale, FaLaptopCode, FaMale } from "react-icons/fa";

// // টাইপস
// type Particle = {
//   top: number;
//   left: number;
//   size: number;
//   duration: number;
//   delay: number;
//   colorIndex: number;
//   shapeIndex: number;
//   rotate: number;
//   opacity: number;
//   parallax: number;
//   id: number;
// };

// type Burst = {
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   id: number;
// };

// export default function AllCategorySection() {
//   const [scrollY, setScrollY] = useState(0);
//   const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
//   const [clickBursts, setClickBursts] = useState<Burst[]>([]);



//   // ক্যাটাগরি ডাটা
//   const categories = [
//     {
//       title: "নতুন পণ্য",
//       icon: <ShoppingBag size={36} />,
//       img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
//       color: "from-pink-500 to-purple-600",
//   link: "/products/new",
//     },
//     {
//       title: "পুরাতন পণ্য",
//       icon: <Layers size={36} />,
//       img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
//       color: "from-blue-500 to-cyan-500",
//       link: "/products/old",
//     },
//     {
//       title: "শেয়ার মার্কেট",
//       icon: <TrendingUp size={36} />,
//       img: "https://images.unsplash.com/photo-1569025690938-a00729c9e1e8",
//       color: "from-green-500 to-emerald-500",
//       link: "/share-market",
//     },
//     {
//       title: "গেমস",
//       icon: <Gamepad2 size={36} />,
//       img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
//       color: "from-yellow-500 to-orange-600",
//          link: "/games",
//     },
//     {
//       title: "লটারী স্পিন",
//       icon: <Gift size={36} />,
//       img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
//       color: "from-red-500 to-pink-600",
//       link: "/Lottery",
//     },


// {
//   title: "আইটি সমাধান",
//   icon: (
//     <div className="relative flex items-center justify-center w-12 h-12">
//       {/* গ্লো ইফেক্ট ও অ্যানিমেশনসহ মডার্ন ল্যাপটপ/কোড আইকন */}
//       <FaLaptopCode 
//         size={36} 
//         className="text-cyan-400 animate-pulse" 
//         style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))" }}
//       />
      
//     </div>
//   ),
//   img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
//   // একটি ভাইব্রেন্ট টেক-নিয়ন গ্রেডিয়েন্ট
//   color: "from-cyan-500 via-blue-600 to-indigo-700 shadow-[0_0_20px_rgba(6,182,212,0.6)]",
//   link: "/it-solution", // লিংকটিও আইটির সাথে সামঞ্জস্যপূর্ণ করা হলো
// },


// {
//   title: "বিবাহ বন্ধন বা ঘটক",
//   icon: (
//     <>
//       <FaMale size={36} style={{position:'absolute',marginLeft:'22px'}} />
//       <FaFemale size={36} />
//     </>
//   ),
//   img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
//   color: "from-red-500 to-pink-600",
//   link: "/nikah",
// },
//     {
//       title: "অন্য সেবা",
//       icon: <Layers size={36} />,
//       img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
//       color: "from-indigo-500 to-violet-600",
//       link: "/services",
//     },
//   ];

//   const shapes = ["circle", "star", "triangle"];
//   const colors = [
//     "#FF3CFF",
//     "#00FFFF",
//     "#FFAA00",
//     " #FF0055",
//     "#00FFAA",
//     "#FF33AA",
//     "#33FFAA",
//   ];


//   return (
//     <div
//       className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-black overflow-hidden"
//     >
//       {/* Background Effects */}
//       <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
//       <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

//       <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 drop-shadow-lg z-10 relative">
//         সব ক্যাটাগরি একসাথে
//       </h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl z-10 relative">
//         {categories.map((cat, index) => (
//           <motion.div
//             key={index}
//             whileHover={{ scale: 1.08, rotate: 2 }}
//             whileTap={{ scale: 0.95 }}
//             className="relative rounded-3xl shadow-2xl overflow-hidden cursor-pointer group"
//           >
//             <Image
//               src={cat.img}
//               alt={cat.title}
//               width={500}
//               height={300}
//               className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
//             />
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`}
//             />

//             {/* Particles */}
      

//             {/* Burst effect */}
        

//             {/* Category Content */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-4 space-y-3">
//               <div className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
//                 {cat.icon}
//               </div>
//               <h3 className="text-lg md:text-xl font-semibold">{cat.title}</h3>
//               <Link href={cat.link}>
//                 <motion.button
//                   whileHover={{
//                     scale: 1.1,
//                     textShadow: "0 0 15px #fff",
//                     boxShadow: "0 0 20px #fff",
//                   }}
//                   className="mt-2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/20 transition-all duration-300"
//                 >
//                   Explore Now →
//                 </motion.button>
//               </Link>
//             </div>
//             <div className="absolute inset-0 rounded-3xl border-2 border-white/20 blur-md animate-pulse"></div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }


