export function buildWhatsAppMessage(order) {
  const lines = [
    `*New Order — ${order.order_number}*`,
    '',
    `Name: ${order.customer_name}`,
    `Mobile: ${order.customer_mobile}`,
    `Type: ${order.order_type === 'delivery' ? 'Home delivery' : 'Takeaway'}`,
  ];

  if (order.order_type === 'delivery' && order.delivery_address) {
    lines.push(`Address: ${order.delivery_address}`);
    if (order.landmark) lines.push(`Landmark: ${order.landmark}`);
  }

  if (order.preferred_time) lines.push(`Preferred time: ${order.preferred_time}`);
  lines.push(`Payment: ${String(order.payment_method).toUpperCase()}`);
  lines.push('');
  lines.push('*Items*');

  (order.items || []).forEach((item) => {
    lines.push(`- ${item.name} x${item.quantity} @ ${item.unit_price} = ${item.line_total}`);
  });

  lines.push('');
  lines.push(`Subtotal: ${order.subtotal}`);
  lines.push(`Delivery: ${order.delivery_charge}`);
  lines.push(`Discount: ${order.discount}`);
  lines.push(`Tax: ${order.tax}`);
  lines.push(`*Grand total: ${order.grand_total}*`);

  if (order.instructions) {
    lines.push('');
    lines.push(`Instructions: ${order.instructions}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(phone, message) {
  const digits = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(url) {
  const match = String(url || '').match(/^https:\/\/wa\.me\/(\d+)\?text=/);
  if (!match) return false;
  window.location.assign(url);
  return true;
}
