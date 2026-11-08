
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// local dev fallback (Vercel-e persistent noy, tai Redis lagbe)
const mem = globalThis.__shopcube_mem || (globalThis.__shopcube_mem = new Map());
const idx = globalThis.__shopcube_idx || (globalThis.__shopcube_idx = { products: [], shops: [] });

export const hasDb = Boolean(redis);
export const canStore = hasDb || !process.env.VERCEL;

export async function setKey(key, value) {
  if (redis) await redis.set(key, value);
  else mem.set(key, value);
}

export async function getKey(key) {
  if (redis) return (await redis.get(key)) ?? null;
  return mem.get(key) ?? null;
}

// sitemap-er jonno index (kind = "products" | "shops")
export async function addIndex(kind, id) {
  if (redis) await redis.lpush(`idx:${kind}`, id);
  else idx[kind].unshift(id);
}

export async function listIndex(kind, n = 2000) {
  if (redis) return (await redis.lrange(`idx:${kind}`, 0, n - 1)) || [];
  return idx[kind].slice(0, n);
}

export const validId = (id) => typeof id === "string" && /^[A-Za-z0-9_-]{6,16}$/.test(id);

export function safeUrl(v) {
  if (!v || typeof v !== "string") return "";
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}
