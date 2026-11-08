"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "../lib/store";
import ShareButtons from "./ShareButtons";

export default function ProductView({ product: p }) {
  const [stock, setStock] = useState(p.qty);
  const [qty, setQty] = useState(1);
  const [c, setC] = useState({ name: "", phone: "", address: "" });
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const soldOut = stock < 1;

  const place = async () => {
    if (!c.name.trim() || !c.phone.trim() || !c.address.trim()) return setErr("Please fill name, phone and address");
    setBusy(true); setErr("");
    try {
      const r = await api("/api/orders", { method: "POST", body: JSON.stringify({ slug: p.slug, qty, customer: c }) });
      setOrder(r.order); setStock((s) => s - qty);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="sc-wrap">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="sc-detail">
        <img src={p.image} alt={p.alt || p.name} />
        <div>
          <h1 className="sc-title">{p.name}</h1>
          <p className="sc-price" style={{ fontSize: "1.8rem", margin: "6px 0 12px" }}>${p.price}</p>
          <p className="sc-mut" style={{ marginBottom: 12 }}>{soldOut ? "❌ Out of stock" : `✅ ${stock} in stock`}</p>
          {p.desc && <p style={{ lineHeight: 1.7, marginBottom: 14 }}>{p.desc}</p>}
          {p.profile && <a href={p.profile} target="_blank" rel="noopener noreferrer" className="sc-btn sc-sm sc-ghost">👤 Seller profile ↗</a>}

          {order ? (
            <div className="sc-box sc-ok" style={{ marginTop: 20 }}>
              <b>🎉 Order placed!</b>
              <p className="sc-mut" style={{ margin: "8px 0 0" }}>Order ID: {order.id} · Total ${order.total.toFixed(2)}</p>
              <p className="sc-mut">Please save your Order ID. The seller will contact you on {order.customer.phone}.</p>
            </div>
          ) : (
            !soldOut && (
              <div className="sc-box" style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 14 }}>Order now</h3>
                <div className="sc-field">
                  <label>Quantity</label>
                  <div className="sc-qty">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(Math.min(stock, qty + 1))}>+</button>
                  </div>
                </div>
                <div className="sc-field"><label>Your name</label><input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></div>
                <div className="sc-field"><label>Phone</label><input value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} /></div>
                <div className="sc-field"><label>Delivery address</label><textarea rows={2} value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} /></div>
                {err && <p className="sc-err">{err}</p>}
                <button className="sc-btn" disabled={busy} onClick={place}>{busy ? "Placing…" : `🛒 Place order · $${(p.price * qty).toFixed(2)}`}</button>
              </div>
            )
          )}

          <div className="sc-box" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 10 }}>Share this product</h3>
            <ShareButtons slug={p.slug} name={p.name} />
          </div>
          <p style={{ marginTop: 16 }}><Link href="/products" className="sc-mut">← All products</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
