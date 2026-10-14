import CheckIcon from 'components/icons/check';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
      <CheckIcon className="h-24 w-24 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold">¡Pedido realizado correctamente!</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Nos pondremos en contacto contigo pronto para confirmar los detalles.
      </p>
      
      <div className="mt-8 flex gap-4">
        <Link 
          href="/"
          className="rounded-full bg-black px-6 py-3 font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          Volver a la tienda
        </Link>
        <a 
          href="https://wa.me/523221045519" 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded-full bg-green-500 px-6 py-3 font-medium text-white transition-opacity hover:opacity-80"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
