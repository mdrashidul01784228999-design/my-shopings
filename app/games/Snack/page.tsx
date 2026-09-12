'use client';

import React, { useState, useEffect, useCallback } from 'react';

// কোডের টাইপ সেফটি নিশ্চিত করার জন্য ইন্টারফেস
interface QuestionStructure {
  q: string;
  a: number;
}

const UltraNeonRunner = () => {
  const [coins, setCoins] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(100); // 100% progress
  const [question, setQuestion] = useState<QuestionStructure>({ q: '12 + 8', a: 20 });
  const [options, setOptions] = useState<number[]>([18, 20, 25]);
  const [gameState, setGameState] = useState<string>('playing'); // playing, correct, wrong

  // নতুন প্রশ্ন এবং অপশন জেনারেটর
  const generateNewTask = useCallback(() => {
    const complexity = level * 2;
    const num1 = Math.floor(Math.random() * (10 + complexity)) + 2;
    const num2 = Math.floor(Math.random() * (5 + complexity)) + 2;
    const operators = ['+', '-', '×'];
    const op = operators[Math.floor(Math.random() * (level > 2 ? 3 : 2))];

    let ans: number;
    if (op === '+') ans = num1 + num2;
    else if (op === '-') ans = num1 - num2;
    else ans = num1 * num2;

    const choices = [
      ans,
      ans + (Math.floor(Math.random() * 4) + 1),
      ans - (Math.floor(Math.random() * 4) + 1)
    ].sort(() => Math.random() - 0.5);

    setQuestion({ q: `${num1} ${op} ${num2}`, a: ans });
    setOptions(choices);
    setTimeLeft(100);
  }, [level]);

  // 🔥 FIX: handleAnswer ফাংশনটিকে useCallback দিয়ে সেফ করা হলো যাতে টাইমার লুপ না মারে
  const handleAnswer = useCallback((selected: number | null) => {
    if (selected === question.a) {
      const bonus = streak >= 3 ? 40 : 20;
      setCoins(prev => prev + bonus);
      setStreak(prev => prev + 1);
      setGameState('correct');
      // রেস কন্ডিশন এড়াতে স্টেট প্রাক-ভ্যালু দিয়ে লেভেল চেক
      setCoins(currentCoins => {
        if (currentCoins > level * 200) setLevel(l => l + 1);
        return currentCoins;
      });
    } else {
      setCoins(prev => Math.max(0, prev - 15));
      setStreak(0);
      setGameState('wrong');
    }

    setTimeout(() => {
      setGameState('playing');
      generateNewTask();
    }, 600);
  }, [question.a, streak, level, generateNewTask]);

  // টাইমার লজিক (handleAnswer ডিপেন্ডেন্সিসহ এখন পুরোপুরি স্ট্যাবল)
  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 2), 150);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && gameState === 'playing') {
      handleAnswer(null); // সময় শেষ হলে ভুল হিসেবে গণ্য হবে
    }
  }, [timeLeft, gameState, handleAnswer]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 overflow-hidden font-mono">
      
      {/* HUD: Level & Combo */}
      <div className="w-full max-w-lg flex justify-between mb-4 px-2">
        <div className="text-cyan-400 border-l-4 border-cyan-500 pl-2">
          LEVEL <span className="text-2xl font-black">{level}</span>
        </div>
        {streak >= 2 && (
          <div className="text-orange-500 animate-bounce font-bold tracking-tighter">
             COMBO X{streak} 🔥
          </div>
        )}
      </div>

      {/* Timer Bar */}
      <div className="w-full max-w-lg h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
        <div 
          className={`h-full transition-all duration-150 ${timeLeft < 30 ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-cyan-500 shadow-[0_0_15px_#00f2ff]'}`}
          style={{ width: `${timeLeft}%` }}
        ></div>
      </div>

      {/* Game Stage */}
      <div className={`relative w-full max-w-lg p-8 rounded-3xl border-2 transition-all duration-300 ${
        gameState === 'correct' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 
        gameState === 'wrong' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 
        'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
      } bg-black/40 backdrop-blur-md`}>
        
        {/* Score */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 px-6 py-1 rounded-full text-sm font-bold shadow-lg">
          COINS: {coins} 🪙
        </div>

        {/* Question Area */}
        <div className="text-center py-10">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {question.q}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={gameState !== 'playing'}
                className="py-5 px-4 bg-white/5 border border-white/10 rounded-2xl text-2xl font-bold hover:bg-white/10 active:scale-95 transition-all hover:border-cyan-400 hover:text-cyan-400 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 uppercase tracking-[0.4em] text-[10px]">Neural Interface v2.0</p>
        <p className="text-cyan-500 font-bold tracking-widest mt-1">MD RASHIDUL OFFICIAL</p>
      </div>
    </div>
  );
};

export default UltraNeonRunner;







// নিজের গ্যামে লাগবে 

// 'use client';

// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { PerspectiveCamera, Stars, Sky, ContactShadows } from '@react-three/drei';
// import { motion, AnimatePresence } from 'framer-motion';
// import * as THREE from 'three';

// const LANE_WIDTH = 3;
// const SPEED_INITIAL = 0.6;
// const SPAWN_INTERVAL = 0.7;

// type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

// export default function RootRunner3D() {
//   const [gameState, setGameState] = useState<GameState>('START');
//   const [score, setScore] = useState(0);
//   const [coins, setCoins] = useState(0);
//   const [lane, setLane] = useState(0);
//   const [isJumping, setIsJumping] = useState(false);

//   const coinRef = useRef(0);

//   useEffect(() => {
//     const saved = parseInt(localStorage.getItem('snake_coins') || '0');
//     coinRef.current = saved;
//     setCoins(saved);
//   }, []);

//   const move = useCallback((dir: 'L' | 'R' | 'J') => {
//     if (gameState !== 'PLAYING') return;
//     if (dir === 'L') setLane(p => Math.max(p - 1, -1));
//     if (dir === 'R') setLane(p => Math.min(p + 1, 1));
//     if (dir === 'J' && !isJumping) {
//       setIsJumping(true);
//       setTimeout(() => setIsJumping(false), 650);
//     }
//   }, [gameState, isJumping]);

//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowLeft') move('L');
//       if (e.key === 'ArrowRight') move('R');
//       if (e.key === 'ArrowUp' || e.key === ' ') move('J');
//     };
//     window.addEventListener('keydown', handleKey);
//     return () => window.removeEventListener('keydown', handleKey);
//   }, [move]);

//   const startGame = () => {
//     setGameState('PLAYING');
//     setScore(0);
//     setLane(0);
//   };

//   return (
//     <div className="w-full h-screen bg-[#050505] relative overflow-hidden font-sans select-none">
      
//       {/* HUD (Score & Coins) */}
//       <div className="absolute top-8 w-full flex justify-between px-10 z-20 text-white pointer-events-none">
//         <div className="text-xl font-bold tracking-tighter">COINS: <span className="text-yellow-400">{coins}</span></div>
//         <div className="text-xl font-bold tracking-tighter">SCORE: <span className="text-cyan-400">{score}</span></div>
//       </div>

//       <Canvas shadows dpr={[1, 2]}>
//         <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
//         <fog attach="fog" args={['#050505', 10, 50]} />
//         <Sky sunPosition={[100, 10, 100]} />
//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
//         <ambientLight intensity={0.4} />
//         <pointLight position={[10, 10, 10]} intensity={1} />
//         <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} castShadow />

//         <Player lane={lane} jumping={isJumping} />

//         <ObjectManager
//           gameState={gameState}
//           lane={lane}
//           jumping={isJumping}
//           onGameOver={() => setGameState('GAMEOVER')}
//           onCoin={() => {
//             coinRef.current += 1;
//             setCoins(coinRef.current);
//             localStorage.setItem('snake_coins', coinRef.current.toString());
//           }}
//           onScore={setScore}
//         />

//         <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
//           <planeGeometry args={[100, 100]} />
//           <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
//         </mesh>
//         <gridHelper args={[100, 50, 0x222222, 0x111111]} />
//         <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
//       </Canvas>

//       {/* --- MOBILE BUTTONS (Only visible on mobile) --- */}
//       {gameState === 'PLAYING' && (
//         <div className="absolute bottom-10 w-full flex justify-center items-end gap-6 px-6 md:hidden z-[100]">
//           <button 
//             onPointerDown={(e) => { e.preventDefault(); move('L'); }}
//             className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl active:scale-90 transition-transform"
//           >
//             ⬅️
//           </button>
          
//           <button 
//             onPointerDown={(e) => { e.preventDefault(); move('J'); }}
//             className="w-24 h-24 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 rounded-full flex items-center justify-center text-4xl active:scale-90 transition-transform mb-4"
//           >
//             🚀
//           </button>

//           <button 
//             onPointerDown={(e) => { e.preventDefault(); move('R'); }}
//             className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl active:scale-90 transition-transform"
//           >
//             ➡️
//           </button>
//         </div>
//       )}

//       {/* Start/GameOver Screen */}
//       <AnimatePresence>
//         {gameState !== 'PLAYING' && (
//           <motion.div
//             className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-[200]"
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           >
//             <motion.h1 className="text-6xl font-black italic mb-2 tracking-tighter">
//               {gameState === 'START' ? 'NEON RUN' : 'CRASHED'}
//             </motion.h1>
//             {gameState === 'GAMEOVER' && <p className="text-xl text-cyan-400 mb-8">SCORE: {score}</p>}
//             <button onClick={startGame} className="px-10 py-4 bg-white text-black font-bold text-xl rounded-full hover:bg-cyan-400 transition-colors">
//               {gameState === 'START' ? 'PLAY NOW' : 'RETRY'}
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // --- Player & Manager functions remained same as your logic ---
// function Player({ lane, jumping }: { lane: number; jumping: boolean }) {
//   const ref = useRef<THREE.Mesh>(null);
//   useFrame(() => {
//     if (!ref.current) return;
//     ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, lane * LANE_WIDTH, 0.15);
//     const targetY = jumping ? 3.5 : 0.8;
//     ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, jumping ? 0.1 : 0.2);
//     ref.current.rotation.x += 0.05;
//   });
//   return (
//     <mesh ref={ref} castShadow>
//       <sphereGeometry args={[0.7, 32, 32]} />
//       <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
//     </mesh>
//   );
// }

// function ObjectManager({ gameState, lane, jumping, onGameOver, onCoin, onScore }: any) {
//   const [items, setItems] = useState<any[]>([]);
//   const itemsRef = useRef<any[]>([]);
//   const speed = useRef(SPEED_INITIAL);
//   const timer = useRef(0);

//   useFrame((state, delta) => {
//     if (gameState !== 'PLAYING') {
//       speed.current = SPEED_INITIAL;
//       itemsRef.current = [];
//       return;
//     }
//     timer.current += delta;
//     itemsRef.current.forEach(item => {
//       item.z += speed.current;
//       if (item.z > -1 && item.z < 1 && item.lane === lane && !item.hit) {
//         if (item.type === 'coin') { item.hit = true; onCoin(); }
//         else if (!jumping) { item.hit = true; onGameOver(); }
//       }
//     });
//     if (timer.current > SPAWN_INTERVAL) {
//       itemsRef.current.push({ id: Math.random(), lane: Math.floor(Math.random() * 3) - 1, z: -60, type: Math.random() > 0.3 ? 'coin' : 'wall', hit: false });
//       timer.current = 0;
//       speed.current += 0.001;
//     }
//     itemsRef.current = itemsRef.current.filter(i => i.z < 10 && !i.hit);
//     setItems([...itemsRef.current]);
//     onScore(Math.floor(state.clock.elapsedTime * 15));
//   });

//   return (
//     <group>
//       {items.map(item => (
//         <mesh key={item.id} position={[item.lane * LANE_WIDTH, 0.8, item.z]} castShadow>
//           {item.type === 'coin' ? (
//             <cylinderGeometry args={[0.5, 0.5, 0.15, 16]} />
//           ) : (
//             <boxGeometry args={[2.5, 2.5, 1]} />
//           )}
//           <meshStandardMaterial color={item.type === 'coin' ? 'gold' : '#ff0044'} emissive={item.type === 'coin' ? 'orange' : '#ff0044'} />
//         </mesh>
//       ))}
//     </group>
//   );
// }


// 'use client';
// import { useEffect, useState, useCallback, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Stars, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';

// export default function UltimateSnake3D() {
//   const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
//   const [food, setFood] = useState({ x: 5, y: 5 });
//   const [dir, setDir] = useState({ x: 0, y: 0 });
//   const [score, setScore] = useState(0);
//   const [coins, setCoins] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [playsLeft, setPlaysLeft] = useState(6);
  
//   // লজিক ঠিক রাখার জন্য Ref ব্যবহার
//   const coinsRef = useRef(0);
//   const scoreRef = useRef(0);
//   const gridSize = 20;

//   // --- ১. ডাটা লোড (Coins & Plays) ---
//   useEffect(() => {
//     const savedCoins = parseInt(localStorage.getItem('snake_coins') || '0');
//     coinsRef.current = savedCoins;
//     setCoins(savedCoins);

//     const today = new Date().toISOString().slice(0, 10);
//     const lastPlayDay = localStorage.getItem('snake_last_play_day');
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');

//     if (lastPlayDay !== today) {
//       dailyPlays = 0;
//       localStorage.setItem('snake_last_play_day', today);
//       localStorage.setItem('snake_daily_plays', '0');
//     }
//     setPlaysLeft(6 - dailyPlays);
//   }, []);

//   // --- ২. মুভমেন্ট এবং কয়েন কাউন্টিং লজিক ---
//   const moveSnake = useCallback(() => {
//     if (gameOver || (dir.x === 0 && dir.y === 0)) return;

//     setSnake((prev) => {
//       const newHead = {
//         x: (prev[0].x + dir.x + gridSize) % gridSize,
//         y: (prev[0].y + dir.y + gridSize) % gridSize,
//       };

//       // নিজের শরীরে ধাক্কা খেলে গেম ওভার
//       if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
//         setGameOver(true);
//         return prev;
//       }

//       const newSnake = [newHead, ...prev];

//       // খাবার খেলে পয়েন্ট ও কয়েন কাউন্ট
//       if (newHead.x === food.x && newHead.y === food.y) {
//         scoreRef.current += 1;
//         coinsRef.current += 1;
        
//         setScore(scoreRef.current);
//         setCoins(coinsRef.current);
        
//         // লোকাল স্টোরেজে সেভ
//         localStorage.setItem('snake_coins', coinsRef.current.toString());

//         setFood({ 
//           x: Math.floor(Math.random() * gridSize), 
//           y: Math.floor(Math.random() * gridSize) 
//         });
//       } else {
//         newSnake.pop();
//       }
//       return newSnake;
//     });
//   }, [dir, food, gameOver]);

//   useEffect(() => {
//     const interval = setInterval(moveSnake, 150);
//     return () => clearInterval(interval);
//   }, [moveSnake]);

//   // --- ৩. পিসি কন্ট্রোল (Keyboard) ---
//   useEffect(() => {
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 });
//       if (e.key === 'ArrowDown' && dir.y !== -1) setDir({ x: 0, y: 1 });
//       if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({ x: -1, y: 0 });
//       if (e.key === 'ArrowRight' && dir.x !== -1) setDir({ x: 1, y: 0 });
//     };
//     window.addEventListener('keydown', handleKey);
//     return () => window.removeEventListener('keydown', handleKey);
//   }, [dir]);

//   // --- ৪. রিস্টার্ট লজিক ---
//   const restart = () => {
//     if (playsLeft <= 0) return alert('⚠️ সীমা শেষ!');
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');
//     localStorage.setItem('snake_daily_plays', (dailyPlays + 1).toString());
//     setPlaysLeft(5 - dailyPlays);

//     setSnake([{ x: 10, y: 10 }]);
//     setDir({ x: 0, y: 0 });
//     setScore(0);
//     scoreRef.current = 0;
//     setGameOver(false);
//   };

//   return (
//     <div className="relative w-full h-screen bg-[#020202] overflow-hidden flex flex-col items-center">
      
//       {/* HUD: পিসি ও মোবাইলে সুন্দর দেখাবে */}
//       <div className="absolute top-10 z-20 flex gap-4">
//         <div className="px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl text-center">
//           <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">Coins</p>
//           <p className="text-xl font-black text-white">{coins}</p>
//         </div>
//         <div className="px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl text-center">
//           <p className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Score</p>
//           <p className="text-xl font-black text-white">{score}</p>
//         </div>
//       </div>

//       {/* ৩ডি গেম ক্যানভাস */}
//       <Canvas shadows>
//         <PerspectiveCamera makeDefault position={[0, 15, 22]} fov={45} />
//         <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.3} />
//         <Stars radius={100} depth={50} count={5000} factor={4} fade />
        
//         <ambientLight intensity={0.4} />
//         <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />

//         {/* ৩ডি স্নেক */}
//         {snake.map((seg, i) => (
//           <mesh key={i} position={[seg.x - 10, 0.5, seg.y - 10]} castShadow>
//             <boxGeometry args={[0.92, 0.92, 0.92]} />
//             <meshStandardMaterial 
//                 color={i === 0 ? "#00FFCC" : "#006655"} 
//                 emissive={i === 0 ? "#00FFCC" : "#000000"} 
//                 emissiveIntensity={0.5} 
//             />
//           </mesh>
//         ))}

//         {/* ৩ডি ফুড */}
//         <Float speed={5} rotationIntensity={2} floatIntensity={1}>
//           <mesh position={[food.x - 10, 0.6, food.y - 10]}>
//             <sphereGeometry args={[0.6, 32, 32]} />
//             <MeshDistortMaterial color="#FF3366" speed={4} distort={0.4} emissive="#FF3366" emissiveIntensity={0.5} />
//           </mesh>
//         </Float>

//         <gridHelper args={[20, 20, 0x222222, 0x111111]} />
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
//           <planeGeometry args={[22, 22]} />
//           <meshStandardMaterial color="#050505" />
//         </mesh>
//       </Canvas>

//       {/* মোবাইল কন্ট্রোল: শুধুমাত্র মোবাইলে দেখাবে */}
//       <div className="absolute bottom-10 grid grid-cols-3 gap-4 md:hidden z-30">
//         <div />
//         <button onPointerDown={() => dir.y !== 1 && setDir({ x: 0, y: -1 })} className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-lg active:bg-cyan-500">⬆️</button>
//         <div />
//         <button onPointerDown={() => dir.x !== 1 && setDir({ x: -1, y: 0 })} className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-lg active:bg-cyan-500">⬅️</button>
//         <button onPointerDown={() => dir.y !== -1 && setDir({ x: 0, y: 1 })} className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-lg active:bg-cyan-500">⬇️</button>
//         <button onPointerDown={() => dir.x !== -1 && setDir({ x: 1, y: 0 })} className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-lg active:bg-cyan-500">➡️</button>
//       </div>

//       {/* গেম ওভার স্ক্রিন */}
//       <AnimatePresence>
//         {gameOver && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
//             <h2 className="text-6xl font-black text-red-600 mb-2 italic">CRASHED!</h2>
//             <p className="text-white/50 mb-8">Score: {score} | Coins: {coins}</p>
//             <button onClick={restart} className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-green-500 hover:text-white transition-all transform hover:scale-110">
//               PLAY AGAIN ({playsLeft} left)
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { motion } from 'framer-motion';

// export default function SnakeGame() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [canvasSize, setCanvasSize] = useState(400);
//   const scale = 20;
//   const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
//   const [food, setFood] = useState({ x: 5, y: 5 });
//   const [dir, setDir] = useState({ x: 0, y: 0 });
//   const [score, setScore] = useState(0);
//   const [coins, setCoins] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [speed, setSpeed] = useState(250);
//   const [playsLeft, setPlaysLeft] = useState(6);

//   const rows = Math.floor(canvasSize / scale);
//   const cols = Math.floor(canvasSize / scale);

//   // --- Responsive Canvas ---
//   useEffect(() => {
//     const updateSize = () => {
//       const width = Math.min(window.innerWidth * 0.9, 400);
//       setCanvasSize(width);
//     };
//     updateSize();
//     window.addEventListener('resize', updateSize);
//     return () => window.removeEventListener('resize', updateSize);
//   }, []);

//   // --- Daily Limit Logic ---
//   useEffect(() => {
//     const today = new Date().toISOString().slice(0, 10);
//     const lastPlayDay = localStorage.getItem('snake_last_play_day');
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');

//     if (lastPlayDay !== today) {
//       dailyPlays = 0;
//       localStorage.setItem('snake_last_play_day', today);
//       localStorage.setItem('snake_daily_plays', '0');
//     }
//     setPlaysLeft(6 - dailyPlays);
//   }, []);

//   const incrementDailyPlays = () => {
//     const today = new Date().toISOString().slice(0, 10);
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');
//     dailyPlays += 1;
//     localStorage.setItem('snake_last_play_day', today);
//     localStorage.setItem('snake_daily_plays', dailyPlays.toString());
//     setPlaysLeft(6 - dailyPlays);
//   };

//   // --- Snake Movement ---
//   const moveSnake = () => {
//     const newHead = {
//       x: (snake[0].x + dir.x + cols) % cols,
//       y: (snake[0].y + dir.y + rows) % rows,
//     };

//     if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
//       setGameOver(true);
//       return;
//     }

//     const newSnake = [newHead, ...snake];
//     if (newHead.x === food.x && newHead.y === food.y) {
//       setScore(score + 1);
//       const newCoins = coins + 1;
//       setCoins(newCoins);
//       localStorage.setItem('snake_coins', newCoins.toString());
//       setFood({ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) });
//     } else {
//       newSnake.pop();
//     }
//     setSnake(newSnake);
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!gameOver && (dir.x !== 0 || dir.y !== 0)) moveSnake();
//     }, speed);
//     return () => clearInterval(interval);
//   }, [dir, snake, gameOver, speed]);

//   // --- Draw Canvas ---
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvasSize, canvasSize);
//     ctx.fillStyle = 'red';
//     ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
//     ctx.fillStyle = 'lime';
//     snake.forEach(seg => ctx.fillRect(seg.x * scale, seg.y * scale, scale, scale));
//   }, [snake, food, canvasSize]);

//   // --- Keyboard Control ---
//   const handleKey = (e: KeyboardEvent) => {
//     switch (e.key) {
//       case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
//       case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
//       case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
//       case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
//     }
//   };
//   useEffect(() => { window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [dir]);

//   // --- Touch Control ---
//   useEffect(() => {
//     let startX = 0, startY = 0;
//     const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
//     const handleTouchEnd = (e: TouchEvent) => {
//       const dx = e.changedTouches[0].clientX - startX;
//       const dy = e.changedTouches[0].clientY - startY;
//       if (Math.abs(dx) > Math.abs(dy)) {
//         if (dx > 0 && dir.x !== -1) setDir({ x: 1, y: 0 });
//         else if (dx < 0 && dir.x !== 1) setDir({ x: -1, y: 0 });
//       } else {
//         if (dy > 0 && dir.y !== -1) setDir({ x: 0, y: 1 });
//         else if (dy < 0 && dir.y !== 1) setDir({ x: 0, y: -1 });
//       }
//     };
//     window.addEventListener('touchstart', handleTouchStart);
//     window.addEventListener('touchend', handleTouchEnd);
//     return () => { window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd); };
//   }, [dir]);

//   // --- Restart ---
//   const restart = () => {
//     if (playsLeft <= 0) return alert('⚠️ আজকের খেলার সীমা শেষ!');
//     incrementDailyPlays();
//     setSnake([{ x: 10, y: 10 }]);
//     setFood({ x: 5, y: 5 });
//     setDir({ x: 0, y: 0 });
//     setScore(0);
//     setGameOver(false);
//   };

//   useEffect(() => {
//     const savedCoins = parseInt(localStorage.getItem('snake_coins') || '0');
//     setCoins(savedCoins);
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
//       <motion.h1 className="text-3xl font-bold mb-4 text-green-400 drop-shadow-lg" initial={{ y: -20 }} animate={{ y: 0 }}>
//         🐍 Snake Game
//       </motion.h1>

//       <div className="flex gap-3 mb-4 flex-wrap justify-center">
//         <div className="px-4 py-2 bg-yellow-500 rounded-xl shadow-lg">Coins: {coins}</div>
//         <div className="px-4 py-2 bg-blue-600 rounded-xl shadow-lg">Plays left: {playsLeft}</div>
//       </div>

//       <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="bg-black border-4 border-green-400 rounded-lg shadow-xl shadow-green-500/30" />

//       <div className="mt-4 text-xl">Score: {score}</div>

//       {gameOver && (
//         <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <div className="text-red-400 text-2xl font-bold">Game Over</div>
//           <button
//             onClick={restart}
//             className="mt-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold 
//                        shadow-lg shadow-green-700/40 transform active:translate-y-1 active:shadow-inner transition-all">
//             🔄 Restart
//           </button>
//         </motion.div>
//       )}

//       {/* Mobile Gradient Neon D-pad */}
//       <div className="grid grid-cols-3 gap-3 mt-6 md:hidden w-full max-w-xs mx-auto">
//         <button onClick={() => dir.y !== 1 && setDir({ x: 0, y: -1 })} className="col-span-3 py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#0ff,0_0_40px_#0ff] animate-gradientNeon transition-all active:translate-y-1">⬆️</button>
//         <button onClick={() => dir.x !== 1 && setDir({ x: -1, y: 0 })} className="py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#f0f,0_0_40px_#f0f] animate-gradientNeon transition-all active:translate-y-1">⬅️</button>
//         <div></div>
//         <button onClick={() => dir.x !== -1 && setDir({ x: 1, y: 0 })} className="py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#ff0,0_0_40px_#ff0] animate-gradientNeon transition-all active:translate-y-1">➡️</button>
//         <button onClick={() => dir.y !== -1 && setDir({ x: 0, y: 1 })} className="col-span-3 py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#0f0,0_0_40px_#0f0] animate-gradientNeon transition-all active:translate-y-1">⬇️</button>
//       </div>


//     </div>
//   );
// }



//       <style jsx global>{`
//         @keyframes gradientNeon {
//           0%,100% { box-shadow: 0 0 15px #0ff,0 0 30px #0ff; }
//           25% { box-shadow: 0 0 20px #f0f,0 0 40px #f0f; }
//           50% { box-shadow: 0 0 25px #ff0,0 0 50px #ff0; }
//           75% { box-shadow: 0 0 20px #0f0,0 0 40px #0f0; }
//         }
//         .animate-gradientNeon { animation: gradientNeon 2s ease-in-out infinite; }
//       `}</style>


// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { motion } from 'framer-motion';

// export default function SnakeGame() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [canvasSize, setCanvasSize] = useState(400);
//   const scale = 20;
//   const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
//   const [food, setFood] = useState({ x: 5, y: 5 });
//   const [dir, setDir] = useState({ x: 0, y: 0 });
//   const [score, setScore] = useState(0);
//   const [coins, setCoins] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [speed, setSpeed] = useState(250);
//   const [playsLeft, setPlaysLeft] = useState(6);

//   const rows = Math.floor(canvasSize / scale);
//   const cols = Math.floor(canvasSize / scale);

//   // --- Responsive Canvas ---
//   useEffect(() => {
//     const updateSize = () => {
//       const width = Math.min(window.innerWidth * 0.9, 400);
//       setCanvasSize(width);
//     };
//     updateSize();
//     window.addEventListener('resize', updateSize);
//     return () => window.removeEventListener('resize', updateSize);
//   }, []);

//   // --- Daily Limit Logic ---
//   useEffect(() => {
//     const today = new Date().toISOString().slice(0, 10);
//     const lastPlayDay = localStorage.getItem('snake_last_play_day');
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');

//     if (lastPlayDay !== today) {
//       dailyPlays = 0;
//       localStorage.setItem('snake_last_play_day', today);
//       localStorage.setItem('snake_daily_plays', '0');
//     }
//     setPlaysLeft(6 - dailyPlays);
//   }, []);

//   const incrementDailyPlays = () => {
//     const today = new Date().toISOString().slice(0, 10);
//     let dailyPlays = parseInt(localStorage.getItem('snake_daily_plays') || '0');
//     dailyPlays += 1;
//     localStorage.setItem('snake_last_play_day', today);
//     localStorage.setItem('snake_daily_plays', dailyPlays.toString());
//     setPlaysLeft(6 - dailyPlays);
//   };

//   // --- Snake Movement ---
//   const moveSnake = () => {
//     const newHead = {
//       x: (snake[0].x + dir.x + cols) % cols,
//       y: (snake[0].y + dir.y + rows) % rows,
//     };

//     if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
//       setGameOver(true);
//       return;
//     }

//     const newSnake = [newHead, ...snake];
//     if (newHead.x === food.x && newHead.y === food.y) {
//       setScore(score + 1);
//       const newCoins = coins + 1;
//       setCoins(newCoins);
//       localStorage.setItem('snake_coins', newCoins.toString());
//       setFood({ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) });
//     } else {
//       newSnake.pop();
//     }
//     setSnake(newSnake);
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!gameOver && (dir.x !== 0 || dir.y !== 0)) moveSnake();
//     }, speed);
//     return () => clearInterval(interval);
//   }, [dir, snake, gameOver, speed]);

//   // --- Draw Canvas ---
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvasSize, canvasSize);
//     ctx.fillStyle = 'red';
//     ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
//     ctx.fillStyle = 'lime';
//     snake.forEach(seg => ctx.fillRect(seg.x * scale, seg.y * scale, scale, scale));
//   }, [snake, food, canvasSize]);

//   // --- Keyboard Control ---
//   const handleKey = (e: KeyboardEvent) => {
//     switch (e.key) {
//       case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
//       case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
//       case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
//       case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
//     }
//   };
//   useEffect(() => { window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [dir]);

//   // --- Touch Control ---
//   useEffect(() => {
//     let startX = 0, startY = 0;
//     const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
//     const handleTouchEnd = (e: TouchEvent) => {
//       const dx = e.changedTouches[0].clientX - startX;
//       const dy = e.changedTouches[0].clientY - startY;
//       if (Math.abs(dx) > Math.abs(dy)) {
//         if (dx > 0 && dir.x !== -1) setDir({ x: 1, y: 0 });
//         else if (dx < 0 && dir.x !== 1) setDir({ x: -1, y: 0 });
//       } else {
//         if (dy > 0 && dir.y !== -1) setDir({ x: 0, y: 1 });
//         else if (dy < 0 && dir.y !== 1) setDir({ x: 0, y: -1 });
//       }
//     };
//     window.addEventListener('touchstart', handleTouchStart);
//     window.addEventListener('touchend', handleTouchEnd);
//     return () => { window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd); };
//   }, [dir]);

//   // --- Restart ---
//   const restart = () => {
//     if (playsLeft <= 0) return alert('⚠️ আজকের খেলার সীমা শেষ!');
//     incrementDailyPlays();
//     setSnake([{ x: 10, y: 10 }]);
//     setFood({ x: 5, y: 5 });
//     setDir({ x: 0, y: 0 });
//     setScore(0);
//     setGameOver(false);
//   };

//   useEffect(() => {
//     const savedCoins = parseInt(localStorage.getItem('snake_coins') || '0');
//     setCoins(savedCoins);
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
//       <motion.h1 className="text-3xl font-bold mb-4 text-green-400 drop-shadow-lg" initial={{ y: -20 }} animate={{ y: 0 }}>
//         🐍 Snake Game
//       </motion.h1>

//       <div className="flex gap-3 mb-4 flex-wrap justify-center">
//         <div className="px-4 py-2 bg-yellow-500 rounded-xl shadow-lg">Coins: {coins}</div>
//         <div className="px-4 py-2 bg-blue-600 rounded-xl shadow-lg">Plays left: {playsLeft}</div>
//       </div>

//       <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="bg-black border-4 border-green-400 rounded-lg shadow-xl shadow-green-500/30" />

//       <div className="mt-4 text-xl">Score: {score}</div>

//       {gameOver && (
//         <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <div className="text-red-400 text-2xl font-bold">Game Over</div>
//           <button
//             onClick={restart}
//             className="mt-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold 
//                        shadow-lg shadow-green-700/40 transform active:translate-y-1 active:shadow-inner transition-all">
//             🔄 Restart
//           </button>
//         </motion.div>
//       )}

//       {/* Mobile Gradient Neon D-pad */}
//       <div className="grid grid-cols-3 gap-3 mt-6 md:hidden w-full max-w-xs mx-auto">
//         <button onClick={() => dir.y !== 1 && setDir({ x: 0, y: -1 })} className="col-span-3 py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#0ff,0_0_40px_#0ff] animate-gradientNeon transition-all active:translate-y-1">⬆️</button>
//         <button onClick={() => dir.x !== 1 && setDir({ x: -1, y: 0 })} className="py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#f0f,0_0_40px_#f0f] animate-gradientNeon transition-all active:translate-y-1">⬅️</button>
//         <div></div>
//         <button onClick={() => dir.x !== -1 && setDir({ x: 1, y: 0 })} className="py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#ff0,0_0_40px_#ff0] animate-gradientNeon transition-all active:translate-y-1">➡️</button>
//         <button onClick={() => dir.y !== -1 && setDir({ x: 0, y: 1 })} className="col-span-3 py-4 rounded-full text-white text-2xl font-bold bg-gray-900 shadow-[0_0_20px_#0f0,0_0_40px_#0f0] animate-gradientNeon transition-all active:translate-y-1">⬇️</button>
//       </div>


//     </div>
//   );
// }



//       <style jsx global>{`
//         @keyframes gradientNeon {
//           0%,100% { box-shadow: 0 0 15px #0ff,0 0 30px #0ff; }
//           25% { box-shadow: 0 0 20px #f0f,0 0 40px #f0f; }
//           50% { box-shadow: 0 0 25px #ff0,0 0 50px #ff0; }
//           75% { box-shadow: 0 0 20px #0f0,0 0 40px #0f0; }
//         }
//         .animate-gradientNeon { animation: gradientNeon 2s ease-in-out infinite; }
//       `}</style>

// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { motion } from 'framer-motion';

// const canvasSize = 400;
// const scale = 20;
// const rows = canvasSize / scale;
// const cols = canvasSize / scale;

// export default function SnakeGame() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
//   const [food, setFood] = useState({ x: 5, y: 5 });
//   const [dir, setDir] = useState({ x: 0, y: 0 });
//   const [score, setScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [speed, setSpeed] = useState(200); // default easy

//   const moveSnake = () => {
//     const newHead = {
//       x: (snake[0].x + dir.x + cols) % cols,
//       y: (snake[0].y + dir.y + rows) % rows,
//     };
//     if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
//       setGameOver(true);
//       return;
//     }
//     const newSnake = [newHead, ...snake];
//     if (newHead.x === food.x && newHead.y === food.y) {
//       setScore(score + 1);
//       setFood({ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) });
//     } else {
//       newSnake.pop();
//     }
//     setSnake(newSnake);
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!gameOver && (dir.x !== 0 || dir.y !== 0)) moveSnake();
//     }, speed);
//     return () => clearInterval(interval);
//   }, [dir, snake, gameOver, speed]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvasSize, canvasSize);
//     ctx.fillStyle = 'red';
//     ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
//     ctx.fillStyle = 'lime';
//     snake.forEach(seg => ctx.fillRect(seg.x * scale, seg.y * scale, scale, scale));
//   }, [snake, food]);

//   const handleKey = (e: KeyboardEvent) => {
//     switch (e.key) {
//       case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
//       case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
//       case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
//       case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
//     }
//   };
//   useEffect(() => { window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [dir]);

//   useEffect(() => {
//     let startX = 0, startY = 0;
//     const handleTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
//     const handleTouchEnd = (e: TouchEvent) => {
//       const dx = e.changedTouches[0].clientX - startX;
//       const dy = e.changedTouches[0].clientY - startY;
//       if (Math.abs(dx) > Math.abs(dy)) {
//         if (dx > 0 && dir.x !== -1) setDir({ x: 1, y: 0 });
//         else if (dx < 0 && dir.x !== 1) setDir({ x: -1, y: 0 });
//       } else {
//         if (dy > 0 && dir.y !== -1) setDir({ x: 0, y: 1 });
//         else if (dy < 0 && dir.y !== 1) setDir({ x: 0, y: -1 });
//       }
//     };
//     window.addEventListener('touchstart', handleTouchStart);
//     window.addEventListener('touchend', handleTouchEnd);
//     return () => { window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd); };
//   }, [dir]);

//   const restart = () => { setSnake([{ x: 10, y: 10 }]); setFood({ x: 5, y: 5 }); setDir({ x: 0, y: 0 }); setScore(0); setGameOver(false); };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
//       <motion.h1 className="text-3xl font-bold mb-4 text-green-400 drop-shadow-lg" initial={{ y: -20 }} animate={{ y: 0 }}>
//         🐍 Snake Game
//       </motion.h1>

//       <div className="flex gap-3 mb-4">
//         <button onClick={() => setSpeed(200)} className="px-4 py-2 bg-blue-600 rounded-xl shadow-lg transform active:translate-y-1 active:shadow-inner transition-all">
//           Easy
//         </button>
//         <button onClick={() => setSpeed(120)} className="px-4 py-2 bg-yellow-500 rounded-xl shadow-lg transform active:translate-y-1 active:shadow-inner transition-all">
//           Medium
//         </button>
//         <button onClick={() => setSpeed(80)} className="px-4 py-2 bg-red-600 rounded-xl shadow-lg transform active:translate-y-1 active:shadow-inner transition-all">
//           Hard
//         </button>
//       </div>

//       <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="bg-black border-4 border-green-400 rounded-lg shadow-xl shadow-green-500/30" />

//       <div className="mt-4 text-xl">Score: {score}</div>

//       {gameOver && (
//         <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <div className="text-red-400 text-2xl font-bold">Game Over</div>
//           <button
//             onClick={restart}
//             className="mt-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold 
//                        shadow-lg shadow-green-700/40 transform active:translate-y-1 active:shadow-inner transition-all">
//             🔄 Restart
//           </button>
//         </motion.div>
//       )}

//       {/* Mobile D-pad with 3D effect */}
//       <div className="grid grid-cols-3 gap-3 mt-6 md:hidden">
//         <button
//           onClick={() => dir.y !== 1 && setDir({ x: 0, y: -1 })}
//           className="col-span-3 py-3 bg-gray-800 rounded-xl shadow-md shadow-gray-700 active:translate-y-1 active:shadow-inner transition-all">
//           ⬆️
//         </button>
//         <button
//           onClick={() => dir.x !== 1 && setDir({ x: -1, y: 0 })}
//           className="py-3 bg-gray-800 rounded-xl shadow-md shadow-gray-700 active:translate-y-1 active:shadow-inner transition-all">
//           ⬅️
//         </button>
//         <div></div>
//         <button
//           onClick={() => dir.x !== -1 && setDir({ x: 1, y: 0 })}
//           className="py-3 bg-gray-800 rounded-xl shadow-md shadow-gray-700 active:translate-y-1 active:shadow-inner transition-all">
//           ➡️
//         </button>
//         <button
//           onClick={() => dir.y !== -1 && setDir({ x: 0, y: 1 })}
//           className="col-span-3 py-3 bg-gray-800 rounded-xl shadow-md shadow-gray-700 active:translate-y-1 active:shadow-inner transition-all">
//           ⬇️
//         </button>
//       </div>
//     </div>
//   );
// }





