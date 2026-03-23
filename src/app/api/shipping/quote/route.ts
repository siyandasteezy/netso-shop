import { NextRequest, NextResponse } from "next/server";
import { getShippingQuotes } from "@/lib/tcg";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deliveryAddress, itemCount = 1 } = body;

    const settings = await getSettings();

    // Estimate parcel dimensions based on item count
    const weight = Math.max(itemCount * 0.3, 0.5);
    const height = Math.min(itemCount * 3, 30);

    const quotes = await getShippingQuotes({
      collectionAddress: {
        streetAddress: process.env.TCG_SENDER_ADDRESS || "123 Brand Street",
        suburb: process.env.TCG_SENDER_SUBURB || "Sandton",
        city: process.env.TCG_SENDER_CITY || "Johannesburg",
        province: process.env.TCG_SENDER_PROVINCE || "Gauteng",
        postalCode: process.env.TCG_SENDER_POSTAL_CODE || "2196",
      },
      deliveryAddress: {
        streetAddress: deliveryAddress.address || "",
        suburb: deliveryAddress.city || "",
        city: deliveryAddress.city || "",
        province: deliveryAddress.province || "",
        postalCode: deliveryAddress.postalCode || "",
      },
      parcel: {
        weight,
        height,
        width: 30,
        length: 30,
      },
    });

    // Apply free delivery if threshold met (based on subtotal passed from client)
    const subtotal = parseFloat(body.subtotal || "0");
    const withFreeDelivery = quotes.map((q) => ({
      ...q,
      price: subtotal >= settings.free_delivery_threshold ? 0 : q.price,
      isFree: subtotal >= settings.free_delivery_threshold,
    }));

    return NextResponse.json({
      quotes: withFreeDelivery,
      freeDeliveryThreshold: settings.free_delivery_threshold,
    });
  } catch (err) {
    console.error("Shipping quote error:", err);
    // Always return fallback quotes — never block checkout
    return NextResponse.json({
      quotes: [
        { serviceId: "standard", serviceName: "Standard Delivery", price: 99, estimatedDeliveryDays: 3 },
        { serviceId: "express", serviceName: "Express Delivery", price: 159, estimatedDeliveryDays: 1 },
      ],
      freeDeliveryThreshold: 500,
    });
  }
}
