import { Plus, X } from 'lucide-react';
import VegBadge from '../common/VegBadge';
import QuantityStepper from './QuantityStepper';
import { formatMoney } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';

export default function FoodModal({ food, onClose }) {
  const { addItem, setQty, quantityOf } = useCart();
  const toast = useToast();
  const { settings } = useSettings();

  if (!food) return null;

  const quantity = quantityOf(food.id);
  const payload = {
    id: food.id,
    name: food.name,
    price: food.price,
    image_url: food.image_url,
    is_veg: food.is_veg,
    slug: food.slug,
  };

  const add = () => {
    if (!food.is_available) return;
    addItem(payload);
    toast.cart(`${food.name} added`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={food.image_url} alt="" className="h-64 w-full object-cover" />
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <VegBadge isVeg={food.is_veg} />
                <span className="text-xs uppercase tracking-wide text-stone-500">{food.category?.name}</span>
              </div>
              <h2 className="font-display text-3xl">{food.name}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-stone-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <p className="text-muted">{food.description}</p>
          <p className="text-2xl font-semibold text-brand">{formatMoney(food.price, settings.currency)}</p>
          {!food.is_available ? (
            <button type="button" disabled className="w-full rounded-full bg-stone-300 py-3 font-semibold text-white">
              Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
              <span className="text-sm font-medium">In your cart</span>
              <QuantityStepper
                quantity={quantity}
                onDecrease={() => setQty(food.id, quantity - 1)}
                onIncrease={add}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={add}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark"
            >
              <Plus size={18} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
