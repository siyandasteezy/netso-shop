import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";

export const revalidate = 60;

export default async function EventsPage() {
  const events = await db.event.findMany({
    where: { active: true },
    orderBy: { date: "asc" },
  });

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-wide mb-2">Events</h1>
      <p className="text-gray-500 mb-10">Get your tickets to exclusive Netso experiences.</p>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>No events at the moment. Check back soon.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-200 pb-3">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group border border-gray-200 hover:border-black transition-colors overflow-hidden">
                <div className="relative h-48 bg-black">
                  {event.imageUrl ? (
                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover opacity-70 group-hover:opacity-80 transition-opacity" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                      <span className="text-white text-4xl font-black opacity-20">N</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 font-semibold">
                    {formatPrice(event.ticketPrice)} / ticket
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-3">{event.title}</h3>
                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-ZA", {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{event.venue}, {event.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 flex-shrink-0" />
                      <span>{event.totalTickets - event.soldTickets} tickets available</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-3">
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {past.map((event) => (
              <div key={event.id} className="border border-gray-100 p-5">
                <h3 className="font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(event.date).toLocaleDateString("en-ZA", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-sm text-gray-400">{event.venue}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
