import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductImage {
  url: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string };
  images: ProductImage[];
}

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <Link href={`/shop/${product.id}`} className="group">
      <div className="aspect-square bg-gray-100 overflow-hidden mb-3 relative">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category.name}</p>
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
        <p className="font-bold text-sm">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
