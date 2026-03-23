import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide mb-8">New Product</h1>
        <ProductForm categories={categories} />
      </main>
    </div>
  );
}
