import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="mt-16 border-t bg-ink text-cream">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{settings.restaurant_name}</p>
          <p className="mt-2 text-sm text-stone-300">{settings.tagline}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">Visit</p>
          <p className="text-sm text-stone-300">{settings.address}</p>
          <p className="mt-2 text-sm text-stone-300">{settings.opening_hours}</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">Links</p>
          <div className="flex flex-col gap-2 text-sm text-stone-300">
            <Link to="/menu">Menu</Link>
            <Link to="/about">About</Link>
            <Link to="/contact" target="_blank">Contact</Link>
            <Link to="/admin/login" target="_blank">Staff login</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {settings.restaurant_name}. Orders are confirmed after you send the WhatsApp message.
      </div>
    </footer>
  );
}
