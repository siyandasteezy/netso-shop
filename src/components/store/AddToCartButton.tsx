"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag, Check } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
    if (!size) return alert("Please select a size");
    addItem({
      id: `${product.id}-${size}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size,
      image: product.images[0]?.url || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`w-12 h-12 border text-sm font-semibold transition-colors ${
                size === s
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`w-full py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors ${
          added
            ? "bg-green-600 text-white"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4" />
            Added to Bag
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </>
        )}
      </button>
    </div>
  );
}
