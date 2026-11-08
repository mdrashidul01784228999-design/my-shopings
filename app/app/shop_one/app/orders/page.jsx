"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/store";

const STATUS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  const fail = (e) => (e.message === "Unauthorized" ? router.push("/login") : setErr(e.message));
  useEffect(() => {
    api("/api/orders").then((d) => setOrders(d.orders)).catch(fail).finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((a, o) => a + o.total, 0);
  const setStatus = async (id, status) => {
    try { await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o))); }
    catch (e) { fail(e); }
  };
  const del = async (id) => {
    if (!confirm("Delete this order?")) return;
    try { await api(`/api/orders/${id}`, { method: "DELETE" }); setOrders((p) => p.filter((o) => o.id !== id)); }
    catch (e) { fail(e); }
  };

  return (
    <div className="sc-wrap">
      <h1 className="sc-title">Orders</h1>
      <p className="sc-sub">Orders placed by customers from your product links.</p>
      {err && <p className="sc-err">{err}</p>}

      <div className="sc-stats">
        <div><b>{orders.length}</b><span className="sc-mut">Total orders</span></div>
        <div><b>{orders.filter((o) => o.status === "Pending").length}</b><span className="sc-mut">Pending</span></div>
        <div><b>${revenue.toFixed(2)}</b><span className="sc-mut">Revenue</span></div>
      </div>

      {ready && orders.length === 0 && <div className="sc-box sc-empty">No orders yet. Share a <Link href="/products" style={{ color: "#22d3ee" }}>product link</Link> to get orders.</div>}

      <AnimatePresence>
        {orders.map((o) => (
          <motion.div key={o.id} layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }} className="sc-box sc-order">
            <img src={o.image} alt={o.productName} />
            <div>
              <b>{o.productName}</b> <span className={`sc-st ${o.status}`}>{o.status}</span>
              <p className="sc-mut">{o.id} · {new Date(o.createdAt).toLocaleString()}</p>
              <p className="sc-mut">👤 {o.customer.name} · 📞 <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a></p>
              <p className="sc-mut">📍 {o.customer.address}</p>
              <p style={{ marginTop: 4 }}>{o.qty} × ${o.price} = <span className="sc-price">${o.total.toFixed(2)}</span></p>
            </div>
            <div className="sc-row">
              <select className="sc-sel" style={{ width: "auto" }} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Link href={`/p/${o.slug}`} className="sc-btn sc-sm sc-ghost">Product</Link>
              <button className="sc-btn sc-sm sc-danger" onClick={() => del(o.id)}>🗑</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
