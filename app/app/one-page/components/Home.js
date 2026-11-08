"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cube, Pyramid } from "./Shapes";
import Share from "./Share";

const PLANS = [
  { id: "p10", name: "Starter", limit: 10, price: 5, color: "#22d3ee" },
  { id: "p20", name: "Basic", limit: 20, price: 9, color: "#34d399" },
  { id: "p50", name: "Growth", limit: 50, price: 19, color: "#a78bfa", popular: true },
  { id: "p100", name: "Pro", limit: 100, price: 35, color: "#f472b6" },
  { id: "pinf", name: "Unlimited", limit: Infinity, price: 79, color: "#fbbf24" },
];

const fade = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const isUrl = (v) => /^https?:\/\/\S+\.\S+/i.test(v);

async function compress(file, max = 640) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return c.toDataURL("image/jpeg", 0.78);
}

function PlanCard({ plan, i, yearly, active, onSelect }) {
  const price = yearly ? Math.round(plan.price * 0.8) : plan.price;
  return (
    <motion.div
      variants={fade}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      whileHover={{ y: -12, rotateX: 6, rotateY: -6, scale: 1.03 }}
      className={`plan ${active ? "active" : ""}`}
      style={{ "--c": plan.color }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(plan)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(plan))}
    >
      {plan.popular && <span className="badge">Most Popular</span>}
      <h3>{plan.name}</h3>
      <div className="limit">{plan.limit === Infinity ? "∞" : plan.limit}</div>
      <p className="sub">product uploads</p>
      <div className="price">
        ${price}
        <small>/mo</small>
      </div>
      <span className="btn" style={{ background: plan.color }}>
        {active ? "Selected ✓" : "Choose plan"}
      </span>
    </motion.div>
  );
}

export default function Home() {
  const [yearly, setYearly] = useState(false);
  const [plan, setPlan] = useState(PLANS[2]);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [pub, setPub] = useState({ status: "idle", done: 0, total: 0 });
  const [myShops, setMyShops] = useState([]);

  useEffect(() => {
    try {
      setMyShops(JSON.parse(localStorage.getItem("shopcube.shops") || "[]"));
    } catch {}
  }, []);

  const used = items.length;
  const pct = plan.limit === Infinity ? Math.min(used, 100) : Math.min((used / plan.limit) * 100, 100);
  const totalQty = items.reduce((a, x) => a + (Number(x.qty) || 0), 0);
  const totalValue = items.reduce((a, x) => a + (Number(x.price) || 0) * (Number(x.qty) || 0), 0);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!files.length) return;
    const room = plan.limit === Infinity ? files.length : Math.max(plan.limit - items.length, 0);
    const accepted = files.slice(0, room);
    setBusy(true);
    const next = [];
    let failed = 0;
    for (const f of accepted) {
      try {
        next.push({
          id: uid(),
          name: f.name.replace(/\.[^.]+$/, ""),
          image: await compress(f),
          price: "",
          qty: 1,
          profile: "",
          link: "",
        });
      } catch {
        failed++;
      }
    }
    setItems((p) => [...p, ...next]);
    setBusy(false);
    const skipped = files.length - accepted.length;
    setMsg(
      skipped > 0
        ? `Limit reached: ${next.length} added, ${skipped} skipped. Upgrade your plan!`
        : failed
        ? `${failed} ta image read kora jayni.`
        : ""
    );
  };

  const update = (id, key, val) => setItems((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const changeQty = (id, d) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, (Number(x.qty) || 1) + d) } : x)));

  const select = (p) => {
    setPlan(p);
    if (p.limit !== Infinity && items.length > p.limit) {
      setItems((prev) => prev.slice(0, p.limit));
      setMsg(`Plan changed: extra products over ${p.limit} were removed.`);
    } else setMsg("");
  };

  const publish = async () => {
    const bad = items.findIndex(
      (x) => !x.name.trim() || !(Number(x.price) > 0) || (x.profile && !isUrl(x.profile)) || (x.link && !isUrl(x.link))
    );
    if (bad !== -1) {
      setMsg(`Product #${bad + 1}: name, price (0-r beshi) ar valid link dite hobe.`);
      document.getElementById(`item-${items[bad].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMsg("");
    setPub({ status: "running", done: 0, total: items.length });
    try {
      const ids = [];
      for (const it of items) {
        const r = await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: it.name, price: it.price, qty: it.qty, profile: it.profile, link: it.link, image: it.image }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Upload failed");
        ids.push({ id: j.id, name: it.name });
        setPub((p) => ({ ...p, done: ids.length }));
      }
      const r = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids.map((x) => x.id) }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Shop create failed");
      setPub({ status: "done", shop: j.id, products: ids, done: ids.length, total: ids.length });
      try {
        const list = [{ id: j.id, count: ids.length, at: Date.now() }, ...myShops].slice(0, 10);
        setMyShops(list);
        localStorage.setItem("shopcube.shops", JSON.stringify(list));
      } catch {}
    } catch (err) {
      setPub({ status: "error", error: err.message, done: 0, total: 0 });
    }
  };

  const stats = [
    ["10K+", "Sellers"],
    ["2M+", "Products"],
    ["99.9%", "Uptime"],
  ];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <span className="pill">🚀 Online Product Store</span>
          <h1>
            Create Your Online Shop: Upload <span className="grad">10, 20, 50, 100</span> or Unlimited Products
          </h1>
          <p className="lead">
            Build your online shop in minutes. Add many products at once, publish them, and share a product link
            everywhere.
          </p>
          <div className="row">
            <a href="#upload" className="btn big">Start Uploading</a>
            <a href="#plans" className="btn big ghost">See Plans</a>
          </div>
          <div className="stats">
            {stats.map(([n, l]) => (
              <div key={l}>
                <b>{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
          <Cube />
        </motion.div>
      </section>

      {/* PLANS */}
      <section id="plans" className="sec">
        <motion.h2 variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Choose Your Upload Limit
        </motion.h2>
        <div className="toggle">
          <span className={!yearly ? "on" : ""}>Monthly</span>
          <button className={`sw ${yearly ? "yr" : ""}`} onClick={() => setYearly(!yearly)} aria-label="toggle billing">
            <motion.i layout transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className={yearly ? "on" : ""}>Yearly <em>-20%</em></span>
        </div>
        <div className="plans">
          {PLANS.map((p, i) => (
            <PlanCard key={p.id} plan={p} i={i} yearly={yearly} active={plan.id === p.id} onSelect={select} />
          ))}
        </div>
      </section>

      {/* UPLOAD */}
      <section id="upload" className="sec">
        <motion.h2 variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Multiple Product Upload
        </motion.h2>
        <div className="panel">
          <div className="head">
            <div>
              <b style={{ color: plan.color }}>{plan.name} plan</b>
              <span className="muted"> · {used} / {plan.limit === Infinity ? "∞" : plan.limit} products</span>
            </div>
            <label className="btn" style={{ background: plan.color, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Processing…" : "+ Select images"}
              <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={onFiles} />
            </label>
          </div>
          <div className="bar">
            <motion.div className="fill" style={{ background: plan.color }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 80 }} />
          </div>
          {msg && <p className="warn" role="alert">{msg}</p>}

          {items.length === 0 ? (
            <div className="empty">
              <Pyramid />
              <p>No products yet. Select multiple images to add them all at once.</p>
            </div>
          ) : (
            <div className="grid">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    id={`item-${it.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ y: -6 }}
                    className="card"
                  >
                    <button className="x" onClick={() => remove(it.id)} aria-label="remove">×</button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image} alt={it.name} />

                    <label className="fl">Product name</label>
                    <input value={it.name} onChange={(e) => update(it.id, "name", e.target.value)} placeholder="e.g. Red Sneakers" maxLength={120} />

                    <div className="two">
                      <div>
                        <label className="fl">Price ($)</label>
                        <input value={it.price} type="number" min="0" step="0.01" onChange={(e) => update(it.id, "price", e.target.value)} placeholder="0.00" />
                      </div>
                      <div>
                        <label className="fl">Quantity</label>
                        <div className="qty">
                          <button type="button" onClick={() => changeQty(it.id, -1)} aria-label="decrease">−</button>
                          <input type="number" min="1" value={it.qty} onChange={(e) => update(it.id, "qty", e.target.value)} />
                          <button type="button" onClick={() => changeQty(it.id, 1)} aria-label="increase">+</button>
                        </div>
                      </div>
                    </div>

                    <label className="fl">Profile link</label>
                    <input type="url" value={it.profile} onChange={(e) => update(it.id, "profile", e.target.value)} placeholder="https://yourshop.com/profile" className={it.profile && !isUrl(it.profile) ? "bad" : ""} />

                    <label className="fl">Product link</label>
                    <input type="url" value={it.link} onChange={(e) => update(it.id, "link", e.target.value)} placeholder="https://yourshop.com/product" className={it.link && !isUrl(it.link) ? "bad" : ""} />

                    <div className="links">
                      {isUrl(it.profile) && <a href={it.profile} target="_blank" rel="noopener noreferrer">👤 Profile ↗</a>}
                      {isUrl(it.link) && <a href={it.link} target="_blank" rel="noopener noreferrer">🛍️ Product ↗</a>}
                    </div>

                    <div className="total">
                      Total: <b>${((Number(it.price) || 0) * (Number(it.qty) || 0)).toFixed(2)}</b>
                    </div>

                    <button className="rm" onClick={() => remove(it.id)}>🗑 Remove</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {items.length > 0 && (
            <div className="sum">
              <div><b>{used}</b><span>Products</span></div>
              <div><b>{totalQty}</b><span>Total quantity</span></div>
              <div><b>${totalValue.toFixed(2)}</b><span>Stock value</span></div>
            </div>
          )}

          {items.length > 0 && pub.status !== "running" && (
            <motion.button whileTap={{ scale: 0.95 }} className="btn big publish" onClick={publish}>
              🚀 Publish {used} Products
            </motion.button>
          )}

          {pub.status === "running" && (
            <div className="prog">
              <div className="bar"><div className="fill" style={{ width: `${(pub.done / pub.total) * 100}%`, background: "#34d399" }} /></div>
              <p className="muted">Publishing… {pub.done} / {pub.total}</p>
            </div>
          )}

          {pub.status === "error" && <p className="warn" role="alert">❌ {pub.error}</p>}

          {pub.status === "done" && (
            <div className="res">
              <h3>✅ {pub.total} products published!</h3>
              <p className="muted">Puro shop-er link:</p>
              <a className="biglink" href={`/shop/${pub.shop}`} target="_blank" rel="noopener noreferrer">/shop/{pub.shop} ↗</a>
              <Share path={`/shop/${pub.shop}`} title="Check out my shop" />
              <h4>Product links</h4>
              <ul className="plist">
                {pub.products.map((p) => (
                  <li key={p.id}>
                    <a href={`/p/${p.id}`} target="_blank" rel="noopener noreferrer">{p.name} ↗</a>
                    <Share path={`/p/${p.id}`} title={p.name} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {myShops.length > 0 && (
            <div className="res">
              <h4>My published shops</h4>
              <ul className="plist">
                {myShops.map((s) => (
                  <li key={s.id}>
                    <a href={`/shop/${s.id}`}>/shop/{s.id}</a>
                    <span className="muted"> · {s.count} products · {new Date(s.at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
