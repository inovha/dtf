import { customAlphabet } from 'nanoid';

// Custom alphabet without ambiguous characters
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export function generateId(): string {
  return nanoid();
}

export function formatWhatsAppNumber(number: string): string {
  // Remove all non-numeric characters
  return number.replace(/\D/g, '');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWhatsAppMessage(status: string, customerName: string): string {
  const messages: Record<string, string> = {
    pending: `Hola ${customerName}! Recibimos tu pedido y lo estamos revisando. Te avisamos pronto.`,
    processing: `Hola ${customerName}! Tu pedido está en proceso de impresión. Te avisamos cuando esté listo.`,
    ready: `Hola ${customerName}! Tu pedido DTF está listo para retirar. Te esperamos!`,
    rejected: `Hola ${customerName}, hubo un problema con tu archivo. Por favor contactanos para más detalles.`,
  };

  return messages[status] || messages.pending;
}

export function getWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
