import { db } from "@/lib/db";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const currentCat = categories.find((c) => c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wider mb-4">
          {currentCat ? currentCat.name : "All Products"}
        </h1>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
              !category
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                category === cat.slug
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:border-black"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
