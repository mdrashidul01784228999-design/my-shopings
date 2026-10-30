// @ts-nocheck
/* eslint-disable */
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ================= সেটিংস ================= */
const DAILY_LIMIT = 5;      // দিনে সর্বোচ্চ কতবার দৌড়ানো যাবে
const FINISH = 100;         // দৌড়ের দূরত্ব (মিটার)
const LANES = 4, LW = 1.6;  // লেন সংখ্যা ও প্রস্থ
const DIFF = [0.92, 1, 1.07];
const DIFF_NAMES = ["সহজ", "মাঝারি", "কঠিন"];
const bn = (n, d = 0) => Number(n).toLocaleString("bn-BD", { useGrouping: false, minimumFractionDigits: d, maximumFractionDigits: d });
const ORD = ["১ম", "২য়", "৩য়", "৪র্থ"];
const MEDAL = ["🥇", "🥈", "🥉", "🏅"];

/* ================= নিরাপদ localStorage ================= */
const lsGet = (k, fallback = "") => {
  try { const v = localStorage.getItem(k); return v === null ? fallback : v; } catch { return fallback; }
};

/* ================= দৈনিক লিমিট ================= */
const today = () => new Date().toISOString().slice(0, 10);
const readPlays = () => {
  try { const d = JSON.parse(lsGet("race_plays", "{}")); return d.date === today() ? d.count : 0; } catch { return 0; }
};
const writePlays = (count) => { try { localStorage.setItem("race_plays", JSON.stringify({ date: today(), count })); } catch {} };

/* ================= সাউন্ড (Web Audio) ================= */
let actx, muted = false, crowd = null;
const ac = () => {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  return actx;
};
const tone = (f, dur = 0.15, type = "square", vol = 0.07, slide = 0, delay = 0) => {
  if (muted) return;
  const c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur);
};
const startCrowd = () => {
  if (muted) return; stopCrowd();
  const c = ac(), len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 700;
  const g = c.createGain(); g.gain.value = 0.045;
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(); crowd = { s, g };
};
const stopCrowd = () => { try { crowd && crowd.s.stop(); } catch {} crowd = null; };
const fanfare = (win) => (win ? [523, 659, 784, 1046] : [392, 330, 262]).forEach((f, i) => tone(f, 0.25, "triangle", 0.09, 0, i * 0.18));

/* ================= ক্যানভাস টেক্সচার ================= */
const canvasTex = (w, h, draw) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};

/* ================= বাস্তবসম্মত মানুষ (অ্যাথলেট) ================= */
function makeRunner({ skin, hair, shirt, shorts, shoe, number }) {
  const root = new THREE.Group(), body = new THREE.Group();
  body.scale.setScalar(0.93); root.add(body);
  const M = (c, r = 0.65) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const skinM = M(skin, 0.5), shirtM = M(shirt, 0.85), shortM = M(shorts, 0.85), hairM = M(hair, 0.9), shoeM = M(shoe, 0.5), darkM = M(0x1a1a1a, 0.4);
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
  const put = (geo, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
  };

  // পা
  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.95, 0); body.add(hip);
    put(cap(0.082, 0.3), skinM, 0, -0.24, 0, hip);
    put(cap(0.09, 0.14), shortM, 0, -0.13, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -0.47; hip.add(knee);
    put(cap(0.062, 0.3), skinM, 0, -0.22, 0, knee);
    put(new THREE.BoxGeometry(0.1, 0.07, 0.27), shoeM, 0, -0.45, -0.05, knee);
    return { hip, knee };
  });

  // শরীরের ওপরের অংশ
  const upper = new THREE.Group(); upper.position.y = 0.95; body.add(upper);
  put(cap(0.15, 0.04), shortM, 0, 0.04, 0, upper).scale.set(1.15, 0.9, 0.8);
  put(cap(0.15, 0.3), shirtM, 0, 0.4, 0, upper).scale.set(1.2, 1, 0.74);
  put(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12), skinM, 0, 0.75, 0, upper);

  // পিঠের নম্বর (বিব)
  const bib = canvasTex(128, 96, (g, w, h) => {
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.font = "bold 70px sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(number), w / 2, h / 2 + 4);
  });
  put(new THREE.PlaneGeometry(0.22, 0.165), new THREE.MeshBasicMaterial({ map: bib }), 0, 0.42, 0.115, upper);

  // হাত
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.225, 0.63, 0); upper.add(sh);
    put(new THREE.SphereGeometry(0.065, 14, 14), shirtM, 0, 0, 0, sh);
    put(cap(0.048, 0.2), skinM, 0, -0.16, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.31; sh.add(el);
    put(cap(0.04, 0.18), skinM, 0, -0.14, 0, el);
    put(new THREE.SphereGeometry(0.048, 12, 12), skinM, 0, -0.29, 0, el);
    return { sh, el, s };
  });

  // মাথা, চুল, মুখ
  const head = new THREE.Group(); head.position.y = 0.88; upper.add(head);
  put(new THREE.SphereGeometry(0.115, 24, 20), skinM, 0, 0, 0, head).scale.set(0.9, 1.12, 1);
  put(new THREE.SphereGeometry(0.122, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), hairM, 0, 0.012, 0.012, head).scale.set(0.93, 1.12, 1.04);
  [-1, 1].forEach((s) => {
    put(new THREE.SphereGeometry(0.028, 10, 10), skinM, s * 0.105, -0.005, 0, head).scale.set(0.6, 1, 0.8);
    put(new THREE.SphereGeometry(0.013, 8, 8), darkM, s * 0.04, 0.018, -0.104, head);
    put(new THREE.BoxGeometry(0.045, 0.008, 0.01), hairM, s * 0.04, 0.045, -0.104, head);
  });
  put(new THREE.SphereGeometry(0.018, 10, 10), skinM, 0, -0.015, -0.112, head);
  put(new THREE.BoxGeometry(0.04, 0.007, 0.01), M(0x8b3a3a), 0, -0.055, -0.1, head);
  const band = put(new THREE.TorusGeometry(0.118, 0.012, 8, 28), shirtM, 0, 0.05, 0, head);
  band.rotation.x = Math.PI / 2; band.scale.set(0.93, 1.04, 1);

  root.userData = { legs, arms, upper, head, body };
  return root;
}

// দৌড়ের ভঙ্গি: p = ফেজ, amt = দৌড়ের মাত্রা (০–১)
function pose(r, p, amt, win) {
  const { legs, arms, upper, head, body } = r.userData;
  legs.forEach((l, i) => {
    const ph = p + i * Math.PI;
    l.hip.rotation.x = Math.sin(ph) * 0.95 * amt;
    l.knee.rotation.x = -(Math.max(0, Math.cos(ph)) * 1.5 * amt + 0.05);
  });
  arms.forEach((a, i) => {
    const ph = p + i * Math.PI + Math.PI;
    a.sh.rotation.x = win ? 2.8 : Math.sin(ph) * 0.9 * amt + 0.05;
    a.sh.rotation.z = a.s * (win ? 0.35 : 0.12);
    a.el.rotation.x = win ? 0.2 : 0.2 + (1 + 0.25 * Math.sin(ph)) * amt;
  });
  upper.rotation.x = -0.04 - 0.22 * amt;
  upper.rotation.y = Math.sin(p) * 0.12 * amt;
  head.rotation.x = 0.15 * amt;
  body.position.y = Math.abs(Math.sin(p)) * 0.07 * amt + (win ? Math.abs(Math.sin(p * 0.5)) * 0.25 : 0);
}

const DEFS = [
  { name: "আপনি", skin: 0xe0ac69, hair: 0x1b1b1b, shirt: 0x1e88e5, shorts: 0x0d2b52, shoe: 0xffffff, color: "#1e88e5", number: 7, lane: 2 },
  { name: "রাকিব", skin: 0xc68642, hair: 0x2b1a10, shirt: 0xe53935, shorts: 0x222222, shoe: 0xffd54f, color: "#e53935", number: 3, lane: 0 },
  { name: "সুমন", skin: 0xf1c27d, hair: 0x4a2f1b, shirt: 0x43a047, shorts: 0xffffff, shoe: 0x222222, color: "#43a047", number: 12, lane: 1 },
  { name: "নাদিম", skin: 0x8d5524, hair: 0x0e0e0e, shirt: 0xfdd835, shorts: 0x5e35b1, shoe: 0xffffff, color: "#fdd835", number: 5, lane: 3 },
];

/* ================= মূল কম্পোনেন্ট ================= */
export default function Game() {
  const mountRef = useRef(null);
  const api = useRef({});
  const [status, setStatus] = useState("idle"); // idle | racing | over
  const [count, setCount] = useState("");
  const [hud, setHud] = useState({ rank: 1, left: FINISH, speed: 0, dots: DEFS.map((d) => ({ c: d.color, f: 0 })) });
  const [results, setResults] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const [plays, setPlays] = useState(0);
  const [mute, setMute] = useState(false);
  const [diff, setDiff] = useState(1);

  useEffect(() => {
    setPlays(readPlays());
    const bt0 = parseFloat(lsGet("race_best_time", ""));
    if (bt0) setBestTime(bt0);

    const mount = mountRef.current;
    if (!mount) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const half = (LANES * LW) / 2;
    const zStart = 15, zEnd = -(FINISH + 40), len = zStart - zEnd, zc = (zStart + zEnd) / 2;

    const scene = new THREE.Scene();
    scene.background = canvasTex(2, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "#3f86d6"); gr.addColorStop(0.7, "#bfe3f7"); gr.addColorStop(1, "#eaf6fc");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    scene.fog = new THREE.Fog(0xcfe8f5, 40, 135);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: !coarse });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8f5a, 0.85));
    const sun = new THREE.DirectionalLight(0xfff2d6, 1.5);
    const sres = coarse ? 1024 : 2048;
    sun.castShadow = true; sun.shadow.mapSize.set(sres, sres);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
    sun.shadow.bias = -0.0006;
    scene.add(sun, sun.target);

    /* ---- মাঠ ও ট্র্যাক ---- */
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x3f8f3f, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.02, -60); grass.receiveShadow = true; scene.add(grass);

    const track = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW + 1.2, len), new THREE.MeshStandardMaterial({ color: 0xc4533a, roughness: 0.95 }));
    track.rotation.x = -Math.PI / 2; track.position.set(0, 0, zc); track.receiveShadow = true; scene.add(track);

    const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i <= LANES; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.07, len), white);
      l.rotation.x = -Math.PI / 2; l.position.set(-half + i * LW, 0.012, zc); scene.add(l);
    }
    const startLine = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW, 0.15), white);
    startLine.rotation.x = -Math.PI / 2; startLine.position.set(0, 0.013, 0.3); scene.add(startLine);

    const checker = canvasTex(256, 32, (g) => {
      for (let y = 0; y < 2; y++) for (let x = 0; x < 16; x++) { g.fillStyle = (x + y) % 2 ? "#fff" : "#111"; g.fillRect(x * 16, y * 16, 16, 16); }
    });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW, 0.8), new THREE.MeshBasicMaterial({ map: checker }));
    fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.014, -FINISH); scene.add(fl);

    // ফিনিশ গেট
    const pole = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    [-1, 1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 10), pole);
      p.position.set(s * (half + 0.7), 2.5, -FINISH); p.castShadow = true; scene.add(p);
    });
    const banner = canvasTex(512, 96, (g, w, h) => {
      g.fillStyle = "#c62828"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "bold 60px sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FINISH  ফিনিশ", w / 2, h / 2 + 3);
    });
    const bn1 = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW + 1.8, 1.1), new THREE.MeshBasicMaterial({ map: banner, side: THREE.DoubleSide }));
    bn1.position.set(0, 4.7, -FINISH); scene.add(bn1);

    // দূরত্বের সাইনবোর্ড
    [20, 40, 60, 80].forEach((d) => {
      const tex = canvasTex(128, 64, (g, w, h) => {
        g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.font = "bold 38px sans-serif";
        g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(`${bn(d)} মি`, w / 2, h / 2 + 2);
      });
      [-1, 1].forEach((s) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
        sp.scale.set(1.4, 0.7, 1); sp.position.set(s * (half + 1), 0.6, -d); scene.add(sp);
      });
    });

    // বিজ্ঞাপন বোর্ড
    const adCols = [0x1565c0, 0xef6c00, 0x2e7d32, 0xad1457, 0x00838f];
    for (let i = 0; i < 24; i++) [-1, 1].forEach((s) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 5.6), new THREE.MeshStandardMaterial({ color: adCols[(i + (s > 0 ? 2 : 0)) % 5] }));
      b.position.set(s * (half + 1.7), 0.4, zStart - 3 - i * 6.5); scene.add(b);
    });

    // গ্যালারি ও দর্শক
    const steps = 4, spacing = 0.75, perRow = Math.floor(len / spacing);
    const crowd3d = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.6, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 2 * steps * perRow);
    const dummy = new THREE.Object3D(), col = new THREE.Color();
    const shirts = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xffffff, 0xff7043, 0x8e24aa, 0x212121];
    let n = 0;
    [-1, 1].forEach((s) => {
      for (let k = 0; k < steps; k++) {
        const h = 0.7 * (k + 1), x = s * (half + 3.4 + k * 2.2);
        const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, h, len), new THREE.MeshStandardMaterial({ color: 0x9aa0a6 }));
        st.position.set(x, h / 2, zc); scene.add(st);
        for (let i = 0; i < perRow; i++) {
          dummy.position.set(x + (Math.random() - 0.5) * 0.8, h + 0.3, zEnd + i * spacing + Math.random() * 0.2);
          dummy.updateMatrix(); crowd3d.setMatrixAt(n, dummy.matrix);
          crowd3d.setColorAt(n++, col.setHex(shirts[Math.floor(Math.random() * shirts.length)]));
        }
      }
    });
    if (crowd3d.instanceColor) crowd3d.instanceColor.needsUpdate = true;
    scene.add(crowd3d);

    // গাছ
    for (let i = 0; i < 30; i++) {
      const t = new THREE.Group(), s = Math.random() < 0.5 ? -1 : 1, sc = 0.8 + Math.random() * 0.8;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2, 8), new THREE.MeshStandardMaterial({ color: 0x6d4c41 }));
      trunk.position.y = 1; const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 10), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
      top.position.y = 4; t.add(trunk, top); t.scale.setScalar(sc);
      t.position.set(s * (28 + Math.random() * 25), 0, 10 - Math.random() * 190); scene.add(t);
    }

    /* ---- দৌড়বিদ ---- */
    const runners = DEFS.map((d, i) => {
      const mesh = makeRunner(d); scene.add(mesh);
      return { ...d, mesh, player: i === 0, x: -half + (d.lane + 0.5) * LW, z: 0, v: 0, p: Math.random() * 6, finished: false, place: 0, time: 0, win: false, base: 7, seed: Math.random() * 10 };
    });
    const P = runners[0];
    const st = { phase: "idle", cd: 0, lastN: 0, raceT: 0, placed: 0, endT: 0, shown: false, hudT: 0, lastSide: 9, diff: 1 };
    const order = () => [...runners].sort((a, b) => (a.finished && b.finished ? a.place - b.place : a.finished ? -1 : b.finished ? 1 : a.z - b.z));

    api.current.start = (d) => {
      runners.forEach((r) => Object.assign(r, { z: 0, v: 0, finished: false, place: 0, time: 0, win: false, base: r.player ? 0 : (6.6 + Math.random() * 0.8) * DIFF[d] }));
      Object.assign(st, { phase: "countdown", cd: 3, lastN: 0, raceT: 0, placed: 0, endT: 0, shown: false, lastSide: 9 });
      setResults([]); setStatus("racing");
    };
    api.current.tap = (side) => {
      if (st.phase !== "racing" || P.finished) return;
      const alt = side === 0 || side !== st.lastSide;
      st.lastSide = side;
      P.v = Math.min(10.5, P.v + (alt ? 1.15 : 0.6));
      tone(110 + Math.random() * 30, 0.06, "sine", 0.06, -40);
    };

    /* ---- রেসপন্সিভ রিসাইজ ---- */
    let portrait = false;
    const resize = () => {
      const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
      renderer.setSize(w, h); camera.aspect = w / h; portrait = w / h < 0.85; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(mount);
    camera.position.set(0, 3.4, 7);

    /* ---- মূল লুপ ---- */
    let last = performance.now(), raf;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;

      if (st.phase === "countdown") {
        st.cd -= dt;
        const k = Math.ceil(st.cd);
        if (k !== st.lastN && k > 0) { st.lastN = k; setCount(bn(k)); tone(440, 0.15, "square", 0.08); }
        if (st.cd <= 0) {
          st.phase = "racing"; setCount("দৌড়!"); tone(880, 0.5, "square", 0.1); startCrowd();
          setTimeout(() => setCount(""), 900);
        }
      }

      if (st.phase === "racing" || st.phase === "finished") {
        st.raceT += dt;
        runners.forEach((r) => {
          if (r.finished) r.v = Math.max(0, r.v - 4 * dt);
          else if (r.player) r.v = Math.max(0, r.v - 0.9 * r.v * dt);
          else {
            const gap = r.z - P.z; // ঋণাত্মক = আপনার সামনে
            let k = 1 + 0.07 * Math.sin(st.raceT * 0.8 + r.seed);
            if (!P.finished) { if (gap < -8) k *= 0.95; else if (gap > 6) k *= 1.05; }
            const target = r.base * k * (st.raceT < 1.5 ? 0.6 : 1);
            r.v += Math.sign(target - r.v) * Math.min(Math.abs(target - r.v), 6 * dt);
          }
          r.z -= r.v * dt; r.p += r.v * dt * 2.2;
          if (!r.finished && r.z <= -FINISH) {
            r.finished = true; r.place = ++st.placed; r.win = r.place === 1;
            r.time = st.raceT - (-FINISH - r.z) / Math.max(r.v, 1);
            if (r.player) { st.phase = "finished"; fanfare(r.place === 1); }
          }
        });
      }

      if (st.phase === "finished") {
        st.endT += dt;
        if (st.endT > 2.8 && !st.shown) {
          st.shown = true; stopCrowd();
          const list = order();
          setResults(list.map((r) => ({ name: r.name, color: r.color, player: r.player, time: r.finished ? r.time : null })));
          const rank = list.indexOf(P);
          const bt = parseFloat(lsGet("race_best_time", "999"));
          if (P.time < bt) { try { localStorage.setItem("race_best_time", String(P.time)); } catch {} setBestTime(P.time); }
          setHud((h) => ({ ...h, rank: rank + 1 }));
          setStatus("over");
        }
      }

      runners.forEach((r) => {
        r.mesh.position.set(r.x, 0, r.z);
        pose(r.mesh, r.p, Math.min(1, r.v / 4), r.win && r.v < 3);
      });

      if (st.phase !== "idle") {
        st.hudT += dt;
        if (st.hudT > 0.1) {
          st.hudT = 0;
          setHud({ rank: order().indexOf(P) + 1, left: Math.max(0, FINISH + P.z), speed: P.v, dots: runners.map((r) => ({ c: r.color, f: Math.min(1, Math.max(0, -r.z / FINISH)) })) });
        }
      }

      // ক্যামেরা
      const back = portrait ? 10 : 6.8, up = portrait ? 4.8 : 3.4;
      camera.position.x += (P.x * 0.3 - camera.position.x) * Math.min(1, dt * 4);
      camera.position.y = up;
      camera.position.z += (P.z + back - camera.position.z) * Math.min(1, dt * 8);
      camera.fov = (portrait ? 72 : 58) + Math.min(6, P.v * 0.5);
      camera.updateProjectionMatrix();
      camera.lookAt(camera.position.x * 0.5, 1.1, camera.position.z - (portrait ? 14 : 10));
      sun.position.set(8, 14, P.z + 6); sun.target.position.set(0, 0, P.z - 4);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    /* ---- কিবোর্ড ---- */
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (["arrowleft", "a", "z"].includes(k)) api.current.tap(-1);
      else if (["arrowright", "d", "x"].includes(k)) api.current.tap(1);
      else if (k === " ") { e.preventDefault(); api.current.tap(0); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); stopCrowd();
      window.removeEventListener("keydown", onKey);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const left = Math.max(0, DAILY_LIMIT - plays);
  const play = () => {
    const n = readPlays();
    if (n >= DAILY_LIMIT) { setPlays(n); return; }
    writePlays(n + 1); setPlays(n + 1); ac(); api.current.start(diff);
  };
  const toggleMute = () => { muted = !muted; setMute(muted); if (muted) stopCrowd(); };

  /* ---- স্টাইল ---- */
  const fs = (min, vw, max) => `clamp(${min}px, ${vw}vw, ${max}px)`;
  const pill = { background: "rgba(10,20,40,.62)", color: "#fff", borderRadius: 14, padding: "6px 14px", backdropFilter: "blur(4px)" };
  const btn = { padding: "12px 28px", fontSize: fs(16, 4.5, 20), border: 0, borderRadius: 12, background: "#ffb300", color: "#222", cursor: "pointer", fontWeight: 700 };
  const pad = { flex: 1, maxWidth: 300, height: "clamp(84px, 17vh, 130px)", border: 0, borderRadius: 20, background: "rgba(255,179,0,.88)", color: "#222", fontSize: fs(20, 5.5, 28), fontWeight: 800, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,.35)" };
  const tapHandler = (side) => (e) => { e.preventDefault(); api.current.tap(side); };
  const rank = results.findIndex((r) => r.player);

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden", color: "#fff", userSelect: "none", WebkitUserSelect: "none", touchAction: "none", background: "#111" }}>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between", pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ ...pill, fontSize: fs(18, 5, 28), fontWeight: 800 }}>{ORD[hud.rank - 1]} <span style={{ fontSize: "0.6em", opacity: 0.8 }}>/ ৪</span></div>
          <div style={{ ...pill, fontSize: fs(13, 3.4, 18) }}>বাকি {bn(hud.left)} মি</div>
          <div style={{ ...pill, fontSize: fs(13, 3.4, 18) }}>{bn(hud.speed * 3.6)} কিমি/ঘ</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", pointerEvents: "auto" }}>
          <div style={{ ...pill, fontSize: fs(12, 3.2, 16) }}>সুযোগ {bn(left)}/{bn(DAILY_LIMIT)}</div>
          <button onClick={toggleMute} style={{ ...btn, padding: "6px 12px", fontSize: 18 }}>{mute ? "🔇" : "🔊"}</button>
        </div>
      </div>

      {/* অগ্রগতি বার */}
      {status === "racing" && (
        <div style={{ position: "absolute", top: "clamp(52px, 9vh, 68px)", left: "50%", transform: "translateX(-50%)", width: "min(560px, 90vw)", height: 10, borderRadius: 6, background: "rgba(255,255,255,.35)" }}>
          {hud.dots.map((d, i) => (
            <div key={i} style={{ position: "absolute", left: `${d.f * 100}%`, top: "50%", width: i === 0 ? 18 : 12, height: i === 0 ? 18 : 12, borderRadius: "50%", background: d.c, border: "2px solid #fff", transform: "translate(-50%,-50%)", zIndex: i === 0 ? 2 : 1 }} />
          ))}
          <div style={{ position: "absolute", right: -6, top: -16, fontSize: 16 }}>🏁</div>
        </div>
      )}

      {/* কাউন্টডাউন */}
      {count && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontSize: "clamp(70px, 22vw, 180px)", fontWeight: 900, textShadow: "0 4px 18px rgba(0,0,0,.7)" }}>{count}</div>
      )}

      {/* রান বাটন */}
      {status === "racing" && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "max(14px, env(safe-area-inset-bottom))", padding: "0 14px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ ...pill, fontSize: fs(11, 3, 14), textAlign: "center" }}>বাম-ডান বাটন পর্যায়ক্রমে দ্রুত চাপুন (কিবোর্ডে ← → / A D / স্পেস)</div>
          <div style={{ display: "flex", gap: 14, width: "100%", justifyContent: "center" }}>
            <button style={pad} onPointerDown={tapHandler(-1)}>◀ বাম পা</button>
            <button style={pad} onPointerDown={tapHandler(1)}>ডান পা ▶</button>
          </div>
        </div>
      )}

      {/* মেনু / ফলাফল */}
      {status !== "racing" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,12,30,.62)", padding: 12, boxSizing: "border-box" }}>
          <div style={{ width: "min(460px, 100%)", maxHeight: "92%", overflowY: "auto", background: "rgba(15,25,50,.92)", borderRadius: 22, padding: "clamp(16px, 4vw, 28px)", textAlign: "center", boxShadow: "0 14px 50px rgba(0,0,0,.5)" }}>
            {status === "over" ? (
              <>
                <h1 style={{ margin: "0 0 4px", fontSize: fs(22, 6, 32) }}>{rank === 0 ? "🏆 অভিনন্দন! আপনি প্রথম!" : `আপনি ${ORD[rank]} হয়েছেন`}</h1>
                <div style={{ margin: "12px 0", display: "grid", gap: 8 }}>
                  {results.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, background: r.player ? "rgba(255,179,0,.25)" : "rgba(255,255,255,.08)", border: r.player ? "2px solid #ffb300" : "2px solid transparent" }}>
                      <span style={{ fontSize: 22 }}>{MEDAL[i]}</span>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: r.color }} />
                      <span style={{ flex: 1, textAlign: "left", fontWeight: 700 }}>{r.name}</span>
                      <span style={{ opacity: 0.85 }}>{r.time ? `${bn(r.time, 2)} সে` : "দৌড়াচ্ছে"}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 style={{ margin: "0 0 6px", fontSize: fs(24, 7, 36) }}>🏃 ১০০ মিটার দৌড় প্রতিযোগিতা</h1>
                <p style={{ margin: "0 0 12px", opacity: 0.85, fontSize: fs(13, 3.6, 16), lineHeight: 1.5 }}>৩ জন প্রতিদ্বন্দ্বীর সাথে দৌড়ান। বাম ও ডান বাটন পর্যায়ক্রমে যত দ্রুত চাপবেন, তত জোরে ছুটবেন!</p>
              </>
            )}
            {bestTime && <p style={{ margin: "0 0 10px", fontSize: 14, opacity: 0.8 }}>আপনার সেরা সময়: {bn(bestTime, 2)} সেকেন্ড</p>}
            {left > 0 ? (
              <>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
                  {DIFF_NAMES.map((nm, i) => (
                    <button key={i} onClick={() => setDiff(i)} style={{ ...btn, padding: "8px 14px", fontSize: 14, background: diff === i ? "#ffb300" : "rgba(255,255,255,.15)", color: diff === i ? "#222" : "#fff" }}>{nm}</button>
                  ))}
                </div>
                <button style={btn} onClick={play}>{status === "over" ? "আবার দৌড়ান" : "দৌড় শুরু করুন"}</button>
                <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.75 }}>আজকের বাকি সুযোগ: {bn(left)}/{bn(DAILY_LIMIT)}</p>
              </>
            ) : (
              <p style={{ fontSize: fs(16, 4.5, 20), color: "#ff8a80", margin: "8px 0 0" }}>আজকের লিমিট শেষ ({bn(DAILY_LIMIT)} বার)। কাল আবার আসুন!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as THREE from "three";

// /* ================= সেটিংস ================= */
// const DAILY_LIMIT = 5;      // দিনে সর্বোচ্চ কতবার দৌড়ানো যাবে
// const FINISH = 100;         // দৌড়ের দূরত্ব (মিটার)
// const LANES = 4, LW = 1.6;  // লেন সংখ্যা ও প্রস্থ
// const DIFF = [0.92, 1, 1.07];
// const DIFF_NAMES = ["সহজ", "মাঝারি", "কঠিন"];
// const bn = (n, d = 0) => Number(n).toLocaleString("bn-BD", { useGrouping: false, minimumFractionDigits: d, maximumFractionDigits: d });
// const ORD = ["১ম", "২য়", "৩য়", "৪র্থ"];
// const MEDAL = ["🥇", "🥈", "🥉", "🏅"];

// /* ================= দৈনিক লিমিট ================= */
// const today = () => new Date().toISOString().slice(0, 10);
// const readPlays = () => {
//   try { const d = JSON.parse(localStorage.getItem("race_plays") || "{}"); return d.date === today() ? d.count : 0; } catch { return 0; }
// };
// const writePlays = (count) => { try { localStorage.setItem("race_plays", JSON.stringify({ date: today(), count })); } catch {} };

// /* ================= সাউন্ড (Web Audio) ================= */
// let actx, muted = false, crowd = null;
// const ac = () => {
//   actx = actx || new (window.AudioContext || window.webkitAudioContext)();
//   if (actx.state === "suspended") actx.resume();
//   return actx;
// };
// const tone = (f, dur = 0.15, type = "square", vol = 0.07, slide = 0, delay = 0) => {
//   if (muted) return;
//   const c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
//   o.type = type; o.frequency.setValueAtTime(f, t);
//   if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
//   g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
//   o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur);
// };
// const startCrowd = () => {
//   if (muted) return; stopCrowd();
//   const c = ac(), len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
//   for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
//   const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
//   const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 700;
//   const g = c.createGain(); g.gain.value = 0.045;
//   s.connect(f); f.connect(g); g.connect(c.destination); s.start(); crowd = { s, g };
// };
// const stopCrowd = () => { try { crowd && crowd.s.stop(); } catch {} crowd = null; };
// const fanfare = (win) => (win ? [523, 659, 784, 1046] : [392, 330, 262]).forEach((f, i) => tone(f, 0.25, "triangle", 0.09, 0, i * 0.18));

// /* ================= ক্যানভাস টেক্সচার ================= */
// const canvasTex = (w, h, draw) => {
//   const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
//   const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
// };

// /* ================= বাস্তবসম্মত মানুষ (অ্যাথলেট) ================= */
// function makeRunner({ skin, hair, shirt, shorts, shoe, number }) {
//   const root = new THREE.Group(), body = new THREE.Group();
//   body.scale.setScalar(0.93); root.add(body);
//   const M = (c, r = 0.65) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
//   const skinM = M(skin, 0.5), shirtM = M(shirt, 0.85), shortM = M(shorts, 0.85), hairM = M(hair, 0.9), shoeM = M(shoe, 0.5), darkM = M(0x1a1a1a, 0.4);
//   const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
//   const put = (geo, mat, x, y, z, parent) => {
//     const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
//   };

//   // পা
//   const legs = [-1, 1].map((s) => {
//     const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.95, 0); body.add(hip);
//     put(cap(0.082, 0.3), skinM, 0, -0.24, 0, hip);
//     put(cap(0.09, 0.14), shortM, 0, -0.13, 0, hip);
//     const knee = new THREE.Group(); knee.position.y = -0.47; hip.add(knee);
//     put(cap(0.062, 0.3), skinM, 0, -0.22, 0, knee);
//     put(new THREE.BoxGeometry(0.1, 0.07, 0.27), shoeM, 0, -0.45, -0.05, knee);
//     return { hip, knee };
//   });

//   // শরীরের ওপরের অংশ
//   const upper = new THREE.Group(); upper.position.y = 0.95; body.add(upper);
//   put(cap(0.15, 0.04), shortM, 0, 0.04, 0, upper).scale.set(1.15, 0.9, 0.8);
//   put(cap(0.15, 0.3), shirtM, 0, 0.4, 0, upper).scale.set(1.2, 1, 0.74);
//   put(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12), skinM, 0, 0.75, 0, upper);

//   // পিঠের নম্বর (বিব)
//   const bib = canvasTex(128, 96, (g, w, h) => {
//     g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.font = "bold 70px sans-serif";
//     g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(number), w / 2, h / 2 + 4);
//   });
//   put(new THREE.PlaneGeometry(0.22, 0.165), new THREE.MeshBasicMaterial({ map: bib }), 0, 0.42, 0.115, upper);

//   // হাত
//   const arms = [-1, 1].map((s) => {
//     const sh = new THREE.Group(); sh.position.set(s * 0.225, 0.63, 0); upper.add(sh);
//     put(new THREE.SphereGeometry(0.065, 14, 14), shirtM, 0, 0, 0, sh);
//     put(cap(0.048, 0.2), skinM, 0, -0.16, 0, sh);
//     const el = new THREE.Group(); el.position.y = -0.31; sh.add(el);
//     put(cap(0.04, 0.18), skinM, 0, -0.14, 0, el);
//     put(new THREE.SphereGeometry(0.048, 12, 12), skinM, 0, -0.29, 0, el);
//     return { sh, el, s };
//   });

//   // মাথা, চুল, মুখ
//   const head = new THREE.Group(); head.position.y = 0.88; upper.add(head);
//   put(new THREE.SphereGeometry(0.115, 24, 20), skinM, 0, 0, 0, head).scale.set(0.9, 1.12, 1);
//   put(new THREE.SphereGeometry(0.122, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), hairM, 0, 0.012, 0.012, head).scale.set(0.93, 1.12, 1.04);
//   [-1, 1].forEach((s) => {
//     put(new THREE.SphereGeometry(0.028, 10, 10), skinM, s * 0.105, -0.005, 0, head).scale.set(0.6, 1, 0.8);
//     put(new THREE.SphereGeometry(0.013, 8, 8), darkM, s * 0.04, 0.018, -0.104, head);
//     put(new THREE.BoxGeometry(0.045, 0.008, 0.01), hairM, s * 0.04, 0.045, -0.104, head);
//   });
//   put(new THREE.SphereGeometry(0.018, 10, 10), skinM, 0, -0.015, -0.112, head);
//   put(new THREE.BoxGeometry(0.04, 0.007, 0.01), M(0x8b3a3a), 0, -0.055, -0.1, head);
//   const band = put(new THREE.TorusGeometry(0.118, 0.012, 8, 28), shirtM, 0, 0.05, 0, head);
//   band.rotation.x = Math.PI / 2; band.scale.set(0.93, 1.04, 1);

//   root.userData = { legs, arms, upper, head, body };
//   return root;
// }

// // দৌড়ের ভঙ্গি: p = ফেজ, amt = দৌড়ের মাত্রা (০–১)
// function pose(r, p, amt, win) {
//   const { legs, arms, upper, head, body } = r.userData;
//   legs.forEach((l, i) => {
//     const ph = p + i * Math.PI;
//     l.hip.rotation.x = Math.sin(ph) * 0.95 * amt;
//     l.knee.rotation.x = -(Math.max(0, Math.cos(ph)) * 1.5 * amt + 0.05);
//   });
//   arms.forEach((a, i) => {
//     const ph = p + i * Math.PI + Math.PI;
//     a.sh.rotation.x = win ? 2.8 : Math.sin(ph) * 0.9 * amt + 0.05;
//     a.sh.rotation.z = a.s * (win ? 0.35 : 0.12);
//     a.el.rotation.x = win ? 0.2 : 0.2 + (1 + 0.25 * Math.sin(ph)) * amt;
//   });
//   upper.rotation.x = -0.04 - 0.22 * amt;
//   upper.rotation.y = Math.sin(p) * 0.12 * amt;
//   head.rotation.x = 0.15 * amt;
//   body.position.y = Math.abs(Math.sin(p)) * 0.07 * amt + (win ? Math.abs(Math.sin(p * 0.5)) * 0.25 : 0);
// }

// const DEFS = [
//   { name: "আপনি", skin: 0xe0ac69, hair: 0x1b1b1b, shirt: 0x1e88e5, shorts: 0x0d2b52, shoe: 0xffffff, color: "#1e88e5", number: 7, lane: 2 },
//   { name: "রাকিব", skin: 0xc68642, hair: 0x2b1a10, shirt: 0xe53935, shorts: 0x222222, shoe: 0xffd54f, color: "#e53935", number: 3, lane: 0 },
//   { name: "সুমন", skin: 0xf1c27d, hair: 0x4a2f1b, shirt: 0x43a047, shorts: 0xffffff, shoe: 0x222222, color: "#43a047", number: 12, lane: 1 },
//   { name: "নাদিম", skin: 0x8d5524, hair: 0x0e0e0e, shirt: 0xfdd835, shorts: 0x5e35b1, shoe: 0xffffff, color: "#fdd835", number: 5, lane: 3 },
// ];

// /* ================= মূল কম্পোনেন্ট ================= */
// export default function Game() {
//   const mountRef = useRef(null);
//   const api = useRef({});
//   const [status, setStatus] = useState("idle"); // idle | racing | over
//   const [count, setCount] = useState("");
//   const [hud, setHud] = useState({ rank: 1, left: FINISH, speed: 0, dots: DEFS.map((d) => ({ c: d.color, f: 0 })) });
//   const [results, setResults] = useState([]);
//   const [bestTime, setBestTime] = useState(null);
//   const [plays, setPlays] = useState(0);
//   const [mute, setMute] = useState(false);
//   const [diff, setDiff] = useState(1);

//   useEffect(() => {
//     setPlays(readPlays());
//     const bt = parseFloat(localStorage.getItem("race_best_time") || "");
//     if (bt) setBestTime(bt);

//     const mount = mountRef.current;
//     const coarse = window.matchMedia("(pointer: coarse)").matches;
//     const half = (LANES * LW) / 2;
//     const zStart = 15, zEnd = -(FINISH + 40), len = zStart - zEnd, zc = (zStart + zEnd) / 2;

//     const scene = new THREE.Scene();
//     scene.background = canvasTex(2, 256, (g, w, h) => {
//       const gr = g.createLinearGradient(0, 0, 0, h);
//       gr.addColorStop(0, "#3f86d6"); gr.addColorStop(0.7, "#bfe3f7"); gr.addColorStop(1, "#eaf6fc");
//       g.fillStyle = gr; g.fillRect(0, 0, w, h);
//     });
//     scene.fog = new THREE.Fog(0xcfe8f5, 40, 135);

//     const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);
//     const renderer = new THREE.WebGLRenderer({ antialias: !coarse });
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     mount.appendChild(renderer.domElement);

//     scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8f5a, 0.85));
//     const sun = new THREE.DirectionalLight(0xfff2d6, 1.5);
//     const sres = coarse ? 1024 : 2048;
//     sun.castShadow = true; sun.shadow.mapSize.set(sres, sres);
//     Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
//     sun.shadow.bias = -0.0006;
//     scene.add(sun, sun.target);

//     /* ---- মাঠ ও ট্র্যাক ---- */
//     const grass = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x3f8f3f, roughness: 1 }));
//     grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.02, -60); grass.receiveShadow = true; scene.add(grass);

//     const track = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW + 1.2, len), new THREE.MeshStandardMaterial({ color: 0xc4533a, roughness: 0.95 }));
//     track.rotation.x = -Math.PI / 2; track.position.set(0, 0, zc); track.receiveShadow = true; scene.add(track);

//     const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
//     for (let i = 0; i <= LANES; i++) {
//       const l = new THREE.Mesh(new THREE.PlaneGeometry(0.07, len), white);
//       l.rotation.x = -Math.PI / 2; l.position.set(-half + i * LW, 0.012, zc); scene.add(l);
//     }
//     const startLine = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW, 0.15), white);
//     startLine.rotation.x = -Math.PI / 2; startLine.position.set(0, 0.013, 0.3); scene.add(startLine);

//     const checker = canvasTex(256, 32, (g) => {
//       for (let y = 0; y < 2; y++) for (let x = 0; x < 16; x++) { g.fillStyle = (x + y) % 2 ? "#fff" : "#111"; g.fillRect(x * 16, y * 16, 16, 16); }
//     });
//     const fl = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW, 0.8), new THREE.MeshBasicMaterial({ map: checker }));
//     fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.014, -FINISH); scene.add(fl);

//     // ফিনিশ গেট
//     const pole = new THREE.MeshStandardMaterial({ color: 0xdddddd });
//     [-1, 1].forEach((s) => {
//       const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 10), pole);
//       p.position.set(s * (half + 0.7), 2.5, -FINISH); p.castShadow = true; scene.add(p);
//     });
//     const banner = canvasTex(512, 96, (g, w, h) => {
//       g.fillStyle = "#c62828"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "bold 60px sans-serif";
//       g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("FINISH  ফিনিশ", w / 2, h / 2 + 3);
//     });
//     const bn1 = new THREE.Mesh(new THREE.PlaneGeometry(LANES * LW + 1.8, 1.1), new THREE.MeshBasicMaterial({ map: banner, side: THREE.DoubleSide }));
//     bn1.position.set(0, 4.7, -FINISH); scene.add(bn1);

//     // দূরত্বের সাইনবোর্ড
//     [20, 40, 60, 80].forEach((d) => {
//       const tex = canvasTex(128, 64, (g, w, h) => {
//         g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#222"; g.font = "bold 38px sans-serif";
//         g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(`${bn(d)} মি`, w / 2, h / 2 + 2);
//       });
//       [-1, 1].forEach((s) => {
//         const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
//         sp.scale.set(1.4, 0.7, 1); sp.position.set(s * (half + 1), 0.6, -d); scene.add(sp);
//       });
//     });

//     // বিজ্ঞাপন বোর্ড
//     const adCols = [0x1565c0, 0xef6c00, 0x2e7d32, 0xad1457, 0x00838f];
//     for (let i = 0; i < 24; i++) [-1, 1].forEach((s) => {
//       const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 5.6), new THREE.MeshStandardMaterial({ color: adCols[(i + (s > 0 ? 2 : 0)) % 5] }));
//       b.position.set(s * (half + 1.7), 0.4, zStart - 3 - i * 6.5); scene.add(b);
//     });

//     // গ্যালারি ও দর্শক
//     const steps = 4, spacing = 0.75, perRow = Math.floor(len / spacing);
//     const crowd3d = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.6, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 2 * steps * perRow);
//     const dummy = new THREE.Object3D(), col = new THREE.Color();
//     const shirts = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xffffff, 0xff7043, 0x8e24aa, 0x212121];
//     let n = 0;
//     [-1, 1].forEach((s) => {
//       for (let k = 0; k < steps; k++) {
//         const h = 0.7 * (k + 1), x = s * (half + 3.4 + k * 2.2);
//         const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, h, len), new THREE.MeshStandardMaterial({ color: 0x9aa0a6 }));
//         st.position.set(x, h / 2, zc); scene.add(st);
//         for (let i = 0; i < perRow; i++) {
//           dummy.position.set(x + (Math.random() - 0.5) * 0.8, h + 0.3, zEnd + i * spacing + Math.random() * 0.2);
//           dummy.updateMatrix(); crowd3d.setMatrixAt(n, dummy.matrix);
//           crowd3d.setColorAt(n++, col.setHex(shirts[Math.floor(Math.random() * shirts.length)]));
//         }
//       }
//     });
//     crowd3d.instanceColor.needsUpdate = true; scene.add(crowd3d);

//     // গাছ
//     for (let i = 0; i < 30; i++) {
//       const t = new THREE.Group(), s = Math.random() < 0.5 ? -1 : 1, sc = 0.8 + Math.random() * 0.8;
//       const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2, 8), new THREE.MeshStandardMaterial({ color: 0x6d4c41 }));
//       trunk.position.y = 1; const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 10), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
//       top.position.y = 4; t.add(trunk, top); t.scale.setScalar(sc);
//       t.position.set(s * (28 + Math.random() * 25), 0, 10 - Math.random() * 190); scene.add(t);
//     }

//     /* ---- দৌড়বিদ ---- */
//     const runners = DEFS.map((d, i) => {
//       const mesh = makeRunner(d); scene.add(mesh);
//       return { ...d, mesh, player: i === 0, x: -half + (d.lane + 0.5) * LW, z: 0, v: 0, p: Math.random() * 6, finished: false, place: 0, time: 0, win: false, base: 7, seed: Math.random() * 10 };
//     });
//     const P = runners[0];
//     const st = { phase: "idle", cd: 0, lastN: 0, raceT: 0, placed: 0, endT: 0, shown: false, hudT: 0, lastSide: 9, diff: 1 };
//     const order = () => [...runners].sort((a, b) => (a.finished && b.finished ? a.place - b.place : a.finished ? -1 : b.finished ? 1 : a.z - b.z));

//     api.current.start = (d) => {
//       runners.forEach((r) => Object.assign(r, { z: 0, v: 0, finished: false, place: 0, time: 0, win: false, base: r.player ? 0 : (6.6 + Math.random() * 0.8) * DIFF[d] }));
//       Object.assign(st, { phase: "countdown", cd: 3, lastN: 0, raceT: 0, placed: 0, endT: 0, shown: false, lastSide: 9 });
//       setResults([]); setStatus("racing");
//     };
//     api.current.tap = (side) => {
//       if (st.phase !== "racing" || P.finished) return;
//       const alt = side === 0 || side !== st.lastSide;
//       st.lastSide = side;
//       P.v = Math.min(10.5, P.v + (alt ? 1.15 : 0.6));
//       tone(110 + Math.random() * 30, 0.06, "sine", 0.06, -40);
//     };

//     /* ---- রেসপন্সিভ রিসাইজ ---- */
//     let portrait = false;
//     const resize = () => {
//       const w = mount.clientWidth || 1, h = mount.clientHeight || 1;
//       renderer.setSize(w, h); camera.aspect = w / h; portrait = w / h < 0.85; camera.updateProjectionMatrix();
//     };
//     resize();
//     const ro = new ResizeObserver(resize); ro.observe(mount);
//     camera.position.set(0, 3.4, 7);

//     /* ---- মূল লুপ ---- */
//     let last = performance.now(), raf;
//     const loop = (now) => {
//       raf = requestAnimationFrame(loop);
//       const dt = Math.min(0.05, (now - last) / 1000); last = now;

//       if (st.phase === "countdown") {
//         st.cd -= dt;
//         const k = Math.ceil(st.cd);
//         if (k !== st.lastN && k > 0) { st.lastN = k; setCount(bn(k)); tone(440, 0.15, "square", 0.08); }
//         if (st.cd <= 0) {
//           st.phase = "racing"; setCount("দৌড়!"); tone(880, 0.5, "square", 0.1); startCrowd();
//           setTimeout(() => setCount(""), 900);
//         }
//       }

//       if (st.phase === "racing" || st.phase === "finished") {
//         st.raceT += dt;
//         runners.forEach((r) => {
//           if (r.finished) r.v = Math.max(0, r.v - 4 * dt);
//           else if (r.player) r.v = Math.max(0, r.v - 0.9 * r.v * dt);
//           else {
//             const gap = r.z - P.z; // ঋণাত্মক = আপনার সামনে
//             let k = 1 + 0.07 * Math.sin(st.raceT * 0.8 + r.seed);
//             if (!P.finished) { if (gap < -8) k *= 0.95; else if (gap > 6) k *= 1.05; }
//             const target = r.base * k * (st.raceT < 1.5 ? 0.6 : 1);
//             r.v += Math.sign(target - r.v) * Math.min(Math.abs(target - r.v), 6 * dt);
//           }
//           r.z -= r.v * dt; r.p += r.v * dt * 2.2;
//           if (!r.finished && r.z <= -FINISH) {
//             r.finished = true; r.place = ++st.placed; r.win = r.place === 1;
//             r.time = st.raceT - (-FINISH - r.z) / Math.max(r.v, 1);
//             if (r.player) { st.phase = "finished"; fanfare(r.place === 1); }
//           }
//         });
//       }

//       if (st.phase === "finished") {
//         st.endT += dt;
//         if (st.endT > 2.8 && !st.shown) {
//           st.shown = true; stopCrowd();
//           const list = order();
//           setResults(list.map((r) => ({ name: r.name, color: r.color, player: r.player, time: r.finished ? r.time : null })));
//           const rank = list.indexOf(P);
//           const bt = parseFloat(localStorage.getItem("race_best_time") || "999");
//           if (P.time < bt) { try { localStorage.setItem("race_best_time", String(P.time)); } catch {} setBestTime(P.time); }
//           setHud((h) => ({ ...h, rank: rank + 1 }));
//           setStatus("over");
//         }
//       }

//       runners.forEach((r) => {
//         r.mesh.position.set(r.x, 0, r.z);
//         pose(r.mesh, r.p, Math.min(1, r.v / 4), r.win && r.v < 3);
//       });

//       if (st.phase !== "idle") {
//         st.hudT += dt;
//         if (st.hudT > 0.1) {
//           st.hudT = 0;
//           setHud({ rank: order().indexOf(P) + 1, left: Math.max(0, FINISH + P.z), speed: P.v, dots: runners.map((r) => ({ c: r.color, f: Math.min(1, Math.max(0, -r.z / FINISH)) })) });
//         }
//       }

//       // ক্যামেরা
//       const back = portrait ? 10 : 6.8, up = portrait ? 4.8 : 3.4;
//       camera.position.x += (P.x * 0.3 - camera.position.x) * Math.min(1, dt * 4);
//       camera.position.y = up;
//       camera.position.z += (P.z + back - camera.position.z) * Math.min(1, dt * 8);
//       camera.fov = (portrait ? 72 : 58) + Math.min(6, P.v * 0.5);
//       camera.updateProjectionMatrix();
//       camera.lookAt(camera.position.x * 0.5, 1.1, camera.position.z - (portrait ? 14 : 10));
//       sun.position.set(8, 14, P.z + 6); sun.target.position.set(0, 0, P.z - 4);

//       renderer.render(scene, camera);
//     };
//     raf = requestAnimationFrame(loop);

//     /* ---- কিবোর্ড ---- */
//     const onKey = (e) => {
//       if (e.repeat) return;
//       const k = e.key.toLowerCase();
//       if (["arrowleft", "a", "z"].includes(k)) api.current.tap(-1);
//       else if (["arrowright", "d", "x"].includes(k)) api.current.tap(1);
//       else if (k === " ") { e.preventDefault(); api.current.tap(0); }
//     };
//     window.addEventListener("keydown", onKey);

//     return () => {
//       cancelAnimationFrame(raf); ro.disconnect(); stopCrowd();
//       window.removeEventListener("keydown", onKey);
//       renderer.dispose(); mount.removeChild(renderer.domElement);
//     };
//   }, []);

//   const left = Math.max(0, DAILY_LIMIT - plays);
//   const play = () => {
//     const n = readPlays();
//     if (n >= DAILY_LIMIT) { setPlays(n); return; }
//     writePlays(n + 1); setPlays(n + 1); ac(); api.current.start(diff);
//   };
//   const toggleMute = () => { muted = !muted; setMute(muted); if (muted) stopCrowd(); };

//   /* ---- স্টাইল ---- */
//   const fs = (min, vw, max) => `clamp(${min}px, ${vw}vw, ${max}px)`;
//   const pill = { background: "rgba(10,20,40,.62)", color: "#fff", borderRadius: 14, padding: "6px 14px", backdropFilter: "blur(4px)" };
//   const btn = { padding: "12px 28px", fontSize: fs(16, 4.5, 20), border: 0, borderRadius: 12, background: "#ffb300", color: "#222", cursor: "pointer", fontWeight: 700 };
//   const pad = { flex: 1, maxWidth: 300, height: "clamp(84px, 17vh, 130px)", border: 0, borderRadius: 20, background: "rgba(255,179,0,.88)", color: "#222", fontSize: fs(20, 5.5, 28), fontWeight: 800, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,.35)" };
//   const tapHandler = (side) => (e) => { e.preventDefault(); api.current.tap(side); };
//   const rank = results.findIndex((r) => r.player);

//   return (
//     <div style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden", color: "#fff", userSelect: "none", WebkitUserSelect: "none", touchAction: "none", background: "#111" }}>
//       <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

//       {/* HUD */}
//       <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between", pointerEvents: "none" }}>
//         <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//           <div style={{ ...pill, fontSize: fs(18, 5, 28), fontWeight: 800 }}>{ORD[hud.rank - 1]} <span style={{ fontSize: "0.6em", opacity: 0.8 }}>/ ৪</span></div>
//           <div style={{ ...pill, fontSize: fs(13, 3.4, 18) }}>বাকি {bn(hud.left)} মি</div>
//           <div style={{ ...pill, fontSize: fs(13, 3.4, 18) }}>{bn(hud.speed * 3.6)} কিমি/ঘ</div>
//         </div>
//         <div style={{ display: "flex", gap: 8, alignItems: "center", pointerEvents: "auto" }}>
//           <div style={{ ...pill, fontSize: fs(12, 3.2, 16) }}>সুযোগ {bn(left)}/{bn(DAILY_LIMIT)}</div>
//           <button onClick={toggleMute} style={{ ...btn, padding: "6px 12px", fontSize: 18 }}>{mute ? "🔇" : "🔊"}</button>
//         </div>
//       </div>

//       {/* অগ্রগতি বার */}
//       {status === "racing" && (
//         <div style={{ position: "absolute", top: "clamp(52px, 9vh, 68px)", left: "50%", transform: "translateX(-50%)", width: "min(560px, 90vw)", height: 10, borderRadius: 6, background: "rgba(255,255,255,.35)" }}>
//           {hud.dots.map((d, i) => (
//             <div key={i} style={{ position: "absolute", left: `${d.f * 100}%`, top: "50%", width: i === 0 ? 18 : 12, height: i === 0 ? 18 : 12, borderRadius: "50%", background: d.c, border: "2px solid #fff", transform: "translate(-50%,-50%)", zIndex: i === 0 ? 2 : 1 }} />
//           ))}
//           <div style={{ position: "absolute", right: -6, top: -16, fontSize: 16 }}>🏁</div>
//         </div>
//       )}

//       {/* কাউন্টডাউন */}
//       {count && (
//         <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", fontSize: "clamp(70px, 22vw, 180px)", fontWeight: 900, textShadow: "0 4px 18px rgba(0,0,0,.7)" }}>{count}</div>
//       )}

//       {/* রান বাটন */}
//       {status === "racing" && (
//         <div style={{ position: "absolute", left: 0, right: 0, bottom: "max(14px, env(safe-area-inset-bottom))", padding: "0 14px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
//           <div style={{ ...pill, fontSize: fs(11, 3, 14), textAlign: "center" }}>বাম-ডান বাটন পর্যায়ক্রমে দ্রুত চাপুন (কিবোর্ডে ← → / A D / স্পেস)</div>
//           <div style={{ display: "flex", gap: 14, width: "100%", justifyContent: "center" }}>
//             <button style={pad} onPointerDown={tapHandler(-1)}>◀ বাম পা</button>
//             <button style={pad} onPointerDown={tapHandler(1)}>ডান পা ▶</button>
//           </div>
//         </div>
//       )}

//       {/* মেনু / ফলাফল */}
//       {status !== "racing" && (
//         <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,12,30,.62)", padding: 12, boxSizing: "border-box" }}>
//           <div style={{ width: "min(460px, 100%)", maxHeight: "92%", overflowY: "auto", background: "rgba(15,25,50,.92)", borderRadius: 22, padding: "clamp(16px, 4vw, 28px)", textAlign: "center", boxShadow: "0 14px 50px rgba(0,0,0,.5)" }}>
//             {status === "over" ? (
//               <>
//                 <h1 style={{ margin: "0 0 4px", fontSize: fs(22, 6, 32) }}>{rank === 0 ? "🏆 অভিনন্দন! আপনি প্রথম!" : `আপনি ${ORD[rank]} হয়েছেন`}</h1>
//                 <div style={{ margin: "12px 0", display: "grid", gap: 8 }}>
//                   {results.map((r, i) => (
//                     <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 12, background: r.player ? "rgba(255,179,0,.25)" : "rgba(255,255,255,.08)", border: r.player ? "2px solid #ffb300" : "2px solid transparent" }}>
//                       <span style={{ fontSize: 22 }}>{MEDAL[i]}</span>
//                       <span style={{ width: 12, height: 12, borderRadius: "50%", background: r.color }} />
//                       <span style={{ flex: 1, textAlign: "left", fontWeight: 700 }}>{r.name}</span>
//                       <span style={{ opacity: 0.85 }}>{r.time ? `${bn(r.time, 2)} সে` : "দৌড়াচ্ছে"}</span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <h1 style={{ margin: "0 0 6px", fontSize: fs(24, 7, 36) }}>🏃 ১০০ মিটার দৌড় প্রতিযোগিতা</h1>
//                 <p style={{ margin: "0 0 12px", opacity: 0.85, fontSize: fs(13, 3.6, 16), lineHeight: 1.5 }}>৩ জন প্রতিদ্বন্দ্বীর সাথে দৌড়ান। বাম ও ডান বাটন পর্যায়ক্রমে যত দ্রুত চাপবেন, তত জোরে ছুটবেন!</p>
//               </>
//             )}
//             {bestTime && <p style={{ margin: "0 0 10px", fontSize: 14, opacity: 0.8 }}>আপনার সেরা সময়: {bn(bestTime, 2)} সেকেন্ড</p>}
//             {left > 0 ? (
//               <>
//                 <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
//                   {DIFF_NAMES.map((nm, i) => (
//                     <button key={i} onClick={() => setDiff(i)} style={{ ...btn, padding: "8px 14px", fontSize: 14, background: diff === i ? "#ffb300" : "rgba(255,255,255,.15)", color: diff === i ? "#222" : "#fff" }}>{nm}</button>
//                   ))}
//                 </div>
//                 <button style={btn} onClick={play}>{status === "over" ? "আবার দৌড়ান" : "দৌড় শুরু করুন"}</button>
//                 <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.75 }}>আজকের বাকি সুযোগ: {bn(left)}/{bn(DAILY_LIMIT)}</p>
//               </>
//             ) : (
//               <p style={{ fontSize: fs(16, 4.5, 20), color: "#ff8a80", margin: "8px 0 0" }}>আজকের লিমিট শেষ ({bn(DAILY_LIMIT)} বার)। কাল আবার আসুন!</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }