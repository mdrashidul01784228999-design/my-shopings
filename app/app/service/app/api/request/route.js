import { NextResponse } from "next/server";

const clean = (v, n = 500) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, n);

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: "ভুল ডাটা" }, { status: 400 }); }
  const d = {
    device: clean(b.device, 40), type: clean(b.type, 40), name: clean(b.name, 80), phone: clean(b.phone, 20),
    brand: clean(b.brand, 80), model: clean(b.model, 80), address: clean(b.address, 250),
    problem: clean(b.problem, 1500), duration: clean(b.duration, 60), urgency: clean(b.urgency, 30),
  };
  if (!d.device || d.name.length < 2 || !/^[0-9+\-\s]{10,16}$/.test(d.phone) || d.problem.length < 5 || d.address.length < 3)
    return NextResponse.json({ ok: false, error: "সব প্রয়োজনীয় তথ্য সঠিকভাবে দিন" }, { status: 422 });

  const id = "TF-" + Date.now().toString(36).toUpperCase();
  const text = `🛠 নতুন ${d.type} (${id})\nডিভাইস: ${d.device}\nব্র্যান্ড/মডেল: ${d.brand} ${d.model}\nনাম: ${d.name}\nফোন: ${d.phone}\nঠিকানা: ${d.address}\nসমস্যা: ${d.problem}\nকতদিন ধরে: ${d.duration}\nজরুরি: ${d.urgency}`;
  console.log(text);

  const { TELEGRAM_BOT_TOKEN: t, TELEGRAM_CHAT_ID: c } = process.env;
  if (t && c) {
    try { await fetch(`https://api.telegram.org/bot${t}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: c, text }) }); } catch {}
  }
  return NextResponse.json({ ok: true, id });
}
