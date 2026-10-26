// src/app/api/admin/pending/route.ts
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getAdminCelebration } from "@/lib/admin/queries/celebration";
import { getContentStats, toPending } from "@/lib/admin/stats";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const celebration = await getAdminCelebration();
  if (!celebration) {
    return NextResponse.json({ error: "no celebration" }, { status: 404 });
  }

  const pending = toPending(await getContentStats(celebration.id));
  return NextResponse.json(pending, { headers: { "Cache-Control": "no-store" } });
}