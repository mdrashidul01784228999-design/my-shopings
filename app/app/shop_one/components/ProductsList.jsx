"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, copyText, downloadJson } from "../lib/store";

export default function ProductsList({ products, admin }) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const link = (slug) => `${window.location.origin}/p/${slug}`;
  const copy = async (slug) => { if (await copyText(link(slug))) { setCopied(slug); setTimeout(() => setCopied(""), 1500); } };
  const wa = (p) => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${p.name} ${link(p.slug)}`)}`, "_blank", "noopener");

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api(`/api/products/${p.slug}`, { method: "DELETE" }); router.refresh(); }
    catch (e) { setMsg("❌ " + e.message); }
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const r = await api("/api/products", { method: "POST", body: JSON.stringify(data) });
      setMsg(`✅ ${r.products.length} product(s) imported`); router.refresh();
    } catch (er) { setMsg("❌ " + (er.message || "Invalid JSON file")); }
    e.target.value = "";
  };

  return (
    <div className="sc-wrap">
      <div className="sc-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="sc-title">Products</h1>
          <p className="sc-sub">{products.length} product(s) · every product has its own shareable link</p>
        </div>
        <div className="sc-row">
          <button className="sc-btn sc-ghost sc-sm" onClick={() => downloadJson(products)}>⬇ Export JSON</button>
          {admin && (
            <>
              <button className="sc-btn sc-ghost sc-sm" onClick={() => fileRef.current?.click()}>⬆ Import JSON</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
              <Link href="/add-product" className="sc-btn sc-sm">+ Add Product</Link>
            </>
          )}
        </div>
      </div>
      {msg && <p className="sc-mut" style={{ margin: "0 0 16px" }}>{msg}</p>}

      {products.length === 0 && <div className="sc-box sc-empty">No products yet.</div>}

      <div className="sc-pgrid">
        {products.map((p, i) => (
          <motion.div key={p.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} whileHover={{ y: -6 }} className="sc-pcard">
            <Link href={`/p/${p.slug}`}><img src={p.image} alt={p.alt || p.name} /></Link>
            <b>{p.name}</b>
            <div className="sc-row" style={{ justifyContent: "space-between" }}>
              <span className="sc-price">${p.price}</span>
              <span className="sc-mut">{p.qty > 0 ? `${p.qty} in stock` : "Out of stock"}</span>
            </div>
            <div className="sc-row">
              <Link href={`/p/${p.slug}`} className="sc-btn sc-sm">View</Link>
              <button className="sc-btn sc-sm sc-ghost" onClick={() => copy(p.slug)}>{copied === p.slug ? "Copied ✓" : "🔗 Link"}</button>
              <button className="sc-btn sc-sm sc-ghost" onClick={() => wa(p)}>WhatsApp</button>
              {admin && <button className="sc-btn sc-sm sc-danger" onClick={() => del(p)}>🗑</button>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
