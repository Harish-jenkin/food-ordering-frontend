import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const phone = String(settings.whatsapp_number || '').replace(/\D/g, '');
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${settings.restaurant_name}, I would like to ask about an order.`)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle />
    </a>
  );
}
