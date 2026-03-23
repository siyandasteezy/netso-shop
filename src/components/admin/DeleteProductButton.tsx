"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium"
    >
      <Trash2 className="w-4 h-4" />
      Remove Product
    </button>
  );
}
