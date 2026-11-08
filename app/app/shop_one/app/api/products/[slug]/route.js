import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth";
import { getProductBySlug, deleteProduct } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(_, { params }) {
  const product = await getProductBySlug(params.slug);
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await deleteProduct(params.slug);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
