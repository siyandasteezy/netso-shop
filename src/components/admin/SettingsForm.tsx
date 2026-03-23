"use client";
import { useState } from "react";
import { Check, AlertCircle, Percent, Truck, CreditCard, Store } from "lucide-react";
import type { AppSettings } from "@/lib/settings";

interface Props {
  settings: AppSettings;
}

export default function SettingsForm({ settings }: Props) {
  const [form, setForm] = useState({
    vat_rate: String(settings.vat_rate),
    vat_inclusive: String(settings.vat_inclusive),
    free_delivery_threshold: String(settings.free_delivery_threshold),
    payfast_enabled: String(settings.payfast_enabled),
    tcg_enabled: String(settings.tcg_enabled),
    store_name: settings.store_name,
    store_email: settings.store_email,
    store_phone: settings.store_phone,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const val = e.target.type === "checkbox"
      ? String((e.target as HTMLInputElement).checked)
      : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save settings.");
    }
    setSaving(false);
  };

  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white border border-gray-200 p-6 mb-4">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="font-bold uppercase tracking-wide text-sm">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({
    label, sublabel, children,
  }: { label: string; sublabel?: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
      <div>
        <label className="block text-sm font-semibold">{label}</label>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );

  const inputCls = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">

      {/* VAT */}
      <Section icon={Percent} title="VAT / Tax">
        <Field label="VAT Rate (%)" sublabel="Applied to all product & ticket prices">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              required
              value={form.vat_rate}
              onChange={set("vat_rate")}
              className={inputCls}
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">%</span>
          </div>
        </Field>

        <Field label="Price Display" sublabel="How prices are shown to customers">
          <select
            value={form.vat_inclusive}
            onChange={set("vat_inclusive")}
            className={inputCls}
          >
            <option value="false">Prices exclude VAT (VAT added at checkout)</option>
            <option value="true">Prices include VAT (VAT extracted at checkout)</option>
          </select>
        </Field>
      </Section>

      {/* Delivery */}
      <Section icon={Truck} title="Delivery — The Courier Guy">
        <Field label="TCG Integration" sublabel="Enable live courier rates & shipments">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.tcg_enabled === "true"}
                onChange={(e) => setForm((f) => ({ ...f, tcg_enabled: String(e.target.checked) }))}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${form.tcg_enabled === "true" ? "bg-black" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${form.tcg_enabled === "true" ? "ml-5" : "ml-1"}`} />
              </div>
            </div>
            <span className="text-sm font-medium">
              {form.tcg_enabled === "true" ? "Enabled" : "Disabled (flat rate fallback)"}
            </span>
          </label>
        </Field>

        <Field label="Free Delivery Threshold" sublabel="Order value for free delivery (R0 to disable)">
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-gray-400">R</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.free_delivery_threshold}
              onChange={set("free_delivery_threshold")}
              className={`${inputCls} pl-7`}
            />
          </div>
        </Field>

        <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-700">
          <strong>Configure TCG credentials</strong> in your <code>.env</code> file:
          <br />
          <code>TCG_API_KEY</code>, <code>TCG_ACCOUNT_NUMBER</code>, <code>TCG_SENDER_*</code> fields.
        </div>
      </Section>

      {/* PayFast */}
      <Section icon={CreditCard} title="Payments — PayFast">
        <Field label="PayFast Payments" sublabel="Online payment via card, EFT, SnapScan">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.payfast_enabled === "true"}
                onChange={(e) => setForm((f) => ({ ...f, payfast_enabled: String(e.target.checked) }))}
                className="sr-only"
              />
              <div className={`w-10 h-6 rounded-full transition-colors ${form.payfast_enabled === "true" ? "bg-black" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${form.payfast_enabled === "true" ? "ml-5" : "ml-1"}`} />
              </div>
            </div>
            <span className="text-sm font-medium">
              {form.payfast_enabled === "true" ? "Enabled" : "Disabled"}
            </span>
          </label>
        </Field>

        <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-700">
          <strong>Configure PayFast credentials</strong> in your <code>.env</code> file:
          <br />
          <code>PAYFAST_MERCHANT_ID</code>, <code>PAYFAST_MERCHANT_KEY</code>, <code>PAYFAST_PASSPHRASE</code>
          <br />
          Set <code>PAYFAST_SANDBOX=&quot;false&quot;</code> when going live.
        </div>
      </Section>

      {/* Store */}
      <Section icon={Store} title="Store Details">
        <Field label="Store Name">
          <input type="text" value={form.store_name} onChange={set("store_name")} className={inputCls} />
        </Field>
        <Field label="Contact Email">
          <input type="email" value={form.store_email} onChange={set("store_email")} className={inputCls} />
        </Field>
        <Field label="Contact Phone">
          <input type="tel" value={form.store_phone} onChange={set("store_phone")} className={inputCls} />
        </Field>
      </Section>

      {/* Actions */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50 ${
          saved ? "bg-green-600 text-white" : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {saved ? (
          <><Check className="w-4 h-4" /> Settings Saved</>
        ) : saving ? (
          "Saving..."
        ) : (
          "Save Settings"
        )}
      </button>
    </form>
  );
}
