
import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}


// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import CryptoJS from "crypto-js";
// import { motion } from "framer-motion";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";

// // LocalStorage key names
// const LS_KEYS = {
//   CHAIN: "rcoin_chain",
//   MEMPOOL: "rcoin_mempool",
//   SETTINGS: "rcoin_settings",
//   DARK: "rcoin_dark",
//   MINER_ADDR: "rcoin_minerAddress",
// };

// function sha256HexSync(msg) {
//   return CryptoJS.SHA256(msg).toString(CryptoJS.enc.Hex);
// }

// function randomAddress() {
//   return "R" + Math.random().toString(36).slice(2, 10);
// }

// export default function PremiumRCoinSim() {
//   // THEME
//   const [dark, setDark] = useState(() => {
//     if (typeof window === "undefined") return true;
//     try {
//       return localStorage.getItem(LS_KEYS.DARK) === "1";
//     } catch {
//       return true;
//     }
//   });

//   useEffect(() => {
//     if (dark) document.documentElement.classList.add("dark");
//     else document.documentElement.classList.remove("dark");
//     try {
//       localStorage.setItem(LS_KEYS.DARK, dark ? "1" : "0");
//     } catch {}
//   }, [dark]);

//   // SETTINGS + PERSISTENCE
//   const [difficulty, setDifficulty] = useState(3);
//   const [blockReward, setBlockReward] = useState(12.5);
//   const [halvingInterval, setHalvingInterval] = useState(5);
//   const [minerAddress, setMinerAddress] = useState(() => {
//     if (typeof window === "undefined") return "miner1";
//     try {
//       return localStorage.getItem(LS_KEYS.MINER_ADDR) || randomAddress();
//     } catch {
//       return randomAddress();
//     }
//   });

//   // CHAIN & MEMPOOL STATES
//   const [chain, setChain] = useState(() => {
//     if (typeof window === "undefined") return [];
//     try {
//       const raw = localStorage.getItem(LS_KEYS.CHAIN);
//       if (raw) return JSON.parse(raw);
//     } catch {}
//     return [
//       {
//         index: 0,
//         timestamp: new Date().toISOString(),
//         prevHash: "0",
//         nonce: 0,
//         transactions: [],
//         hash: "0",
//       },
//     ];
//   });
//   const [mempool, setMempool] = useState(() => {
//     if (typeof window === "undefined") return [];
//     try {
//       const raw = localStorage.getItem(LS_KEYS.MEMPOOL);
//       if (raw) return JSON.parse(raw);
//     } catch {}
//     return [];
//   });

//   // AUTO-MINING
//   const [autoMine, setAutoMine] = useState(false);
//   const miningRef = useRef(false);
//   const [mining, setMining] = useState(false);

//   // MINING STATS
//   const [attempts, setAttempts] = useState(0);
//   const [lastFoundNonce, setLastFoundNonce] = useState(null);

//   // LIVE PRICE DATA
//   const [livePrice, setLivePrice] = useState(null);
//   const [priceHistory, setPriceHistory] = useState([]);

//   // BLOCKCHAIN METRICS FOR CHARTS
//   const [coinsMinedHistory, setCoinsMinedHistory] = useState([]);
//   const [txCountHistory, setTxCountHistory] = useState([]);

//   // Save chain & mempool & settings to localStorage on change
//   useEffect(() => {
//     try {
//       localStorage.setItem(LS_KEYS.CHAIN, JSON.stringify(chain));
//       localStorage.setItem(LS_KEYS.MEMPOOL, JSON.stringify(mempool));
//       localStorage.setItem(LS_KEYS.MINER_ADDR, minerAddress || "");
//     } catch {}
//   }, [chain, mempool, minerAddress]);

//   // Save settings
//   useEffect(() => {
//     try {
//       localStorage.setItem(
//         LS_KEYS.SETTINGS,
//         JSON.stringify({ difficulty, blockReward, halvingInterval })
//       );
//     } catch {}
//   }, [difficulty, blockReward, halvingInterval]);

//   // Load settings on mount
//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(LS_KEYS.SETTINGS);
//       if (raw) {
//         const s = JSON.parse(raw);
//         if (typeof s.difficulty === "number") setDifficulty(s.difficulty);
//         if (typeof s.blockReward === "number") setBlockReward(s.blockReward);
//         if (typeof s.halvingInterval === "number") setHalvingInterval(s.halvingInterval);
//       }
//     } catch {}
//   }, []);

//   // Compute balances from chain
//   const balances = useMemo(() => {
//     const b = {};
//     chain.forEach((block) =>
//       block.transactions.forEach((tx) => {
//         if (tx.from !== "SYSTEM") b[tx.from] = (b[tx.from] || 0) - tx.amount - (tx.fee || 0);
//         b[tx.to] = (b[tx.to] || 0) + tx.amount;
//       })
//     );
//     return b;
//   }, [chain]);

//   // Calculate reward with halving
//   function currentReward(blockIndex) {
//     const halvings = Math.floor(blockIndex / halvingInterval);
//     return +(blockReward / 2 ** halvings).toFixed(8);
//   }

//   // Pick transactions by highest fee first
//   function pickTransactions(limit = 10) {
//     return [...mempool].sort((a, b) => (b.fee || 0) - (a.fee || 0)).slice(0, limit);
//   }

//   // Mining logic
//   async function mineBlockManual() {
//     if (miningRef.current) return;
//     miningRef.current = true;
//     setMining(true);

//     const index = chain.length;
//     const prevHash = chain[chain.length - 1].hash;
//     const txs = pickTransactions(20);
//     const reward = currentReward(index);
//     const feeTotal = txs.reduce((sum, t) => sum + (t.fee || 0), 0);

//     const coinbase = {
//       id: `coinbase-${Date.now()}`,
//       from: "SYSTEM",
//       to: minerAddress || "miner1",
//       amount: reward + feeTotal,
//       fee: 0,
//       time: new Date().toISOString(),
//     };

//     const transactions = [coinbase, ...txs];

//     let nonce = 0;
//     const target = "0".repeat(difficulty);
//     const batchSize = 20000;

//     try {
//       while (miningRef.current) {
//         for (let i = 0; i < batchSize; i++) {
//           const data = `${index}|${prevHash}|${JSON.stringify(transactions)}|${nonce + i}`;
//           const h = sha256HexSync(data);
//           setAttempts((a) => a + 1);
//           if (h.startsWith(target)) {
//             const newBlock = {
//               index,
//               timestamp: new Date().toISOString(),
//               prevHash,
//               nonce: nonce + i,
//               transactions,
//               hash: h,
//             };
//             setChain((c) => [...c, newBlock]);
//             setMempool((m) => m.filter((tx) => !transactions.find((t) => t.id === tx.id)));
//             setLastFoundNonce(nonce + i);
//             miningRef.current = false;
//             setMining(false);
//             return;
//           }
//         }
//         nonce += batchSize;
//         await new Promise((r) => setTimeout(r, 0));
//       }
//     } catch (e) {
//       console.error(e);
//       miningRef.current = false;
//       setMining(false);
//     }
//   }

//   // Auto mining effect
//   useEffect(() => {
//     let interval;
//     if (autoMine) {
//       interval = setInterval(() => {
//         if (!miningRef.current) mineBlockManual();
//       }, 2200);
//     }
//     return () => clearInterval(interval);
//   }, [autoMine]);

//   // Generate new miner address
//   function genAddress() {
//     const a = randomAddress();
//     setMinerAddress(a);
//   }

//   // Create transaction
//   function createTransaction(from, to, amount, fee = 0) {
//     if (!from || !to || amount <= 0) {
//       alert("সঠিক তথ্য দিন");
//       return;
//     }
//     if (from !== "SYSTEM" && (balances[from] || 0) < amount + fee) {
//       alert("পর্যাপ্ত ব্যালান্স নেই");
//       return;
//     }
//     const tx = {
//       id: Math.random().toString(36).slice(2, 9),
//       from,
//       to,
//       amount: Number(amount),
//       fee: Number(fee),
//       time: new Date().toISOString(),
//     };
//     setMempool((m) => [tx, ...m]);
//   }

//   // Reset everything
//   function resetAll() {
//     if (!confirm("সবকিছু রিসেট করবেন?")) return;
//     setChain([
//       {
//         index: 0,
//         timestamp: new Date().toISOString(),
//         prevHash: "0",
//         nonce: 0,
//         transactions: [],
//         hash: "0",
//       },
//     ]);
//     setMempool([]);
//     setAttempts(0);
//     setLastFoundNonce(null);
//     setPriceHistory([]);
//     setCoinsMinedHistory([]);
//     setTxCountHistory([]);
//   }

//   // Fetch live Bitcoin price every 15s
//   useEffect(() => {
//     async function fetchPrice() {
//       try {
//         const res = await fetch(
//           "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
//         );
//         const data = await res.json();
//         if (data.bitcoin && data.bitcoin.usd) {
//           const now = new Date();
//           setLivePrice(data.bitcoin.usd);
//           setPriceHistory((old) => {
//             const arr = [...old, { time: now.toLocaleTimeString(), price: data.bitcoin.usd }];
//             if (arr.length > 30) arr.shift();
//             return arr;
//           });
//         }
//       } catch (e) {
//         console.warn("Failed to fetch price:", e);
//       }
//     }
//     fetchPrice();
//     const interval = setInterval(fetchPrice, 15000);
//     return () => clearInterval(interval);
//   }, []);

//   // Update blockchain metrics for charts
//   useEffect(() => {
//     const totalCoins = chain.reduce((acc, b) => {
//       const coinbaseTx = b.transactions.find((t) => t.from === "SYSTEM");
//       return acc + (coinbaseTx?.amount || 0);
//     }, 0);

//     const totalTxs = chain.reduce((acc, b) => acc + b.transactions.length, 0);

//     const now = new Date();
//     setCoinsMinedHistory((old) => {
//       const arr = [...old, { time: now.toLocaleTimeString(), coins: totalCoins }];
//       if (arr.length > 30) arr.shift();
//       return arr;
//     });
//     setTxCountHistory((old) => {
//       const arr = [...old, { time: now.toLocaleTimeString(), txs: totalTxs }];
//       if (arr.length > 30) arr.shift();
//       return arr;
//     });
//   }, [chain]);

//   // UI Components: Create Transaction Form
//   function CreateTxForm({ onCreate, dark }) {
//     const [from, setFrom] = useState("alice");
//     const [to, setTo] = useState("bob");
//     const [amount, setAmount] = useState(1);
//     const [fee, setFee] = useState(0.01);

//     return (
//       <div className="space-y-2">

//         {livePrice} 
//         <input
//           value={from}
//           onChange={(e) => setFrom(e.target.value)}
//           placeholder="From Address"
//           className={`w-full border rounded px-2 py-1 ${dark ? "bg-slate-800 border-slate-700" : ""}`}
//         />
//         <input
//           value={to}
//           onChange={(e) => setTo(e.target.value)}
//           placeholder="To Address"
//           className={`w-full border rounded px-2 py-1 ${dark ? "bg-slate-800 border-slate-700" : ""}`}
//         />
//         <div className="flex gap-2">
//           <input
//             type="number"
//             value={amount}
//             step="0.0001"
//             onChange={(e) => setAmount(Number(e.target.value))}
//             placeholder="Amount"
//             className={`flex-1 border rounded px-2 py-1 ${dark ? "bg-slate-800 border-slate-700" : ""}`}
//           />
//           <input
//             type="number"
//             value={fee}
//             step="0.0001"
//             onChange={(e) => setFee(Number(e.target.value))}
//             placeholder="Fee"
//             className={`w-28 border rounded px-2 py-1 ${dark ? "bg-slate-800 border-slate-700" : ""}`}
//           />
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => onCreate(from, to, amount, fee)}
//             className="flex-1 px-3 py-2 rounded bg-emerald-500 text-black"
//           >
//             Create TX
//           </button>
//           <button
//             onClick={() => {
//               setFrom("SYSTEM");
//               setTo("alice");
//               setAmount(1);
//               setFee(0);
//               onCreate("SYSTEM", "alice", 1, 0);
//             }}
//             className="px-3 py-2 rounded bg-amber-400"
//           >
//             Airdrop 1R
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Chart Card Component
//   function ChartCard({ title, data, dataKey, stroke, yLabel }) {
//     return (
//       <div className={`p-3 rounded-lg shadow-md ${dark ? "bg-slate-800/60" : "bg-white"}`} style={{ minHeight: 220 }}>
//         <h3 className="font-semibold mb-2">{title}</h3>
//         <ResponsiveContainer width="100%" height={180}>
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" />
//             <YAxis
//               domain={["auto", "auto"]}
//               tickFormatter={(val) =>
//                 yLabel === "USD"
//                   ? `$${val.toFixed(2)}`
//                   : yLabel === "Coins"
//                   ? val.toFixed(2)
//                   : val
//               }
//             />
//             <Tooltip
//               formatter={(value) =>
//                 yLabel === "USD"
//                   ? `$${value.toFixed(2)}`
//                   : yLabel === "Coins"
//                   ? value.toFixed(2)
//                   : value
//               }
//             />
//             <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`min-h-screen py-8 px-4 ${
//         dark ? "bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100" : "bg-gradient-to-b from-white to-slate-50 text-slate-900"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto">
//         {/* HEADER */}
//         <header className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-black font-extrabold text-3xl shadow-2xl">
//               R
//             </div>
//             <div>
//               <h1 className="text-3xl font-extrabold">R-Coin — Premium PoW Simulator</h1>
//               <p className="text-sm text-slate-400 mt-1">
//                 Pretty UI • Dark mode • Auto-mining • Fee priority • Halving • Live Price & Chart
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="text-right text-sm space-y-1">
//               <div>
//                 Difficulty: <span className="font-semibold">{difficulty}</span>
//               </div>
//               <div>
//                 Reward (base): <span className="font-semibold">{blockReward} R</span>
//               </div>
//               <div>
//                 Halving Interval: <span className="font-semibold">{halvingInterval} blocks</span>
//               </div>
//               <div>
//                 Miner: <span className="font-mono">{minerAddress}</span>{" "}
//                 <button
//                   onClick={genAddress}
//                   className="ml-2 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm"
//                   title="Generate new miner address"
//                 >
//                   ↻
//                 </button>
//               </div>
//             </div>
//             <button
//               onClick={() => setDark((d) => !d)}
//               className={`px-4 py-2 rounded-full ${dark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}
//             >
//               {dark ? "Light Mode" : "Dark Mode"}
//             </button>
//           </div>
//         </header>

//         {/* MAIN CONTROLS */}
//         <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className={`p-4 rounded-lg shadow-md ${dark ? "bg-slate-800/60" : "bg-white"}`}>
//             <h2 className="font-semibold mb-2">Mining Control</h2>
//             <button
//               onClick={mineBlockManual}
//               disabled={mining}
//               className={`w-full py-2 rounded mb-2 ${
//                 mining ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
//               } text-black font-bold`}
//             >
//               {mining ? "Mining..." : "Mine a Block"}
//             </button>
//             <button
//               onClick={() => setAutoMine((a) => !a)}
//               className={`w-full py-2 rounded mb-2 ${
//                 autoMine ? "bg-red-600 hover:bg-red-700" : "bg-blue-500 hover:bg-blue-600"
//               } text-white font-bold`}
//             >
//               {autoMine ? "Stop Auto-Mining" : "Start Auto-Mining"}
//             </button>
//             <button
//               onClick={resetAll}
//               className="w-full py-2 rounded bg-amber-500 hover:bg-amber-600 text-black font-bold"
//             >
//               Reset All
//             </button>

//             <div className="mt-4 text-sm space-y-1">
//               <div>Attempts: {attempts.toLocaleString()}</div>
//               <div>Last Nonce Found: {lastFoundNonce !== null ? lastFoundNonce : "-"}</div>
//               <div>Current Reward: {currentReward(chain.length)} R</div>
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg shadow-md ${dark ? "bg-slate-800/60" : "bg-white"}`}>
//             <h2 className="font-semibold mb-2">Create Transaction</h2>
//             <CreateTxForm onCreate={createTransaction} dark={dark} />
//           </div>

//           <div className={`p-4 rounded-lg shadow-md overflow-auto max-h-[350px] ${dark ? "bg-slate-800/60" : "bg-white"}`}>
//             <h2 className="font-semibold mb-2">Mempool ({mempool.length})</h2>
//             {mempool.length === 0 ? (
//               <p className="text-sm text-gray-500">No pending transactions</p>
//             ) : (
//               <ul className="text-sm space-y-1">
//                 {mempool.map((tx) => (
//                   <li key={tx.id} className="border-b border-slate-400/30 py-1">
//                     <div>
//                       <strong>{tx.from}</strong> → <strong>{tx.to}</strong>{" "}
//                       <span className="text-green-400 font-mono">{tx.amount} R</span>{" "}
//                       <span className="text-yellow-400 font-mono">fee: {tx.fee}</span>
//                     </div>
//                     <div className="text-xs text-slate-500">{new Date(tx.time).toLocaleTimeString()}</div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </section>

//         {/* BALANCES */}
//         <section className={`mb-8 p-4 rounded-lg shadow-md ${dark ? "bg-slate-800/60" : "bg-white"}`}>
//           <h2 className="font-semibold mb-2">Balances</h2>
//           {Object.keys(balances).length === 0 ? (
//             <p>No balances yet</p>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//               {Object.entries(balances).map(([addr, bal]) => (
//                 <div
//                   key={addr}
//                   className="p-2 rounded bg-slate-700/30 dark:bg-slate-300/10 flex justify-between"
//                 >
//                   <span className="font-mono">{addr}</span>
//                   <span>{bal.toFixed(4)} R</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Charts */}
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <ChartCard title="Live BTC Price (USD)" data={priceHistory} dataKey="price" stroke="#f7931a" yLabel="USD" />
//           <ChartCard title="Coins Mined Over Time" data={coinsMinedHistory} dataKey="coins" stroke="#22c55e" yLabel="Coins" />
//           <ChartCard title="Transaction Count Over Time" data={txCountHistory} dataKey="txs" stroke="#3b82f6" yLabel="Txs" />
//         </section>

//         {/* Chain info */}
//         <section className="mt-8 overflow-auto max-h-64">
//           <h2 className="font-semibold mb-2">Blockchain ({chain.length} blocks)</h2>
//           <ul className="text-xs font-mono space-y-2">
//             {chain.map((block) => (
//               <motion.li
//                 key={block.hash}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`p-2 rounded border ${
//                   dark ? "border-slate-700 bg-slate-900" : "border-slate-300 bg-white"
//                 }`}
//               >
//                 <div>
//                   <strong>#{block.index}</strong> nonce: {block.nonce} hash:{" "}
//                   <span className="break-all">{block.hash.slice(0, 16)}...</span>
//                 </div>
//                 <div>Prev: {block.prevHash.slice(0, 16)}...</div>
//                 <div>Tx Count: {block.transactions.length}</div>
//                 <div>Timestamp: {new Date(block.timestamp).toLocaleString()}</div>
//               </motion.li>
//             ))}
//           </ul>
//         </section>
//       </div>
//     </div>
//   );
// }










// // "use client";

// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import CryptoJS from "crypto-js";

// // // One-file, one-page Bitcoin-style demo with dark mode + crypto-js SHA256
// // export default function BitcoinStyleOnePage() {
// //   // UI & settings
// //   const [dark, setDark] = useState(() => {
// //     try { return localStorage.getItem("rcoin_dark") === "1"; } catch { return true; }
// //   });
// //   useEffect(() => { document.documentElement.classList.toggle("dark", dark); try { localStorage.setItem("rcoin_dark", dark ? "1" : "0"); } catch {} }, [dark]);

// //   const [difficulty, setDifficulty] = useState(3);
// //   const [blockReward, setBlockReward] = useState(12.5);
// //   const [mining, setMining] = useState(false);
// //   const [minerAddress, setMinerAddress] = useState("miner1");

// //   const [chain, setChain] = useState(() => [{ index:0, timestamp:new Date().toISOString(), prevHash:'0', nonce:0, transactions:[], hash:'0' }]);
// //   const [mempool, setMempool] = useState([]);

// //   // sha256 using crypto-js (synchronous)
// //   function sha256HexSync(msg) {
// //     return CryptoJS.SHA256(msg).toString(CryptoJS.enc.Hex);
// //   }

// //   // balances (simple account model)
// //   const balances = useMemo(() => {
// //     const b = {};
// //     chain.forEach(block => block.transactions.forEach(tx => {
// //       if (tx.from !== 'SYSTEM') b[tx.from] = (b[tx.from] || 0) - tx.amount;
// //       b[tx.to] = (b[tx.to] || 0) + tx.amount;
// //     }));
// //     return b;
// //   }, [chain]);

// //   function createTransaction(from, to, amount) {
// //     if (!from || !to || amount <= 0) return alert("সঠিক তথ্য দিন");
// //     if (from !== 'SYSTEM' && (balances[from] || 0) < amount) return alert("পর্যাপ্ত ব্যালান্স নেই");
// //     const tx = { id: Math.random().toString(36).slice(2,9), from, to, amount, time: new Date().toISOString() };
// //     setMempool(m => [tx, ...m]);
// //   }

// //   // mine using crypto-js in batches to keep UI responsive
// //   async function mineBlock() {
// //     if (mining) return;
// //     setMining(true);
// //     const index = chain.length;
// //     const prevHash = chain[chain.length -1].hash;
// //     const txs = [...mempool];
// //     const coinbase = { id: `coinbase-${Date.now()}`, from:'SYSTEM', to:minerAddress||'miner1', amount: Number(blockReward), time: new Date().toISOString() };
// //     const transactions = [coinbase, ...txs];
// //     let nonce = 0;
// //     const target = '0'.repeat(difficulty);
// //     const batchSize = 20000; // tune for responsiveness

// //     try {
// //       while (mining) {
// //         for (let i=0; i<batchSize; i++) {
// //           const data = `${index}|${prevHash}|${JSON.stringify(transactions)}|${nonce+i}`;
// //           const h = sha256HexSync(data);
// //           if (h.startsWith(target)) {
// //             const block = { index, timestamp: new Date().toISOString(), prevHash, nonce: nonce+i, transactions, hash: h };
// //             setChain(c => [...c, block]);
// //             setMempool(m => m.slice(txs.length));
// //             setMining(false);
// //             return;
// //           }
// //         }
// //         nonce += batchSize;
// //         // give browser breathing room
// //         await new Promise(r => setTimeout(r, 0));
// //       }
// //     } catch (e) {
// //       console.error(e);
// //       setMining(false);
// //     }
// //   }

// //   function stopMining() { setMining(false); }

// //   function addSampleTx() {
// //     const from = Math.random() > 0.5 ? 'alice' : 'bob';
// //     const to = Math.random() > 0.5 ? 'carol' : 'dave';
// //     const amt = Number((Math.random()*5 + 0.01).toFixed(4));
// //     createTransaction(from, to, amt);
// //   }

// //   function resetAll() {
// //     if (!confirm('সবকিছু রিসেট করবেন?')) return;
// //     setChain([{ index:0, timestamp:new Date().toISOString(), prevHash:'0', nonce:0, transactions:[], hash:'0' }]);
// //     setMempool([]);
// //   }

// //   // chain validity (sync using crypto-js)
// //   function checkChainValidity(aChain) {
// //     for (let i=1;i<aChain.length;i++){
// //       const block = aChain[i];
// //       const prev = aChain[i-1];
// //       const data = `${block.index}|${block.prevHash}|${JSON.stringify(block.transactions)}|${block.nonce}`;
// //       const h = sha256HexSync(data);
// //       if (h !== block.hash) return false;
// //       if (block.prevHash !== prev.hash) return false;
// //       if (!h.startsWith('0'.repeat(difficulty))) return false;
// //     }
// //     return true;
// //   }

// //   // small styled UI (Tailwind classes; add Tailwind to project)
// //   return (
// //     <div className={`min-h-screen transition-colors duration-200 ${dark ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-b from-slate-50 to-white text-slate-900'}`}>
// //       <div className="max-w-6xl mx-auto p-6">
// //         <header className="flex items-center justify-between mb-6">
// //           <div className="flex items-center gap-4">
// //             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-black font-extrabold shadow-lg">R</div>
// //             <div>
// //               <h1 className="text-2xl md:text-3xl font-extrabold">R-Coin — Bitcoin-style (One Page)</h1>
// //               <p className="text-sm text-slate-400">Proof-of-Work সিমুলেটর — crypto-js দ্বারা SHA256</p>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-4">
// //             <div className="text-right">
// //               <div className="text-xs">Difficulty: <span className="font-semibold">{difficulty}</span></div>
// //               <div className="text-sm">Block Reward: <span className="font-semibold">{blockReward} R</span></div>
// //             </div>
// //             <button onClick={() => setDark(d => !d)} className="px-3 py-2 rounded-full bg-slate-800 text-white border border-slate-700">{dark ? 'Light' : 'Dark'}</button>
// //           </div>
// //         </header>

// //         <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <section className={`md:col-span-2 p-4 rounded-2xl shadow ${dark ? 'bg-slate-800/60' : 'bg-white'}`}>
// //             <div className="flex items-center justify-between mb-4">
// //               <div>
// //                 <div className="text-sm text-slate-400">মাইনিং স্ট্যাটাস</div>
// //                 <div className={`text-2xl font-bold ${mining ? 'text-emerald-400' : (dark ? 'text-slate-200' : 'text-slate-800')}`}>{mining ? 'Mining…' : 'Idle'}</div>
// //               </div>

// //               <div className="flex gap-2">
// //                 <input value={minerAddress} onChange={(e)=>setMinerAddress(e.target.value)} className={`border rounded px-2 py-1 ${dark ? 'bg-slate-700 border-slate-600' : 'bg-white'}`} />
// //                 <button onClick={mineBlock} disabled={mining} className="px-3 py-1 rounded bg-amber-500 text-black font-semibold">Start Mine</button>
// //                 <button onClick={stopMining} disabled={!mining} className={`px-3 py-1 rounded ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>Stop</button>
// //               </div>
// //             </div>

// //             <div className="space-y-4">
// //               <div className="flex items-center gap-4">
// //                 <label className="text-sm text-slate-400">Difficulty</label>
// //                 <input type="range" min={1} max={6} value={difficulty} onChange={(e)=>setDifficulty(Number(e.target.value))} />
// //                 <span className="text-sm font-mono">{difficulty}</span>

// //                 <label className="ml-6 text-sm text-slate-400">Block Reward</label>
// //                 <input type="number" value={blockReward} step={0.1} onChange={(e)=>setBlockReward(Number(e.target.value))} className="w-28 border rounded px-2 py-1" />
// //               </div>

// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className={`p-3 rounded ${dark? 'bg-slate-900/40 border border-slate-700' : 'bg-slate-50'}`}>
// //                   <h3 className="font-semibold mb-2">Mempool (Pending TXs)</h3>
// //                   <div className="max-h-56 overflow-auto space-y-2">
// //                     {mempool.length===0 && <div className="text-sm text-slate-400">কোনো pending ট্রানজেকশন নেই</div>}
// //                     {mempool.map(tx => (
// //                       <div key={tx.id} className={`p-2 rounded ${dark? 'bg-slate-800/40 border border-slate-700' : 'bg-white border'}`}>
// //                         <div className="text-xs text-slate-400">{tx.id} • {new Date(tx.time).toLocaleTimeString()}</div>
// //                         <div className="flex justify-between items-center mt-1">
// //                           <div className="text-sm">{tx.from} → {tx.to}</div>
// //                           <div className="font-medium">{tx.amount} R</div>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>

// //                   <div className="mt-3 flex gap-2">
// //                     <button onClick={addSampleTx} className="px-3 py-1 rounded bg-emerald-500 text-black text-sm">Add random TX</button>
// //                     <button onClick={()=>createTransaction('alice','bob',1)} className="px-3 py-1 rounded bg-amber-500 text-black text-sm">Alice → Bob 1R</button>
// //                   </div>
// //                 </div>

// //                 <div className={`p-3 rounded ${dark? 'bg-slate-900/40 border border-slate-700' : 'bg-slate-50'}`}>
// //                   <h3 className="font-semibold mb-2">Balances</h3>
// //                   <div className="mt-2">
// //                     {Object.keys(balances).length===0 && <div className="text-sm text-slate-400">কেউই ব্যালান্স নেই — প্রথম ব্লক মিন করুন</div>}
// //                     {Object.entries(balances).map(([addr, bal]) => (
// //                       <div key={addr} className="flex justify-between text-sm py-1">
// //                         <div className="font-mono">{addr}</div>
// //                         <div className="font-medium">{bal} R</div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               </div>

// //               <div>
// //                 <h3 className="font-semibold mb-2">Block Explorer (Latest blocks)</h3>
// //                 <div className="max-h-72 overflow-auto space-y-3">
// //                   {chain.slice().reverse().map(b => (
// //                     <div key={b.hash + b.index} className={`p-3 rounded ${dark? 'bg-slate-800/50 border border-slate-700' : 'bg-white border'}`}>
// //                       <div className="flex justify-between text-xs text-slate-400">
// //                         <div>#{b.index}</div>
// //                         <div>{new Date(b.timestamp).toLocaleTimeString()}</div>
// //                       </div>
// //                       <div className="text-sm mt-1">hash: <span className="font-mono text-xs break-all">{b.hash}</span></div>
// //                       <div className="text-sm mt-1">prev: <span className="font-mono text-xs">{b.prevHash.slice(0,12)}</span></div>
// //                       <div className="text-sm mt-1">nonce: {b.nonce}</div>
// //                       <div className="text-sm mt-1">txs: {b.transactions.length}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>
// //           </section>

// //           <aside className={`p-4 rounded-2xl shadow flex flex-col gap-4 ${dark? 'bg-slate-900/60' : 'bg-white'}`}>
// //             <div>
// //               <h3 className="font-semibold">Create TX</h3>
// //               <CreateTxForm onCreate={(f,t,a)=>createTransaction(f,t,a)} dark={dark} />
// //             </div>

// //             <div>
// //               <h3 className="font-semibold">Quick Controls</h3>
// //               <div className="flex flex-col gap-2 mt-2">
// //                 <button onClick={mineBlock} className="px-3 py-2 rounded bg-amber-500 text-black">Mine single block</button>
// //                 <button onClick={()=>setMempool([])} className={`px-3 py-2 rounded ${dark? 'bg-slate-700' : 'bg-slate-100'}`}>Clear Mempool</button>
// //                 <button onClick={resetAll} className="px-3 py-2 rounded bg-red-500 text-white">Reset Chain</button>
// //               </div>
// //             </div>

// //             <div>
// //               <h3 className="font-semibold">Chain Validity</h3>
// //               <div className="mt-2 text-sm">
// //                 {checkChainValidity(chain) ? <div className="text-emerald-400">Chain is valid ✅</div> : <div className="text-red-400">Chain is INVALID ❌</div>}
// //               </div>
// //             </div>

// //             <div className="text-xs text-slate-400">Note: This is a local demo. No real blockchain or network involved.</div>
// //           </aside>
// //         </main>

// //         <footer className="mt-8 text-center text-xs text-slate-400">© Demo — R-Coin (crypto-js)</footer>
// //       </div>
// //     </div>
// //   );
// // }

// // function CreateTxForm({ onCreate, dark }) {
// //   const [from, setFrom] = useState('alice');
// //   const [to, setTo] = useState('bob');
// //   const [amount, setAmount] = useState(1);
// //   return (
// //     <div className="space-y-2">
// //       <input value={from} onChange={(e)=>setFrom(e.target.value)} className={`w-full border rounded px-2 py-1 ${dark? 'bg-slate-800 border-slate-700' : ''}`} />
// //       <input value={to} onChange={(e)=>setTo(e.target.value)} className={`w-full border rounded px-2 py-1 ${dark? 'bg-slate-800 border-slate-700' : ''}`} />
// //       <input type="number" value={amount} step="0.0001" onChange={(e)=>setAmount(Number(e.target.value))} className={`w-full border rounded px-2 py-1 ${dark? 'bg-slate-800 border-slate-700' : ''}`} />
// //       <button onClick={()=>onCreate(from,to,amount)} className="w-full px-3 py-2 rounded bg-emerald-500 text-black">Create TX</button>
// //     </div>
// //   );
// // }





// // "use client";

// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import { motion } from "framer-motion";
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   ResponsiveContainer,
// // } from "recharts";

// // export default function CryptoSimulatorOnePage() {
// //   // Coin basic info
// //   const COIN = useMemo(
// //     () => ({ name: "R Coin", symbol: "RCOIN", decimals: 8 }),
// //     []
// //   );

// //   // state
// //   const [price, setPrice] = useState(() => {
// //     // start price (BDT equivalent) — you can change
// //     return 125.5;
// //   });
// //   const [supply, setSupply] = useState(1000000); // total supply
// //   const [holdings, setHoldings] = useState(() => {
// //     try {
// //       const raw = localStorage.getItem("rcoin_holdings");
// //       return raw ? JSON.parse(raw) : 0;
// //     } catch {
// //       return 0;
// //     }
// //   });
// //   const [balanceBDT, setBalanceBDT] = useState(() => {
// //     try {
// //       const raw = localStorage.getItem("rcoin_bdt");
// //       return raw ? JSON.parse(raw) : 10000; // demo BDT wallet
// //     } catch {
// //       return 10000;
// //     }
// //   });

// //   // chart history
// //   const [history, setHistory] = useState(() => {
// //     const now = Date.now();
// //     const arr = Array.from({ length: 20 }).map((_, i) => ({
// //       time: new Date(now - (19 - i) * 1000).toLocaleTimeString(),
// //       price: +(125.5 + Math.sin(i / 3) * 3).toFixed(2),
// //     }));
// //     return arr;
// //   });

// //   const priceRef = useRef(price);
// //   priceRef.current = price;

// //   // simple random-walk price simulation
// //   useEffect(() => {
// //     const id = setInterval(() => {
// //       setPrice((p) => {
// //         // random small change
// //         const change = (Math.random() - 0.48) * (p * 0.008 + 0.2);
// //         const next = Math.max(0.01, +(p + change).toFixed(2));
// //         setHistory((h) => {
// //           const nextH = [...h.slice(-49), { time: new Date().toLocaleTimeString(), price: next }];
// //           return nextH;
// //         });
// //         return next;
// //       });
// //     }, 1000); // every second
// //     return () => clearInterval(id);
// //   }, []);

// //   // persist wallet
// //   useEffect(() => {
// //     try {
// //       localStorage.setItem("rcoin_holdings", JSON.stringify(holdings));
// //       localStorage.setItem("rcoin_bdt", JSON.stringify(balanceBDT));
// //     } catch (e) {
// //       // ignore
// //     }
// //   }, [holdings, balanceBDT]);

// //   // market cap
// //   const marketCap = useMemo(() => +(price * supply).toFixed(2), [price, supply]);

// //   // actions
// //   function buy(amountRcoin) {
// //     const cost = +(amountRcoin * price).toFixed(2);
// //     if (cost > balanceBDT) {
// //       alert("তোমার ব্যালান্স পর্যাপ্ত নেই");
// //       return;
// //     }
// //     setHoldings((h) => +(h + amountRcoin).toFixed(8));
// //     setBalanceBDT((b) => +(b - cost).toFixed(2));
// //     // small price impact when buying
// //     setPrice((p) => +Math.max(0.01, (p * (1 + Math.min(0.02, amountRcoin / supply)))).toFixed(2));
// //   }

// //   function sell(amountRcoin) {
// //     if (amountRcoin > holdings) {
// //       alert("তোমার কাছে এত কয়েন নেই");
// //       return;
// //     }
// //     const proceeds = +(amountRcoin * price).toFixed(2);
// //     setHoldings((h) => +(h - amountRcoin).toFixed(8));
// //     setBalanceBDT((b) => +(b + proceeds).toFixed(2));
// //     // price impact
// //     setPrice((p) => +Math.max(0.01, (p * (1 - Math.min(0.02, amountRcoin / supply)))).toFixed(2));
// //   }

// //   function mint(amount) {
// //     // only for demo — increases supply and gives user the minted amount
// //     setSupply((s) => s + Math.floor(amount));
// //     setHoldings((h) => +(h + amount).toFixed(8));
// //   }

// //   function resetDemo() {
// //     if (!confirm("সবকিছু রিসেট করতে চাও?")) return;
// //     setHoldings(0);
// //     setBalanceBDT(10000);
// //     setSupply(1000000);
// //     setPrice(125.5);
// //     setHistory((h) => h.slice(0, 20));
// //     localStorage.removeItem("rcoin_holdings");
// //     localStorage.removeItem("rcoin_bdt");
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 md:p-12 font-sans">
// //       <div className="max-w-5xl mx-auto">
// //         <header className="flex items-center justify-between mb-6">
// //           <div className="flex items-center gap-4">
// //             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
// //               {COIN.symbol}
// //             </div>
// //             <div>
// //               <h1 className="text-2xl md:text-3xl font-extrabold">{COIN.name} — এক পেজ সিমুলেটর</h1>
// //               <p className="text-sm text-slate-600">ক্রিপ্টো কয়েন ডেমো — সম্পূর্ণ লোকালি কাজ করে</p>
// //             </div>
// //           </div>

// //           <div className="text-right">
// //             <p className="text-sm text-slate-600">বিনিময় ব্যালান্স</p>
// //             <p className="font-semibold text-lg">৳ {balanceBDT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
// //           </div>
// //         </header>

// //         <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           {/* Left: chart */}
// //           <section className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
// //             <div className="flex items-center justify-between mb-3">
// //               <div>
// //                 <p className="text-sm text-slate-500">বর্তমান দাম</p>
// //                 <div className="flex items-baseline gap-3">
// //                   <h2 className="text-3xl font-bold">৳ {price.toFixed(2)}</h2>
// //                   <span className="text-sm text-slate-500">({COIN.symbol})</span>
// //                 </div>
// //               </div>

// //               <div className="text-right">
// //                 <p className="text-sm text-slate-500">মোট সাপ্লাই</p>
// //                 <p className="font-medium">{supply.toLocaleString()}</p>
// //                 <p className="text-xs text-slate-400">মার্কেট কেপ: ৳ {marketCap.toLocaleString()}</p>
// //               </div>
// //             </div>

// //             <div style={{ height: 260 }}>
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <LineChart data={history.slice(-50)}>
// //                   <XAxis dataKey="time" hide />
// //                   <YAxis domain={[dataMin => Math.floor(dataMin * 0.98), dataMax => Math.ceil(dataMax * 1.02)]} hide />
// //                   <Tooltip formatter={(value) => [`৳ ${value}`, 'Price']} />
// //                   <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={3} dot={false} />
// //                 </LineChart>
// //               </ResponsiveContainer>
// //             </div>

// //             <div className="mt-4 flex gap-2 items-center">
// //               <button onClick={() => buy(1)} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold shadow hover:opacity-90">
// //                 Buy 1 {COIN.symbol}
// //               </button>
// //               <button onClick={() => sell(1)} className="px-4 py-2 rounded-lg bg-slate-100 border hover:bg-slate-50">
// //                 Sell 1 {COIN.symbol}
// //               </button>

// //               <div className="ml-auto text-sm text-slate-600">নোট: এখানে দেখানো আচরণ সম্পূর্ণ সিমুলেটেড — বাস্তব ট্রেড নয়।</div>
// //             </div>
// //           </section>

// //           {/* Right: wallet & controls */}
// //           <aside className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-4">
// //             <div>
// //               <p className="text-sm text-slate-500">তোমার হোল্ডিংস</p>
// //               <h3 className="text-xl font-bold">{holdings} {COIN.symbol}</h3>
// //               <p className="text-sm text-slate-500">সমীকরণ: ৳ {(holdings * price).toFixed(2)}</p>
// //             </div>

// //             <div className="space-y-2">
// //               <label className="text-sm text-slate-600">মিন্ট (ডেমো)</label>
// //               <div className="flex gap-2">
// //                 <input id="mintAmount" type="number" defaultValue={10} min={0.00000001} step="0.00000001" className="flex-1 border rounded px-3 py-2" />
// //                 <button
// //                   onClick={() => {
// //                     const el = document.getElementById("mintAmount");
// //                     const val = el ? Number((el as HTMLInputElement).value) : 0;
// //                     if (val <= 0) return alert("ধন ঠিক দিন");
// //                     mint(val);
// //                   }}
// //                   className="px-3 py-2 rounded bg-emerald-500 text-white font-medium"
// //                 >
// //                   Mint
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <label className="text-sm text-slate-600">বাই/সেল - নির্দিষ্ট পরিমাণ</label>
// //               <div className="flex gap-2">
// //                 <input id="tradeAmount" type="number" defaultValue={1} min={0.00000001} step="0.00000001" className="flex-1 border rounded px-3 py-2" />
// //                 <button
// //                   onClick={() => {
// //                     const el = document.getElementById("tradeAmount");
// //                     const val = el ? Number((el as HTMLInputElement).value) : 0;
// //                     if (val <= 0) return alert("পরিমাণ সঠিক নয়");
// //                     buy(val);
// //                   }}
// //                   className="px-3 py-2 rounded bg-amber-500 text-white font-medium"
// //                 >
// //                   Buy
// //                 </button>
// //                 <button
// //                   onClick={() => {
// //                     const el = document.getElementById("tradeAmount");
// //                     const val = el ? Number((el as HTMLInputElement).value) : 0;
// //                     if (val <= 0) return alert("পরিমাণ সঠিক নয়");
// //                     sell(val);
// //                   }}
// //                   className="px-3 py-2 rounded bg-slate-100 border"
// //                 >
// //                   Sell
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="mt-auto flex flex-col gap-2">
// //               <button onClick={resetDemo} className="px-3 py-2 rounded bg-red-500 text-white font-medium">রিসেট ডেমো</button>

// //               <div className="text-xs text-slate-400">এই পেজটি লোকাল ডেমো — কোনো রিয়েল ব্লকচেইন মাইনার বা ট্রান্সফার হয় না।</div>
// //             </div>
// //           </aside>
// //         </main>

// //         <footer className="mt-8 text-center text-xs text-slate-500">© Demo — র কোইন সিমুলেটর</footer>
// //       </div>
// //     </div>
// //   );
// // }
