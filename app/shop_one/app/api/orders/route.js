import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { getOrders, createOrder } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await getOrders() });
}

// public: customers place orders from the product link
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const r = await createOrder({ slug: body.slug, qty: body.qty, customer: body.customer });
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  return NextResponse.json({ order: r.order }, { status: 201 });
}
