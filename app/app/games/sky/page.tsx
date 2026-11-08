"use client";
import React, { useState, useEffect, useRef } from "react";

const MAX_DAILY_PLAYS = 3;
const COINS_PER_KILL = 15;

// ================= TYPESCRIPT INTERFACES =================
// Vercel Build Error এড়ানোর জন্য এই টাইপগুলো যুক্ত করা হয়েছে
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

interface GameStateRef {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  coinsEarned: number;
  score: number;
  lives: number;
  keys: Record<string, boolean>;
  shootCooldown: number;
}
// =========================================================

export default function PremiumGalaxyShooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<string>("MENU"); // MENU, PLAYING, GAME_OVER, NO_PLAYS, SHOP
  const [coins, setCoins] = useState<number>(0);
  const [dailyPlaysLeft, setDailyPlaysLeft] = useState<number>(MAX_DAILY_PLAYS);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);

  // Upgrades states
  const [fireRateLevel, setFireRateLevel] = useState<number>(1);
  const [speedLevel, setSpeedLevel] = useState<number>(1);

  const stateRef = useRef<GameStateRef>({
    player: { x: 0, y: 0, width: 44, height: 44, speed: 5 },
    bullets: [],
    enemies: [],
    coinsEarned: 0,
    score: 0,
    lives: 3,
    keys: {},
    shootCooldown: 0
  });

  // Load stats from LocalStorage
  useEffect(() => {
    const savedCoins = localStorage.getItem("premium_galaxy_coins");
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    const savedFireRate = localStorage.getItem("galaxy_upgrade_firerate");
    if (savedFireRate) setFireRateLevel(parseInt(savedFireRate, 10));

    const savedSpeed = localStorage.getItem("galaxy_upgrade_speed");
    if (savedSpeed) setSpeedLevel(parseInt(savedSpeed, 10));

    // Daily Limit Check
    const todayStr = new Date().toISOString().split("T")[0];
    const dailyData = localStorage.getItem("premium_galaxy_daily");

    if (dailyData) {
      const { date, count } = JSON.parse(dailyData);
      if (date === todayStr) {
        setDailyPlaysLeft(Math.max(0, MAX_DAILY_PLAYS - count));
      } else {
        localStorage.setItem("premium_galaxy_daily", JSON.stringify({ date: todayStr, count: 0 }));
        setDailyPlaysLeft(MAX_DAILY_PLAYS);
      }
    } else {
      localStorage.setItem("premium_galaxy_daily", JSON.stringify({ date: todayStr, count: 0 }));
    }
  }, []);

  // Buy Upgrades Logic
  const buyUpgrade = (type: "firerate" | "speed") => {
    const cost = type === "firerate" ? fireRateLevel * 150 : speedLevel * 150;
    if (coins >= cost) {
      const nextCoins = coins - cost;
      setCoins(nextCoins);
      localStorage.setItem("premium_galaxy_coins", nextCoins.toString());

      if (type === "firerate") {
        const nextLvl = fireRateLevel + 1;
        setFireRateLevel(nextLvl);
        localStorage.setItem("galaxy_upgrade_firerate", nextLvl.toString());
      } else {
        const nextLvl = speedLevel + 1;
        setSpeedLevel(nextLvl);
        localStorage.setItem("galaxy_upgrade_speed", nextLvl.toString());
      }
    }
  };

  const startGame = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const dailyData = JSON.parse(localStorage.getItem("premium_galaxy_daily") || "{}");
    const currentCount = dailyData.date === todayStr ? dailyData.count : 0;

    if (currentCount >= MAX_DAILY_PLAYS) {
      setGameState("NO_PLAYS");
      return;
    }

    localStorage.setItem("premium_galaxy_daily", JSON.stringify({ date: todayStr, count: currentCount + 1 }));
    setDailyPlaysLeft(MAX_DAILY_PLAYS - (currentCount + 1));

    const canvas = canvasRef.current;
    if (!canvas) return; // Null safety added

    // Bereken snelheden op basis van gekochte upgrades
    const calculatedSpeed = 5 + speedLevel * 0.8;

    stateRef.current = {
      player: { x: canvas.width / 2 - 22, y: canvas.height - 80, width: 44, height: 44, speed: calculatedSpeed },
      bullets: [],
      enemies: [],
      coinsEarned: 0,
      score: 0,
      lives: 3,
      keys: {},
      shootCooldown: 0
    };

    setScore(0);
    setLives(3);
    setGameState("PLAYING");
  };

  // Main Game Loop Engine
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Null safety added

    let animationId: number;
    let spawnTimer = 0;

    const handleKeyDown = (e: KeyboardEvent) => (stateRef.current.keys[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (stateRef.current.keys[e.key] = false);

    // Responsive Touch & Drag voor Mobiel
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0] || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; 
      const touchX = (e.touches[0].clientX - rect.left) * scaleX;
      
      stateRef.current.player.x = Math.max(
        0,
        Math.min(canvas.width - stateRef.current.player.width, touchX - stateRef.current.player.width / 2)
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchmove", handleTouchMove as unknown as EventListener, { passive: true });

    const updateGame = () => {
      const state = stateRef.current;
      const player = state.player;

      // 1. Premium deep-space background drawing
      ctx.fillStyle = "#060613";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon hyperdrive sterren op de achtergrond
      ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
      for (let i = 0; i < 30; i++) {
        const starY = (Date.now() * 0.15 + i * 45) % canvas.height;
        ctx.fillRect((i * 47) % canvas.width, starY, 2, 3);
      }

      // 2. Besturing PC
      if (state.keys["ArrowLeft"] || state.keys["a"]) player.x -= player.speed;
      if (state.keys["ArrowRight"] || state.keys["d"]) player.x += player.speed;
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

      // 3. Gecursiveerd schieten gebaseerd op Fire Rate Upgrade Level
      const fireInterval = Math.max(6, 16 - fireRateLevel); 
      state.shootCooldown++;
      if (state.shootCooldown >= fireInterval) {
        state.bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, speed: 9 });
        state.shootCooldown = 0;
      }

      // 4. Update & Render Lasers met Neon Glow
      state.bullets.forEach((b, index) => {
        b.y -= b.speed;
        if (b.y < 0) state.bullets.splice(index, 1);

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#00f0ff";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x, b.y, 4, 15);
        ctx.shadowBlur = 0; // reset
      });

      // 5. Spawn vijandelijke ruimteschepen
      spawnTimer++;
      if (spawnTimer % 35 === 0) {
        state.enemies.push({
          x: Math.random() * (canvas.width - 36),
          y: -40,
          width: 36,
          height: 32,
          speed: 2.2 + Math.random() * 1.5,
          color: Math.random() > 0.4 ? "#ff1d53" : "#b026ff"
        });
      }

      // 6. Afhandeling van vijanden & botsingen
      state.enemies.forEach((enemy, eIdx) => {
        enemy.y += enemy.speed;

        // Teken Alien Ship
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Als vijand de onderkant passeert -> verlies 1 leven
        if (enemy.y > canvas.height) {
          state.enemies.splice(eIdx, 1);
          handlePlayerHit();
        }

        // Check crash met speler
        if (
          enemy.x < player.x + player.width &&
          enemy.x + enemy.width > player.x &&
          enemy.y < player.y + player.height &&
          enemy.y + enemy.height > player.y
        ) {
          state.enemies.splice(eIdx, 1);
          handlePlayerHit();
        }

        // Check laser hits
        state.bullets.forEach((bullet, bIdx) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + 4 > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + 15 > enemy.y
          ) {
            state.enemies.splice(eIdx, 1);
            state.bullets.splice(bIdx, 1);
            state.score += 20;
            state.coinsEarned += COINS_PER_KILL;
            setScore(state.score);
          }
        });
      });

      // 7. Teken Premium Hero Fighter Jet
      ctx.fillStyle = "#00ffcc";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ffcc";
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Uitlaat vlammen
      ctx.fillStyle = Math.random() > 0.5 ? "#ff5500" : "#ffcc00";
      ctx.fillRect(player.x + player.width / 2 - 4, player.y + player.height, 8, 8);

      if (gameState === "PLAYING") {
        animationId = requestAnimationFrame(updateGame);
      }
    };

    const handlePlayerHit = () => {
      stateRef.current.lives -= 1;
      setLives(stateRef.current.lives);
      if (stateRef.current.lives <= 0) {
        // Game Over & save coins
        const finalCoins = coins + stateRef.current.coinsEarned;
        localStorage.setItem("premium_galaxy_coins", finalCoins.toString());
        setCoins(finalCoins);
        setGameState("GAME_OVER");
      }
    };

    animationId = requestAnimationFrame(updateGame);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (canvas) {
        canvas.removeEventListener("touchmove", handleTouchMove as unknown as EventListener);
      }
    };
  }, [gameState, fireRateLevel, speedLevel, coins]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020208] text-white p-4 select-none font-sans">
      
      {/* --- HUD HEADER --- */}
      <div className="w-full max-w-md flex justify-between items-center bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md rounded-t-2xl px-5 py-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-1.5 text-yellow-400 font-black tracking-wide drop-shadow-[0_2px_8px_rgba(234,179,8,0.3)]">
          🪙 <span className="text-base text-yellow-300">{coins}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-400 tracking-widest font-bold uppercase">Score</span>
          <span className="text-xl font-black text-white tracking-wider">{score}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-slate-400 font-medium">Daily Attempts</span>
          <span className={`text-xs font-bold ${dailyPlaysLeft === 0 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
            {dailyPlaysLeft} / {MAX_DAILY_PLAYS}
          </span>
        </div>
      </div>

      {/* --- GAME CANVAS SCREEN --- */}
      <div className="relative w-full max-w-md aspect-[9/16] bg-[#050510] border-x border-b border-cyan-500/20 rounded-b-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* In-game Lives Overlay */}
        {gameState === "PLAYING" && (
          <div className="absolute top-4 left-4 flex gap-1 z-10 drop-shadow-[0_2px_5px_rgba(255,0,0,0.5)]">
            {Array.from({ length: 3 }).map((_, idx) => (
              <span key={idx} className={`text-xl transition-opacity duration-300 ${idx < lives ? "opacity-100 scale-100" : "opacity-20 scale-75"}`}>
                ❤️
              </span>
            ))}
          </div>
        )}

        <canvas ref={canvasRef} width={380} height={660} className="w-full h-full block" />

        {/* --- INTERFACE OVERLAYS --- */}
        {gameState !== "PLAYING" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
            
            {/* MAIN MENU */}
            {gameState === "MENU" && (
              <div className="space-y-6 w-full max-w-xs animate-fade-in">
                <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 drop-shadow-lg">
                  GALAXY ARCADE
                </h1>
                <p className="text-slate-400 text-xs px-4 leading-relaxed">
                  Bestuur je schip via <span className="text-cyan-400 font-bold">A/D of swipe op mobiel</span>. Je schip vuurt automatisch!
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={startGame}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-black text-sm rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all"
                  >
                    🚀 Start Battle
                  </button>
                  <button
                    onClick={() => setGameState("SHOP")}
                    className="w-full py-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 font-bold text-xs rounded-xl uppercase tracking-widest text-indigo-400 transition-all"
                  >
                    🛠️ Tech Shop & Upgrades
                  </button>
                </div>
              </div>
            )}

            {/* UPGRADE SHOP MENU */}
            {gameState === "SHOP" && (
              <div className="w-full max-w-xs space-y-5 animate-fade-in">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 tracking-wide">
                  UPGRADE SHIP
                </h2>
                <p className="text-xs text-slate-400">Verhoog je vuursnelheid of vliegsnelheid met coins.</p>
                
                <div className="space-y-3 pt-2">
                  {/* Upgrade 1: Fire Rate */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-left">
                    <div>
                      <span className="block font-bold text-sm text-white">⚡ Plasma Fire Rate</span>
                      <span className="text-[10px] text-slate-400">Level {fireRateLevel}</span>
                    </div>
                    <button
                      onClick={() => buyUpgrade("firerate")}
                      disabled={coins < fireRateLevel * 150}
                      className="px-3 py-2 bg-yellow-500 disabled:bg-slate-800 text-black disabled:text-slate-500 font-extrabold text-xs rounded-lg transition-all"
                    >
                      {coins >= fireRateLevel * 150 ? `🪙 ${fireRateLevel * 150}` : "Max/No Coins"}
                    </button>
                  </div>

                  {/* Upgrade 2: Ship Speed */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-left">
                    <div>
                      <span className="block font-bold text-sm text-white">✈️ Engine Thrusters</span>
                      <span className="text-[10px] text-slate-400">Level {speedLevel}</span>
                    </div>
                    <button
                      onClick={() => buyUpgrade("speed")}
                      disabled={coins < speedLevel * 150}
                      className="px-3 py-2 bg-yellow-500 disabled:bg-slate-800 text-black disabled:text-slate-500 font-extrabold text-xs rounded-lg transition-all"
                    >
                      {coins >= speedLevel * 150 ? `🪙 ${speedLevel * 150}` : "Max/No Coins"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setGameState("MENU")}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
                >
                  Back to Menu
                </button>
              </div>
            )}

            {/* GAME OVER */}
            {gameState === "GAME_OVER" && (
              <div className="space-y-5 w-full max-w-xs animate-fade-in">
                <h2 className="text-3xl font-black text-red-500 tracking-wide drop-shadow-[0_4px_12px_rgba(220,38,38,0.4)]">
                  FLEET DESTROYED
                </h2>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-slate-400">Behaalde Score: <span className="text-white font-black">{score}</span></p>
                  <p className="text-yellow-400">Verdiende Coins: <span className="font-bold">+{stateRef.current.coinsEarned}</span></p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={startGame}
                    disabled={dailyPlaysLeft === 0}
                    className={`w-full py-3.5 font-black text-xs rounded-xl uppercase tracking-widest transition-all ${
                      dailyPlaysLeft === 0
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    }`}
                  >
                    {dailyPlaysLeft === 0 ? "Battery Depleted (0/3)" : "Re-Deploy Fighter Jet"}
                  </button>
                  <button
                    onClick={() => setGameState("MENU")}
                    className="w-full py-2.5 bg-slate-900 text-slate-400 text-xs font-bold rounded-xl"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            )}

            {/* PLAY LIMIT REACHED */}
            {gameState === "NO_PLAYS" && (
              <div className="space-y-4 w-full max-w-xs animate-fade-in">
                <div className="text-4xl">🔋❌</div>
                <h2 className="text-xl font-extrabold text-amber-500">Dagelijkse Limiet Bereikt</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Je schip laadt momenteel op in het ruimtestation. Kom morgen terug voor {MAX_DAILY_PLAYS} nieuwe gratis speelbeurten!
                </p>
                <button
                  onClick={() => setGameState("MENU")}
                  className="w-full py-2.5 bg-slate-900 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20"
                >
                  Terug naar Hoofdmenu
                </button>
              </div>
            )}

          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 mt-4 text-center tracking-wide max-w-xs leading-normal">
        💻 <b>PC:</b> Gebruik <kbd className="bg-slate-900 px-1 rounded text-cyan-400">A</kbd> & <kbd className="bg-slate-900 px-1 rounded text-cyan-400">D</kbd> of Pijltjestoetsen. <br />
        📱 <b>Mobiel:</b> Sleep je vinger over de ruimtezone om te sturen.
      </p>
    </div>
  );
}





// "use client";
// import React, { useState, useEffect, useRef } from "react";

// const MAX_DAILY_PLAYS = 3;
// const COINS_PER_KILL = 10;

// export default function GalaxyShooter() {
//   const canvasRef = useRef(null);
//   const [gameState, setGameState] = useState("MENU"); // MENU, PLAYING, GAME_OVER, NO_PLAYS
//   const [coins, setCoins] = useState(0);
//   const [dailyPlaysLeft, setDailyPlaysLeft] = useState(MAX_DAILY_PLAYS);
//   const [score, setScore] = useState(0);

//   // References for game loops to avoid closures stale state issues
//   const stateRef = useRef({
//     player: { x: 0, y: 0, width: 40, height: 40, speed: 5 },
//     bullets: [],
//     enemies: [],
//     coinsEarned: 0,
//     score: 0,
//     keys: {},
//     touchX: null,
//   });

//   // Load and initialize LocalStorage data
//   useEffect(() => {
//     // Load Coins
//     const savedCoins = localStorage.getItem("galaxy_coins");
//     if (savedCoins) setCoins(parseInt(savedCoins, 10));

//     // Check Daily Limit
//     const todayStr = new Date().toISOString().split("T")[0];
//     const dailyData = localStorage.getItem("galaxy_daily_limit");

//     if (dailyData) {
//       const { date, count } = JSON.parse(dailyData);
//       if (date === todayStr) {
//         setDailyPlaysLeft(Math.max(0, MAX_DAILY_PLAYS - count));
//       } else {
//         // New day, reset counter
//         localStorage.setItem(
//           "galaxy_daily_limit",
//           JSON.stringify({ date: todayStr, count: 0 })
//         );
//         setDailyPlaysLeft(MAX_DAILY_PLAYS);
//       }
//     } else {
//       localStorage.setItem(
//         "galaxy_daily_limit",
//         JSON.stringify({ date: todayStr, count: 0 })
//       );
//     }
//   }, []);

//   // Handle Game Start with Daily Limit Validation
//   const startGame = () => {
//     const todayStr = new Date().toISOString().split("T")[0];
//     const dailyData = JSON.parse(localStorage.getItem("galaxy_daily_limit") || "{}");
//     const currentCount = dailyData.date === todayStr ? dailyData.count : 0;

//     if (currentCount >= MAX_DAILY_PLAYS) {
//       setGameState("NO_PLAYS");
//       return;
//     }

//     // Update Daily Plays in localStorage
//     localStorage.setItem(
//       "galaxy_daily_limit",
//       JSON.stringify({ date: todayStr, count: currentCount + 1 })
//     );
//     setDailyPlaysLeft(MAX_DAILY_PLAYS - (currentCount + 1));

//     // Reset Game Objects
//     const canvas = canvasRef.current;
//     stateRef.current = {
//       player: { x: canvas.width / 2 - 20, y: canvas.height - 60, width: 40, height: 40, speed: 6 },
//       bullets: [],
//       enemies: [],
//       coinsEarned: 0,
//       score: 0,
//       keys: {},
//       touchX: null,
//     };

//     setScore(0);
//     setGameState("PLAYING");
//   };

//   // Game Core Engine Loop
//   useEffect(() => {
//     if (gameState !== "PLAYING") return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let animationFrameId;
//     let spawnTimer = 0;
//     let shootTimer = 0;

//     // Handle Keyboard controls
//     const handleKeyDown = (e) => (stateRef.current.keys[e.key] = true);
//     const handleKeyUp = (e) => (stateRef.current.keys[e.key] = false);

//     // Handle Mobile Touch Controls
//     const handleTouchMove = (e) => {
//       if (!e.touches[0]) return;
//       const rect = canvas.getBoundingClientRect();
//       const root = document.documentElement;
//       const touchX = e.touches[0].clientX - rect.left - root.scrollLeft;
//       // Smoothly map touch location to canvas bounds
//       stateRef.current.player.x = Math.max(
//         0,
//         Math.min(canvas.width - stateRef.current.player.width, touchX - stateRef.current.player.width / 2)
//       );
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);
//     canvas.addEventListener("touchmove", handleTouchMove, { passive: true });

//     const gameLoop = () => {
//       const state = stateRef.current;
//       const player = state.player;

//       // 1. Clear Screen
//       ctx.fillStyle = "#03001e";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Draw subtle star stars background
//       ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
//       for (let i = 0; i < 20; i++) {
//         ctx.fillRect((i * 73) % canvas.width, (Date.now() / 10 + i * 50) % canvas.height, 2, 2);
//       }

//       // 2. Move Player (Keyboard)
//       if (state.keys["ArrowLeft"] || state.keys["a"]) player.x -= player.speed;
//       if (state.keys["ArrowRight"] || state.keys["d"]) player.x += player.speed;
//       player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

//       // 3. Auto Shoot
//       shootTimer++;
//       if (shootTimer % 12 === 0) {
//         state.bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, speed: 8 });
//       }

//       // 4. Update Bullets
//       state.bullets.forEach((b, idx) => {
//         b.y -= b.speed;
//         if (b.y < 0) state.bullets.splice(idx, 1);

//         // Draw Bullets (Blue Plasma Lasers)
//         ctx.fillStyle = "#00f0ff";
//         ctx.shadowBlur = 10;
//         ctx.shadowColor = "#00f0ff";
//         ctx.fillRect(b.x, b.y, 4, 12);
//         ctx.shadowBlur = 0; // Reset shadow
//       });

//       // 5. Spawn Invaders/Enemies
//       spawnTimer++;
//       if (spawnTimer % 45 === 0) {
//         const size = 30;
//         state.enemies.push({
//           x: Math.random() * (canvas.width - size),
//           y: -size,
//           width: size,
//           height: size,
//           speed: 2 + Math.random() * 2,
//           color: Math.random() > 0.5 ? "#ff007f" : "#a124ff",
//         });
//       }

//       // 6. Update & Check Enemies
//       state.enemies.forEach((enemy, eIdx) => {
//         enemy.y += enemy.speed;

//         // Draw Alien Ships
//         ctx.fillStyle = enemy.color;
//         ctx.beginPath();
//         ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
//         ctx.lineTo(enemy.x, enemy.y);
//         ctx.lineTo(enemy.x + enemy.width, enemy.y);
//         ctx.closePath();
//         ctx.fill();

//         // Game Over Conditions: Boundary cross or player hit
//         if (enemy.y > canvas.height) {
//           endGame();
//         }

//         // Hit player check
//         if (
//           enemy.x < player.x + player.width &&
//           enemy.x + enemy.width > player.x &&
//           enemy.y < player.y + player.height &&
//           enemy.y + enemy.height > player.y
//         ) {
//           endGame();
//         }

//         // Bullet Collisions
//         state.bullets.forEach((bullet, bIdx) => {
//           if (
//             bullet.x < enemy.x + enemy.width &&
//             bullet.x + 4 > enemy.x &&
//             bullet.y < enemy.y + enemy.height &&
//             bullet.y + 12 > enemy.y
//           ) {
//             // Remove enemy and bullet
//             state.enemies.splice(eIdx, 1);
//             state.bullets.splice(bIdx, 1);
//             state.score += 10;
//             state.coinsEarned += COINS_PER_KILL;
//             setScore(state.score);
//           }
//         });
//       });

//       // 7. Draw Hero Fighter Ship
//       ctx.fillStyle = "#00ffcc";
//       ctx.beginPath();
//       ctx.moveTo(player.x + player.width / 2, player.y);
//       ctx.lineTo(player.x, player.y + player.height);
//       ctx.lineTo(player.x + player.width, player.y + player.height);
//       ctx.closePath();
//       ctx.fill();

//       // Flame Thruster Effect
//       ctx.fillStyle = Math.random() > 0.5 ? "#ffaa00" : "#ff3300";
//       ctx.fillRect(player.x + player.width / 2 - 4, player.y + player.height, 8, 6);

//       if (gameState === "PLAYING") {
//         animationFrameId = requestAnimationFrame(gameLoop);
//       }
//     };

//     const endGame = () => {
//       cancelAnimationFrame(animationFrameId);
//       // Persist coins locally
//       const currentCoins = parseInt(localStorage.getItem("galaxy_coins") || "0", 10);
//       const totalCoins = currentCoins + stateRef.current.coinsEarned;
//       localStorage.setItem("galaxy_coins", totalCoins.toString());
//       setCoins(totalCoins);

//       setGameState("GAME_OVER");
//     };

//     animationFrameId = requestAnimationFrame(gameLoop);

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [gameState]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans p-4 select-none">
//       {/* HUD Bar */}
//       <div className="w-full max-w-md flex justify-between items-center bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-2 text-sm shadow-md">
//         <div className="flex items-center gap-1 text-yellow-400 font-bold">
//           🪙 <span>{coins}</span>
//         </div>
//         <div className="text-cyan-400 font-bold tracking-wide">
//           SCORE: {score}
//         </div>
//         <div className="text-xs text-slate-400">
//           Daily Limit: <span className={dailyPlaysLeft === 0 ? "text-red-500 font-bold" : "text-emerald-400 font-bold"}>{dailyPlaysLeft}/{MAX_DAILY_PLAYS}</span>
//         </div>
//       </div>

//       {/* Main Game Interface Container */}
//       <div className="relative w-full max-w-md aspect-[9/16] bg-slate-900 border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
//         <canvas
//           ref={canvasRef}
//           width={360}
//           height={640}
//           className="w-full h-full block"
//         />

//         {/* Dynamic State Overlay Screens */}
//         {gameState !== "PLAYING" && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center animate-fade-in">
//             {gameState === "MENU" && (
//               <>
//                 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider mb-2">
//                   GALAXY SHOOTER
//                 </h1>
//                 <p className="text-slate-400 text-xs mb-8 max-w-xs">
//                   Move with <span className="text-slate-200 font-semibold">A/D</span> keys, Arrow keys, or swipe/drag on Mobile. Weapon autoshoots!
//                 </p>
//                 <button
//                   onClick={startGame}
//                   className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold rounded-full shadow-lg shadow-cyan-500/20 transform active:scale-95 transition-all text-sm uppercase tracking-widest"
//                 >
//                   Launch Fleet
//                 </button>
//               </>
//             )}

//             {gameState === "GAME_OVER" && (
//               <>
//                 <h2 className="text-3xl font-black text-red-500 tracking-tight mb-2">
//                   SHIP DESTROYED
//                 </h2>
//                 <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 w-full max-w-xs mb-6 space-y-2">
//                   <p className="text-slate-400 text-sm">Final Score: <span className="text-white font-bold">{score}</span></p>
//                   <p className="text-yellow-400 text-sm">Coins Recovered: <span className="font-bold">+{stateRef.current.coinsEarned}</span></p>
//                 </div>
//                 <button
//                   onClick={startGame}
//                   disabled={dailyPlaysLeft === 0}
//                   className={`px-8 py-3 font-bold rounded-full shadow-lg transition-all text-sm uppercase tracking-widest ${
//                     dailyPlaysLeft === 0
//                       ? "bg-slate-700 text-slate-500 cursor-not-allowed"
//                       : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95"
//                   }`}
//                 >
//                   {dailyPlaysLeft === 0 ? "No Energy Left" : "Deploy Again"}
//                 </button>
//               </>
//             )}

//             {gameState === "NO_PLAYS" && (
//               <>
//                 <div className="text-4xl mb-3">🪫</div>
//                 <h2 className="text-xl font-bold text-amber-500 mb-2">
//                   Daily Play Limit Reached
//                 </h2>
//                 <p className="text-slate-400 text-xs max-w-xs mb-6">
//                   Your flagship engines require cool-down. Daily limits reset automatically tomorrow!
//                 </p>
//                 <div className="text-xs text-slate-500 italic bg-slate-900 px-4 py-2 rounded">
//                   Maxed at {MAX_DAILY_PLAYS} flights per day
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer Mobile hints */}
//       <p className="text-[11px] text-slate-600 mt-3 text-center md:hidden">
//         💡 Drag anywhere inside the space zone to steer your ship.
//       </p>
//     </div>
//   );
// }