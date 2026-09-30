'use client';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// সমস্ত অক্ষর ও সংখ্যার ক্যাটাগরি
const ENGLISH_ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BENGALI_VOWELS = "অআইঈউঊঋএঐওঔ".split("");
const BENGALI_CONSONANTS = "কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়".split("");
const BENGALI_NUMBERS = "০১২৩৪৫৬৭৮৯".split("");
const ENGLISH_NUMBERS = "0123456789".split("");

// সবকিছু একসাথে মিলিয়ে একটি বিশাল অ্যারে তৈরি করা হলো
const ALL_CHARS = [
  ...ENGLISH_ALPHABETS, 
  ...BENGALI_VOWELS, 
  ...BENGALI_CONSONANTS, 
  ...BENGALI_NUMBERS, 
  ...ENGLISH_NUMBERS
];

const COLORS = ["text-blue-400", "text-green-400", "text-yellow-400", "text-pink-400", "text-purple-400", "text-orange-400"];

export default function PremiumMixedGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playsToday, setPlaysToday] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [targetChar, setTargetChar] = useState("");
  const [charsOnScreen, setCharsOnScreen] = useState<{char: string, top: string, left: string, id: string, color: string, rotation: number}[]>([]);
  
  const MAX_PLAYS_PER_DAY = 5; 
  const GAME_DURATION = 30; 

  useEffect(() => {
    setIsMounted(true);
    const savedHighScore = localStorage.getItem('mixed_game_highScore') || '0';
    setHighScore(parseInt(savedHighScore, 10));

    const lastDate = localStorage.getItem('mixed_game_lastDate');
    const today = new Date().toDateString();

    if (lastDate === today) {
      const savedPlays = localStorage.getItem('mixed_game_playsToday') || '0';
      setPlaysToday(parseInt(savedPlays, 10));
    } else {
      localStorage.setItem('mixed_game_lastDate', today);
      localStorage.setItem('mixed_game_playsToday', '0');
      setPlaysToday(0);
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && isPlaying) {
      const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  const generateLevel = () => {
    // যেকোনো একটি র‍্যান্ডম ক্যারেক্টার টার্গেট হিসেবে নেওয়া
    const target = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
    let decoys: string[] = [];
    
    // ৬টি ভুল ক্যারেক্টার নেওয়া
    while (decoys.length < 6) {
      const randomChar = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
      if (randomChar !== target && !decoys.includes(randomChar)) decoys.push(randomChar);
    }

    const mixedChars = [target, ...decoys].sort(() => Math.random() - 0.5);

    const charsWithStyles = mixedChars.map(char => ({
      char,
      top: `${Math.floor(Math.random() * 75) + 10}%`, 
      left: `${Math.floor(Math.random() * 75) + 10}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], 
      rotation: Math.floor(Math.random() * 40) - 20, 
      id: Math.random().toString(36).substring(2, 9)
    }));

    setTargetChar(target);
    setCharsOnScreen(charsWithStyles);
  };

  const startGame = () => {
    if (playsToday >= MAX_PLAYS_PER_DAY) {
      toast.error('আজকের খেলার লিমিট শেষ! 🔒', { theme: 'dark' });
      return;
    }
    
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    generateLevel();
    
    toast.info('গেম শুরু! সঠিক অক্ষর বা সংখ্যাটি খুঁজুন 🚀', {
      theme: 'dark', position: 'top-center', autoClose: 1500, hideProgressBar: true,
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    const newPlays = playsToday + 1;
    setPlaysToday(newPlays);
    localStorage.setItem('mixed_game_playsToday', newPlays.toString());
    setCharsOnScreen([]);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('mixed_game_highScore', score.toString());
      toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, { theme: 'dark', autoClose: 4000 });
    } else {
      toast.warning(`গেম ওভার! আপনার স্কোর: ${score}`, { theme: 'dark', autoClose: 3000 });
    }
  };

  const handleCharClick = (char: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isPlaying) return;

    if (char === targetChar) {
      setScore(prev => prev + 10);
      generateLevel();
    } else {
      setScore(prev => (prev - 5 < 0 ? 0 : prev - 5));
      toast.error(`ভুল! -৫ পয়েন্ট ❌`, { theme: 'colored', autoClose: 500, hideProgressBar: true, position: "bottom-center" });
    }
  };

  if (!isMounted) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      <h2 className="text-2xl font-black text-cyan-400 mb-6 border-b border-white/10 pb-4">
        🎮 গেমের নিয়মাবলী
      </h2>
      <ul className="space-y-6 text-sm text-gray-300">
        <li className="flex items-start">
          <span className="text-2xl mr-4">🎯</span>
          <p><strong className="text-white text-base block mb-1">কী খুঁজতে হবে?</strong> স্ক্রিনের উপরে দেওয়া অক্ষরটি (বাংলা/ইংরেজি) বা সংখ্যাটি নিচের ভাসমান ক্যারেক্টারগুলো থেকে দ্রুত খুঁজে বের করুন।</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">✅</span>
          <p><strong className="text-green-400 text-base block mb-1">পয়েন্ট যোগ (+১০)</strong> সঠিক অক্ষরে ক্লিক করতে পারলে ১০ পয়েন্ট যোগ হবে।</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">❌</span>
          <p><strong className="text-red-400 text-base block mb-1">পয়েন্ট কাটা (-৫)</strong> ভুল ক্যারেক্টারে ক্লিক করলে ৫ পয়েন্ট কাটা যাবে!</p>
        </li>
        <li className="flex items-start">
          <span className="text-2xl mr-4">⏱️</span>
          <p><strong className="text-white text-base block mb-1">সময়সীমা</strong> আপনার হাতে থাকবে মাত্র ৩০ সেকেন্ড।</p>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#0a0a1a] select-none touch-manipulation overflow-hidden font-sans">
      <ToastContainer />

      {/* PC Sidebar */}
      <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 h-[100dvh] shadow-2xl z-20">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-[280px] bg-gray-900/90 backdrop-blur-xl p-6 h-full shadow-2xl border-r border-white/10">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full">✕</button>
            <div className="mt-8 h-full"><SidebarContent /></div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white p-2 px-4 rounded-full shadow-lg border border-white/20 active:scale-95 text-sm">
          ☰ নিয়ম
        </button>

        <div className="relative flex h-[100dvh] w-full flex-col bg-gray-900/40 backdrop-blur-2xl shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border border-white/10 overflow-hidden">
          
          {/* গেম হেডার (Glassmorphism) */}
          <div className="bg-white/5 backdrop-blur-md p-6 pb-4 pt-16 lg:pt-6 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/10 z-10">
            <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest mb-4 drop-shadow-lg uppercase">
              Find The Target
            </h1>
            
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/10 shadow-inner">
              <div className="text-center w-1/3">
                <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">SCORE</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{score}</p>
              </div>
              <div className="text-center w-1/3 border-x border-white/10">
                <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">TIME</p>
                <p className={`text-3xl sm:text-4xl font-black ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                  {timeLeft}
                </p>
              </div>
              <div className="text-center w-1/3">
                <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">BEST</p>
                <p className="text-2xl sm:text-3xl font-black text-yellow-400">{highScore}</p>
              </div>
            </div>

            {/* Visual Timer Bar */}
            {isPlaying && (
              <div className="w-full bg-black/50 h-2 rounded-full mt-4 overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                  style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
                ></div>
              </div>
            )}

            {isPlaying && (
              <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/20 text-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <p className="text-cyan-200/80 text-sm mb-1">খুঁজে বের করুন:</p>
                <p className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{targetChar}</p>
              </div>
            )}
          </div>

          {/* গেম প্লে এরিয়া */}
          <div className="relative flex-1 w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent"></div>
            
            {!isPlaying ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
                <button 
                  onClick={startGame}
                  disabled={playsToday >= MAX_PLAYS_PER_DAY}
                  className="group relative w-full max-w-[250px] bg-white/10 hover:bg-white/20 disabled:bg-white/5 backdrop-blur-md text-white text-2xl font-black py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 disabled:opacity-50 transition-all active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 drop-shadow-md">{playsToday >= MAX_PLAYS_PER_DAY ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}</span>
                </button>
                <p className="mt-6 text-gray-400 text-sm text-center bg-black/40 py-2 px-4 rounded-full border border-white/5">
                  আজকের সুযোগ: {MAX_PLAYS_PER_DAY - playsToday} বার বাকি
                </p>
              </div>
            ) : (
              // ভাসমান অক্ষর ও সংখ্যাগুলো (Glassmorphism & Random colors)
              charsOnScreen.map((item) => (
                <button
                  key={item.id}
                  onPointerDown={(e) => handleCharClick(item.char, e)}
                  style={{ 
                    top: item.top, 
                    left: item.left,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` 
                  }}
                  className={`absolute w-14 h-14 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 active:scale-75 transition-all duration-100 flex items-center justify-center text-3xl sm:text-4xl font-black ${item.color} drop-shadow-lg`}
                >
                  {item.char}
                </button>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}


// 'use client';
// import { useState, useEffect } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// const COLORS = ["text-blue-400", "text-green-400", "text-yellow-400", "text-pink-400", "text-purple-400", "text-orange-400"];

// export default function PremiumAlphabetGame() {
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playsToday, setPlaysToday] = useState(0);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
//   const [targetLetter, setTargetLetter] = useState("");
//   const [lettersOnScreen, setLettersOnScreen] = useState<{char: string, top: string, left: string, id: string, color: string, rotation: number}[]>([]);
  
//   const MAX_PLAYS_PER_DAY = 5; 
//   const GAME_DURATION = 30; 

//   useEffect(() => {
//     setIsMounted(true);
//     const savedHighScore = localStorage.getItem('premium_alpha_highScore') || '0';
//     setHighScore(parseInt(savedHighScore, 10));

//     const lastDate = localStorage.getItem('premium_alpha_lastDate');
//     const today = new Date().toDateString();

//     if (lastDate === today) {
//       const savedPlays = localStorage.getItem('premium_alpha_playsToday') || '0';
//       setPlaysToday(parseInt(savedPlays, 10));
//     } else {
//       localStorage.setItem('premium_alpha_lastDate', today);
//       localStorage.setItem('premium_alpha_playsToday', '0');
//       setPlaysToday(0);
//     }
//   }, []);

//   useEffect(() => {
//     if (timeLeft > 0 && isPlaying) {
//       const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
//       return () => clearTimeout(timerId);
//     } else if (timeLeft === 0 && isPlaying) {
//       endGame();
//     }
//   }, [timeLeft, isPlaying]);

//   const generateLevel = () => {
//     const target = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
//     let decoys: string[] = [];
    
//     // ৬টি ভুল অক্ষর
//     while (decoys.length < 6) {
//       const randomChar = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
//       if (randomChar !== target && !decoys.includes(randomChar)) decoys.push(randomChar);
//     }

//     const allChars = [target, ...decoys].sort(() => Math.random() - 0.5);

//     const lettersWithStyles = allChars.map(char => ({
//       char,
//       top: `${Math.floor(Math.random() * 75) + 10}%`, 
//       left: `${Math.floor(Math.random() * 75) + 10}%`,
//       color: COLORS[Math.floor(Math.random() * COLORS.length)], // র‍্যান্ডম কালার
//       rotation: Math.floor(Math.random() * 40) - 20, // -20 থেকে +20 ডিগ্রি বাঁকা
//       id: Math.random().toString(36).substring(2, 9)
//     }));

//     setTargetLetter(target);
//     setLettersOnScreen(lettersWithStyles);
//   };

//   const startGame = () => {
//     if (playsToday >= MAX_PLAYS_PER_DAY) {
//       toast.error('আজকের খেলার লিমিট শেষ! 🔒', { theme: 'dark' });
//       return;
//     }
    
//     setScore(0);
//     setTimeLeft(GAME_DURATION);
//     setIsPlaying(true);
//     generateLevel();
    
//     toast.info('গেম শুরু! সঠিক অক্ষরটি খুঁজুন 🚀', {
//       theme: 'dark', position: 'top-center', autoClose: 1500, hideProgressBar: true,
//     });
//   };

//   const endGame = () => {
//     setIsPlaying(false);
//     const newPlays = playsToday + 1;
//     setPlaysToday(newPlays);
//     localStorage.setItem('premium_alpha_playsToday', newPlays.toString());
//     setLettersOnScreen([]);

//     if (score > highScore) {
//       setHighScore(score);
//       localStorage.setItem('premium_alpha_highScore', score.toString());
//       toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, { theme: 'dark', autoClose: 4000 });
//     } else {
//       toast.warning(`গেম ওভার! আপনার স্কোর: ${score}`, { theme: 'dark', autoClose: 3000 });
//     }
//   };

//   const handleLetterClick = (char: string, e: React.MouseEvent | React.TouchEvent) => {
//     e.preventDefault();
//     if (!isPlaying) return;

//     if (char === targetLetter) {
//       setScore(prev => prev + 10);
//       generateLevel();
//     } else {
//       setScore(prev => (prev - 5 < 0 ? 0 : prev - 5));
//       toast.error(`ভুল! -৫ পয়েন্ট ❌`, { theme: 'colored', autoClose: 500, hideProgressBar: true, position: "bottom-center" });
//     }
//   };

//   if (!isMounted) return null;

//   const SidebarContent = () => (
//     <div className="flex flex-col h-full text-white">
//       <h2 className="text-2xl font-black text-cyan-400 mb-6 border-b border-white/10 pb-4">
//         🎮 গেমের নিয়মাবলী
//       </h2>
//       <ul className="space-y-6 text-sm text-gray-300">
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">🎯</span>
//           <p><strong className="text-white text-base block mb-1">কী খুঁজতে হবে?</strong> স্ক্রিনের উপরে বড় করে দেওয়া অক্ষরটি নিচের ভাসমান অক্ষরগুলো থেকে দ্রুত খুঁজে বের করুন।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">✅</span>
//           <p><strong className="text-green-400 text-base block mb-1">পয়েন্ট যোগ (+১০)</strong> সঠিক অক্ষরে ক্লিক করতে পারলে ১০ পয়েন্ট যোগ হবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">❌</span>
//           <p><strong className="text-red-400 text-base block mb-1">পয়েন্ট কাটা (-৫)</strong> ভুল অক্ষরে ক্লিক করলে ৫ পয়েন্ট কাটা যাবে!</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">⏱️</span>
//           <p><strong className="text-white text-base block mb-1">সময়সীমা</strong> আপনার হাতে থাকবে মাত্র ৩০ সেকেন্ড।</p>
//         </li>
//       </ul>
//     </div>
//   );

//   return (
//     <div className="flex min-h-[100dvh] w-full bg-[#0a0a1a] select-none touch-manipulation overflow-hidden font-sans">
//       <ToastContainer />

//       {/* PC Sidebar */}
//       <div className="hidden lg:block w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-8 h-[100dvh] shadow-2xl z-20">
//         <SidebarContent />
//       </div>

//       {/* Mobile Sidebar */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden flex">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//           <div className="relative w-[280px] bg-gray-900/90 backdrop-blur-xl p-6 h-full shadow-2xl border-r border-white/10">
//             <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full">✕</button>
//             <div className="mt-8 h-full"><SidebarContent /></div>
//           </div>
//         </div>
//       )}

//       {/* Main Game Area */}
//       <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
//         <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md text-white p-2 px-4 rounded-full shadow-lg border border-white/20 active:scale-95 text-sm">
//           ☰ নিয়ম
//         </button>

//         <div className="relative flex h-[100dvh] w-full flex-col bg-gray-900/40 backdrop-blur-2xl shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border border-white/10 overflow-hidden">
          
//           {/* গেম হেডার (Glassmorphism) */}
//           <div className="bg-white/5 backdrop-blur-md p-6 pb-4 pt-16 lg:pt-6 rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/10 z-10">
//             <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest mb-4 drop-shadow-lg">
//               FIND ALPHABET
//             </h1>
            
//             <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/10 shadow-inner">
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">SCORE</p>
//                 <p className="text-2xl sm:text-3xl font-black text-white">{score}</p>
//               </div>
//               <div className="text-center w-1/3 border-x border-white/10">
//                 <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">TIME</p>
//                 <p className={`text-3xl sm:text-4xl font-black ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
//                   {timeLeft}
//                 </p>
//               </div>
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-cyan-200/70 font-semibold mb-1">BEST</p>
//                 <p className="text-2xl sm:text-3xl font-black text-yellow-400">{highScore}</p>
//               </div>
//             </div>

//             {/* Visual Timer Bar */}
//             {isPlaying && (
//               <div className="w-full bg-black/50 h-2 rounded-full mt-4 overflow-hidden border border-white/5">
//                 <div 
//                   className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
//                   style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
//                 ></div>
//               </div>
//             )}

//             {isPlaying && (
//               <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/20 text-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
//                 <p className="text-cyan-200/80 text-sm mb-1">খুঁজে বের করুন:</p>
//                 <p className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{targetLetter}</p>
//               </div>
//             )}
//           </div>

//           {/* গেম প্লে এরিয়া */}
//           <div className="relative flex-1 w-full overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent"></div>
            
//             {!isPlaying ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
//                 <button 
//                   onClick={startGame}
//                   disabled={playsToday >= MAX_PLAYS_PER_DAY}
//                   className="group relative w-full max-w-[250px] bg-white/10 hover:bg-white/20 disabled:bg-white/5 backdrop-blur-md text-white text-2xl font-black py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 disabled:opacity-50 transition-all active:scale-95 overflow-hidden"
//                 >
//                   <span className="relative z-10 drop-shadow-md">{playsToday >= MAX_PLAYS_PER_DAY ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}</span>
//                 </button>
//                 <p className="mt-6 text-gray-400 text-sm text-center bg-black/40 py-2 px-4 rounded-full border border-white/5">
//                   আজকের সুযোগ: {MAX_PLAYS_PER_DAY - playsToday} বার বাকি
//                 </p>
//               </div>
//             ) : (
//               // ভাসমান অক্ষরগুলো (Glassmorphism & Random colors)
//               lettersOnScreen.map((item) => (
//                 <button
//                   key={item.id}
//                   onPointerDown={(e) => handleLetterClick(item.char, e)}
//                   style={{ 
//                     top: item.top, 
//                     left: item.left,
//                     transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` 
//                   }}
//                   className={`absolute w-14 h-14 sm:w-16 sm:h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 active:scale-75 transition-all duration-100 flex items-center justify-center text-3xl sm:text-4xl font-black ${item.color} drop-shadow-lg`}
//                 >
//                   {item.char}
//                 </button>
//               ))
//             )}
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }


// 'use client';
// import { useState, useEffect } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // ইংরেজি অক্ষরগুলোর একটি অ্যারে
// const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// export default function FindAlphabetGame() {
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [playsToday, setPlaysToday] = useState(0);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
//   // গেমের জন্য নতুন স্টেট
//   const [targetLetter, setTargetLetter] = useState("");
//   const [lettersOnScreen, setLettersOnScreen] = useState<{char: string, top: string, left: string, id: string}[]>([]);
  
//   const MAX_PLAYS_PER_DAY = 5; 
//   const GAME_DURATION = 30; // এই গেমের জন্য সময় ৩০ সেকেন্ড দিলাম

//   // Hydration Error ফিক্স এবং LocalStorage ডাটা লোড
//   useEffect(() => {
//     setIsMounted(true);
//     const savedHighScore = localStorage.getItem('alphabet_highScore') || '0';
//     setHighScore(parseInt(savedHighScore, 10));

//     const lastDate = localStorage.getItem('alphabet_lastDate');
//     const today = new Date().toDateString();

//     if (lastDate === today) {
//       const savedPlays = localStorage.getItem('alphabet_playsToday') || '0';
//       setPlaysToday(parseInt(savedPlays, 10));
//     } else {
//       localStorage.setItem('alphabet_lastDate', today);
//       localStorage.setItem('alphabet_playsToday', '0');
//       setPlaysToday(0);
//     }
//   }, []);

//   // গেম টাইমার
//   useEffect(() => {
//     if (timeLeft > 0 && isPlaying) {
//       const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
//       return () => clearTimeout(timerId);
//     } else if (timeLeft === 0 && isPlaying) {
//       endGame();
//     }
//   }, [timeLeft, isPlaying]);

//   // নতুন লেভেল বা অক্ষর জেনারেট করার ফাংশন
//   const generateLevel = () => {
//     // টার্গেট অক্ষর বাছাই
//     const target = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
    
//     let decoys: string[] = [];
//     // টার্গেট ছাড়া আরও ৫টি ভুল অক্ষর (Decoys) নিবো
//     while (decoys.length < 5) {
//       const randomChar = ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
//       if (randomChar !== target && !decoys.includes(randomChar)) {
//         decoys.push(randomChar);
//       }
//     }

//     // টার্গেট এবং ভুল অক্ষরগুলো একসাথে করে এলোমেলো (Shuffle) করা
//     const allChars = [target, ...decoys].sort(() => Math.random() - 0.5);

//     // প্রতিটি অক্ষরের জন্য র‍্যান্ডম পজিশন সেট করা
//     const lettersWithPos = allChars.map(char => ({
//       char,
//       top: `${Math.floor(Math.random() * 70) + 10}%`, // 10% to 80% 
//       left: `${Math.floor(Math.random() * 75) + 10}%`,
//       id: Math.random().toString(36).substring(2, 9)
//     }));

//     setTargetLetter(target);
//     setLettersOnScreen(lettersWithPos);
//   };

//   const startGame = () => {
//     if (playsToday >= MAX_PLAYS_PER_DAY) {
//       toast.error('আজকের খেলার লিমিট শেষ! 🔒 আগামীকাল আবার খেলুন।', { theme: 'dark' });
//       return;
//     }
    
//     setScore(0);
//     setTimeLeft(GAME_DURATION);
//     setIsPlaying(true);
//     generateLevel();
    
//     toast.info('গেম শুরু! সঠিক অক্ষরটি খুঁজুন 🚀', {
//       theme: 'dark', position: 'top-center', autoClose: 1500, hideProgressBar: true,
//     });
//   };

//   const endGame = () => {
//     setIsPlaying(false);
//     const newPlays = playsToday + 1;
//     setPlaysToday(newPlays);
//     localStorage.setItem('alphabet_playsToday', newPlays.toString());
//     setLettersOnScreen([]);

//     if (score > highScore) {
//       setHighScore(score);
//       localStorage.setItem('alphabet_highScore', score.toString());
//       toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, { theme: 'dark', autoClose: 4000 });
//     } else {
//       toast.warning(`গেম ওভার! আপনার স্কোর: ${score}`, { theme: 'dark', autoClose: 3000 });
//     }
//   };

//   // অক্ষরে ক্লিক করার লজিক
//   const handleLetterClick = (char: string, e: React.MouseEvent | React.TouchEvent) => {
//     e.preventDefault();
//     if (!isPlaying) return;

//     if (char === targetLetter) {
//       // সঠিক অক্ষরে ক্লিক করলে
//       setScore(prev => prev + 10);
//       generateLevel(); // নতুন অক্ষর আসবে
//     } else {
//       // ভুল অক্ষরে ক্লিক করলে পয়েন্ট মাইনাস হবে (স্কোর 0 এর নিচে যাবে না)
//       setScore(prev => {
//         const newScore = prev - 5;
//         return newScore < 0 ? 0 : newScore;
//       });
//       toast.error(`ভুল! -৫ পয়েন্ট ❌`, { theme: 'colored', autoClose: 500, hideProgressBar: true, position: "bottom-center" });
//     }
//   };

//   if (!isMounted) return null;

//   const SidebarContent = () => (
//     <div className="flex flex-col h-full text-white">
//       <h2 className="text-2xl font-black text-yellow-400 mb-6 border-b border-gray-700 pb-4">
//         🎮 গেমের নিয়মাবলী
//       </h2>
//       <ul className="space-y-6 text-sm text-gray-300">
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">👀</span>
//           <p><strong className="text-white text-base block mb-1">কী খুঁজতে হবে?</strong> স্ক্রিনের উপরে বড় করে একটি অক্ষর দেওয়া থাকবে। আপনাকে নিচের ভাসমান অক্ষরগুলো থেকে সেটি দ্রুত খুঁজে বের করতে হবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">✅</span>
//           <p><strong className="text-green-400 text-base block mb-1">পয়েন্ট যোগ (+১০)</strong> সঠিক অক্ষরে ক্লিক করতে পারলে ১০ পয়েন্ট যোগ হবে এবং নতুন অক্ষর আসবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">❌</span>
//           <p><strong className="text-red-400 text-base block mb-1">পয়েন্ট কাটা (-৫)</strong> ভুল অক্ষরে ক্লিক করলে আপনার বর্তমান স্কোর থেকে ৫ পয়েন্ট কাটা যাবে!</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">⏱️</span>
//           <p><strong className="text-white text-base block mb-1">সময়সীমা</strong> আপনার হাতে থাকবে ৩০ সেকেন্ড।</p>
//         </li>
//       </ul>
//     </div>
//   );

//   return (
//     <div className="flex min-h-[100dvh] w-full bg-gray-950 select-none touch-manipulation overflow-hidden font-sans">
//       <ToastContainer />

//       {/* PC Sidebar */}
//       <div className="hidden lg:block w-80 bg-gray-900 border-r border-gray-800 p-8 h-[100dvh] shadow-2xl z-20">
//         <SidebarContent />
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden flex">
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//           <div className="relative w-[280px] bg-gray-900 p-6 h-full shadow-2xl border-r border-gray-700">
//             <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">✕</button>
//             <div className="mt-8 h-full"><SidebarContent /></div>
//           </div>
//         </div>
//       )}

//       {/* Main Game Area */}
//       <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
//         <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 active:scale-95 text-sm">
//           ☰ নিয়মাবলী
//         </button>

//         <div className="relative flex h-[100dvh] w-full flex-col bg-gray-900 shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-800 overflow-hidden">
          
//           {/* গেম হেডার */}
//           <div className="bg-gray-800 p-6 pb-4 pt-16 lg:pt-6 rounded-b-3xl shadow-md z-10">
//             <h1 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-widest mb-4">
//               FIND ALPHABET
//             </h1>
            
//             <div className="flex justify-between items-center bg-gray-900/80 p-4 rounded-2xl border border-gray-700 shadow-inner">
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">SCORE</p>
//                 <p className="text-2xl sm:text-3xl font-black text-green-400">{score}</p>
//               </div>
//               <div className="text-center w-1/3 border-x border-gray-700">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">TIME</p>
//                 <p className={`text-3xl sm:text-4xl font-black ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
//                   {timeLeft}
//                 </p>
//               </div>
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">BEST</p>
//                 <p className="text-2xl sm:text-3xl font-black text-yellow-400">{highScore}</p>
//               </div>
//             </div>

//             {isPlaying && (
//               <div className="mt-4 bg-gray-700 p-3 rounded-xl border-2 border-dashed border-gray-500 text-center animate-pulse">
//                 <p className="text-gray-300 text-sm">খুঁজে বের করুন:</p>
//                 <p className="text-4xl font-black text-white drop-shadow-md">{targetLetter}</p>
//               </div>
//             )}
//           </div>

//           {/* গেম প্লে এরিয়া (অক্ষর খোঁজার জায়গা) */}
//           <div className="relative flex-1 w-full bg-gray-950 overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-black"></div>
            
//             {!isPlaying ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] z-20">
//                 <button 
//                   onClick={startGame}
//                   disabled={playsToday >= MAX_PLAYS_PER_DAY}
//                   className="group relative w-full max-w-[250px] bg-gradient-to-br from-indigo-500 to-purple-700 hover:from-indigo-400 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 text-white text-2xl font-black py-4 px-8 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.4)] transition-all active:scale-95 overflow-hidden"
//                 >
//                   <span className="relative z-10">{playsToday >= MAX_PLAYS_PER_DAY ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}</span>
//                 </button>
//                 <p className="mt-4 text-gray-400 text-sm text-center">সঠিক অক্ষরে +১০ পয়েন্ট <br/> ভুল অক্ষরে -৫ পয়েন্ট</p>
//               </div>
//             ) : (
//               // রেন্ডম অক্ষরগুলো স্ক্রিনে দেখানো হচ্ছে
//               lettersOnScreen.map((item) => (
//                 <button
//                   key={item.id}
//                   onPointerDown={(e) => handleLetterClick(item.char, e)}
//                   style={{ top: item.top, left: item.left }}
//                   className="absolute w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 rounded-xl shadow-lg transform -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-transform duration-100 flex items-center justify-center border-2 border-gray-600 text-3xl font-black text-white"
//                 >
//                   {item.char}
//                 </button>
//               ))
//             )}
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';
// import { useState, useEffect } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function MobileStyleGameWithSidebar() {
//   const [score, setScore] = useState(0);
//   const [highScore, setHighScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
//   const [playsToday, setPlaysToday] = useState(0);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
//   const MAX_PLAYS_PER_DAY = 5; 
//   const GAME_DURATION = 15; 

//   // Vercel Hydration Error ফিক্স এবং LocalStorage থেকে ডাটা লোড
//   useEffect(() => {
//     setIsMounted(true);
//     const savedHighScore = localStorage.getItem('game_highScore') || '0';
//     setHighScore(parseInt(savedHighScore, 10));

//     const lastDate = localStorage.getItem('game_lastDate');
//     const today = new Date().toDateString();

//     if (lastDate === today) {
//       const savedPlays = localStorage.getItem('game_playsToday') || '0';
//       setPlaysToday(parseInt(savedPlays, 10));
//     } else {
//       localStorage.setItem('game_lastDate', today);
//       localStorage.setItem('game_playsToday', '0');
//       setPlaysToday(0);
//     }
//   }, []);

//   // টাইমার লজিক
//   useEffect(() => {
//     if (timeLeft > 0 && isPlaying) {
//       const timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
//       return () => clearTimeout(timerId);
//     } else if (timeLeft === 0 && isPlaying) {
//       endGame();
//     }
//   }, [timeLeft, isPlaying]);

//   const startGame = () => {
//     if (playsToday >= MAX_PLAYS_PER_DAY) {
//       toast.error('আজকের খেলার লিমিট শেষ! 🔒 আগামীকাল আবার খেলুন।', {
//         theme: 'dark',
//         position: 'top-center',
//       });
//       return;
//     }
    
//     setScore(0);
//     setTimeLeft(GAME_DURATION);
//     setIsPlaying(true);
//     moveTarget();
    
//     toast.info('গেম শুরু! দ্রুত ট্যাপ করুন 🚀', {
//       theme: 'dark',
//       position: 'top-center',
//       autoClose: 1500,
//       hideProgressBar: true,
//     });
//   };

//   const endGame = () => {
//     setIsPlaying(false);
//     const newPlays = playsToday + 1;
//     setPlaysToday(newPlays);
//     localStorage.setItem('game_playsToday', newPlays.toString());

//     if (score > highScore) {
//       setHighScore(score);
//       localStorage.setItem('game_highScore', score.toString());
//       toast.success(`অসাধারণ! নতুন হাই-স্কোর: ${score} 🏆`, {
//         theme: 'dark',
//         position: 'top-center',
//         autoClose: 4000,
//       });
//     } else {
//       toast.warning(`গেম ওভার! আপনার স্কোর: ${score}`, {
//         theme: 'dark',
//         position: 'top-center',
//         autoClose: 3000,
//       });
//     }
//   };

//   const moveTarget = () => {
//     const top = Math.floor(Math.random() * 75) + 10; 
//     const left = Math.floor(Math.random() * 75) + 10;
//     setTargetPos({ top: `${top}%`, left: `${left}%` });
//   };

//   const handleTargetClick = (e: React.MouseEvent | React.TouchEvent) => {
//     e.preventDefault();
//     if (isPlaying) {
//       setScore(prev => prev + 1);
//       moveTarget();
//     }
//   };

//   if (!isMounted) return null;

//   // সাইডবার কনটেন্ট (PC ও Mobile দুই জায়গাতেই ব্যবহার করার জন্য)
//   const SidebarContent = () => (
//     <div className="flex flex-col h-full text-white">
//       <h2 className="text-2xl font-black text-yellow-400 mb-6 border-b border-gray-700 pb-4">
//         🎮 গেমের নিয়মাবলী
//       </h2>
//       <ul className="space-y-6 text-sm text-gray-300">
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">⏱️</span>
//           <p><strong className="text-white text-base block mb-1">সময়সীমা</strong> ১৫ সেকেন্ডের মধ্যে লাল টার্গেটে যতো বেশি সম্ভব ট্যাপ করতে হবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">🎯</span>
//           <p><strong className="text-white text-base block mb-1">সতর্কতা</strong> টার্গেটটি ট্যাপ করার সাথে সাথেই জায়গা বদল করবে, তাই চোখ কান খোলা রাখুন!</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">🔒</span>
//           <p><strong className="text-white text-base block mb-1">ডেইলি লিমিট</strong> প্রতিদিন সর্বোচ্চ ৫ বার গেমটি খেলা যাবে। রাত ১২টার পর লিমিট রিস্টার্ট হবে।</p>
//         </li>
//         <li className="flex items-start">
//           <span className="text-2xl mr-4">🏆</span>
//           <p><strong className="text-white text-base block mb-1">হাই-স্কোর</strong> আপনার সর্বোচ্চ স্কোর ব্রাউজারে সেভ থাকবে, তাই বন্ধুদের সাথে চ্যালেঞ্জ করুন!</p>
//         </li>
//       </ul>
//       <div className="mt-auto pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
//         Developed with Next.js & Tailwind CSS
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex min-h-[100dvh] w-full bg-gray-950 select-none touch-manipulation overflow-hidden">
      
//       {/* ToastContainer যোগ করা হলো নোটিফিকেশনের জন্য */}
//       <ToastContainer />

//       {/* PC: Fixed Sidebar (ডেস্কটপে সবসময় বাম পাশে দেখাবে) */}
//       <div className="hidden lg:block w-80 bg-gray-900 border-r border-gray-800 p-8 h-[100dvh] shadow-2xl z-20">
//         <SidebarContent />
//       </div>

//       {/* Mobile: Sidebar Overlay (মোবাইলে মেনু বাটন চাপলে আসবে) */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden flex">
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
//           <div className="relative w-[280px] bg-gray-900 p-6 h-full shadow-2xl border-r border-gray-700 transform transition-transform duration-300">
//             <button 
//               onClick={() => setIsSidebarOpen(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full"
//             >
//               ✕
//             </button>
//             <div className="mt-8 h-full">
//               <SidebarContent />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* মূল গেম এরিয়া */}
//       <div className="flex-1 flex flex-col items-center justify-center sm:p-6 relative">
        
//         {/* Mobile: Hamburger Menu Button (নিয়মাবলী দেখার জন্য) */}
//         <button 
//           onClick={() => setIsSidebarOpen(true)}
//           className="lg:hidden absolute top-4 left-4 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 active:scale-95"
//         >
//           ☰ নিয়মাবলী
//         </button>

//         <div className="relative flex h-[100dvh] w-full flex-col bg-gray-900 shadow-2xl sm:h-[800px] sm:max-w-md sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-800 overflow-hidden">
          
//           {/* গেম হেডার */}
//           <div className="bg-gray-800 p-6 pb-4 pt-16 lg:pt-6 rounded-b-3xl shadow-md z-10">
//             <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wider mb-4">
//               TAP TARGET
//             </h1>
            
//             <div className="flex justify-between items-center bg-gray-900/80 p-4 rounded-2xl border border-gray-700 shadow-inner">
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">SCORE</p>
//                 <p className="text-2xl sm:text-3xl font-black text-white">{score}</p>
//               </div>
//               <div className="text-center w-1/3 border-x border-gray-700">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">TIME</p>
//                 <p className={`text-3xl sm:text-4xl font-black ${timeLeft <= 5 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
//                   {timeLeft}
//                 </p>
//               </div>
//               <div className="text-center w-1/3">
//                 <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-1">BEST</p>
//                 <p className="text-2xl sm:text-3xl font-black text-green-400">{highScore}</p>
//               </div>
//             </div>

//             <div className="mt-5 text-center">
//               <p className="text-xs text-gray-400 flex justify-between px-2 mb-1">
//                 <span>আজকের সুযোগ</span>
//                 <span className="text-blue-400 font-bold">{MAX_PLAYS_PER_DAY - playsToday} বার বাকি</span>
//               </p>
//               <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner">
//                 <div 
//                   className={`h-full transition-all duration-500 ${playsToday >= MAX_PLAYS_PER_DAY ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
//                   style={{ width: `${(playsToday / MAX_PLAYS_PER_DAY) * 100}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           {/* গেম প্লে এরিয়া */}
//           <div className="relative flex-1 w-full bg-gray-950 overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black opacity-50"></div>
            
//             {!isPlaying ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] z-20">
//                 <button 
//                   onClick={startGame}
//                   disabled={playsToday >= MAX_PLAYS_PER_DAY}
//                   className="group relative w-full max-w-[250px] bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-400 hover:to-emerald-600 disabled:from-gray-700 disabled:to-gray-800 text-white text-2xl font-black py-4 px-8 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] disabled:shadow-none transition-all active:scale-95 overflow-hidden"
//                 >
//                   <span className="relative z-10">{playsToday >= MAX_PLAYS_PER_DAY ? 'লিমিট শেষ 🔒' : 'PLAY NOW ▶'}</span>
//                   {!playsToday && (
//                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
//                   )}
//                 </button>
//                 {playsToday >= MAX_PLAYS_PER_DAY && (
//                   <p className="mt-4 text-sm text-red-400 animate-pulse">আজকের মতো গেম খেলা শেষ!</p>
//                 )}
//               </div>
//             ) : (
//               <button
//                 onPointerDown={handleTargetClick}
//                 style={{ top: targetPos.top, left: targetPos.left }}
//                 className="absolute w-16 h-16 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-[0_0_25px_rgba(239,68,68,0.8)] transform -translate-x-1/2 -translate-y-1/2 active:scale-75 transition-all duration-75 outline-none flex items-center justify-center border-[3px] border-white/40"
//               >
//                 <div className="w-6 h-6 rounded-full border-2 border-white/50 bg-white/20"></div>
//               </button>
//             )}
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }

