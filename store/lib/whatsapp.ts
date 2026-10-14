export interface WhatsAppCartItem {
  name: string;
  variant?: {
    size?: string;
    color?: string;
  };
  quantity: number;
  unitPrice: number;
}

export interface WhatsAppCustomerInfo {
  name: string;
  address: string;
  notes?: string;
}

/**
 * Genera el enlace de WhatsApp estructurado con variantes, subtotal y total estimado
 */
export function generateWhatsAppOrderUrl(
  phone: string,
  storeName: string,
  currency: string,
  items: WhatsAppCartItem[],
  customer: WhatsAppCustomerInfo
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  let message = `🛒 *NUEVO PEDIDO - ${storeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *Cliente:* ${customer.name}\n`;
  message += `📍 *Dirección:* ${customer.address}\n`;
  if (customer.notes) {
    message += `📝 *Notas:* ${customer.notes}\n`;
  }
  message += `\n📦 *PRODUCTOS SOLICITADOS:*\n`;

  items.forEach((item, index) => {
    const details = [];
    if (item.variant?.size) details.push(`Talla: ${item.variant.size}`);
    if (item.variant?.color) details.push(`Color: ${item.variant.color}`);
    const variantStr = details.length > 0 ? ` (${details.join(', ')})` : '';

    message += `${index + 1}. *${item.name}* x${item.quantity}${variantStr}\n`;
    message += `   Subtotal: $${(item.unitPrice * item.quantity).toFixed(2)} ${currency}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL ESTIMADO:* $${total.toFixed(2)} ${currency}\n\n`;
  message += `_Pedido enviado vía catálogo web._`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export default generateWhatsAppOrderUrl;
