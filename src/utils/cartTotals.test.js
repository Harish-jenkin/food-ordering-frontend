import { describe, expect, it } from 'vitest';
import { estimateTotals } from './cartTotals';

describe('estimateTotals', () => {
  const settings = {
    delivery_charge: '40',
    free_delivery_min: '499',
    tax_percent: '5',
    discount_percent: '10',
  };

  it('applies discount, tax, and delivery for a small delivery order', () => {
    const totals = estimateTotals([{ price: 100, quantity: 2 }], settings, 'delivery');
    expect(totals.subtotal).toBe(200);
    expect(totals.discount).toBe(20);
    expect(totals.tax).toBe(9);
    expect(totals.delivery).toBe(40);
    expect(totals.total).toBe(229);
  });

  it('skips delivery for takeaway and free delivery over the minimum', () => {
    expect(estimateTotals([{ price: 500, quantity: 1 }], settings, 'takeaway').delivery).toBe(0);
    expect(estimateTotals([{ price: 500, quantity: 1 }], settings, 'delivery').delivery).toBe(0);
  });
});
