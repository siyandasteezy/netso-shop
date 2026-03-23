import Link from "next/link";
import { CheckCircle, Truck, Mail } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-black uppercase tracking-wide mb-4">Payment Received!</h1>
      <p className="text-gray-600 mb-8">
        Your order has been confirmed and payment was successful.
      </p>

      <div className="bg-gray-50 border border-gray-200 p-6 mb-8 text-left space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Confirmation Email</p>
            <p className="text-gray-500 text-sm">A receipt will be sent to your email address.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Delivery via The Courier Guy</p>
            <p className="text-gray-500 text-sm">
              Your order is being processed. You&apos;ll receive a tracking number once dispatched.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/shop"
        className="bg-black text-white px-8 py-3 inline-block font-semibold uppercase tracking-wide hover:bg-gray-900 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
