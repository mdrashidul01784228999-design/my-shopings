import { NextResponse } from "next/server";
import { isAdmin, checkPassword, makeToken, COOKIE } from "../../../lib/auth";
import { getOrders } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = isAdmin();
  const pending = admin ? (await getOrders()).filter((o) => o.status === "Pending").length : 0;
  return NextResponse.json({ admin, pending }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
