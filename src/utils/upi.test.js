import { describe, expect, it } from 'vitest';
import { buildQrImageUrl, buildUpiUri } from './upi';

describe('UPI helpers', () => {
  it('builds a pay URI with amount and note', () => {
    const uri = buildUpiUri({
      upiId: 'spicehaven@upi',
      payeeName: 'Spice Haven',
      amount: 199.5,
      note: 'Food order',
    });

    expect(uri).toContain('upi://pay?');
    expect(uri).toContain('pa=spicehaven%40upi');
    expect(uri).toContain('am=199.50');
    expect(uri).toContain('tn=Food+order');
  });

  it('returns an empty URI without a UPI id', () => {
    expect(buildUpiUri({ upiId: '', amount: 10 })).toBe('');
  });

  it('builds an encoded QR image URL', () => {
    const url = buildQrImageUrl('upi://pay?pa=a@upi');
    expect(url).toContain('api.qrserver.com');
    expect(url).toContain(encodeURIComponent('upi://pay?pa=a@upi'));
  });
});
