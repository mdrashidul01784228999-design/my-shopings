
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const DAILY_LIMIT = 5;

const getTodayString = (): string => new Date().toISOString().slice(0, 10);

const readPlays = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("runner_plays");
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.date === getTodayString() ? Number(data.count) || 0 : 0;
  } catch {
    return 0;
  }
};

const writePlays = (count: number): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "runner_plays",
      JSON.stringify({ date: getTodayString(), count })
    );
  } catch {}
};

interface HumanGroup extends THREE.Group {
  userData: {
    armL: THREE.Group;
    armR: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    kind?: string;
    lane?: number;
  };
}

export default function Game() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const api = useRef<{
    start: () => void;
    move: (dir: number) => void;
  }>({
    start: () => {},
    move: () => {},
  });

  const [mounted, setMounted] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(0);
  const [plays, setPlays] = useState<number>(0);
  const [mute, setMute] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setPlays(readPlays());
    try {
      setBest(Number(localStorage.getItem("runner_best")) || 0);
    } catch {}
  }, []);

  const audioContextRef = useRef<AudioContext | null>(null);
  const bgTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (f: number, dur = 0.15, type: OscillatorType = "square", vol = 0.07, slide = 0) => {
      if (mute) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime;

        osc.type = type;
        osc.frequency.setValueAtTime(f, t);
        if (slide) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
        }

        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(t + dur);
      } catch {}
    },
    [mute, getAudioContext]
  );

  const stopMusic = useCallback(() => {
    if (bgTimerRef.current) {
      clearInterval(bgTimerRef.current);
      bgTimerRef.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    stopMusic();
    if (mute) return;
    const notes = [262, 330, 392, 330, 294, 349, 440, 349];
    let step = 0;
    bgTimerRef.current = setInterval(() => {
      playTone(notes[step % notes.length], 0.2, "triangle", 0.03);
      step++;
    }, 250);
  }, [mute, playTone, stopMusic]);

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 70);

    const camera = new THREE.PerspectiveCamera(65, width / (height || 1), 0.1, 100);
    camera.position.set(0, 3.2, 6);
    camera.lookAt(0, 1, -5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x556655, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 200),
      new THREE.MeshStandardMaterial({ color: 0x555a60 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -80;
    ground.receiveShadow = true;
    scene.add(ground);

    const lines: THREE.Mesh[] = [];
    [-1, 1].forEach((lx) => {
      for (let i = 0; i < 20; i++) {
        const lineMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(0.1, 3),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        lineMesh.rotation.x = -Math.PI / 2;
        lineMesh.position.set(lx, 0.01, -i * 6);
        scene.add(lineMesh);
        lines.push(lineMesh);
      }
    });

    const makeHuman = (shirt: number, pants: number, skin = 0xf1c27d, hairColor = 0x222222): HumanGroup => {
      const g = new THREE.Group() as HumanGroup;
      const mat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), mat(skin));
      head.position.y = 1.65;
      head.castShadow = true;

      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        mat(hairColor)
      );
      hair.position.y = 1.68;

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), mat(shirt));
      torso.position.y = 1.15;
      torso.castShadow = true;

      const makeLimb = (w: number, h: number, color: number, x: number, y: number) => {
        const pivot = new THREE.Group();
        pivot.position.set(x, y, 0);
        const limbMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat(color));
        limbMesh.position.y = -h / 2;
        limbMesh.castShadow = true;
        pivot.add(limbMesh);
        g.add(pivot);
        return pivot;
      };

      const armL = makeLimb(0.15, 0.65, skin, -0.4, 1.45);
      const armR = makeLimb(0.15, 0.65, skin, 0.4, 1.45);
      const legL = makeLimb(0.2, 0.8, pants, -0.15, 0.8);
      const legR = makeLimb(0.2, 0.8, pants, 0.15, 0.8);

      g.add(head, hair, torso);
      g.userData = { armL, armR, legL, legR };
      return g;
    };

    const animateHuman = (model: HumanGroup, time: number, speed = 10, amp = 0.8) => {
      if (!model?.userData?.armL) return;
      const { armL, armR, legL, legR } = model.userData;
      const swing = Math.sin(time * speed) * amp;
      armL.rotation.x = swing;
      armR.rotation.x = -swing;
      legL.rotation.x = -swing;
      legR.rotation.x = swing;
    };

    const player = makeHuman(0x2a6fdb, 0x1b2a49);
    scene.add(player);

    const LANES = [-2, 0, 2];
    const gameState: {
      running: boolean;
      lane: number;
      speed: number;
      score: number;
      items: THREE.Object3D[];
      spawnTimer: number;
      time: number;
    } = {
      running: false,
      lane: 1,
      speed: 14,
      score: 0,
      items: [],
      spawnTimer: 0,
      time: 0,
    };

    const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.3,
    });

    const spawnObstacle = () => {
      const lane = Math.floor(Math.random() * 3);
      if (Math.random() < 0.55) {
        const enemy = makeHuman(0x4a7c3a, 0x333333, 0x7fae6a, 0x111111);
        enemy.position.set(LANES[lane], 0, -70);
        enemy.userData.kind = "enemy";
        enemy.userData.lane = lane;
        scene.add(enemy);
        gameState.items.push(enemy);
      } else {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(LANES[lane], 1, -70);
        coin.userData = { kind: "coin", lane };
        scene.add(coin);
        gameState.items.push(coin);
      }
    };

    const clearItems = () => {
      gameState.items.forEach((item) => scene.remove(item));
      gameState.items = [];
    };

    api.current.start = () => {
      clearItems();
      Object.assign(gameState, {
        running: true,
        lane: 1,
        speed: 14,
        score: 0,
        spawnTimer: 0,
      });
      player.position.x = 0;
      setScore(0);
      startMusic();
    };

    api.current.move = (dir: number) => {
      if (!gameState.running) return;
      const nextLane = Math.min(2, Math.max(0, gameState.lane + dir));
      if (nextLane !== gameState.lane) {
        gameState.lane = nextLane;
        playTone(500, 0.08, "sine", 0.05);
      }
    };

    let animationId: number;
    let prevTime = performance.now();

    const gameLoop = (currentTime: number) => {
      animationId = requestAnimationFrame(gameLoop);
      const dt = Math.min(0.05, (currentTime - prevTime) / 1000);
      prevTime = currentTime;
      gameState.time += dt;

      animateHuman(
        player,
        gameState.time,
        gameState.running ? 12 : 3,
        gameState.running ? 0.9 : 0.1
      );

      player.position.x +=
        (LANES[gameState.lane] - player.position.x) * Math.min(1, dt * 12);

      if (gameState.running) {
        gameState.speed += dt * 0.15;
        gameState.score += dt * gameState.speed;
        gameState.spawnTimer -= dt;

        if (gameState.spawnTimer <= 0) {
          spawnObstacle();
          gameState.spawnTimer = Math.max(0.5, 1.1 - gameState.speed * 0.01);
        }

        lines.forEach((line) => {
          line.position.z += gameState.speed * dt;
          if (line.position.z > 8) line.position.z -= 120;
        });

        const activeItems = [...gameState.items];
        for (const item of activeItems) {
          item.position.z +=
            gameState.speed * dt * (item.userData.kind === "enemy" ? 1.15 : 1);

          if (item.userData.kind === "enemy") {
            animateHuman(item as HumanGroup, gameState.time, 8, 0.6);
          } else {
            item.rotation.z += dt * 4;
          }

          const hasCollided =
            item.userData.lane === gameState.lane && Math.abs(item.position.z) < 0.7;

          if (hasCollided && item.userData.kind === "coin") {
            playTone(880, 0.1, "square", 0.06);
            gameState.score += 25;
            scene.remove(item);
            gameState.items = gameState.items.filter((i) => i !== item);
          } else if (hasCollided) {
            gameState.running = false;
            stopMusic();
            playTone(200, 0.6, "sawtooth", 0.12, -150);
            const finalScore = Math.floor(gameState.score);
            try {
              const currentBest = Number(localStorage.getItem("runner_best") || 0);
              const newBest = Math.max(finalScore, currentBest);
              localStorage.setItem("runner_best", String(newBest));
              setBest(newBest);
            } catch {}
            setScore(finalScore);
            setStatus("over");
          } else if (item.position.z > 8) {
            scene.remove(item);
            gameState.items = gameState.items.filter((i) => i !== item);
          }
        }
        setScore(Math.floor(gameState.score));
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") api.current.move(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") api.current.move(1);
    };

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      stopMusic();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mounted, startMusic, stopMusic, playTone]);

  const leftPlays = Math.max(0, DAILY_LIMIT - plays);

  const handleStartGame = () => {
    getAudioContext();
    if (readPlays() >= DAILY_LIMIT) {
      setPlays(DAILY_LIMIT);
      return;
    }
    const currentPlays = readPlays() + 1;
    writePlays(currentPlays);
    setPlays(currentPlays);
    playTone(600, 0.15, "square", 0.06);
    setStatus("playing");
    api.current.start();
  };

  const toggleMute = () => {
    const nextMute = !mute;
    setMute(nextMute);
    if (nextMute) stopMusic();
  };

  if (!mounted) {
    return <div style={{ width: "100vw", height: "100vh", background: "#87ceeb" }} />;
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "sans-serif",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontSize: 18,
          fontWeight: "bold",
          color: "#fff",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          zIndex: 10,
        }}
      >
        স্কোর: {score} | সর্বোচ্চ: {best} | সুযোগ বাকি: {leftPlays}/{DAILY_LIMIT}
      </div>

      <button
        onClick={toggleMute}
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          padding: "8px 16px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 8,
          border: "none",
          background: "#ffb300",
          fontWeight: "bold",
          zIndex: 10,
        }}
      >
        {mute ? "🔇 শব্দ বন্ধ" : "🔊 শব্দ চালু"}
      </button>

      {status !== "playing" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "#fff",
            zIndex: 20,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 32 }}>
            {status === "over" ? `গেম ওভার! স্কোর: ${score}` : "৩ডি হিউম্যান রানার"}
          </h1>
          <p style={{ margin: 0, fontSize: 16 }}>
            কিবোর্ডের ← → বা A / D চেপে ডানে-বামে সরান। কয়েন ধরুন এবং শত্রু এড়ান!
          </p>

          {leftPlays > 0 ? (
            <button
              onClick={handleStartGame}
              style={{
                padding: "12px 32px",
                fontSize: 20,
                border: "none",
                borderRadius: 8,
                background: "#ffb300",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {status === "over" ? "আবার খেলুন" : "খেলা শুরু করুন"}
            </button>
          ) : (
            <p style={{ fontSize: 20, color: "#ff8a80" }}>
              আজকের লিমিট শেষ ({DAILY_LIMIT} বার)। কাল আবার আসুন!
            </p>
          )}
        </div>
      )}

      {status === "playing" && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 30px",
            boxSizing: "border-box",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => api.current.move(-1)}
            style={{
              padding: "16px 36px",
              fontSize: 24,
              borderRadius: 12,
              border: "none",
              background: "#ffb300",
              cursor: "pointer",
              opacity: 0.85,
            }}
          >
            ◀
          </button>
          <button
            onClick={() => api.current.move(1)}
            style={{
              padding: "16px 36px",
              fontSize: 24,
              borderRadius: 12,
              border: "none",
              background: "#ffb300",
              cursor: "pointer",
              opacity: 0.85,
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}











// "use client";
// import { useEffect, useRef, useState } from "react";
// import * as THREE from "three";

// /* ---------- দৈনিক লিমিট ---------- */
// const DAILY_LIMIT = 5;
// const today = () => new Date().toISOString().slice(0, 10);
// const readPlays = () => {
//   try {
//     const d = JSON.parse(localStorage.getItem("runner_plays") || "{}");
//     return d.date === today() ? d.count : 0;
//   } catch { return 0; }
// };
// const writePlays = (count) => {
//   try { localStorage.setItem("runner_plays", JSON.stringify({ date: today(), count })); } catch {}
// };

// /* ---------- সাউন্ড (Web Audio) ---------- */
// let actx, muted = false, bgTimer = null;
// const tone = (f, dur = 0.15, type = "square", vol = 0.07, slide = 0) => {
//   if (muted) return;
//   actx = actx || new (window.AudioContext || window.webkitAudioContext)();
//   const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
//   o.type = type;
//   o.frequency.setValueAtTime(f, t);
//   if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
//   g.gain.setValueAtTime(vol, t);
//   g.gain.exponentialRampToValueAtTime(0.001, t + dur);
//   o.connect(g); g.connect(actx.destination);
//   o.start(); o.stop(t + dur);
// };
// const startMusic = () => {
//   const notes = [262, 330, 392, 330, 294, 349, 440, 349];
//   let i = 0;
//   stopMusic();
//   bgTimer = setInterval(() => tone(notes[i++ % notes.length], 0.2, "triangle", 0.04), 250);
// };
// const stopMusic = () => { clearInterval(bgTimer); bgTimer = null; };

// /* ---------- মানুষের মডেল ---------- */
// function makeHuman(shirt, pants, skin = 0xf1c27d, hairColor = 0x222222) {
//   const g = new THREE.Group();
//   const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 });
//   const add = (mesh) => { mesh.castShadow = true; return mesh; };
//   const head = add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), mat(skin)));
//   head.position.y = 1.65;
//   const hair = add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), mat(hairColor)));
//   hair.position.y = 1.68;
//   const torso = add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), mat(shirt)));
//   torso.position.y = 1.15;
//   const limb = (w, h, color, x, y) => {
//     const pivot = new THREE.Group();
//     pivot.position.set(x, y, 0);
//     const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat(color)));
//     m.position.y = -h / 2;
//     pivot.add(m); g.add(pivot);
//     return pivot;
//   };
//   const armL = limb(0.15, 0.65, skin, -0.4, 1.45);
//   const armR = limb(0.15, 0.65, skin, 0.4, 1.45);
//   const legL = limb(0.2, 0.8, pants, -0.15, 0.8);
//   const legR = limb(0.2, 0.8, pants, 0.15, 0.8);
//   g.add(head, hair, torso);
//   g.userData = { armL, armR, legL, legR };
//   return g;
// }
// const animate = (h, t, speed = 10, amp = 0.8) => {
//   const { armL, armR, legL, legR } = h.userData, s = Math.sin(t * speed) * amp;
//   armL.rotation.x = s; armR.rotation.x = -s; legL.rotation.x = -s; legR.rotation.x = s;
// };

// const LANES = [-2, 0, 2];

// export default function Game() {
//   const mountRef = useRef(null);
//   const api = useRef({});
//   const [status, setStatus] = useState("idle"); // idle | playing | over
//   const [score, setScore] = useState(0);
//   const [best, setBest] = useState(0);
//   const [plays, setPlays] = useState(0);
//   const [mute, setMute] = useState(false);

//   useEffect(() => {
//     setPlays(readPlays());
//     setBest(Number(localStorage.getItem("runner_best") || 0));
//     const mount = mountRef.current;
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x87ceeb);
//     scene.fog = new THREE.Fog(0x87ceeb, 20, 70);
//     const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 100);
//     camera.position.set(0, 3.2, 6);
//     camera.lookAt(0, 1, -5);
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(mount.clientWidth, mount.clientHeight);
//     renderer.shadowMap.enabled = true;
//     mount.appendChild(renderer.domElement);

//     scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 0.9));
//     const sun = new THREE.DirectionalLight(0xffffff, 1);
//     sun.position.set(5, 10, 5); sun.castShadow = true;
//     scene.add(sun);

//     const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), new THREE.MeshStandardMaterial({ color: 0x555a60 }));
//     ground.rotation.x = -Math.PI / 2; ground.position.z = -80; ground.receiveShadow = true;
//     scene.add(ground);
//     const lines = [];
//     [-1, 1].forEach((x) => {
//       for (let i = 0; i < 20; i++) {
//         const l = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
//         l.rotation.x = -Math.PI / 2; l.position.set(x, 0.01, -i * 6); scene.add(l); lines.push(l);
//       }
//     });

//     const player = makeHuman(0x2a6fdb, 0x1b2a49);
//     scene.add(player);

//     const st = { running: false, lane: 1, speed: 14, score: 0, items: [], spawn: 0, t: 0 };
//     const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20);
//     const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });

//     const spawn = () => {
//       const lane = Math.floor(Math.random() * 3);
//       if (Math.random() < 0.55) {
//         const z = makeHuman(0x4a7c3a, 0x333333, 0x7fae6a, 0x111111); // জম্বি-মানুষ
//         z.position.set(LANES[lane], 0, -70); z.userData.kind = "enemy"; z.userData.lane = lane;
//         scene.add(z); st.items.push(z);
//       } else {
//         const c = new THREE.Mesh(coinGeo, coinMat);
//         c.rotation.x = Math.PI / 2; c.position.set(LANES[lane], 1, -70);
//         c.userData = { kind: "coin", lane }; scene.add(c); st.items.push(c);
//       }
//     };

//     const clear = () => { st.items.forEach((o) => scene.remove(o)); st.items = []; };
//     api.current.start = () => {
//       clear(); Object.assign(st, { running: true, lane: 1, speed: 14, score: 0, spawn: 0 });
//       player.position.x = 0; setScore(0); startMusic();
//     };
//     api.current.move = (d) => {
//       if (!st.running) return;
//       const n = Math.min(2, Math.max(0, st.lane + d));
//       if (n !== st.lane) { st.lane = n; tone(500, 0.08, "sine", 0.05); }
//     };

//     let last = performance.now(), raf;
//     const loop = (now) => {
//       raf = requestAnimationFrame(loop);
//       const dt = Math.min(0.05, (now - last) / 1000); last = now; st.t += dt;
//       animate(player, st.t, st.running ? 12 : 3, st.running ? 0.9 : 0.1);
//       player.position.x += (LANES[st.lane] - player.position.x) * Math.min(1, dt * 12);
//       if (st.running) {
//         st.speed += dt * 0.15; st.score += dt * st.speed;
//         st.spawn -= dt;
//         if (st.spawn <= 0) { spawn(); st.spawn = Math.max(0.5, 1.1 - st.speed * 0.01); }
//         lines.forEach((l) => { l.position.z += st.speed * dt; if (l.position.z > 8) l.position.z -= 120; });
//         for (const o of [...st.items]) {
//           o.position.z += st.speed * dt * (o.userData.kind === "enemy" ? 1.15 : 1);
//           if (o.userData.kind === "enemy") animate(o, st.t, 8, 0.6);
//           else o.rotation.z += dt * 4;
//           const hit = o.userData.lane === st.lane && Math.abs(o.position.z) < 0.7;
//           if (hit && o.userData.kind === "coin") {
//             tone(880, 0.1, "square", 0.06); tone(1320, 0.12, "square", 0.06);
//             st.score += 25; scene.remove(o); st.items = st.items.filter((i) => i !== o);
//           } else if (hit) {
//             st.running = false; stopMusic(); tone(200, 0.6, "sawtooth", 0.12, -150);
//             const final = Math.floor(st.score);
//             const b = Math.max(final, Number(localStorage.getItem("runner_best") || 0));
//             localStorage.setItem("runner_best", b); setBest(b); setScore(final); setStatus("over");
//           } else if (o.position.z > 8) { scene.remove(o); st.items = st.items.filter((i) => i !== o); }
//         }
//         setScore(Math.floor(st.score));
//       }
//       renderer.render(scene, camera);
//     };
//     raf = requestAnimationFrame(loop);

//     const onKey = (e) => {
//       if (["ArrowLeft", "a", "A"].includes(e.key)) api.current.move(-1);
//       if (["ArrowRight", "d", "D"].includes(e.key)) api.current.move(1);
//     };
//     const onResize = () => {
//       camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix();
//       renderer.setSize(mount.clientWidth, mount.clientHeight);
//     };
//     window.addEventListener("keydown", onKey); window.addEventListener("resize", onResize);
//     return () => {
//       cancelAnimationFrame(raf); stopMusic();
//       window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize);
//       mount.removeChild(renderer.domElement); renderer.dispose();
//     };
//   }, []);

//   const left = Math.max(0, DAILY_LIMIT - plays);
//   const play = () => {
//     if (readPlays() >= DAILY_LIMIT) { setPlays(DAILY_LIMIT); return; }
//     const n = readPlays() + 1; writePlays(n); setPlays(n);
//     tone(600, 0.15, "square", 0.06); setStatus("playing"); api.current.start();
//   };
//   const toggleMute = () => { muted = !muted; setMute(muted); if (muted) stopMusic(); };

//   const btn = { padding: "12px 28px", fontSize: 20, border: 0, borderRadius: 10, background: "#ffb300", cursor: "pointer", fontWeight: 700 };
//   const ctrl = { ...btn, padding: "16px 32px", opacity: 0.8 };

//   return (
//     <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", color: "#fff" }}>
//       <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
//       <div style={{ position: "absolute", top: 12, left: 16, fontSize: 20, textShadow: "0 1px 4px #000" }}>
//         স্কোর: {score} | সর্বোচ্চ: {best} | আজকের বাকি সুযোগ: {left}/{DAILY_LIMIT}
//       </div>
//       <button onClick={toggleMute} style={{ ...btn, position: "absolute", top: 8, right: 12, padding: "6px 14px", fontSize: 16 }}>
//         {mute ? "🔇" : "🔊"}
//       </button>

//       {status !== "playing" && (
//         <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(0,0,0,.55)", textAlign: "center" }}>
//           <h1 style={{ margin: 0 }}>{status === "over" ? `গেম ওভার! স্কোর: ${score}` : "৩ডি হিউম্যান রানার"}</h1>
//           <p style={{ margin: 0 }}>← → বা A / D চাপুন। কয়েন নিন, জম্বি এড়িয়ে চলুন!</p>
//           {left > 0 ? (
//             <button style={btn} onClick={play}>{status === "over" ? "আবার খেলুন" : "খেলা শুরু করুন"}</button>
//           ) : (
//             <p style={{ fontSize: 22, color: "#ff8a80" }}>আজকের লিমিট শেষ ({DAILY_LIMIT} বার)। কাল আবার আসুন!</p>
//           )}
//         </div>
//       )}

//       {status === "playing" && (
//         <div style={{ position: "absolute", bottom: 24, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 24px", boxSizing: "border-box" }}>
//           <button style={ctrl} onClick={() => api.current.move(-1)}>◀</button>
//           <button style={ctrl} onClick={() => api.current.move(1)}>▶</button>
//         </div>
//       )}
//     </div>
//   );
// }


