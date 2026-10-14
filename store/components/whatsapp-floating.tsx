'use client';

import React from 'react';
import WhatsAppIcon from 'components/icons/whatsapp';

const WhatsAppFloating = () => {
  const phoneNumber = "523112275616";
  const message = encodeURIComponent("Hola, me interesa información sobre pedidos al mayoreo y menudeo de La Barata Mayoreos.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
      aria-label="Atención por WhatsApp"
      title="Contactar a La Barata Mayoreos"
    >
      <WhatsAppIcon className="h-7 w-7 fill-white" />
    </a>
  );
};

export default WhatsAppFloating;
