import { Link, useLocation, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { formatMoney } from '../utils/format';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';
import { buildWhatsAppMessage, buildWhatsAppUrl, openWhatsApp } from '../utils/whatsapp';

export default function Confirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { settings } = useSettings();
  const toast = useToast();
  const stored = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('last_order') || 'null');
    } catch {
      return null;
    }
  }, []);

  const [order, setOrder] = useState(location.state?.order || stored?.order || null);
  const [url, setUrl] = useState(location.state?.whatsapp_url || stored?.whatsapp_url || '');
  const [mobile, setMobile] = useState(order?.customer_mobile || '');
  const [looking, setLooking] = useState(false);

  const lookup = async (event) => {
    event.preventDefault();
    setLooking(true);
    try {
      const { data } = await api.get(`/orders/${orderNumber}`, { params: { mobile } });
      setOrder(data.data);
      setUrl(buildWhatsAppUrl(settings.whatsapp_number, buildWhatsAppMessage(data.data)));
    } catch (err) {
      toast.error(getErrorMessage(err, 'We could not find that order.'));
    } finally {
      setLooking(false);
    }
  };

  if (!order || order.order_number !== orderNumber) {
    return (
      <div className="container-page max-w-lg py-16">
        <h1 className="font-display text-3xl">Look up order {orderNumber}</h1>
        <p className="mt-3 text-muted">Enter the mobile number used at checkout.</p>
        <form onSubmit={lookup} className="mt-6 space-y-3 rounded-3xl bg-white p-6 shadow-sm">
          <input required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" className="w-full rounded-2xl border px-4 py-3" />
          <button type="submit" disabled={looking} className="w-full rounded-full bg-brand py-3 font-semibold text-white">
            {looking ? 'Searching…' : 'Find order'}
          </button>
        </form>
        <Link to="/menu" className="mt-6 inline-block text-brand">Back to menu</Link>
      </div>
    );
  }

  const whatsappUrl = url || buildWhatsAppUrl(settings.whatsapp_number, buildWhatsAppMessage(order));

  return (
    <div className="container-page max-w-2xl py-12">
      <p className="text-sm uppercase tracking-wide text-brand">Order saved</p>
      <h1 className="mt-2 font-display text-4xl">{order.order_number}</h1>
      <div className="mt-6 rounded-3xl bg-amber-50 p-5 text-amber-950">
        <p className="font-semibold">Please send the WhatsApp message yourself.</p>
        <p className="mt-2 text-sm">
          Your order is stored as pending. Opening WhatsApp does not confirm it. Tap the button below, then send the
          pre-filled message to the restaurant.
        </p>
      </div>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <p><strong>{order.customer_name}</strong> · {order.customer_mobile}</p>
        <p className="capitalize text-muted">{order.order_type} · {order.payment_method}</p>
        {order.delivery_address && <p className="mt-2 text-sm">{order.delivery_address}</p>}
        <ul className="mt-4 space-y-1 text-sm">
          {order.items?.map((item) => (
            <li key={item.id}>
              {item.name} × {item.quantity} — {formatMoney(item.line_total, settings.currency)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-semibold">Total {formatMoney(order.grand_total, settings.currency)}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={whatsappUrl}
          className="rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
          onClick={(event) => {
            event.preventDefault();
            openWhatsApp(whatsappUrl);
          }}
        >
          Open WhatsApp
        </a>
        <Link to="/menu" className="rounded-full border px-5 py-3 font-semibold">
          Order more
        </Link>
      </div>
      <p className="mt-4 text-sm text-muted">
        If WhatsApp did not open, copy the chat link from the button above or message {settings.phone} directly.
      </p>
    </div>
  );
}
