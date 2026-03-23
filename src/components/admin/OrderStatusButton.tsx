"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
  statuses: string[];
}

export default function OrderStatusButton({ orderId, currentStatus, statuses }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs px-2 py-1 font-semibold uppercase ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className="border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:border-black disabled:opacity-50"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
