'use client';

import React, { useState, useEffect, useRef } from 'react';

// টাইপ ডেফিনিশন সমূহ
type Vec = { x: number; y: number };

interface RectObject {
  pos: Vec;
  w: number;
  h: number;
}

// ==========================================
// ১. স্মার্ট রানার কম্পোনেন্ট (SmartRunner)
// ==========================================
const SmartRunner = () => {
  const [coins, setCoins] = useState(0);
  const [question, setQuestion] = useState({ q: '5 + 3', a: 8 });
  const [options, setOptions] = useState([6, 8, 10]);
  const [message, setMessage] = useState('দৌড় শুরু করো!');

  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    const choices = [
      correctAnswer,
      correctAnswer + Math.floor(Math.random() * 3) + 1,
      correctAnswer - Math.floor(Math.random() * 3) - 1
    ].sort(() => Math.random() - 0.5);

    setQuestion({ q: `${num1} + ${num2}`, a: correctAnswer });
    setOptions(choices);
  };

  const handleAnswer = (selected: number) => {
    if (selected === question.a) {
      setCoins(coins + 10);
      setMessage('অসাধারণ! +১০ কয়েন 🪙');
    } else {
      setCoins(Math.max(0, coins - 5));
      setMessage('ভুল উত্তর! -৫ কয়েন ❌');
    }
    generateQuestion();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-xl shadow-2xl mb-8">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Md Rashidul's Runner</h2>
      
      <div className="text-lg mb-2">কয়েন সংখ্যা: <span className="text-3xl font-mono text-yellow-500">{coins}</span></div>
      
      <div className="bg-slate-800 p-8 rounded-lg border-2 border-blue-500 text-center w-full max-w-md">
        <p className="text-xl mb-4 italic text-gray-300">{message}</p>
        
        <div className="text-4xl font-black mb-8 animate-pulse">
          {question.q} = ?
        </div>

        <div className="grid grid-cols-3 gap-4">
          {options.map((opt, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(opt)}
              className="bg-blue-600 hover:bg-blue-400 transition-colors py-3 rounded-lg font-bold text-xl"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        সঠিক উত্তরে কয়েন বাড়বে, ভুল হলে কমবে!
      </div>
    </div>
  );
};


// ==========================================
// ২. পিক্সেল কালেক্টর গেম (PixelCollectorGame)
// ==========================================
export default function PixelCollectorGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Canvas না থাকলে রিটার্ন করবে (Vercel Safe)
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const W = 900;
    const H = 240;

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);
    ctx.imageSmoothingEnabled = false;

    const bg = new Image();
    bg.src = "/Play-to-Earn-Bitcoin-7-Games-You-Must-Try-min.jpg";

    const gravity = 0.9;
    const groundY = H - 30;

    const player = {
      pos: { x: 60, y: groundY - 32 } as Vec,
      vel: { x: 0, y: 0 } as Vec,
      w: 28,
      h: 32,
      speed: 2.6,
      onGround: true,
      color: "#9FB7FF",
    };

    const enemy = {
      pos: { x: 820, y: groundY - 36 } as Vec,
      w: 28,
      h: 36,
      dir: -1,
      speed: 1.1,
      color: "#E6D8C3",
    };

    let coins: { pos: Vec; r: number; collected: boolean }[] = [];
    const spawnCoins = () => {
      coins = [];
      const xs = [180, 260, 340, 420, 500];
      for (let i = 0; i < xs.length; i++) {
        coins.push({ pos: { x: xs[i], y: groundY - 60 }, r: 8, collected: false });
      }
    };
    spawnCoins();

    const key = { pos: { x: 560, y: groundY - 28 }, w: 14, h: 12, taken: false };
    const chest = { pos: { x: 700, y: groundY - 28 }, w: 34, h: 26, opened: false };

    const keys: Record<string, boolean> = {};
    const keyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (["arrowup", "w", " "].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const keyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // strictly typed collision function
    const rectRect = (a: RectObject, b: RectObject): boolean => {
      return !(
        a.pos.x + a.w < b.pos.x ||
        a.pos.x > b.pos.x + b.w ||
        a.pos.y + a.h < b.pos.y ||
        a.pos.y > b.pos.y + b.h
      );
    };

    const particles: { x: number; y: number; vy: number; life: number }[] = [];

    let last = performance.now();
    let rafId: number;

    function update(dt: number) {
      player.vel.x = 0;
      if (keys["arrowleft"] || keys["a"]) player.vel.x = -player.speed;
      if (keys["arrowright"] || keys["d"]) player.vel.x = player.speed;
      if ((keys["arrowup"] || keys["w"] || keys[" "]) && player.onGround) {
        player.vel.y = -14.5;
        player.onGround = false;
      }

      player.vel.y += gravity;
      player.pos.x += player.vel.x;
      player.pos.y += player.vel.y;

      if (player.pos.y + player.h > groundY) {
        player.pos.y = groundY - player.h;
        player.vel.y = 0;
        player.onGround = true;
      }

      if (player.pos.x < 8) player.pos.x = 8;
      if (player.pos.x + player.w > W - 8) player.pos.x = W - 8 - player.w;

      enemy.pos.x += enemy.dir * enemy.speed;
      if (enemy.pos.x < 600) enemy.dir = 1;
      if (enemy.pos.x > 840) enemy.dir = -1;

      for (const c of coins) {
        if (c.collected) continue;
        const dx = player.pos.x + player.w / 2 - c.pos.x;
        const dy = player.pos.y + player.h / 2 - c.pos.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < (c.r + 10) ** 2) {
          c.collected = true;
          for (let i = 0; i < 8; i++) {
            particles.push({ x: c.pos.x, y: c.pos.y, vy: -(3 + Math.random() * 2), life: 40 + Math.random() * 30 });
          }
        }
      }

      if (!key.taken && !chest.opened) {
        const rectA: RectObject = { pos: { x: player.pos.x, y: player.pos.y }, w: player.w, h: player.h };
        const rectB: RectObject = { pos: { x: key.pos.x, y: key.pos.y - key.h }, w: key.w, h: key.h };
        if (rectRect(rectA, rectB)) key.taken = true;
      }

      const allCollected = coins.every((c) => c.collected);
      if (key.taken && allCollected && !chest.opened) {
        const rectA: RectObject = { pos: { x: player.pos.x, y: player.pos.y }, w: player.w, h: player.h };
        const rectB: RectObject = { pos: { x: chest.pos.x, y: chest.pos.y - chest.h }, w: chest.w, h: chest.h };
        if (rectRect(rectA, rectB)) {
          chest.opened = true;
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy;
        p.vy += 0.18;
        p.life -= 1;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      if (bg.complete) {
        ctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, W, H);
      } else {
        ctx.fillStyle = "#0b1020";
        ctx.fillRect(0, 0, W, H);
      }

      ctx.fillStyle = "#0f8b37";
      ctx.fillRect(0, groundY, W, 40);
      ctx.fillStyle = "#00681f";
      for (let i = 0; i < 40; i++) {
        ctx.fillRect(i * 20, groundY, 6, 8);
      }

      for (const c of coins) {
        if (c.collected) continue;
        ctx.beginPath();
        ctx.fillStyle = "#FFD54A";
        ctx.ellipse(c.pos.x, c.pos.y, c.r, c.r - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#B8860B";
        ctx.stroke();
      }

      if (!key.taken && !chest.opened) {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(key.pos.x - key.w / 2, key.pos.y - key.h, key.w, key.h);
        ctx.fillStyle = "#CC9B00";
        ctx.fillRect(key.pos.x, key.pos.y - key.h + 4, key.w / 2, 4);
      }

      ctx.fillStyle = chest.opened ? "#DAA520" : "#8B4513";
      ctx.fillRect(chest.pos.x - chest.w / 2, chest.pos.y - chest.h, chest.w, chest.h);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(chest.pos.x - chest.w / 2, chest.pos.y - chest.h, chest.w, chest.h);
      if (!chest.opened) {
        ctx.fillStyle = "#444";
        ctx.fillRect(chest.pos.x - 6, chest.pos.y - 8, 12, 6);
      } else {
        ctx.fillStyle = "#FFF59D";
        ctx.fillText("✨", chest.pos.x - 6, chest.pos.y - chest.h - 4);
      }

      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.pos.x - enemy.w / 2, enemy.pos.y - enemy.h, enemy.w, enemy.h);
      ctx.fillStyle = "#C4C4C4";
      ctx.fillRect(enemy.pos.x - enemy.w / 2 - 8, enemy.pos.y - 10, 10, 3);

      ctx.fillStyle = player.color;
      ctx.fillRect(player.pos.x, player.pos.y, player.w, player.h);
      ctx.fillStyle = "#D14A78";
      ctx.fillRect(player.pos.x + 6, player.pos.y + 2, 12, 4);

      for (const p of particles) {
        ctx.fillStyle = "#FFD54A";
        ctx.fillRect(p.x, p.y, 3, 3);
      }

      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(12, 12, 220, 34);
      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      const collectedCount = coins.filter((c) => c.collected).length;
      ctx.fillText(`Coins: ${collectedCount} / ${coins.length}`, 20, 34);
      ctx.fillText(`Key: ${key.taken ? "Yes" : "No"}`, 130, 34);

      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText("← → to move, ↑ / W / Space to jump. Collect all coins + key → open chest", 260, 20);
    }

    function frame(t: number) {
      const dt = Math.min(32, t - last);
      last = t;

      update(dt);
      draw();

      if (running) rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      setRunning(false);
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [running]);

  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-950 min-h-screen text-white">
      {/* SmartRunner ও এখানে রেন্ডার করা হলো */}
      <SmartRunner />
      
      <hr className="w-full max-w-4xl border-slate-800 my-4" />

      <h2 style={{ fontFamily: "monospace" }} className="text-xl font-bold">Pixel Collector (demo)</h2>
      <canvas ref={canvasRef} style={{ borderRadius: 12, imageRendering: "pixelated", boxShadow: "0 6px 30px rgba(0,0,0,0.6)" }} />
      <div style={{ color: "#ddd", fontSize: 13, fontFamily: "monospace" }} className="flex items-center gap-4 mt-2">
        <button
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
          className="bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 transition-all"
        >
          Restart
        </button>
        <span>Put your background image in /public and refresh to see it behind the scene.</span>
      </div>
    </div>
  );
}