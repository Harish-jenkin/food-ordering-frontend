import { Plus } from 'lucide-react';
import VegBadge from '../common/VegBadge';
import QuantityStepper from './QuantityStepper';
import { formatMoney } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';

export default function FoodCard({ food, onOpen }) {
  const { addItem, setQty, quantityOf } = useCart();
  const toast = useToast();
  const { settings } = useSettings();
  const quantity = quantityOf(food.id);

  const payload = {
    id: food.id,
    name: food.name,
    price: food.price,
    image_url: food.image_url,
    is_veg: food.is_veg,
    slug: food.slug,
  };

  const add = (event) => {
    event.stopPropagation();
    if (!food.is_available) return;
    addItem(payload);
    toast.cart(`${food.name} added`);
  };

  const decrease = (event) => {
    event.stopPropagation();
    setQty(food.id, quantity - 1);
  };

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onOpen?.(food)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={food.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {!food.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            Currently unavailable
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-ink">{food.name}</h3>
          <VegBadge isVeg={food.is_veg} />
        </div>
        <p className="line-clamp-2 text-sm text-muted">{food.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-brand">{formatMoney(food.price, settings.currency)}</p>
          {!food.is_available ? (
            <span className="text-xs font-medium text-stone-400">Unavailable</span>
          ) : quantity > 0 ? (
            <QuantityStepper quantity={quantity} onDecrease={decrease} onIncrease={add} />
          ) : (
            <button
              type="button"
              onClick={add}
              className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
