'use client';

import { useEffect, useRef, useState } from 'react';

// --- CONSTANTS (Moved outside to prevent Vercel ESLint build errors) ---
const MAX_MISSIONS = 10;
const KILLS_PER_MISSION = 15;
const DAILY_LIMIT = 5;

// --- SYNTHESIZED AUDIO ENGINE (SSR & TypeScript Safe) ---
class AudioEngine {
  ctx: AudioContext | null;

  constructor() { 
    this.ctx = null; 
  }
  
  init() { 
    if (!this.ctx && typeof window !== 'undefined') {
      const windowAudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (windowAudioCtx) this.ctx = new windowAudioCtx();
    }
  }
  
  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1, slideDown = false) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(); 
      const gain = this.ctx.createGain();
      osc.connect(gain); 
      gain.connect(this.ctx.destination);
      osc.type = type; 
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slideDown) osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.start(); 
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play blocked by browser:", e);
    }
  }
  
  shoot() { this.playTone(600, 'square', 0.1, 0.05, true); }
  explosion() { this.playTone(150, 'sawtooth', 0.3, 0.1, true); }
  click() { this.playTone(800, 'sine', 0.05, 0.1, false); }
  gameOver() { this.playTone(200, 'sawtooth', 1, 0.2, true); }
  win() { 
    this.playTone(800, 'sine', 0.5, 0.1, false); 
    setTimeout(() => this.playTone(1200, 'sine', 0.5, 0.1, false), 200); 
  }
}

const sfx = new AudioEngine();

// TypeScript Interfaces for Engine State
interface Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  lives: number;
  invulnerable: number;
}

interface Bullet {
  x: number;
  y: number;
  dy: number;
  radius: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  hp: number;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
  life: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Keys {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  Space: boolean;
  [key: string]: boolean;
}

interface EngineState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  stars: Star[];
  keys: Keys;
  frames: number;
  lastShot: number;
  kills: number;
  missionKills: number;
  flashRed: number;
}

export default function BengalMissionPremium() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // React State
  const [gameState, setGameState] = useState<string>('menu'); 
  const [difficulty, setDifficulty] = useState<string>('low');
  const [currentMission, setCurrentMission] = useState<number>(1);
  const [playsLeft, setPlaysLeft] = useState<number>(DAILY_LIMIT);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Engine State
  const engine = useRef<EngineState>({
    player: { x: 400, y: 500, radius: 18, color: '#10b981', speed: 6, lives: 3, invulnerable: 0 },
    bullets: [], enemies: [], particles: [], stars: [],
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false },
    frames: 0, lastShot: 0, kills: 0, missionKills: 0, flashRed: 0
  });

  // --- LOCAL STORAGE (Hydration Safe for Vercel) ---
  useEffect(() => {
    const today = new Date().toDateString();
    try {
      const stored = JSON.parse(window.localStorage.getItem('bengalMissionPremium') || '{}');
      if (stored.date === today) {
        setPlaysLeft(Math.max(0, DAILY_LIMIT - (stored.plays || 0)));
      } else {
        window.localStorage.setItem('bengalMissionPremium', JSON.stringify({ date: today, plays: 0 }));
        setPlaysLeft(DAILY_LIMIT);
      }
    } catch (e) { 
      setPlaysLeft(DAILY_LIMIT); 
    }
    setIsLoaded(true);
  }, [gameState]);

  const consumePlay = () => {
    sfx.init(); sfx.click();
    try {
      const today = new Date().toDateString();
      const stored = JSON.parse(window.localStorage.getItem('bengalMissionPremium') || '{}');
      const newPlays = (stored.plays || 0) + 1;
      window.localStorage.setItem('bengalMissionPremium', JSON.stringify({ date: today, plays: newPlays }));
      setPlaysLeft(Math.max(0, DAILY_LIMIT - newPlays));
    } catch (e) {
      console.warn('Local storage disabled');
    }
  };

  // --- KEYBOARD CONTROLS (TypeScript Safe) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.code) || e.key === ' ') {
        if (gameState === 'playing') e.preventDefault();
        const code = e.code === 'Space' || e.key === ' ' ? 'Space' : e.code;
        if (engine.current.keys.hasOwnProperty(code)) {
          engine.current.keys[code] = true;
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => { 
      const code = e.code === 'Space' || e.key === ' ' ? 'Space' : e.code;
      if (engine.current.keys.hasOwnProperty(code)) {
        engine.current.keys[code] = false; 
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      window.removeEventListener('keyup', handleKeyUp); 
    };
  }, [gameState]);

  const handleTouch = (key: string, isDown: boolean) => (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    engine.current.keys[key] = isDown;
  };

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;
    let animationId: number;
    
    if (engine.current.stars.length === 0) {
      for (let i = 0; i < 120; i++) {
        engine.current.stars.push({ 
          x: Math.random() * canvas.width, 
          y: Math.random() * canvas.height, 
          size: Math.random() * 1.5, 
          speed: Math.random() * 4 + 0.5 
        });
      }
    }

    const diffMult = difficulty === 'high' ? 1.5 : 1;
    const spawnRate = Math.max(12, 70 - (currentMission * 4 * diffMult)); 
    
    function update() {
      const state = engine.current;
      state.frames++;
      if (state.flashRed > 0) state.flashRed--;
      if (state.player.invulnerable > 0) state.player.invulnerable--;

      // Movement
      if (state.keys.ArrowUp && state.player.y > 20) state.player.y -= state.player.speed;
      if (state.keys.ArrowDown && state.player.y < canvas!.height - 20) state.player.y += state.player.speed;
      if (state.keys.ArrowLeft && state.player.x > 20) state.player.x -= state.player.speed;
      if (state.keys.ArrowRight && state.player.x < canvas!.width - 20) state.player.x += state.player.speed;

      // Shooting
      if (state.keys.Space && state.frames - state.lastShot > 10) {
        state.bullets.push({ x: state.player.x, y: state.player.y - 20, dy: -15, radius: 4, color: '#38bdf8' }); 
        sfx.shoot();
        state.lastShot = state.frames;
      }

      state.bullets.forEach((b, i) => { b.y += b.dy; if (b.y < -10) state.bullets.splice(i, 1); });

      // Spawning
      if (state.frames % Math.floor(spawnRate) === 0) {
        const radius = Math.random() * 15 + 12;
        state.enemies.push({ 
          x: Math.random() * (canvas!.width - radius * 2) + radius, 
          y: -30, radius, color: '#f43f5e', 
          speed: (2 + Math.random() * 2 + (currentMission * 0.3)) * diffMult, 
          hp: currentMission > 4 && Math.random() > 0.6 ? 2 : 1 
        });
      }

      // Collisions
      for (let e = state.enemies.length - 1; e >= 0; e--) {
        const enemy = state.enemies[e];
        enemy.y += enemy.speed;

        if (Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y) - enemy.radius - state.player.radius < 0 && state.player.invulnerable === 0) {
          state.player.lives--;
          state.flashRed = 20;
          state.player.invulnerable = 60; 
          createExplosion(enemy.x, enemy.y, enemy.color);
          sfx.explosion();
          state.enemies.splice(e, 1);
          if (state.player.lives <= 0) { 
            sfx.gameOver(); 
            setGameState('gameover'); 
            return; 
          }
          continue;
        }

        for (let b = state.bullets.length - 1; b >= 0; b--) {
          const bullet = state.bullets[b];
          if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) - enemy.radius - bullet.radius < 0) {
            state.bullets.splice(b, 1);
            enemy.hp--;
            if (enemy.hp <= 0) {
              createExplosion(enemy.x, enemy.y, enemy.color);
              sfx.explosion();
              state.enemies.splice(e, 1);
              state.kills++; state.missionKills++;
              
              if (state.missionKills >= KILLS_PER_MISSION * currentMission) {
                if (currentMission >= MAX_MISSIONS) { sfx.win(); setGameState('winner'); }
                else { sfx.win(); setGameState('mission_complete'); }
              }
              break; 
            }
          }
        }
        if (enemy && enemy.y > canvas!.height + 50) state.enemies.splice(e, 1);
      }

      for (let p = state.particles.length - 1; p >= 0; p--) {
        const part = state.particles[p];
        part.x += part.dx; part.y += part.dy; part.life -= 0.03;
        if (part.life <= 0) state.particles.splice(p, 1);
      }
      state.stars.forEach(s => { s.y += s.speed; if (s.y > canvas!.height) { s.y = 0; s.x = Math.random() * canvas!.width; } });
    }

    function createExplosion(x: number, y: number, color: string) {
      for (let i = 0; i < 20; i++) {
        engine.current.particles.push({ 
          x, y, dx: (Math.random()-0.5)*10, dy: (Math.random()-0.5)*10, 
          radius: Math.random()*4+1, color, life: 1 
        });
      }
    }

    function draw() {
      const state = engine.current;
      ctx!.fillStyle = state.flashRed > 0 ? '#450a0a' : '#020617'; 
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx!.fillStyle = '#64748b';
      state.stars.forEach(s => { ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx!.fill(); });

      state.particles.forEach(p => {
        ctx!.globalAlpha = Math.max(0, p.life); ctx!.fillStyle = p.color; ctx!.shadowBlur = 10; ctx!.shadowColor = p.color;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx!.fill();
      });
      ctx!.globalAlpha = 1;

      ctx!.shadowBlur = 15; ctx!.shadowColor = '#38bdf8'; ctx!.fillStyle = '#e0f2fe';
      state.bullets.forEach(b => { ctx!.beginPath(); ctx!.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx!.fill(); });

      ctx!.shadowColor = '#f43f5e';
      state.enemies.forEach(e => {
        ctx!.fillStyle = e.color; ctx!.beginPath(); ctx!.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = '#ffffff'; ctx!.beginPath(); ctx!.arc(e.x, e.y, e.radius*0.4, 0, Math.PI * 2); ctx!.fill();
      });

      if (state.player.invulnerable === 0 || state.frames % 10 < 5) {
        ctx!.shadowColor = state.player.color; ctx!.fillStyle = state.player.color;
        ctx!.beginPath();
        ctx!.moveTo(state.player.x, state.player.y - state.player.radius * 1.2);
        ctx!.lineTo(state.player.x - state.player.radius, state.player.y + state.player.radius);
        ctx!.lineTo(state.player.x + state.player.radius, state.player.y + state.player.radius);
        ctx!.closePath(); ctx!.fill();
        
        ctx!.fillStyle = '#fbbf24'; ctx!.shadowColor = '#f59e0b';
        ctx!.beginPath(); ctx!.arc(state.player.x, state.player.y + state.player.radius + 5, 4 + Math.random() * 4, 0, Math.PI * 2); ctx!.fill();
      }

      ctx!.shadowBlur = 0;
      
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx!.font = 'bold 22px system-ui';
      ctx!.textAlign = 'left';
      ctx!.fillText(`Mission: ${currentMission}/${MAX_MISSIONS}`, 25, 40);
      ctx!.fillText(`Targets: ${state.missionKills}/${KILLS_PER_MISSION * currentMission}`, 25, 75);
      
      ctx!.textAlign = 'right';
      ctx!.fillStyle = state.player.lives === 1 ? '#f43f5e' : '#10b981';
      ctx!.fillText(`Lives: ${'⚡'.repeat(Math.max(0, state.player.lives))}`, canvas!.width - 25, 40);
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx!.fillText(`Score: ${state.kills * 100}`, canvas!.width - 25, 75);
    }

    function loop() { 
      update(); 
      if (gameState === 'playing') draw(); 
      animationId = requestAnimationFrame(loop); 
    }
    
    loop();
    return () => cancelAnimationFrame(animationId);
  }, [gameState, currentMission, difficulty]);

  const initEngine = (keepScore = false) => {
    engine.current.player = { x: 400, y: 500, radius: 18, color: '#10b981', speed: 6, lives: 3, invulnerable: 0 };
    engine.current.bullets = []; engine.current.enemies = []; engine.current.particles = [];
    engine.current.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
    engine.current.missionKills = 0; engine.current.flashRed = 0;
    if (!keepScore) engine.current.kills = 0;
  };

  const attemptStartGame = () => {
    if (playsLeft <= 0) return;
    consumePlay(); 
    initEngine(false); 
    setCurrentMission(1); 
    setGameState('playing');
  };

  const startNextMission = () => {
    sfx.click(); 
    initEngine(true); 
    setCurrentMission(prev => prev + 1); 
    setGameState('playing');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-400 tracking-widest uppercase font-bold text-sm">Booting Engine...</p>
      </div>
    );
  }

  interface TouchButtonProps {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    children: React.ReactNode;
  }

  const TouchButton = ({ onTouchStart, onTouchEnd, children }: TouchButtonProps) => (
    <button 
      onTouchStart={onTouchStart} 
      onTouchEnd={onTouchEnd} 
      className="relative bg-gray-900/60 backdrop-blur-xl border border-white/10 active:border-emerald-400 active:bg-emerald-500/30 h-16 w-full rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] active:shadow-[inset_0_1px_10px_rgba(16,185,129,0.5),0_0_20px_rgba(16,185,129,0.8)] transition-all duration-75 active:scale-95 text-gray-400 active:text-white"
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#020617] to-black flex flex-col items-center justify-center font-sans text-white select-none touch-none overflow-hidden p-2 md:p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {gameState !== 'playing' && (
        <div className="absolute z-20 text-center p-8 w-11/12 max-w-lg bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {gameState === 'menu' && (
            <>
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500 mb-2 drop-shadow-lg tracking-tight">BENGAL MISSION</h1>
              <p className="text-emerald-400/80 font-mono text-sm tracking-[0.3em] mb-8">PREMIUM EDITION</p>
              
              <div className="my-6 p-5 bg-black/40 rounded-2xl border border-white/5">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Daily Energy Status</h3>
                <div className="flex justify-center gap-3">
                  {[...Array(DAILY_LIMIT)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${i < playsLeft ? 'bg-gradient-to-tr from-emerald-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-600'}`}>⚡</div>
                  ))}
                </div>
              </div>

              <div className="mb-8 flex items-center justify-center space-x-4 bg-black/30 p-3 rounded-2xl">
                <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Mode</span>
                <select value={difficulty} onChange={(e) => { sfx.click(); setDifficulty(e.target.value); }} className="bg-gray-900 text-emerald-400 border border-emerald-900/50 px-4 py-2 rounded-xl focus:outline-none cursor-pointer">
                  <option value="low">Standard</option>
                  <option value="high">Hardcore</option>
                </select>
              </div>
              
              {playsLeft > 0 ? (
                <button onClick={attemptStartGame} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transform hover:scale-[1.02] active:scale-95">DEPLOY SHIP</button>
              ) : (
                <div className="w-full bg-red-950/50 text-red-400 font-bold py-4 rounded-2xl text-lg border border-red-900/50">ENERGY DEPLETED. RETURN TOMORROW.</div>
              )}
            </>
          )}
          {gameState === 'mission_complete' && (
            <>
              <h2 className="text-4xl font-black text-cyan-400 mb-4 tracking-wide uppercase">Sector {currentMission} Clear</h2>
              <div className="w-16 h-1 bg-cyan-500/50 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-300 mb-8">Targets neutralized. Systems nominal.</p>
              <button onClick={startNextMission} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl text-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]">Initiate Mission {currentMission + 1}</button>
            </>
          )}
          {gameState === 'gameover' && (
            <>
              <h2 className="text-5xl font-black text-red-500 mb-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Destroyed</h2>
              <p className="text-gray-400 mb-8 mt-4 bg-black/40 p-4 rounded-xl">Total Score: <span className="text-white font-bold text-2xl ml-2">{engine.current.kills * 100}</span></p>
              <button onClick={() => { sfx.click(); setGameState('menu'); }} className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-2xl text-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)]">Return to Base</button>
            </>
          )}
          {gameState === 'winner' && (
            <>
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-500 mb-4 uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">Victory</h2>
              <p className="text-amber-400 mb-8 bg-amber-950/30 p-4 rounded-xl border border-amber-900/30">All Sectors Secured.<br/><span className="text-white font-bold mt-2 block text-xl">Final Score: {engine.current.kills * 100}</span></p>
              <button onClick={() => { sfx.click(); setGameState('menu'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl text-xl font-black shadow-[0_0_30px_rgba(245,158,11,0.5)]">Claim Victory</button>
            </>
          )}
        </div>
      )}

      <div className={`relative w-full max-w-[900px] aspect-[3/4] sm:aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-opacity duration-500 ${gameState !== 'playing' ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 z-10'}`}>
        <canvas ref={canvasRef} width={900} height={600} className="w-full h-full object-cover bg-[#020617] block" />
      </div>

      {gameState === 'playing' && (
        <div className="w-full max-w-[900px] mt-6 px-4 flex justify-between items-center md:hidden z-10 pb-8 relative">
          <div className="absolute left-10 bottom-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-3 gap-2 w-52 relative z-10">
            <div />
            <TouchButton onTouchStart={handleTouch('ArrowUp', true)} onTouchEnd={handleTouch('ArrowUp', false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </TouchButton>
            <div />
            
            <TouchButton onTouchStart={handleTouch('ArrowLeft', true)} onTouchEnd={handleTouch('ArrowLeft', false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </TouchButton>
            
            <div className="flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-4 h-4 rounded-full bg-white/50 shadow-[0_0_10px_white]"></div>
            </div>
            
            <TouchButton onTouchStart={handleTouch('ArrowRight', true)} onTouchEnd={handleTouch('ArrowRight', false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </TouchButton>
            
            <div />
            <TouchButton onTouchStart={handleTouch('ArrowDown', true)} onTouchEnd={handleTouch('ArrowDown', false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </TouchButton>
            <div />
          </div>

          <button 
            onTouchStart={handleTouch('Space', true)} 
            onTouchEnd={handleTouch('Space', false)} 
            className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-red-500 to-rose-800 border-[3px] border-rose-400/50 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4),0_10px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(225,29,72,0.6)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_40px_rgba(225,29,72,0.9)] active:scale-90 active:translate-y-2 active:from-red-600 active:to-rose-900 transition-all duration-75 flex items-center justify-center group z-10"
          >
            <div className="absolute inset-1.5 rounded-full border border-white/20 pointer-events-none"></div>
            <span className="text-white font-black text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-active:scale-95 group-active:text-rose-200">FIRE</span>
          </button>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useEffect, useRef, useState } from 'react';

// // --- SYNTHESIZED AUDIO ENGINE ---
// class AudioEngine {
//   constructor() { this.ctx = null; }
//   init() { if (!this.ctx && typeof window !== 'undefined') this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
//   playTone(freq, type, duration, vol = 0.1, slideDown = false) {
//     if (!this.ctx) return;
//     const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
//     osc.connect(gain); gain.connect(this.ctx.destination);
//     osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
//     if (slideDown) osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.ctx.currentTime + duration);
//     gain.gain.setValueAtTime(vol, this.ctx.currentTime);
//     gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
//     osc.start(); osc.stop(this.ctx.currentTime + duration);
//   }
//   shoot() { this.playTone(600, 'square', 0.1, 0.05, true); }
//   explosion() { this.playTone(150, 'sawtooth', 0.3, 0.1, true); }
//   click() { this.playTone(800, 'sine', 0.05, 0.1, false); }
//   gameOver() { this.playTone(200, 'sawtooth', 1, 0.2, true); }
//   win() { this.playTone(800, 'sine', 0.5, 0.1, false); setTimeout(() => this.playTone(1200, 'sine', 0.5, 0.1, false), 200); }
// }

// const sfx = new AudioEngine();

// export default function BengalMissionPremium() {
//   const canvasRef = useRef(null);
  
//   // React State
//   const [gameState, setGameState] = useState('menu'); 
//   const [difficulty, setDifficulty] = useState('low');
//   const [currentMission, setCurrentMission] = useState(1);
//   const [playsLeft, setPlaysLeft] = useState(5);
//   const [isLoaded, setIsLoaded] = useState(false);

//   const MAX_MISSIONS = 10;
//   const KILLS_PER_MISSION = 15;
//   const DAILY_LIMIT = 5;

//   const engine = useRef({
//     player: { x: 400, y: 500, radius: 18, color: '#10b981', speed: 6, lives: 3, invulnerable: 0 },
//     bullets: [], enemies: [], particles: [], stars: [],
//     keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false },
//     frames: 0, lastShot: 0, kills: 0, missionKills: 0, flashRed: 0
//   });

//   // --- LOCAL STORAGE ---
//   useEffect(() => {
//     const today = new Date().toDateString();
//     try {
//       const stored = JSON.parse(localStorage.getItem('bengalMissionPremium') || '{}');
//       if (stored.date === today) setPlaysLeft(Math.max(0, DAILY_LIMIT - stored.plays));
//       else { localStorage.setItem('bengalMissionPremium', JSON.stringify({ date: today, plays: 0 })); setPlaysLeft(DAILY_LIMIT); }
//     } catch (e) { setPlaysLeft(DAILY_LIMIT); }
//     setIsLoaded(true);
//   }, [gameState]);

//   const consumePlay = () => {
//     sfx.init(); sfx.click();
//     const today = new Date().toDateString();
//     const stored = JSON.parse(localStorage.getItem('bengalMissionPremium') || '{}');
//     const newPlays = (stored.plays || 0) + 1;
//     localStorage.setItem('bengalMissionPremium', JSON.stringify({ date: today, plays: newPlays }));
//     setPlaysLeft(Math.max(0, DAILY_LIMIT - newPlays));
//   };

//   // --- CONTROLS ---
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
//         if (gameState === 'playing') e.preventDefault();
//         engine.current.keys[e.code] = true;
//       }
//     };
//     const handleKeyUp = (e) => { if (engine.current.keys.hasOwnProperty(e.code)) engine.current.keys[e.code] = false; };
//     window.addEventListener('keydown', handleKeyDown, { passive: false });
//     window.addEventListener('keyup', handleKeyUp);
//     return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
//   }, [gameState]);

//   const handleTouch = (key, isDown) => (e) => {
//     e.preventDefault();
//     engine.current.keys[key] = isDown;
//   };

//   // --- MAIN GAME LOOP ---
//   useEffect(() => {
//     if (gameState !== 'playing') return;
    
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d', { alpha: false }); 
//     let animationId;
    
//     if (engine.current.stars.length === 0) {
//       for (let i = 0; i < 120; i++) engine.current.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5, speed: Math.random() * 4 + 0.5 });
//     }

//     const diffMult = difficulty === 'high' ? 1.5 : 1;
//     const spawnRate = Math.max(12, 70 - (currentMission * 4 * diffMult)); 
    
//     function update() {
//       const state = engine.current;
//       state.frames++;
//       if (state.flashRed > 0) state.flashRed--;
//       if (state.player.invulnerable > 0) state.player.invulnerable--;

//       if (state.keys.ArrowUp && state.player.y > 20) state.player.y -= state.player.speed;
//       if (state.keys.ArrowDown && state.player.y < canvas.height - 20) state.player.y += state.player.speed;
//       if (state.keys.ArrowLeft && state.player.x > 20) state.player.x -= state.player.speed;
//       if (state.keys.ArrowRight && state.player.x < canvas.width - 20) state.player.x += state.player.speed;

//       if (state.keys.Space && state.frames - state.lastShot > 10) {
//         state.bullets.push({ x: state.player.x, y: state.player.y - 20, dy: -15, radius: 4, color: '#38bdf8' }); 
//         sfx.shoot();
//         state.lastShot = state.frames;
//       }

//       state.bullets.forEach((b, i) => { b.y += b.dy; if (b.y < -10) state.bullets.splice(i, 1); });

//       if (state.frames % Math.floor(spawnRate) === 0) {
//         const radius = Math.random() * 15 + 12;
//         state.enemies.push({ x: Math.random() * (canvas.width - radius * 2) + radius, y: -30, radius, color: '#f43f5e', speed: (2 + Math.random() * 2 + (currentMission * 0.3)) * diffMult, hp: currentMission > 4 && Math.random() > 0.6 ? 2 : 1 });
//       }

//       for (let e = state.enemies.length - 1; e >= 0; e--) {
//         const enemy = state.enemies[e];
//         enemy.y += enemy.speed;

//         if (Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y) - enemy.radius - state.player.radius < 0 && state.player.invulnerable === 0) {
//           state.player.lives--;
//           state.flashRed = 20;
//           state.player.invulnerable = 60; 
//           createExplosion(enemy.x, enemy.y, enemy.color);
//           sfx.explosion();
//           state.enemies.splice(e, 1);
//           if (state.player.lives <= 0) { sfx.gameOver(); setGameState('gameover'); return; }
//           continue;
//         }

//         for (let b = state.bullets.length - 1; b >= 0; b--) {
//           const bullet = state.bullets[b];
//           if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) - enemy.radius - bullet.radius < 0) {
//             state.bullets.splice(b, 1);
//             enemy.hp--;
//             if (enemy.hp <= 0) {
//               createExplosion(enemy.x, enemy.y, enemy.color);
//               sfx.explosion();
//               state.enemies.splice(e, 1);
//               state.kills++; state.missionKills++;
              
//               if (state.missionKills >= KILLS_PER_MISSION * currentMission) {
//                 if (currentMission >= MAX_MISSIONS) { sfx.win(); setGameState('winner'); }
//                 else { sfx.win(); setGameState('mission_complete'); }
//               }
//               break; 
//             }
//           }
//         }
//         if (enemy && enemy.y > canvas.height + 50) state.enemies.splice(e, 1);
//       }

//       for (let p = state.particles.length - 1; p >= 0; p--) {
//         const part = state.particles[p];
//         part.x += part.dx; part.y += part.dy; part.life -= 0.03;
//         if (part.life <= 0) state.particles.splice(p, 1);
//       }
//       state.stars.forEach(s => { s.y += s.speed; if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; } });
//     }

//     function createExplosion(x, y, color) {
//       for (let i = 0; i < 20; i++) engine.current.particles.push({ x, y, dx: (Math.random()-0.5)*10, dy: (Math.random()-0.5)*10, radius: Math.random()*4+1, color, life: 1 });
//     }

//     function draw() {
//       const state = engine.current;
//       ctx.fillStyle = state.flashRed > 0 ? '#450a0a' : '#020617'; 
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       ctx.fillStyle = '#64748b';
//       state.stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); });

//       state.particles.forEach(p => {
//         ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
//         ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
//       });
//       ctx.globalAlpha = 1;

//       ctx.shadowBlur = 15; ctx.shadowColor = '#38bdf8'; ctx.fillStyle = '#e0f2fe';
//       state.bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill(); });

//       ctx.shadowColor = '#f43f5e';
//       state.enemies.forEach(e => {
//         ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
//         ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(e.x, e.y, e.radius*0.4, 0, Math.PI * 2); ctx.fill();
//       });

//       if (state.player.invulnerable === 0 || state.frames % 10 < 5) {
//         ctx.shadowColor = state.player.color; ctx.fillStyle = state.player.color;
//         ctx.beginPath();
//         ctx.moveTo(state.player.x, state.player.y - state.player.radius * 1.2);
//         ctx.lineTo(state.player.x - state.player.radius, state.player.y + state.player.radius);
//         ctx.lineTo(state.player.x + state.player.radius, state.player.y + state.player.radius);
//         ctx.closePath(); ctx.fill();
        
//         ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#f59e0b';
//         ctx.beginPath(); ctx.arc(state.player.x, state.player.y + state.player.radius + 5, 4 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
//       }

//       ctx.shadowBlur = 0;
      
//       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.font = 'bold 22px system-ui';
//       ctx.textAlign = 'left';
//       ctx.fillText(`Mission: ${currentMission}/${MAX_MISSIONS}`, 25, 40);
//       ctx.fillText(`Targets: ${state.missionKills}/${KILLS_PER_MISSION * currentMission}`, 25, 75);
      
//       ctx.textAlign = 'right';
//       ctx.fillStyle = state.player.lives === 1 ? '#f43f5e' : '#10b981';
//       ctx.fillText(`Lives: ${'⚡'.repeat(Math.max(0, state.player.lives))}`, canvas.width - 25, 40);
//       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
//       ctx.fillText(`Score: ${state.kills * 100}`, canvas.width - 25, 75);
//     }

//     function loop() { update(); if (gameState === 'playing') draw(); animationId = requestAnimationFrame(loop); }
//     loop();
//     return () => cancelAnimationFrame(animationId);
//   }, [gameState, currentMission, difficulty]);

//   const initEngine = (keepScore = false) => {
//     engine.current.player = { x: 400, y: 500, radius: 18, color: '#10b981', speed: 6, lives: 3, invulnerable: 0 };
//     engine.current.bullets = []; engine.current.enemies = []; engine.current.particles = [];
//     engine.current.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
//     engine.current.missionKills = 0; engine.current.flashRed = 0;
//     if (!keepScore) engine.current.kills = 0;
//   };

//   const attemptStartGame = () => {
//     if (playsLeft <= 0) return;
//     consumePlay(); initEngine(false); setCurrentMission(1); setGameState('playing');
//   };

//   const startNextMission = () => {
//     sfx.click(); initEngine(true); setCurrentMission(prev => prev + 1); setGameState('playing');
//   };

//   if (!isLoaded) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading Engine...</div>;

//   // --- REUSABLE BUTTON COMPONENT FOR D-PAD ---
//   const TouchButton = ({ onTouchStart, onTouchEnd, children }) => (
//     <button 
//       onTouchStart={onTouchStart} 
//       onTouchEnd={onTouchEnd} 
//       className="relative bg-gray-900/60 backdrop-blur-xl border border-white/10 active:border-emerald-400 active:bg-emerald-500/30 h-16 w-full rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] active:shadow-[inset_0_1px_10px_rgba(16,185,129,0.5),0_0_20px_rgba(16,185,129,0.8)] transition-all duration-75 active:scale-95 text-gray-400 active:text-white"
//     >
//       {children}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#020617] to-black flex flex-col items-center justify-center font-sans text-white select-none touch-none overflow-hidden p-2 md:p-6">
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

//       {gameState !== 'playing' && (
//         <div className="absolute z-20 text-center p-8 w-11/12 max-w-lg bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//           {gameState === 'menu' && (
//             <>
//               <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500 mb-2 drop-shadow-lg tracking-tight">BENGAL MISSION</h1>
//               <p className="text-emerald-400/80 font-mono text-sm tracking-[0.3em] mb-8">PREMIUM EDITION</p>
              
//               <div className="my-6 p-5 bg-black/40 rounded-2xl border border-white/5">
//                 <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Daily Energy Status</h3>
//                 <div className="flex justify-center gap-3">
//                   {[...Array(DAILY_LIMIT)].map((_, i) => (
//                     <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${i < playsLeft ? 'bg-gradient-to-tr from-emerald-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-600'}`}>⚡</div>
//                   ))}
//                 </div>
//               </div>

//               <div className="mb-8 flex items-center justify-center space-x-4 bg-black/30 p-3 rounded-2xl">
//                 <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Mode</span>
//                 <select value={difficulty} onChange={(e) => { sfx.click(); setDifficulty(e.target.value); }} className="bg-gray-900 text-emerald-400 border border-emerald-900/50 px-4 py-2 rounded-xl focus:outline-none cursor-pointer">
//                   <option value="low">Standard</option>
//                   <option value="high">Hardcore</option>
//                 </select>
//               </div>
              
//               {playsLeft > 0 ? (
//                 <button onClick={attemptStartGame} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transform hover:scale-[1.02] active:scale-95">DEPLOY SHIP</button>
//               ) : (
//                 <div className="w-full bg-red-950/50 text-red-400 font-bold py-4 rounded-2xl text-lg border border-red-900/50">ENERGY DEPLETED. RETURN TOMORROW.</div>
//               )}
//             </>
//           )}
//           {gameState === 'mission_complete' && (
//             <>
//               <h2 className="text-4xl font-black text-cyan-400 mb-4 tracking-wide uppercase">Sector {currentMission} Clear</h2>
//               <div className="w-16 h-1 bg-cyan-500/50 mx-auto mb-6 rounded-full"></div>
//               <p className="text-gray-300 mb-8">Targets neutralized. Systems nominal.</p>
//               <button onClick={startNextMission} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl text-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]">Initiate Mission {currentMission + 1}</button>
//             </>
//           )}
//           {gameState === 'gameover' && (
//             <>
//               <h2 className="text-5xl font-black text-red-500 mb-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Destroyed</h2>
//               <p className="text-gray-400 mb-8 mt-4 bg-black/40 p-4 rounded-xl">Total Score: <span className="text-white font-bold text-2xl ml-2">{engine.current.kills * 100}</span></p>
//               <button onClick={() => { sfx.click(); setGameState('menu'); }} className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-2xl text-xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)]">Return to Base</button>
//             </>
//           )}
//           {gameState === 'winner' && (
//             <>
//               <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-500 mb-4 uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">Victory</h2>
//               <p className="text-amber-400 mb-8 bg-amber-950/30 p-4 rounded-xl border border-amber-900/30">All Sectors Secured.<br/><span className="text-white font-bold mt-2 block text-xl">Final Score: {engine.current.kills * 100}</span></p>
//               <button onClick={() => { sfx.click(); setGameState('menu'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl text-xl font-black shadow-[0_0_30px_rgba(245,158,11,0.5)]">Claim Victory</button>
//             </>
//           )}
//         </div>
//       )}

//       <div className={`relative w-full max-w-[900px] aspect-[3/4] sm:aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-opacity duration-500 ${gameState !== 'playing' ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 z-10'}`}>
//         <canvas ref={canvasRef} width={900} height={600} className="w-full h-full object-cover bg-[#020617] block" />
//       </div>

//       {/* PREMIUM MOBILE TOUCH CONTROLS */}
//       {gameState === 'playing' && (
//         <div className="w-full max-w-[900px] mt-6 px-4 flex justify-between items-center md:hidden z-10 pb-8 relative">
          
//           {/* Subtle glowing orb under the D-pad */}
//           <div className="absolute left-10 bottom-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none"></div>

//           {/* D-Pad Container */}
//           <div className="grid grid-cols-3 gap-2 w-52 relative z-10">
//             <div />
//             <TouchButton onTouchStart={handleTouch('ArrowUp', true)} onTouchEnd={handleTouch('ArrowUp', false)}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
//             </TouchButton>
//             <div />
            
//             <TouchButton onTouchStart={handleTouch('ArrowLeft', true)} onTouchEnd={handleTouch('ArrowLeft', false)}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
//             </TouchButton>
            
//             <div className="flex items-center justify-center opacity-20 pointer-events-none">
//               <div className="w-4 h-4 rounded-full bg-white/50 shadow-[0_0_10px_white]"></div>
//             </div>
            
//             <TouchButton onTouchStart={handleTouch('ArrowRight', true)} onTouchEnd={handleTouch('ArrowRight', false)}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
//             </TouchButton>
            
//             <div />
//             <TouchButton onTouchStart={handleTouch('ArrowDown', true)} onTouchEnd={handleTouch('ArrowDown', false)}>
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
//             </TouchButton>
//             <div />
//           </div>

//           {/* Premium Physical-Style Fire Button */}
//           <button 
//             onTouchStart={handleTouch('Space', true)} 
//             onTouchEnd={handleTouch('Space', false)} 
//             className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-red-500 to-rose-800 border-[3px] border-rose-400/50 shadow-[inset_0_4px_15px_rgba(255,255,255,0.4),0_10px_20px_rgba(0,0,0,0.5),0_0_30px_rgba(225,29,72,0.6)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_40px_rgba(225,29,72,0.9)] active:scale-90 active:translate-y-2 active:from-red-600 active:to-rose-900 transition-all duration-75 flex items-center justify-center group z-10"
//           >
//             {/* Inner Ring Detail */}
//             <div className="absolute inset-1.5 rounded-full border border-white/20 pointer-events-none"></div>
//             <span className="text-white font-black text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-active:scale-95 group-active:text-rose-200">FIRE</span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
