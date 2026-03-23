import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { buildOrderTotals } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  // Public email-based order lookup (for mobile app)
  if (email) {
    const orders = await db.order.findMany({
      where: { customerEmail: email },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        tickets: { include: { event: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  }

  // Admin: full order list (requires session)
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    include: {
      items: { include: { product: { include: { images: true } } } },
      tickets: { include: { event: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName, customerEmail, customerPhone,
    address, city, province, postalCode,
    items, deliveryFee = 0, deliveryQuoteId = "",
  } = body;

  const settings = await getSettings();

  // Calculate product subtotal
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await db.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
      size: item.size || "",
    });
  }

  const totals = buildOrderTotals(
    subtotal,
    settings.vat_rate,
    parseFloat(String(deliveryFee)) || 0,
    settings.vat_inclusive
  );

  const order = await db.order.create({
    data: {
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      address: address || "",
      city: city || "",
      province: province || "",
      postalCode: postalCode || "",
      subtotal: totals.subtotal,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      deliveryQuoteId,
      paymentMethod: "payfast",
      paymentStatus: "pending",
      status: "pending",
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return NextResponse.json(order);
}
