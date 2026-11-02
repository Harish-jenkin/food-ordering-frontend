import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Tags, ClipboardList, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/foods', label: 'Food', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { isAuthenticated, logout, admin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const signOut = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 md:grid md:grid-cols-[240px_1fr]">
      <aside className={`bg-ink text-cream ${open ? 'block' : 'hidden'} md:block`}>
        <div className="flex h-16 items-center px-5 font-display text-xl">Spice Haven</div>
        <nav className="space-y-1 px-3 pb-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-white/15 text-white' : 'text-stone-300 hover:bg-white/5'}`
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
          <button type="button" onClick={signOut} className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-300 hover:bg-white/5">
            <LogOut size={16} />
            Log out
          </button>
        </nav>
      </aside>
      <div>
        <header className="flex h-16 items-center justify-between border-b bg-white px-4">
          <button type="button" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle sidebar">
            <Menu />
          </button>
          <p className="text-sm text-muted">Signed in as {admin?.name}</p>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
