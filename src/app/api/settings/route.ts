import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";
import { auth } from "@/lib/auth";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "vat_rate",
    "vat_inclusive",
    "free_delivery_threshold",
    "payfast_enabled",
    "tcg_enabled",
    "store_name",
    "store_email",
    "store_phone",
  ];

  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = String(body[key]);
  }

  await updateSettings(updates);
  const settings = await getSettings();
  return NextResponse.json(settings);
}
