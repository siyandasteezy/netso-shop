"use client";
import { useCart } from "@/lib/cart-store";
import { formatPrice, calcVat } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [vatRate, setVatRate] = useState(15);
  const { items, removeItem, updateQuantity, total } = useCart();

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => setVatRate(s.vat_rate ?? 15))
      .catch(() => {});
  }, []);

  if (!mounted) return null;

  const subtotal = total();
  const vatAmount = calcVat(subtotal, vatRate);
  const grandTotal = subtotal + vatAmount;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-3xl font-black uppercase mb-4">Your Bag</h1>
        <p className="text-gray-500 mb-8">Your bag is empty.</p>
        <Link
          href="/shop"
          className="bg-black text-white px-8 py-3 inline-block font-semibold uppercase tracking-wide hover:bg-gray-900 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-wide mb-8">
        Your Bag <span className="text-gray-400 font-normal text-xl">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border border-gray-100 p-4">
              <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                <p className="text-gray-500 text-xs mb-2">Size: <strong>{item.size}</strong></p>
                <p className="font-bold text-sm">{formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-gray-50 border border-gray-200 p-5 sticky top-24">
            <h2 className="font-bold uppercase tracking-wide text-sm mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (excl. VAT)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({vatRate}%)</span>
                <span>{formatPrice(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs italic">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-black text-lg">
              <span>Subtotal incl. VAT</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Delivery added at checkout</p>

            <Link
              href="/checkout"
              className="block mt-5 w-full bg-black text-white py-4 text-center font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors text-sm"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/shop"
              className="block mt-2 w-full text-center text-xs text-gray-500 hover:text-black transition-colors py-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
