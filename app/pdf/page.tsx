"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

type Item = { id: string; name: string; url: string; w: number; h: number };

const uid = () => Math.random().toString(36).slice(2);

/* ---------------- helpers ---------------- */

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// PDF -> list of PNG images (one per page)
async function pdfToImages(file: File, scale = 2): Promise<Item[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const base = file.name.replace(/\.pdf$/i, "");
  const out: Item[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport } as any).promise;
    out.push({
      id: uid(),
      name: `${base}-page-${i}.png`,
      url: canvas.toDataURL("image/png"),
      w: canvas.width,
      h: canvas.height,
    });
  }
  return out;
}

// Image file -> Item (jpeg/png kept, others converted to png)
async function imageFileToItem(file: File): Promise<Item> {
  let url = await fileToDataUrl(file);
  const img = await loadImage(url);
  if (!/^data:image\/(png|jpeg)/.test(url)) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d")!.drawImage(img, 0, 0);
    url = c.toDataURL("image/png");
  }
  return { id: uid(), name: file.name, url, w: img.naturalWidth, h: img.naturalHeight };
}

// Items (in current order) -> PDF bytes
async function itemsToPdf(items: Item[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (const it of items) {
    const bytes = await (await fetch(it.url)).arrayBuffer();
    const img = it.url.startsWith("data:image/png")
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes);
    const page = pdf.addPage([it.w, it.h]);
    page.drawImage(img, { x: 0, y: 0, width: it.w, height: it.h });
  }
  return pdf.save();
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

/* ---------------- sortable grid ---------------- */

function SortableGrid({
  items,
  setItems,
  onDownload,
}: {
  items: Item[];
  setItems: (i: Item[]) => void;
  onDownload?: (i: Item) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const setSerial = (from: number, value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    const to = Math.min(Math.max(n, 1), items.length) - 1;
    if (to !== from) setItems(move(items, from, to));
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it, i) => (
        <div
          key={it.id}
          draggable
          onDragStart={() => (dragIndex.current = i)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(i);
          }}
          onDragLeave={() => setOverIndex(null)}
          onDrop={() => {
            if (dragIndex.current !== null && dragIndex.current !== i) {
              setItems(move(items, dragIndex.current, i));
            }
            dragIndex.current = null;
            setOverIndex(null);
          }}
          onDragEnd={() => {
            dragIndex.current = null;
            setOverIndex(null);
          }}
          className={`relative cursor-grab rounded-lg border bg-white p-2 shadow-sm active:cursor-grabbing ${
            overIndex === i ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"
          }`}
        >
          {/* serial number badge */}
          <span className="absolute left-1 top-1 z-10 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
            {i + 1}
          </span>

          <button
            onClick={() => setItems(items.filter((x) => x.id !== it.id))}
            className="absolute right-1 top-1 z-10 rounded-full bg-red-500 px-2 text-xs font-bold text-white"
            title="Remove"
          >
            ×
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.url}
            alt={it.name}
            draggable={false}
            className="h-44 w-full rounded object-contain bg-gray-50"
          />

          <p className="mt-1 truncate text-xs text-gray-600" title={it.name}>
            {it.name}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-gray-500">Serial</label>
            <input
              key={`${it.id}-${i}`}
              type="number"
              min={1}
              max={items.length}
              defaultValue={i + 1}
              onBlur={(e) => setSerial(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-14 rounded border px-1 py-0.5 text-sm"
            />
            {onDownload && (
              <button
                onClick={() => onDownload(it)}
                className="ml-auto rounded bg-gray-800 px-2 py-0.5 text-xs text-white"
              >
                Save
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePdf = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setPdfPages(await pdfToImages(file));
    } catch (e) {
      console.error(e);
      setError("PDF read করতে সমস্যা হয়েছে।");
    }
    setLoading(false);
  };

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setLoading(true);
    setError("");
    try {
      const list = await Promise.all(Array.from(files).map(imageFileToItem));
      setImages((prev) => [...prev, ...list]);
    } catch (e) {
      console.error(e);
      setError("Image load করতে সমস্যা হয়েছে।");
    }
    setLoading(false);
  };

  const makePdf = async (items: Item[], name: string) => {
    if (!items.length) return;
    setLoading(true);
    try {
      const bytes = await itemsToPdf(items);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      download(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error(e);
      setError("PDF বানাতে সমস্যা হয়েছে।");
    }
    setLoading(false);
  };

  const downloadAll = async (items: Item[]) => {
    for (let i = 0; i < items.length; i++) {
      const ext = items[i].name.split(".").pop() || "png";
      download(items[i].url, `${String(i + 1).padStart(2, "0")}-${items[i].name.replace(/\.[^.]+$/, "")}.${ext}`);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">PDF ⇄ Image Converter</h1>

      {/* tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            ["pdf2img", "PDF → Image"],
            ["img2pdf", "Image → PDF"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded px-4 py-2 text-sm font-medium ${
              tab === key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="mb-3 text-sm text-blue-600">Processing...</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {/* ---------- PDF -> Image ---------- */}
      {tab === "pdf2img" && (
        <section>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handlePdf(e.target.files?.[0])}
            className="mb-4 block"
          />

          {pdfPages.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => downloadAll(pdfPages)}
                  className="rounded bg-green-600 px-3 py-1.5 text-sm text-white"
                >
                  সব Image download
                </button>
                <button
                  onClick={() => makePdf(pdfPages, "reordered.pdf")}
                  className="rounded bg-purple-600 px-3 py-1.5 text-sm text-white"
                >
                  নতুন order এ PDF বানাও
                </button>
                <button
                  onClick={() => setPdfPages([])}
                  className="rounded bg-gray-300 px-3 py-1.5 text-sm"
                >
                  Clear
                </button>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Drag করে page সাজান, অথবা Serial box এ নম্বর লিখে Enter চাপুন।
              </p>
              <SortableGrid
                items={pdfPages}
                setItems={setPdfPages}
                onDownload={(it) => download(it.url, it.name)}
              />
            </>
          )}
        </section>
      )}

      {/* ---------- Image -> PDF ---------- */}
      {tab === "img2pdf" && (
        <section>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleImages(e.target.files);
              e.target.value = "";
            }}
            className="mb-4 block"
          />

          {images.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => makePdf(images, "images.pdf")}
                  className="rounded bg-green-600 px-3 py-1.5 text-sm text-white"
                >
                  PDF বানাও ({images.length} page)
                </button>
                <button
                  onClick={() => setImages([])}
                  className="rounded bg-gray-300 px-3 py-1.5 text-sm"
                >
                  Clear
                </button>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Drag করে serial ঠিক করুন, অথবা Serial box এ নম্বর লিখে Enter চাপুন।
              </p>
              <SortableGrid items={images} setItems={setImages} />
            </>
          )}
        </section>
      )}
    </main>
  );
}
