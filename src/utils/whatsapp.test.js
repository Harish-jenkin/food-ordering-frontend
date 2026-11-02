import { describe, expect, it } from 'vitest';
import { buildWhatsAppMessage, buildWhatsAppUrl } from './whatsapp';

describe('WhatsApp helpers', () => {
  it('builds a message with order snapshots and totals', () => {
    const message = buildWhatsAppMessage({
      order_number: 'SH-20261102-ABCD',
      customer_name: 'Asha',
      customer_mobile: '9966738715',
      order_type: 'delivery',
      delivery_address: '14 MG Road',
      landmark: 'Near metro',
      payment_method: 'upi',
      items: [{ name: 'Butter Chicken', quantity: 2, unit_price: '349.00', line_total: '698.00' }],
      subtotal: '698.00',
      delivery_charge: '40.00',
      discount: '0.00',
      tax: '34.90',
      grand_total: '772.90',
      instructions: 'Less spice',
    });

    expect(message).toContain('SH-20261102-ABCD');
    expect(message).toContain('Asha');
    expect(message).toContain('Butter Chicken x2');
    expect(message).toContain('Grand total: 772.90');
    expect(message).toContain('Less spice');
  });

  it('encodes the WhatsApp click-to-chat URL', () => {
    const url = buildWhatsAppUrl('+91 99667 38715', 'Hello there');
    expect(url).toBe(`https://wa.me/919966738715?text=${encodeURIComponent('Hello there')}`);
  });
});
