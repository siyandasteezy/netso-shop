import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import OrderStatusButton from "@/components/admin/OrderStatusButton";
import { Package2, Truck, CreditCard, ExternalLink } from "lucide-react";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const orders = await db.order.findMany({
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      tickets: { include: { event: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];

  const paymentBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-500",
    };
    return map[status] || "bg-gray-100 text-gray-500";
  };

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-black uppercase tracking-wide mb-8">Orders</h1>

        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="bg-white border border-gray-200 p-8 text-center text-gray-400">No orders yet.</div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-lg">{order.customerName}</p>
                    <span className={`text-xs px-2 py-0.5 font-semibold uppercase ${paymentBadge(order.paymentStatus)}`}>
                      {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{order.customerEmail}</p>
                  {order.customerPhone && <p className="text-gray-500 text-sm">{order.customerPhone}</p>}
                  {order.address && (
                    <p className="text-gray-400 text-xs mt-1">
                      {order.address}, {order.city}, {order.province} {order.postalCode}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-black text-xl">R{order.total.toFixed(2)}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-ZA", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                  {order.payfastPaymentId && (
                    <p className="text-gray-400 text-xs font-mono mt-0.5">PF: {order.payfastPaymentId}</p>
                  )}
                </div>
              </div>

              {/* Products */}
              {order.items.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
                    <Package2 className="w-3.5 h-3.5" /> Products
                  </p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">
                        {item.product.name}
                        <span className="text-gray-400 ml-1">({item.size}) ×{item.quantity}</span>
                      </span>
                      <span className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tickets */}
              {order.tickets.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">🎟 Event Tickets</p>
                  {order.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between text-sm py-1">
                      <span>
                        {ticket.event.title} ×{ticket.quantity}
                        <span className="text-gray-400 ml-2 font-mono text-xs">{ticket.ticketCode}</span>
                      </span>
                      <span className="font-semibold">R{ticket.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 mb-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <br />R{(order.subtotal || 0).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium text-gray-700">VAT ({order.vatRate || 15}%)</span>
                  <br />R{(order.vatAmount || 0).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Delivery</span>
                  <br />{order.deliveryFee ? `R${order.deliveryFee.toFixed(2)}` : "—"}
                  {order.deliveryQuoteId && (
                    <span className="text-gray-400 ml-1 font-mono">({order.deliveryQuoteId})</span>
                  )}
                </div>
              </div>

              {/* Courier tracking */}
              {(order.waybillNumber || order.trackingNumber) && (
                <div className="border-t border-gray-100 pt-3 mb-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> The Courier Guy
                  </p>
                  <div className="flex gap-6 text-xs font-mono text-gray-600">
                    {order.waybillNumber && (
                      <span>
                        Waybill: <strong>{order.waybillNumber}</strong>
                      </span>
                    )}
                    {order.trackingNumber && (
                      <a
                        href={`https://www.thecourierguy.co.za/track/?waybill=${order.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Track {order.trackingNumber}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <OrderStatusButton orderId={order.id} currentStatus={order.status} statuses={STATUS_OPTIONS} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
