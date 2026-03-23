import { db } from "./db";

export interface AppSettings {
  vat_rate: number;           // e.g. 15
  vat_inclusive: boolean;     // true = prices already include VAT
  free_delivery_threshold: number; // e.g. 500
  payfast_enabled: boolean;
  tcg_enabled: boolean;
  store_name: string;
  store_email: string;
  store_phone: string;
}

const DEFAULTS: AppSettings = {
  vat_rate: 15,
  vat_inclusive: false,
  free_delivery_threshold: 500,
  payfast_enabled: true,
  tcg_enabled: true,
  store_name: "Netso",
  store_email: "hello@netso.co.za",
  store_phone: "",
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await db.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    vat_rate: parseFloat(map.vat_rate ?? String(DEFAULTS.vat_rate)),
    vat_inclusive: (map.vat_inclusive ?? "false") === "true",
    free_delivery_threshold: parseFloat(
      map.free_delivery_threshold ?? String(DEFAULTS.free_delivery_threshold)
    ),
    payfast_enabled: (map.payfast_enabled ?? "true") === "true",
    tcg_enabled: (map.tcg_enabled ?? "true") === "true",
    store_name: map.store_name ?? DEFAULTS.store_name,
    store_email: map.store_email ?? DEFAULTS.store_email,
    store_phone: map.store_phone ?? DEFAULTS.store_phone,
  };
}

export async function updateSetting(key: string, value: string) {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function updateSettings(updates: Partial<Record<keyof AppSettings, string>>) {
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
}
