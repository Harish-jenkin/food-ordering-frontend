import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { formatMoney } from '../utils/format';
import { estimateTotals } from '../utils/cartTotals';

export default function Cart() {
  const { items, setQty, removeItem } = useCart();
  const { settings } = useSettings();

  const { subtotal, delivery, discount, tax, total } = estimateTotals(items, settings, 'delivery');

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-6xl">🍽️</p>
          <h1 className="mt-4 font-display text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-muted">Add a few dishes from the menu and we will keep them here.</p>
          <Link to="/menu" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
            Browse menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-4">
        <h1 className="font-display text-4xl">Your cart</h1>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
            <img src={item.image_url} alt="" className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-brand">{formatMoney(item.price, settings.currency)}</p>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                  <Trash2 size={16} className="text-stone-400 hover:text-red-600" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="rounded-full border p-1" onClick={() => setQty(item.id, item.quantity - 1)} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button type="button" className="rounded-full border p-1" onClick={() => setQty(item.id, item.quantity + 1)} aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl">Summary</h2>
        <p className="mt-2 text-xs text-muted">Estimates only. Final totals are calculated by the restaurant when you place the order.</p>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Subtotal" value={formatMoney(subtotal, settings.currency)} />
          <Row label="Delivery (if chosen)" value={formatMoney(delivery, settings.currency)} />
          <Row label="Discount" value={formatMoney(discount, settings.currency)} />
          <Row label="Tax" value={formatMoney(tax, settings.currency)} />
          <Row label="Estimated total" value={formatMoney(total, settings.currency)} strong />
        </dl>
        <Link to="/checkout" className="mt-6 block rounded-full bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark">
          Continue to checkout
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={strong ? 'font-semibold' : ''}>{value}</dd>
    </div>
  );
}
