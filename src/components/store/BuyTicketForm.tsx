"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Ticket, CheckCircle } from "lucide-react";

interface Props {
  event: { id: string; ticketPrice: number; available: number };
}

export default function BuyTicketForm({ event }: Props) {
  const [form, setForm] = useState({ buyerName: "", buyerEmail: "", quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<{ ticketCode: string } | null>(null);
  const [error, setError] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field === "quantity" ? parseInt(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId: event.id }),
    });

    if (res.ok) {
      const data = await res.json();
      setTicket(data);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to purchase ticket");
    }
    setLoading(false);
  };

  if (ticket) {
    return (
      <div className="bg-black text-white p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="font-bold text-xl mb-2">Ticket Confirmed!</h3>
        <p className="text-gray-300 text-sm mb-4">Your ticket code:</p>
        <p className="font-mono text-2xl font-black tracking-widest bg-white/10 px-4 py-3 mb-4">
          {ticket.ticketCode}
        </p>
        <p className="text-gray-400 text-xs">
          We&apos;ve noted your booking. A confirmation will be shared with you.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 p-6">
      <h2 className="font-bold text-lg uppercase tracking-wide mb-6 flex items-center gap-2">
        <Ticket className="w-5 h-5" />
        Get Tickets
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Full Name</label>
          <input
            type="text"
            required
            value={form.buyerName}
            onChange={set("buyerName")}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Email</label>
          <input
            type="email"
            required
            value={form.buyerEmail}
            onChange={set("buyerEmail")}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Quantity</label>
          <select
            value={form.quantity}
            onChange={set("quantity")}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          >
            {Array.from({ length: Math.min(10, event.available) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} ticket{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total</span>
          <span className="font-bold text-lg">{formatPrice(event.ticketPrice * form.quantity)}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Buy Tickets"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Payment details will be provided after booking.
        </p>
      </form>
    </div>
  );
}
