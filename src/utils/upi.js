export function buildUpiUri({ upiId, payeeName, amount, note }) {
  const pa = String(upiId || '').trim();
  if (!pa) return '';

  const params = new URLSearchParams({
    pa,
    pn: String(payeeName || 'Restaurant').slice(0, 80),
    cu: 'INR',
  });

  const rupees = Number(amount);
  if (Number.isFinite(rupees) && rupees > 0) {
    params.set('am', rupees.toFixed(2));
  }
  if (note) params.set('tn', String(note).slice(0, 50));

  return `upi://pay?${params.toString()}`;
}

export function buildQrImageUrl(data, size = 240) {
  if (!data) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
