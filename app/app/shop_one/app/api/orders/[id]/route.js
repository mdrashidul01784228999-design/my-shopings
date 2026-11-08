import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth";
import { setOrderStatus, deleteOrder } from "../../../../lib/db";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function PATCH(req, { params }) {
  if (!isAdmin()) return deny();
  const { status } = await req.json().catch(() => ({}));
  return (await setOrderStatus(params.id, status)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_, { params }) {
  if (!isAdmin()) return deny();
  return (await deleteOrder(params.id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
