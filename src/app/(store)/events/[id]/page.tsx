import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import BuyTicketForm from "@/components/store/BuyTicketForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id, active: true } });
  if (!event) notFound();

  const available = event.totalTickets - event.soldTickets;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative h-64 md:h-96 bg-black mb-8 overflow-hidden">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover opacity-60" sizes="100vw" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <span className="text-white text-8xl font-black opacity-10">N</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-gray-300 text-sm uppercase tracking-widest mb-2">{event.city}</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleDateString("en-ZA", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm">
                  {new Date(event.date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  {event.endDate && ` – ${new Date(event.endDate).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="font-semibold">{event.venue}</p>
                <p className="text-sm">{event.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Ticket className="w-5 h-5" />
              <div>
                <p className="font-semibold">{formatPrice(event.ticketPrice)} per ticket</p>
                <p className="text-sm">{available} tickets remaining</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        <div>
          {isPast ? (
            <div className="bg-gray-100 p-6 text-center">
              <p className="text-gray-500 font-semibold">This event has passed.</p>
            </div>
          ) : available === 0 ? (
            <div className="bg-gray-100 p-6 text-center">
              <p className="text-gray-500 font-semibold">Sold out!</p>
            </div>
          ) : (
            <BuyTicketForm event={{ id: event.id, ticketPrice: event.ticketPrice, available }} />
          )}
        </div>
      </div>
    </div>
  );
}
