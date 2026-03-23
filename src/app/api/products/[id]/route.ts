import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, price, stock, categoryId, images, featured, active } = body;

  await db.productImage.deleteMany({ where: { productId: id } });

  const product = await db.product.update({
    where: { id },
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      featured: featured ?? false,
      active: active ?? true,
      images: {
        create: (images || []).map((url: string, i: number) => ({ url, order: i })),
      },
    },
    include: { images: true, category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
