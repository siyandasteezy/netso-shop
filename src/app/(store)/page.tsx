import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/store/ProductCard";

export const revalidate = 60;

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { active: true, featured: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
    take: 8,
  });
}

async function getCategories() {
  return db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

async function getUpcomingEvents() {
  return db.event.findMany({
    where: { active: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 3,
  });
}

export default async function HomePage() {
  const [featured, categories, events] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getUpcomingEvents(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/logo.jpg"
            alt="Netso"
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.jpg"
              alt="Netso Logo"
              width={120}
              height={120}
              className="rounded-full object-cover border-4 border-white/20"
            />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-300 mb-4">
            South African Streetwear
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            NETSO
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
            Born in the streets. Made for the culture. Shop the latest drops and get tickets to our exclusive events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-white text-black px-8 py-3 font-semibold tracking-wide uppercase text-sm hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/events"
              className="border border-white text-white px-8 py-3 font-semibold tracking-wide uppercase text-sm hover:bg-white hover:text-black transition-colors"
            >
              Events
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold uppercase tracking-wider mb-8 text-center">Shop By Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group bg-black text-white p-6 text-center hover:bg-gray-900 transition-colors"
              >
                <p className="font-bold uppercase tracking-wide text-sm">{cat.name}</p>
                <p className="text-gray-400 text-xs mt-1">{cat._count.products} items</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Featured</h2>
            <Link href="/shop" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="bg-black text-white py-16 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-wider">Upcoming Events</h2>
              <Link href="/events" className="text-sm font-medium underline underline-offset-4 hover:no-underline text-gray-300">
                All Events
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="group border border-gray-800 hover:border-gray-600 transition-colors p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{event.city}</p>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-gray-200 transition-colors">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {new Date(event.date).toLocaleDateString("en-ZA", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">{event.venue}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{formatPrice(event.ticketPrice)}</span>
                    <span className="text-xs text-gray-500">
                      {event.totalTickets - event.soldTickets} left
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
