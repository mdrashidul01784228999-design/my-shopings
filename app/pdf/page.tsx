
"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Hind_Siliguri } from "next/font/google";

const font = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"] });

type Item = { id: string; name: string; url: string; blob: Blob; w: number; h: number; k: number };
type Fmt = "png" | "jpg" | "webp";

const MIME: Record<Fmt, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const uid = () => Math.random().toString(36).slice(2);
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/* ---------------- helpers ---------------- */

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

function toBlob(c: HTMLCanvasElement, type: string, q?: number): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), type, q));
}

function save(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const free = (items: Item[]) => items.forEach((i) => URL.revokeObjectURL(i.url));

// PDF -> images, rendered locally (worker is bundled, no CDN)
async function pdfToImages(file: File, scale: number, fmt: Fmt, quality: number, range: string, onProgress: (p: string) => void) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const base = file.name.replace(/\.pdf$/i, "");
  const out: Item[] = [];

  const pages = parseRange(range, pdf.numPages);
  if (!pages.length) throw new Error("range");
  for (const [n, i] of pages.entries()) {
    onProgress(`পেজ ${i} (${n + 1} / ${pages.length})`);
    const page = await pdf.getPage(i);
    const one = page.getViewport({ scale: 1 });
    let s = scale;
    while (one.width * s * one.height * s > 80_000_000 && s > 1) s -= 0.5; // browser canvas safety limit
    const viewport = page.getViewport({ scale: s });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    await page.render({ canvasContext: ctx, viewport, background: "#ffffff" } as any).promise;
    const blob = await toBlob(canvas, MIME[fmt], fmt === "png" ? undefined : quality);
    out.push({
      id: uid(),
      name: `${base}-page-${i}.${fmt}`,
      url: URL.createObjectURL(blob),
      blob,
      w: canvas.width,
      h: canvas.height,
      k: s,
    });
    canvas.width = canvas.height = 0;
    page.cleanup();
  }
  return out;
}

// Image file -> Item. JPEG/PNG keep original bytes (no quality loss); others become lossless PNG.
async function imageFileToItem(file: File): Promise<Item> {
  let blob: Blob = file;
  let url = URL.createObjectURL(file);
  const img = await loadImage(url);
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    blob = await toBlob(c, "image/png");
    URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
  }
  return { id: uid(), name: file.name, url, blob, w: img.naturalWidth, h: img.naturalHeight, k: 1 };
}

// Low-size mode: shrink to 1600px max and re-encode as JPEG 60% (white background)
async function compressItem(it: Item): Promise<Blob> {
  const img = await loadImage(it.url);
  const r = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * r);
  c.height = Math.round(img.naturalHeight * r);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return toBlob(c, "image/jpeg", 0.6);
}

async function itemsToPdf(items: Item[], size: "fit" | "a4", mode: "high" | "low"): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const it of items) {
    let blob = mode === "low" ? await compressItem(it) : it.blob;
    if (blob.type !== "image/png" && blob.type !== "image/jpeg") {
      const img = await loadImage(it.url);
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      blob = await toBlob(c, "image/png");
    }
    const bytes = await blob.arrayBuffer();
    const img = blob.type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

    if (size === "fit") {
      const page = pdf.addPage([it.w / it.k, it.h / it.k]);
      page.drawImage(img, { x: 0, y: 0, width: it.w / it.k, height: it.h / it.k });
    } else {
      const land = it.w > it.h;
      const [pw, ph] = land ? [841.89, 595.28] : [595.28, 841.89];
      const m = 24;
      const r = Math.min((pw - 2 * m) / it.w, (ph - 2 * m) / it.h);
      const w = it.w * r;
      const h = it.h * r;
      const page = pdf.addPage([pw, ph]);
      page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
  }
  return pdf.save();
}

// "1-3, 5" -> [1,2,3,5]; empty = all pages
function parseRange(s: string, n: number): number[] {
  if (!s.trim()) return Array.from({ length: n }, (_, i) => i + 1);
  const set = new Set<number>();
  for (const part of s.split(",")) {
    const [a, b] = part.split("-").map((x) => parseInt(x.trim(), 10));
    if (isNaN(a)) continue;
    const end = isNaN(b) ? a : b;
    for (let i = Math.min(a, end); i <= Math.max(a, end); i++) if (i >= 1 && i <= n) set.add(i);
  }
  return [...set].sort((x, y) => x - y);
}

async function rotateItem(it: Item): Promise<Item> {
  const img = await loadImage(it.url);
  const c = document.createElement("canvas");
  c.width = img.naturalHeight;
  c.height = img.naturalWidth;
  const ctx = c.getContext("2d")!;
  ctx.translate(c.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, 0, 0);
  const blob = await toBlob(c, "image/png");
  URL.revokeObjectURL(it.url);
  return { ...it, blob, url: URL.createObjectURL(blob), w: c.width, h: c.height, name: it.name.replace(/\.[^.]+$/, "") + ".png" };
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

/* ---------------- small UI parts ---------------- */

function Pills<T extends string | number>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-[#E4EAE8] p-1">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition sm:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F766E] ${
            value === v ? "bg-[#0F2A2E] text-white shadow" : "text-[#3B5256] hover:text-[#0F2A2E]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Drop({ accept, multiple, onFiles, title, hint }: {
  accept: string; multiple?: boolean; onFiles: (f: FileList) => void; title: string; hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-12 text-center sm:py-20 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F766E] ${
        over ? "border-[#0F766E] bg-[#DDEFEB]" : "border-[#B9C6C3] bg-white hover:border-[#0F766E]"
      }`}
    >
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2A2E] text-2xl text-[#F2C879]">↑</span>
      <p className="text-lg font-semibold text-[#0F2A2E]">{title}</p>
      <p className="mt-1 text-sm text-[#5B7075]">{hint}</p>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }}
      />
    </div>
  );
}

function SortableGrid({ items, setItems, onDownload, onRotate }: {
  items: Item[]; setItems: (i: Item[]) => void; onDownload?: (i: Item) => void; onRotate?: (id: string) => void;
}) {
  const drag = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const setSerial = (from: number, v: string) => {
    const n = parseInt(v, 10);
    if (isNaN(n)) return;
    const to = Math.min(Math.max(n, 1), items.length) - 1;
    if (to !== from) setItems(move(items, from, to));
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it.id}
          draggable
          onDragStart={() => (drag.current = i)}
          onDragOver={(e) => { e.preventDefault(); setOver(i); }}
          onDragLeave={() => setOver(null)}
          onDrop={() => {
            if (drag.current !== null && drag.current !== i) setItems(move(items, drag.current, i));
            drag.current = null; setOver(null);
          }}
          onDragEnd={() => { drag.current = null; setOver(null); }}
          className={`group relative cursor-grab rounded-2xl bg-white p-2.5 shadow-[0_1px_2px_rgba(15,42,46,.08),0_8px_24px_-12px_rgba(15,42,46,.25)] active:cursor-grabbing ${
            over === i ? "ring-2 ring-[#0F766E]" : "ring-1 ring-[#DCE3E1]"
          }`}
        >
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#0F2A2E] px-2.5 py-0.5 text-xs font-semibold text-white">{i + 1}</span>
          <button
            onClick={() => { URL.revokeObjectURL(it.url); setItems(items.filter((x) => x.id !== it.id)); }}
            className="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-sm text-[#9B2C2C] shadow opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="সরান"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.url} alt={it.name} draggable={false} className="h-32 w-full rounded-xl sm:h-48 bg-[#F2F4F3] object-contain" />
          <p className="mt-2 truncate text-sm font-medium text-[#0F2A2E]" title={it.name}>{it.name}</p>
          <p className="text-xs text-[#5B7075]">{it.w}×{it.h} px · {kb(it.blob.size)}</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              key={`${it.id}-${i}`}
              type="number" min={1} max={items.length} defaultValue={i + 1}
              aria-label="ক্রম"
              onBlur={(e) => setSerial(i, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-14 rounded-lg border border-[#CBD5D2] px-2 py-1 text-sm"
            />
            {onRotate && (
              <button onClick={() => onRotate(it.id)} aria-label="৯০° ঘোরান" title="৯০° ঘোরান"
                className="rounded-lg border border-[#CBD5D2] px-2 py-1 text-sm hover:bg-[#F2F4F3]">↻</button>
            )}
            {onDownload && (
              <button onClick={() => onDownload(it)} className="ml-auto rounded-lg bg-[#0F766E] px-3 py-1 text-sm font-medium text-white hover:bg-[#0B5E58]">
                সেভ
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Page() {
  const [tab, setTab] = useState<"pdf2img" | "img2pdf">("pdf2img");
  const [pdfPages, setPdfPages] = useState<Item[]>([]);
  const [images, setImages] = useState<Item[]>([]);
  const [scale, setScale] = useState(3);
  const [fmt, setFmt] = useState<Fmt>("png");
  const [quality, setQuality] = useState(0.95);
  const [note, setNote] = useState("");
  const [range, setRange] = useState("");
  const [pageSize, setPageSize] = useState<"fit" | "a4">("fit");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const busy = status !== "";

  const handlePdf = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setError(""); setStatus("পড়া হচ্ছে…");
    try {
      free(pdfPages);
      setPdfPages(await pdfToImages(file, scale, fmt, quality, range, setStatus));
    } catch (e) {
      console.error(e);
      setError("PDF পড়া যায়নি। পেজ রেঞ্জ ঠিক আছে কিনা দেখুন, অথবা ফাইলটি নষ্ট/পাসওয়ার্ড দেওয়া হতে পারে।");
    }
    setStatus("");
  };

  const handleImages = async (files: FileList) => {
    setError(""); setStatus("ছবি লোড হচ্ছে…");
    try {
      const list = await Promise.all(Array.from(files).map(imageFileToItem));
      setImages((p) => [...p, ...list]);
    } catch (e) {
      console.error(e);
      setError("ছবি লোড করা যায়নি। অন্য ফরম্যাটে চেষ্টা করুন।");
    }
    setStatus("");
  };

  const makePdf = async (items: Item[], name: string, mode: "high" | "low") => {
    if (!items.length) return;
    setError(""); setNote(""); setStatus(mode === "low" ? "ছোট সাইজের PDF তৈরি হচ্ছে…" : "হাই কোয়ালিটি PDF তৈরি হচ্ছে…");
    try {
      const bytes = await itemsToPdf(items, pageSize, mode);
      setNote(`PDF তৈরি হয়েছে · ${kb(bytes.byteLength)}`);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      save(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error(e);
      setError("PDF তৈরি করা যায়নি।");
    }
    setStatus("");
  };

  const downloadZip = async (items: Item[]) => {
    setStatus("ZIP তৈরি হচ্ছে…");
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      items.forEach((it, i) => zip.file(`${String(i + 1).padStart(2, "0")}-${it.name}`, it.blob));
      const url = URL.createObjectURL(await zip.generateAsync({ type: "blob", compression: "STORE" }));
      save(url, "images.zip");
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error(e);
      setError("ZIP তৈরি করা যায়নি।");
    }
    setStatus("");
  };

  const rotate = async (list: Item[], set: (i: Item[]) => void, id: string) => {
    const t = list.find((x) => x.id === id);
    if (!t) return;
    const r = await rotateItem(t);
    set(list.map((x) => (x.id === id ? r : x)));
  };

  const pdfBtns = (items: Item[], name: string) => (
    <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
      <button disabled={busy} onClick={() => makePdf(items, name, "high")}
        className="rounded-2xl bg-[#0F2A2E] px-5 py-3 text-left text-white shadow-lg shadow-[#0F2A2E]/20 transition hover:bg-[#16393F] disabled:opacity-50">
        <span className="block text-sm font-semibold">PDF · হাই কোয়ালিটি</span>
        <span className="block text-xs text-white/70">অরিজিনাল মান, সাইজ বড়</span>
      </button>
      <button disabled={busy} onClick={() => makePdf(items, name.replace(".pdf", "-small.pdf"), "low")}
        className="rounded-2xl bg-[#F2C879] px-5 py-3 text-left text-[#0F2A2E] shadow-lg shadow-[#F2C879]/30 transition hover:bg-[#EDBB5E] disabled:opacity-50">
        <span className="block text-sm font-semibold">PDF · ছোট সাইজ</span>
        <span className="block text-xs text-[#0F2A2E]/70">শেয়ার ও ইমেইলের জন্য, ৫–১০ গুণ ছোট</span>
      </button>
    </div>
  );

  const ghost = "rounded-full px-5 py-2.5 text-sm font-medium text-[#46605F] ring-1 ring-[#B9C6C3] hover:bg-white";

  return (
    <main className={`${font.className} min-h-screen bg-[radial-gradient(60rem_30rem_at_85%_-10%,#CFE6E1,transparent),radial-gradient(40rem_25rem_at_-10%_10%,#F6E7C6,transparent)] bg-[#F2F4F3] text-[#0F2A2E]`}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">PDF আর ছবি, একটাকে আরেকটায় বদলান</h1>
          <p className="mt-4 text-base leading-relaxed text-[#46605F] sm:text-lg">
            সব কাজ আপনার ডিভাইসেই হয়। ফাইল কোনো সার্ভারে যায় না, তাই গোপনীয় কাগজপত্রও নিশ্চিন্তে বদলাতে পারেন।
          </p>
          <ul className="mt-5 flex flex-wrap gap-2 text-sm text-[#0F2A2E]">
            {["সম্পূর্ণ ফ্রি", "আপলোড ছাড়াই", "4x পর্যন্ত রেজুলেশন", "লো ও হাই সাইজ PDF"].map((t) => (
              <li key={t} className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-[#D4DDDA] backdrop-blur">{t}</li>
            ))}
          </ul>
        </header>

        <div className="mt-8 rounded-3xl bg-white/70 p-4 shadow-[0_20px_50px_-30px_rgba(15,42,46,.4)] ring-1 ring-white backdrop-blur sm:mt-10 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Pills value={tab} onChange={setTab} options={[["pdf2img", "PDF থেকে ছবি"], ["img2pdf", "ছবি থেকে PDF"]]} />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {tab === "pdf2img" ? (
                <>
                  <Pills value={scale} onChange={setScale} options={[[2, "ভালো"], [3, "হাই"], [4, "আল্ট্রা"]]} />
                  <Pills value={fmt} onChange={setFmt} options={[["png", "PNG"], ["jpg", "JPG"], ["webp", "WebP"]]} />
                  <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="পেজ: 1-3, 5 (খালি = সব)"
                    aria-label="পেজ রেঞ্জ" className="w-full rounded-full border border-[#B9C6C3] bg-white px-4 py-1.5 text-sm sm:w-52" />
                  {fmt !== "png" && (
                    <label className="flex items-center gap-2 text-sm text-[#46605F]">
                      কোয়ালিটি {Math.round(quality * 100)}%
                      <input type="range" min={0.6} max={1} step={0.01} value={quality}
                        onChange={(e) => setQuality(+e.target.value)} className="min-w-0 flex-1 accent-[#0F766E]" />
                    </label>
                  )}
                </>
              ) : (
                <Pills value={pageSize} onChange={setPageSize} options={[["fit", "ছবির মাপে"], ["a4", "A4 পেজ"]]} />
              )}
            </div>
          </div>

          <div className="min-h-6 pt-4" aria-live="polite">
            {busy && <p className="text-sm font-medium text-[#0F766E]">{status}</p>}
            {note && !busy && <p className="text-sm font-medium text-[#0F766E]">{note}</p>}
            {error && <p className="text-sm font-medium text-[#9B2C2C]">{error}</p>}
          </div>

          <section className="mt-2">
            {tab === "pdf2img" ? (
              !pdfPages.length ? (
                <Drop accept="application/pdf" onFiles={handlePdf} title="PDF এখানে ছেড়ে দিন বা ক্লিক করুন"
                  hint={`প্রতি পেজ ${scale}x রেজুলেশনে ${fmt.toUpperCase()} ছবি হবে`} />
              ) : (
                <>
                  <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-3">
                      <button disabled={busy} onClick={() => downloadZip(pdfPages)}
                        className="rounded-full bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B5E58] disabled:opacity-50">
                        সব ছবি ZIP করে নামান
                      </button>
                      <button onClick={() => { free(pdfPages); setPdfPages([]); setNote(""); }} className={ghost}>মুছে ফেলুন</button>
                    </div>
                    {pdfBtns(pdfPages, "reordered.pdf")}
                  </div>
                  <p className="mb-4 text-sm text-[#5B7075]">টেনে এনে পেজ সাজান, অথবা ক্রম বক্সে নম্বর লিখে Enter চাপুন।</p>
                  <SortableGrid items={pdfPages} setItems={setPdfPages} onRotate={(id) => rotate(pdfPages, setPdfPages, id)}
                    onDownload={(it) => save(it.url, it.name)} />
                </>
              )
            ) : (
              <>
                <Drop accept="image/*" multiple onFiles={handleImages} title="ছবি এখানে ছেড়ে দিন বা ক্লিক করুন"
                  hint="JPG ও PNG অরিজিনাল কোয়ালিটিতেই PDF-এ বসে, একসাথে অনেক ছবি দেওয়া যায়" />
                {images.length > 0 && (
                  <>
                    <div className="my-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <button onClick={() => { free(images); setImages([]); setNote(""); }} className={`${ghost} self-start`}>
                        মুছে ফেলুন ({images.length} ছবি)
                      </button>
                      {pdfBtns(images, "images.pdf")}
                    </div>
                    <SortableGrid items={images} setItems={setImages} onRotate={(id) => rotate(images, setImages, id)} />
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// "use client";

// import { useRef, useState } from "react";
// import { PDFDocument } from "pdf-lib";

// type Item = { id: string; name: string; url: string; w: number; h: number };

// const uid = () => Math.random().toString(36).slice(2);

// /* ---------------- helpers ---------------- */

// function fileToDataUrl(file: File): Promise<string> {
//   return new Promise((res, rej) => {
//     const r = new FileReader();
//     r.onload = () => res(r.result as string);
//     r.onerror = rej;
//     r.readAsDataURL(file);
//   });
// }

// function loadImage(url: string): Promise<HTMLImageElement> {
//   return new Promise((res, rej) => {
//     const img = new Image();
//     img.onload = () => res(img);
//     img.onerror = rej;
//     img.src = url;
//   });
// }

// function download(url: string, name: string) {
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = name;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
// }

// // PDF -> list of PNG images (one per page)
// async function pdfToImages(file: File, scale = 2): Promise<Item[]> {
//   const pdfjs = await import("pdfjs-dist");
//   pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

//   const data = await file.arrayBuffer();
//   const pdf = await pdfjs.getDocument({ data }).promise;
//   const base = file.name.replace(/\.pdf$/i, "");
//   const out: Item[] = [];

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const viewport = page.getViewport({ scale });
//     const canvas = document.createElement("canvas");
//     canvas.width = viewport.width;
//     canvas.height = viewport.height;
//     const ctx = canvas.getContext("2d")!;
//     await page.render({ canvasContext: ctx, viewport } as any).promise;
//     out.push({
//       id: uid(),
//       name: `${base}-page-${i}.png`,
//       url: canvas.toDataURL("image/png"),
//       w: canvas.width,
//       h: canvas.height,
//     });
//   }
//   return out;
// }

// // Image file -> Item (jpeg/png kept, others converted to png)
// async function imageFileToItem(file: File): Promise<Item> {
//   let url = await fileToDataUrl(file);
//   const img = await loadImage(url);
//   if (!/^data:image\/(png|jpeg)/.test(url)) {
//     const c = document.createElement("canvas");
//     c.width = img.naturalWidth;
//     c.height = img.naturalHeight;
//     c.getContext("2d")!.drawImage(img, 0, 0);
//     url = c.toDataURL("image/png");
//   }
//   return { id: uid(), name: file.name, url, w: img.naturalWidth, h: img.naturalHeight };
// }

// // Items (in current order) -> PDF bytes
// async function itemsToPdf(items: Item[]): Promise<Uint8Array> {
//   const pdf = await PDFDocument.create();
//   for (const it of items) {
//     const bytes = await (await fetch(it.url)).arrayBuffer();
//     const img = it.url.startsWith("data:image/png")
//       ? await pdf.embedPng(bytes)
//       : await pdf.embedJpg(bytes);
//     const page = pdf.addPage([it.w, it.h]);
//     page.drawImage(img, { x: 0, y: 0, width: it.w, height: it.h });
//   }
//   return pdf.save();
// }

// function move<T>(arr: T[], from: number, to: number): T[] {
//   const copy = [...arr];
//   const [x] = copy.splice(from, 1);
//   copy.splice(to, 0, x);
//   return copy;
// }

// /* ---------------- sortable grid ---------------- */

// function SortableGrid({
//   items,
//   setItems,
//   onDownload,
// }: {
//   items: Item[];
//   setItems: (i: Item[]) => void;
//   onDownload?: (i: Item) => void;
// }) {
//   const dragIndex = useRef<number | null>(null);
//   const [overIndex, setOverIndex] = useState<number | null>(null);

//   const setSerial = (from: number, value: string) => {
//     const n = parseInt(value, 10);
//     if (isNaN(n)) return;
//     const to = Math.min(Math.max(n, 1), items.length) - 1;
//     if (to !== from) setItems(move(items, from, to));
//   };

//   return (
//     <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
//       {items.map((it, i) => (
//         <div
//           key={it.id}
//           draggable
//           onDragStart={() => (dragIndex.current = i)}
//           onDragOver={(e) => {
//             e.preventDefault();
//             setOverIndex(i);
//           }}
//           onDragLeave={() => setOverIndex(null)}
//           onDrop={() => {
//             if (dragIndex.current !== null && dragIndex.current !== i) {
//               setItems(move(items, dragIndex.current, i));
//             }
//             dragIndex.current = null;
//             setOverIndex(null);
//           }}
//           onDragEnd={() => {
//             dragIndex.current = null;
//             setOverIndex(null);
//           }}
//           className={`relative cursor-grab rounded-lg border bg-white p-2 shadow-sm active:cursor-grabbing ${
//             overIndex === i ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"
//           }`}
//         >
//           {/* serial number badge */}
//           <span className="absolute left-1 top-1 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
//             {i + 1}
//           </span>

//           <button
//             onClick={() => setItems(items.filter((x) => x.id !== it.id))}
//             className="absolute right-1 top-1 z-10 rounded-full bg-red-500 px-2 text-xs font-bold text-white"
//             title="Remove"
//           >
//             ×
//           </button>

//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={it.url}
//             alt={it.name}
//             draggable={false}
//             className="h-44 w-full rounded object-contain bg-gray-50"
//           />

//           <p className="mt-1 truncate text-xs text-gray-600" title={it.name}>
//             {it.name}
//           </p>

//           <div className="mt-2 flex items-center gap-2">
//             <label className="text-xs text-gray-500">Serial</label>
//             <input
//               key={`${it.id}-${i}`}
//               type="number"
//               min={1}
//               max={items.length}
//               defaultValue={i + 1}
//               onBlur={(e) => setSerial(i, e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//               }}
//               className="w-14 rounded border px-1 py-0.5 text-sm"
//             />
//             {onDownload && (
//               <button
//                 onClick={() => onDownload(it)}
//                 className="ml-auto rounded bg-gray-800 px-2 py-0.5 text-xs text-white"
//               >
//                 Save
//               </button>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ---------------- page ---------------- */

// export default function Page() {
//   const [tab, setTab] = useState<"pdf2img" | "img2pdf">("pdf2img");
//   const [pdfPages, setPdfPages] = useState<Item[]>([]);
//   const [images, setImages] = useState<Item[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handlePdf = async (file?: File) => {
//     if (!file) return;
//     setLoading(true);
//     setError("");
//     try {
//       setPdfPages(await pdfToImages(file));
//     } catch (e) {
//       console.error(e);
//       setError("PDF read করতে সমস্যা হয়েছে।");
//     }
//     setLoading(false);
//   };

//   const handleImages = async (files: FileList | null) => {
//     if (!files?.length) return;
//     setLoading(true);
//     setError("");
//     try {
//       const list = await Promise.all(Array.from(files).map(imageFileToItem));
//       setImages((prev) => [...prev, ...list]);
//     } catch (e) {
//       console.error(e);
//       setError("Image load করতে সমস্যা হয়েছে।");
//     }
//     setLoading(false);
//   };

//   const makePdf = async (items: Item[], name: string) => {
//     if (!items.length) return;
//     setLoading(true);
//     try {
//       const bytes = await itemsToPdf(items);
//       const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);
//       download(url, name);
//       setTimeout(() => URL.revokeObjectURL(url), 5000);
//     } catch (e) {
//       console.error(e);
//       setError("PDF বানাতে সমস্যা হয়েছে।");
//     }
//     setLoading(false);
//   };

//   const downloadAll = async (items: Item[]) => {
//     for (let i = 0; i < items.length; i++) {
//       const ext = items[i].name.split(".").pop() || "png";
//       download(items[i].url, `${String(i + 1).padStart(2, "0")}-${items[i].name.replace(/\.[^.]+$/, "")}.${ext}`);
//       await new Promise((r) => setTimeout(r, 300));
//     }
//   };

//   return (
//     <main className="mx-auto max-w-6xl p-6">
//       <h1 className="mb-4 text-2xl font-bold">PDF ⇄ Image Converter</h1>

//       {/* tabs */}
//       <div className="mb-6 flex gap-2">
//         {(
//           [
//             ["pdf2img", "PDF → Image"],
//             ["img2pdf", "Image → PDF"],
//           ] as const
//         ).map(([key, label]) => (
//           <button
//             key={key}
//             onClick={() => setTab(key)}
//             className={`rounded px-4 py-2 text-sm font-medium ${
//               tab === key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
//             }`}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       {loading && <p className="mb-3 text-sm text-blue-600">Processing...</p>}
//       {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

//       {/* ---------- PDF -> Image ---------- */}
//       {tab === "pdf2img" && (
//         <section>
//           <input
//             type="file"
//             accept="application/pdf"
//             onChange={(e) => handlePdf(e.target.files?.[0])}
//             className="mb-4 block"
//           />

//           {pdfPages.length > 0 && (
//             <>
//               <div className="mb-4 flex flex-wrap gap-2">
//                 <button
//                   onClick={() => downloadAll(pdfPages)}
//                   className="rounded bg-green-600 px-3 py-1.5 text-sm text-white"
//                 >
//                   সব Image download
//                 </button>
//                 <button
//                   onClick={() => makePdf(pdfPages, "reordered.pdf")}
//                   className="rounded bg-purple-600 px-3 py-1.5 text-sm text-white"
//                 >
//                   নতুন order এ PDF বানাও
//                 </button>
//                 <button
//                   onClick={() => setPdfPages([])}
//                   className="rounded bg-gray-300 px-3 py-1.5 text-sm"
//                 >
//                   Clear
//                 </button>
//               </div>
//               <p className="mb-3 text-xs text-gray-500">
//                 Drag করে page সাজান, অথবা Serial box এ নম্বর লিখে Enter চাপুন।
//               </p>
//               <SortableGrid
//                 items={pdfPages}
//                 setItems={setPdfPages}
//                 onDownload={(it) => download(it.url, it.name)}
//               />
//             </>
//           )}
//         </section>
//       )}

//       {/* ---------- Image -> PDF ---------- */}
//       {tab === "img2pdf" && (
//         <section>
//           <input
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(e) => {
//               handleImages(e.target.files);
//               e.target.value = "";
//             }}
//             className="mb-4 block"
//           />

//           {images.length > 0 && (
//             <>
//               <div className="mb-4 flex flex-wrap gap-2">
//                 <button
//                   onClick={() => makePdf(images, "images.pdf")}
//                   className="rounded bg-green-600 px-3 py-1.5 text-sm text-white"
//                 >
//                   PDF বানাও ({images.length} page)
//                 </button>
//                 <button
//                   onClick={() => setImages([])}
//                   className="rounded bg-gray-300 px-3 py-1.5 text-sm"
//                 >
//                   Clear
//                 </button>
//               </div>
//               <p className="mb-3 text-xs text-gray-500">
//                 Drag করে serial ঠিক করুন, অথবা Serial box এ নম্বর লিখে Enter চাপুন।
//               </p>
//               <SortableGrid items={images} setItems={setImages} />
//             </>
//           )}
//         </section>
//       )}
//     </main>
//   );
// }
