import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPayFastITN } from "@/lib/payfast";
import { createShipment } from "@/lib/tcg";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("PayFast ITN received:", params);

    // Verify authenticity of the notification
    const isValid = await verifyPayFastITN(params);
    if (!isValid) {
      console.error("Invalid PayFast ITN - verification failed");
      return new NextResponse("Invalid ITN", { status: 400 });
    }

    const orderId = params.m_payment_id;
    const paymentStatus = params.payment_status; // "COMPLETE" or "FAILED" etc.
    const payfastPaymentId = params.pf_payment_id || "";

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      console.error("Order not found:", orderId);
      return new NextResponse("Order not found", { status: 404 });
    }

    if (paymentStatus === "COMPLETE") {
      // Update order to paid
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "paid",
          payfastPaymentId,
          status: "confirmed",
        },
      });

      // Attempt to create TCG shipment
      const settings = await getSettings();
      if (settings.tcg_enabled && order.address) {
        try {
          const totalWeight = Math.max(
            order.items.reduce((sum, item) => sum + item.quantity * 0.3, 0),
            0.5
          );

          const shipment = await createShipment({
            orderId: order.id,
            serviceId: order.deliveryQuoteId || "standard",
            recipientName: order.customerName,
            recipientPhone: order.customerPhone,
            recipientEmail: order.customerEmail,
            deliveryAddress: {
              streetAddress: order.address,
              suburb: order.city,
              city: order.city,
              province: order.province,
              postalCode: order.postalCode,
            },
            parcel: {
              weight: totalWeight,
              height: 5,
              width: 30,
              length: 30,
              description: `Netso order ${order.id}`,
            },
            declaredValue: order.total,
          });

          await db.order.update({
            where: { id: orderId },
            data: {
              waybillNumber: shipment.waybillNumber,
              trackingNumber: shipment.trackingNumber,
              status: "processing",
            },
          });
        } catch (shipErr) {
          console.error("TCG shipment creation failed:", shipErr);
          // Don't fail the whole request — shipment can be retried manually
        }
      }
    } else if (["FAILED", "CANCELLED"].includes(paymentStatus)) {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "failed",
          payfastPaymentId,
          status: "cancelled",
        },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayFast notify error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
