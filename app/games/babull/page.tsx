'use client';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ROWS = 10;
const COLS = 7;
const COLORS = [
  { id: 'red', class: 'from-red-400 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)]' },
  { id: 'blue', class: 'from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
  { id: 'green', class: 'from-green-400 to-green-600 shadow-[0_0_15px_rgba(16,185,129,0.6)]' },
  { id: 'yellow', class: 'from-yellow-300 to-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]' },
  { id: 'purple', class: 'from-purple-400 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.6)]' }
];

// টাইপস্ক্রিপ্টের জন্য গ্রিডের টাইপ ডিফাইন করা হলো (যাতে Vercel Error না দেয়)
type GridType = (string | null)[][];

export default function BubbleShooter2D() {
  // Vercel Array Bug ফিক্স: Array.from ব্যবহার করা হলো
  const getEmptyGrid = (): GridType => 
    Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  const [grid, setGrid] = useState<GridType>(getEmptyGrid());
  const [currentBubble, setCurrentBubble] = useState(COLORS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shotsFired, setShotsFired] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedHighScore = localStorage.getItem('bubble_shooter_highScore') || '0';
    setHighScore(parseInt(savedHighScore, 10));
  }, []);

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const startGame = () => {
    const initialGrid = Array.from({ length: ROWS }, (_, r) => 
      Array.from({ length: COLS }, () => r < 3 ? getRandomColor().id : null)
    );
    setGrid(initialGrid);
    setCurrentBubble(getRandomColor());
    setScore(0);
    setShotsFired(0);
    setIsPlaying(true);
    toast.info('গেম শুরু! কলামে ট্যাপ করে বাবল শুট করুন 🎯', { theme: 'dark', autoClose: 2000, position: 'top-center' });
  };

  const endGame = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('bubble_shooter_highScore', score.toString());
      toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, { theme: 'dark', autoClose: 4000 });
    } else {
      toast.error(`গেম ওভার! আপনার স্কোর: ${score}`, { theme: 'dark', autoClose: 3000 });
    }
  };

  const findMatches = (r: number, c: number, color: string, currentGrid: GridType) => {
    const stack = [[r, c]];
    const visited = new Set([`${r},${c}`]);
    const matches = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; 

    while (stack.length > 0) {
      // TypeScript Error Fix: pop() এর ভ্যালু চেক করা
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

  const checkGameOver = (currentGrid: GridType) => {
    const bottomRowHasBubble = currentGrid[ROWS - 1].some(cell => cell !== null);
    if (bottomRowHasBubble) {
      endGame();
    }
  };

  const pushGridDown = (currentGrid: GridType) => {
    const randomRow = Array.from({ length: COLS }, () => getRandomColor().id);
    const newGrid = [randomRow, ...currentGrid.slice(0, ROWS - 1)];
    setGrid(newGrid);
    checkGameOver(newGrid);
  };

  const shootBubble = (colIndex: number) => {
    if (!isPlaying) return;

    let targetRow = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][colIndex] !== null) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow >= ROWS) {
      toast.warning('এই কলামটি ভর্তি! অন্য কলামে শুট করুন।', { theme: 'dark', autoClose: 1000 });
      return;
    }

    const newGrid = grid.map(row => [...row]);
    newGrid[targetRow][colIndex] = currentBubble.id;

    const matches = findMatches(targetRow, colIndex, currentBubble.id, newGrid);
    
    if (matches.length >= 3) {
      matches.forEach(([r, c]) => {
        newGrid[r][c] = null; 
      });
      setScore(prev => prev + (matches.length * 10)); 
      
      // Vercel Window/Navigator Error Fix
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    setGrid(newGrid);
    setCurrentBubble(getRandomColor());
    
    const newShots = shotsFired + 1;
    setShotsFired(newShots);

    if (newShots % 5 === 0) {
      pushGridDown(newGrid);
    } else {
      checkGameOver(newGrid);
    }
  };

  if (!isMounted) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      <h2 className="text-2xl font-black text-pink-400 mb-6 border-b border-white/10 pb-4">
        🎮 বাবল শুটার
      </h2>
      <ul className="space-y-5 text-sm text-gray-300">
        <li className="flex items-start">
          <span className="text-2xl mr-4">👆</span>
          <p><strong className="text-white text-base block mb-1">কীভাবে খেলবেন?</strong> নিচে আপনার বাবলটি দেওয়া থাকবে। গ্রিডের যেকোনো কলামে ট্যাপ করলে বাবলটি সোজা উপরে চলে যাবে।</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">💥</span>
          <p><strong className="text-green-400 text-base block mb-1">বাবল ফাটানো</strong> একই রঙের ৩টি বা তার বেশি বাবল একসাথে লাগলেই ফেটে যাবে এবং পয়েন্ট পাবেন!</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">⚠️</span>
          <p><strong className="text-red-400 text-base block mb-1">সতর্কতা</strong> প্রতি ৫টি শট করার পর উপর থেকে নতুন এক সারি বাবল নেমে আসবে।</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">☠️</span>
          <p><strong className="text-white text-base block mb-1">গেম ওভার</strong> বাবল জমতে জমতে একদম নিচের সারিতে চলে আসলে গেম ওভার হয়ে যাবে।</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#0f172a] select-none touch-manipulation overflow-hidden font-sans">
      <ToastContainer />

      <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 h-[100dvh] shadow-2xl z-20">
        <SidebarContent />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-[280px] bg-slate-900/95 backdrop-blur-xl p-6 h-full shadow-2xl border-r border-white/10">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full">✕</button>
            <div className="mt-8 h-full"><SidebarContent /></div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white p-2 px-4 rounded-full shadow-lg border border-white/20 active:scale-95 text-sm">
          ☰ নিয়ম
        </button>

        <div className="relative flex h-[100dvh] w-full flex-col bg-slate-800/40 backdrop-blur-2xl shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border border-white/10 overflow-hidden">
          
          <div className="bg-white/5 backdrop-blur-md p-5 pt-16 lg:pt-5 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-b border-white/10 z-10 flex-shrink-0">
            <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-widest mb-3 drop-shadow-lg">
              BUBBLE SHOOTER
            </h1>
            
            <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner">
              <div className="text-center w-1/2 border-r border-white/10">
                <p className="text-[10px] sm:text-xs text-pink-200/70 font-semibold mb-1">SCORE</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{score}</p>
              </div>
              <div className="text-center w-1/2">
                <p className="text-[10px] sm:text-xs text-pink-200/70 font-semibold mb-1">HIGH SCORE</p>
                <p className="text-2xl sm:text-3xl font-black text-yellow-400">{highScore}</p>
              </div>
            </div>
            
            {isPlaying && (
              <div className="mt-3 text-center">
                 <p className="text-xs text-gray-400">আর <strong className="text-red-400">{5 - (shotsFired % 5)}</strong> শট পর বাবল নিচে নামবে!</p>
              </div>
            )}
          </div>

          <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden bg-slate-900/50 p-2 sm:p-4">
            
            {!isPlaying ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                <button 
                  onClick={startGame}
                  className="bg-gradient-to-br from-pink-500 to-purple-700 hover:from-pink-400 hover:to-purple-600 text-white text-2xl font-black py-4 px-10 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-white/20 transition-all active:scale-95"
                >
                  PLAY NOW ▶
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 h-full max-h-[65vh]">
                  {grid.map((row, rIndex) => (
                    row.map((cellColor, cIndex) => {
                      const colorData = COLORS.find(c => c.id === cellColor);
                      return (
                        <div 
                          key={`${rIndex}-${cIndex}`} 
                          className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => shootBubble(cIndex)} 
                        >
                          {colorData && (
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${colorData.class} border-2 border-white/30 transform transition-transform duration-300 animate-in zoom-in`}>
                               <div className="absolute top-1 left-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]"></div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ))}
                </div>

                <div className="h-24 mt-2 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center relative shadow-inner flex-shrink-0">
                   <div className="absolute top-[-15px] text-gray-500 text-xs tracking-widest uppercase bg-slate-900 px-3 rounded-full">Your Bubble</div>
                   <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${currentBubble.class} border-4 border-white/40 shadow-2xl animate-pulse flex items-center justify-center`}>
                      <div className="absolute top-2 left-3 w-4 h-4 bg-white/50 rounded-full blur-[2px]"></div>
                   </div>
                </div>
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}


