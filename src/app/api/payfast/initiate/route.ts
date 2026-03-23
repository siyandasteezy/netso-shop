import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildPayFastPayload } from "@/lib/payfast";
import { getSettings } from "@/lib/settings";
import { buildOrderTotals } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName, customerEmail, customerPhone,
    address, city, province, postalCode,
    items, deliveryFee = 0, deliveryQuoteId = "",
  } = body;

  const settings = await getSettings();

  // Build order items
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

  // Create order in pending/awaiting-payment state
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
  });

  const nameParts = customerName.trim().split(" ");
  const payload = buildPayFastPayload({
    orderId: order.id,
    amount: totals.total,
    itemName: `Netso Order #${order.id.slice(-6).toUpperCase()}`,
    customerEmail,
    customerFirstName: nameParts[0],
    customerLastName: nameParts.slice(1).join(" "),
  });

  return NextResponse.json({ orderId: order.id, ...payload });
}
