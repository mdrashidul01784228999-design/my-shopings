import { getKey, validId } from "../../../../lib/store";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!validId(id)) return new Response("Not found", { status: 404 });
  const data = await getKey(`img:${id}`);
  const m = typeof data === "string" && data.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(m[2], "base64")), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
