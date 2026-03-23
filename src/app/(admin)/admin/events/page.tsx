import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import { Plus, Edit, Ticket } from "lucide-react";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const events = await db.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { tickets: true } } },
  });

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase tracking-wide">Events</h1>
          <Link
            href="/admin/events/new"
            className="bg-black text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide flex items-center gap-2 hover:bg-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Event", "Date", "Venue", "Tickets Sold", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs">{event.title}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{event.venue}, {event.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.soldTickets} / {event.totalTickets}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">R{event.ticketPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 font-semibold uppercase ${
                      event.active && new Date(event.date) >= new Date()
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {event.active && new Date(event.date) >= new Date() ? "Live" : "Ended"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
