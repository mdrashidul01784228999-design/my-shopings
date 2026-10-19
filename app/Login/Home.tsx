'use client'

import { useEffect, useRef, useState } from "react";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import * as THREE from "three"; // npm i three && npm i -D @types/three
import toast from "react-hot-toast";
import Api from "./../api/Api";
import Link from "next/link";

/* ====================== helpers ====================== */

const P = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeoff: "M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22",
  arrow: "M5 12h14M13 6l6 6-6 6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

function Icon({ d, className = "h-[18px] w-[18px]" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const z = (n: number) => ({ transform: `translateZ(${n}px)` });

// ইনপুট/সাবমিটে Three.js শকওয়েভ ট্রিগার
const firePulse = (n = 1) => {
  for (let i = 0; i < n; i++) setTimeout(() => window.dispatchEvent(new Event("fx-pulse")), i * 180);
};

// বাংলা যুক্তাক্ষর না ভেঙে অক্ষর ভাগ করা
const seg = (s: string): string[] => {
  try {
    const S = (Intl as any).Segmenter;
    if (S) return Array.from(new S("bn", { granularity: "grapheme" }).segment(s), (x: any) => x.segment as string);
  } catch {}
  return Array.from(s);
};

/* ====================== Motion text ====================== */

// অক্ষর ধরে ধরে ঢোকে + ঢেউয়ের মতো দোলে + রঙ গ্রেডিয়েন্ট
function WaveText({ text, className = "" }: { text: string; className?: string }) {
  const ch = seg(text);
  return (
    <span key={text} className={`inline-flex flex-wrap justify-center ${className}`} aria-label={text}>
      {ch.map((c, i) => (
        <motion.span
          key={i + c}
          aria-hidden
          initial={{ opacity: 0, y: 34, rotateX: -90, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{ delay: i * 0.045, type: "spring", damping: 12, stiffness: 140 }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          <motion.span
            style={{ display: "inline-block", color: `hsl(${150 + (i / Math.max(1, ch.length - 1)) * 130} 85% 70%)`, textShadow: "0 0 18px rgba(52,211,153,0.35)" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ delay: 1 + i * 0.07, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

// টাইপরাইটার (লিখে লিখে মুছে পরের লাইন)
const WORDS = ["Secure login", "Free account", "Fast & simple", "নিরাপদ • ফ্রি • দ্রুত"];
function Typewriter({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = seg(words[i]);
    let t: number | undefined;
    if (!del && n < w.length) t = window.setTimeout(() => setN(n + 1), 90);
    else if (!del) t = window.setTimeout(() => setDel(true), 1400);
    else if (n > 0) t = window.setTimeout(() => setN(n - 1), 45);
    else { setDel(false); setI((i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [n, del, i, words]);
  return (
    <span>
      {seg(words[i]).slice(0, n).join("")}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-emerald-300" />
    </span>
  );
}

// অনন্ত স্ক্রলিং আউটলাইন টেক্সট
function Marquee() {
  const items = ["FREE ACCOUNT", "ফ্রি একাউন্ট", "SECURE LOGIN", "নিরাপদ লগইন", "FAST & SIMPLE", "দ্রুত রেজিস্ট্রেশন"];
  const list = [...items, ...items];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[1] overflow-hidden">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {list.map((t, i) => (
          <span key={i} className="text-5xl font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.16)] sm:text-6xl">
            {t} <span className="text-emerald-400/40">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ====================== Three.js background ====================== */

function ThreeBackground({ isLogin }: { isLogin: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const modeRef = useRef(0);
  useEffect(() => { modeRef.current = isLogin ? 0 : 1; }, [isLogin]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.04);
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 9;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const l1 = new THREE.PointLight(0x34d399, 2.4, 45); l1.position.set(-6, 4, 6);
    const l2 = new THREE.PointLight(0x8b5cf6, 2.4, 45); l2.position.set(6, -3, 6);
    scene.add(l1, l2);

    // মূল আকৃতি: টরাস নট + ওয়্যারফ্রেম আইকোসাহেড্রন
    const main = new THREE.Group();
    scene.add(main);
    const knotMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.85, roughness: 0.2, emissive: 0x064e3b, emissiveIntensity: 0.6 });
    main.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.42, 180, 24), knotMat));
    const cage = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.1, 1)),
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.3 })
    );
    main.add(cage);

    // ভাসমান আকৃতি
    const palette = [0x34d399, 0x8b5cf6, 0x22d3ee, 0xf472b6, 0xfbbf24];
    const geos = [
      new THREE.OctahedronGeometry(0.6), new THREE.IcosahedronGeometry(0.55), new THREE.DodecahedronGeometry(0.55),
      new THREE.TorusGeometry(0.5, 0.18, 16, 40), new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.TetrahedronGeometry(0.7), new THREE.ConeGeometry(0.5, 1, 6),
    ];
    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(
        geos[i % geos.length],
        new THREE.MeshStandardMaterial({ color: palette[i % palette.length], metalness: 0.5, roughness: 0.3, flatShading: true, transparent: true, opacity: 0.88 })
      );
      m.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, -7 + Math.random() * 9);
      m.userData = { base: m.position.clone(), sp: 0.2 + Math.random() * 0.6, ph: Math.random() * 6, amp: 0.4 + Math.random() * 0.7 };
      scene.add(m);
      shapes.push(m);
    }

    // পার্টিকেল ফিল্ড
    const N = 1800;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 7 + Math.random() * 16, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b) - 4], i * 3);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(points);

    // শকওয়েভ রিং
    const rings: THREE.Mesh[] = [];
    let ringI = 0;
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1, 72),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      );
      r.visible = false;
      scene.add(r);
      rings.push(r);
    }

    // লেআউট (ডেস্কটপে বাঁ দিকে, মোবাইলে ওপরে)
    const base = new THREE.Vector3(-5.2, 0.2, -1);
    let baseScale = 1;
    const layout = () => {
      const w = el.clientWidth, h = el.clientHeight, a = w / h;
      camera.aspect = a; camera.updateProjectionMatrix(); renderer.setSize(w, h);
      if (a > 1.3) { base.set(-5.2, 0.2, -1); baseScale = 1; } else { base.set(0, 3.6, -3); baseScale = 0.65; }
    };
    layout();

    // ইভেন্ট
    let pulse = 0;
    const mouse = { x: 0, y: 0 };
    const onPulse = () => {
      pulse = 1;
      const r = rings[ringI++ % rings.length];
      r.position.copy(main.position);
      r.scale.setScalar(1.5);
      const m = r.material as THREE.MeshBasicMaterial;
      m.opacity = 0.8;
      m.color.copy(knotMat.color);
      r.visible = true;
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("fx-pulse", onPulse);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", layout);

    // লুপ
    const cEmerald = new THREE.Color(0x10b981), cViolet = new THREE.Color(0x8b5cf6);
    const eEmerald = new THREE.Color(0x064e3b), eViolet = new THREE.Color(0x3b0764);
    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      pulse = Math.max(0, pulse - dt * 2.2);

      const reg = modeRef.current === 1;
      knotMat.color.lerp(reg ? cViolet : cEmerald, 0.05);
      knotMat.emissive.lerp(reg ? eViolet : eEmerald, 0.05);
      knotMat.emissiveIntensity = 0.6 + pulse * 1.8;

      main.position.lerp(base, 0.05);
      main.scale.setScalar(baseScale * (1 + pulse * 0.28));
      main.rotation.x += dt * (0.25 + pulse * 1.5);
      main.rotation.y += dt * (0.35 + pulse * 2);
      cage.rotation.y -= dt * 0.15;

      shapes.forEach((s) => {
        const u = s.userData;
        s.rotation.x += dt * u.sp; s.rotation.y += dt * u.sp * 1.3;
        s.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * u.amp * (1 + pulse * 1.5);
        s.position.x = u.base.x + Math.cos(t * u.sp * 0.7 + u.ph) * 0.4;
      });

      points.rotation.y += dt * (0.02 + pulse * 0.35);
      points.rotation.x = Math.sin(t * 0.1) * 0.1;

      rings.forEach((r) => {
        if (!r.visible) return;
        r.scale.addScalar(dt * 10);
        const m = r.material as THREE.MeshBasicMaterial;
        m.opacity -= dt * 1.3;
        if (m.opacity <= 0) r.visible = false;
      });

      l1.intensity = 2.4 + pulse * 3;
      l2.intensity = 2.4 + pulse * 3;
      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.1 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("fx-pulse", onPulse);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", layout);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} className="pointer-events-none fixed inset-0 z-0" />;
}

/* ====================== Input field ====================== */

type FieldProps = {
  icon: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
};

function Field({ icon, label, type = "text", value, onChange, right }: FieldProps) {
  return (
    <div className="relative" style={z(22)}>
      <input
        type={type}
        value={value}
        onChange={(e) => { onChange(e.target.value); firePulse(); }}
        onFocus={() => firePulse()}
        placeholder=" "
        required
        className="peer w-full rounded-xl border border-white/10 bg-black/30 pb-2 pl-11 pr-11 pt-5 text-[15px] text-slate-100 shadow-[inset_0_3px_10px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.08)] outline-none transition duration-300 focus:-translate-y-0.5 focus:border-emerald-400/70 focus:bg-black/40 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[inset_0_3px_10px_rgba(0,0,0,0.45),0_10px_26px_rgba(52,211,153,0.25)]"
      />
      <label className="pointer-events-none absolute left-11 top-1.5 text-[11px] text-slate-400 transition-all peer-placeholder-shown:top-[17px] peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-emerald-300">
        {label}
      </label>
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition peer-focus:text-emerald-300">
        <Icon d={icon} />
      </div>
      {/* স্ক্যান আন্ডারলাইন */}
      <span className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 transition-transform duration-500 peer-focus:scale-x-100" />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

/* ====================== Main page ====================== */

export default function AuthPage() {

  const [isLogin, setIsLogin] = useState(true); // Toggle login/register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [policestation, setPolicStation] = useState("");
  const [phone, setphone] = useState("");
  const [unid, setUniid] = useState<string>("");
  const [userRefrar, setRefersID] =useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false); // শুধু UI

const [deviceId, setDeviceId] = useState('');
  const [userId, setUserId] = useState('');

  // কার্ড টিল্ট
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 90, damping: 18 });
  const smy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-9, 9]);
  const gx = useTransform(smx, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(smy, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.12), transparent 45%)`;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my]);

  // মোড বদলালে Three.js-এ বিস্ফোরণ
  useEffect(() => { firePulse(2); }, [isLogin]);

  // ফর্ম কতটা পূরণ হয়েছে (শুধু UI)
  const fields = isLogin ? [email, password] : [name, phone, policestation, email, password];
  const pct = Math.round((fields.filter((v) => v.trim() !== "").length / fields.length) * 100);

  useEffect(() => {
    // ১. চেক করা ব্রাউজারে ইতিমধ্যে কোনো ডিভাইস আইডি তৈরি করা আছে কিনা
    let storedDeviceId = localStorage.getItem('web_device_token');

    if (!storedDeviceId) {
      // যদি না থাকে, একটি নতুন ইউনিক আইডি তৈরি করা হচ্ছে (UUID)
      storedDeviceId = 'web_' + crypto.randomUUID();
      localStorage.setItem('web_device_token', storedDeviceId);
    }

    setDeviceId(storedDeviceId);
  }, []);

  const handleSubmit  = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
    setLoading(true);
    firePulse(3);

    if (isLogin) {
      // ✅ Login Request
      try {
        const res = await Api.post("/users_login", { email, password });

        if (res.data.user === 201 || res.data.user === null) {
          toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
        } else {

          toast.success("লগইন সফল হয়েছে!");

          interface UserItem {
  id: number;
  name: string;
  img: string;
  uniqid: string;
}

const selectedItems = res.data.user.slice(0, 3).map((item: UserItem) => ({
            id: item.id,
            name: item.name,
            img: item.img,
            uniqid: item.uniqid,

          }));
          localStorage.setItem("userData", JSON.stringify(selectedItems));


          window.location.href = "/";
        }
      } catch (err) {
        toast.error("সার্ভার সমস্যা বা ভুল তথ্য");
      }
    } else {
      // ✅ Register Request
      try {
        const res = await Api.post("/add_user", {
  name:name,
  pass:password,
  address:policestation,
  email:email,
  phone:phone,
  img:'logo_user.jpg',
  unicid:unid,

        });


      console.log('server ====================================');
      console.log(res.data.message);

      console.log('====================================');

        if (res.data.message === true) {
          toast.success("রেজিস্ট্রেশন সফল! এখন লগইন করুন");

        } else {
          toast.error(res.data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
        }
      } catch (err) {
        toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }
    }

    setLoading(false);
  };

  useEffect(() => {

const generateNumberId = () => {
      // 10 digit random number
      return Math.floor(1000000 + Math.random() * 90000000).toString();
    };

    const id = generateNumberId();
    console.log("Unique Number ID:", id);
    setUniid(id);

  }, [])

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b14] p-4 text-slate-100 md:justify-end md:pr-[8vw]"
      style={{ perspective: 1500 }}
    >

      {/* 🔮 Three.js সিন */}
      <ThreeBackground isLogin={isLogin} />

      {/* নরম আলো */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-44 -right-32 h-[36rem] w-[36rem] rounded-full bg-violet-600/15 blur-[120px]" />

      {/* স্ক্রলিং টেক্সট */}
      <Marquee />

      {/* 🎁 Free Account Badge */}
      <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{ y: { duration: 2.4, repeat: Infinity }, opacity: { duration: 0.6 } }}
          className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-sm font-bold text-emerald-300 backdrop-blur-md"
          style={{ boxShadow: "0 4px 0 rgba(4,120,87,0.8), 0 12px 30px rgba(52,211,153,0.25)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          🎁 ফ্রি একাউন্ট
        </motion.div>
      </div>

      {/* 💎 ৩ডি টিল্ট কার্ড */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 100, rotateX: 35 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, type: "spring", damping: 16 }}
      >
        <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>

          <div className="absolute -bottom-10 left-8 right-8 h-10 rounded-full bg-black/70 blur-2xl" style={z(-60)} />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-900/70 to-violet-950/90" style={z(-24)} />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-700/40 to-violet-800/50" style={z(-12)} />

          <div className="absolute inset-0 rounded-3xl border border-white/10 bg-slate-900/65 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl" />
          <motion.div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: glare }} />
          <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

          <div className="relative p-6 sm:p-9" style={{ transformStyle: "preserve-3d" }}>

            {/* লোগো */}
            <motion.div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 text-slate-900 shadow-[0_0_40px_rgba(52,211,153,0.45)]"
              style={z(60)}
              animate={{ rotate: [0, 6, -6, 0], y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon d={P.shield} className="h-7 w-7" />
            </motion.div>

            {/* ✨ মোশন টেক্সট শিরোনাম */}
            <h2 className="text-center text-[28px] font-extrabold leading-tight" style={z(50)}>
              <WaveText text={isLogin ? "Login to Your Account" : "Create a New Account"} />
            </h2>
            <p className="mb-5 mt-2 h-5 text-center text-sm text-slate-400" style={z(30)}>
              <Typewriter words={WORDS} />
            </p>

            {/* 🔀 ট্যাব */}
            <div className="relative mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-black/35 p-1 shadow-[inset_0_3px_8px_rgba(0,0,0,0.5)]" style={z(35)}>
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setIsLogin(v)}
                  className={`relative z-10 py-2 text-sm font-bold transition ${isLogin === v ? "text-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {isLogin === v && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ boxShadow: "0 3px 0 #0f766e, 0 8px 18px rgba(52,211,153,0.4)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {v ? "লগইন" : "রেজিস্টার"}
                </button>
              ))}
            </div>

            {/* পূরণের প্রগ্রেস বার */}
            <div className="mb-5" style={z(25)}>
              <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                <span>ফর্ম পূরণ</span>
                <motion.span key={pct} initial={{ scale: 1.4, color: "#6ee7b7" }} animate={{ scale: 1, color: "#64748b" }}>{pct}%</motion.span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
              </div>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit} style={{ transformStyle: "preserve-3d" }}>

              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-3.5 overflow-hidden px-0.5 py-0.5"
                  >
                    <Field icon={P.user} label="আপনার নাম" value={name} onChange={setName} />
                    <Field icon={P.phone} label="আপনার মোবাইল নং " value={phone} onChange={setphone} />
                    <Field icon={P.pin} label="আপনার গ্রাম/শহর + থানা +  জেলা " value={policestation} onChange={setPolicStation} />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field icon={P.mail} label="ইমেইল" value={email} onChange={setEmail} />

              <Field
                icon={P.lock}
                label="পাসওয়ার্ড"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={setPassword}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-emerald-300"
                    aria-label="পাসওয়ার্ড দেখান/লুকান"
                  >
                    <Icon d={showPass ? P.eyeoff : P.eye} />
                  </button>
                }
              />

              <div className="pt-1" style={z(50)}>
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 6, boxShadow: "0 0px 0 #4c1d95, 0 4px 12px rgba(45,212,191,0.4)" }}
                  type="submit"
                  disabled={loading}
                  style={{ boxShadow: "0 6px 0 #4c1d95, 0 18px 36px rgba(45,212,191,0.35)" }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 p-3.5 text-base font-extrabold text-slate-900 disabled:opacity-60"
                >
                  <motion.span
                    className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/40 blur-sm"
                    animate={{ x: ["0%", "450%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                  />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    ) : (
                      <>
                        {isLogin ? "লগইন করুন   " : "রেজিস্টার করুন"}
                        <span className="transition-transform group-hover:translate-x-1"><Icon d={P.arrow} /></span>
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </form>

            <div className="my-5 text-center text-sm text-slate-400" style={z(20)}>
              {isLogin ? (
                <>
                  অ্যাকাউন্ট নেই?{" "}
                  <button onClick={() => setIsLogin(false)} className="font-bold text-emerald-300 underline-offset-4 hover:underline">
                    রেজিস্টার করুন
                  </button>
                </>
              ) : (
                <>
                  ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
                  <button onClick={() => setIsLogin(true)} className="font-bold text-emerald-300 underline-offset-4 hover:underline">
                    লগইন করুন
                  </button>
                </>
              )}
            </div>

            <div className="mb-4 flex items-center gap-3 text-xs text-slate-500" style={z(15)}>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
              অথবা লগইন করুন
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
            </div>

            <div className="flex flex-col gap-3.5" style={{ transformStyle: "preserve-3d" }}>
              <div style={z(32)}>
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 4, boxShadow: "0 0 0 #0b1220" }}
                  style={{ boxShadow: "0 4px 0 #0b1220, 0 12px 22px rgba(0,0,0,0.45)" }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-slate-800/80 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-slate-700/80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.4h-2v-.1H24v7.3h11.3C33.7 32.3 29.4 35.4 24 35.4c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.5-5.5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.6z"/>
                    <path fill="#FF3D00" d="M6.3 14.6l6 4.4c1.6-3.1 4.6-5.6 8.1-6.5V6.3C14 7.5 9.1 10.6 6.3 14.6z"/>
                    <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.3c-2 1.5-4.5 2.5-7.6 2.5-5.3 0-9.8-3.6-11.4-8.4l-6.6 5.1C9 39.8 16.1 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.4H24v7.3h11.3c-1.1 2.9-3.3 5.2-6.2 6.5l6.5 5.3c3.8-3.5 6-8.7 6-14.6 0-1.3-.1-2.7-.4-3.6z"/>
                  </svg>
                  Google দিয়ে লগইন করুন
                </motion.button>
              </div>

              <div style={z(32)}>
                <motion.button
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 4, boxShadow: "0 0 0 #0a2a66" }}
                  style={{ boxShadow: "0 4px 0 #0a2a66, 0 12px 22px rgba(24,119,242,0.3)" }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#1877F2]/50 bg-[#1877F2]/25 py-3 text-sm font-semibold text-blue-100 transition hover:bg-[#1877F2]/35"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 10 7.3 18.3 17 19.8v-14h-5v-6h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v5h-2.5c-2.5 0-3.3 1.6-3.3 3.3V23h5.6l-.9 6h-4.7v14C36.7 42.3 44 34 44 24c0-11.05-8.95-20-20-20z"/>
                    <path fill="#FFF" d="M31 29l1-6h-5v-3.3c0-1.7.8-3.3 3.3-3.3H33v-5s-2.3-.4-4.5-.4c-4.6 0-7.6 2.8-7.6 7.8V23h-5v6h5v14h6V29h4.7z"/>
                  </svg>
                  Facebook দিয়ে লগইন করুন
                </motion.button>
              </div>

              <div className="mt-1 text-center text-sm" style={z(22)}>
                {loading ? (
                  <Link href={'/forgetpassword' } className="text-amber-300/90 hover:underline">পাসওয়ার্ড ভুলে গেছি ?</Link>
                ) : isLogin ? <Link href={'/forgetpassword' } className="text-amber-300/90 hover:underline">পাসওয়ার্ড ভুলে গেছি ?</Link> :   null }
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


// 'use client'

// import { useEffect, useState } from "react";

// import {
//   motion,
//   AnimatePresence,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   useMotionTemplate,
//   MotionValue,
// } from "framer-motion";
// import toast from "react-hot-toast";
// import Api from "./../api/Api";
// import Link from "next/link";

// /* ====================== 3D UI helpers ====================== */

// const z = (n: number) => ({ transform: `translateZ(${n}px)` });

// // ঘুরন্ত ৩ডি কিউব
// function Cube({ size = 60, faces, dur = 14, className = "" }: { size?: number; faces: string[]; dur?: number; className?: string }) {
//   const h = size / 2;
//   const sides = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];
//   return (
//     <motion.div
//       className={className}
//       style={{ width: size, height: size, transformStyle: "preserve-3d" }}
//       animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
//       transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
//     >
//       {sides.map((s, i) => (
//         <div
//           key={i}
//           className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/50 bg-gradient-to-br from-fuchsia-500/70 via-purple-500/60 to-cyan-400/70 shadow-[inset_0_0_20px_rgba(255,255,255,0.35)]"
//           style={{ transform: `${s} translateZ(${h}px)`, fontSize: size * 0.45 }}
//         >
//           {faces[i % faces.length]}
//         </div>
//       ))}
//     </motion.div>
//   );
// }

// // মাউস অনুযায়ী প্যারালাক্স
// function Parallax({ mx, my, depth, className, children }: { mx: MotionValue<number>; my: MotionValue<number>; depth: number; className?: string; children: React.ReactNode }) {
//   const x = useTransform(mx, (v) => v * depth);
//   const y = useTransform(my, (v) => v * depth);
//   return <motion.div style={{ x, y }} className={className}>{children}</motion.div>;
// }

// // ৩ডি গোলক
// function Orb({ className, dur = 6 }: { className: string; dur?: number }) {
//   return (
//     <motion.div
//       className={`absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#f0abfc_28%,#8b5cf6_65%,#1e1b4b)] shadow-[0_20px_50px_rgba(139,92,246,0.55)] ${className}`}
//       animate={{ y: [0, -28, 0], scale: [1, 1.08, 1] }}
//       transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
//     />
//   );
// }

// type FieldProps = {
//   icon: React.ReactNode;
//   type?: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder: string;
//   right?: React.ReactNode;
// };

// // গভীরতাসহ ইনপুট ফিল্ড
// function Field({ icon, type = "text", value, onChange, placeholder, right }: FieldProps) {
//   return (
//     <div className="group relative" style={z(22)}>
//       <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-70 transition group-focus-within:scale-125 group-focus-within:opacity-100">
//         {icon}
//       </div>
//       <input
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         required
//         className="w-full rounded-2xl border border-white/20 bg-black/25 py-3.5 pl-12 pr-12 text-white placeholder-white/45 shadow-[inset_0_3px_10px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.15)] transition duration-300 focus:-translate-y-0.5 focus:border-fuchsia-400/80 focus:bg-black/35 focus:outline-none focus:shadow-[inset_0_3px_10px_rgba(0,0,0,0.4),0_10px_25px_rgba(217,70,239,0.35)]"
//       />
//       {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
//     </div>
//   );
// }

// /* ====================== Main page ====================== */

// export default function AuthPage() {

//   const [isLogin, setIsLogin] = useState(true); // Toggle login/register
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [policestation, setPolicStation] = useState("");
//   const [phone, setphone] = useState("");
//   const [unid, setUniid] = useState<string>("");
//   const [userRefrar, setRefersID] =useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [showPass, setShowPass] = useState(false); // শুধু UI

// const [deviceId, setDeviceId] = useState('');
//   const [userId, setUserId] = useState('');

//   // ৩ডি মাউস/টাচ ট্র্যাকিং
//   const mx = useMotionValue(0);
//   const my = useMotionValue(0);
//   const smx = useSpring(mx, { stiffness: 90, damping: 18 });
//   const smy = useSpring(my, { stiffness: 90, damping: 18 });
//   const rotateX = useTransform(smy, [-0.5, 0.5], [12, -12]);
//   const rotateY = useTransform(smx, [-0.5, 0.5], [-16, 16]);
//   const gx = useTransform(smx, [-0.5, 0.5], [0, 100]);
//   const gy = useTransform(smy, [-0.5, 0.5], [0, 100]);
//   const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.28), transparent 45%)`;

//   useEffect(() => {
//     const move = (e: PointerEvent) => {
//       mx.set(e.clientX / window.innerWidth - 0.5);
//       my.set(e.clientY / window.innerHeight - 0.5);
//     };
//     window.addEventListener("pointermove", move);
//     return () => window.removeEventListener("pointermove", move);
//   }, [mx, my]);

//   useEffect(() => {
//     // ১. চেক করা ব্রাউজারে ইতিমধ্যে কোনো ডিভাইস আইডি তৈরি করা আছে কিনা
//     let storedDeviceId = localStorage.getItem('web_device_token');

//     if (!storedDeviceId) {
//       // যদি না থাকে, একটি নতুন ইউনিক আইডি তৈরি করা হচ্ছে (UUID)
//       storedDeviceId = 'web_' + crypto.randomUUID();
//       localStorage.setItem('web_device_token', storedDeviceId);
//     }

//     setDeviceId(storedDeviceId);
//   }, []);

//   const handleSubmit  = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//     setLoading(true);

//     if (isLogin) {
//       // ✅ Login Request
//       try {
//         const res = await Api.post("/users_login", { email, password });

//         if (res.data.user === 201 || res.data.user === null) {
//           toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
//         } else {

//           toast.success("লগইন সফল হয়েছে!");

//           interface UserItem {
//   id: number;
//   name: string;
//   img: string;
//   uniqid: string;
// }

// const selectedItems = res.data.user.slice(0, 3).map((item: UserItem) => ({
//             id: item.id,
//             name: item.name,
//             img: item.img,
//             uniqid: item.uniqid,

//           }));
//           localStorage.setItem("userData", JSON.stringify(selectedItems));


//           window.location.href = "/";
//         }
//       } catch (err) {
//         toast.error("সার্ভার সমস্যা বা ভুল তথ্য");
//       }
//     } else {
//       // ✅ Register Request
//       try {
//         const res = await Api.post("/add_user", {
//   name:name,
//   pass:password,
//   address:policestation,
//   email:email,
//   phone:phone,
//   img:'logo_user.jpg',
//   unicid:unid,

//         });


//       console.log('server ====================================');
//       console.log(res.data.message);

//       console.log('====================================');

//         if (res.data.message === true) {
//           toast.success("রেজিস্ট্রেশন সফল! এখন লগইন করুন");

//         } else {
//           toast.error(res.data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
//         }
//       } catch (err) {
//         toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে");
//       }
//     }

//     setLoading(false);
//   };

//   useEffect(() => {

// const generateNumberId = () => {
//       // 10 digit random number
//       return Math.floor(1000000 + Math.random() * 90000000).toString();
//     };

//     const id = generateNumberId();
//     console.log("Unique Number ID:", id);
//     setUniid(id);

//   }, [])

//   return (
//     <div
//       className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-4"
//       style={{ perspective: 1400 }}
//     >

//       {/* 🌌 ৩ডি ফ্লোর গ্রিড */}
//       <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden [perspective:500px]">
//         <motion.div
//           className="absolute -inset-x-1/2 bottom-0 h-[220%] origin-bottom [transform:rotateX(68deg)] [background-size:56px_56px] bg-[linear-gradient(rgba(34,211,238,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.35)_1px,transparent_1px)]"
//           style={{ WebkitMaskImage: "linear-gradient(to top, black 20%, transparent 85%)", maskImage: "linear-gradient(to top, black 20%, transparent 85%)" }}
//           animate={{ backgroundPositionY: ["0px", "56px"] }}
//           transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
//         />
//       </div>

//       {/* রঙিন আলো */}
//       <motion.div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cyan-500/40 blur-3xl" animate={{ x: [0, 80, 0], y: [0, 60, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
//       <motion.div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-pink-500/40 blur-3xl" animate={{ x: [0, -90, 0], y: [0, -70, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />

//       {/* 🧊 ভাসমান ৩ডি কিউব ও গোলক (মাউসে প্যারালাক্স) */}
//       <Parallax mx={smx} my={smy} depth={-70} className="absolute left-[7%] top-[14%] hidden sm:block">
//         <Cube size={70} faces={["🎮", "⭐", "💎", "🔥", "🚀", "🎁"]} dur={16} />
//       </Parallax>
//       <Parallax mx={smx} my={smy} depth={90} className="absolute bottom-[16%] right-[8%] hidden sm:block">
//         <Cube size={54} faces={["💜", "✨", "🌈"]} dur={11} />
//       </Parallax>
//       <Parallax mx={smx} my={smy} depth={50} className="absolute right-[14%] top-[12%]">
//         <Orb className="h-14 w-14" dur={5} />
//       </Parallax>
//       <Parallax mx={smx} my={smy} depth={-50} className="absolute bottom-[20%] left-[12%]">
//         <Orb className="h-20 w-20" dur={7} />
//       </Parallax>
//       <Parallax mx={smx} my={smy} depth={30} className="absolute left-[22%] top-[8%]">
//         <Orb className="h-7 w-7" dur={4} />
//       </Parallax>

//       {/* 🎁 Free Account Badge */}
//       <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
//         <motion.div
//           animate={{ y: [0, -7, 0], rotateX: [0, 14, 0] }}
//           transition={{ duration: 2.2, repeat: Infinity }}
//           className="rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 px-6 py-2 text-base font-extrabold text-white ring-2 ring-white/40"
//           style={{ boxShadow: "0 5px 0 #047857, 0 14px 30px rgba(16,185,129,0.55)" }}
//         >
//           🎁 ফ্রি একাউন্ট
//         </motion.div>
//       </div>

//       {/* 💎 ৩ডি টিল্ট কার্ড */}
//       <motion.div
//         className="relative z-10 w-full max-w-md"
//         style={{ transformStyle: "preserve-3d" }}
//         initial={{ opacity: 0, y: 120, rotateX: 45 }}
//         animate={{ opacity: 1, y: 0, rotateX: 0 }}
//         transition={{ duration: 1, type: "spring", damping: 16 }}
//       >
//         <motion.div className="relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>

//           {/* মাটির ছায়া */}
//           <div className="absolute -bottom-10 left-8 right-8 h-10 rounded-full bg-black/60 blur-2xl" style={z(-60)} />

//           {/* কার্ডের পুরুত্ব (পেছনের স্তর) */}
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-700/70 to-indigo-900/80" style={z(-26)} />
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/60 to-cyan-600/50" style={z(-13)} />

//           {/* কাচের স্তর */}
//           <div className="absolute inset-0 rounded-3xl border border-white/30 bg-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl" />
//           {/* আলোর ঝিলিক */}
//           <motion.div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: glare }} />
//           <div className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent" />

//           {/* কনটেন্ট */}
//           <div className="relative p-7 sm:p-9" style={{ transformStyle: "preserve-3d" }}>

//             {/* ঘুরন্ত ৩ডি লোগো কিউব */}
//             <div className="mx-auto mb-7 mt-2 flex h-16 items-center justify-center [perspective:500px]" style={z(80)}>
//               <Cube size={56} faces={isLogin ? ["🔐", "🔑", "🛡️"] : ["✨", "🎉", "🚀"]} dur={9} />
//             </div>

//             {/* 🔀 লগইন / রেজিস্টার ট্যাব */}
//             <div className="relative mb-6 grid grid-cols-2 rounded-2xl bg-black/30 p-1 shadow-[inset_0_3px_8px_rgba(0,0,0,0.5)]" style={z(35)}>
//               {[true, false].map((v) => (
//                 <button
//                   key={String(v)}
//                   type="button"
//                   onClick={() => setIsLogin(v)}
//                   className={`relative z-10 py-2.5 text-sm font-bold transition ${isLogin === v ? "text-white" : "text-white/55 hover:text-white/80"}`}
//                 >
//                   {isLogin === v && (
//                     <motion.span
//                       layoutId="tab-pill"
//                       className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500"
//                       style={{ boxShadow: "0 4px 0 #581c87, 0 8px 18px rgba(217,70,239,0.4)" }}
//                       transition={{ type: "spring", stiffness: 380, damping: 30 }}
//                     />
//                   )}
//                   {v ? "লগইন" : "রেজিস্টার"}
//                 </button>
//               ))}
//             </div>

//             {/* ফর্ম — মোড বদলালে ৩ডি ফ্লিপ */}
//             <AnimatePresence mode="wait" initial={false}>
//               <motion.div
//                 key={isLogin ? "login" : "register"}
//                 initial={{ rotateY: 90, opacity: 0 }}
//                 animate={{ rotateY: 0, opacity: 1 }}
//                 exit={{ rotateY: -90, opacity: 0 }}
//                 transition={{ duration: 0.38 }}
//                 style={{ transformStyle: "preserve-3d" }}
//               >
//                 <h2 className="mb-1 text-center text-3xl font-extrabold" style={z(45)}>
//                   <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
//                     {isLogin ? "Login to Your Account" : "Create a New Account"}
//                   </span>
//                 </h2>
//                 <p className="mb-6 text-center text-sm text-white/60" style={z(30)}>
//                   {isLogin ? "স্বাগতম! আপনার অ্যাকাউন্টে প্রবেশ করুন" : "মাত্র কয়েক সেকেন্ডে নতুন অ্যাকাউন্ট খুলুন"}
//                 </p>

//                 <form className="space-y-4" onSubmit={handleSubmit} style={{ transformStyle: "preserve-3d" }}>

//                   {!isLogin && (
//                     <>
//                       <Field icon="👤" value={name} onChange={setName} placeholder="আপনার নাম" />
//                       <Field icon="📱" value={phone} onChange={setphone} placeholder="আপনার মোবাইল নং " />
//                       <Field icon="📍" value={policestation} onChange={setPolicStation} placeholder="আপনার গ্রাম/শহর + থানা +  জেলা " />
//                     </>
//                   )}

//                   <Field icon="✉️" value={email} onChange={setEmail} placeholder="ইমেইল" />

//                   <Field
//                     icon="🔑"
//                     type={showPass ? "text" : "password"}
//                     value={password}
//                     onChange={setPassword}
//                     placeholder="পাসওয়ার্ড"
//                     right={
//                       <button
//                         type="button"
//                         onClick={() => setShowPass(!showPass)}
//                         className="text-lg opacity-70 transition hover:opacity-100"
//                         aria-label="পাসওয়ার্ড দেখান/লুকান"
//                       >
//                         {showPass ? "🙈" : "👁️"}
//                       </button>
//                     }
//                   />

//                   {/* ৩ডি পুশ বোতাম */}
//                   <div style={z(50)}>
//                     <motion.button
//                       whileHover={{ y: -3 }}
//                       whileTap={{ y: 6, boxShadow: "0 0px 0 #4c1d95, 0 4px 12px rgba(168,85,247,0.5)" }}
//                       type="submit"
//                       disabled={loading}
//                       style={{ boxShadow: "0 6px 0 #4c1d95, 0 18px 34px rgba(168,85,247,0.55)" }}
//                       className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 p-3.5 text-lg font-extrabold text-white disabled:opacity-60"
//                     >
//                       <motion.span
//                         className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/35 blur-sm"
//                         animate={{ x: ["0%", "450%"] }}
//                         transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
//                       />
//                       <span className="relative">
//                         {loading ? (
//                           <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                         ) : isLogin ? "লগইন করুন   " : "রেজিস্টার করুন"}
//                       </span>
//                     </motion.button>
//                   </div>
//                 </form>
//               </motion.div>
//             </AnimatePresence>

//             <div className="my-5 text-center text-sm text-white/70" style={z(20)}>
//               {isLogin ? (
//                 <>
//                   অ্যাকাউন্ট নেই?{" "}
//                   <button onClick={() => setIsLogin(false)} className="font-bold text-cyan-300 underline-offset-4 hover:underline">
//                     রেজিস্টার করুন
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
//                   <button onClick={() => setIsLogin(true)} className="font-bold text-cyan-300 underline-offset-4 hover:underline">
//                     লগইন করুন
//                   </button>
//                 </>
//               )}
//             </div>

//             <div className="my-5 flex items-center gap-3 text-sm text-white/50" style={z(15)}>
//               <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30" />
//               অথবা লগইন করুন
//               <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30" />
//             </div>

//             <div className="flex flex-col gap-4" style={{ transformStyle: "preserve-3d" }}>
//               <div style={z(35)}>
//                 <motion.button
//                   whileHover={{ y: -3 }}
//                   whileTap={{ y: 5, boxShadow: "0 0 0 #cbd5e1" }}
//                   style={{ boxShadow: "0 5px 0 #cbd5e1, 0 14px 26px rgba(0,0,0,0.3)" }}
//                   className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3 font-semibold text-gray-800"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
//                     <path fill="#FFC107" d="M43.6 20.4h-2v-.1H24v7.3h11.3C33.7 32.3 29.4 35.4 24 35.4c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.5-5.5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.6z"/>
//                     <path fill="#FF3D00" d="M6.3 14.6l6 4.4c1.6-3.1 4.6-5.6 8.1-6.5V6.3C14 7.5 9.1 10.6 6.3 14.6z"/>
//                     <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.3c-2 1.5-4.5 2.5-7.6 2.5-5.3 0-9.8-3.6-11.4-8.4l-6.6 5.1C9 39.8 16.1 44 24 44z"/>
//                     <path fill="#1976D2" d="M43.6 20.4H24v7.3h11.3c-1.1 2.9-3.3 5.2-6.2 6.5l6.5 5.3c3.8-3.5 6-8.7 6-14.6 0-1.3-.1-2.7-.4-3.6z"/>
//                   </svg>
//                   Google দিয়ে লগইন করুন
//                 </motion.button>
//               </div>

//               <div style={z(35)}>
//                 <motion.button
//                   whileHover={{ y: -3 }}
//                   whileTap={{ y: 5, boxShadow: "0 0 0 #0a3d91" }}
//                   style={{ boxShadow: "0 5px 0 #0a3d91, 0 14px 26px rgba(24,119,242,0.4)" }}
//                   className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0b5bd3] py-3 font-semibold text-white"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
//                     <path fill="#FFF" d="M24 4C12.95 4 4 12.95 4 24c0 10 7.3 18.3 17 19.8v-14h-5v-6h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v5h-2.5c-2.5 0-3.3 1.6-3.3 3.3V23h5.6l-.9 6h-4.7v14C36.7 42.3 44 34 44 24c0-11.05-8.95-20-20-20z"/>
//                   </svg>
//                   Facebook দিয়ে লগইন করুন
//                 </motion.button>
//               </div>

//               <div className="mt-1 text-center text-sm" style={z(25)}>
//                 {loading ? (
//                   <Link href={'/forgetpassword' } className="text-amber-300 hover:underline">পাসওয়ার্ড ভুলে গেছি ?</Link>
//                 ) : isLogin ? <Link href={'/forgetpassword' } className="text-amber-300 hover:underline">পাসওয়ার্ড ভুলে গেছি ?</Link> :   null }
//               </div>

//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }





// // 'use client'

// // import { useEffect, useState } from "react";

// // import { motion } from "framer-motion";
// // import toast from "react-hot-toast";
// // import Api from "./../api/Api";
// // import Link from "next/link";



// // export default function AuthPage() {

 


// //   const [isLogin, setIsLogin] = useState(true); // Toggle login/register
// //   const [name, setName] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [policestation, setPolicStation] = useState("");
// //   const [phone, setphone] = useState("");
// //   const [unid, setUniid] = useState<string>("");
// //   const [userRefrar, setRefersID] =useState<string>("");
// //   const [loading, setLoading] = useState(false);







// // const [deviceId, setDeviceId] = useState('');
// //   const [userId, setUserId] = useState('');

// //   useEffect(() => {
// //     // ১. চেক করা ব্রাউজারে ইতিমধ্যে কোনো ডিভাইস আইডি তৈরি করা আছে কিনা
// //     let storedDeviceId = localStorage.getItem('web_device_token');

// //     if (!storedDeviceId) {
// //       // যদি না থাকে, একটি নতুন ইউনিক আইডি তৈরি করা হচ্ছে (UUID)
// //       storedDeviceId = 'web_' + crypto.randomUUID();
// //       localStorage.setItem('web_device_token', storedDeviceId);
// //     }

// //     setDeviceId(storedDeviceId);
// //   }, []);

  
  


    

// //   const handleSubmit  = async (e: React.FormEvent<HTMLFormElement>) => {
// //   e.preventDefault();
// //     setLoading(true);
        

// //     if (isLogin) {
// //       // ✅ Login Request
// //       try {
// //         const res = await Api.post("/users_login", { email, password });

// //         if (res.data.user === 201 || res.data.user === null) {
// //           toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
// //         } else {

// //           toast.success("লগইন সফল হয়েছে!");

// //           interface UserItem {
// //   id: number;
// //   name: string;
// //   img: string;
// //   uniqid: string;
// // }

// // const selectedItems = res.data.user.slice(0, 3).map((item: UserItem) => ({
// //             id: item.id,
// //             name: item.name,
// //             img: item.img,
// //             uniqid: item.uniqid,
     
// //           }));
// //           localStorage.setItem("userData", JSON.stringify(selectedItems));


// //           window.location.href = "/";
// //         }
// //       } catch (err) {
// //         toast.error("সার্ভার সমস্যা বা ভুল তথ্য");
// //       }
// //     } else {
// //       // ✅ Register Request
// //       try {
// //         const res = await Api.post("/add_user", {
// //   name:name,
// //   pass:password,
// //   address:policestation,
// //   email:email,
// //   phone:phone,
// //   img:'logo_user.jpg',
// //   unicid:unid,

// //         });


// //       console.log('server ====================================');
// //       console.log(res.data.message);

// //       console.log('====================================');

// //         if (res.data.message === true) {
// //           toast.success("রেজিস্ট্রেশন সফল! এখন লগইন করুন");
       
// //         } else {
// //           toast.error(res.data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
// //         }
// //       } catch (err) {
// //         toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে");
// //       }
// //     }

// //     setLoading(false);
// //   };

 


// //   useEffect(() => {

// // //  const number = Math.floor(10000000 + Math.random() * 90000000);
// // //     console.log("Random 8-digit number:", number);

// // // setUniid(number);
 
// // const generateNumberId = () => {
// //       // 10 digit random number
// //       return Math.floor(1000000 + Math.random() * 90000000).toString();
// //     };

// //     const id = generateNumberId();
// //     console.log("Unique Number ID:", id);
// //     setUniid(id);
 



// //   }, [])

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
     
     
// //             {/* 🎁 Free Account Badge */}
// //       <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
// //         <div className="bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-lg font-bold animate-bounce">
// //           🎁 ফ্রি একাউন্ট 
// //         </div>
// //       </div>
      
     
     
     
     
// //       <motion.div
// //         className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
// //         initial={{ opacity: 0, y: 100 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.8 }}
// //       >
// //         <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
// //           {isLogin ? "Login to Your Account" : "Create a New Account"}
// //         </h2>

// //         <form className="space-y-4" onSubmit={handleSubmit}>

// //           {!isLogin && (
// // <>
// //             <input
// //               type="text"
// //               value={name}
// //               onChange={(e) => setName(e.target.value)}
// //               placeholder="আপনার নাম"
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
        
// //           <input
// //             type="text"
// //             value={phone}
// //             onChange={(e) => setphone(e.target.value)}
// //             placeholder="আপনার মোবাইল নং "
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />


// //          <input
// //             type="text"
// //             value={policestation}
// //             onChange={(e) => setPolicStation(e.target.value)}
// //             placeholder="আপনার গ্রাম/শহর + থানা +  জেলা "
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />



// // </>

// //   )}

// //          <input
// //             type="text"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             placeholder="ইমেইল"
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />

          
// //           <input
// //             type="password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             placeholder="পাসওয়ার্ড"
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg font-semibold transition duration-300 hover:bg-blue-700 disabled:opacity-60"
// //           >
// //             {loading ? (
// //               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //             ) : isLogin ? "লগইন করুন   " : "রেজিস্টার করুন"}
// //           </button>
// //         </form>

// //         <div className="text-center text-sm text-gray-500 my-4">
// //           {isLogin ? (
// //             <>
// //               অ্যাকাউন্ট নেই?{" "}
// //               <button
// //                 onClick={() => setIsLogin(false)}
// //                 className="text-blue-500 hover:underline"
// //               >
// //                 রেজিস্টার করুন
// //               </button>
// //             </>
// //           ) : (
// //             <>
// //               ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
// //               <button
// //                 onClick={() => setIsLogin(true)}
// //                 className="text-blue-500 hover:underline"
// //               >
// //                 লগইন করুন
// //               </button>
// //             </>
// //           )}
// //         </div>

// //         <div className="my-4 text-center text-gray-400">অথবা লগইন করুন</div>

// //         <div className="flex flex-col gap-3">
// //           <button
    
// //             className="w-full bg-white border border-gray-300 text-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
// //           >
// //             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
// //               <path fill="#FFC107" d="M43.6 20.4h-2v-.1H24v7.3h11.3C33.7 32.3 29.4 35.4 24 35.4c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.5-5.5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.6z"/>
// //               <path fill="#FF3D00" d="M6.3 14.6l6 4.4c1.6-3.1 4.6-5.6 8.1-6.5V6.3C14 7.5 9.1 10.6 6.3 14.6z"/>
// //               <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.3c-2 1.5-4.5 2.5-7.6 2.5-5.3 0-9.8-3.6-11.4-8.4l-6.6 5.1C9 39.8 16.1 44 24 44z"/>
// //               <path fill="#1976D2" d="M43.6 20.4H24v7.3h11.3c-1.1 2.9-3.3 5.2-6.2 6.5l6.5 5.3c3.8-3.5 6-8.7 6-14.6 0-1.3-.1-2.7-.4-3.6z"/>
// //             </svg>
// //             Google দিয়ে লগইন করুন
// //           </button>

// //           <button
          
// //             className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
// //           >
// //             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
// //               <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 10 7.3 18.3 17 19.8v-14h-5v-6h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v5h-2.5c-2.5 0-3.3 1.6-3.3 3.3V23h5.6l-.9 6h-4.7v14C36.7 42.3 44 34 44 24c0-11.05-8.95-20-20-20z"/>
// //               <path fill="#FFF" d="M31 29l1-6h-5v-3.3c0-1.7.8-3.3 3.3-3.3H33v-5s-2.3-.4-4.5-.4c-4.6 0-7.6 2.8-7.6 7.8V23h-5v6h5v14h6V29h4.7z"/>
// //             </svg>
// //             Facebook দিয়ে লগইন করুন
// //           </button>



// //   {loading ? (
// //            <Link href={'/forgetpassword' }>পাসওয়ার্ড ভুলে গেছি ?</Link>
// //             ) : isLogin ? <Link href={'/forgetpassword' }>পাসওয়ার্ড ভুলে গেছি ?</Link> :   null }

// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // }







// // 'use client'

// // import { useEffect, useState } from "react";
// // import { signIn } from "next-auth/react";
// // import { motion } from "framer-motion";
// // import toast from "react-hot-toast";
// // import Api from "../../api/Api";
// // import { useParams } from "next/navigation";

// // export default function AuthPage() {

// //   const uarams=useParams();

// //   const uerfree=uarams.id;


// //   const [isLogin, setIsLogin] = useState(true); // Toggle login/register
// //   const [name, setName] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [policestation, setPolicStation] = useState("");
// //   const [phone, setphone] = useState("");
// //   const [unid, setUniid] = useState('');
// //   const [userRefrar, setRefersID] = useState("");
// //   const [loading, setLoading] = useState(false);

// // const [getid, setDatas] = useState(null)



// //   const handleSubmit  = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     if (isLogin) {
// //       // ✅ Login Request
// //       try {
// //         const res = await Api.post("/users_login", { email, password });

// //         if (res.data.user === 201 || res.data.user === null) {
// //           toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
// //         } else {
// //           const selectedItems = res.data.user.slice(0, 3).map((item) => ({
// //             id: item.id,
// //             name: item.name,
// //             img: item.img,
// //             unid: item.uniqid,
// //           }));
// //           localStorage.setItem("userData", JSON.stringify(selectedItems));
// //           toast.success("লগইন সফল হয়েছে!");
// //           window.location.href = "/";
// //         }
// //       } catch (err) {
// //         toast.error("সার্ভার সমস্যা বা ভুল তথ্য");
// //       }
// //     } else {
// //       // ✅ Register Request
// //       try {
// //         const res = await Api.post("/add_user", {
// //   name:name,
// //   pass:password,
// //   address:policestation,
// //   email:email,
// //   phone:phone,
// //   img:'logo_user.jpg',
// //   unicid:unid,
// //   referid:userRefrar,
// //         });


// //       console.log('server ====================================');
// //       console.log(res.data.message);

// //       console.log('====================================');

// //         if (res.data.message === true) {
// //           toast.success("রেজিস্ট্রেশন সফল! এখন লগইন করুন");

// //           Savesdata();
       
// //         } else {
// //           toast.error(res.data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
// //         }
// //       } catch (err) {
// //         toast.error("রেজিস্ট্রেশন ব্যর্থ হয়েছে");
// //       }
// //     }

// //     setLoading(false);
// //   };

 


// //   useEffect(() => {

// //  const number = Math.floor(10000000 + Math.random() * 90000000);
// //     console.log("Random 8-digit number:", number);

// // setUniid(number);
// //    setRefersID(uerfree);
// //   }, [])










// // useEffect(() => {


// //   if (userRefrar) {
// //       Api.get(`/all_users_refers/${userRefrar}`) // Laravel API URL
// //         .then(response => {
// //           setDatas(response.data.data);
// //      console.log(getid+ 'user Refers get id         ====================================');
// //      console.log(response.data.data);
// //      console.log('===================Login page =================');
// //         })
// //         .catch(error => {
// //           console.error('Error fetching user:', error);
       
 
// //         });
// //     }
  
// // }, [userRefrar])


// //    const Savesdata=()=>{

// // if (userRefrar) {
  

// //         const Res = Api.post("/add_coin", {
 
// //   user_id:64,
// //   coin:'2000',
// //   home_coin:'refer'


// //         })

// //   .then(function (response) {
// //     toast.success('আপনাকে স্বাগতম  কয়েন সংগ্রহ করার জন্য');
// //   })
// //   .catch(function (error) {
// //   toast.error('আমরা আন্তরীক ভাবে দুঃখিত আপনার কয়েনটি যোগ হচেছ না');
// //   });
// // // user_id	refer_id	coin_name	coin_actons	crurrent_time	update_time	coin	shareid	uinq_id	tranztion_id	



// // }else{

// //      toast.error('আপনে লগইন ছাড়া আয় করতে পারবে না আপনে আগে লগিন করুন তার পর আয় শুরু করুন।');

// // }



// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
     
     
// //             {/* 🎁 Free Account Badge */}
// //       <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
// //         <div className="bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-lg font-bold animate-bounce">
// //           🎁 ফ্রি একাউন্ট 
// //         </div>
// //       </div>
      
     
     
     
     
// //       <motion.div
// //         className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
// //         initial={{ opacity: 0, y: 100 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.8 }}
// //       >
// //         <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
// //           {isLogin ? "Login to Your Account" : "Create a New Account"}
// //         </h2>

// //         <form className="space-y-4" onSubmit={handleSubmit}>

// //           {!isLogin && (
// // <>
// //             <input
// //               type="text"
// //               value={name}
// //               onChange={(e) => setName(e.target.value)}
// //               placeholder="আপনার নাম"
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             />
        
// //           <input
// //             type="text"
// //             value={phone}
// //             onChange={(e) => setphone(e.target.value)}
// //             placeholder="আপনার মোবাইল নং "
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />


// //          <input
// //             type="text"
// //             value={policestation}
// //             onChange={(e) => setPolicStation(e.target.value)}
// //             placeholder="আপনার গ্রাম/শহর + থানা +  জেলা "
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />



// // </>

// //   )}

// //          <input
// //             type="text"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             placeholder="ইমেইল"
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />

          
// //           <input
// //             type="password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             placeholder="পাসওয়ার্ড"
// //             required
// //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg font-semibold transition duration-300 hover:bg-blue-700 disabled:opacity-60"
// //           >
// //             {loading ? (
// //               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //             ) : isLogin ? "লগইন করুন" : "রেজিস্টার করুন"}
// //           </button>
// //         </form>

// //         <div className="text-center text-sm text-gray-500 my-4">
// //           {isLogin ? (
// //             <>
// //               অ্যাকাউন্ট নেই?{" "}
// //               <button
// //                 onClick={() => setIsLogin(false)}
// //                 className="text-blue-500 hover:underline"
// //               >
// //                 রেজিস্টার করুন
// //               </button>
// //             </>
// //           ) : (
// //             <>
// //               ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
// //               <button
// //                 onClick={() => setIsLogin(true)}
// //                 className="text-blue-500 hover:underline"
// //               >
// //                 লগইন করুন
// //               </button>
// //             </>
// //           )}
// //         </div>

// //         <div className="my-4 text-center text-gray-400">অথবা লগইন করুন</div>

// //         <div className="flex flex-col gap-3">
// //           <button
// //             onClick={() => signIn("google")}
// //             className="w-full bg-white border border-gray-300 text-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
// //           >
// //             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
// //               <path fill="#FFC107" d="M43.6 20.4h-2v-.1H24v7.3h11.3C33.7 32.3 29.4 35.4 24 35.4c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.5-5.5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.6z"/>
// //               <path fill="#FF3D00" d="M6.3 14.6l6 4.4c1.6-3.1 4.6-5.6 8.1-6.5V6.3C14 7.5 9.1 10.6 6.3 14.6z"/>
// //               <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.3c-2 1.5-4.5 2.5-7.6 2.5-5.3 0-9.8-3.6-11.4-8.4l-6.6 5.1C9 39.8 16.1 44 24 44z"/>
// //               <path fill="#1976D2" d="M43.6 20.4H24v7.3h11.3c-1.1 2.9-3.3 5.2-6.2 6.5l6.5 5.3c3.8-3.5 6-8.7 6-14.6 0-1.3-.1-2.7-.4-3.6z"/>
// //             </svg>
// //             Google দিয়ে লগইন করুন
// //           </button>

// //           <button
// //             onClick={() => signIn("facebook")}
// //             className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
// //           >
// //             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
// //               <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 10 7.3 18.3 17 19.8v-14h-5v-6h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v5h-2.5c-2.5 0-3.3 1.6-3.3 3.3V23h5.6l-.9 6h-4.7v14C36.7 42.3 44 34 44 24c0-11.05-8.95-20-20-20z"/>
// //               <path fill="#FFF" d="M31 29l1-6h-5v-3.3c0-1.7.8-3.3 3.3-3.3H33v-5s-2.3-.4-4.5-.4c-4.6 0-7.6 2.8-7.6 7.8V23h-5v6h5v14h6V29h4.7z"/>
// //             </svg>
// //             Facebook দিয়ে লগইন করুন
// //           </button>
// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // }






// // // 'use client'

// // // import { useState } from "react";
// // // import { signIn } from "next-auth/react";
// // // import { motion } from "framer-motion";
// // // import toast from "react-hot-toast";
// // // import Api from "../../api/Api";

// // // export default function LoginPage() {
// // //   const [email, setEmail] = useState("");
// // //   const [password, setPassword] = useState("");
// // //   const [loading, setLoading] = useState(false);

// // //   const handleSuccess = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);

// // //     try {
// // //       const res = await Api.post("/users_login", { email, password });

// // //       if (res.data.user === 201 || res.data.user === null) {
// // //         toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
// // //       } else {
// // //         const selectedItems = res.data.user.slice(0, 3).map((item) => ({
// // //           id: item.id,
// // //           name: item.name,
// // //           img: item.img,
// // //           unid: item.uniqid,
// // //         }));

// // //         localStorage.setItem("userData", JSON.stringify(selectedItems));
// // //         toast.success("আপনাকে স্বাগত লগইন করার জন্য");
// // //         window.location.href = "/";
// // //       }
// // //     } catch (error) {
// // //       console.error("Login failed:", error);
// // //       toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
// // //         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
// // //         <div className="bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-lg font-bold animate-bounce">
// // //           🎁 ফ্রি একাউন্ট
// // //         </div>
// // //       </div>

// // //       <motion.div   
// // //         className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
// // //         initial={{ opacity: 0, y: 100 }}
// // //         animate={{ opacity: 1, y: 0 }}
// // //         transition={{ duration: 0.8 }}
// // //       >
// // //         <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
// // //           Login to Your Account
// // //         </h2>

// // //         <form className="space-y-4" onSubmit={handleSuccess}>
// // //           <input
// // //             type="text"
// // //             value={email}
// // //             onChange={(e) => setEmail(e.target.value)}
// // //             placeholder="ইমেইল অথবা ফোন নম্বর"
// // //             required
// // //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
// // //           />
// // //           <input
// // //             type="password"
// // //             value={password}
// // //             onChange={(e) => setPassword(e.target.value)}
// // //             placeholder="পাসওয়ার্ড"
// // //             required
// // //             className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
// // //           />
// // //           <button
// // //             type="submit"
// // //             disabled={loading}
// // //             className="w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg font-semibold transition duration-300 hover:bg-blue-700 disabled:opacity-60"
// // //           >
// // //             {loading ? (
// // //               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
// // //             ) : (
// // //               "লগইন করুন"
// // //             )}
// // //           </button>
// // //         </form>

// // //         <div className="my-4 text-center text-gray-400">অথবা লগইন করুন</div>

// // //         <div className="flex flex-col gap-3">
// // //           <button
// // //             onClick={() => signIn("google")}
// // //             className="w-full bg-white border border-gray-300 text-black py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
// // //           >
// // //             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" width="20" height="20" viewBox="0 0 48 48">
// // //               <path fill="#FFC107" d="M43.6 20.4h-2v-.1H24v7.3h11.3C33.7 32.3 29.4 35.4 24 35.4c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.5-5.5C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-3.6z"/>
// // //               <path fill="#FF3D00" d="M6.3 14.6l6 4.4c1.6-3.1 4.6-5.6 8.1-6.5V6.3C14 7.5 9.1 10.6 6.3 14.6z"/>
// // //               <path fill="#4CAF50" d="M24 44c5.4 0 10.4-2.1 14.1-5.4l-6.5-5.3c-2 1.5-4.5 2.5-7.6 2.5-5.3 0-9.8-3.6-11.4-8.4l-6.6 5.1C9 39.8 16.1 44 24 44z"/>
// // //               <path fill="#1976D2" d="M43.6 20.4H24v7.3h11.3c-1.1 2.9-3.3 5.2-6.2 6.5l6.5 5.3c3.8-3.5 6-8.7 6-14.6 0-1.3-.1-2.7-.4-3.6z"/>
// // //             </svg>
// // //             Google দিয়ে লগইন করুন
// // //           </button>

// // //           <button
// // //             onClick={() => signIn("facebook")}
// // //             className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
// // //           >
// // //             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="w-5 h-5">
// // //               <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 10 7.3 18.3 17 19.8v-14h-5v-6h5v-4.6c0-5 3-7.8 7.6-7.8 2.2 0 4.5.4 4.5.4v5h-2.5c-2.5 0-3.3 1.6-3.3 3.3V23h5.6l-.9 6h-4.7v14C36.7 42.3 44 34 44 24c0-11.05-8.95-20-20-20z"/>
// // //               <path fill="#FFF" d="M31 29l1-6h-5v-3.3c0-1.7.8-3.3 3.3-3.3H33v-5s-2.3-.4-4.5-.4c-4.6 0-7.6 2.8-7.6 7.8V23h-5v6h5v14h6V29h4.7z"/>
// // //             </svg>
// // //             Facebook দিয়ে লগইন করুন
// // //           </button>
// // //         </div>
// // //       </motion.div>
// // //     </div>
// // //   );
// // // }


