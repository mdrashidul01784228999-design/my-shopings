import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/auth";
import { getProducts, addProducts } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ products: await getProducts() });
}

export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const products = body ? await addProducts(body) : [];
  if (!products.length) return NextResponse.json({ error: "Name and a valid price are required" }, { status: 400 });
  return NextResponse.json({ products }, { status: 201 });
}
