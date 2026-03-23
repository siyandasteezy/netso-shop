import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/store/AddToCartButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id, active: true },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 overflow-hidden mb-3 relative">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div key={img.id} className="aspect-square bg-gray-100 overflow-hidden relative">
                  <Image src={img.url} alt={product.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{product.category.name}</p>
          <h1 className="text-3xl font-black uppercase tracking-wide mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          )}

          <AddToCartButton product={product} />

          <div className="mt-8 pt-8 border-t border-gray-200 space-y-2 text-sm text-gray-500">
            <p>Free delivery on orders over R500</p>
            <p>South Africa wide shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
