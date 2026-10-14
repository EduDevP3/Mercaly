'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Price from 'components/price';

export default function OrderSummaryPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Construct WhatsApp link
  const waMessage = `Hola, mi pedido es: ${orderId}. Ya realicé mi orden y me gustaría confirmarla.`;
  const waLink = `https://wa.me/523221045519?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:max-w-7xl lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-12 w-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl dark:text-white uppercase italic">
          ¡GRACIAS POR TU ORDEN!
        </h1>
        
        <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Tu pedido ha sido registrado con éxito. 
          <br className="hidden sm:block" />
          Estamos listos para preparar tus artículos en <span className="font-bold text-black dark:text-white">La Barata Mayoreos (LBM)</span>.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="inline-flex flex-col sm:flex-row items-center rounded-2xl bg-neutral-100 px-6 py-4 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
            <span className="uppercase tracking-widest text-[10px] font-black opacity-50 mb-1 sm:mb-0 sm:mr-4">ID de Seguimiento:</span>
            <span className="font-mono font-bold text-lg text-blue-600">{orderId}</span>
          </div>
          <p className="text-xs text-neutral-400 italic">Guarda este ID para cualquier aclaración</p>
        </div>
      </div>

      <div className="mt-16 max-w-xl mx-auto">
        <div className="bg-blue-50 dark:bg-blue-900/10 p-10 rounded-[3rem] border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <h3 className="text-2xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-tighter">¿Qué sigue?</h3>
          <p className="mt-4 text-blue-800 dark:text-blue-300 leading-relaxed text-lg">
            Para confirmar tu pedido y coordinar el envío, **por favor envíanos un mensaje por WhatsApp** con tu número de orden.
          </p>
          
          <div className="mt-10 space-y-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-4 rounded-3xl bg-[#25D366] px-8 py-5 text-xl font-black text-white shadow-2xl transition-all hover:bg-[#22c35e] hover:scale-[1.03] active:scale-95 uppercase italic tracking-tighter"
            >
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirmar por WhatsApp
            </a>
            <p className="text-center text-[10px] text-blue-600 dark:text-blue-500 font-black uppercase tracking-[0.2em]">
              ¡Atención inmediata 24/7!
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Nuestro equipo te contactará pronto si no recibimos noticias tuyas.
          </p>
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black dark:hover:text-white transition-all border-b-2 border-transparent hover:border-black dark:hover:border-white pb-1">
            &larr; Seguir Navegando
          </Link>
        </div>
      </div>
    </div>
  );
}
