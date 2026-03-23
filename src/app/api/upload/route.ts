import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Generate a Cloudinary signed upload signature.
 * https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
function signCloudinary(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto
    .createHash("sha256")
    .update(sorted + API_SECRET)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const urls: string[] = [];

  for (const file of files) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const folder = "netso/products";

    const sig = signCloudinary({ folder, timestamp });

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", API_KEY);
    body.append("timestamp", timestamp);
    body.append("folder", folder);
    body.append("signature", sig);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Cloudinary upload error:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const data = await res.json();
    urls.push(data.secure_url as string);
  }

  return NextResponse.json({ urls });
}
