// Server-only JSON-file database (products, orders, uploaded images).
// Works on VPS / Docker / Render disk / Railway volume. For Vercel use a real DB (Supabase etc.).
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import seedProducts from "../data/products.json";

const DIR = process.env.DATA_DIR || path.join(process.cwd(), "storage");
const F = { products: path.join(DIR, "products.json"), orders: path.join(DIR, "orders.json") };
export const UPLOAD_DIR = path.join(DIR, "uploads");
export const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

let q = Promise.resolve(); // one write at a time
const lock = (fn) => { const r = q.then(fn); q = r.catch(() => {}); return r; };

async function read(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return fallback; throw e; }
}
async function write(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}
async function load() {
  const list = await read(F.products, null);
  if (list) return list;
  const seed = seedProducts.map(({ seed, ...p }) => p);
  await write(F.products, seed);
  return seed;
}

const text = (v, max) => String(v ?? "").trim().slice(0, max);
const link = (v) => (/^https?:\/\/\S+$/i.test(text(v, 300)) ? text(v, 300) : "");
const img = (v) => (/^(\/(?!\/)|https?:\/\/)\S+$/.test(text(v, 300)) ? text(v, 300) : "");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
const rand = () => Math.random().toString(36).slice(2, 6);

export const getProducts = async () => load();
export const getProductBySlug = async (slug) => (await load()).find((p) => p.slug === slug) || null;

// create (or update when a valid existing slug is given). Accepts one product or an array.
export const addProducts = (inputs) => lock(async () => {
  const list = await load();
  const out = [];
  for (const i of [].concat(inputs)) {
    const name = text(i?.name, 120);
    const price = Number(i?.price);
    if (!name || !(price >= 0)) continue;
    let slug = /^[a-z0-9-]{3,100}$/.test(i.slug || "") ? i.slug : "";
    const idx = slug ? list.findIndex((p) => p.slug === slug) : -1;
    while (!slug || (idx < 0 && list.some((p) => p.slug === slug))) slug = `${slugify(name)}-${rand()}`;
    const old = idx >= 0 ? list[idx] : null;
    const p = {
      id: old?.id || crypto.randomUUID(), slug, name,
      price: Math.round(price * 100) / 100,
      qty: Math.max(0, parseInt(i.qty) || 0),
      desc: text(i.desc, 2000), profile: link(i.profile), image: img(i.image), alt: text(i.alt, 160),
      seoTitle: text(i.seoTitle, 70) || name,
      seoDesc: text(i.seoDesc, 200) || text(i.desc, 155),
      keywords: text(i.keywords, 200),
      createdAt: old?.createdAt || Date.now(),
    };
    if (old) list[idx] = p; else list.unshift(p);
    out.push(p);
  }
  if (out.length) await write(F.products, list);
  return out;
});

export const deleteProduct = (slug) => lock(async () => {
  const list = await load();
  const next = list.filter((p) => p.slug !== slug);
  if (next.length === list.length) return false;
  await write(F.products, next);
  return true;
});

export const getOrders = async () => read(F.orders, []);

// price is always taken from the server, stock is checked + reduced atomically
export const createOrder = ({ slug, qty, customer }) => lock(async () => {
  const products = await load();
  const idx = products.findIndex((p) => p.slug === slug);
  if (idx < 0) return { error: "Product not found", status: 404 };
  const p = products[idx];
  const n = parseInt(qty);
  if (!(n >= 1)) return { error: "Invalid quantity", status: 400 };
  if (n > p.qty) return { error: p.qty > 0 ? `Only ${p.qty} left in stock` : "Out of stock", status: 409 };
  const c = { name: text(customer?.name, 80), phone: text(customer?.phone, 30), address: text(customer?.address, 300) };
  if (!c.name || !c.phone || !c.address) return { error: "Please fill name, phone and address", status: 400 };
  products[idx] = { ...p, qty: p.qty - n };
  const order = {
    id: "ORD-" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase(),
    productId: p.id, slug: p.slug, productName: p.name, image: p.image,
    price: p.price, qty: n, total: Math.round(p.price * n * 100) / 100,
    customer: c, status: "Pending", createdAt: Date.now(),
  };
  const orders = await read(F.orders, []);
  await write(F.products, products);
  await write(F.orders, [order, ...orders]);
  return { order };
});

export const setOrderStatus = (id, status) => lock(async () => {
  if (!STATUSES.includes(status)) return false;
  const orders = await read(F.orders, []);
  const o = orders.find((x) => x.id === id);
  if (!o) return false;
  o.status = status;
  await write(F.orders, orders);
  return true;
});

export const deleteOrder = (id) => lock(async () => {
  const orders = await read(F.orders, []);
  const next = orders.filter((o) => o.id !== id);
  if (next.length === orders.length) return false;
  await write(F.orders, next);
  return true;
});
