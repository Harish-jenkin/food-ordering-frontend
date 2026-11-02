export function estimateTotals(items, settings, orderType = 'delivery') {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const deliveryCharge = Number(settings.delivery_charge || 0);
  const freeMin = Number(settings.free_delivery_min || 0);
  const delivery =
    orderType === 'delivery' ? (freeMin > 0 && subtotal >= freeMin ? 0 : deliveryCharge) : 0;
  const discount = subtotal * (Number(settings.discount_percent || 0) / 100);
  const tax = (subtotal - discount) * (Number(settings.tax_percent || 0) / 100);
  const total = subtotal - discount + delivery + tax;

  return { subtotal, delivery, discount, tax, total };
}
