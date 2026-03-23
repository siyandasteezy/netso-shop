import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { Package, Calendar, ShoppingCart, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [productCount, eventCount, orderCount, recentOrders] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.event.count({ where: { active: true } }),
    db.order.count(),
    db.order.findMany({
      include: { items: { include: { product: true } }, tickets: { include: { event: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = await db.order.aggregate({ _sum: { total: true } });

  const stats = [
    { label: "Products", value: productCount, icon: Package, href: "/admin/products" },
    { label: "Events", value: eventCount, icon: Calendar, href: "/admin/events" },
    { label: "Orders", value: orderCount, icon: ShoppingCart, href: "/admin/orders" },
    {
      label: "Total Revenue",
      value: `R${(totalRevenue._sum.total || 0).toFixed(2)}`,
      icon: TrendingUp,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide mb-8">Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="bg-white p-6 border border-gray-200 hover:border-black transition-colors group">
              <s.icon className="w-6 h-6 mb-3 text-gray-400 group-hover:text-black transition-colors" />
              <p className="text-2xl font-black mb-1">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="font-bold uppercase tracking-wide text-sm text-gray-500 mb-4">Recent Orders</h2>
          <div className="bg-white border border-gray-200 overflow-hidden">
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm p-6">No orders yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["Customer", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-500">{order.items.length + order.tickets.length} item(s)</td>
                      <td className="px-4 py-3 font-semibold">R{order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 font-semibold uppercase ${
                          order.status === "completed" ? "bg-green-100 text-green-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-ZA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
