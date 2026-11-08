"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { slugify, resizeImage, api } from "../../lib/store";
import ShareButtons from "../../components/ShareButtons";

const EMPTY = { name: "", price: "", qty: 1, desc: "", profile: "", image: "", alt: "", seoTitle: "", seoDesc: "", keywords: "" };

export default function AddProduct() {
  const router = useRouter();
  const [f, setF] = useState(EMPTY);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const onImg = async (e) => {
    const file = e.target.files?.[0];
    if (file) set("image", await resizeImage(file));
  };

  const publish = async () => {
    if (!f.name.trim()) return setErr("Product name is required");
    if (!(Number(f.price) > 0)) return setErr("Enter a valid price");
    if (!f.image) return setErr("Please upload a product image");
    setBusy(true); setErr("");
    try {
      const { url } = await api("/api/upload", { method: "POST", body: JSON.stringify({ dataUrl: f.image }) });
      const { products } = await api("/api/products", { method: "POST", body: JSON.stringify({ ...f, image: url }) });
      setDone(products[0]); setF(EMPTY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (e.message === "Unauthorized") router.push("/login"); else setErr(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="sc-wrap">
      <h1 className="sc-title">Add New Product</h1>
      <p className="sc-sub">Fill the details and publish. A public, shareable product link is created automatically.</p>

      {done && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sc-box sc-ok" style={{ marginBottom: 24 }}>
          <b>✅ “{done.name}” published! Share this link:</b>
          <div style={{ marginTop: 12 }}><ShareButtons slug={done.slug} name={done.name} /></div>
          <div style={{ marginTop: 12 }}><Link className="sc-btn sc-sm sc-ghost" href={`/p/${done.slug}`}>Open product page ↗</Link></div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="sc-box sc-form">
        <label className="sc-drop">
          {f.image ? <img src={f.image} alt="preview" /> : <span>📷<br />Click to upload<br />product image</span>}
          <input type="file" accept="image/*" hidden onChange={onImg} />
        </label>

        <div>
          <div className="sc-field">
            <label>Product name *</label>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Red Sneakers" />
          </div>
          <div className="sc-two">
            <div className="sc-field">
              <label>Price ($) *</label>
              <input type="number" min="0" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
            </div>
            <div className="sc-field">
              <label>Quantity (stock)</label>
              <input type="number" min="1" value={f.qty} onChange={(e) => set("qty", e.target.value)} />
            </div>
          </div>
          <div className="sc-field">
            <label>Description</label>
            <textarea rows={3} value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Tell buyers about this product" />
          </div>
          <div className="sc-field">
            <label>Seller profile link</label>
            <input type="url" value={f.profile} onChange={(e) => set("profile", e.target.value)} placeholder="https://facebook.com/yourshop" />
          </div>
          <SeoBox f={f} set={set} />
          {err && <p className="sc-err">{err}</p>}
          <button className="sc-btn" disabled={busy} onClick={publish}>{busy ? "Publishing…" : "🚀 Publish Product"}</button>
        </div>
      </motion.div>
    </div>
  );
}

function SeoBox({ f, set }) {
  const title = f.seoTitle || f.name;
  const desc = f.seoDesc || f.desc;
  const kw = (f.keywords.split(",")[0] || "").trim().toLowerCase();
  const checks = [
    ["Title is 30–60 characters", title.length >= 30 && title.length <= 60],
    ["Description is 120–160 characters", desc.length >= 120 && desc.length <= 160],
    ["Image alt text added", f.alt.trim().length > 3],
    ["Main keyword is in the title", !!kw && title.toLowerCase().includes(kw)],
  ];
  const score = checks.filter((c) => c[1]).length;
  return (
    <div className="sc-seo">
      <h3>🔍 SEO (Google preview)</h3>
      <div className="sc-snip">
        <small>yourshop.com › p › {slugify(f.name || "product")}</small>
        <h4>{title || "Product title"}</h4>
        <p>{desc || "Your product description will appear here in Google search results."}</p>
      </div>
      <div className="sc-field">
        <label>SEO title <em>({title.length}/60)</em></label>
        <input value={f.seoTitle} maxLength={70} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Red Sneakers for Men – Comfortable & Stylish" />
      </div>
      <div className="sc-field">
        <label>Meta description <em>({desc.length}/160)</em></label>
        <textarea rows={2} maxLength={200} value={f.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} placeholder="Describe the product in 120–160 characters" />
      </div>
      <div className="sc-field">
        <label>Keywords (comma separated, first = main keyword)</label>
        <input value={f.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="red sneakers, men shoes, buy shoes online" />
      </div>
      <div className="sc-field">
        <label>Image alt text</label>
        <input value={f.alt} onChange={(e) => set("alt", e.target.value)} placeholder="Pair of red sneakers on white background" />
      </div>
      <div className="sc-chk">
        {checks.map(([t, ok]) => <span key={t} className={ok ? "ok" : ""}>{ok ? "✅" : "⬜"} {t}</span>)}
      </div>
      <p className="sc-score" style={{ color: score >= 3 ? "#34d399" : "#fbbf24" }}>SEO score: {score}/4</p>
    </div>
  );
}
