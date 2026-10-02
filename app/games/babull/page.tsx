'use client';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROWS = 10;
const COLS = 7;
const MAX_PLAYS_PER_DAY = 5; 
const GAME_DURATION = 15; // 15 Second Timer

const COLORS = [
  { id: 'red', bg: 'from-rose-400 to-rose-600', shadow: 'shadow-[0_0_15px_rgba(225,29,72,0.8)]' },
  { id: 'blue', bg: 'from-cyan-400 to-blue-600', shadow: 'shadow-[0_0_15px_rgba(37,99,235,0.8)]' },
  { id: 'green', bg: 'from-emerald-400 to-green-600', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]' },
  { id: 'yellow', bg: 'from-amber-300 to-orange-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]' },
  { id: 'purple', bg: 'from-fuchsia-400 to-purple-600', shadow: 'shadow-[0_0_15px_rgba(147,51,234,0.8)]' }
];

type GridType = (string | null)[][];

export default function MobilePremiumBubbleShooter() {
  const getEmptyGrid = (): GridType => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const [grid, setGrid] = useState<GridType>(getEmptyGrid());
  const [currentBubble, setCurrentBubble] = useState(COLORS[0]);
  const [nextBubble, setNextBubble] = useState(COLORS[1]); 
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // নতুন স্টেট (টাইমার এবং লিমিট)
  const [timeLeft, setTimeLeft] = useState(0);
  const [playsToday, setPlaysToday] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isShooting, setIsShooting] = useState(false);
  const [flyingBubbleColor, setFlyingBubbleColor] = useState('');
  const [flyStyle, setFlyStyle] = useState({ left: '50%', top: '100%', opacity: 0, duration: '0s' });

  // LocalStorage থেকে হাইস্কোর এবং ডেইলি লিমিট লোড করা
  useEffect(() => {
    setIsMounted(true);
    const savedHighScore = localStorage.getItem('premium_bubble_highScore') || '0';
    setHighScore(parseInt(savedHighScore, 10));

    const lastDate = localStorage.getItem('premium_bubble_lastDate');
    const today = new Date().toDateString();

    if (lastDate === today) {
      const savedPlays = localStorage.getItem('premium_bubble_playsToday') || '0';
      setPlaysToday(parseInt(savedPlays, 10));
    } else {
      localStorage.setItem('premium_bubble_lastDate', today);
      localStorage.setItem('premium_bubble_playsToday', '0');
      setPlaysToday(0);
    }
  }, []);

  // ১৫ সেকেন্ডের টাইমার লজিক
  useEffect(() => {
    if (timeLeft > 0 && isPlaying) {
      const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const startGame = () => {
    // লিমিট চেক
    if (playsToday >= MAX_PLAYS_PER_DAY) {
      toast.error('আজকের লিমিট শেষ! 🔒 আগামীকাল খেলুন।', { theme: 'dark' });
      return;
    }

    const initialGrid = Array.from({ length: ROWS }, (_, r) => 
      Array.from({ length: COLS }, () => r < 3 ? getRandomColor().id : null)
    );
    setGrid(initialGrid);
    setCurrentBubble(getRandomColor());
    setNextBubble(getRandomColor());
    setScore(0);
    setTimeLeft(GAME_DURATION); // সময় ১৫ সেকেন্ড সেট করা হলো
    setIsPlaying(true);
  };

  const endGame = () => {
    setIsPlaying(false);
    
    // লিমিট আপডেট
    const newPlays = playsToday + 1;
    setPlaysToday(newPlays);
    localStorage.setItem('premium_bubble_playsToday', newPlays.toString());

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('premium_bubble_highScore', score.toString());
      toast.success(`অসাধারণ! নতুন রেকর্ড: ${score} 🏆`, { theme: 'dark' });
    } else {
      toast.error(`টাইম আপ! আপনার স্কোর: ${score}`, { theme: 'dark' });
    }
  };

  const findMatches = (r: number, c: number, color: string, currentGrid: GridType) => {
    const stack = [[r, c]];
    const visited = new Set([`${r},${c}`]);
    const matches = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      const [currR, currC] = current;
      matches.push([currR, currC]);

      for (const [dr, dc] of dirs) {
        const nr = currR + dr;
        const nc = currC + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (!visited.has(`${nr},${nc}`) && currentGrid[nr][nc] === color) {
            visited.add(`${nr},${nc}`);
            stack.push([nr, nc]);
          }
        }
      }
    }
    return matches;
  };

  const shootBubble = (colIndex: number) => {
    if (!isPlaying || isShooting) return;

    let targetRow = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][colIndex] !== null) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow >= ROWS) return;

    setIsShooting(true);
    setFlyingBubbleColor(currentBubble.id);
    
    const targetLeft = `${(colIndex + 0.5) * (100 / COLS)}%`;
    const targetTop = `${(targetRow + 0.5) * (100 / ROWS)}%`;

    setFlyStyle({ left: '50%', top: '100%', opacity: 1, duration: '0s' });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyStyle({ left: targetLeft, top: targetTop, opacity: 1, duration: '0.35s' });
      });
    });

    setTimeout(() => {
      setFlyStyle(prev => ({ ...prev, opacity: 0, duration: '0s' })); 

      const newGrid = grid.map(row => [...row]);
      newGrid[targetRow][colIndex] = currentBubble.id;

      const matches = findMatches(targetRow, colIndex, currentBubble.id, newGrid);
      
      if (matches.length >= 3) {
        matches.forEach(([r, c]) => newGrid[r][c] = null);
        setScore(prev => prev + (matches.length * 10)); 
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
      }

      setGrid(newGrid);
      setCurrentBubble(nextBubble);
      setNextBubble(getRandomColor());

      setIsShooting(false); 
    }, 350); 
  };

  if (!isMounted) return null;

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#09090b] select-none touch-manipulation font-sans">
      <ToastContainer autoClose={2000} hideProgressBar position="top-center" />

      <div className="relative flex h-[100dvh] w-full flex-col bg-gray-950 sm:h-[850px] sm:max-w-[400px] sm:rounded-[3rem] sm:border-[10px] sm:border-gray-900 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-b from-gray-900 to-transparent p-6 pb-4 pt-10 sm:pt-6 z-10">
          <div className="flex justify-between items-center bg-gray-900/60 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-lg">
            <div className="text-center w-1/3 border-r border-white/5">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Score</p>
              <p className="text-xl font-black text-white drop-shadow-md">{score}</p>
            </div>
            
            {/* 15s Timer Display */}
            <div className="text-center w-1/3 border-r border-white/5">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Time</p>
              <p className={`text-2xl font-black drop-shadow-md ${timeLeft <= 5 && timeLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
                {timeLeft}s
              </p>
            </div>

            <div className="text-center w-1/3">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Best</p>
              <p className="text-xl font-black text-amber-400 drop-shadow-md">{highScore}</p>
            </div>
          </div>
        </div>

        <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden px-3">
          
          {!isPlaying ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
              <div className="w-32 h-32 mb-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-1 animate-pulse shadow-[0_0_30px_rgba(217,70,239,0.4)]">
                 <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center text-4xl">🎯</div>
              </div>
              
              <button 
                onClick={startGame}
                disabled={playsToday >= MAX_PLAYS_PER_DAY}
                className="bg-white disabled:bg-gray-700 text-gray-950 disabled:text-gray-400 text-xl font-black py-4 px-12 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.2)] transition-transform active:scale-90"
              >
                {playsToday >= MAX_PLAYS_PER_DAY ? 'লিমিট শেষ 🔒' : 'PLAY GAME'}
              </button>

              <p className="mt-6 bg-gray-900 px-4 py-2 rounded-full text-xs text-gray-400 border border-white/5">
                আজকের সুযোগ: <strong className="text-cyan-400">{MAX_PLAYS_PER_DAY - playsToday}</strong> বার বাকি
              </p>
            </div>
          ) : (
            <>
              {/* Grid Area */}
              <div className="relative w-full h-[65vh] bg-gray-900/40 rounded-3xl overflow-hidden border border-white/5 shadow-inner backdrop-blur-sm">
                <div className="absolute inset-0 grid grid-cols-7 grid-rows-10 p-1 gap-0.5">
                  {grid.map((row, r) => row.map((colorId, c) => {
                    const clr = COLORS.find(x => x.id === colorId);
                    return (
                      <div key={`${r}-${c}`} className="w-full h-full flex items-center justify-center cursor-pointer active:bg-white/5 rounded-lg" onClick={() => shootBubble(c)}>
                        {clr && (
                          <div className={`w-[90%] h-[90%] max-w-[2.5rem] max-h-[2.5rem] rounded-full bg-gradient-to-br ${clr.bg} ${clr.shadow} border border-white/20 shadow-inner animate-in zoom-in duration-200`}>
                             <div className="absolute top-1 left-2 w-1/4 h-1/4 bg-white/50 rounded-full blur-[1px]"></div>
                          </div>
                        )}
                      </div>
                    )
                  }))}
                </div>

                {/* Flying Bounce Bubble */}
                <div 
                  className={`absolute z-50 w-[12%] aspect-square max-w-[2.5rem] max-h-[2.5rem] rounded-full border border-white/20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-inner
                    ${flyingBubbleColor ? COLORS.find(c => c.id === flyingBubbleColor)?.bg : ''} 
                    ${flyingBubbleColor ? COLORS.find(c => c.id === flyingBubbleColor)?.shadow : ''}`}
                  style={{ left: flyStyle.left, top: flyStyle.top, opacity: flyStyle.opacity, transitionProperty: 'left, top, opacity', transitionDuration: flyStyle.duration, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                >
                  <div className="absolute top-1 left-2 w-1/4 h-1/4 bg-white/50 rounded-full blur-[1px]"></div>
                </div>
              </div>

              {/* Mobile Style Shooter Dock */}
              <div className="h-28 mb-4 mt-2 bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 flex items-center justify-around px-6 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                
                {/* Next Bubble Preview */}
                <div className="flex flex-col items-center">
                  <p className="text-[9px] text-gray-500 uppercase font-bold mb-2">Next</p>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${nextBubble.bg} opacity-70 border border-white/10`}></div>
                </div>

                {/* Main Shooter */}
                <div className="relative -mt-10">
                   <div className="absolute inset-0 bg-white/5 blur-xl rounded-full"></div>
                   <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentBubble.bg} ${currentBubble.shadow} border-[3px] border-white/30 shadow-2xl transition-all duration-300 flex items-center justify-center ${isShooting ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
                      <div className="absolute top-3 left-4 w-5 h-5 bg-white/50 rounded-full blur-[2px]"></div>
                      <span className="text-white/50 text-xl font-black mb-1">↑</span>
                   </div>
                </div>

                {/* Timer Info / Setting */}
                <div className="flex flex-col items-center opacity-50">
                  <span className="text-gray-400 text-sm font-bold animate-pulse">⏳</span>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}




// 'use client';
// import { useState, useEffect } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const ROWS = 10;
// const COLS = 7;
// const COLORS = [
//   { id: 'red', class: 'from-red-400 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)]' },
//   { id: 'blue', class: 'from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
//   { id: 'green', class: 'from-green-400 to-green-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' },
//   { id: 'yellow', class: 'from-yellow-300 to-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' },
//   { id: 'purple', class: 'from-purple-400 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.6)]' }
// ];

// // টাইপস্ক্রিপ্টের জন্য গ্রিডের টাইপ ডিফাইন করা হলো (যাতে Vercel Error না দেয়)
// type GridType = (string | null)[][];

// export default function BubbleShooter2D() {
//   // Vercel Array Bug ফিক্স: Array.from ব্যবহার করা হলো
//   const getEmptyGrid = (): GridType => 
//     Array.from({ length: ROWS }, () => Array(COLS).fill(null));

//   const [grid, setGrid] = useState<GridType>(getEmptyGrid());
//   const [currentBubble, setCurrentBubble] = useState(COLORS[0]);
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [shotsFired, setShotsFired] = useState(0);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//     const savedHighScore = localStorage.getItem('bubble_shooter_highScore') || '0';
//     setHighScore(parseInt(savedHighScore, 10));
//   }, []);

//   const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

//   const startGame = () => {
//     const initialGrid = Array.from({ length: ROWS }, (_, r) => 
//       Array.from({ length: COLS }, () => r < 3 ? getRandomColor().id : null)
//     );
//     setGrid(initialGrid);
//     setCurrentBubble(getRandomColor());
//     setScore(0);
//     setShotsFired(0);
//     setIsPlaying(true);
//     toast.info('গেম শুরু! কলামে ট্যাপ করে বাবল শুট করুন 🎯', { theme: 'dark', autoClose: 2000, position: 'top-center' });
//   };

//   const endGame = () => {
//     setIsPlaying(false);
//     if (score > highScore) {
//       setHighScore(score);
//       localStorage.setItem('bubble_shooter_highScore', score.toString());
//       toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, { theme: 'dark', autoClose: 4000 });
//     } else {
//       toast.error(`গেম ওভার! আপনার স্কোর: ${score}`, { theme: 'dark', autoClose: 3000 });
//     }
//   };

//   const findMatches = (r: number, c: number, color: string, currentGrid: GridType) => {
//     const stack = [[r, c]];
//     const visited = new Set([`${r},${c}`]);
//     const matches = [];
//     const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 

//     while (stack.length > 0) {
//       // TypeScript Error Fix: pop() এর ভ্যালু চেক করা
//       const current = stack.pop();
//       if (!current) continue;
      
//       const [currR, currC] = current;
//       matches.push([currR, currC]);

//       for (const [dr, dc] of dirs) {
//         const nr = currR + dr;
//         const nc = currC + dc;
//         if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
//           if (!visited.has(`${nr},${nc}`) && currentGrid[nr][nc] === color) {
//             visited.add(`${nr},${nc}`);
//             stack.push([nr, nc]);
//           }
//         }
//       }
//     }
//     return matches;
//   };

//   const checkGameOver = (currentGrid: GridType) => {
//     const bottomRowHasBubble = currentGrid[ROWS - 1].some(cell => cell !== null);
//     if (bottomRowHasBubble) {
//       endGame();
//     }
//   };

//   const pushGridDown = (currentGrid: GridType) => {
//     const randomRow = Array.from({ length: COLS }, () => getRandomColor().id);
//     const newGrid = [randomRow, ...currentGrid.slice(0, ROWS - 1)];
//     setGrid(newGrid);
//     checkGameOver(newGrid);
//   };

//   const shootBubble = (colIndex: number) => {
//     if (!isPlaying) return;

//     let targetRow = 0;
//     for (let r = ROWS - 1; r >= 0; r--) {
//       if (grid[r][colIndex] !== null) {
//         targetRow = r + 1;
//         break;
//       }
//     }

//     if (targetRow >= ROWS) {
//       toast.warning('এই কলামটি ভর্তি! অন্য কলামে শুট করুন।', { theme: 'dark', autoClose: 1000 });
//       return;
//     }

//     const newGrid = grid.map(row => [...row]);
//     newGrid[targetRow][colIndex] = currentBubble.id;

//     const matches = findMatches(targetRow, colIndex, currentBubble.id, newGrid);
    
//     if (matches.length >= 3) {
//       matches.forEach(([r, c]) => {
//         newGrid[r][c] = null; 
//       });
//       setScore(prev => prev + (matches.length * 10)); 
      
//       // Vercel Window/Navigator Error Fix
//       if (typeof navigator !== 'undefined' && navigator.vibrate) {
//         navigator.vibrate(50);
//       }
//     }

//     setGrid(newGrid);
//     setCurrentBubble(getRandomColor());
    
//     const newShots = shotsFired + 1;
//     setShotsFired(newShots);

//     if (newShots % 5 === 0) {
//       pushGridDown(newGrid);
//     } else {
//       checkGameOver(newGrid);
//     }
//   };

//   if (!isMounted) return null;

//   const SidebarContent = () => (
//     <div className="flex flex-col h-full text-white">
//       <h2 className="text-2xl font-black text-pink-400 mb-6 border-b border-white/10 pb-4">
//         🎮 বাবল শুটার
//       </h2>
//       <ul className="space-y-5 text-sm text-gray-300">
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">👆</span>
//           <p><strong className="text-white text-base block mb-1">কীভাবে খেলবেন?</strong> নিচে আপনার বাবলটি দেওয়া থাকবে। গ্রিডের যেকোনো কলামে ট্যাপ করলে বাবলটি সোজা উপরে চলে যাবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">💥</span>
//           <p><strong className="text-green-400 text-base block mb-1">বাবল ফাটানো</strong> একই রঙের ৩টি বা তার বেশি বাবল একসাথে লাগলেই ফেটে যাবে এবং পয়েন্ট পাবেন!</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">⚠️</span>
//           <p><strong className="text-red-400 text-base block mb-1">সতর্কতা</strong> প্রতি ৫টি শট করার পর উপর থেকে নতুন এক সারি বাবল নেমে আসবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">☠️</span>
//           <p><strong className="text-white text-base block mb-1">গেম ওভার</strong> বাবল জমতে জমতে একদম নিচের সারিতে চলে আসলে গেম ওভার হয়ে যাবে।</p>
//         </li>
//       </ul>
//     </div>
//   );

//   return (
//     <div className="flex min-h-[100dvh] w-full bg-[#0f172a] select-none touch-manipulation overflow-hidden font-sans">
//       <ToastContainer />

//       <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 h-[100dvh] shadow-2xl z-20">
//         <SidebarContent />
//       </div>

//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden flex">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//           <div className="relative w-[280px] bg-slate-900/95 backdrop-blur-xl p-6 h-full shadow-2xl border-r border-white/10">
//             <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full">✕</button>
//             <div className="mt-8 h-full"><SidebarContent /></div>
//           </div>
//         </div>
//       )}

//       <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
//         <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white p-2 px-4 rounded-full shadow-lg border border-white/20 active:scale-95 text-sm">
//           ☰ নিয়ম
//         </button>

//         <div className="relative flex h-[100dvh] w-full flex-col bg-slate-800/40 backdrop-blur-2xl shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border border-white/10 overflow-hidden">
          
//           <div className="bg-white/5 backdrop-blur-md p-5 pt-16 lg:pt-5 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-b border-white/10 z-10 flex-shrink-0">
//             <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-widest mb-3 drop-shadow-lg">
//               BUBBLE SHOOTER
//             </h1>
            
//             <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner">
//               <div className="text-center w-1/2 border-r border-white/10">
//                 <p className="text-[10px] sm:text-xs text-pink-200/70 font-semibold mb-1">SCORE</p>
//                 <p className="text-2xl sm:text-3xl font-black text-white">{score}</p>
//               </div>
//               <div className="text-center w-1/2">
//                 <p className="text-[10px] sm:text-xs text-pink-200/70 font-semibold mb-1">HIGH SCORE</p>
//                 <p className="text-2xl sm:text-3xl font-black text-yellow-400">{highScore}</p>
//               </div>
//             </div>
            
//             {isPlaying && (
//               <div className="mt-3 text-center">
//                  <p className="text-xs text-gray-400">আর <strong className="text-red-400">{5 - (shotsFired % 5)}</strong> শট পর বাবল নিচে নামবে!</p>
//               </div>
//             )}
//           </div>

//           <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden bg-slate-900/50 p-2 sm:p-4">
            
//             {!isPlaying ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
//                 <button 
//                   onClick={startGame}
//                   className="bg-gradient-to-br from-pink-500 to-purple-700 hover:from-pink-400 hover:to-purple-600 text-white text-2xl font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-white/20 transition-all active:scale-95"
//                 >
//                   PLAY NOW ▶
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-7 gap-1 h-full max-h-[65vh]">
//                   {grid.map((row, rIndex) => (
//                     row.map((cellColor, cIndex) => {
//                       const colorData = COLORS.find(c => c.id === cellColor);
//                       return (
//                         <div 
//                           key={`${rIndex}-${cIndex}`} 
//                           className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
//                           onClick={() => shootBubble(cIndex)} 
//                         >
//                           {colorData && (
//                             <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${colorData.class} border-2 border-white/30 transform transition-transform duration-300 animate-in zoom-in`}>
//                                <div className="absolute top-1 left-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]"></div>
//                             </div>
//                           )}
//                         </div>
//                       )
//                     })
//                   ))}
//                 </div>

//                 <div className="h-24 mt-2 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center relative shadow-inner flex-shrink-0">
//                    <div className="absolute top-[-15px] text-gray-500 text-xs tracking-widest uppercase bg-slate-900 px-3 rounded-full">Your Bubble</div>
//                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${currentBubble.class} border-4 border-white/40 shadow-2xl animate-pulse flex items-center justify-center`}>
//                       <div className="absolute top-2 left-3 w-4 h-4 bg-white/50 rounded-full blur-[2px]"></div>
//                    </div>
//                 </div>
//               </>
//             )}
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }


