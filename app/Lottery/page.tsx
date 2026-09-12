"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PlusCircle, MinusCircle, Wallet, Trophy, Skull, Zap } from 'lucide-react';

// Vercel-এর টাইপ চেকিং পাসের জন্য টাইপ ডিফাইন করা হলো
type GameStatus = 'win' | 'lose' | 'idle';

export default function Luxury3DCasino() {
  const [balance, setBalance] = useState<number>(1000);
  const [betAmount, setBetAmount] = useState<number>(100);
  // স্টেটকে নির্দিষ্ট টাইপ দেওয়া হলো যেন এটি null এবং GameStatus দুটিই এক্সেপ্ট করে
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // ৩ডি অ্যানিমেশন ভেরিয়েন্ট (Variants ইন্টারফেস দিয়ে টাইপ সেফ করা হলো)
  const cardVariants: Variants = {
    win: { rotateY: 360, scale: 1.05, transition: { duration: 0.8, type: "spring" } },
    lose: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } },
    idle: { rotateY: 0, scale: 1 }
  };

  const handlePlay = () => {
    if (balance < betAmount) {
      alert("Insufficient Balance!");
      return;
    }
    
    setIsSpinning(true);
    setStatus('idle');

    setTimeout(() => {
      const isWin = Math.random() > 0.6;
      if (isWin) {
        setBalance(prev => prev + (betAmount * 2));
        setStatus('win');
      } else {
        setBalance(prev => prev - betAmount);
        setStatus('lose');
      }
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* ১. ব্যালেন্স কন্ট্রোল সেকশন (Top Bar) */}
      <div className="w-full max-w-md mb-8 flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
            <Wallet className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Your Wallet</p>
            <h3 className="text-xl font-black text-yellow-500">${balance}</h3>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setBalance(prev => prev + 500)}
            className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg transition"
          >
            <PlusCircle size={20} className="text-green-400" />
          </button>
          <button 
            onClick={() => setBalance(prev => prev > 0 ? prev - 500 : 0)}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition"
          >
            <MinusCircle size={20} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* ২. মেইন ৩ডি গেম কার্ড */}
      <motion.div
        variants={cardVariants}
        // অ্যানিমেশন ভ্যালুকে স্ট্রিং কাস্টিং নিশ্চিত করতে ব্র্যাকেট ব্যবহার করা হলো
        animate={isSpinning ? { rotateY: 180 } : (status || 'idle')}
        className={`relative w-full max-w-md aspect-[4/5] rounded-[3rem] p-1 border-2 transition-colors duration-500 ${
          status === 'win' ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 
          status === 'lose' ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 
          'border-white/10 shadow-2xl'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-[2.8rem] flex flex-col items-center justify-between p-10 overflow-hidden">
          
          {/* Status Display Area */}
          <div className="flex flex-col items-center mt-4">
            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div key="spinning" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="text-yellow-500 italic font-black text-2xl uppercase tracking-tighter">
                    Spinning...
                </motion.div>
              ) : status === 'win' ? (
                <motion.div key="win" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                  <div className="bg-yellow-500 rounded-full p-4 mb-4 shadow-[0_0_40px_rgba(234,179,8,0.6)]">
                    <Trophy size={60} className="text-black" />
                  </div>
                  <h1 className="text-4xl font-black text-yellow-400 uppercase tracking-wider">Big Win!</h1>
                  <p className="text-yellow-200/60 font-medium">+ ${betAmount * 2}</p>
                </motion.div>
              ) : status === 'lose' ? (
                <motion.div key="lose" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                  <div className="bg-red-600/20 rounded-full p-4 mb-4 border border-red-500/50">
                    <Skull size={60} className="text-red-500" />
                  </div>
                  <h1 className="text-4xl font-black text-red-500 uppercase tracking-wider">You Lost</h1>
                  <p className="text-red-400/60 font-medium">- ${betAmount}</p>
                </motion.div>
              ) : (
                <Zap size={80} className="text-white/5" />
              )}
            </AnimatePresence>
          </div>

          {/* Bet Amount Selector */}
          <div className="w-full space-y-4">
             <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-gray-400 text-sm font-bold">Bet Amount:</span>
                <span className="text-xl font-black text-white">${betAmount}</span>
             </div>
             
             <div className="flex gap-2">
                {[50, 100, 500].map((amt) => (
                  <button 
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${betAmount === amt ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    ${amt}
                  </button>
                ))}
             </div>

             <button
              onClick={handlePlay}
              disabled={isSpinning}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${
                isSpinning ? 'bg-gray-800 text-gray-500' : 'bg-yellow-500 text-black hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-yellow-500/20'
              }`}
            >
              Play Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* ফ্লোটিং টেক্সট */}
      <p className="mt-8 text-gray-600 text-[10px] uppercase tracking-[0.3em] font-bold">
        Certified Luxury Casino Engine
      </p>
    </div>
  );
}





// "use client";
// // 1. All imports must be at the top
// import React, { useState, useRef, Suspense, useEffect } from 'react';
// import * as THREE from 'three';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { 
//   Float, 
//   MeshReflectorMaterial, 
//   PresentationControls, 
//   Text, 
//   Sparkles, 
//   SpotLight, 
//   useDepthBuffer, 
//   Environment, 
//   Preload 
// } from '@react-three/drei';
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import { Landmark, Zap, Minus, Plus, Trophy } from 'lucide-react';

// // Camera Controller for that cinematic feel
// function CameraController() {
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();
//     state.camera.position.x = Math.sin(t * 0.1) * 2;
//     state.camera.lookAt(0, 0, 0);
//   });
//   return null;
// }

// function SlotMachine({ themeColor, isSpinning, currentSymbols }) {
//   const depthBuffer = useDepthBuffer({ size: 256 });

//   return (
//     <group rotation={[0, -Math.PI / 4, 0]}>
//       {/* Main Cabinet */}
//       <mesh position={[0, 0, 0]} castShadow>
//         <boxGeometry args={[2, 3.5, 0.8]} />
//         <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
//       </mesh>

//       {/* Glowing Header */}
//       <mesh position={[0, 1.8, 0.01]}>
//         <planeGeometry args={[1.8, 0.4]} />
//         <meshStandardMaterial 
//           color={themeColor} 
//           emissive={themeColor} 
//           emissiveIntensity={4} 
//           toneMapped={false} 
//         />
//         <Text position={[0, 0, 0.02]} fontSize={0.18} color="black">
//           CYBER-SLOTS
//         </Text>
//       </mesh>

//       {/* Reels */}
//       <group position={[0, 0.5, 0.45]}>
//         {[ -0.6, 0, 0.6 ].map((x, i) => (
//           <mesh key={i} position={[x, 0, 0]}>
//             <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} rotation={[Math.PI / 2, 0, 0]} />
//             <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
//             <Text 
//               position={[0, 0, 0.31]} 
//               fontSize={0.4} 
//               color={isSpinning ? "#666" : "#000"}
//             >
//               {currentSymbols[i]}
//             </Text>
//           </mesh>
//         ))}
//       </group>

//       <SpotLight
//         depthBuffer={depthBuffer}
//         position={[2, 5, 2]}
//         angle={0.15}
//         color={themeColor}
//         intensity={2}
//       />
//     </group>
//   );
// }

// export default function CyberLuxeCasino() {
//   const [betSize, setBetSize] = useState(100);
//   const [theme, setTheme] = useState({ name: "Pulse Blue", color: "#00f2ff" });
//   const [balance, setBalance] = useState(10000);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [reels, setReels] = useState(['💎', '💎', '💎']);
//   const [showWin, setShowWin] = useState(false);

//   const symbolsList = ['💎', '🍒', '7', '🍀', '🔔'];
//   const themesList = [
//     { name: "Cyan", color: "#00f2ff" },
//     { name: "Neon", color: "#ff00ff" },
//     { name: "Gold", color: "#ffae00" }
//   ];

//   const handleSpin = () => {
//     if (balance < betSize || isSpinning) return;
    
//     setIsSpinning(true);
//     setShowWin(false);
//     setBalance(b => b - betSize);

//     const spinInterval = setInterval(() => {
//       setReels([
//         symbolsList[Math.floor(Math.random() * symbolsList.length)],
//         symbolsList[Math.floor(Math.random() * symbolsList.length)],
//         symbolsList[Math.floor(Math.random() * symbolsList.length)]
//       ]);
//     }, 80);

//     setTimeout(() => {
//       clearInterval(spinInterval);
//       const rng = Math.random();
//       let finalResult;

//       if (rng < 0.2) { // Increased to 20% for testing fun
//         finalResult = ['7', '7', '7'];
//         setBalance(b => b + (betSize * 10));
//         setShowWin(true);
//       } else {
//         finalResult = [
//           symbolsList[Math.floor(Math.random() * symbolsList.length)],
//           symbolsList[Math.floor(Math.random() * symbolsList.length)],
//           symbolsList[Math.floor(Math.random() * symbolsList.length)]
//         ];
//       }

//       setReels(finalResult);
//       setIsSpinning(false);
//     }, 2000);
//   };

//   return (
//     <div className="h-screen w-full bg-[#020202] text-white flex flex-col font-sans overflow-hidden">
      
//       {/* 3D Scene Container */}
//       <div className="flex-grow relative">
//         <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 7], fov: 35 }}>
//           <color attach="background" args={["#020202"]} />
//           <ambientLight intensity={0.2} />
          
//           <Suspense fallback={null}>
//             <Environment preset="night" />
//             <PresentationControls global rotation={[0, 0.3, 0]} polar={[-0.2, 0.2]}>
//               <group position={[0, -1, 0]}>
//                 <SlotMachine themeColor={theme.color} isSpinning={isSpinning} currentSymbols={reels} />
//                 <Sparkles count={80} scale={5} size={2} speed={0.3} color={theme.color} />
                
//                 <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
//                   <planeGeometry args={[50, 50]} />
//                   <MeshReflectorMaterial
//                     blur={[300, 100]}
//                     resolution={1024}
//                     mixBlur={1}
//                     mixStrength={50}
//                     color="#080808"
//                     metalness={0.5}
//                   />
//                 </mesh>
//               </group>
//             </PresentationControls>

//             <EffectComposer disableNormalPass>
//               <Bloom luminanceThreshold={1} intensity={1.5} radius={0.4} />
//             </EffectComposer>
//             <CameraController />
//           </Suspense>
//           <Preload all />
//         </Canvas>

//         {/* Win Notification */}
//         {showWin && (
//           <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-8 py-3 rounded-full font-black text-2xl animate-bounce flex items-center gap-3 shadow-[0_0_50px_rgba(234,179,8,0.6)]">
//             <Trophy /> JACKPOT WIN!
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="p-6 md:p-8 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-50">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
          
//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-3">
//               <div className="p-3 rounded-2xl border" style={{ borderColor: `${theme.color}33`, backgroundColor: `${theme.color}10` }}>
//                 <Landmark size={24} style={{ color: theme.color }} />
//               </div>
//               <h1 className="text-xl font-black uppercase">CYBER<span style={{ color: theme.color }}>CASINO</span></h1>
//             </div>
//             <div className="h-10 w-[1px] bg-white/10" />
//             <div>
//               <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Balance</p>
//               <p className="text-2xl font-mono font-bold text-green-400">${balance.toLocaleString()}</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-black/50 p-2 rounded-2xl border border-white/10">
//             <button onClick={() => setBetSize(s => Math.max(10, s - 10))} className="p-2 hover:bg-white/5 rounded-lg"><Minus size={16}/></button>
//             <p className="text-lg font-mono font-bold w-16 text-center">${betSize}</p>
//             <button onClick={() => setBetSize(s => s + 10)} className="p-2 hover:bg-white/5 rounded-lg"><Plus size={16}/></button>
            
//             <div className="flex gap-2 ml-4">
//               {themesList.map(t => (
//                 <button 
//                   key={t.name} 
//                   onClick={() => setTheme(t)} 
//                   className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${theme.name === t.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
//                   style={{ backgroundColor: t.color }}
//                 />
//               ))}
//             </div>
//           </div>

//           <button 
//             onClick={handleSpin}
//             disabled={isSpinning || balance < betSize}
//             className="px-16 py-4 rounded-2xl text-xl font-black transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{ 
//               backgroundColor: theme.color, 
//               color: 'black',
//               boxShadow: isSpinning ? 'none' : `0 0 30px ${theme.color}44`
//             }}
//           >
//             {isSpinning ? "SPINNING..." : <><Zap size={20}/> SPIN</>}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// Add Suspense Import (Crucial for Environment loading)
// import { Suspense } from 'react';



// "use client";
// import React, { useState, useRef, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Float, MeshReflectorMaterial, PresentationControls, Stage, Text, Sparkles } from '@react-three/drei';
// import { Trophy, History, Coins, Zap } from 'lucide-react';

// function GameCore({ themeColor, isWinning, isSpinning }) {
//   const mesh = useRef();
  
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();
//     if (isSpinning) {
//       mesh.current.rotation.y += 0.4; // Turbo spin
//       mesh.current.position.y = Math.sin(t * 10) * 0.1;
//     } else {
//       mesh.current.rotation.y += 0.01;
//     }
//   });

//   return (
//     <group>
//       <Float speed={isSpinning ? 10 : 2} rotationIntensity={2} floatIntensity={2}>
//         <mesh ref={mesh} scale={isWinning ? 1.5 : 1}>
//           <octahedronGeometry args={[1, 0]} />
//           <meshStandardMaterial 
//             color={themeColor} 
//             emissive={themeColor} 
//             emissiveIntensity={isWinning ? 2 : 0.5} 
//             metalness={1} 
//             roughness={0.1} 
//           />
//         </mesh>
//       </Float>
//       {isWinning && <Sparkles count={50} scale={2} size={6} speed={0.4} color={themeColor} />}
//     </group>
//   );
// }

// export default function ProCasino() {
//   const [betSize, setBetSize] = useState("50");
//   const [theme, setTheme] = useState({ name: "Gold", color: "#FFD700" });
//   const [balance, setBalance] = useState(5000);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [isWinning, setIsWinning] = useState(false);
//   const [history, setHistory] = useState([]);

//   const themes = [
//     { name: "Gold", color: "#FFD700" },
//     { name: "Emerald", color: "#50C878" },
//     { name: "Ruby", color: "#E0115F" },
//   ];

//   const handlePlay = () => {
//     const cost = parseInt(betSize);
//     if (balance < cost) return;
    
//     setIsSpinning(true);
//     setIsWinning(false);
//     setBalance(b => b - cost);

//     // Enhanced Math Logic
//     setTimeout(() => {
//       const rng = Math.random() * 100;
//       let winAmount = 0;
//       let status = "Loss";

//       if (rng > 90) { // 10% Win Rate
//         const multiplier = rng > 98 ? 10 : 3; // 2% chance for 10x
//         winAmount = cost * multiplier;
//         setIsWinning(true);
//         status = `Won $${winAmount} (${multiplier}x)`;
//         setBalance(b => b + winAmount);
//       } else {
//         status = `Lost $${cost}`;
//       }

//       setHistory(prev => [{ status, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
//       setIsSpinning(false);
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans overflow-hidden">
      
//       {/* SIDEBAR: History (Responsive: Hidden on small mobile) */}
//       <aside className="w-full md:w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 p-6 hidden lg:flex flex-col">
//         <div className="flex items-center gap-2 mb-8 text-zinc-400">
//           <History size={18} />
//           <span className="text-xs uppercase tracking-widest font-bold">Live Activity</span>
//         </div>
//         <div className="space-y-4">
//           {history.map((item, i) => (
//             <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center animate-in fade-in slide-in-from-left-4">
//               <span className={`text-sm ${item.status.includes('Won') ? 'text-green-400' : 'text-zinc-500'}`}>{item.status}</span>
//               <span className="text-[10px] text-zinc-600">{item.time}</span>
//             </div>
//           ))}
//           {history.length === 0 && <p className="text-zinc-700 text-sm italic">No recent plays...</p>}
//         </div>
//       </aside>

//       {/* MAIN GAME AREA */}
//       <div className="flex-grow flex flex-col relative">
//         <nav className="p-6 flex justify-between items-center border-b border-white/5 z-50">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg" style={{ background: `${theme.color}22` }}>
//               <Zap size={20} style={{ color: theme.color }} />
//             </div>
//             <h1 className="text-xl font-black tracking-tighter uppercase">Nexus<span style={{ color: theme.color }}>Slot</span></h1>
//           </div>
//           <div className="flex gap-4 items-center">
//              <div className="bg-zinc-900 px-5 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
//                <Coins size={16} className="text-yellow-500" />
//                <span className="text-lg font-mono font-bold">${balance.toLocaleString()}</span>
//              </div>
//           </div>
//         </nav>

//         <div className="flex-grow relative">
//           <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5] }}>
//             <color attach="background" args={["#050505"]} />
//             <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
//               <Stage environment="city" intensity={0.5} contactShadow={false}>
//                 <GameCore themeColor={theme.color} isWinning={isWinning} isSpinning={isSpinning} />
//               </Stage>
//               <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
//                 <planeGeometry args={[20, 20]} />
//                 <MeshReflectorMaterial
//                   blur={[300, 100]}
//                   resolution={1024}
//                   mixBlur={1}
//                   mixStrength={60}
//                   roughness={1}
//                   depthScale={1.2}
//                   color="#101010"
//                   metalness={0.5}
//                 />
//               </mesh>
//             </PresentationControls>
//           </Canvas>

//           {/* Winning Alert Overlay */}
//           {isWinning && !isSpinning && (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce">
//               <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
//                 BIG WIN
//               </h2>
//             </div>
//           )}
//         </div>

//         {/* CONTROLS */}
//         <div className="p-6 bg-zinc-900/80 backdrop-blur-md rounded-t-[2.5rem] border-t border-white/10">
//           <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 items-center">
            
//             <div className="w-full md:w-1/4">
//               <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Bet Amount</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {["10", "50", "500"].map(val => (
//                   <button 
//                     key={val}
//                     onClick={() => setBetSize(val)}
//                     className={`py-2 rounded-lg text-sm font-bold border transition-all ${betSize === val ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-white/10 hover:border-white/30'}`}
//                   >
//                     ${val}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <button 
//               onClick={handlePlay}
//               disabled={isSpinning}
//               className={`flex-grow w-full py-5 rounded-2xl text-xl font-black transition-all flex items-center justify-center gap-3
//                 ${isSpinning ? 'bg-zinc-800 text-zinc-600' : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]'}
//               `}
//             >
//               {isSpinning ? "SPINNING..." : <><Trophy size={24}/> SPIN REELS</>}
//             </button>

//             <div className="w-full md:w-1/4">
//               <label className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">Theme Engine</label>
//               <div className="flex gap-2">
//                 {themes.map(t => (
//                   <button 
//                     key={t.name}
//                     onClick={() => setTheme(t)}
//                     className="w-full h-10 rounded-lg border border-white/10 flex items-center justify-center transition-all hover:scale-110"
//                     style={{ background: t.color }}
//                   >
//                     {theme.name === t.name && <div className="w-2 h-2 bg-black rounded-full" />}
//                   </button>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// "use client";
// import React, { useState, useRef, useMemo } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { MeshDistortMaterial, Float, MeshWobbleMaterial, Text, PerspectiveCamera, Bloom, EffectComposer } from '@react-three/drei';
// import * as THREE from 'three';

// // 3D Neon Slot Ring
// function NeonSlot({ symbol, isSpinning, position }) {
//   const meshRef = useRef();
  
//   useFrame((state, delta) => {
//     if (isSpinning) {
//       meshRef.current.rotation.x += 15 * delta; // Ultra fast spin
//     } else {
//       // Smoothly ease to a stop
//       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
//     }
//   });

//   return (
//     <Float speed={2} rotationIntensity={0.5}>
//       <mesh ref={meshRef} position={position}>
//         <torusGeometry args={[0.8, 0.2, 16, 100]} />
//         <MeshDistortMaterial 
//           color={isSpinning ? "#ff00ff" : "#00f2ff"} 
//           speed={5} 
//           distort={0.3} 
//           emissive="#00f2ff" 
//           emissiveIntensity={2}
//         />
//         <Text position={[0, 0, 0.5]} fontSize={0.6} color="white" font="/fonts/Inter-Bold.woff">
//           {symbol}
//         </Text>
//       </mesh>
//     </Float>
//   );
// }

// export default function LuxuryCasino() {
//   const [symbols, setSymbols] = useState(["💎", "💎", "💎"]);
//   const [spinning, setSpinning] = useState(false);
//   const [balance, setBalance] = useState(5000);

//   // THE MATH: Weighted RNG
//   const playPulse = () => {
//     if (balance < 50) return;
//     setSpinning(true);
//     setBalance(b => b - 50);

//     setTimeout(() => {
//       const luck = Math.random() * 100;
//       let results;
      
//       if (luck < 5) { // 5% chance of jackpot
//         results = ["🔥", "🔥", "🔥"];
//         setBalance(b => b + 2000);
//       } else if (luck < 25) { // 20% small win
//         results = ["💎", "💎", "💎"];
//         setBalance(b => b + 150);
//       } else { // 75% Loss
//         const options = ["🍒", "🍋", "🔔", "💀"];
//         results = [options[0], options[1], options[2]]; // Randomized
//       }
      
//       setSymbols(results);
//       setSpinning(false);
//     }, 2000);
//   };

//   return (
//     <div className="h-screen w-full bg-[#020202] flex flex-col font-sans">
//       {/* 3D Visualizer */}
//       <div className="h-[70vh] w-full">
//         <Canvas shadows>
//           <PerspectiveCamera makeDefault position={[0, 0, 6]} />
//           <ambientLight intensity={0.2} />
//           <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00ffff" />
          
//           <NeonSlot position={[-2, 0, 0]} symbol={symbols[0]} isSpinning={spinning} />
//           <NeonSlot position={[0, 0, 0]} symbol={symbols[1]} isSpinning={spinning} />
//           <NeonSlot position={[2, 0, 0]} symbol={symbols[2]} isSpinning={spinning} />
          
//           <gridHelper args={[20, 20, "#111", "#111"]} position={[0, -2, 0]} />
//         </Canvas>
//       </div>

//       {/* Responsive Glass UI */}
//       <div className="flex-1 flex flex-col items-center justify-center px-6">
//         <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <p className="text-zinc-500 text-xs uppercase tracking-widest">Vault Balance</p>
//               <h2 className="text-3xl font-mono text-green-400 font-bold">${balance.toLocaleString()}</h2>
//             </div>
//             <div className="text-right">
//               <p className="text-zinc-500 text-xs uppercase tracking-widest">Min Bet</p>
//               <h2 className="text-xl text-white font-bold">$50</h2>
//             </div>
//           </div>

//           <button 
//             onClick={playPulse}
//             disabled={spinning}
//             className={`w-full py-5 rounded-2xl text-xl font-black uppercase tracking-tighter transition-all shadow-[0_0_40px_rgba(0,242,255,0.2)]
//               ${spinning 
//                 ? "bg-zinc-800 text-zinc-600 animate-pulse" 
//                 : "bg-gradient-to-br from-[#00f2ff] to-[#0062ff] text-black hover:scale-[1.02] active:scale-95"
//               }`}
//           >
//             {spinning ? "Processing..." : "Initiate Pulse"}
//           </button>
//         </div>
//         <p className="mt-4 text-[10px] text-zinc-700 tracking-[0.2em] uppercase">Secured by Neural-RNG v4.0</p>
//       </div>
//     </div>
//   );
// }






// "use client";
// import React, { useState } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, Stars, Float, Text } from '@react-three/drei';

// export default function ProfessionalCasino() {
//   const [balance, setBalance] = useState(1000);
//   const [status, setStatus] = useState("PLACE YOUR BET");
//   const [spinning, setSpinning] = useState(false);

//   const handlePlay = () => {
//     if (balance < 20) return;
//     setSpinning(true);
//     setBalance(prev => prev - 20);
//     setStatus("SPINNING...");

//     // MATH ENGINE
//     setTimeout(() => {
//       const rng = Math.random() * 100;
//       let win = 0;

//       if (rng < 2) { // 2% Jackpot
//         win = 500;
//         setStatus("🔥 MEGA JACKPOT! +$500 🔥");
//       } else if (rng < 15) { // 13% Small Win
//         win = 40;
//         setStatus("NICE WIN! +$40");
//       } else {
//         setStatus("TRY AGAIN!");
//       }

//       setBalance(prev => prev + win);
//       setSpinning(false);
//     }, 1500);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
//       {/* Header - Responsive Text */}
//       <header className="p-4 flex justify-between items-center border-b border-yellow-900/30">
//         <h1 className="text-xl md:text-3xl font-black text-yellow-500 italic">NEON SLOTS</h1>
//         <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-yellow-500/50">
//           <span className="text-xs text-zinc-400 block">BALANCE</span>
//           <span className="text-xl font-mono text-green-400">${balance}</span>
//         </div>
//       </header>

//       {/* 3D Game Area - Responsive Height */}
//       <main className="flex-grow relative">
//         <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//           <ambientLight intensity={0.8} />
//           <pointLight position={[10, 10, 10]} intensity={2} color="#ffaa00" />
//           <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
//           <Float speed={spinning ? 10 : 2} rotationIntensity={spinning ? 2 : 0.5}>
//             <mesh scale={[1.5, 1.5, 1.5]}>
//               <boxGeometry args={[1, 1, 1]} />
//               <meshStandardMaterial color="#222" metalness={1} roughness={0} />
//               <Text position={[0, 0, 0.6]} fontSize={0.4} color="gold">
//                 {spinning ? "?" : "💎"}
//               </Text>
//             </mesh>
//           </Float>
//           <OrbitControls enableZoom={false} />
//         </Canvas>

//         {/* Overlay Status */}
//         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//           <h2 className={`text-4xl md:text-6xl font-black transition-all duration-300 ${spinning ? 'scale-110 opacity-50' : 'scale-100'}`}>
//             {status}
//           </h2>
//         </div>
//       </main>

//       {/* Footer Controls - Responsive Layout */}
//       <footer className="p-6 bg-zinc-900/80 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-around border-t border-zinc-800">
//         <div className="flex gap-2">
//           {[10, 20, 50].map(amt => (
//             <button key={amt} className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 border border-zinc-600 transition-colors">
//               ${amt}
//             </button>
//           ))}
//         </div>

//         <button 
//           onClick={handlePlay}
//           disabled={spinning}
//           className="w-full md:w-64 py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold rounded-xl shadow-[0_0_30px_rgba(202,138,4,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all text-xl"
//         >
//           {spinning ? "LOCKED..." : "SPIN REELS"}
//         </button>

//         <p className="text-zinc-500 text-xs hidden md:block">RTP: 96.4% | Provably Fair</p>
//       </footer>
//     </div>
//   );
// }



// "use client";
// import React, { useState, useRef } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Float, Text, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';

// // The 3D Spinning Reel Component
// function SlotReel({ symbol, isSpinning, position }) {
//   const mesh = useRef();
  
//   useFrame((state) => {
//     if (isSpinning) {
//       mesh.current.rotation.x += 0.5; // High speed spin
//     } else {
//       // Smoothly snap to flat position
//       mesh.current.rotation.x = Math.PI * 2; 
//     }
//   });

//   return (
//     <group position={position}>
//       <mesh ref={mesh}>
//         <boxGeometry args={[1, 1, 0.5]} />
//         <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
//         <Text
//           position={[0, 0, 0.26]}
//           fontSize={0.5}
//           color="gold"
//           anchorX="center"
//           anchorY="middle"
//         >
//           {symbol}
//         </Text>
//       </mesh>
//     </group>
//   );
// }

// export default function Casino3D() {
//   const [reels, setReels] = useState(['7', '7', '7']);
//   const [spinning, setSpinning] = useState(false);
//   const [balance, setBalance] = useState(1000);
//   const symbols = ['🍒', '🍋', '🔔', '💎', '7'];

//   const spin = () => {
//     if (balance < 10) return;
//     setSpinning(true);
//     setBalance(b => b - 10);

//     setTimeout(() => {
//       const result = [
//         symbols[Math.floor(Math.random() * symbols.length)],
//         symbols[Math.floor(Math.random() * symbols.length)],
//         symbols[Math.floor(Math.random() * symbols.length)]
//       ];
//       setReels(result);
//       setSpinning(false);

//       // Check for Win
//       if (result[0] === result[1] && result[1] === result[2]) {
//         setBalance(b => b + 500); // Big Win
//       }
//     }, 2000);
//   };

//   return (
//     <div className="w-full h-screen bg-black flex flex-col items-center">
//       {/* 3D UI Area */}
//       <div className="w-full h-2/3">
//         <Canvas>
//           <PerspectiveCamera makeDefault position={[0, 0, 5]} />
//           <ambientLight intensity={0.5} />
//           <pointLight position={[10, 10, 10]} color="#ff00ff" />
          
//           <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
//             <SlotReel position={[-1.2, 0, 0]} symbol={reels[0]} isSpinning={spinning} />
//             <SlotReel position={[0, 0, 0]} symbol={reels[1]} isSpinning={spinning} />
//             <SlotReel position={[1.2, 0, 0]} symbol={reels[2]} isSpinning={spinning} />
//           </Float>

//           {/* Background Decor */}
//           <mesh position={[0, -2, -2]} rotation={[-Math.PI / 2, 0, 0]}>
//             <planeGeometry args={[20, 20]} />
//             <meshStandardMaterial color="#111" />
//           </mesh>
//         </Canvas>
//       </div>

//       {/* Control Panel */}
//       <div className="p-8 bg-zinc-900 border-t-4 border-yellow-500 w-full max-w-2xl rounded-t-3xl shadow-2xl text-center">
//         <h1 className="text-4xl font-bold text-yellow-500 mb-4 tracking-widest">NEXT CASINO</h1>
//         <div className="flex justify-around mb-6">
//           <div className="bg-black p-4 rounded border border-zinc-700">
//             <p className="text-zinc-500 text-xs">BALANCE</p>
//             <p className="text-2xl text-green-400 font-mono">${balance}</p>
//           </div>
//           <div className="bg-black p-4 rounded border border-zinc-700">
//             <p className="text-zinc-500 text-xs">LAST WIN</p>
//             <p className="text-2xl text-yellow-400 font-mono">$0</p>
//           </div>
//         </div>
        
//         <button 
//           onClick={spin}
//           disabled={spinning}
//           className={`px-12 py-4 rounded-full text-2xl font-black transition-all ${
//             spinning ? 'bg-zinc-700 text-zinc-500' : 'bg-gradient-to-r from-yellow-400 to-orange-600 hover:scale-105 active:scale-95 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]'
//           }`}
//         >
//           {spinning ? "SPINNING..." : "SPIN ($10)"}
//         </button>
//       </div>
//     </div>
//   );
// }



// "use client";

// import React, { useState, useEffect, useMemo } from "react";

// // --- Configuration ---
// const CRYPTO_CONFIG = {
//   BTC: { name: "Bitcoin", symbol: "₿", color: "text-orange-500", glow: "shadow-orange-500/20", step: 0.001, min: 0.001 },
//   ETH: { name: "Ethereum", symbol: "Ξ", color: "text-blue-400", glow: "shadow-blue-500/20", step: 0.01, min: 0.01 },
//   SOL: { name: "Solana", symbol: "S", color: "text-purple-500", glow: "shadow-purple-500/20", step: 1, min: 1 },
// };

// type CoinKey = keyof typeof CRYPTO_CONFIG;

// export default function QuantumDynamicVIP() {
//   const [selectedCoin, setSelectedCoin] = useState<CoinKey>("BTC");
//   const [balance, setBalance] = useState(1.2450);
//   const [stake, setStake] = useState(0.001);
//   const [isLive, setIsLive] = useState(false);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [status, setStatus] = useState<"IDLE" | "RUNNING" | "CRASHED" | "SUCCESS">("IDLE");

//   const config = CRYPTO_CONFIG[selectedCoin];

//   // Logic: Multiplier Growth
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isLive && status === "RUNNING") {
//       interval = setInterval(() => {
//         setMultiplier((prev) => prev + (prev * 0.015 + Math.random() * 0.04));
//       }, 100);
//     }
//     return () => clearInterval(interval);
//   }, [isLive, status]);

//   const initiatePulse = () => {
//     if (isLive || balance < stake) return;
//     setBalance(prev => Number((prev - stake).toFixed(4)));
//     setIsLive(true);
//     setStatus("RUNNING");
//     setMultiplier(1.0);

//     const crashAt = 1.2 + Math.random() * 6;
//     setTimeout(() => {
//       setStatus(curr => {
//         if (curr === "RUNNING") {
//           setIsLive(false);
//           return "CRASHED";
//         }
//         return curr;
//       });
//     }, crashAt * 1000);
//   };

//   const cashOut = () => {
//     if (status !== "RUNNING") return;
//     const win = stake * multiplier;
//     setBalance(prev => Number((prev + win).toFixed(4)));
//     setIsLive(false);
//     setStatus("SUCCESS");
//   };

//   return (
//     <div className={`min-h-screen bg-[#020205] text-white font-sans p-4 md:p-10 transition-all duration-700 ${
//       status === 'CRASHED' ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : 
//       status === 'SUCCESS' ? 'shadow-[inset_0_0_100px_rgba(16,185,129,0.2)]' : ''
//     }`}>
      
//       {/* 1. DYNAMIC HEADER */}
//       <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/5 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
//         <div className="flex items-center gap-4">
//           <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10">
//             <span className={`text-2xl font-black italic ${config.color}`}>{config.symbol}</span>
//           </div>
//           <div>
//             <h1 className="text-xl font-black tracking-tighter uppercase italic">Quantum Terminal</h1>
//             <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Node: {selectedCoin}_MAINNET</p>
//           </div>
//         </div>

//         {/* Currency Selector */}
//         <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
//           {(Object.keys(CRYPTO_CONFIG) as CoinKey[]).map((coin) => (
//             <button
//               key={coin}
//               onClick={() => { if(!isLive) setSelectedCoin(coin); setStake(CRYPTO_CONFIG[coin].min); }}
//               className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
//                 selectedCoin === coin ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
//               }`}
//             >
//               {coin}
//             </button>
//           ))}
//         </div>

//         <div className="text-right">
//           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Balance</p>
//           <p className={`text-2xl font-mono font-black ${config.color}`}>{balance} {selectedCoin}</p>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
//         {/* 2. ENGINE VIEW */}
//         <section className="lg:col-span-8">
//           <div className={`relative h-[400px] md:h-[550px] rounded-[3.5rem] flex flex-col items-center justify-center overflow-hidden border transition-all duration-1000 ${
//             status === 'CRASHED' ? 'bg-red-950/20 border-red-500/50' : 
//             status === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-500/50' : 
//             'bg-zinc-900/20 border-white/5'
//           }`}>
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
            
//             <div className="relative z-10 flex flex-col items-center">
//               <span className={`text-[12vw] font-black italic tracking-tighter transition-all duration-300 ${
//                 status === 'CRASHED' ? 'text-red-500 scale-90' : 
//                 status === 'SUCCESS' ? 'text-emerald-400 scale-110' : 
//                 config.color
//               }`}>
//                 {multiplier.toFixed(2)}x
//               </span>
//               <p className="text-zinc-600 font-bold tracking-[0.6em] uppercase text-xs">Multiplier Pulse</p>
//             </div>

//             {/* Win/Loss Status Overlay */}
//             {status !== 'IDLE' && status !== 'RUNNING' && (
//               <div className="absolute top-10 animate-bounce bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
//                  <span className={`text-xs font-black uppercase tracking-widest ${status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-500'}`}>
//                     {status === 'SUCCESS' ? 'Payout Liquidated' : 'Terminal Busted'}
//                  </span>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* 3. DYNAMIC CONTROL DECK */}
//         <aside className="lg:col-span-4 flex flex-col gap-6">
//           <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
//             <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-8">Stake Protocol</h2>
            
//             <div className="space-y-8">
//               <div>
//                 <div className="flex justify-between mb-3 px-2">
//                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</span>
//                   <span className={`text-[10px] font-bold uppercase ${config.color}`}>+ {config.step} Incr.</span>
//                 </div>
//                 <div className="flex items-center gap-3 bg-black/60 p-3 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
//                   <button onClick={() => setStake(prev => Math.max(config.min, prev - config.step))} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-xl">-</button>
//                   <div className="flex-1 text-center">
//                     <span className="block text-[10px] text-zinc-600 font-bold uppercase">{selectedCoin} Units</span>
//                     <input 
//                       type="number" 
//                       value={stake} 
//                       onChange={(e) => setStake(Number(e.target.value))}
//                       className="bg-transparent text-center w-full font-mono font-black text-2xl outline-none text-white"
//                     />
//                   </div>
//                   <button onClick={() => setStake(prev => prev + config.step)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-xl">+</button>
//                 </div>
//               </div>

//               {isLive ? (
//                 <button 
//                   onClick={cashOut}
//                   className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-2xl rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 uppercase italic"
//                 >
//                   Withdraw {(stake * multiplier).toFixed(4)}
//                 </button>
//               ) : (
//                 <button 
//                   onClick={initiatePulse}
//                   className={`w-full py-6 bg-white text-black font-black text-2xl rounded-3xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all active:scale-95 uppercase italic hover:bg-zinc-200`}
//                 >
//                   Start {selectedCoin} Pulse
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5">
//              <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">
//                 <span>Network Status</span>
//                 <span className="text-emerald-500">Online</span>
//              </div>
//              <div className="flex items-center gap-3 text-xs">
//                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                 <p className="text-zinc-500">Broadcasting via {selectedCoin === 'BTC' ? 'Lightning' : 'Mainnet'}...</p>
//              </div>
//           </div>
//         </aside>
//       </main>

//       <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex justify-between z-50 shadow-2xl">
//          <button className="flex-1 py-3 text-[10px] font-black uppercase text-white bg-white/10 rounded-full">Gaming</button>
//          <button className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all">Exchange</button>
//          <button className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-all">Profile</button>
//       </footer>
//     </div>
//   );
// }







// "use client";

// import React, { useState, useEffect, useCallback } from "react";

// // Types for the History
// type BetHistory = {
//   id: string;
//   amount: number;
//   multiplier: number;
//   type: "WIN" | "LOSS";
//   time: string;
// };

// export default function VIPQuantumPremium() {
//   const [balance, setBalance] = useState(25000.00);
//   const [betAmount, setBetAmount] = useState(100);
//   const [isLive, setIsLive] = useState(false);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [history, setHistory] = useState<BetHistory[]>([]);
//   const [status, setStatus] = useState<"IDLE" | "RUNNING" | "CRASHED" | "SUCCESS">("IDLE");

//   // Logic: Pulse Animation with exponential growth feel
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isLive && status === "RUNNING") {
//       interval = setInterval(() => {
//         setMultiplier((prev) => prev + (prev * 0.02 + Math.random() * 0.05));
//       }, 100);
//     }
//     return () => clearInterval(interval);
//   }, [isLive, status]);

//   const startPulse = () => {
//     if (isLive || balance < betAmount) return;
    
//     setIsLive(true);
//     setStatus("RUNNING");
//     setBalance(prev => prev - betAmount);
//     setMultiplier(1.0);

//     // Random Crash point logic (Realistically between 1.1x and 10x)
//     const crashAt = 1.1 + Math.random() * 8;

//     setTimeout(() => {
//       // Check if user already cashed out
//       setStatus(current => {
//         if (current === "RUNNING") {
//           setIsLive(false);
//           const newEntry: BetHistory = {
//             id: Math.random().toString(36).substr(2, 4).toUpperCase(),
//             amount: betAmount,
//             multiplier: 0,
//             type: "LOSS",
//             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//           };
//           setHistory(prev => [newEntry, ...prev].slice(0, 5));
//           return "CRASHED";
//         }
//         return current;
//       });
//     }, crashAt * 1000);
//   };

//   const cashOut = () => {
//     if (status !== "RUNNING") return;
    
//     const winAmount = betAmount * multiplier;
//     setBalance(prev => prev + winAmount);
//     setIsLive(false);
//     setStatus("SUCCESS");
    
//     const newEntry: BetHistory = {
//       id: Math.random().toString(36).substr(2, 4).toUpperCase(),
//       amount: betAmount,
//       multiplier: Number(multiplier.toFixed(2)),
//       type: "WIN",
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };
//     setHistory(prev => [newEntry, ...prev].slice(0, 5));
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-1000 ${
//       status === 'CRASHED' ? 'bg-[#150505]' : status === 'SUCCESS' ? 'bg-[#05150a]' : 'bg-[#030305]'
//     } text-white font-sans p-4 md:p-8 overflow-x-hidden selection:bg-purple-500/30`}>
      
//       {/* 1. TOP NAVIGATION / WALLET */}
//       <nav className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
//             <span className="font-black text-lg">Q</span>
//           </div>
//           <h1 className="text-xl font-black tracking-tighter italic uppercase hidden sm:block">Titanium.X</h1>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="text-right hidden sm:block">
//             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Global Balance</p>
//             <p className="text-lg font-mono font-black text-emerald-400">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
//           </div>
//           <button className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Vault</button>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
//         {/* 2. THE ENGINE (VISUAL CORE) */}
//         <section className="lg:col-span-8 relative group">
//           <div className={`relative h-[350px] md:h-[550px] rounded-[3rem] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 shadow-2xl border ${
//             status === 'CRASHED' ? 'border-red-500/50 bg-red-950/10' : 
//             status === 'SUCCESS' ? 'border-emerald-500/50 bg-emerald-950/10' : 
//             'border-white/5 bg-zinc-900/20'
//           }`}>
            
//             {/* Ambient Background Pulse */}
//             <div className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ${isLive ? 'opacity-40' : 'opacity-10'}`}>
//               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e5_0%,transparent_70%)]" />
//             </div>

//             <div className="relative z-20 flex flex-col items-center">
//               {/* Multiplier Display */}
//               <div className={`text-[12vw] font-black italic tracking-tighter leading-none transition-all duration-300 ${
//                 status === 'CRASHED' ? 'text-red-500 animate-shake scale-90' : 
//                 status === 'SUCCESS' ? 'text-emerald-400 scale-110 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]' : 
//                 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]'
//               }`}>
//                 {multiplier.toFixed(2)}x
//               </div>
//               <p className="text-zinc-500 font-bold tracking-[0.6em] uppercase text-[10px] mt-2">Quantum Yield</p>
//             </div>

//             {/* Status Overlays */}
//             {status === "CRASHED" && (
//               <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
//                 <span className="text-5xl font-black italic uppercase tracking-tighter text-red-100 drop-shadow-lg">Busted</span>
//               </div>
//             )}
//             {status === "SUCCESS" && (
//               <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in">
//                  <div className="text-center">
//                    <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Payment Secured</p>
//                    <p className="text-5xl font-black italic uppercase tracking-tighter text-white">Profit: ${(betAmount * multiplier).toFixed(2)}</p>
//                  </div>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* 3. CONTROL & DATA CENTER */}
//         <aside className="lg:col-span-4 space-y-6">
          
//           <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
//             <h2 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-6">Execution Deck</h2>
            
//             <div className="space-y-6">
//               {/* Input Group */}
//               <div>
//                 <div className="flex justify-between items-center mb-2 px-2">
//                   <span className="text-[10px] font-bold text-zinc-500 uppercase">Input Stake</span>
//                   <span className="text-[10px] font-bold text-emerald-500 uppercase">Min: $10</span>
//                 </div>
//                 <div className="flex items-center gap-3 bg-black/50 p-3 rounded-2xl border border-white/5 ring-1 ring-white/5 hover:ring-purple-500/50 transition-all">
//                   <button onClick={() => setBetAmount(prev => Math.max(10, prev - 100))} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-xl">-</button>
//                   <input 
//                     type="number" 
//                     value={betAmount} 
//                     onChange={(e) => setBetAmount(Number(e.target.value))}
//                     className="bg-transparent text-center flex-1 font-mono font-black text-2xl outline-none text-purple-400"
//                   />
//                   <button onClick={() => setBetAmount(prev => prev + 100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-black text-xl">+</button>
//                 </div>
//               </div>

//               {/* Action Button */}
//               {isLive ? (
//                 <button 
//                   onClick={cashOut}
//                   className="group relative w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-2xl rounded-2xl shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 uppercase italic overflow-hidden"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//                   Cash Out
//                 </button>
//               ) : (
//                 <button 
//                   onClick={startPulse}
//                   className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white font-black text-2xl rounded-2xl shadow-[0_15px_40px_rgba(147,51,234,0.3)] transition-all active:scale-95 uppercase italic"
//                 >
//                   Initiate Pulse
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Real-time Ledger */}
//           <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 shadow-inner">
//              <div className="flex justify-between items-center mb-5">
//                 <h3 className="text-xs font-black text-zinc-600 uppercase tracking-widest">Draw Logs</h3>
//                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//              </div>
//              <div className="space-y-3">
//                 {history.map((item) => (
//                   <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-2 h-2 rounded-full ${item.type === 'WIN' ? 'bg-emerald-500' : 'bg-red-500'}`} />
//                       <div className="flex flex-col">
//                         <span className="text-[10px] text-zinc-500 font-mono">#{item.id}</span>
//                         <span className="text-xs font-bold">${item.amount.toLocaleString()}</span>
//                       </div>
//                     </div>
//                     <span className={`font-black italic text-lg ${item.type === 'WIN' ? 'text-emerald-400' : 'text-red-500'}`}>
//                       {item.type === 'WIN' ? `${item.multiplier}x` : '0.00x'}
//                     </span>
//                   </div>
//                 ))}
//                 {!history.length && <p className="text-center text-zinc-700 text-[10px] py-10 uppercase tracking-widest italic">Awaiting Terminal Input...</p>}
//              </div>
//           </div>
//         </aside>
//       </main>

//       {/* FOOTER: Global Interface Tabs */}
//       <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[450px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex justify-between z-50 shadow-2xl">
//         <NavTab active label="Lobby" />
//         <NavTab label="Exchange" />
//         <NavTab label="Terminal" />
//         <NavTab label="System" />
//       </footer>

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translate(0, 0); }
//           25% { transform: translate(-5px, 0); }
//           75% { transform: translate(5px, 0); }
//         }
//         .animate-shake {
//           animation: shake 0.15s infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// function NavTab({ label, active = false }: { label: string; active?: boolean }) {
//   return (
//     <button className={`flex-1 py-3 px-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
//       active ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/20' : 'text-zinc-500 hover:text-white'
//     }`}>
//       {label}
//     </button>
//   );
// }




// "use client";

// import React, { useState, useEffect, useMemo } from "react";

// // Types for the History
// type BetHistory = {
//   id: string;
//   amount: number;
//   multiplier: number;
//   type: "WIN" | "LOSS";
//   time: string;
// };

// export default function VIPQuantumPage() {
//   const [balance, setBalance] = useState(15750.50);
//   const [betAmount, setBetAmount] = useState(100);
//   const [isLive, setIsLive] = useState(false);
//   const [multiplier, setMultiplier] = useState(1.0);
//   const [history, setHistory] = useState<BetHistory[]>([]);
//   const [status, setStatus] = useState<"IDLE" | "RUNNING" | "CRASHED" | "SUCCESS">("IDLE");

//   // Logic: Pulse Animation
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (isLive) {
//       interval = setInterval(() => {
//         setMultiplier((prev) => prev + (Math.random() * 0.1));
//       }, 100);
//     }
//     return () => clearInterval(interval);
//   }, [isLive]);

//   const startPulse = () => {
//     if (isLive || balance < betAmount) return;
    
//     setIsLive(true);
//     setStatus("RUNNING");
//     setBalance(prev => prev - betAmount);
//     setMultiplier(1.0);

//     // Random Crash point logic
//     const crashAt = 1.5 + Math.random() * 5;

//     setTimeout(() => {
//       if (status !== "SUCCESS") {
//         setIsLive(false);
//         setStatus("CRASHED");
//         const newEntry: BetHistory = {
//           id: Math.random().toString(36).substr(2, 4).toUpperCase(),
//           amount: betAmount,
//           multiplier: 0,
//           type: "LOSS",
//           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         };
//         setHistory(prev => [newEntry, ...prev].slice(0, 5));
//       }
//     }, crashAt * 1000);
//   };

//   const cashOut = () => {
//     if (!isLive || status !== "RUNNING") return;
    
//     const winAmount = betAmount * multiplier;
//     setBalance(prev => prev + winAmount);
//     setIsLive(false);
//     setStatus("SUCCESS");
    
//     const newEntry: BetHistory = {
//       id: Math.random().toString(36).substr(2, 4).toUpperCase(),
//       amount: betAmount,
//       multiplier: Number(multiplier.toFixed(2)),
//       type: "WIN",
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };
//     setHistory(prev => [newEntry, ...prev].slice(0, 5));
//   };

//   return (
//     <div className="min-h-screen bg-[#050508] text-white font-sans p-4 md:p-10 selection:bg-purple-500/30">
      
//       {/* HEADER: Glassmorphism HUD */}
//       <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
//             <span className="font-black text-xl italic">Q</span>
//           </div>
//           <div>
//             <h1 className="text-xl font-black tracking-tighter uppercase">Quantum.VIP</h1>
//             <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">High Stakes Terminal</p>
//           </div>
//         </div>

//         <div className="flex gap-6">
//           <div className="text-right">
//             <p className="text-[10px] text-zinc-500 font-bold uppercase">Net Worth</p>
//             <p className="text-xl font-mono font-black text-emerald-400">${balance.toLocaleString()}</p>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
//         {/* LEFT: THE PULSE ENGINE */}
//         <section className="lg:col-span-8 relative">
//           <div className={`relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ${
//             status === 'CRASHED' ? 'bg-red-950/20' : status === 'SUCCESS' ? 'bg-emerald-950/20' : 'bg-zinc-900/30'
//           } border border-white/5 shadow-inner`}>
            
//             {/* Animated Grid Background */}
//             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            
//             <div className="relative z-10 text-center">
//               <span className={`text-[10vw] font-black italic tracking-tighter transition-all duration-300 ${
//                 status === 'CRASHED' ? 'text-red-500 scale-95' : status === 'SUCCESS' ? 'text-emerald-400 scale-110' : 'text-white'
//               }`}>
//                 {multiplier.toFixed(2)}x
//               </span>
//               <p className="text-zinc-500 font-bold tracking-[0.5em] uppercase mt-[-20px]">Current Yield</p>
//             </div>

//             {/* Dynamic Visual Ring */}
//             <div className={`absolute w-64 h-64 md:w-96 md:h-96 rounded-full border-[20px] transition-all duration-1000 blur-xl opacity-20 ${
//                isLive ? 'animate-ping border-purple-500' : 'border-zinc-800'
//             }`} />
//           </div>
//         </section>

//         {/* RIGHT: CONTROL DECK */}
//         <aside className="lg:col-span-4 space-y-6">
          
//           {/* Action Card */}
//           <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
//             <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Execution Panel</h2>
            
//             <div className="space-y-6">
//               <div>
//                 <label className="text-[10px] font-bold text-zinc-600 uppercase ml-2">Stake Amount</label>
//                 <div className="flex items-center gap-2 mt-2 bg-black/40 p-2 rounded-2xl border border-white/5">
//                   <button onClick={() => setBetAmount(prev => Math.max(10, prev - 50))} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold">-</button>
//                   <input 
//                     type="number" 
//                     value={betAmount} 
//                     onChange={(e) => setBetAmount(Number(e.target.value))}
//                     className="bg-transparent text-center flex-1 font-mono font-black text-xl outline-none"
//                   />
//                   <button onClick={() => setBetAmount(prev => prev + 50)} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold">+</button>
//                 </div>
//               </div>

//               {isLive ? (
//                 <button 
//                   onClick={cashOut}
//                   className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 uppercase italic"
//                 >
//                   Cash Out
//                 </button>
//               ) : (
//                 <button 
//                   onClick={startPulse}
//                   className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(147,51,234,0.3)] transition-all active:scale-95 uppercase italic"
//                 >
//                   Start Pulse
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* History Card */}
//           <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
//              <h3 className="text-xs font-black text-zinc-600 uppercase mb-4 tracking-widest">Recent Node Exports</h3>
//              <div className="space-y-3">
//                 {history.map((item) => (
//                   <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
//                     <div className="flex flex-col">
//                       <span className="text-[10px] text-zinc-500 font-mono">TX_{item.id}</span>
//                       <span className="text-xs font-bold">${item.amount}</span>
//                     </div>
//                     <span className={`font-black italic ${item.type === 'WIN' ? 'text-emerald-400' : 'text-red-500'}`}>
//                       {item.type === 'WIN' ? `+${item.multiplier}x` : 'BUST'}
//                     </span>
//                   </div>
//                 ))}
//                 {!history.length && <p className="text-center text-zinc-700 text-xs py-4">Awaiting first execution...</p>}
//              </div>
//           </div>
//         </aside>
//       </main>

//       {/* FOOTER: Mobile Navigation */}
//       <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex justify-between z-50">
//         <NavButton active icon="◈" label="Lobby" />
//         <NavButton icon="⌥" label="Vault" />
//         <NavButton icon="⊞" label="Nodes" />
//         <NavButton icon="⚙" label="Config" />
//       </footer>
//     </div>
//   );
// }

// function NavButton({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
//   return (
//     <button className={`flex flex-col items-center flex-1 py-2 rounded-full transition-all ${active ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
//       <span className="text-lg">{icon}</span>
//       <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{label}</span>
//     </button>
//   );
// }



// "use client";

// import React, { useState, useMemo } from "react";

// // --- Logic Data ---
// const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
// const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// export default function HyperFusionCasino() {
//   // --- Game State ---
//   const [balance, setBalance] = useState(2.450); // BTC/ETH
//   const [stake, setStake] = useState(0);
//   const [selectedSide, setSelectedSide] = useState<"RED" | "BLACK" | null>(null);
//   const [spinning, setSpinning] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [lastWin, setLastWin] = useState<number | null>(null);
//   const [feedback, setFeedback] = useState({ msg: "Select Stake", type: "idle" });

//   // --- Handlers ---
//   const deposit = () => setBalance(b => Number((b + 0.1).toFixed(3)));

//   const addStake = (val: number) => {
//     if (spinning || balance < val) return;
//     setBalance(b => Number((b - val).toFixed(3)));
//     setStake(s => Number((s + val).toFixed(3)));
//     setFeedback({ msg: "Stake Added", type: "idle" });
//   };

//   const removeStake = () => {
//     if (spinning) return;
//     setBalance(b => Number((b + stake).toFixed(3)));
//     setStake(0);
//     setSelectedSide(null);
//   };

//   const spin = () => {
//     if (spinning || stake === 0 || !selectedSide) return;

//     setSpinning(true);
//     setFeedback({ msg: "Verifying Tx...", type: "idle" });

//     const stopIdx = Math.floor(Math.random() * 37);
//     const winNum = WHEEL_NUMBERS[stopIdx];
//     const isRed = REDS.includes(winNum);
//     const winColor = winNum === 0 ? "green" : isRed ? "red" : "black";

//     const rot = (12 * 360) + (360 - (stopIdx * (360 / 37)));
//     setRotation(prev => prev + rot);

//     setTimeout(() => {
//       setSpinning(false);
//       setLastWin(winNum);
      
//       const won = (winColor === "red" && selectedSide === "RED") || (winColor === "black" && selectedSide === "BLACK");

//       if (won) {
//         setBalance(b => Number((b + (stake * 2)).toFixed(3)));
//         setFeedback({ msg: `WIN! +${stake * 2} BTC`, type: "win" });
//       } else {
//         setFeedback({ msg: "STAKE LIQUIDATED", type: "loss" });
//       }
//       setStake(0);
//       setSelectedSide(null);
//     }, 7500);
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-1000 ${
//       feedback.type === 'win' ? 'bg-[#05150a]' : feedback.type === 'loss' ? 'bg-[#150505]' : 'bg-[#020205]'
//     } text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-24 md:pb-8`}>
      
//       {/* 1. TOP NAVIGATION / WALLET */}
//       <nav className="max-w-7xl mx-auto p-4 md:p-8 flex justify-between items-center">
//         <div className="flex items-center gap-2 group cursor-default">
//           <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
//           <h1 className="text-2xl font-black tracking-tighter italic">NEON.X</h1>
//         </div>

//         <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-1 pl-4 rounded-2xl border border-white/10">
//           <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline">Main Wallet</span>
//           <div className="bg-black/40 px-4 py-2 rounded-xl flex items-center gap-2">
//             <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
//             <span className="font-mono font-bold">{balance} BTC</span>
//           </div>
//           <button onClick={deposit} className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 uppercase">Deposit</button>
//         </div>
//       </nav>

//       {/* 2. GAME HUB */}
//       <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-4">
        
//         {/* LEFT: 3D WHEEL SPATIAL VIEW */}
//         <div className="lg:col-span-7 flex flex-col items-center relative">
//           <div className={`mb-10 px-10 py-3 rounded-full border-2 transition-all duration-700 text-sm font-black uppercase tracking-[0.3em] ${
//             feedback.type === 'win' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] scale-110' :
//             feedback.type === 'loss' ? 'bg-red-500/10 border-red-500 text-red-500' :
//             'bg-zinc-900 border-white/5 text-zinc-500'
//           }`}>
//             {feedback.msg}
//           </div>

//           <div className="relative group">
//              {/* Dynamic Glow */}
//              <div className={`absolute -inset-20 blur-[120px] rounded-full opacity-20 transition-colors duration-1000 ${
//                feedback.type === 'win' ? 'bg-emerald-500' : feedback.type === 'loss' ? 'bg-red-500' : 'bg-cyan-500'
//              }`} />
             
//              {/* The Master Wheel */}
//              <div className="relative w-[320px] h-[320px] md:w-[540px] md:h-[540px] rounded-full p-4 bg-zinc-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border-b-[12px] border-black">
//                 <div 
//                   className="w-full h-full rounded-full relative overflow-hidden transition-transform shadow-[inset_0_0_60px_rgba(0,0,0,1)] border-4 border-white/5"
//                   style={{
//                     transform: `rotate(${rotation}deg)`,
//                     transition: spinning ? "transform 7.5s cubic-bezier(0.1, 0, 0, 1)" : "none",
//                     background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)'
//                   }}
//                 >
//                   {WHEEL_NUMBERS.map((n, i) => (
//                     <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[6.2%] h-[50%] origin-bottom" style={{ transform: `rotate(${(360/37)*i}deg)` }}>
//                       <div className={`w-full h-[85%] rounded-t-sm pt-4 flex justify-center text-[11px] font-black border-x border-white/5 ${REDS.includes(n) ? 'bg-red-600' : n === 0 ? 'bg-emerald-600' : 'bg-zinc-950 text-zinc-400'}`}>
//                         {n}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Hub Controller */}
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <button 
//                     onClick={spin}
//                     disabled={spinning}
//                     className={`w-28 h-28 md:w-44 md:h-44 rounded-full bg-black/80 border-[8px] border-zinc-900 shadow-2xl flex flex-col items-center justify-center transition-all active:scale-90 pointer-events-auto ${spinning ? 'opacity-30' : 'hover:border-cyan-500/40 group-hover:scale-105'}`}
//                   >
//                     <span className="text-cyan-500 font-black text-2xl tracking-tighter italic">{spinning ? '...' : 'SPIN'}</span>
//                     <span className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Ready to Mint</span>
//                   </button>
//                 </div>

//                 {/* Neon Pointer */}
//                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
//                    <div className="w-1 h-10 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] rounded-full" />
//                    <div className="w-3 h-3 bg-white rounded-full -mt-2 blur-[1px] animate-pulse" />
//                 </div>
//              </div>
//           </div>
//         </div>

//         {/* RIGHT: BETTING DECK */}
//         <div className="lg:col-span-5 flex flex-col gap-6">
//           <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
//              {/* Decoration */}
//              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-10 -mt-10" />
             
//              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Execution Deck</h2>

//              <div className="grid grid-cols-2 gap-4">
//                 <button 
//                   onClick={() => setSelectedSide("RED")}
//                   className={`h-40 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${selectedSide === 'RED' ? 'bg-red-600 border-white shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-red-950/20 border-red-500/10 hover:border-red-500/50'}`}
//                 >
//                   <span className="text-4xl group-hover:scale-110 transition-transform">♦</span>
//                   <span className="font-black italic text-xl">RED</span>
//                 </button>

//                 <button 
//                   onClick={() => setSelectedSide("BLACK")}
//                   className={`h-40 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${selectedSide === 'BLACK' ? 'bg-zinc-800 border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
//                 >
//                   <span className="text-4xl group-hover:scale-110 transition-transform text-zinc-400">♠</span>
//                   <span className="font-black italic text-xl">BLACK</span>
//                 </button>
//              </div>

//              {/* Stake Controller */}
//              <div className="mt-8 space-y-4">
//                 <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
//                    <div className="flex flex-col">
//                       <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Stake</span>
//                       <span className="text-xl font-mono font-black text-cyan-400">{stake} BTC</span>
//                    </div>
//                    <button onClick={removeStake} className="text-[10px] font-black uppercase text-zinc-600 hover:text-red-400 transition-colors">Recall</button>
//                 </div>
                
//                 <div className="flex gap-2">
//                    {[0.01, 0.05, 0.1, 0.5].map(v => (
//                      <button key={v} onClick={() => addStake(v)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all active:scale-95">+{v}</button>
//                    ))}
//                 </div>
//              </div>
//           </div>

//           {/* Activity Log (Mini) */}
//           <div className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5">
//              <div className="flex justify-between items-center mb-4">
//                 <span className="text-[10px] font-black text-zinc-600 uppercase">Draw History</span>
//                 <span className="text-[10px] font-bold text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-md">Live Node</span>
//              </div>
//              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                 {lastWin !== null && (
//                   <div className={`min-w-[40px] h-10 rounded-lg flex items-center justify-center font-bold text-sm ${REDS.includes(lastWin) ? 'bg-red-500' : lastWin === 0 ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
//                     {lastWin}
//                   </div>
//                 )}
//                 {[23, 11, 4, 32].map((n, i) => (
//                   <div key={i} className="min-w-[40px] h-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-sm opacity-30">{n}</div>
//                 ))}
//              </div>
//           </div>
//         </div>
//       </main>

//       {/* 3. MOBILE TAB BAR (Only on small screens) */}
//       <footer className="fixed bottom-0 left-0 w-full md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around p-4 z-[100]">
//          <div className="flex flex-col items-center gap-1 text-cyan-500">
//             <div className="w-5 h-5 border-2 border-cyan-500 rounded-md" />
//             <span className="text-[8px] font-black uppercase">Play</span>
//          </div>
//          <div className="flex flex-col items-center gap-1 text-zinc-600">
//             <div className="w-5 h-5 border-2 border-zinc-600 rounded-full" />
//             <span className="text-[8px] font-black uppercase">Wallet</span>
//          </div>
//          <div className="flex flex-col items-center gap-1 text-zinc-600">
//             <div className="w-5 h-5 border-2 border-zinc-600 rounded-sm rotate-45" />
//             <span className="text-[8px] font-black uppercase">Stats</span>
//          </div>
//       </footer>
//     </div>
//   );
// }




// "use client";

// import React, { useState, useEffect, useCallback } from "react";

// // --- Configuration ---
// const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
// const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// export default function CryptoCasinoV3() {
//   // --- State ---
//   const [balance, setBalance] = useState(1.254); // Represented in ETH/BTC
//   const [activeBet, setActiveBet] = useState(0);
//   const [selectedBetSide, setSelectedBetSide] = useState<"RED" | "BLACK" | null>(null);
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [wheelRotation, setWheelRotation] = useState(0);
//   const [status, setStatus] = useState<{ msg: string; type: "win" | "loss" | "idle" | "err" }>({ msg: "Awaiting Stake", type: "idle" });
//   const [history, setHistory] = useState<number[]>([]);

//   // --- Logic: Crypto Conversions ---
//   const chipValue = 0.001; // 1 Chip = 0.001 Crypto

//   const addCrypto = (amount: number) => {
//     if (isSpinning) return;
//     setBalance(prev => prev + amount);
//     setStatus({ msg: `Deposited ${amount} ETH`, type: "idle" });
//   };

//   const placeBet = (side: "RED" | "BLACK") => {
//     if (isSpinning) return;
//     if (balance < chipValue) {
//       setStatus({ msg: "Insufficient Crypto", type: "err" });
//       return;
//     }
//     setBalance(prev => Number((prev - chipValue).toFixed(4)));
//     setActiveBet(prev => Number((prev + chipValue).toFixed(4)));
//     setSelectedBetSide(side);
//     setStatus({ msg: `Betting on ${side}`, type: "idle" });
//   };

//   const removeBets = () => {
//     if (isSpinning) return;
//     setBalance(prev => Number((prev + activeBet).toFixed(4)));
//     setActiveBet(0);
//     setSelectedBetSide(null);
//     setStatus({ msg: "Stake Refilled to Wallet", type: "idle" });
//   };

//   const play = () => {
//     if (isSpinning || activeBet === 0 || !selectedBetSide) {
//       if (!selectedBetSide) setStatus({ msg: "Select Red or Black", type: "err" });
//       return;
//     };

//     setIsSpinning(true);
//     setStatus({ msg: "Broadcasting to Blockchain...", type: "idle" });

//     const stopIndex = Math.floor(Math.random() * 37);
//     const winningNumber = WHEEL_NUMBERS[stopIndex];
//     const isRed = REDS.includes(winningNumber);
//     const winColor = winningNumber === 0 ? "green" : isRed ? "red" : "black";

//     const extraSpins = (12 + Math.floor(Math.random() * 6)) * 360;
//     const finalRot = extraSpins + (360 - (stopIndex * (360 / 37)));
//     setWheelRotation(prev => prev + finalRot);

//     setTimeout(() => {
//       setIsSpinning(false);
//       setHistory(prev => [winningNumber, ...prev].slice(0, 10));
      
//       const won = (winColor === "red" && selectedBetSide === "RED") || 
//                   (winColor === "black" && selectedBetSide === "BLACK");

//       if (won) {
//         const payout = activeBet * 2;
//         setBalance(prev => Number((prev + payout).toFixed(4)));
//         setStatus({ msg: `🎉 WON ${payout} ETH`, type: "win" });
//       } else {
//         setStatus({ msg: "STAKE LOST", type: "loss" });
//       }
//       setActiveBet(0);
//       setSelectedBetSide(null);
//     }, 7500);
//   };

//   return (
//     <div className="min-h-screen bg-[#020204] text-slate-200 font-sans p-2 md:p-8 selection:bg-cyan-500/30">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
//         {/* --- LEFT COLUMN: WALLET & STATS --- */}
//         <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
//           <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl">
//             <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Crypto Wallet</h2>
//             <div className="space-y-4">
//               <div className="bg-black/60 p-4 rounded-2xl border border-cyan-500/20 shadow-inner">
//                 <p className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Available Balance</p>
//                 <div className="flex items-center gap-2">
//                    <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold">Ξ</div>
//                    <span className="text-2xl font-mono font-bold tracking-tighter">{balance} ETH</span>
//                 </div>
//               </div>
//               <button 
//                 onClick={() => addCrypto(0.1)}
//                 className="w-full py-3 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 text-xs font-black uppercase transition-all active:scale-95"
//               >
//                 + Deposit 0.1 ETH
//               </button>
//             </div>
//           </div>

//           <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-3xl">
//              <h3 className="text-xs font-black text-zinc-600 uppercase mb-4">Live Ledger</h3>
//              <div className="flex flex-wrap gap-2">
//                 {history.map((h, i) => (
//                   <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border border-white/5 ${REDS.includes(h) ? 'bg-red-500/20 text-red-400' : h === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
//                     {h}
//                   </div>
//                 ))}
//              </div>
//           </div>
//         </aside>

//         {/* --- CENTER: THE NEON WHEEL --- */}
//         <main className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
//           {/* Status Banner */}
//           <div className={`mb-8 px-8 py-3 rounded-full border-2 transition-all duration-500 font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
//             status.type === 'win' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 animate-pulse' :
//             status.type === 'loss' ? 'bg-red-500/10 border-red-500 text-red-500' :
//             status.type === 'err' ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-orange-500/20' :
//             'bg-zinc-900 border-white/10 text-zinc-400'
//           }`}>
//             {status.msg}
//           </div>

//           <div className="relative group">
//             {/* 3D Visual Depth Rings */}
//             <div className="absolute -inset-10 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
            
//             {/* The Main Wheel */}
//             <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] rounded-full p-3 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]">
//               <div 
//                 className="w-full h-full rounded-full relative overflow-hidden transition-transform shadow-[inset_0_0_60px_rgba(0,0,0,1)] border-4 border-white/5"
//                 style={{
//                   transform: `rotate(${wheelRotation}deg)`,
//                   transition: isSpinning ? "transform 7.5s cubic-bezier(0.15, 0, 0, 1)" : "none",
//                 }}
//               >
//                 {WHEEL_NUMBERS.map((n, i) => (
//                   <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[6.5%] h-[50%] origin-bottom" style={{ transform: `rotate(${(360/37)*i}deg)` }}>
//                     <div className={`w-full h-[85%] pt-3 flex justify-center text-[10px] font-black border-x border-white/5 ${REDS.includes(n) ? 'bg-red-600' : n === 0 ? 'bg-emerald-600' : 'bg-[#0a0a0c]'}`}>
//                       {n}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Center Play Button */}
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <button 
//                   onClick={play}
//                   disabled={isSpinning}
//                   className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-black/80 border-8 border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center pointer-events-auto transition-all active:scale-90 ${isSpinning ? 'opacity-40' : 'hover:border-cyan-500/50'}`}
//                 >
//                   <span className="text-cyan-500 font-black tracking-tighter text-xl md:text-2xl">{isSpinning ? 'SPINNING' : 'RUN'}</span>
//                   {!isSpinning && <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Confirm Tx</span>}
//                 </button>
//               </div>

//               {/* High-Precision Pointer */}
//               <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
//                  <div className="w-1 h-8 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
//                  <div className="w-4 h-4 bg-cyan-500 rounded-full -mt-2 blur-[2px]" />
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* --- RIGHT COLUMN: BETTING BOARD --- */}
//         <aside className="lg:col-span-3 order-3 space-y-6">
//           <div className="bg-[#050507] border-2 border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
//              {/* Decorative Background Mesh */}
//              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />
             
//              <h2 className="relative text-xs font-black text-cyan-500/50 uppercase tracking-[0.2em] mb-6">Select Outcome</h2>

//              <div className="space-y-4 relative z-10">
//                 <button 
//                   onClick={() => placeBet("RED")}
//                   className={`w-full group relative overflow-hidden h-32 rounded-3xl border-2 transition-all ${selectedBetSide === 'RED' ? 'bg-red-600 border-white shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-red-950/20 border-red-500/20 hover:border-red-500/50'}`}
//                 >
//                   <div className="flex flex-col items-center">
//                     <span className="text-4xl group-hover:scale-110 transition-transform">♦</span>
//                     <span className="font-black italic text-xl">RED</span>
//                   </div>
//                   <div className="absolute bottom-2 right-4 text-[10px] font-bold opacity-40 uppercase tracking-tighter">2.0x Payout</div>
//                 </button>

//                 <button 
//                   onClick={() => placeBet("BLACK")}
//                   className={`w-full group relative overflow-hidden h-32 rounded-3xl border-2 transition-all ${selectedBetSide === 'BLACK' ? 'bg-zinc-800 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
//                 >
//                   <div className="flex flex-col items-center">
//                     <span className="text-4xl group-hover:scale-110 transition-transform">♠</span>
//                     <span className="font-black italic text-xl">BLACK</span>
//                   </div>
//                   <div className="absolute bottom-2 right-4 text-[10px] font-bold opacity-40 uppercase tracking-tighter">2.0x Payout</div>
//                 </button>
//              </div>

//              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
//                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl">
//                   <span className="text-[10px] font-bold text-zinc-500 uppercase">Active Stake</span>
//                   <span className="font-mono text-cyan-400 font-bold">{activeBet} ETH</span>
//                 </div>
//                 <button 
//                   onClick={removeBets}
//                   className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors"
//                 >
//                   Remove All Chips
//                 </button>
//              </div>
//           </div>

//           <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-4 rounded-2xl border border-cyan-500/10">
//              <p className="text-[9px] font-bold text-cyan-500/60 uppercase">Node Status</p>
//              <div className="flex items-center gap-2 mt-1">
//                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//                 <span className="text-[10px] text-zinc-400 font-medium tracking-tight">Syncing with Ethereum Mainnet...</span>
//              </div>
//           </div>
//         </aside>

//       </div>
//     </div>
//   );
// }



// "use client";

// import React, { useState, useEffect, useMemo } from "react";

// // Roulette Data
// const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
// const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// export default function CasinoElite() {
//   // --- State Management ---
//   const [balance, setBalance] = useState(5000);
//   const [bet, setBet] = useState(0);
//   const [selectedSide, setSelectedSide] = useState<"RED" | "BLACK" | null>(null);
//   const [spinning, setSpinning] = useState(false);
//   const [rotation, setRotation] = useState(0);
//   const [gameStatus, setGameStatus] = useState<"IDLE" | "WIN" | "LOSE" | "ERROR">("IDLE");
//   const [lastWinNum, setLastWinNum] = useState<number | null>(null);

//   // --- Helpers ---
//   const getNumColor = (n: number) => (n === 0 ? "emerald" : REDS.includes(n) ? "red" : "zinc");

//   // --- Core Logic ---
//   const handleBet = (amount: number, side: "RED" | "BLACK") => {
//     if (spinning) return;
//     if (balance < amount) {
//       setGameStatus("ERROR");
//       setTimeout(() => setGameStatus("IDLE"), 2000);
//       return;
//     }
//     setBalance((prev) => prev - amount);
//     setBet((prev) => prev + amount);
//     setSelectedSide(side);
//     setGameStatus("IDLE");
//   };

//   const clearBets = () => {
//     if (spinning) return;
//     setBalance((prev) => prev + bet);
//     setBet(0);
//     setSelectedSide(null);
//     setGameStatus("IDLE");
//   };

//   const playSpin = () => {
//     if (spinning || bet === 0 || !selectedSide) return;

//     setSpinning(true);
//     setGameStatus("IDLE");

//     // 1. Decide result immediately (behind the scenes)
//     const stopIndex = Math.floor(Math.random() * 37);
//     const winningNumber = WHEEL_NUMBERS[stopIndex];
//     const winningColor = getNumColor(winningNumber);

//     // 2. Calculate Animation
//     const degreesPerSlice = 360 / 37;
//     const extraSpins = (10 + Math.floor(Math.random() * 5)) * 360; // 10-15 full rotations
//     const targetRotation = extraSpins + (360 - stopIndex * degreesPerSlice);
    
//     setRotation((prev) => prev + targetRotation);

//     // 3. Wait for animation to finish (7 seconds)
//     setTimeout(() => {
//       setLastWinNum(winningNumber);
//       setSpinning(false);

//       const isWin = (winningColor === "red" && selectedSide === "RED") || 
//                     (winningColor === "zinc" && selectedSide === "BLACK");

//       if (isWin) {
//         const prize = bet * 2;
//         setBalance((prev) => prev + prize);
//         setGameStatus("WIN");
//       } else {
//         setGameStatus("LOSE");
//       }
      
//       setBet(0);
//       setSelectedSide(null);
//     }, 7000);
//   };

//   return (
//     <div className="min-h-screen bg-[#080808] text-white font-sans p-4 md:p-8 overflow-x-hidden">
//       <div className="max-w-7xl mx-auto">
        
//         {/* --- HEADER --- */}
//         <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-2xl">
//           <div className="text-center md:text-left">
//             <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
//               ONYX CASINO
//             </h1>
//             <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Premium Table 01</p>
//           </div>
          
//           <div className="flex gap-4">
//             <div className="bg-black/40 px-6 py-2 rounded-xl border border-emerald-500/20 shadow-inner">
//               <span className="text-[9px] text-emerald-500 font-bold block uppercase">Wallet</span>
//               <span className="text-xl font-mono">${balance.toLocaleString()}</span>
//             </div>
//             <div className="bg-black/40 px-6 py-2 rounded-xl border border-yellow-500/20 shadow-inner">
//               <span className="text-[9px] text-yellow-500 font-bold block uppercase">Current Bet</span>
//               <span className="text-xl font-mono">${bet.toLocaleString()}</span>
//             </div>
//           </div>
//         </header>

//         {/* --- MAIN GAME AREA --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
//           {/* WHEEL SECTION */}
//           <div className="relative flex flex-col items-center">
//             {/* The Outer Rim */}
//             <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-b from-zinc-800 to-black p-4 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-b-[10px] border-black">
              
//               {/* Rotating Plate */}
//               <div 
//                 className="w-full h-full rounded-full relative overflow-hidden transition-transform shadow-[inset_0_0_50px_rgba(0,0,0,1)]"
//                 style={{
//                   transform: `rotate(${rotation}deg)`,
//                   transition: spinning ? "transform 7s cubic-bezier(0.1, 0, 0, 1)" : "none",
//                   background: 'radial-gradient(circle, #222 0%, #000 100%)'
//                 }}
//               >
//                 {WHEEL_NUMBERS.map((n, i) => (
//                   <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[6%] h-[50%] origin-bottom" style={{ transform: `rotate(${(360/37)*i}deg)` }}>
//                     <div className={`w-full h-[80%] rounded-t-full pt-4 flex justify-center text-[10px] font-bold ${getNumColor(n) === 'red' ? 'bg-red-600' : getNumColor(n) === 'emerald' ? 'bg-emerald-600' : 'bg-zinc-900'}`}>
//                       {n}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Static Center Button */}
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <button 
//                   onClick={playSpin}
//                   disabled={spinning}
//                   className={`w-24 h-24 md:w-36 md:h-36 rounded-full bg-zinc-900 border-[10px] border-zinc-800 shadow-2xl pointer-events-auto active:scale-95 transition-all flex flex-col items-center justify-center ${spinning ? 'opacity-50' : 'hover:border-yellow-600'}`}
//                 >
//                   <span className="text-yellow-500 font-black text-xl italic">{spinning ? '...' : 'SPIN'}</span>
//                 </button>
//               </div>

//               {/* Pointer Hook */}
//               <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-50">
//                 <div className="w-8 h-10 bg-yellow-500 rounded-b-lg shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
//               </div>
//             </div>

//             {/* Last Number Display */}
//             {lastWinNum !== null && (
//               <div className="mt-8 bg-zinc-900 px-6 py-2 rounded-full border border-white/10 text-zinc-400 font-bold uppercase text-xs tracking-widest">
//                 Last Result: <span className="text-white ml-2">{lastWinNum}</span>
//               </div>
//             )}
//           </div>

//           {/* BETTING SECTION */}
//           <div className="flex flex-col gap-6">
            
//             {/* ALERT BOX */}
//             <div className={`p-5 rounded-2xl text-center font-black uppercase tracking-tighter text-lg border-2 transition-all duration-500 ${
//               gameStatus === 'WIN' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 animate-bounce' :
//               gameStatus === 'LOSE' ? 'bg-red-500/20 border-red-500 text-red-500 animate-shake' :
//               gameStatus === 'ERROR' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
//               'bg-zinc-900/50 border-white/5 text-zinc-500'
//             }`}>
//               {gameStatus === 'WIN' ? "✦ MEGA WIN ✦" : 
//                gameStatus === 'LOSE' ? "✖ YOU LOST ✖" : 
//                gameStatus === 'ERROR' ? "⚠ NO FUNDS / NO BET" : 
//                "Place Your Stakes"}
//             </div>

//             {/* 3D TABLE */}
//             <div className="bg-[#0b241a] p-6 rounded-3xl border-2 border-emerald-900/50 shadow-2xl relative overflow-hidden group">
//               <div className="grid grid-cols-2 gap-4 relative z-10">
                
//                 {/* RED SIDE */}
//                 <button 
//                   onClick={() => handleBet(100, "RED")}
//                   className={`relative h-44 rounded-2xl border-b-8 transition-all flex flex-col items-center justify-center ${
//                     selectedSide === 'RED' 
//                     ? 'bg-red-600 border-red-800 scale-[0.98] shadow-inner' 
//                     : 'bg-red-700/40 border-red-900 hover:bg-red-700/60 shadow-lg hover:-translate-y-1'
//                   }`}
//                 >
//                   <span className="text-5xl mb-2 drop-shadow-lg">♦</span>
//                   <span className="font-black text-2xl uppercase italic">RED</span>
//                   {selectedSide === 'RED' && <div className="absolute top-2 right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">✓</div>}
//                 </button>

//                 {/* BLACK SIDE */}
//                 <button 
//                   onClick={() => handleBet(100, "BLACK")}
//                   className={`relative h-44 rounded-2xl border-b-8 transition-all flex flex-col items-center justify-center ${
//                     selectedSide === 'BLACK' 
//                     ? 'bg-zinc-800 border-zinc-950 scale-[0.98] shadow-inner' 
//                     : 'bg-zinc-900/80 border-black hover:bg-zinc-900 shadow-lg hover:-translate-y-1'
//                   }`}
//                 >
//                   <span className="text-5xl mb-2 drop-shadow-lg text-zinc-400">♠</span>
//                   <span className="font-black text-2xl uppercase italic text-zinc-100">BLACK</span>
//                   {selectedSide === 'BLACK' && <div className="absolute top-2 right-2 bg-yellow-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">✓</div>}
//                 </button>
//               </div>

//               {/* ACTIONS */}
//               <div className="mt-6 flex gap-4">
//                 <button 
//                   onClick={clearBets}
//                   className="flex-1 py-4 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors"
//                 >
//                   Clear Table
//                 </button>
//                 <div className="flex-1 flex justify-center items-center">
//                    <div className="w-12 h-12 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center">
//                       <span className="text-[10px] font-bold text-zinc-600">$100</span>
//                    </div>
//                 </div>
//               </div>
//             </div>

//             {/* QUICK INFO */}
//             <div className="grid grid-cols-3 gap-4">
//               <div className="bg-zinc-900/30 p-4 rounded-xl text-center border border-white/5">
//                 <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Odds</p>
//                 <p className="text-sm font-bold">1:1</p>
//               </div>
//               <div className="bg-zinc-900/30 p-4 rounded-xl text-center border border-white/5">
//                 <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Min Bet</p>
//                 <p className="text-sm font-bold">$100</p>
//               </div>
//               <div className="bg-zinc-900/30 p-4 rounded-xl text-center border border-white/5">
//                 <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Max Bet</p>
//                 <p className="text-sm font-bold">$10k</p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           20% { transform: translateX(-10px); }
//           40% { transform: translateX(10px); }
//           60% { transform: translateX(-10px); }
//           80% { transform: translateX(10px); }
//         }
//         .animate-shake {
//           animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
//         }
//       `}</style>
//     </div>
//   );
// }






// "use client";

// import React, { useMemo, useState, useEffect } from "react";

// // --- Configuration ---
// const NUMBERS_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
// const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// export default function Ultimate3DCasino() {
//   // State
//   const [balance, setBalance] = useState(1000);
//   const [betAmount, setBetAmount] = useState(0);
//   const [selectedColor, setSelectedColor] = useState<"red" | "black" | null>(null);
//   const [rotation, setRotation] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [lastResult, setLastResult] = useState<number | null>(null);
//   const [message, setMessage] = useState({ text: "Place your bets", type: "neutral" });

//   const getNumColor = (n: number) => (n === 0 ? "emerald" : RED_NUMBERS.includes(n) ? "red" : "zinc");

//   // Logic: Add Coins
//   const addBet = (amount: number, color: "red" | "black") => {
//     if (spinning) return;
//     if (balance < amount) {
//       triggerWarning("Insufficient Balance!");
//       return;
//     }
//     setBalance(prev => prev - amount);
//     setBetAmount(prev => prev + amount);
//     setSelectedColor(color);
//     setMessage({ text: `Bet placed on ${color.toUpperCase()}`, type: "neutral" });
//   };

//   // Logic: Reset Bets
//   const clearBets = () => {
//     if (spinning) return;
//     setBalance(prev => prev + betAmount);
//     setBetAmount(0);
//     setSelectedColor(null);
//     setMessage({ text: "Bets cleared", type: "neutral" });
//   };

//   const triggerWarning = (text: string) => {
//     setMessage({ text, type: "error" });
//     setTimeout(() => setMessage({ text: "Place your bets", type: "neutral" }), 2000);
//   };

//   // Logic: The Spin
//   const spinWheel = () => {
//     if (spinning) return;
//     if (betAmount === 0) {
//       triggerWarning("Place a bet first!");
//       return;
//     }

//     setSpinning(true);
//     const stopIndex = Math.floor(Math.random() * 37);
//     const degPerSlice = 360 / 37;
//     const extraSpins = (8 + Math.floor(Math.random() * 5)) * 360;
//     const finalRotation = extraSpins + (360 - (stopIndex * degPerSlice));
    
//     setRotation(prev => prev + finalRotation);

//     setTimeout(() => {
//       const winNum = NUMBERS_ORDER[stopIndex];
//       const winColor = getNumColor(winNum);
//       setLastResult(winNum);
      
//       // Calculate Win/Loss
//       if ((winColor === "red" && selectedColor === "red") || (winColor === "zinc" && selectedColor === "black")) {
//         const payout = betAmount * 2;
//         setBalance(prev => prev + payout);
//         setMessage({ text: `WINNER! +$${payout}`, type: "success" });
//       } else {
//         setMessage({ text: `FAIL! You lost $${betAmount}`, type: "error" });
//       }

//       setBetAmount(0);
//       setSelectedColor(null);
//       setSpinning(false);
//     }, 7000);
//   };

//   return (
//     <div className="min-h-screen bg-[#050505] text-white p-4 font-sans overflow-x-hidden">
      
//       {/* HEADER SECTION */}
//       <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-zinc-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
//         <div>
//           <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500">NEON ROYALE</h1>
//           <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">VIP 3D Table</p>
//         </div>
//         <div className="flex gap-4">
//           <div className="bg-black/50 px-6 py-2 rounded-xl border border-emerald-500/30">
//             <p className="text-[9px] text-emerald-500 font-bold uppercase">Balance</p>
//             <p className="text-xl font-mono">${balance.toLocaleString()}</p>
//           </div>
//           <div className="bg-black/50 px-6 py-2 rounded-xl border border-yellow-500/30">
//             <p className="text-[9px] text-yellow-500 font-bold uppercase">On Table</p>
//             <p className="text-xl font-mono">${betAmount}</p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* LEFT: 3D WHEEL */}
//         <div className="flex flex-col items-center justify-center">
//           <div className="relative group">
//             {/* 3D Casing */}
//             <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full p-4 bg-[#111] shadow-[0_50px_100px_-20px_rgba(0,0,0,1),inset_0_2px_20px_rgba(255,255,255,0.1)] border-b-[12px] border-zinc-950">
              
//               <div 
//                 className="w-full h-full rounded-full relative overflow-hidden transition-transform"
//                 style={{
//                   transform: `rotate(${rotation}deg)`,
//                   transition: spinning ? "transform 7s cubic-bezier(0.1, 0, 0, 1)" : "none",
//                   background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)'
//                 }}
//               >
//                 {NUMBERS_ORDER.map((n, i) => (
//                   <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-[6%] h-[50%] origin-bottom" style={{ transform: `rotate(${(360/37)*i}deg)` }}>
//                     <div className={`w-full h-[85%] rounded-t-sm pt-2 flex justify-center text-[10px] font-bold border-x border-white/5 ${getNumColor(n) === 'red' ? 'bg-red-600' : getNumColor(n) === 'emerald' ? 'bg-emerald-600' : 'bg-zinc-900'}`}>
//                       {n}
//                     </div>
//                   </div>
//                 ))}
//                 {/* Inner Bezel */}
//                 <div className="absolute inset-[18%] rounded-full bg-gradient-to-b from-zinc-800 to-black shadow-inner border border-white/5" />
//               </div>

//               {/* Center Hub */}
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                  <button onClick={spinWheel} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-zinc-900 border-8 border-zinc-800 shadow-2xl flex items-center justify-center pointer-events-auto active:scale-95 transition-all">
//                     <span className="text-yellow-500 font-black text-xl italic">{spinning ? '...' : 'SPIN'}</span>
//                  </button>
//               </div>

//               {/* Top Pin */}
//               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-10 bg-yellow-500" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: 3D BETTING BOARD & COINS */}
//         <div className="flex flex-col gap-6">
          
//           {/* Status Message */}
//           <div className={`p-4 rounded-2xl text-center font-bold uppercase tracking-widest text-sm border transition-all ${
//             message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-500 animate-shake' : 
//             message.type === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-105' : 
//             'bg-zinc-900 border-white/10'
//           }`}>
//             {message.text}
//           </div>

//           {/* 3D Table Perspective */}
//           <div className="bg-[#0a2e1f] p-8 rounded-3xl border-2 border-emerald-800 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transform lg:rotate-x-12 lg:perspective-1000 overflow-hidden relative">
//             <div className="absolute top-0 left-0 w-full h-2 bg-white/10" />
            
//             <div className="grid grid-cols-2 gap-4">
//               {/* Red Bet Area */}
//               <div 
//                 onClick={() => addBet(100, "red")}
//                 className={`h-40 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
//                   selectedColor === "red" ? "bg-red-600 border-white shadow-[0_0_30px_rgba(239,68,68,0.5)]" : "bg-red-900/40 border-red-500/30 hover:bg-red-900/60"
//                 }`}
//               >
//                 <span className="text-4xl mb-2">♦</span>
//                 <span className="font-black text-2xl uppercase">Red</span>
//                 <span className="text-[10px] opacity-50">Pays 2x</span>
//               </div>

//               {/* Black Bet Area */}
//               <div 
//                 onClick={() => addBet(100, "black")}
//                 className={`h-40 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
//                   selectedColor === "black" ? "bg-zinc-800 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-zinc-900/40 border-zinc-500/30 hover:bg-zinc-900/60"
//                 }`}
//               >
//                 <span className="text-4xl mb-2">♠</span>
//                 <span className="font-black text-2xl uppercase">Black</span>
//                 <span className="text-[10px] opacity-50">Pays 2x</span>
//               </div>
//             </div>

//             {/* Remove Coin Button */}
//             <button 
//               onClick={clearBets}
//               className="mt-6 w-full py-3 bg-black/40 hover:bg-black/60 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 uppercase tracking-widest"
//             >
//               Remove All Coins ⎌
//             </button>
//           </div>

//           {/* Quick Chip Selector */}
//           <div className="flex justify-center gap-4">
//             {[10, 50, 100, 500].map(val => (
//               <button 
//                 key={val}
//                 onClick={() => {
//                    if(selectedColor) addBet(val, selectedColor);
//                    else triggerWarning("Select Red or Black first!");
//                 }}
//                 className="w-16 h-16 rounded-full border-4 border-dashed border-white/20 bg-zinc-800 flex items-center justify-center font-black text-sm hover:scale-110 active:scale-90 transition-all shadow-xl"
//               >
//                 ${val}
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-5px); }
//           75% { transform: translateX(5px); }
//         }
//         .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
//         .perspective-1000 { perspective: 1000px; }
//         .rotate-x-12 { transform: rotateX(25deg); }
//       `}</style>
//     </div>
//   );
// }






// "use client";

// import React, { useMemo, useState, useEffect, useRef } from "react";

// // --- Types ---
// type HistoryItem = { id: string; val: number; color: string; time: string };

// export default function EliteCasinoPro() {
//   const numbers = useMemo(() => [
//     0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
//   ], []);

//   const getColor = (n: number) => {
//     if (n === 0) return "#10b981"; // Emerald 500
//     const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
//     return reds.includes(n) ? "#ef4444" : "#18181b"; // Red 500 or Zinc 900
//   };

//   const [rotation, setRotation] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<number | null>(null);
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [winAnimate, setWinAnimate] = useState(false);

//   const spin = () => {
//     if (spinning) return;
    
//     setSpinning(true);
//     setWinAnimate(false);
    
//     const randomIndex = Math.floor(Math.random() * numbers.length);
//     const degreesPerSlice = 360 / numbers.length;
    
//     // Calculate rotation to land the number exactly at the TOP (0 degrees)
//     // We add 1440+ degrees for minimum 4 full spins
//     const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
//     const targetRotation = extraSpins + (360 - (randomIndex * degreesPerSlice));
    
//     setRotation(prev => prev + targetRotation);

//     setTimeout(() => {
//       const win = numbers[randomIndex];
//       setResult(win);
//       setHistory(prev => [
//         { 
//           id: Math.random().toString(36).substr(2, 5), 
//           val: win, 
//           color: getColor(win),
//           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         }, 
//         ...prev 
//       ].slice(0, 8));
//       setSpinning(false);
//       setWinAnimate(true);
//     }, 8000); // 8 second luxurious slow-down
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-4 md:p-10 font-sans selection:bg-gold-500/30">
//       <div className="max-w-[1400px] mx-auto">
        
//         {/* TOP HUD */}
//         <div className="flex flex-wrap justify-between items-center mb-12 gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
//               <span className="text-black font-black text-xl">R</span>
//             </div>
//             <div>
//               <h1 className="text-2xl font-black tracking-tight leading-none">GRAND CASINO</h1>
//               <p className="text-xs text-zinc-500 font-bold tracking-[0.2em] uppercase">Private Table #04</p>
//             </div>
//           </div>
          
//           <div className="flex gap-8">
//             <StatBox label="Balance" value="$12,450.00" color="text-emerald-400" />
//             <StatBox label="Total Bet" value="$0.00" color="text-yellow-500" />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
//           {/* LEFT: TRENDS & HISTORY */}
//           <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
//             <section className="bg-zinc-900/80 border border-white/5 rounded-3xl p-5 shadow-2xl">
//               <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Recent Results</h3>
//               <div className="space-y-3">
//                 {history.map((item) => (
//                   <div key={item.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-yellow-500/50 transition-colors">
//                     <span className="text-[10px] font-mono text-zinc-600">{item.time}</span>
//                     <div className="flex items-center gap-3">
//                       <span className="text-xs font-bold text-zinc-400 uppercase">Draw #{item.id}</span>
//                       <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-inner" style={{ backgroundColor: item.color }}>
//                         {item.val}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 {!history.length && <div className="py-10 text-center text-zinc-700 text-sm">Waiting for action...</div>}
//               </div>
//             </section>
//           </div>

//           {/* CENTER: THE MASTER WHEEL */}
//           <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
//             <div className="relative">
//               {/* Outer Golden Bezel */}
//               <div className="relative w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] rounded-full p-4 bg-gradient-to-b from-[#3a3a3a] via-[#1a1a1a] to-[#000] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
                
//                 {/* Rotating Part */}
//                 <div 
//                   className="w-full h-full rounded-full relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
//                   style={{
//                     transform: `rotate(${rotation}deg)`,
//                     transition: spinning ? "transform 8s cubic-bezier(0.2, 0, 0, 1)" : "none",
//                     background: 'radial-gradient(circle, #27272a 0%, #09090b 100%)'
//                   }}
//                 >
//                   {numbers.map((n, i) => {
//                     const angle = (360 / 37) * i;
//                     return (
//                       <div 
//                         key={n}
//                         className="absolute top-0 left-1/2 -translate-x-1/2 w-[6%] h-[50%] origin-bottom"
//                         style={{ transform: `rotate(${angle}deg)` }}
//                       >
//                         <div 
//                           className="w-full h-[90%] rounded-t-sm flex items-start justify-center pt-3 sm:pt-5 border-x border-white/5"
//                           style={{ backgroundColor: getColor(n) }}
//                         >
//                           <span className="text-[10px] sm:text-[13px] font-black text-white/90 transform">{n}</span>
//                         </div>
//                       </div>
//                     );
//                   })}
                  
//                   {/* Inner Polished Wood/Metal Ring */}
//                   <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-zinc-800 to-black border-[6px] border-zinc-900 shadow-2xl" />
//                 </div>

//                 {/* Static Center Hub */}
//                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                   <div className="w-28 h-28 sm:w-44 sm:h-44 rounded-full bg-[#111] border-[10px] border-[#222] shadow-[0_0_50px_rgba(0,0,0,1)] flex items-center justify-center pointer-events-auto">
//                     <button
//                       onClick={spin}
//                       disabled={spinning}
//                       className={`relative w-20 h-20 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all ${
//                         spinning ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
//                       }`}
//                     >
//                       <span className={`text-black font-black text-xl sm:text-2xl uppercase tracking-tighter ${spinning ? 'hidden' : 'block'}`}>Spin</span>
//                       {spinning && <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin" />}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Pointer / Needle */}
//                 <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-50">
//                    <div className="w-8 h-10 bg-yellow-500 rounded-b-lg shadow-2xl flex justify-center items-end pb-1" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}>
//                       <div className="w-1 h-4 bg-black/30 rounded-full" />
//                    </div>
//                 </div>
//               </div>

//               {/* WINNER ANNOUNCEMENT */}
//               <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 transition-all duration-1000 ${winAnimate ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
//                  <div className="bg-emerald-500 text-black px-10 py-4 rounded-2xl font-black text-3xl shadow-[0_0_50px_rgba(16,185,129,0.4)] border-b-4 border-emerald-700">
//                     {result}
//                  </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: BETTING GRID INTERFACE */}
//           <div className="lg:col-span-3 order-3 space-y-6">
//             <section className="bg-emerald-900/20 border border-emerald-500/20 rounded-3xl p-5">
//               <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Quick Bets</h3>
//               <div className="grid grid-cols-2 gap-3">
//                 <BetButton label="Red" color="bg-red-500" />
//                 <BetButton label="Black" color="bg-zinc-900" />
//                 <BetButton label="Even" color="bg-zinc-800" />
//                 <BetButton label="Odd" color="bg-zinc-800" />
//                 <BetButton label="1-18" color="bg-zinc-800" />
//                 <BetButton label="19-36" color="bg-zinc-800" />
//               </div>
//             </section>
            
//             <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/5">
//                 <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Live Status</p>
//                 <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
//                     <span className="text-sm font-medium text-emerald-500">System Ready</span>
//                 </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// // --- Sub-Components ---

// function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
//   return (
//     <div className="text-right">
//       <p className="text-[10px] uppercase text-zinc-500 font-black tracking-widest">{label}</p>
//       <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
//     </div>
//   );
// }

// function BetButton({ label, color }: { label: string; color: string }) {
//   return (
//     <button className={`${color} border border-white/10 py-3 rounded-xl text-xs font-black uppercase hover:brightness-125 transition-all active:scale-95 shadow-lg`}>
//       {label}
//     </button>
//   );
// }



// up app nice dwon 

// "use client";

// import React, { useMemo, useState, useEffect } from "react";

// export default function PremiumCasinoPage() {
//   const numbers = useMemo(() => Array.from({ length: 37 }, (_, i) => i), []);
//   const getColor = (n: number) => (n === 0 ? "bg-emerald-500" : n % 2 === 0 ? "bg-red-600" : "bg-zinc-900");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<number | null>(null);
//   const [history, setHistory] = useState<{ id: number; val: number }[]>([]);
//   const [isWinnerAnim, setIsWinnerAnim] = useState(false);

//   const spin = () => {
//     if (spinning) return;
//     setIsWinnerAnim(false);
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const degPer = 360 / numbers.length;
//     const fullSpins = 8; // More rotations for suspense
//     // We calculate the target so the winning number lands at the TOP (pointer position)
//     const target = fullSpins * 360 + (360 - (pickIndex * degPer));

//     setAngle((prev) => prev + target);

//     setTimeout(() => {
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory((h) => [{ id: Date.now(), val: win }, ...h].slice(0, 10));
//       setSpinning(false);
//       setIsWinnerAnim(true);
//     }, 6000);
//   };

//   return (
//     <div className="min-h-screen bg-[#061a13] text-slate-100 font-sans selection:bg-yellow-500/30">
//       <div className="max-w-7xl mx-auto p-4 md:p-8">
//         {/* Header Section */}
//         <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-white/10 pb-6">
//           <div>
//             <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">
//               ROYAL SPiN
//             </h1>
//             <p className="text-emerald-400/60 font-medium tracking-widest text-xs uppercase mt-1">Premium European Roulette</p>
//           </div>
//           <div className="flex gap-6">
//             <div className="text-right">
//               <p className="text-[10px] uppercase text-slate-400 font-bold">Balance</p>
//               <p className="text-xl font-mono text-yellow-500">$25,400.00</p>
//             </div>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//           {/* Left: Statistics/Numbers */}
//           <aside className="lg:col-span-3 order-2 lg:order-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
//             <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-emerald-400">Board Map</h2>
//             <div className="grid grid-cols-4 gap-2">
//               {numbers.map((n) => (
//                 <div
//                   key={n}
//                   className={`h-10 flex items-center justify-center rounded-md font-bold text-xs transition-all duration-500 ${
//                     result === n ? "ring-2 ring-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "opacity-60"
//                   } ${getColor(n)}`}
//                 >
//                   {n}
//                 </div>
//               ))}
//             </div>
//           </aside>

//           {/* Center: The Wheel */}
//           <section className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
//             <div className="relative group">
//               {/* Outer Glow */}
//               <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
              
//               {/* The Wheel Container */}
//               <div 
//                 className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full border-[12px] border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] bg-[#0c0c0c] flex items-center justify-center overflow-hidden"
//                 style={{
//                   transform: `rotate(${angle}deg)`,
//                   transition: spinning ? "transform 6s cubic-bezier(0.15, 0, 0.15, 1)" : "none",
//                 }}
//               >
//                 {numbers.map((n, i) => {
//                   const deg = (360 / 37) * i;
//                   return (
//                     <div
//                       key={n}
//                       className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1/2 origin-bottom flex justify-center pt-2 text-[10px] sm:text-xs font-black ${getColor(n)}`}
//                       style={{ 
//                         transform: `rotate(${deg}deg)`,
//                         clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" 
//                       }}
//                     >
//                       <span className="rotate-0">{n}</span>
//                     </div>
//                   );
//                 })}
                
//                 {/* Inner Decorative Rings */}
//                 <div className="absolute inset-8 rounded-full border border-white/5 bg-gradient-to-b from-transparent to-black/40" />
//               </div>

//               {/* Static Center Piece (Does not rotate) */}
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black border-4 border-yellow-600/50 shadow-2xl flex items-center justify-center pointer-events-auto">
//                     <button
//                       disabled={spinning}
//                       onClick={spin}
//                       className={`group relative w-20 h-20 sm:w-28 sm:h-28 rounded-full font-black text-lg transition-all active:scale-95 ${
//                         spinning ? "cursor-not-allowed opacity-50" : "hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"
//                       }`}
//                     >
//                       <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-20 group-hover:opacity-40" />
//                       <span className="relative z-10 text-yellow-500 uppercase tracking-tighter">Spin</span>
//                     </button>
//                  </div>
//               </div>

//               {/* Top Pointer */}
//               <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50">
//                 <div className="w-6 h-8 bg-yellow-500 clip-path-pointer shadow-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
//                 <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1/2 -translate-x-1/2 blur-[1px]" />
//               </div>
//             </div>

//             {/* Result Toast */}
//             <div className={`mt-16 transition-all duration-700 transform ${isWinnerAnim ? "scale-110 opacity-100" : "scale-90 opacity-0"}`}>
//               <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 px-8 py-3 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.3)]">
//                 <span className="text-black font-black text-2xl">WINNER: {result}</span>
//               </div>
//             </div>
//           </section>

//           {/* Right: History */}
//           <aside className="lg:col-span-3 order-3 bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/5 h-[400px] flex flex-col">
//             <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">Live History</h2>
//             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
//               {history.map((h) => (
//                 <div
//                   key={h.id}
//                   className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 animate-slide-in"
//                 >
//                   <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Ref_{h.id.toString().slice(-4)}</span>
//                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${getColor(h.val)}`}>
//                     {h.val}
//                   </div>
//                 </div>
//               ))}
//               {!history.length && <p className="text-center text-slate-600 mt-10 text-sm italic">Awaiting first spin...</p>}
//             </div>
//           </aside>
//         </main>
//       </div>

//       <style jsx>{`
//         @keyframes slide-in {
//           from { opacity: 0; transform: translateX(20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .animate-slide-in {
//           animation: slide-in 0.4s ease-out forwards;
//         }
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255,255,255,0.1);
//           border-radius: 10px;
//         }
//       `}</style>
//     </div>
//   );
// }



// "use client";

// import React, { useMemo, useRef, useState, useEffect } from "react";

// export default function CasinoPage() {
//   const numbers = useMemo(
//     () => Array.from({ length: 37 }, (_, i) => i),
//     []
//   );
//   const getColor = (n: number) => (n === 0 ? "green" : n % 2 === 0 ? "red" : "black");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<number | null>(null);
//   const [history, setHistory] = useState<number[]>([]);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   // Continuous rotation for marquee effect
//   const [marqueeAngle, setMarqueeAngle] = useState(0);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!spinning) setMarqueeAngle(prev => prev + 0.3); // slow spin
//     }, 16);
//     return () => clearInterval(interval);
//   }, [spinning]);

//   const spin = () => {
//     if (spinning) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const pockets = numbers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle(prev => prev + target);

//     setTimeout(() => {
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory(h => [win, ...h].slice(0, 12));
//       setSpinning(false);
//     }, 6000);
//   };

//   const pocketsElements = numbers.map((n, i) => {
//     const degPer = 360 / numbers.length;
//     const rotation = i * degPer;
//     const color = getColor(n);
//     return (
//       <div
//         key={n}
//         className="absolute top-1/2 left-1/2 w-28 h-14 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-xs sm:text-sm font-semibold rounded-t-lg shadow-sm border"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-200px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#32CD32"
//               : color === "red"
//               ? "#d32f2f"
//               : "#111827",
//           color: "white",
//         }}
//       >
//         <span className="font-bold">{n}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-green-700 text-white p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl sm:text-3xl font-bold">SPiN WiN</h1>
//           <div className="text-sm sm:text-base">
//             Current Draw:{" "}
//             <span className="font-mono">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left sidebar */}
//           <aside className="md:col-span-3 bg-green-800 p-4 rounded-xl shadow-inner overflow-auto max-h-[80vh]">
//             <h2 className="text-lg font-semibold mb-3">Numbers</h2>
//             <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-sm">
//               {numbers.map(n => (
//                 <div
//                   key={n}
//                   className="p-2 sm:p-3 rounded flex items-center justify-center font-bold text-center"
//                   style={{
//                     background: getColor(n) === "green"
//                       ? "#206040"
//                       : getColor(n) === "red"
//                       ? "#7a1f1f"
//                       : "#0f1724",
//                   }}
//                 >
//                   {n}
//                 </div>
//               ))}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-[320px] sm:w-[420px] md:w-[500px] aspect-square flex items-center justify-center">
//               <div
//                 ref={wheelRef}
//                 className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative"
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   transition: spinning
//                     ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                     : "none",
//                   transform: `rotate(${angle + marqueeAngle}deg)`,
//                   background: "radial-gradient(circle at center, #f6d365, #fda085)",
//                 }}
//               >
//                 {pocketsElements}

//                 {/* Center SPIN button */}
//                 <div
//                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
//                              w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-yellow-600
//                              flex items-center justify-center text-xl sm:text-3xl font-bold
//                              border-4 border-yellow-700 cursor-pointer hover:bg-yellow-500
//                              transition-colors"
//                   onClick={spin}
//                 >
//                   SPiN
//                 </div>
//               </div>

//               {/* Pointer */}
//               <div className="absolute left-1/2 -translate-x-1/2 -mt-3 w-0 h-0" style={{ top: -6 }}>
//                 <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px] border-b-white mx-auto"></div>
//               </div>

//               {/* Result display */}
//               <div className="absolute bottom-[-70px] text-center">
//                 Result:{" "}
//                 <span className="font-bold text-yellow-300">
//                   {result === null ? "—" : result}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-green-800 p-4 rounded-xl shadow-inner overflow-auto max-h-[80vh]">
//             <h2 className="text-lg font-semibold mb-3">History</h2>
//             <div className="space-y-2 text-sm">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 rounded"
//                     style={{ background: "#0f2a1f" }}
//                   >
//                     <div className="font-mono">#{2350 + i}</div>
//                     <div className="font-bold">{h}</div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-80 text-center">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }












// "use client";

// import React, { useMemo, useRef, useState } from "react";

// export default function CasinoPage() {
//   const numbers = useMemo(
//     () => Array.from({ length: 37 }, (_, i) => i),
//     []
//   );
//   const getColor = (n: number) => (n === 0 ? "green" : n % 2 === 0 ? "red" : "black");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<number | null>(null);
//   const [history, setHistory] = useState<number[]>([]);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const spin = () => {
//     if (spinning) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const pockets = numbers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle(prev => prev + target);

//     setTimeout(() => {
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory(h => [win, ...h].slice(0, 12));
//       setSpinning(false);
//     }, 6000);
//   };

//   const pocketsElements = numbers.map((n, i) => {
//     const degPer = 360 / numbers.length;
//     const rotation = i * degPer;
//     const color = getColor(n);
//     return (
//       <div
//         key={n}
//         className="absolute top-1/2 left-1/2 w-28 h-14 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-xs sm:text-sm font-semibold rounded-t-lg shadow-sm border"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-200px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#32CD32"
//               : color === "red"
//               ? "#d32f2f"
//               : "#111827",
//           color: "white",
//         }}
//       >
//         <span className="font-bold">{n}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-green-700 text-white p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl sm:text-3xl font-bold">SPiN WiN</h1>
//           <div className="text-sm sm:text-base">
//             Current Draw:{" "}
//             <span className="font-mono">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left sidebar */}
//           <aside className="md:col-span-3 bg-green-800 p-4 rounded-xl shadow-inner overflow-auto max-h-[80vh]">
//             <h2 className="text-lg font-semibold mb-3">Numbers</h2>
//             <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-sm">
//               {numbers.map(n => (
//                 <div
//                   key={n}
//                   className="p-2 sm:p-3 rounded flex items-center justify-center font-bold text-center"
//                   style={{
//                     background: getColor(n) === "green"
//                       ? "#206040"
//                       : getColor(n) === "red"
//                       ? "#7a1f1f"
//                       : "#0f1724",
//                   }}
//                 >
//                   {n}
//                 </div>
//               ))}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-[320px] sm:w-[420px] md:w-[500px] aspect-square flex items-center justify-center">
//               <div
//                 ref={wheelRef}
//                 className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative"
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   transition: spinning
//                     ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                     : "none",
//                   transform: `rotate(${angle}deg)`,
//                   background: "radial-gradient(circle at center, #f6d365, #fda085)",
//                 }}
//               >
//                 {pocketsElements}

//                 {/* Center SPIN button */}
//                 <div
//                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
//                              w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-yellow-600
//                              flex items-center justify-center text-xl sm:text-3xl font-bold
//                              border-4 border-yellow-700 cursor-pointer hover:bg-yellow-500
//                              transition-colors"
//                   onClick={spin}
//                 >
//                   SPiN
//                 </div>
//               </div>

//               {/* Pointer */}
//               <div className="absolute left-1/2 -translate-x-1/2 -mt-3 w-0 h-0" style={{ top: -6 }}>
//                 <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px] border-b-white mx-auto"></div>
//               </div>

//               {/* Result display */}
//               <div className="absolute bottom-[-70px] text-center">
//                 Result:{" "}
//                 <span className="font-bold text-yellow-300">
//                   {result === null ? "—" : result}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-green-800 p-4 rounded-xl shadow-inner overflow-auto max-h-[80vh]">
//             <h2 className="text-lg font-semibold mb-3">History</h2>
//             <div className="space-y-2 text-sm">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 rounded"
//                     style={{ background: "#0f2a1f" }}
//                   >
//                     <div className="font-mono">#{2350 + i}</div>
//                     <div className="font-bold">{h}</div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-80 text-center">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }












// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {
//   type Player = {
//     id: number;
//     name: string;
//   };

//   // ডেমো ডেটা (fallback)
//   const initialPlayers = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   type Item = {
//     id: number;
//   };

//   const getColor = (n: Item) =>
//     n.id % 3 === 0 ? "#10B981" : n.id % 2 === 0 ? "#EF4444" : "#1F2937";

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<Player | null>(null);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     const duration = 6000;
//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setAvailablePlayers((prev) => prev.filter((p) => p.id !== win?.id));
//       setSpinning(false);

//       setModalVisible(true);
//       setTimeout(() => setModalVisible(false), 10000);
//     }, duration);
//   };

//   useEffect(() => {
//     getUsers();

//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Enter") spin();
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);

//   const getUsers = () => {
//     Api.get(`/all_users`)
//       .then((res) => setAvailablePlayers(res.data.data))
//       .catch((err) => {
//         console.error("Error:", err);
//         setAvailablePlayers(initialPlayers);
//       });
//   };

//   // wheel elements
//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;

//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
//                    flex flex-col items-center justify-center text-[8px] sm:text-[10px] md:text-sm
//                    font-bold rounded-t-lg shadow-md border border-gray-400 px-1 sm:px-2"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-45%) rotate(${-rotation}deg)`,
//           background: getColor(p),
//           color: "white",
//           minWidth: "60px",
//         }}
//       >
//         <span className="font-bold text-center truncate">{p.name}</span>
//         <span className="text-[7px] sm:text-[9px] md:text-xs opacity-70 text-center">
//           ID: {p.id}
//         </span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-6">
//           <h1 className="text-lg sm:text-2xl font-extrabold text-yellow-400 tracking-wider">
//             SPiN WiN
//           </h1>
//           <div className="text-xs sm:text-sm">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-200">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-80 overflow-y-auto">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105"
//                     style={{ background: getColor(p) }}
//                   >
//                     <span>{p.name}</span>
//                     <span className="text-xs opacity-75">ID: {p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[580px] aspect-square flex items-center justify-center">
//               <div className="absolute w-full h-full">
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-4 sm:border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                   style={{
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #FDE68A, #D97706)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
//                                   w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-yellow-600
//                                   flex items-center justify-center text-xl sm:text-3xl font-extrabold
//                                   border-2 sm:border-4 border-yellow-700 text-black shadow-inner">
//                     SPiN
//                   </div>
//                 </div>

//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                   style={{ top: -12 }}
//                 >
//                   <div className="w-0 h-0 border-l-[14px] sm:border-l-[18px] border-l-transparent
//                                   border-r-[14px] sm:border-r-[18px] border-r-transparent
//                                   border-b-[28px] sm:border-b-[32px] border-b-yellow-400 mx-auto"
//                   ></div>
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-base sm:text-lg transition-all duration-300 ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-inner text-white font-mono text-sm sm:text-base">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result === null ? "—" : `${result.name} (ID: ${result.id})`}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//               History
//             </h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-600"
//                     style={{ background: "#1F2937" }}
//                   >
//                     <div className="font-mono text-yellow-200">
//                       #{2350 + i}
//                     </div>
//                     <div className="font-bold">
//                       {h.name} (ID: {h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-900 text-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center max-w-md border-4 border-yellow-400 relative overflow-hidden">
//               {/* Winner Circle Name */}
//               <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto">
//                 <svg viewBox="0 0 300 300" className="w-full h-full animate-spin-slow">
//                   <defs>
//                     <path
//                       id="circlePath"
//                       d="M 150, 150 m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0"
//                     />
//                   </defs>
//                   <text fill="#FACC15" fontSize="16" fontWeight="bold">
//                     <textPath href="#circlePath" startOffset="0%" textAnchor="middle" letterSpacing="4">
//                       🎉 Winner: {result.name} 🎉 Winner: {result.name} 🎉
//                     </textPath>
//                   </text>
//                 </svg>

//                 {/* Winner Name in Middle */}
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <h2 className="text-xl sm:text-3xl font-extrabold text-yellow-400 mb-2">🎊 Winner 🎊</h2>
//                   <p className="text-lg sm:text-2xl font-bold">{result.name}</p>
//                   <p className="text-sm sm:text-lg opacity-80">ID: {result.id}</p>
//                 </div>
//               </div>

//               <p className="text-xs text-gray-400 mt-6">
//                 This window will close automatically in 10 seconds
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }












// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";
// import { Menu } from "lucide-react";

// type Player = { id: number; name: string };

// export default function CasinoPage() {
//   const initialPlayers = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [result, setResult] = useState<Player | null>(null);
//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const getColor = (p: Player) =>
//     p.id % 3 === 0 ? "#10B981" : p.id % 2 === 0 ? "#EF4444" : "#111827";

//   const getUsers = () => {
//     Api.get(`/all_users`)
//       .then((res) => setAvailablePlayers(res.data.data))
//       .catch(() => setAvailablePlayers(initialPlayers));
//   };

//   useEffect(() => {
//     getUsers();
//   }, []);

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setAvailablePlayers((prev) => prev.filter((p) => p.id !== win.id));
//       setSpinning(false);
//       setModalVisible(true);
//       setTimeout(() => setModalVisible(false), 10000);
//     }, 6000);
//   };

//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;
//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 w-20 sm:w-24 md:w-28 h-12 sm:h-14 md:h-16
//         -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center
//         text-[10px] sm:text-xs md:text-sm font-bold rounded-t-lg shadow-md border border-gray-400 px-1"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-45%) rotate(${-rotation}deg)`,
//           background: getColor(p),
//           color: "white",
//         }}
//       >
//         <span className="truncate max-w-[90%]">{p.name}</span>
//         <span className="opacity-70 text-[9px] sm:text-[10px]">{p.id}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex">
//       {/* Sidebar */}
//       <aside
//         className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-800/90 backdrop-blur-lg p-4 transition-transform duration-300 z-40
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
//       >
//         <h2 className="text-xl font-bold mb-4">Players</h2>
//         <ul className="space-y-2 max-h-64 overflow-y-auto">
//           {availablePlayers.map((p) => (
//             <li
//               key={p.id}
//               className="p-2 rounded bg-gray-700/50 flex justify-between items-center"
//             >
//               <span>{p.name}</span>
//               <span className="text-sm opacity-70">#{p.id}</span>
//             </li>
//           ))}
//         </ul>

//         {result && (
//           <div className="mt-6 p-4 bg-yellow-500 text-black rounded-xl font-bold shadow-lg">
//             Winner: {result.name}
//           </div>
//         )}

//         <div className="mt-6">
//           <h3 className="text-lg font-semibold mb-2">History</h3>
//           <ul className="space-y-1 max-h-64 overflow-y-auto">
//             {history.map((h, i) => (
//               <li
//                 key={i}
//                 className="p-2 bg-gray-700/50 rounded flex justify-between items-center"
//               >
//                 <span>{h.name}</span>
//                 <span className="text-sm opacity-70">#{h.id}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </aside>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Main */}
//       <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
//         {/* Mobile toggle button */}
//         <button
//           className="md:hidden absolute top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
//           onClick={() => setSidebarOpen(true)}
//         >
//           <Menu size={24} />
//         </button>

//         {/* Wheel */}
//         <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[400px] md:max-w-[600px] flex items-center justify-center">
//           <div
//             ref={wheelRef}
//             className="rounded-full shadow-[0_0_25px_#FACC15] border-4 sm:border-8 border-yellow-400 overflow-hidden relative w-full h-full"
//             style={{
//               transition: spinning
//                 ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                 : "none",
//               transform: `rotate(${angle}deg)`,
//               background: "radial-gradient(circle at center, #FDE68A, #D97706)",
//             }}
//           >
//             {pocketsElements}
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full bg-yellow-600 flex items-center justify-center text-lg sm:text-xl md:text-3xl font-extrabold border-2 sm:border-4 border-yellow-700 text-black shadow-[0_0_20px_#FACC15]">
//                 SPiN
//               </div>
//             </div>
//           </div>
//           {/* Pointer */}
//           <div
//             className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//             style={{ top: -12 }}
//           >
//             <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] md:border-l-[20px] border-l-transparent
//                             border-r-[12px] sm:border-r-[16px] md:border-r-[20px] border-r-transparent
//                             border-b-[22px] sm:border-b-[28px] md:border-b-[36px] border-b-yellow-400
//                             mx-auto drop-shadow-[0_0_10px_#FACC15]"></div>
//           </div>
//         </div>

//         {/* Spin button */}
//         <button
//           onClick={spin}
//           disabled={spinning || availablePlayers.length === 0}
//           className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50 shadow-[0_0_15px_#FACC15]"
//         >
//           {spinning ? "Spinning..." : "Spin Now"}
//         </button>
//       </main>
//     </div>
//   );
// }












// "use client";

// import React, { useEffect, useRef, useState } from "react";

// export default function CasinoPage() {
//   type Player = {
//     id: number;
//     name: string;
//   };

//   const [players, setPlayers] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // ডেমো ডাটা
//     const demoPlayers: Player[] = Array.from({ length: 12 }, (_, i) => ({
//       id: i + 1,
//       name: `Player ${i + 1}`,
//     }));
//     setPlayers(demoPlayers);
//     setAvailablePlayers(demoPlayers);
//   }, []);

//   // স্পিন হ্যান্ডলার
//   const handleSpin = () => {
//     if (spinning || availablePlayers.length === 0) return;

//     setSpinning(true);
//     const pocketAngle = 360 / availablePlayers.length;
//     const randomIndex = Math.floor(Math.random() * availablePlayers.length);

//     const randomSpin = 5 * 360 + randomIndex * pocketAngle + pocketAngle / 2;
//     const newAngle = angle + randomSpin;

//     setAngle(newAngle);

//     setTimeout(() => {
//       const winner = availablePlayers[randomIndex];
//       if (winner) {
//         setHistory([winner, ...history]);
//         setAvailablePlayers(availablePlayers.filter((p) => p.id !== winner.id));
//       }
//       setSpinning(false);
//     }, 6000);
//   };

//   // Color
//   const getColor = (p: Player) => {
//     if (history.find((h) => h.id === p.id)) return "red";
//     return "green";
//   };

//   // Wheel pockets
//   const pocketsElements = availablePlayers.map((p, i) => {
//     const pocketAngle = 360 / availablePlayers.length;
//     return (
//       <div
//         key={p.id}
//         className="absolute w-1/2 h-1/2 origin-bottom-left flex items-center justify-center text-xs sm:text-sm md:text-base font-bold text-black"
//         style={{
//           transform: `rotate(${i * pocketAngle}deg)`,
//           background:
//             getColor(p) === "green"
//               ? "linear-gradient(135deg,#10B981,#065F46)"
//               : "linear-gradient(135deg,#EF4444,#991B1B)",
//           clipPath: "polygon(100% 0,0 0,0 100%)",
//         }}
//       >
//         <span
//           className="rotate-90 text-white font-extrabold drop-shadow"
//           style={{ writingMode: "vertical-rl" }}
//         >
//           {p.name}
//         </span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 sm:p-6">
//       {/* Sidebar Toggle (Mobile) */}
//       <button
//         onClick={() => setSidebarOpen(!sidebarOpen)}
//         className="md:hidden fixed top-4 left-4 z-50 bg-yellow-500 text-black px-3 py-2 rounded-lg shadow-lg"
//       >
//         {sidebarOpen ? "✖ Close" : "☰ Players"}
//       </button>

//       <main className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
//         {/* Sidebar */}
//         <aside
//           className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-800 p-4 rounded-r-xl shadow-lg transform transition-transform duration-300 z-40
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//         >
//           <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//             Available Players
//           </h2>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-[70vh] overflow-y-auto">
//             {availablePlayers.length > 0 ? (
//               availablePlayers.map((p) => (
//                 <div
//                   key={p.id}
//                   className="p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105"
//                   style={{
//                     background:
//                       getColor(p) === "green"
//                         ? "#065F46"
//                         : getColor(p) === "red"
//                         ? "#991B1B"
//                         : "#1F2937",
//                   }}
//                 >
//                   <span>{p.name}</span>
//                   <span className="text-xs opacity-75">ID: {p.id}</span>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center text-gray-400 col-span-full py-4">
//                 No players left! 😥
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* Wheel Section */}
//         <section className="md:col-span-6 flex flex-col items-center">
//           <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[580px] h-[280px] sm:h-[400px] md:h-[580px] flex items-center justify-center">
//             <div className="absolute w-full h-full">
//               <div
//                 ref={wheelRef}
//                 className="rounded-full shadow-2xl border-4 sm:border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                 style={{
//                   transition: spinning
//                     ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                     : "none",
//                   transform: `rotate(${angle}deg)`,
//                   background:
//                     "radial-gradient(circle at center, #FDE68A, #D97706)",
//                 }}
//               >
//                 {pocketsElements}
//                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full bg-yellow-600 flex items-center justify-center text-base sm:text-xl md:text-3xl font-extrabold border-2 sm:border-4 border-yellow-700 text-black shadow-inner">
//                   SPiN
//                 </div>
//               </div>
//               {/* Pointer */}
//               <div
//                 className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                 style={{ top: -12 }}
//               >
//                 <div className="w-0 h-0 border-l-[10px] sm:border-l-[14px] md:border-l-[18px] border-l-transparent border-r-[10px] sm:border-r-[14px] md:border-r-[18px] border-r-transparent border-b-[20px] sm:border-b-[28px] md:border-b-[32px] border-b-yellow-400 mx-auto"></div>
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={handleSpin}
//             disabled={spinning || availablePlayers.length === 0}
//             className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl shadow-lg font-bold hover:bg-yellow-400 disabled:opacity-50"
//           >
//             {spinning ? "Spinning..." : "Spin Now"}
//           </button>
//         </section>

//         {/* History Section */}
//         <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//           <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//             History
//           </h2>
//           <div className="space-y-2 text-sm max-h-[70vh] overflow-y-auto">
//             {history.length ? (
//               history.map((h, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-600 transition-transform hover:scale-105 hover:shadow-md"
//                   style={{ background: "#1F2937" }}
//                 >
//                   <div className="font-mono text-yellow-200 truncate">
//                     #{2350 + i}
//                   </div>
//                   <div className="font-bold truncate">
//                     {h.name} (ID: {h.id})
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-xs opacity-60 text-center py-4">
//                 No draws yet. Press SPIN to start.
//               </div>
//             )}
//           </div>
//         </aside>
//       </main>
//     </div>
//   );
// }





























// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {
//   type Player = { id: number; name: string };
//   type Item = { id: number };

//   const initialPlayers = useMemo(
//     () =>
//       Array.from({ length: 12 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   const getColor = (n: Item) =>
//     n.id % 3 === 0 ? "green" : n.id % 2 === 0 ? "red" : "black";

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<Player | null>(null);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const degPer = 360 / availablePlayers.length;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setAvailablePlayers((prev) => prev.filter((p) => p.id !== win?.id));
//       setSpinning(false);
//       setModalVisible(true);
//       setTimeout(() => setModalVisible(false), 10000);
//     }, 6000);
//   };

//   useEffect(() => {
//     getUsers();
//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Enter") spin();
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);

//   const getUsers = () => {
//     Api.get(`/all_users`)
//       .then((res) => setAvailablePlayers(res.data.data))
//       .catch(() => setAvailablePlayers(initialPlayers));
//   };

//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;
//     const color = getColor(p);
//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 w-16 sm:w-20 md:w-28 h-8 sm:h-10 md:h-14 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-[8px] sm:text-xs md:text-sm font-semibold rounded-t-lg border border-gray-500"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-${availablePlayers.length > 12 ? 130 : 190}px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#10B981"
//               : color === "red"
//               ? "#EF4444"
//               : "#000000",
//           color: "white",
//         }}
//       >
//         <span className="truncate">{p.name}</span>
//         <span className="opacity-75">ID:{p.id}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <header className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2 sm:gap-0">
//           <h1 className="text-xl sm:text-2xl font-extrabold text-yellow-400 tracking-wider">
//             SPiN WiN
//           </h1>
//           <div className="text-xs sm:text-sm">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-200">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Sidebar / Available Players */}
//           <aside className="md:col-span-3 bg-gray-800 p-3 rounded-xl shadow-lg">
//             <h2 className="text-lg font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-80 overflow-y-auto">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-2 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105 hover:shadow-[0_0_8px_#FACC15,0_0_16px_#F59E0B]"
//                     style={{
//                       background:
//                         getColor(p) === "green"
//                           ? "#065F46"
//                           : getColor(p) === "red"
//                           ? "#991B1B"
//                           : "#1F2937",
//                     }}
//                   >
//                     <span className="truncate">{p.name}</span>
//                     <span className="text-xs opacity-75">ID:{p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Spin Wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[580px] h-[280px] sm:h-[400px] md:h-[580px] flex items-center justify-center">
//               <div className="absolute w-full h-full">
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-4 sm:border-6 md:border-8 border-yellow-500 overflow-hidden relative"
//                   style={{
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #FDE68A, #D97706)",
//                   }}
//                 >
//                   {pocketsElements}
//                   {/* Center */}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-48 h-16 sm:h-24 md:h-48 rounded-full bg-yellow-600 flex items-center justify-center text-sm sm:text-xl md:text-3xl font-extrabold border-2 sm:border-4 border-yellow-700 text-black shadow-inner">
//                     SPiN
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                   style={{ top: -10 }}
//                 >
//                   <div className="w-0 h-0 border-l-[10px] sm:border-l-[14px] md:border-l-[18px] border-l-transparent border-r-[10px] sm:border-r-[14px] md:border-r-[18px] border-r-transparent border-b-[20px] sm:border-b-[28px] md:border-b-[32px] border-b-yellow-400 mx-auto shadow-[0_0_8px_#FACC15,0_0_16px_#F59E0B]"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-6 py-2 rounded-full font-bold text-base transition-all duration-300 ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800 p-3 rounded-lg shadow-inner text-white font-mono text-sm">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result ? `${result.name} (ID:${result.id})` : "—"}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* History */}
//           <aside className="md:col-span-3 bg-gray-800 p-3 rounded-xl shadow-lg">
//             <h2 className="text-lg font-bold text-yellow-300 mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 rounded-lg border border-gray-600 transition-transform hover:scale-105 hover:shadow-[0_0_8px_#FACC15,0_0_16px_#F59E0B]"
//                     style={{ background: "#1F2937" }}
//                   >
//                     <div className="font-mono text-yellow-200">#{2350 + i}</div>
//                     <div className="font-bold truncate">
//                       {h.name} (ID:{h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Winner Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl text-center max-w-md border-4 border-yellow-400 relative">
//               <div className="relative w-40 sm:w-52 h-40 sm:h-52 mx-auto">
//                 <svg
//                   viewBox="0 0 300 300"
//                   className="w-full h-full animate-spin-slow"
//                 >
//                   <defs>
//                     <path
//                       id="circlePath"
//                       d="M 150, 150 m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0"
//                     />
//                   </defs>
//                   <text fill="#FACC15" fontSize="14" fontWeight="bold">
//                     <textPath
//                       href="#circlePath"
//                       startOffset="0%"
//                       textAnchor="middle"
//                       letterSpacing="4"
//                     >
//                       🎉 Winner: {result.name} 🎉 Winner: {result.name} 🎉
//                     </textPath>
//                   </text>
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <h2 className="text-lg sm:text-xl font-extrabold text-yellow-400 mb-1">
//                     🎊 Winner 🎊
//                   </h2>
//                   <p className="text-base sm:text-lg font-bold">{result.name}</p>
//                   <p className="text-xs sm:text-sm opacity-80">ID:{result.id}</p>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-4">
//                 Closing in 10 seconds...
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }











// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {
//   type Player = {
//     id: number;
//     name: string;
//   };

//   // ডেমো ডেটা (যদি API fail করে fallback হিসেবে)
//   const initialPlayers = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   type Item = {
//     id: number;
//   };

//   const getColor = (n: Item) =>
//     n.id % 3 === 0 ? "green" : n.id % 2 === 0 ? "red" : "black";

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<Player | null>(null);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     const duration = 6000; // 6s spin
//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setAvailablePlayers((prev) => prev.filter((p) => p.id !== win?.id));
//       setSpinning(false);

//       setModalVisible(true);
//       setTimeout(() => setModalVisible(false), 10000); // 10 সেকেন্ড পরে hide
//     }, duration);
//   };

//   useEffect(() => {
//     getUsers();

//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Enter") {
//         spin();
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);

//   const getUsers = () => {
//     Api.get(`/all_users`)
//       .then((res) => {
//         setAvailablePlayers(res.data.data);
//       })
//       .catch((err) => {
//         console.error("Error:", err);
//         setAvailablePlayers(initialPlayers);
//       });
//   };

//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;
//     const color = getColor(p);
//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 w-28 h-14 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border border-gray-400 p-1 sm:p-2"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-220px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#10B981"
//               : color === "red"
//               ? "#EF4444"
//               : "#000000",
//           color: "white",
//         }}
//       >
//         <span className="text-xs sm:text-sm font-bold">{p.name}</span>
//         <span className="text-[10px] sm:text-xs opacity-75">ID: {p.id}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-6">
//           <h1 className="text-lg sm:text-2xl font-extrabold text-yellow-400 tracking-wider">
//             SPiN WiN
//           </h1>
//           <div className="text-xs sm:text-sm">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-200">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-80 overflow-y-auto">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-2 sm:p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105"
//                     style={{
//                       background:
//                         getColor(p) === "green"
//                           ? "#065F46"
//                           : getColor(p) === "red"
//                           ? "#991B1B"
//                           : "#1F2937",
//                     }}
//                   >
//                     <span>{p.name}</span>
//                     <span className="text-xs opacity-75">ID: {p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[500px] h-[500px] sm:max-w-[580px] sm:h-[580px] flex items-center justify-center">
//               <div className="absolute w-full h-full">
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-4 sm:border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                   style={{
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #FDE68A, #D97706)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-yellow-600 flex items-center justify-center text-xl sm:text-3xl font-extrabold border-2 sm:border-4 border-yellow-700 text-black shadow-inner">
//                     SPiN
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                   style={{ top: -12 }}
//                 >
//                   <div className="w-0 h-0 border-l-[14px] sm:border-l-[18px] border-l-transparent border-r-[14px] sm:border-r-[18px] border-r-transparent border-b-[28px] sm:border-b-[32px] border-b-yellow-400 mx-auto"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-base sm:text-lg transition-all duration-300 ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-inner text-white font-mono text-sm sm:text-base">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result === null ? "—" : `${result.name} (ID: ${result.id})`}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3">
//               History
//             </h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-600"
//                     style={{ background: "#1F2937" }}
//                   >
//                     <div className="font-mono text-yellow-200">
//                       #{2350 + i}
//                     </div>
//                     <div className="font-bold">
//                       {h.name} (ID: {h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-900 text-white p-6 sm:p-10 rounded-2xl shadow-2xl text-center max-w-md border-4 border-yellow-400 relative overflow-hidden">
//               {/* Winner Circle Name */}
//               <div className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto">
//                 <svg
//                   viewBox="0 0 300 300"
//                   className="w-full h-full animate-spin-slow"
//                 >
//                   <defs>
//                     <path
//                       id="circlePath"
//                       d="M 150, 150 m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0"
//                     />
//                   </defs>
//                   <text fill="#FACC15" fontSize="16" fontWeight="bold">
//                     <textPath
//                       href="#circlePath"
//                       startOffset="0%"
//                       textAnchor="middle"
//                       letterSpacing="4"
//                     >
//                       🎉 Winner: {result.name} 🎉 Winner: {result.name} 🎉
//                     </textPath>
//                   </text>
//                 </svg>

//                 {/* Winner Name in Middle */}
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <h2 className="text-xl sm:text-3xl font-extrabold text-yellow-400 mb-2">
//                     🎊 Winner 🎊
//                   </h2>
//                   <p className="text-lg sm:text-2xl font-bold">
//                     {result.name}
//                   </p>
//                   <p className="text-sm sm:text-lg opacity-80">
//                     ID: {result.id}
//                   </p>
//                 </div>
//               </div>

//               <p className="text-xs text-gray-400 mt-6">
//                 This window will close automatically in 10 seconds
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




























// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {
//   type Player = {
//     id: number;
//     name: string;
//   };

//   const initialPlayers: Player[] = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<Player | null>(null);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const getColor = (id: number) =>
//     id % 3 === 0 ? "green" : id % 2 === 0 ? "red" : "black";

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setAvailablePlayers((prev) => prev.filter((p) => p.id !== win?.id));
//       setSpinning(false);
//       setModalVisible(true);

//       setTimeout(() => setModalVisible(false), 3000);
//     }, 2000);
//   };

//   useEffect(() => {
//     getUsers();

//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Enter") spin();
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);

//   const getUsers = () => {
//     Api.get(`/all_users`)
//       .then((res) => setAvailablePlayers(res.data.data as Player[]))
//       .catch(() => setAvailablePlayers(initialPlayers));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-sans flex flex-col">
//       <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
//         {/* Header */}
//         <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
//           <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
//             🎰 SPiN WiN
//           </h1>
//           <div className="text-sm sm:text-base bg-gray-800 px-4 py-2 rounded-full shadow-md">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-300">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         {/* Main Layout */}
//         <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//           {/* Left Panel */}
//           <aside className="lg:col-span-3 bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow-xl">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 text-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105 shadow-md"
//                     style={{
//                       background:
//                         getColor(p.id) === "green"
//                           ? "#065F46"
//                           : getColor(p.id) === "red"
//                           ? "#991B1B"
//                           : "#1F2937",
//                     }}
//                   >
//                     <span>{p.name}</span>
//                     <span className="text-xs opacity-75">ID: {p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Center Wheel */}
//           <section className="lg:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[580px] aspect-square flex items-center justify-center">
//               <div
//                 ref={wheelRef}
//                 className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                 style={{
//                   transition: spinning
//                     ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                     : "none",
//                   transform: `rotate(${angle}deg)`,
//                   background:
//                     "radial-gradient(circle at center, #FDE68A, #D97706)",
//                 }}
//               >
//                 {availablePlayers.map((p, i) => {
//                   const degPer = 360 / availablePlayers.length;
//                   const rotation = i * degPer;
//                   const color = getColor(p.id);
//                   return (
//                     <div
//                       key={p.id}
//                       className="absolute top-1/2 left-1/2 w-24 sm:w-28 h-12 sm:h-14 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-[10px] sm:text-xs font-semibold rounded-t-lg shadow-sm border border-gray-400"
//                       style={{
//                         transform: `rotate(${rotation}deg) translateY(-45%) rotate(${-rotation}deg)`,
//                         background:
//                           color === "green"
//                             ? "#10B981"
//                             : color === "red"
//                             ? "#EF4444"
//                             : "#000000",
//                         color: "white",
//                       }}
//                     >
//                       <span>{p.name}</span>
//                       <span className="opacity-75">ID: {p.id}</span>
//                     </div>
//                   );
//                 })}

//                 {/* Center Button */}
//                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-yellow-500 flex items-center justify-center text-lg sm:text-2xl font-extrabold border-4 border-yellow-700 text-black shadow-inner">
//                   SPiN
//                 </div>
//               </div>
//               {/* Pointer */}
//               <div className="absolute top-0 left-1/2 -translate-x-1/2">
//                 <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-l-transparent border-r-[12px] sm:border-r-[16px] border-r-transparent border-b-[24px] sm:border-b-[28px] border-b-yellow-400"></div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800/80 px-4 py-3 rounded-lg shadow-inner text-white font-mono">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result === null
//                     ? "—"
//                     : `${result.name} (ID: ${result.id})`}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right Panel */}
//           <aside className="lg:col-span-3 bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow-xl">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 rounded-lg border border-gray-600 shadow-md bg-gray-900/60"
//                   >
//                     <div className="font-mono text-yellow-200">
//                       #{2350 + i}
//                     </div>
//                     <div className="font-bold">
//                       {h.name} (ID: {h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-900/90 text-white p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm border-4 border-yellow-400 animate-bounce">
//               <h2 className="text-3xl font-extrabold mb-4 text-yellow-400 drop-shadow-md">
//                 🎉 Winner! 🎉
//               </h2>
//               <p className="text-2xl mb-2 font-bold">{result.name}</p>
//               <p className="text-lg opacity-80 mb-6">ID: {result.id}</p>
//               <p className="text-sm text-gray-400">
//                 Closing automatically in 3s...
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }













// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {
//   type Player = {
//     id: number;
//     name: string;
//   };

//   // ডেমো ডেটা: পরবর্তীতে API থেকে ডেটা লোড করার জন্য এই কাঠামো ব্যবহার করা যাবে।
//   const initialPlayers: Player[] = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

//   type Item = {
//     id: number;
//   };

//   const getColor = (n: Item) =>
//     n.id % 3 === 0 ? "green" : n.id % 2 === 0 ? "red" : "black";

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState<Player | null>(null);
//   const [history, setHistory] = useState<Player[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef<HTMLDivElement | null>(null);

//   const spin = () => {
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     const duration = 2000;
//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));

//       setAvailablePlayers((prev) =>
//         prev.filter((p) => p.id !== win?.id)
//       );

//       setSpinning(false);
//       setModalVisible(true);

//       setTimeout(() => setModalVisible(false), 2000); // 2 সেকেন্ড পর হাইড
//     }, duration);
//   };

//   useEffect(() => {
//     getus();

//     const handleKey = (e: KeyboardEvent) => {
//       if (e.key === "Enter") {
//         spin();
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);

//   const getus = () => {
//     Api.get(`/all_users`)
//       .then((res) => {
//         console.log(res.data);
//         setAvailablePlayers(res.data.data as Player[]);
//       })
//       .catch((err) => {
//         console.error("Earning History Error:", err);
//         setAvailablePlayers(initialPlayers);
//       })
//       .finally(() => console.log("not error data finally get data"));
//   };

//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;
//     const color = getColor(p);
//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 w-32 h-16 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border border-gray-400 p-2"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-250px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#10B981"
//               : color === "red"
//               ? "#EF4444"
//               : "#000000",
//           color: "white",
//         }}
//       >
//         <span className="text-sm font-bold">{p.name}</span>
//         <span className="text-xs opacity-75">ID: {p.id}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-extrabold text-yellow-400 tracking-wider">
//             SPiN WiN
//           </h1>
//           <div className="text-sm">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-200">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-80 overflow-y-auto">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105"
//                     style={{
//                       background:
//                         getColor(p) === "green"
//                           ? "#065F46"
//                           : getColor(p) === "red"
//                           ? "#991B1B"
//                           : "#1F2937",
//                     }}
//                   >
//                     <span>{p.name}</span>
//                     <span className="text-xs opacity-75">ID: {p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[580px] h-[580px] flex items-center justify-center">
//               <div className="absolute w-full h-full">
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                   style={{
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #FDE68A, #D97706)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-yellow-600 flex items-center justify-center text-3xl font-extrabold border-4 border-yellow-700 text-black shadow-inner">
//                     SPiN
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                   style={{ top: -12 }}
//                 >
//                   <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[32px] border-b-yellow-400 mx-auto"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-white font-mono">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result === null
//                     ? "—"
//                     : `${result.name} (ID: ${result.id})`}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 rounded-lg border border-gray-600"
//                     style={{ background: "#1F2937" }}
//                   >
//                     <div className="font-mono text-yellow-200">
//                       #{2350 + i}
//                     </div>
//                     <div className="font-bold">
//                       {h.name} (ID: {h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm border-4 border-yellow-400 animate-pulse">
//               <h2 className="text-3xl font-extrabold mb-4 text-yellow-400">
//                 🎉 Winner! 🎉
//               </h2>
//               <p className="text-2xl mb-2 font-bold">{result.name}</p>
//               <p className="text-lg opacity-80 mb-6">ID: {result.id}</p>
//               <p className="text-sm text-gray-400">
//                 This window will close automatically in 10 seconds
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Api from "../api/Api";

// export default function CasinoPage() {

//   type Player = {
//   id: number;
//   name: string;
// };

//   // ডেমো ডেটা: পরবর্তীতে API থেকে ডেটা লোড করার জন্য এই কাঠামো ব্যবহার করা যাবে।
//   const initialPlayers = useMemo(
//     () =>
//       Array.from({ length: 15 }, (_, i) => ({
//         id: 1000 + i,
//         name: `Player ${i + 1}`,
//       })),
//     []
//   );

  
// type Item = {
//   id: number;
// };

// const getColor = (n: Item) => (n.id % 3 === 0 ? "green" : n.id % 2 === 0 ? "red" : "black");


//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [availablePlayers, setAvailablePlayers] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const wheelRef = useRef(null);


//   const spin = () => {
    
//     if (spinning || availablePlayers.length === 0) return;
//     setSpinning(true);
    

//     const pickIndex = Math.floor(Math.random() * availablePlayers.length);
//     const win = availablePlayers[pickIndex];
//     const pockets = availablePlayers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     const duration = 2000;
//     setTimeout(() => {
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
  
//       setAvailablePlayers((prev: any[]) => prev.filter((p) => p.id !== win?.id));

//       setSpinning(false);

//       setModalVisible(true);
//       setTimeout(() => setModalVisible(false), 2000); // 10 সেকেন্ড পর হাইড
//     }, duration);
//   };






  


//   useEffect(() => {

// getus();
// console.log('=========dynamick dat array===========================');
// console.log(availablePlayers);
// console.log('====================================');




//     const handleKey = (e) => {
//       if (e.key === "Enter") {
//         spin();
//       }




//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [spinning, availablePlayers]);







//   const getus=()=>{


//     Api.get(`/all_users`)
//       .then((res) => {
   
//        console.log(res.data);
//        setAvailablePlayers(res.data.data);
//       })
//       .catch((err) => {
//         console.error("Earning History Error:", err);

//    setAvailablePlayers(initialPlayers);

//       })
//       .finally(() => 

//   console.log('not error data finally get data')

//       );


// }

//   const pocketsElements = availablePlayers.map((p, i) => {
//     const degPer = 360 / availablePlayers.length;
//     const rotation = i * degPer;
//     const color = getColor(p);
//     return (
//       <div
//         key={p.id}
//         className="absolute top-1/2 left-1/2 w-32 h-16 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex flex-col items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border border-gray-400 p-2"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-250px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#10B981"
//               : color === "red"
//               ? "#EF4444"
//               : "#000000",
//           color: "white",
//         }}
//       >
//         <span className="text-sm font-bold">{p.name}</span>
//         <span className="text-xs opacity-75">ID: {p.id}</span>
//       </div>
//     );
//   });



//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 font-sans">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-extrabold text-yellow-400 tracking-wider">
//             SPiN WiN
//           </h1>
//           <div className="text-sm">
//             Current Draw:{" "}
//             <span className="font-mono text-yellow-200">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">
//               Available Players
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm max-h-80 overflow-y-auto">
//               {availablePlayers.length > 0 ? (
//                 availablePlayers.map((p) => (
//                   <div
//                     key={p.id}
//                     className="p-3 rounded-lg flex flex-col items-center justify-center font-bold text-center border border-gray-600 transition-transform hover:scale-105"
//                     style={{
//                       background:
//                         getColor(p) === "green"
//                           ? "#065F46"
//                           : getColor(p) === "red"
//                           ? "#991B1B"
//                           : "#1F2937",
//                     }}
//                   >
//                     <span>{p.name}</span>
//                     <span className="text-xs opacity-75">ID: {p.id}</span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center text-gray-400 col-span-full py-4">
//                   No players left! 😥
//                 </div>
//               )}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="md:col-span-6 flex flex-col items-center">
//             <div className="relative w-full max-w-[580px] h-[580px] flex items-center justify-center">
//               <div className="absolute w-full h-full">
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative w-full h-full"
//                   style={{
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #FDE68A, #D97706)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-yellow-600 flex items-center justify-center text-3xl font-extrabold border-4 border-yellow-700 text-black shadow-inner">
//                     SPiN
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
//                   style={{ top: -12 }}
//                 >
//                   <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[32px] border-b-yellow-400 mx-auto"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
//               <button
//                 onClick={spin}
//                 disabled={spinning || availablePlayers.length === 0}
//                 className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${
//                   spinning || availablePlayers.length === 0
//                     ? "bg-gray-600 text-gray-400 cursor-not-allowed"
//                     : "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
//                 }`}
//               >
//                 {spinning ? "Spinning..." : "SPIN"}
//               </button>
//               <div className="bg-gray-800 p-4 rounded-lg shadow-inner text-white font-mono">
//                 Result:{" "}
//                 <span className="font-bold ml-2 text-yellow-300">
//                   {result === null ? "—" : `${result.name} (ID: ${result.id})`}
//                 </span>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="md:col-span-3 bg-gray-800 p-4 rounded-xl shadow-lg">
//             <h2 className="text-xl font-bold text-yellow-300 mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 rounded-lg border border-gray-600"
//                     style={{ background: "#1F2937" }}
//                   >
//                     <div className="font-mono text-yellow-200">
//                       #{2350 + i}
//                     </div>
//                     <div className="font-bold">
//                       {h.name} (ID: {h.id})
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-60 text-center py-4">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>

//         {/* Modal */}
//         {modalVisible && result && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm border-4 border-yellow-400 animate-pulse">
//               <h2 className="text-3xl font-extrabold mb-4 text-yellow-400">
//                 🎉 Winner! 🎉
//               </h2>
//               <p className="text-2xl mb-2 font-bold">{result.name}</p>
//               <p className="text-lg opacity-80 mb-6">ID: {result.id}</p>
//               <p className="text-sm text-gray-400">
//                 This window will close automatically in 10 seconds
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






// "use client";

// import React, { useMemo, useRef, useState } from "react";

// export default function CasinoPage() {
//   const numbers = useMemo(() => Array.from({ length: 37 }, (_, i) => i), []);
//   const getColor = (n) => (n === 0 ? "green" : n % 2 === 0 ? "red" : "black");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);
//   const wheelRef = useRef(null);

//   const spin = () => {
//     if (spinning) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const pockets = numbers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;

//     setAngle((prev) => prev + target);

//     setTimeout(() => {
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setSpinning(false);
//     }, 6000);
//   };

//   const stats = useMemo(() => {
//     const s = { green: 0, red: 0, black: 0 };
//     history.forEach((n) => {
//       if (n === 0) s.green++;
//       else if (n % 2 === 0) s.red++;
//       else s.black++;
//     });
//     return s;
//   }, [history]);

//   const pocketsElements = numbers.map((n, i) => {
//     const degPer = 360 / numbers.length;
//     const rotation = i * degPer;
//     const color = getColor(n);
//     return (
//       <div
//         key={n}
//         className="absolute top-1/2 left-1/2 w-20 h-10 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border cursor-default select-none"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-210px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#32CD32"
//               : color === "red"
//               ? "#d32f2f"
//               : "#111827",
//           color: "white",
//           userSelect: "none",
//         }}
//       >
//         <span>{n}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 text-white p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex flex-col sm:flex-row items-center justify-between mb-6">
//           <h1 className="text-3xl font-bold mb-3 sm:mb-0 select-none">SPiN WiN - Demo</h1>
//           <div className="text-sm font-mono bg-green-900 px-3 py-1 rounded shadow-inner select-none">
//             Current Draw: #{history.length ? 2358 + history.length : 2358}
//           </div>
//         </header>

//         <main className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left panel - Numbers list */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg shadow-inner max-h-[480px] overflow-auto">
//             <h2 className="text-lg font-semibold mb-4 select-none">Numbers & Colors</h2>
//             <div className="grid grid-cols-3 gap-2 text-center text-sm">
//               {numbers.map((n) => {
//                 const color = getColor(n);
//                 const colorName = color.charAt(0).toUpperCase() + color.slice(1);
//                 return (
//                   <div
//                     key={n}
//                     className="p-2 rounded font-bold select-none"
//                     style={{
//                       background:
//                         color === "green"
//                           ? "#206040"
//                           : color === "red"
//                           ? "#7a1f1f"
//                           : "#0f1724",
//                       color: "white",
//                     }}
//                     title={`${n} — ${colorName}`}
//                   >
//                     {n} <br />
//                     <span className="text-xs font-normal">{colorName}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </aside>

//           {/* Center - Wheel */}
//           <section className="col-span-6 flex flex-col items-center">
//             <div className="relative w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] flex items-center justify-center">
//               <div className="absolute" style={{ width: "100%", height: "100%" }}>
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative"
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background: "radial-gradient(circle at center, #f6d365, #fda085)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div
//                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-yellow-600 flex items-center justify-center text-2xl font-bold border-4 border-yellow-700 cursor-pointer hover:bg-yellow-500 transition-colors select-none"
//                     onClick={spin}
//                     role="button"
//                     aria-disabled={spinning}
//                     tabIndex={0}
//                     onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') spin() }}
//                   >
//                     {spinning ? "Spinning..." : "SPiN"}
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 -mt-3 w-0 h-0"
//                   style={{ top: -6 }}
//                 >
//                   <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px] border-b-white mx-auto"></div>
//                 </div>
//               </div>
//               {/* Controls */}
//               <div className="mt-6 flex gap-4 items-center select-none">
//                 <button
//                   onClick={spin}
//                   disabled={spinning}
//                   className={`px-6 py-2 rounded-lg font-semibold ${
//                     spinning
//                       ? "opacity-50 cursor-not-allowed bg-yellow-300 text-black"
//                       : "bg-yellow-400 text-black hover:scale-105 transform transition-transform"
//                   }`}
//                 >
//                   {spinning ? "Spinning..." : "SPIN"}
//                 </button>
//                 <div className="bg-green-900 p-3 rounded shadow-inner text-black font-mono min-w-[100px] text-center">
//                   Result:{" "}
//                   <span className="font-bold ml-2">
//                     {result === null ? "—" : result}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right panel - History */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg max-h-[480px] overflow-auto">
//             <h2 className="text-lg font-semibold mb-3 select-none">History</h2>
//             <div className="space-y-2 text-sm max-h-[360px] overflow-auto">
//               {history.length ? (
//                 history.map((h, i) => {
//                   const color = getColor(h);
//                   const colorName = color.charAt(0).toUpperCase() + color.slice(1);
//                   return (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between p-2 rounded shadow-inner"
//                       style={{
//                         background:
//                           color === "green"
//                             ? "#206040"
//                             : color === "red"
//                             ? "#7a1f1f"
//                             : "#0f1724",
//                         color: "white",
//                       }}
//                     >
//                       <div className="font-mono select-text">#{2350 + i}</div>
//                       <div className="font-bold select-text">{h}</div>
//                       <div className="italic text-xs select-none">{colorName}</div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="text-xs opacity-80 select-none">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }








// "use client";

// import React, { useMemo, useRef, useState } from "react";

// export default function CasinoPage() {
//   const numbers = useMemo(() => Array.from({ length: 37 }, (_, i) => i), []);
//   const getColor = (n) => (n === 0 ? "green" : n % 2 === 0 ? "red" : "black");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);
//   const wheelRef = useRef(null);

//   const spin = () => {
//     if (spinning) return;
//     setSpinning(true);

//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const pockets = numbers.length;
//     const degPer = 360 / pockets;
//     const fullSpins = 6 + Math.floor(Math.random() * 3);
//     const target = fullSpins * 360 + degPer * pickIndex;
    
//     setAngle(prev => prev + target);

//     setTimeout(() => {
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setSpinning(false);
//     }, 6000);
//   };

//   const stats = useMemo(() => {
//     const s = { green: 0, red: 0, black: 0 };
//     history.forEach((n) => {
//       if (n === 0) s.green++;
//       else if (n % 2 === 0) s.red++;
//       else s.black++;
//     });
//     return s;
//   }, [history]);

//   const pocketsElements = numbers.map((n, i) => {
//     const degPer = 360 / numbers.length;
//     const rotation = i * degPer;
//     const color = getColor(n);
//     return (
//       <div
//         key={n}
//         className="absolute top-1/2 left-1/2 w-28 h-12 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border"
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-220px) rotate(${-rotation}deg)`,
//           background:
//             color === "green"
//               ? "#32CD32"
//               : color === "red"
//               ? "#d32f2f"
//               : "#111827",
//           color: "white",
//         }}
//       >
//         <span>{n}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-green-700 text-white p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold">SPiN WiN - Demo</h1>
//           <div className="text-sm">
//             Current Draw:{" "}
//             <span className="font-mono">
//               #{history.length ? 2358 + history.length : 2358}
//             </span>
//           </div>
//         </header>

//         <main className="grid grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg shadow-inner">
//             <h2 className="text-lg font-semibold mb-3">Numbers</h2>
//             <div className="grid grid-cols-3 gap-2 text-sm">
//               {numbers.map((n) => (
//                 <div
//                   key={n}
//                   className="p-2 rounded flex items-center justify-center font-bold"
//                   style={{
//                     background:
//                       getColor(n) === "green"
//                         ? "#206040"
//                         : getColor(n) === "red"
//                         ? "#7a1f1f"
//                         : "#0f1724",
//                   }}
//                 >
//                   {n}
//                 </div>
//               ))}
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="col-span-6 flex flex-col items-center">
//             <div className="relative w-[520px] h-[520px] flex items-center justify-center">
//               <div className="absolute" style={{ width: 520, height: 520 }}>
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative"
//                   style={{
//                     width: 520,
//                     height: 520,
//                     transition: spinning
//                       ? "transform 6s cubic-bezier(.08,.8,.2,1)"
//                       : "none",
//                     transform: `rotate(${angle}deg)`,
//                     background:
//                       "radial-gradient(circle at center, #f6d365, #fda085)",
//                   }}
//                 >
//                   {pocketsElements}
//                   <div 
//                     className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-yellow-600 flex items-center justify-center text-2xl font-bold border-4 border-yellow-700 cursor-pointer hover:bg-yellow-500 transition-colors"
//                     onClick={spin}
//                   >
//                     SPiN
//                   </div>
//                 </div>
//                 {/* Pointer */}
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 -mt-3 w-0 h-0"
//                   style={{ top: -6 }}
//                 >
//                   <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px] border-b-white mx-auto"></div>
//                 </div>
//               </div>
//               {/* Controls */}
//               <div className="mt-6 flex gap-4 items-center">
//                 <button
//                   onClick={spin}
//                   disabled={spinning}
//                   className={`px-6 py-2 rounded-lg font-semibold ${
//                     spinning
//                       ? "opacity-50 cursor-not-allowed"
//                       : "bg-yellow-400 text-black hover:scale-105 transform"
//                   }`}
//                 >
//                   {spinning ? "Spinning..." : "SPIN"}
//                 </button>
//                 <div className="bg-green-900 p-3 rounded shadow-inner text-black font-mono">
//                   Result:{" "}
//                   <span className="font-bold ml-2">
//                     {result === null ? "—" : result}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right panel */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg">
//             <h2 className="text-lg font-semibold mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-64 overflow-auto">
//               {history.length ? (
//                 history.map((h, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-2 rounded"
//                     style={{ background: "#0f2a1f" }}
//                   >
//                     <div className="font-mono">#{2350 + i}</div>
//                     <div className="font-bold">{h}</div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-xs opacity-80">
//                   No draws yet. Press SPIN to start.
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }










//  'use client'
// import { useState } from "react";

// export default function Home() {
//   const prizes = ["৳00", "৳0.50", "৳ 0.100", "৳10", "৳  50", "৳30", "৳  200", "৳  5", "Better luck next time!"];
//   const [lotteryId, setLotteryId] = useState("");
//   const [currentPrize, setCurrentPrize] = useState("");
//   const [isSpinning, setIsSpinning] = useState(false);
//   const [disable, setDisables]=useState(false);

//   const generateLottery = () => {
//     setIsSpinning(true);
//     setLotteryId("");
//     setCurrentPrize("");

//     const randomId = "my-lottery -" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
//     let counter = 0;
//     const spinInterval = setInterval(() => {
//       const random = prizes[Math.floor(Math.random() * prizes.length)];
//       setCurrentPrize(random);
//       counter++;
//       if (counter > 5) {
//         clearInterval(spinInterval);
//         setIsSpinning(false);
//         setDisables(true);
//         setLotteryId(randomId);
//       }
//     }, 500);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-red-200 flex items-center justify-center p-4">
//       <div className="bg-gray-600 p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
//         <h1 className="text-3xl font-bold text-white  mb-4">🎲 Lottery Spinner 🎲</h1>

//         <button
//           onClick={generateLottery}
        
//           disabled={isSpinning}
          
//           className={`${
//             isSpinning ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
//           } text-white px-6 py-3 rounded-full font-semibold transition duration-300`}
//         >
//           {isSpinning ? "Spinning..." : "Spin Now"}
//         </button>

//         <div className="mt-6 text-2xl font-bold text-green-600 h-10">
//           {currentPrize}
//         </div>

//         {lotteryId && (
//           <p className="mt-4 text-sm text-white-600">🆔 Your Lottery ID: {lotteryId}</p>
//         )}
//       </div>
//     </div>
//   );
// }


// // import { useState, useRef } from "react";

// // export default function Home() {
// //   const [prizes, setPrizes] = useState(["৳500", "৳1000", "৳2000"]);
// //   const [inputPrize, setInputPrize] = useState("");
// //   const [result, setResult] = useState("");
// //   const [lotteryId, setLotteryId] = useState("");
// //   const wheelRef = useRef(null);

// //   const addPrize = () => {
// //     if (inputPrize.trim() !== "") {
// //       setPrizes([...prizes, inputPrize]);
// //       setInputPrize("");
// //     }
// //   };

// //   const spinWheel = () => {
// //     const totalSegments = prizes.length;
// //     const randomIndex = Math.floor(Math.random() * totalSegments);
// //     const degreesPerSegment = 360 / totalSegments;
// //     const rotation = 360 * 5 + (360 - randomIndex * degreesPerSegment - degreesPerSegment / 2);
    
// //     wheelRef.current.style.transition = "transform 4s ease-out";
// //     wheelRef.current.style.transform = `rotate(${rotation}deg)`;

// //     const newId = "LOT-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

// //     setTimeout(() => {
// //       setResult(prizes[randomIndex]);
// //       setLotteryId(newId);
// //     }, 1000);
// //   };

// //   return (
// //     <div className="min-h-screen bg-dark from-yellow-100 to-red-100 flex flex-col items-center justify-center p-4">
// //       <h1 className="text-3xl font-bold mb-4 text-center">🎡 Lottery Wheel Spinner 🎡</h1>

// //       <div className="flex gap-2 mb-4">
// //         <input
// //           type="text"
// //           placeholder="Enter prize (e.g. ৳3000)"
// //           className="px-3 py-2 rounded border border-gray-400"
// //           value={inputPrize}
// //           onChange={(e) => setInputPrize(e.target.value)}
// //         />
// //         <button
// //           onClick={addPrize}
// //           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
// //         >
// //           Add Prize
// //         </button>
// //       </div>

// //       <div className="relative w-60 h-60 rounded-full border-[10px] border-pink-500 overflow-hidden flex items-center justify-center">
// //         <div ref={wheelRef} className="absolute w-full h-full rounded-full">
// //           {prizes.map((prize, i) => {
// //             const rotate = (360 / prizes.length) * i;
// //             return (
// //               <div
// //                 key={i}
// //                 className="absolute left-1/2 top-1/2 origin-left text-sm"
// //                 style={{
// //                   transform: `rotate(${rotate}deg) translateX(50%)`,
// //                   transformOrigin: "0% 0%",
// //                 }}
// //               >
// //                 {prize}
// //               </div>
// //             );
// //           })}
// //         </div>
// //         <div className="absolute w-2 h-10 bg-black top-0 left-1/2 -translate-x-1/2"></div>
// //       </div>

// //       <button
// //         onClick={spinWheel}
// //         className="mt-6 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition"
// //       >
// //         Spin the Wheel
// //       </button>

// //       {result && (
// //         <div className="mt-6 text-center">
// //           <p className="text-xl text-green-600 font-bold">🎉 Prize: {result}</p>
// //           <p className="text-gray-600">🎫 Lottery ID: {lotteryId}</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }






// // import { useState } from "react";
// // import WheelComponent from "react-wheel-of-prizes";

// // export default function Home() {
// //   const [prizes, setPrizes] = useState(["৳500", "৳1000", "৳2000", "৳5000", "Better luck next time"]);
// //   const [inputPrize, setInputPrize] = useState("");
// //   const [userName, setUserName] = useState("");
// //   const [winner, setWinner] = useState("");
// //   const [lotteryId, setLotteryId] = useState("");

// //   const addPrize = () => {
// //     if (inputPrize.trim() !== "") {
// //       setPrizes([...prizes, inputPrize]);
// //       setInputPrize("");
// //     }
// //   };

// //   const generateId = () => {
// //     return "LOT-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
// //   };

// //   const onFinished = (prize) => {
// //     setWinner(prize);
// //     setLotteryId(generateId());
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center px-4 py-8">
// //       <h1 className="text-3xl font-bold mb-6 text-center">🎡 Lottery Wheel Spin</h1>

// //       {/* User Inputs */}
// //       <div className="w-full max-w-md bg-white p-4 rounded shadow mb-4">
// //         <div className="mb-2">
// //           <label className="block mb-1 text-sm font-semibold">Enter Your Name</label>
// //           <input
// //             type="text"
// //             value={userName}
// //             onChange={(e) => setUserName(e.target.value)}
// //             className="w-full border rounded px-3 py-2"
// //             placeholder="e.g. Jannat Ara"
// //           />
// //         </div>
// //         <div className="flex mt-2 gap-2">
// //           <input
// //             type="text"
// //             placeholder="Add Prize (e.g. ৳3000)"
// //             value={inputPrize}
// //             onChange={(e) => setInputPrize(e.target.value)}
// //             className="w-full border rounded px-3 py-2"
// //           />
// //           <button
// //             onClick={addPrize}
// //             className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
// //           >
// //             ➕
// //           </button>
// //         </div>
// //       </div>

// //       {/* Wheel Component */}
// //       <div className="bg-white p-4 rounded shadow w-full max-w-md">
// //         <WheelComponent
// //           segments={prizes}
// //           segColors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#F7464A"]}
// //           onFinished={(winner) => onFinished(winner)}
// //           primaryColor="#000"
// //           contrastColor="#fff"
// //           buttonText="Spin Now"
// //           isOnlyOnce={false}
// //           size={200}
// //           upDuration={100}
// //           downDuration={500}
// //         />
// //       </div>

// //       {/* Result */}
// //       {winner && (
// //         <div className="mt-6 bg-white p-4 rounded shadow text-center w-full max-w-md">
// //           <h2 className="text-lg font-semibold text-green-700">🎉 Winner Details</h2>
// //           <p className="mt-2 text-gray-800">
// //             🧑‍💼 <strong>Name:</strong> {userName || "Unknown"}
// //           </p>
// //           <p className="text-gray-800">
// //             🎫 <strong>Lottery ID:</strong> {lotteryId}
// //           </p>
// //           <p className="text-pink-600 text-xl font-bold">
// //             🎁 <strong>Prize:</strong> {winner}
// //           </p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }





// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";

// // Usage: place this file as app/page.jsx (or pages/index.jsx) in a Next.js project
// // Requires Tailwind CSS to be configured in the project. If you don't use Tailwind,
// // convert classes to your own CSS.

// export default function CasinoPage() {
//   const numbers = useMemo(() => {
//     // Classic roulette-like sequence (0-36). We'll use a simple 0..36 order for demo.
//     const arr = Array.from({ length: 37 }, (_, i) => i);
//     return arr;
//   }, []);

//   // color map simple: 0 -> green, evens red, odds black (just for demo)
//   const getColor = (n) => (n === 0 ? "green" : n % 2 === 0 ? "red" : "black");

//   const [angle, setAngle] = useState(0);
//   const [spinning, setSpinning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);
//   const wheelRef = useRef(null);

//   const spin = () => {
//     if (spinning) return;
//     setSpinning(true);

//     // pick a random number as the winning pocket
//     const pickIndex = Math.floor(Math.random() * numbers.length);
//     const pockets = numbers.length;

//     // target rotation: many full turns + offset to land picked number at pointer (top)
//     // calculate the angle per pocket
//     const degPer = 360 / pockets;

//     // We want the picked pocket to end up at 0deg (pointer at top). If our wheel numbers
//     // are laid out clockwise starting at 0 at top, then the wheel must rotate so that
//     // the picked pocket is at top. We compute rotation = fullSpins*360 + (pickedIndex * degPer)
//     const fullSpins = 6 + Math.floor(Math.random() * 3); // 6..8 spins
//     const target = fullSpins * 360 + pickIndex * degPer + 360 * Math.random() * 0.25; // small jitter

//     // animate rotation with CSS transition
//     setAngle((prev) => prev + target);

//     // after animation ends, compute final number
//     const duration = 6000; // ms (6s)
//     setTimeout(() => {
//       const finalRotation = (angle + target) % 360;
//       // determine which pocket is at the top
//       // since we rotated wheel by 'angle+target', the top corresponds to index = Math.round(finalRotation / degPer) % pockets
//       // careful about rounding direction: adjust to nearest index
//       const indexAtTop = Math.round(finalRotation / degPer) % pockets;
//       // Because rotation direction and indexing can be tricky, compute picked index via earlier pickIndex
//       const win = numbers[pickIndex];
//       setResult(win);
//       setHistory((h) => [win, ...h].slice(0, 12));
//       setSpinning(false);
//     }, duration + 60);
//   };

//   // stats derived from history
//   const stats = useMemo(() => {
//     const s = { green: 0, red: 0, black: 0 };
//     history.forEach((n) => {
//       if (n === 0) s.green++;
//       else if (n % 2 === 0) s.red++;
//       else s.black++;
//     });
//     return s;
//   }, [history]);

//   // render pockets around a circle
//   const pockets = numbers.map((n, i) => {
//     const degPer = 360 / numbers.length;
//     const rotation = i * degPer;
//     const color = getColor(n);
//     return (
//       <div
//         key={n}
//         className={`absolute top-1/2 left-1/2 w-28 h-12 -translate-x-1/2 -translate-y-1/2 origin-bottom-center flex items-center justify-center text-xs font-semibold rounded-t-lg shadow-sm border`} 
//         style={{
//           transform: `rotate(${rotation}deg) translateY(-220px) rotate(${ -rotation }deg)`,
//           background: color === 'green' ? '#32CD32' : color === 'red' ? '#d32f2f' : '#111827',
//           color: color === 'red' || color === 'green' ? 'white' : 'white',
//         }}
//       >
//         <span>{n}</span>
//       </div>
//     );
//   });

//   return (
//     <div className="min-h-screen bg-green-700 text-white p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold">SPiN WiN - Demo (Next.js single page)</h1>
//           <div className="text-sm">Current Draw: <span className="font-mono">#{history.length ? 2358 + history.length : 2358}</span></div>
//         </header>

//         <main className="grid grid-cols-12 gap-6">
//           {/* Left panel */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg shadow-inner">
//             <h2 className="text-lg font-semibold mb-3">Numbers</h2>
//             <div className="grid grid-cols-3 gap-2 text-sm">
//               {numbers.map((n) => (
//                 <div key={n} className="p-2 rounded flex items-center justify-center font-bold"
//                      style={{ background: getColor(n) === 'green' ? '#206040' : getColor(n) === 'red' ? '#7a1f1f' : '#0f1724' }}>
//                   {n}
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4">
//               <h3 className="font-semibold">Pay Table (sample)</h3>
//               <ul className="text-xs mt-2 space-y-1">
//                 <li>Number (exact): x36</li>
//                 <li>Odd / Even: x2</li>
//                 <li>Colors: x2</li>
//                 <li>Sectors: x3</li>
//               </ul>
//             </div>
//           </aside>

//           {/* Center wheel */}
//           <section className="col-span-6 flex flex-col items-center">
//             <div className="relative w-[520px] h-[520px] flex items-center justify-center">
//               {/* wheel container */}
//               <div className="absolute" style={{ width: 520, height: 520 }}>
//                 <div
//                   ref={wheelRef}
//                   className="rounded-full shadow-2xl border-8 border-yellow-500 overflow-hidden relative"
//                   style={{
//                     width: 520,
//                     height: 520,
//                     transition: spinning ? 'transform 6s cubic-bezier(.08,.8,.2,1)' : 'transform 0.7s ease',
//                     transform: `rotate(${angle}deg)`,
//                     background: 'radial-gradient(circle at center, #f6d365, #fda085)'
//                   }}
//                 >
//                   {/* pockets */}
//                   {pockets}

//                   {/* inner rings */}
//                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-yellow-600 flex items-center justify-center text-2xl font-bold border-4 border-yellow-700">
//                     <div>SPiN</div>
//                   </div>
//                 </div>

//                 {/* pointer */}
//                 <div className="absolute left-1/2 -translate-x-1/2 -mt-3 w-0 h-0" style={{ top: -6 }}>
//                   <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[26px] border-b-white mx-auto"></div>
//                 </div>
//               </div>

//               {/* controls */}
//               <div className="mt-6 flex gap-4 items-center">
//                 <button onClick={spin} disabled={spinning} className={`px-6 py-2 rounded-lg font-semibold ${spinning ? 'opacity-50 cursor-not-allowed' : 'bg-yellow-400 text-black hover:scale-105 transform'}`}>
//                   {spinning ? 'Spinning...' : 'SPIN'}
//                 </button>

//                 <div className="bg-green-900 p-3 rounded shadow-inner text-black font-mono">
//                   Result: <span className="font-bold ml-2">{result === null ? '—' : result}</span>
//                 </div>

//               </div>
//             </div>

//             {/* stats summary under wheel */}
//             <div className="w-full mt-4 grid grid-cols-3 gap-3">
//               <div className="bg-green-800 p-3 rounded">
//                 <div className="text-sm">History</div>
//                 <div className="mt-2 flex gap-2 flex-wrap">
//                   {history.map((h, idx) => (
//                     <div key={idx} className="px-2 py-1 rounded text-xs font-semibold" style={{ background: getColor(h) === 'green' ? '#206040' : getColor(h) === 'red' ? '#7a1f1f' : '#0f1724' }}>{h}</div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-green-800 p-3 rounded">
//                 <div className="text-sm">Stats (last {history.length})</div>
//                 <div className="mt-2 text-xs">
//                   <div>Green: {stats.green}</div>
//                   <div>Red: {stats.red}</div>
//                   <div>Black: {stats.black}</div>
//                 </div>
//               </div>

//               <div className="bg-green-800 p-3 rounded">
//                 <div className="text-sm">Total Bet</div>
//                 <div className="mt-2 font-bold text-lg">3989</div>
//               </div>
//             </div>

//           </section>

//           {/* Right panel */}
//           <aside className="col-span-3 bg-green-800 p-4 rounded-lg">
//             <h2 className="text-lg font-semibold mb-3">History</h2>
//             <div className="space-y-2 text-sm max-h-64 overflow-auto">
//               {history.map((h, i) => (
//                 <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: '#0f2a1f' }}>
//                   <div className="font-mono">#{2350 + i}</div>
//                   <div className="font-bold">{h}</div>
//                 </div>
//               ))}
//               {!history.length && <div className="text-xs opacity-80">No draws yet. Press SPIN to start.</div>}
//             </div>

//             <div className="mt-4">
//               <h3 className="font-semibold">Quick Stats</h3>
//               <div className="mt-2 text-sm">
//                 <div>Draws: {history.length}</div>
//                 <div>Greens: {stats.green}</div>
//                 <div>Reds: {stats.red}</div>
//                 <div>Blacks: {stats.black}</div>
//               </div>
//             </div>

//           </aside>

//         </main>

//         <footer className="mt-6 text-xs opacity-80">This is a demo UI for layout only — not a real gambling game.</footer>
//       </div>
//     </div>
//   );
// }


