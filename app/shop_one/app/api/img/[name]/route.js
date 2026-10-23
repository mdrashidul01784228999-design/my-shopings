import fs from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "../../../../lib/db";

export const dynamic = "force-dynamic";
const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

export async function GET(_, { params }) {
  const n = params.name;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(n)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, n));
    return new Response(buf, { headers: { "Content-Type": TYPES[n.split(".")[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
