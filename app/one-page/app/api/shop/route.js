import { randomBytes } from "crypto";
import { setKey, addIndex, canStore, validId } from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req) {
  if (!canStore) return Response.json({ error: "Database connected nai." }, { status: 503 });
  let b;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const ids = Array.isArray(b.ids) ? b.ids.filter(validId).slice(0, 200) : [];
  if (!ids.length) return Response.json({ error: "Kono product nai" }, { status: 400 });

  const id = randomBytes(6).toString("base64url");
  await setKey(`shop:${id}`, { id, ids, createdAt: Date.now() });
  await addIndex("shops", id);
  return Response.json({ id });
}
