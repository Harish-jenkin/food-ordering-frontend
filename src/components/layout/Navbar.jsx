import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { CartToastSlot } from '../../context/ToastContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { count } = useCart();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (count === 0) return;
    setPop(true);
    const timer = window.setTimeout(() => setPop(false), 450);
    return () => window.clearTimeout(timer);
  }, [count]);

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-lg text-white">S</span>
          <span className="font-display text-xl">{settings.restaurant_name}</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand' : 'text-stone-600 hover:text-ink'}`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Link
              to="/cart"
              className={`relative rounded-full p-2 hover:bg-cream ${pop ? 'cart-pop' : ''}`}
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <CartToastSlot />
          </div>
          <Link to="/menu" className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:inline">
            Order now
          </Link>
          <button type="button" className="rounded-full p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="block py-2 text-stone-700">
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
