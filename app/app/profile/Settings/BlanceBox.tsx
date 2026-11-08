'use client';

// import { motion } from 'framer-motion';

// export default function BalanceBox() {
//   return (
//     <motion.div
//       initial={{ scale: 0.9, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       transition={{ duration: 0.4 }}
//       className="bg-blue-50 p-6 rounded-xl shadow-md text-center"
//     >
//       <h3 className="text-lg font-medium text-blue-700">Current Balance</h3>
//       <p className="text-2xl font-bold mt-2 text-blue-900">$1,250.00</p>
//     </motion.div>
//   );
// }
// import { useState } from 'react';
// import { motion } from 'framer-motion';

// export default function BalanceCard() {
//   const [show, setShow] = useState(true);
//   const balance = 17425;
//   const coins = 1240;


//   return (
//     <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
//       <div className="flex justify-between items-center">
//         <h3 className="text-xl font-semibold">Account Balance</h3>
//         <button
//           onClick={() => setShow(!show)}
//           className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
//         >
//           {show ? 'Hide' : 'Show'}
//         </button>
//       </div>
//       <motion.div
//         className="mt-4 text-3xl font-bold"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         key={show}
//       >
//         {show ? `৳ ${balance.toLocaleString()}` : '••••••'}
//       </motion.div>
//       <div className="mt-2 text-sm">Coins Earned: <b>{coins}</b></div>
//     </div>
//   );
// }







// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';



// export default function BalanceCard() {
//   const [show, setShow] = useState(false);
//   const [count, setCount] = useState(0);
//   const balance = 17425;
//   const coins = 1240;

//   // Auto-incrementing counter for coins
//   useEffect(() => {
//     let start = 0;
//     const interval = setInterval(() => {
//       start += 10;
//       if (start >= coins) {
//         setCount(coins);
//         clearInterval(interval);
//       } else {
//         setCount(start);
//       }
//     }, 30);
//     return () => clearInterval(interval);
//   }, [coins]);


//   return (
//     <div
//       className="relative overflow-hidden p-6 rounded-xl shadow-lg bg-drak-900 from-red-500 to-yellow-300 "
//       style={{
//         backgroundImage:'url(../../../public/Icon/rcoin.png)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-300 backdrop-blur-sm rounded-xl z-0" />

//       <div className="relative z-10">
//         <div className="flex justify-between items-center">
//           <h3 className="text-xl font-semibold">Account Balance</h3>
//           <button
//             onClick={() => setShow(!show)}
//             className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
//           >
//             { show ? 'Hide' : 'Show'}
//           </button>
//         </div>

//         <motion.div
//           className="mt-4 text-3xl font-bold"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           key={show}
//         >
//           {show ? `৳ ${balance.toLocaleString()}` : '••••••'}
//         </motion.div>

//         <div className="mt-4 flex items-center gap-2">
//           {/* Animated Coin */}
//           <motion.img
//             src="../../../public/Icon/rcoin.png"
//             alt="coin"
//             className="w-8 h-8"
//             animate={{ rotate: [0, 360] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
//           />

//           <motion.div
//             className="text-lg font-medium"
//             initial={{ scale: 0.8 }}
//             animate={{ scale: 1 }}
//             transition={{ type: 'spring', stiffness: 300 }}
//           >
//             Coins Earned: <span className="font-bold">{count}</span>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react'

export default function BlanceBox() {
  return (
    <div>BlanceBox</div>
  )
}
