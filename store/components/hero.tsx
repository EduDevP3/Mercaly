'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative border-b border-blue-100/80 bg-gradient-to-b from-blue-50/50 via-white to-white py-14 text-center sm:py-20">
      <div className="mx-auto max-w-3xl px-6 flex flex-col items-center">
        {/* Logo */}
        <div className="relative h-28 w-72 sm:h-36 sm:w-96 mb-6">
          <Image
            src="/logo.png"
            alt="La Barata Mayoreos"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Subtitle / Value proposition */}
        <p className="max-w-xl text-base text-neutral-600 sm:text-lg leading-relaxed font-normal">
          Distribución y venta de ropa al mayoreo y menudeo en México. Surtimos tu tienda, boutique o bazar con precios directos y envíos seguros.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/search"
            className="w-full sm:w-auto rounded-md bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition-all shadow-sm hover:bg-blue-700 hover:shadow"
          >
            Ver catálogo completo
          </Link>
          <Link
            href="/search/Mayoreo"
            className="w-full sm:w-auto rounded-md border border-blue-200 bg-white px-7 py-3 text-sm font-semibold text-blue-900 transition-all hover:bg-blue-50/70"
          >
            Lotes al mayoreo
          </Link>
        </div>

        {/* Feature points */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-8 border-t border-neutral-100 text-xs">
          <div>
            <span className="font-semibold text-blue-950 block mb-0.5">Envíos a todo el país</span>
            <span className="text-neutral-500">Cobertura nacional garantizada</span>
          </div>
          <div>
            <span className="font-semibold text-blue-950 block mb-0.5">Mayoreo y menudeo</span>
            <span className="text-neutral-500">Precios competitivos por lote y pieza</span>
          </div>
          <div>
            <span className="font-semibold text-blue-950 block mb-0.5">Atención personalizada</span>
            <span className="text-neutral-500">Asesoría directa en Tepic y WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
