import React from 'react'

export default function bonshofarax() {
  return (
    <div>bonshofarax</div>
  )
}







// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion } from "framer-motion";
// import { ZoomIn, ZoomOut, RotateCcw, Sun, Moon, Download, Share2, Plus } from "lucide-react";
// import html2canvas from "html2canvas";

// type Member = {
//   id: number;
//   name: string;
//   note?: string;
//   parentId?: number | null;
// };

// export default function FamilyTreePro() {
//   const [dark, setDark] = useState(false);
//   const [members, setMembers] = useState<Member[]>([
//     { id: 1, name: "👑 দাদা", note: "Family Root", parentId: null },
//     { id: 2, name: "👨 বাবা", parentId: 1 },
//     { id: 3, name: "👩 মা", parentId: 1 },
//     { id: 4, name: "🧑 আমি", parentId: 2 },
//   ]);
//   const [selected, setSelected] = useState<number | null>(null);
//   const treeRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const saved = localStorage.getItem("theme");
//     if (saved === "dark") setDark(true);
//   }, []);

//   useEffect(() => {
//     if (dark) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [dark]);

//   // Add Member with prompt
//   const addMember = (type: "child" | "sibling") => {
//     if (!selected) return;
//     const name = prompt("নতুন সদস্যের নাম লিখুন:", type === "child" ? "👶 নতুন সদস্য" : "🧑 নতুন ভাই/বোন");
//     if (!name) return;
//     const newId = members.length + 1;

//     if (type === "child") {
//       setMembers([...members, { id: newId, name, parentId: selected }]);
//     } else if (type === "sibling") {
//       const sel = members.find((m) => m.id === selected);
//       if (sel?.parentId) {
//         setMembers([...members, { id: newId, name, parentId: sel.parentId }]);
//       }
//     }
//   };

//   // Download tree as image
//   const downloadTree = async () => {
//     if (!treeRef.current) return;
//     const canvas = await html2canvas(treeRef.current, { backgroundColor: dark ? "#0f172a" : "#f0fdf4" });
//     const dataUrl = canvas.toDataURL("image/png");
//     const link = document.createElement("a");
//     link.href = dataUrl;
//     link.download = "family_tree.png";
//     link.click();
//   };

//   // Share link
//   const shareTree = () => {
//     const data = encodeURIComponent(JSON.stringify(members));
//     const url = `${window.location.origin}/?tree=${data}`;
//     navigator.clipboard.writeText(url);
//     alert("Shareable link copied to clipboard!");
//   };

//   // Recursive Tree Builder
//   const buildTree = (parentId: number | null) => {
//     const children = members.filter((m) => m.parentId === parentId);
//     if (children.length === 0) return null;

//     return (
//       <div className="flex flex-col items-center relative mt-4">
//         {children.length > 1 && (
//           <div className="absolute top-12 left-0 w-full flex justify-between">
//             <div className="h-px bg-zinc-400 dark:bg-zinc-600 w-full" />
//           </div>
//         )}
//         <div className="flex gap-12 mt-4 relative">
//           {children.map((m) => (
//             <div key={m.id} className="flex flex-col items-center relative">
//               {parentId && <div className="w-px h-6 bg-zinc-400 dark:bg-zinc-600" />}
//               <motion.div
//                 onClick={() => setSelected(m.id)}
//                 className={`w-40 p-3 rounded-xl shadow-md border mb-4 cursor-pointer
//                   bg-white dark:bg-slate-800
//                   border-slate-300 dark:border-slate-700
//                   text-center
//                   ${selected === m.id ? "ring-2 ring-purple-500" : ""}
//                 `}
//               >
//                 <div className="font-semibold text-zinc-800 dark:text-zinc-200">{m.name}</div>
//                 {m.note && (
//                   <div className="text-xs text-zinc-500 dark:text-zinc-400">{m.note}</div>
//                 )}
//               </motion.div>
//               {buildTree(m.id)}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-sky-50 dark:from-[#0f172a] dark:to-[#1e293b] transition-colors">
//       {/* Header */}
//       <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b dark:border-slate-700">
//         <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
//           <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300">📜 বংশপুঞ্জি</h1>
//           <div className="flex gap-2">
//             <button
//               onClick={() => addMember("child")}
//               disabled={!selected}
//               className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
//             >
//               সন্তান যোগ করুন
//             </button>
//             <button
//               onClick={() => addMember("sibling")}
//               disabled={!selected}
//               className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
//             >
//               ভাই/বোন যোগ করুন
//             </button>
//             <button
//               onClick={() => setDark((d) => !d)}
//               className="rounded-full p-2 bg-slate-100 dark:bg-slate-800 hover:scale-105 transition"
//             >
//               {dark ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-700" />}
//             </button>
//             <button
//               onClick={downloadTree}
//               className="rounded-full p-2 bg-slate-100 dark:bg-slate-800 hover:scale-105 transition"
//             >
//               <Download className="w-5 h-5 text-slate-700 dark:text-slate-200" />
//             </button>
//             <button
//               onClick={shareTree}
//               className="rounded-full p-2 bg-slate-100 dark:bg-slate-800 hover:scale-105 transition"
//             >
//               <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-200" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Tree */}
//       <div className="flex-1 overflow-auto">
//         <TransformWrapper>
//           {({ zoomIn, zoomOut, resetTransform }) => (
//             <>
//               {/* Zoom Controls */}
//               <div className="absolute top-20 left-4 z-50 flex flex-col gap-2">
//                 <button onClick={zoomIn} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg shadow hover:scale-105">
//                   <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-200" />
//                 </button>
//                 <button onClick={zoomOut} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg shadow hover:scale-105">
//                   <ZoomOut className="w-5 h-5 text-slate-700 dark:text-slate-200" />
//                 </button>
//                 <button onClick={resetTransform} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg shadow hover:scale-105">
//                   <RotateCcw className="w-5 h-5 text-slate-700 dark:text-slate-200" />
//                 </button>
//               </div>

//               <TransformComponent>
//                 <div ref={treeRef} className="min-h-[2000px] min-w-[2000px] flex items-start justify-center py-20">
//                   {buildTree(null)}
//                 </div>
//               </TransformComponent>
//             </>
//           )}
//         </TransformWrapper>
//       </div>
//     </div>
//   );
// }











// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ZoomIn,
//   ZoomOut,
//   RefreshCcw,
//   Download,
//   Upload,
//   Trash2,
//   UserPlus,
//   PlusCircle,
//   Printer,
//   Edit3,
// } from "lucide-react";

// /**
//  * Family Tree - Complete component
//  * Features:
//  * - Zoom/Pan controls
//  * - SVG parent->child lines (arrows)
//  * - Add/Edit/Delete members
//  * - Add sibling
//  * - Photo upload (dataURL saved in localStorage)
//  * - LocalStorage persistence
//  * - Export/Import JSON, Reset
//  * - Print (use browser Print -> Save as PDF)
//  *
//  * Drop into Next.js app (client component). TailwindCSS recommended.
//  */

// type Member = {
//   id: string;
//   name: string;
//   parentId?: string | null;
//   spouseId?: string | null;
//   photo?: string | null; // dataURL or external URL
//   notes?: string;
// };

// const STORAGE_KEY = "family_tree_v2";

// const seedData = (): Member[] => [
//   { id: "1", name: "দাদা", photo: null },
//   { id: "2", name: "বাবা", parentId: "1", photo: null },
//   { id: "3", name: "চাচা", parentId: "1", photo: null },
//   { id: "4", name: "আমি", parentId: "2", photo: null },
// ];

// function uid() {
//   return Math.random().toString(36).slice(2, 9);
// }

// export default function FamilyTreePro() {
//   const [members, setMembers] = useState<Member[]>([]);
//   const [selected, setSelected] = useState<Member | null>(null);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const canvasRef = useRef<HTMLDivElement | null>(null);
//   const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const [isMobileMenu, setIsMobileMenu] = useState(false);

//   // load
//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) {
//         setMembers(JSON.parse(raw));
//       } else {
//         setMembers(seedData());
//       }
//     } catch {
//       setMembers(seedData());
//     }
//   }, []);

//   // save
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
//   }, [members]);

//   // Helpers
//   const upsertMember = (m: Member) => {
//     setMembers((prev) => {
//       const idx = prev.findIndex((x) => x.id === m.id);
//       if (idx === -1) return [...prev, m];
//       const copy = [...prev];
//       copy[idx] = m;
//       return copy;
//     });
//   };

//   const deleteMember = (id: string) => {
//     if (!confirm("আপনি কি সদস্য মুছে ফেলতে চান?")) return;
//     setMembers((prev) =>
//       prev
//         .filter((p) => p.id !== id)
//         .map((p) => ({
//           ...p,
//           parentId: p.parentId === id ? undefined : p.parentId,
//           spouseId: p.spouseId === id ? undefined : p.spouseId,
//         }))
//     );
//   };

//   const addChild = (parentId?: string | null) => {
//     const name = prompt("সন্তানের নাম লিখুন:");
//     if (!name) return;
//     const newM: Member = {
//       id: uid(),
//       name,
//       parentId: parentId ?? undefined,
//       photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
//     };
//     setMembers((p) => [...p, newM]);
//   };

//   const addSibling = (memberId: string) => {
//     const m = members.find((x) => x.id === memberId);
//     if (!m || !m.parentId) {
//       alert("এই সদস্যটির parent নেই — ভাই/বোন যোগ করার আগে parent যোগ করুন।");
//       return;
//     }
//     const name = prompt("ভাই/বোনের নাম লিখুন:");
//     if (!name) return;
//     const newM: Member = {
//       id: uid(),
//       name,
//       parentId: m.parentId,
//       photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
//     };
//     setMembers((p) => [...p, newM]);
//   };

//   // Export / Import / Reset / Print
//   const exportJson = () => {
//     const blob = new Blob([JSON.stringify(members, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `family-tree-${new Date().toISOString().slice(0, 10)}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const data = JSON.parse(String(reader.result));
//         if (Array.isArray(data)) setMembers(data);
//         else alert("Invalid file format");
//       } catch {
//         alert("Invalid JSON file");
//       }
//     };
//     reader.readAsText(file);
//   };

//   const resetAll = () => {
//     if (!confirm("সকল ডেটা মুছে ডিফল্ট সেট আপ করতে চান?")) return;
//     setMembers(seedData());
//   };

//   const printView = () => {
//     window.print();
//   };

//   // Photo upload for a member (save as dataURL)
//   const handlePhotoUpload = (file: File, memberId: string) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const data = String(reader.result || "");
//       setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, photo: data } : m)));
//     };
//     reader.readAsDataURL(file);
//   };

//   // Layout helpers: compute levels (simple BFS by parent links)
//   function useLevels(list: Member[]) {
//     const map = Object.fromEntries(list.map((m) => [m.id, m] as const));
//     // nodes with no parent are roots
//     const roots = list.filter((m) => !m.parentId);
//     const levels: Member[][] = [];
//     const visited = new Set<string>();
//     const q: { node: Member; level: number }[] = roots.map((r) => ({ node: r, level: 0 }));

//     while (q.length) {
//       const { node, level } = q.shift()!;
//       if (!levels[level]) levels[level] = [];
//       if (!visited.has(node.id)) {
//         levels[level].push(node);
//         visited.add(node.id);
//         // children (those whose parentId === node.id)
//         list.filter((c) => c.parentId === node.id).forEach((c) => q.push({ node: c, level: level + 1 }));
//       }
//     }

//     // Orphans (not visited)
//     const orphans = list.filter((m) => !visited.has(m.id));
//     if (orphans.length) levels.push(orphans);

//     return { levels, map };
//   }

//   const { levels, map } = useLevels(members);

//   // Build lines using node bounding boxes relative to canvas
//   const computeLines = () => {
//     const out: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
//     if (!canvasRef.current) return out;
//     const canvasRect = canvasRef.current.getBoundingClientRect();

//     members.forEach((m) => {
//       if (!m.parentId) return;
//       const parentEl = nodeRefs.current[m.parentId];
//       const childEl = nodeRefs.current[m.id];
//       if (!parentEl || !childEl) return;
//       const pr = parentEl.getBoundingClientRect();
//       const cr = childEl.getBoundingClientRect();
//       // coordinates relative to canvas container (which shares the same transformed space)
//       const x1 = pr.left + pr.width / 2 - canvasRect.left;
//       const y1 = pr.top + pr.height - canvasRect.top; // bottom of parent
//       const x2 = cr.left + cr.width / 2 - canvasRect.left;
//       const y2 = cr.top - canvasRect.top; // top of child
//       out.push({ x1, y1, x2, y2, key: `${m.parentId}->${m.id}` });
//     });

//     return out;
//   };

//   const lines = computeLines();

//   // Search highlight: set contains
//   const filteredIds = new Set(
//     query.trim()
//       ? members.filter((m) => `${m.name} ${m.notes ?? ""}`.toLowerCase().includes(query.toLowerCase())).map((m) => m.id)
//       : []
//   );

//   // Form component (Add/Edit)
//   function MemberForm({
//     initial,
//     onClose,
//     onSave,
//   }: {
//     initial?: Member | null;
//     onClose: () => void;
//     onSave: (m: Member) => void;
//   }) {
//     const [form, setForm] = useState<Member>(
//       initial ?? { id: uid(), name: "", parentId: undefined, photo: null, notes: undefined }
//     );

//     useEffect(() => {
//       if (initial) setForm(initial);
//     }, [initial]);

//     return (
//       <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
//         <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold">{initial ? "সদস্য সম্পাদনা" : "নতুন সদস্য"}</h3>
//             <button onClick={onClose} className="text-zinc-600">✕</button>
//           </div>

//           <div className="grid gap-3">
//             <label className="text-sm">
//               নাম
//               <input className="mt-1 w-full rounded-md border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
//             </label>

//             <label className="text-sm">
//               প্যারেন্ট (বাবা/মা) — যদি না থাকে খালি রাখুন
//               <select className="mt-1 w-full rounded-md border px-3 py-2" value={form.parentId ?? ""} onChange={(e) => setForm({ ...form, parentId: e.target.value || undefined })}>
//                 <option value="">— None —</option>
//                 {members.filter((x) => x.id !== form.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
//               </select>
//             </label>

//             <label className="text-sm">
//               নোট (ঐচ্ছিক)
//               <textarea className="mt-1 w-full rounded-md border px-3 py-2" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
//             </label>

//             <div className="flex items-center gap-2">
//               <label className="inline-flex items-center gap-2 cursor-pointer">
//                 <input type="file" accept="image/*" className="hidden" onChange={(e) => {
//                   const file = e.target.files?.[0]; if (!file) return;
//                   const reader = new FileReader();
//                   reader.onload = () => setForm({ ...form, photo: String(reader.result) });
//                   reader.readAsDataURL(file);
//                 }} />
//                 <span className="rounded-xl border px-3 py-2">Upload Photo</span>
//               </label>

//               {form.photo && <img src={form.photo} alt="preview" className="w-14 h-14 rounded-full object-cover border" />}
//             </div>

//             <div className="flex justify-end gap-2">
//               <button className="rounded-md border px-4 py-2" onClick={onClose}>Cancel</button>
//               <button className="rounded-md bg-emerald-600 text-white px-4 py-2" onClick={() => { if (!form.name.trim()) { alert("নাম দিন"); return; } onSave(form); onClose(); }}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   // small utility: center viewport (use TransformWrapper's instance via DOM + CSS not exposed here)
//   // We'll rely on user zoom/pan controls.

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-sky-50">
//       {/* Header */}
//       <div className="sticky top-0 z-40 bbg-black/40 backdrop-blur border-b">
//         <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
//           <div>
//             <h1 className="text-2xl font-bold text-purple-700">📜 বংশপুঞ্জি</h1>
//             <div className="text-xs text-zinc-500">Zoom • Pan • Photo • Save • Print</div>
//           </div>

//           <div className="hidden md:flex items-center gap-2">
//             <input placeholder="Search name..." value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-full border px-3 py-1 text-sm w-60" />

//             <button title="Add root member" onClick={() => { setSelected(null); setIsFormOpen(true); }} className="rounded-full bg-emerald-600 text-white px-3 py-1.5 flex items-center gap-2">
//               <PlusCircle size={16} /> Add
//             </button>

//             <div className="inline-flex items-center gap-1 rounded-xl border px-2 py-1">
//               <button onClick={exportJson} className="px-2 hover:bg-zinc-50"><Download size={16} /></button>
//               <label className="cursor-pointer px-2 hover:bg-zinc-50">
//                 <Upload size={16} />
//                 <input type="file" accept="application/json" onChange={importJson} className="hidden" />
//               </label>
//               <button onClick={printView} className="px-2 hover:bg-zinc-50"><Printer size={16} /></button>
//               <button onClick={resetAll} className="px-2 hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
//             </div>
//           </div>

//           {/* mobile menu */}
//           <div className="md:hidden">
//             <button onClick={() => setIsMobileMenu((s) => !s)} className="rounded-full border px-3 py-1">Menu</button>
//           </div>
//         </div>

//         {isMobileMenu && (
//           <div className="md:hidden border-t bg-white/90 p-3">
//             <div className="flex gap-2">
//               <input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-full border px-3 py-2" />
//               <button onClick={() => { setSelected(null); setIsFormOpen(true); }} className="rounded-full bg-emerald-600 text-white px-4">Add</button>
//             </div>
//             <div className="flex gap-2 mt-2">
//               <button onClick={exportJson} className="rounded-xl border px-3 py-2 w-full">Export</button>
//               <label className="rounded-xl border px-3 py-2 w-full text-center cursor-pointer">
//                 Import<input type="file" accept="application/json" onChange={importJson} className="hidden" />
//               </label>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Canvas + Controls */}
//       <div className="flex-1 overflow-hidden">
//         <TransformWrapper initialScale={0.95} minScale={0.4} maxScale={3} wheel={{ step: 0.08 }}>
//           {({ zoomIn, zoomOut, resetTransform }) => (
//             <>
//               {/* Controls */}
//               <div className="absolute z-30 right-4 top-28 flex flex-col gap-2">
//                 <button onClick={() => zoomIn()} title="Zoom in" className="rounded-lg bg-white p-2 shadow-md"><ZoomIn /></button>
//                 <button onClick={() => zoomOut()} title="Zoom out" className="rounded-lg bg-white p-2 shadow-md"><ZoomOut /></button>
//                 <button onClick={() => resetTransform()} title="Reset view" className="rounded-lg bg-white p-2 shadow-md"><RefreshCcw /></button>
//               </div>

//               <TransformComponent>
//                 <div ref={canvasRef} className="relative w-full min-h-[70vh] flex items-start justify-center py-10 px-6">
//                   {/* SVG Layer (absolute inside the same transformed container) */}
//                   <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
//                     <defs>
//                       <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
//                         <stop offset="0%" stopColor="#8b5cf6" />
//                         <stop offset="100%" stopColor="#ec4899" />
//                       </linearGradient>
//                       <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
//                         <path d="M0 0 L9 4 L0 8 z" fill="url(#g1)" />
//                       </marker>
//                     </defs>

//                     {/* Lines */}
//                     {lines.map((l) => (
//                       <g key={l.key}>
//                         <path d={`M ${l.x1} ${l.y1} C ${l.x1} ${(l.y1 + l.y2) / 2} ${l.x2} ${(l.y1 + l.y2) / 2} ${l.x2} ${l.y2}`} stroke="url(#g1)" strokeWidth={2.5} fill="none" markerEnd="url(#arrow)" />
//                       </g>
//                     ))}
//                   </svg>

//                   {/* Tree layout: levels */}
//                   <div className="w-full max-w-[1400px]">
//                     {levels.map((row, i) => (
//                       <div key={i} className="flex flex-wrap justify-center gap-8 mb-10">
//                         {row.map((m) => {
//                           const isHighlighted = filteredIds.has(m.id);
//                           return (
//                             <div key={m.id} ref={(el) => (nodeRefs.current[m.id] = el)} className="relative">
//                               <motion.div whileHover={{ scale: 1.03 }} className={`w-48 bg-white rounded-2xl p-3 shadow-xl border-2 ${isHighlighted ? "border-emerald-400 ring-2 ring-emerald-200" : "border-transparent"}`}>
//                                 <div className="flex items-center gap-3">
//                                   <img src={m.photo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} alt={m.name} className="w-14 h-14 rounded-full object-cover border" />
//                                   <div className="min-w-0">
//                                     <div className="font-semibold text-zinc-800 truncate">{m.name}</div>
//                                     <div className="text-xs text-zinc-500">{m.notes ?? ""}</div>
//                                   </div>
//                                 </div>

//                                 <div className="mt-3 flex items-center justify-between gap-2">
//                                   <button title="Add child" onClick={() => addChild(m.id)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white text-sm">
//                                     <PlusCircle size={14} /> child
//                                   </button>

//                                   <div className="flex items-center gap-1">
//                                     <button title="Add sibling" onClick={() => addSibling(m.id)} className="rounded-full bg-sky-500 p-1 text-white"><UserPlus size={14} /></button>
//                                     <button title="Edit" onClick={() => { setSelected(m); setIsFormOpen(true); }} className="rounded-full bg-zinc-100 p-1"><Edit3 size={14} /></button>
//                                     <button title="Delete" onClick={() => deleteMember(m.id)} className="rounded-full bg-red-50 p-1 text-red-600"><Trash2 size={14} /></button>
//                                   </div>
//                                 </div>
//                               </motion.div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </TransformComponent>
//             </>
//           )}
//         </TransformWrapper>
//       </div>

//       {/* Footer quick actions (mobile friendly) */}
//       <div className="border-t bg-white/90 p-3 sticky bottom-0">
//         <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
//           <div className="flex items-center gap-2">
//             <button onClick={() => { setSelected(null); setIsFormOpen(true); }} className="rounded-xl bg-emerald-600 text-white px-3 py-2 flex items-center gap-2"><PlusCircle /> Add</button>
//             <button onClick={exportJson} className="rounded-xl border px-3 py-2 flex items-center gap-2"><Download /> Export</button>
//             <label className="rounded-xl border px-3 py-2 flex items-center gap-2 cursor-pointer">
//               <Upload /> Import
//               <input type="file" accept="application/json" onChange={importJson} className="hidden" />
//             </label>
//           </div>

//           <div className="flex items-center gap-2">
//             <button onClick={printView} className="rounded-xl border px-3 py-2 flex items-center gap-2"><Printer /> Print</button>
//             <button onClick={resetAll} className="rounded-xl border px-3 py-2 text-red-600"><Trash2 /> Reset</button>
//           </div>
//         </div>
//       </div>

//       {/* Form modal */}
//       <AnimatePresence>
//         {isFormOpen && (
//           <MemberForm
//             initial={selected}
//             onClose={() => { setIsFormOpen(false); setSelected(null); }}
//             onSave={(m) => {
//               // if editing existing, keep id; else add new
//               if (members.some((x) => x.id === m.id)) upsertMember(m);
//               else setMembers((p) => [...p, m]);
//             }}
//           />
//         )}
//       </AnimatePresence>

//       <style>{`
//         @media print {
//           body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           input, button, label { display: none !important; }
//           svg, .w-full.max-w-[1400px] { position: static !important; transform: none !important; }
//         }
//       `}</style>
//     </div>
//   );
// }











// "use client";

// import { useState, useRef, useEffect } from "react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion } from "framer-motion";
// import { UserPlus, PlusCircle } from "lucide-react";

// interface Member {
//   id: string;
//   name: string;
//   parentId?: string;
//   photo?: string;
// }

// const initialFamily: Member[] = [
//   { id: "1", name: "দাদা" },
//   { id: "2", name: "বাবা", parentId: "1" },
//   { id: "3", name: "চাচা", parentId: "1" },
//   { id: "4", name: "আমি", parentId: "2" },
// ];

// export default function FamilyTree() {
//   const [family, setFamily] = useState<Member[]>(initialFamily);
//   const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const [lines, setLines] = useState<{ from: string; to: string }[]>([]);

//   // নতুন সদস্য যোগ
//   const addMember = (parentId?: string) => {
//     const name = prompt("সদস্যের নাম লিখুন:");
//     if (!name) return;
//     const newMember: Member = {
//       id: Date.now().toString(),
//       name,
//       parentId,
//       photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
//         name
//       )}&background=random`,
//     };
//     setFamily((prev) => [...prev, newMember]);
//   };

//   // ভাই/বোন যোগ করা
//   const addSibling = (memberId: string) => {
//     const member = family.find((m) => m.id === memberId);
//     if (!member || !member.parentId) {
//       alert("ভাই/বোন যোগ করার জন্য আগে parent থাকতে হবে।");
//       return;
//     }
//     const name = prompt("ভাই/বোনের নাম লিখুন:");
//     if (!name) return;
//     const newSibling: Member = {
//       id: Date.now().toString(),
//       name,
//       parentId: member.parentId,
//       photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(
//         name
//       )}&background=random`,
//     };
//     setFamily((prev) => [...prev, newSibling]);
//   };

//   // লাইন ড্র করার জন্য parent-child সম্পর্ক বের করা
//   useEffect(() => {
//     const newLines: { from: string; to: string }[] = [];
//     family.forEach((member) => {
//       if (member.parentId) {
//         newLines.push({ from: member.parentId, to: member.id });
//       }
//     });
//     setLines(newLines);
//   }, [family]);

//   // ট্রী রেন্ডার
//   const renderTree = (parentId?: string) => {
//     const members = family.filter((m) => m.parentId === parentId);
//     if (!members.length) return null;

//     return (
//       <div className="flex justify-center gap-12 mt-12 flex-wrap relative">
//         {members.map((member) => (
//           <motion.div
//             key={member.id}
//             ref={(el) => (nodeRefs.current[member.id] = el)}
//             className="flex flex-col items-center relative"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <div className="bg-white border-4 border-purple-500 rounded-2xl shadow-xl p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300 relative group">
//               <img
//                 src={
//                   member.photo ||
//                   `https://ui-avatars.com/api/?name=${member.name}`
//                 }
//                 alt={member.name}
//                 className="w-20 h-20 rounded-full border-2 border-purple-400 shadow-md mb-2"
//               />
//               <span className="font-bold text-gray-800 text-lg">
//                 {member.name}
//               </span>

//               {/* সন্তান যোগ */}
//               <button
//                 onClick={() => addMember(member.id)}
//                 className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full p-2 shadow-md hover:bg-green-600 transition"
//                 title="সন্তান যোগ করুন"
//               >
//                 <PlusCircle size={18} />
//               </button>

//               {/* ভাই/বোন যোগ */}
//               <button
//                 onClick={() => addSibling(member.id)}
//                 className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-2 shadow-md hover:bg-blue-600 transition"
//                 title="ভাই/বোন যোগ করুন"
//               >
//                 <UserPlus size={16} />
//               </button>
//             </div>

//             {renderTree(member.id)}
//           </motion.div>
//         ))}
//       </div>
//     );
//   };

//   // SVG Lines
//   const renderLines = () => {
//     const elements: JSX.Element[] = [];
//     lines.forEach(({ from, to }, i) => {
//       const fromNode = nodeRefs.current[from];
//       const toNode = nodeRefs.current[to];
//       if (fromNode && toNode) {
//         const fromRect = fromNode.getBoundingClientRect();
//         const toRect = toNode.getBoundingClientRect();
//         const x1 = fromRect.left + fromRect.width / 2 + window.scrollX;
//         const y1 = fromRect.bottom + window.scrollY;
//         const x2 = toRect.left + toRect.width / 2 + window.scrollX;
//         const y2 = toRect.top + window.scrollY;

//         elements.push(
//           <line
//             key={i}
//             x1={x1}
//             y1={y1}
//             x2={x2}
//             y2={y2}
//             stroke="#9333ea"
//             strokeWidth="2"
//             markerEnd="url(#arrowhead)"
//           />
//         );
//       }
//     });
//     return elements;
//   };

//   return (
//     <div className="w-full h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center overflow-hidden">
//       <h1 className="text-3xl font-extrabold my-6 text-purple-700 drop-shadow-lg">
//         📜 আমাদের বংশপুঞ্জি
//       </h1>

//       <TransformWrapper initialScale={1} minScale={0.5} maxScale={3} centerOnInit>
//         <TransformComponent>
//           <div className="relative p-10">
//             {/* SVG Layer */}
//             <svg
//               className="absolute top-0 left-0 w-full h-full pointer-events-none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <defs>
//                 <marker
//                   id="arrowhead"
//                   markerWidth="10"
//                   markerHeight="7"
//                   refX="5"
//                   refY="3.5"
//                   orient="auto"
//                 >
//                   <polygon points="0 0, 10 3.5, 0 7" fill="#9333ea" />
//                 </marker>
//               </defs>
//               {renderLines()}
//             </svg>

//             {/* Tree Nodes */}
//             {renderTree()}
//           </div>
//         </TransformComponent>
//       </TransformWrapper>
//     </div>
//   );
// }
















// "use client";

// import { useState } from "react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion } from "framer-motion";
// import { UserPlus, PlusCircle } from "lucide-react";

// // সদস্য টাইপ
// interface Member {
//   id: string;
//   name: string;
//   parentId?: string; // বাবা-মা আইডি
//   spouseId?: string;
// }

// // ডেমো ডেটা
// const initialFamily: Member[] = [
//   { id: "1", name: "দাদা" },
//   { id: "2", name: "বাবা", parentId: "1" },
//   { id: "3", name: "চাচা", parentId: "1" },
//   { id: "4", name: "আমি", parentId: "2" },
// ];

// export default function FamilyTree() {
//   const [family, setFamily] = useState<Member[]>(initialFamily);

//   // নতুন সদস্য যোগ
//   const addMember = (parentId?: string) => {
//     const name = prompt("সদস্যের নাম লিখুন:");
//     if (!name) return;
//     const newMember: Member = {
//       id: Date.now().toString(),
//       name,
//       parentId,
//     };
//     setFamily([...family, newMember]);
//   };

//   // Sibling যোগ করা
//   const addSibling = (memberId: string) => {
//     const member = family.find((m) => m.id === memberId);
//     if (!member || !member.parentId) {
//       alert("ভাই/বোন যোগ করার জন্য আগে parent থাকতে হবে।");
//       return;
//     }
//     const name = prompt("ভাই/বোনের নাম লিখুন:");
//     if (!name) return;
//     const newSibling: Member = {
//       id: Date.now().toString(),
//       name,
//       parentId: member.parentId,
//     };
//     setFamily([...family, newSibling]);
//   };

//   // ট্রী রেন্ডার
//   const renderTree = (parentId?: string) => {
//     const members = family.filter((m) => m.parentId === parentId);
//     if (!members.length) return null;

//     return (
//       <div className="flex justify-center gap-8 mt-6">
//         {members.map((member) => (
//           <motion.div
//             key={member.id}
//             className="flex flex-col items-center"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-2xl shadow-lg relative">
//               <span className="font-bold">{member.name}</span>
//               <button
//                 onClick={() => addMember(member.id)}
//                 className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-green-500 rounded-full p-1 shadow-md"
//               >
//                 <PlusCircle size={18} />
//               </button>
//               <button
//                 onClick={() => addSibling(member.id)}
//                 className="absolute -top-3 -right-3 bg-blue-500 rounded-full p-1 shadow-md"
//               >
//                 <UserPlus size={16} />
//               </button>
//             </div>
//             {renderTree(member.id)}
//           </motion.div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="w-full h-screen bg-gray-100 flex flex-col items-center">
//       <h1 className="text-2xl font-bold my-4">📜 আমাদের বংশপুঞ্জি</h1>

//       <TransformWrapper initialScale={1} minScale={0.5} maxScale={3} centerOnInit>
//         <TransformComponent>
//           <div className="p-10">{renderTree()}</div>
//         </TransformComponent>
//       </TransformWrapper>
//     </div>
//   );
// }






// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   Download,
//   Upload,
//   Search,
//   Users,
//   Printer,
//   Trash2,
//   RefreshCcw,
//   Heart,
//   Link as LinkIcon,
// } from "lucide-react";

// /**
//  * Family Tree (বংশপুঞ্জি) – Next.js client component
//  * ---------------------------------------------------
//  * Drop this file into any page (e.g. app/family/page.tsx) and export default.
//  * TailwindCSS recommended. Uses localStorage for persistence (no backend).
//  *
//  * Features:
//  * - Add/Edit/Delete members (name, gender, birth year, photo URL, notes)
//  * - Define relationships: parents (up to 2), spouse
//  * - Auto layout by generations (simple BFS from roots)
//  * - Pan & Zoom canvas, animated cards, SVG relationship lines
//  * - Search & highlight
//  * - Export/Import JSON, Reset, Print view
//  */

// // Types
// export type Gender = "male" | "female" | "other";
// export type PersonId = string;

// export interface Person {
//   id: PersonId;
//   name: string;
//   gender?: Gender;
//   birthYear?: string;
//   photoUrl?: string;
//   notes?: string;
//   parentIds: PersonId[]; // 0..2
//   spouseId?: PersonId | null;
// }

// // Utils
// const uid = () => Math.random().toString(36).slice(2, 10);
// const STORAGE_KEY = "family_tree_data_v1";

// // Seed example
// const demoSeed = (): Person[] => {
//   const a: Person = {
//     id: uid(),
//     name: "দাদু (Abdul Karim)",
//     gender: "male",
//     birthYear: "1945",
//     parentIds: [],
//   };
//   const b: Person = {
//     id: uid(),
//     name: "দাদি (Rahima)",
//     gender: "female",
//     birthYear: "1950",
//     parentIds: [],
//   };
//   // spouse link
//   a.spouseId = b.id;
//   b.spouseId = a.id;

//   const c: Person = {
//     id: uid(),
//     name: "বাবা (Jamal)",
//     gender: "male",
//     birthYear: "1972",
//     parentIds: [a.id, b.id],
//   };
//   const d: Person = {
//     id: uid(),
//     name: "মা (Nasima)",
//     gender: "female",
//     birthYear: "1976",
//     parentIds: [],
//   };
//   c.spouseId = d.id;
//   d.spouseId = c.id;

//   const e: Person = {
//     id: uid(),
//     name: "আমি (You)",
//     gender: "other",
//     birthYear: "2000",
//     parentIds: [c.id, d.id],
//   };

//   return [a, b, c, d, e];
// };

// // Card component
// function PersonCard({
//   p,
//   onEdit,
//   onDelete,
//   highlight,
// }: {
//   p: Person;
//   onEdit: (p: Person) => void;
//   onDelete: (id: string) => void;
//   highlight?: boolean;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10, scale: 0.98 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       whileHover={{ y: -2 }}
//       className={`group relative w-64 max-w-[16rem] rounded-2xl border bg-white/80 p-4 shadow-lg backdrop-blur 
//         dark:bg-zinc-900/80 dark:border-zinc-800 ${
//           highlight ? "ring-2 ring-emerald-500" : ""
//         }`}
//     >
//       <div className="flex items-center gap-3">
//         <div className="h-14 w-14 overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
//           {p.photoUrl ? (
//             // Using img for portability; replace with next/image if desired
//             <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center text-2xl">
//               <Users className="h-7 w-7 opacity-70" />
//             </div>
//           )}
//         </div>
//         <div className="min-w-0">
//           <div className="truncate text-lg font-semibold">{p.name}</div>
//           <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.gender ?? "—"} {p.birthYear ? `• ${p.birthYear}` : ""}</div>
//         </div>
//       </div>

//       {p.notes ? (
//         <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{p.notes}</p>
//       ) : null}

//       <div className="mt-3 flex gap-2">
//         <button
//           onClick={() => onEdit(p)}
//           className="rounded-xl border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
//         >
//           Edit
//         </button>
//         <button
//           onClick={() => onDelete(p.id)}
//           className="rounded-xl border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
//         >
//           Delete
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // Form modal
// function PersonForm({
//   open,
//   onClose,
//   onSave,
//   people,
//   editing,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSave: (p: Person) => void;
//   people: Person[];
//   editing?: Person | null;
// }) {
//   const [form, setForm] = useState<Person>(
//     editing ?? { id: uid(), name: "", gender: "other", parentIds: [] }
//   );
//   const [parentA, parentB] = form.parentIds;

//   useEffect(() => {
//     if (editing) setForm(editing);
//   }, [editing, open]);

//   function save() {
//     // clamp parents to max 2
//     const uniqueParents = Array.from(new Set(form.parentIds)).slice(0, 2);
//     onSave({ ...form, parentIds: uniqueParents });
//     onClose();
//   }

//   function option(label: string, value?: string) {
//     return (
//       <option key={value ?? ""} value={value ?? ""}>
//         {label}
//       </option>
//     );
//   }

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 10, opacity: 0 }}
//             className="w-full max-w-2xl rounded-3xl border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
//           >
//             <div className="mb-3 flex items-center justify-between">
//               <h3 className="text-xl font-semibold">
//                 {editing ? "সদস্য এডিট করুন" : "নতুন সদস্য যোগ করুন"}
//               </h3>
//               <button
//                 onClick={onClose}
//                 className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="grid gap-3 md:grid-cols-2">
//               <label className="grid gap-1 text-sm">
//                 <span>নাম</span>
//                 <input
//                   className="rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   placeholder="পূর্ণ নাম"
//                 />
//               </label>

//               <label className="grid gap-1 text-sm">
//                 <span>লিঙ্গ</span>
//                 <select
//                   className="rounded-xl border bg-transparent px-3 py-2 dark:border-zinc-700"
//                   value={form.gender ?? "other"}
//                   onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
//                 >
//                   {option("পুরুষ", "male")}
//                   {option("মহিলা", "female")}
//                   {option("অন্যান্য", "other")}
//                 </select>
//               </label>

//               <label className="grid gap-1 text-sm">
//                 <span>জন্ম সাল</span>
//                 <input
//                   className="rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700"
//                   value={form.birthYear ?? ""}
//                   onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
//                   placeholder="YYYY"
//                 />
//               </label>

//               <label className="grid gap-1 text-sm">
//                 <span>ছবির URL</span>
//                 <input
//                   className="rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700"
//                   value={form.photoUrl ?? ""}
//                   onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
//                   placeholder="https://..."
//                 />
//               </label>

//               <label className="md:col-span-2 grid gap-1 text-sm">
//                 <span>নোট</span>
//                 <textarea
//                   className="min-h-[80px] rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700"
//                   value={form.notes ?? ""}
//                   onChange={(e) => setForm({ ...form, notes: e.target.value })}
//                   placeholder="অতিরিক্ত তথ্য"
//                 />
//               </label>

//               {/* Relationships */}
//               <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
//                 <label className="grid gap-1 text-sm">
//                   <span>Parent A</span>
//                   <select
//                     className="rounded-xl border bg-transparent px-3 py-2 dark:border-zinc-700"
//                     value={parentA ?? ""}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         parentIds: [e.target.value || undefined, parentB].filter(Boolean) as string[],
//                       })
//                     }
//                   >
//                     {option("—", "")}
//                     {people
//                       .filter((x) => x.id !== form.id)
//                       .map((x) => option(x.name, x.id))}
//                   </select>
//                 </label>

//                 <label className="grid gap-1 text-sm">
//                   <span>Parent B</span>
//                   <select
//                     className="rounded-xl border bg-transparent px-3 py-2 dark:border-zinc-700"
//                     value={parentB ?? ""}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         parentIds: [parentA, e.target.value || undefined].filter(Boolean) as string[],
//                       })
//                     }
//                   >
//                     {option("—", "")}
//                     {people
//                       .filter((x) => x.id !== form.id)
//                       .map((x) => option(x.name, x.id))}
//                   </select>
//                 </label>

//                 <label className="grid gap-1 text-sm">
//                   <span>Spouse</span>
//                   <select
//                     className="rounded-xl border bg-transparent px-3 py-2 dark:border-zinc-700"
//                     value={form.spouseId ?? ""}
//                     onChange={(e) =>
//                       setForm({ ...form, spouseId: e.target.value || undefined })
//                     }
//                   >
//                     {option("—", "")}
//                     {people
//                       .filter((x) => x.id !== form.id)
//                       .map((x) => option(x.name, x.id))}
//                   </select>
//                 </label>
//               </div>
//             </div>

//             <div className="mt-5 flex items-center justify-end gap-2">
//               <button
//                 onClick={onClose}
//                 className="rounded-xl border px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={save}
//                 className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
//               >
//                 Save
//               </button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// // Simple generation layout
// function useGenerations(people: Person[]) {
//   const map = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
//   const indeg = new Map<string, number>();
//   people.forEach((p) => indeg.set(p.id, 0));
//   people.forEach((p) => p.parentIds.forEach((pid) => indeg.set(p.id, (indeg.get(p.id) || 0) + 1)));
//   const roots = people.filter((p) => (indeg.get(p.id) || 0) === 0);

//   // BFS by generations
//   const levels: Person[][] = [];
//   const visited = new Set<string>();
//   const q: Person[] = [...roots];
//   const gen = new Map<string, number>();
//   roots.forEach((r) => gen.set(r.id, 0));

//   while (q.length) {
//     const node = q.shift()!;
//     const g = gen.get(node.id) || 0;
//     if (!levels[g]) levels[g] = [];
//     if (!visited.has(node.id)) {
//       levels[g].push(node);
//       visited.add(node.id);
//       // children = those who list node as parent
//       people
//         .filter((x) => x.parentIds.includes(node.id))
//         .forEach((child) => {
//           if (!visited.has(child.id)) {
//             gen.set(child.id, g + 1);
//             q.push(child);
//           }
//         });
//     }
//   }

//   // Orphans not connected to any root
//   const orphans = people.filter((p) => !visited.has(p.id));
//   if (orphans.length) levels.push(orphans);

//   return { levels, map } as const;
// }

// // Draw relationship lines between cards
// function RelationshipLines({
//   levels,
//   positions,
// }: {
//   levels: Person[][];
//   positions: Record<string, { x: number; y: number; w: number; h: number }>;
// }) {
//   const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
//   const spouseLines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

//   // Parent -> child lines
//   levels.forEach((level, gi) => {
//     level.forEach((p) => {
//       p.parentIds.forEach((pid) => {
//         const parentRect = positions[pid];
//         const childRect = positions[p.id];
//         if (parentRect && childRect) {
//           lines.push({
//             x1: parentRect.x + parentRect.w / 2,
//             y1: parentRect.y + parentRect.h,
//             x2: childRect.x + childRect.w / 2,
//             y2: childRect.y,
//             key: `${pid}->${p.id}`,
//           });
//         }
//       });
//     });
//   });

//   // Spouse lines
//   levels.forEach((level) => {
//     level.forEach((p) => {
//       if (p.spouseId) {
//         const a = positions[p.id];
//         const b = positions[p.spouseId];
//         if (a && b) {
//           spouseLines.push({
//             x1: a.x + a.w,
//             y1: a.y + a.h / 2,
//             x2: b.x,
//             y2: b.y + b.h / 2,
//             key: `${p.id}<->${p.spouseId}`,
//           });
//         }
//       }
//     });
//   });

//   return (
//     <svg className="pointer-events-none absolute inset-0 h-full w-full">
//       <g strokeWidth={2} stroke="currentColor" className="text-zinc-300 dark:text-zinc-700">
//         {lines.map((l) => (
//           <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
//         ))}
//       </g>
//       <g strokeWidth={2.5} strokeDasharray={6} stroke="currentColor" className="text-emerald-400/70">
//         {spouseLines.map((l) => (
//           <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
//         ))}
//       </g>
//     </svg>
//   );
// }

// export default function FamilyTreeApp() {
//   const [people, setPeople] = useState<Person[]>([]);
//   const [openForm, setOpenForm] = useState(false);
//   const [editing, setEditing] = useState<Person | null>(null);
//   const [query, setQuery] = useState("");

//   // Load
//   useEffect(() => {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (raw) {
//       try {
//         setPeople(JSON.parse(raw));
//         return;
//       } catch {}
//     }
//     setPeople(demoSeed());
//   }, []);

//   // Save
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
//   }, [people]);

//   const { levels, map } = useGenerations(people);

//   const filteredIds = useMemo(() => {
//     if (!query.trim()) return new Set<string>();
//     const q = query.toLowerCase();
//     return new Set(
//       people
//         .filter((p) =>
//           [p.name, p.notes, p.birthYear].filter(Boolean).join(" ").toLowerCase().includes(q)
//         )
//         .map((p) => p.id)
//     );
//   }, [query, people]);

//   // Positions of cards for drawing lines
//   const refMap = useRef<Record<string, HTMLDivElement | null>>({});
//   const [positions, setPositions] = useState<
//     Record<string, { x: number; y: number; w: number; h: number }>
//   >({});

//   useEffect(() => {
//     const pos: Record<string, { x: number; y: number; w: number; h: number }> = {};
//     Object.entries(refMap.current).forEach(([id, el]) => {
//       if (!el) return;
//       const r = el.getBoundingClientRect();
//       const container = el.closest("[data-tree-canvas]") as HTMLDivElement | null;
//       const c = container?.getBoundingClientRect();
//       if (!c) return;
//       pos[id] = { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
//     });
//     setPositions(pos);
//   }, [levels, people]);

//   function upsert(p: Person) {
//     setPeople((prev) => {
//       const idx = prev.findIndex((x) => x.id === p.id);
//       if (idx === -1) return [...prev, p];
//       const copy = [...prev];
//       copy[idx] = p;
//       // keep spouse symmetry
//       if (p.spouseId) {
//         const sIdx = copy.findIndex((x) => x.id === p.spouseId);
//         if (sIdx !== -1) copy[sIdx] = { ...copy[sIdx], spouseId: p.id };
//       }
//       return copy;
//     });
//   }

//   function del(id: string) {
//     setPeople((prev) => {
//       // remove id, clean references
//       const filtered = prev.filter((x) => x.id !== id).map((x) => ({
//         ...x,
//         parentIds: x.parentIds.filter((pid) => pid !== id),
//         spouseId: x.spouseId === id ? undefined : x.spouseId,
//       }));
//       return filtered;
//     });
//   }

//   function exportJson() {
//     const blob = new Blob([JSON.stringify(people, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `family-tree-${new Date().toISOString().slice(0, 10)}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   function importJson(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const data = JSON.parse(String(reader.result));
//         if (Array.isArray(data)) setPeople(data);
//       } catch (err) {
//         alert("Invalid JSON file");
//       }
//     };
//     reader.readAsText(file);
//   }

//   function resetAll() {
//     if (confirm("সকল ডেটা মুছে ফেলা হবে?")) setPeople(demoSeed());
//   }

//   function printView() {
//     window.print();
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4 dark:from-zinc-950 dark:to-zinc-900">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
//           <div>
//             <h1 className="text-2xl font-bold">বংশপুঞ্জি (Family Tree)</h1>
//             <p className="text-sm text-zinc-600 dark:text-zinc-400">Next.js লোকাল-ফার্স্ট অ্যাপ – Add, link, zoom, export</p>
//           </div>

//           <div className="flex flex-wrap items-center gap-2">
//             <label className="relative">
//               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
//               <input
//                 className="w-56 rounded-2xl border bg-white/70 pl-9 pr-3 py-2 outline-none backdrop-blur focus:ring-2 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
//                 placeholder="Search"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//             </label>

//             <button
//               onClick={() => {
//                 setEditing(null);
//                 setOpenForm(true);
//               }}
//               className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 font-medium text-white shadow hover:bg-emerald-700"
//             >
//               <Plus className="h-4 w-4" /> Add Member
//             </button>

//             <button
//               onClick={exportJson}
//               className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
//             >
//               <Download className="h-4 w-4" /> Export
//             </button>

//             <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
//               <Upload className="h-4 w-4" /> Import
//               <input type="file" accept="application/json" className="hidden" onChange={importJson} />
//             </label>

//             <button
//               onClick={printView}
//               className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
//             >
//               <Printer className="h-4 w-4" /> Print
//             </button>

//             <button
//               onClick={resetAll}
//               className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
//             >
//               <RefreshCcw className="h-4 w-4" /> Reset
//             </button>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
//           <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-zinc-900/70">
//             <span className="inline-block h-2 w-6 rounded-full bg-zinc-300" />
//             Parent → Child
//           </span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-zinc-900/70">
//             <span className="inline-block h-2 w-6 rounded-full bg-emerald-400" />
//             Spouse
//           </span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-zinc-900/70">
//             <Heart className="h-3 w-3" /> Double‑click member to quick‑edit
//           </span>
//         </div>

//         {/* Canvas */}
//         <div
//           data-tree-canvas
//           className="relative h-[70vh] overflow-hidden rounded-3xl border bg-white/60 shadow-inner backdrop-blur dark:border-zinc-800 dark:bg-zinc-950"
//         >
//           <TransformWrapper minScale={0.4} initialScale={0.9} wheel={{ step: 0.06 }}>
//             <TransformComponent>
//               <div className="relative mx-auto w-[1600px] p-10">
//                 {/* SVG lines */}
//                 <RelationshipLines levels={levels} positions={positions} />

//                 {/* Levels grid */}
//                 <div className="flex flex-col gap-16">
//                   {levels.map((row, i) => (
//                     <div key={i} className="flex flex-wrap items-start justify-center gap-10">
//                       {row.map((p) => (
//                         <div
//                           key={p.id}
//                           ref={(el) => (refMap.current[p.id] = el)}
//                           onDoubleClick={() => {
//                             setEditing(p);
//                             setOpenForm(true);
//                           }}
//                           className="relative"
//                         >
//                           {p.spouseId && map.get(p.spouseId) && (
//                             <div className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald-600">
//                               <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 dark:bg-emerald-900/30">
//                                 <LinkIcon className="h-3 w-3" /> spouse: {map.get(p.spouseId!)?.name}
//                               </span>
//                             </div>
//                           )}
//                           <PersonCard
//                             p={p}
//                             onEdit={(x) => {
//                               setEditing(x);
//                               setOpenForm(true);
//                             }}
//                             onDelete={del}
//                             highlight={filteredIds.has(p.id)}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </TransformComponent>
//           </TransformWrapper>
//         </div>

//         {/* People list / manage */}
//         <div className="mx-auto mt-6 grid gap-3">
//           <h2 className="text-lg font-semibold">সদস্য তালিকা</h2>
//           <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
//             {people.map((p) => (
//               <div key={p.id} className="flex items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
//                 <div className="min-w-0">
//                   <div className="truncate font-medium">{p.name}</div>
//                   <div className="text-xs text-zinc-500">
//                     {p.birthYear || "—"} • Parents: {p.parentIds.length || 0}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => {
//                       setEditing(p);
//                       setOpenForm(true);
//                     }}
//                     className="rounded-xl border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => del(p.id)}
//                     className="rounded-xl border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       <PersonForm
//         open={openForm}
//         onClose={() => setOpenForm(false)}
//         onSave={upsert}
//         people={people}
//         editing={editing}
//       />

//       {/* Print styles */}
//       <style>{`
//         @media print {
//           body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           input, button, label { display: none !important; }
//           [data-tree-canvas] { height: auto; box-shadow: none; }
//         }
//       `}</style>
//     </div>
//   );
// }

