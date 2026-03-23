import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
      <h1 className="text-3xl font-black uppercase tracking-wide mb-4">Payment Cancelled</h1>
      <p className="text-gray-600 mb-2">
        Your payment was not completed. Your order has not been placed.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Your cart is still saved — you can try again when you&apos;re ready.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/checkout"
          className="bg-black text-white px-8 py-3 inline-block font-semibold uppercase tracking-wide hover:bg-gray-900 transition-colors"
        >
          Try Again
        </Link>
        <Link
          href="/shop"
          className="border border-gray-300 px-8 py-3 inline-block font-semibold uppercase tracking-wide hover:border-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
