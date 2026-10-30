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
  useScroll,
} from "framer-motion";
import { ShoppingBag, TrendingUp, Gamepad2, Gift, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaFemale, FaLaptopCode, FaMale } from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  টাইপস                                                             */
/* ------------------------------------------------------------------ */
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

type Spark = { dx: number; dy: number; c: string; s: number };

type Burst = {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
  sparks: Spark[];
};

type Category = {
  title: string;
  icon: React.ReactNode;
  img: string;
  color: string;
  glow: string; // কার্ডের নিজস্ব গ্লো রঙ
  link: string;
};

const shapes = ["circle", "star", "triangle"];
const colors = ["#FF3CFF", "#00FFFF", "#FFAA00", "#FF0055", "#00FFAA", "#FF33AA", "#33FFAA"];

const shapeClip: Record<string, string | undefined> = {
  circle: undefined,
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
};

/* ------------------------------------------------------------------ */
/*  Three.js ৩ডি ব্যাকগ্রাউন্ড (গোল্ড, গ্লাস, কয়েন, ওয়্যারফ্রেম, ধুলো)    */
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
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.set(0, 0, 12);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // লাইট (রঙ সময়ের সাথে বদলায়)
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const l1 = new THREE.PointLight(0xff3cff, 60, 40);
    l1.position.set(-8, 5, 4);
    const l2 = new THREE.PointLight(0x00ffff, 60, 40);
    l2.position.set(8, -4, 4);
    const l3 = new THREE.PointLight(0xffc857, 50, 40);
    l3.position.set(0, 8, 6);
    const l4 = new THREE.PointLight(0xffffff, 40, 25); // মাউস অনুসরণকারী আলো
    l4.position.set(0, 0, 5);
    scene.add(l1, l2, l3, l4);

    // ম্যাটেরিয়াল
    const phys = (color: number, rough = 0.18) =>
      new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.1 });
    const gold = phys(0xffc857);
    const rose = phys(0xff5fa2, 0.2);
    const cyan = phys(0x4de8ff);
    const violet = phys(0xa855f7, 0.2);
    const lime = phys(0x7dff7a, 0.22);
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
    const mats = [gold, rose, cyan, violet, lime];

    const coinGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.14, 48);
    coinGeo.rotateX(Math.PI / 2);

    const geos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusKnotGeometry(0.7, 0.22, 160, 24),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.28, 24, 64),
      new THREE.DodecahedronGeometry(0.9, 0),
      new THREE.SphereGeometry(0.9, 48, 48),
      coinGeo,
    ];

    const group = new THREE.Group();
    scene.add(group);

    type Floater = { mesh: THREE.Mesh; baseY: number; baseX: number; speed: number; phase: number; spin: number };
    const floaters: Floater[] = [];
    const count = isMobile ? 9 : 18;
    for (let i = 0; i < count; i++) {
      const useGlass = !isMobile && i % 5 === 4;
      const isCoin = i % geos.length === 6;
      const mesh = new THREE.Mesh(
        geos[i % geos.length],
        useGlass ? glass : isCoin ? gold : mats[i % mats.length]
      );
      const s = 0.5 + Math.random() * 0.9;
      mesh.scale.setScalar(s);
      mesh.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, -8 + Math.random() * 6);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(mesh);
      floaters.push({
        mesh,
        baseY: mesh.position.y,
        baseX: mesh.position.x,
        speed: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        spin: 0.15 + Math.random() * 0.4,
      });
    }

    // ওয়্যারফ্রেম কোর (হলোগ্রাম)
    const coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const core = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.12 })
    );
    core.position.z = -9;
    group.add(core);

    // রিং হ্যালো
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.04, 16, 220), gold);
    ring1.position.z = -9;
    ring1.rotation.x = 1.1;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(9.5, 0.03, 16, 240), rose);
    ring2.position.z = -10;
    ring2.rotation.set(0.5, 0.8, 0);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(11.5, 0.025, 16, 260), cyan);
    ring3.position.z = -11;
    ring3.rotation.set(1.3, 0.3, 0);
    group.add(ring1, ring2, ring3);

    // গ্লিটার ধুলো
    const makePoints = (n: number, spread: [number, number, number], size: number, color: number, opacity: number) => {
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread[0];
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
        pos[i * 3 + 2] = -12 + Math.random() * spread[2];
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(
        g,
        new THREE.PointsMaterial({
          color,
          size,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
    };
    const dust = makePoints(isMobile ? 160 : 420, [30, 20, 14], 0.06, 0xffe27a, 0.85);
    const stars = makePoints(isMobile ? 200 : 600, [60, 40, 20], 0.045, 0xaad8ff, 0.7);
    scene.add(dust, stars);

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
      const k = reduce ? 0.2 : 1;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      group.rotation.y = mouse.x * 0.25 + t * 0.03;
      group.rotation.x = mouse.y * 0.12;
      camera.position.x = mouse.x * 0.8;
      camera.position.y = -mouse.y * 0.5 - scrollPos * 0.003;
      camera.lookAt(0, 0, 0);

      floaters.forEach((f) => {
        f.mesh.rotation.x += 0.004 * f.spin * k;
        f.mesh.rotation.y += 0.006 * f.spin * k;
        f.mesh.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 0.7;
        f.mesh.position.x = f.baseX + Math.cos(t * f.speed * 0.6 + f.phase) * 0.35;
      });
      ring1.rotation.z = t * 0.12;
      ring2.rotation.z = -t * 0.08;
      ring3.rotation.z = t * 0.05;
      core.rotation.x = t * 0.1;
      core.rotation.y = t * 0.14;
      dust.rotation.y = t * 0.02;
      dust.position.y = Math.sin(t * 0.3) * 0.4;
      stars.rotation.z = t * 0.01;

      // লাইটের রঙ ও পজিশন বদলায়
      l1.position.x = -8 + Math.sin(t * 0.6) * 3;
      l2.position.x = 8 + Math.cos(t * 0.5) * 3;
      l1.color.setHSL((t * 0.04) % 1, 1, 0.6);
      l2.color.setHSL((t * 0.04 + 0.5) % 1, 1, 0.55);
      l4.position.set(mouse.x * 9, -mouse.y * 6, 5);
      l4.color.setHSL((t * 0.07 + 0.2) % 1, 0.9, 0.7);

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
      coreGeo.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className="absolute inset-0 pointer-events-none" />;
});

/* ------------------------------------------------------------------ */
/*  ভাসমান পার্টিকেল লেয়ার                                             */
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
            style={{ top: `${p.top}%`, left: `${p.left}%`, transform: `translate3d(${dx}px, ${dy}px, 0)` }}
          >
            <motion.div
              animate={{
                y: [0, -40, 0],
                x: [0, 14, 0],
                rotate: [p.rotate, p.rotate + 180, p.rotate + 360],
                opacity: [p.opacity, p.opacity + 0.3, p.opacity],
              }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
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
const CategoryCard = memo(function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 16 });
  const sy = useSpring(my, { stiffness: 160, damping: 16 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [18, -18]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const shineX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);
  // হলোগ্রাফিক ফয়েল রঙ মাউসের সাথে সরে
  const holoPos = useTransform(sx, [-0.5, 0.5], ["0% 50%", "100% 50%"]);
  // ম্যাগনেটিক বাটন
  const bx = useSpring(useTransform(sx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 15 });
  const by = useSpring(useTransform(sy, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 15 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.8, rotateX: -35 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.12, type: "spring", bounce: 0.4 }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      {/* ভাসমান অ্যানিমেশন */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
        className="relative"
      >
        {/* নিচের গ্লো ছায়া */}
        <motion.div
          aria-hidden
          animate={{ scaleX: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-[100%] blur-xl bg-gradient-to-r ${cat.color}`}
        />

        {/* ৩ডি টিল্ট (মাউস + টাচ) */}
        <motion.div
          onPointerMove={handleMove}
          onPointerLeave={reset}
          onPointerUp={reset}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", touchAction: "pan-y" }}
          className="relative cursor-pointer group"
        >
          {/* পেছনের গভীরতার প্লেট (লেয়ার ৩ডি) */}
          <div
            aria-hidden
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${cat.color} opacity-50 blur-[2px]`}
            style={{ transform: "translateZ(-40px) scale(0.94)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-white/10 ring-1 ring-white/20"
            style={{ transform: "translateZ(-20px) scale(0.97)" }}
          />

          {/* ঘূর্ণায়মান নিয়ন কনিক বর্ডার */}
          <div aria-hidden className="absolute -inset-[3px] rounded-[26px] overflow-hidden pointer-events-none" style={{ transform: "translateZ(0px)" }}>
            <div
              className="absolute -inset-[60%] opacity-90 group-hover:opacity-100"
              style={{
                background: "conic-gradient(from 0deg,#ff3cff,#00ffff,#ffe27a,#00ffaa,#ff3cff)",
                animation: `acsSpin ${6 + (index % 3)}s linear infinite`,
                filter: "blur(1px) drop-shadow(0 0 12px rgba(255,226,122,0.8))",
              }}
            />
          </div>

          {/* কার্ডের মুখ */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/70 bg-black">
            <Image
              src={cat.img}
              alt={cat.title}
              width={500}
              height={300}
              className="w-full h-44 xs:h-48 sm:h-56 md:h-60 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-80 transition-all duration-500`} />
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/50 pointer-events-none" />

            {/* হলোগ্রাফিক রেইনবো ফয়েল */}
            <motion.div
              aria-hidden
              className="absolute inset-0 mix-blend-color-dodge opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(115deg,transparent 20%,rgba(255,0,200,.55) 35%,rgba(0,255,255,.55) 50%,rgba(255,230,0,.55) 65%,transparent 80%)",
                backgroundSize: "250% 250%",
                backgroundPosition: holoPos,
              }}
            />

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
              { t: "60%", l: "10%", d: 2.1 },
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

          {/* কনটেন্ট - সামনে ভাসমান */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-2 sm:p-4 space-y-1.5 sm:space-y-3"
            style={{ transform: "translateZ(70px)" }}
          >
            {/* আইকন + অরবিটিং ডট */}
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full border border-white/40"
                style={{ animation: `acsSpin ${5 + index * 0.4}s linear infinite` }}
              >
                <span className="absolute -top-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.9)]" />
              </div>
              <div
                aria-hidden
                className="absolute inset-2 rounded-full border border-dashed border-white/30"
                style={{ animation: `acsSpin ${8 + index * 0.3}s linear infinite reverse` }}
              >
                <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_10px_3px_rgba(255,226,122,0.9)]" />
              </div>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                className="drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] relative flex items-center justify-center"
              >
                {cat.icon}
              </motion.div>
            </div>

            <h3
              className="text-sm xs:text-base sm:text-lg md:text-xl font-extrabold text-center leading-tight"
              style={{
                textShadow: `0 1px 0 rgba(255,255,255,.35), 0 3px 0 rgba(0,0,0,.35), 0 8px 18px rgba(0,0,0,.7), 0 0 22px ${cat.glow}`,
              }}
            >
              {cat.title}
            </h3>

            <Link href={cat.link} className="block">
              <motion.button
                style={{ x: bx, y: by }}
                whileHover={{ scale: 1.1, textShadow: "0 0 15px #fff", boxShadow: "0 0 24px #fff" }}
                className="relative overflow-hidden mt-1 sm:mt-2 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-base rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:bg-white/25 transition-all duration-300"
              >
                <span className="relative z-10">Explore Now →</span>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{ animation: "acsBtnShine 3s ease-in-out infinite", animationDelay: `${index * 0.3}s` }}
                />
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
const titleWords = ["সব", "ক্যাটাগরি", "একসাথে"];

export default function AllCategorySection() {
  const [scrollY, setScrollY] = useState(0);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [clickBursts, setClickBursts] = useState<Burst[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
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
    // কার্সর গ্লো (state ছাড়া, পারফরম্যান্সের জন্য)
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${e.clientX - 150}px, ${e.clientY - 150}px, 0)`;
      cursorRef.current.style.opacity = e.pointerType === "mouse" ? "1" : "0";
    }
  }, []);

  // ক্লিকে রিং + কনফেটি স্পার্ক
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const id = Date.now() + Math.random();
    const sparks: Spark[] = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const d = 60 + Math.random() * 90;
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, c: colors[Math.floor(Math.random() * colors.length)], s: 4 + Math.random() * 6 };
    });
    const burst: Burst = {
      id,
      x: e.clientX,
      y: e.clientY,
      size: 60 + Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      sparks,
    };
    setClickBursts((prev) => [...prev.slice(-6), burst]);
    setTimeout(() => setClickBursts((prev) => prev.filter((b) => b.id !== id)), 1000);
  }, []);

  const categories: Category[] = useMemo(
    () => [
      {
        title: "নতুন পণ্য",
        icon: <ShoppingBag size={36} />,
        img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        color: "from-pink-500 to-purple-600",
        glow: "#ff3cff",
        link: "/products/new",
      },
      {
        title: "পুরাতন পণ্য",
        icon: <Layers size={36} />,
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        color: "from-blue-500 to-cyan-500",
        glow: "#00e5ff",
        link: "/products/old",
      },
      {
        title: "শেয়ার মার্কেট",
        icon: <TrendingUp size={36} />,
        img: "https://images.unsplash.com/photo-1569025690938-a00729c9e1e8",
        color: "from-green-500 to-emerald-500",
        glow: "#00ffaa",
        link: "/share-market",
      },
      {
        title: "গেমস",
        icon: <Gamepad2 size={36} />,
        img: "https://images.unsplash.com/photo-1606813902818-87952c3b42e0",
        color: "from-yellow-500 to-orange-600",
        glow: "#ffaa00",
        link: "/games",
      },
      {
        title: "লটারী স্পিন",
        icon: <Gift size={36} />,
        img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
        color: "from-red-500 to-pink-600",
        glow: "#ff0055",
        link: "/Lottery",
      },
      {
        title: "আইটি সমাধান",
        icon: (
          <div className="relative flex items-center justify-center w-12 h-12">
            <FaLaptopCode
              size={36}
              className="text-cyan-300 animate-pulse"
              style={{ filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))" }}
            />
          </div>
        ),
        img: "https://images.unsplash.com/photo-1603297631957-4b2c6313f93e",
        color: "from-cyan-500 via-blue-600 to-indigo-700 shadow-[0_0_20px_rgba(6,182,212,0.6)]",
        glow: "#22d3ee",
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
        glow: "#ff5fa2",
        link: "/nikah",
      },
      {
        title: "অন্য সেবা",
        icon: <Layers size={36} />,
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        color: "from-indigo-500 to-violet-600",
        glow: "#a855f7",
        link: "/services",
      },
    ],
    []
  );

  return (
    <div
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="relative min-h-screen flex flex-col items-center justify-center px-3 sm:px-6 py-16 sm:py-24 bg-black overflow-hidden"
    >
      {/* কাস্টম কীফ্রেম */}
      <style>{`
        @keyframes scroll { from { background-position: 0 0; } to { background-position: 0 60px; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(60px,-50px) scale(1.2); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,40px) scale(1.15); } }
        @keyframes orbFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,60px) scale(1.25); } }
        @keyframes acsSpin { to { transform: rotate(360deg); } }
        @keyframes acsBtnShine { 0%,60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
        @keyframes acsAurora { 0%,100% { transform: translateX(-10%) skewX(-12deg); opacity:.35; } 50% { transform: translateX(10%) skewX(12deg); opacity:.7; } }
        @keyframes acsShoot { 0% { transform: translate3d(0,0,0) rotate(35deg); opacity:0; } 8% { opacity:1; } 30% { transform: translate3d(-520px,370px,0) rotate(35deg); opacity:0; } 100% { transform: translate3d(-520px,370px,0) rotate(35deg); opacity:0; } }
        @keyframes acsHue { to { filter: hue-rotate(360deg); } }
        @media (min-width: 420px) { .xs\\:h-48 { height: 12rem; } }
        @media (prefers-reduced-motion: reduce) {
          .acs-orb, .acs-title, .acs-aurora, .acs-star { animation: none !important; }
        }
      `}</style>

      {/* স্ক্রল প্রোগ্রেস বার */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-1 z-[60] origin-left bg-[linear-gradient(90deg,#ff3cff,#00ffff,#ffaa00,#00ffaa)] shadow-[0_0_14px_#ff3cff]"
        style={{ scaleX: progress }}
      />

      {/* গভীর রঙিন গ্রেডিয়েন্ট বেস */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1b0b3a_0%,#05010f_55%,#000_100%)] pointer-events-none" />

      {/* অরোরা বিম */}
      <div
        aria-hidden
        className="acs-aurora absolute -top-10 left-0 w-full h-72 pointer-events-none blur-3xl bg-[linear-gradient(100deg,transparent,rgba(255,60,255,.35),rgba(0,255,255,.35),rgba(0,255,170,.3),transparent)]"
        style={{ animation: "acsAurora 9s ease-in-out infinite, acsHue 24s linear infinite" }}
      />
      <div
        aria-hidden
        className="acs-aurora absolute bottom-0 left-0 w-full h-60 pointer-events-none blur-3xl bg-[linear-gradient(80deg,transparent,rgba(255,170,0,.28),rgba(255,0,85,.3),rgba(120,80,255,.3),transparent)]"
        style={{ animation: "acsAurora 12s ease-in-out infinite reverse, acsHue 30s linear infinite" }}
      />

      {/* ভাসমান রঙিন অরব */}
      <div className="acs-orb absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-fuchsia-600/40 blur-[100px] pointer-events-none" style={{ animation: "orbFloat1 12s ease-in-out infinite" }} />
      <div className="acs-orb absolute top-1/3 -right-24 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-cyan-500/30 blur-[110px] pointer-events-none" style={{ animation: "orbFloat2 14s ease-in-out infinite" }} />
      <div className="acs-orb absolute -bottom-24 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/25 blur-[100px] pointer-events-none" style={{ animation: "orbFloat3 16s ease-in-out infinite" }} />

      {/* Three.js ৩ডি দৃশ্য */}
      <LuxuryScene />

      {/* শুটিং স্টার */}
      {[
        { t: "6%", l: "88%", d: 0, du: 7 },
        { t: "18%", l: "70%", d: 3.2, du: 9 },
        { t: "4%", l: "55%", d: 5.5, du: 8 },
        { t: "30%", l: "96%", d: 8, du: 11 },
      ].map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="acs-star absolute w-24 h-[2px] pointer-events-none bg-gradient-to-r from-white via-cyan-200 to-transparent rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"
          style={{ top: s.t, left: s.l, animation: `acsShoot ${s.du}s linear ${s.d}s infinite`, opacity: 0 }}
        />
      ))}

      {/* গ্রিড */}
      <div className="absolute inset-0 grid bg-transparent before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,#0ff0_0_1px,#0000_1px_20px)] after:content-[''] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,#0ff0_0_1px,#0000_1px_20px)] animate-[pulse_10s_linear_infinite] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.05)_0_1px,transparent_1px_3px)] animate-[scroll_2s_linear_infinite] pointer-events-none"></div>

      {/* কার্সর গ্লো (শুধু মাউসে) */}
      <div
        ref={cursorRef}
        aria-hidden
        className="hidden md:block fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-0 opacity-0 transition-opacity duration-300 bg-[radial-gradient(circle,rgba(255,60,255,0.22),rgba(0,255,255,0.12)_45%,transparent_70%)]"
      />

      {/* Particles */}
      <ParticleLayer particles={particles} scrollY={scrollY} pointerPos={pointerPos} windowSize={windowSize} />

      {/* Burst effect: রিং + স্পার্ক */}
      <AnimatePresence>
        {clickBursts.map((b) => (
          <div key={b.id} className="fixed z-50 pointer-events-none" style={{ left: b.x, top: b.y }}>
            <motion.span
              initial={{ opacity: 0.9, scale: 0 }}
              animate={{ opacity: 0, scale: 2.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                left: -b.size / 2,
                top: -b.size / 2,
                width: b.size,
                height: b.size,
                border: `3px solid ${b.color}`,
                boxShadow: `0 0 30px ${b.color}, inset 0 0 20px ${b.color}`,
              }}
            />
            {b.sparks.map((s, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: s.dx, y: s.dy + 30, opacity: 0, scale: 0.2, rotate: 280 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute rounded-sm"
                style={{ width: s.s, height: s.s, background: s.c, boxShadow: `0 0 10px ${s.c}` }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>

      {/* শিরোনাম: ৩ডি লেয়ার্ড + শব্দ অনুযায়ী এন্ট্রি */}
      <h2
        className="acs-title relative z-10 mb-12 sm:mb-16 flex flex-wrap justify-center gap-x-3 sm:gap-x-4 text-3xl sm:text-4xl md:text-6xl font-extrabold text-center"
        style={{ perspective: 800 }}
      >
        {titleWords.map((w, i) => (
          <motion.span
            key={w}
            initial={{ opacity: 0, y: -40, rotateX: -80 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: i * 0.18, type: "spring", bounce: 0.45 }}
            className="relative inline-block"
          >
            {/* পেছনের ৩ডি গভীরতা */}
            <span aria-hidden className="absolute inset-0 text-fuchsia-700/70 blur-[1px] translate-x-[3px] translate-y-[4px] select-none">
              {w}
            </span>
            <span aria-hidden className="absolute inset-0 text-cyan-600/60 translate-x-[6px] translate-y-[8px] select-none">
              {w}
            </span>
            <span
              className="relative bg-clip-text text-transparent bg-[linear-gradient(90deg,#ff3cff,#00ffff,#ffaa00,#00ffaa,#ff3cff)] bg-[length:300%_100%] drop-shadow-[0_0_25px_rgba(255,60,255,0.55)]"
              style={{ animation: "gradientShift 6s ease-in-out infinite" }}
            >
              {w}
            </span>
          </motion.span>
        ))}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 w-full max-w-7xl z-10 relative">
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


