export default function VegBadge({ isVeg }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
        isVeg ? 'border-emerald-600' : 'border-red-600'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={`h-2 w-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
    </span>
  );
}
