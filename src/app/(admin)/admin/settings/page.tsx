import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import AdminNav from "@/components/admin/AdminNav";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Configure VAT, payments, delivery, and store details.</p>
        <SettingsForm settings={settings} />
      </main>
    </div>
  );
}
