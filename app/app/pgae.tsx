type Props = {}

export default function pgae({}: Props) {
  return (
    <div>pgae</div>
  )
};
// "use client";

// import { useState, useMemo, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const PLANS = [
//   { id: "p10", name: "Starter", limit: 10, price: 5, color: "#22d3ee" },
//   { id: "p20", name: "Basic", limit: 20, price: 9, color: "#34d399" },
//   { id: "p50", name: "Growth", limit: 50, price: 19, color: "#a78bfa", popular: true },
//   { id: "p100", name: "Pro", limit: 100, price: 35, color: "#f472b6" },
//   { id: "pinf", name: "Unlimited", limit: Infinity, price: 79, color: "#fbbf24" },
// ];

// const fade = {
//   hidden: { opacity: 0, y: 40 },
//   show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
// };

// function Cube() {
//   return (
//     <div className="scene">
//       <div className="cube">
//         {["front", "back", "right", "left", "top", "bottom"].map((f) => (
//           <div key={f} className={`face ${f}`}>
//             {f === "front" ? "SHOP" : f === "back" ? "UPLOAD" : "★"}
//           </div>
//         ))}
//       </div>
//       <div className="ring r1" />
//       <div className="ring r2" />
//       <div className="orb o1" />
//       <div className="orb o2" />
//     </div>
//   );
// }

// function PlanCard({ plan, i, yearly, active, onSelect }) {
//   const price = yearly ? Math.round(plan.price * 0.8) : plan.price;
//   return (
//     <motion.div
//       variants={fade}
//       custom={i}
//       initial="hidden"
//       whileInView="show"
//       viewport={{ once: true }}
//       whileHover={{ y: -12, rotateX: 6, rotateY: -6, scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 200, damping: 15 }}
//       className={`plan ${active ? "active" : ""}`}
//       style={{ "--c": plan.color }}
//       onClick={() => onSelect(plan)}
//     >
//       {plan.popular && <span className="badge">Most Popular</span>}
//       <h3>{plan.name}</h3>
//       <div className="limit">{plan.limit === Infinity ? "∞" : plan.limit}</div>
//       <p className="sub">product uploads</p>
//       <div className="price">
//         ${price}
//         <small>/mo</small>
//       </div>
//       <button className="btn" style={{ background: plan.color }}>
//         {active ? "Selected ✓" : "Choose plan"}
//       </button>
//     </motion.div>
//   );
// }

// export default function Page() {
//   const [yearly, setYearly] = useState(false);
//   const [plan, setPlan] = useState(PLANS[2]);
//   const [items, setItems] = useState([]);
//   const [msg, setMsg] = useState("");
//   const urls = useRef([]);

//   useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

//   const used = items.length;
//   const pct = plan.limit === Infinity ? Math.min(used, 100) : Math.min((used / plan.limit) * 100, 100);

//   const onFiles = (e) => {
//     const files = Array.from(e.target.files || []);
//     const room = plan.limit === Infinity ? files.length : Math.max(plan.limit - items.length, 0);
//     const accepted = files.slice(0, room);
//     const next = accepted.map((f) => {
//       const url = URL.createObjectURL(f);
//       urls.current.push(url);
//       return { id: crypto.randomUUID(), name: f.name.replace(/\.[^.]+$/, ""), url, price: "", qty: 1, profile: "", link: "" };
//     });
//     setItems((p) => [...p, ...next]);
//     setMsg(
//       files.length > accepted.length
//         ? `Limit reached: ${accepted.length} added, ${files.length - accepted.length} skipped. Upgrade your plan!`
//         : ""
//     );
//     e.target.value = "";
//   };

//   const update = (id, key, val) => setItems((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
//   const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
//   const changeQty = (id, d) =>
//     setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, (Number(x.qty) || 1) + d) } : x)));
//   const isUrl = (v) => /^https?:\/\/\S+\.\S+/i.test(v);
//   const totalQty = items.reduce((a, x) => a + (Number(x.qty) || 0), 0);
//   const totalValue = items.reduce((a, x) => a + (Number(x.price) || 0) * (Number(x.qty) || 0), 0);

//   const select = (p) => {
//     setPlan(p);
//     if (p.limit !== Infinity && items.length > p.limit) {
//       setItems((prev) => prev.slice(0, p.limit));
//       setMsg(`Plan changed: extra products over ${p.limit} were removed.`);
//     } else setMsg("");
//   };

//   const stats = useMemo(
//     () => [
//       ["10K+", "Sellers"],
//       ["2M+", "Products"],
//       ["99.9%", "Uptime"],
//     ],
//     []
//   );

//   return (
//     <main>
//       <div className="blob b1" />
//       <div className="blob b2" />

//       {/* HERO */}
//       <section className="hero">
//         <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
//           <span className="pill">🚀 Online Product Store</span>
//           <h1>
//             Upload <span className="grad">10, 20, 50, 100</span> or Unlimited Products
//           </h1>
//           <p className="lead">
//             Build your online shop in minutes. Add many products at once, choose the plan that fits you, and sell
//             everywhere.
//           </p>
//           <div className="row">
//             <a href="#upload" className="btn big">Start Uploading</a>
//             <a href="#plans" className="btn big ghost">See Plans</a>
//           </div>
//           <div className="stats">
//             {stats.map(([n, l]) => (
//               <div key={l}>
//                 <b>{n}</b>
//                 <span>{l}</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//         <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
//           <Cube />
//         </motion.div>
//       </section>

//       {/* PLANS */}
//       <section id="plans" className="sec">
//         <motion.h2 variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
//           Choose Your Upload Limit
//         </motion.h2>
//         <div className="toggle">
//           <span className={!yearly ? "on" : ""}>Monthly</span>
//           <button className={`sw ${yearly ? "yr" : ""}`} onClick={() => setYearly(!yearly)} aria-label="toggle billing">
//             <motion.i layout transition={{ type: "spring", stiffness: 500, damping: 30 }} />
//           </button>
//           <span className={yearly ? "on" : ""}>Yearly <em>-20%</em></span>
//         </div>
//         <div className="plans">
//           {PLANS.map((p, i) => (
//             <PlanCard key={p.id} plan={p} i={i} yearly={yearly} active={plan.id === p.id} onSelect={select} />
//           ))}
//         </div>
//       </section>

//       {/* UPLOAD */}
//       <section id="upload" className="sec">
//         <motion.h2 variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
//           Multiple Product Upload
//         </motion.h2>
//         <div className="panel">
//           <div className="head">
//             <div>
//               <b style={{ color: plan.color }}>{plan.name} plan</b>
//               <span className="muted">
//                 {" "}
//                 · {used} / {plan.limit === Infinity ? "∞" : plan.limit} products
//               </span>
//             </div>
//             <label className="btn" style={{ background: plan.color }}>
//               + Select images
//               <input type="file" accept="image/*" multiple hidden onChange={onFiles} />
//             </label>
//           </div>
//           <div className="bar">
//             <motion.div
//               className="fill"
//               style={{ background: plan.color }}
//               animate={{ width: `${pct}%` }}
//               transition={{ type: "spring", stiffness: 80 }}
//             />
//           </div>
//           {msg && <p className="warn">{msg}</p>}

//           {items.length === 0 ? (
//             <div className="empty">
//               <div className="mini" />
//               <p>No products yet. Select multiple images to add them all at once.</p>
//             </div>
//           ) : (
//             <div className="grid">
//               <AnimatePresence>
//                 {items.map((it) => (
//                   <motion.div
//                     key={it.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.7 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.5 }}
//                     whileHover={{ y: -6 }}
//                     className="card"
//                   >
//                     <button className="x" onClick={() => remove(it.id)} aria-label="remove">×</button>
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img src={it.url} alt={it.name} />

//                     <label className="fl">Product name</label>
//                     <input value={it.name} onChange={(e) => update(it.id, "name", e.target.value)} placeholder="e.g. Red Sneakers" />

//                     <div className="two">
//                       <div>
//                         <label className="fl">Price ($)</label>
//                         <input
//                           value={it.price}
//                           type="number"
//                           min="0"
//                           onChange={(e) => update(it.id, "price", e.target.value)}
//                           placeholder="0.00"
//                         />
//                       </div>
//                       <div>
//                         <label className="fl">Quantity</label>
//                         <div className="qty">
//                           <button type="button" onClick={() => changeQty(it.id, -1)} aria-label="decrease">−</button>
//                           <input
//                             type="number"
//                             min="1"
//                             value={it.qty}
//                             onChange={(e) => update(it.id, "qty", e.target.value)}
//                           />
//                           <button type="button" onClick={() => changeQty(it.id, 1)} aria-label="increase">+</button>
//                         </div>
//                       </div>
//                     </div>

//                     <label className="fl">Profile link</label>
//                     <input
//                       type="url"
//                       value={it.profile}
//                       onChange={(e) => update(it.id, "profile", e.target.value)}
//                       placeholder="https://yourshop.com/profile"
//                       className={it.profile && !isUrl(it.profile) ? "bad" : ""}
//                     />

//                     <label className="fl">Product link</label>
//                     <input
//                       type="url"
//                       value={it.link}
//                       onChange={(e) => update(it.id, "link", e.target.value)}
//                       placeholder="https://yourshop.com/product"
//                       className={it.link && !isUrl(it.link) ? "bad" : ""}
//                     />

//                     <div className="links">
//                       {isUrl(it.profile) && (
//                         <a href={it.profile} target="_blank" rel="noopener noreferrer">👤 Profile ↗</a>
//                       )}
//                       {isUrl(it.link) && (
//                         <a href={it.link} target="_blank" rel="noopener noreferrer">🛍️ Product ↗</a>
//                       )}
//                     </div>

//                     <div className="total">
//                       Total: <b>${((Number(it.price) || 0) * (Number(it.qty) || 0)).toFixed(2)}</b>
//                     </div>

//                     <button className="rm" onClick={() => remove(it.id)}>🗑 Remove</button>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}
//           {items.length > 0 && (
//             <div className="sum">
//               <div><b>{used}</b><span>Products</span></div>
//               <div><b>{totalQty}</b><span>Total quantity</span></div>
//               <div><b>${totalValue.toFixed(2)}</b><span>Stock value</span></div>
//             </div>
//           )}
//           {items.length > 0 && (
//             <motion.button whileTap={{ scale: 0.95 }} className="btn big publish" onClick={() => setMsg(`✅ ${used} products published online!`)}>
//               Publish {used} Products
//             </motion.button>
//           )}
//         </div>
//       </section>

//       <footer>© {new Date().getFullYear()} ShopCube. All rights reserved.</footer>

//       <style jsx global>{`
//         :root { --bg:#0b0b1a; --card:rgba(255,255,255,.06); --line:rgba(255,255,255,.12); --txt:#eef; --mut:#9aa0c3; }
//         * { box-sizing:border-box; margin:0; padding:0; }
//         html { scroll-behavior:smooth; }
//         body { background:var(--bg); color:var(--txt); font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; overflow-x:hidden; }
//         main { position:relative; overflow:hidden; }
//         .blob { position:fixed; width:420px; height:420px; border-radius:50%; filter:blur(110px); opacity:.35; z-index:0; animation:float 12s ease-in-out infinite; }
//         .b1 { background:#7c3aed; top:-100px; left:-100px; }
//         .b2 { background:#06b6d4; bottom:-120px; right:-100px; animation-delay:-6s; }
//         @keyframes float { 50% { transform:translate(60px,40px) scale(1.15); } }
//         section, footer { position:relative; z-index:1; }
//         .hero { max-width:1200px; margin:auto; padding:80px 20px; display:grid; grid-template-columns:1.1fr 1fr; gap:40px; align-items:center; min-height:100vh; }
//         .pill { display:inline-block; padding:6px 14px; border:1px solid var(--line); border-radius:99px; background:var(--card); font-size:14px; margin-bottom:20px; }
//         h1 { font-size:clamp(2.2rem,5vw,4rem); line-height:1.1; margin-bottom:20px; }
//         .grad { background:linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6,#fbbf24); background-size:200%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shine 5s linear infinite; }
//         @keyframes shine { to { background-position:200% 0; } }
//         .lead { color:var(--mut); font-size:1.1rem; line-height:1.7; max-width:540px; margin-bottom:28px; }
//         .row { display:flex; gap:14px; flex-wrap:wrap; }
//         .btn { display:inline-block; border:0; cursor:pointer; padding:10px 20px; border-radius:12px; color:#0b0b1a; font-weight:700; text-decoration:none; background:linear-gradient(90deg,#22d3ee,#a78bfa); transition:transform .2s, box-shadow .2s; }
//         .btn:hover { transform:translateY(-3px); box-shadow:0 10px 30px rgba(167,139,250,.4); }
//         .btn.big { padding:14px 28px; font-size:1rem; }
//         .btn.ghost { background:transparent; color:var(--txt); border:1px solid var(--line); }
//         .stats { display:flex; gap:36px; margin-top:40px; }
//         .stats b { display:block; font-size:1.8rem; color:#22d3ee; }
//         .stats span { color:var(--mut); font-size:14px; }

//         /* 3D */
//         .scene { width:260px; height:260px; margin:auto; perspective:900px; position:relative; }
//         .cube { width:100%; height:100%; position:relative; transform-style:preserve-3d; animation:spin 14s linear infinite; }
//         .face { position:absolute; width:260px; height:260px; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:800; letter-spacing:3px; border:2px solid rgba(255,255,255,.35); backdrop-filter:blur(4px); }
//         .front  { transform:translateZ(130px); background:rgba(34,211,238,.25); }
//         .back   { transform:rotateY(180deg) translateZ(130px); background:rgba(167,139,250,.25); }
//         .right  { transform:rotateY(90deg) translateZ(130px); background:rgba(244,114,182,.25); }
//         .left   { transform:rotateY(-90deg) translateZ(130px); background:rgba(251,191,36,.25); }
//         .top    { transform:rotateX(90deg) translateZ(130px); background:rgba(52,211,153,.25); }
//         .bottom { transform:rotateX(-90deg) translateZ(130px); background:rgba(124,58,237,.25); }
//         @keyframes spin { from { transform:rotateX(-20deg) rotateY(0); } to { transform:rotateX(-20deg) rotateY(360deg); } }
//         .ring { position:absolute; inset:-60px; border-radius:50%; border:3px solid; transform-style:preserve-3d; }
//         .r1 { border-color:#f472b6; animation:ring1 8s linear infinite; }
//         .r2 { border-color:#22d3ee; inset:-90px; animation:ring2 11s linear infinite; }
//         @keyframes ring1 { from { transform:rotateX(70deg) rotateZ(0); } to { transform:rotateX(70deg) rotateZ(360deg); } }
//         @keyframes ring2 { from { transform:rotateY(70deg) rotateZ(360deg); } to { transform:rotateY(70deg) rotateZ(0); } }
//         .orb { position:absolute; border-radius:50%; background:radial-gradient(circle at 30% 30%,#fff,#a78bfa 40%,#1e1b4b); animation:bob 4s ease-in-out infinite; }
//         .o1 { width:50px; height:50px; top:-70px; right:-50px; }
//         .o2 { width:34px; height:34px; bottom:-60px; left:-40px; animation-delay:-2s; background:radial-gradient(circle at 30% 30%,#fff,#fbbf24 40%,#78350f); }
//         @keyframes bob { 50% { transform:translateY(-22px); } }

//         .sec { max-width:1200px; margin:auto; padding:70px 20px; }
//         h2 { text-align:center; font-size:clamp(1.8rem,4vw,2.6rem); margin-bottom:26px; }
//         .toggle { display:flex; justify-content:center; align-items:center; gap:12px; margin-bottom:40px; color:var(--mut); }
//         .toggle .on { color:var(--txt); font-weight:700; }
//         .toggle em { color:#34d399; font-style:normal; font-size:13px; }
//         .sw { width:54px; height:28px; border-radius:99px; border:1px solid var(--line); background:var(--card); cursor:pointer; padding:3px; display:flex; }
//         .sw.yr { justify-content:flex-end; background:#7c3aed; }
//         .sw i { width:20px; height:20px; border-radius:50%; background:#fff; display:block; }

//         .plans { display:grid; grid-template-columns:repeat(5,1fr); gap:18px; perspective:1000px; }
//         .plan { position:relative; background:var(--card); border:1px solid var(--line); border-radius:20px; padding:26px 18px; text-align:center; cursor:pointer; backdrop-filter:blur(10px); transform-style:preserve-3d; transition:border-color .3s, box-shadow .3s; }
//         .plan:hover, .plan.active { border-color:var(--c); box-shadow:0 0 40px -8px var(--c); }
//         .plan h3 { color:var(--c); margin-bottom:10px; }
//         .limit { font-size:3.2rem; font-weight:800; line-height:1; }
//         .sub { color:var(--mut); font-size:13px; margin:6px 0 18px; }
//         .price { font-size:1.7rem; font-weight:700; margin-bottom:18px; }
//         .price small { font-size:14px; color:var(--mut); }
//         .plan .btn { width:100%; }
//         .badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:linear-gradient(90deg,#a78bfa,#f472b6); padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; white-space:nowrap; }

//         .panel { background:var(--card); border:1px solid var(--line); border-radius:24px; padding:26px; backdrop-filter:blur(12px); }
//         .head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
//         .muted { color:var(--mut); }
//         .bar { height:10px; background:rgba(255,255,255,.1); border-radius:99px; overflow:hidden; }
//         .fill { height:100%; border-radius:99px; }
//         .warn { margin-top:12px; color:#fbbf24; font-size:14px; }
//         .empty { text-align:center; padding:50px 10px; color:var(--mut); }
//         .mini { width:60px; height:60px; margin:0 auto 18px; border-radius:12px; background:linear-gradient(135deg,#22d3ee,#a78bfa); animation:flip 3s ease-in-out infinite; }
//         @keyframes flip { 50% { transform:rotateY(180deg) rotateX(180deg); } }
//         .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:16px; margin-top:22px; }
//         .card { position:relative; background:rgba(255,255,255,.05); border:1px solid var(--line); border-radius:16px; padding:10px; display:flex; flex-direction:column; gap:8px; }
//         .card img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:10px; }
//         .card input { width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--line); background:rgba(0,0,0,.25); color:var(--txt); outline:none; }
//         .card input:focus { border-color:#a78bfa; }
//         .fl { font-size:12px; color:var(--mut); margin-bottom:-4px; }
//         .two { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
//         .two > div { display:flex; flex-direction:column; gap:4px; }
//         .qty { display:flex; align-items:center; border:1px solid var(--line); border-radius:8px; background:rgba(0,0,0,.25); overflow:hidden; }
//         .qty button { width:30px; height:34px; border:0; background:rgba(167,139,250,.25); color:var(--txt); font-size:18px; cursor:pointer; transition:background .2s; }
//         .qty button:hover { background:#a78bfa; }
//         .card .qty input { border:0; border-radius:0; text-align:center; padding:8px 0; min-width:0; background:transparent; }
//         .card input.bad { border-color:#f43f5e; }
//         .links { display:flex; gap:8px; flex-wrap:wrap; }
//         .links a { font-size:12px; color:#22d3ee; text-decoration:none; padding:4px 10px; border:1px solid rgba(34,211,238,.4); border-radius:99px; transition:background .2s; }
//         .links a:hover { background:rgba(34,211,238,.15); }
//         .total { font-size:13px; color:var(--mut); } .total b { color:#34d399; }
//         .rm { border:1px solid rgba(244,63,94,.5); background:transparent; color:#fb7185; border-radius:8px; padding:8px; cursor:pointer; transition:background .2s; }
//         .rm:hover { background:rgba(244,63,94,.2); }
//         .sum { display:flex; justify-content:center; gap:36px; flex-wrap:wrap; margin-top:26px; padding:16px; border:1px dashed var(--line); border-radius:16px; }
//         .sum div { text-align:center; } .sum b { display:block; font-size:1.5rem; color:#fbbf24; } .sum span { font-size:13px; color:var(--mut); }
//         .x { position:absolute; top:6px; right:6px; z-index:2; width:26px; height:26px; border-radius:50%; border:0; background:rgba(244,63,94,.9); color:#fff; cursor:pointer; font-size:16px; }
//         .publish { display:block; margin:26px auto 0; }
//         footer { text-align:center; padding:40px 20px; color:var(--mut); border-top:1px solid var(--line); }

//         @media (max-width:1000px) { .plans { grid-template-columns:repeat(3,1fr); } }
//         @media (max-width:820px) {
//           .hero { grid-template-columns:1fr; text-align:center; padding-top:50px; min-height:auto; }
//           .lead { margin-inline:auto; } .row, .stats { justify-content:center; }
//           .scene { transform:scale(.75); margin:70px auto; }
//         }
//         @media (max-width:560px) { .plans { grid-template-columns:1fr 1fr; gap:12px; } .limit { font-size:2.4rem; } }
//         @media (max-width:380px) { .plans { grid-template-columns:1fr; } }
//       `}</style>
//     </main>
//   );
// }


