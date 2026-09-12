"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
// ✅ ফিক্সড: <Center> বড় হাতের অক্ষরে ইম্পোর্ট এবং ব্যবহারে সিঙ্ক করা হয়েছে
import { Center, Text } from "@react-three/drei";
import { Heart, Coins, Trophy, RefreshCw, ArrowLeft, ArrowRight, Zap } from "lucide-react";
import * as THREE from "three";


import confetti from "canvas-confetti";

// --- TYPES & INTERFACES ---
interface GameItem {
  id: number;
  z: number;
  lane: number; 
  type: "coin" | "number";
  value?: number;
  hit?: boolean;
}

// --- UPGRADED 3D COMPONENTS ---

// প্রিমিয়াম গ্লোয়িং কয়েন
function Coin3D({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 4; 
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.35, 0.35, 0.08, 32]} />
      <meshStandardMaterial 
        color="#fbbf24" 
        metalness={0.9} 
        roughness={0.1} 
        emissive="#d97706" 
        emissiveIntensity={0.4} 
      />
    </mesh>
  );
}

// নিয়ন স্টাইল নাম্বার ব্লক
function NumberBlock3D({ position, value, isTarget }: { position: [number, number, number]; value: number; isTarget: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial 
          color={isTarget ? "#10b981" : "#3b82f6"} 
          metalness={0.4} 
          roughness={0.3}
          emissive={isTarget ? "#059669" : "#1d4ed8"}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* গ্লোয়িং বর্ডার ইফেক্ট */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.22, 1.22, 1.22]} />
        <meshStandardMaterial color={isTarget ? "#34d399" : "#60a5fa"} wireframe />
      </mesh>
      {/* ✅ ফিক্সড: ছোট হাতের <center> পরিবর্তন করে সঠিক Drei Component <Center> ব্যবহার করা হয়েছে */}
      <Center position={[0, 0, 0.62]}>
        <Text fontSize={0.65} color="white" anchorX="center" anchorY="middle">
          {value.toString()}
        </Text>
      </Center>
    </group>
  );
}

// আপগ্রেডেড প্লেয়ার বল (উইথ জাম্প অ্যান্ড ট্রেইল ইফেক্ট)
function PlayerBall({ lane, isJumping }: { lane: number; isJumping: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetX = lane * 2; 
  const targetY = isJumping ? 2.3 : 0.5; // স্পেসবার টিপলে ২.৩ ইউনিটে লাফাবে

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 14);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 12);
      meshRef.current.rotation.x -= delta * (isJumping ? 4 : 10);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 5]} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color="#ef4444" 
        roughness={0.1} 
        metalness={0.6} 
        emissive="#b91c1c" 
        emissiveIntensity={0.3} 
      />
    </mesh>
  );
}

// সাইবারপাঙ্ক গ্রিড ট্র্যাক
function Track() {
  return (
    <group>
      {/* মেইন পিচ রোড */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -20]} receiveShadow>
        <planeGeometry args={[6.5, 80]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      {/* নিয়ন লেনের বর্ডার */}
      {[-3.25, -1.0, 1.0, 3.25].map((xPos, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0, -20]}>
          <planeGeometry args={[0.05, 80]} />
          <meshStandardMaterial 
            color={idx === 0 || idx === 3 ? "#ec4899" : "#38bdf8"} 
            emissive={idx === 0 || idx === 3 ? "#db2777" : "#0284c7"} 
            emissiveIntensity={0.8} 
          />
        </mesh>
      ))}
    </group>
  );
}

// --- MAIN UPGRADED COMPONENT ---
export default function NewStyle3DGame() {
  // গেম স্টেটসমূহ
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3); 
  const [level, setLevel] = useState<number>(1);
  const [targetNumber, setTargetNumber] = useState<number>(5); 
  const [playerLane, setPlayerLane] = useState<number>(0); 
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [items, setItems] = useState<GameItem[]>([]);
  
  // কাস্টম রেফারেন্স সমূহ (পারফরম্যান্স বুস্টের জন্য)
  const playerLaneRef = useRef(playerLane);
  const targetNumberRef = useRef(targetNumber);
  const gameOverRef = useRef(gameOver);
  const isJumpingRef = useRef(isJumping);

  // লেভেল অনুযায়ী স্পিড ক্যালকুলেশন
  const currentSpeed = 15 + level * 2; 

  useEffect(() => { playerLaneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { targetNumberRef.current = targetNumber; }, [targetNumber]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);

  // স্কোর বাড়ার সাথে সাথে লেভেল আপ মেকানিক্স
  useEffect(() => {
    const nextLevel = Math.floor(score / 60) + 1;
    if (nextLevel > level) {
      setLevel(nextLevel);
    }
  }, [score, level]);

  const generateNewTarget = () => Math.floor(Math.random() * 9) + 1;

  const resetGame = () => {
    setScore(0);
    setCoins(0);
    setLives(3);
    setLevel(1);
    setPlayerLane(0);
    setIsJumping(false);
    setItems([]);
    setGameOver(false);
    setTargetNumber(generateNewTarget());
  };

  // অবজেক্ট মেকানিক্স এবং কলিশন ডিটেকশন লুপ
  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      if (gameOverRef.current) return;
      
      const lane = Math.floor(Math.random() * 3) - 1; 
      const isCoin = Math.random() > 0.4; 
      
      const newItem: GameItem = {
        id: Date.now() + Math.random(),
        z: -40, 
        lane,
        type: isCoin ? "coin" : "number",
        value: isCoin ? undefined : Math.floor(Math.random() * 9) + 1,
        hit: false,
      };

      setItems((prev) => [...prev, newItem]);
    }, Math.max(900 - level * 50, 500)); 

    let lastTime = performance.now();
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      if (gameOverRef.current) return;

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          const nextZ = item.z + currentSpeed * delta;
          
          if (!item.hit && nextZ >= 4.4 && nextZ <= 5.4 && item.lane === playerLaneRef.current) {
            
            if (isJumpingRef.current) {
              if (item.type === "coin" && nextZ >= 4.7) {
                item.hit = true;
                setCoins((c) => c + 1);
                setScore((s) => s + 10);
              }
            } else {
              item.hit = true;
              if (item.type === "coin") {
                setCoins((c) => c + 1);
                setScore((s) => s + 10);
              } else if (item.type === "number") {
                if (item.value === targetNumberRef.current) {
                  setScore((s) => s + 50);
                  confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });
                  setTargetNumber(generateNewTarget()); 
                } else {
                  setLives((l) => {
                    const remLives = l - 1;
                    if (remLives <= 0) setGameOver(true);
                    return remLives;
                  });
                }
              }
            }
          }
          return { ...item, z: nextZ };
        });

        return updatedItems.filter((item) => item.z < 8 && !item.hit);
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, level, currentSpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOverRef.current) {
        if (e.key === " ") resetGame();
        return;
      }
      
      if (e.key === "ArrowLeft" && playerLaneRef.current > -1) {
        setPlayerLane((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && playerLaneRef.current < 1) {
        setPlayerLane((prev) => prev + 1);
      } else if (e.key === " " && !isJumpingRef.current) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 600); 
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col justify-between items-center font-sans select-none overflow-hidden text-white">
      
      {/* --- TOP HUD SYSTEM --- */}
      <div className="w-full max-w-5xl p-4 grid grid-cols-3 gap-4 items-center z-10 bg-slate-900/75 backdrop-blur-xl rounded-b-2xl border-b border-slate-800/80 shadow-2xl m-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 transition-all duration-300 ${i < lives ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "text-slate-800 scale-90"}`}
            />
          ))}
          <div className="ml-3 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold text-indigo-400 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-indigo-400" /> LVL {level}
          </div>
        </div>

        <div className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/40 rounded-2xl py-1 px-6 shadow-lg shadow-emerald-500/5">
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold">TARGET TARGET</span>
          <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse">{targetNumber}</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-lg drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
            <Coins className="w-5 h-5 fill-amber-400" />
            <span>{coins}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-slate-500" />
            <span>SCORE: <strong className="text-white font-mono">{score}</strong></span>
          </div>
        </div>
      </div>

      {/* --- 3D INTERACTIVE CANVAS --- */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 4.2, 8.8], fov: 55 }} shadows>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 12, -2]} intensity={0.8} />
          <fog attach="fog" args={["#020617", 15, 45]} />
          
          <Track />
          <PlayerBall lane={playerLane} isJumping={isJumping} />

          {/* স্পনিং আইটেমস */}
          {items.map((item) => {
            const position: [number, number, number] = [item.lane * 2, item.type === "coin" ? 0.55 : 0.6, item.z];
            if (item.type === "coin") {
              return <Coin3D key={item.id} position={position} />;
            } else {
              return (
                <NumberBlock3D 
                  key={item.id} 
                  position={position} 
                  value={item.value || 0} 
                  isTarget={item.value === targetNumber} 
                />
              );
            }
          })}
        </Canvas>
      </div>

      {/* --- CONTROLS GUIDE PANEL --- */}
      <div className="w-full max-w-sm px-6 pb-6 grid grid-cols-3 gap-3 z-10 md:hidden">
        <button
          onClick={() => playerLaneRef.current > -1 && setPlayerLane((p) => p - 1)}
          className="bg-slate-900/80 border border-slate-800 h-14 rounded-xl flex items-center justify-center active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={() => !isJumpingRef.current && (setIsJumping(true), setTimeout(() => setIsJumping(false), 600))}
          className="bg-indigo-600 active:bg-indigo-500 text-xs font-bold uppercase rounded-xl flex items-center justify-center active:scale-95"
        >
          Jump
        </button>
        <button
          onClick={() => playerLaneRef.current < 1 && setPlayerLane((p) => p + 1)}
          className="bg-slate-900/80 border border-slate-800 h-14 rounded-xl flex items-center justify-center active:scale-95"
        >
          <ArrowRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="hidden md:block text-slate-500 text-[10px] mb-4 z-10 font-bold uppercase tracking-widest bg-slate-900/40 px-4 py-1.5 rounded-full border border-slate-800/50">
        ◀ / ▶ to move lane • <span className="text-indigo-400 font-mono">SPACEBAR</span> to jump over wrong numbers
      </div>

      {/* --- HIGH-TECH GAME OVER MODAL --- */}
      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center z-50 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl mx-4">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-red-500 fill-red-500/20" />
            </div>
            <h2 className="text-3xl font-black text-red-500 tracking-tight uppercase">MISSION FAILED</h2>
            <p className="text-slate-400 text-xs mt-1 mb-5">You exceeded the limit at Level {level}.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-left">
                <span className="text-slate-500 text-[10px] font-bold block uppercase">Final Score</span>
                <span className="text-xl font-black text-white">{score}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-left">
                <span className="text-slate-500 text-[10px] font-bold block uppercase">Coins Hit</span>
                <span className="text-xl font-black text-amber-400">{coins}</span>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>LAUNCH AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Center, Text } from "@react-three/drei";
// import { Heart, Coins, Trophy, RefreshCw, MoveLeft, MoveRight } from "lucide-react";
// import * as THREE from "three";
// import confetti from "canvas-confetti";

// // --- TYPES & INTERFACES ---
// interface GameItem {
//   id: number;
//   z: number;
//   lane: number; // -1 = Left, 0 = Center, 1 = Right
//   type: "coin" | "number";
//   value?: number;
//   hit?: boolean;
// }

// // --- 3D COMPONENTS ---

// // ৩ডি কয়েন কম্পোনেন্ট
// function Coin3D({ position }: { position: [number, number, number] }) {
//   const meshRef = useRef<THREE.Mesh>(null);
  
//   useFrame((state, delta) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y += delta * 3; // কয়েন স্পিন করবে
//     }
//   });

//   return (
//     <mesh ref={meshRef} position={position}>
//       <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
//       <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.2} emissive="#b45309" emissiveIntensity={0.2} />
//     </mesh>
//   );
// }

// // ৩ডি নাম্বার ব্লক কম্পোনেন্ট
// function NumberBlock3D({ position, value }: { position: [number, number, number]; value: number }) {
//   return (
//     <group position={position}>
//       <mesh>
//         <boxGeometry args={[1.1, 1.1, 1.1]} />
//         <meshStandardMaterial color="#3b82f6" metalness={0.2} roughness={0.4} />
//       </mesh>
//       <Center position={[0, 0, 0.56]}>
//         <Text fontSize={0.6} color="white" anchorX="center" anchorY="middle">
//           {value.toString()}
//         </Text>
//       </Center>
//     </group>
//   );
// }

// // ৩ডি প্লেয়ার বল কম্পোনেন্ট
// function PlayerBall({ lane }: { lane: number }) {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const targetX = lane * 2; 

//   useFrame((state, delta) => {
//     if (meshRef.current) {
//       // বলটিকে স্মুথলি নির্দিষ্ট লেনে মুভ করানোর জন্য Lerp
//       meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 15);
//       // বল সামনে গড়াচ্ছে এমন ইফেক্ট দিতে রোটেশন
//       meshRef.current.rotation.x -= delta * 8;
//     }
//   });

//   return (
//     <mesh ref={meshRef} position={[0, 0.5, 5]}>
//       <sphereGeometry args={[0.5, 32, 32]} />
//       <meshStandardMaterial color="#ef4444" roughness={0.1} metalness={0.1} />
//     </mesh>
//   );
// }

// // ব্যাকগ্রাউন্ড ট্র্যাক/রাস্তা
// function Track() {
//   return (
//     <group>
//       {/* মেইন রোড */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -15]}>
//         <planeGeometry args={[6, 70]} />
//         <meshStandardMaterial color="#1e293b" roughness={0.8} />
//       </mesh>
//       {/* লেনের বর্ডার লাইন্স */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0, -15]}>
//         <planeGeometry args={[0.04, 70]} />
//         <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.2} />
//       </mesh>
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0, -15]}>
//         <planeGeometry args={[0.04, 70]} />
//         <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.2} />
//       </mesh>
//     </group>
//   );
// }

// // --- MAIN NEXT.JS APP COMPONENT ---
// export default function NewStyle3DGame() {
//   // গেম স্টেটসমূহ
//   const [score, setScore] = useState<number>(0);
//   const [coins, setCoins] = useState<number>(0);
//   const [lives, setLives] = useState<number>(3); 
//   const [targetNumber, setTargetNumber] = useState<number>(5); 
//   const [playerLane, setPlayerLane] = useState<number>(0); // -1 = Left, 0 = Center, 1 = Right
//   const [gameOver, setGameOver] = useState<boolean>(false);
//   const [items, setItems] = useState<GameItem[]>([]);
  
//   // UseRef Hooks (সঠিক সময়ে ফ্রেম লুপ ডেটা ট্র্যাক করার জন্য)
//   const playerLaneRef = useRef(playerLane);
//   const targetNumberRef = useRef(targetNumber);
//   const gameOverRef = useRef(gameOver);
//   const gameSpeed = 16; // বলের স্পিড

//   // রেফগুলোর কারেন্ট স্টেট সিঙ্ক করা
//   useEffect(() => { playerLaneRef.current = playerLane; }, [playerLane]);
//   useEffect(() => { targetNumberRef.current = targetNumber; }, [targetNumber]);
//   useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

//   // নতুন চ্যালেঞ্জিং নাম্বার জেনারেট করা
//   const generateNewTarget = () => {
//     return Math.floor(Math.random() * 9) + 1;
//   };

//   // গেম রি-স্টার্ট ফাংশন
//   const resetGame = () => {
//     setScore(0);
//     setCoins(0);
//     setLives(3);
//     setPlayerLane(0);
//     setItems([]);
//     setGameOver(false);
//     setTargetNumber(generateNewTarget());
//   };

//   useEffect(() => {
//     setTargetNumber(generateNewTarget());
//   }, []);

//   // মেইন গেম মেকানিক্স লুপ
//   useEffect(() => {
//     if (gameOver) return;

//     // ১. অবজেক্ট স্পনার (কয়েন ও নাম্বার কিউব জেনারেটর)
//     const spawnInterval = setInterval(() => {
//       if (gameOverRef.current) return;
      
//       const lane = Math.floor(Math.random() * 3) - 1; 
//       const isCoin = Math.random() > 0.45; // কয়েন আসার অনুপাত
      
//       const newItem: GameItem = {
//         id: Date.now() + Math.random(),
//         z: -35, 
//         lane,
//         type: isCoin ? "coin" : "number",
//         value: isCoin ? undefined : Math.floor(Math.random() * 9) + 1,
//         hit: false,
//       };

//       setItems((prev) => [...prev, newItem]);
//     }, 850);

//     // ২. রিয়েল-টাইম পজিশন আপডেট এবং নিখুঁত কলিশন হ্যান্ডলার
//     let lastTime = performance.now();
//     let animationFrameId: number;

//     const gameLoop = (time: number) => {
//       if (gameOverRef.current) return;

//       const delta = (time - lastTime) / 1000;
//       lastTime = time;

//       setItems((prevItems) => {
//         let updatedItems = prevItems.map((item) => {
//           const nextZ = item.z + gameSpeed * delta;
          
//           // প্লেয়ার অবজেক্ট পজিশন (Z = 5) এর সাথে ম্যাচিং লজিক
//           if (!item.hit && nextZ >= 4.4 && nextZ <= 5.4 && item.lane === playerLaneRef.current) {
//             item.hit = true;

//             if (item.type === "coin") {
//               setCoins((c) => c + 1);
//               setScore((s) => s + 10);
//             } else if (item.type === "number") {
//               if (item.value === targetNumberRef.current) {
//                 setScore((s) => s + 50);
//                 confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
//                 setTargetNumber(generateNewTarget()); 
//               } else {
//                 setLives((l) => {
//                   const remainingLives = l - 1;
//                   if (remainingLives <= 0) setGameOver(true);
//                   return remainingLives;
//                 });
//               }
//             }
//           }
//           return { ...item, z: nextZ };
//         });

//         // রাস্তা পার হয়ে যাওয়া অবজেক্টগুলো মেমোরি থেকে ক্লিন করা
//         return updatedItems.filter((item) => item.z < 8 && !item.hit);
//       });

//       animationFrameId = requestAnimationFrame(gameLoop);
//     };

//     animationFrameId = requestAnimationFrame(gameLoop);

//     return () => {
//       clearInterval(spawnInterval);
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, [gameOver]);

//   // কীবอร์ด ইন্টারেকশন
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (gameOverRef.current) return;
//       if (e.key === "ArrowLeft" && playerLaneRef.current > -1) {
//         setPlayerLane((prev) => prev - 1);
//       } else if (e.key === "ArrowRight" && playerLaneRef.current < 1) {
//         setPlayerLane((prev) => prev + 1);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   return (
//     <div className="relative w-full h-screen bg-slate-950 flex flex-col justify-between items-center font-sans select-none overflow-hidden text-white">
      
//       {/* --- TOP HUD DASHBOARD --- */}
//       <div className="w-full max-w-4xl p-4 grid grid-cols-3 gap-4 items-center z-10 bg-slate-900/80 backdrop-blur-md rounded-b-2xl border-b border-slate-800 m-2">
//         {/* লিমিট সিস্টেম (Lives remaining) */}
//         <div className="flex items-center gap-1.5">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <Heart
//               key={i}
//               className={`w-6 h-6 transition-all duration-300 ${i < lives ? "text-red-500 fill-red-500 scale-100" : "text-slate-700 scale-90"}`}
//             />
//           ))}
//         </div>

//         {/* নাম্বার গেমের মূল মিশন */}
//         <div className="flex flex-col items-center bg-blue-600/20 border border-blue-500/40 rounded-xl py-1 px-4 shadow-inner">
//           <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Hit Target</span>
//           <span className="text-2xl font-black text-blue-300 animate-pulse">{targetNumber}</span>
//         </div>

//         {/* রিয়েল-টাইম স্কোর ও কয়েন ট্র্যাকার */}
//         <div className="flex flex-col items-end gap-0.5">
//           <div className="flex items-center gap-1 text-amber-400 font-extrabold text-base">
//             <Coins className="w-4 h-4 fill-amber-400 animate-bounce" />
//             <span>{coins}</span>
//           </div>
//           <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
//             <Trophy className="w-3.5 h-3.5" />
//             <span>Score: {score}</span>
//           </div>
//         </div>
//       </div>

//       {/* --- 3D RENDER CANVAS AREA --- */}
//       <div className="absolute inset-0 w-full h-full z-0">
//         <Canvas camera={{ position: [0, 3.8, 8.5], fov: 55 }}>
//           <ambientLight intensity={0.7} />
//           <pointLight position={[10, 10, 10]} intensity={1.2} />
//           <directionalLight position={[-5, 8, -2]} intensity={0.6} />
          
//           <Track />
//           <PlayerBall lane={playerLane} />

//           {/* ৩ডি এলিমেন্ট প্রজেকশন */}
//           {items.map((item) => {
//             const position: [number, number, number] = [item.lane * 2, item.type === "coin" ? 0.5 : 0.55, item.z];
//             if (item.type === "coin") {
//               return <Coin3D key={item.id} position={position} />;
//             } else {
//               return <NumberBlock3D key={item.id} position={position} value={item.value || 0} />;
//             }
//           })}
//         </Canvas>
//       </div>

//       {/* --- MOBILE SUPPORT CONTROLS --- */}
//       <div className="w-full max-w-sm px-6 pb-8 grid grid-cols-2 gap-4 z-10 md:hidden">
//         <button
//           onClick={() => playerLaneRef.current > -1 && setPlayerLane((p) => p - 1)}
//           className="bg-slate-900/80 active:bg-slate-800 border border-slate-700 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
//         >
//           <MoveLeft className="w-6 h-6 text-slate-300" />
//         </button>
//         <button
//           onClick={() => playerLaneRef.current < 1 && setPlayerLane((p) => p + 1)}
//           className="bg-slate-900/80 active:bg-slate-800 border border-slate-700 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
//         >
//           <MoveRight className="w-6 h-6 text-slate-300" />
//         </button>
//       </div>

//       {/* কীবোর্ড গাইডলাইন */}
//       <div className="hidden md:block text-slate-500 text-[11px] mb-4 z-10 font-semibold uppercase tracking-wider">
//         Press ◄ / ► arrow keys to control the ball
//       </div>

//       {/* --- GAME OVER DIALOG PANEL --- */}
//       {gameOver && (
//         <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-center items-center z-50">
//           <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xs w-full text-center shadow-2xl mx-4 transform scale-100 transition-all">
//             <h2 className="text-3xl font-black text-red-500 mb-1 tracking-tight">GAME OVER</h2>
//             <p className="text-slate-400 text-xs mb-5">Limit Exceeded! You missed the target numbers.</p>
            
//             <div className="space-y-2 mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-left">
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-xs font-medium">Final Score:</span>
//                 <span className="text-lg font-bold text-white">{score}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-xs font-medium">Coins Gathered:</span>
//                 <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
//                   <Coins className="w-4 h-4 fill-amber-400" /> {coins}
//                 </span>
//               </div>
//             </div>

//             <button
//               onClick={resetGame}
//               className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm"
//             >
//               <RefreshCw className="w-4 h-4" />
//               <span>Try Again</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }









// "use client";
// import React, { useState, useEffect, useRef } from "react";

// export default function Android3DFireTeerGame() {
//   // গেম স্টেটসমূহ
//   const [coins, setCoins] = useState(300); 
//   const [targetNumber, setTargetNumber] = useState(null); 
//   const [selectedTeer, setSelectedTeer] = useState(""); 
//   const [betAmount, setBetAmount] = useState(25); 
//   const [dailyLimit, setDailyLimit] = useState(5); 
//   const [gameMsg, setGameMsg] = useState("৩D ফায়ার টার্গেট লক করে তীর নিক্ষেপ করুন!");
//   const [isShooting, setIsShooting] = useState(false);
//   const [showResult, setShowResult] = useState(false);

//   // ক্যানভাস এবং ৩D অ্যানিমেশন রেফ (High-Performance 60FPS)
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const arrowZ = useRef(-400); // ৩D ডেপথ অক্ষ (Depth Axis)
//   const arrowY = useRef(0);
//   const targetScale = useRef(1);
//   const fireParticles = useRef([]);

//   // ডেইলি লিমিট ও অ্যান্ড্রয়েড লোকাল স্টোরেজ সিঙ্ক
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedLimit = localStorage.getItem("dailyTeerLimit3D");
//       const savedDate = localStorage.getItem("teerGameDate3D");
//       const today = new Date().toDateString();

//       if (savedDate === today && savedLimit !== null) {
//         setDailyLimit(parseInt(savedLimit));
//       } else {
//         localStorage.setItem("teerGameDate3D", today);
//         localStorage.setItem("dailyTeerLimit3D", "5");
//         setDailyLimit(5);
//       }
//     }
//   }, []);

//   // ৩D ফায়ার কিলার অ্যানিমেশন ইঞ্জিন (Pure Standard 3D Layer Projection)
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     let angle = 0;

//     // আগুন কণা (Fire Particles Generator)
//     const createFire = (x, y) => {
//       if (fireParticles.current.length < 40) {
//         fireParticles.current.push({
//           x: x + (Math.random() - 0.5) * 40,
//           y: y + (Math.random() - 0.5) * 40,
//           size: Math.random() * 6 + 4,
//           speedY: Math.random() * 2 + 1,
//           alpha: 1,
//           color: Math.random() > 0.4 ? "#f97316" : "#ef4444"
//         });
//       }
//     };

//     const render3D = () => {
//       // ডার্ক ক্যাসিনো গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড
//       ctx.fillStyle = "#0f172a";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       const centerX = canvas.width / 2;
//       const centerY = canvas.height / 2;

//       // ১. ঘূর্ণায়মান ৩D টার্গেট সিলিন্ডার ম্যাথ প্রজেকশন
//       angle += isShooting ? 0.08 : 0.02;
//       ctx.save();
      
//       // টার্গেট ডেপথ পালস ইফেক্ট
//       if (isShooting && arrowZ.current > -100) {
//         targetScale.current = 1.1 + Math.sin(angle * 5) * 0.05;
//       } else {
//         targetScale.current = 1.0;
//       }

//       // ৩D লক্ষ্যবোর্ডের কনসেন্ট্রিক রিং রেন্ডার
//       const ringCount = 5;
//       const ringColors = ["#b91c1c", "#ffffff", "#dc2626", "#ffffff", "#f59e0b"];
      
//       for (let i = 0; i < ringCount; i++) {
//         const radius = (80 - i * 15) * targetScale.current;
//         ctx.beginPath();
//         ctx.fillStyle = ringColors[i];
        
//         // ৩D ইলিপ্স প্রজেকশন (Perspective View)
//         ctx.ellipse(centerX, centerY, radius * 1.3, radius, 0, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.strokeStyle = "rgba(0,0,0,0.2)";
//         ctx.lineWidth = 2;
//         ctx.stroke();
//       }
//       ctx.restore();

//       // ২. ফায়ার কিলার মেকানিজম (Live Fire Particles Rendering)
//       if (!showResult || (showResult && targetNumber === selectedTeer)) {
//         // যদি উইন হয় বা গেম চলতে থাকে তবে আগুন জ্বলবে
//         for (let k = 0; k < 4; k++) createFire(centerX, centerY);
//       }

//       fireParticles.current.forEach((p, index) => {
//         p.y -= p.speedY;
//         p.alpha -= 0.02;
//         if (p.alpha <= 0) {
//           fireParticles.current.splice(index, 1);
//         } else {
//           ctx.save();
//           ctx.globalAlpha = p.alpha;
//           ctx.fillStyle = p.color;
//           ctx.shadowBlur = 12;
//           ctx.shadowColor = "#f97316";
//           ctx.beginPath();
//           ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
//           ctx.fill();
//           ctx.restore();
//         }
//       });

//       // ৩. ৩D ট্র্যাকিং স্পেস ফ্লাইং তীর (Depth Arrow Simulation)
//       if (isShooting) {
//         if (arrowZ.current < 0) {
//           arrowZ.current += 12; // ৩D গভীরতার দিকে ধাবমান স্পীড
//         }
//       } else {
//         arrowZ.current = -300; 
//       }

//       // ৩D পার্সপেক্টিভ স্কেল ক্যালকুলেশন (কাছে আসলে বড় দেখাবে)
//       const perspective = 300 / (300 - arrowZ.current);
//       const currentArrowSize = 45 * perspective;

//       ctx.save();
//       ctx.shadowBlur = 10;
//       ctx.shadowColor = "#fbbf24";
//       ctx.lineWidth = 3 * perspective;
//       ctx.strokeStyle = "#fbbf24"; // লাকি গোল্ডেন তীর
//       ctx.fillStyle = "#ef4444";

//       // পিছন থেকে ফায়ার বোর্ডের দিকে তীর ছুটে যাওয়ার ড্রয়িং
//       const startX = centerX - (100 * (1 - perspective));
//       const startY = centerY + 30 * (1 - perspective);

//       if (arrowZ.current < -5) {
//         ctx.beginPath();
//         ctx.moveTo(startX, startY);
//         ctx.lineTo(startX + currentArrowSize, startY - currentArrowSize / 3);
//         ctx.stroke();

//         // ৩D তীরের মাথা (Arrow Fin)
//         ctx.beginPath();
//         ctx.arc(startX + currentArrowSize, startY - currentArrowSize / 3, 4 * perspective, 0, Math.PI * 2);
//         ctx.fillStyle = "#fbbf24";
//         ctx.fill();
//       }
//       ctx.restore();

//       animationRef.current = requestAnimationFrame(render3D);
//     };

//     animationRef.current = requestAnimationFrame(render3D);
//     return () => cancelAnimationFrame(animationRef.current);
//   }, [isShooting, showResult]);

//   // ফায়ার কিলার শুট অ্যাকশন
//   const shoot3DTeer = () => {
//     if (isShooting) return;

//     if (dailyLimit <= 0) {
//       setGameMsg("❌ আজকের লিমিট শেষ! এন্ড্রয়েড ডিভাইস লক রিলিজ হবে আগামীকাল।");
//       return;
//     }

//     const num = Object(selectedTeer);
//     if (selectedTeer.length !== 2 || isNaN(parseInt(num))) {
//       setGameMsg("⚠️ অ্যান্ড্রয়েড কিবোর্ড থেকে ২ ডিজিটের লাকি নাম্বার দিন (০০-৯৯)!");
//       return;
//     }

//     if (coins < betAmount) {
//       setGameMsg("❌ পর্যাপ্ত গোল্ডেন কয়েন নেই! রিফিল বাটন প্রেস করুন।");
//       return;
//     }

//     // কয়েন এবং লিমিট ডিডাকশন লজিক
//     setCoins((prev) => prev - betAmount);
//     setIsShooting(true);
//     setShowResult(false);
//     setGameMsg("🎯 ৩D স্পেসে তীর ছুটে যাচ্ছে... ফায়ার কিলার এক্টিভেটেড!");
    
//     const newLimit = dailyLimit - 1;
//     setDailyLimit(newLimit);
//     localStorage.setItem("dailyTeerLimit3D", newLimit.toString());

//     // ২ সেকেন্ড পর ৩D ইমপ্যাক্ট ক্যালকুলেশন
//     setTimeout(() => {
//       const luckyResult = Math.floor(Math.random() * 100);
//       const formattedResult = luckyResult.toString().padStart(2, "0");
      
//       setTargetNumber(formattedResult);
//       setIsShooting(false);
//       setShowResult(true);

//       if (selectedTeer === formattedResult) {
//         const winReward = betAmount * 10; 
//         setCoins((prev) => prev + winReward);
//         setGameMsg(`🔥 জ্যাকপট উইন! ফায়ার বোর্ড খতম! আপনি পেয়েছেন +$${winReward} কয়েন।`);
//       } else {
//         setGameMsg(`💔 লক্ষ্যভ্রষ্ট! ফায়ার কিলার এলার্ম অন! লাকি নাম্বার ছিল [${formattedResult}]।`);
//       }
//     }, 2000);
//   };

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 select-none font-sans">
      
//       {/* 🎰 ক্যাসিনো রিয়েল-টাইম ইনফো ডিসপ্লে */}
//       <div className="w-full max-w-xl bg-black/60 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg mb-4">
//         <div className={`text-sm font-black tracking-wide transition-all ${gameMsg.includes('🔥') || gameMsg.includes('🎉') ? 'text-yellow-400 animate-pulse' : 'text-neutral-300'}`}>
//           {gameMsg}
//         </div>
//       </div>

//       {/* 🌟 প্রিমিয়াম ৩D গোল্ডেন মেটাল ফ্রেম (Screenshot_13.png স্টাইল) */}
//       <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 rounded-t-[2.5rem] rounded-b-[2rem] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.8)] border-b-[12px] border-amber-900">
        
//         {/* ৩D ক্রাউন ফ্ল্যাশিং সাইরেন লাইটস */}
//         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2/3 h-7 bg-amber-500 rounded-t-full border-t border-yellow-200 flex justify-center gap-6 items-center shadow-inner">
//           <div className={`w-5 h-5 bg-orange-500 rounded-t-full shadow-[0_0_10px_#f97316] ${isShooting ? "animate-ping" : ""}`} />
//           <div className={`w-7 h-7 bg-red-600 rounded-t-full -mt-2 border border-white shadow-[0_0_15px_#dc2626] ${isShooting ? "animate-pulse" : ""}`} />
//           <div className={`w-5 h-5 bg-orange-500 rounded-t-full shadow-[0_0_10px_#f97316] ${isShooting ? "animate-ping" : ""}`} />
//         </div>

//         {/* 📊 অ্যান্ড্রয়েড ফ্রেন্ডলি ইনফো গ্রিড ড্যাশবোর্ড */}
//         <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-4 rounded-xl border-2 border-amber-950 shadow-inner mb-4 text-center">
//           <div className="border-r border-neutral-800">
//             <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">কয়েন ব্যালেন্স</div>
//             <div className="text-xl font-black text-yellow-400 font-mono">${coins}</div>
//           </div>
//           <div className="border-r border-neutral-800">
//             <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Android লিমিট</div>
//             <div className="text-xl font-black text-red-500 font-mono">{dailyLimit} / 5</div>
//           </div>
//           <div>
//             <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">বাজি কস্ট</div>
//             <div className="text-xl font-black text-white font-mono">${betAmount}</div>
//           </div>
//         </div>

//         {/* 🎯 HTML5 ৩D DEPTH CANVAS SCREEN */}
//         <div className="relative bg-neutral-900 rounded-2xl overflow-hidden border-4 border-amber-950 shadow-[inset_0_4px_20px_rgba(0,0,0,0.9)] mb-4">
//           <canvas
//             ref={canvasRef}
//             width={500}
//             height={240}
//             className="w-full h-auto block"
//           />

//           {/* ৩D লাকি রেজাল্ট পপআপ কার্ড */}
//           {showResult && (
//             <div className="absolute top-4 right-4 bg-black/80 border-2 border-amber-500 px-5 py-2 rounded-xl text-center animate-bounce z-10">
//               <span className="text-[9px] text-neutral-400 uppercase block tracking-widest">3D Lucky Result</span>
//               <span className="text-3xl font-black text-yellow-400 font-mono">{targetNumber}</span>
//             </div>
//           )}
//         </div>

//         {/* ✍️ মোবাইল টাচ কন্ট্রোল প্যানেল */}
//         <div className="bg-neutral-950 p-4 rounded-xl border border-amber-950 flex flex-col sm:flex-row gap-4 items-center">
          
//           {/* অ্যান্ড্রয়েড টাচ অপ্টিমাইজড ইনপুট */}
//           <div className="w-full sm:w-auto flex-1">
//             <label className="block text-xs text-amber-500 font-bold mb-1 uppercase tracking-wider text-center sm:text-left">
//               ২ ডিজিটের টার্গেট নাম্বার (00-99):
//             </label>
//             <input
//               type="tel" // অ্যান্ড্রয়েডে নিউমেরিক কিবোর্ড পপআপ করানোর জন্য
//               maxLength={2}
//               placeholder="00"
//               value={selectedTeer}
//               onChange={(e) => setSelectedTeer(e.target.value.replace(/\D/g, ""))}
//               disabled={isShooting}
//               className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 px-4 text-center text-3xl font-black font-mono text-yellow-400 focus:outline-none transition-all"
//             />
//           </div>

//           {/* কাস্টম অ্যামাউন্ট ও রিফিল বাটন প্যাক */}
//           <div className="flex gap-2 w-full sm:w-auto">
//             <button
//               onClick={() => setBetAmount((b) => (b === 25 ? 50 : b === 50 ? 100 : 25))}
//               disabled={isShooting}
//               className="px-4 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-black uppercase rounded-lg border-b-4 border-neutral-900 active:border-b-0 transition-all flex-1 sm:flex-none text-center"
//             >
//               Bet: ${betAmount}
//             </button>

//             <button
//               onClick={() => {
//                 setCoins((c) => c + 150);
//                 setGameMsg("📥 $150 গোল্ডেন টোকেন সফলভাবে রিফিল করা হয়েছে!");
//               }}
//               className="px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg border-b-4 border-emerald-900 active:border-b-0 transition-all flex-1 sm:flex-none text-center"
//             >
//               + কয়েন
//             </button>
//           </div>

//         </div>

//       </div>

//       {/* 🎯 অ্যান্ড্রয়েড পুশ হ্যান্ডেল বাটন (Tap To Shoot) */}
//       <div className="w-full max-w-xl mt-4">
//         <button
//           onClick={shoot3DTeer}
//           disabled={isShooting || dailyLimit === 0}
//           className="w-full py-4.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black text-xl tracking-widest rounded-2xl border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all uppercase shadow-2xl disabled:opacity-40 disabled:pointer-events-none"
//         >
//           {isShooting ? "🎯 ফায়ার কিলার ট্র্যাকিং..." : dailyLimit === 0 ? "❌ আজকের লিমিট শেষ" : "🏹 ৩D তীর নিক্ষেপ করুন 🏹"}
//         </button>
//       </div>

//     </div>
//   );
// }







// "use client";
// import React, { useState, useEffect, useRef } from "react";

// export default function LuxuryTeerGame() {
//   // গেম স্টেটসমূহ
//   const [coins, setCoins] = useState(200); 
//   const [targetNumber, setTargetNumber] = useState(null); 
//   const [selectedTeer, setSelectedTeer] = useState(""); 
//   const [betAmount, setBetAmount] = useState(20); 
//   const [dailyLimit, setDailyLimit] = useState(5); 
//   const [gameMsg, setGameMsg] = useState("আপনার লাকি নাম্বারটি বসিয়ে তীর নিক্ষেপ করুন!");
//   const [isShooting, setIsShooting] = useState(false);
//   const [showResult, setShowResult] = useState(false);

//   // ক্যানভাস এবং অ্যানিমেশন রেফ
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);
//   const arrowX = useRef(50);
//   const targetRotation = useRef(0);

//   // প্রতিদিনের লিমিট চেক এবং ইনিশিয়ালাইজেশন
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const savedLimit = localStorage.getItem("dailyTeerLimit");
//       const savedDate = localStorage.getItem("teerGameDate");
//       const today = new Date().toDateString();

//       if (savedDate === today && savedLimit !== null) {
//         setDailyLimit(parseInt(savedLimit));
//       } else {
//         localStorage.setItem("teerGameDate", today);
//         localStorage.setItem("dailyTeerLimit", "5");
//         setDailyLimit(5);
//       }
//     }
//   }, []);

//   // HTML5 Canvas রেন্ডারিং ইঞ্জিন (isShooting এর উপর ডিপেন্ডেন্ট লুপ)
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");

//     const render = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // ক্যানভাস ব্যাকগ্রাউন্ড
//       ctx.fillStyle = "#1e293b";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // ঘূর্ণায়মান টার্গেট বোর্ড
//       ctx.save();
//       ctx.translate(380, 100);
//       targetRotation.current += isShooting ? 0.08 : 0.02;
//       ctx.rotate(targetRotation.current);
      
//       const colors = ["#dc2626", "#ffffff", "#dc2626", "#ffffff", "#ea580c"];
//       for (let i = 0; i < 5; i++) {
//         ctx.beginPath();
//         ctx.fillStyle = colors[i];
//         ctx.arc(0, 0, 70 - i * 13, 0, Math.PI * 2);
//         ctx.fill();
//       }
//       ctx.restore();

//       // তীরের গতিপথ নিয়ন্ত্রণ
//       if (isShooting) {
//         if (arrowX.current < 330) {
//           arrowX.current += 10; 
//         }
//       } else {
//         arrowX.current = 50; 
//       }

//       // তীর ড্রয়িং
//       ctx.save();
//       ctx.lineWidth = 4;
//       ctx.strokeStyle = "#fbbf24"; 
//       ctx.fillStyle = "#fbbf24";

//       ctx.beginPath();
//       ctx.moveTo(arrowX.current, 100);
//       ctx.lineTo(arrowX.current + 40, 100);
//       ctx.stroke();

//       // তীরের মাথা
//       ctx.beginPath();
//       ctx.moveTo(arrowX.current + 40, 93);
//       ctx.lineTo(arrowX.current + 52, 100);
//       ctx.lineTo(arrowX.current + 40, 107);
//       ctx.fill();
//       ctx.restore();

//       animationRef.current = requestAnimationFrame(render);
//     };

//     animationRef.current = requestAnimationFrame(render);
//     return () => cancelAnimationFrame(animationRef.current);
//   }, [isShooting]); // এখানে isShooting ডিপেন্ডেন্সি দেওয়ায় স্টেট চেঞ্জের সাথে সাথে ক্যানভাস আপডেট হবে

//   // তীর নিক্ষেপ করার অ্যাকশন ফাংশন
//   const shootTeer = () => {
//     if (isShooting) return;

//     if (dailyLimit <= 0) {
//       setGameMsg("❌ আজকের খেলার লিমিট শেষ! আগামীকাল আবার চেষ্টা করুন।");
//       return;
//     }

//     const num = parseInt(selectedTeer);
//     if (isNaN(num) || num < 0 || num > 99 || selectedTeer.length !== 2) {
//       setGameMsg("⚠️ দয়া করে ২ ডিজিটের সঠিক নাম্বার দিন (০০ থেকে ৯৯)!");
//       return;
//     }

//     if (coins < betAmount) {
//       setGameMsg("❌ পর্যাপ্ত কয়েন নেই! নিচে থেকে কয়েন রিফিল করুন।");
//       return;
//     }

//     // গেম প্রসেস শুরু
//     setCoins((prev) => prev - betAmount);
//     setIsShooting(true);
//     setShowResult(false);
//     setGameMsg("🎯 তীর নিক্ষেপ করা হচ্ছে... লক্ষ্যভেদের অপেক্ষা!");
    
//     const newLimit = dailyLimit - 1;
//     setDailyLimit(newLimit);
//     localStorage.setItem("dailyTeerLimit", newLimit.toString());

//     // ২ সেকেন্ড পর রেজাল্ট জেনারেট হবে
//     setTimeout(() => {
//       const luckyResult = Math.floor(Math.random() * 100);
//       const formattedResult = luckyResult.toString().padStart(2, "0");
      
//       setTargetNumber(formattedResult);
//       setIsShooting(false);
//       setShowResult(true);

//       if (selectedTeer === formattedResult) {
//         const winReward = betAmount * 10; 
//         setCoins((prev) => prev + winReward);
//         setGameMsg(`🎉 জ্যাকপট! তীর সঠিক লক্ষ্যে লেগেছে! আপনি পেয়েছেন +$${winReward} কয়েন।`);
//       } else {
//         setGameMsg(`💔 লক্ষ্যভ্রষ্ট! লাকি নাম্বার ছিল [${formattedResult}]। আবার চেষ্টা করুন!`);
//       }
//     }, 2000);
//   };

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 select-none font-sans">
      
//       {/* 🎰 টপ গেম মেসেজ বোর্ড */}
//       <div className="w-full max-w-xl bg-black/60 border border-neutral-800 rounded-2xl p-4 text-center shadow-lg mb-4">
//         <div className={`text-sm font-bold tracking-wide transition-all ${gameMsg.includes('🎉') ? 'text-yellow-400 animate-bounce' : 'text-neutral-300'}`}>
//           {gameMsg}
//         </div>
//       </div>

//       {/* 🌟 ক্যাসিনো গ্রেড ৩D গোল্ডেন মেটাল ফ্রেম */}
//       <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 rounded-t-[2.5rem] rounded-b-[2rem] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] border-b-[12px] border-amber-900">
        
//         {/* ৩D ক্রাউন police alert lights */}
//         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2/3 h-7 bg-amber-500 rounded-t-full border-t border-yellow-200 flex justify-center gap-6 items-center shadow-inner">
//           <div className={`w-5 h-5 bg-red-500 rounded-t-full shadow-[0_0_10px_#ef4444] ${isShooting ? "animate-ping" : ""}`} />
//           <div className={`w-7 h-7 bg-red-600 rounded-t-full -mt-2 border border-white shadow-[0_0_15px_#dc2626] ${isShooting ? "animate-pulse" : ""}`} />
//           <div className={`w-5 h-5 bg-red-500 rounded-t-full shadow-[0_0_10px_#ef4444] ${isShooting ? "animate-ping" : ""}`} />
//         </div>

//         {/* 📊 গেম ইনফো এবং লিমিট প্যানেল */}
//         <div className="grid grid-cols-3 gap-3 bg-neutral-950 p-4 rounded-xl border-2 border-amber-950 shadow-inner mb-4 text-center">
//           <div className="border-r border-neutral-800">
//             <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">কয়েন ব্যালেন্স</div>
//             <div className="text-xl font-black text-yellow-400 font-mono">${coins}</div>
//           </div>
//           <div className="border-r border-neutral-800">
//             <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">আজকের লিমিট</div>
//             <div className="text-xl font-black text-red-500 font-mono">{dailyLimit} / 5</div>
//           </div>
//           <div>
//             <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">টিকিট কস্ট</div>
//             <div className="text-xl font-black text-white font-mono">${betAmount}</div>
//           </div>
//         </div>

//         {/* 🎯 HTML5 CANVAS LIVE TARGET SCREEN */}
//         <div className="relative bg-neutral-900 rounded-xl overflow-hidden border-4 border-amber-950 shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] mb-4">
//           <canvas
//             ref={canvasRef}
//             width={480}
//             height={200}
//             className="w-full h-auto block"
//           />

//           {/* লাইভ রেজাল্ট ডিসপ্লে বোর্ড */}
//           {showResult && (
//             <div className="absolute top-4 left-4 bg-black/80 border border-amber-500 px-4 py-2 rounded-lg text-center animate-pulse z-10">
//               <span className="text-[10px] text-neutral-400 uppercase block">Teer Result</span>
//               <span className="text-3xl font-black text-yellow-400 font-mono">{targetNumber}</span>
//             </div>
//           )}
//         </div>

//         {/* ✍️ ইউজার ইনপুট এবং কন্ট্রোল প্যাডেল */}
//         <div className="bg-neutral-950 p-4 rounded-xl border border-amber-950 flex flex-col sm:flex-row gap-4 items-center">
          
//           {/* নাম্বার ইনপুট ফিল্ড */}
//           <div className="w-full sm:w-auto flex-1">
//             <label className="block text-xs text-amber-500 font-bold mb-1 uppercase tracking-wider text-center sm:text-left">
//               আপনার ২ ডিজিটের নাম্বার (00-99):
//             </label>
//             <input
//               type="text"
//               maxLength={2}
//               placeholder="যেমন: 07"
//               value={selectedTeer}
//               onChange={(e) => setSelectedTeer(e.target.value.replace(/\D/g, ""))}
//               disabled={isShooting}
//               className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 px-4 text-center text-2xl font-black font-mono text-yellow-400 focus:outline-none transition-all"
//             />
//           </div>

//           {/* বাজি পরিবর্তন করার বাটন */}
//           <div className="flex gap-2 w-full sm:w-auto">
//             <button
//               onClick={() => setBetAmount((b) => (b === 20 ? 50 : b === 50 ? 100 : 20))}
//               disabled={isShooting}
//               className="px-3 py-3 bg-neutral-800 hover:bg-neutral-700 text-xs font-black uppercase rounded-lg border-b-4 border-neutral-900 active:border-b-0 transition-all"
//             >
//               Bet: ${betAmount}
//             </button>

//             {/* কয়েন এড করার ফ্রি সিস্টেম */}
//             <button
//               onClick={() => {
//                 setCoins((c) => c + 100);
//                 setGameMsg("📥 $100 ফ্রি কয়েন রিফিল করা হয়েছে!");
//               }}
//               className="px-3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg border-b-4 border-emerald-900 active:border-b-0 transition-all"
//             >
//               + ফ্রি কয়েন
//             </button>
//           </div>

//         </div>

//       </div>

//       {/* 🎯 মেইন বিগ একশন শুট বাটন */}
//       <div className="w-full max-w-xl mt-4">
//         <button
//           onClick={shootTeer}
//           disabled={isShooting || dailyLimit === 0}
//           className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-neutral-950 font-black text-xl tracking-widest rounded-2xl border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all uppercase shadow-2xl disabled:opacity-40 disabled:pointer-events-none"
//         >
//           {isShooting ? "🎯 তীর ছুটে যাচ্ছে..." : dailyLimit === 0 ? "❌ আজকের লিমিট শেষ" : "🏹 তীর নিক্ষেপ করুন 🏹"}
//         </button>
//       </div>

//     </div>
//   );
// }




// "use client";
// import React, { useState, useEffect, useRef } from "react";

// export default function LuxuryJumpGamePro() {
//   // গেম ব্যাংকিং ও স্কোর স্টেট
//   const [coins, setCoins] = useState(150); // মেইন ওয়ালেট
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [gameActive, setGameActive] = useState(false);
//   const [gameOver, setGameOver] = useState(false);
//   const [gameMsg, setGameMsg] = useState("INSERT COINS TO PLAY");

//   // ক্যানভাস ও গেম অবজেক্ট রেফারেন্স
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);

//   // গেম ফিজিক্স ও ভেরিয়েবল ট্র্যাকিং
//   const gameState = useRef({
//     player: { x: 50, y: 0, width: 40, height: 40, velocityY: 0, isJumping: false },
//     gravity: 0.6,
//     jumpForce: -13,
//     groundY: 180, // ক্যানভাস হাইট অনুযায়ী সেট করা
//     obstacles: [],
//     coinsList: [],
//     speed: 5,
//     internalScore: 0,
//     spawnTimer: 0,
//   });

//   // কয়েন সিস্টেম কন্ট্রোল (Add / Cashout)
//   const addCoins = (amount) => {
//     setCoins((prev) => prev + amount);
//     setGameMsg(`📥 DEPOSITED $${amount} COINS`);
//   };

//   const cashOut = () => {
//     if (coins <= 0) {
//       setGameMsg("❌ NO COINS TO CASH OUT!");
//       return;
//     }
//     setCoins(0);
//     setGameMsg("💰 CASHED OUT SUCCESSFULLY!");
//   };

//   // গেম ট্রিগার লজিক
//   const startNewGame = () => {
//     if (coins < 15) {
//       setGameMsg("❌ NEED $15 COINS TO SPIN & PLAY!");
//       return;
//     }

//     setCoins((prev) => prev - 15); // এন্ট্রি ফি
//     setGameActive(true);
//     setGameOver(false);
//     setScore(0);

//     // স্টেট রিসেট
//     gameState.current.player.y = gameState.current.groundY - 40;
//     gameState.current.player.velocityY = 0;
//     gameState.current.player.isJumping = false;
//     gameState.current.obstacles = [];
//     gameState.current.coinsList = [];
//     gameState.current.speed = 5;
//     gameState.current.internalScore = 0;
//     gameState.current.spawnTimer = 0;

//     setGameMsg("🎰 GAME LIVE! GOOD LUCK!");
//   };

//   // জাম্প অ্যাকশন
//   const triggerJump = () => {
//     if (!gameActive && !gameOver) {
//       startNewGame();
//       return;
//     }
//     if (gameOver) {
//       startNewGame();
//       return;
//     }
//     if (!gameState.current.player.isJumping) {
//       gameState.current.player.velocityY = gameState.current.jumpForce;
//       gameState.current.player.isJumping = true;
//     }
//   };

//   // কিবোর্ড স্পেসবার ডিটেকশন
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.code === "Space") {
//         e.preventDefault();
//         triggerJump();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [gameActive, gameOver, coins]);

//   // ক্যানভাস রেন্ডারিং ও ইঞ্জিন লুপ
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");

//     const updateEngine = () => {
//       if (!gameActive || gameOver) return;

//       const state = gameState.current;
//       const p = state.player;

//       // ১. প্লেয়ার ফিজিক্স আপডেট
//       p.velocityY += state.gravity;
//       p.y += p.velocityY;

//       if (p.y >= state.groundY - p.height) {
//         p.y = state.groundY - p.height;
//         p.velocityY = 0;
//         p.isJumping = false;
//       }

//       // ২. অবজেক্ট স্পনিং লজিক (বাধা ও কয়েন জেনারেটর)
//       state.spawnTimer++;
//       if (state.spawnTimer % 90 === 0) {
//         // র্যান্ডম বাধা (লাল নিয়ন ট্রায়াঙ্গেল)
//         state.obstacles.push({
//           x: canvas.width + 20,
//           y: state.groundY - 35,
//           width: 25,
//           height: 35,
//         });

//         // র্যান্ডম লাকি স্লট কয়েন জেনারেশন (ফ্লোটিং)
//         const isSeven = Math.random() > 0.7; // ৩০% চান্স লাকি 7 কয়েন হওয়ার
//         state.coinsList.push({
//           x: canvas.width + 100,
//           y: state.groundY - 70 - Math.random() * 50,
//           radius: 12,
//           type: isSeven ? "seven" : "gold",
//           pulse: 0,
//         });
//       }

//       // ৩. বাধা মুভমেন্ট এবং ক্র্যাশ চেক
//       state.obstacles = state.obstacles.filter((obs) => {
//         obs.x -= state.speed;
        
//         // নিখুঁত বক্স কলিশন ডিটেকশন
//         if (
//           p.x < obs.x + obs.width &&
//           p.x + p.width > obs.x &&
//           p.y < obs.y + obs.height &&
//           p.y + p.height > obs.y
//         ) {
//           setGameOver(true);
//           setGameActive(false);
//           setGameMsg("💥 CRASHED! TRY AGAIN");
//         }
//         return obs.x > -50;
//       });

//       // ৪. কয়েন কালেকশন ট্র্যাকিং
//       state.coinsList = state.coinsList.filter((coin) => {
//         coin.x -= state.speed;
//         coin.pulse += 0.1;

//         // সার্কেল বনাম বক্স কলিশন ম্যাথ
//         const distX = Math.abs(coin.x - (p.x + p.width / 2));
//         const distY = Math.abs(coin.y - (p.y + p.height / 2));

//         if (distX <= p.width / 2 + coin.radius && distY <= p.height / 2 + coin.radius) {
//           // কয়েন অনুযায়ী রিওয়ার্ড ব্যালেন্স
//           if (coin.type === "seven") {
//             setCoins((c) => c + 35); // লাকি সেভেনে বড় জ্যাকপট
//             state.internalScore += 100;
//           } else {
//             setCoins((c) => c + 5);
//             state.internalScore += 20;
//           }
//           return false; // কালেক্ট হয়ে গেলে স্ক্রিন থেকে ভ্যানিশ
//         }
//         return coin.x > -50;
//       });

//       // ৫. স্কোর ও স্পীড স্কেলিং
//       state.internalScore += 1;
//       setScore(Math.floor(state.internalScore / 10));
//       if (state.internalScore % 500 === 0) state.speed += 0.8;
//     };

//     const drawEngine = () => {
//       const state = gameState.current;
//       const p = state.player;

//       // ক্যানভাস ক্লিয়ার ও স্কাই ব্যাকগ্রাউন্ড
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       // ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট
//       const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
//       skyGrad.addColorStop(0, "#bae6fd");
//       skyGrad.addColorStop(0.7, "#f1f5f9");
//       skyGrad.addColorStop(1, "#cbd5e1");
//       ctx.fillStyle = skyGrad;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // ১. গ্রাউন্ড লাইন ড্রয়িং (গোল্ডেন বর্ডার থিম)
//       ctx.fillStyle = "#10b981"; // সবুজ ঘাস
//       ctx.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);
//       ctx.fillStyle = "#f59e0b"; // গোল্ডেন স্ট্রিপ
//       ctx.fillRect(0, state.groundY, canvas.width, 4);

//       // ২. বাধা আঁকা (৩D স্টাইলের রেড স্পাইক)
//       state.obstacles.forEach((obs) => {
//         ctx.fillStyle = "#dc2626";
//         ctx.strokeStyle = "#ffffff";
//         ctx.lineWidth = 2;
//         ctx.beginPath();
//         ctx.moveTo(obs.x, obs.y + obs.height);
//         ctx.lineTo(obs.x + obs.width / 2, obs.y);
//         ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
//         ctx.closePath();
//         ctx.fill();
//         ctx.stroke();
//       });

//       // ৩. কয়েন ডিজাইন (Screenshot_13.png থিমের গোল্ডেন এবং লাকি 7)
//       state.coinsList.forEach((coin) => {
//         ctx.save();
//         ctx.beginPath();
        
//         // গ্লোয়িং ইফেক্ট
//         ctx.shadowBlur = 10;
//         if (coin.type === "seven") {
//           ctx.shadowColor = "#ef4444";
//           ctx.fillStyle = "#b91c1c"; // ডিপ রেড
//           ctx.strokeStyle = "#ffffff";
//         } else {
//           ctx.shadowColor = "#eab308";
//           ctx.fillStyle = "#fbbf24"; // লাকি গোল্ড
//           ctx.strokeStyle = "#d97706";
//         }
        
//         ctx.lineWidth = 2;
//         // সাইজ একটু পালস করবে দেখতে রিয়েল মনে হওয়ার জন্য
//         const r = coin.radius + Math.sin(coin.pulse) * 1.5;
//         ctx.arc(coin.x, coin.y, r, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.stroke();

//         // কয়েনের ভেতরের টেক্সট আইকন
//         ctx.fillStyle = coin.type === "seven" ? "#ffffff" : "#78350f";
//         ctx.font = "bold 12px serif";
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillText(coin.type === "seven" ? "7" : "$", coin.x, coin.y);
//         ctx.restore();
//       });

//       // ৪. প্লেয়ার ড্রয়িং (৩D গোল্ডেন লাকি বল)
//       ctx.save();
//       ctx.beginPath();
//       ctx.shadowBlur = 15;
//       ctx.shadowColor = "#d97706";
      
//       const pGrad = ctx.createRadialGradient(
//         p.x + 12, p.y + 12, 2,
//         p.x + 20, p.y + 20, 20
//       );
//       pGrad.addColorStop(0, "#fef08a");
//       pGrad.addColorStop(0.5, "#f59e0b");
//       pGrad.addColorStop(1, "#b45309");
      
//       ctx.fillStyle = pGrad;
//       ctx.strokeStyle = "#ffffff";
//       ctx.lineWidth = 3;
      
//       // ক্যানভাসে ক্যারেক্টারকে গোল গোল্ডেন মেডেলিয়নে রূপান্তর
//       ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.stroke();

//       // বলের সেন্টারে লাকি "7" প্রিন্ট
//       ctx.fillStyle = "#dc2626";
//       ctx.font = "black 24px serif";
//       ctx.textAlign = "center";
//       ctx.textBaseline = "middle";
//       ctx.fillText("7", p.x + p.width/2, p.y + p.height/2 + 2);
//       ctx.restore();
//     };

//     // হাই-পারফরম্যান্স লুপ ট্রিপল শিফট হ্যান্ডলার
//     const loop = () => {
//       updateEngine();
//       drawEngine();
//       animationRef.current = requestAnimationFrame(loop);
//     };

//     animationRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(animationRef.current);
//   }, [gameActive, gameOver]);

//   // হাইস্কোর ট্র্যাকার আপডেট
//   useEffect(() => {
//     if (score > highScore) setHighScore(score);
//   }, [score, highScore]);

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 select-none font-sans">
      
//       {/* 🎰 টপ স্টেট মেগা ইন্টেলিজেন্ট ডিসপ্লে */}
//       <div className="w-full max-w-xl bg-black/50 border border-neutral-800 backdrop-blur-md rounded-2xl p-3 text-center shadow-lg mb-4">
//         <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-1">Live Engine Status</span>
//         <div className={`text-lg font-bold tracking-wider uppercase ${gameMsg.includes('$') || gameMsg.includes('LIVE') ? 'text-yellow-400 animate-pulse' : 'text-neutral-300'}`}>
//           {gameMsg}
//         </div>
//       </div>

//       {/* 🌟 ক্যাসিনো গ্রেড ৩D গোল্ডেন ফ্রেম */}
//       <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 rounded-t-[2.5rem] rounded-b-[2rem] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.8)] border-b-[12px] border-amber-900">
        
//         {/* থ্রিডি ক্রাউন পুলিশ লাইটস (সরাসরি Screenshot_13.png থেকে অনুপ্রাণিত) */}
//         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2/3 h-7 bg-amber-500 rounded-t-full border-t border-yellow-200 flex justify-center gap-6 items-center shadow-inner">
//           <div className={`w-5 h-5 bg-red-500 rounded-t-full shadow-[0_0_10px_#ef4444] ${gameActive ? "animate-ping" : ""}`} />
//           <div className={`w-7 h-7 bg-red-600 rounded-t-full -mt-2 border border-white shadow-[0_0_15px_#dc2626] ${gameActive ? "animate-pulse" : ""}`} />
//           <div className={`w-5 h-5 bg-red-500 rounded-t-full shadow-[0_0_10px_#ef4444] ${gameActive ? "animate-ping" : ""}`} />
//         </div>

//         {/* ইনার ড্যাশবোর্ড ডিসপ্লে গ্রিড */}
//         <div className="grid grid-cols-3 gap-3 bg-neutral-950 p-4 rounded-xl border-2 border-amber-950 shadow-inner mb-4 text-center">
//           <div className="border-r border-neutral-800">
//             <div className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Account Balance</div>
//             <div className="text-xl font-black text-yellow-400 font-mono">${coins}</div>
//           </div>
//           <div className="border-r border-neutral-800">
//             <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Run Score</div>
//             <div className="text-xl font-black text-white font-mono">{score}</div>
//           </div>
//           <div>
//             <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Best High</div>
//             <div className="text-xl font-black text-red-500 font-mono">{highScore}</div>
//           </div>
//         </div>

//         {/* 🎮 HTML5 CANVAS SCREEN FRAME */}
//         <div className="relative bg-neutral-900 rounded-xl overflow-hidden border-4 border-amber-950 shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)]">
//           <canvas
//             ref={canvasRef}
//             width={520}
//             height={220}
//             className="w-full h-auto block"
//           />

//           {/* স্ক্রিন ওভারলে স্টার্ট/রিসেট বাটন */}
//           {(!gameActive || gameOver) && (
//             <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
//               <h1 className="text-2xl font-black text-yellow-400 tracking-widest font-serif drop-shadow mb-1">
//                 {gameOver ? "🎰 GAME OVER" : "🎰 LUCKY JUMP PRO"}
//               </h1>
//               <p className="text-[11px] text-neutral-300 text-center max-w-xs mb-4">
//                 {gameOver ? "আপনার বলটি বাধার সাথে ক্র্যাশ করেছে!" : "কয়েন এবং লাকি '7' ধরুন। প্রতি ক্লিকে $15 কয়েন চার্জ প্রযোজ্য।"}
//               </p>
              
//               <button
//                 onClick={triggerJump}
//                 className="px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white font-black text-xs uppercase tracking-widest rounded-full border-b-4 border-red-950 hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all shadow-md"
//               >
//                 {gameOver ? "TRY AGAIN ($15)" : "SPIN & PLAY ($15)"}
//               </button>
//             </div>
//           )}
//         </div>

//         {/* 💰 ইন্টারেক্টিভ এড কয়েন এবং ক্যাশআউট সিস্টেম গেটওয়ে */}
//         <div className="mt-4 flex gap-3 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
//           <button
//             onClick={() => addCoins(50)}
//             className="flex-1 py-2 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white text-xs font-black uppercase rounded-lg border-b-4 border-emerald-900 active:border-b-0 active:translate-y-0.5 transition-all shadow"
//           >
//             📥 Add $50 Coins
//           </button>
//           <button
//             onClick={cashOut}
//             className="flex-1 py-2 bg-gradient-to-b from-neutral-700 to-neutral-800 hover:from-neutral-600 hover:to-neutral-700 text-neutral-200 text-xs font-black uppercase rounded-lg border-b-4 border-neutral-900 active:border-b-0 active:translate-y-0.5 transition-all shadow"
//           >
//             💸 Cash Out All
//           </button>
//         </div>

//       </div>

//       {/* 🕹️ বিগ পুশ মোবাইল অ্যাকশন প্যাড */}
//       <div className="w-full max-w-xl mt-4">
//         <button
//           onClick={triggerJump}
//           className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xl tracking-widest rounded-2xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all uppercase shadow-2xl"
//         >
//           🎰 TAP TO JUMP / PULL LEVER 🎰
//         </button>
//         <p className="text-center text-[10px] text-neutral-500 mt-2">PC ইউজাররা কিবোর্ডের SPACEBAR চেপেও জাম্প করতে পারবেন</p>
//       </div>

//     </div>
//   );
// }





// "use client";
// import React, { useState } from "react";

// // Rich shape variations to bring variety to the reels
// const SHAPES = [
//   { char: "7", color: "text-red-600 font-serif", isSpecial: true },
//   { char: "⭐", color: "text-yellow-500", isSpecial: false },
//   { char: "💎", color: "text-cyan-400", isSpecial: false },
//   { char: "🔔", color: "text-amber-500", isSpecial: false },
//   { char: "🍒", color: "text-red-500", isSpecial: false },
//   { char: "🍀", color: "text-green-500", isSpecial: false }
// ];

// export default function LuxurySlotMachine() {
//   const [reels, setReels] = useState([SHAPES[0], SHAPES[0], SHAPES[0]]);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [coins, setCoins] = useState(100);
//   const [bet, setBet] = useState(10);
//   const [message, setMessage] = useState("INSERT COINS TO SPIN");
//   const [fallingCoins, setFallingCoins] = useState([]);
//   const [leverActive, setLeverActive] = useState(false);

//   // Helper to trigger visual coin burst animation on win
//   const triggerCoinBurst = () => {
//     const newCoins = Array.from({ length: 12 }).map((_, i) => ({
//       id: Date.now() + i,
//       left: Math.random() * 80 + 10 + "%",
//       delay: Math.random() * 0.4 + "s"
//     }));
//     setFallingCoins(newCoins);
//     setTimeout(() => setFallingCoins([]), 1500);
//   };

//   const handleSpin = () => {
//     if (isSpinning) return;
//     if (coins < bet) {
//       setMessage("❌ NOT ENOUGH COINS!");
//       return;
//     }

//     // Deduct coins
//     setCoins((prev) => prev - bet);
//     setIsSpinning(true);
//     setLeverActive(true);
//     setMessage("SPINNING...");

//     setTimeout(() => setLeverActive(false), 400);

//     // Dynamic slot wheel resolve logic
//     setTimeout(() => {
//       const result = [
//         SHAPES[Math.floor(Math.random() * SHAPES.length)],
//         SHAPES[Math.floor(Math.random() * SHAPES.length)],
//         SHAPES[Math.floor(Math.random() * SHAPES.length)]
//       ];

//       setReels(result);
//       setIsSpinning(false);

//       // Check wins combinations
//       const allThreeMatch = result[0].char === result[1].char && result[1].char === result[2].char;
//       const anyTwoMatch = result[0].char === result[1].char || result[1].char === result[2].char || result[0].char === result[2].char;

//       if (allThreeMatch) {
//         if (result[0].char === "7") {
//           const winAmount = bet * 10;
//           setCoins((prev) => prev + winAmount);
//           setMessage(`🔥 JACKPOT 777! +${winAmount} COINS`);
//           triggerCoinBurst();
//         } else {
//           const winAmount = bet * 5;
//           setCoins((prev) => prev + winAmount);
//           setMessage(`🎉 BIG WIN! +${winAmount} COINS`);
//           triggerCoinBurst();
//         }
//       } else if (anyTwoMatch) {
//         const winAmount = Math.floor(bet * 1.5);
//         setCoins((prev) => prev + winAmount);
//         setMessage(`✨ MATCH TWO! +${winAmount} COINS`);
//       } else {
//         setMessage("TRY AGAIN!");
//       }
//     }, 1400);
//   };

//   return (
//     <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500">
      
//       {/* Top HUD Display Panel */}
//       <div className="mb-8 text-center max-w-sm w-full bg-black/40 backdrop-blur border border-white/10 rounded-xl p-4 shadow-xl">
//         <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Status Box</div>
//         <div className={`text-xl font-bold tracking-wide transition-all ${message.includes('font-serif') || message.includes('+') ? 'text-yellow-400 animate-pulse' : 'text-neutral-200'}`}>
//           {message}
//         </div>
//       </div>

//       {/* Main Framework Wrapper */}
//       <div className="relative flex items-center justify-center w-full max-w-md">
        
//         {/* PHYSICAL 3D SLOT MACHINE CASING */}
//         <div className="w-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 rounded-t-[2.5rem] rounded-b-[1.5rem] p-6 relative shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_4px_0_rgba(255,255,255,0.4)] border-b-[12px] border-amber-900">
          
//           {/* Header Crown Pillars & Police Siren Lamps */}
//           <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 flex items-end justify-center gap-6 w-3/4 h-8 bg-amber-500 rounded-t-full shadow-md border-t-2 border-yellow-200">
//             <div className={`w-6 h-6 rounded-t-full bg-gradient-to-t from-red-700 to-red-400 border border-amber-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] ${isSpinning ? 'animate-ping' : ''}`} />
//             <div className={`w-8 h-8 rounded-t-full bg-gradient-to-t from-red-600 via-red-500 to-red-300 border border-yellow-200 -mb-1 shadow-[0_0_20px_rgba(239,68,68,0.8)] ${isSpinning ? 'animate-pulse' : ''}`} />
//             <div className={`w-6 h-6 rounded-t-full bg-gradient-to-t from-red-700 to-red-400 border border-amber-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] ${isSpinning ? 'animate-ping' : ''}`} />
//           </div>

//           {/* Core Outer Bezel Inset */}
//           <div className="bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 p-4 rounded-2xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.2)] border border-amber-500/40">
            
//             {/* 3D Glass Curved Window Shield */}
//             <div className="relative bg-gradient-to-b from-neutral-800 via-white to-neutral-700 p-4 rounded-xl shadow-[inset_0_10px_20px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.4)] border-4 border-amber-950 h-40 grid grid-cols-3 gap-3 overflow-hidden items-center">
              
//               {/* Dynamic Coin Burst Overlays */}
//               {fallingCoins.map((coin) => (
//                 <div 
//                   key={coin.id}
//                   className="absolute w-6 h-6 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full border border-amber-200 shadow-md text-center text-[10px] text-amber-900 font-bold z-20 flex items-center justify-center animate-coin-fall"
//                   style={{ left: coin.left, animationDelay: coin.delay }}
//                 >
//                   $
//                 </div>
//               ))}

//               {/* Individual Glass Reels */}
//               {reels.map((shape, index) => (
//                 <div
//                   key={index}
//                   className={`bg-gradient-to-b from-white via-neutral-50 to-white h-full rounded-lg shadow-[0_6px_10px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2)] border-y border-neutral-300 flex items-center justify-center transition-all duration-100 ${
//                     isSpinning ? "animate-slot-blur" : ""
//                   }`}
//                   style={{ animationDelay: `${index * 120}ms` }}
//                 >
//                   <span className={`${shape.color} text-5xl md:text-6xl select-none font-bold transform drop-shadow-[0_3px_2px_rgba(0,0,0,0.2)] ${shape.char === '7' ? 'text-6xl font-serif font-black' : ''}`}>
//                     {shape.char}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             {/* Sub-Dashboard Coin Controller Grid */}
//             <div className="mt-5 grid grid-cols-2 gap-4 bg-black/30 p-3 rounded-xl border border-amber-950/40">
              
//               {/* Coin Counter Output */}
//               <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 shadow-inner flex flex-col items-center">
//                 <span className="text-[10px] tracking-widest text-amber-500 font-mono font-bold uppercase">Balance</span>
//                 <span className="text-xl font-black font-mono text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">
//                   ${coins}
//                 </span>
//               </div>

//               {/* Bet Sizing Counter */}
//               <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 shadow-inner flex flex-col items-center">
//                 <span className="text-[10px] tracking-widest text-neutral-400 font-mono uppercase">Current Bet</span>
//                 <span className="text-xl font-black font-mono text-red-400">
//                   ${bet}
//                 </span>
//               </div>

//             </div>

//             {/* Quick Action Interactive Buttons */}
//             <div className="flex justify-between items-center mt-5 px-1">
//               <div className="flex gap-2">
//                 {/* Add Coins System Button */}
//                 <button 
//                   onClick={() => { setCoins(c => c + 25); setMessage("📥 DEPOSITED $25 COINS"); }}
//                   className="px-3 py-1.5 bg-gradient-to-b from-emerald-500 to-emerald-700 text-[11px] font-black tracking-wide rounded border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all uppercase shadow-md"
//                 >
//                   + Add $25
//                 </button>
//                 {/* Remove / Cash Out System Button */}
//                 <button 
//                   onClick={() => { if(coins > 0) { setCoins(0); setMessage("💰 CASHED OUT SUCESSFULLY!"); } }}
//                   className="px-3 py-1.5 bg-gradient-to-b from-neutral-600 to-neutral-800 text-[11px] font-black tracking-wide rounded border-b-4 border-neutral-900 active:border-b-0 active:translate-y-1 transition-all uppercase shadow-md"
//                 >
//                   Cashout
//                 </button>
//               </div>

//               {/* Adjust Bet Control Toggle */}
//               <button 
//                 onClick={() => setBet(b => b === 10 ? 25 : b === 25 ? 50 : 10)}
//                 className="px-3 py-1.5 bg-gradient-to-b from-amber-500 to-amber-700 text-[11px] font-black tracking-wide rounded border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all uppercase text-white shadow-md"
//               >
//                 Change Bet
//               </button>
//             </div>

//           </div>

//           {/* 3D Curved Machine Base Plate Pedestal */}
//           <div className="mt-5 -mx-6 -mb-6 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 p-4 rounded-b-[1.4rem] border-t-4 border-amber-400 text-center shadow-[inset_0_6px_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
//             <button
//               onClick={handleSpin}
//               disabled={isSpinning}
//               className="relative inline-block text-4xl md:text-5xl font-black text-red-600 tracking-widest uppercase font-serif hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
//               style={{ textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff, 0px 5px 10px rgba(0,0,0,0.6)' }}
//             >
//               SPIN
//             </button>
//           </div>

//         </div>

//         {/* 3D MECHANICAL SIDE-LEVER COMPONENT */}
//         <div className="absolute left-full top-1/4 hidden md:block pl-1 z-0">
//           {/* Base Joint Mount */}
//           <div className="w-8 h-20 bg-gradient-to-b from-amber-700 to-amber-950 rounded-r-lg shadow-xl border-y border-r border-amber-500/40 relative flex items-center">
            
//             {/* Mechanical Lever Shaft Arm */}
//             <div 
//               className={`w-3 bg-gradient-to-r from-neutral-300 via-neutral-400 to-neutral-500 origin-bottom absolute bottom-8 left-2 transition-transform duration-300 ease-out shadow-md ${
//                 leverActive ? "h-14 rotate-180 translate-y-8" : "h-24"
//               }`}
//             >
//               {/* Glossy Red Knob Ball */}
//               <div 
//                 onClick={handleSpin}
//                 className="w-9 h-9 bg-gradient-to-tr from-red-700 via-red-500 to-rose-400 rounded-full absolute -top-7 -left-3 shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] cursor-pointer hover:brightness-110 active:scale-95 transition-all"
//               />
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* Alternative Mobile Safe Pull Handle */}
//       <button 
//         onClick={handleSpin}
//         disabled={isSpinning}
//         className="md:hidden mt-8 px-10 py-3.5 bg-gradient-to-b from-yellow-400 via-amber-500 to-amber-700 text-white font-black rounded-full shadow-lg border-b-4 border-amber-900 active:border-b-0 active:translate-y-0.5 transition-all uppercase tracking-wider text-sm"
//       >
//         {isSpinning ? "🎰 Spinning..." : "👇 Pull Handle"}
//       </button>

//     </div>
//   );
// }

// "use client";
// import React, { useState, useEffect } from "react";

// const SYMBOLS = ["7", "🍒", "🍋", "🔔", "💎", "⭐"];

// export default function SlotMachine() {
//   const [reels, setReels] = useState(["7", "7", "7"]);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [jackpot, setJackpot] = useState(false);
//   const [leverPulled, setLeverPulled] = useState(false);

//   const spin = () => {
//     if (isSpinning) return;

//     setIsSpinning(true);
//     setJackpot(false);
//     setLeverPulled(true);

//     // Reset lever animation after a short delay
//     setTimeout(() => setLeverPulled(false), 500);

//     // Simulate reel spinning delay
//     setTimeout(() => {
//       const result = [
//         SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
//         SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
//         SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
//       ];

//       // Force a high chance of "7" for demonstration purposes occasionally, 
//       // or keep it completely random:
//       // const result = Math.random() > 0.5 ? ["7", "7", "7"] : [SYMBOLS[...], ...];

//       setReels(result);
//       setIsSpinning(false);

//       // Check for Win (3 of a kind, especially 7s!)
//       if (result[0] === result[1] && result[1] === result[2]) {
//         setJackpot(true);
//       }
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans select-none">
      
//       {/* Win Announcement */}
//       <div className="h-12 mb-4 text-center">
//         {jackpot && (
//           <h1 className="text-3xl font-extrabold text-red-600 animate-bounce drop-shadow">
//             🎉 JACKPOT! 🎉
//           </h1>
//         )}
//       </div>

//       {/* Main Machine Container */}
//       <div className="relative flex items-center justify-center max-w-md w-full unique-machine-wrapper">
        
//         {/* The Golden Slot Machine Body */}
//         <div className="w-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 rounded-t-3xl rounded-b-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t-4 border-yellow-200 relative">
          
//           {/* Top Header / Police Lights */}
//           <div className="flex justify-center gap-6 -mt-10 mb-6">
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-t from-red-600 to-red-400 border-2 border-amber-300 shadow-md ${isSpinning ? 'animate-ping' : ''}`} />
//             <div className={`w-10 h-10 rounded-full bg-gradient-to-t from-red-700 via-red-500 to-red-300 border-2 border-amber-200 shadow-lg -mt-2 ${isSpinning ? 'animate-pulse' : ''}`} />
//             <div className={`w-8 h-8 rounded-full bg-gradient-to-t from-red-600 to-red-400 border-2 border-amber-300 shadow-md ${isSpinning ? 'animate-ping' : ''}`} />
//           </div>

//           {/* Inner Golden Frame */}
//           <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-4 rounded-xl shadow-inner border border-amber-400">
            
//             {/* The Reels Screen Window */}
//             <div className="grid grid-cols-3 gap-3 bg-gradient-to-b from-gray-300 via-white to-gray-300 p-4 rounded-lg shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] border-4 border-amber-600 h-36 items-center overflow-hidden">
//               {reels.map((symbol, index) => (
//                 <div
//                   key={index}
//                   className={`bg-white rounded border border-gray-300 shadow-sm h-full flex items-center justify-center text-5xl font-black text-red-600 ${
//                     isSpinning ? "animate-slot-blur" : ""
//                   }`}
//                   style={{
//                     animationDelay: `${index * 150}ms`,
//                   }}
//                 >
//                   <span className={symbol === "7" ? "text-red-600 drop-shadow-md font-serif text-6xl" : ""}>
//                     {symbol}
//                   </span>
//                 </div>
//               ))}
//             </div>

//             {/* Dashboard Bottom Buttons */}
//             <div className="flex justify-between items-center mt-6 px-4">
//               <button className="w-12 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-md border-b-4 border-red-900 active:border-b-0 active:mt-1 transform transition" />
//               <button className="w-12 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-md border-b-4 border-red-900 active:border-b-0 active:mt-1 transform transition" />
//               <button 
//                 onClick={spin}
//                 disabled={isSpinning}
//                 className="w-16 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full shadow-lg border-b-4 border-red-900 text-white font-bold text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 disabled:opacity-50 transition-all"
//               >
//                 Bet
//               </button>
//             </div>

//           </div>

//           {/* Machine Base Pedestal ("SPIN" Label Area) */}
//           <div className="mt-6 -mx-6 -mb-6 bg-gradient-to-b from-amber-600 to-amber-900 p-4 rounded-b-2xl border-t-4 border-amber-400 text-center shadow-[inset_0_4px_6px_rgba(0,0,0,0.3)]">
//             <button
//               onClick={spin}
//               disabled={isSpinning}
//               className="inline-block text-4xl md:text-5xl font-black text-red-600 tracking-widest uppercase font-serif drop-shadow-[0_2px_2px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
//               style={{ textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff, 0px 4px 6px rgba(0,0,0,0.4)' }}
//             >
//               SPIN
//             </button>
//           </div>

//         </div>

//         {/* The Side Mechanical Lever (Responsive positioning) */}
//         <div className="absolute left-full top-1/3 pl-0 z-10 hidden sm:block">
//           <div className="w-6 h-16 bg-gradient-to-r from-amber-600 to-amber-800 rounded-r shadow-md relative">
//             {/* Lever Arm */}
//             <div 
//               className={`w-3 origin-bottom bg-gradient-to-b from-gray-400 to-gray-600 absolute bottom-6 left-1.5 transition-transform duration-300 ease-in-out ${
//                 leverPulled ? "h-12 rotate-180 translate-y-6" : "h-20"
//               }`}
//             >
//               {/* Red Handle Ball */}
//               <div 
//                 onClick={spin}
//                 className="w-8 h-8 bg-gradient-to-r from-red-500 via-red-600 to-red-800 rounded-full absolute -top-6 -left-2.5 shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition"
//               />
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* Quick Mobile Assist Trigger */}
//       <button 
//         onClick={spin}
//         disabled={isSpinning}
//         className="sm:hidden mt-8 px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-full shadow-lg border-b-4 border-amber-800 active:border-0"
//       >
//         {isSpinning ? "Spinning..." : "PULL LEVER"}
//       </button>

//     </div>
//   );
// }