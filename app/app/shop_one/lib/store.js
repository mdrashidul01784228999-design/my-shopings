"use client";

export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";

// fetch wrapper: throws Error(message) on non-2xx
export async function api(url, opts = {}) {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, cache: "no-store", ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

// shrink image before upload
export function resizeImage(file, max = 900) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = img.width * s; c.height = img.height * s;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export const copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };

export const downloadJson = (data, name = "products.json") => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
};
