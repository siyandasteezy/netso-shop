"use client";
import { useCart } from "@/lib/cart-store";
import { formatPrice, buildOrderTotals } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Truck, CreditCard, Shield, ChevronDown } from "lucide-react";

const SA_PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape",
];

interface ShippingQuote {
  serviceId: string;
  serviceName: string;
  price: number;
  estimatedDeliveryDays: number;
  isFree?: boolean;
}

interface AppSettings {
  vat_rate: number;
  vat_inclusive: boolean;
  free_delivery_threshold: number;
  payfast_enabled: boolean;
}

export default function CheckoutPage() {
  const { items, total: cartTotal, clearCart } = useCart();
  const router = useRouter();
  const payfastFormRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState<"details" | "delivery" | "payment">("details");
  const [loading, setLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    vat_rate: 15, vat_inclusive: false, free_delivery_threshold: 500, payfast_enabled: true,
  });
  const [payfastData, setPayfastData] = useState<{ url: string; fields: Record<string, string> } | null>(null);
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings").then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  // Auto-submit PayFast form when data is ready
  useEffect(() => {
    if (payfastData && payfastFormRef.current) {
      payfastFormRef.current.submit();
    }
  }, [payfastData]);

  if (!mounted) return null;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const subtotal = cartTotal();
  const deliveryFee = selectedQuote?.price ?? 0;
  const totals = buildOrderTotals(subtotal, settings.vat_rate, deliveryFee, settings.vat_inclusive);

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const fetchQuotes = async () => {
    if (!form.province || !form.postalCode) return;
    setQuotesLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress: {
            address: form.address,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
          },
          itemCount: items.reduce((s, i) => s + i.quantity, 0),
          subtotal,
        }),
      });
      const data = await res.json();
      setQuotes(data.quotes || []);
      if (data.quotes?.length > 0) setSelectedQuote(data.quotes[0]);
    } catch {
      setQuotes([
        { serviceId: "standard", serviceName: "Standard Delivery", price: 99, estimatedDeliveryDays: 3 },
      ]);
      setSelectedQuote({ serviceId: "standard", serviceName: "Standard Delivery", price: 99, estimatedDeliveryDays: 3 });
    } finally {
      setQuotesLoading(false);
    }
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuotes();
    setStep("delivery");
  };

  const handleDeliveryNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return alert("Please select a delivery option");
    setStep("payment");
  };

  const handlePayFast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payfast/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
          deliveryFee: selectedQuote?.price ?? 0,
          deliveryQuoteId: selectedQuote?.serviceId ?? "",
        }),
      });

      if (!res.ok) throw new Error("Failed to initiate payment");
      const data = await res.json();
      clearCart();
      setPayfastData({ url: data.url, fields: data.fields });
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed. Please try again.");
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8 text-xs font-semibold uppercase tracking-wider">
      {(["details", "delivery", "payment"] as const).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          {i > 0 && <div className="w-8 h-px bg-gray-300" />}
          <button
            onClick={() => {
              if (s === "details") setStep("details");
              if (s === "delivery" && step === "payment") setStep("delivery");
            }}
            className={`flex items-center gap-1.5 ${
              step === s ? "text-black" : s < step ? "text-gray-400 hover:text-gray-600 cursor-pointer" : "text-gray-300"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {i + 1}
            </span>
            <span className="hidden sm:inline capitalize">{s}</span>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hidden PayFast form — auto-submits when payfastData is set */}
      {payfastData && (
        <form ref={payfastFormRef} method="POST" action={payfastData.url} style={{ display: "none" }}>
          {Object.entries(payfastData.fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>
      )}

      <h1 className="text-3xl font-black uppercase tracking-wide mb-2">Checkout</h1>
      <StepIndicator />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left — Forms */}
        <div className="lg:col-span-3 space-y-6">

          {/* Step 1: Delivery Details */}
          {step === "details" && (
            <form onSubmit={handleDetailsNext} className="space-y-4">
              <h2 className="font-bold text-lg uppercase tracking-wide">Delivery Details</h2>

              {[
                { label: "Full Name", field: "customerName", type: "text" },
                { label: "Email Address", field: "customerEmail", type: "email" },
                { label: "Phone Number", field: "customerPhone", type: "tel" },
                { label: "Street Address", field: "address", type: "text" },
                { label: "City / Suburb", field: "city", type: "text" },
                { label: "Postal Code", field: "postalCode", type: "text" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    value={form[field as keyof typeof form]}
                    onChange={set(field)}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Province</label>
                <div className="relative">
                  <select
                    required
                    value={form.province}
                    onChange={set("province")}
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black appearance-none pr-8 transition-colors"
                  >
                    <option value="">Select Province</option>
                    {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3.5 font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Continue to Delivery
              </button>
            </form>
          )}

          {/* Step 2: Delivery Options */}
          {step === "delivery" && (
            <form onSubmit={handleDeliveryNext} className="space-y-4">
              <h2 className="font-bold text-lg uppercase tracking-wide">Delivery Options</h2>
              <p className="text-sm text-gray-500">
                Delivering to <strong>{form.city}, {form.province} {form.postalCode}</strong>
              </p>

              {quotesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse border border-gray-200 p-4 h-16 bg-gray-50" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {quotes.map((q) => (
                    <label
                      key={q.serviceId}
                      className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${
                        selectedQuote?.serviceId === q.serviceId
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          value={q.serviceId}
                          checked={selectedQuote?.serviceId === q.serviceId}
                          onChange={() => setSelectedQuote(q)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-semibold text-sm">{q.serviceName}</p>
                          <p className="text-xs text-gray-500">{q.estimatedDeliveryDays} business day{q.estimatedDeliveryDays !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {q.isFree || q.price === 0 ? (
                          <span className="font-bold text-green-600 text-sm">FREE</span>
                        ) : (
                          <span className="font-bold text-sm">{formatPrice(q.price)}</span>
                        )}
                      </div>
                    </label>
                  ))}
                  {subtotal >= settings.free_delivery_threshold && (
                    <p className="text-xs text-green-600 font-medium">
                      🎉 You qualify for free delivery on orders over {formatPrice(settings.free_delivery_threshold)}!
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex-1 border border-gray-300 py-3.5 font-semibold text-sm hover:border-black transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!selectedQuote}
                  className="flex-1 bg-black text-white py-3.5 font-bold uppercase tracking-wider text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg uppercase tracking-wide">Payment</h2>

              {/* PayFast */}
              {settings.payfast_enabled && (
                <div className="border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5" />
                    <h3 className="font-semibold">Pay Online — Powered by PayFast</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Secure payment via card, EFT, or SnapScan. You&apos;ll be redirected to PayFast&apos;s secure checkout.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>256-bit SSL encrypted. Your payment details are never stored on our servers.</span>
                  </div>
                  <button
                    onClick={handlePayFast}
                    disabled={loading}
                    className="w-full bg-[#00b0cc] text-white py-3.5 font-bold uppercase tracking-wider text-sm hover:bg-[#0099b2] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Redirecting to PayFast...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay {formatPrice(totals.total)} with PayFast
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep("delivery")}
                className="w-full border border-gray-300 py-3 font-semibold text-sm hover:border-black transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 border border-gray-200 p-5 sticky top-24">
            <h2 className="font-bold uppercase tracking-wide text-sm mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate pr-2">
                    {item.name}
                    <span className="text-gray-400 ml-1">({item.size}) ×{item.quantity}</span>
                  </span>
                  <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (excl. VAT)</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({settings.vat_rate}%)</span>
                <span>{formatPrice(totals.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>
                  {selectedQuote
                    ? selectedQuote.price === 0
                      ? <span className="text-green-600 font-medium">Free</span>
                      : formatPrice(selectedQuote.price)
                    : <span className="text-gray-400 italic">Select delivery</span>
                  }
                </span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-gray-200 pt-3 mt-2">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
              <p className="text-xs text-gray-400">Prices include {settings.vat_rate}% VAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
