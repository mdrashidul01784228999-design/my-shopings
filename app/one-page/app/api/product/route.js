import { randomBytes } from "crypto";
import { setKey, addIndex, canStore, safeUrl } from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req) {
  if (!canStore) {
    return Response.json(
      { error: "Database connected nai. Vercel > Storage theke Upstash Redis connect korun." },
      { status: 503 }
    );
  }
  let b;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(b.name || "").trim().slice(0, 120);
  const price = Math.round(Number(b.price) * 100) / 100;
  const qty = Math.floor(Number(b.qty) || 1);
  const image = String(b.image || "");

  if (!name) return Response.json({ error: "Name lagbe" }, { status: 400 });
  if (!(price > 0 && price < 1e7)) return Response.json({ error: "Price thik noy" }, { status: 400 });
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 700_000)
    return Response.json({ error: "Image thik noy ba onek boro" }, { status: 400 });

  const id = randomBytes(6).toString("base64url");
  const product = {
    id,
    name,
    price,
    qty: Math.min(Math.max(qty, 1), 1_000_000),
    profile: safeUrl(b.profile),
    link: safeUrl(b.link),
    image: `/api/img/${id}`,
    createdAt: Date.now(),
  };

  await setKey(`img:${id}`, image);
  await setKey(`product:${id}`, product);
  await addIndex("products", id);
  return Response.json({ id });
}
