import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ quantity, onDecrease, onIncrease, disabled }) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-brand text-white shadow-sm"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrease}
        className="rounded-full p-2 transition hover:bg-brand-dark disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="rounded-full p-2 transition hover:bg-brand-dark disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
