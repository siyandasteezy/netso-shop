import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit } from "lucide-react";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const products = await db.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase tracking-wide">Products</h1>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide flex items-center gap-2 hover:bg-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Category Quick Links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <span key={cat.id} className="bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-600">
              {cat.name}
            </span>
          ))}
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["", "Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-12 bg-gray-100">
                      {product.images[0] ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="48px" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.category.name}</td>
                  <td className="px-4 py-3 font-semibold">R{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
