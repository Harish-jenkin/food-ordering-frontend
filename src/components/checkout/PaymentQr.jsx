import { useEffect, useMemo, useState } from 'react';
import { buildQrImageUrl, buildUpiUri } from '../../utils/upi';
import { formatMoney } from '../../utils/format';

const SCAN_FLAG = 'checkout_qr_left_page';

export default function PaymentQr({ settings, amount, method }) {
  const [returned] = useState(() => sessionStorage.getItem('checkout_qr_scanned') === '1');
  const [tick, setTick] = useState(0);

  const upiUri = useMemo(
    () =>
      buildUpiUri({
        upiId: settings.upi_id,
        payeeName: settings.upi_name || settings.restaurant_name,
        amount,
        note: `${settings.restaurant_name || 'Order'} ${method}`.slice(0, 50),
      }),
    [settings.upi_id, settings.upi_name, settings.restaurant_name, amount, method],
  );

  const qrUrl = useMemo(() => (upiUri ? `${buildQrImageUrl(upiUri, 240)}&t=${tick}` : ''), [upiUri, tick]);

  useEffect(() => {
    const markLeft = () => sessionStorage.setItem(SCAN_FLAG, String(Date.now()));
    const maybeReload = () => {
      if (sessionStorage.getItem('checkout_qr_scanned') === '1') return;
      const leftAt = Number(sessionStorage.getItem(SCAN_FLAG) || 0);
      if (!leftAt || Date.now() - leftAt < 1500) return;
      sessionStorage.removeItem(SCAN_FLAG);
      sessionStorage.setItem('checkout_qr_scanned', '1');
      window.location.reload();
    };

    const onVisibility = () => {
      if (document.hidden) markLeft();
      else maybeReload();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', markLeft);
    window.addEventListener('focus', maybeReload);

    const pulse = window.setInterval(() => setTick((value) => value + 1), 8000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', markLeft);
      window.removeEventListener('focus', maybeReload);
      window.clearInterval(pulse);
    };
  }, []);

  if (!settings.upi_id) {
    return (
      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
        Payment QR is not configured yet. Ask the restaurant to add a UPI ID in Admin → Settings.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
      <p className="text-sm font-semibold">Scan to pay {formatMoney(amount, settings.currency)}</p>
      <p className="mt-1 text-xs text-muted">
        {method === 'cash'
          ? 'Pay by UPI now, or pay cash when the order arrives. After you scan, return here — this page refreshes automatically.'
          : 'Open GPay, PhonePe, Paytm or your bank app and scan this QR. When you come back from the payment app, this page refreshes on its own.'}
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {qrUrl && (
          <img
            src={qrUrl}
            alt="Payment QR code"
            width={240}
            height={240}
            className="h-56 w-56 rounded-2xl bg-white p-3 shadow-sm"
          />
        )}
        <div className="space-y-2 text-sm">
          <p><span className="text-muted">UPI ID</span><br /><span className="font-semibold">{settings.upi_id}</span></p>
          <p><span className="text-muted">Pay to</span><br /><span className="font-semibold">{settings.upi_name || settings.restaurant_name}</span></p>
          {returned && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">
              Welcome back. If the payment went through, place the order on WhatsApp below.
            </p>
          )}
          {upiUri && (
            <a href={upiUri} className="inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white">
              Open UPI app
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
