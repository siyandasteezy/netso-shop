"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import Image from "next/image";

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    description: string;
    date: Date;
    endDate: Date | null;
    venue: string;
    city: string;
    imageUrl: string;
    ticketPrice: number;
    totalTickets: number;
    active: boolean;
  };
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const formatDateForInput = (d: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 16) : "";

  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: formatDateForInput(event?.date || null),
    endDate: formatDateForInput(event?.endDate || null),
    venue: event?.venue || "",
    city: event?.city || "Johannesburg",
    imageUrl: event?.imageUrl || "",
    ticketPrice: event?.ticketPrice?.toString() || "150",
    totalTickets: event?.totalTickets?.toString() || "100",
    active: event?.active ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: field === "active" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, imageUrl: data.urls[0] }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = event ? `/api/events/${event.id}` : "/api/events";
    const method = event ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/events");
      router.refresh();
    } else {
      alert("Failed to save event");
    }
    setSaving(false);
  };

  const SA_CITIES = ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "East London", "Bloemfontein", "Polokwane"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Event Title</label>
        <input required value={form.title} onChange={set("title")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Description</label>
        <textarea required rows={4} value={form.description} onChange={set("description")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Start Date & Time</label>
          <input required type="datetime-local" value={form.date} onChange={set("date")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">End Date & Time (optional)</label>
          <input type="datetime-local" value={form.endDate} onChange={set("endDate")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Venue</label>
          <input required value={form.venue} onChange={set("venue")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">City</label>
          <select value={form.city} onChange={set("city")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black">
            {SA_CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Ticket Price (R)</label>
          <input required type="number" min="0" step="0.01" value={form.ticketPrice} onChange={set("ticketPrice")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Total Tickets</label>
          <input required type="number" min="1" value={form.totalTickets} onChange={set("totalTickets")} className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
        </div>
      </div>

      {/* Event Image */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-3">Event Image</label>
        {form.imageUrl && (
          <div className="relative w-full h-40 bg-gray-100 mb-3 overflow-hidden">
            <Image src={form.imageUrl} alt="" fill className="object-cover" sizes="100%" />
          </div>
        )}
        <label className="inline-flex items-center gap-2 border border-dashed border-gray-300 px-4 py-2 cursor-pointer hover:border-black transition-colors text-sm text-gray-500">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload Image"}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {event && (
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={form.active} onChange={set("active")} className="w-4 h-4" />
          <label htmlFor="active" className="text-sm font-medium">Event is active / visible</label>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wide text-sm disabled:opacity-50">
          {saving ? "Saving..." : event ? "Save Changes" : "Create Event"}
        </button>
        <button type="button" onClick={() => router.back()} className="border border-gray-300 px-6 py-3 font-semibold text-sm hover:border-black transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
