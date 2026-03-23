"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Upload, Star } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    featured: boolean;
    images: { url: string }[];
  };
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "200",
    stock: product?.stock?.toString() || "10",
    categoryId: product?.categoryId || categories[0]?.id || "",
    featured: product?.featured || false,
  });
  const [images, setImages] = useState<string[]>(product?.images?.map((i) => i.url) || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: field === "featured" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setImages((prev) => [...prev, ...data.urls]);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, images }),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("Failed to save product");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Product Name</label>
        <input
          required
          value={form.name}
          onChange={set("name")}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Category</label>
        <select
          required
          value={form.categoryId}
          onChange={set("categoryId")}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Price (R)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={set("price")}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Stock</label>
          <input
            type="number"
            required
            min="0"
            value={form.stock}
            onChange={set("stock")}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={set("description")}
          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={set("featured")}
          className="w-4 h-4"
        />
        <label htmlFor="featured" className="text-sm font-medium flex items-center gap-1">
          <Star className="w-4 h-4" />
          Featured on homepage
        </label>
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-3">Images</label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative aspect-square bg-gray-100 group">
              <Image src={url} alt="" fill className="object-cover" sizes="100px" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
            <Upload className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">Upload</span>
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
        {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-wide text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : product ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-6 py-3 font-semibold text-sm hover:border-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
