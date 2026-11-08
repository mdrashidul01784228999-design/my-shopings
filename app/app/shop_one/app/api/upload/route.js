import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { isAdmin } from "../../../lib/auth";
import { UPLOAD_DIR } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dataUrl } = await req.json().catch(() => ({}));
  const m = /^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 413 });
  const name = `${crypto.randomUUID()}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return NextResponse.json({ url: `/api/img/${name}` });
}
