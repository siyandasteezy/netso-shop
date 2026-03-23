import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpg"
                alt="Netso"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="text-xl font-bold tracking-widest uppercase">Netso</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Authentic South African streetwear. Born in the streets, made for the culture.
            </p>
          </div>

          <div>
            <h3 className="font-semibold uppercase tracking-wider mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Shop All", href: "/shop" },
                { label: "Events", href: "/events" },
                { label: "Cart", href: "/cart" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold uppercase tracking-wider mb-4 text-sm">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>South Africa</li>
              <li>
                <a href="mailto:hello@netso.co.za" className="hover:text-white transition-colors">
                  hello@netso.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} Netso. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
